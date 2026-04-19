// ─────────────────────────────────────────────────────────────
//  L0bby-E — Local DB (localStorage) v2
//  Novo modelo: tipo, foto_palestrante, material_link,
//  fotos_registro, convites, faz_parte_de
// ─────────────────────────────────────────────────────────────

const KEYS = {
  EVENTS:       'lbe_events',
  STUDENTS:     'lbe_students',
  INSCRIPTIONS: 'lbe_inscriptions',
  CHECKINS:     'lbe_checkins',
  CONVITES:     'lbe_convites',
  CATEGORIAS:   'lbe_categorias',
}

// ── Categorias padrão ──────────────────────────────────────
const DEFAULT_CATEGORIAS = [
  { id: 'cat-1', slug: 'FRONTEND',    label: 'Frontend',     cor: '#8F00FF' },
  { id: 'cat-2', slug: 'BACKEND',     label: 'Backend',      cor: '#00e5ff' },
  { id: 'cat-3', slug: 'DESIGN',      label: 'Design',       cor: '#FF7927' },
  { id: 'cat-4', slug: 'DEVOPS',      label: 'DevOps',       cor: '#39ff14' },
  { id: 'cat-5', slug: 'DADOS',       label: 'Dados',        cor: '#FF3B8A' },
  { id: 'cat-6', slug: 'SEGURANCA',   label: 'Segurança',    cor: '#FFD700' },
]

// ── Seed events ────────────────────────────────────────────
const DEFAULT_EVENTS = [
  {
    id: 'ev-1',
    tipo: 'palestra',           // 'palestra' | 'evento'
    faz_parte_de: null,         // id do evento pai ou null
    title: 'REACT UI MASTERCLASS',
    date: '2026-04-20',
    dateLabel: '20 ABR 2026',
    hours: 4,
    instructor: 'Prof. Carlos Mendes',
    foto_palestrante: null,     // URL ou base64
    invitedBy: 'Coordenação de Dev. Sistemas',
    location: 'Laboratório 03',
    category: 'FRONTEND',
    turmas: ['DS_MOD1_A', 'DS_MOD3_B'],
    capacity: 30,
    status: 'open',
    convites_permitidos: true,  // cada inscrito pode convidar 2 pessoas
    summary: 'Imersão técnica sobre como construir interfaces de alto nível utilizando React e Tailwind CSS. Foco em Atomic Design e performance de renderização.',
    topics: ['Atomic Design', 'React Hooks avançados', 'Tailwind CSS', 'Performance e bundle'],
    material_link: null,        // link de material compartilhado (opcional)
    fotos_registro: [],         // array de URLs de fotos do evento
    banner: '/valorant.jpg',
  },
  {
    id: 'ev-2',
    tipo: 'palestra',
    faz_parte_de: null,
    title: 'BACKEND PROTOCOLS',
    date: '2026-04-25',
    dateLabel: '25 ABR 2026',
    hours: 2,
    instructor: 'Eng. Mariana Costa',
    foto_palestrante: null,
    invitedBy: 'Núcleo de Inovação ETE',
    location: 'Auditório Principal',
    category: 'BACKEND',
    turmas: ['DS_MOD3_A', 'DS_MOD3_B'],
    capacity: 50,
    status: 'open',
    convites_permitidos: true,
    summary: 'Exploração de protocolos de segurança, autenticação JWT e estruturação de APIs escaláveis para sistemas de produção.',
    topics: ['JWT Auth', 'REST vs GraphQL', 'Node.js Express', 'Segurança e OWASP'],
    material_link: 'https://github.com/exemplo/backend-protocols',
    fotos_registro: [],
    banner: '/gekko.webp',
  },
  {
    id: 'ev-3',
    tipo: 'palestra',
    faz_parte_de: null,
    title: 'UX/UI DESIGN SPRINT',
    date: '2026-05-05',
    dateLabel: '05 MAI 2026',
    hours: 6,
    instructor: 'Profa. Samara Sabino',
    foto_palestrante: null,
    invitedBy: 'Coord. Design Centrado no Usuário',
    location: 'Laboratório 02',
    category: 'DESIGN',
    turmas: ['DS_MOD1_A', 'DS_MOD1_B'],
    capacity: 25,
    status: 'open',
    convites_permitidos: true,
    summary: 'Sprint intensivo de Design Thinking e prototipação de interfaces mobile. Do wireframe ao protótipo navegável em tempo real.',
    topics: ['Design Thinking', 'Wireframing low-fi', 'Figma hands-on', 'Usability Testing'],
    material_link: null,
    fotos_registro: [],
    banner: '/valorant.jpg',
  },
  {
    id: 'ev-4',
    tipo: 'palestra',
    faz_parte_de: null,
    title: 'GIT FLOW & DEVOPS',
    date: '2026-03-15',
    dateLabel: '15 MAR 2026',
    hours: 3,
    instructor: 'Dev. Rafael Souza',
    foto_palestrante: null,
    invitedBy: 'Coordenação Técnica',
    location: 'Laboratório 01',
    category: 'DEVOPS',
    turmas: ['DS_MOD3_A', 'DS_MOD3_B', 'DS_MOD1_A'],
    capacity: 40,
    status: 'closed',
    convites_permitidos: false,
    summary: 'Do zero ao GitHub profissional: Git Flow, Conventional Commits, Pull Requests e pipelines básicos de CI/CD.',
    topics: ['Git Flow', 'Conventional Commits', 'GitHub Actions', 'CI/CD básico'],
    material_link: 'https://github.com/exemplo/git-flow-slides',
    fotos_registro: [],
    banner: '/gekko.webp',
  },
]

