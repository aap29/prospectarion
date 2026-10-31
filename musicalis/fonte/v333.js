/* ===================== V3.33 • SOM, CADASTRO COMPLETO, FIM DO TESTE E SEGURANÇA =====================
   1) volume geral mais alto, com reforço e limitador (sem distorcer) + controle 🔊 na partitura e no Perfil
   2) cadastro pede cidade e estado (quem já usa completa uma vez)
   3) fim do teste de 3 dias: acesso parcial + escolha do plano
   4) segurança: plano pago só vale com código assinado; dados externos limpos; anti-iframe */

/* ---------- 1. VOLUME ---------- */
const _conectar=AudioNode.prototype.connect;
const volCfg=()=>{if(ACC.cfg.volume==null)ACC.cfg.volume=7;return ACC.cfg.volume};
const volGanho=v=>v<=0?0:Math.pow(v/10,1.5)*5;            // 10 → 5x • 7 → ~2,9x • 5 → ~1,8x (antes era 1x)
function volMontar(c){if(c.__mus)return c.__mus;const g=c.createGain(),k=c.createDynamicsCompressor();
 k.threshold.value=-14;k.knee.value=8;k.ratio.value=8;k.attack.value=0.002;k.release.value=0.18;   // limitador: mais alto sem estourar
 g.gain.value=volGanho(volCfg());_conectar.call(g,k);_conectar.call(k,c.destination);c.__mus={g,k};return c.__mus}
AudioNode.prototype.connect=function(dest,...r){try{const c=this.context;if(dest&&c&&dest===c.destination&&!(c.__mus&&this===c.__mus.k)&&!(window.OfflineAudioContext&&c instanceof OfflineAudioContext)){return _conectar.call(this,volMontar(c).g,...r)}}catch(e){}return _conectar.call(this,dest,...r)};
function volDefinir(v){v=Math.max(0,Math.min(10,Math.round(v)));ACC.cfg.volume=v;saveAcc();try{const c=typeof audioCtx!=='undefined'&&audioCtx;if(c&&c.__mus)c.__mus.g.gain.setTargetAtTime(volGanho(v),c.currentTime,0.04)}catch(e){}
 document.querySelectorAll('.vol-val').forEach(e=>e.textContent=v);document.querySelectorAll('.vol-range').forEach(e=>{if(+e.value!==v)e.value=v});document.querySelectorAll('.vol-btn').forEach(b=>b.textContent=v===0?'🔇':'🔊 '+v)}
function volTestar(){try{const c=ctx();c.resume&&c.resume();saxSynth(midiHz(67-saxSemis()),0.7,.038)}catch(e){}}
function volPainel(btn){let p=document.getElementById('vol-pop');if(p){p.remove();return}const r=btn.getBoundingClientRect();
 document.body.insertAdjacentHTML('beforeend',`<div id="vol-pop" style="position:fixed;z-index:995;top:${Math.round(r.bottom+6)}px;left:50%;transform:translateX(-50%);width:min(92vw,360px);background:#0f2238;color:#fff;border:2px solid #d39b1f;border-radius:16px;padding:12px 14px;box-shadow:0 12px 30px #000a">
 <div style="display:flex;align-items:center;gap:10px"><b style="flex:1">🔊 Volume: <span class="vol-val">${volCfg()}</span>/10</b><button onclick="document.getElementById('vol-pop').remove()" style="background:none;border:0;color:#fff;font-size:22px">✕</button></div>
 <div style="display:flex;align-items:center;gap:8px;margin-top:8px"><button class="btn alt" style="width:52px;margin:0;font-size:22px" onclick="volDefinir(volCfg()-1)">−</button>
 <input class="vol-range" type="range" min="0" max="10" step="1" value="${volCfg()}" oninput="volDefinir(+this.value)" style="flex:1;height:34px;accent-color:#d39b1f">
 <button class="btn alt" style="width:52px;margin:0;font-size:22px" onclick="volDefinir(volCfg()+1)">+</button></div>
 <p class="tiny" style="margin:8px 0 0;color:#c9d6e6">Dica: use 7 a 9 no alto-falante do celular; com fone, 4 a 6.</p></div>`)}
