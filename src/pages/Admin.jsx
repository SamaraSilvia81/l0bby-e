import { useState, useEffect } from 'react'
import { DB } from '../db/firebaseDB'
import Navbar from '../components/Navbar'
import { useToast } from '../context/ToastContext'
import { useSound } from '../hooks/useSound'
import CertModal from '../components/CertModal'

const BLANK = { title:'', dateLabel:'', date:'', hours:2, instructor:'', invitedBy:'ETE Cícero Dias', location:'', category:'FRONTEND', turmas:[], capacity:30, status:'open', summary:'', topics:[], tipo:'palestra', faz_parte_de:null, convites_permitidos:true, material_link:'', foto_palestrante:null }
const TURMAS = ['DS_MOD1_A','DS_MOD1_B','DS_MOD3_A','DS_MOD3_B']

export default function Admin() {
  const { toast } = useToast()
  const { play }  = useSound()
  const [tab, setTab]               = useState('events')
  const [events, setEvents]         = useState([])
  const [students, setStudents]     = useState([])
  const [categorias, setCategorias] = useState([])
  const [checkinEv, setCheckinEv]   = useState(null)
  const [checkins, setCheckins]     = useState({})
  const [inscsByEvent, setInscsByEvent] = useState({})
  const [modal, setModal]           = useState(null)
  const [form, setForm]             = useState(BLANK)
  const [delConfirm, setDelConfirm] = useState(null)
  const [catForm, setCatForm]       = useState({ slug:'', label:'', cor:'#8F00FF' })
  const [editCat, setEditCat]       = useState(null)
  const [loading, setLoading]       = useState(true)
  const [totalInsc, setTotalInsc]   = useState(0)
  const [totalPresent, setTotalPresent] = useState(0)

  // Formulário de novo aluno
  const [stuForm, setStuForm] = useState({ name:'', matricula:'', turma:'DS_MOD1_A', curso:'Desenvolvimento de Sistemas', pass:'' })
  const [savingStu, setSavingStu] = useState(false)

  // Importação em lote
  const [loteText, setLoteText]       = useState('')
  const [lotePreview, setLotePreview] = useState([])
  const [loteErrors, setLoteErrors]   = useState([])
  const [loteStatus, setLoteStatus]   = useState(null) // null | 'importing' | 'done'
  const [loteProgress, setLoteProgress] = useState(0)
  const [alunoTab, setAlunoTab]       = useState('individual') // 'individual' | 'lote'
  const [certTarget, setCertTarget]   = useState(null) // { event, student }
  const [certEvFilter, setCertEvFilter] = useState('all')

  const refresh = async () => {
    const [evs, cats, stus, allInsc, allChks] = await Promise.all([
      DB.getEvents(),
      DB.getCategorias(),
      DB.getStudents(),
      DB.getInscriptions(),
      DB.getCheckins(),
    ])
    setEvents(evs)
    setCategorias(cats)
    setStudents(stus.filter(s => s.role === 'student'))
    setTotalInsc(allInsc.length)
    setTotalPresent(allChks.filter(c => c.status === 'presente').length)
    // Mapa: eventId → contagem inscritos
    const imap = {}
    allInsc.forEach(i => { imap[i.eventId] = (imap[i.eventId] || 0) + 1 })
    setInscsByEvent(imap)
    setLoading(false)
  }

  useEffect(() => { refresh() }, [])

  useEffect(() => {
    if (!checkinEv) return
    const load = async () => {
      const chks = await DB.getCheckinsByEvent(checkinEv.id)
      const map = {}
      chks.forEach(c => { map[c.studentId] = c.status })
      setCheckins(map)
    }
    load()
  }, [checkinEv])

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = async () => {
    if (!form.title.trim() || !form.instructor.trim()) { play('error'); toast('Preencha título e instrutor.','error'); return }
    if (modal === 'create') await DB.createEvent({ ...form, topics: form.topics||[], turmas: form.turmas||[] })
    else                    await DB.updateEvent(modal.id, form)
    play('success'); toast(modal==='create'?'Evento criado!':'Evento atualizado!','success')
    await refresh(); setModal(null)
  }

  const toggleCheckin = async (stuId, status) => {
    await DB.setCheckin(stuId, checkinEv.id, status)
    setCheckins(p => ({ ...p, [stuId]: status }))
    play(status==='presente'?'success':'error')
    toast(`${status==='presente'?'✓ Presença':'✗ Ausência'} registrada.`, status==='presente'?'success':'error')
  }

  const saveCat = async () => {
    if (!catForm.slug.trim() || !catForm.label.trim()) { toast('Preencha slug e nome.','error'); return }
    if (editCat) { await DB.updateCategoria(editCat.id, catForm); toast('Categoria atualizada!','success') }
    else         { await DB.createCategoria({ ...catForm, slug: catForm.slug.toUpperCase() }); toast('Categoria criada!','success') }
    play('success'); setCatForm({ slug:'', label:'', cor:'#8F00FF' }); setEditCat(null); await refresh()
  }

  // Parseia o texto colado no formato: Nome Completo,matricula,turma,senha
  const parseLote = (text) => {
    const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean)
    const items = []; const errs = []
    lines.forEach((line, i) => {
      // Suporta vírgula, ponto-e-vírgula ou tab como separador
      const parts = line.split(/[,;\t]/).map(p => p.trim())
      if (parts.length < 3) {
        errs.push(`Linha ${i+1}: precisa de pelo menos 3 colunas (nome, matrícula, turma)`)
        return
      }
      const [name, matricula, turma, pass] = parts
      if (!name || !matricula || !turma) {
        errs.push(`Linha ${i+1}: nome, matrícula ou turma em branco`)
        return
      }
      items.push({ name, matricula, turma, pass: pass || matricula, curso: 'Desenvolvimento de Sistemas', firstAccess: true })
    })
    setLotePreview(items)
    setLoteErrors(errs)
    setLoteStatus(null)
    setLoteProgress(0)
  }

  const importarLote = async () => {
    if (lotePreview.length === 0) return
    setLoteStatus('importing')
    let ok = 0
    for (let i = 0; i < lotePreview.length; i++) {
      const stu = lotePreview[i]
      try {
        const existing = await DB.getStudentByMat(stu.matricula)
        if (!existing) {
          await DB.createStudent(stu)
          ok++
        }
      } catch (_) {}
      setLoteProgress(Math.round(((i + 1) / lotePreview.length) * 100))
    }
    play('success')
    toast(`${ok} aluno(s) importado(s)!`, 'success')
    setLoteStatus('done')
    setLoteText('')
    setLotePreview([])
    await refresh()
  }

  const saveStu = async () => {
    if (!stuForm.name.trim() || !stuForm.matricula.trim() || !stuForm.pass.trim()) {
      toast('Preencha nome, matrícula e senha.','error'); return
    }
    setSavingStu(true)
    const existing = await DB.getStudentByMat(stuForm.matricula.trim())
    if (existing) { toast('Matrícula já cadastrada!','error'); setSavingStu(false); return }
    await DB.createStudent({ ...stuForm, matricula: stuForm.matricula.trim(), name: stuForm.name.trim(), firstAccess: true })
    play('success'); toast('Aluno cadastrado!','success')
    setStuForm({ name:'', matricula:'', turma:'DS_MOD1_A', curso:'Desenvolvimento de Sistemas', pass:'' })
    setSavingStu(false)
    await refresh()
  }

  const openCount = events.filter(e => e.status==='open').length

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      <Navbar />
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text3)' }}>
        // carregando painel...
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      <Navbar />

      {/* Bento stats */}
      <div className="bento-grid">
        {[
          { label:'portal',         val:'ativo',       sub:'ETE Cícero Dias — Recife' },
          { label:'events abertos', val:openCount,     sub:`${events.length} no total` },
          { label:'inscrições',     val:totalInsc,     sub:'total geral' },
          { label:'presenças',      val:totalPresent,  sub:'confirmadas via check-in' },
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
        {['events','check-in','alunos','categorias','certificados'].map(t => (
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
              const catObj = categorias.find(c => c.slug===ev.category)
              return (
                <div key={ev.id} style={{ background:'var(--surface)', border:'1px solid var(--border)', padding:'1rem 1.25rem', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'1.1rem', color:'var(--text)', marginBottom:2 }}>
                      {ev.title}
                    </p>
                    <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.58rem', color:'var(--text3)' }}>
                      {ev.dateLabel} · {ev.location} · {catObj?.label||ev.category} · {ev.tipo}
                      {' '}· {inscsByEvent[ev.id]||0}/{ev.capacity} inscritos
                    </p>
                  </div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    <button className="btn btn-ghost btn-sm"
                      onClick={() => { play('nav'); setTab('check-in'); setCheckinEv(ev) }}>
                      check-in
                    </button>
                    <button className="btn btn-ghost btn-sm"
                      onClick={() => { play('click'); setForm({...ev, turmas:ev.turmas||[], topics:ev.topics||[]}); setModal(ev) }}>
                      editar
                    </button>
                    <button className="btn btn-ghost btn-sm"
                      style={{ color: ev.status==='open'?'var(--o)':'var(--text3)' }}
                      onClick={async () => {
                        await DB.updateEvent(ev.id,{status:ev.status==='open'?'closed':'open'})
                        await refresh()
                        play('click')
                        toast(`Event ${ev.status==='open'?'encerrado':'reaberto'}.`,'info')
                      }}>
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
            {events.length === 0 && (
              <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text3)', padding:'2rem 0' }}>
                // nenhum evento cadastrado. Clique em "+ novo event" para começar.
              </p>
            )}
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
                      {inscsByEvent[ev.id]||0} inscritos →
                    </span>
                  </div>
                ))}
                {events.filter(e=>e.status==='open').length === 0 && (
                  <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text3)' }}>
                    // nenhum event aberto no momento
                  </p>
                )}
              </div>
            </>
          ) : (
            <CheckinPanel
              checkinEv={checkinEv}
              checkins={checkins}
              onToggle={toggleCheckin}
              onBack={() => { play('nav'); setCheckinEv(null) }}
            />
          )}
        </div>
      )}

      {/* Tab alunos */}
      {tab==='alunos' && (
        <div className="section" style={{ flex:1 }}>
          {/* Sub-abas */}
          <div style={{ display:'flex', gap:1, marginBottom:'1.5rem', borderBottom:'1px solid var(--border)', paddingBottom:'0.75rem' }}>
            {[['individual','+ cadastrar individual'],['lote','⬆ importar em lote']].map(([key,label]) => (
              <button key={key}
                className={`btn btn-sm ${alunoTab===key?'btn-v':'btn-ghost'}`}
                onClick={() => { play('nav'); setAlunoTab(key) }}>
                {label}
              </button>
            ))}
          </div>

          {/* Lista de alunos — sempre visível */}
          <div style={{ display:'grid', gridTemplateColumns: alunoTab==='lote' ? '1fr' : '1fr 1fr', gap:'2rem' }}>
            <div>
              <p className="section-title" style={{ marginBottom:'1rem' }}>alunos cadastrados ({students.length})</p>
              <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
                {students.map(stu => (
                  <div key={stu.id} style={{ background:'var(--surface)', border:'1px solid var(--border)', padding:'0.8rem 1.25rem', display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
                    <div>
                      <p style={{ fontFamily:'var(--font-mono)', fontWeight:700, fontSize:'0.8rem', color:'var(--text)' }}>
                        {stu.name}
                        {stu.firstAccess && (
                          <span style={{ marginLeft:8, fontFamily:'var(--font-mono)', fontSize:'0.5rem', color:'var(--o)', border:'1px solid var(--o)', padding:'1px 6px', verticalAlign:'middle' }}>
                            1º acesso
                          </span>
                        )}
                      </p>
                      <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.58rem', color:'var(--text3)' }}>{stu.matricula} · {stu.turma}</p>
                    </div>
                    <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                      <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.55rem', color:'var(--text3)', border:'1px solid var(--border)', padding:'2px 8px' }}>
                        {stu.pass}
                      </span>
                      <button className="btn btn-danger btn-sm"
                        onClick={async () => { await DB.deleteStudent(stu.id); play('error'); toast('Aluno removido.','info'); await refresh() }}>
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                {students.length === 0 && (
                  <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text3)' }}>
                    // nenhum aluno cadastrado ainda
                  </p>
                )}
              </div>
            </div>

            {/* Form individual */}
            {alunoTab==='individual' && (
              <div>
                <p className="section-title" style={{ marginBottom:'1rem' }}>cadastrar aluno</p>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.9rem' }}>
                  <div>
                    <label className="input-label">nome completo</label>
                    <input className="input" value={stuForm.name} placeholder="Maria Silva"
                      onChange={e => setStuForm(p=>({...p, name:e.target.value}))} />
                  </div>
                  <div>
                    <label className="input-label">matrícula</label>
                    <input className="input" value={stuForm.matricula} placeholder="2026-0001"
                      onChange={e => setStuForm(p=>({...p, matricula:e.target.value}))} />
                  </div>
                  <div>
                    <label className="input-label">turma</label>
                    <select className="input" value={stuForm.turma} onChange={e => setStuForm(p=>({...p, turma:e.target.value}))}>
                      {TURMAS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">senha inicial</label>
                    <input className="input" value={stuForm.pass} placeholder="senha123"
                      onChange={e => setStuForm(p=>({...p, pass:e.target.value}))} />
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.55rem', color:'var(--text3)', marginTop:4, display:'block' }}>
                      // aluno troca a senha no primeiro acesso
                    </span>
                  </div>
                  <button className="btn btn-v" onClick={saveStu} disabled={savingStu} onMouseEnter={() => play('hover')}>
                    {savingStu ? '// salvando...' : 'cadastrar aluno →'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Importação em lote */}
          {alunoTab==='lote' && (
            <div style={{ marginTop:'2rem' }}>
              <p className="section-title" style={{ marginBottom:'0.5rem' }}>importar em lote</p>
              <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.6rem', color:'var(--text3)', marginBottom:'1rem', lineHeight:1.8 }}>
                Cole abaixo uma lista no formato: <span style={{ color:'var(--v-pale)' }}>nome, matrícula, turma, senha</span><br />
                Uma linha por aluno. Vírgula, ponto-e-vírgula ou tab como separador.<br />
                Se a senha for omitida, a matrícula é usada como senha inicial. Todo aluno importado terá<span style={{ color:'var(--o)' }}> primeiro acesso</span> ativado.
              </p>

              {/* Exemplo */}
              <div style={{ background:'var(--surface)', border:'1px solid var(--border)', padding:'0.75rem 1rem', marginBottom:'1rem', fontFamily:'var(--font-mono)', fontSize:'0.6rem', color:'var(--text3)', lineHeight:2 }}>
                <span style={{ color:'var(--text3)' }}>// exemplo:</span><br />
                Maria Silva, 2026-0001, DS_MOD1_A, senha123<br />
                João Costa, 2026-0002, DS_MOD1_B<br />
                Ana Souza; 2026-0003; DS_MOD3_A; minhasenha
              </div>

              <textarea
                className="input"
                style={{ minHeight:160, resize:'vertical', fontFamily:'var(--font-mono)', fontSize:'0.72rem', lineHeight:1.9 }}
                placeholder={'Maria Silva, 2026-0001, DS_MOD1_A, senha123\nJoão Costa, 2026-0002, DS_MOD1_B'}
                value={loteText}
                onChange={e => { setLoteText(e.target.value); if(e.target.value.trim()) parseLote(e.target.value); else { setLotePreview([]); setLoteErrors([]) } }}
              />

              {/* Erros de parse */}
              {loteErrors.length > 0 && (
                <div style={{ marginTop:'0.75rem', padding:'0.75rem 1rem', background:'rgba(255,59,59,0.07)', border:'1px solid var(--danger)' }}>
                  {loteErrors.map((e,i) => (
                    <p key={i} style={{ fontFamily:'var(--font-mono)', fontSize:'0.6rem', color:'var(--danger)', lineHeight:1.8 }}>⚠ {e}</p>
                  ))}
                </div>
              )}

              {/* Preview */}
              {lotePreview.length > 0 && (
                <div style={{ marginTop:'1rem' }}>
                  <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.6rem', color:'var(--text3)', marginBottom:'0.5rem' }}>
                    // {lotePreview.length} aluno(s) encontrado(s):
                  </p>
                  <div style={{ display:'flex', flexDirection:'column', gap:1, maxHeight:220, overflowY:'auto' }}>
                    {lotePreview.map((s,i) => (
                      <div key={i} style={{ background:'var(--surface)', border:'1px solid var(--border)', padding:'0.6rem 1rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div>
                          <span style={{ fontFamily:'var(--font-mono)', fontWeight:700, fontSize:'0.75rem', color:'var(--text)' }}>{s.name}</span>
                          <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.55rem', color:'var(--text3)', marginLeft:12 }}>{s.matricula} · {s.turma}</span>
                        </div>
                        <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.55rem', color:'var(--text3)', border:'1px solid var(--border)', padding:'1px 8px' }}>{s.pass}</span>
                      </div>
                    ))}
                  </div>

                  {/* Barra de progresso */}
                  {loteStatus === 'importing' && (
                    <div style={{ marginTop:'1rem' }}>
                      <div style={{ height:4, background:'var(--border)', marginBottom:6 }}>
                        <div style={{ height:'100%', background:'var(--v)', width:`${loteProgress}%`, transition:'width 0.2s' }} />
                      </div>
                      <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.58rem', color:'var(--text3)' }}>
                        // importando... {loteProgress}%
                      </p>
                    </div>
                  )}

                  {loteStatus === 'done' && (
                    <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.62rem', color:'var(--success)', marginTop:'1rem' }}>
                      ✓ importação concluída!
                    </p>
                  )}

                  {loteStatus !== 'importing' && loteStatus !== 'done' && (
                    <button className="btn btn-v" style={{ marginTop:'1rem' }}
                      onClick={importarLote}
                      onMouseEnter={() => play('hover')}>
                      importar {lotePreview.length} aluno(s) →
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab categorias */}
      {tab==='categorias' && (
        <div className="section" style={{ flex:1 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2rem' }}>
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
                        onClick={async () => { await DB.deleteCategoria(cat.id); play('error'); toast('Categoria removida.','info'); await refresh() }}>
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
                {label:'título',       key:'title',        ph:'React UI Masterclass'},
                {label:'instrutor',    key:'instructor',   ph:'Prof. Nome Sobrenome'},
                {label:'convidado por',key:'invitedBy',    ph:'Coordenação DS'},
                {label:'local',        key:'location',     ph:'Laboratório 03'},
                {label:'data label',   key:'dateLabel',    ph:'20 ABR 2026'},
                {label:'data (YYYY-MM-DD)', key:'date',    ph:'2026-04-20'},
                {label:'link material (opcional)', key:'material_link', ph:'https://...'},
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
                      className={`chip ${(form.turmas||[]).includes(t)?'active':''}`}
                      onClick={() => f('turmas', (form.turmas||[]).includes(t)?(form.turmas||[]).filter(x=>x!==t):[...(form.turmas||[]),t])}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
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
                onClick={async () => { await DB.deleteEvent(delConfirm); await refresh(); setDelConfirm(null); play('error'); toast('Event removido.','info') }}>
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

// Componente separado pra check-in com carregamento dos inscritos
function CheckinPanel({ checkinEv, checkins, onToggle, onBack }) {
  const [inscStudents, setInscStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const inscs = await DB.getInscriptionsByEvent(checkinEv.id)
      const stuList = (await Promise.all(inscs.map(i => DB.getStudentById(i.studentId)))).filter(Boolean)
      setInscStudents(stuList)
      setLoading(false)
    }
    load()
  }, [checkinEv.id])

  return (
    <>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem', flexWrap:'wrap', gap:8 }}>
        <div>
          <span className="tech-label" style={{ marginBottom:2 }}>check-in</span>
          <p style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'1.2rem', color:'var(--text)' }}>{checkinEv.title}</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onBack}>
          ← trocar event
        </button>
      </div>
      {loading ? (
        <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text3)' }}>// carregando inscritos...</p>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
          {inscStudents.map(stu => {
            const status = checkins[stu.id] || null
            return (
              <div key={stu.id} style={{ background:'var(--surface)', border:'1px solid var(--border)', padding:'0.8rem 1.25rem', display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
                <div>
                  <p style={{ fontFamily:'var(--font-mono)', fontWeight:700, fontSize:'0.8rem', color:'var(--text)' }}>{stu.name}</p>
                  <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.58rem', color:'var(--text3)' }}>{stu.matricula} · {stu.turma}</p>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <button className={`btn btn-sm ${status==='presente'?'btn-success':'btn-ghost'}`}
                    onClick={() => onToggle(stu.id,'presente')}>✓ presente</button>
                  <button className={`btn btn-sm ${status==='ausente'?'btn-danger':'btn-ghost'}`}
                    onClick={() => onToggle(stu.id,'ausente')}>✗ ausente</button>
                </div>
              </div>
            )
          })}
          {inscStudents.length === 0 && (
            <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text3)' }}>
              // nenhum aluno inscrito neste event ainda
            </p>
          )}
        </div>
      )}
      {/* ── ABA CERTIFICADOS ─────────────────────────────── */}
      {tab==='certificados' && (() => {
        const evOptions = events.filter(ev => ev.status === 'closed')
        const selectedEv = evOptions.find(ev => ev.id === certEvFilter) || evOptions[0]
        const evCheckins = selectedEv
          ? Object.entries(checkins)
              .filter(([key]) => key.startsWith(selectedEv.id))
              .filter(([, status]) => status === 'presente')
              .map(([key]) => key.replace(selectedEv.id + '_', ''))
          : []
        const presentStudents = students.filter(s => evCheckins.includes(s.id))
        return (
          <div style={{ padding:'2rem' }}>
            <div style={{ marginBottom:'1.5rem', display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
              <span className="tech-label" style={{ marginBottom:0 }}>// evento</span>
              <select
                value={certEvFilter === 'all' && evOptions[0] ? evOptions[0].id : certEvFilter}
                onChange={e => setCertEvFilter(e.target.value)}
                style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', background:'var(--surface)', color:'var(--text)', border:'1px solid var(--border)', padding:'4px 8px', cursor:'pointer' }}>
                {evOptions.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.title} — {ev.dateLabel}</option>
                ))}
              </select>
              {selectedEv && (
                <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.6rem', color:'var(--text3)' }}>
                  {presentStudents.length} aluno(s) com presença confirmada
                </span>
              )}
            </div>
            {!selectedEv ? (
              <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text3)' }}>
                // nenhum evento encerrado ainda
              </p>
            ) : presentStudents.length === 0 ? (
              <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text3)' }}>
                // nenhum aluno com presença confirmada neste evento
              </p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
                {presentStudents.map(stu => (
                  <div key={stu.id} style={{ background:'var(--surface)', border:'1px solid var(--border)', padding:'0.8rem 1.25rem', display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
                    <div>
                      <p style={{ fontFamily:'var(--font-mono)', fontWeight:700, fontSize:'0.8rem', color:'var(--text)' }}>{stu.name}</p>
                      <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.58rem', color:'var(--text3)' }}>{stu.matricula}{stu.turma ? ` · ${stu.turma}` : ''}</p>
                    </div>
                    <button className="btn btn-v btn-sm"
                      onClick={() => { play('click'); setCertTarget({ event: selectedEv, student: stu }) }}
                      onMouseEnter={() => play('hover')}>
                      ★ gerar certificado
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })()}

      {certTarget && (
        <CertModal
          event={certTarget.event}
          student={certTarget.student}
          onClose={() => setCertTarget(null)}
        />
      )}

    </>
  )
}