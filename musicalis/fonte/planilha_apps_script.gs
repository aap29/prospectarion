/**
 * MUSICALIS • Banco de dados dos alunos + automações • versão 4
 * Já vem preenchido: só colar no Apps Script da planilha "MUSICALIS Alunos", salvar e implantar.
 */
const TOKEN = 'TROQUE';
const PLANILHA_ID = '1c7FSvuF83lop6M753wDQal29k5Jc88Kzf_1vdCPHxyM';
const EMAIL_PROFESSOR = '';          // vazio = e-mail da conta Google dona da planilha
const WHATS_PROFESSOR = '5551984168848';
const ASSINATURA = 'Kenny Anderson • MUSICALIS';
const TZ = 'America/Sao_Paulo';
const KIWIFY_CHAVE = 'TROQUE_KIWIFY';   // vai no fim do endereço do webhook da Kiwify: …/exec?kiwify=ESTA_CHAVE
const APP_URL = 'https://aap29.github.io/prospectarion/musicalis/app/';

const ABA_ALUNOS = 'Alunos', ABA_EVENTOS = 'Eventos', ABA_VERSOES = 'Versões', ABA_OBS = 'Observações', ABA_RES = 'Resumos';
const COLS = ['email','nome','telefone','instrumento','plano','vencimento','testeInicio','cadastro','ultimoAcesso',
              'ultimoEvento','praticas','evolucao','modulo','versao','acessos',
              'nivelRecomendado','teoria','pratica','exerciciosTotal','exerciciosSemana','minutosSemana','precisaoMedia',
              'buscasPartituras','ultimoExercicio','avaliacaoTeste','observacoes','pagamentoAberto','ouvidoModo','statusContato','cidade','estado',
              'nomeArtistico','saxofones','saxPrincipal','experiencia','redeSocial','idade','emailContato'];
const COL_EVENTOS = ['quando','email','nome','telefone','tipo','plano','detalhe','versao'];

function aba_(nome, cab) {
  const ss = SpreadsheetApp.openById(PLANILHA_ID);
  let sh = ss.getSheetByName(nome);
  if (!sh) { sh = ss.insertSheet(nome); sh.appendRow(cab); sh.setFrozenRows(1); sh.getRange(1,1,1,cab.length).setFontWeight('bold'); return sh; }
  const atual = sh.getRange(1, 1, 1, Math.max(1, sh.getLastColumn())).getValues()[0];
  if (atual.length < cab.length || cab.some((c, i) => atual[i] !== c)) { sh.getRange(1, 1, 1, cab.length).setValues([cab]).setFontWeight('bold'); }
  return sh;
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
const soDig_ = t => String(t || '').replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
const txt_ = (v, n) => String(v == null ? '' : v).replace(/^[=+\-@]/, "'$&").slice(0, n || 200);   // impede fórmula injetada
const hoje_ = (d) => Utilities.formatDate(d || new Date(), TZ, 'yyyy-MM-dd');
const fmt_ = x => x instanceof Date ? Utilities.formatDate(x, TZ, 'yyyy-MM-dd') : x;

function doGet(e) {
  const p = (e && e.parameter) || {};
  try {
    if (p.acao === 'info') return json_(info_());
    if (p.acao === 'leads') {
      if (p.token !== TOKEN) return json_({ erro: 'token inválido' });
      const sh = aba_(ABA_ALUNOS, COLS), v = sh.getDataRange().getValues(), cab = v.shift();
      return json_({ ok: true, leads: v.filter(r => r[0]).map(r => { const o = {}; cab.forEach((c, i) => o[c] = fmt_(r[i])); return o; }) });
    }
    return json_({ ok: true, app: 'MUSICALIS', v: 2 });
  } catch (err) { return json_({ erro: String(err) }); }
}

function doPost(e) {
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const bruto = (e.postData && e.postData.contents) || '{}';
    if (bruto.length > 20000) return json_({ erro: 'envio grande demais' });
    const d = JSON.parse(bruto);
    const q = (e && e.parameter) || {};
    if (q.kiwify) { if (q.kiwify !== KIWIFY_CHAVE) return json_({ erro: 'chave inválida' }); return json_(kiwify_(d)); }
    if ((d.acao === 'lead' || d.acao === 'evento') && !limite_(d.email)) return json_({ erro: 'limite de envios' });
    if (d.acao === 'lead') return json_(lead_(d));
    if (d.acao === 'evento') return json_(evento_(d));
    if (d.acao === 'config') { if (d.token !== TOKEN) return json_({ erro: 'token inválido' });
      PropertiesService.getScriptProperties().setProperty('pagamento', JSON.stringify(d.pagamento || {})); return json_({ ok: true }); }
    if (d.acao === 'publicar') { if (d.token !== TOKEN) return json_({ erro: 'token inválido' });
      if (!/^\d+\.\d+$/.test(d.v || '')) return json_({ erro: 'versão inválida' });
      aba_(ABA_VERSOES, ['versao','data','notas','apk']).appendRow([d.v, txt_(d.data, 10), txt_(d.notas, 2000), txt_(d.apk, 500)]);
      return json_({ ok: true }); }
    return json_({ erro: 'ação desconhecida' });
  } catch (err) { return json_({ erro: String(err) }); }
  finally { lock.releaseLock(); }
}

