/* ===================== V3.42 • VINHETA DE JAZZ NO SOM DO SAX DE CADA ASSINANTE =====================
   Mesma melodia original MUSICALIS (ii–V–I em Fá, swing) para todos; muda só o timbre e a oitava:
   soprano (+1 oitava), alto, tenor (−1) e barítono (−2), conforme o sax principal do perfil. */
const vjHz=m=>440*Math.pow(2,(m-69)/12);
const VJ_SAX={ /* desloc: oitavas em relação à melodia escrita para o alto (mesma tonalidade) */
 soprano:{desl:12,lp:[1400,4300,3300],pk:[1350,6,1.4],sq:.30,vib:[5.6,.008],g:.05},
 alto:   {desl:0, lp:[1100,3300,2500],pk:[880,5,1.2],sq:.26,vib:[5.4,.009],g:.06},
 tenor:  {desl:-12,lp:[900,2300,1700],pk:[520,5,1.2],sq:.22,vib:[5.2,.011],g:.065},
 baritono:{desl:-24,lp:[600,1500,1100],pk:[300,6,1.1],sq:.35,vib:[4.8,.012],g:.08}};
function vjSax(c,inst,m,t,dur){const V=VJ_SAX[inst],f=vjHz(m+V.desl),g=V.g,out=c.createGain(),lp=c.createBiquadFilter(),pk=c.createBiquadFilter();
 lp.type='lowpass';lp.frequency.setValueAtTime(V.lp[0],t);lp.frequency.linearRampToValueAtTime(V.lp[1],t+.09);lp.frequency.linearRampToValueAtTime(V.lp[2],t+dur);lp.Q.value=.9;
 pk.type='peaking';pk.frequency.value=V.pk[0];pk.gain.value=V.pk[1];pk.Q.value=V.pk[2];
 out.gain.setValueAtTime(.0001,t);out.gain.exponentialRampToValueAtTime(g,t+.05);out.gain.setValueAtTime(g*.92,t+Math.max(.07,dur-.12));out.gain.exponentialRampToValueAtTime(.0001,t+dur+.05);
 const o1=c.createOscillator(),o2=c.createOscillator(),g2=c.createGain();o1.type='sawtooth';o2.type='square';g2.gain.value=V.sq;
 [o1,o2].forEach((o,i)=>{const fi=f*(i?1.0025:1);o.frequency.setValueAtTime(fi*.988,t);o.frequency.exponentialRampToValueAtTime(fi,t+.04)});
 if(dur>.4){const l=c.createOscillator(),lg=c.createGain();l.frequency.value=V.vib[0];lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(0,t+.22);lg.gain.linearRampToValueAtTime(f*V.vib[1],t+.55);l.connect(lg);lg.connect(o1.frequency);lg.connect(o2.frequency);l.start(t);l.stop(t+dur+.1)}
 const n=c.createBufferSource(),nb=c.createBuffer(1,Math.floor(c.sampleRate*.18),c.sampleRate),d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);
 const nf=c.createBiquadFilter(),ng=c.createGain();n.buffer=nb;nf.type='bandpass';nf.frequency.value=V.pk[0]*2;nf.Q.value=.8;ng.gain.value=g*.3;n.connect(nf);nf.connect(ng);ng.connect(out);n.start(t);
 o1.connect(lp);o2.connect(g2);g2.connect(lp);lp.connect(pk);pk.connect(out);out.connect(c.destination);o1.start(t);o2.start(t);o1.stop(t+dur+.1);o2.stop(t+dur+.1)}
function vjRhodes(c,m,t,dur,g){const o=c.createOscillator(),o2=c.createOscillator(),v=c.createGain(),v2=c.createGain();o.type='sine';o2.type='sine';o.frequency.value=vjHz(m);o2.frequency.value=vjHz(m)*3;v2.gain.value=.12;
 v.gain.setValueAtTime(.0001,t);v.gain.exponentialRampToValueAtTime(g,t+.01);v.gain.exponentialRampToValueAtTime(g*.35,t+.35);v.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(v);o2.connect(v2);v2.connect(v);v.connect(c.destination);o.start(t);o2.start(t);o.stop(t+dur+.05);o2.stop(t+dur+.05)}
