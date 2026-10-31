/* ===================== V3.30 • ACOMPANHAMENTO DO ALUNO + OUVIDO =====================
   1) registra tudo (cadastro, diagnóstico, exercícios, partituras, avaliação do teste, observações, ouvido)
      numa fila que nunca se perde e vai para a planilha do professor quando ela estiver ligada
   2) diagnóstico inicial real (teoria + teste prático pelo microfone) e nível recomendado
   3) aviso no último dia do teste • resumo semanal e mensal • lembrete de pausas • observações
   4) Ouvido do MUSICALIS: escuta o aluno tocando e aponta notas, oitavas e acidentes errados */

/* ---------- 1. registro de eventos ---------- */
function registrar(tipo,dados){try{const u=curUser();if(!u||isOwner())return;S.hist=S.hist||[];const ev={t:new Date().toISOString(),k:tipo};Object.assign(ev,dados||{});S.hist.push(ev);if(S.hist.length>3000)S.hist=S.hist.slice(-3000);save();
 ACC.fila.push(Object.assign({acao:'evento',tipo,quando:ev.t,detalhe:JSON.stringify(dados||{}).slice(0,1500)},resumoAluno()));if(ACC.fila.length>600)ACC.fila=ACC.fila.slice(-600);saveAcc();processarFila()}catch(e){}}
/* a fila não trava: erro do servidor descarta só aquele item; sem internet, espera */
processarFila=async function(){if(filaOcupada||!srvUrl()||!ACC.fila.length||navigator.onLine===false)return;filaOcupada=true;
 try{while(ACC.fila.length){const it=ACC.fila[0];let j;try{j=await chamarSrv('POST',null,it)}catch(e){if(/erro|inválid|desconhecida/i.test(e.message)&&!/abort|fetch|network|servidor/i.test(e.message)){ACC.fila.shift();saveAcc();continue}break}ACC.fila.shift();saveAcc();tratarResposta(it,j)}}finally{filaOcupada=false}};
{const a=resumoAluno;resumoAluno=function(){const r=a();try{const st=estatisticas(7),D=S.diag||{};Object.assign(r,{nivelRecomendado:D.rec||'',teoria:S.theory==null?'':S.theory,pratica:D.medido?D.pratica:'',
 exerciciosSemana:st.exercicios,minutosSemana:st.minutos,precisaoMedia:st.precisao==null?'':st.precisao,buscasPartituras:(S.hist||[]).filter(h=>h.k==='partitura').length,ouvidoModo:ouvCfg().modo})}catch(e){}return r}}

/* ---------- tempo de estudo e pausas ---------- */
let _ultToque=Date.now(),_contig=0,_pausaAvisada=false;['pointerdown','keydown','touchstart'].forEach(ev=>addEventListener(ev,()=>{_ultToque=Date.now()},{passive:true}));
const pausaCfg=()=>{S.pausa=S.pausa||{on:true,min:25};return S.pausa};
setInterval(()=>{if(!ACC.session||document.visibilityState!=='visible')return;const tocando=(typeof meterState!=='undefined'&&meterState.playing)||OUV.ouvindo;
 if(Date.now()-_ultToque>120000&&!tocando){if(Date.now()-_ultToque>300000){_contig=0;_pausaAvisada=false}return}
 const d=hojeISO();S.minDia=S.minDia||{};S.minDia[d]=(S.minDia[d]||0)+1;_contig++;save();
 const c=pausaCfg();if(c.on&&_contig>=c.min&&!_pausaAvisada&&!tocando){_pausaAvisada=true;mostrarPausa()}},60000);
function mostrarPausa(){document.getElementById('pausa-card')?.remove();document.body.insertAdjacentHTML('beforeend',`<div id="pausa-card" style="position:fixed;left:12px;right:12px;bottom:84px;z-index:900;max-width:480px;margin:0 auto;background:#0f2a4a;color:#fff;border:2px solid #d39b1f;border-radius:16px;padding:14px 16px;box-shadow:0 10px 30px #0008">
 <b style="font-size:17px">☕ Hora de uma pausa de 5 minutos</b><p style="margin:6px 0;font-size:14px;line-height:1.45">Você estudou ${_contig} minutos seguidos. Para render mais:<br>• <b>Olhos:</b> olhe para longe por 20 segundos<br>• <b>Músculos:</b> solte os ombros, o pescoço e os punhos<br>• <b>Boca e fôlego:</b> beba água e descanse a embocadura</p>
 <div style="display:flex;gap:8px"><button class="btn" style="flex:1;margin:0" onclick="_contig=0;_pausaAvisada=false;this.closest('#pausa-card').remove();toast('Boa pausa! 🎷')">Vou pausar</button><button class="btn alt" style="flex:1;margin:0" onclick="_contig=Math.max(0,_contig-10);_pausaAvisada=false;this.closest('#pausa-card').remove()">Mais 10 min</button></div></div>`)}

