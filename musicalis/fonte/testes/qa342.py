import asyncio,os
from playwright.async_api import async_playwright
from protecao import proteger
F='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','app','index.html'))
R=[];ok=lambda n,c,i='':R.append(('✓' if c else '✗',n,i))
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required']);proteger(b);pg=await (await b.new_context(viewport={'width':412,'height':915})).new_page();e=[];pg.on('pageerror',lambda x:e.append(str(x)))
    await pg.goto(F);await pg.wait_for_timeout(700)
    await pg.evaluate("authMode='criar';page='login';render()")
    await pg.fill('#lg-nome','Vinheta Teste Silva');await pg.fill('#lg-tel','51999990000');await pg.fill('#lg-cid','Canoas');await pg.select_option('#lg-uf','RS');await pg.fill('#lg-email','v@x.com');await pg.fill('#lg-pass','abcdef');await pg.fill('#lg-pass2','abcdef');await pg.click('#lg-go');await pg.wait_for_timeout(1200)
    ok('Padrão: vinheta de jazz', await pg.evaluate("vinhetaEstilo()")=='jazz')
    ok('Sem perfil: sax alto', await pg.evaluate("vjInstrumento()")=='alto')
    r=await pg.evaluate("(()=>{const u=curUser(),o={};['Soprano','Alto','Tenor','Barítono'].forEach(s=>{u.perfil={principal:s,saxes:[s]};o[s]=vjInstrumento()});return o})()")
    ok('Cada sax principal toca a sua vinheta', r=={'Soprano':'soprano','Alto':'alto','Tenor':'tenor','Barítono':'baritono'}, str(r))
    res=await pg.evaluate("""(async()=>{const o={};for(const inst of ['soprano','alto','tenor','baritono']){const c=new OfflineAudioContext(1,44100*5,44100);vinhetaJazz(c,inst,.05);const b=await c.startRendering();const d=b.getChannelData(0);let s=0;for(const x of d)s+=x*x;o[inst]=Math.sqrt(s/d.length)}return o})()""")
    ok('As 4 vinhetas produzem som', all(v>0.005 for v in res.values()), str(res))
    await pg.evaluate("curUser().perfil={principal:'Tenor',saxes:['Tenor']};saveAcc();S.theory=40;save();go('profile')");await pg.wait_for_timeout(300)
    t=await pg.text_content('#vinheta-card')
    ok('Perfil mostra "Jazz no som do seu sax" com Sax Tenor e botões dos 4 sax', 'Jazz no som do seu sax' in t and 'Sax Tenor' in t and all(x in t for x in ['Soprano','Alto','Tenor','Barítono']))
    n=await pg.evaluate("(async()=>{const c=ctx();await c.resume();sessionStorage.removeItem('musicalis_vinheta');return tocarVinheta()})()")
    ok('Ao abrir o app, toca a vinheta', n is True)
    await pg.screenshot(path=os.environ.get('SHOTS','/tmp')+'/v_card.png',full_page=False,clip={'x':0,'y':0,'width':412,'height':915})
    ok('Sem erros JavaScript', not e, str(e[:3]))
    await b.close()
  for r in R:print(*r)
  print(sum(r[0]=='✓' for r in R),'/',len(R))
asyncio.run(main())