function volBotao(){const v=volCfg(),txt=v===0?'🔇':'🔊 '+v;
 const h=document.querySelector('.score-head');if(h&&!h.querySelector('.vol-btn')){const alvo=h.querySelector('.ouv-btn')||h.querySelector('.full-btn');const b=document.createElement('button');b.className='vol-btn';b.textContent=txt;b.onclick=()=>volPainel(b);alvo?h.insertBefore(b,alvo):h.appendChild(b)}
 const x=document.querySelector('.extra-screen>.row');if(x&&!x.querySelector('.vol-btn')){const b=document.createElement('button');b.className='btn alt vol-btn';b.style.cssText='width:auto;padding:8px 14px;margin:0';b.textContent=txt;b.onclick=()=>volPainel(b);x.appendChild(b)}}
function cardVolume(){return `<div class="card"><h3>🔊 Volume do som</h3><p class="sub">Som dos exercícios, partituras e metrônomo.</p>
 <div style="display:flex;align-items:center;gap:8px"><button class="btn alt" style="width:52px;margin:0;font-size:22px" onclick="volDefinir(volCfg()-1)">−</button><input class="vol-range" type="range" min="0" max="10" step="1" value="${volCfg()}" oninput="volDefinir(+this.value)" style="flex:1;height:34px;accent-color:#d39b1f"><button class="btn alt" style="width:52px;margin:0;font-size:22px" onclick="volDefinir(volCfg()+1)">+</button><b class="vol-val" style="min-width:24px;text-align:center">${volCfg()}</b></div>
 <button class="btn alt" onclick="volTestar()">▶ Testar o som</button></div>`}
{const a=openM2;openM2=function(id){a(id);volBotao()}}
['openEx','openMeterEx','openExtra'].forEach(n=>{if(typeof window[n]==='function'){const a=window[n];window[n]=function(...x){const r=a.apply(this,x);setTimeout(volBotao,0);return r}}});

