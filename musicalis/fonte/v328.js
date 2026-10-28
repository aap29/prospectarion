/* ===================== V3.28 • VERSÃO WEB SEGURA =====================
   - licenças assinadas com chave pública (ECDSA P-256): o app só VERIFICA; nada secreto no código
   - acesso de Criador só no aparelho que tem a chave importada (não depende mais do e-mail)
   - link de ativação (#ativar=CÓDIGO) • migração do app antigo (#migrar=…) • instalação PWA */
let _tT=null;toast=function(t,ms){const x=$('#toast');x.textContent=t;x.classList.remove('hide');clearTimeout(_tT);_tT=setTimeout(()=>x.classList.add('hide'),ms||Math.min(6000,Math.max(1100,String(t).length*55)))};
const APP_URL='https://aap29.github.io/prospectarion/musicalis/app/';
const PUB_JWK=__PUB_JWK__;
const B32='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function b32(u8){let bits=0,v=0,o='';for(const b of u8){v=((v<<8)|b)&0xffff;bits+=8;while(bits>=5){o+=B32[(v>>>(bits-5))&31];bits-=5}}if(bits>0)o+=B32[(v<<(5-bits))&31];return o}
function unb32(s){let bits=0,v=0;const o=[];for(const c of s){const i=B32.indexOf(c);if(i<0)return null;v=((v<<5)|i)&0xffff;bits+=5;if(bits>=8){o.push((v>>>(bits-8))&255);bits-=8}}return new Uint8Array(o)}
let PUBK=null,PRIVK=null,KEY_OK=false,KEY_EMAILS=[];
const ECA={name:'ECDSA',hash:'SHA-256'};
async function pubKey(){return PUBK||(PUBK=await crypto.subtle.importKey('jwk',PUB_JWK,{name:'ECDSA',namedCurve:'P-256'},false,['verify']))}
async function sigOk(email,body,sig){const s=unb32(sig||'');if(!s||s.length!==64)return false;try{return await crypto.subtle.verify(ECA,await pubKey(),s,enc.encode(normEmail(email)+'|'+body))}catch(e){return false}}
async function assinar(email,body){if(!PRIVK)throw new Error('A chave do Criador não está neste aparelho');const s=await crypto.subtle.sign(ECA,PRIVK,enc.encode(normEmail(email)+'|'+body));return b32(new Uint8Array(s))}
const limpaCod=c=>(c||'').replace(/\s+/g,'').toUpperCase();
async function makeLicense(email,plan,months){const P={mensal:'M',trimestral:'T',semestral:'S',anual:'A',vitalicio:'V',escola:'E'}[plan];let d='000000';if(P!=='V'){const x=new Date();x.setMonth(x.getMonth()+(+months||({M:1,T:3,S:6,A:12,E:12}[P])));d=x.toISOString().slice(2,10).replace(/-/g,'')}
 const r=[...crypto.getRandomValues(new Uint8Array(4))].map(b=>B32[b%32]).join(''),body=P+d+'-'+r;return 'MUS2-'+body+'-'+await assinar(email,'L'+body)}
async function checkLicense(email,code){const m=/^MUS2-([MTSAVE])(\d{6})-([A-Z2-9]{4})-([A-Z2-9]{103})$/.exec(limpaCod(code));if(!m)return null;
 if(!await sigOk(email,'L'+m[1]+m[2]+'-'+m[3],m[4]))return null;const plan={M:'mensal',T:'trimestral',S:'semestral',A:'anual',V:'vitalicio',E:'escola'}[m[1]];
 const exp=m[1]==='V'?null:'20'+m[2].slice(0,2)+'-'+m[2].slice(2,4)+'-'+m[2].slice(4,6);if(exp&&new Date(exp+'T23:59:59')<new Date())return {expired:true};return {plan,exp}}
async function makeItemCode(email,id){const r=[...crypto.getRandomValues(new Uint8Array(4))].map(b=>B32[b%32]).join(''),body='P'+itemCode(id)+'-'+r;return 'MUP2-'+itemCode(id)+'-'+r+'-'+await assinar(email,body)}
async function checkItemCode(email,code){const m=/^MUP2-([A-Z2-9]{5})-([A-Z2-9]{4})-([A-Z2-9]{103})$/.exec(limpaCod(code));if(!m)return null;
 const it=CAT_F.find(c=>itemCode(c.id)===m[1]);if(!it)return null;if(!await sigOk(email,'P'+m[1]+'-'+m[2],m[3]))return null;return it.id}
