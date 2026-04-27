import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useSound } from '../hooks/useSound'
import { DB } from '../db/firebaseDB'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import CertModal from '../components/CertModal'

export default function Profile() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { play } = useSound()
  const navigate = useNavigate()
  const [certEvent, setCertEvent] = useState(null)
  const [avatar, setAvatar] = useState(() => localStorage.getItem(`avatar_${user?.id}`) || null)
  const fileRef = useRef()

  const [myEvents, setMyEvents]   = useState([])
  const [checkins, setCheckins]   = useState([])
  const [convites, setConvites]   = useState({})
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      setLoading(true)
      const inscriptions = await DB.getInscriptionsByStudent(user.id)
      const evList = (await Promise.all(inscriptions.map(i => DB.getEventById(i.eventId)))).filter(Boolean)
      const chkList = (await Promise.all(evList.map(ev => DB.getCheckin(user.id, ev.id)))).filter(Boolean)
      const convMap = {}
      await Promise.all(evList.filter(e => e.status==='open').map(async ev => {
        convMap[ev.id] = await DB.convitesRestantes(user.id, ev.id)
      }))
      setMyEvents(evList)
      setCheckins(chkList)
      setConvites(convMap)
      setLoading(false)
    }
    load()
  }, [user])

  if (!user) return null

  const pastEvents   = myEvents.filter(e => e.status === 'closed')
  const upcoming     = myEvents.filter(e => e.status === 'open')
  const totalHours   = pastEvents.reduce((acc, ev) => {
    const chk = checkins.find(c => c.eventId === ev.id)
    return chk?.status === 'presente' ? acc + ev.hours : acc
  }, 0)
  const totalPresent = pastEvents.filter(ev => checkins.find(c => c.eventId === ev.id)?.status === 'presente').length
  const initials = user.name?.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase()

  const handleAvatar = (e) => {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      localStorage.setItem(`avatar_${user.id}`, ev.target.result)
      setAvatar(ev.target.result); play('success'); toast('Foto atualizada!','success')
    }
    reader.readAsDataURL(file)
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      <Navbar />
      {loading ? (
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text3)' }}>
          // carregando perfil...
        </div>
      ) : (
        <div className="profile-grid">
          <div className="profile-sidebar">
            <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleAvatar} />
            <div className="avatar-ring" onClick={() => fileRef.current.click()} title="Trocar foto">
              {avatar
                ? <img src={avatar} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                : <span className="avatar-initials">{initials}</span>
              }
            </div>
            <div>
              <p style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'1.4rem', color:'var(--text)', lineHeight:1, marginBottom:4 }}>
                {user.name.toUpperCase()}
              </p>
              <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.62rem', color:'var(--text3)' }}>{user.matricula}</p>
              {user.turma && (
                <span style={{ display:'inline-block', marginTop:8, fontFamily:'var(--font-mono)', fontSize:'0.58rem', fontWeight:700, letterSpacing:'0.08em', background:'var(--v-dim)', color:'var(--v-pale)', border:'1px solid var(--v)', padding:'3px 8px' }}>
                  {user.turma}
                </span>
              )}
            </div>
            <div className="divider" />
            {[
              { label:'horas acumuladas',       val:`${totalHours}h` },
              { label:'presenças confirmadas',   val:totalPresent },
              { label:'events inscritos',        val:myEvents.length },
              { label:'próximos events',         val:upcoming.length },
            ].map(({label,val}) => (
              <div key={label}>
                <span className="tech-label" style={{ marginBottom:3 }}>{label}</span>
                <p style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'1.4rem', color:'var(--v)', lineHeight:1 }}>
                  {val}
                </p>
              </div>
            ))}
          </div>

          <div className="profile-main" style={{ display:'flex', flexDirection:'column', gap:'2rem' }}>
            {upcoming.length > 0 && (
              <div>
                <div className="section-header">
                  <span className="section-title">próximos events</span>
                  <span className="section-meta">{upcoming.length} inscrição(ões)</span>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                  {upcoming.map(ev => (
                    <div key={ev.id} style={{ background:'var(--surface)', border:'1px solid var(--border)', padding:'1rem 1.25rem', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1rem', flexWrap:'wrap', cursor:'pointer' }}
                      onClick={() => { play('nav'); navigate(`/details/${ev.id}`) }}>
                      <div>
                        <p style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'1.05rem', color:'var(--text)', marginBottom:3 }}>
                          {ev.title}
                        </p>
                        <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.6rem', color:'var(--text3)' }}>
                          {ev.dateLabel} · {ev.location}
                        </p>
                      </div>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        {ev.convites_permitidos && (
                          <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.58rem', color:'var(--v-pale)', border:'1px solid var(--v)', padding:'2px 7px' }}>
                            {convites[ev.id] ?? 0} convite{(convites[ev.id] ?? 0) !== 1 ? 's' : ''}
                          </span>
                        )}
                        <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.58rem', fontWeight:700, color:'var(--v-pale)', border:'1px solid var(--v)', padding:'2px 7px' }}>
                          {ev.hours}h
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="section-header">
                <span className="section-title">histórico</span>
                <span className="section-meta">{pastEvents.length} event(s) encerrado(s)</span>
              </div>
              {pastEvents.length === 0 && (
                <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text3)', padding:'1rem 0' }}>
                  // nenhum evento encerrado ainda
                </p>
              )}
              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                {pastEvents.map(ev => {
                  const chk = checkins.find(c => c.eventId === ev.id)
                  const status = chk?.status || 'pendente'
                  return (
                    <div key={ev.id} style={{ background:'var(--surface)', border:'1px solid var(--border)', padding:'1rem 1.25rem', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
                      <div>
                        <p style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'1.05rem', color:'var(--text)', marginBottom:3 }}>
                          {ev.title}
                        </p>
                        <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.6rem', color:'var(--text3)' }}>
                          {ev.dateLabel} · {ev.hours}h
                        </p>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span className={`status-chip status-${status}`}>{status}</span>
                        {status === 'presente' && (
                          <button className="btn btn-v btn-sm"
                            onClick={() => { play('cert'); setCertEvent(ev) }}
                            onMouseEnter={() => play('hover')}>
                            ★ cert
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <footer>
        <span><span className="logo-sm">l<span>0</span>bby-e</span> · ETE Cícero Dias</span>
        <span>desenvolvimento de sistemas · recife, pe</span>
      </footer>

      {certEvent && (
        <CertModal event={certEvent} student={user} onClose={() => setCertEvent(null)} />
      )}
    </div>
  )
}
