/* ===================== V3.46 • BOAS-VINDAS DE VOLTA, COMO UM AMIGO =====================
   - o app guarda o dia da última visita de cada aluno (S.ultVisita, só neste aparelho)
   - quem volta depois de 3 dias ou mais é recebido com uma mensagem de apoio, sem cobrança
   - de 3 a 7 dias: "senti sua falta"; 8 dias ou mais: "guardei tudo do jeitinho que você deixou"
   - quem está sem plano pago recebe o mesmo carinho e, no fim, um convite leve para os planos */
const hojeVolta=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const diasEntre=(a,b)=>Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/864e5);
let VOLTA=null;   // {dias, semPlano}
function voltaVale(){const u=curUser();return !!u&&!isOwner()&&!(typeof jzCriador==='function'&&jzCriador())&&S.theory!==null&&S.theory!==undefined}
function marcarVisita(){const u=curUser();if(!u)return;const h=hojeVolta(),ult=S.ultVisita;
 if(ult&&/^\d{4}-\d{2}-\d{2}$/.test(ult)&&voltaVale()){const d=diasEntre(ult,h);if(d>=3&&!VOLTA)VOLTA={dias:d}}
 if(ult!==h){S.ultVisita=h;save()}}
function semPlanoPago(){const u=curUser()||{};return !(PAGOS.includes(u.plan)&&planActive())}
function nomeAmigo(){const u=curUser()||{};return limpaTxt(primeiroNome(u.nome||S.name||''),30)||'saxofonista'}
function cardVolta(){if(!VOLTA)return '';const n=nomeAmigo(),d=VOLTA.dias,curto=d<=7,semPlano=semPlanoPago();
 const tit=curto?`Que bom te ver de novo, ${n}! 🎷`:`${n}, que alegria você voltar! 🎷`;
 const txt=curto
  ?`Senti sua falta por aqui. A vida corre, e tudo bem: o seu sax continua te esperando, e eu também.<br><br>Que tal só <b>10 minutinhos</b> hoje? Pode ser uma escala para soltar os dedos. Cada sopro conta na sua evolução.`
  :`Faz ${d} dias, e eu guardei tudo do jeitinho que você deixou: seu progresso, suas conquistas e o seu próximo passo.<br><br>Recomeçar também é evoluir. Sem pressa e sem cobrança: <b>um exercício de cada vez</b>, e eu sigo aqui do seu lado.`;
 const conv=semPlano?`<p class="sub" style="margin:10px 0 0">E quando quiser deixar tudo liberado de vez, os planos começam em <b>R$ 79,90</b>. Vou adorar continuar te acompanhando. 💛</p>`:'';
 return `<div class="volta-fundo" id="volta"><div class="card volta-card" role="dialog" aria-label="Boas-vindas de volta">
  <div class="volta-sax">🎷</div><h2 style="margin:6px 0 10px">${tit}</h2><p class="sub" style="margin:0;font-size:16px;line-height:1.5">${txt}</p>${conv}
  <button class="btn gold" onclick="voltaIr('study')">Tocar 10 minutinhos</button>
  <button class="btn alt" onclick="voltaIr('journey')">Ver onde parei</button>
  ${semPlano?`<button class="btn alt" onclick="voltaIr('plans')">Conhecer os planos</button>`:''}
  <p class="tiny" style="margin:10px 0 0;text-align:center">Com carinho, seu parceiro de estudos • MUSICALIS</p></div></div>`}
function voltaIr(p){try{registrar('acesso',{evento:'volta',dias:VOLTA&&VOLTA.dias,botao:p})}catch(e){}VOLTA=null;const el=document.getElementById('volta');el&&el.remove();go(p)}
function mostrarVolta(){if(VOLTA&&ACC.session&&!document.getElementById('volta')&&!['welcome','quiz','login','prova'].includes(page))document.body.insertAdjacentHTML('beforeend',cardVolta())}
{const a=enterSession;enterSession=function(e){const r=a(e);try{marcarVisita();mostrarVolta()}catch(x){}return r}}
addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&ACC.session){const antes=VOLTA;marcarVisita();if(!antes&&VOLTA)mostrarVolta()}});
setTimeout(()=>{if(ACC.session){marcarVisita();mostrarVolta()}},900);
{const a=render;render=function(){a();mostrarVolta()}}