/* ---------- proteção: no máximo 300 envios por hora para cada e-mail ---------- */
function limite_(email) {
  const c = CacheService.getScriptCache(), k = 'lim_' + String(email || '').toLowerCase().slice(0, 120), n = Number(c.get(k) || 0);
  if (n >= 300) return false; c.put(k, String(n + 1), 3600); return true;
}
const TIPOS_OK = ['cadastro','acesso','diagnostico','exercicio','ouvido','partitura','avaliacao_teste','observacao','pagamento','resumo_semana','resumo_mes','teste_encerrado'];

/* ---------- aluno (linha única por e-mail) ---------- */
function linhaAluno_(email) {
  const sh = aba_(ABA_ALUNOS, COLS), v = sh.getDataRange().getValues();
  for (let i = 1; i < v.length; i++) if (String(v[i][0]).toLowerCase() === email) return { sh, linha: i + 1, antigo: v[i], todos: v };
  return { sh, linha: -1, antigo: null, todos: v };
}
function gravar_(sh, linha, obj) {
  const row = COLS.map(c => obj[c] == null ? '' : obj[c]);
  if (linha > 0) sh.getRange(linha, 1, 1, COLS.length).setValues([row]); else sh.appendRow(row);
}
function base_(d, antigo, contarAcesso) {
  const o = {}; COLS.forEach((c, i) => o[c] = antigo ? antigo[i] : '');
  const set = (c, v) => { if (v !== undefined && v !== null && v !== '') o[c] = v; };
  set('email', txt_(d.email, 120).toLowerCase().trim()); set('nome', txt_(d.nome, 120)); set('telefone', txt_(d.telefone, 30));
  set('instrumento', txt_(d.instrumento, 30)); set('plano', txt_(d.plano, 20)); o.vencimento = txt_(d.vencimento, 10) || o.vencimento;
  set('praticas', Number(d.praticas) || ''); set('evolucao', txt_(d.evolucao, 10)); set('modulo', txt_(d.modulo, 40)); set('versao', txt_(d.versao, 10));
  ['nivelRecomendado','teoria','pratica','exerciciosSemana','minutosSemana','precisaoMedia','buscasPartituras','ouvidoModo'].forEach(c => set(c, txt_(d[c], 40)));
  set('cidade', txt_(d.cidade, 60)); set('estado', txt_(d.estado, 2).toUpperCase());
  ['nomeArtistico','saxofones','saxPrincipal','experiencia','redeSocial','emailContato'].forEach(c => set(c, txt_(d[c], 120)));
  if (Number(d.idade) >= 5 && Number(d.idade) <= 100) o.idade = Number(d.idade);
  if (!o.cadastro) o.cadastro = txt_(d.cadastro, 10) || hoje_();
  if (!o.testeInicio) o.testeInicio = txt_(d.testeInicio, 10);
  o.ultimoAcesso = new Date(); if (contarAcesso) o.acessos = (Number(o.acessos) || 0) + 1;
  return o;
}
function lead_(d) {
  const email = txt_(d.email, 120).toLowerCase().trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { erro: 'e-mail inválido' };
  const { sh, linha, antigo, todos } = linhaAluno_(email), tel = soDig_(d.telefone);
  let testeUsado = false;
  if (d.evento === 'cadastro' && d.plano === 'teste') {
    for (let i = 1; i < todos.length; i++) if (String(todos[i][0]).toLowerCase() !== email && todos[i][6] && tel && soDig_(todos[i][2]) === tel) testeUsado = true;
    if (antigo && antigo[6] && antigo[6] !== d.testeInicio) testeUsado = true;
  }
  const o = base_(d, antigo, true);
  if (testeUsado) { o.plano = 'gratuito'; o.vencimento = ''; }
  o.ultimoEvento = txt_(d.evento, 40);
  if (/^link_|^pagar/.test(d.evento || '')) o.pagamentoAberto = new Date();
  gravar_(sh, linha, o);
  aba_(ABA_EVENTOS, COL_EVENTOS).appendRow([new Date(), email, o.nome, o.telefone, txt_(d.evento, 40), o.plano, '', o.versao]);
  const mi = /^inscrito_([a-z]+)$/.exec(d.evento || '');
  if (mi) alertaAssinante_(o, mi[1], 'Entrou no app pelo link de assinante (depois do pagamento)');
  return { ok: true, testeUsado };
}
function evento_(d) {
  const email = txt_(d.email, 120).toLowerCase().trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { erro: 'e-mail inválido' };
  const tipo = txt_(d.tipo, 30); if (TIPOS_OK.indexOf(tipo) < 0) return { erro: 'tipo inválido' };
  const { sh, linha, antigo } = linhaAluno_(email), o = base_(d, antigo, false);
  let det = {}; try { det = JSON.parse(d.detalhe || '{}'); } catch (e) {}
  o.ultimoEvento = tipo;
  if (tipo === 'exercicio') { o.exerciciosTotal = (Number(o.exerciciosTotal) || 0) + 1; o.ultimoExercicio = txt_(det.id + (det.mod ? ' • ' + det.mod : ''), 80); }
  if (tipo === 'diagnostico') { o.nivelRecomendado = txt_(det.rec, 40); o.teoria = det.teoria; o.pratica = det.medido ? det.pratica : 'não medida'; }
  if (tipo === 'avaliacao_teste') o.avaliacaoTeste = txt_({ adorei: 'Está gostando', nao_experimentei: 'Ainda não experimentou', dificuldade: 'Teve dificuldade' }[det.resposta] || det.resposta, 60);
  if (tipo === 'observacao') { o.observacoes = txt_(hoje_() + ': ' + det.texto, 500);
    aba_(ABA_OBS, ['quando','nome','email','telefone','observacao','status']).appendRow([new Date(), o.nome, email, o.telefone, txt_(det.texto, 1000), 'nova']); }
  if (tipo === 'pagamento') o.pagamentoAberto = new Date();
  gravar_(sh, linha, o);
  aba_(ABA_EVENTOS, COL_EVENTOS).appendRow([new Date(), email, o.nome, o.telefone, tipo, o.plano, txt_(d.detalhe, 1500), o.versao]);
  return { ok: true };
}

