import asyncio,json,subprocess,time,datetime,base64
from playwright.async_api import async_playwright
from cryptography.hazmat.primitives import serialization,hashes
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.asymmetric.utils import decode_dss_signature
import os,sys
CH=os.environ.get('MUSICALIS_CHAVE','/home/claude/chave_criador/MUSICALIS_CHAVE_CRIADOR.json')
if not os.path.exists(CH):sys.exit('qa328 precisa do arquivo da chave do Criador (variável MUSICALIS_CHAVE). Pulei.')
J=json.load(open(CH))['jwk']
d=lambda s:int.from_bytes(base64.urlsafe_b64decode(s+'='*(-len(s)%4)),'big')
KEY=ec.derive_private_key(d(J['d']),ec.SECP256R1())
A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
def b32(bs):
  bits=v=0;o=''
  for b in bs:
    v=((v<<8)|b)&0xffff;bits+=8
    while bits>=5:o+=A[(v>>(bits-5))&31];bits-=5
  if bits:o+=A[(v<<(5-bits))&31]
  return o
def sign(email,body,key=KEY):
  r,s=decode_dss_signature(key.sign((email.lower().strip()+'|'+body).encode(),ec.ECDSA(hashes.SHA256())))
  return b32(r.to_bytes(32,'big')+s.to_bytes(32,'big'))
def lic(email,P='A',dt=None,key=KEY):
  dt=dt or (datetime.date.today()+datetime.timedelta(days=365)).strftime('%y%m%d')
  body=P+(dt if P!='V' else '000000')+'-ABCD';return 'MUS2-'+body+'-'+sign(email,'L'+body,key)
U='http://localhost:8811/'
R=[];ok=lambda n,c,i='':R.append(('✓' if c else '✗',n,i))
async def novo(b,email,hash_='',nome='Maria da Silva',tel='(51) 99876-5432',pre=None):
  ctx=await b.new_context(viewport={'width':412,'height':915},user_agent='Mozilla/5.0 (Linux; Android 13; SM-A135F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36')
  pg=await ctx.new_page();pg.errs=[];pg.csp=[]
  pg.on('pageerror',lambda e:pg.errs.append(str(e)))
  pg.on('console',lambda m:(pg.csp.append(m.text) if 'Content Security Policy' in m.text or 'Refused' in m.text else None))
  await pg.goto(U+hash_);await pg.wait_for_timeout(700)
  if pre:await pre(pg)
  await pg.evaluate("authMode='criar';page='login';render()")
  await pg.fill('#lg-nome',nome);await pg.fill('#lg-tel',tel);await pg.fill('#lg-cid','Porto Alegre');await pg.select_option('#lg-uf','RS')
  await pg.fill('#lg-email',email);await pg.fill('#lg-pass','abcdef');await pg.fill('#lg-pass2','abcdef');await pg.click('#lg-go');await pg.wait_for_timeout(1500)
  return ctx,pg
