// ─────────────────────────────────────────────────────────────
//  L0bby-E — Seed Firebase (roda UMA VEZ)
//
//  Como usar:
//    1. Na pasta do projeto, abra o terminal
//    2. yarn add firebase   (se ainda não tiver)
//    3. node seed-firebase.mjs
// ─────────────────────────────────────────────────────────────
import { readFileSync } from 'fs'
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore'

// ── Lê o .env ────────────────────────────────────────────────
const env = {}
try {
  readFileSync('.env', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=')
    if (k && v.length) env[k.trim()] = v.join('=').trim()
  })
} catch {
  console.error('❌ Arquivo .env não encontrado.')
  process.exit(1)
}

const app = initializeApp({
  apiKey:            env.VITE_FB_API_KEY,
  authDomain:        env.VITE_FB_AUTH_DOMAIN,
  projectId:         env.VITE_FB_PROJECT_ID,
  storageBucket:     env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FB_MESSAGING_SENDER_ID,
  appId:             env.VITE_FB_APP_ID,
})
const db = getFirestore(app)

// ── CATEGORIAS ────────────────────────────────────────────────
const CATEGORIAS = [
  { id: 'cat-1', slug: 'FRONTEND',  label: 'Frontend',  cor: '#8F00FF' },
  { id: 'cat-2', slug: 'BACKEND',   label: 'Backend',   cor: '#00e5ff' },
  { id: 'cat-3', slug: 'DESIGN',    label: 'Design',    cor: '#FF7927' },
  { id: 'cat-4', slug: 'DEVOPS',    label: 'DevOps',    cor: '#39ff14' },
  { id: 'cat-5', slug: 'DADOS',     label: 'Dados',     cor: '#FF3B8A' },
  { id: 'cat-6', slug: 'SEGURANCA', label: 'Segurança', cor: '#FFD700' },
  { id: 'cat-7', slug: 'NEGOCIOS',  label: 'Negócios',  cor: '#FF6B6B' },
  { id: 'cat-8', slug: 'MARKETING', label: 'Marketing', cor: '#4ECDC4' },
  { id: 'cat-9', slug: 'DIREITO',   label: 'Direito',   cor: '#00C49A' },
]

// ── EVENTO — DIREITOS AUTORAIS ────────────────────────────────
const EVENTS = [
  {
    id: 'ev-dir-aut',
    tipo: 'palestra',
    faz_parte_de: null,
    title: 'DIREITO PARA DESIGNERS E DESENVOLVEDORES',
    date: '2026-04-15',
    dateLabel: '15 ABR 2026',
    hours: 2,
    instructor: 'Carolinne Varella',
    foto_palestrante: null,
    invitedBy: 'ETE Cícero Dias',
    location: 'Auditório',
    category: 'DIREITO',
    turmas: ['DG_MOD_ANOS', 'DG_MOD_A', 'DS_MOD1_B'],
    capacity: 60,
    status: 'closed',
    convites_permitidos: false,
    summary: 'Palestra sobre direitos autorais, propriedade intelectual e proteção de carreira para designers e desenvolvedores, ministrada pela advogada especialista Carolinne Varella.',
    topics: ['Direitos autorais', 'Propriedade intelectual', 'Proteção de criações digitais', 'Contratos para freelancers', 'Uso de imagens e fontes licenciadas'],
    material_link: null,
    fotos_registro: [],
    banner: null,
  },
]

