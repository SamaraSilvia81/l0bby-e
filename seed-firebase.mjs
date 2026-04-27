// ─────────────────────────────────────────────────────────────
//  L0bby-E — Seed Firebase (roda UMA VEZ)
//
//  Como usar:
//    1. Na pasta do projeto, abra o terminal
//    2. npm install firebase   (se ainda não tiver)
//    3. node seed-firebase.mjs
//
//  Esse script lê o seu .env e cria no Firestore:
//    - categorias (8)
//    - events (Educação Financeira + Marketing Digital)
//    - admin (COORD-001)
// ─────────────────────────────────────────────────────────────
import { readFileSync } from 'fs'
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore'

// ── Lê o .env manualmente (sem depender do dotenv) ────────────
const env = {}
try {
  readFileSync('.env', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=')
    if (k && v.length) env[k.trim()] = v.join('=').trim()
  })
} catch {
  console.error('❌ Arquivo .env não encontrado. Rode esse script na pasta raiz do projeto.')
  process.exit(1)
}

const firebaseConfig = {
  apiKey:            env.VITE_FB_API_KEY,
  authDomain:        env.VITE_FB_AUTH_DOMAIN,
  projectId:         env.VITE_FB_PROJECT_ID,
  storageBucket:     env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FB_MESSAGING_SENDER_ID,
  appId:             env.VITE_FB_APP_ID,
}

if (!firebaseConfig.apiKey) {
  console.error('❌ Chaves do Firebase não encontradas no .env')
  process.exit(1)
}

const app = initializeApp(firebaseConfig)
const db  = getFirestore(app)

// ── Dados ──────────────────────────────────────────────────────
const CATEGORIAS = [
  { id: 'cat-1', slug: 'FRONTEND',  label: 'Frontend',  cor: '#8F00FF' },
  { id: 'cat-2', slug: 'BACKEND',   label: 'Backend',   cor: '#00e5ff' },
  { id: 'cat-3', slug: 'DESIGN',    label: 'Design',    cor: '#FF7927' },
  { id: 'cat-4', slug: 'DEVOPS',    label: 'DevOps',    cor: '#39ff14' },
  { id: 'cat-5', slug: 'DADOS',     label: 'Dados',     cor: '#FF3B8A' },
  { id: 'cat-6', slug: 'SEGURANCA', label: 'Segurança', cor: '#FFD700' },
  { id: 'cat-7', slug: 'NEGOCIOS',  label: 'Negócios',  cor: '#FF6B6B' },
  { id: 'cat-8', slug: 'MARKETING', label: 'Marketing', cor: '#4ECDC4' },
]

const EVENTS = [
  {
    id: 'ev-edu-fin',
    tipo: 'palestra',
    faz_parte_de: null,
    title: 'EDUCAÇÃO FINANCEIRA',
    date: '2025-10-15',
    dateLabel: '15 OUT 2025',
    hours: 2,
    instructor: '',          // ← preencha depois no Admin
    foto_palestrante: null,
    invitedBy: 'ETE Cícero Dias',
    location: '',            // ← preencha depois no Admin
    category: 'NEGOCIOS',
    turmas: [],
    capacity: 60,
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
    date: '2025-11-20',
    dateLabel: '20 NOV 2025',
    hours: 2,
    instructor: '',          // ← preencha depois no Admin
    foto_palestrante: null,
    invitedBy: 'ETE Cícero Dias',
    location: '',            // ← preencha depois no Admin
    category: 'MARKETING',
    turmas: [],
    capacity: 60,
    status: 'closed',
    convites_permitidos: false,
    summary: 'Introdução ao marketing digital: redes sociais, SEO, Google Ads e como construir presença online.',
    topics: ['Redes sociais', 'SEO', 'Google Ads', 'Presença digital'],
    material_link: null,
    fotos_registro: [],
    banner: null,
  },
]

const ADMIN = {
  id: 'adm-1',
  name: 'Coordenação DS',
  matricula: 'COORD-001',
  turma: null,
  curso: null,
  role: 'admin',
  pass: 'admin2026',
}

// ── Seed ──────────────────────────────────────────────────────
async function upsert(col, id, data) {
  const ref = doc(db, col, id)
  const snap = await getDoc(ref)
  if (snap.exists()) {
    console.log(`  ⏭  já existe: ${col}/${id}`)
  } else {
    await setDoc(ref, data)
    console.log(`  ✓  criado:    ${col}/${id}`)
  }
}

async function seed() {
  console.log('\n🌱 Iniciando seed do Firebase...\n')

  console.log('📁 Categorias:')
  for (const cat of CATEGORIAS) {
    const { id, ...data } = cat
    await upsert('categorias', id, data)
  }

  console.log('\n📅 Eventos:')
  for (const ev of EVENTS) {
    const { id, ...data } = ev
    await upsert('events', id, data)
  }

  console.log('\n👤 Admin:')
  const { id, ...adminData } = ADMIN
  await upsert('students', id, adminData)

  console.log('\n✅ Seed completo!')
  console.log('\nPróximos passos:')
  console.log('  1. Abra o sistema no navegador')
  console.log('  2. Faça login com COORD-001 / admin2026')
  console.log('  3. Na aba "events", edite os eventos pra adicionar palestrante e local')
  console.log('  4. Na aba "alunos", cadastre os alunos da turma\n')
  process.exit(0)
}

seed().catch(err => {
  console.error('❌ Erro no seed:', err.message)
  process.exit(1)
})
