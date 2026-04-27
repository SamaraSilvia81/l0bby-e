import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useSound } from '../hooks/useSound'
import { DB } from '../db/firebaseDB'
import Navbar from '../components/Navbar'
import CertModal from '../components/CertModal'

const CAT_COLOR = { FRONTEND:'#8F00FF', BACKEND:'#00e5ff', DESIGN:'#FF7927', DEVOPS:'#39ff14', DADOS:'#FF3B8A', SEGURANCA:'#FFD700', NEGOCIOS:'#FF6B6B', MARKETING:'#4ECDC4' }

export default function Details() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user }  = useAuth()
  const { toast } = useToast()
  const { play }  = useSound()
  const fileRef   = useRef()

  const [event, setEvent]           = useState(null)
  const [inscs, setInscs]           = useState([])
  const [enrolled, setEnrolled]     = useState(false)
  const [chk, setChk]               = useState(null)
  const [meuConvites, setMeuConvites] = useState([])
  const [convRestantes, setConvRestantes] = useState(0)
  const [certOpen, setCertOpen]     = useState(false)
  const [showConviteForm, setShowConviteForm] = useState(false)
  const [conviteNome, setConviteNome] = useState('')
  const [conviteContato, setConviteContato] = useState('')
  const [loading, setLoading]       = useState(true)

  const load = async () => {
    setLoading(true)
    const [ev, inscList] = await Promise.all([
      DB.getEventById(id),
      DB.getInscriptionsByEvent(id),
    ])
    setEvent(ev)
    setInscs(inscList)
    if (user) {
      const [isEnr, checkin, convites, restantes] = await Promise.all([
        DB.isEnrolled(user.id, id),
        DB.getCheckin(user.id, id),
        DB.getConvitesByAluno(user.id, id),
        DB.convitesRestantes(user.id, id),
      ])
      setEnrolled(isEnr)
      setChk(checkin)
      setMeuConvites(convites)
      setConvRestantes(restantes)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [id, user])

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      <Navbar />
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text3)' }}>
        // carregando evento...
      </div>
    </div>
  )

  if (!event) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      <Navbar />
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'1rem' }}>
        <span className="tech-label">erro_404</span>
        <button className="btn btn-ghost" onClick={() => navigate('/home')}>← voltar</button>
      </div>
    </div>
  )

  const spotsLeft = event.capacity - inscs.length
  const pct       = Math.round((inscs.length / event.capacity) * 100)
  const hasCert   = chk?.status === 'presente'
  const isClosed  = event.status === 'closed'
  const catColor  = CAT_COLOR[event.category] || '#8F00FF'
  const isAdmin   = user?.role === 'admin'

  const handleEnroll = async () => {
    if (!user) { play('nav'); navigate('/login'); return }
    if (enrolled) {
      await DB.unenroll(user.id, event.id)
      play('click'); toast('Inscrição cancelada.', 'info')
    } else {
      const ok = await DB.enroll(user.id, event.id)
      if (ok) { play('enroll'); toast('Inscrição confirmada!', 'success') }
      else    { play('error'); toast('Algo deu errado.', 'error') }
    }
    load()
  }

  const handleConvite = async () => {
    if (!conviteNome.trim()) { toast('Nome do convidado é obrigatório.', 'error'); return }
    const res = await DB.addConvite(user.id, id, conviteNome.trim(), conviteContato.trim())
    if (res.ok) {
      play('success'); toast('Convite registrado!', 'success')
      setConviteNome(''); setConviteContato(''); setShowConviteForm(false); load()
    } else {
      play('error'); toast(res.msg, 'error')
    }
  }

  const handleFotoUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      await DB.addFotoRegistro(id, ev.target.result)
      toast('Foto adicionada!', 'success'); play('success'); load()
    }
    reader.readAsDataURL(file)
  }

  const fotos = event?.fotos_registro || []

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      <Navbar />

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', minHeight:'42vh', borderBottom:'1px solid var(--border)' }}>
        <div style={{ padding:'3rem 2.5rem', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', justifyContent:'flex-end', gap:'0.75rem', position:'relative' }}>
          <button className="btn btn-ghost btn-sm"
            style={{ position:'absolute', top:'1.25rem', left:'1.25rem', width:'auto' }}
            onClick={() => { play('nav'); navigate('/home') }}
            onMouseEnter={() => play('hover')}>
            ← voltar
          </button>

          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:catColor, flexShrink:0 }} />
            <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.14em', color:'var(--text3)' }}>
              {event.category}
            </span>
            <span style={{
              fontFamily:'var(--font-mono)', fontSize:'0.56rem', fontWeight:700,
              color: isClosed ? 'var(--text3)' : 'var(--success)',
              border:`1px solid ${isClosed ? 'var(--border)' : 'var(--success)'}`,
              padding:'1px 8px', letterSpacing:'0.08em',
            }}>
              {isClosed ? 'encerrado' : 'aberto'}
            </span>
          </div>

          <h1 style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'clamp(2rem,4vw,3.5rem)', lineHeight:0.88, color:'var(--text)', letterSpacing:'-0.02em' }}>
            {event.title}
          </h1>
          <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text3)' }}>
            por <span style={{ color:'var(--text2)', fontWeight:700 }}>{event.instructor}</span>
            {' '}· convidado por {event.invitedBy}
          </p>
        </div>

        <div style={{ background:'var(--surface)', position:'relative', overflow:'hidden', display:'grid', gridTemplateRows:'1fr auto' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', position:'relative' }}>
            {event.foto_palestrante ? (
              <img src={event.foto_palestrante} alt={event.instructor}
                style={{ width:'100%', height:'100%', objectFit:'cover', filter:'grayscale(0.2)' }} />
            ) : (
              <div style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'clamp(4rem,9vw,8rem)', color:`rgba(143,0,255,0.06)`, letterSpacing:'-0.04em', lineHeight:0.85, textAlign:'center', userSelect:'none' }}>
                {event.category}
              </div>
            )}
            <div style={{ position:'absolute', bottom:'1rem', right:'1rem', fontFamily:'var(--font-mono)', fontSize:'0.52rem', fontWeight:700, letterSpacing:'0.1em', color:catColor, border:`1px solid ${catColor}`, padding:'3px 8px', background:'rgba(8,8,8,0.7)' }}>
              {event.dateLabel}
            </div>
            {isAdmin && (
              <button className="btn btn-ghost btn-sm"
                style={{ position:'absolute', top:'1rem', right:'1rem', fontSize:'0.52rem' }}
                onClick={() => document.getElementById('foto-pal-inp')?.click()}>
                + foto palestrante
              </button>
            )}
            {isAdmin && (
              <input id="foto-pal-inp" type="file" accept="image/*" style={{ display:'none' }}
                onChange={(e) => {
                  const file = e.target.files[0]; if (!file) return
                  const r = new FileReader()
                  r.onload = async (ev) => { await DB.updateEvent(id, { foto_palestrante: ev.target.result }); load(); toast('Foto atualizada!','success') }
                  r.readAsDataURL(file)
                }} />
            )}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', borderTop:'1px solid var(--border)' }}>
            {[
              { label:'local', val: event.location },
              { label:'carga', val: `${event.hours}h` },
              { label:'vagas', val: `${spotsLeft} livres`, warn: spotsLeft <= 5 },
            ].map(({label,val,warn}) => (
              <div key={label} style={{ padding:'0.75rem 1rem', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', gap:2 }}>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.5rem', fontWeight:700, letterSpacing:'0.12em', color:'var(--text3)', textTransform:'uppercase' }}>{label}</span>
                <span style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'0.95rem', color: warn ? 'var(--o)' : 'var(--text)', lineHeight:1 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', flex:1 }}>
        <div style={{ padding:'2.5rem 2rem', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', gap:'2rem' }}>
          <div>
            <span className="tech-label" style={{ marginBottom:'0.6rem' }}>sobre a palestra</span>
            <p style={{ fontSize:'0.9rem', lineHeight:1.75, color:'var(--text2)' }}>{event.summary}</p>
          </div>

          {event.topics?.length > 0 && (
            <div>
              <span className="tech-label" style={{ marginBottom:'0.75rem' }}>tópicos abordados</span>
              <div>
                {event.topics.map((t,i) => (
                  <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start', padding:'0.75rem 0', borderBottom:'1px solid var(--border)' }}>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.58rem', fontWeight:700, color:catColor, flexShrink:0, minWidth:22, paddingTop:2 }}>
                      {String(i+1).padStart(2,'0')}
                    </span>
                    <span style={{ fontSize:'0.85rem', color:'var(--text2)', lineHeight:1.5 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {event.material_link && (
            <div>
              <span className="tech-label" style={{ marginBottom:'0.5rem' }}>material compartilhado</span>
              <a href={event.material_link} target="_blank" rel="noreferrer"
                style={{ display:'inline-flex', alignItems:'center', gap:8, fontFamily:'var(--font-mono)', fontSize:'0.7rem', fontWeight:700, color:'var(--v-pale)', borderBottom:'1px solid var(--v)', paddingBottom:2 }}
                onClick={() => play('nav')}>
                ↗ acessar material
              </a>
            </div>
          )}

          {event.turmas?.length > 0 && (
            <div>
              <span className="tech-label" style={{ marginBottom:'0.6rem' }}>turmas participantes</span>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {event.turmas.map(t => (
                  <span key={t} style={{ fontFamily:'var(--font-mono)', fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.08em', background:'var(--v-dim)', color:'var(--v-pale)', border:'1px solid var(--v)', padding:'4px 10px' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
              <span className="tech-label" style={{ marginBottom:0 }}>fotos do evento</span>
              {isAdmin && (
                <>
                  <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()}
                    onMouseEnter={() => play('hover')}>
                    + adicionar foto
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFotoUpload} />
                </>
              )}
            </div>
            {fotos.length === 0 ? (
              <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.6rem', color:'var(--text3)' }}>
                // nenhuma foto adicionada ainda
              </p>
            ) : (
              <div className="photo-grid">
                {fotos.map((url,i) => (
                  <div key={i} className="photo-item">
                    <img src={url} alt={`registro ${i+1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ padding:'2.5rem 1.75rem', background:'var(--surface)', display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          <div>
            <span className="tech-label" style={{ marginBottom:'0.4rem' }}>palestrante</span>
            <p style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'1.4rem', color:'var(--text)', lineHeight:1, marginBottom:4 }}>
              {event.instructor?.toUpperCase()}
            </p>
            <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.6rem', color:'var(--text3)' }}>
              convidado por {event.invitedBy}
            </p>
          </div>

          <div className="divider" />

          {[
            { label:'data',         val: event.dateLabel },
            { label:'local',        val: event.location },
            { label:'carga',        val: `${event.hours} horas` },
            { label:'inscritos',    val: `${inscs.length} de ${event.capacity}` },
            { label:'vagas livres', val: String(spotsLeft), warn: spotsLeft <= 5 },
          ].map(({label,val,warn}) => (
            <div key={label} style={{ display:'flex', flexDirection:'column', gap:3 }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.52rem', fontWeight:700, letterSpacing:'0.14em', color:'var(--text3)', textTransform:'uppercase' }}>
                // {label}
              </span>
              <span style={{ fontFamily:'var(--font-mono)', fontWeight:700, fontSize:'0.85rem', color: warn ? 'var(--o)' : 'var(--text)' }}>
                {val}
              </span>
            </div>
          ))}

          <div>
            <div style={{ height:3, background:'var(--border)' }}>
              <div style={{ height:'100%', width:`${pct}%`, background: pct>=90?'var(--danger)':catColor, transition:'width 0.4s' }} />
            </div>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.52rem', color:'var(--text3)', marginTop:4, display:'block' }}>
              {pct}% ocupado
            </span>
          </div>

          <div className="divider" />

          {isClosed ? (
            <div style={{ padding:'0.85rem', background:'var(--surface2)', border:'1px solid var(--border)', fontFamily:'var(--font-mono)', fontSize:'0.62rem', fontWeight:700, letterSpacing:'0.1em', color:'var(--text3)', textAlign:'center' }}>
              // evento encerrado
            </div>
          ) : (
            <button className="btn btn-full"
              style={{ padding:'11px', background: enrolled?'transparent':'var(--v)', color: enrolled?'var(--danger)':'#fff', border: enrolled?'1px solid var(--danger)':'1px solid var(--v)', fontFamily:'var(--font-mono)', fontWeight:700, fontSize:'0.65rem', letterSpacing:'0.1em', cursor:'pointer', transition:'all 0.12s' }}
              onClick={handleEnroll} onMouseEnter={() => play('hover')}>
              {enrolled ? '✕ cancelar inscrição' : 'confirmar inscrição →'}
            </button>
          )}

          {enrolled && !isClosed && (
            <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.56rem', color:'var(--success)', textAlign:'center', fontWeight:700 }}>
              ✓ vaga vinculada à sua matrícula
            </p>
          )}

          {hasCert && (
            <button className="btn btn-v btn-full" style={{ padding:'10px' }}
              onClick={() => { play('cert'); setCertOpen(true) }}
              onMouseEnter={() => play('hover')}>
              ★ ver certificado
            </button>
          )}

          {enrolled && !isClosed && event.convites_permitidos && user && (
            <>
              <div className="divider" />
              <div>
                <span className="tech-label" style={{ marginBottom:'0.5rem' }}>
                  convites ({convRestantes} restante{convRestantes!==1?'s':''})
                </span>

                {meuConvites.map(c => (
                  <div key={c.id} className="convite-row" style={{ marginBottom:4 }}>
                    <div>
                      <span style={{ color:'var(--text)', fontWeight:700 }}>{c.nomeConvidado}</span>
                      {c.contatoConvidado && <span style={{ color:'var(--text3)', marginLeft:8 }}>{c.contatoConvidado}</span>}
                    </div>
                    <button className="btn btn-danger btn-sm"
                      onClick={async () => { await DB.removeConvite(c.id); play('click'); toast('Convite removido.','info'); load() }}>
                      ✕
                    </button>
                  </div>
                ))}

                {convRestantes > 0 && !showConviteForm && (
                  <button className="btn btn-ghost btn-sm btn-full" style={{ marginTop:6 }}
                    onClick={() => setShowConviteForm(true)}
                    onMouseEnter={() => play('hover')}>
                    + convidar pessoa
                  </button>
                )}

                {showConviteForm && (
                  <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:8 }}>
                    <div>
                      <label className="input-label">nome do convidado</label>
                      <input className="input" value={conviteNome} placeholder="Nome completo"
                        onChange={e => setConviteNome(e.target.value)} />
                    </div>
                    <div>
                      <label className="input-label">contato (opcional)</label>
                      <input className="input" value={conviteContato} placeholder="e-mail ou telefone"
                        onChange={e => setConviteContato(e.target.value)} />
                    </div>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn btn-v btn-sm" style={{ flex:1 }} onClick={handleConvite}>confirmar</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setShowConviteForm(false)}>cancelar</button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <footer>
        <span><span className="logo-sm">l<span>0</span>bby-e</span> · ETE Cícero Dias</span>
        <span>desenvolvimento de sistemas · recife, pe</span>
      </footer>

      {certOpen && user && (
        <CertModal event={event} student={user} onClose={() => setCertOpen(false)} />
      )}
    </div>
  )
}
