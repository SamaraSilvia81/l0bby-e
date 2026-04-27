// ─────────────────────────────────────────────────────────────
//  L0bby-E — Seed Firebase
//  Roda UMA VEZ pra popular o banco com dados reais.
//  Como usar:
//    1. Coloque suas credenciais no .env
//    2. npm install (caso não tenha feito)
//    3. node src/db/seed.js
//
//  ATENÇÃO: Rode apenas em ambiente de desenvolvimento.
//  Não commite este arquivo com dados sensíveis.
// ─────────────────────────────────────────────────────────────

// Este seed é feito para ser colado no Console do Firebase
// (Firestore → Start collection) ou rodado via Admin SDK.
//
// Cole os objetos abaixo diretamente no Firestore Console
// ou adapte para usar o firebase-admin se preferir CLI.

// ── CATEGORIAS ────────────────────────────────────────────────
// Coleção: categorias
const CATEGORIAS = [
  { id: 'cat-1', slug: 'FRONTEND',    label: 'Frontend',     cor: '#8F00FF' },
  { id: 'cat-2', slug: 'BACKEND',     label: 'Backend',      cor: '#00e5ff' },
  { id: 'cat-3', slug: 'DESIGN',      label: 'Design',       cor: '#FF7927' },
  { id: 'cat-4', slug: 'DEVOPS',      label: 'DevOps',       cor: '#39ff14' },
  { id: 'cat-5', slug: 'DADOS',       label: 'Dados',        cor: '#FF3B8A' },
  { id: 'cat-6', slug: 'SEGURANCA',   label: 'Segurança',    cor: '#FFD700' },
  { id: 'cat-7', slug: 'NEGOCIOS',    label: 'Negócios',     cor: '#FF6B6B' },
  { id: 'cat-8', slug: 'MARKETING',   label: 'Marketing',    cor: '#4ECDC4' },
]

// ── EVENTOS ───────────────────────────────────────────────────
// Coleção: events
// Os dois primeiros são os eventos reais que já aconteceram.
const EVENTS = [
  // ── EVENTOS JÁ REALIZADOS ──────────────────────────────────
  {
    id: 'ev-edu-fin',
    tipo: 'palestra',
    faz_parte_de: null,
    title: 'EDUCAÇÃO FINANCEIRA',
    date: '2025-10-15',           // ← ajuste a data real
    dateLabel: '15 OUT 2025',     // ← ajuste a data real
    hours: 2,
    instructor: '',               // ← nome do palestrante
    foto_palestrante: null,
    invitedBy: 'ETE Cícero Dias',
    location: '',                 // ← laboratório ou auditório
    category: 'NEGOCIOS',
    turmas: [],                   // ← ex: ['DS_MOD1_A', 'DS_MOD3_B']
    capacity: 50,
    status: 'closed',
    convites_permitidos: false,
    summary: 'Palestra sobre educação financeira: planejamento pessoal, investimentos e independência financeira para jovens.',
    topics: ['Planejamento financeiro', 'Investimentos', 'Independência financeira'],
    material_link: null,
    fotos_registro: [],
    banner: null,
  },
  {
    id: 'ev-mkt-dig',
    tipo: 'palestra',
    faz_parte_de: null,
    title: 'MARKETING DIGITAL',
    date: '2025-11-20',           // ← ajuste a data real
    dateLabel: '20 NOV 2025',     // ← ajuste a data real
    hours: 2,
    instructor: '',               // ← nome do palestrante
    foto_palestrante: null,
    invitedBy: 'ETE Cícero Dias',
    location: '',                 // ← laboratório ou auditório
    category: 'MARKETING',
    turmas: [],                   // ← ex: ['DS_MOD3_A']
    capacity: 50,
    status: 'closed',
    convites_permitidos: false,
    summary: 'Introdução ao marketing digital: redes sociais, SEO, Google Ads e como construir presença online para pequenos negócios.',
    topics: ['Redes sociais', 'SEO', 'Google Ads', 'Presença digital'],
    material_link: null,
    fotos_registro: [],
    banner: null,
  },
  // ── ADICIONE MAIS EVENTOS AQUI ─────────────────────────────
  // Copie o bloco acima e preencha os campos com ← nos comentários
]

// ── ALUNOS ────────────────────────────────────────────────────
// Coleção: students
// role: 'student' para alunos, 'admin' para coordenação
const STUDENTS = [
  // ── ADMIN ─────────────────────────────────────────────────
  {
    id: 'adm-1',
    name: 'Coordenação DS',
    matricula: 'COORD-001',
    turma: null,
    curso: null,
    role: 'admin',
    pass: 'admin2026',    // ← MUDE ESSA SENHA!
  },

  // ── ALUNOS (exemplos — substitua pelos reais) ──────────────
  // {
  //   id: 'stu-001',
  //   name: 'Nome Completo do Aluno',
  //   matricula: '2026-0001',   // matrícula da escola
  //   turma: 'DS_MOD1_A',       // ex: DS_MOD1_A, DS_MOD3_B
  //   curso: 'Desenvolvimento de Sistemas',
  //   role: 'student',
  //   pass: '1234',             // senha inicial (aluno pode não ter como trocar ainda)
  // },
]

// ─────────────────────────────────────────────────────────────
//  COMO POPULAR O FIREBASE (sem código extra)
// ─────────────────────────────────────────────────────────────
//
//  OPÇÃO A — Console Web (mais fácil, recomendada):
//  1. Acesse console.firebase.google.com
//  2. Selecione seu projeto → Firestore Database
//  3. "+ Start collection" → nome: "categorias"
//  4. Para cada item em CATEGORIAS acima, clique "+ Add document"
//     - Document ID: use o id (ex: cat-1)
//     - Adicione os campos: slug, label, cor
//  5. Repita para "events" (usando os objetos em EVENTS)
//  6. Repita para "students" (usando os objetos em STUDENTS)
//
//  OPÇÃO B — Script Node.js com firebase-admin:
//  1. npm install firebase-admin --save-dev
//  2. Baixe a serviceAccountKey.json do Firebase Console
//     (Project Settings → Service accounts → Generate new private key)
//  3. Adapte o código abaixo:
//
//  import admin from 'firebase-admin'
//  import { readFileSync } from 'fs'
//  const sa = JSON.parse(readFileSync('./serviceAccountKey.json'))
//  admin.initializeApp({ credential: admin.credential.cert(sa) })
//  const db = admin.firestore()
//
//  async function seed() {
//    for (const cat of CATEGORIAS) {
//      await db.collection('categorias').doc(cat.id).set(cat)
//    }
//    for (const ev of EVENTS) {
//      await db.collection('events').doc(ev.id).set(ev)
//    }
//    for (const stu of STUDENTS) {
//      await db.collection('students').doc(stu.id).set(stu)
//    }
//    console.log('✓ Seed completo!')
//  }
//  seed()
//
// ─────────────────────────────────────────────────────────────

console.log('Seed data ready. Veja os comentários acima para instruções.')
console.log('CATEGORIAS:', CATEGORIAS.length)
console.log('EVENTS:',     EVENTS.length)
console.log('STUDENTS:',   STUDENTS.length)
