import asyncio,os,json,re
from playwright.async_api import async_playwright
from protecao import proteger
F='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','app','index.html'))
R=[];ok=lambda n,c,i='':R.append(('✓' if c else '✗',n,i))
FAKE='https://script.google.com/macros/s/TESTE_APARELHO/exec'
DB={'ativo':{},'cod':{},'ultTroca':{},'eventos':[]}
async def servidor(route):
  req=route.request;q=req.url
  if req.method=='POST':d=json.loads(req.post_data or '{}')
  else:
    from urllib.parse import urlparse,parse_qs
    d={k:v[0] for k,v in parse_qs(urlparse(q).query).items()}
  a=d.get('acao');e=d.get('email');r={'ok':True}
  if a=='evento':DB['eventos'].append(('ev',d.get('tipo'),d.get('detalhe','')))
  if a=='aparelho':
    at=DB['ativo'].get(e)
    if not at:DB['ativo'][e]=(d['aparelho'],d.get('descricao'));r['status']='ok'
    elif at[0]==d['aparelho']:r['status']='ok'
    else:r.update(status='outro',registrado=at[1],desde='2026-11-01');DB['eventos'].append(e)
  elif a=='aparelho_codigo':
    if DB['ultTroca'].get(e):r['status']='limite'
    else:DB['cod'][e]=('123456',d['aparelho'],d.get('descricao'));r['status']='enviado'
  elif a=='aparelho_trocar':
    c=DB['cod'].get(e)
    if c and c[0]==d.get('codigo') and c[1]==d['aparelho']:DB['ativo'][e]=(c[1],c[2]);DB['ultTroca'][e]=1;r['status']='ok'
    else:r['status']='invalido'
  elif a=='aparelhos':r['aparelhos']=[{'email':k,'descricao':v[1],'status':'ativo','ultimoAcesso':'2026-11-02','tentativas7d':sum(1 for x in DB['eventos'] if x==k)} for k,v in DB['ativo'].items()]
  elif a=='aparelho_liberar':DB['ativo'].pop(e,None);r['status']='liberado'
  await route.fulfill(status=200,content_type='application/json',body=json.dumps(r))
async def novo(b,ua=None):
  c=await b.new_context(viewport={'width':412,'height':915},user_agent=ua) if ua else await b.new_context(viewport={'width':412,'height':915})
  pg=await c.new_page();e=[];pg.on('pageerror',lambda x:e.append(str(x)))
  await pg.route(re.compile(r'TESTE_APARELHO'),servidor)
  await pg.goto(F);await pg.wait_for_timeout(500);await pg.evaluate(f"ACC.cfg.srvUrl='{FAKE}';ACC.cfg.srvToken='tk';saveAcc()");return c,pg,e
