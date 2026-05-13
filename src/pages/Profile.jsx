import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useSound } from '../hooks/useSound'
import { DB } from '../db/firebaseDB'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import CertModal from '../components/CertModal'
import { AVATARS, PixelAvatar } from '../components/PixelAvatars'
import { useRef } from 'react'

export default function Profile() {
  const { user, setUser } = useAuth()
  const { toast } = useToast()
  const { play } = useSound()
  const navigate = useNavigate()

  const [certEvent, setCertEvent] = useState(null)
  const [myEvents, setMyEvents]   = useState([])
  const [checkins, setCheckins]   = useState([])
  const [convites, setConvites]   = useState({})
  const [loading, setLoading]     = useState(true)

  // Edit states
  const [editMode, setEditMode]   = useState(false)
  const [eName, setEName]         = useState('')
  const [eUser, setEUser]         = useState('')
  const [eMat, setEMat]           = useState('')
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [saving, setSaving]       = useState(false)

  // Senha
  const [showPassForm, setShowPassForm] = useState(false)
  const [oldPass, setOldPass]     = useState('')
  const [newPass, setNewPass]     = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [savingPass, setSavingPass] = useState(false)

  const fileRef = useRef()
  const avatarId = user?.avatar || null
  const customPhoto = user?.customPhoto || null

  useEffect(() => {
    if (!user) return
    setEName(user.name || '')
    setEUser(user.username || '')
    setEMat(user.matricula || '')
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
    return (chk?.status === 'presente' || chk?.checkin === true) ? acc + (ev.hours || 0) : acc
  }, 0)
  const totalPresent = checkins.filter(c => c.status === 'presente' || c.checkin === true).length

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = async () => {
      const MAX = 120
      const ratio = Math.min(MAX / img.width, MAX / img.height, 1)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * ratio)
      canvas.height = Math.round(img.height * ratio)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      const compressed = canvas.toDataURL('image/jpeg', 0.85)
      URL.revokeObjectURL(url)
      await DB.updateStudent(user.id, { customPhoto: compressed, avatar: null })
      setUser({ ...user, customPhoto: compressed, avatar: null })
      play('success'); toast('Foto atualizada!', 'success')
      setShowAvatarPicker(false)
    }
    img.src = url
  }

  const saveProfile = async () => {
    if (!eName.trim() || !eMat.trim()) { toast('Nome e matrícula obrigatórios.', 'error'); return }
    setSaving(true)
    // Verifica se username mudou e se já existe
    const usernameTrimmed = eUser.toLowerCase().trim().replace(/\s/g, '')
    if (usernameTrimmed && usernameTrimmed !== user.username) {
      const existing = await DB.getStudentByUsername(usernameTrimmed)
      if (existing && existing.id !== user.id) {
        toast('Nome de usuário já em uso.', 'error'); setSaving(false); return
      }
    }
    await DB.updateStudent(user.id, { name: eName.trim(), username: usernameTrimmed, matricula: eMat.trim() })
    setUser({ ...user, name: eName.trim(), username: usernameTrimmed, matricula: eMat.trim() })
    play('success'); toast('Perfil atualizado!', 'success')
    setEditMode(false); setSaving(false)
  }

  const saveAvatar = async (id) => {
    await DB.updateStudent(user.id, { avatar: id, customPhoto: null })
    setUser({ ...user, avatar: id, customPhoto: null })
    play('success'); toast('Avatar atualizado!', 'success')
    setShowAvatarPicker(false)
  }

  const savePassword = async () => {
    if (newPass !== confirmPass) { toast('Senhas não coincidem.', 'error'); return }
    if (newPass.length < 4) { toast('Mínimo 4 caracteres.', 'error'); return }
    if (oldPass !== user.pass) { toast('Senha atual incorreta.', 'error'); return }
    setSavingPass(true)
    await DB.updateStudent(user.id, { pass: newPass })
    setUser({ ...user, pass: newPass })
    play('success'); toast('Senha alterada!', 'success')
    setOldPass(''); setNewPass(''); setConfirmPass('')
    setShowPassForm(false); setSavingPass(false)
  }

  const initials = user.name?.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase()

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      <Navbar />
      {/* Blobs */}
      <div style={{ position:'fixed', width:500, height:500, top:'calc(50vh - 250px)', left:-200, background:'radial-gradient(circle, rgba(143,0,255,0.07) 0%, transparent 70%)', pointerEvents:'none', zIndex:-1 }} />
      <div style={{ position:'fixed', width:400, height:400, bottom:-100, right:-100, background:'radial-gradient(circle, rgba(255,121,39,0.05) 0%, transparent 70%)', pointerEvents:'none', zIndex:-1 }} />

      {loading ? (
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text3)' }}>
          // carregando perfil...
        </div>
      ) : (
        <div className="profile-grid">

          {/* ── SIDEBAR ── */}
          <div className="profile-sidebar">

            {/* Avatar */}
            <div style={{ position:'relative', display:'inline-block' }}>
              <div className="avatar-ring" onClick={() => { play('click'); setShowAvatarPicker(v => !v) }}
                title="Trocar avatar" style={{ cursor:'pointer' }}>
                {customPhoto
                  ? <img src={customPhoto} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} />
                  : avatarId
                    ? <PixelAvatar id={avatarId} size={80} />
                    : <span className="avatar-initials">{initials}</span>
                }
              </div>
              <div style={{ position:'absolute', bottom:0, right:0, width:24, height:24, background:'var(--bg)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', border:'2px solid var(--v)', boxShadow:'0 0 8px rgba(143,0,255,0.4)' }}
                onClick={() => { play('click'); setShowAvatarPicker(v => !v) }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--v)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </div>
            </div>

            {/* Picker de avatares */}
            {showAvatarPicker && (
              <div style={{ background:'var(--surface)', border:'1px solid var(--border)', padding:'1rem', display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                <span className="tech-label" style={{ marginBottom:0 }}>// escolha seu avatar</span>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                  {AVATARS.map(av => (
                    <div key={av.id}
                      onClick={() => saveAvatar(av.id)}
                      style={{
                        border: avatarId === av.id ? '2px solid var(--v)' : '1px solid var(--border)',
                        padding:6, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:4,
                        background: avatarId === av.id ? 'var(--v-dim)' : 'transparent',
                        transition:'all 0.15s',
                      }}>
                      <PixelAvatar id={av.id} size={48} />
                      <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.5rem', color:'var(--text3)' }}>{av.label}</span>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop:'1px solid var(--border)', paddingTop:'0.75rem', display:'flex', flexDirection:'column', gap:6 }}>
                  <span className="tech-label" style={{ marginBottom:0 }}>// ou use sua foto</span>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handlePhotoUpload} />
                  <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current.click()}>
                    📷 enviar foto
                  </button>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowAvatarPicker(false)}>fechar</button>
              </div>
            )}

            {/* Info / Edit */}
            {editMode ? (
              <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem', width:'100%' }}>
                <div>
                  <label className="input-label">nome</label>
                  <input className="input" value={eName} onChange={e => setEName(e.target.value)} />
                </div>
                <div>
                  <label className="input-label">nome de usuário</label>
                  <input className="input" value={eUser} placeholder="sams81"
                    onChange={e => setEUser(e.target.value.replace(/\s/g, ''))} />
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.55rem', color:'var(--text3)', marginTop:3, display:'block' }}>// usado pra fazer login</span>
                </div>
                <div>
                  <label className="input-label">matrícula <span style={{color:'var(--text3)'}}>( opcional )</span></label>
                  <input className="input" value={eMat} onChange={e => setEMat(e.target.value)} />
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <button className="btn btn-v btn-sm" onClick={saveProfile} disabled={saving}>
                    {saving ? '// salvando...' : 'salvar'}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditMode(false)}>cancelar</button>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'1.3rem', color:'var(--text)', lineHeight:1, marginBottom:4 }}>
                  {user.name.toUpperCase()}
                </p>
                {user.username && <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--v)', marginBottom:2 }}>@{user.username}</p>}
                {user.matricula && <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.6rem', color:'var(--text3)', marginBottom:6 }}>{user.matricula}</p>}
                {user.curso && (
                  <span style={{ display:'inline-block', marginBottom:8, fontFamily:'var(--font-mono)', fontSize:'0.55rem', fontWeight:700, letterSpacing:'0.06em', background:'var(--v-dim)', color:'var(--v-pale)', border:'1px solid var(--v)', padding:'2px 8px' }}>
                    {user.curso}
                  </span>
                )}
                {user.turma && (
                  <span style={{ display:'inline-block', marginLeft:4, marginBottom:8, fontFamily:'var(--font-mono)', fontSize:'0.55rem', fontWeight:700, letterSpacing:'0.06em', background:'var(--surface)', color:'var(--text3)', border:'1px solid var(--border)', padding:'2px 8px' }}>
                    {user.turma}
                  </span>
                )}
                <br/>
                <button onClick={() => { play('click'); setEditMode(true) }}
                  style={{ marginTop:8, display:'inline-flex', alignItems:'center', gap:6, fontFamily:'var(--font-mono)', fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.08em', color:'var(--text3)', background:'none', border:'1px solid var(--border)', padding:'6px 12px', cursor:'pointer', transition:'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='var(--v)'; e.currentTarget.style.color='var(--v)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text3)' }}>
                  <span style={{fontSize:'0.7rem'}}>✎</span> editar perfil
                </button>
              </div>
            )}

            <div className="divider" />

            {/* Stats */}
            {[
              { label:'horas acumuladas',      val:`${totalHours}h` },
              { label:'presenças confirmadas', val:totalPresent },
              { label:'events inscritos',       val:myEvents.length },
              { label:'próximos events',        val:upcoming.length },
            ].map(({label,val}) => (
              <div key={label}>
                <span className="tech-label" style={{ marginBottom:3 }}>{label}</span>
                <p style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'1.4rem', color:'var(--v)', lineHeight:1 }}>
                  {val}
                </p>
              </div>
            ))}

            <div className="divider" />

            {/* Alterar senha */}
            <div style={{ width:'100%' }}>
              {!showPassForm ? (
                <button className="btn btn-ghost btn-sm" style={{ width:'100%' }}
                  onClick={() => { play('click'); setShowPassForm(true) }}>
                  🔒 alterar senha
                </button>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
                  <span className="tech-label" style={{ marginBottom:0 }}>// nova senha</span>
                  <input className="input" type="password" placeholder="senha atual"
                    value={oldPass} onChange={e => setOldPass(e.target.value)} />
                  <input className="input" type="password" placeholder="nova senha"
                    value={newPass} onChange={e => setNewPass(e.target.value)} />
                  <input className="input" type="password" placeholder="confirmar nova senha"
                    value={confirmPass} onChange={e => setConfirmPass(e.target.value)} />
                  <div style={{ display:'flex', gap:6 }}>
                    <button className="btn btn-v btn-sm" onClick={savePassword} disabled={savingPass}>
                      {savingPass ? '// salvando...' : 'salvar senha'}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setShowPassForm(false)}>cancelar</button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* ── MAIN ── */}
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
                      <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.58rem', fontWeight:700, color:'var(--v-pale)', border:'1px solid var(--v)', padding:'2px 7px' }}>
                        {ev.hours}h
                      </span>
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
                  const presente = chk?.status === 'presente' || chk?.checkin === true
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
                        <span style={{
                          fontFamily:'var(--font-mono)', fontSize:'0.58rem', fontWeight:700,
                          letterSpacing:'0.06em', padding:'2px 8px',
                          border: presente ? '1px solid var(--success,#27ae60)' : '1px solid var(--border)',
                          color: presente ? 'var(--success,#27ae60)' : 'var(--text3)',
                          background: presente ? 'rgba(39,174,96,0.08)' : 'transparent',
                        }}>
                          {presente ? 'presente' : 'pendente'}
                        </span>
                        {presente && (
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