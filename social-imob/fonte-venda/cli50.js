/* ================= v5.0 — VERSÃO DE VENDA: cadastro por profissão, plano automático, IA com cota, planos ================= */
var CLI_WA = '5551984168848', CLI_WA_TXT = '(51) 98416-8848', CLI_PIX = '';
var CLI_PACKS = __PACKS__;
var CLI_DIAS_PADRAO = [1,2,3,4,5];
var CLI_HORAS = {manha:'08:00', almoco:'12:00', tarde:'17:00', noite:'19:00'};
var CLI_REDES = [['Instagram','📸'],['TikTok','🎵'],['YouTube','▶️'],['Facebook','📘'],['LinkedIn','💼'],['Google','📍'],['WhatsApp','💬']];
var CLI_OBJ = ['Mais clientes pelo WhatsApp','Autoridade na minha área','Vender um serviço ou produto','Agenda cheia','Crescer seguidores na região'];
var CLI_TOM = ['Próximo e simples','Técnico e direto','Divertido e leve','Premium e elegante'];

function cliPack(){ var k = (S.cfg.cli||{}).pack || 'outra'; return CLI_PACKS.packs.filter(function(p){ return p.k===k; })[0] || CLI_PACKS.packs[CLI_PACKS.packs.length-1]; }
function cliDiaISO(d){ return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString(); }
function cliDiasEntre(a, b){ return Math.ceil((new Date(b) - new Date(a)) / 86400000); }

/* ---------- licença ---------- */
function cliLic(){ S.cfg.lic = S.cfg.lic || {}; return S.cfg.lic; }
function cliEstado(){
  var L = cliLic(), agora = new Date();
  if(L.plano){
    if(L.plano==='vitalicio') return {ativo:true, tipo:'plano', plano:'vitalicio', nome:SL_NOME.vitalicio, dias:Infinity};
    var v = new Date(L.venc); if(v > agora) return {ativo:true, tipo:'plano', plano:L.plano, nome:SL_NOME[L.plano], venc:L.venc, dias:cliDiasEntre(agora, v)};
  }
  if(L.testeIni){ var fim = new Date(new Date(L.testeIni).getTime() + SL_TESTE_DIAS*86400000); if(fim > agora && !L.plano) return {ativo:true, tipo:'teste', plano:'teste', nome:SL_NOME.teste, venc:fim.toISOString(), dias:cliDiasEntre(agora, fim)}; }
  return {ativo:false, tipo:'expirado', plano:L.plano||'', nome:L.plano ? SL_NOME[L.plano]+' (vencido)' : 'Teste encerrado', dias:0};
}
function cliIA(){
  var L = cliLic(), E = cliEstado(), agora = new Date();
  if(!E.ativo) return {ativo:false, motivo:'plano'};
  if(E.tipo==='teste'){ var u = L.iaTeste||0; return {ativo:true, teste:true, cota:SL_IA_COTA.teste, usados:u, restante:Math.max(0, SL_IA_COTA.teste-u), ate:E.venc}; }
  var ia = L.ia; if(!ia || new Date(ia.ate) <= agora) return {ativo:false, motivo:'ia', plano:E.plano, cota:SL_IA_COTA[E.plano]};
  var cota = SL_IA_COTA[E.plano] + (ia.bonus||0);
  return {ativo:true, cota:cota, usados:ia.usados||0, restante:Math.max(0, cota-(ia.usados||0)), ate:ia.ate, dias:cliDiasEntre(agora, ia.ate)};
}
function cliAtivar(cod){
  var r = slValidar(cod), L = cliLic();
  if(!r.ok) return {ok:false, msg:slMotivo(r.motivo)};
  L.usados = L.usados || [];
  if(L.usados.indexOf(r.limpo)>=0) return {ok:false, msg:'Este código já foi usado neste aparelho.'};
  var E = cliEstado(), agora = new Date();
  if(r.tipo==='ia'){
    if(!(E.ativo && E.tipo==='plano')) return {ok:false, msg:'O Conteúdo com IA é um adicional do plano. Ative primeiro o código do seu plano e depois este.'};
    var ia = L.ia;
    if(ia && new Date(ia.ate) > agora){ ia.ate = new Date(new Date(ia.ate).getTime() + 30*86400000).toISOString(); ia.bonus = (ia.bonus||0) + SL_IA_COTA[E.plano]; }
    else L.ia = {ini:agora.toISOString(), ate:new Date(agora.getTime() + 30*86400000).toISOString(), usados:0, bonus:0};
    L.usados.push(r.limpo); return {ok:true, msg:'Conteúdo com IA ativado por 30 dias: '+cliIA().restante+' conteúdos disponíveis. ✨'};
  }
  var meses = SL_MESES[r.tipo], base = r.emissao;
  if(L.plano && L.plano!=='vitalicio' && L.venc && new Date(L.venc) > base) base = new Date(L.venc);
  L.plano = r.tipo; L.venc = meses ? new Date(base.getFullYear(), base.getMonth()+meses, base.getDate(), 23, 59, 59).toISOString() : '';
  L.ativadoEm = agora.toISOString(); L.usados.push(r.limpo);
  return {ok:true, msg:SL_NOME[r.tipo]+' ativado'+(L.venc ? ' até '+new Date(L.venc).toLocaleDateString('pt-BR') : ' para sempre')+'. Obrigado! 🎉'};
}
function cliPreco(v){ return 'R$ '+v.toFixed(2).replace('.',','); }
var CLI_VAL = {mensal:49.9, semestral:179.9, anual:297, vitalicio:997, ia:49.9};
function cliLinkCompra(plano, comIA){
  var t = 'Olá! Quero comprar o Social Imob 360 PRO.\n\nPlano: '+SL_NOME[plano]+' ('+SL_PRECO[plano]+' '+SL_PERIODO[plano]+')'+(comIA ? '\nAdicional: Conteúdo com IA ('+SL_PRECO.ia+' a cada 30 dias, '+SL_IA_COTA[plano]+' conteúdos)\nTotal agora: '+cliPreco(CLI_VAL[plano]+CLI_VAL.ia) : '\nTotal: '+SL_PRECO[plano])+
    ((S.cfg.cli||{}).nome ? '\n\nNome: '+S.cfg.cli.nome+((S.cfg.cli||{}).prof ? ' ('+S.cfg.cli.prof+')' : '') : '');
  return 'https://wa.me/'+CLI_WA+'?text='+encodeURIComponent(t);
}
function cliLinkIA(){ var E = cliEstado(); var t = 'Olá! Quero ativar o Conteúdo com IA no Social Imob 360 PRO ('+SL_PRECO.ia+' por 30 dias, '+(SL_IA_COTA[E.plano]||SL_IA_COTA.mensal)+' conteúdos no '+(SL_NOME[E.plano]||'meu plano')+').'+((S.cfg.cli||{}).nome ? '\nNome: '+S.cfg.cli.nome : ''); return 'https://wa.me/'+CLI_WA+'?text='+encodeURIComponent(t); }