function info_() {
  const sh = aba_(ABA_VERSOES, ['versao','data','notas','apk']), v = sh.getDataRange().getValues(); v.shift();
  const versoes = v.filter(r => r[0]).slice(-30).map(r => ({ v: String(r[0]), data: String(fmt_(r[1])), notas: String(r[2] || ''), apk: String(r[3] || '') }));
  const ult = versoes.filter(x => x.apk).pop();
  let pagamento = {}; try { pagamento = JSON.parse(PropertiesService.getScriptProperties().getProperty('pagamento') || '{}'); } catch (e) {}
  return { ok: true, versoes, apk: ult ? ult.apk : '', pagamento };
}

/* ================= AUTOMAÇÕES ================= */
function alunos_() {
  const v = aba_(ABA_ALUNOS, COLS).getDataRange().getValues(); v.shift();
  return v.filter(r => r[0]).map(r => { const o = {}; COLS.forEach((c, i) => o[c] = r[i]); return o; });
}
function eventos_(dias) {
  const v = aba_(ABA_EVENTOS, COL_EVENTOS).getDataRange().getValues(); v.shift(); const desde = Date.now() - dias * 864e5;
  return v.filter(r => r[0] instanceof Date && r[0].getTime() >= desde).map(r => ({ quando: r[0], email: String(r[1]).toLowerCase(), tipo: r[4], detalhe: r[6] }));
}
const dias_ = iso => { if (!iso) return null; const s = iso instanceof Date ? hoje_(iso) : String(iso).slice(0, 10); return Math.round((new Date(s + 'T00:00:00') - new Date(hoje_() + 'T00:00:00')) / 864e5); };
const primeiro_ = n => String(n || '').trim().split(/\s+/)[0] || 'tudo bem';
function wa_(a, msg) { const t = soDig_(a.telefone); return t ? 'https://wa.me/55' + t + '?text=' + encodeURIComponent(msg + '\n\n' + ASSINATURA) : ''; }
function item_(a, motivo, msg) { const l = wa_(a, msg);
  return '<li style="margin:8px 0"><b>' + a.nome + '</b> • ' + (a.telefone || 'sem WhatsApp') + ' • ' + a.email + '<br><span style="color:#555">' + motivo + '</span>' +
    (l ? '<br><a href="' + l + '" style="display:inline-block;margin-top:4px;background:#1fa855;color:#fff;padding:6px 12px;border-radius:8px;text-decoration:none">Enviar WhatsApp pronto</a>' : '') + '</li>'; }