async function licSig(){throw new Error('licSig antigo desativado')}

/* ---------- chave do Criador: guardada só neste aparelho (IndexedDB, não exportável) ---------- */
const KDB=()=>new Promise((ok,er)=>{const r=indexedDB.open('musicalis_criador',1);r.onupgradeneeded=()=>r.result.createObjectStore('k');r.onsuccess=()=>ok(r.result);r.onerror=()=>er(r.error)});
async function kGet(){const db=await KDB();return new Promise(ok=>{const q=db.transaction('k').objectStore('k').get('priv');q.onsuccess=()=>ok(q.result||null);q.onerror=()=>ok(null)})}
async function kPut(v){const db=await KDB();return new Promise((ok,er)=>{const tx=db.transaction('k','readwrite'),st=tx.objectStore('k');v?st.put(v,'priv'):st.delete('priv');tx.oncomplete=()=>ok();tx.onerror=()=>er(tx.error)})}
async function chaveConfere(k){try{const m=enc.encode('musicalis-teste-'+Date.now());const s=await crypto.subtle.sign(ECA,k,m);return await crypto.subtle.verify(ECA,await pubKey(),s,m)}catch(e){return false}}
isOwner=function(){return KEY_OK&&!!curUser()&&KEY_EMAILS.includes(ACC.session)};
{const a=enterSession;enterSession=function(e){const u=ACC.users[e];if(u){if(KEY_OK&&KEY_EMAILS.includes(e)){u.role='owner';u.plan='vitalicio';u.exp=null}else if(u.role==='owner'){u.role='aluno';u.plan='gratuito';u.exp=null}}return a(e)}}
async function carregarChave(){try{const v=await kGet(),k=v&&v.k;if(k&&await chaveConfere(k)){PRIVK=k;KEY_OK=true;KEY_EMAILS=v.emails||(v.email?[v.email]:[]);if(ACC.session&&ACC.users[ACC.session]&&ACC.users[ACC.session].role!=='owner')enterSession(ACC.session)}}catch(e){}window.__chaveLida=true}
function chave(){shell(`<div class="sub">CRIADOR</div><h1>Chave do Criador</h1>
 ${isOwner()?`<div class="card"><p>✅ Este aparelho tem a chave do Criador (conta ${KEY_EMAILS.join(', ')}). Você pode gerar códigos e links de ativação no Painel.</p><button class="btn gold" onclick="go('painel')">Abrir o Painel do Criador</button><button class="btn alt" onclick="tirarChave()">Remover a chave deste aparelho</button></div>`
 :`<div class="card"><p class="sub">Selecione o arquivo <b>MUSICALIS_CHAVE_CRIADOR.json</b> que você guardou. A chave fica só neste aparelho e o app não consegue copiá-la de volta.</p><label class="btn" style="display:block;text-align:center">Escolher o arquivo da chave<input type="file" accept=".json,application/json" hidden onchange="importarChave(this)"></label><p class="sub" id="lg-msg"></p></div>`}`)}
async function importarChave(inp){const f=inp.files&&inp.files[0];if(!f)return;try{const j=JSON.parse(await f.text()),jwk=Object.assign({},j.jwk||j);delete jwk.key_ops;delete jwk.ext;
 const k=await crypto.subtle.importKey('jwk',jwk,{name:'ECDSA',namedCurve:'P-256'},false,['sign']);if(!await chaveConfere(k)){lgMsg('Esta chave não é a do MUSICALIS.');return}
 await ativarCriador(k,ACC.session);toast('Chave instalada • acesso de Criador ativado');if(ACC.session)enterSession(ACC.session);page='chave';render()}catch(e){lgMsg('Arquivo de chave inválido.')}inp.value=''}
async function tirarChave(){try{await kPut(null)}catch(e){}PRIVK=null;KEY_OK=false;KEY_EMAILS=[];toast('Chave removida deste aparelho');if(ACC.session)enterSession(ACC.session);go('profile')}