/* ---------- estatísticas e resumo ---------- */
function estatisticas(dias){const desde=Date.now()-dias*864e5,H=(S.hist||[]).filter(h=>Date.parse(h.t)>=desde);const ex=H.filter(h=>h.k==='exercicio'),ou=H.filter(h=>h.k==='ouvido'&&h.precisao!=null);
 const diasAtivos=new Set(H.map(h=>h.t.slice(0,10)));let minutos=0;Object.entries(S.minDia||{}).forEach(([d,m])=>{if(Date.parse(d+'T12:00:00')>=desde-432e5){minutos+=m;diasAtivos.add(d)}});
 const err={acidente:0,oitava:0,nota:0,silencio:0};ou.forEach(o=>Object.keys(err).forEach(k=>err[k]+=(o.erros&&o.erros[k])||0));
 return {dias:diasAtivos.size,minutos,exercicios:ex.length,distintos:new Set(ex.map(e=>e.id)).size,precisao:ou.length?Math.round(ou.reduce((s,o)=>s+o.precisao,0)/ou.length):null,ouvidas:ou.length,err,partituras:H.filter(h=>h.k==='partitura').length,bpmMax:ex.reduce((m,e)=>Math.max(m,e.bpm||0),0)}}
function recomendacoes(st,dias){const R=[],sem=dias<=7;
 if(st.exercicios===0)R.push(`🎯 Comece pelo exercício recomendado${S.diag&&S.diag.rec?' do módulo <b>'+S.diag.rec+'</b>':''}: 15 minutos já fazem diferença.`);
 else if(st.dias<(sem?3:10))R.push(`📅 Você estudou em ${st.dias} dia(s). O ideal é um pouco todo dia: 15 a 20 minutos rendem mais que 2 horas no fim de semana.`);
 else R.push(`👏 Ótima constância: ${st.dias} dias de estudo e ${st.exercicios} práticas. Continue assim!`);
 if(st.precisao!=null){if(st.precisao<70)R.push(`🐢 Sua precisão no Ouvido foi ${st.precisao}%. Diminua 10 BPM e repita devagar: primeiro certo, depois rápido.`);else if(st.precisao>=90)R.push(`🚀 Precisão de ${st.precisao}%! Suba 5 BPM ou avance para o próximo exercício.`);else R.push(`🎯 Precisão de ${st.precisao}%. Repita os trechos marcados em vermelho antes de subir o BPM.`)}
 else R.push('🎧 Ligue o Ouvido do MUSICALIS (Perfil) para o app conferir suas notas enquanto você toca.');
 if(st.err.acidente>=3)R.push(`♯♭ Você trocou ${st.err.acidente} acidentes. Antes de tocar, olhe a armadura e circule mentalmente os sustenidos e bemóis.`);
 if(st.err.oitava>=3)R.push(`🔁 ${st.err.oitava} notas saíram na oitava errada: confira a tecla de oitava e a pressão do ar.`);
 if(st.minutos/Math.max(1,st.dias)>60)R.push('⏸️ Você estuda bastante por dia. Faça pausas de 5 min a cada 25 min para não cansar a mente, os músculos e os olhos.');
 R.push('👀 Saúde: a cada 20 min olhe para longe por 20 s; alongue ombros, pescoço e punhos; beba água.');return R}
function blocoResumo(dias,titulo){const st=estatisticas(dias);return `<div class="card"><h3>${titulo}</h3>
 <div class="grid"><div class="card"><div class="score">${st.dias}</div><b>dias de estudo</b></div><div class="card"><div class="score">${st.minutos}</div><b>minutos</b></div><div class="card"><div class="score">${st.exercicios}</div><b>práticas</b></div><div class="card"><div class="score">${st.precisao==null?'—':st.precisao+'%'}</div><b>precisão no Ouvido</b></div></div>
 <p class="tiny">${st.distintos} exercícios diferentes • ${st.partituras} partituras abertas${st.bpmMax?' • maior BPM: '+st.bpmMax:''}</p>
 <h3 class="section">Recomendações</h3>${recomendacoes(st,dias).map(r=>`<p class="sub" style="margin:6px 0">${r}</p>`).join('')}</div>`}