// ── ALUNOS ────────────────────────────────────────────────────
const STUDENTS = [
  // ADMIN
  { id: 'adm-1',      name: 'Coordenação DS',                        matricula: 'COORD-001',   turma: null,         curso: null,                        role: 'admin',   pass: 'admin2026' },

  // DESIGN GRÁFICO — anos anteriores
  { id: 'stu-dg-001', name: 'Sued Navaro Souza dos Santos',          matricula: 'DG-2026-001', turma: 'DG_MOD_ANOS', curso: 'Design Gráfico',           role: 'student', pass: '2026' },
  { id: 'stu-dg-002', name: 'Ana Paula Emídio de Medeiros',          matricula: 'DG-2026-002', turma: 'DG_MOD_ANOS', curso: 'Design Gráfico',           role: 'student', pass: '2026' },
  { id: 'stu-dg-003', name: 'Elda Eliza Rodrigues dos Santos',       matricula: 'DG-2026-003', turma: 'DG_MOD_ANOS', curso: 'Design Gráfico',           role: 'student', pass: '2026' },
  { id: 'stu-dg-004', name: 'Gustavo Vieira Milei',                  matricula: 'DG-2026-004', turma: 'DG_MOD_ANOS', curso: 'Design Gráfico',           role: 'student', pass: '2026' },
  { id: 'stu-dg-005', name: 'Karen Vitória Cândido da Silva',        matricula: 'DG-2026-005', turma: 'DG_MOD_ANOS', curso: 'Design Gráfico',           role: 'student', pass: '2026' },
  { id: 'stu-dg-006', name: 'Karolyne Sales Ramalho',                matricula: 'DG-2026-006', turma: 'DG_MOD_ANOS', curso: 'Design Gráfico',           role: 'student', pass: '2026' },
  { id: 'stu-dg-007', name: 'Lázaro Luiz Matias Vieira',             matricula: 'DG-2026-007', turma: 'DG_MOD_ANOS', curso: 'Design Gráfico',           role: 'student', pass: '2026' },
  { id: 'stu-dg-008', name: 'Lucas Felipe de Melo Ramos Silva',      matricula: 'DG-2026-008', turma: 'DG_MOD_ANOS', curso: 'Design Gráfico',           role: 'student', pass: '2026' },

  // DESIGN GRÁFICO — turma A
  { id: 'stu-dg-101', name: 'Amanda Maria Galindo Costa Silva',        matricula: 'DG-2026-101', turma: 'DG_MOD_A', curso: 'Design Gráfico', role: 'student', pass: '2026' },
  { id: 'stu-dg-102', name: 'Guilherme Nunes Marques',                 matricula: 'DG-2026-102', turma: 'DG_MOD_A', curso: 'Design Gráfico', role: 'student', pass: '2026' },
  { id: 'stu-dg-103', name: 'Guilherme Hernando de Souza',             matricula: 'DG-2026-103', turma: 'DG_MOD_A', curso: 'Design Gráfico', role: 'student', pass: '2026' },
  { id: 'stu-dg-104', name: 'Ludmyla Monteiro Barreto',                matricula: 'DG-2026-104', turma: 'DG_MOD_A', curso: 'Design Gráfico', role: 'student', pass: '2026' },
  { id: 'stu-dg-105', name: 'Carlos Eduardo da Silva Lima',            matricula: 'DG-2026-105', turma: 'DG_MOD_A', curso: 'Design Gráfico', role: 'student', pass: '2026' },
  { id: 'stu-dg-106', name: 'Carlos Eduardo da Silva Diniz',           matricula: 'DG-2026-106', turma: 'DG_MOD_A', curso: 'Design Gráfico', role: 'student', pass: '2026' },
  { id: 'stu-dg-107', name: 'Dayvson Farias dos Santos',               matricula: 'DG-2026-107', turma: 'DG_MOD_A', curso: 'Design Gráfico', role: 'student', pass: '2026' },
  { id: 'stu-dg-108', name: 'Damyane Emanuelly Lopes da Silva Duarte', matricula: 'DG-2026-108', turma: 'DG_MOD_A', curso: 'Design Gráfico', role: 'student', pass: '2026' },
  { id: 'stu-dg-109', name: 'Vania Francisca do Nascimento',           matricula: 'DG-2026-109', turma: 'DG_MOD_A', curso: 'Design Gráfico', role: 'student', pass: '2026' },
  { id: 'stu-dg-110', name: 'Mayra Marielly dos Santos Ferreira',      matricula: 'DG-2026-110', turma: 'DG_MOD_A', curso: 'Design Gráfico', role: 'student', pass: '2026' },
  { id: 'stu-dg-111', name: 'Jennifer Emylle Lopes Nascimento',        matricula: 'DG-2026-111', turma: 'DG_MOD_A', curso: 'Design Gráfico', role: 'student', pass: '2026' },
  { id: 'stu-dg-112', name: 'Matheus Alefe Bezerra da Silva',          matricula: 'DG-2026-112', turma: 'DG_MOD_A', curso: 'Design Gráfico', role: 'student', pass: '2026' },
  { id: 'stu-dg-113', name: 'Estevao Jose dos Santos Chagas',          matricula: 'DG-2026-113', turma: 'DG_MOD_A', curso: 'Design Gráfico', role: 'student', pass: '2026' },
  { id: 'stu-dg-114', name: 'Ana Beatriz Alves Silva',                 matricula: 'DG-2026-114', turma: 'DG_MOD_A', curso: 'Design Gráfico', role: 'student', pass: '2026' },

  // DESENVOLVIMENTO DE SISTEMAS — Módulo 1 Turma B
  { id: 'stu-ds-001', name: 'Ronaldo Ribeiro Dionizio da Silva', matricula: 'DS-2026-001', turma: 'DS_MOD1_B', curso: 'Desenvolvimento de Sistemas', role: 'student', pass: '2026' },
  { id: 'stu-ds-002', name: 'João Pedro Rodrigues Viana',        matricula: 'DS-2026-002', turma: 'DS_MOD1_B', curso: 'Desenvolvimento de Sistemas', role: 'student', pass: '2026' },
  { id: 'stu-ds-003', name: 'Thallys Vinícius Lopes da Rocha',   matricula: 'DS-2026-003', turma: 'DS_MOD1_B', curso: 'Desenvolvimento de Sistemas', role: 'student', pass: '2026' },
  { id: 'stu-ds-004', name: 'Bruna Maria do N. Costa',           matricula: 'DS-2026-004', turma: 'DS_MOD1_B', curso: 'Desenvolvimento de Sistemas', role: 'student', pass: '2026' },
  { id: 'stu-ds-005', name: 'Yasmin Lauryn Francine',            matricula: 'DS-2026-005', turma: 'DS_MOD1_B', curso: 'Desenvolvimento de Sistemas', role: 'student', pass: '2026' },
  { id: 'stu-ds-006', name: 'Luiz Henrique',                     matricula: 'DS-2026-006', turma: 'DS_MOD1_B', curso: 'Desenvolvimento de Sistemas', role: 'student', pass: '2026' },
  { id: 'stu-ds-007', name: 'Maria Luisa Rodrigues',             matricula: 'DS-2026-007', turma: 'DS_MOD1_B', curso: 'Desenvolvimento de Sistemas', role: 'student', pass: '2026' },
  { id: 'stu-ds-008', name: 'Matheus Eduardo',                   matricula: 'DS-2026-008', turma: 'DS_MOD1_B', curso: 'Desenvolvimento de Sistemas', role: 'student', pass: '2026' },
  { id: 'stu-ds-009', name: 'João Guilherme',                    matricula: 'DS-2026-009', turma: 'DS_MOD1_B', curso: 'Desenvolvimento de Sistemas', role: 'student', pass: '2026' },
  { id: 'stu-ds-010', name: 'Emilly Maria',                      matricula: 'DS-2026-010', turma: 'DS_MOD1_B', curso: 'Desenvolvimento de Sistemas', role: 'student', pass: '2026' },
  { id: 'stu-ds-011', name: 'Álvaro Miguel',                     matricula: 'DS-2026-011', turma: 'DS_MOD1_B', curso: 'Desenvolvimento de Sistemas', role: 'student', pass: '2026' },
  { id: 'stu-ds-012', name: 'João Gabriel C. C. Loureiro',       matricula: 'DS-2026-012', turma: 'DS_MOD1_B', curso: 'Desenvolvimento de Sistemas', role: 'student', pass: '2026' },
  { id: 'stu-ds-013', name: 'Miguel Gonçalves Arcanjo',          matricula: 'DS-2026-013', turma: 'DS_MOD1_B', curso: 'Desenvolvimento de Sistemas', role: 'student', pass: '2026' },
  { id: 'stu-ds-014', name: 'Magali França',                     matricula: 'DS-2026-014', turma: 'DS_MOD1_B', curso: 'Desenvolvimento de Sistemas', role: 'student', pass: '2026' },
]