/* ---------- acesso do Criador pelo e-mail + senha do Criador (em qualquer aparelho) ----------
   Os e-mails do Criador ficam só como "impressão digital" (hash). A chave fica num cofre criptografado
   (PBKDF2 600 mil rodadas + AES-256): só abre com a senha do Criador ou com o código de recuperação. */
const COFRE=__COFRE__;
const b64d=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function hashEmail(e){const h=await crypto.subtle.digest('SHA-256',enc.encode(normEmail(e)));return [...new Uint8Array(h)].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function ehCriadorEmail(e){try{return COFRE.emails_h.includes(await hashEmail(e))}catch(x){return false}}
async function abrirCofre(cf,senha){try{const base=await crypto.subtle.importKey('raw',enc.encode(senha),'PBKDF2',false,['deriveKey']);
 const ak=await crypto.subtle.deriveKey({name:'PBKDF2',salt:b64d(cf.s),iterations:cf.n,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['decrypt']);
 const pl=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64d(cf.i)},ak,b64d(cf.c));const ob=JSON.parse(new TextDecoder().decode(pl)),jwk=ob.jwk||ob;if(ob.tok){ACC.cfg.srvToken=ob.tok;saveAcc()}
 const k=await crypto.subtle.importKey('jwk',jwk,{name:'ECDSA',namedCurve:'P-256'},false,['sign']);return await chaveConfere(k)?k:null}catch(x){return null}}
async function ativarCriador(k,email){let v=null;try{v=await kGet()}catch(x){}const em=new Set((v&&(v.emails||(v.email?[v.email]:[])))||[]);em.add(email);
 KEY_EMAILS=[...em];await kPut({k,emails:KEY_EMAILS});PRIVK=k;KEY_OK=true}
async function contaCriador(e,p){let u=ACC.users[e];const salt=hex(crypto.getRandomValues(new Uint8Array(16))),hash=await pbkdf2(p,salt);
 if(!u)u=ACC.users[e]={created:hojeISO()};u.salt=salt;u.hash=hash;u.role='owner';u.plan='vitalicio';u.exp=null;if(!u.nome){u.nome='Kenny Anderson';u.name=u.nome;u.tel=u.tel||'(51) 98416-8848'}return u}
async function entrarCriador(e,p,via){const b=$('#lg-go');if(b){b.disabled=true;b.textContent='Verificando…'}lgMsg('Verificando o acesso de Criador…');
 let k=await abrirCofre(COFRE.senha,p.trim());
 if(!k){const u=ACC.users[e];let v=null;try{v=await kGet()}catch(x){}const temChave=v&&v.k&&(v.emails||[v.email]).includes(e);
  if(u&&temChave&&await pbkdf2(p,u.salt)===u.hash)k=v.k}
 if(!k){lgMsg('Este e-mail é do Criador. Digite a senha do Criador ou toque em "Esqueci a senha do Criador".');return}
 await ativarCriador(k,e);await contaCriador(e,p);rememberPick(e);saveAcc();toast('Bem-vindo, Criador! Acesso total liberado');enterSession(e)}
{const a=doLogin;doLogin=async function(){const e=normEmail(($('#lg-email')||{}).value||''),p=($('#lg-pass')||{}).value||'';if(await ehCriadorEmail(e))return entrarCriador(e,p);return a()}}
{const a=doSignup;doSignup=async function(){const e=normEmail(($('#lg-email')||{}).value||''),p=($('#lg-pass')||{}).value||'',p2=($('#lg-pass2')||{}).value||'';
 if(await ehCriadorEmail(e)){if(p2&&p!==p2){lgMsg('As senhas não conferem.');return}return entrarCriador(e,p)}return a()}}
{const a=login;login=function(){a();const m=$('#lg-msg');if(m&&!$('#lk-rec'))m.insertAdjacentHTML('afterend','<p class="tiny" style="text-align:center;margin:6px 0 0"><a id="lk-rec" href="#" onclick="page=\'recuperar\';render();return false" style="color:inherit">Esqueci a senha do Criador</a></p>')}}
function recuperar(){shell(`<div class="sub">CRIADOR</div><h1>Recuperar acesso de Criador</h1>
 <div class="card"><p class="sub">Use o <b>código de recuperação</b> que você guardou (5 grupos de letras e números). Depois escolha uma senha para entrar neste aparelho.</p>
 <label>E-mail do Criador</label><input class="field" id="rc-email" type="email" autocomplete="username" value="${ACC.lastEmail||''}">
 <label>Código de recuperação</label><input class="field" id="rc-cod" autocomplete="off" style="text-transform:uppercase" placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX">
 <label>Nova senha neste aparelho</label><input class="field" id="rc-pass" type="password" autocomplete="new-password" placeholder="mínimo 6 caracteres">
 <button class="btn gold" id="lg-go" onclick="fazerRecuperacao()">Recuperar acesso</button><p class="sub" id="lg-msg"></p>
 <p class="tiny">Também funciona: Perfil → toque 5 vezes em “Versão” → escolher o arquivo MUSICALIS_CHAVE_CRIADOR.json.</p></div>
 <button class="btn alt" onclick="page='login';authMode='entrar';render()">Voltar</button>`)}