function enviarEmail_(assunto, html) { const para = EMAIL_PROFESSOR || Session.getEffectiveUser().getEmail(); MailApp.sendEmail({ to: para, subject: assunto, htmlBody: html }); }

function automacaoDiaria() {
  const A = alunos_().filter(a => a.plano !== 'criador'), ev = eventos_(3), S = [];
  const novos = A.filter(a => dias_(a.cadastro) === -1 || dias_(a.cadastro) === 0);
  const amanha = A.filter(a => a.plano === 'teste' && dias_(a.vencimento) === 1);
  const acabou = A.filter(a => (a.plano === 'teste' || a.plano === 'gratuito') && a.testeInicio && [-1, -2].includes(dias_(a.vencimento)));
  const pagou = new Set(ev.filter(e => /ativ/.test(e.tipo)).map(e => e.email));
  const pagto = A.filter(a => a.pagamentoAberto instanceof Date && Date.now() - a.pagamentoAberto.getTime() < 3 * 864e5 && /teste|gratuito/.test(a.plano) && !pagou.has(a.email));
  const sumidos = A.filter(a => a.ultimoAcesso instanceof Date && /teste|mensal|trimestral|semestral|anual|vitalicio|escola|parcelado/.test(a.plano) && (Date.now() - a.ultimoAcesso.getTime()) / 864e5 >= 5 && (Date.now() - a.ultimoAcesso.getTime()) / 864e5 < 6);
  const obs = aba_(ABA_OBS, ['quando','nome','email','telefone','observacao','status']).getDataRange().getValues().slice(1).filter(r => r[5] === 'nova');
  const sec = (t, L) => L.length ? '<h3 style="margin:18px 0 4px">' + t + ' (' + L.length + ')</h3><ul style="padding-left:18px">' + L.join('') + '</ul>' : '';
  S.push(sec('🆕 Novos cadastros', novos.map(a => item_(a, 'Cadastro ' + fmt_(a.cadastro) + (a.nivelRecomendado ? ' • nível recomendado: ' + a.nivelRecomendado : ' • ainda não fez o diagnóstico'),
    'Olá, ' + primeiro_(a.nome) + '! Aqui é o Kenny, do MUSICALIS 🎷 Seja bem-vindo(a)! ' + (a.nivelRecomendado ? 'Seu ponto de partida recomendado é o ' + a.nivelRecomendado + '. ' : 'Comece pelo diagnóstico: o app recomenda o seu nível. ') + 'Qualquer dúvida, é só me chamar por aqui.'))));
  S.push(sec('⏳ Teste termina amanhã', amanha.map(a => item_(a, 'Práticas: ' + (a.exerciciosTotal || 0) + (a.avaliacaoTeste ? ' • respondeu: ' + a.avaliacaoTeste : ''),
    'Olá, ' + primeiro_(a.nome) + '! Seu teste grátis do MUSICALIS termina amanhã. Está gostando? ' + (Number(a.exerciciosTotal) ? 'Vi que você já fez ' + a.exerciciosTotal + ' prática(s), parabéns! ' : 'Já experimentou algum exercício do seu nível' + (a.nivelRecomendado ? ' (' + a.nivelRecomendado + ')' : '') + '? ') + 'Posso te ajudar a escolher o plano ideal para continuar.'))));
  S.push(sec('💳 Abriu o pagamento e ainda não ativou', pagto.map(a => item_(a, 'Abriu o pagamento em ' + Utilities.formatDate(a.pagamentoAberto, TZ, 'dd/MM HH:mm'),
    'Olá, ' + primeiro_(a.nome) + '! Vi que você abriu o pagamento do MUSICALIS. Deu tudo certo com o link? Se precisar, te ajudo por aqui e já te envio o acesso.'))));
  S.push(sec('🔚 Teste terminou e não assinou', acabou.map(a => item_(a, 'Terminou em ' + fmt_(a.vencimento) + ' • práticas: ' + (a.exerciciosTotal || 0),
    'Olá, ' + primeiro_(a.nome) + '! Seu teste do MUSICALIS terminou. Quer continuar de onde parou? Seu progresso está guardado. Te mando as opções de plano?'))));
  S.push(sec('😴 Sem estudar há 5 dias', sumidos.map(a => item_(a, 'Último acesso ' + fmt_(a.ultimoAcesso) + ' • módulo ' + (a.modulo || '—'),
    'Olá, ' + primeiro_(a.nome) + '! Sentimos sua falta no MUSICALIS 🎷 15 minutinhos hoje já fazem diferença. Seu próximo passo: ' + (a.modulo || 'o próximo exercício') + '.'))));
  const debito = A.filter(a => /mensal|trimestral|semestral|anual|escola|parcelado/.test(a.plano) && a.vencimento && dias_(a.vencimento) !== null && dias_(a.vencimento) <= 2 && dias_(a.vencimento) >= -30);
  S.push(sec('💸 Vencendo ou em débito', debito.map(a => { const d = dias_(a.vencimento), parc = a.plano === 'parcelado';
    return item_(a, (parc ? 'Vitalício parcelado' : 'Plano ' + a.plano) + ' • ' + (d < 0 ? 'EM ATRASO há ' + (-d) + ' dia(s) (venceu ' + fmt_(a.vencimento) + ') • funções pagas bloqueadas no app' : d === 0 ? 'vence HOJE' : 'vence em ' + d + ' dia(s) (' + fmt_(a.vencimento) + ')'),
      d < 0 ? 'Olá, ' + primeiro_(a.nome) + '! ' + (parc ? 'A parcela do seu MUSICALIS Vitalício' : 'O seu plano do MUSICALIS') + ' venceu em ' + fmt_(a.vencimento) + ' e algumas funções do app ficaram pausadas. Assim que o pagamento for feito, eu libero na hora. Precisa de ajuda com o pagamento?'
            : 'Olá, ' + primeiro_(a.nome) + '! Passando para lembrar que ' + (parc ? 'a parcela do seu MUSICALIS Vitalício' : 'o seu plano do MUSICALIS') + ' vence ' + (d === 0 ? 'hoje' : 'em ' + fmt_(a.vencimento)) + '. Pagando até a data, tudo continua funcionando sem interrupção. 🎷'); })));
  if (obs.length) S.push('<h3 style="margin:18px 0 4px">💬 Observações novas dos alunos (' + obs.length + ')</h3><ul style="padding-left:18px">' + obs.map(r => '<li><b>' + r[1] + '</b> (' + r[2] + '): ' + r[4] + '</li>').join('') + '</ul><p style="color:#555">Marque como "lida" na aba Observações.</p>');
  const semPlano = relatorioSemPlano_(A);
  const usando = semPlano.filter(a => a.ultimoAcesso instanceof Date && (Date.now() - a.ultimoAcesso.getTime()) / 864e5 <= 7);
  if (usando.length) S.push('<h3 style="margin:18px 0 4px">👀 Usando o app sem plano pago (' + usando.length + ')</h3><p style="color:#555;margin:0">Lista completa na aba <b>Sem plano</b> da planilha.</p><ul style="padding-left:18px">' + usando.map(a => '<li><b>' + a.nome + '</b> • ' + (a.cidade || '—') + '/' + (a.estado || '—') + ' • ' + (a.telefone || 'sem WhatsApp') + ' • ' + a.email + '<br><span style="color:#555">' + a.situacao + '</span></li>').join('') + '</ul>');
  const corpo = S.join('');
  if (!corpo) return;
  enviarEmail_('MUSICALIS • quem chamar hoje (' + Utilities.formatDate(new Date(), TZ, 'dd/MM') + ')',
    '<div style="font-family:Arial,sans-serif;font-size:15px;max-width:640px"><h2 style="margin:0">🎷 MUSICALIS • seu dia</h2><p>Toque em "Enviar WhatsApp pronto": a mensagem abre pronta, é só conferir e enviar.</p>' + corpo + '</div>');
}