function cliPlanosHtml(){
  var plano = function(k, dest){
    var cota = SL_IA_COTA[k];
    return '<div class="cli-plano'+(dest?' dest':'')+'">'+(dest?'<span class="cli-selo">Mais escolhido</span>':'')+'<h3>'+SL_NOME[k]+'</h3><div class="cli-preco">'+SL_PRECO[k]+'</div><div class="sub">'+SL_PERIODO[k]+'</div>'+
      '<ul><li>Calendário e roteiros da sua profissão</li><li>Estúdio: câmera + teleprompter</li><li>Coordenador e Stories criativos</li></ul>'+
      '<div class="cli-ia"><b>✨ + Conteúdo com IA</b><br>'+SL_PRECO.ia+' a cada 30 dias · <b>'+cota+' conteúdos</b> feitos sob medida para o seu perfil</div>'+
      '<a class="btn" href="'+cliLinkCompra(k, false)+'" target="_blank" rel="noopener">Quero só o plano</a>'+
      '<a class="btn acc" href="'+cliLinkCompra(k, true)+'" target="_blank" rel="noopener">Plano + IA · '+cliPreco(CLI_VAL[k]+CLI_VAL.ia)+'</a></div>';
  };
  return '<div class="cli-planos">'+plano('mensal')+plano('semestral')+plano('anual', true)+plano('vitalicio')+'</div>'+
    '<div class="card" style="margin-top:12px"><h3>Como comprar</h3><ol class="sub" style="margin:6px 0 0 18px"><li>Escolha o plano e toque no botão: abre o WhatsApp com o pedido pronto.</li><li>Pague por Pix'+(CLI_PIX ? ' (chave: <b>'+esc(CLI_PIX)+'</b>)' : ' (a chave é enviada no WhatsApp)')+' e mande o comprovante.</li><li>Você recebe o código de ativação e cola aqui embaixo. Pronto.</li></ol>'+
    '<p class="hint">O Conteúdo com IA renova a cada 30 dias e é opcional. Sem ele, o app continua criando o seu calendário e os roteiros da sua profissão sem internet.</p></div>';
}
function cliAtivarHtml(){ return '<div class="card"><h3>🔑 Já tenho um código</h3><div class="row"><input type="text" id="cliCod" placeholder="XXXX-XXX-XXX" style="flex:1;text-transform:uppercase;font-family:monospace;font-size:18px"><button class="btn acc" data-cli="ativar">Ativar</button></div><p class="hint" id="cliCodMsg"></p></div>'; }
function cliTelaPlanos(){
  var E = cliEstado();
  abrirModal('<div class="mh"><h2>💎 Planos do Social Imob 360 PRO</h2><button class="btn sm ghost x" data-act="fechar">✕</button></div>'+
    '<p class="sub">Agora: <b>'+esc(E.nome)+'</b>'+(E.ativo && E.dias!==Infinity ? ' · '+E.dias+' dia(s) restante(s)' : '')+'</p>'+cliAtivarHtml()+cliPlanosHtml());
}
function cliBloqueio(){
  var E = cliEstado(), b = document.getElementById('cliBloq');
  if(E.ativo){ if(b) b.remove(); return false; }
  if(!b){ b = document.createElement('div'); b.id = 'cliBloq'; document.body.appendChild(b); }
  b.innerHTML = '<div class="cli-bloq-in"><h2>'+(cliLic().plano ? '⏰ O seu plano venceu' : '⏰ O seu teste grátis terminou')+'</h2>'+
    '<p class="sub">Os seus conteúdos continuam guardados neste aparelho. Escolha um plano para continuar de onde parou.</p>'+
    cliAtivarHtml()+cliPlanosHtml()+
    '<div class="row" style="justify-content:center;margin:14px 0"><button class="btn" data-act="backup">💾 Baixar backup dos meus dados</button><a class="btn" href="https://wa.me/'+CLI_WA+'" target="_blank" rel="noopener">💬 Falar no WhatsApp '+CLI_WA_TXT+'</a></div></div>';
  return true;
}
function cardPlanoCli(){
  var E = cliEstado(), I = cliIA();
  var s = '<div class="card" id="cardPlano"><h2><span class="panel-n">💎</span>Meu plano</h2><p class="sub"><b>'+esc(E.nome)+'</b>'+(E.venc ? ' · até '+new Date(E.venc).toLocaleDateString('pt-BR')+' ('+E.dias+' dia(s))' : (E.plano==='vitalicio'?' · sem vencimento':''))+'</p>';
  s += I.ativo ? '<p class="sub">✨ Conteúdo com IA: <b>'+I.restante+' de '+I.cota+'</b> disponíveis'+(I.teste?' no teste':' até '+new Date(I.ate).toLocaleDateString('pt-BR'))+'.</p>'+cliBarra(I.usados, I.cota)
    : '<p class="sub">✨ Conteúdo com IA: desligado. '+SL_PRECO.ia+' a cada 30 dias'+(E.tipo==='plano' ? ' · '+SL_IA_COTA[E.plano]+' conteúdos no seu plano' : '')+'.</p>';
  s += '<div class="row" style="margin-top:8px;flex-wrap:wrap"><button class="btn acc" data-cli="planos">💎 Ver planos e ativar código</button><button class="btn" data-cli="cadastro">🧑‍💼 Editar meu perfil profissional</button></div></div>';
  return s;
}
function cliBarra(u, t){ var pc = Math.min(100, Math.round(u*100/Math.max(1,t))); return '<div style="background:var(--row2);border-radius:8px;height:10px;overflow:hidden;margin:4px 0 8px"><div style="width:'+pc+'%;height:10px;background:var(--acc)"></div></div>'; }

