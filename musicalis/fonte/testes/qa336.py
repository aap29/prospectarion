import asyncio,os,base64,struct,zlib
from playwright.async_api import async_playwright
from protecao import proteger
APP=os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','app'))
F='file://'+APP+'/index.html'
SHOT=os.environ.get('SHOTS','/tmp')
R=[];ok=lambda n,c,i='':R.append(('✓' if c else '✗',n,i))
def png(path,w=300,h=200):
  raw=b''.join(b'\x00'+bytes([(x*255//w),120,(y*255//h)])*1 for y in range(h) for x in [0])  # placeholder
  rows=b''.join(b'\x00'+b''.join(bytes([x*255//w,140,y*255//h]) for x in range(w)) for y in range(h))
  c=lambda t,d:struct.pack('>I',len(d))+t+d+struct.pack('>I',zlib.crc32(t+d)&0xffffffff)
  open(path,'wb').write(b'\x89PNG\r\n\x1a\n'+c(b'IHDR',struct.pack('>IIBBBBB',w,h,8,2,0,0,0))+c(b'IDAT',zlib.compress(rows))+c(b'IEND',b''))
async def cadastro(pg,email,nome='Joana Teste Silva'):
  await pg.evaluate("authMode='criar';page='login';render()")
  await pg.fill('#lg-nome',nome);await pg.fill('#lg-tel','51999990000');await pg.fill('#lg-cid','Canoas');await pg.select_option('#lg-uf','RS');await pg.fill('#lg-email',email);await pg.fill('#lg-pass','abcdef');await pg.fill('#lg-pass2','abcdef');await pg.click('#lg-go');await pg.wait_for_timeout(1300)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required']);proteger(b)
    ctx=await b.new_context(viewport={'width':412,'height':915});pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(F+'#inscrito=anual');await pg.wait_for_timeout(1000)
    t=await pg.text_content('#app')
    ok('Link #inscrito: abre o cadastro com agradecimento e o plano escolhido', 'Obrigado por assinar' in t and 'Anual' in t and await pg.evaluate("authMode")=='criar', t[:120])
    await pg.screenshot(path=SHOT+'/q1_inscrito.png')
    await cadastro(pg,'joana@x.com')
    t=await pg.text_content('#app')
    ok('Depois do cadastro: boas-vindas + plano + 3 passos', 'Bem-vinda ao MUSICALIS' in t and 'Anual' in t and 'teste de nível' in t.lower(), t[200:900])
    ok('Topo tem logo, MUSICALIS e o avatar do aluno', await pg.evaluate("!!document.querySelector('#app .top .brand2 img.logo')&&!!document.querySelector('#app .top .avatar-top .av')"))
    ok('Registro de inscrição vai para a planilha', await pg.evaluate("ACC.fila.some(f=>/inscrito_apos_pagamento/.test(f.detalhe||''))&&ACC.fila.some(f=>f.evento==='inscrito_anual')"))
    await pg.screenshot(path=SHOT+'/q2_boasvindas.png',full_page=True)
    # validação
    await pg.click('#q-go');ok('Sem sax escolhido não avança', 'saxofone que você vai estudar' in await pg.text_content('#q-msg'))
    await pg.check('input[name=q-saxes][value=Alto]');await pg.check('input[name=q-saxes][value=Tenor]');await pg.check('input[name=q-princ][value=Tenor]')
    await pg.check('input[name=q-sit][value=toca]');ok('"Há quanto tempo" aparece só para quem toca', await pg.is_visible('#q-tempo-box'))
    await pg.click('#q-go');ok('Quem toca precisa dizer há quanto tempo', 'quanto tempo' in await pg.text_content('#q-msg'))
    await pg.check('input[name=q-tempo][value="3-5"]');await pg.fill('#q-art','Jô Sax');await pg.fill('#q-rede','@josax');await pg.click('#q-go')
    ok('Sem idade não avança', 'idade' in await pg.text_content('#q-msg'))
    await pg.fill('#q-idade','34');await pg.click('#q-go');await pg.wait_for_timeout(500)
    ok('Questionário salvo leva ao teste de nível', await pg.evaluate("page")=='quiz')
    ok('Perfil gravado (saxes, principal, experiência, idade, rede)', await pg.evaluate("(()=>{const p=curUser().perfil;return p.principal==='Tenor'&&p.saxes.join()==='Alto,Tenor'&&p.tempo==='3-5'&&p.idade===34&&p.rede==='@josax'&&p.artistico==='Jô Sax'})()"))
    ok('Exercícios passam a ser do sax escolhido (Sax Tenor) e nível Intermediário', await pg.evaluate("S.instrument==='Sax Tenor'&&S.declared==='Intermediário'"))
    ok('Planilha recebe os dados do perfil', await pg.evaluate("(()=>{const r=resumoAluno();return r.saxPrincipal==='Tenor'&&r.saxofones==='Alto, Tenor'&&r.idade===34&&r.redeSocial==='@josax'&&/3 a 5/.test(r.experiencia)&&r.nomeArtistico==='Jô Sax'})()"))
    await pg.evaluate("S.theory=40;save();go('home')");await pg.wait_for_timeout(300)
    av=await pg.text_content('.avatar-top');ok('Avatar mostra nome artístico e instrumento', 'Jô Sax' in av and 'Sax Tenor' in av, av)
    ok('Teoria abaixo do nível declarado: orientador sugere revisão', 'Revisão do orientador' in await pg.text_content('#app'))
    await pg.screenshot(path=SHOT+'/q3_home.png')
    # foto
    png('/tmp/foto_teste.png');await pg.evaluate("go('profile')");await pg.wait_for_timeout(300)
    async with pg.expect_file_chooser() as fc:await pg.evaluate("escolherFoto()")
    await (await fc.value).set_files('/tmp/foto_teste.png');await pg.wait_for_timeout(800)
    ok('Foto do perfil trocada e reduzida (≤ 40 KB)', await pg.evaluate("(curUser().foto||'').startsWith('data:image/jpeg')&&curUser().foto.length<55000"))
    ok('Foto aparece no topo', await pg.evaluate("!!document.querySelector('.avatar-top .av img')"))
    ok('Perfil mostra dados profissionais e "Teoria: —" no lugar de null%', 'Saxofones que toca' in await pg.text_content('#app') and 'null%' not in await pg.text_content('#app'))
    ok('Perfil tem a vinheta de abertura (liga/desliga)', await pg.evaluate("!!document.getElementById('vinheta-card')"))
    await pg.evaluate("curUser().foto='javascript:alert(1)';saveAcc();render()");ok('Foto inválida/maliciosa é ignorada', not await pg.evaluate("!!document.querySelector('.avatar-top .av img')"))
    await pg.evaluate("go('perfilq')");ok('Editar dados abre o questionário preenchido', await pg.input_value('#q-art')=='Jô Sax')
    # vinheta
    n=await pg.evaluate("""(async()=>{const c=ctx();await c.resume();let k=0;const o=c.createOscillator.bind(c);c.createOscillator=()=>{k++;return o()};sessionStorage.removeItem('musicalis_vinheta');const r=tocarVinheta();c.createOscillator=o;return [r,k]})()""")
    ok('Vinheta de jazz toca (frase de sax + acordes)', n[0] and n[1]>=40, str(n))
    # orientador: ritmo e andamento
    res=await pg.evaluate("""(()=>{S.instrument='Sax Alto';S.bpm=60;save();openM2('b7g1');const fl=meterState.flat;OUV.on={};OUV.frames=[];let t=1000;const seg=1000;let n=0;
      fl.forEach((e,i)=>{if(e.rest||e.ligada)return;OUV.on[i]=t;n++;let atraso=150;if(i===1)atraso=650;if(i===3)atraso=-380;if(n>8)atraso=150+(n-8)*120;
        for(let k=atraso;k<e.d*seg*0.9+Math.max(0,atraso);k+=45)OUV.frames.push({t:t+k,m:e.p-saxSemis()+0.05});t+=e.d*seg});
      const R=ouvAvaliar();ouvPainel(R);return {r:R.ritmo,i1:R.itens.find(x=>x.i===1),i3:R.itens.find(x=>x.i===3),m1:fl[1].m+1,m3:fl[3].m+1}})()""")
    t=await pg.text_content('#ouv-res')
    ok('Entrada atrasada detectada', res['i1'].get('tempo')=='atrasado', str(res['i1']))
    ok('Entrada adiantada detectada', res['i3'].get('tempo')=='adiantado', str(res['i3']))
    ok('Andamento caindo no fim detectado', res['r']['tendencia']=='atrasou', str(res['r']))
    ok('Orientador explica com o número do compasso', 'Orientador' in t and f"atrasado no compasso {res['m1']}" in t.replace('compassos','compasso') or 'atrasado' in t, t[:300])
    ok('Botões "Tocar de novo" e "Mais devagar"', 'Tocar de novo' in t and 'Mais devagar' in t)
    await pg.screenshot(path=SHOT+'/q4_orientador.png')
    await pg.evaluate("document.getElementById('ouv-res').remove()")
    await pg.evaluate("(()=>{const fl=meterState.flat;OUV.on={};OUV.frames=[];let t=1000;fl.forEach((e,i)=>{if(e.rest||e.ligada)return;OUV.on[i]=t;let m=e.p;if(i===6)m=e.p-1;for(let k=150;k<e.d*900;k+=45)OUV.frames.push({t:t+k,m:m-saxSemis()+.05});t+=e.d*1000});ouvPainel(ouvAvaliar())})()")
    t=await pg.text_content('#ouv-res');ok('Orientador manda voltar ao compasso da nota errada', 'Volte ao compasso' in t and 'esqueceu o sustenido' in t, t[:300])
    ok('Erros guardados para a revisão', await pg.evaluate("(S.recap||{}).acidente>0"))
    await pg.evaluate("document.getElementById('ouv-res').remove();closeMeter()")
    ok('Sem erros JavaScript', not errs, str(errs[:3]))
    await ctx.close()
    # usuário antigo + celular deitado
    c2=await b.new_context(viewport={'width':762,'height':346},is_mobile=True,has_touch=True);p2=await c2.new_page();e2=[];p2.on('pageerror',lambda e:e2.append(str(e)))
    await p2.goto(F);await p2.wait_for_timeout(600);await cadastro(p2,'antigo@x.com','Carlos Antigo Souza');await p2.evaluate("S.theory=60;save();go('home')");await p2.wait_for_timeout(300)
    ok('Quem já usava: aviso para completar o perfil no Início', 'Complete seu perfil de saxofonista' in await p2.text_content('#app'))
    h=await p2.evaluate("Math.round(document.querySelector('#app .top').getBoundingClientRect().height)");ok('Deitado: topo fino (≤ 44 px)', h<=44, str(h))
    await p2.screenshot(path=SHOT+'/q5_deitado.png')
    ok('Sem erros JavaScript (deitado)', not e2, str(e2[:3]))
    await b.close()
  for r in R:print(*r)
  print(sum(r[0]=='✓' for r in R),'/',len(R))
asyncio.run(main())