// ── CHECKINS — todos presentes no ev-dir-aut ──────────────────
const CHECKINS = [
  'stu-dg-001','stu-dg-002','stu-dg-003','stu-dg-004',
  'stu-dg-005','stu-dg-006','stu-dg-007','stu-dg-008',
  'stu-dg-101','stu-dg-102','stu-dg-103','stu-dg-104',
  'stu-dg-105','stu-dg-106','stu-dg-107','stu-dg-108',
  'stu-dg-109','stu-dg-110','stu-dg-111','stu-dg-112',
  'stu-dg-113','stu-dg-114',
  'stu-ds-001','stu-ds-002','stu-ds-003','stu-ds-004',
  'stu-ds-005','stu-ds-006','stu-ds-007','stu-ds-008',
  'stu-ds-009','stu-ds-010','stu-ds-011','stu-ds-012',
  'stu-ds-013','stu-ds-014',
].map(studentId => ({
  eventId: 'ev-dir-aut',
  studentId,
  checkin: true,
  checkinAt: '2026-04-15T00:00:00.000Z',
}))

// ── Seed ──────────────────────────────────────────────────────
async function upsert(col, id, data) {
  const ref  = doc(db, col, id)
  const snap = await getDoc(ref)
  if (snap.exists()) {
    console.log(`  ⏭  já existe: ${col}/${id}`)
  } else {
    await setDoc(ref, data)
    console.log(`  ✓  criado:    ${col}/${id}`)
  }
}

async function seed() {
  console.log('\n🌱 Iniciando seed...\n')

  console.log('📁 Categorias:')
  for (const cat of CATEGORIAS) {
    const { id, ...data } = cat
    await upsert('categorias', id, data)
  }

  console.log('\n📅 Evento:')
  for (const ev of EVENTS) {
    const { id, ...data } = ev
    await upsert('events', id, data)
  }

  console.log('\n👤 Alunos:')
  for (const stu of STUDENTS) {
    const { id, ...data } = stu
    await upsert('students', id, data)
  }

  console.log('\n✅ Checkins:')
  for (const chk of CHECKINS) {
    const key = `${chk.eventId}_${chk.studentId}`
    await upsert('checkins', key, chk)
  }

  console.log('\n✅ Seed completo!')
  console.log(`   ${STUDENTS.length} alunos + ${CHECKINS.length} checkins criados`)
  process.exit(0)
}

seed().catch(err => {
  console.error('❌ Erro:', err.message)
  process.exit(1)
})
