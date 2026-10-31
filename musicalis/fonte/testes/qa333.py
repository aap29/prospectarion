import asyncio,os,json,base64,datetime,subprocess,time
from playwright.async_api import async_playwright
APP=os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','app'))
F='file://'+APP+'/index.html'
R=[];ok=lambda n,c,i='':R.append(('✓' if c else '✗',n,i))
CH=os.environ.get('MUSICALIS_CHAVE','/home/claude/chave_criador/MUSICALIS_CHAVE_CRIADOR.json')
def lic(email,P='A',dias=365):
  from cryptography.hazmat.primitives import hashes
  from cryptography.hazmat.primitives.asymmetric import ec
  from cryptography.hazmat.primitives.asymmetric.utils import decode_dss_signature
  J=json.load(open(CH))['jwk'];d=lambda s:int.from_bytes(base64.urlsafe_b64decode(s+'='*(-len(s)%4)),'big')
  K=ec.derive_private_key(d(J['d']),ec.SECP256R1());A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  def b32(bs):
    bits=v=0;o=''
    for b in bs:
      v=((v<<8)|b)&0xffff;bits+=8
      while bits>=5:o+=A[(v>>(bits-5))&31];bits-=5
    if bits:o+=A[(v<<(5-bits))&31]
    return o
  dt='000000' if P=='V' else (datetime.date.today()+datetime.timedelta(days=dias)).strftime('%y%m%d');body=P+dt+'-ABCD'
  r,s=decode_dss_signature(K.sign((email+'|L'+body).encode(),ec.ECDSA(hashes.SHA256())))
  return 'MUS2-'+body+'-'+b32(r.to_bytes(32,'big')+s.to_bytes(32,'big'))
