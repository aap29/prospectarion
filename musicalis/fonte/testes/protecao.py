"""Impede que os testes enviem dados para a planilha verdadeira do professor."""
import re
_ALVO=re.compile(r'script\.google(usercontent)?\.com')
def proteger(b):
  oc,op=b.new_context,b.new_page
  async def nc(*a,**k):
    c=await oc(*a,**k);await c.route(_ALVO,lambda r:r.abort());return c
  async def np(*a,**k):
    p=await op(*a,**k);await p.route(_ALVO,lambda r:r.abort());return p
  b.new_context=nc;b.new_page=np;return b