function vjBaixo(c,m,t,dur){const o=c.createOscillator(),v=c.createGain(),lp=c.createBiquadFilter();o.type='triangle';o.frequency.value=vjHz(m);lp.type='lowpass';lp.frequency.value=450;
 v.gain.setValueAtTime(.0001,t);v.gain.exponentialRampToValueAtTime(.12,t+.015);v.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(lp);lp.connect(v);v.connect(c.destination);o.start(t);o.stop(t+dur+.05)}
function vjPrato(c,t,g){const n=c.createBufferSource(),b=c.createBuffer(1,Math.floor(c.sampleRate*.5),c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/(c.sampleRate*.12));
 const hp=c.createBiquadFilter(),v=c.createGain();hp.type='highpass';hp.frequency.value=6500;v.gain.value=g;n.buffer=b;n.connect(hp);hp.connect(v);v.connect(c.destination);n.start(t)}
/* melodia original MUSICALIS (escrita na região do sax alto, som real): ii–V–I em Fá, swing */
const VJ_MEL=[[0,.62,67],[.62,.38,70],[1,1,74],[2,.62,72],[2.62,.38,70],[3,.62,67],[3.62,.38,64],[4,.34,70],[4.34,.33,68],[4.67,3.2,69]];
const VJ_ACORDES=[[0,[53,57,58,62],2],[2,[52,57,58,62],2],[4,[52,55,57,60],4]];
const VJ_BAIXO=[[0,43,1],[1,45,1],[2,48,1],[3,46,1],[4,41,3.5]];
function vinhetaJazz(c,inst,t0,bpm){const b=60/(bpm||116);
 VJ_ACORDES.forEach(([k,ns,d])=>ns.forEach((m,j)=>vjRhodes(c,m,t0+k*b+j*.012,d*b+.3,.028)));
 VJ_BAIXO.forEach(([k,m,d])=>vjBaixo(c,m,t0+k*b,d*b));
 [0,1,1.62,2,3,3.62,4].forEach(k=>vjPrato(c,t0+k*b,k%1?.03:.05));
 VJ_MEL.forEach(([k,d,m])=>vjSax(c,inst,m,t0+k*b,d*b));return 8*b}

/* sax do assinante: o principal do questionário; senão o instrumento escolhido; senão o alto */
function vjInstrumento(){const p=(typeof perfilDe==='function'&&perfilDe())||{},t=(p.principal||String(S.instrument||'').replace(/^Sax /,'')).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 return VJ_SAX[t]?t:'alto'}
const VJ_NOME={soprano:'Soprano',alto:'Alto',tenor:'Tenor',baritono:'Barítono'};
VINHETAS.jazz={t:'Jazz no som do seu sax',d:'mesma melodia para todos, no timbre do seu instrumento (padrão)',toca(c,t0,inst){return vinhetaJazz(c,inst||vjInstrumento(),t0)}};
{const ord={jazz:VINHETAS.jazz};Object.keys(VINHETAS).forEach(k=>{if(k!=='jazz')ord[k]=VINHETAS[k]});Object.keys(VINHETAS).forEach(k=>delete VINHETAS[k]);Object.assign(VINHETAS,ord)}
vinhetaEstilo=()=>VINHETAS[ACC.cfg.vinhetaEstilo]?ACC.cfg.vinhetaEstilo:'jazz';
function ouvirVinhetaSax(inst){try{const c=ctx();c.resume().then(()=>vinhetaJazz(c,inst,c.currentTime+.08))}catch(x){}}
{const a=cardVinheta;cardVinheta=function(){const h=a(),inst=vjInstrumento();
 return h.replace('<span class="tiny">mesma melodia para todos, no timbre do seu instrumento (padrão)</span>',`<span class="tiny">toca no som do seu <b>Sax ${VJ_NOME[inst]}</b> (o sax que você estuda)</span>`)
  .replace(/<\/div>$/,`<p class="tiny" style="margin:12px 0 4px">Ouvir a vinheta de jazz em cada sax:</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${Object.keys(VJ_SAX).map(k=>`<button class="btn alt" style="margin:0;padding:10px" onclick="ouvirVinhetaSax('${k}')">▶ ${VJ_NOME[k]}</button>`).join('')}</div></div>`)}}