async function fazerRecuperacao(){const e=normEmail($('#rc-email').value),c=($('#rc-cod').value||'').toUpperCase().replace(/[^A-Z0-9]/g,''),p=$('#rc-pass').value;
 if(!await ehCriadorEmail(e)){lgMsg('Este e-mail não é de Criador.');return}if(p.length<6){lgMsg('A nova senha precisa ter pelo menos 6 caracteres.');return}
 lgMsg('Verificando…');const k=await abrirCofre(COFRE.rec,c);if(!k){lgMsg('Código de recuperação incorreto.');return}
 await ativarCriador(k,e);await contaCriador(e,p);ACC.lastEmail=e;saveAcc();toast('Acesso de Criador recuperado neste aparelho');enterSession(e)}

/* ---------- códigos e links gerados no Painel ---------- */
const linkAtiv=c=>APP_URL+'#ativar='+c;
function caixaCodigo(code,linha,msg){return `<div class="card" style="margin-top:8px"><p class="tiny" style="margin:0 0 4px">${linha}</p><div class="field" style="user-select:all;word-break:break-all;font-size:12px">${linkAtiv(code)}</div><div class="row" style="gap:6px"><button class="btn" onclick="location.href='https://wa.me/?text='+encodeURIComponent(${JSON.stringify(msg).replace(/"/g,'&quot;')})">Enviar por WhatsApp</button><button class="btn alt" onclick="copyTxt(${JSON.stringify(linkAtiv(code)).replace(/"/g,'&quot;')})">Copiar link</button></div></div>`}
async function genCode(){const e=normEmail($('#sl-email').value),pl=$('#sl-plan').value;if(!validEmail(e)){toast('E-mail inválido');return}
 let code;try{code=await makeLicense(e,pl)}catch(x){toast(x.message);go('chave');return}ACC.cfg.sales.push({email:e,plan:pl,code,date:new Date().toLocaleDateString('pt-BR')});saveAcc();
 const msg=`Olá! Seu acesso ao MUSICALIS (${PLANOS[pl]}) está liberado 🎷\n\n1) Toque no link abaixo\n2) Entre (ou crie sua conta) com o e-mail ${e}\n3) Pronto: o plano é ativado sozinho\n\n${linkAtiv(code)}`;
 $('#sl-out').innerHTML=caixaCodigo(code,`${e} • ${PLANOS[pl]}`,msg)}
async function genItemCode(){const e=normEmail($('#pv-email').value),id=$('#pv-item').value,it=CAT_F.find(c=>c.id===id);if(!validEmail(e)){toast('E-mail inválido');return}
 let code;try{code=await makeItemCode(e,id)}catch(x){toast(x.message);go('chave');return}ACC.cfg.compras.push({email:e,id,code,date:new Date().toLocaleDateString('pt-BR')});saveAcc();
 const msg=`Olá! Sua partitura "${it.t} • ${it.tipo} ${it.formNome}" está liberada no MUSICALIS 🎷\n\n1) Toque no link abaixo\n2) Entre com o e-mail ${e}\n3) A partitura aparece liberada (3 downloads)\n\n${linkAtiv(code)}`;
 $('#pv-out').innerHTML=caixaCodigo(code,`${e} • ${it.t} • ${it.formNome}`,msg)}