/* ---------- cadastro profissional ---------- */
var CAD = {passo:1, d:null};
function cliCadastro(){
  var c = S.cfg.cli || {};
  CAD.d = JSON.parse(JSON.stringify(c)); CAD.d.redes = CAD.d.redes || {Instagram:''}; CAD.d.dias = CAD.d.dias || CLI_DIAS_PADRAO.slice(); CAD.d.videos = CAD.d.videos==null ? 5 : CAD.d.videos; CAD.d.dias = c.dias || [1,2,3,4,5,6]; CAD.d.camera = CAD.d.camera==null ? true : CAD.d.camera; CAD.d.hora = CAD.d.hora || 'noite'; CAD.d.tom = CAD.d.tom || CLI_TOM[0]; CAD.d.obj = CAD.d.obj || CLI_OBJ[0];
  CAD.passo = 1; cliCadRender();
}
function cliCadRender(){
  var d = CAD.d, p = CAD.passo, s = '<div class="mh"><h2>🧑‍💼 Seu perfil profissional · '+p+'/5</h2>'+(S.cfg.cli?'<button class="btn sm ghost x" data-act="fechar">✕</button>':'')+'</div><div class="cli-passos">'+[1,2,3,4,5].map(function(i){ return '<i class="'+(i<=p?'on':'')+'"></i>'; }).join('')+'</div>';
  if(p===1){
    s += '<p class="sub">Qual é a sua profissão? O app monta o calendário e os roteiros a partir dela.</p><div class="cli-profs">'+CLI_PACKS.packs.map(function(pk){ return '<button class="cli-prof'+(d.pack===pk.k?' on':'')+'" data-cpack="'+pk.k+'"><b>'+pk.ic+'</b>'+esc(pk.nome)+'</button>'; }).join('')+'</div>'+
      '<label class="f">Como você se apresenta (profissão ou cargo)</label><input type="text" id="cdProf" value="'+esc(d.prof||'')+'" placeholder="Ex.: dentista especialista em implantes">';
  } else if(p===2){
    var pk = CLI_PACKS.packs.filter(function(x){ return x.k===d.pack; })[0] || {};
    s += '<label class="f">Seu nome (como aparece nos vídeos)</label><input type="text" id="cdNome" value="'+esc(d.nome||'')+'" placeholder="Ex.: Dra. Paula Souza">'+
      '<label class="f">Registro profissional (se tiver)</label><input type="text" id="cdReg" value="'+esc(d.reg||'')+'" placeholder="Ex.: CRO-RS 12345, OAB/RS 9999, CRECI 00000">'+
      '<label class="f">Cidade e região onde atende</label><input type="text" id="cdCidade" value="'+esc(d.cidade||'')+'" placeholder="Ex.: Porto Alegre e região metropolitana">'+
      '<label class="f">WhatsApp de atendimento</label><input type="tel" id="cdWpp" value="'+esc(d.wpp||'')+'" placeholder="(51) 9…">';
  } else if(p===3){
    var pk2 = CLI_PACKS.packs.filter(function(x){ return x.k===d.pack; })[0] || {servicos:[]};
    s += '<label class="f">Seus serviços ou produtos (separe por vírgula)</label><textarea id="cdServ" placeholder="'+esc((pk2.servicos||[]).join(', ') || 'Ex.: consultoria, curso, atendimento')+'">'+esc(d.servicos || (pk2.servicos||[]).join(', '))+'</textarea>'+
      '<label class="f">Quem é o seu cliente ideal</label><input type="text" id="cdPub" value="'+esc(d.publico||'')+'" placeholder="Ex.: mulheres de 30 a 50 anos que querem cuidar da pele">'+
      '<label class="f">O seu diferencial (uma frase)</label><input type="text" id="cdDif" value="'+esc(d.diferencial||'')+'" placeholder="Ex.: atendimento com hora marcada e acompanhamento pelo WhatsApp">'+
      '<label class="f">Objetivo principal</label><select id="cdObj">'+CLI_OBJ.map(function(o){ return '<option '+(d.obj===o?'selected':'')+'>'+o+'</option>'; }).join('')+'</select>'+
      '<label class="f">Tom de voz</label><select id="cdTom">'+CLI_TOM.map(function(o){ return '<option '+(d.tom===o?'selected':'')+'>'+o+'</option>'; }).join('')+'</select>'+
      '<label class="f">Bordão (opcional): a sua frase marca registrada no fim de cada vídeo</label><input type="text" id="cdBord" value="'+esc(d.bordao||'')+'" placeholder="Deixe em branco se não quiser agora">'+
      '<div class="chips" id="cdBordSug" style="margin-top:6px">'+cliSugBordao(d).map(function(x){ return '<span class="chip" data-cbord="'+esc(x)+'">'+esc(x)+'</span>'; }).join('')+'</div>'+
      '<p class="hint">Toque numa sugestão para usar, ou <a href="#" data-cli="bordaoIA">peça 5 opções à IA</a>. Dá para mudar depois em ⚙️ Ajustes → Meu perfil profissional.</p>';
  } else if(p===4){
    s += '<p class="sub">Em quais redes você publica? Escreva o @ ou o nome de cada uma.</p>'+CLI_REDES.map(function(r){ var on = d.redes[r[0]]!=null; return '<div class="row cli-rede"><label class="row" style="gap:8px;min-width:130px"><input type="checkbox" class="chk" data-crede="'+r[0]+'" '+(on?'checked':'')+'><b>'+r[1]+' '+r[0]+'</b></label><input type="text" data-crarr="'+r[0]+'" value="'+esc(d.redes[r[0]]||'')+'" placeholder="'+(r[0]==='WhatsApp'?'Número':r[0]==='Google'?'Nome no Google':'@seuperfil')+'" style="flex:1" '+(on?'':'disabled')+'></div>'; }).join('');
  } else {
    s += '<p class="sub">Sua disponibilidade. O calendário segue o seu ritmo, não o contrário.</p><label class="f">Dias em que você pode publicar</label><div class="chips">'+DIAS.map(function(n, i){ return '<span class="chip'+(d.dias.indexOf(i)>=0?' on':'')+'" data-cdia2="'+i+'">'+n+'</span>'; }).join('')+'</div>'+
      '<div class="cli-ia" style="margin:10px 0"><b>📏 Regra 360 recomendada</b><br>Por semana: 5 Reels, 2 posts de autoridade, 1 carrossel com o resumo da semana e 1 a 2 Stories por dia, todos sobre o tema da semana. YouTube: 1 vídeo por semana. Ajuste abaixo ao seu ritmo.</div>'+
      '<label class="f">Quantos vídeos (Reels) por semana você consegue gravar?</label><select id="cdVid">'+[0,1,2,3,4,5].map(function(n){ return '<option value="'+n+'" '+(+d.videos===n?'selected':'')+'>'+(n?n+' vídeo'+(n>1?'s':'')+' de até 50 s':'Nenhum (só posts e carrosséis)')+'</option>'; }).join('')+'</select>'+
      '<label class="row" style="gap:8px;margin:12px 0"><input type="checkbox" class="chk" id="cdCam" '+(d.camera?'checked':'')+'><span>Eu apareço nos vídeos (se desmarcar, o app sugere vídeos com tela, texto e bastidores)</span></label>'+
      '<label class="f">Melhor horário para publicar</label><select id="cdHora">'+[['manha','Manhã (8h)'],['almoco','Almoço (12h)'],['tarde','Fim da tarde (17h)'],['noite','Noite (19h)']].map(function(o){ return '<option value="'+o[0]+'" '+(d.hora===o[0]?'selected':'')+'>'+o[1]+'</option>'; }).join('')+'</select>';
  }
  s += '<div class="row" style="margin-top:16px;justify-content:space-between">'+(p>1?'<button class="btn" data-cli="cadVoltar">← Voltar</button>':'<span></span>')+(p<5?'<button class="btn acc" data-cli="cadSeguir">Continuar →</button>':'<button class="btn acc" data-cli="cadFim">'+(S.cfg.cli?'💾 Salvar':'🚀 Montar meu plano')+'</button>')+'</div>';
  abrirModal(s);
  $all('#modal [data-cpack]').forEach(function(b){ b.onclick = function(){ d.pack = b.dataset.cpack; var pk = CLI_PACKS.packs.filter(function(x){ return x.k===d.pack; })[0]; var pf = $('#cdProf'); if(pf && (!pf.value || CLI_PACKS.packs.some(function(x){ return x.prof===pf.value; }))) pf.value = pk.prof; d.prof = pf ? pf.value : d.prof; cliCadRender(); }; });
  $all('#modal [data-crede]').forEach(function(b){ b.onchange = function(){ var r = b.dataset.crede; if(b.checked) d.redes[r] = d.redes[r]||''; else delete d.redes[r]; var i = $('#modal [data-crarr="'+r+'"]'); if(i) i.disabled = !b.checked; }; });
  $all('#modal [data-cbord]').forEach(function(b){ b.onclick = function(){ var i = $('#cdBord'); if(i){ i.value = b.dataset.cbord; i.focus(); } }; });
  $all('#modal [data-cdia2]').forEach(function(b){ b.onclick = function(){ var i = +b.dataset.cdia2, k = d.dias.indexOf(i); if(k>=0) d.dias.splice(k,1); else d.dias.push(i); d.dias.sort(); b.classList.toggle('on'); }; });
}
function cliSugBordao(d){
  var nome = (d.nome||'').trim() || 'Seu nome', prof = (d.prof||'profissional').trim(), cid = String(d.cidade||'').split(/,| e /)[0].trim();
  return ['Eu sou '+nome+': '+prof+' que explica para você decidir com segurança.', nome+', '+prof+(cid?' em '+cid:'')+': quem cuida, explica.', 'Eu sou '+nome+'. '+prof.charAt(0).toUpperCase()+prof.slice(1)+' com propósito, atendimento com verdade.'];
}
function cliPedidoBordao(){ var d = Object.assign({}, S.cfg.cli||{}, CAD.d||{});
  return 'Crie 5 opções de BORDÃO (frase marca registrada, curta, até 12 palavras, fácil de falar no fim de cada vídeo) para este profissional:\n- Nome: '+(d.nome||'')+'\n- Profissão: '+(d.prof||'')+'\n- Cidade: '+(d.cidade||'')+'\n- Diferencial: '+(d.diferencial||'')+'\n- Tom de voz: '+(d.tom||'')+'\nRegras: sem promessa de resultado, respeitando as regras de publicidade da profissão; pode começar com "Eu sou [nome]". Responda só com as 5 frases, uma por linha.'; }
