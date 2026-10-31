/* ===================== V3.37 • MÉTODO AVANÇADO DE JAZZ: ESTILOS E MESTRES =====================
   Estudos ORIGINAIS MUSICALIS compostos "no estilo de" cada escola e artista (estilo não tem dono; nada é copiado
   de livros ou transcrições). Cada estilo traz um resumo histórico, os artistas e fontes reais para ler mais.
   Acesso: planos Trimestral, Semestral, Anual e Vitalício (e Vitalício parcelado em dia).
   JAZZ_PUBLICO=false → só o Criador vê (prévia para aprovação); true → alunos dos planos acima. */
const JAZZ_PUBLICO=false;
const JAZZ_PLANOS=['trimestral','semestral','anual','vitalicio','parcelado','escola'];
const JAZZ_EX={
 jz101:{t:'Riff de Kansas City',lv:'Jazz • Blues e Swing',obj:'Estudo original MUSICALIS no estilo de Lester Young: riffs curtos em pergunta e resposta, som leve e relaxado',fig:'Colcheia',key:-1,meter:4,bpm:100,swing:true,
  n:'[F7] Fá4:sm Láb4:c Lá4:c Dó5:sm P:sm | [Bb7] Ré5:c Dó5:c Láb4:c Fá4:c Lá4:m | [F7] Fá4:sm Láb4:c Lá4:c Dó5:sm P:sm | [F7] Mib5:c Ré5:c Dó5:c Lá4:c Fá4:m | [Bb7] Si4:sm Ré5:c Fá5:c Láb5:sm P:sm | [Bb7] Fá5:c Ré5:c Si4:c Láb4:c Sol4:m | [F7] Fá4:sm Láb4:c Lá4:c Dó5:sm P:sm | [D7] Dó5:c Si4:c Lá4:c Fá#4:c Lá4:m | [Gm7] Sol4:c Si4:c Ré5:c Fá5:c Mi5:sm P:sm | [C7] Mi5:c Sol5:c Si4:c Ré5:c Dó5:m | [F7] Lá4:c Dó5:c Fá5:sm Ré5:c Dó5:c Lá4:sm | [C7] Sol4:sm Mi4:c Fá4:c~ Fá4:m'},
 jz102:{t:'Arpejos do Hawk',lv:'Jazz • Blues e Swing',obj:'Estudo original MUSICALIS no estilo de Coleman Hawkins: pensar "na vertical", desenhando cada acorde em arpejos contínuos',fig:'Colcheia',key:0,meter:4,bpm:92,swing:true,
  n:'[C7] Dó4:c Mi4:c Sol4:c Sib4:c Ré5:c Sib4:c Sol4:c Mi4:c | [F7] Fá4:c Lá4:c Dó5:c Mib5:c Sol5:c Mib5:c Dó5:c Lá4:c | [C7] Mi5:c Ré5:c Dó5:c Sib4:c Sol4:c Mi4:c Ré4:c Dó4:c | [C7] Mi4:c Sol4:c Sib4:c Dó5:c Mi5:sm. Sib4:c | [F7] Lá4:c Dó5:c Mib5:c Fá5:c Lá5:sm Sol5:c Fá5:c | [F#°] Fá#4:c Lá4:c Dó5:c Mib5:c Fá#5:m | [C7] Sol5:c Mi5:c Dó5:c Sol4:c Sib4:sm Lá4:sm | [A7] Sol4:c Lá4:c Dó#5:c Mi5:c Sol5:sm Mi5:sm | [Dm7] Fá5:c Mi5:c Ré5:c Dó5:c Lá4:c Fá4:c Ré4:sm | [G7] Si4:c Ré5:c Fá5:c Lá5:c Sol5:sm Fá5:sm | [C7] Mi5:c Dó5:c Sol4:c Mi4:c [A7] Dó#5:c Lá4:c Mi4:c Dó#4:c | [Dm7] Ré4:c Fá4:c [G7] Si4:c Ré5:c [C7] Dó5:m'}};
