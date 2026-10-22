# PRO IMOBILIÁRIA - ANDERSON ALVES — versão independente

App próprio de Anderson Alves para prospecção, agenda, simulador e conversão.
Funciona sozinho: não precisa do Claude nem de nenhuma conta externa.

## O que tem nesta pasta

| Arquivo | Para que serve |
|---|---|
| `index.html` | O app inteiro (é o único arquivo que você abre). |
| `manifest.webmanifest` | Nome, cores e ícone para instalar como app. |
| `sw.js` | Faz o app abrir sem internet depois da primeira vez. |
| `icon-192.png`, `icon-512.png`, `icon-maskable.png` | Ícones do app. |

---

## Opção 1 — Usar como arquivo no aparelho (pronto agora)

1. Dê dois cliques em `index.html` (ou no `PRO-INNOVAR.html`, que é o mesmo arquivo).
2. Faça o registro e crie o seu PIN.
3. Pronto. Os dados ficam salvos nesse navegador, nesse computador.

Limitação: como arquivo, o app não ganha ícone de instalação no celular.
Para isso, use a Opção 2.

---

## Opção 2 — Publicar com link próprio no GitHub Pages (grátis)

### Passo 1. Criar a conta
Acesse **github.com/signup** e crie a conta com o seu e-mail.

### Passo 2. Criar o repositório
1. No canto superior direito, clique em **+** → **New repository**.
2. Nome: `proinnovar`.
3. Marque **Public** (o plano grátis do GitHub Pages exige repositório público).
4. Clique em **Create repository**.

> O repositório público mostra o código do app, nunca os seus dados.
> Leads, agenda e planos ficam só dentro de cada aparelho.

### Passo 3. Enviar os arquivos
1. Na página do repositório, clique em **uploading an existing file**.
2. Arraste **todos os arquivos desta pasta** (index.html, manifest.webmanifest, sw.js e os 3 ícones).
3. Clique em **Commit changes**.

### Passo 4. Ligar o GitHub Pages
1. No repositório, vá em **Settings** → **Pages**.
2. Em **Source**, escolha **Deploy from a branch**.
3. Em **Branch**, escolha **main** e a pasta **/ (root)**. Clique em **Save**.
4. Espere 1 a 2 minutos. O seu link aparece no topo da página, no formato:
   `https://SEU-USUARIO.github.io/proinnovar/`

### Passo 5. Primeiro acesso
1. Abra o link no navegador.
2. Faça o registro (nome, WhatsApp, e-mails, CRECI) e crie o PIN.
3. Vá em **Configurações** (ícone de engrenagem) → **Link do app** e cole o link.

### Passo 6. Instalar em cada aparelho
Abra o link e toque em **Instalar** no topo do app.
- **Android (Chrome):** aparece o botão **Instalar agora**.
- **iPhone (Safari):** Compartilhar → **Adicionar à Tela de Início**.
- **PC (Chrome ou Edge):** botão de instalar na barra de endereço, depois **Fixar na barra de tarefas**.

Em cada aparelho, escolha o perfil: **Principal** (pede o PIN), **Corretor** ou **Consórcios**.

---

## Domínio próprio (ex.: proinnovar.com.br)

1. Registre o domínio em **registro.br**.
2. No GitHub: **Settings** → **Pages** → **Custom domain** → digite `proinnovar.com.br` → **Save**.
3. No registro.br, em **DNS**, crie estes registros:
   - Tipo **A** para `proinnovar.com.br` apontando para:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153` e `185.199.111.153`
   - Tipo **CNAME** para `www` apontando para `SEU-USUARIO.github.io`
4. Espere a propagação (de minutos até 24 horas) e marque **Enforce HTTPS** no GitHub.
5. No app, em **Configurações → Link do app**, cole `https://proinnovar.com.br`.

---

## Mudar de link sem perder dados

Os dados ficam guardados no endereço onde o app foi aberto. Ao mudar de link:

1. No link antigo: **Configurações** → **Exportar backup**.
2. No link novo: na tela de registro, use **Importar backup** (ou depois em **Configurações** → **Importar backup** → **Juntar com este aparelho**).

## Trazer os dados do app que está no Claude

1. No app do Claude, toque em **Instalar** → **Exportar meus dados**.
2. Na versão independente: **Configurações** → **Importar backup** → **Juntar com este aparelho**.

## Levar dados entre aparelhos

Não há servidor: cada aparelho guarda os seus dados.
Para juntar tudo, exporte o backup em um aparelho e importe no outro com **Juntar**.
Faça o backup pelo menos uma vez por semana e guarde o arquivo no Drive ou no seu WhatsApp.

## Atualizar o app no futuro

1. Substitua o `index.html` no GitHub pelo novo (Add file → Upload files).
2. Abra o `sw.js` no GitHub, troque `proinnovar-v1` por `proinnovar-v2` (v3, v4… a cada atualização) e salve.
3. Os aparelhos recebem a versão nova na próxima abertura com internet. Os dados não são apagados.

## Esqueceu o PIN?

Na tela do PIN, toque em **Esqueci o PIN** e confirme o WhatsApp e o e-mail principal do registro.
