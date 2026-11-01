/* ===================== V3.43 • LAYOUT PROPORCIONAL (modelo do Anderson para PC/notebook, mesmas proporções no tablet e celular) =====================
   1) cabeçalho: logo e MUSICALIS maiores; à direita foto, nome e o SAX de uso (não a profissão), no mesmo tamanho da logo
   2) Início: saudação dentro do cabeçalho; "Próximo exercício" + Evolução + XP numa linha no computador; Acesso rápido em 6 colunas
   3) cartão "Instale o app" compacto no computador; título da janela sem repetição */
document.title='MUSICALIS • Método de Saxofone';
function saxDeUso(){const p=(typeof perfilDe==='function'&&perfilDe())||{};if(p.principal)return 'Sax '+p.principal;const i=String(S.instrument||'');return /^Sax /.test(i)?i:(i||'Saxofone')}
avatarTopo=function(){if(!ACC.session||!curUser())return '';return `<button class="avatar-top" onclick="go('profile')" aria-label="Meu perfil">${fotoHtml('av')}<b>${nomeTopo()||'Meu perfil'}</b><small>${limpaTxt(saxDeUso(),20)}</small></button>`};
{const a=decorarTopo;decorarTopo=function(){a();const t=document.querySelector('#app .top.top2');if(!t||t.querySelector('.topL'))return;const b=t.querySelector('.brand2');if(!b)return;
 const L=document.createElement('div');L.className='topL';t.insertBefore(L,b);L.appendChild(b)}}
function arrumarInicio(){const app=document.getElementById('app'),t=app.querySelector('.top .topL');if(!t)return;
 const ola=[...app.children].find(e=>e.classList&&e.classList.contains('sub')&&/^OLÁ/.test(e.textContent)),h=ola&&ola.nextElementSibling&&ola.nextElementSibling.tagName==='H1'?ola.nextElementSibling:null;
 if(ola&&h&&!t.querySelector('.saud')){t.insertAdjacentHTML('beforeend',`<div class="saud"><span class="ola">${ola.textContent}</span><b>${h.innerHTML}</b></div>`);ola.remove();h.remove()}
 const big=[...app.children].find(e=>e.matches&&e.matches('.card.big')),g=big&&big.nextElementSibling;
 if(big&&g&&g.classList.contains('grid')&&!app.querySelector('.home-hero')){const w=document.createElement('div');w.className='home-hero';big.parentNode.insertBefore(w,big);w.appendChild(big);[...g.children].forEach(c=>w.appendChild(c));g.remove()}
 const sec=[...app.querySelectorAll('h3.section')].find(e=>/Acesso rápido/.test(e.textContent));if(sec&&sec.nextElementSibling)sec.nextElementSibling.classList.add('acesso')}
{const a=render;render=function(){a();document.body.className=document.body.className.replace(/\bpg-\S+/g,'').trim();document.body.classList.add('pg-'+(ACC.session?page:'login'));
 if(ACC.session&&page==='home')arrumarInicio();
 document.querySelectorAll('#app .card').forEach(c=>{if(/Instale o MUSICALIS na tela inicial/.test((c.querySelector('h3')||{}).textContent||''))c.classList.add('inst-card')})}}