Object.entries(JAZZ_EX).forEach(([k,v])=>{if(!M2EX[k])M2EX[k]=v});
const WKJ=s=>'https://en.wikipedia.org/wiki/'+s;
const JAZZ=[
 {id:'swing',t:'Blues e Swing',ep:'anos 1930 e 1940',cor:'#e8ad28',
  hist:'Entre meados dos anos 1930 e o fim da Segunda Guerra, o swing foi a música popular dos Estados Unidos, tocada por big bands para dançar. Em Kansas City, as orquestras criaram um jeito próprio de tocar o blues de 12 compassos: frases curtas repetidas (os <b>riffs</b>) em pergunta e resposta entre os naipes, e longos solos de saxofone tenor por cima.',
  aprender:'Swing das colcheias, blues de 12 compassos, riffs, terça "blue" (Láb–Lá em Fá), arpejos dos acordes.',
  artistas:[
   {n:'Lester Young',a:'1909–1959',inst:'sax tenor',txt:'Apelidado de "Pres" (o Presidente) pela cantora Billie Holiday, brilhou na orquestra de Count Basie a partir de 1936. Tinha som leve e frases relaxadas e melódicas, bem diferente do som robusto da época, e abriu caminho para o cool jazz.',f:[['Britannica','https://www.britannica.com/biography/Lester-Young'],['Wikipedia','https://en.wikipedia.org/wiki/Lester_Young']]},
   {n:'Coleman Hawkins',a:'1904–1969',inst:'sax tenor',txt:'O "Hawk" é considerado o primeiro grande solista do sax tenor no jazz. Tocou na orquestra de Fletcher Henderson (1923–1934) e, em 1939, gravou "Body and Soul", solo histórico em que improvisa quase sem tocar a melodia, desenhando a harmonia em arpejos.',f:[['Wikipedia','https://en.wikipedia.org/wiki/Coleman_Hawkins'],['JazzStandards.com','https://www.jazzstandards.com/biographies/biography_527.htm']]}],
  fontes:[['Swing (Wikipedia)',WKJ('Swing_music')]],estudos:['jz101','jz102']},
 {id:'bebop',t:'Bebop',ep:'anos 1940',cor:'#ff922e',
  hist:'Nas jam sessions de Nova York, como as do Minton\'s Playhouse, jovens músicos criaram uma música para ouvir, não para dançar: andamentos rápidos, harmonia enriquecida e frases longas cheias de cromatismo. O improvisador virou o centro do jazz.',
  aprender:'Escala bebop, cromatismo, ii-V-I rápidos, articulação das colcheias, "enclosures".',
  artistas:[
   {n:'Charlie Parker',a:'1920–1955',inst:'sax alto',txt:'"Bird" mudou a linguagem do saxofone e de todo o jazz moderno, com velocidade, invenção melódica e domínio harmônico.',f:[['Wikipedia','https://en.wikipedia.org/wiki/Charlie_Parker']]},
   {n:'Dizzy Gillespie',a:'1917–1993',inst:'trompete',txt:'Parceiro de Parker na criação do bebop, também levou ritmos afro-cubanos para o jazz.',f:[['Wikipedia','https://en.wikipedia.org/wiki/Dizzy_Gillespie']]}],
  fontes:[['Bebop (Wikipedia)',WKJ('Bebop')]],estudos:[]},
 {id:'cool',t:'Cool Jazz',ep:'fim dos anos 1940 e anos 1950',cor:'#61d7ff',
  hist:'Como resposta à intensidade do bebop, surgiu um jazz mais suave e arranjado, com sonoridades claras e dinâmicas contidas. Muito forte na Costa Oeste dos EUA, dialogou depois com a bossa nova brasileira.',
  aprender:'Som leve, frases cantáveis, controle de dinâmica, compassos ímpares (5/4).',
  artistas:[
   {n:'Paul Desmond',a:'1924–1977',inst:'sax alto',txt:'Saxofonista do Dave Brubeck Quartet, de som famoso pela leveza; compôs "Take Five", em 5/4.',f:[['Wikipedia','https://en.wikipedia.org/wiki/Paul_Desmond']]},
   {n:'Stan Getz',a:'1927–1991',inst:'sax tenor',txt:'Herdeiro do som de Lester Young, levou a bossa nova ao mundo com o disco "Getz/Gilberto" (1964), com João Gilberto e Tom Jobim.',f:[['Wikipedia','https://en.wikipedia.org/wiki/Stan_Getz']]}],
  fontes:[['Cool jazz (Wikipedia)',WKJ('Cool_jazz')]],estudos:[]},
 {id:'hardbop',t:'Hard Bop',ep:'anos 1950 e 1960',cor:'#ff6b6b',
  hist:'O hard bop manteve a linguagem do bebop e trouxe de volta a força do blues e do gospel, com grooves marcados e temas fáceis de lembrar.',
  aprender:'Blues com gospel, frases temáticas, som encorpado, desenvolvimento de motivos.',
  artistas:[
   {n:'Cannonball Adderley',a:'1928–1975',inst:'sax alto',txt:'Som cheio de alegria e blues; tocou com Miles Davis e liderou grupos de grande sucesso popular.',f:[['Wikipedia','https://en.wikipedia.org/wiki/Cannonball_Adderley']]},
   {n:'Sonny Rollins',a:'nascido em 1930',inst:'sax tenor',txt:'Mestre da improvisação temática, que desenvolve uma pequena ideia ao longo do solo; "Saxophone Colossus" (1956) é um clássico.',f:[['Wikipedia','https://en.wikipedia.org/wiki/Sonny_Rollins']]}],
  fontes:[['Hard bop (Wikipedia)',WKJ('Hard_bop')]],estudos:[]},
 {id:'modal',t:'Modal e Pós-bop',ep:'fim dos anos 1950 em diante',cor:'#a98bff',
  hist:'Com o disco "Kind of Blue" (Miles Davis, 1959), muitos músicos passaram a improvisar sobre modos (escalas) com poucas mudanças de acorde, ganhando espaço para a melodia e a exploração sonora.',
  aprender:'Modos dórico e mixolídio, pentatônicas, quartas, padrões e "sheets of sound".',
  artistas:[
   {n:'John Coltrane',a:'1926–1967',inst:'sax tenor e soprano',txt:'Gravou em "Kind of Blue" e levou o jazz a novos limites com "Giant Steps" e "A Love Supreme".',f:[['Wikipedia','https://en.wikipedia.org/wiki/John_Coltrane']]},
   {n:'Wayne Shorter',a:'1933–2023',inst:'sax tenor e soprano',txt:'Saxofonista e um dos maiores compositores do jazz; passou pelos Jazz Messengers, pelo quinteto de Miles Davis e fundou o Weather Report.',f:[['Wikipedia','https://en.wikipedia.org/wiki/Wayne_Shorter']]}],
  fontes:[['Modal jazz (Britannica)','https://www.britannica.com/art/modal-jazz'],['Kind of Blue (Britannica)','https://www.britannica.com/topic/Kind-of-Blue']],estudos:[]},
 {id:'brasil',t:'Jazz Brasileiro',ep:'dos anos 1950 até hoje',cor:'#53e6a8',
  hist:'Músicos brasileiros uniram a linguagem do jazz ao choro, ao samba, à gafieira e às raízes afro-brasileiras, criando uma escola própria e respeitada no mundo todo.',
  aprender:'Síncopes do samba e do choro, frases de gafieira, harmonia brasileira.',
  artistas:[
   {n:'Moacir Santos',a:'1926–2006',inst:'sax, maestro e arranjador',txt:'Pernambucano do Sertão do Pajeú, saxofonista, maestro e professor. Seu disco "Coisas" (1965) é um marco da música instrumental brasileira; em 2026 completou 100 anos de nascimento.',f:[['Wikipedia','https://en.wikipedia.org/wiki/Moacir_Santos'],['Blue Note','https://www.bluenote.com/artist/moacir-santos/']]},
   {n:'Paulo Moura',a:'1932–2010',inst:'sax e clarinete',txt:'Transitou com a mesma maestria entre o choro, a gafieira, o jazz e a música de concerto.',f:[['Wikipedia','https://pt.wikipedia.org/wiki/Paulo_Moura']]}],
  fontes:[],estudos:[]}];
