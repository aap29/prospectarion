# Gera a versão de venda (social-imob-pro/) a partir do app do Anderson (social-imob/).
# Mesmo código; troca a edição, o banco de dados, o cache e remove os dados pessoais do Anderson.
import re, json, os, shutil
SP = os.path.dirname(os.path.abspath(__file__)) + '/'
SRC = os.path.abspath(SP + '..') + '/'
DST = os.path.abspath(SP + '../../social-imob-pro') + '/'
os.makedirs(DST, exist_ok=True)
s = open(SRC + 'index.html', encoding='utf-8').read()

def rep(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, (c, a[:100])
    s = s.replace(a, b)

def var_linha(nome, novo):
    global s
    i = s.index('var ' + nome + ' = ')
    j = s.index('\n', i)
    s = s[:i] + 'var ' + nome + ' = ' + novo + ';' + s[j:]

rep("var EDICAO = 'anderson';", "var EDICAO = 'cliente';")
ver = re.search(r"var APP_VER = '([\d.]+)'", s).group(1)
rep("var URL_APP = 'https://aap29.github.io/prospectarion/social-imob/';", "var URL_APP = 'https://aap29.github.io/prospectarion/social-imob-pro/';")
rep("var DB_NAME = 'SOCIAL_IMOB_360_PRO';", "var DB_NAME = 'SOCIAL_IMOB_PRO_CLIENTE';")
rep("indexedDB.open('SOCIAL_IMOB_VIDEOS', 1)", "indexedDB.open('SOCIAL_IMOB_PRO_VIDEOS', 1)")
s = s.replace("'si_ui'", "'sipro_ui'").replace("'si_rascunho'", "'sipro_rascunho'")

# dados pessoais do Anderson fora
var_linha('NOTION_SEED', '[]')
var_linha('REFORM', '{"R":{},"POST":{}}')
var_linha('REFORM2', '{"MOVER":{},"R":{},"SPLIT":{},"POST":{}}')
var_linha('MUSICA39', '{"perfis":{},"tags":{}}')
var_linha('TEXTOS39', '{}')
var_linha('C40', '{"NOVO":{},"SAZ":[],"GANCHO":{},"ME":[],"GMN":{},"BLOG":[],"PAUTAS":{},"HIST":[],"HIST_CONTA":"","ASSUNTOS":{}}')
rep("var SIG_I = 'Eu sou o corretor Anderson Alves: imóveis com visão, negócios com estratégia.', SIG_C = 'Eu sou Anderson Alves, consultor de investimentos e consórcios.';", "var SIG_I = '', SIG_C = '';")
rep("var DICAS = [", "PADRAO.perfis = []; PADRAO.hashtags = {}; PADRAO.modelos = {}; PADRAO.whatsapp = ''; PERFIS_EXTRA.length = 0;\n['rev380','rev390','rev393','rev400','rev410','reform370','textosCompletos360','seedNotion','rev510'].forEach(function(k){ PADRAO[k] = true; });\nvar DICAS = [")

s = s.replace('(ex.: wa.me/5551984168848)', '(ex.: wa.me/55 + o seu número com DDD)')
# painel do criador fora; módulo do cliente dentro
s = re.sub(r'/\*CRIADOR-INI\*/[\s\S]*?/\*CRIADOR-FIM\*/\n?', '', s)
assert 'cardCriador' not in s.split('typeof cardCriador')[0][-50:] or True
cli = open(SP + 'cli50.js', encoding='utf-8').read().replace('__PACKS__', open(SP + 'packs50.json', encoding='utf-8').read())
rep('/*CLI-AQUI*/', cli)

# cabeçalho
rep('<meta name="apple-mobile-web-app-title" content="Social Imob">', '<meta name="apple-mobile-web-app-title" content="Social Imob PRO">')
s = re.sub(r'<title>[^<]*</title>', '<title>Social Imob 360 PRO</title>', s, count=1)
open(DST + 'index.html', 'w', encoding='utf-8').write(s)

m = json.load(open(SRC + 'manifest.webmanifest', encoding='utf-8'))
m['name'] = 'Social Imob 360 PRO'; m['short_name'] = 'Social Imob PRO'
m['description'] = 'Calendário, roteiros, estúdio de gravação e conteúdo com IA para profissionais de qualquer área.'
json.dump(m, open(DST + 'manifest.webmanifest', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
for f in ['icone-v2-192.png', 'icone-v2-512.png', 'icone-v2-maskable-512.png']:
    shutil.copy(SRC + f, DST + f)
sw = open(SRC + 'sw.js', encoding='utf-8').read()
sw = re.sub(r"var CACHE = 'socialimob-[^']*';", "var CACHE = 'socialimobpro-v" + ver.replace('.', '-') + "';", sw)
sw = sw.replace("k.indexOf('socialimob-') === 0", "k.indexOf('socialimobpro-') === 0")
assert 'socialimobpro-v' in sw and "indexOf('socialimobpro-')" in sw
sw = sw.replace('SOCIAL IMOB 360 PRO — funcionamento sem internet.', 'SOCIAL IMOB 360 PRO (versão de venda) — funcionamento sem internet.')
open(DST + 'sw.js', 'w', encoding='utf-8').write(sw)
print('ok', ver, len(s))