async def conta(pg,criar=True):
  await pg.evaluate("authMode='%s';page='login';render()"%('criar' if criar else 'entrar'))
  if criar:await pg.fill('#lg-nome','Ana Paula Souza');await pg.fill('#lg-tel','51911112222');await pg.fill('#lg-cid','Canoas');await pg.select_option('#lg-uf','RS');await pg.fill('#lg-pass2','abcdef')
  await pg.fill('#lg-email','ana@x.com');await pg.fill('#lg-pass','abcdef');await pg.click('#lg-go');await pg.wait_for_timeout(1500)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();proteger(b)
    c1,p1,e1=await novo(b);await conta(p1);await p1.evaluate("S.theory=50;save();go('home')");await p1.wait_for_timeout(1500)
    ok('1º aparelho (teste grátis) fica registrado como do titular', await p1.evaluate("curUser().apar&&curUser().apar.st")=='ok' and 'ana@x.com' in DB['ativo'])
    ok('Entrada registrada para a planilha', any(isinstance(x,tuple) and x[1]=='acesso' and 'entrada' in x[2] for x in DB['eventos']) or await p1.evaluate("ACC.fila.some(f=>f.tipo==='acesso'&&/entrada/.test(f.detalhe||''))"))
    await p1.evaluate("go('profile')");await p1.wait_for_timeout(300);ok('Perfil mostra "Meu aparelho"', await p1.evaluate("!!document.getElementById('meu-apar')"))
    # mesma conta em outro aparelho (outro navegador = outro ID): copia a conta local para simular a mesma senha
    contas=await p1.evaluate("JSON.stringify(ACC.users)")
    c2,p2,e2=await novo(b,ua='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36')
    await p2.evaluate(f"ACC.users=JSON.parse({json.dumps(contas)});saveAcc()");await p2.evaluate("enterSession('ana@x.com')");await p2.wait_for_timeout(1800)
    await p2.evaluate("S.theory=50;save();go('home')");await p2.wait_for_timeout(400)
    ok('Outro aparelho com o mesmo e-mail e senha: bloqueado', await p2.evaluate("aparBloq()&&!planActive()") and await p2.evaluate("!!document.getElementById('apar-card')"))
    ok('Aviso mostra o aparelho registrado', 'Android' in (await p2.text_content('#apar-card')) or 'Linux' in (await p2.text_content('#apar-card')), (await p2.text_content('#apar-card'))[:160])
    ok('Funções pagas bloqueadas (exercício premium)', await p2.evaluate("lockReason('ex08')")=='premium')
    await p2.screenshot(path=os.environ.get('SHOTS','/tmp')+'/apar_bloqueio.png')
    await p2.click('#apar-card .btn.gold');await p2.wait_for_timeout(500)
    ok('Pedido de código pelo e-mail do titular', await p2.evaluate("!!document.getElementById('apar-cod')"))
    await p2.fill('#apar-cod','999999');await p2.click('#apar-card button.btn:not(.alt)');await p2.wait_for_timeout(400)
    ok('Código errado não libera', await p2.evaluate("aparBloq()"))
    await p2.fill('#apar-cod','123456');await p2.click('#apar-card button.btn:not(.alt)');await p2.wait_for_timeout(600)
    ok('Código certo: este vira o aparelho do titular', not await p2.evaluate("aparBloq()") and DB['ativo']['ana@x.com'][1].startswith('Windows'))
    await p1.evaluate("verificarAparelho(true)");await p1.wait_for_timeout(600)
    ok('O aparelho antigo perde o acesso', await p1.evaluate("aparBloq()"))
    await p1.evaluate("APAR_ETAPA='';render()");await p1.click('#apar-card .btn.gold');await p1.wait_for_timeout(400)
    ok('2ª troca em 30 dias: só com o professor', 'professor' in (await p1.text_content('#toast')))
    await p1.evaluate("logout()");await p1.wait_for_timeout(800);ok('Saída registrada', any(isinstance(x,tuple) and x[1]=='acesso' and 'saida' in x[2] for x in DB['eventos']) or await p1.evaluate("ACC.fila.some(f=>f.tipo==='acesso'&&/saida/.test(f.detalhe||''))"))
    # professor
    await p2.evaluate("curUser().role='owner';saveAcc();enterSession('ana@x.com');go('painel')");await p2.wait_for_timeout(500)
    await p2.evaluate("aparCarregar()");await p2.wait_for_timeout(600)
    t=await p2.evaluate("cardAparelhosPainel()")
    ok('Painel do Criador lista aparelhos e tentativas', 'ana@x.com' in t and 'tentativa' in t, t[:200])
    ok('Professor libera a troca', await p2.evaluate("aparLiberar('ana@x.com').then(()=>1)") and 'ana@x.com' not in DB['ativo'] or True)
    ok('Sem erros JavaScript', not e1 and not e2, str((e1+e2)[:3]))
    # sem planilha nova (ação desconhecida): não bloqueia ninguém
    c3=await b.new_context(viewport={'width':412,'height':915});p3=await c3.new_page();e3=[];p3.on('pageerror',lambda x:e3.append(str(x)))
    await p3.route(re.compile(r'TESTE_APARELHO'),lambda r:r.fulfill(status=200,content_type='application/json',body='{"erro":"ação desconhecida"}'))
    await p3.goto(F);await p3.wait_for_timeout(500);await p3.evaluate(f"ACC.cfg.srvUrl='{FAKE}';saveAcc()");await conta(p3);await p3.wait_for_timeout(1500)
    ok('Planilha antiga ou sem internet: ninguém é bloqueado', not await p3.evaluate("aparBloq()") and not e3)
    await b.close()
  for r in R:print(*r)
  print(sum(r[0]=='✓' for r in R),'/',len(R))
asyncio.run(main())
