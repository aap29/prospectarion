/* ===================== V3.36 • PERFIL DO SAXOFONISTA, BOAS-VINDAS, ORIENTADOR E VINHETA =====================
   1) topo: logo + MUSICALIS à esquerda; foto, nome e instrumento do aluno à direita (toque abre o Perfil)
   2) foto do perfil: o aluno troca quando quiser (fica só no aparelho, reduzida)
   3) boas-vindas + questionário do saxofonista antes do teste de nível; link #inscrito=PLANO depois do pagamento
   4) orientador: depois de tocar, aponta compasso, nota, entrada adiantada/atrasada e andamento; convida a repetir
      e, de vez em quando, recapitula o tema que o aluno mais precisa
   5) vinheta de jazz ao abrir o app (pode desligar no Perfil) */

/* ---------- 1. TOPO ---------- */
const SAX4=['Alto','Soprano','Tenor','Barítono'];
const perfilDe=()=>{const u=curUser();return (u&&u.perfil)||null};
const iniciais=n=>String(n||'').trim().split(/\s+/).filter(Boolean).slice(0,2).map(p=>p[0]).join('').toUpperCase()||'🎷';
function nomeTopo(){const p=perfilDe(),u=curUser()||{};const n=(p&&p.artistico)||u.nome||S.name||'';const w=String(n).trim().split(/\s+/);return limpaTxt(p&&p.artistico?n:w.slice(0,2).join(' '),28)}
function fotoHtml(cls){const u=curUser()||{};const f=typeof u.foto==='string'&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(u.foto)?u.foto:'';
 return `<span class="${cls||'av'}">${f?`<img src="${f}" alt="">`:iniciais(u.nome||S.name)}</span>`}
function avatarTopo(){if(!ACC.session||!curUser())return '';const ins=isOwner()?'Professor':limpaTxt(S.instrument||'',20);
 return `<button class="avatar-top" onclick="go('profile')" aria-label="Meu perfil">${fotoHtml('av')}<b>${nomeTopo()||'Meu perfil'}</b><small>${ins}</small></button>`}
function decorarTopo(){const t=document.querySelector('#app .top');if(!t||t.classList.contains('top2'))return;t.classList.add('top2');
 const b=t.querySelector('.brand');if(b){const w=document.createElement('div');w.className='brand2';w.innerHTML='<img class="logo" src="icone-192.png" alt="">';b.parentNode.insertBefore(w,b);w.appendChild(b)}
 t.insertAdjacentHTML('beforeend',avatarTopo())}
{const a=shell;shell=function(c){a(c);decorarTopo()}}

