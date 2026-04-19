import { useState, useEffect } from 'react'
import { DB } from '../db/localDB'
import Navbar from '../components/Navbar'
import { useToast } from '../context/ToastContext'
import { useSound } from '../hooks/useSound'

const BLANK = { title:'', dateLabel:'', date:'', hours:2, instructor:'', invitedBy:'', location:'', category:'FRONTEND', turmas:[], capacity:30, status:'open', summary:'', topics:[], tipo:'palestra', faz_parte_de:null, convites_permitidos:true, material_link:'', foto_palestrante:null }
const TURMAS = ['DS_MOD1_A','DS_MOD1_B','DS_MOD3_A','DS_MOD3_B']

export default function Admin() {
  const { toast } = useToast()
  const { play }  = useSound()
  const [tab, setTab]               = useState('events')
  const [events, setEvents]         = useState(DB.getEvents())
  const [students]                  = useState(DB.getStudents().filter(s => s.role==='student'))
  const [categorias, setCategorias] = useState(DB.getCategorias())
  const [checkinEv, setCheckinEv]   = useState(null)
  const [checkins, setCheckins]     = useState({})
  const [modal, setModal]           = useState(null)
  const [form, setForm]             = useState(BLANK)
  const [delConfirm, setDelConfirm] = useState(null)
  const [catForm, setCatForm]       = useState({ slug:'', label:'', cor:'#8F00FF' })
  const [editCat, setEditCat]       = useState(null)

  const refresh    = () => { setEvents(DB.getEvents()); setCategorias(DB.getCategorias()) }
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => {
    if (!checkinEv) return
    const map = {}
    DB.getCheckinsByEvent(checkinEv.id).forEach(c => { map[c.studentId] = c.status })
    setCheckins(map)
  }, [checkinEv])

  const handleSave = () => {
    if (!form.title.trim() || !form.instructor.trim()) { play('error'); toast('Preencha título e instrutor.','error'); return }
    if (modal === 'create') DB.createEvent({ ...form, topics: form.topics||[], turmas: form.turmas||[] })
    else                    DB.updateEvent(modal.id, form)
    play('success'); toast(modal==='create'?'Evento criado!':'Evento atualizado!','success')
    refresh(); setModal(null)
  }

  const toggleCheckin = (stuId, status) => {
    DB.setCheckin(stuId, checkinEv.id, status)
    setCheckins(p => ({ ...p, [stuId]: status }))
    play(status==='presente'?'success':'error')
    toast(`${status==='presente'?'✓ Presença':'✗ Ausência'} registrada.`, status==='presente'?'success':'error')
  }

  const totalInsc     = DB.getInscriptions().length
  const totalCheckins = DB.getCheckins().filter(c => c.status==='presente').length
  const openCount     = events.filter(e => e.status==='open').length

  const saveCat = () => {
    if (!catForm.slug.trim() || !catForm.label.trim()) { toast('Preencha slug e nome.','error'); return }
    if (editCat) { DB.updateCategoria(editCat.id, catForm); toast('Categoria atualizada!','success') }
    else         { DB.createCategoria({ ...catForm, slug: catForm.slug.toUpperCase() }); toast('Categoria criada!','success') }
    play('success'); setCatForm({ slug:'', label:'', cor:'#8F00FF' }); setEditCat(null); refresh()
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      <Navbar />

      {/* Bento stats */}
      <div className="bento-grid">
        {[
          { label:'portal',      val:'ativo',       sub:'ETE Cícero Dias — Recife' },
          { label:'events abertos', val:openCount,  sub:`${events.length} no total` },
          { label:'inscrições',  val:totalInsc,     sub:'total geral' },
          { label:'presenças',   val:totalCheckins, sub:'confirmadas via check-in' },
        ].map(({label,val,sub}) => (
          <div key={label} className="bento-cell">
            <span className="bento-label">{label}</span>
            <span className="bento-val">{val}</span>
            <span className="bento-sub">{sub}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        {['events','check-in','alunos','categorias'].map(t => (
          <button key={t} className={`tab ${tab===t?'active':''}`}
            onClick={() => { play('nav'); setTab(t) }}>
            {t}
          </button>
        ))}
        <div style={{ marginLeft:'auto', padding:'0.5rem 2rem', display:'flex', alignItems:'center' }}>
          {tab==='events' && (
            <button className="btn btn-v btn-sm"
              onClick={() => { play('click'); setForm(BLANK); setModal('create') }}
              onMouseEnter={() => play('hover')}>
              + novo event
            </button>
          )}
        </div>
      </div>

      {/* Tab events */}
      {tab==='events' && (
        <div className="section" style={{ flex:1 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
            {events.map(ev => {
              const cats = DB.getCategorias()
              const catObj = cats.find(c => c.slug===ev.category)
              return (
                <div key={ev.id} style={{ background:'var(--surface)', border:'1px solid var(--border)', padding:'1rem 1.25rem', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'1.1rem', color:'var(--text)', marginBottom:2 }}>
                      {ev.title}
                    </p>
                    <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.58rem', color:'var(--text3)' }}>
                      {ev.dateLabel} · {ev.location} · {catObj?.label||ev.category} · {ev.tipo}
                      {' '}· {DB.getInscriptionsByEvent(ev.id).length}/{ev.capacity} inscritos
                    </p>
                  </div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    <button className="btn btn-ghost btn-sm"
                      onClick={() => { play('nav'); setTab('check-in'); setCheckinEv(ev) }}>
                      check-in
                    </button>
                    <button className="btn btn-ghost btn-sm"
                      onClick={() => { play('click'); setForm({...ev, turmas:ev.turmas||[]}); setModal(ev) }}>
                      editar
                    </button>
                    <button className="btn btn-ghost btn-sm"
                      style={{ color: ev.status==='open'?'var(--o)':'var(--text3)' }}
                      onClick={() => { play('click'); DB.updateEvent(ev.id,{status:ev.status==='open'?'closed':'open'}); refresh(); toast(`Event ${ev.status==='open'?'encerrado':'reaberto'}.`,'info') }}>
                      {ev.status==='open'?'encerrar':'reabrir'}
                    </button>
                    <button className="btn btn-danger btn-sm"
                      onClick={() => { play('hover'); setDelConfirm(ev.id) }}>
                      excluir
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tab check-in */}
      {tab==='check-in' && (
        <div className="section" style={{ flex:1 }}>
          {!checkinEv ? (
            <>
              <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text3)', marginBottom:'1rem' }}>
                // selecione um event para fazer check-in
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
                {events.filter(e=>e.status==='open').map(ev => (
                  <div key={ev.id} style={{ background:'var(--surface)', border:'1px solid var(--border)', padding:'0.9rem 1.25rem', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center' }}
                    onClick={() => { play('nav'); setCheckinEv(ev) }}>
                    <div>
                      <p style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'1rem', color:'var(--text)' }}>{ev.title}</p>
                      <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.58rem', color:'var(--text3)' }}>{ev.dateLabel}</p>
                    </div>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.6rem', color:'var(--v-pale)' }}>
                      {DB.getInscriptionsByEvent(ev.id).length} inscritos →
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem', flexWrap:'wrap', gap:8 }}>
                <div>
                  <span className="tech-label" style={{ marginBottom:2 }}>check-in</span>
                  <p style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'1.2rem', color:'var(--text)' }}>{checkinEv.title}</p>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => { play('nav'); setCheckinEv(null) }}>
                  ← trocar event
                </button>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
                {DB.getInscriptionsByEvent(checkinEv.id).map(ins => {
                  const stu = DB.getStudentById(ins.studentId)
                  if (!stu) return null
                  const status = checkins[stu.id] || null
                  return (
                    <div key={stu.id} style={{ background:'var(--surface)', border:'1px solid var(--border)', padding:'0.8rem 1.25rem', display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
                      <div>
                        <p style={{ fontFamily:'var(--font-mono)', fontWeight:700, fontSize:'0.8rem', color:'var(--text)' }}>{stu.name}</p>
                        <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.58rem', color:'var(--text3)' }}>{stu.matricula} · {stu.turma}</p>
                      </div>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className={`btn btn-sm ${status==='presente'?'btn-success':'btn-ghost'}`}
                          onClick={() => toggleCheckin(stu.id,'presente')}>✓ presente</button>
                        <button className={`btn btn-sm ${status==='ausente'?'btn-danger':'btn-ghost'}`}
                          onClick={() => toggleCheckin(stu.id,'ausente')}>✗ ausente</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab alunos */}
      {tab==='alunos' && (
        <div className="section" style={{ flex:1 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
            {students.map(stu => (
              <div key={stu.id} style={{ background:'var(--surface)', border:'1px solid var(--border)', padding:'0.8rem 1.25rem', display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
                <div>
                  <p style={{ fontFamily:'var(--font-mono)', fontWeight:700, fontSize:'0.8rem', color:'var(--text)' }}>{stu.name}</p>
                  <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.58rem', color:'var(--text3)' }}>{stu.matricula} · {stu.turma}</p>
                </div>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.58rem', color:'var(--text3)', border:'1px solid var(--border)', padding:'3px 10px' }}>
                  {DB.getInscriptionsByStudent(stu.id).length} inscrição(ões)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab categorias */}
      {tab==='categorias' && (
        <div className="section" style={{ flex:1 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2rem' }}>
            {/* Lista */}
            <div>
              <p className="section-title" style={{ marginBottom:'1rem' }}>categorias existentes</p>
              <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
                {categorias.map(cat => (
                  <div key={cat.id} style={{ background:'var(--surface)', border:'1px solid var(--border)', padding:'0.75rem 1rem', display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ width:10, height:10, borderRadius:'50%', background:cat.cor, flexShrink:0 }} />
                      <div>
                        <p style={{ fontFamily:'var(--font-mono)', fontWeight:700, fontSize:'0.75rem', color:'var(--text)' }}>{cat.label}</p>
                        <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.55rem', color:'var(--text3)' }}>{cat.slug}</p>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn btn-ghost btn-sm"
                        onClick={() => { setEditCat(cat); setCatForm({ slug:cat.slug, label:cat.label, cor:cat.cor }) }}>
                        editar
                      </button>
                      <button className="btn btn-danger btn-sm"
                        onClick={() => { DB.deleteCategoria(cat.id); play('error'); toast('Categoria removida.','info'); refresh() }}>
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Form nova / editar */}
            <div>
              <p className="section-title" style={{ marginBottom:'1rem' }}>{editCat?'editar categoria':'nova categoria'}</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                <div>
                  <label className="input-label">nome (exibição)</label>
                  <input className="input" value={catForm.label} placeholder="Frontend"
                    onChange={e => setCatForm(p=>({...p, label:e.target.value}))} />
                </div>
                <div>
                  <label className="input-label">slug (código interno)</label>
                  <input className="input" value={catForm.slug} placeholder="FRONTEND"
                    onChange={e => setCatForm(p=>({...p, slug:e.target.value.toUpperCase()}))} />
                </div>
                <div>
                  <label className="input-label">cor</label>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <input type="color" value={catForm.cor} onChange={e => setCatForm(p=>({...p,cor:e.target.value}))}
                      style={{ width:40, height:36, border:'1px solid var(--border)', background:'transparent', cursor:'pointer' }} />
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.7rem', color:'var(--text2)' }}>{catForm.cor}</span>
                  </div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-v" onClick={saveCat} onMouseEnter={() => play('hover')}>
                    {editCat?'salvar alterações':'criar categoria'}
                  </button>
                  {editCat && (
                    <button className="btn btn-ghost" onClick={() => { setEditCat(null); setCatForm({slug:'',label:'',cor:'#8F00FF'}) }}>
                      cancelar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal criar/editar event */}
      {modal && (
        <div className="modal-bg" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{modal==='create'?'novo event':'editar event'}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              {[
                {label:'título',      key:'title',      ph:'React UI Masterclass'},
                {label:'instrutor',   key:'instructor', ph:'Prof. Nome Sobrenome'},
                {label:'convidado por',key:'invitedBy', ph:'Coordenação DS'},
                {label:'local',       key:'location',   ph:'Laboratório 03'},
                {label:'data label',  key:'dateLabel',  ph:'20 ABR 2026'},
                {label:'data (YYYY-MM-DD)',key:'date',   ph:'2026-04-20'},
                {label:'link material (opcional)',key:'material_link', ph:'https://...'},
              ].map(({label,key,ph}) => (
                <div key={key}>
                  <label className="input-label">{label}</label>
                  <input className="input" value={form[key]||''} placeholder={ph}
                    onChange={e => f(key, e.target.value)} />
                </div>
              ))}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label className="input-label">categoria</label>
                  <select className="input" value={form.category} onChange={e => f('category',e.target.value)}>
                    {categorias.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">tipo</label>
                  <select className="input" value={form.tipo} onChange={e => f('tipo',e.target.value)}>
                    <option value="palestra">palestra</option>
                    <option value="evento">evento</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">carga (h)</label>
                  <input className="input" type="number" min={1} max={40} value={form.hours}
                    onChange={e => f('hours',Number(e.target.value))} />
                </div>
                <div>
                  <label className="input-label">capacidade</label>
                  <input className="input" type="number" min={1} value={form.capacity}
                    onChange={e => f('capacity',Number(e.target.value))} />
                </div>
              </div>
              <div>
                <label className="input-label">turmas</label>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {TURMAS.map(t => (
                    <button key={t} type="button"
                      className={`chip ${form.turmas.includes(t)?'active':''}`}
                      onClick={() => f('turmas', form.turmas.includes(t)?form.turmas.filter(x=>x!==t):[...form.turmas,t])}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display:'flex', gap:'1rem' }}>
                <label style={{ display:'flex', alignItems:'center', gap:8, fontFamily:'var(--font-mono)', fontSize:'0.62rem', color:'var(--text2)', cursor:'pointer' }}>
                  <input type="checkbox" checked={form.convites_permitidos}
                    onChange={e => f('convites_permitidos',e.target.checked)} />
                  permitir convites (2 por aluno)
                </label>
              </div>
              <div>
                <label className="input-label">resumo</label>
                <textarea className="input" value={form.summary} placeholder="Descrição..."
                  onChange={e => f('summary',e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>cancelar</button>
              <button className="btn btn-v" onClick={handleSave} onMouseEnter={() => play('hover')}>
                salvar →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal delete */}
      {delConfirm && (
        <div className="modal-bg" onClick={() => setDelConfirm(null)}>
          <div className="modal" style={{ maxWidth:380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">confirmar exclusão</span>
            </div>
            <div className="modal-body">
              <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text2)', lineHeight:1.7 }}>
                // remove o event e todas as inscrições/check-ins/convites. não pode ser desfeito.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDelConfirm(null)}>cancelar</button>
              <button className="btn btn-danger"
                onClick={() => { DB.deleteEvent(delConfirm); refresh(); setDelConfirm(null); play('error'); toast('Event removido.','info') }}>
                confirmar exclusão
              </button>
            </div>
          </div>
        </div>
      )}

      <footer>
        <span><span className="logo-sm">l<span>0</span>bby-e</span> · coordenação</span>
        <span>ETE Cícero Dias · desenvolvimento de sistemas</span>
      </footer>
    </div>
  )
}
