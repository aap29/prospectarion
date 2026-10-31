import asyncio,os,re,shutil,subprocess,time,tempfile,datetime,json,base64
from playwright.async_api import async_playwright
from protecao import proteger
APP=os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','app'))
D=os.path.join(tempfile.gettempdir(),'musicalis_site335');shutil.rmtree(D,ignore_errors=True);shutil.copytree(APP,D)
semsrv=lambda s:re.sub(r"const SRV_URL_PADRAO='[^']*'","const SRV_URL_PADRAO=''",s)
h=semsrv(open(D+'/index.html').read());open(D+'/index.html','w').write(h)
V0=re.search(r"const APP_VERSAO='([0-9.]+)'",h).group(1)
def publicar(v):
  open(D+'/index.html','w').write(re.sub(r"const APP_VERSAO='[0-9.]+'",f"const APP_VERSAO='{v}'",h));open(D+'/versao.json','w').write('{"v":"%s"}'%v)
  s=open(APP+'/sw.js').read();open(D+'/sw.js','w').write(re.sub(r'musicalis-v[0-9.]+','musicalis-v'+v,s))
CH=os.environ.get('MUSICALIS_CHAVE','/home/claude/chave_criador/MUSICALIS_CHAVE_CRIADOR.json')
def lic(email,P,ate):
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
  body=P+ate.strftime('%y%m%d')+'-ABCD';r,s=decode_dss_signature(K.sign((email+'|L'+body).encode(),ec.ECDSA(hashes.SHA256())))
  return 'MUS2-'+body+'-'+b32(r.to_bytes(32,'big')+s.to_bytes(32,'big'))
