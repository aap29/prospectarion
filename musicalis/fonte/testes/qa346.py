import asyncio,os,re
from playwright.async_api import async_playwright
from protecao import proteger
F='file://'+os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','app','index.html'))
R=[];ok=lambda n,c,i='':R.append(('✓' if c else '✗',n,i))
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch();proteger(b)
  for vw,nome in [((412,915),'empe'),((889,400),'deitado')]:
   c=await b.new_context(viewport={'width':vw[0],'height':vw[1]});pg=await c.new_page();err=[];pg.on('pageerror',lambda x:err.append(str(x)))
   await pg.goto(F);await pg.wait_for_timeout(500)
   await pg.evaluate("authMode='criar';page='login';render()")
   for sel,v in [('#lg-nome','Ana Paula Souza'),('#lg-tel','51911112222'),('#lg-cid','Canoas'),('#lg-pass2','abcdef')]:
     if await pg.query_selector(sel):await pg.fill(sel,v)
   if await pg.query_selector('#lg-uf'):await pg.select_option('#lg-uf','RS')
   await pg.fill('#lg-email','ana@x.com');await pg.fill('#lg-pass','abcdef');await pg.click('#lg-go');await pg.wait_for_timeout(1200)
   ok(f'{nome}: sem modal no 1º acesso',await pg.query_selector('#volta') is None)
   async def voltar(dias):
     await pg.evaluate(f"S.theory=60;S.practice=60;const d=new Date();d.setDate(d.getDate()-{dias});S.ultVisita=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');page='home';save()")
     await pg.reload();await pg.wait_for_timeout(1500)
     el=await pg.query_selector('#volta');return (await el.inner_text()) if el else None
   t=await voltar(1);ok(f'{nome}: 1 dia sem modal',t is None)
   t=await voltar(4);ok(f'{nome}: 4 dias "senti sua falta"',t and 'Senti sua falta' in t and 'Ana' in t,t and t[:60])
   ok(f'{nome}: convite leve aos planos (teste)',t and 'R$ 79,90' in t)
   await pg.screenshot(path=f'/tmp/claude-0/-home-claude/63d569dc-e8b2-59c5-876f-2fd281883d7b/scratchpad/volta_{nome}_4.png')
   await pg.click('#volta .btn.gold');await pg.wait_for_timeout(400)
   ok(f'{nome}: botão leva ao estudo e fecha',await pg.query_selector('#volta') is None and await pg.evaluate('page')=='study')
   await pg.reload();await pg.wait_for_timeout(1200);ok(f'{nome}: não repete no mesmo dia',await pg.query_selector('#volta') is None)
   t=await voltar(20);ok(f'{nome}: 20 dias "guardei tudo"',t and 'Faz 20 dias' in t)
   await pg.screenshot(path=f'/tmp/claude-0/-home-claude/63d569dc-e8b2-59c5-876f-2fd281883d7b/scratchpad/volta_{nome}_20.png')
   # aluno com plano pago: sem convite
   t=await voltar(5)
   t=await pg.evaluate("planActive=()=>true;curUser().plan='anual';document.getElementById('volta').remove();render();document.getElementById('volta').innerText")
   ok(f'{nome}: pago recebe só o carinho, sem preço',t and 'R$ 79,90' not in t and 'Senti sua falta' in t)
   ok(f'{nome}: sem erros JS',not err,str(err[:2]));await c.close()
  await b.close()
asyncio.run(main())
for r in R:print(*r)
print('FALHAS:',sum(1 for r in R if r[0]=='✗'))
