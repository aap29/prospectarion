/* ===================== V3.45 • GUARDIÃO DOS ASSINANTES: 1 APARELHO PESSOAL POR ASSINANTE =====================
   - cada aparelho ganha um ID aleatório (não é dado pessoal; fica só neste navegador) e a planilha guarda qual é o aparelho do titular
   - em outro aparelho, as funções pagas ficam bloqueadas; o titular passa o acesso com um código enviado ao SEU e-mail (1 troca a cada 30 dias)
   - o professor vê os aparelhos e as tentativas no Painel e pode liberar uma troca
   - entrada e saída de cada acesso vão para a planilha */
const APAR_K='musicalis_aparelho';
function aparelhoId(){let v=null;try{v=localStorage.getItem(APAR_K)}catch(e){}
 if(!/^[a-f0-9]{32}$/.test(v||'')){v=[...crypto.getRandomValues(new Uint8Array(16))].map(b=>b.toString(16).padStart(2,'0')).join('');try{localStorage.setItem(APAR_K,v)}catch(e){}}return v}
function aparelhoDescr(){const u=navigator.userAgent||'',so=/iPad|Macintosh.*Mobile/.test(u)||(/Macintosh/.test(u)&&navigator.maxTouchPoints>1)?'iPad':/iPhone/.test(u)?'iPhone':/Android/.test(u)?'Android':/Windows/.test(u)?'Windows':/Mac OS X/.test(u)?'Mac':/CrOS/.test(u)?'Chromebook':/Linux/.test(u)?'Linux':'Aparelho';
 const nav=/Edg\//.test(u)?'Edge':/SamsungBrowser/.test(u)?'Samsung Internet':/Firefox\//.test(u)?'Firefox':/Chrome\//.test(u)?'Chrome':/Safari\//.test(u)?'Safari':'navegador';
 const tipo=Math.min(screen.width,screen.height)>=600?(so==='Android'||so==='iPad'?'tablet':'computador'):'celular';return `${so} • ${nav} • ${tipo}`}
const aparelhoVale=()=>{const u=curUser();return !!u&&!isOwner()&&!(typeof jzCriador==='function'&&jzCriador())&&(PAGOS.includes(u.plan)||u.plan==='teste')};
let _aparT=0;
async function verificarAparelho(forcar){const u=curUser();if(!u||!srvUrl()||!aparelhoVale())return;if(!forcar&&Date.now()-_aparT<6*3600e3&&u.apar&&u.apar.st==='ok')return;_aparT=Date.now();
 let j;try{j=await chamarSrv('POST',null,{acao:'aparelho',email:ACC.session,aparelho:aparelhoId(),descricao:aparelhoDescr(),plano:u.plan},15000)}catch(e){return}   // sem internet ou planilha antiga: mantém o último estado
 if(!j||!j.status)return;const antes=u.apar&&u.apar.st;
 if(j.status==='ok')u.apar={st:'ok',ts:Date.now()};else if(j.status==='outro')u.apar={st:'outro',ts:Date.now(),reg:limpaTxt(j.registrado,80),desde:limpaTxt(j.desde,10)};else return;
 saveAcc();if(antes!==u.apar.st)render()}
const aparBloq=()=>{const u=curUser();return !!u&&aparelhoVale()&&u.apar&&u.apar.st==='outro'};
{const a=planActive;planActive=function(){if(aparBloq())return false;return a()}}
let APAR_ETAPA='';
function cardAparelho(){if(!aparBloq())return '';const u=curUser();
 return `<div class="card" id="apar-card" style="border:2px solid #d62828"><b style="font-size:18px">📱 Seu acesso está registrado em outro aparelho</b>
 <p class="sub" style="margin:6px 0">O MUSICALIS é de uso pessoal: o plano funciona em <b>um aparelho do titular</b>. Registrado: <b>${u.apar.reg||'outro aparelho'}</b>${u.apar.desde?' (desde '+brData(u.apar.desde)+')':''}. Neste aparelho as funções pagas ficam pausadas.</p>
 ${APAR_ETAPA==='codigo'?`<p class="sub" style="margin:6px 0">Enviamos um código de 6 números para <b>${ACC.session}</b>. Digite aqui:</p><input class="field" id="apar-cod" inputmode="numeric" maxlength="6" placeholder="000000"><button class="btn" onclick="aparConfirmar()">Confirmar e usar neste aparelho</button>`
  :`<button class="btn gold" onclick="aparPedirCodigo()">Usar neste aparelho (código no meu e-mail)</button>`}
 <a class="btn alt" style="text-decoration:none;display:flex;justify-content:center" href="https://wa.me/5551984168848?text=${encodeURIComponent('Olá, Kenny! Preciso trocar o aparelho do meu MUSICALIS. Meu e-mail: '+ACC.session)}" target="_blank" rel="noopener">Falar com o professor</a>
 <p class="tiny" style="margin:6px 0 0">A troca pelo e-mail pode ser feita 1 vez a cada 30 dias. O aparelho antigo perde o acesso.</p></div>`}
