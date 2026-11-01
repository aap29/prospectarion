/* ===================== V3.41 • VINHETA COM SOM DE SAX TENOR =====================
   3 vinhetas originais MUSICALIS para escolher no Perfil: Balada (padrão, melódica, sax tenor), Bossa e Swing (a antiga).
   Timbre de sax tenor: região grave, ataque suave, sopro, filtro "de madeira" e vibrato que entra depois da nota. */
/* uma nota de sax tenor (som de concerto) */
function tenorNota(c,m,t,dur,g){g=g||.06;const f=hzM(m),out=c.createGain(),lp=c.createBiquadFilter(),bp=c.createBiquadFilter();
 lp.type='lowpass';lp.frequency.setValueAtTime(900,t);lp.frequency.linearRampToValueAtTime(2300,t+.12);lp.frequency.linearRampToValueAtTime(1700,t+dur);lp.Q.value=.9;
 bp.type='peaking';bp.frequency.value=520;bp.gain.value=5;bp.Q.value=1.2;
 out.gain.setValueAtTime(.0001,t);out.gain.exponentialRampToValueAtTime(g,t+.07);out.gain.setValueAtTime(g,t+Math.max(.09,dur-.16));out.gain.exponentialRampToValueAtTime(.0001,t+dur+.05);
 const o1=c.createOscillator(),o2=c.createOscillator(),g2=c.createGain();o1.type='sawtooth';o2.type='square';g2.gain.value=.22;
 [o1,o2].forEach((o,i)=>{o.frequency.setValueAtTime(f*(i?1.003:1)*.985,t);o.frequency.exponentialRampToValueAtTime(f*(i?1.003:1),t+.05)});
 if(dur>.45){const lfo=c.createOscillator(),lg=c.createGain();lfo.frequency.value=5.3;lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(0,t+.25);lg.gain.linearRampToValueAtTime(f*.011,t+.6);lfo.connect(lg);lg.connect(o1.frequency);lg.connect(o2.frequency);lfo.start(t);lfo.stop(t+dur+.1)}
 const n=c.createBufferSource(),nb=c.createBuffer(1,Math.floor(c.sampleRate*.25),c.sampleRate),d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);
 const nf=c.createBiquadFilter(),ng=c.createGain();n.buffer=nb;nf.type='bandpass';nf.frequency.value=1600;nf.Q.value=.8;ng.gain.value=g*.35;n.connect(nf);nf.connect(ng);ng.connect(out);n.start(t);
 o1.connect(lp);o2.connect(g2);g2.connect(lp);lp.connect(bp);bp.connect(out);out.connect(c.destination);o1.start(t);o2.start(t);o1.stop(t+dur+.1);o2.stop(t+dur+.1)}
/* contrabaixo suave para a cama harmônica */
function baixoNota(c,m,t,dur){const o=c.createOscillator(),v=c.createGain(),lp=c.createBiquadFilter();o.type='triangle';o.frequency.value=hzM(m);lp.type='lowpass';lp.frequency.value=500;
 v.gain.setValueAtTime(.0001,t);v.gain.exponentialRampToValueAtTime(.09,t+.02);v.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(lp);lp.connect(v);v.connect(c.destination);o.start(t);o.stop(t+dur+.05)}
const VINHETAS={
 balada:{t:'Balada',d:'melódica, sax tenor (padrão)',
  toca(c,t0){const b=.42;   // ~72 BPM
   [[0,[48,52,55,59,62],36],[2,[45,52,55,59,60],33],[4,[50,53,57,60,64],38],[5,[43,53,57,59,64],31],[6,[48,52,55,59,62,64],36]].forEach(([k,ns,ba],i,a)=>{const d=((a[i+1]?a[i+1][0]:9)-k)*b+.25;ns.forEach((m,j)=>teclado(c,m,t0+k*b+j*.025,d,.022));baixoNota(c,ba,t0+k*b,d)});
   [[0,.5,55],[.5,.5,59],[1,1.4,64],[2.5,.5,62],[3,.5,60],[3.5,.5,57],[4,.7,62],[4.75,.5,60],[5.25,.75,59],[6,2.6,64]].forEach(([k,d,m])=>tenorNota(c,m,t0+k*b,d*b,.065));return 9*b}},
 bossa:{t:'Bossa',d:'leve e brasileira, sax tenor',
  toca(c,t0){const b=.3;
   [[0,[53,57,60,64],41],[2,[55,58,62,65],43],[4,[48,52,55,58,62],36],[6,[53,57,60,64,67],41]].forEach(([k,ns,ba],i,a)=>{const d=((a[i+1]?a[i+1][0]:9)-k)*b+.2;ns.forEach((m,j)=>teclado(c,m,t0+k*b+j*.02,d,.02));baixoNota(c,ba,t0+k*b,b*1.2);baixoNota(c,ba+7,t0+(k+1.5)*b,b*.5)});
   [[0,.5,60],[.5,.5,64],[1.5,1,67],[2.5,.5,65],[3,1,62],[4.5,.5,64],[5,.5,62],[5.5,.5,58],[6,3,64]].forEach(([k,d,m])=>tenorNota(c,m,t0+k*b,d*b,.06));return 9.5*b}},
 swing:{t:'Swing',d:'a frase rápida de antes'}};
let vinhetaEstilo=()=>VINHETAS[ACC.cfg.vinhetaEstilo]?ACC.cfg.vinhetaEstilo:'balada';
{const antiga=tocarVinheta;tocarVinheta=function(estilo){const e=estilo||vinhetaEstilo();if(e==='swing')return antiga();
 try{const c=ctx();if(c.state!=='running')return false;VINHETAS[e].toca(c,c.currentTime+.08);try{sessionStorage.setItem('musicalis_vinheta','1')}catch(x){}window.__vinhetaTocou=Date.now();return true}catch(x){return false}}}
function ouvirVinheta(e){try{ctx().resume().then(()=>tocarVinheta(e))}catch(x){}}
cardVinheta=function(){const atual=vinhetaEstilo();return `<div class="card"><h3>🎷 Vinheta de abertura</h3><label style="display:flex;gap:10px;align-items:center"><input type="checkbox" ${vinhetaOn()?'checked':''} onchange="ACC.cfg.vinheta=this.checked;saveAcc()"> Tocar a vinheta ao abrir o app</label>
 ${Object.entries(VINHETAS).map(([k,v])=>`<div style="display:flex;gap:10px;align-items:center;margin-top:10px"><label style="flex:1;display:flex;gap:10px;align-items:center"><input type="radio" name="vinh" ${atual===k?'checked':''} onchange="ACC.cfg.vinhetaEstilo='${k}';saveAcc()"><span><b>${v.t}</b><br><span class="tiny">${v.d}</span></span></label><button class="btn alt" style="width:auto;margin:0;padding:10px 14px" onclick="ouvirVinheta('${k}')">▶ Ouvir</button></div>`).join('')}</div>`};
