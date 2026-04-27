# L0bby-E v2 — Guia de Deploy com Firebase + Vercel

## O que mudou nessa versão

- `src/db/firebaseDB.js` — substitui o `localDB.js`. Mesma API, mas async.
- `src/firebase.js` — configuração do Firebase.
- `src/context/AuthContext.jsx` — atualizado para async.
- `src/db/seed.js` — dados iniciais para popular o banco.
- `.env.example` — modelo das variáveis de ambiente.
- `package.json` — adicionada dependência `firebase`.

As páginas (Home, Details, Admin, Profile, Login) **não precisam mudar**
desde que você substitua os imports de `localDB` para `firebaseDB` e
torne os handlers `async`.

---

## PASSO 1 — Criar projeto no Firebase

1. Acesse **console.firebase.google.com**
2. Clique em **Add project** → dê um nome (ex: `lobby-e-ete`)
3. Pode desativar Google Analytics (não precisa)
4. Dentro do projeto: **Build → Firestore Database**
5. Clique **Create database** → escolha **production mode**
6. Região: `southamerica-east1` (São Paulo — mais próximo de Recife)

---

## PASSO 2 — Regras de segurança do Firestore

No Firestore → **Rules**, cole isso:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Qualquer pessoa autenticada (pelo app) pode ler tudo
    match /{document=**} {
      allow read: if true;
    }

    // Só o backend (via Admin SDK ou Console) pode escrever em students
    match /students/{id} {
      allow write: if false; // cadastro só pelo Console ou seed
    }

    // Inscrições e checkins: só leitura/escrita autenticada pelo app
    match /inscriptions/{id} {
      allow write: if true;
    }
    match /checkins/{id} {
      allow write: if true;
    }
    match /convites/{id} {
      allow write: if true;
    }
    match /events/{id} {
      allow write: if true;
    }
    match /categorias/{id} {
      allow write: if true;
    }
  }
}
```

> ⚠️ Essas regras são permissivas para facilitar o início.
> Depois que o projeto estiver estável, troque por regras
> mais restritivas baseadas no campo `role` do aluno.

---

## PASSO 3 — Pegar as credenciais do Firebase

1. No Console: **⚙️ Project Settings → Your apps**
2. Clique no ícone `</>` (Web) → registre o app com o nome `lobby-e`
3. Copie o objeto `firebaseConfig` exibido

---

## PASSO 4 — Configurar o .env local

```bash
cp .env.example .env
```

Abra o `.env` e preencha com os valores do `firebaseConfig`:

```
VITE_FB_API_KEY=AIza...
VITE_FB_AUTH_DOMAIN=lobby-e-ete.firebaseapp.com
VITE_FB_PROJECT_ID=lobby-e-ete
VITE_FB_STORAGE_BUCKET=lobby-e-ete.appspot.com
VITE_FB_MESSAGING_SENDER_ID=12345678
VITE_FB_APP_ID=1:12345678:web:abc123
```

---

## PASSO 5 — Instalar dependências e testar local

```bash
npm install
npm run dev
```

---

## PASSO 6 — Popular o banco (seed)

Abra o arquivo `src/db/seed.js` e preencha os dados reais:

- Datas corretas dos eventos de Educação Financeira e Marketing Digital
- Nomes dos palestrantes, locais, turmas
- Lista de alunos (matrícula, nome, turma, senha inicial)

**Opção mais fácil — Console do Firebase:**
1. Firestore → + Start collection → `categorias`
2. Para cada categoria em `CATEGORIAS` no seed.js, adicione um documento
   com o ID exato (ex: `cat-1`) e os campos `slug`, `label`, `cor`
3. Repita para `events` e `students`

**Dica:** Para cadastrar alunos no futuro, basta ir no Firestore Console,
abrir a coleção `students` e clicar `+ Add document`.

---

## PASSO 7 — Trocar imports nas páginas

Nos arquivos que importam `localDB`, mude:

```js
// ANTES
import { DB } from '../db/localDB'

// DEPOIS
import { DB } from '../db/firebaseDB'
```

Arquivos para atualizar:
- `src/pages/Home.jsx`
- `src/pages/Details.jsx`
- `src/pages/Admin.jsx`
- `src/pages/Profile.jsx`

Como o DB agora é **async**, os handlers que chamam `DB.*` precisam
virar `async` e usar `await`. Exemplo:

```js
// ANTES
const handleEnroll = () => {
  const ok = DB.enroll(user.id, eventId)
  ...
}

// DEPOIS
const handleEnroll = async () => {
  const ok = await DB.enroll(user.id, eventId)
  ...
}
```

---

## PASSO 8 — Deploy na Vercel

1. Faça push do projeto para o GitHub
2. Acesse **vercel.com** → Import → selecione o repositório
3. Em **Environment Variables**, adicione todas as variáveis do seu `.env`
   (VITE_FB_API_KEY, VITE_FB_AUTH_DOMAIN, etc.)
4. Clique **Deploy** ✓

A cada `git push`, a Vercel atualiza automaticamente.

---

## Cadastrando alunos (fluxo operacional)

Como a senha fica no Firestore (campo `pass`), **não exponha isso publicamente**.
O fluxo recomendado:

1. Coordenação acessa o **Firestore Console** (ou usa o painel Admin do app)
2. Adiciona o aluno na coleção `students` com matrícula e senha inicial (ex: `1234`)
3. O aluno faz login com matrícula + senha
4. No futuro: adicione um fluxo de "trocar senha" no perfil do aluno

---

## Estrutura final do projeto

```
lobby-e-v3/
├── src/
│   ├── db/
│   │   ├── localDB.js        ← versão antiga (pode remover depois)
│   │   ├── firebaseDB.js     ← novo banco (Firebase)
│   │   └── seed.js           ← dados iniciais
│   ├── context/
│   │   └── AuthContext.jsx   ← atualizado para async
│   ├── firebase.js           ← configuração Firebase
│   └── pages/                ← sem mudanças estruturais
├── .env                      ← suas chaves (não commitar!)
├── .env.example              ← modelo público
└── package.json              ← firebase adicionado
```