const JAZZ_ALEM=[['Jamey Aebersold • Play-a-longs (Vol. 1 "How to Play Jazz")','https://www.jazzbooks.com'],['Jim Snidero • Easy e Intermediate Jazz Conception (Advance Music)','https://www.schott-music.com/en/brands/advance-music'],['Charlie Parker • Omnibook (Hal Leonard)','https://www.halleonard.com/product/4001/charlie-parker-omnibook'],['Lennie Niehaus • Basic Jazz Conception for Saxophone',''],['David Baker • The Jazz Style of John Coltrane','']];

function jazzPode(){const u=curUser();if(isOwner()||jzCriador())return true;if(!u||!JAZZ_PLANOS.includes(u.plan))return false;return planActive()}
/* o professor vê a prévia como Criador ou entrando com um dos seus e-mails de Criador (mesmo sem a chave neste aparelho) */
const _jzCri={};function jzCriador(){const e=ACC.session;if(!e)return false;if(_jzCri[e]===undefined){_jzCri[e]=false;ehCriadorEmail(e).then(v=>{_jzCri[e]=v;if(v&&ACC.session===e&&['study','jazz','jazzest'].includes(page))render()})}return _jzCri[e]}
function jazzVisivel(){return isOwner()||jzCriador()||JAZZ_PUBLICO}
let JZ=null;
const lkJ=(t,u)=>u?`<a href="${u}" target="_blank" rel="noopener" style="color:#61d7ff">${t}</a>`:t;
function cardJazzEntrada(){if(!jazzVisivel())return '';return `<div class="card click" style="border:2px solid #e8ad28;background:linear-gradient(145deg,#2c2347,#13294d)" onclick="go('jazz')"><div class="tiny">${JAZZ_PUBLICO?'NOVO • PLANOS TRIMESTRAL, SEMESTRAL, ANUAL E VITALÍCIO':'PRÉVIA DO PROFESSOR • ainda não aparece para os alunos'}</div><h2 style="margin:6px 0">🎷 Jazz: estilos e mestres</h2><p class="sub" style="margin:0">Estudos originais no estilo dos grandes saxofonistas, do swing ao jazz brasileiro, com a história de cada um.</p></div>`}
function jazz(){const pode=jazzPode();shell(`<div class="sub">MÉTODO AVANÇADO • JAZZ</div><h1>Estilos e mestres 🎷</h1>
 ${JAZZ_PUBLICO?'':'<div class="card" style="border:2px dashed #e8ad28"><b>Prévia do professor.</b> <span class="sub">Os alunos ainda não veem esta área. Quando você aprovar os estudos, ela é liberada para os planos Trimestral, Semestral, Anual e Vitalício.</span></div>'}
 ${pode?'':`<div class="card" style="border:2px solid #e8ad28"><b>🔒 Exclusivo dos planos Trimestral, Semestral, Anual e Vitalício.</b><p class="sub" style="margin:4px 0">Leia a história de cada estilo à vontade; os estudos ficam liberados ao mudar de plano.</p><button class="btn gold" onclick="go('plans')">Conhecer os planos</button></div>`}
 <p class="sub">Os estudos vão do mais fácil ao mais difícil, estilo por estilo. Todos são <b>composições originais MUSICALIS</b> na linguagem de cada escola.</p>
 ${JAZZ.map((s,i)=>`<div class="card click" style="border-left:5px solid ${s.cor}" onclick="JZ='${s.id}';go('jazzest')"><div class="tiny">${i+1}. ${s.ep.toUpperCase()}</div><h3 style="margin:4px 0">${s.t}</h3><p class="sub" style="margin:0">${s.artistas.map(a=>a.n).join(' • ')}</p><span class="pill">${s.estudos.length?s.estudos.length+' estudos':'em preparação'}</span></div>`).join('')}
 <div class="card"><h3>📚 Para ir além</h3><p class="sub">Livros de referência para quem quer se aprofundar (vendidos pelas editoras):</p><ul style="margin:6px 0 0 18px;padding:0;line-height:1.6">${JAZZ_ALEM.map(([t,u])=>`<li>${lkJ(t,u)}</li>`).join('')}</ul></div>`)}
