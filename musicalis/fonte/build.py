"""MUSICALIS • monta o app publicado (musicalis/app/) a partir das fontes desta pasta.
Uso:  python3 build.py 3.33      (número da nova versão)
Gera: ../app/index.html, ../app/sw.js (cache novo) e ../app/versao.json (faz os alunos atualizarem sozinhos).
Segredos (chave privada, senha do Criador) NUNCA ficam aqui: publica.json e cofre.json já são públicos/criptografados."""
import json,re,sys,os,datetime
D=os.path.dirname(os.path.abspath(__file__));APP=os.path.join(D,'..','app')
v=sys.argv[1] if len(sys.argv)>1 else None
if not v or not re.fullmatch(r'\d+\.\d+',v):sys.exit('informe a versão, ex.: python3 build.py 3.33')
L=lambda f:open(os.path.join(D,f),encoding='utf-8').read()
t=L('base_v327.html')
t,n1=re.subn(r"OWNER_EMAILS=\[[^\]]*\]","OWNER_EMAILS=[]",t,count=1)
t,n2=re.subn(r"LIC_SECRET='[0-9a-f]*'","LIC_SECRET=''",t,count=1)
t=t.replace("const APP_VERSAO='3.27'",f"const APP_VERSAO='{v}'").replace("<title>MUSICALIS V0.6</title>","<title>MUSICALIS</title>")
t=t.replace('placeholder="MUS-XXXXXXX-XXXX-XXXXXX"','placeholder="Cole aqui o código recebido"')
assert n1==1 and n2==1
js=L('v328.js').replace('__PUB_JWK__',L('publica.json').strip()).replace('__COFRE__',L('cofre.json').strip())
head=('<link rel="manifest" href="manifest.webmanifest"><link rel="icon" href="icone-192.png">'
 '<link rel="apple-touch-icon" href="icone-192.png"><meta name="apple-mobile-web-app-capable" content="yes">'
 '<meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="MUSICALIS">'
 '<meta name="description" content="MUSICALIS • Método de estudos de saxofone de Kenny Anderson">'
 '<meta http-equiv="Content-Security-Policy" content="default-src \'self\'; script-src \'self\' \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\'; img-src \'self\' data: blob:; media-src \'self\' data: blob:; font-src \'self\' data:; connect-src \'self\' https://script.google.com https://script.googleusercontent.com; worker-src \'self\'; manifest-src \'self\'; object-src \'none\'; base-uri \'none\'; form-action \'none\'">'
 '<meta name="referrer" content="no-referrer">')
t=t.replace('<meta name="theme-color" content="#07152b">','<meta name="theme-color" content="#07152b">'+head,1)
out=t+'\n<style>\n'+L('v328.css')+'\n</style>\n<script>\n'+js+'\n'+L('v330.js')+'\n'+L('v333.js')+'\n'+L('v335.js')+'\n'+L('v336.js')+'\n</script>\n'
open(os.path.join(APP,'index.html'),'w',encoding='utf-8').write(out)
sw=open(os.path.join(APP,'sw.js'),encoding='utf-8').read();open(os.path.join(APP,'sw.js'),'w',encoding='utf-8').write(re.sub(r"musicalis-v[0-9.]+",'musicalis-v'+v,sw))
json.dump({'v':v,'data':datetime.date.today().isoformat()},open(os.path.join(APP,'versao.json'),'w'))
print('MUSICALIS',v,'montado:',len(out),'bytes')