const DEFAULT_STUDENTS = [
  { id: 'stu-1', name: 'Ana Lima',       matricula: '2026-0041', turma: 'DS_MOD3_B', curso: 'Desenvolvimento de Sistemas', role: 'student', pass: '1234' },
  { id: 'stu-2', name: 'Bruno Vieira',   matricula: '2026-0042', turma: 'DS_MOD3_B', curso: 'Desenvolvimento de Sistemas', role: 'student', pass: '1234' },
  { id: 'stu-3', name: 'Carla Santos',   matricula: '2026-0043', turma: 'DS_MOD1_A', curso: 'Desenvolvimento de Sistemas', role: 'student', pass: '1234' },
  { id: 'stu-4', name: 'Diego Moura',    matricula: '2026-0044', turma: 'DS_MOD1_A', curso: 'Desenvolvimento de Sistemas', role: 'student', pass: '1234' },
  { id: 'stu-5', name: 'Eduarda Farias', matricula: '2026-0045', turma: 'DS_MOD3_A', curso: 'Desenvolvimento de Sistemas', role: 'student', pass: '1234' },
  { id: 'adm-1', name: 'Coordenação DS', matricula: 'COORD-001', turma: null, curso: null, role: 'admin', pass: 'admin' },
]

const DEFAULT_INSCRIPTIONS = [
  { id: 'ins-1', studentId: 'stu-1', eventId: 'ev-4', date: '2026-03-01', tipo: 'aluno' },
  { id: 'ins-2', studentId: 'stu-2', eventId: 'ev-4', date: '2026-03-01', tipo: 'aluno' },
  { id: 'ins-3', studentId: 'stu-1', eventId: 'ev-1', date: '2026-04-01', tipo: 'aluno' },
]

const DEFAULT_CHECKINS = [
  { id: 'chk-1', studentId: 'stu-1', eventId: 'ev-4', status: 'presente', ts: '2026-03-15T14:30:00' },
  { id: 'chk-2', studentId: 'stu-2', eventId: 'ev-4', status: 'ausente',  ts: '2026-03-15T14:30:00' },
]

// ── Helpers ────────────────────────────────────────────────
const get  = (key) => JSON.parse(localStorage.getItem(key) || 'null')
const save = (key, data) => localStorage.setItem(key, JSON.stringify(data))
const uid  = () => Math.random().toString(36).slice(2, 10)

