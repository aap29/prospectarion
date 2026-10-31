/* ===================== V3.35 • BOTÃO DE ATUALIZAÇÃO + PLANO PARCELADO + CONDIÇÕES ESPECIAIS =====================
   1) quando há versão nova: botão "🔔 Atualização disponível" no canto superior; um toque e o app se atualiza
   2) plano "Vitalício parcelado": vale até a data da próxima parcela; avisa antes, no dia e depois;
      em atraso, as funções pagas ficam bloqueadas até o pagamento (o progresso fica guardado)
   3) Painel do Criador: gerador de condição especial (link de ativação com data de vencimento) */

/* ---------- 1. ATUALIZAÇÃO COM BOTÃO ---------- */
let _T0=Date.now(),NOVA_VERSAO=null;
checarAtualizacao=async function(){if(NATIVO||!/^https?:/.test(location.protocol)||navigator.onLine===false)return;
 try{const r=await fetch('versao.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)return;const j=await r.json();
  if(navigator.serviceWorker)navigator.serviceWorker.getRegistration().then(g=>g&&g.update()).catch(()=>{});
  if(verNum(j.v)>verNum(APP_VERSAO)){NOVA_VERSAO=limpaTxt(j.v,10);let tentou=false;try{tentou=sessionStorage.getItem('musicalis_tentou')===j.v}catch(e){}
   if(!tentou&&Date.now()-_T0<20000&&podeRecarregar()){aplicarAtualizacao(NOVA_VERSAO);return}   // ao abrir o app: já atualiza
   botaoAtualizacao()}}catch(e){}};
ATUALIZAR_PENDENTE=null;
function botaoAtualizacao(){if(!NOVA_VERSAO)return;const t=document.querySelector('#app .top');
 if(t){if(!t.querySelector('.upd-auto')){const b=document.createElement('button');b.className='upd-auto';b.innerHTML='🔔 <b>Atualização disponível</b><span>toque para atualizar</span>';b.onclick=atualizarAgora;const alvo=t.querySelector('.badge');alvo?t.insertBefore(b,alvo):t.appendChild(b)}return}
 if(!document.getElementById('upd-flut')){const b=document.createElement('button');b.id='upd-flut';b.className='upd-auto flut';b.innerHTML='🔔 <b>Atualizar</b>';b.onclick=atualizarAgora;document.body.appendChild(b)}}
async function atualizarAgora(){if(!podeRecarregar()&&!confirmarSaida())return;toast('Baixando a atualização '+(NOVA_VERSAO||'')+'…',3000);
 try{const g=navigator.serviceWorker&&await navigator.serviceWorker.getRegistration();if(g){await g.update()}}catch(e){}
 try{sessionStorage.setItem('musicalis_atualizado',NOVA_VERSAO||'');sessionStorage.removeItem('musicalis_tentou')}catch(e){}setTimeout(()=>location.reload(),700)}
let _confSaida=false;function confirmarSaida(){if(_confSaida)return true;_confSaida=true;toast('Pare a música e toque de novo para atualizar.',4000);return false}

/* ---------- 2. PLANO PARCELADO ---------- */
PLANOS.parcelado='Vitalício (parcelado)';
if(typeof PAGOS!=='undefined'&&!PAGOS.includes('parcelado'))PAGOS.push('parcelado');
{const a=planActive;planActive=function(){const u=curUser();if(u&&!isOwner()&&u.plan==='parcelado')return !!u.exp&&diasPara(u.exp)>=0;return a()}}
const PIX_ESPECIAL='https://aap29.github.io/prospectarion/musicalis/vitalicio-especial/';
function botoesPagar(){const u=curUser()||{},n=encodeURIComponent(primeiroNome(u.nome||'')||'');
 const wa='https://wa.me/5551984168848?text='+encodeURIComponent(`Olá, Kenny! Aqui é ${u.nome||''} (${ACC.session}). Paguei a parcela do MUSICALIS Vitalício. Segue o comprovante:`);
 return `<a class="btn gold" style="text-decoration:none;display:flex;justify-content:center" href="${PIX_ESPECIAL}?n=${n}" target="_blank" rel="noopener">Pagar a parcela no Pix</a><a class="btn alt" style="text-decoration:none;display:flex;justify-content:center" href="${wa}" target="_blank" rel="noopener">Já paguei: enviar comprovante</a>`}
function avisoParcelado(){const u=curUser();if(!u||isOwner()||u.plan!=='parcelado'||!u.exp)return '';const d=diasPara(u.exp),dt=brData(u.exp);
 if(d<0){if(u.avisoAtraso!==u.exp){u.avisoAtraso=u.exp;saveAcc();registrar('pagamento',{situacao:'parcela_em_atraso',vencimento:u.exp})}
  return `<div class="card aviso-plano forte" style="border:2px solid #d62828"><p style="margin:0 0 4px;font-size:17px">⚠️ <b>Parcela em atraso</b> desde ${dt}.</p><p class="tiny" style="margin:0 0 8px;font-size:14px">As funções pagas do MUSICALIS foram <b>bloqueadas</b> até o pagamento. Seu progresso está guardado e tudo volta assim que a parcela for paga.</p>${botoesPagar()}</div>`}
 if(d<=2)return `<div class="card aviso-plano forte" style="border:2px solid #d39b1f"><p style="margin:0 0 4px;font-size:17px">⏳ Sua parcela vence ${d===0?'<b>hoje</b>':`em <b>${d} ${d>1?'dias':'dia'}</b>`} (${dt}).</p><p class="tiny" style="margin:0 0 8px;font-size:14px">Pague até a data para manter o seu plano <b>Vitalício</b> funcionando sem interrupção.</p>${botoesPagar()}</div>`;
 return `<div class="card" style="border:1px solid #2e5b8a"><p style="margin:0;font-size:14.5px">🎷 <b>Vitalício (parcelado)</b> • próxima parcela até <b>${dt}</b>.</p></div>`}
{const a=avisoPlano;avisoPlano=function(){const u=curUser();if(u&&u.plan==='parcelado'&&!isOwner())return avisoParcelado();return a()}}

/* ---------- 3. PAINEL: GERADOR DE CONDIÇÃO ESPECIAL ---------- */
function cardEspecial(){return `<div class="card" id="card-especial" style="border:2px solid #d39b1f"><h3>⭐ Condição especial (parcelado)</h3>
 <p class="sub">Libera o app até a data da próxima parcela. Se a parcela não for paga, as funções pagas são bloqueadas sozinhas e o aluno é avisado. Quando ele pagar tudo, gere o <b>Vitalício</b> no item 1.</p>
 <label>E-mail do aluno</label><input class="field" id="ce-email" type="email" placeholder="email@do.aluno">
 <label>Nome do aluno</label><input class="field" id="ce-nome" placeholder="Nome e sobrenome">
 <label>Acesso liberado até (data da próxima parcela)</label><input class="field" id="ce-data" type="date">
 <label>Valor da parcela</label><input class="field" id="ce-valor" placeholder="R$ 500,00" value="R$ 500,00">
 <button class="btn gold" onclick="gerarEspecial()">Gerar link de acesso especial</button><div id="ce-out"></div></div>`}
async function gerarEspecial(){const e=normEmail($('#ce-email').value),n=limpaTxt($('#ce-nome').value,80),dt=$('#ce-data').value,v=limpaTxt($('#ce-valor').value,20);
 if(!validEmail(e)){toast('E-mail inválido');return}if(!/^\d{4}-\d{2}-\d{2}$/.test(dt)||diasPara(dt)<0){toast('Escolha uma data futura');return}
 let code;try{code=await makeLicense(e,'parcelado',0,dt)}catch(x){toast(x.message);go('chave');return}
 ACC.cfg.sales=ACC.cfg.sales||[];ACC.cfg.sales.push({email:e,plan:'parcelado',code,ate:dt,date:new Date().toLocaleDateString('pt-BR')});saveAcc();
 const pn=primeiroNome(n)||'',link=linkAtiv(code),pix=PIX_ESPECIAL+'?n='+encodeURIComponent(pn);
 const msg=`Olá, ${pn}! 🎷 Obrigado por fazer parte do MUSICALIS.\n\nSeu acesso especial está liberado até ${brData(dt)}, data da próxima parcela (${v}).\n\n1) Toque no link abaixo\n2) Entre com o e-mail ${e}\n3) Pronto: o plano é ativado sozinho\n\n${link}\n\nPara pagar a próxima parcela no Pix:\n${pix}\n\nImportante: se a parcela não for paga até ${brData(dt)}, as funções pagas do app ficam bloqueadas até o pagamento. Quitando tudo, seu plano vira Vitalício.\n\nKenny Anderson • MUSICALIS\nWhatsApp (51) 98416-8848`;
 $('#ce-out').innerHTML=caixaCodigo(code,`${e} • Vitalício parcelado até ${brData(dt)}`,msg)}
{const a=painel;painel=function(){a();const c=document.querySelector('#sl-out');const card=c&&c.closest('.card');if(card&&!document.getElementById('card-especial'))card.insertAdjacentHTML('afterend',cardEspecial())}}

/* ---------- telas ---------- */
{const a=render;render=function(){a();botaoAtualizacao()}}
