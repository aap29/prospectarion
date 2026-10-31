import asyncio,os,re,shutil,subprocess,time,tempfile
from playwright.async_api import async_playwright
from protecao import proteger
APP=os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','app'))
D=os.path.join(tempfile.gettempdir(),'musicalis_site340');shutil.rmtree(D,ignore_errors=True);shutil.copytree(APP,D)
h=re.sub(r"const SRV_URL_PADRAO='[^']*'","const SRV_URL_PADRAO=''",open(D+'/index.html').read());open(D+'/index.html','w').write(h)
R=[];ok=lambda n,c,i='':R.append(('✓' if c else '✗',n,i))
HEIC=os.environ.get('HEIC','/tmp/selfie.heic')
async def main():
  sp=subprocess.Popen(['python3','-m','http.server','8840','-d',D],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(.8)
  try:
   async with async_playwright() as p:
    b=await p.chromium.launch();proteger(b);ctx=await b.new_context(viewport={'width':412,'height':915});pg=await ctx.new_page();errs=[];csp=[]
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:csp.append(m.text) if 'Content Security Policy' in m.text else None)
    await pg.goto('http://localhost:8840/');await pg.wait_for_timeout(1000)
    await pg.evaluate("authMode='criar';page='login';render()")
    await pg.fill('#lg-nome','Foto Teste Silva');await pg.fill('#lg-tel','51999990000');await pg.fill('#lg-cid','Canoas');await pg.select_option('#lg-uf','RS');await pg.fill('#lg-email','f@x.com');await pg.fill('#lg-pass','abcdef');await pg.fill('#lg-pass2','abcdef');await pg.click('#lg-go');await pg.wait_for_timeout(1200)
    await pg.evaluate("S.theory=40;save();go('profile')")
    ok('Logo oficial no topo do app', await pg.evaluate("(()=>{const i=document.querySelector('#app .top img.logo');return !!i&&i.complete&&i.naturalWidth===192})()"))
    async with pg.expect_file_chooser() as fc:await pg.evaluate("escolherFoto()")
    await (await fc.value).set_files(HEIC)
    for _ in range(40):
      await pg.wait_for_timeout(500)
      if await pg.evaluate("!!(curUser().foto)"):break
    ok('Foto HEIC é convertida e salva no perfil', await pg.evaluate("(curUser().foto||'').startsWith('data:image/jpeg')"))
    ok('Foto aparece no topo', await pg.evaluate("!!document.querySelector('.avatar-top .av img')"))
    ok('Sem bloqueio de segurança (CSP) nem erros', not csp and not errs, str((csp+errs)[:3]))
    await pg.screenshot(path=os.environ.get('SHOTS','/tmp')+'/f1_heic.png')
    await b.close()
  finally: sp.kill()
  for r in R:print(*r)
  print(sum(r[0]=='✓' for r in R),'/',len(R))
asyncio.run(main())