async function aparPedirCodigo(){let j;try{j=await chamarSrv('POST',null,{acao:'aparelho_codigo',email:ACC.session,aparelho:aparelhoId(),descricao:aparelhoDescr()},20000)}catch(e){toast('Sem conexão. Tente de novo.');return}
 if(j.status==='enviado'){APAR_ETAPA='codigo';toast('Código enviado para o seu e-mail',4000);render()}
 else if(j.status==='limite')toast('Você já trocou de aparelho nos últimos 30 dias. Fale com o professor.',6000);
 else if(j.status==='muitos')toast('Muitos pedidos hoje. Tente amanhã ou fale com o professor.',6000);
 else if(j.status==='livre'){_aparT=0;verificarAparelho(true)}}
async function aparConfirmar(){const c=(($('#apar-cod')||{}).value||'').replace(/\D/g,'');if(c.length!==6){toast('Digite os 6 números');return}
 let j;try{j=await chamarSrv('POST',null,{acao:'aparelho_trocar',email:ACC.session,aparelho:aparelhoId(),codigo:c},20000)}catch(e){toast('Sem conexão. Tente de novo.');return}
 if(j.status==='ok'){APAR_ETAPA='';const u=curUser();u.apar={st:'ok',ts:Date.now()};saveAcc();toast('Pronto! Este é o seu aparelho agora 🎷',4000);render()}
 else if(j.status==='expirado'){APAR_ETAPA='';toast('O código expirou. Peça outro.',5000);render()}else toast('Código incorreto')}
function cardMeuAparelho(){const u=curUser();if(!u||!aparelhoVale()||!u.apar||u.apar.st!=='ok')return '';
 return `<div class="card" id="meu-apar"><h3>📱 Meu aparelho</h3><p class="sub" style="margin:0">Seu plano está registrado neste aparelho: <b>${aparelhoDescr()}</b>. O acesso é pessoal e funciona em um aparelho do titular; para trocar, use a opção que aparece no novo aparelho.</p></div>`}
/* Painel do Criador: aparelhos e tentativas */
let APAR_LISTA=null;
async function aparCarregar(){if(!ACC.cfg.srvToken){toast('Informe o token do criador na planilha (Painel → Configurações)');return}
 try{const j=await chamarSrv('GET',{acao:'aparelhos',token:ACC.cfg.srvToken},null,25000);APAR_LISTA=j.aparelhos||[]}catch(e){APAR_LISTA=[];toast('Não consegui ler os aparelhos: '+e.message,5000)}render()}
async function aparLiberar(email){try{await chamarSrv('POST',null,{acao:'aparelho_liberar',email,token:ACC.cfg.srvToken},20000);toast('Troca liberada para '+email);aparCarregar()}catch(e){toast('Não consegui liberar: '+e.message,5000)}}
function cardAparelhosPainel(){const L=APAR_LISTA;const lin=x=>`<tr><td>${limpaTxt(x.email,60)}${x.tentativas7d?` <b style="color:#ff6b6b">• ${x.tentativas7d} tentativa(s)</b>`:''}</td><td>${limpaTxt(x.descricao,60)}</td><td>${x.status==='ativo'?'✅ ativo':'—'}</td><td>${limpaTxt(x.ultimoAcesso,12)}</td><td>${x.status==='ativo'?`<button class="btn alt" style="margin:0;min-height:40px;padding:6px 10px" onclick="aparLiberar('${limpaTxt(x.email,120)}')">Liberar troca</button>`:''}</td></tr>`;
 return `<div class="card" id="card-aparelhos"><h3>📱 Aparelhos dos assinantes</h3><p class="sub">Cada assinante usa o plano em um aparelho pessoal. Tentativas em outro aparelho podem ser troca de celular ou senha compartilhada.</p>
 ${L?(L.length?`<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:14px"><tr><th align="left">E-mail</th><th align="left">Aparelho</th><th align="left">Status</th><th align="left">Último acesso</th><th></th></tr>${L.map(lin).join('')}</table></div>`:'<p class="sub">Nenhum aparelho registrado ainda.</p>'):''}
 <button class="btn" onclick="aparCarregar()">${L?'Atualizar lista':'Ver aparelhos'}</button></div>`}
/* entrada e saída */
{const a=enterSession;enterSession=function(e){const r=a(e);try{if(ACC.users[e]&&ACC.users[e].role!=='owner')registrar('acesso',{evento:'entrada',aparelho:aparelhoDescr()})}catch(x){}setTimeout(()=>verificarAparelho(true),800);return r}}
{const a=logout;logout=function(){try{if(curUser()&&!isOwner())registrar('acesso',{evento:'saida',aparelho:aparelhoDescr()})}catch(x){}APAR_ETAPA='';return a()}}
addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')verificarAparelho(false)});
setTimeout(()=>verificarAparelho(true),1500);
/* telas */
{const a=render;render=function(){a();if(!ACC.session)return;
 if(aparBloq()&&!document.getElementById('apar-card')&&!document.querySelector('.score-screen')){const h=cardAparelho();if(h)inserirTopo(h)}
 if(page==='profile'&&!document.getElementById('meu-apar')){const f=document.getElementById('card-perfil-pro');const h=cardMeuAparelho();if(f&&h)f.insertAdjacentHTML('afterend',h)}
 if(page==='painel'&&isOwner()&&!document.getElementById('card-aparelhos')){const c=document.getElementById('card-especial')||document.querySelector('#app .card');c&&c.insertAdjacentHTML('afterend',cardAparelhosPainel())}}}