function resumo(){shell(`<div class="sub">MEU ACOMPANHAMENTO</div><h1>Seu resumo, ${primeiroNome(S.name||'')||'aluno'}</h1>${S.diag?`<div class="card"><b>Ponto de partida:</b> ${S.diag.rec} • teoria ${S.diag.teoria}%${S.diag.medido?' • prática '+S.diag.pratica+'%':''}</div>`:''}
 ${blocoResumo(7,'📅 Últimos 7 dias')}${blocoResumo(30,'🗓️ Últimos 30 dias')}<button class="btn alt" onclick="go('profile')">Voltar</button>`)}
function enviarResumos(){try{if(!ACC.session||isOwner())return;const agora=Date.now();S.resEnv=S.resEnv||{};
 if(!S.resEnv.s||agora-S.resEnv.s>=7*864e5){if(S.resEnv.s)registrar('resumo_semana',estatisticas(7));S.resEnv.s=agora;save()}
 if(!S.resEnv.m||agora-S.resEnv.m>=30*864e5){if(S.resEnv.m)registrar('resumo_mes',estatisticas(30));S.resEnv.m=agora;save()}}catch(e){}}

/* ---------- observações do aluno ---------- */
function cardObs(){return `<div class="card"><h3>💬 Sugestões e observações para o professor</h3><p class="sub">Conte o que está achando, dúvidas, dificuldades ou ideias de melhoria. O professor lê tudo.</p>
 <textarea class="field" id="obs-txt" rows="3" maxlength="1000" placeholder="Escreva aqui…"></textarea><button class="btn alt" onclick="enviarObs()">Enviar ao professor</button>
 ${(S.obs||[]).slice(-3).reverse().map(o=>`<p class="tiny" style="margin:4px 0">✓ ${o.d.split('-').reverse().join('/')}: ${o.txt.replace(/</g,'&lt;').slice(0,120)}</p>`).join('')}</div>`}
function enviarObs(){const t=($('#obs-txt').value||'').trim();if(t.length<3){toast('Escreva sua observação');return}S.obs=S.obs||[];S.obs.push({d:hojeISO(),txt:t});save();registrar('observacao',{texto:t});toast('Enviado ao professor. Obrigado! 🙏');render()}

/* ---------- aviso no último dia do teste ---------- */
function cardFimTeste(){const u=curUser();if(!u||u.plan!=='teste'||isOwner())return '';const d=diasPara(u.exp);if(d==null||d>1||d<0)return '';if(S.fbTeste&&S.fbTeste.d===u.exp)return '';
 const n=Object.values(S.reps||{}).reduce((a,b)=>a+b,0),rec=(S.diag&&S.diag.rec)||'';
 return `<div class="card" style="border:2px solid #d39b1f"><h3>🎷 ${d===0?'Seu teste termina hoje':'Seu teste termina amanhã'}. Está gostando do MUSICALIS?</h3>
 <p class="sub">${n?`Você já fez <b>${n} prática(s)</b>. 👏`:`Você ainda não fez nenhum exercício${rec?' do seu nível (<b>'+rec+'</b>)':''}. Que tal experimentar agora?`}</p>
 <div class="grid"><button class="btn" onclick="fbTeste('adorei')">😍 Estou gostando</button><button class="btn alt" onclick="fbTeste('nao_experimentei')">🤔 Ainda não experimentei</button><button class="btn alt" onclick="fbTeste('dificuldade')">😓 Tive dificuldade</button></div></div>`}
function fbTeste(r){const u=curUser();S.fbTeste={d:u.exp,r};save();registrar('avaliacao_teste',{resposta:r,praticas:Object.values(S.reps||{}).reduce((a,b)=>a+b,0)});
 const msgs={adorei:'Que bom! Continue sem perder seu progresso escolhendo um plano.',nao_experimentei:'Vamos lá! Abra o primeiro exercício do seu nível: leva 5 minutos.',dificuldade:'O professor vai te ajudar. Toque abaixo e conte o que aconteceu.'};
 const wa='https://wa.me/5551984168848?text='+encodeURIComponent(`Olá, Kenny! Estou no teste do MUSICALIS (${ACC.session}). ${r==='dificuldade'?'Tive dificuldade com: ':'Tenho uma dúvida: '}`);
 shell(`<div class="sub">SEU TESTE GRÁTIS</div><h1>Obrigado pela resposta!</h1><div class="card"><p>${msgs[r]}</p>
 ${r==='nao_experimentei'?`<button class="btn gold" onclick="go('study')">Abrir meus exercícios</button>`:`<button class="btn gold" onclick="go('plans')">Ver os planos</button>`}
 <button class="btn alt" onclick="location.href='${wa}'">Falar com o professor no WhatsApp</button><button class="btn alt" onclick="go('home')">Voltar</button></div>`)}