function cliCadLer(){
  var d = CAD.d, v = function(id){ var e = $('#'+id); return e ? e.value.trim() : null; };
  if(CAD.passo===1){ d.prof = v('cdProf') || d.prof; }
  if(CAD.passo===2){ d.nome = v('cdNome'); d.reg = v('cdReg'); d.cidade = v('cdCidade'); d.wpp = v('cdWpp'); }
  if(CAD.passo===3){ d.servicos = v('cdServ'); d.publico = v('cdPub'); d.diferencial = v('cdDif'); d.obj = v('cdObj'); d.tom = v('cdTom'); d.bordao = v('cdBord'); }
  if(CAD.passo===4){ $all('#modal [data-crarr]').forEach(function(i){ if(d.redes[i.dataset.crarr]!=null) d.redes[i.dataset.crarr] = i.value.trim(); }); }
  if(CAD.passo===5){ d.videos = +v('cdVid'); d.camera = $('#cdCam').checked; d.hora = v('cdHora'); }
}
function cliCadValida(){
  var d = CAD.d;
  if(CAD.passo===1 && !d.pack) return 'Escolha a sua profissão (ou "Outra profissão").';
  if(CAD.passo===1 && !d.prof) return 'Escreva como você se apresenta.';
  if(CAD.passo===2 && !d.nome) return 'Escreva o seu nome.';
  if(CAD.passo===2 && !d.cidade) return 'Escreva a cidade ou região onde atende.';
  if(CAD.passo===4 && !Object.keys(d.redes).length) return 'Marque pelo menos uma rede.';
  if(CAD.passo===5 && !d.dias.length) return 'Escolha pelo menos um dia para publicar.';
  return '';
}
function cliAplicarCadastro(d){
  var primeira = !S.cfg.cli, pk = CLI_PACKS.packs.filter(function(x){ return x.k===d.pack; })[0] || cliPack();
  S.cfg.cli = d;
  var cores = ['#1F76C2','#E2445C','#FF0000','#1877F2','#0A66C2','#FDAB3D','#00C875'], cta = 'Comente '+pk.palavra+' ou chame no WhatsApp'+(d.wpp?' '+d.wpp:'');
  var ass = d.bordao ? d.bordao : 'Eu sou '+d.nome+(d.prof?', '+d.prof:'')+(d.cidade?' em '+d.cidade.split(/[,e]\s/)[0]:'')+'.';
  Object.keys(d.redes).forEach(function(r, i){
    var k = 'p'+norm(r).slice(0,6), ex = S.cfg.perfis.filter(function(p){ return p.k===k; })[0];
    garantirRede(r);
    var dados = {k:k, nome:d.nome+(r==='Instagram'?'':' · '+r), arroba:d.redes[r] || (r==='WhatsApp' ? d.wpp||'WhatsApp' : d.nome), rede:r, cor:cores[i % cores.length], cta:cta, assinatura:ass, ic:(CLI_REDES.filter(function(x){ return x[0]===r; })[0]||['','📣'])[1]};
    if(ex) Object.keys(dados).forEach(function(x){ if(x!=='cor' || !ex.cor) ex[x] = dados[x]; }); else S.cfg.perfis.push(dados);
    S.cfg.hashtags[k] = cliHashtags(pk, d);
  });
  S.cfg.whatsapp = String(d.wpp||'').replace(/\D/g,'');
  document.body.classList.toggle('cli-sem-imoveis', d.pack!=='corretor');
  return salvarCfg().then(function(){ return primeira || !S.conteudos.length ? cliGerarPlano(4) : 0; });
}
function cliHashtags(pk, d){ var cid = norm(String(d.cidade||'').split(/,| e /)[0]); return pk.hashtags.concat(cid ? ['#'+cid] : []).slice(0,5).join(' '); }

