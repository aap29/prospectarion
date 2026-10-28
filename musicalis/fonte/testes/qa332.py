import asyncio,subprocess,time,shutil,os,re
from playwright.async_api import async_playwright
import tempfile;D=os.path.join(tempfile.gettempdir(),'musicalis_site');shutil.rmtree(D,ignore_errors=True);APP=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','app');shutil.copytree(APP,D)
U='http://localhost:8822/'
R=[];ok=lambda n,c,i='':R.append(('✓' if c else '✗',n,i))
def publicar(v):
  t=re.sub(r"const APP_VERSAO='[0-9.]+'",f"const APP_VERSAO='{v}'",open(os.path.join(APP,'index.html')).read());open(D+'/index.html','w').write(t)
  open(D+'/versao.json','w').write('{"v":"%s"}'%v)
  s=re.sub(r'musicalis-v[0-9.]+','musicalis-v'+v,open(os.path.join(APP,'sw.js')).read());open(D+'/sw.js','w').write(s)
async def main():
  sp=subprocess.Popen(['python3','-m','http.server','8822','-d',D],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(.8)
  try:
   async with async_playwright() as p:
    b=await p.chromium.launch();ctx=await b.new_context(viewport={'width':412,'height':915});pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(U);await pg.wait_for_timeout(1500)
    await pg.evaluate("authMode='criar';page='login';render()")
    await pg.fill('#lg-nome','Maria da Silva');await pg.fill('#lg-tel','51999998888');await pg.fill('#lg-email','m@x.com');await pg.fill('#lg-pass','abcdef');await pg.fill('#lg-pass2','abcdef');await pg.click('#lg-go');await pg.wait_for_timeout(1200)
    await pg.evaluate("S.theory=40;save();go('home')");await pg.wait_for_timeout(500)
    V0=await pg.evaluate('APP_VERSAO');ok('Versão inicial com service worker', bool(V0) and await pg.evaluate("navigator.serviceWorker.getRegistration().then(r=>!!r&&!!r.active)"))
    # aluno tocando: não pode ser interrompido
    await pg.evaluate("openM2('b601');meterState.playing=true");publicar('99.1')
    await pg.evaluate("checarAtualizacao()");await pg.wait_for_timeout(1500)
    ok('Durante a partitura/playback NÃO recarrega', await pg.evaluate("APP_VERSAO")==V0 and await pg.evaluate("ATUALIZAR_PENDENTE")=='99.1')
    await pg.evaluate("meterState.playing=false;closeMeter()");await pg.wait_for_timeout(3500)
    ok('Ao sair da partitura, atualiza sozinho para a nova versão', await pg.evaluate("APP_VERSAO")=='99.1', await pg.evaluate("APP_VERSAO"))
    ok('Continua logado e com o progresso', await pg.evaluate("ACC.session")=='m@x.com' and await pg.evaluate("S.theory")==40)
    await pg.wait_for_timeout(1500);ok('Mostra "MUSICALIS atualizado"', 'atualizado' in (await pg.text_content('#toast') or ''))
    # nova versão com o app na tela inicial: atualiza ao voltar para o app
    publicar('99.2');await pg.evaluate("checarAtualizacao()");await pg.wait_for_timeout(3500)
    ok('Na tela inicial: atualiza direto para a seguinte', await pg.evaluate("APP_VERSAO")=='99.2')
    # sem internet: abre a última versão salva
    await ctx.set_offline(True);await pg.reload();await pg.wait_for_timeout(1500)
    ok('Sem internet abre a última versão salva', await pg.evaluate("APP_VERSAO")=='99.2')
    ok('Sem erros', not errs, str(errs[:2]));await b.close()
  finally: sp.kill()
  for r in R:print(*r)
  print(sum(r[0]=='✓' for r in R),'/',len(R))
asyncio.run(main())
