# MUSICALIS • fontes do app web

O app publicado fica em `../app/` (https://aap29.github.io/prospectarion/musicalis/app/).
Ele é **montado** a partir destes arquivos. Nunca edite `../app/index.html` à mão.

| Arquivo | O que é |
|---|---|
| `base_v327.html` | app original (partituras, exercícios, teoria, motor de notação) |
| `v328.js` | segurança (licenças assinadas, Criador por senha/cofre), instalação, migração, rotação |
| `v330.js` | acompanhamento do aluno, diagnóstico, Ouvido, pausas, resumos, atualização automática |
| `v328.css` | ajustes de tela (barra fina com o celular deitado etc.) |
| `publica.json`, `cofre.json` | chave pública e cofre criptografado (podem ficar públicos) |
| `planilha_apps_script.gs` | programa da planilha MUSICALIS Alunos (modelo, sem senha) |
| `build.py` | monta o app: `python3 build.py 3.33` |
| `testes/` | testes automáticos (Playwright) |

## Publicar uma melhoria
1. Edite `v330.js` / `v328.css` (ou crie um `v3xx.js` e inclua no `build.py`).
2. `python3 build.py <nova versão>` (ex.: 3.33). Isso troca a versão, o cache e o `versao.json`.
3. Rode os testes: `cd testes && python3 qa330.py && python3 qa332.py` (e `qa328.py` se tiver a chave).
4. `git add -A && git commit && git push`. Em 1–2 min os alunos recebem sozinhos (o app confere `versao.json`).

Segredos (chave privada, senha do Criador, código de recuperação, senha da planilha) **nunca** entram no repositório.

## Planilha ligada (versão 3.34)
- O app envia os dados para a planilha "MUSICALIS Alunos" (endereço em `SRV_URL_PADRAO` no `base_v327.html`).
- **Os testes nunca podem enviar dados para a planilha verdadeira**: todos usam `testes/protecao.py` (bloqueia script.google.com) e o `qa332.py` usa uma cópia do app sem o endereço. Teste novo = importar `proteger` também.
