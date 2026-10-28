import asyncio,json,os
from playwright.async_api import async_playwright
F='file://'+os.path.abspath(os.path.join(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','app'),'index.html'))
R=[];ok=lambda n,c,i='':R.append(('✓' if c else '✗',n,i))
async def conta(pg,email='aluna@x.com'):
  await pg.evaluate("authMode='criar';page='login';render()")
  await pg.fill('#lg-nome','Aluna Teste Silva');await pg.fill('#lg-tel','51999990000');await pg.fill('#lg-email',email);await pg.fill('#lg-pass','abcdef');await pg.fill('#lg-pass2','abcdef');await pg.click('#lg-go');await pg.wait_for_timeout(1300)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--use-file-for-fake-audio-capture='+os.path.join(os.path.dirname(os.path.abspath(__file__)),'sax_teste.wav'),'--autoplay-policy=no-user-gesture-required'])
    ctx=await b.new_context(viewport={'width':412,'height':915},permissions=['microphone']);pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(F);await pg.wait_for_timeout(600);await conta(pg)
    # 1. detector de altura com som de sax sintético (harmônicos)
    r=await pg.evaluate("""(()=>{const sr=48000,out=[];for(const m of [44,49,56,61,67,72,79,85]){const f=440*2**((m-69)/12),b=new Float32Array(4096);
      for(let i=0;i<b.length;i++){let y=0;for(let k=1;k<=5;k++)y+=(0.6/k)*Math.sin(2*Math.PI*f*k*i/sr);b[i]=y*0.3}const d=detectarAltura(b,sr);out.push(d?Math.abs(69+12*Math.log2(d.hz/440)-m):99)}
      const ru=new Float32Array(4096).map(()=>(Math.random()-.5)*0.004);return {erros:out,ruido:detectarAltura(ru,sr)}})()""")
    ok('Detector acerta a nota do Sib grave do barítono ao Mi agudo do soprano (erro < 0,3 semitom)', max(r['erros'])<0.3, str([round(x,2) for x in r['erros']]))
    ok('Silêncio/ruído baixo não vira nota', r['ruido'] is None)
    # 2. classificação dos erros (simulação controlada)
    res=await pg.evaluate("""(()=>{S.instrument='Sax Alto';S.bpm=60;save();openM2('b7g1');const fl=meterState.flat;OUV.on={};OUV.frames=[];let t=1000;const seg=1000;
      const plano={};fl.forEach((e,i)=>{if(e.rest||e.ligada)return;OUV.on[i]=t;let m=e.p;
        if(i===6)m=e.p-1;            // Fá#5 tocado como Fá natural (acidente)
        if(i===2)m=e.p-12;           // oitava abaixo
        if(i===3)m=e.p+5;            // nota errada
        const silencio=(i===4);
        if(!silencio)for(let k=150;k<e.d*seg*0.9;k+=45)OUV.frames.push({t:t+k,m:m-saxSemis()+0.08});
        t+=e.d*seg});
      const R=ouvAvaliar();return {R:{precisao:R.precisao,erros:R.erros,total:R.total},it:R.itens.slice(0,8).map(x=>[x.i,x.tipo,x.esperado,x.tocado||'',x.dica||''])}})()""")
    it={x[0]:x for x in res['it']}
    ok('Nota certa reconhecida', it[0][1]=='ok' and it[1][1]=='ok', str(res['it'][:2]))
    ok('Fá# tocado sem sustenido = erro de acidente ("esqueceu o sustenido")', it[6][1]=='acidente' and 'sustenido' in it[6][4], str(it[6]))
    ok('Oitava trocada identificada', it[2][1]=='oitava', str(it[2]))
    ok('Nota errada identificada', it[3][1]=='nota', str(it[3]))
    ok('Nota não tocada = silêncio', it[4][1]=='silencio')
    ok('Precisão calculada', 0<res['R']['precisao']<100, str(res['R']))
    await pg.evaluate("ouvMarcar(ouvAvaliar());ouvPainel(ouvAvaliar())");t=await pg.text_content('#ouv-res')
    ok('Painel do Ouvido explica os erros com compasso', 'Compasso' in t and 'esqueceu o sustenido' in t, t[:160])
    ok('Notas erradas ficam vermelhas na partitura', await pg.evaluate("document.querySelectorAll('#meter-svg .ouv-err').length")>=3)
    await pg.evaluate("document.getElementById('ouv-res').remove();closeMeter()");await pg.wait_for_timeout(300)
    # 3. diagnóstico completo com microfone simulado (sax tocando o teste prático)
    await pg.evaluate("S.theory=null;S.declared='Intermediário';save();qi=0;answers=[];page='quiz';render()")
    for k in range(10):
      corr=await pg.evaluate("Q[qi][2]");await pg.evaluate(f"ans({corr})")
    ok('Depois da teoria vem o teste prático', 'Agora, toque um pouco' in await pg.text_content('#app'))
    await pg.evaluate("S.instrument='Sax Alto';save()");await pg.click('text=Fazer o teste prático');await pg.wait_for_timeout(1200)
    ok('Teste prático abre a partitura com o Ouvido ligado', await pg.evaluate("curEx==='diag'&&ouvAtivoAgora()&&!!document.querySelector('.ouv-btn.on')"))
    await pg.evaluate("metroCfg().contagem=false;save();window.__t0=performance.now();startMeter()")
    await pg.wait_for_timeout(26000)
    print('ATRASO_ATE_1A_NOTA_ms',await pg.evaluate("(window.__micT0?(Object.values(OUV.on)[0]||0)-window.__micT0:-1)"))
    d=await pg.evaluate("S.diag");fr=await pg.evaluate("OUV.frames.length")
    ok('Microfone captou o som e o diagnóstico mediu a prática', d is not None and d.get('medido') and d.get('pratica') is not None, json.dumps(d)+f' frames={fr}')
    ok('Resultado mostra o nível recomendado', 'Comece por aqui' in await pg.text_content('#app'), (d or {}).get('rec',''))
    rec=(d or {}).get('rec','');ok('Módulos até o recomendado ficam liberados', await pg.evaluate(f"(()=>{{const m=modules().find(m=>m.name==='{rec}');return m?modUnlocked(m):false}})()"))
    # 4. registros na fila (vão para a planilha)
    tipos=await pg.evaluate("ACC.fila.filter(f=>f.acao==='evento').map(f=>f.tipo)")
    ok('Diagnóstico registrado para a planilha', 'diagnostico' in tipos, str(tipos))
    await pg.evaluate("S.bpm=200;save();openM2('b601')");await pg.wait_for_timeout(300);await pg.evaluate("exDone()");await pg.wait_for_timeout(300)
    await pg.evaluate("FMQ=(CAT_F[0]||{}).id;go('item')");await pg.wait_for_timeout(200)
    tipos=await pg.evaluate("ACC.fila.filter(f=>f.acao==='evento').map(f=>f.tipo)")
    ok('Exercício feito e partitura aberta registrados', 'exercicio' in tipos and 'partitura' in tipos, str(tipos))
    f0=await pg.evaluate("ACC.fila.find(f=>f.acao==='evento')")
    ok('Cada registro leva nome, WhatsApp, e-mail e nível', f0.get('nome')=='Aluna Teste Silva' and f0.get('telefone') and f0.get('email')=='aluna@x.com' and 'nivelRecomendado' in f0, str({k:f0.get(k) for k in ['nome','telefone','nivelRecomendado']}))
    # 5. perfil: resumo, ouvido, pausas, observações
    await pg.evaluate("go('profile')");t=await pg.text_content('#app')
    ok('Perfil tem Meu acompanhamento, Ouvido (auto/manual/desligado), Pausas e Observações', all(x in t for x in ['Meu acompanhamento','Automático','Manual','Desligado','Lembrete de pausas','Sugestões e observações']))
    await pg.fill('#obs-txt','Gostaria de mais músicas de choro');await pg.evaluate("enviarObs()");await pg.wait_for_timeout(200)
    ok('Observação enviada ao professor', await pg.evaluate("ACC.fila.some(f=>f.tipo==='observacao'&&f.detalhe.includes('choro'))"))
    await pg.evaluate("go('resumo')");t=await pg.text_content('#app')
    ok('Resumo semanal e mensal com recomendações e saúde', 'Últimos 7 dias' in t and 'Últimos 30 dias' in t and 'olhe para longe' in t, t[:120])
    await pg.evaluate("_contig=25;mostrarPausa()");ok('Lembrete de pausa aparece', 'Hora de uma pausa' in await pg.text_content('#pausa-card'))
    await pg.evaluate("document.getElementById('pausa-card').remove()")
    # 6. último dia do teste
    await pg.evaluate("curUser().plan='teste';curUser().exp=somaDias(1);saveAcc();S.fbTeste=null;save();go('home')")
    t=await pg.text_content('#app');ok('Falta 1 dia: app pergunta se está gostando e se já fez exercício', 'Seu teste termina amanhã' in t and 'Está gostando' in t)
    await pg.click('text=Ainda não experimentei');t=await pg.text_content('#app')
    ok('Resposta registrada e leva aos exercícios', 'Abrir meus exercícios' in t and await pg.evaluate("ACC.fila.some(f=>f.tipo==='avaliacao_teste')"))
    # 7. modo desligado esconde o botão
    await pg.evaluate("ouvCfg().modo='off';save();openM2('b601')");ok('Ouvido desligado: sem botão de microfone', not await pg.evaluate("!!document.querySelector('.ouv-btn')"))
    await pg.evaluate("ouvCfg().modo='manual';save();openM2('b601')");ok('Modo manual: botão 🎤 Ouvir na partitura', await pg.evaluate("(document.querySelector('.ouv-btn')||{}).textContent")=='🎤 Ouvir')
    ok('Sem erros JavaScript', not errs, str(errs[:3]))
    await b.close()
  for r in R:print(*r)
  print(sum(r[0]=='✓' for r in R),'/',len(R))
try:
  asyncio.run(main())
except Exception as e:
  print('EXC',str(e)[:200])
  for r in R:print(*r)