/* ---------- 2. FOTO DO PERFIL ---------- */
function escolherFoto(){const i=document.createElement('input');i.type='file';i.accept='image/*';i.onchange=()=>{const f=i.files&&i.files[0];if(f)salvarFoto(f)};i.click()}
function salvarFoto(file){if(!/^image\//.test(file.type)){toast('Escolha uma imagem');return}if(file.size>15e6){toast('Imagem grande demais');return}
 const url=URL.createObjectURL(file),img=new Image();img.onload=()=>{const L=256,c=document.createElement('canvas');c.width=c.height=L;const g=c.getContext('2d'),s=Math.min(img.width,img.height);
  g.drawImage(img,(img.width-s)/2,(img.height-s)/2,s,s,0,0,L,L);URL.revokeObjectURL(url);const u=curUser();if(!u)return;u.foto=c.toDataURL('image/jpeg',.82);saveAcc();toast('Foto atualizada');render()};
 img.onerror=()=>{URL.revokeObjectURL(url);toast('Não consegui abrir essa imagem')};img.src=url}
function removerFoto(){const u=curUser();if(!u)return;delete u.foto;saveAcc();render()}
function cardPerfilPro(){const u=curUser()||{},p=perfilDe();
 const L=(r,v)=>v?`<p style="margin:4px 0"><b>${r}:</b> ${limpaTxt(v,120)}</p>`:'';
 return `<div class="card" id="card-perfil-pro"><div style="display:flex;gap:14px;align-items:center">${fotoHtml('av av-g')}<div><h3 style="margin:0">${limpaTxt((p&&p.artistico)||u.nome||S.name,60)}</h3><div class="tiny">${limpaTxt(S.instrument||'',20)}${p&&p.artistico&&u.nome?' • '+limpaTxt(u.nome,60):''}</div></div></div>
 <div class="row" style="gap:8px;margin-top:10px"><button class="btn alt" style="flex:1;margin-top:0" onclick="escolherFoto()">📸 ${u.foto?'Trocar foto':'Colocar foto'}</button>${u.foto?'<button class="btn alt" style="flex:0 0 auto;width:auto;margin-top:0" onclick="removerFoto()">Remover</button>':''}</div>
 ${p?`<div style="margin-top:10px">${L('Saxofones que toca',(p.saxes||[]).join(', '))}${L('Estuda',p.principal?'Sax '+p.principal:'')}${L('Experiência',expTexto(p))}${L('Rede social',p.rede)}${L('Idade',p.idade?p.idade+' anos':'')}${L('Cidade',(u.cidade||'')+(u.uf?'/'+u.uf:''))}</div>`:'<p class="sub" style="margin-top:10px">Complete seu perfil de saxofonista para o app recomendar os exercícios certos para você.</p>'}
 <button class="btn ${p?'alt':''}" onclick="go('perfilq')">${p?'Editar meus dados':'Completar meu perfil'}</button></div>`}

/* ---------- 3. QUESTIONÁRIO DO SAXOFONISTA ---------- */
const SITU={toca:'Já toco',iniciante:'Sou iniciante',nao:'Ainda não toco'};
const TEMPOS={'1-2':'de 1 a 2 anos','2-3':'de 2 a 3 anos','3-5':'de 3 a 5 anos','5+':'mais de 5 anos',pro:'profissional da área'};
const expTexto=p=>p?(p.situacao==='toca'?'Toca '+(TEMPOS[p.tempo]||''):SITU[p.situacao]||''):'';
const nivelDoPerfil=p=>p.situacao==='toca'&&['2-3','3-5','5+','pro'].includes(p.tempo)?'Intermediário':'Básico';
const PLANO_INSCRITO_K='musicalis_inscrito',PLANOS_INSC=['mensal','trimestral','semestral','anual','vitalicio'];
const inscritoPlano=()=>{try{const v=localStorage.getItem(PLANO_INSCRITO_K);return PLANOS_INSC.includes(v)?v:null}catch(e){return null}};
function perfilQ(primeira){const u=curUser()||{},p=perfilDe()||{},ins=(S.instrument||'').replace(/^Sax /,''),pl=inscritoPlano();
 const chk=(n,v,on,t)=>`<label class="opq"><input type="${t}" name="${n}" value="${v}" ${on?'checked':''}> <span>${t==='radio'&&n==='q-sit'?({toca:'1',iniciante:'2',nao:'3'}[v])+' • ':''}${n==='q-tempo'?TEMPOS[v]:n==='q-sit'?SITU[v]:'Sax '+v}</span></label>`;
 const princ=p.principal||(primeira?'':(SAX4.includes(ins)?ins:''));
 shell(`<section style="padding-top:${primeira?'3vh':'0'}">
 ${primeira?`<div class="card boasv"><div style="font-size:34px">🎷</div><h1 style="margin:4px 0">Bem-vind${/a$/i.test(primeiroNome(u.nome||'')||'')?'a':'o'} ao MUSICALIS, ${limpaTxt(primeiroNome(u.nome||S.name||'')||'saxofonista',30)}!</h1>
  ${pl?`<p style="margin:6px 0"><b>Recebemos a sua adesão ao plano ${PLANOS[pl]||pl}.</b> Assim que o pagamento for confirmado, o professor libera o seu acesso completo. Enquanto isso, você já pode começar.</p>`:''}
  <p class="sub" style="margin:6px 0">Antes de começar, 3 passos rápidos:</p><ol class="passos"><li><b>Complete seu perfil</b> de saxofonista (1 minuto)</li><li><b>Faça o teste de nível</b>: teoria e prática</li><li>O MUSICALIS monta o <b>seu caminho de estudo</b> no saxofone que você escolher</li></ol></div>`
 :`<div class="sub">PERFIL</div><h1>Meus dados de saxofonista</h1>`}
 <div class="card" id="perfilq"><h3>1. Seus dados</h3>
 <label>Nome completo</label><input class="field" id="q-nome" autocomplete="name" value="${limpaTxt(u.nome||'',120)}" placeholder="Nome e sobrenome">
 <label>Nome artístico de saxofonista <span class="tiny">(opcional)</span></label><input class="field" id="q-art" value="${limpaTxt(p.artistico||'',40)}" placeholder="Ex.: Kenny Anderson">
 <h3 style="margin-top:16px">2. Quais saxofones você toca?</h3><div class="opqs">${SAX4.map(s=>chk('q-saxes',s,(p.saxes||[]).includes(s),'checkbox')).join('')}</div>
 <p class="tiny">O app vai recomendar exercícios só para o saxofone que você escolher para estudar.</p>
 <h3 style="margin-top:16px">3. Qual saxofone você vai estudar?</h3><div class="opqs">${SAX4.map(s=>chk('q-princ',s,princ===s,'radio')).join('')}</div>
 <h3 style="margin-top:16px">4. Você já toca?</h3><div class="opqs col">${Object.keys(SITU).map(v=>chk('q-sit',v,p.situacao===v,'radio')).join('')}</div>
 <div id="q-tempo-box" style="${p.situacao==='toca'?'':'display:none'}"><h3 style="margin-top:16px">Há quanto tempo você toca?</h3><div class="opqs col">${Object.keys(TEMPOS).map(v=>chk('q-tempo',v,p.tempo===v,'radio')).join('')}</div></div>
 <h3 style="margin-top:16px">5. Contato e localização</h3>
 <label>Rede social <span class="tiny">(Instagram, YouTube…)</span></label><input class="field" id="q-rede" value="${limpaTxt(p.rede||'',80)}" placeholder="@seuperfil">
 <label>E-mail</label><input class="field" id="q-email" type="email" value="${limpaTxt(p.email||ACC.session||'',120)}">
 <label>Idade</label><input class="field" id="q-idade" type="number" inputmode="numeric" min="5" max="100" value="${p.idade||''}" placeholder="Ex.: 34">
 ${camposLocal(u.cidade,u.uf)}
 <input type="hidden" id="nm"><input type="hidden" id="ins">
 <button class="btn ${primeira?'gold':''}" id="q-go" onclick="salvarPerfilQ(${primeira?1:0})">${primeira?'Salvar e ir para o teste de nível →':'Salvar meus dados'}</button><p class="sub" id="q-msg" style="min-height:18px;color:#ffb4a8"></p></div></section>`);
 document.querySelectorAll('input[name=q-sit]').forEach(r=>r.onchange=()=>{$('#q-tempo-box').style.display=r.value==='toca'&&r.checked?'':'none'})}
function salvarPerfilQ(primeira){const val=n=>(document.querySelector(`input[name=${n}]:checked`)||{}).value||'',msg=t=>{$('#q-msg').textContent=t;return false};
 const nome=limpaTxt($('#q-nome').value,120),art=limpaTxt($('#q-art').value,40),saxes=[...document.querySelectorAll('input[name=q-saxes]:checked')].map(i=>i.value).filter(s=>SAX4.includes(s));
 const principal=val('q-princ'),sit=val('q-sit'),tempo=val('q-tempo'),rede=limpaTxt($('#q-rede').value,80),email=normEmail($('#q-email').value),idade=parseInt($('#q-idade').value,10),cid=$('#lg-cid').value,uf=$('#lg-uf').value;
 if(nome.split(' ').filter(w=>w.length>1).length<2)return msg('Digite seu nome completo (nome e sobrenome).');
 if(!SAX4.includes(principal))return msg('Escolha o saxofone que você vai estudar.');
 if(!SITU[sit])return msg('Responda se você já toca.');
 if(sit==='toca'&&!TEMPOS[tempo])return msg('Diga há quanto tempo você toca.');
 if(email&&!validEmail(email))return msg('Confira o e-mail.');
 if(!(idade>=5&&idade<=100))return msg('Digite sua idade.');
 if(!cidOk(cid))return msg('Digite a sua cidade.');if(!ufOk(uf))return msg('Escolha o seu estado.');
 if(!saxes.includes(principal))saxes.push(principal);
 const u=curUser();if(!u)return;const p={artistico:art,saxes,principal,situacao:sit,tempo:sit==='toca'?tempo:'',rede,email:email||ACC.session,idade,data:hojeISO()};
 u.perfil=p;u.nome=nome;u.cidade=limpaTxt(cid,60);u.uf=uf;saveAcc();S.perfil=p;S.instrument='Sax '+principal;S.name=art||nome;save();
 enviarLead('perfil_completo');toast('Perfil salvo');
 if(primeira&&S.theory==null){$('#nm').value=S.name;$('#ins').value=S.instrument;start(nivelDoPerfil(p));return}go('profile')}
welcome=function(){perfilQ(true)};
/* quem já usava o app: lembrete para completar o perfil no Início */
function cardCompletarPerfil(){if(isOwner()||perfilDe())return '';return `<div class="card" style="border:2px solid #ff922e"><b>🎷 Complete seu perfil de saxofonista</b><p class="sub" style="margin:4px 0">Diga quais saxofones você toca e qual vai estudar. O app passa a recomendar exercícios só para ele.</p><button class="btn gold" onclick="go('perfilq')">Completar agora (1 minuto)</button></div>`}

/* link depois do pagamento: …/app/#inscrito=anual */
(()=>{const m=/^#inscrito(?:=([a-z]+))?$/.exec(location.hash||'');if(!m)return;const pl=PLANOS_INSC.includes(m[1])?m[1]:'';
 try{localStorage.setItem(PLANO_INSCRITO_K,pl||'mensal')}catch(e){}window.__inscrito=true;history.replaceState(null,'',location.pathname+location.search);
 if(!ACC.session){authMode='criar';page='login'}})();
function avisoInscrito(){const pl=inscritoPlano();if(!pl)return;const u=curUser();
 if(u&&!u.inscritoEnviado&&!isOwner()){u.inscritoEnviado=pl;saveAcc();registrar('pagamento',{situacao:'inscrito_apos_pagamento',plano:pl});enviarLead('inscrito_'+pl)}}
/* depois do link de ativação, quem é novo continua nas boas-vindas */
{const a=aplicarCodigo;aplicarCodigo=async function(c,s){const novo=S&&S.theory==null&&!isOwner();const r=await a(c,s);if(r==='ok'&&novo&&!perfilDe()){page='welcome';render()}return r}}

/* ---------- 4. ORIENTADOR: ritmo, andamento e revisão ---------- */
{const a=ouvAvaliar;ouvAvaliar=function(){const R=a();try{const fl=meterState.flat||[],seg=60/S.bpm*1000,lat=90,sx=saxSemis(),tard=Math.max(170,seg*.33),cedo=Math.max(140,seg*.25),dts=[];
 R.itens.forEach(r=>{if(r.tipo!=='ok')return;const e=fl[r.i],ant=fl[r.i-1];if(!e||OUV.on[r.i]==null||(ant&&!ant.rest&&ant.p===e.p))return;const T=OUV.on[r.i]+lat;
  const f=OUV.frames.find(f=>f.t>=T-seg*.45&&f.t<=T+e.d*seg*.7&&Math.abs(f.m+sx-e.p)<.5);if(!f)return;const dt=Math.round(f.t-T);r.dt=dt;dts.push({i:r.i,dt});
  if(dt>tard)r.tempo='atrasado';else if(dt<-cedo)r.tempo='adiantado'});
 let tend=null;if(dts.length>=6){const k=Math.floor(dts.length/3),m=v=>v.reduce((s,x)=>s+x.dt,0)/v.length,d=m(dts.slice(-k))-m(dts.slice(0,k));if(d>seg*.22)tend='atrasou';else if(d<-seg*.22)tend='acelerou'}
 R.ritmo={atrasado:R.itens.filter(r=>r.tempo==='atrasado').length,adiantado:R.itens.filter(r=>r.tempo==='adiantado').length,tendencia:tend,medidas:dts.length}}catch(e){R.ritmo={atrasado:0,adiantado:0,tendencia:null,medidas:0}}
 return R}}
const TEMA_ERRO={acidente:['Intermediário I2','acidentes e armaduras de clave'],oitava:['Intermediário I1','as regiões do saxofone e o ponto de aumento'],nota:['Básico B4','leitura de notas na pauta'],silencio:['Básico B3','pausas e entradas'],tempo:['Básico B2','pulsação e valores das figuras']};
function conselhoOrientador(R){const it=R.itens,c=[],grupo=(f)=>[...new Set(it.filter(f).map(r=>r.m+1))].slice(0,4),lista=v=>v.length>1?v.slice(0,-1).join(', ')+' e '+v[v.length-1]:String(v[0]);
 const pior=it.find(r=>r.tipo==='acidente')||it.find(r=>r.tipo==='nota')||it.find(r=>r.tipo==='oitava');
 if(pior)c.push(`Volte ao <b>compasso ${pior.m+1}</b>: o <b>${pior.esperado}</b> ${pior.tipo==='acidente'?`saiu ${pior.tocado} (${pior.dica})`:pior.tipo==='oitava'?'saiu na oitava errada: confira a posição e o ponto de aumento':`saiu ${pior.tocado}: confira a digitação antes de tocar`}.`);
 const r=R.ritmo||{},atr=grupo(x=>x.tempo==='atrasado'),adi=grupo(x=>x.tempo==='adiantado');
 if(atr.length)c.push(`Você entrou <b>atrasado</b> no${atr.length>1?'s compassos':' compasso'} <b>${lista(atr)}</b>: prepare a respiração e a digitação um tempo antes.`);
 if(adi.length)c.push(`Você <b>adiantou</b> a entrada no${adi.length>1?'s compassos':' compasso'} <b>${lista(adi)}</b>: espere o tempo certo, contando junto com o metrônomo.`);
 if(r.tendencia==='acelerou')c.push('O <b>andamento acelerou</b> no fim do exercício: mantenha o pulso firme até o último compasso.');
 if(r.tendencia==='atrasou')c.push('O <b>andamento foi caindo</b> no fim: mantenha o ar e a pulsação até o final.');
 const sil=grupo(x=>x.tipo==='silencio');if(sil.length&&!pior)c.push(`Não ouvi as notas do${sil.length>1?'s compassos':' compasso'} <b>${lista(sil)}</b>: toque mais perto do celular ou confira as pausas.`);
 if(!c.length)c.push(R.precisao>=95?'Execução limpa, com notas e tempos no lugar. Suba 5 BPM e toque de novo!':'Muito bem. Repita mais uma vez para firmar a leitura.');
 return c.slice(0,3)}
function guardarRecap(R){S.recap=S.recap||{};const q=S.recap;Object.keys(TEMA_ERRO).forEach(k=>q[k]=Math.round((q[k]||0)*.85*10)/10);
 Object.entries(R.erros||{}).forEach(([k,v])=>{if(q[k]!=null)q[k]+=Math.min(v,4)});const rt=R.ritmo||{};q.tempo+=Math.min((rt.atrasado||0)+(rt.adiantado||0),4)+(rt.tendencia?2:0);save()}
ouvPainel=function(R){document.getElementById('ouv-res')?.remove();const ruins=R.itens.filter(r=>r.tipo!=='ok').slice(0,8);
 const txt=r=>`<li>Compasso ${r.m+1}: ${r.tipo==='silencio'?`não ouvi o <b>${r.esperado}</b>`:r.tipo==='acidente'?`<b>${r.esperado}</b> → tocou ${r.tocado} (${r.dica})`:r.tipo==='oitava'?`<b>${r.esperado}</b> saiu uma oitava ${(r.tocado.match(/\d+$/)||[0])[0]>r.esperado.match(/\d+$/)[0]?'acima':'abaixo'}`:`<b>${r.esperado}</b> → tocou ${r.tocado}`}</li>`;
 const cons=conselhoOrientador(R),rt=R.ritmo||{},cor=R.precisao>=85?'#1f9d55':R.precisao>=60?'#d39b1f':'#d62828';guardarRecap(R);
 window.__orient={t:Date.now(),txt:cons.map(x=>x.replace(/<[^>]+>/g,'')).join(' ')};
 const temEx=typeof curEx!=='undefined'&&curEx&&curEx!=='diag'&&typeof restartEx==='function';
 document.body.insertAdjacentHTML('beforeend',`<div id="ouv-res" style="position:fixed;left:10px;right:10px;top:46px;z-index:950;max-width:520px;margin:0 auto;max-height:76vh;overflow:auto;background:#fff;color:#13202e;border:3px solid ${cor};border-radius:16px;padding:14px 16px;box-shadow:0 12px 34px #0009">
 <b style="font-size:18px">🎧 Ouvido do MUSICALIS: ${R.precisao}% de acerto</b><p style="margin:6px 0;font-size:14px">${R.ok} de ${R.total} notas certas${R.erros.acidente?` • ${R.erros.acidente} acidente(s)`:''}${R.erros.oitava?` • ${R.erros.oitava} oitava(s)`:''}${R.erros.nota?` • ${R.erros.nota} nota(s) errada(s)`:''}${R.erros.silencio?` • ${R.erros.silencio} não ouvida(s)`:''}${rt.atrasado||rt.adiantado?` • ${(rt.atrasado||0)+(rt.adiantado||0)} entrada(s) fora do tempo`:''}</p>
 <div class="orient"><b>🎓 Orientador</b><ul>${cons.map(x=>`<li>${x}</li>`).join('')}</ul></div>
 ${ruins.length?`<details ${ruins.length<=3?'open':''}><summary style="cursor:pointer;font-size:14px;margin:6px 0"><b>Notas para revisar</b> (em vermelho na partitura)</summary><ul style="margin:6px 0 8px 18px;padding:0;font-size:14px;line-height:1.5">${ruins.map(txt).join('')}</ul></details>`:'<p style="font-size:15px">Todas as notas certas. 🏆</p>'}
 ${temEx?`<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" style="flex:1;margin-top:6px" onclick="document.getElementById('ouv-res').remove();restartEx(0)">🔁 Tocar de novo</button><button class="btn alt" style="flex:1;margin-top:6px;color:#fff" onclick="document.getElementById('ouv-res').remove();restartEx(-10)">🐢 Mais devagar (−10 BPM)</button></div>`:''}
 <button class="btn alt" style="margin:6px 0 0;color:#fff" onclick="document.getElementById('ouv-res').remove()">Fechar</button></div>`)};
/* a voz do orientador também fala o conselho */
{const a=coachLong;coachLong=function(id){const t=a(id),o=window.__orient;return o&&Date.now()-o.t<8000?t+' '+o.txt:t}}
/* revisão: de vez em quando o orientador recapitula o tema que o aluno mais precisa */
function temaRevisao(){if(isOwner())return null;const q=S.recap||{};let best=null;Object.keys(TEMA_ERRO).forEach(k=>{if((q[k]||0)>=3&&(!best||q[k]>q[best]))best=k});
 const p=perfilDe();if(!best&&p&&S.theory!=null&&nivelDoPerfil(p)==='Intermediário'&&S.theory<70)return {k:'nivel',mod:'Básico B'+(1+new Date().getDate()%5),txt:'a base de teoria (o teste mostrou que vale reforçar antes de avançar)'};
 if(!best)return null;return {k:best,mod:TEMA_ERRO[best][0],txt:TEMA_ERRO[best][1]}}
function cardRevisao(){const t=temaRevisao();if(!t||typeof TEORIA==='undefined'||!TEORIA[t.mod])return '';const hoje=hojeISO();S.revVista=S.revVista||{};if(S.revVista[t.k]===hoje)return '';
 return `<div class="card" style="border:2px solid #61d7ff"><b>🎓 Revisão do orientador</b><p class="sub" style="margin:4px 0">${t.k==='nivel'?'O teste de nível mostrou que vale reforçar <b>a base de teoria</b> antes de avançar.':`Nas suas últimas práticas, o ponto que mais apareceu foi <b>${t.txt}</b>.`} Uma revisão rápida agora acelera sua evolução.</p>
 <button class="btn" onclick="S.revVista=S.revVista||{};S.revVista['${t.k}']=hojeISO();if(S.recap&&S.recap['${t.k}'])S.recap['${t.k}']=Math.round(S.recap['${t.k}']*.5);save();TMOD='${t.mod}';go('licao')">Revisar: ${TEORIA[t.mod].titulo}</button>
 <button class="btn alt" onclick="S.revVista=S.revVista||{};S.revVista['${t.k}']=hojeISO();save();render()">Agora não</button></div>`}

/* ---------- 5. VINHETA DE JAZZ AO ABRIR ---------- */
const hzM=m=>440*Math.pow(2,(m-69)/12);
function vinhetaOn(){return ACC.cfg.vinheta!==false}
function teclado(c,m,t,dur,g){const o=c.createOscillator(),o2=c.createOscillator(),v=c.createGain();o.type='sine';o2.type='triangle';o.frequency.value=hzM(m);o2.frequency.value=hzM(m)*2;
 v.gain.setValueAtTime(.0001,t);v.gain.exponentialRampToValueAtTime(g,t+.015);v.gain.exponentialRampToValueAtTime(.0001,t+dur);const v2=c.createGain();v2.gain.value=.18;
 o.connect(v);o2.connect(v2);v2.connect(v);v.connect(c.destination);o.start(t);o2.start(t);o.stop(t+dur+.05);o2.stop(t+dur+.05)}
function tocarVinheta(){try{const c=ctx();if(c.state!=='running')return false;const t0=c.currentTime+.06,b=.17;
 [[0,[50,53,57,60,64],.72],[.68,[43,53,59,64],.72],[1.36,[48,52,55,59,62],1.9]].forEach(([t,ns,d])=>ns.forEach((m,i)=>teclado(c,m,t0+t+i*.012,d,.03)));
 [[0,69],[1,72],[2,76],[3,79],[4,77],[5,76],[6,75],[7,74]].forEach(([k,m])=>saxSynth(hzM(m),b*1.05,.05,t0+k*b));
 saxSynth(hzM(71),.26,.05,t0+1.36);saxSynth(hzM(76),1.25,.055,t0+1.62);
 try{sessionStorage.setItem('musicalis_vinheta','1')}catch(e){}window.__vinhetaTocou=Date.now();return true}catch(e){return false}}
function vinhetaAbertura(){if(!vinhetaOn())return;try{if(sessionStorage.getItem('musicalis_vinheta'))return}catch(e){}
 const T0=Date.now();try{const c=ctx();if(c.state==='running'){tocarVinheta();return}c.resume&&c.resume().then(()=>{if(c.state==='running'&&!window.__vinhetaTocou)tocarVinheta()}).catch(()=>{})}catch(e){}
 const toque=()=>{removeEventListener('pointerdown',toque,true);if(window.__vinhetaTocou||Date.now()-T0>120000||document.querySelector('.score-screen,.extra-screen'))return;try{ctx().resume().then(()=>{if(!window.__vinhetaTocou)tocarVinheta()})}catch(e){}};
 addEventListener('pointerdown',toque,true)}
function cardVinheta(){return `<div class="card"><h3>🎺 Vinheta de abertura</h3><label style="display:flex;gap:10px;align-items:center"><input type="checkbox" ${vinhetaOn()?'checked':''} onchange="ACC.cfg.vinheta=this.checked;saveAcc()"> Tocar a frase de jazz ao abrir o app</label><button class="btn alt" onclick="ctx().resume().then(tocarVinheta)">▶ Ouvir a vinheta</button></div>`}

/* ---------- planilha recebe o perfil ---------- */
{const a=resumoAluno;resumoAluno=function(){const r=a(),p=perfilDe();if(p){Object.assign(r,{nomeArtistico:limpaTxt(p.artistico,40),saxofones:(p.saxes||[]).join(', '),saxPrincipal:p.principal||'',experiencia:expTexto(p),redeSocial:limpaTxt(p.rede,80),idade:p.idade||'',emailContato:p.email||''})}return r}}

/* ---------- telas ---------- */
{const a=render;render=function(){if(page==='perfilq'&&ACC.session){perfilQ(false);nav();return}a();if(!ACC.session){if(page==='login'&&inscritoPlano()&&!document.getElementById('insc-ban')){const s=document.querySelector('#app section')||document.querySelector('#app');const pl=inscritoPlano();
   s&&s.insertAdjacentHTML('afterbegin',`<div class="card boasv" id="insc-ban"><b style="font-size:18px">🎉 Obrigado por assinar o MUSICALIS!</b><p style="margin:6px 0">Plano escolhido: <b>${PLANOS[pl]||pl}</b>. Crie sua conta com <b>o mesmo e-mail usado na compra</b>; em seguida você completa seu perfil e faz o teste de nível.</p></div>`)}return}
 avisoInscrito();
 if(page==='welcome')document.querySelectorAll('#app > .card').forEach(c=>c.remove());
 if(page==='home'&&!isOwner()){const h=cardCompletarPerfil()+cardRevisao();if(h){const f=document.querySelector('#app .card');f?f.insertAdjacentHTML('beforebegin',h):inserirTopo(h)}}
 if(page==='profile'){const f=document.querySelector('#app .card');if(f&&!document.getElementById('card-perfil-pro')){f.insertAdjacentHTML('beforebegin',cardPerfilPro())}
  document.querySelectorAll('#app p').forEach(x=>{if(/null%/.test(x.textContent))x.innerHTML=x.innerHTML.replace(/null%/g,'—')});
  const vol=document.querySelector('.vol-range');const cv=vol&&vol.closest('.card');if(cv&&!document.getElementById('vinheta-card'))cv.insertAdjacentHTML('afterend',cardVinheta().replace('<div class="card">','<div class="card" id="vinheta-card">'))}}}
setTimeout(vinhetaAbertura,600);