/* aba 'Sem plano': quem usa o app sem ter pago (teste ativo, teste encerrado ou gratuito) */
function relatorioSemPlano_(A) {
  const L = (A || alunos_()).filter(a => a.plano !== 'criador' && !/mensal|trimestral|semestral|anual|vitalicio|escola|parcelado/.test(a.plano)).map(a => {
    const d = dias_(a.vencimento); a.situacao = a.plano === 'teste' && d !== null && d >= 0 ? 'Teste grátis ativo até ' + fmt_(a.vencimento) : a.testeInicio ? 'Teste encerrado em ' + fmt_(a.vencimento || a.testeInicio) + ' • acesso parcial' : 'Gratuito (acesso parcial)'; return a; });
  const cab = ['nome','email','cidade','estado','telefone','situacao','cadastro','ultimoAcesso','acessos','exerciciosTotal'];
  const sh = aba_('Sem plano', cab); if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, cab.length).clearContent();
  if (L.length) sh.getRange(2, 1, L.length, cab.length).setValues(L.map(a => cab.map(c => a[c] instanceof Date ? a[c] : (a[c] == null ? '' : a[c]))));
  return L;
}
function relatorioSemPlano() { relatorioSemPlano_(); }

function estat_(email, ev) {
  const E = ev.filter(e => e.email === email), ex = E.filter(e => e.tipo === 'exercicio'), ou = E.filter(e => e.tipo === 'ouvido');
  let soma = 0, n = 0, acid = 0, oit = 0; ou.forEach(e => { try { const d = JSON.parse(e.detalhe || '{}'); if (d.precisao != null) { soma += d.precisao; n++; } acid += (d.erros && d.erros.acidente) || 0; oit += (d.erros && d.erros.oitava) || 0; } catch (x) {} });
  const dias = new Set(E.map(e => hoje_(e.quando))).size;
  return { dias, exercicios: ex.length, partituras: E.filter(e => e.tipo === 'partitura').length, precisao: n ? Math.round(soma / n) : '', acid, oit };
}
function recomendacao_(s) {
  const r = [];
  if (!s.exercicios) r.push('Não praticou: mandar incentivo e o exercício do nível dele.');
  else if (s.dias < 3) r.push('Pouca constância: sugerir 15–20 min por dia.');
  else r.push('Boa constância: elogiar.');
  if (s.precisao !== '' && s.precisao < 70) r.push('Precisão baixa: diminuir 10 BPM e repetir devagar.');
  if (s.precisao !== '' && s.precisao >= 90) r.push('Precisão alta: subir 5 BPM / avançar.');
  if (s.acid >= 3) r.push('Erra acidentes: revisar armadura antes de tocar.');
  if (s.oit >= 3) r.push('Erra oitavas: revisar tecla de oitava e apoio do ar.');
  r.push('Lembrar pausas: 5 min a cada 25 min (olhos, músculos, embocadura).');
  return r.join(' ');
}
function resumo_(dias, titulo) {
  const A = alunos_().filter(a => a.plano !== 'criador'), ev = eventos_(dias), sh = aba_(ABA_RES, ['data','periodo','nome','email','telefone','plano','dias','exercicios','partituras','precisao','errosAcidente','errosOitava','recomendacao']);
  const L = [];
  A.forEach(a => { const s = estat_(String(a.email).toLowerCase(), ev); if (!s.dias && !/teste|mensal|trimestral|semestral|anual|vitalicio|escola/.test(a.plano)) return;
    const rec = recomendacao_(s); sh.appendRow([new Date(), titulo, a.nome, a.email, a.telefone, a.plano, s.dias, s.exercicios, s.partituras, s.precisao, s.acid, s.oit, rec]);
    L.push('<tr><td><b>' + a.nome + '</b><br>' + a.plano + '</td><td>' + s.dias + '</td><td>' + s.exercicios + '</td><td>' + (s.precisao === '' ? '—' : s.precisao + '%') + '</td><td style="font-size:13px">' + rec + '</td></tr>'); });
  if (!L.length) return;
  enviarEmail_('MUSICALIS • resumo ' + titulo.toLowerCase(), '<div style="font-family:Arial,sans-serif;max-width:760px"><h2>🎷 MUSICALIS • ' + titulo + '</h2><table border="1" cellpadding="6" style="border-collapse:collapse;font-size:14px"><tr style="background:#eee"><th>Aluno</th><th>Dias</th><th>Práticas</th><th>Precisão</th><th>Recomendação</th></tr>' + L.join('') + '</table><p>Detalhes na aba Resumos da planilha.</p></div>');
}
function resumoSemanal() { resumo_(7, 'Semanal'); }
function resumoMensal() { resumo_(30, 'Mensal'); }
function instalarAutomacoes() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('automacaoDiaria').timeBased().everyDays(1).atHour(8).inTimezone(TZ).create();
  ScriptApp.newTrigger('resumoSemanal').timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(7).inTimezone(TZ).create();
  ScriptApp.newTrigger('resumoMensal').timeBased().onMonthDay(1).atHour(7).inTimezone(TZ).create();
  [ABA_ALUNOS, ABA_EVENTOS, ABA_OBS, ABA_RES].forEach(n => aba_(n, n === ABA_ALUNOS ? COLS : n === ABA_EVENTOS ? COL_EVENTOS : n === ABA_OBS ? ['quando','nome','email','telefone','observacao','status'] : ['data','periodo','nome','email','telefone','plano','dias','exercicios','partituras','precisao','errosAcidente','errosOitava','recomendacao']));
}