/* ---------- ativação por link ou por código ---------- */
async function aplicarCodigo(code,silencioso){const v=limpaCod(code);const u=curUser();if(!u)return 'sem-conta';
 if(v.startsWith('MUP')){const id=await checkItemCode(ACC.session,v);if(!id)return 'invalido';u.compras=u.compras||{};if(!u.compras[id])u.compras[id]={data:hojeISO(),codigo:v};saveAcc();toast('Partitura liberada!');FMQ=id;go('item');return 'ok'}
 const r=await checkLicense(ACC.session,v);if(!r)return 'invalido';if(r.expired)return 'expirado';if(!u.bonusInst)u.bonusInst=instBonus(u);
 u.plan=r.plan;u.exp=r.exp;saveAcc();S.plan=PLANOS[r.plan];save();toast('Acesso liberado: '+PLANOS[r.plan]);go('study');return 'ok'}
doAtivar=async function(){const res=await aplicarCodigo($('#lic').value);
 if(res==='invalido')lgMsg('Código inválido para o e-mail '+ACC.session+'. Confira se você entrou com o mesmo e-mail da compra.');else if(res==='expirado')lgMsg('Este código já expirou.')};
const PEND_K='musicalis_ativar_pendente';
function lerHash(){const h=decodeURIComponent(location.hash||'');let m;
 if((m=/^#ativar=(.+)$/.exec(h))){try{localStorage.setItem(PEND_K,m[1])}catch(e){}history.replaceState(null,'',location.pathname+location.search)}
 else if((m=/^#migrar=(.+)$/.exec(h))){window.__migrar=m[1];history.replaceState(null,'',location.pathname+location.search)}
 else if(h==='#criador'){window.__irChave=true;history.replaceState(null,'',location.pathname+location.search)}}
async function tentarPendente(){let c=null;try{c=localStorage.getItem(PEND_K)}catch(e){}if(!c||!ACC.session||precisaCompletar())return;
 try{localStorage.removeItem(PEND_K)}catch(e){}const r=await aplicarCodigo(c);
 if(r==='invalido')toast('Este link de ativação é de outro e-mail. Entre com o e-mail usado na compra e toque no link de novo.',6000);else if(r==='expirado')toast('Este link de ativação já expirou.')}

/* ---------- migração do app antigo (APK) para a versão web ---------- */
function b64uEnc(t){return btoa(unescape(encodeURIComponent(t))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function b64uDec(t){t=t.replace(/-/g,'+').replace(/_/g,'/');while(t.length%4)t+='=';return decodeURIComponent(escape(atob(t)))}
function pacoteMigracao(){const u=curUser();if(!u)return null;const conta={email:ACC.session};['nome','name','tel','salt','hash','created','testeUsado'].forEach(k=>{if(u[k]!=null)conta[k]=u[k]});
 if(u.plan==='teste'){conta.plan='teste';conta.exp=u.exp}conta.planoAntigo=u.plan;return {musicalis_migrar:1,conta,backup:backupObj()}}
function receberMigracao(){const t=window.__migrar;if(!t)return;window.__migrar=null;let j;try{j=JSON.parse(b64uDec(t))}catch(e){toast('Não consegui ler o progresso do app antigo.');return}
 if(!j||!j.conta||!validEmail(j.conta.email||'')){toast('Dados do app antigo incompletos.');return}const e=normEmail(j.conta.email),c=j.conta;
 if(!ACC.users[e]){const u={role:'aluno',plan:'gratuito',exp:null};['nome','name','tel','salt','hash','created','testeUsado'].forEach(k=>{if(typeof c[k]==='string')u[k]=c[k]});
  if(!u.salt||!u.hash){toast('Conta do app antigo sem senha. Crie sua conta com o mesmo e-mail.');return}
  if(c.plan==='teste'&&c.exp){const lim=somaDias(DIAS_TESTE);u.plan='teste';u.exp=c.exp<lim?c.exp:lim}ACC.users[e]=u;saveAcc()}
 enterSession(e);try{if(j.backup){const r=mesclarProgresso(j.backup);toast(`Progresso trazido do app antigo: ${r.praticas} práticas, ${r.selos} selos ✅`,5000)}}catch(x){}
 const pago=c.planoAntigo&&!['gratuito','teste'].includes(c.planoAntigo);try{localStorage.setItem('musicalis_migrado',JSON.stringify({d:hojeISO(),pago:pago?c.planoAntigo:''}))}catch(x){}
 page='migrado';render()}
function migrado(){let m={};try{m=JSON.parse(localStorage.getItem('musicalis_migrado'))||{}}catch(e){}const u=curUser()||{};
 const msg=`Olá, Kenny! Passei para a nova versão do MUSICALIS.\nNome: ${u.nome||u.name||''}\nE-mail: ${ACC.session}\nMeu plano no app antigo: ${PLANOS[m.pago]||m.pago||'—'}\nPode me enviar o link de ativação?`;
 shell(`<div class="sub">NOVA VERSÃO</div><h1>Tudo certo! 🎷</h1><div class="card"><p>Seu progresso já está na nova versão. Agora falta só um passo:</p>
 <h3>Volte ao app antigo e toque em “Remover app antigo”</h3><p class="sub">O Android vai perguntar se você quer desinstalar. Toque em <b>OK</b>. Isso não apaga nada daqui.</p></div>
 ${m.pago?`<div class="card" style="border:2px solid #d39b1f"><h3>Você tinha o plano ${PLANOS[m.pago]||m.pago}</h3><p class="sub">Para sua segurança, os planos pagos são reativados com um link novo. Toque abaixo e o Kenny envia o seu.</p><button class="btn gold" onclick="location.href='https://wa.me/5551984168848?text='+encodeURIComponent(${JSON.stringify(msg).replace(/"/g,'&quot;')})">Pedir meu link de ativação</button></div>`:''}
 ${cardInstalar(true)}<button class="btn" onclick="go('home')">Começar a estudar</button>`)}

/* ---------- instalação (PWA) e aviso do app antigo na versão web ---------- */
const NATIVO=!!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform());
const STANDALONE=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const IOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const ANDROID=/Android/i.test(navigator.userAgent);
let INST_EV=null;addEventListener('beforeinstallprompt',e=>{e.preventDefault();INST_EV=e;if(['home','profile','welcome','migrado','instalar'].includes(page))render()});
addEventListener('appinstalled',()=>{INST_EV=null;toast('MUSICALIS instalado na tela inicial ✅')});
async function instalarPWA(){if(INST_EV){INST_EV.prompt();try{await INST_EV.userChoice}catch(e){}INST_EV=null;render();return}go('instalar')}
function cardInstalar(sempre){if(NATIVO||STANDALONE())return '';if(!sempre){try{if(localStorage.getItem('musicalis_inst_ok'))return ''}catch(e){}}
 return `<div class="card" style="border:2px solid #2e8b57"><h3>📲 Instale o MUSICALIS na tela inicial</h3><p class="sub">Abre como um app, funciona sem internet e é atualizado sozinho. Sem arquivo para baixar e sem aviso de perigo.</p><button class="btn" onclick="instalarPWA()">Instalar agora</button>${sempre?'':`<button class="btn alt" onclick="try{localStorage.setItem('musicalis_inst_ok','1')}catch(e){};render()">Agora não</button>`}</div>`}
function cardAppAntigo(){if(NATIVO||!ANDROID)return '';try{if(localStorage.getItem('musicalis_apk_ok'))return ''}catch(e){}
 return `<div class="card" style="border:2px solid #d39b1f"><h3>Você instalou o MUSICALIS pelo arquivo (APK) antes?</h3><p class="sub">Esta nova versão é mais segura e substitui o app antigo. Vamos levar seu progresso e remover o antigo com a sua autorização.</p><div class="row" style="gap:6px"><button class="btn gold" style="flex:1" onclick="go('migrar')">Sim, tenho</button><button class="btn alt" style="flex:1" onclick="try{localStorage.setItem('musicalis_apk_ok','nao')}catch(e){};render()">Não tenho</button></div></div>`}
function instalar(){const passos=IOS?`<ol class="sub" style="padding-left:20px;line-height:1.7"><li>Abra este endereço no <b>Safari</b></li><li>Toque no botão <b>Compartilhar</b> (quadrado com seta para cima)</li><li>Toque em <b>Adicionar à Tela de Início</b> e depois em <b>Adicionar</b></li></ol>`
 :`<ol class="sub" style="padding-left:20px;line-height:1.7"><li>Abra este endereço no <b>Google Chrome</b></li><li>Toque nos <b>três pontinhos ⋮</b> no canto de cima</li><li>Toque em <b>Instalar app</b> (ou <b>Adicionar à tela inicial</b>) e confirme</li></ol>`;
 shell(`<div class="sub">INSTALAR</div><h1>MUSICALIS na tela inicial</h1>${INST_EV?`<div class="card"><button class="btn" onclick="instalarPWA()">Instalar agora</button></div>`:''}<div class="card"><h3>${IOS?'iPhone e iPad':'Android, computador e tablet'}</h3>${passos}<p class="tiny">Endereço: ${APP_URL}</p><button class="btn alt" onclick="copyTxt('${APP_URL}')">Copiar endereço</button></div>
 <div class="card"><h3>🔒 Por que é seguro</h3><p class="sub">• Conexão criptografada (https) • nenhum arquivo instalado por fora da loja • seus dados de estudo ficam no seu aparelho • o app não pede acesso a fotos, contatos ou arquivos.</p></div><button class="btn alt" onclick="go('home')">Voltar</button>`)}
function migrar(){shell(`<div class="sub">TROCAR PELO APP NOVO</div><h1>Do app antigo para o novo</h1>
 <div class="card"><h3>1. Atualize o app antigo uma última vez</h3><p class="sub">Peça ao Kenny o arquivo <b>MUSICALIS de transição</b> (ele instala por cima do antigo, sem perder nada). Ao abrir, ele mostra dois botões:</p><p class="sub">• <b>Levar meu progresso</b>: abre esta versão já com suas práticas e selos.<br>• <b>Remover app antigo</b>: o Android pede a sua autorização para desinstalar.</p>
 <button class="btn gold" onclick="location.href='https://wa.me/5551984168848?text='+encodeURIComponent('Olá, Kenny! Tenho o app antigo do MUSICALIS e quero passar para a versão nova. Pode me enviar o arquivo de transição?')">Pedir o arquivo de transição</button></div>
 <div class="card"><h3>Ou faça à mão (2 minutos)</h3><ol class="sub" style="padding-left:20px;line-height:1.7"><li>No app antigo: <b>Perfil → Backup → Copiar meu backup</b></li><li>Aqui: cole no campo abaixo e toque em <b>Colar backup</b></li><li>Remova o antigo: toque e segure o ícone <b>M</b> → <b>Desinstalar</b> → <b>OK</b></li></ol>
 <textarea class="field" id="bk-txt" rows="3" placeholder="Cole aqui o backup copiado do app antigo"></textarea><button class="btn alt" onclick="${ACC.session?'colarBackup()':"toast('Entre ou crie sua conta primeiro')"}">Colar backup</button>
 <p class="tiny">Por segurança, nenhum site consegue apagar apps do seu celular: só você pode confirmar a desinstalação.</p></div>
 <button class="btn alt" onclick="try{localStorage.setItem('musicalis_apk_ok','feito')}catch(e){};go('home')">Já fiz, voltar</button>`)}

/* ---------- APK de transição (somente dentro do app antigo) ---------- */
const DESINST=()=>NATIVO&&window.Capacitor.Plugins&&window.Capacitor.Plugins.Desinstalar;
function transicao(){const p=pacoteMigracao();shell(`<div class="sub">AVISO IMPORTANTE</div><h1>O MUSICALIS mudou 🎷</h1>
 <div class="card"><p>Agora o MUSICALIS funciona direto pelo navegador, <b>mais seguro</b> e sempre atualizado. Este app antigo será substituído.</p></div>
 <div class="card"><h3>1. Levar meu progresso</h3><p class="sub">Abre a nova versão já com sua conta${p?' ('+ACC.session+')':''}, suas práticas e selos.</p><button class="btn gold" onclick="levarProgresso()">Levar meu progresso</button></div>
 <div class="card"><h3>2. Remover app antigo</h3><p class="sub">O Android vai pedir a sua autorização. Toque em <b>OK</b> para desinstalar. Faça isso depois do passo 1.</p><button class="btn" onclick="removerAntigo()">Remover app antigo</button></div>
 <p class="tiny" style="text-align:center">Dúvidas? WhatsApp (51) 98416-8848</p>`)}
function abrirNoNavegador(url){const D=DESINST();if(D&&D.abrir)return D.abrir({url});location.href=url}
function levarProgresso(){const p=pacoteMigracao();let url=APP_URL;if(p){const t=b64uEnc(JSON.stringify(p));if(t.length<400000)url+='#migrar='+t;else{copiarBackup();toast('Progresso copiado. Na nova versão, cole em Perfil → Backup.',6000)}}
 try{localStorage.setItem('musicalis_levou','1')}catch(e){}abrirNoNavegador(url)}
async function removerAntigo(){let levou=false;try{levou=!!localStorage.getItem('musicalis_levou')}catch(e){}if(!levou&&ACC.session&&!confirmaSemProgresso())return;
 const D=DESINST();if(D&&D.pedir){try{await D.pedir()}catch(e){toast('Não abriu. Toque e segure o ícone M → Desinstalar.')}}else toast('Toque e segure o ícone M → Desinstalar.')}
let _avisoSemProg=false;function confirmaSemProgresso(){if(_avisoSemProg)return true;_avisoSemProg=true;toast('Faça primeiro o passo 1 para não perder seu progresso. Toque de novo para remover mesmo assim.',6000);return false}

/* ---------- roteamento das páginas novas ---------- */
{const a=render;render=function(){
 if(NATIVO){if(page==='login'||!ACC.session){a();inserirTopo(`<div class="card" style="border:2px solid #d39b1f"><b>O MUSICALIS mudou para a versão web.</b><p class="sub">Entre na sua conta para levar seu progresso, ou remova este app.</p><button class="btn" onclick="removerAntigo()">Remover app antigo</button></div>`);return}transicao();nav();return}
 if(window.__irChave&&ACC.session&&!precisaCompletar()){window.__irChave=false;page='chave'}
 const P={chave,migrar,migrado,instalar,recuperar};if(P[page]){if(!ACC.session&&!['instalar','recuperar'].includes(page)){page='login';a();return}P[page]();nav();return}
 a();if(['home','profile','welcome'].includes(page)&&ACC.session&&document.querySelector('#app .top'))inserirTopo((page==='welcome'?'':cardAppAntigo())+cardInstalar(page!=='home'));
 if(page==='login'&&!ACC.session&&!NATIVO&&!STANDALONE()){const f=document.querySelector('#app');if(f&&!f.querySelector('.inst-mini'))f.insertAdjacentHTML('beforeend',`<div class="card inst-mini" style="border:2px solid #2e8b57;margin-top:10px"><b>📲 Depois de entrar, instale o MUSICALIS na tela inicial</b><p class="tiny">Fica com ícone no celular, abre como app e funciona sem internet.</p><button class="btn alt" onclick="instalarPWA()">Como instalar</button></div>`)}
 if(page==='profile'&&ACC.session){const v=[...document.querySelectorAll('#app p')].find(p=>/Versão \d/.test(p.textContent));if(v){let n=0;v.onclick=()=>{if(++n>=5){n=0;go('chave')}}}}
 setTimeout(tentarPendente,50)}}
function inserirTopo(h){if(!h)return;const t=document.querySelector('#app .top');if(t)t.insertAdjacentHTML('afterend',h)}

/* ---------- segurança: escapar dados de leads vindos da planilha ---------- */
const semTag=v=>typeof v==='string'?v.replace(/[<>"'`]/g,''):v;
{const a=carregarLeads;carregarLeads=async function(){await a();if(AL.lista)AL.lista=AL.lista.map(l=>{const o={};Object.keys(l).forEach(k=>o[k]=semTag(l[k]));return o})}}

/* ---------- partida ---------- */
lerHash();
if('serviceWorker' in navigator&&!NATIVO&&(location.protocol==='https:'||location.hostname==='localhost'))addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
carregarChave().then(()=>{receberMigracao();render()});

/* ---------- partitura acompanha a nota tocada (rola sozinha, sem tirar as mãos do sax) ---------- */
let _ultNota=null;
setInterval(()=>{const sc=document.querySelector('.score-screen');if(!sc)return;const n=sc.querySelector('.note-active');if(!n||n===_ultNota)return;_ultNota=n;
 const r=n.getBoundingClientRect(),R=sc.getBoundingClientRect(),m=58;
 const dentro=r.top>=R.top+m&&r.bottom<=R.bottom-m&&r.left>=R.left+8&&r.right<=R.right-8;
 if(!dentro){try{n.scrollIntoView({block:'center',inline:'nearest',behavior:'smooth'})}catch(e){n.scrollIntoView()}}},200);