/* ---------- 2. diagnóstico inicial com teste prático ---------- */
const NIVEIS_REC=['Básico B1','Básico B2','Básico B3','Básico B5','Básico B7','Intermediário I1','Intermediário I4','Intermediário I7','Avançado A1'];
function nivelRecomendado(teoria,pratica,declarado){const sc=pratica==null?teoria:Math.round(teoria*.4+pratica*.6);
 let i=sc<30?0:sc<45?1:sc<55?2:sc<65?3:sc<75?4:sc<82?5:sc<88?6:sc<93?7:8;
 if(/Básico/.test(declarado||'')&&i>5&&!(pratica>=85))i=5;if(!/Avançado/.test(declarado||'')&&i>6)i=6;if(pratica==null&&i>5)i=5;return NIVEIS_REC[i]}
M2EX.diag={t:'Teste prático do MUSICALIS',lv:'Diagnóstico',obj:'Toque as notas longas junto com o metrônomo',fig:'Semibreve e mínima',key:0,meter:4,bpm:72,n:'Sol4:sb | Lá4:sb | Si4:sb | Dó5:sb | Ré5:m Dó5:m | Si4:m Lá4:m | Sol4:sb'};
ans=function(i){answers.push(i===Q[qi][2]);qi++;if(qi<Q.length){render();return}S.theory=Math.round(answers.filter(Boolean).length/Q.length*100);S.practice=null;save();page='pratica';render()};
function pratica(){shell(`<div class="sub">DIAGNÓSTICO PRÁTICO</div><h1>Agora, toque um pouco 🎷</h1>
 <div class="card"><p>Teoria: <b>${S.theory}%</b>. Para recomendar o seu ponto de partida, o MUSICALIS escuta você tocar <b>7 compassos de notas longas</b> (Sol, Lá, Si, Dó…), junto com o metrônomo.</p>
 <p class="sub">• Leva menos de 1 minuto • fique num lugar silencioso • o celular vai pedir para usar o microfone: toque em <b>Permitir</b>.</p>
 <button class="btn gold" onclick="iniciarDiag()">🎤 Fazer o teste prático</button><button class="btn alt" onclick="concluirDiag(null)">Pular por agora</button></div>`)}
async function iniciarDiag(){const ok=await ouvPermissao();if(!ok){toast('Sem microfone: vamos usar só a teoria por enquanto.');concluirDiag(null);return}
 OUV.diag=true;S.bpm=72;save();openM2('diag');toast('Toque ▶ Tocar e acompanhe o cursor 🎷',4000)}
function concluirDiag(prat){OUV.diag=false;const rec=nivelRecomendado(S.theory||0,prat,S.declared);S.practice=prat==null?null:prat;
 S.diag={d:hojeISO(),teoria:S.theory||0,pratica:prat,medido:prat!=null,declarado:S.declared||'',rec};const mods=modules(),ix=mods.findIndex(m=>m.name===rec);
 if(ix>=0){S.nivelRecIdx=ix;try{NIVEL_EST=rec.split(' ')[0];MOD_ABERTO=rec}catch(e){}}save();registrar('diagnostico',S.diag);page='result';render()}
result=function(){const D=S.diag||{rec:'Básico B1',teoria:S.theory||0};const det=D.medido?`<div class="card"><div class="score">${D.pratica}%</div><b>Prática (ouvida)</b></div>`:`<div class="card"><div class="score">—</div><b>Prática</b><p class="tiny">Faça o teste prático depois, em Perfil.</p></div>`;
 shell(`<div class="sub">DIAGNÓSTICO CONCLUÍDO</div><h1>${S.name}, este é seu ponto de partida.</h1><div class="grid"><div class="card"><div class="score">${D.teoria}%</div><b>Teoria</b></div>${det}
 <div class="card big"><h3>Comece por aqui</h3><h2>${D.rec}</h2><p class="sub">Os módulos anteriores ficam liberados para revisão. Você pode refazer o diagnóstico quando quiser, em Perfil.</p><button class="btn" onclick="go('study')">Começar a estudar</button></div></div>`)};
{const a=modUnlocked;modUnlocked=function(m){if(m&&S.nivelRecIdx!=null){const i=modules().findIndex(k=>k.name===m.name);if(i>=0&&i<=S.nivelRecIdx)return true}return a(m)}}
function refazerDiag(){qi=0;answers=[];page='quiz';render()}

