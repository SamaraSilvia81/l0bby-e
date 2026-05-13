import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { DB } from '../db/firebaseDB'
import Navbar from '../components/Navbar'
import { useToast } from '../context/ToastContext'
import { useSound } from '../hooks/useSound'

export default function Staff() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { play } = useSound()
  const navigate = useNavigate()

  const [events, setEvents]       = useState([])
  const [selectedEv, setSelectedEv] = useState(null)
  const [inscritos, setInscritos]   = useState([])
  const [checkins, setCheckins]     = useState({})
  const [search, setSearch]         = useState('')
  const [turmaFilter, setTurmaFilter] = useState('todas')
  const [loading, setLoading]       = useState(true)
  const [loadingEv, setLoadingEv]   = useState(false)

  useEffect(() => {
    DB.getEvents().then(evs => {
      setEvents(evs.filter(e => e.status === 'open'))
      setLoading(false)
    })
  }, [])

  const selectEvent = async (ev) => {
    setSelectedEv(ev)
    setLoadingEv(true)
    setSearch('')
    setTurmaFilter('todas')

    // Busca inscritos
    const inscList = await DB.getInscriptionsByEvent(ev.id)
    const stuList = (await Promise.all(inscList.map(i => DB.getStudentById(i.studentId)))).filter(Boolean)

    // Busca checkins existentes
    const chks = await DB.getCheckinsByEvent(ev.id)
    const chkMap = {}
    chks.forEach(c => { chkMap[c.studentId] = c.status || (c.checkin === true ? 'presente' : null) })

    setInscritos(stuList)
    setCheckins(chkMap)
    setLoadingEv(false)
  }

  const toggle = async (stuId, status) => {
    await DB.setCheckin(stuId, selectedEv.id, status)
    setCheckins(p => ({ ...p, [stuId]: status }))
    play(status === 'presente' ? 'success' : 'error')
    toast(status === 'presente' ? '✓ Presença confirmada' : '✗ Presença removida', status === 'presente' ? 'success' : 'info')
  }

  // Turmas únicas dos inscritos
  const turmas = ['todas', ...new Set(inscritos.map(s => s.turma).filter(Boolean))]

  const filtered = inscritos.filter(s => {
    const matchSearch = !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.matricula?.includes(search) || s.username?.includes(search.toLowerCase())
    const matchTurma = turmaFilter === 'todas' || s.turma === turmaFilter
    return matchSearch && matchTurma
  })

  const totalPresente = Object.values(checkins).filter(v => v === 'presente').length

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      <Navbar />

      {/* Blobs */}
      <div style={{ position:'fixed', width:500, height:500, top:'calc(50vh - 250px)', left:-200, background:'radial-gradient(circle, rgba(143,0,255,0.07) 0%, transparent 70%)', pointerEvents:'none', zIndex:-1 }} />
      <div style={{ position:'fixed', width:400, height:400, bottom:-100, right:-100, background:'radial-gradient(circle, rgba(255,121,39,0.05) 0%, transparent 70%)', pointerEvents:'none', zIndex:-1 }} />

      <div style={{ flex:1, padding:'1.5rem 2rem' }}>

        {!selectedEv ? (
          <>
            {/* Seleção de evento */}
            <div style={{ marginBottom:'1.5rem' }}>
              <span className="tech-label">// check-in</span>
              <h1 style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'1.8rem', color:'var(--text)', lineHeight:1, marginTop:4 }}>
                SELECIONE O EVENTO
              </h1>
            </div>

            {loading ? (
              <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text3)' }}>// carregando eventos...</p>
            ) : events.length === 0 ? (
              <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text3)' }}>// nenhum evento aberto no momento</p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:4, maxWidth:600 }}>
                {events.map(ev => (
                  <div key={ev.id}
                    onClick={() => { play('nav'); selectEvent(ev) }}
                    style={{ background:'var(--surface)', border:'1px solid var(--border)', padding:'1.25rem 1.5rem', cursor:'pointer', transition:'all 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor='var(--v)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}>
                    <p style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'1.1rem', color:'var(--text)', marginBottom:4 }}>
                      {ev.title}
                    </p>
                    <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.6rem', color:'var(--text3)' }}>
                      {ev.dateLabel} · {ev.location} · {ev.hours}h
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Header do check-in */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem', flexWrap:'wrap', gap:8 }}>
              <div>
                <button onClick={() => setSelectedEv(null)}
                  style={{ fontFamily:'var(--font-mono)', fontSize:'0.6rem', color:'var(--text3)', background:'none', border:'none', cursor:'pointer', marginBottom:8, padding:0 }}>
                  ← trocar evento
                </button>
                <h1 style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'1.4rem', color:'var(--text)', lineHeight:1 }}>
                  {selectedEv.title}
                </h1>
                <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.6rem', color:'var(--text3)', marginTop:4 }}>
                  {selectedEv.dateLabel} · {inscritos.length} inscritos · <span style={{ color:'var(--v)', fontWeight:700 }}>{totalPresente} presentes</span>
                </p>
              </div>

              {/* Contador grande */}
              <div style={{ textAlign:'right' }}>
                <p style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'3rem', color:'var(--v)', lineHeight:1 }}>
                  {totalPresente}
                </p>
                <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.55rem', color:'var(--text3)' }}>/ {inscritos.length} presentes</p>
              </div>
            </div>

            {/* Busca + filtro */}
            <div style={{ display:'flex', gap:8, marginBottom:'1rem', flexWrap:'wrap' }}>
              <input
                className="input"
                style={{ flex:1, minWidth:200, fontSize:'0.85rem' }}
                placeholder="buscar por nome, matrícula ou usuário..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
              {turmas.length > 2 && (
                <select
                  className="input"
                  style={{ width:'auto', fontSize:'0.75rem' }}
                  value={turmaFilter}
                  onChange={e => setTurmaFilter(e.target.value)}>
                  {turmas.map(t => (
                    <option key={t} value={t}>{t === 'todas' ? 'todas as turmas' : t}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Lista */}
            {loadingEv ? (
              <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text3)' }}>// carregando inscritos...</p>
            ) : filtered.length === 0 ? (
              <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text3)' }}>// nenhum aluno encontrado</p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                {filtered.map(stu => {
                  const status = checkins[stu.id]
                  const presente = status === 'presente'
                  return (
                    <div key={stu.id} style={{
                      background: presente ? 'rgba(143,0,255,0.06)' : 'var(--surface)',
                      border: presente ? '1px solid var(--v)' : '1px solid var(--border)',
                      padding:'0.9rem 1.25rem',
                      display:'flex', justifyContent:'space-between', alignItems:'center', gap:8,
                      transition:'all 0.1s',
                    }}>
                      <div>
                        <p style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'1rem', color:'var(--text)', lineHeight:1, marginBottom:3 }}>
                          {stu.name}
                        </p>
                        <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.58rem', color:'var(--text3)' }}>
                          {stu.username && `@${stu.username}`}{stu.matricula && ` · ${stu.matricula}`}{stu.turma && ` · ${stu.turma}`}
                        </p>
                      </div>
                      <button
                        onClick={() => toggle(stu.id, presente ? 'ausente' : 'presente')}
                        style={{
                          fontFamily:'var(--font-mono)', fontWeight:700, fontSize:'0.7rem',
                          letterSpacing:'0.06em', padding:'10px 20px', cursor:'pointer',
                          border: presente ? '1px solid var(--v)' : '1px solid var(--border)',
                          background: presente ? 'var(--v)' : 'transparent',
                          color: presente ? '#fff' : 'var(--text3)',
                          transition:'all 0.15s', minWidth:110,
                        }}>
                        {presente ? '✓ PRESENTE' : 'marcar'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      <footer>
        <span><span className="logo-sm">l<span>0</span>bby-e</span> · ETE Cícero Dias</span>
        <span>desenvolvimento de sistemas · recife, pe</span>
      </footer>
    </div>
  )
}