// ── Public API ─────────────────────────────────────────────
export const DB = {

  init() {
    if (!get(KEYS.EVENTS))       save(KEYS.EVENTS,       DEFAULT_EVENTS)
    if (!get(KEYS.STUDENTS))     save(KEYS.STUDENTS,     DEFAULT_STUDENTS)
    if (!get(KEYS.INSCRIPTIONS)) save(KEYS.INSCRIPTIONS, DEFAULT_INSCRIPTIONS)
    if (!get(KEYS.CHECKINS))     save(KEYS.CHECKINS,     DEFAULT_CHECKINS)
    if (!get(KEYS.CONVITES))     save(KEYS.CONVITES,     [])
    if (!get(KEYS.CATEGORIAS))   save(KEYS.CATEGORIAS,   DEFAULT_CATEGORIAS)
  },

  reset() {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k))
    this.init()
  },

  // ── Categorias ─────────────────────────────────────────
  getCategorias: () => get(KEYS.CATEGORIAS) || DEFAULT_CATEGORIAS,

  createCategoria(data) {
    const list = get(KEYS.CATEGORIAS) || []
    const nova = { id: 'cat-' + uid(), ...data }
    save(KEYS.CATEGORIAS, [...list, nova])
    return nova
  },

  updateCategoria(id, data) {
    const list = (get(KEYS.CATEGORIAS) || []).map(c => c.id === id ? { ...c, ...data } : c)
    save(KEYS.CATEGORIAS, list)
  },

  deleteCategoria(id) {
    save(KEYS.CATEGORIAS, (get(KEYS.CATEGORIAS) || []).filter(c => c.id !== id))
  },

  // ── Eventos ────────────────────────────────────────────
  getEvents:      () => get(KEYS.EVENTS) || [],
  getEventById:   (id) => (get(KEYS.EVENTS) || []).find(e => e.id === id) || null,
  getUpcoming:    () => (get(KEYS.EVENTS) || []).filter(e => e.status === 'open'),
  getPast:        () => (get(KEYS.EVENTS) || []).filter(e => e.status === 'closed'),
  getByParent:    (parentId) => (get(KEYS.EVENTS) || []).filter(e => e.faz_parte_de === parentId),
  getMainEvents:  () => (get(KEYS.EVENTS) || []).filter(e => e.tipo === 'evento'),
  getPalestras:   () => (get(KEYS.EVENTS) || []).filter(e => e.tipo === 'palestra'),

  createEvent(data) {
    const events = get(KEYS.EVENTS) || []
    const newEv = {
      id: 'ev-' + uid(),
      tipo: 'palestra',
      faz_parte_de: null,
      status: 'open',
      convites_permitidos: true,
      foto_palestrante: null,
      material_link: null,
      fotos_registro: [],
      topics: [],
      turmas: [],
      ...data,
    }
    save(KEYS.EVENTS, [...events, newEv])
    return newEv
  },

  updateEvent(id, data) {
    const events = (get(KEYS.EVENTS) || []).map(e => e.id === id ? { ...e, ...data } : e)
    save(KEYS.EVENTS, events)
  },

  deleteEvent(id) {
    save(KEYS.EVENTS,       (get(KEYS.EVENTS)       || []).filter(e => e.id !== id))
    save(KEYS.INSCRIPTIONS, (get(KEYS.INSCRIPTIONS) || []).filter(i => i.eventId !== id))
    save(KEYS.CHECKINS,     (get(KEYS.CHECKINS)     || []).filter(c => c.eventId !== id))
    save(KEYS.CONVITES,     (get(KEYS.CONVITES)     || []).filter(c => c.eventId !== id))
  },

  // Adicionar foto de registro ao evento
  addFotoRegistro(eventId, url) {
    const ev = this.getEventById(eventId)
    if (!ev) return
    const fotos = [...(ev.fotos_registro || []), url]
    this.updateEvent(eventId, { fotos_registro: fotos })
  },

  // ── Alunos ─────────────────────────────────────────────
  getStudents:     () => get(KEYS.STUDENTS) || [],
  getStudentById:  (id) => (get(KEYS.STUDENTS) || []).find(s => s.id === id) || null,
  getStudentByMat: (m)  => (get(KEYS.STUDENTS) || []).find(s => s.matricula === m) || null,

  // ── Inscrições ─────────────────────────────────────────
  getInscriptions:          () => get(KEYS.INSCRIPTIONS) || [],
  getInscriptionsByStudent: (stuId) => (get(KEYS.INSCRIPTIONS) || []).filter(i => i.studentId === stuId),
  getInscriptionsByEvent:   (evId)  => (get(KEYS.INSCRIPTIONS) || []).filter(i => i.eventId === evId),
  isEnrolled: (stuId, evId) => !!(get(KEYS.INSCRIPTIONS) || []).find(i => i.studentId === stuId && i.eventId === evId),

  enroll(studentId, eventId) {
    if (this.isEnrolled(studentId, eventId)) return false
    const list = get(KEYS.INSCRIPTIONS) || []
    save(KEYS.INSCRIPTIONS, [...list, {
      id: 'ins-' + uid(), studentId, eventId,
      date: new Date().toISOString().slice(0,10),
      tipo: 'aluno',
    }])
    return true
  },

  unenroll(studentId, eventId) {
    save(KEYS.INSCRIPTIONS, (get(KEYS.INSCRIPTIONS) || []).filter(
      i => !(i.studentId === studentId && i.eventId === eventId)
    ))
    // remove convites associados
    save(KEYS.CONVITES, (get(KEYS.CONVITES) || []).filter(
      c => !(c.convidadoPor === studentId && c.eventId === eventId)
    ))
  },

  // ── Convites ───────────────────────────────────────────
  getConvites:          () => get(KEYS.CONVITES) || [],
  getConvitesByEvent:   (evId)  => (get(KEYS.CONVITES) || []).filter(c => c.eventId === evId),
  getConvitesByAluno:   (stuId, evId) => (get(KEYS.CONVITES) || []).filter(c => c.convidadoPor === stuId && c.eventId === evId),

  // Quantos convites o aluno ainda pode usar neste evento
  convitesRestantes(stuId, evId) {
    const usados = this.getConvitesByAluno(stuId, evId).length
    return Math.max(0, 2 - usados)
  },

  // Inscrever convidado (nome + contato, não precisa de matrícula)
  addConvite(convidadoPor, eventId, nomeConvidado, contatoConvidado) {
    const restantes = this.convitesRestantes(convidadoPor, eventId)
    if (restantes <= 0) return { ok: false, msg: 'Limite de 2 convites por aluno atingido.' }
    const ev = this.getEventById(eventId)
    if (!ev?.convites_permitidos) return { ok: false, msg: 'Convites não habilitados neste evento.' }
    const list = get(KEYS.CONVITES) || []
    save(KEYS.CONVITES, [...list, {
      id: 'inv-' + uid(),
      convidadoPor,
      eventId,
      nomeConvidado,
      contatoConvidado,
      date: new Date().toISOString().slice(0,10),
    }])
    return { ok: true }
  },

  removeConvite(conviteId) {
    save(KEYS.CONVITES, (get(KEYS.CONVITES) || []).filter(c => c.id !== conviteId))
  },

  // ── Check-in ───────────────────────────────────────────
  getCheckins:        () => get(KEYS.CHECKINS) || [],
  getCheckinsByEvent: (evId) => (get(KEYS.CHECKINS) || []).filter(c => c.eventId === evId),
  getCheckin:         (stuId, evId) => (get(KEYS.CHECKINS) || []).find(c => c.studentId === stuId && c.eventId === evId) || null,

  setCheckin(studentId, eventId, status) {
    const list = get(KEYS.CHECKINS) || []
    const idx  = list.findIndex(c => c.studentId === studentId && c.eventId === eventId)
    const record = { id: 'chk-' + uid(), studentId, eventId, status, ts: new Date().toISOString() }
    if (idx >= 0) list[idx] = record; else list.push(record)
    save(KEYS.CHECKINS, list)
  },
}

DB.init()