function jazzEst(){const s=JAZZ.find(x=>x.id===JZ)||JAZZ[0],pode=jazzPode();
 const fonte=f=>f.map(([t,u])=>lkJ(t,u)).join(' • ');
 shell(`<button class="btn alt" style="width:auto;margin:0 0 8px" onclick="go('jazz')">← Estilos</button><div class="sub">${s.ep.toUpperCase()}</div><h1>${s.t}</h1>
 <div class="card" style="border-left:5px solid ${s.cor}"><h3>📖 A história</h3><p style="line-height:1.55;margin:0">${s.hist}</p><p class="sub" style="margin:8px 0 0"><b>O que você vai treinar:</b> ${s.aprender}</p>${s.fontes.length?`<p class="tiny" style="margin:8px 0 0">Leia mais: ${fonte(s.fontes)}</p>`:''}</div>
 ${s.artistas.map(a=>`<div class="card"><h3 style="margin:0">${a.n} <span class="tiny">(${a.a}) • ${a.inst}</span></h3><p style="line-height:1.55;margin:6px 0">${a.txt}</p><p class="tiny" style="margin:0">Fontes: ${fonte(a.f)}</p></div>`).join('')}
 <h2 style="margin-top:18px">🎼 Estudos (do mais fácil ao mais difícil)</h2>
 ${s.estudos.length?s.estudos.map((id,i)=>{const x=M2EX[id];return `<div class="card ${pode?'click':'locked'}" onclick="abrirJazz('${id}')"><div class="tiny">ESTUDO ${i+1} • ${x.bpm} BPM • swing</div><h3 style="margin:4px 0">${pode?'':'🔒 '}${x.t}</h3><p class="sub" style="margin:0">${x.obj}</p></div>`}).join(''):'<div class="card"><p class="sub" style="margin:0">Os estudos deste estilo estão sendo compostos e chegam em breve.</p></div>'}`)}
function abrirJazz(id){if(!jazzPode()){toast('Exclusivo dos planos Trimestral, Semestral, Anual e Vitalício');go('plans');return}openM2(id)}
/* ao terminar um estudo de jazz, volta para a página do estilo */
{const a=closeMeter;closeMeter=async function(){const j=typeof curEx==='string'&&JAZZ_EX[curEx];const r=await a();if(j){page='jazzest';render()}return r}}
{const a=render;render=function(){if(ACC.session&&page==='jazz'){if(!jazzVisivel()){page='study';a();return}jazz();nav();return}if(ACC.session&&page==='jazzest'){if(!jazzVisivel()){page='study';a();return}jazzEst();nav();return}
 a();if(ACC.session&&page==='study'&&!document.getElementById('jazz-entrada')){const h=cardJazzEntrada();if(h)inserirTopo(h.replace('<div class="card click"','<div id="jazz-entrada" class="card click"'))}}}