/* ---------- 3. OUVIDO DO MUSICALIS (microfone → nota tocada) ---------- */
const OUV={stream:null,ctx:null,an:null,buf:null,timer:null,frames:[],on:{},ouvindo:false,diag:false,res:null};
const ouvCfg=()=>{S.ouvido=S.ouvido||{modo:'manual',melodia:false};return S.ouvido};
async function ouvPermissao(){if(OUV.stream)return true;try{window.__micT0=performance.now();OUV.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
 OUV.ctx=new (window.AudioContext||window.webkitAudioContext)();const src=OUV.ctx.createMediaStreamSource(OUV.stream);OUV.an=OUV.ctx.createAnalyser();OUV.an.fftSize=4096;src.connect(OUV.an);OUV.buf=new Float32Array(OUV.an.fftSize);return true}catch(e){return false}}
function ouvSoltar(){try{OUV.stream&&OUV.stream.getTracks().forEach(t=>t.stop())}catch(e){}try{OUV.ctx&&OUV.ctx.close()}catch(e){}OUV.stream=OUV.ctx=OUV.an=null;OUV.ouvindo=false;clearInterval(OUV.timer)}
/* YIN simplificado: devolve {hz, clareza} ou null */
function detectarAltura(buf,sr){let rms=0;for(let i=0;i<buf.length;i++)rms+=buf[i]*buf[i];rms=Math.sqrt(rms/buf.length);if(rms<0.008)return null;
 const N=buf.length>>1,minL=Math.floor(sr/1500),maxL=Math.min(N-1,Math.ceil(sr/45)),d=new Float32Array(maxL+1);
 for(let t=minL;t<=maxL;t++){let s=0;for(let i=0;i<N;i++){const x=buf[i]-buf[i+t];s+=x*x}d[t]=s}
 let run=0,cm=new Float32Array(maxL+1);cm[minL]=1;for(let t=minL;t<=maxL;t++){run+=d[t];cm[t]=run?d[t]*(t-minL+1)/run:1}
 let T=-1;for(let t=minL+1;t<maxL;t++){if(cm[t]<0.15){while(t+1<maxL&&cm[t+1]<cm[t])t++;T=t;break}}if(T<0)return null;
 const a=cm[T-1]||cm[T],b=cm[T],c=cm[T+1]||cm[T],p=(a-c)/(2*(a-2*b+c)||1);return {hz:sr/(T+(isFinite(p)?p:0)),clareza:1-b,rms}}
function ouvLigar(){if(!OUV.an)return;OUV.frames=[];OUV.on={};OUV.ouvindo=true;clearInterval(OUV.timer);if(OUV.ctx.state==='suspended')OUV.ctx.resume();
 OUV.timer=setInterval(()=>{if(!OUV.an)return;OUV.an.getFloatTimeDomainData(OUV.buf);const r=detectarAltura(OUV.buf,OUV.ctx.sampleRate);if(r&&r.clareza>0.8)OUV.frames.push({t:performance.now(),m:69+12*Math.log2(r.hz/440)})},45)}
const LETN=['Dó','Ré','Mi','Fá','Sol','Lá','Si'],PCL=[0,2,4,5,7,9,11];
const nomeNota=e=>LETN[e.L]+(e.alt>0?'#':e.alt<0?'b':'')+e.oct;
function nomeMidi(m,ref){const o=Math.floor(m/12)-1,pc=((m%12)+12)%12;if(ref){const alt=pc-PCL[ref.L]+(Math.floor(m/12)-1-ref.oct)*12;if(Math.abs(alt)<=1)return LETN[ref.L]+(alt>0?'#':alt<0?'b':'')+(Math.floor((m-alt)/12)-1)}
 const N=['Dó','Dó#','Ré','Mib','Mi','Fá','Fá#','Sol','Sol#','Lá','Sib','Si'];return N[pc]+o}
