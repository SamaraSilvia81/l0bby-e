import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useSound } from '../hooks/useSound'
import { DB } from '../db/firebaseDB'
import Navbar from '../components/Navbar'
import EventCard from '../components/EventCard'
import CertModal from '../components/CertModal'

export default function Home() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { play } = useSound()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('todos')
  const [certEvent, setCertEvent] = useState(null)

  const [allEvents, setAllEvents]       = useState([])
  const [categorias, setCategorias]     = useState([])
  const [inscriptions, setInscriptions] = useState([])
  const [checkins, setCheckins]         = useState([])
  const [loading, setLoading]           = useState(true)

  const load = async () => {
    setLoading(true)
    const [evs, cats, insc] = await Promise.all([
      DB.getEvents(),
      DB.getCategorias(),
      user ? DB.getInscriptionsByStudent(user.id) : Promise.resolve([]),
    ])
    const chkList = user
      ? (await Promise.all(evs.map(ev => DB.getCheckin(user.id, ev.id)))).filter(Boolean)
      : []
    setAllEvents(evs)
    setCategorias(cats)
    setInscriptions(insc)
    setCheckins(chkList)
    setLoading(false)
  }

  useEffect(() => { load() }, [user])

  const myEventIds = inscriptions.map(i => i.eventId)
  const sortedEnriched = [...allEvents].sort((a, b) => {
    const aIdx = myEventIds.indexOf(a.id)
    const bIdx = myEventIds.indexOf(b.id)
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx
    if (aIdx !== -1) return -1
    if (bIdx !== -1) return 1
    return new Date(a.date) - new Date(b.date)
  })

  const catCount = (slug) => allEvents.filter(e => e.category === slug).length
  const filtered = useMemo(() =>
    sortedEnriched.filter(e => filter === 'todos' || e.category === filter),
    [filter, sortedEnriched]
  )

  const myEvents    = myEventIds.map(id => allEvents.find(e => e.id === id)).filter(Boolean)
  const openCount   = allEvents.filter(e => e.status === 'open').length
  const closedCount = allEvents.filter(e => e.status === 'closed').length

  const handleEnroll = async (eventId) => {
    if (!user) { toast('Faça login para se inscrever.', 'info'); navigate('/login'); return }
    const ok = await DB.enroll(user.id, eventId)
    if (ok) { play('enroll'); toast('Inscrição confirmada!', 'success'); load() }
    else    { play('error'); toast('Você já está inscrito.', 'info') }
  }

  const handleUnenroll = async (eventId) => {
    if (!user) return
    await DB.unenroll(user.id, eventId)
    play('click'); toast('Inscrição cancelada.', 'info'); load()
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      <Navbar />

      <div className="hero">
        <div className="hero-left">
          <div className="hero-tag">ETE Cícero Dias · Desenvolvimento de Sistemas</div>
          <h1 className="hero-h1">
            GAME<br/><span className="accent">DAY</span><br/><span className="orange">2026.</span>
          </h1>
          <p className="hero-desc">
            Palestras, workshops e eventos técnicos do curso.
            Inscreva-se, confirme presença e gere seu certificado.
          </p>
          <div className="hero-actions">
            <button className="btn btn-v btn-lg"
              onClick={() => { play('click'); document.getElementById('grid-section')?.scrollIntoView({behavior:'smooth'}) }}
              onMouseEnter={() => play('hover')}>
              ver events →
            </button>
            {!user && (
              <button className="btn btn-o"
                onClick={() => { play('click'); navigate('/login') }}
                onMouseEnter={() => play('hover')}>
                entrar
              </button>
            )}
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-visual">
            <div className="hero-wordmark">L<span className="wz">0</span>BBY</div>
            <div className="hero-badge">{loading ? 'carregando...' : 'sistema ativo'}</div>
          </div>
          <div className="stats-row">
            <div className="stat-cell">
              <span className="stat-num">{String(openCount).padStart(2,'0')}</span>
              <span className="stat-label">events abertos</span>
            </div>
            <div className="stat-cell">
              <span className="stat-num">{inscriptions.length}</span>
              <span className="stat-label">minhas inscrições</span>
            </div>
            <div className="stat-cell">
              <span className="stat-num">{String(allEvents.length).padStart(2,'0')}</span>
              <span className="stat-label">no total</span>
            </div>
          </div>
        </div>
      </div>

      {user && myEvents.length > 0 && (
        <div className="section" style={{ borderBottom:'1px solid var(--border)' }}>
          <div className="section-header">
            <span className="section-title">meus events</span>
            <span className="section-meta">{myEvents.length} inscrição(ões)</span>
          </div>
          <div className="event-rail">
            {myEvents.map(ev => {
              const chk = checkins.find(c => c.eventId === ev.id)
              return (
                <div key={ev.id} style={{ display:'flex', flexDirection:'column', minWidth:300 }}>
                  <EventCard event={ev} enrolled onUnenroll={handleUnenroll} />
                  {chk?.status === 'presente' && (
                    <button className="btn btn-v btn-sm btn-full" style={{ marginTop:6 }}
                      onClick={() => { play('cert'); setCertEvent(ev) }}
                      onMouseEnter={() => play('hover')}>
                      ★ certificado
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!user && (
        <div style={{ padding:'0.9rem 2rem', borderBottom:'1px solid var(--border)', background:'var(--v-dim)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem', flexWrap:'wrap' }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.1em', color:'var(--v-pale)' }}>
            // faça login para se inscrever e acompanhar seu histórico
          </span>
          <button className="btn btn-v btn-sm"
            onClick={() => { play('click'); navigate('/login') }}
            onMouseEnter={() => play('hover')}>
            entrar →
          </button>
        </div>
      )}

      <div className="filter-bar">
        <span className="filter-label">filtrar:</span>
        <button className={`chip ${filter==='todos'?'active':''}`}
          onClick={() => { play('click'); setFilter('todos') }}
          onMouseEnter={() => play('hover')}>
          todos <span className="chip-count">{allEvents.length}</span>
        </button>
        {categorias.map(cat => (
          <button key={cat.slug}
            className={`chip ${filter===cat.slug?'active':''}`}
            onClick={() => { play('click'); setFilter(cat.slug) }}
            onMouseEnter={() => play('hover')}>
            {cat.label} <span className="chip-count">{catCount(cat.slug)}</span>
          </button>
        ))}
      </div>

      <div id="grid-section" className="section" style={{ flex:1 }}>
        <div className="section-header">
          <span className="section-title">todos os events</span>
          <span className="section-meta">{openCount} aberto(s) · {closedCount} encerrado(s)</span>
        </div>
        {loading ? (
          <div style={{ padding:'3rem', textAlign:'center', fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text3)' }}>
            // carregando eventos...
          </div>
        ) : (
          <div className="event-grid">
            {filtered.map(ev => (
              <EventCard key={ev.id} event={ev}
                enrolled={myEventIds.includes(ev.id)}
                onEnroll={handleEnroll} onUnenroll={handleUnenroll} />
            ))}
            {filtered.length === 0 && (
              <div style={{ gridColumn:'1/-1', padding:'3rem', textAlign:'center', fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text3)' }}>
                // nenhum event nesta categoria
              </div>
            )}
          </div>
        )}
      </div>

      <footer>
        <span><span className="logo-sm">l<span>0</span>bby-e</span> · ETE Cícero Dias</span>
        <span>desenvolvimento de sistemas · recife, pe</span>
      </footer>

      {certEvent && user && (
        <CertModal event={certEvent} student={user} onClose={() => setCertEvent(null)} />
      )}
    </div>
  )
}