async def conta(pg,email='aluna@x.com',cid='Porto Alegre',uf='RS'):
  await pg.evaluate("authMode='criar';page='login';render()")
  await pg.fill('#lg-nome','Aluna Teste Silva');await pg.fill('#lg-tel','51999990000')
  if cid is not None:await pg.fill('#lg-cid',cid);await pg.select_option('#lg-uf',uf)
  await pg.fill('#lg-email',email);await pg.fill('#lg-pass','abcdef');await pg.fill('#lg-pass2','abcdef');await pg.click('#lg-go');await pg.wait_for_timeout(1300)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    ctx=await b.new_context(viewport={'width':412,'height':915});pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(F);await pg.wait_for_timeout(600)
    # cadastro
    await pg.evaluate("authMode='criar';page='login';render()")
    ok('Cadastro pede cidade e estado', await pg.evaluate("!!document.querySelector('#lg-cid')&&!!document.querySelector('#lg-uf')"))
    await pg.fill('#lg-nome','Aluna Teste Silva');await pg.fill('#lg-tel','51999990000');await pg.fill('#lg-email','a@x.com');await pg.fill('#lg-pass','abcdef');await pg.fill('#lg-pass2','abcdef');await pg.click('#lg-go');await pg.wait_for_timeout(600)
    ok('Sem cidade não cadastra', not await pg.evaluate("ACC.session") and 'cidade' in (await pg.text_content('#lg-msg')))
    await pg.fill('#lg-cid','Canoas');await pg.click('#lg-go');await pg.wait_for_timeout(500)
    ok('Sem estado não cadastra', not await pg.evaluate("ACC.session") and 'estado' in (await pg.text_content('#lg-msg')))
    await pg.select_option('#lg-uf','RS');await pg.click('#lg-go');await pg.wait_for_timeout(1300)
    ok('Cadastro completo salva cidade e estado', await pg.evaluate("curUser().cidade==='Canoas'&&curUser().uf==='RS'"))
    ok('Planilha recebe nome, e-mail, cidade, estado e telefone', await pg.evaluate("(()=>{const r=resumoAluno();return r.cidade==='Canoas'&&r.estado==='RS'&&r.nome==='Aluna Teste Silva'&&r.telefone&&r.email==='a@x.com'})()"))
    # quem já usava: completa uma vez
    await pg.evaluate("delete curUser().cidade;delete curUser().uf;saveAcc();go('home')")
    t=await pg.text_content('#app');ok('Quem já usa completa cidade/estado uma vez', 'Complete seu cadastro' in t and await pg.evaluate("!!document.querySelector('#lg-cid')"))
    await pg.fill('#lg-cid','Sapucaia do Sul');await pg.select_option('#lg-uf','RS');await pg.click('#lg-go');await pg.wait_for_timeout(500)
    ok('Depois de completar, segue no app', await pg.evaluate("page")=='home' and await pg.evaluate("curUser().cidade")=='Sapucaia do Sul')
    # volume
    await pg.evaluate("S.theory=40;save();openM2('b601')");await pg.wait_for_timeout(300)
    ok('Botão 🔊 na partitura', (await pg.evaluate("(document.querySelector('.score-head .vol-btn')||{}).textContent"))=='🔊 7')
    await pg.click('.score-head .vol-btn');ok('Painel de volume abre com controle deslizante', await pg.evaluate("!!document.querySelector('#vol-pop .vol-range')"))
    await pg.click('#vol-pop button:has-text("+")');ok('Botão + aumenta o volume', await pg.evaluate("ACC.cfg.volume")==8)
    rms=await pg.evaluate("""(async()=>{const c=ctx();await c.resume();const m=volMontar(c),an=c.createAnalyser();an.fftSize=2048;_conectar.call(m.k,an);const buf=new Float32Array(2048);
      const medir=async v=>{volDefinir(v);await new Promise(r=>setTimeout(r,150));saxSynth(392,0.6,.038);await new Promise(r=>setTimeout(r,250));an.getFloatTimeDomainData(buf);return Math.sqrt(buf.reduce((s,x)=>s+x*x,0)/buf.length)};
      const r1=await medir(1),r10=await medir(10),r7=await medir(7);return {r1,r7,r10,ganho7:m.g.gain.value}})()""")
    ok('Som mais alto: volume 7 ≥ 2,5× o original', r['ganho7'] if False else rms['ganho7']>=2.5, json.dumps({k:round(v,4) for k,v in rms.items()}))
    ok('Volume 10 soa mais alto que volume 1', rms['r10']>rms['r1']*2, json.dumps({k:round(v,4) for k,v in rms.items()}))
    ok('Sem distorção (limitador segura o pico)', rms['r10']<0.9)
    await pg.evaluate("document.getElementById('vol-pop')&&document.getElementById('vol-pop').remove();closeMeter()");await pg.wait_for_timeout(300)
    await pg.evaluate("go('profile')");ok('Perfil tem controle de volume e Testar o som', await pg.evaluate("!!document.querySelector('.vol-range')") and 'Testar o som' in await pg.text_content('#app'))
    await pg.evaluate("FMQ=(CAT_F.find(c=>/Brilha/i.test(c.t))||CAT_F[0]).id;go('item')");await pg.wait_for_timeout(500)
    # (partitura bloqueada para aluna gratuita: conferir botão só se abrir a tela)
    # fim do teste
    await pg.evaluate("(()=>{const u=curUser();u.testeUsado=somaDias(-4);u.plan='teste';u.exp=somaDias(-1);saveAcc();checarVencimento();go('home')})()")
    t=await pg.text_content('#app')
    ok('Teste acabou: aviso com A) Mensal B) Trimestral C) Semestral D) Anual', all(x in t for x in ['teste grátis de 3 dias terminou','A) Mensal','B) Trimestral','C) Semestral','D) Anual']), t[:200])
    ok('Teste acabou: acesso parcial (premium bloqueado)', await pg.evaluate("lockReason('ex08')")=='premium')
    await pg.evaluate("buy('mensal')");ok('Escolher plano leva ao pagamento', await pg.evaluate("page")=='pagar')
    # segurança: plano falso
    await pg.evaluate("curUser().plan='vitalicio';curUser().exp=null;saveAcc()");await pg.reload();await pg.wait_for_timeout(1500)
    ok('Plano Vitalício "inventado" no aparelho é cancelado', await pg.evaluate("curUser().plan")=='gratuito')
    await pg.evaluate("(()=>{const u=curUser();u.plan='teste';u.testeUsado=hojeISO();u.exp=somaDias(60);saveAcc()})()");await pg.reload();await pg.wait_for_timeout(1500)
    ok('Teste esticado para 60 dias volta para 3 dias', await pg.evaluate("curUser().exp")==await pg.evaluate("somaDias(3)"))
    if os.path.exists(CH):
      c=lic('a@x.com','A');r=await pg.evaluate(f"aplicarCodigo('{c}')");await pg.wait_for_timeout(300);await pg.reload();await pg.wait_for_timeout(1500)
      ok('Plano com código verdadeiro continua valendo depois de reabrir', r=='ok' and await pg.evaluate("curUser().plan")=='anual')
    await pg.evaluate("ACC.cfg.remoto={pagamento:{links:{anual:'javascript:alert(1)',mensal:'https://kiwify.app/x'},pix:'<img src=x onerror=alert(1)>'},versoes:[{v:'9.9',notas:'<b onclick=x>oi</b>'}]};saveAcc();limparRemoto()")
    rm=await pg.evaluate("ACC.cfg.remoto")
    ok('Link perigoso (javascript:) é removido; link https fica', 'anual' not in rm['pagamento']['links'] and rm['pagamento']['links'].get('mensal','').startswith('https://'))
    ok('Texto com código escondido é limpo', '<' not in rm['pagamento']['pix'] and '<' not in rm['versoes'][0]['notas'])
    ok('Sem aviso antigo de "baixar atualização"', await pg.evaluate("novasVersoes().length")==0)
    ok('Sem erros JavaScript', not errs, str(errs[:3]))
    await ctx.close()
    # anti-iframe
    srv=subprocess.Popen(['python3','-m','http.server','8833','-d',APP],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(.8)
    try:
      c2=await b.new_context();p2=await c2.new_page();await p2.set_content('<iframe id=f src="http://127.0.0.1:8833/index.html" width=400 height=400></iframe>');await p2.wait_for_timeout(2500)
      fr=p2.frames[1] if len(p2.frames)>1 else None;esc=await fr.evaluate("getComputedStyle(document.documentElement).display") if fr else 'sem frame'
      ok('Não abre dentro de site de terceiros (iframe): página fica escondida', esc=='none', esc)
      await c2.close()
    finally: srv.kill()
    # telas deitadas compactas
    for W,H in [(762,346),(889,400)]:
      c3=await b.new_context(viewport={'width':W,'height':H},is_mobile=True,has_touch=True);p3=await c3.new_page();await p3.goto(F);await p3.wait_for_timeout(500);await conta(p3,'t%d@x.com'%W)
      await p3.evaluate("S.theory=40;curUser().plan='vitalicio';const it=(CAT_F.find(c=>/Brilha/i.test(c.t))||CAT_F[0]).id;curUser().compras={};curUser().compras[it]={};saveAcc();S.plan='Vitalício';save()")
      med={}
      for nome,js in [('figura',"openEx('ex01')"),('m2',"openM2('b601')"),('acervo',"FMQ=(CAT_F.find(c=>/Brilha/i.test(c.t))||CAT_F[0]).id;go('item')")]:
        await p3.evaluate("document.body.classList.remove('forced-landscape')");await p3.evaluate(js);await p3.wait_for_timeout(500)
        med[nome]=await p3.evaluate("(()=>{const b=document.querySelector('.score-controls,.pbar');return b?Math.round(b.getBoundingClientRect().height):0})()")
      ok(f'Celular deitado {W}x{H}: barra de botões fina (≤ 50 px) em figura, exercício e acervo', all(0<v<=50 for v in med.values()), str(med))
      await c3.close()
    await b.close()
  for r in R:print(*r)
  print(sum(r[0]=='✓' for r in R),'/',len(R))
try:
  asyncio.run(main())
except Exception as e:
  print("EXC",str(e)[:200])
  for r in R:print(*r)