function ouvAvaliar(){const fl=meterState.flat||[],seg=60/S.bpm*1000,lat=90,res=[];
 fl.forEach((e,i)=>{if(e.rest||e.ligada||OUV.on[i]==null)return;let d=e.d;let j=i;while(fl[j]&&fl[j].liga&&fl[j+1]){d+=fl[j+1].d;j++}
  const t0=OUV.on[i]+lat,t1=OUV.on[i]+d*seg*0.92+lat+Math.min(250,d*seg*0.3);const t1b=OUV.on[i]+d*seg*0.92+lat,base=OUV.frames.filter(f=>f.t>=t0&&f.t<=t1b).length,fr=OUV.frames.filter(f=>f.t>=t0&&f.t<=t1).map(f=>f.m+saxSemis());
  const esperado=e.p,item={i,m:e.m,esperado:nomeNota(e)};if(base<2||fr.length<2){item.tipo='silencio';res.push(item);return}
  /* tolerância: aluno que entra um pouco atrasado não é penalizado; vale a nota mais tocada na janela */
  const cnt={};fr.forEach(m=>{const q=Math.round(m);cnt[q]=(cnt[q]||0)+1});const acerto=(cnt[esperado]||0)/fr.length;
  let q=+Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a])[0];if(acerto>=0.35)q=esperado;const perto=fr.filter(m=>Math.round(m)===q).sort((a,b)=>a-b),escrito=perto[perto.length>>1];
  const diff=q-esperado;item.cents=Math.round((escrito-q)*100);item.tocado=nomeMidi(q,e);
  if(diff===0)item.tipo='ok';else if(Math.abs(diff)===12)item.tipo='oitava';else if(Math.abs(diff)<=2&&item.tocado.replace(/[#b]/,'').replace(/\d+$/,'')===LETN[e.L])item.tipo='acidente';else item.tipo='nota';
  if(item.tipo==='acidente'){const exp=e.alt,tc=/#/.test(item.tocado)?1:/b/.test(item.tocado)?-1:0;item.dica=exp>0&&tc===0?'esqueceu o sustenido':exp<0&&tc===0?'esqueceu o bemol':exp===0&&tc>0?'tocou sustenido sem precisar':exp===0&&tc<0?'tocou bemol sem precisar':'acidente trocado'}
  res.push(item)});
 const tot=res.length||1,ok=res.filter(r=>r.tipo==='ok').length,oi=res.filter(r=>r.tipo==='oitava').length;const erros={acidente:0,oitava:0,nota:0,silencio:0};res.forEach(r=>{if(erros[r.tipo]!=null)erros[r.tipo]++});
 return {precisao:Math.round((ok+oi*.5)/tot*100),total:res.length,ok,erros,itens:res}}
function ouvMarcar(R){R.itens.forEach(r=>{const g=document.getElementById('mt-'+r.i),h=g&&(g.querySelector('.note-head')||g);if(h){h.classList.remove('ouv-ok','ouv-err','ouv-mid');h.classList.add(r.tipo==='ok'?'ouv-ok':r.tipo==='silencio'?'ouv-mid':'ouv-err')}})}
function ouvPainel(R){document.getElementById('ouv-res')?.remove();const ruins=R.itens.filter(r=>r.tipo!=='ok').slice(0,8);
 const txt=r=>`<li>Compasso ${r.m+1}: ${r.tipo==='silencio'?`não ouvi o <b>${r.esperado}</b>`:r.tipo==='acidente'?`<b>${r.esperado}</b> → tocou ${r.tocado} (${r.dica})`:r.tipo==='oitava'?`<b>${r.esperado}</b> saiu uma oitava ${(r.tocado.match(/\d+$/)||[0])[0]>r.esperado.match(/\d+$/)[0]?'acima':'abaixo'}`:`<b>${r.esperado}</b> → tocou ${r.tocado}`}</li>`;
 document.body.insertAdjacentHTML('beforeend',`<div id="ouv-res" style="position:fixed;left:10px;right:10px;top:46px;z-index:950;max-width:520px;margin:0 auto;max-height:70vh;overflow:auto;background:#fff;color:#13202e;border:3px solid ${R.precisao>=85?'#1f9d55':R.precisao>=60?'#d39b1f':'#d62828'};border-radius:16px;padding:14px 16px;box-shadow:0 12px 34px #0009">
 <b style="font-size:18px">🎧 Ouvido do MUSICALIS: ${R.precisao}% de acerto</b><p style="margin:6px 0;font-size:14px">${R.ok} de ${R.total} notas certas${R.erros.acidente?` • ${R.erros.acidente} acidente(s)`:''}${R.erros.oitava?` • ${R.erros.oitava} oitava(s)`:''}${R.erros.nota?` • ${R.erros.nota} nota(s) errada(s)`:''}${R.erros.silencio?` • ${R.erros.silencio} não ouvida(s)`:''}</p>
 ${ruins.length?`<ul style="margin:6px 0 8px 18px;padding:0;font-size:14px;line-height:1.5">${ruins.map(txt).join('')}</ul><p class="tiny" style="color:#555">As notas em vermelho na partitura são as que precisam de atenção.</p>`:'<p style="font-size:15px">Perfeito! Todas as notas certas. 🏆</p>'}
 <button class="btn" style="margin:6px 0 0" onclick="document.getElementById('ouv-res').remove()">Fechar</button></div>`)}
/* liga/desliga na partitura */
function ouvAtivoAgora(){const m=ouvCfg().modo;return OUV.diag||m==='auto'||(m==='manual'&&OUV.manualOn)}
async function ouvAlternar(){if(OUV.manualOn){OUV.manualOn=false;toast('Ouvido desligado');ouvBotao();return}const ok=await ouvPermissao();if(!ok){toast('Permita o microfone para o Ouvido funcionar');return}OUV.manualOn=true;toast('Ouvido ligado: toque ▶ Tocar e acompanhe 🎷',3500);ouvBotao()}
function ouvBotao(){const h=document.querySelector('.score-head');if(!h)return;let b=h.querySelector('.ouv-btn');const m=ouvCfg().modo;if(m==='off'&&!OUV.diag){b&&b.remove();return}
 if(!b){h.querySelector('.full-btn')?.insertAdjacentHTML('beforebegin','<button class="ouv-btn" onclick="ouvAlternar()"></button>');b=h.querySelector('.ouv-btn')}
 const on=ouvAtivoAgora();b.textContent=on?'🎤 Ouvindo':'🎤 Ouvir';b.classList.toggle('on',on);if(m==='auto'||OUV.diag)b.onclick=()=>toast('Ouvido automático: muda em Perfil → Ouvido')}
{const a=openM2;openM2=function(id){OUV.ouvindo=false;clearInterval(OUV.timer);a(id);document.getElementById('ouv-res')?.remove();ouvBotao()}}
{const a=startMeter;startMeter=async function(){if(ouvAtivoAgora()){const ok=await ouvPermissao();if(ok)ouvLigar()}a()}}
{const a=mtVis;mtVis=function(i){if(OUV.ouvindo&&OUV.on[i]==null)OUV.on[i]=performance.now();return a(i)}}
{const a=saxSynth;saxSynth=function(...x){if(OUV.ouvindo&&!ouvCfg().melodia)return;return a(...x)}}
{const a=stopMeter;stopMeter=function(msg){const r=a(msg);if(msg!==false&&OUV.ouvindo){OUV.ouvindo=false;clearInterval(OUV.timer);if(Object.keys(OUV.on).length>2){const R=ouvAvaliar();ouvMarcar(R);ouvPainel(R)}}return r}}
{const a=exDone;exDone=function(){if(OUV.ouvindo||OUV.diag){OUV.ouvindo=false;clearInterval(OUV.timer);const R=ouvAvaliar();OUV.res=R;OUV.resT=Date.now();ouvMarcar(R);
  if(curEx==='diag'){stopMeter(false);const p=R.precisao;ouvSoltar();setTimeout(()=>{document.body.classList.remove('forced-landscape','score-wide');concluirDiag(p)},900);return}
  ouvPainel(R);a();registrar('ouvido',{id:curEx,precisao:R.precisao,erros:R.erros,bpm:S.bpm});return}
 a()}}
{const a=closeMeter;closeMeter=async function(){document.getElementById('ouv-res')?.remove();OUV.manualOn=false;if(curEx==='diag'){ouvSoltar();OUV.diag=false;await a();concluirDiag(null);return}ouvSoltar();return a()}}
function cardOuvido(){const c=ouvCfg(),op=(v,t,d)=>`<label style="display:flex;gap:10px;align-items:flex-start;margin:8px 0;cursor:pointer"><input type="radio" name="ouvm" ${c.modo===v?'checked':''} onchange="ouvCfg().modo='${v}';save();render()" style="margin-top:4px"><span><b>${t}</b><br><span class="tiny">${d}</span></span></label>`;
 return `<div class="card"><h3>🎧 Ouvido do MUSICALIS</h3><p class="sub">O app escuta você tocando e aponta notas erradas, oitavas trocadas e sustenidos/bemóis esquecidos. Use fone de ouvido ou deixe a melodia do app desligada.</p>
 ${op('auto','Automático','Escuta sempre que você toca um exercício')}${op('manual','Manual','Aparece o botão 🎤 Ouvir na partitura; você liga quando quiser')}${op('off','Desligado','O app não usa o microfone')}
 <label style="display:flex;gap:10px;align-items:center;margin-top:6px"><input type="checkbox" ${c.melodia?'checked':''} onchange="ouvCfg().melodia=this.checked;save()"> <span class="tiny">Tocar a melodia do app junto enquanto escuta (só com fone de ouvido)</span></label>
 <p class="tiny">O som do microfone é analisado só no seu aparelho e nunca é gravado nem enviado.</p></div>`}
function cardPausa(){const c=pausaCfg();return `<div class="card"><h3>⏸️ Lembrete de pausas</h3><label style="display:flex;gap:10px;align-items:center"><input type="checkbox" ${c.on?'checked':''} onchange="pausaCfg().on=this.checked;save()"> Avisar para descansar a cada</label>
 <select class="field" onchange="pausaCfg().min=+this.value;save()">${[20,25,30,45].map(m=>`<option value="${m}" ${c.min===m?'selected':''}>${m} minutos de estudo</option>`).join('')}</select></div>`}

/* ---------- telas: Perfil, Início, partituras ---------- */
{const a=render;render=function(){if(page==='resumo'&&ACC.session){resumo();nav();return}if(page==='pratica'&&ACC.session){pratica();nav();return}a();
 if(!ACC.session||isOwner())return;
 if(page==='home')inserirTopo(cardFimTeste());
 if(page==='profile'){const f=document.querySelector('#app .card');const alvo=[...document.querySelectorAll('#app .card')].find(c=>/Backup do meu progresso/.test(c.textContent));
  const h=`<div class="card"><h3>📊 Meu acompanhamento</h3><p class="sub">Resumo da semana e do mês, com recomendações de prática e de pausas.</p><button class="btn" onclick="go('resumo')">Ver meu resumo</button><button class="btn alt" onclick="refazerDiag()">Refazer o diagnóstico</button></div>${cardOuvido()}${cardPausa()}${cardObs()}`;
  if(alvo)alvo.insertAdjacentHTML('beforebegin',h);else if(f)f.insertAdjacentHTML('afterend',h)}
 enviarResumos()}}
{const a=go;go=function(p){if(p==='item'&&typeof FMQ!=='undefined'&&FMQ&&ACC.session)registrar('partitura',{id:FMQ});return a(p)}}
{const a=coachAfter;coachAfter=function(id){a(id);if(id!=='diag')registrar('exercicio',{id,mod:(moduleOf(id)||{}).name||'',bpm:S.bpm,precisao:OUV.res&&OUV.res.precisao!=null&&Date.now()-(OUV.resT||0)<5000?OUV.res.precisao:null})}}
{const a=enviarLead;enviarLead=function(ev){if(/^link_|^pagar|^whats/.test(ev||''))registrar('pagamento',{acao:ev});return a(ev)}}

/* ---------- 5. atualização automática (sem baixar nada): o app confere a versão publicada e se atualiza sozinho ---------- */
const verNum=v=>String(v||'0').split('.').map(n=>+n||0).reduce((a,n,i)=>a+n/Math.pow(1000,i),0);
let ATUALIZAR_PENDENTE=null;
function podeRecarregar(){const tocando=(typeof meterState!=='undefined'&&meterState.playing)||(typeof FM!=='undefined'&&FM&&FM.playing)||OUV.ouvindo;
 const digitando=document.activeElement&&/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);return !tocando&&!digitando&&!document.querySelector('.score-screen,.extra-screen')}
function aplicarAtualizacao(v){try{sessionStorage.setItem('musicalis_atualizado',v);sessionStorage.setItem('musicalis_tentou',v)}catch(e){}toast('Atualizando o MUSICALIS para a versão '+v+'…',2500);setTimeout(()=>location.reload(),900)}
async function checarAtualizacao(){if(NATIVO||!/^https?:/.test(location.protocol)||navigator.onLine===false)return;
 try{const r=await fetch('versao.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)return;const j=await r.json();
  if(navigator.serviceWorker){navigator.serviceWorker.getRegistration().then(g=>g&&g.update()).catch(()=>{})}
  if(verNum(j.v)>verNum(APP_VERSAO)){let tentou=false;try{tentou=sessionStorage.getItem('musicalis_tentou')===j.v}catch(e){}
   if(tentou){avisoAtualizar(j.v);return}ATUALIZAR_PENDENTE=j.v;if(podeRecarregar())aplicarAtualizacao(j.v)}}catch(e){}}
function avisoAtualizar(v){if(document.getElementById('upd-bar'))return;document.body.insertAdjacentHTML('beforeend',`<div id="upd-bar" style="position:fixed;left:10px;right:10px;top:10px;z-index:990;max-width:480px;margin:0 auto;background:#0f6b52;color:#fff;border-radius:14px;padding:10px 14px;display:flex;gap:10px;align-items:center;box-shadow:0 8px 24px #0007"><b style="flex:1;font-size:14px">Nova versão ${v} do MUSICALIS</b><button class="btn" style="width:auto;margin:0;padding:8px 14px" onclick="location.reload()">Atualizar</button></div>`)}
setTimeout(()=>checarAtualizacao(),4000);setInterval(()=>checarAtualizacao(),15*60000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')checarAtualizacao()});
{const a=go;go=function(p){const r=a(p);if(ATUALIZAR_PENDENTE&&podeRecarregar())aplicarAtualizacao(ATUALIZAR_PENDENTE);return r}}
try{const v=sessionStorage.getItem('musicalis_atualizado');if(v){sessionStorage.removeItem('musicalis_atualizado');setTimeout(()=>toast('MUSICALIS atualizado para a versão '+APP_VERSAO+' ✅',3500),1200)}}catch(e){}