U='http://localhost:8835/'
R=[];ok=lambda n,c,i='':R.append(('✓' if c else '✗',n,i))
async def main():
  sp=subprocess.Popen(['python3','-m','http.server','8835','-d',D],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(.8)
  try:
   async with async_playwright() as p:
    b=await p.chromium.launch();proteger(b)
    ctx=await b.new_context(viewport={'width':412,'height':915});pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(U);await pg.wait_for_timeout(1200)
    await pg.evaluate("authMode='criar';page='login';render()")
    await pg.fill('#lg-nome','Adao Teste Silva');await pg.fill('#lg-tel','51911112222');await pg.fill('#lg-cid','Canoas');await pg.select_option('#lg-uf','RS');await pg.fill('#lg-email','adao@x.com');await pg.fill('#lg-pass','abcdef');await pg.fill('#lg-pass2','abcdef');await pg.click('#lg-go');await pg.wait_for_timeout(1300)
    await pg.evaluate("S.theory=40;save();go('home')")
    # 1. botão de atualização (app já aberto há mais de 20 s)
    await pg.evaluate("_T0=0");publicar('99.5');await pg.evaluate("checarAtualizacao()");await pg.wait_for_timeout(1500)
    ok('Versão nova: aparece o botão "Atualização disponível" no topo', await pg.evaluate("!!document.querySelector('#app .top .upd-auto')") and await pg.evaluate("APP_VERSAO")==V0)
    await pg.click('#app .top .upd-auto');await pg.wait_for_timeout(3500)
    ok('Um toque no botão: app atualizado', await pg.evaluate("APP_VERSAO")=='99.5', await pg.evaluate("APP_VERSAO"))
    ok('Continua logado depois de atualizar', await pg.evaluate("ACC.session")=='adao@x.com')
    if os.path.exists(CH):
      hoje=datetime.date.today()
      c=lic('adao@x.com','P',hoje+datetime.timedelta(days=20));r=await pg.evaluate(f"aplicarCodigo('{c}')");await pg.wait_for_timeout(400)
      ok('Link especial ativa "Vitalício (parcelado)" até a data', r=='ok' and await pg.evaluate("curUser().plan")=='parcelado' and await pg.evaluate("curUser().exp")==(hoje+datetime.timedelta(days=20)).isoformat())
      ok('Parcelado em dia: acesso completo', await pg.evaluate("planActive()&&lockReason('ex08')!=='premium'"))
      await pg.evaluate("go('home')");t=await pg.text_content('#app');ok('Aviso discreto com a data da próxima parcela', 'próxima parcela até' in t)
      await pg.reload();await pg.wait_for_timeout(1500);ok('Plano parcelado continua valendo ao reabrir (código conferido)', await pg.evaluate("curUser().plan")=='parcelado')
      c=lic('adao@x.com','P',hoje+datetime.timedelta(days=2));await pg.evaluate(f"aplicarCodigo('{c}')");await pg.evaluate("go('home')");t=await pg.text_content('#app')
      ok('2 dias antes: alerta "Sua parcela vence em 2 dias" + Pagar no Pix', 'vence em' in t and 'Pagar a parcela no Pix' in t)
      await pg.evaluate("(()=>{const u=curUser();u.exp=somaDias(-1);saveAcc();go('home')})()");t=await pg.text_content('#app')
      ok('Atrasou: aviso de bloqueio + Pix + comprovante', 'Parcela em atraso' in t and 'bloqueadas' in t and 'Já paguei' in t)
      ok('Atrasou: funções pagas bloqueadas', await pg.evaluate("!planActive()&&lockReason('ex08')==='premium'"))
      ok('Atraso registrado para a planilha', await pg.evaluate("ACC.fila.some(f=>f.tipo==='pagamento'&&/parcela_em_atraso/.test(f.detalhe))"))
      c=lic('adao@x.com','V',hoje);await pg.evaluate(f"aplicarCodigo('{c}')");await pg.wait_for_timeout(300)
      ok('Pagou tudo: Vitalício libera de novo', await pg.evaluate("curUser().plan==='vitalicio'&&planActive()"))
    ok('Sem erros JavaScript', not errs, str(errs[:3]))
    await ctx.close()
    # 3. painel do Criador gera link especial
    if os.path.exists(CH):
      c2=await b.new_context(viewport={'width':412,'height':915});p2=await c2.new_page();await p2.goto(U);await p2.wait_for_timeout(1000)
      await p2.evaluate("authMode='criar';page='login';render()");await p2.fill('#lg-email','dono@x.com');await p2.fill('#lg-pass','abcdef');await p2.fill('#lg-pass2','abcdef')
      if await p2.query_selector('#lg-nome'):await p2.fill('#lg-nome','Dono Teste Silva');await p2.fill('#lg-tel','51900001111');await p2.fill('#lg-cid','Canoas');await p2.select_option('#lg-uf','RS')
      await p2.click('#lg-go');await p2.wait_for_timeout(1200)
      jwk=json.dumps(json.load(open(CH))['jwk'])
      await p2.evaluate("(async()=>{const k=await crypto.subtle.importKey('jwk',"+jwk+",{name:'ECDSA',namedCurve:'P-256'},false,['sign']);await ativarCriador(k,ACC.session);enterSession(ACC.session)})()");await p2.wait_for_timeout(800)
      await p2.evaluate("go('painel')");await p2.wait_for_timeout(400)
      ok('Painel tem "Condição especial (parcelado)"', await p2.evaluate("!!document.getElementById('card-especial')"))
      dt=(datetime.date.today()+datetime.timedelta(days=21)).isoformat()
      await p2.fill('#ce-email','aluno@x.com');await p2.fill('#ce-nome','Aluno Especial');await p2.fill('#ce-data',dt);await p2.evaluate("gerarEspecial()");await p2.wait_for_timeout(800)
      out=await p2.text_content('#ce-out');link=await p2.evaluate("document.querySelector('#ce-out .field').textContent")
      ok('Gera link de acesso especial com a data', '#ativar=MUS2-P' in link and 'parcelado até' in out, link[-40:])
      cod=link.split('#ativar=')[1];r=await p2.evaluate(f"checkLicense('aluno@x.com','{cod}')")
      ok('Link especial vale só para o e-mail do aluno e até a data', r and r['plan']=='parcelado' and r['exp']==dt and not await p2.evaluate(f"checkLicense('outro@x.com','{cod}')"))
      await c2.close()
    await b.close()
  finally: sp.kill()
  for r in R:print(*r)
  print(sum(r[0]=='✓' for r in R),'/',len(R))
asyncio.run(main())