/* ---------- alerta de novo assinante (e-mail na hora) ---------- */
const NOME_PLANO_ = { mensal: 'Mensal', trimestral: 'Trimestral', semestral: 'Semestral', anual: 'Anual', vitalicio: 'Vitalício', parcelado: 'Vitalício parcelado' };
function alertaAssinante_(o, plano, origem, extra) {
  const c = CacheService.getScriptCache(), k = 'alerta_' + o.email + '_' + plano; if (c.get(k)) return; c.put(k, '1', 21600);
  const nome = String(o.nome || o.email), pl = NOME_PLANO_[plano] || plano, wa = wa_(o, 'Olá, ' + primeiro_(o.nome) + '! Seja muito bem-vindo(a) ao MUSICALIS 🎷 Seu plano ' + pl + ' foi recebido. Já estou liberando o seu acesso completo.');
  enviarEmail_('💰 MUSICALIS • novo assinante: ' + nome + ' • plano ' + pl,
    '<div style="font-family:Arial,sans-serif;font-size:15px;max-width:640px"><h2 style="margin:0 0 6px">💰 Novo assinante do MUSICALIS</h2>' +
    '<p style="margin:4px 0"><b>' + nome + '</b> • plano <b>' + pl + '</b>' + (extra ? ' • ' + extra : '') + '</p>' +
    '<p style="margin:4px 0">E-mail: ' + o.email + '<br>WhatsApp: ' + (o.telefone || '—') + '<br>Cidade: ' + (o.cidade || '—') + '/' + (o.estado || '—') + '</p>' +
    '<p style="color:#555;margin:6px 0">' + origem + '</p>' +
    '<p><b>Para liberar o acesso:</b> abra o app → <b>Criador</b> → item 1 (gerar código) → e-mail <b>' + o.email + '</b> → plano <b>' + pl + '</b> → envie o link ao aluno.</p>' +
    (wa ? '<p><a href="' + wa + '" style="display:inline-block;background:#1f9d55;color:#fff;padding:10px 14px;border-radius:10px;text-decoration:none">Enviar WhatsApp de boas-vindas</a></p>' : '') +
    '<p style="color:#555">Antes de liberar, confira o pagamento na Kiwify ou no Pix.</p></div>');
}