/* ---------- 2. CADASTRO COM CIDADE E ESTADO ---------- */
const UFS=['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
const limpaTxt=(s,n)=>String(s==null?'':s).replace(/[<>"'`\\]/g,'').replace(/\s+/g,' ').trim().slice(0,n||120);
const camposLocal=(c,uf)=>`<label>Cidade</label><input class="field" id="lg-cid" autocomplete="address-level2" placeholder="Ex.: Porto Alegre" value="${limpaTxt(c,60)}">
 <label>Estado</label><select class="field" id="lg-uf" autocomplete="address-level1"><option value="">Escolha o estado</option>${UFS.map(x=>`<option ${x===uf?'selected':''}>${x}</option>`).join('')}</select>`;
const cidOk=c=>limpaTxt(c,60).length>=2,ufOk=u=>UFS.includes(u);
let NOVO_LOCAL=null;
{const a=doSignup;doSignup=async function(){const e=normEmail(($('#lg-email')||{}).value||'');
 if(!(await ehCriadorEmail(e))&&$('#lg-cid')){const c=$('#lg-cid').value,uf=$('#lg-uf').value;if(!cidOk(c)){lgMsg('Digite a sua cidade.');return}if(!ufOk(uf)){lgMsg('Escolha o seu estado.');return}NOVO_LOCAL={cidade:limpaTxt(c,60),uf}}
 try{return await a()}finally{NOVO_LOCAL=null}}}
{const a=enterSession;enterSession=function(e){const u=ACC.users[e];if(u&&NOVO_LOCAL&&!u.cidade){u.cidade=NOVO_LOCAL.cidade;u.uf=NOVO_LOCAL.uf;saveAcc()}return a(e)}}
precisaCompletar=function(){const u=curUser();return !!u&&u.role!=='owner'&&!isOwner()&&(!u.nome||!u.tel||!u.cidade||!u.uf)};
completar=function(){const u=curUser();$('#app').innerHTML=`<section style="padding-top:5vh"><div class="sub">ÚLTIMO PASSO</div><h1>Complete seu cadastro</h1>
 <p class="sub">Para continuar usando o MUSICALIS, confirme seus dados. É por eles que o professor acompanha seus estudos e avisa sobre o seu plano.</p>
 <div class="card">${CAMPOS_CAD(u.nome,u.tel)}${camposLocal(u.cidade,u.uf)}<label>E-mail</label><input class="field" value="${ACC.session}" disabled>
 <button class="btn" id="lg-go" onclick="salvarCompletar()">Salvar e continuar</button><p class="sub" id="lg-msg" style="min-height:18px"></p>
 ${u.plan==='gratuito'&&!u.testeUsado?'<p class="tiny">Ao completar, você ganha <b>3 dias grátis com acesso completo</b>.</p>':''}</div>
 <button class="btn alt" onclick="logout()">Sair da conta</button></section>`;$('#nav')&&$('#nav').classList.add('hide')};
{const a=salvarCompletar;salvarCompletar=function(){const c=($('#lg-cid')||{}).value||'',uf=($('#lg-uf')||{}).value||'';if(!cidOk(c)){lgMsg('Digite a sua cidade.');return}if(!ufOk(uf)){lgMsg('Escolha o seu estado.');return}
 const u=curUser();u.cidade=limpaTxt(c,60);u.uf=uf;u.nome=limpaTxt($('#lg-nome').value,120);saveAcc();return a()}}
{const a=resumoAluno;resumoAluno=function(){const r=a(),u=curUser()||{};r.cidade=u.cidade||'';r.estado=u.uf||'';r.nome=limpaTxt(r.nome,120);return r}}

/* ---------- 3. FIM DO TESTE: acesso parcial + escolha do plano ---------- */
const PLANOS_VENDA=[['mensal','Mensal','R$ 79,90','1 mês'],['trimestral','Trimestral','R$ 199,90','3 meses'],['semestral','Semestral','R$ 399,90','6 meses'],['anual','Anual','R$ 599,90','12 meses'],['vitalicio','Vitalício','R$ 990,90','para sempre']];
function cardEscolhaPlano(titulo,sub){const pr=ACC.cfg.prices||{},of=ofertaPara(curUser());
 return `<div class="card aviso-plano forte" style="border:2px solid #d39b1f"><p style="margin:0 0 4px;font-size:17px">${titulo}</p><p class="tiny" style="margin:0 0 10px;font-size:14px">${sub}</p>
 ${PLANOS_VENDA.map(([k,n,p,d],i)=>`<button class="btn ${k===of?'gold':'alt'}" style="display:flex;justify-content:space-between;align-items:center;margin:6px 0" onclick="buy('${k}')"><span><b>${String.fromCharCode(65+i)}) ${n}</b> <span class="tiny">• ${d}</span>${k===of?' ⭐':''}</span><b>${pr[k]||p}</b></button>`).join('')}
 <p class="tiny" style="margin:8px 0 0">Seu progresso está guardado. Os exercícios gratuitos continuam liberados.</p></div>`}
{const a=avisoPlano;avisoPlano=function(){const u=curUser();if(u&&!isOwner()&&u.plan==='teste'){const d=diasPara(u.exp);if(d!==null&&d<0)return cardEscolhaPlano('⏳ Seu teste grátis de 3 dias terminou.','Para continuar com <b>acesso completo</b>, adquira um dos planos:')}
 if(u&&!isOwner()&&u.plan&&!['gratuito','teste','vitalicio'].includes(u.plan)&&u.exp&&diasPara(u.exp)<0)return cardEscolhaPlano(`Seu plano venceu em <b>${brData(u.exp)}</b>.`,'Renove para voltar a ter acesso completo:');
 return a()}}

/* ---------- 4. SEGURANÇA ---------- */
/* 4a. o app não abre dentro de outro site (proteção contra páginas falsas que imitam o MUSICALIS) */
try{if(window.top!==window.self){document.documentElement.style.display='none';window.top.location=window.location.href}}catch(e){document.documentElement.style.display='none'}
/* 4b. plano pago só vale com código de ativação assinado pelo Criador (impede liberar plano mexendo no aparelho) */
const PAGOS=['mensal','trimestral','semestral','anual','vitalicio','escola'];
async function verificarPlano(){const u=curUser();if(!u||isOwner()||u.role==='owner')return;let mudou=false;
 if(PAGOS.includes(u.plan)){const r=u.lic?await checkLicense(ACC.session,u.lic):null;
  const valido=r&&(r.expired?(u.exp&&diasPara(u.exp)<0):(r.plan===u.plan&&(r.exp||null)===(u.exp||null)));
  if(!valido){if(r&&!r.expired&&r.plan){u.plan=r.plan;u.exp=r.exp}else{u.plan='gratuito';u.exp=null}mudou=true}}
 if(u.plan==='teste'){const lim=u.testeUsado?(()=>{const d=new Date(u.testeUsado+'T12:00:00');d.setDate(d.getDate()+DIAS_TESTE);return d.toISOString().slice(0,10)})():null;
  if(!lim){u.plan='gratuito';u.exp=null;mudou=true}else if(!u.exp||u.exp>lim){u.exp=lim;mudou=true}}
 if(u.compras){for(const [id,c] of Object.entries(u.compras)){if(!c||!c.codigo||!(await checkItemCode(ACC.session,c.codigo))){delete u.compras[id];mudou=true}}}
 if(mudou){saveAcc();S.plan=u.plan==='teste'?PLANOS.teste:(PLANOS[u.plan]||'Gratuito');save();render()}}
{const a=aplicarCodigo;aplicarCodigo=async function(code,s){const r=await a(code,s);if(r==='ok'){const u=curUser(),v=limpaCod(code);if(u&&v.startsWith('MUS2')){u.lic=v;saveAcc()}}return r}}
{const a=enterSession;enterSession=function(e){const r=a(e);setTimeout(verificarPlano,0);return r}}
/* 4c. dados que vêm de fora (planilha, links) são limpos antes de aparecer na tela */
function limparRemoto(){const R=ACC.cfg.remoto;if(!R)return;const P=R.pagamento||{};
 if(P.links)Object.keys(P.links).forEach(k=>{if(!/^https:\/\/[^\s"'<>]+$/.test(P.links[k]||''))delete P.links[k]});
 if(P.pix)P.pix=limpaTxt(P.pix,80);if(P.whatsapp)P.whatsapp=String(P.whatsapp).replace(/\D/g,'').slice(0,15);
 if(Array.isArray(R.versoes))R.versoes=R.versoes.map(v=>({v:limpaTxt(v.v,10),data:limpaTxt(v.data,10),notas:limpaTxt(v.notas,1500),apk:''}));R.apk='';saveAcc()}
{const a=sincronizar;sincronizar=async function(f){const r=await a(f);limparRemoto();return r}}
limparRemoto();
/* 4d. a versão web se atualiza sozinha: sem aviso de "baixar atualização" */
if(!NATIVO){novasVersoes=function(){return []};atualizacao=function(){shell(`<div class="sub">ATUALIZAÇÕES</div><h1>Seu app se atualiza sozinho</h1><div class="card"><p>Versão instalada: <b>${APP_VERSAO}</b></p><p class="sub">Sempre que houver melhorias, o MUSICALIS se atualiza automaticamente quando você abre o app. Não precisa baixar nada.</p><button class="btn alt" onclick="checarAtualizacao().then(()=>toast('Você está na versão mais recente'))">↻ Verificar agora</button></div>`)}}
/* 4e. migração do app antigo: só aceita texto limpo */
{const a=receberMigracao;receberMigracao=function(){try{if(window.__migrar){const j=JSON.parse(b64uDec(window.__migrar));if(j&&j.conta){['nome','name','tel','created','testeUsado'].forEach(k=>{if(j.conta[k]!=null)j.conta[k]=limpaTxt(j.conta[k],120)});window.__migrar=b64uEnc(JSON.stringify(j))}}}catch(e){window.__migrar=null}return a()}}

/* ---------- telas ---------- */
{const a=render;render=function(){a();if(!ACC.session)return;
 if(page==='login'&&authMode==='criar'&&$('#lg-tel')&&!$('#lg-cid'))$('#lg-tel').insertAdjacentHTML('afterend',camposLocal());
 if(page==='profile'&&!isOwner()){const alvo=[...document.querySelectorAll('#app .card')].find(c=>/Ouvido do MUSICALIS/.test(c.textContent));if(alvo&&!document.querySelector('.vol-range'))alvo.insertAdjacentHTML('beforebegin',cardVolume())}
 if(page==='profile'&&isOwner()){const f=document.querySelector('#app .card');if(f&&!document.querySelector('.vol-range'))f.insertAdjacentHTML('afterend',cardVolume())}
 volBotao()}}
{const a=login;login=function(){a();if(authMode==='criar'&&$('#lg-tel')&&!$('#lg-cid'))$('#lg-tel').insertAdjacentHTML('afterend',camposLocal())}}
/* confere o plano também ao abrir o app (não só no login) */
setTimeout(()=>{if(ACC.session)verificarPlano()},400);