/* ---------- gerador offline ---------- */
function cliSubst(t, d){
  var serv = String(d.servicos||'').split(',').map(function(x){ return x.trim(); }).filter(Boolean);
  return String(t||'').replace(/\{nome\}/g, d.nome||'').replace(/\{prof\}/g, d.prof||'profissional').replace(/\{cidade\}/g, (d.cidade||'sua região').split(/,/)[0])
    .replace(/\{servico\}/g, serv[0] || d.prof || 'este serviço').replace(/\{publico\}/g, d.publico || 'quem procura o meu trabalho').replace(/\{diferencial\}/g, d.diferencial || 'Atendimento próximo, com acompanhamento em cada etapa.');
}
var CLI_GUIA_RE = /^(Conte|Mostre|Diga|Descreva|Fale|Explique|Apresente|Responda|Termine|Convide|Escolha um|Pergunte|Item \d|Dica \d)/;
function cliTemas(){ var pk = cliPack(); return pk.temas.map(function(t){ return {t:t, u:false}; }).concat(CLI_PACKS.universais.map(function(t){ return {t:t, u:true}; })); }
function cliTemasLivres(){ var us = (S.cfg.cli||{}).usados || {}, l = cliTemas().filter(function(x){ return !us[x.t.a]; }); if(l.length) return l; var lim = addDias(hoje(), -60); return cliTemas().filter(function(x){ return us[x.t.a] && us[x.t.a] < lim; }); }
function cliTexto(tm, formato, d, pk){
  var pts = tm.p.map(function(x){ x = cliSubst(x, d); return CLI_GUIA_RE.test(x) ? '['+x+']' : x; }), g = cliSubst(tm.g, d);
  var fecho = d.bordao ? d.bordao : 'Eu sou '+d.nome+(d.prof?', '+d.prof:'')+(d.cidade?' em '+d.cidade.split(/,/)[0]:'')+'.', cta = 'Comente '+pk.palavra+' que eu te explico melhor.';
  if(formato==='Carrossel') return 'CARTÃO 1 (capa): '+g+'\n'+pts.map(function(x, i){ return 'CARTÃO '+(i+2)+': '+x; }).join('\n')+'\nCARTÃO FINAL: '+cta+(d.reg?' · '+d.reg:'');
  if(formato==='Post') return g+'\n\n'+pts.join('\n\n')+'\n\n'+fecho+' '+cta;
  return g+'\n\n'+pts.join('\n\n')+'\n\n'+fecho+' '+cta+(d.camera===false ? '\n\nComo gravar sem aparecer: use texto na tela sobre imagens do seu trabalho e grave só a voz.' : '');
}
function cliSlots(semanas, desde){
  /* Regra 360: até 5 Reels (vídeos), 2 posts de autoridade e 1 carrossel por semana, nos dias que a pessoa escolheu */
  var d = S.cfg.cli, dias = (d.dias||CLI_DIAS_PADRAO).slice().sort(function(a,b){ return ((a+6)%7)-((b+6)%7); }), nv = Math.min(d.videos==null?5:+d.videos, dias.length);
  var vdias = [], pdias = [], cdia = dias.indexOf(6)>=0 ? 6 : dias[dias.length-1];
  if(nv){ var passo = dias.length / nv; for(var i=0;i<nv;i++) vdias.push(dias[Math.floor(i*passo)]); }
  var prefP = [2,4].filter(function(x){ return dias.indexOf(x)>=0 && x!==cdia; });
  dias.forEach(function(x){ if(prefP.length<2 && prefP.indexOf(x)<0 && x!==cdia && vdias.indexOf(x)<0) prefP.push(x); });
  dias.forEach(function(x){ if(prefP.length<2 && prefP.indexOf(x)<0 && x!==cdia) prefP.push(x); });
  pdias = prefP.slice(0,2);
  var out = [], ini = desde || addDias(hoje(), 1);
  for(var k=0; k<semanas*7; k++){ var dt = addDias(ini, k), w = dow(dt);
    if(vdias.indexOf(w)>=0) out.push({data:dt, tipo:'video'});
    if(pdias.indexOf(w)>=0) out.push({data:dt, tipo:'post'});
    if(w===cdia && dias.length) out.push({data:dt, tipo:'carrossel'});
  }
  return out;
}
function cliPerfilPrincipal(){ var ps = S.cfg.perfis; return (ps.filter(function(p){ return p.rede==='Instagram'; })[0] || ps.filter(function(p){ return ['TikTok','Facebook','LinkedIn'].indexOf(p.rede)>=0; })[0] || ps[0] || {k:'definir'}).k; }
function cliNovoConteudo(tm, slot, d, pk){
  var formato = slot.tipo==='video' ? 'Reel' : slot.tipo==='carrossel' ? 'Carrossel' : 'Post';
  var k = cliPerfilPrincipal(), hora = CLI_HORAS[d.hora] || '19:00';
  var c = novoConteudo({perfil:k, rede:perfil(k).rede||'Instagram', formato:formato, etapa:'Produção', data:slot.data, hora:slot.tipo==='video' ? hora : (d.hora==='noite' ? '12:00' : hora),
    titulo:cliSubst(tm.t, d), tema:cliSubst(tm.t, d), gancho:cliSubst(tm.g, d), objetivo:slot.tipo==='post' ? 'Autoridade' : (tm.o||'Educação'), pilar:slot.tipo==='post' ? 'Autoridade' : tm.o==='Engajamento' ? 'Mito ou verdade' : 'Educativo', assunto:'cli-'+tm.a});
  c.roteiro = cliTexto(tm, formato, d, pk); c.cta = 'Comente '+pk.palavra+' ou chame no WhatsApp'+(d.wpp?' '+d.wpp:'');
  c.legenda = montarDescricao(c); c.hashtags = S.cfg.hashtags[k] || cliHashtags(pk, d);
  registrar(c, 'Criado pelo Social Imob a partir do seu perfil ('+(d.prof||pk.nome)+').');
  return c;
}
/* carrossel da semana: resume os Reels e Stories da semana (Regra 360) */
function cliCarrosselSemana(reels, slot, d, pk){
  var k = cliPerfilPrincipal(), tema = reels[0] ? reels[0].titulo : (d.prof||pk.nome);
  var c = novoConteudo({perfil:k, rede:perfil(k).rede||'Instagram', formato:'Carrossel', etapa:'Produção', data:slot.data, hora:d.hora==='noite' ? '12:00' : (CLI_HORAS[d.hora]||'12:00'),
    titulo:'Resumo da semana: '+tema, tema:tema, gancho:'O que você precisa guardar desta semana sobre '+lcPrim(tema)+'.', objetivo:'Educação', pilar:'Educativo', assunto:'cli-resumo-'+slot.data, temaSemana51:tema});
  c.roteiro = 'CARTÃO 1 (capa): '+c.gancho+'\n'+reels.slice(0,5).map(function(r, i){ return 'CARTÃO '+(i+2)+': '+r.titulo+' — '+(r.gancho||''); }).join('\n')+'\nCARTÃO FINAL: Salve este resumo e comente '+pk.palavra+'.'+(d.reg?' · '+d.reg:'');
  c.cta = 'Salve e comente '+pk.palavra; c.legenda = montarDescricao(c); c.hashtags = S.cfg.hashtags[k] || cliHashtags(pk, d);
  registrar(c, 'Carrossel da semana (Regra 360): resume os Reels e Stories da semana.');
  return c;
}
function cliYoutubeSemana(sem, reels, d, pk){
  var yt = (S.cfg.perfis||[]).filter(function(p){ return p.rede==='YouTube'; })[0]; if(!yt) return null;
  var data = addDias(sem, 5), tipo = reels.length ? tipoYT51(sem) : 'B', tema = reels[0] ? reels[0].titulo : (d.prof||pk.nome), L;
  if(tipo==='A'){ var ts = reels.slice(0,3).map(function(r){ return r.titulo; });
    L = {titulo:(ts[0]+(ts.length>1?' e mais '+(ts.length-1)+' temas':'')+': aula da semana').slice(0,100), roteiro:'VÍDEO A · EDUCACIONAL · tema da semana: '+tema+'\n\nABERTURA (0:00–0:40): Apresente-se e diga o que a pessoa vai aprender.\n\n'+ts.map(function(t, i){ return 'BLOCO '+(i+1)+' — '+t.toUpperCase()+': retome o Reel da semana e aprofunde com 3 pontos práticos e um exemplo.'; }).join('\n\n')+'\n\nPERGUNTAS DO PÚBLICO: responda duas dúvidas reais dos comentários ou do direct.\n\nFECHAMENTO: resumo em três frases e a chamada para o WhatsApp.\n\nComo gravar: 6 a 10 minutos. Depois, gere cortes de 30 a 50 s (CapCut ou outro app de cortes) para Reels, Shorts e Stories.', descricao:'', cta:'Inscreva-se e comente sua dúvida'}; }
  else L = tipo==='B' ? ytB51(yt.k, yt.k, sem, tema) : ytC51(yt.k, yt.k, sem, tema, reels);
  var c = novoConteudo({perfil:yt.k, rede:'YouTube', formato:'YouTube', etapa:'Produção', data:data, hora:'17:00', titulo:L.titulo, tema:tema, gancho:'', roteiro:L.roteiro, cta:L.cta, objetivo:tipo==='A'?'Educação':'Autoridade', pilar:tipo==='C'?'Live':'Educativo', assunto:'cli-yt-'+sem});
  c.ytTipo = tipo; c.legenda = (L.descricao || L.titulo).replace(/#\S+(\s+#\S+)*\s*$/,'').trim(); c.hashtags = S.cfg.hashtags[yt.k] || cliHashtags(pk, d); c.topicos = true;
  registrar(c, 'YouTube da semana (Regra 360): vídeo '+tipo+'.');
  return c;
}
function cliGerarPlano(semanas, desde){
  var d = S.cfg.cli; if(!d) return Promise.resolve(0);
  var pk = cliPack(), livres = cliTemasLivres(), us = d.usados = d.usados || {}, novos = [];
  var ocup = {}; S.conteudos.forEach(function(c){ if(!c.deriv && c.data) ocup[c.data+'|'+(c.formato==='Reel'?'video':c.formato==='Carrossel'?'carrossel':c.formato==='YouTube'?'yt':'post')] = 1; });
  if(!desde){ var ult = S.conteudos.filter(function(c){ return !c.deriv && c.data && c.assunto && /^cli-/.test(c.assunto); }).map(function(c){ return c.data; }).sort().pop(); desde = ult && ult >= hoje() ? addDias(ult, 1) : addDias(hoje(), 1); }
  var pega = function(quer, pref){ var i = -1, j;
    for(j=0;j<livres.length;j++){ if(quer.indexOf(livres[j].t.f)>=0 && !livres[j].u && (!pref || livres[j].t.o===pref)){ i = j; break; } }
    if(i<0) for(j=0;j<livres.length;j++){ if(quer.indexOf(livres[j].t.f)>=0 && !livres[j].u){ i = j; break; } }
    if(i<0) for(j=0;j<livres.length;j++){ if(quer.indexOf(livres[j].t.f)>=0){ i = j; break; } }
    if(i<0 && livres.length) i = 0;
    return i<0 ? null : livres.splice(i,1)[0].t; };
  var slots = cliSlots(semanas, desde), semReels = {};
  slots.filter(function(sl){ return sl.tipo!=='carrossel'; }).forEach(function(sl){
    if(ocup[sl.data+'|'+sl.tipo]) return;
    var tm = sl.tipo==='video' ? pega(['Reel']) : pega(['Post','Carrossel'], 'Autoridade'); if(!tm) return;
    var c = cliNovoConteudo(tm, sl, d, pk); ocup[sl.data+'|'+sl.tipo] = 1;
    us[tm.a] = sl.data; novos.push(c); S.conteudos.push(c);
    if(sl.tipo==='video'){ var sm = segunda(sl.data); (semReels[sm] = semReels[sm] || []).push(c); }
  });
  slots.filter(function(sl){ return sl.tipo==='carrossel'; }).forEach(function(sl){
    if(ocup[sl.data+'|carrossel']) return; var r = semReels[segunda(sl.data)] || [];
    var c = r.length ? cliCarrosselSemana(r, sl, d, pk) : (function(){ var tm = pega(['Carrossel','Post']); return tm ? cliNovoConteudo(tm, sl, d, pk) : null; })();
    if(!c) return; ocup[sl.data+'|carrossel'] = 1; novos.push(c); S.conteudos.push(c);
  });
  Object.keys(semReels).forEach(function(sm){ if(ocup[addDias(sm,5)+'|yt']) return; var y = cliYoutubeSemana(sm, semReels[sm], d, pk); if(y && y.data >= addDias(hoje(),1)){ ocup[y.data+'|yt'] = 1; novos.push(y); S.conteudos.push(y); } });
  if(!novos.length) return Promise.resolve(0);
  var der = []; try{ der = gerarDerivados39(S.conteudos.filter(function(c){ return c.deriv; })) || []; der.forEach(function(x){ S.conteudos.push(x); }); }catch(e){ der = []; }
  try{ numerar39(); }catch(e){}
  registrarLote(novos.concat(der).map(function(c){ return [null, c]; }), 'plano do seu perfil ('+novos.length+')');
  return gravar('conteudos', novos.concat(der)).then(function(){ return salvarCfg(); }).then(function(){ return novos.length; });
}
function cliUsarTema(a){
  var tm = cliTemas().filter(function(x){ return x.t.a===a; })[0]; if(!tm) return;
  var d = S.cfg.cli, pk = cliPack(), c0 = novoConteudo({perfil:cliPerfilPrincipal(), formato:tm.t.f}), sl = slotLivre393(c0);
  var c = cliNovoConteudo(tm.t, {data:sl.data, tipo:tm.t.f==='Reel'?'video':'post'}, d, pk);
  (d.usados = d.usados || {})[a] = c.data; S.conteudos.push(c); registrarHist(null, c, 'pauta da profissão');
  gravar('conteudos', [c]).then(salvarCfg).then(function(){ render(); toastAcao('Pauta agendada para '+dataBR(c.data)+' ✔', 'Abrir', function(){ editarConteudo(c.id); }); });
}

/* ---------- Coordenador: abas do cliente ---------- */
var ABAS_COORD_CLI = [['hoje','☀️ Hoje'],['semana','🗓️ Semana'],['stories','📱 Stories'],['pautas','💡 Pautas'],['ia','✨ Criar com IA']];
function cliCoord(aba){
  var d = S.cfg.cli || {}, pk = cliPack();
  if(aba==='pautas'){
    var l = cliTemasLivres();
    return '<div class="card"><h3>💡 Pautas para '+esc(d.prof||pk.nome)+' · '+l.length+' livres</h3><p class="sub">Temas prontos da sua profissão e temas que servem para qualquer área, com os seus dados. "Usar" agenda na próxima data livre.</p>'+
      '<div class="row" style="margin:8px 0"><button class="btn acc" data-cli="gerar4">🗓️ Gerar mais 4 semanas</button></div>'+
      l.map(function(x){ return '<div class="row" style="margin:6px 0"><span style="flex:1"><b>'+esc(cliSubst(x.t.t, d))+'</b><br><small class="sub">'+esc(x.t.f)+' · '+esc(x.t.o)+' · '+esc(cliSubst(x.t.g, d))+'</small></span><button class="btn sm" data-cusarcli="'+esc(x.t.a)+'">Usar</button></div>'; }).join('')+
      (l.length ? '' : '<p class="sub">Você já usou todas as pautas prontas. Use ✨ Criar com IA para receber temas inéditos.</p>')+'</div>'+
      '<div class="card"><h3>📏 Regras da sua profissão</h3><div class="list">'+pk.regras.map(function(r){ return '<div class="it"><b>⚠️</b><div class="grow">'+esc(r)+'</div></div>'; }).join('')+'</div><p class="hint">Confira sempre as regras atualizadas do seu conselho ou entidade.</p></div>';
  }
  if(aba==='ia') return cliIAHtml();
  return '';
}
function cliIAHtml(){
  var I = cliIA(), E = cliEstado(), d = S.cfg.cli || {};
  if(!I.ativo){
    return '<div class="card cli-up"><h3>✨ Conteúdo com IA</h3><p class="sub">Roteiros, legendas e Stories <b>inéditos e sob medida</b> para '+esc(d.prof||'a sua profissão')+', com o seu nome, cidade, serviços, público e as regras do seu conselho, sem repetir o que você já publicou.</p>'+
      '<div class="cli-tab"><div><b>Mensal</b><span>'+SL_IA_COTA.mensal+'</span></div><div><b>Semestral</b><span>'+SL_IA_COTA.semestral+'</span></div><div><b>Anual</b><span>'+SL_IA_COTA.anual+'</span></div><div><b>Vitalício</b><span>'+SL_IA_COTA.vitalicio+'</span></div></div><p class="hint" style="text-align:center">conteúdos a cada 30 dias, conforme o seu plano · '+SL_PRECO.ia+' por 30 dias</p>'+
      '<div class="row" style="justify-content:center;flex-wrap:wrap"><a class="btn acc" href="'+cliLinkIA()+'" target="_blank" rel="noopener">💬 Quero o Conteúdo com IA</a><button class="btn" data-cli="planos">🔑 Ativar código</button></div></div>';
  }
  var ps = S.cfg.perfis, q = Math.min(UI.ciaQtd||Math.min(8, I.restante), I.restante);
  return '<div class="card"><h3>✨ Criar com IA</h3><p class="sub">'+(I.teste?'Teste grátis: ':'')+'<b>'+I.restante+' de '+I.cota+'</b> conteúdos disponíveis'+(I.teste?'':' até '+new Date(I.ate).toLocaleDateString('pt-BR'))+'.</p>'+cliBarra(I.usados, I.cota)+
    (I.restante ? '<div class="grid2"><div><label class="f">Perfil</label><select id="ciaPerfil">'+ps.map(function(p){ return '<option value="'+p.k+'">'+esc(p.ic+' '+p.arroba)+'</option>'; }).join('')+'</select></div><div><label class="f">Quantidade (máx. '+I.restante+')</label><input type="number" id="ciaQtd" min="1" max="'+I.restante+'" value="'+q+'"></div></div>'+
      '<label class="f">Tema ou pedido especial (opcional)</label><input type="text" id="ciaTema" placeholder="Ex.: campanha de Dia das Mães, dúvidas sobre um serviço novo…">'+
      '<ol class="sub cli-ol"><li><button class="btn acc" data-cli="iaMontar">📋 Montar e copiar o pedido</button></li><li>Abra a IA e cole o pedido: <a href="https://claude.ai/new" target="_blank" rel="noopener">Claude</a> · <a href="https://chatgpt.com/" target="_blank" rel="noopener">ChatGPT</a> · <a href="https://gemini.google.com/app" target="_blank" rel="noopener">Gemini</a></li><li>Copie a resposta inteira e cole abaixo.</li></ol>'+
      '<textarea id="ciaPedido" style="min-height:90px" readonly placeholder="O pedido aparece aqui"></textarea>'+
      '<label class="f">Resposta da IA</label><textarea id="ciaResp" style="min-height:160px" placeholder="Cole aqui a resposta com os blocos ### CONTEÚDO"></textarea><div class="row" style="margin-top:8px"><button class="btn acc" data-cli="iaImportar">📥 Colocar no meu calendário</button></div>'
    : '<p class="sub">Você usou todos os conteúdos deste período. '+(I.teste?'Escolha um plano com Conteúdo com IA para continuar.':'Renove o Conteúdo com IA para mais 30 dias.')+'</p><a class="btn acc" href="'+(I.teste?cliLinkCompra('mensal', true):cliLinkIA())+'" target="_blank" rel="noopener">💬 Renovar pelo WhatsApp</a>')+
    '</div>';
}
function cliPedidoIA(){
  var d = S.cfg.cli || {}, pk = cliPack(), I = cliIA(), k = ($('#ciaPerfil')||{}).value || cliPerfilPrincipal(), p = perfil(k);
  var q = Math.max(1, Math.min(I.restante, +(($('#ciaQtd')||{}).value) || 1)), tema = (($('#ciaTema')||{}).value||'').trim(); UI.ciaQtd = q;
  var feitos = S.conteudos.filter(function(c){ return !c.deriv && c.titulo; }).sort(ordemData).slice(-120).map(function(c){ return '- '+c.titulo; });
  var dias = (d.dias||[]).map(function(i){ return DIAS_L[i]; }).join(', ');
  return 'Você é especialista em marketing de conteúdo para redes sociais, copywriter e estrategista de algoritmo. Crie '+q+' conteúdo(s) INÉDITO(S) para este profissional.\n\n'+
    'PERFIL\n- Nome: '+(d.nome||'')+'\n- Profissão: '+(d.prof||pk.nome)+(d.reg?' ('+d.reg+')':'')+'\n- Cidade e região: '+(d.cidade||'')+'\n- Serviços: '+(d.servicos||'')+'\n- Cliente ideal: '+(d.publico||'')+'\n- Diferencial: '+(d.diferencial||'')+'\n- Objetivo: '+(d.obj||'')+'\n- Tom de voz: '+(d.tom||'')+'\n- Rede deste pedido: '+(p.rede||'Instagram')+' ('+p.arroba+')\n- Publica em: '+dias+'; '+(d.videos||0)+' vídeo(s) por semana; '+(d.camera===false?'NÃO aparece em vídeo (use texto na tela, imagens e narração)':'aparece nos vídeos')+'\n- WhatsApp: '+(d.wpp||'')+'\n'+
    (tema ? '\nPEDIDO ESPECIAL: '+tema+'\n' : '')+
    '\nCADÊNCIA (Regra 360)\n- '+REGRA51_TXT+'\n- Todos os conteúdos deste pedido giram em torno de UM tema da semana, ligados entre si e ao vídeo do YouTube da semana.\n'+(d.bordao ? '\nBORDÃO: todo vídeo termina com a frase "'+d.bordao+'", depois da chamada.\n' : '\nBORDÃO: a pessoa ainda não tem. Depois dos blocos, pergunte se ela gostaria de criar um bordão (frase marca registrada no fim de cada vídeo) e sugira 3 opções curtas ligadas à profissão.\n')+'\nREGRAS\n'+pk.regras.map(function(r){ return '- '+r; }).join('\n')+'\n- Gancho específico e concreto nos 3 primeiros segundos; um problema que o cliente reconhece; 2 a 4 pontos práticos; uma única chamada para ação com palavra-chave.\n- Vídeo (Reel) com 30 a 50 segundos de fala (75 a 125 palavras). Um vídeo serve para Reel, Story, Shorts e Status.\n- Carrossel com CARTÃO 1 (capa), CARTÃO 2... e CARTÃO FINAL.\n- Sem estatística sem fonte, sem depoimento inventado, sem promessa de resultado.\n- Misture objetivos: educação, engajamento, autoridade, captação.\n- Português do Brasil.\n'+
    '\nJÁ USADOS (não repetir assunto nem título):\n'+(feitos.join('\n')||'- nenhum')+'\n\n'+
    'Responda SOMENTE com '+q+' bloco(s) neste formato, um por conteúdo:\n### CONTEÚDO\nPerfil: '+k+'\nData: AAAA-MM-DD (a partir de '+dataBR(addDias(hoje(),1))+', nos dias em que publica)\nFormato: Reel | Post | Carrossel | Story\nTítulo: ...\nGancho: ...\nTexto: ... (texto falado completo, ou CARTÃO 1:, CARTÃO 2:...)\nDescrição: ...\nHashtags: ... (3 a 5, do tema e da cidade)\nCTA: ...\nObjetivo: Educação | Engajamento | Autoridade | Lead | Venda\nAssunto: palavra-chave-curta-do-tema\n';
}
function cliImportarIA(txt){
  var I = cliIA(); if(!I.ativo || !I.restante) return Promise.resolve({n:0, msg:'Sem conteúdos disponíveis no período.'});
  var partes = String(txt||'').split(/(?=###\s*CONTE[ÚU]DO)/i).filter(function(b){ return /^###\s*CONTE[ÚU]DO/i.test(b); });
  if(!partes.length) return Promise.resolve({n:0, msg:'Não encontrei blocos "### CONTEÚDO" na resposta. Copie a resposta inteira da IA.'});
  var corte = partes.length > I.restante, usar = partes.slice(0, I.restante).join('\n');
  UI.clPerfil = ($('#ciaPerfil')||{}).value || cliPerfilPrincipal();
  return importarDoClaude(usar).then(function(n){
    var L = cliLic(); if(I.teste) L.iaTeste = (L.iaTeste||0) + n; else L.ia.usados = (L.ia.usados||0) + n;
    S.conteudos.forEach(function(c){ if(c.historico && c.historico[0] && /Criado pelo Claude/.test(c.historico[0].txt) && !c.iaCli){ c.iaCli = true; c.historico[0].txt = 'Criado com IA (Conteúdo com IA) e importado.'; } });
    return salvarCfg().then(function(){ return {n:n, msg:n+' conteúdo(s) no calendário ✔'+(corte?' (a resposta tinha '+partes.length+'; importei só os '+I.restante+' do seu limite)':'')}; });
  });
}

/* ---------- ganchos com o app ---------- */
function cliPosRender(){
  if(!S.cfg) return;
  var L = cliLic(); if(!L.testeIni){ L.testeIni = new Date().toISOString(); salvarCfg(); }
  document.body.classList.add('ed-cliente');
  document.body.classList.toggle('cli-sem-imoveis', (S.cfg.cli||{}).pack!=='corretor');
  if(cliBloqueio()) return;
  var E = cliEstado(), fx = document.getElementById('cliFaixa');
  if(E.tipo==='teste'){ if(!fx){ fx = document.createElement('div'); fx.id = 'cliFaixa'; document.body.appendChild(fx); } fx.innerHTML = '🎁 Teste grátis: '+E.dias+' dia(s) <button class="btn sm acc" data-cli="planos">Ver planos</button>'; }
  else if(fx) fx.remove();
  if(!S.cfg.cli && S.cfg.device && !$('#ov').classList.contains('on')) cliCadastro();
}
var __renderBase = render;
render = function(){ var r = __renderBase.apply(this, arguments); try{ cliPosRender(); }catch(e){} if(UI.view==='coord') ligarCli(); return r; };
var __fecharBase = fecharModal;
fecharModal = function(){ var r = __fecharBase.apply(this, arguments); setTimeout(function(){ if(S.cfg && S.cfg.device && !S.cfg.cli && !$('#ov').classList.contains('on') && !document.getElementById('cliBloq')) cliCadastro(); }, 60); return r; };
var __slotBase = slotDe;
slotDe = function(c){
  var d = S.cfg && S.cfg.cli; if(!d || c.deriv) return __slotBase(c);
  var sl = cliSlots(1, segunda(hoje())), vd = [], pd = [], cd = []; sl.forEach(function(x){ (x.tipo==='video'?vd:x.tipo==='carrossel'?cd:pd).push(dow(x.data)); });
  var hora = CLI_HORAS[d.hora] || '19:00', hp = d.hora==='noite'?'12:00':hora;
  if(c.formato==='YouTube' || (redeDe(c)==='YouTube' && c.formato!=='Shorts')) return {dias:[6], hora:'17:00', trilha:'yt'};
  if(['Reel','Shorts','Vídeo curto'].indexOf(c.formato)>=0) return {dias:vd.length?vd:d.dias, hora:hora, trilha:'reel'};
  if(c.formato==='Story') return {dias:[0,1,2,3,4,5,6], hora:'09:00', trilha:'story'};
  if(c.formato==='Carrossel') return {dias:cd.length?cd:d.dias, hora:hp, trilha:'carrossel'};
  return {dias:pd.length?pd:d.dias, hora:hp, trilha:'post'};
};
function ligarCli(){
  $all('#app [data-cusarcli]').forEach(function(b){ b.onclick = function(){ cliUsarTema(b.dataset.cusarcli); }; });
}
document.addEventListener('click', function(ev){
  var b = ev.target.closest && ev.target.closest('[data-cli]'); if(!b) return;
  var a = b.dataset.cli;
  if(a==='bordaoIA'){ ev.preventDefault(); copiar(cliPedidoBordao()); toast('Pedido copiado: cole no Claude, ChatGPT ou Gemini e traga a frase escolhida'); }
  if(a==='planos') cliTelaPlanos();
  if(a==='cadastro') cliCadastro();
  if(a==='cadSeguir' || a==='cadVoltar' || a==='cadFim'){
    cliCadLer(); if(a==='cadVoltar'){ CAD.passo--; cliCadRender(); return; }
    var er = cliCadValida(); if(er){ toast(er); return; }
    if(a==='cadSeguir'){ CAD.passo++; cliCadRender(); return; }
    var nova = !S.cfg.cli;
    cliAplicarCadastro(CAD.d).then(function(n){ fecharModal(); render(); if(nova) alert('Pronto! '+n+' conteúdos da sua profissão já estão no calendário das próximas 4 semanas, com roteiro, descrição e hashtags.\n\nVocê tem '+SL_TESTE_DIAS+' dias de teste grátis, com '+SL_IA_COTA.teste+' conteúdos de IA para experimentar em 🧭 Coordenador → ✨ Criar com IA.'); else toast('Perfil salvo ✔'); });
  }
  if(a==='ativar'){
    var inp = b.parentNode.querySelector('input'), r = cliAtivar(inp ? inp.value : ''), m = b.closest('.card').querySelector('#cliCodMsg');
    if(m) m.textContent = r.msg; else toast(r.msg);
    if(r.ok) salvarCfg().then(function(){ toast(r.msg); cliBloqueio(); if($('#ov').classList.contains('on')) fecharModal(); render(); });
  }
  if(a==='gerar4') cliGerarPlano(4).then(function(n){ render(); toast(n ? n+' conteúdos novos no calendário ✔' : 'Sem pautas livres: use ✨ Criar com IA'); });
  if(a==='iaMontar'){ var t = cliPedidoIA(); $('#ciaPedido').value = t; copiar(t); }
  if(a==='iaImportar'){ cliImportarIA($('#ciaResp').value).then(function(r){ toast(r.msg); if(r.n) render(); else alert(r.msg); }); }
});