/* ---------- webhook da Kiwify: compra aprovada ---------- */
function kiwify_(d) {
  const st = String(d.order_status || d.webhook_event_type || '').toLowerCase();
  const cli = d.Customer || d.customer || {}, prod = d.Product || d.product || {};
  const email = txt_(cli.email, 120).toLowerCase().trim(); if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: true, ignorado: 'sem e-mail' };
  const nomeProd = String(prod.product_name || prod.name || d.product_name || '');
  const plano = /vital/i.test(nomeProd) ? 'vitalicio' : /anual/i.test(nomeProd) ? 'anual' : /semest/i.test(nomeProd) ? 'semestral' : /trimest/i.test(nomeProd) ? 'trimestral' : /mensal/i.test(nomeProd) ? 'mensal' : 'outro';
  const { sh, linha, antigo } = linhaAluno_(email), o = base_({ email, nome: cli.full_name || cli.name, telefone: cli.mobile || cli.phone, cidade: cli.city, estado: cli.state }, antigo, false);
  const valor = d.Commissions && d.Commissions.charge_amount ? 'R$ ' + (Number(d.Commissions.charge_amount) / 100).toFixed(2).replace('.', ',') : '';
  if (/paid|approved|aprovad|order_approved/.test(st)) {
    o.ultimoEvento = 'kiwify_pago_' + plano; o.statusContato = txt_('Pago na Kiwify: ' + (NOME_PLANO_[plano] || nomeProd) + ' (' + hoje_() + ') • liberar acesso', 120);
    gravar_(sh, linha, o);
    aba_(ABA_EVENTOS, COL_EVENTOS).appendRow([new Date(), email, o.nome, o.telefone, 'pagamento', o.plano, txt_(JSON.stringify({ kiwify: st, produto: nomeProd, plano, valor, pedido: d.order_id || '' }), 1500), o.versao]);
    alertaAssinante_(o, plano, 'Pagamento APROVADO na Kiwify • produto: ' + nomeProd, valor);
  } else {
    aba_(ABA_EVENTOS, COL_EVENTOS).appendRow([new Date(), email, o.nome || cli.full_name || '', o.telefone || '', 'pagamento', o.plano || '', txt_(JSON.stringify({ kiwify: st, produto: nomeProd }), 1500), '']);
  }
  return { ok: true };
}