async def main():
  sp=subprocess.Popen(['python3','-m','http.server','8811','-d',os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','app')],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(.8)
  try:
   async with async_playwright() as p:
    b=await p.chromium.launch();from protecao import proteger;proteger(b)
    html=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','app','index.html')).read()
    ok('Código público sem segredo nem e-mails do criador','f4e03fa2' not in html and 'kennysax29@gmail' not in html and 'andersonpinto.rs@gmail' not in html and '"d"' not in html.split('PUB_JWK=')[1][:300])
    # 1. e-mail do criador NÃO vira criador
    ctx,pg=await novo(b,'dono.teste@x.com',nome='Dono Teste Silva')
    ok('E-mail do criador sem chave = aluno comum', not await pg.evaluate("isOwner()") and await pg.evaluate("curUser().role")!='owner', await pg.evaluate("curUser().role+' '+curUser().plan"))
    await pg.evaluate("page='painel';render()");ok('Painel bloqueado sem chave','Painel' not in (await pg.text_content('#app'))[:80] or not await pg.evaluate("isOwner()"))
    # 2. importa a chave -> criador
    await pg.evaluate("go('chave')");await pg.set_input_files('input[type=file]',CH);await pg.wait_for_timeout(1500)
    ok('Chave importada: acesso de Criador', await pg.evaluate("isOwner()&&curUser().plan==='vitalicio'"))
    await pg.reload();await pg.wait_for_timeout(1500)
    ok('Chave continua após recarregar', await pg.evaluate("KEY_OK&&isOwner()"))
    ok('Chave não exportável', await pg.evaluate("PRIVK.extractable===false"))
    await pg.evaluate("go('painel')");await pg.wait_for_timeout(300)
    await pg.fill('#sl-email','aluna@x.com');await pg.select_option('#sl-plan','trimestral');await pg.evaluate("genCode()");await pg.wait_for_timeout(800)
    link=await pg.evaluate("document.querySelector('#sl-out .field').textContent")
    ok('Painel gera link de ativação', link.startswith(U.replace('http://localhost:8811/','https://aap29.github.io/prospectarion/musicalis/app/')+'#ativar=MUS2-T'), link[:90])
    cod=link.split('#ativar=')[1]
    errs_owner=pg.errs+pg.csp;await ctx.close()
    # 3. aluna abre o link ANTES de criar conta -> ativa depois do cadastro
    ctx,pg=await novo(b,'aluna@x.com','#ativar='+cod);await pg.wait_for_timeout(800)
    ok('Link de ativação liberou o plano (código do painel)', await pg.evaluate("curUser().plan")=='trimestral', await pg.evaluate("curUser().plan"))
    ok('Endereço limpo depois do link', '#' not in pg.url)
    e3=pg.errs+pg.csp;await ctx.close()
    # 4. código de outro e-mail é recusado
    ctx,pg=await novo(b,'intrusa@x.com','#ativar='+cod);await pg.wait_for_timeout(800)
    ok('Link de outra pessoa não funciona', await pg.evaluate("curUser().plan")!='trimestral', await pg.evaluate("curUser().plan"))
    # 5. código falsificado (chave errada) e adulterado
    fake=ec.generate_private_key(ec.SECP256R1())
    r1=await pg.evaluate(f"aplicarCodigo('{lic('intrusa@x.com','V',key=fake)}')")
    good=lic('intrusa@x.com','A');bad=good.replace('-A','-V',1)
    r2=await pg.evaluate(f"aplicarCodigo('{bad}')")
    ok('Código falsificado/adulterado é recusado', r1=='invalido' and r2=='invalido', r1+' '+r2)
    r3=await pg.evaluate(f"aplicarCodigo('{good.lower()}')");ok('Código válido (Python) aceito, mesmo digitado em minúsculas', r3=='ok' and await pg.evaluate("curUser().plan")=='anual')
    past=(datetime.date.today()-datetime.timedelta(days=2)).strftime('%y%m%d')
    ok('Código vencido avisa', await pg.evaluate(f"aplicarCodigo('{lic('intrusa@x.com','M',past)}')")=='expirado')
    await pg.evaluate("go('ativar')");await pg.fill('#lic',lic('intrusa@x.com','V'));await pg.evaluate("doAtivar()");await pg.wait_for_timeout(500)
    ok('Tela "Já comprei" ativa vitalício', await pg.evaluate("curUser().plan")=='vitalicio')
    # 6. cards na home + instalar
    await pg.evaluate("S.theory=40;save();go('home')");t=await pg.text_content('#app')
    ok('Home mostra aviso do app antigo (Android)', 'instalou o MUSICALIS pelo arquivo' in t)
    ok('Home mostra instalar na tela inicial', 'Instale o MUSICALIS na tela inicial' in t)
    await pg.evaluate("go('migrar')");t=await pg.text_content('#app');ok('Página de troca do app antigo', 'Do app antigo para o novo' in t and 'Desinstalar' in t)
    await pg.evaluate("go('instalar')");t=await pg.text_content('#app');ok('Página instalar com passos', 'Instalar app' in t and 'Por que é seguro' in t)
    sw=await pg.evaluate("navigator.serviceWorker.getRegistration().then(r=>!!r)");ok('Service worker registrado', sw)
    # 7. telas principais sem erro de CSP
    for pgname in ['study','library','acervo','teoria','plans','profile','transpose']:
      await pg.evaluate(f"go('{pgname}')");await pg.wait_for_timeout(200)
    await pg.evaluate("go('study')");await pg.wait_for_timeout(300)
    try:
      await pg.evaluate("openM2&&M2EX&&openM2(M2EX[0].id||0)");await pg.wait_for_timeout(600)
    except Exception as e: pass
    ok('Sem erros de JavaScript nem bloqueio de CSP', not(pg.errs+pg.csp+e3+errs_owner), str((pg.errs+pg.csp+e3+errs_owner)[:3]))
    # offline
    await ctx.set_offline(True);await pg.reload();await pg.wait_for_timeout(800)
    ok('Abre sem internet (offline)', 'MUSI' in (await pg.text_content('#app') or ''))
    await ctx.close()
    # 8. migração do app antigo
    conta={'email':'velho@x.com','nome':'Seu Velho Silva','tel':'(51) 98888-7777','salt':'00','hash':'11','created':'2026-10-01','planoAntigo':'anual'}
    pac={'musicalis_migrar':1,'conta':conta,'backup':{'musicalis_backup':2,'estado':{'theory':60,'practice':30,'progress':{'ex01':{'reps':5}}}}}
    t=base64.urlsafe_b64encode(json.dumps(pac).encode()).decode().rstrip('=')
    ctx=await b.new_context(viewport={'width':412,'height':915});pg=await ctx.new_page();pg.errs=[];pg.on('pageerror',lambda e:pg.errs.append(str(e)))
    await pg.goto(U+'#migrar='+t);await pg.wait_for_timeout(1500)
    tx=await pg.text_content('#app')
    ok('Migração: conta criada e logada', await pg.evaluate("ACC.session")=='velho@x.com', await pg.evaluate("ACC.session"))
    ok('Migração: plano pago NÃO é copiado (pede link novo)', await pg.evaluate("curUser().plan")=='gratuito' and 'Pedir meu link de ativação' in tx)
    ok('Migração: tela final explica remover o antigo', 'Remover app antigo' in tx)
    ok('Migração sem erros', not pg.errs, str(pg.errs[:2]))
    await ctx.close()
    await b.close()
  finally: sp.kill()
  for r in R:print(*r)
  print(sum(r[0]=='✓' for r in R),'/',len(R))
asyncio.run(main())
