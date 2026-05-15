// ─────────────────────────────────────────────────────────────
//  L0bby-E — Firebase DB v1
// ─────────────────────────────────────────────────────────────
import { db } from '../firebase'
import {
  collection, doc,
  getDocs, getDoc, addDoc, setDoc, updateDoc, deleteDoc,
  query, where, orderBy,
  serverTimestamp,
} from 'firebase/firestore'

// ── Coleções ──────────────────────────────────────────────────
const C = {
  EVENTS:       'events',
  STUDENTS:     'students',
  INSCRIPTIONS: 'inscriptions',
  CHECKINS:     'checkins',
  CERTS:        'certificates',
  CONVITES:     'convites',
  CATEGORIAS:   'categorias',
}

// ── Helpers internos ──────────────────────────────────────────
const colRef  = (col)     => collection(db, col)
const docRef  = (col, id) => doc(db, col, id)
const uid     = ()        => Math.random().toString(36).slice(2, 10)

async function getAll(col) {
  const snap = await getDocs(colRef(col))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

async function getById(col, id) {
  const snap = await getDoc(docRef(col, id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

async function queryWhere(col, field, op, value) {
  const q    = query(colRef(col), where(field, op, value))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ── Public API (async) ────────────────────────────────────────
export const DB = {

  // ── Categorias ──────────────────────────────────────────────
  async getCategorias() { return getAll(C.CATEGORIAS) },

  async createCategoria(data) {
    const id = 'cat-' + uid()
    await setDoc(docRef(C.CATEGORIAS, id), data)
    return { id, ...data }
  },

  async updateCategoria(id, data) { await updateDoc(docRef(C.CATEGORIAS, id), data) },
  async deleteCategoria(id)       { await deleteDoc(docRef(C.CATEGORIAS, id)) },

  // ── Eventos ─────────────────────────────────────────────────
  async getEvents()        { return getAll(C.EVENTS) },
  async getEventById(id)   { return getById(C.EVENTS, id) },
  async getUpcoming()      { return queryWhere(C.EVENTS, 'status', '==', 'open') },
  async getPast()          { return queryWhere(C.EVENTS, 'status', '==', 'closed') },
  async getByParent(p)     { return queryWhere(C.EVENTS, 'faz_parte_de', '==', p) },
  async getMainEvents()    { return queryWhere(C.EVENTS, 'tipo', '==', 'evento') },
  async getPalestras()     { return queryWhere(C.EVENTS, 'tipo', '==', 'palestra') },

  async createEvent(data) {
    const id = 'ev-' + uid()
    const newEv = {
      tipo: 'palestra', faz_parte_de: null, status: 'open',
      convites_permitidos: true, foto_palestrante: null,
      material_link: null, fotos_registro: [], topics: [], turmas: [],
      ...data, createdAt: serverTimestamp(),
    }
    await setDoc(docRef(C.EVENTS, id), newEv)
    return { id, ...newEv }
  },

  async updateEvent(id, data) {
    await updateDoc(docRef(C.EVENTS, id), { ...data, updatedAt: serverTimestamp() })
  },

  async deleteEvent(id) {
    await deleteDoc(docRef(C.EVENTS, id))
    const [insc, chks, convs] = await Promise.all([
      queryWhere(C.INSCRIPTIONS, 'eventId', '==', id),
      queryWhere(C.CHECKINS,     'eventId', '==', id),
      queryWhere(C.CONVITES,     'eventId', '==', id),
    ])
    await Promise.all([
      ...insc.map(i  => deleteDoc(docRef(C.INSCRIPTIONS, i.id))),
      ...chks.map(c  => deleteDoc(docRef(C.CHECKINS,     c.id))),
      ...convs.map(c => deleteDoc(docRef(C.CONVITES,     c.id))),
    ])
  },

  async addFotoRegistro(eventId, url) {
    const ev = await this.getEventById(eventId)
    if (!ev) return
    await this.updateEvent(eventId, { fotos_registro: [...(ev.fotos_registro || []), url] })
  },

  // ── Alunos ──────────────────────────────────────────────────
  async getStudents()      { return getAll(C.STUDENTS) },
  async getStudentById(id) { return getById(C.STUDENTS, id) },

  async getStudentByMat(matricula) {
    const r = await queryWhere(C.STUDENTS, 'matricula', '==', matricula)
    return r[0] || null
  },

  async getStudentByUsername(username) {
    const r = await queryWhere(C.STUDENTS, 'username', '==', username.toLowerCase().trim())
    return r[0] || null
  },

  async getStudentByLogin(login) {
    const loginLower = login.toLowerCase().trim()
    const all = await getAll(C.STUDENTS)
    return all.find(s =>
      (s.username && s.username.toLowerCase() === loginLower) ||
      s.matricula === login.trim()
    ) || null
  },

  async enrollAllStudentsInEvent(eventId, turmas) {
    const students = await this.getStudents()
    const filtered = turmas && turmas.length > 0
      ? students.filter(s => s.role === 'student' && turmas.includes(s.turma))
      : students.filter(s => s.role === 'student')
    const existing    = await queryWhere(C.INSCRIPTIONS, 'eventId', '==', eventId)
    const existingIds = existing.map(i => i.studentId)
    let count = 0
    for (const stu of filtered) {
      if (!existingIds.includes(stu.id)) {
        const id = 'insc-' + uid()
        await setDoc(docRef(C.INSCRIPTIONS, id), {
          studentId: stu.id, eventId, inscAt: new Date().toISOString()
        })
        count++
      }
    }
    return count
  },

  async createStudent(data) {
    const id = 'stu-' + uid()
    await setDoc(docRef(C.STUDENTS, id), { ...data, role: 'student', createdAt: serverTimestamp() })
    return { id, ...data }
  },

  async updateStudent(id, data) { await updateDoc(docRef(C.STUDENTS, id), data) },
  async deleteStudent(id)       { await deleteDoc(docRef(C.STUDENTS, id)) },

  // ── Inscrições ──────────────────────────────────────────────
  async getInscriptions()              { return getAll(C.INSCRIPTIONS) },
  async getInscriptionsByStudent(sid)  { return queryWhere(C.INSCRIPTIONS, 'studentId', '==', sid) },
  async getInscriptionsByEvent(eid)    { return queryWhere(C.INSCRIPTIONS, 'eventId',   '==', eid) },

  async isEnrolled(studentId, eventId) {
    const r = await queryWhere(C.INSCRIPTIONS, 'studentId', '==', studentId)
    return r.some(i => i.eventId === eventId)
  },

  async enroll(studentId, eventId) {
    const already = await this.isEnrolled(studentId, eventId)
    if (already) return false
    const id = 'ins-' + uid()
    await setDoc(docRef(C.INSCRIPTIONS, id), {
      studentId, eventId,
      date: new Date().toISOString().slice(0, 10),
      tipo: 'aluno', createdAt: serverTimestamp(),
    })
    return true
  },

  async unenroll(studentId, eventId) {
    const [insc, convs] = await Promise.all([
      queryWhere(C.INSCRIPTIONS, 'studentId',    '==', studentId),
      queryWhere(C.CONVITES,     'convidadoPor', '==', studentId),
    ])
    await Promise.all([
      ...insc.filter(i  => i.eventId  === eventId).map(i  => deleteDoc(docRef(C.INSCRIPTIONS, i.id))),
      ...convs.filter(c => c.eventId  === eventId).map(c  => deleteDoc(docRef(C.CONVITES,     c.id))),
    ])
  },

  // ── Convites ────────────────────────────────────────────────
  async getConvites()              { return getAll(C.CONVITES) },
  async getConvitesByEvent(eid)    { return queryWhere(C.CONVITES, 'eventId', '==', eid) },

  async getConvitesByAluno(studentId, eventId) {
    const all = await queryWhere(C.CONVITES, 'convidadoPor', '==', studentId)
    return all.filter(c => c.eventId === eventId)
  },

  async convitesRestantes(studentId, eventId) {
    const usados = await this.getConvitesByAluno(studentId, eventId)
    return Math.max(0, 2 - usados.length)
  },

  async addConvite(convidadoPor, eventId, nomeConvidado, contatoConvidado) {
    const [restantes, ev] = await Promise.all([
      this.convitesRestantes(convidadoPor, eventId),
      this.getEventById(eventId),
    ])
    if (restantes <= 0)        return { ok: false, msg: 'Limite de 2 convites por aluno atingido.' }
    if (!ev?.convites_permitidos) return { ok: false, msg: 'Convites não habilitados neste evento.' }
    const id = 'inv-' + uid()
    await setDoc(docRef(C.CONVITES, id), {
      convidadoPor, eventId, nomeConvidado, contatoConvidado,
      date: new Date().toISOString().slice(0, 10),
      createdAt: serverTimestamp(),
    })
    return { ok: true }
  },

  async removeConvite(conviteId) { await deleteDoc(docRef(C.CONVITES, conviteId)) },

  // ── Check-in ────────────────────────────────────────────────
  async getCheckins()            { return getAll(C.CHECKINS) },
  async getCheckinsByEvent(eid)  { return queryWhere(C.CHECKINS, 'eventId', '==', eid) },

  async getCheckin(studentId, eventId) {
    const all = await queryWhere(C.CHECKINS, 'studentId', '==', studentId)
    return all.find(c => c.eventId === eventId) || null
  },

  async setCheckin(studentId, eventId, status) {
    const existing = await this.getCheckin(studentId, eventId)
    const record   = { studentId, eventId, status, ts: new Date().toISOString() }
    if (existing) {
      await updateDoc(docRef(C.CHECKINS, existing.id), record)
    } else {
      const id = 'chk-' + uid()
      await setDoc(docRef(C.CHECKINS, id), { ...record, createdAt: serverTimestamp() })
    }
  },

  // ── Certificados ────────────────────────────────────────────
  async getCertsByStudent(studentId) {
    return queryWhere(C.CERTS, 'studentId', '==', studentId)
  },

  async getCertByStudentAndEvent(studentId, eventId) {
    const all = await queryWhere(C.CERTS, 'studentId', '==', studentId)
    return all.find(c => c.eventId === eventId) || null
  },

  async logCert(studentId, eventId, data = {}) {
    const existing = await this.getCertByStudentAndEvent(studentId, eventId)
    if (existing) {
      await updateDoc(docRef(C.CERTS, existing.id), {
        downloads: (existing.downloads || 0) + 1,
        lastDownloadAt: new Date().toISOString(),
        ...data,
      })
      return existing.id
    }
    const id = 'cert-' + uid()
    await setDoc(docRef(C.CERTS, id), {
      studentId, eventId,
      downloads: 1,
      emailSent: false,
      issuedAt: new Date().toISOString(),
      lastDownloadAt: new Date().toISOString(),
      ...data,
    })
    return id
  },

  async markCertEmailSent(studentId, eventId) {
    const cert = await this.getCertByStudentAndEvent(studentId, eventId)
    if (cert) await updateDoc(docRef(C.CERTS, cert.id), {
      emailSent: true, emailSentAt: new Date().toISOString()
    })
  },
}