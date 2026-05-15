import { useEffect, useRef, useState } from 'react'
import { useSound } from '../hooks/useSound'
import { DB } from '../db/firebaseDB'

export default function CertModal({ event, student, onClose }) {
  const { play } = useSound()
  const certRef  = useRef(null)
  const [generating, setGenerating] = useState(false)
  const [sending,    setSending]    = useState(false)
  const [email,      setEmail]      = useState(student?.email || '')
  const [showEmail,  setShowEmail]  = useState(false)
  const [certLog,    setCertLog]    = useState(null)

  useEffect(() => {
    play('cert')
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    // Buscar log existente
    if (student?.id && event?.id) {
      DB.getCertByStudentAndEvent(student.id, event.id).then(setCertLog)
    }
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  if (!event || !student) return null

  const today = new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })

  const generatePDF = async () => {
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ])
    const canvas = await html2canvas(certRef.current, {
      scale: 3, useCORS: true, backgroundColor: '#ffffff',
      width: certRef.current.offsetWidth,
      height: certRef.current.offsetHeight,
    })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    pdf.addImage(imgData, 'PNG', 0, 0, 297, 210)
    return { pdf, imgData: imgData.replace('data:image/png;base64,', '') }
  }

  const handleDownload = async () => {
    play('click'); setGenerating(true)
    try {
      const { pdf } = await generatePDF()
      pdf.save(`certificado-${student.name?.toLowerCase().replace(/\s+/g,'-')}-${event.id}.pdf`)
      // Log
      const log = await DB.logCert(student.id, event.id)
      DB.getCertByStudentAndEvent(student.id, event.id).then(setCertLog)
    } catch (err) { console.error(err) }
    setGenerating(false)
  }

  const handleSendEmail = async () => {
    if (!email || !email.includes('@')) {
      alert('Digite um email válido'); return
    }
    play('click'); setSending(true)
    try {
      const { pdf, imgData } = await generatePDF()
      // Converter pra base64 sem header

      // Gerar PDF com qualidade reduzida para email
      const [{ default: html2canvasEmail }, { default: jsPDFEmail }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])
      const canvasEmail = await html2canvasEmail(certRef.current, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: '#ffffff',
      })
      const imgEmail = canvasEmail.toDataURL('image/jpeg', 0.7)
      const pdfEmail = new jsPDFEmail({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      pdfEmail.addImage(imgEmail, 'JPEG', 0, 0, 297, 210)
      const pdfBase64 = pdfEmail.output('datauristring').split(',')[1]

      const res = await fetch('/api/send-cert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          studentName: student.name,
          eventTitle: event.title,
          eventDate: event.dateLabel,
          pdfBase64,
        }),
      })
      const data = await res.json()
      if (data.ok) {
        await DB.logCert(student.id, event.id, { email })
        await DB.markCertEmailSent(student.id, event.id)
        DB.getCertByStudentAndEvent(student.id, event.id).then(setCertLog)
        // Salvar email no perfil do aluno se não tiver
        if (!student.email) await DB.updateStudent(student.id, { email })
        alert('✓ Certificado enviado para ' + email)
        setShowEmail(false)
      } else {
        alert('Erro ao enviar: ' + data.error)
      }
    } catch (err) { console.error(err); alert('Erro ao enviar email.') }
    setSending(false)
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div style={{ width:'min(900px,95vw)', display:'flex', flexDirection:'column' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.75rem 1rem', background:'var(--surface)', border:'1px solid var(--border)', borderBottom:'none', flexWrap:'wrap', gap:8 }}>
          <div>
            <span className="tech-label" style={{ marginBottom:0 }}>// certificado_digital</span>
            {certLog && (
              <span style={{ marginLeft:12, fontFamily:'var(--font-mono)', fontSize:'0.55rem', color:'var(--text3)' }}>
                {certLog.downloads}x baixado
                {certLog.emailSent && ' · email enviado ✓'}
              </span>
            )}
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <button className="btn btn-v btn-sm" onClick={handleDownload}
              disabled={generating} onMouseEnter={() => play('hover')}>
              {generating ? '// gerando...' : '⬇ salvar PDF'}
            </button>
            <button className="btn btn-ghost btn-sm"
              onClick={() => setShowEmail(v => !v)}
              onMouseEnter={() => play('hover')}>
              ✉ enviar por email
            </button>
            <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Email form */}
        {showEmail && (
          <div style={{ display:'flex', gap:8, padding:'0.75rem 1rem', background:'var(--surface)', border:'1px solid var(--border)', borderBottom:'none', alignItems:'center' }}>
            <input
              className="input"
              style={{ flex:1, fontSize:'0.75rem', padding:'8px 12px' }}
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus
            />
            <button className="btn btn-v btn-sm" onClick={handleSendEmail} disabled={sending}>
              {sending ? '// enviando...' : 'enviar →'}
            </button>
          </div>
        )}

        {/* Preview */}
        <div style={{ background:'#e5e5e5', padding:'1.5rem', display:'flex', justifyContent:'center' }}>
          <div ref={certRef} style={{ width:794, height:560, background:'#fff', fontFamily:"'JetBrains Mono',monospace", position:'relative', overflow:'hidden', boxSizing:'border-box', flexShrink:0 }}>

            {/* Barra roxa */}
            <div style={{ position:'absolute', top:0, left:0, bottom:0, width:10, background:'#8F00FF' }} />
            {/* Borda interna */}
            <div style={{ position:'absolute', top:16, left:22, right:16, bottom:16, border:'1px solid #ececec', pointerEvents:'none' }} />

            <div style={{ position:'absolute', top:28, left:34, right:24, bottom:24, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>

              {/* Header */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:28, color:'#0a0a0a', lineHeight:1 }}>
                    l<span style={{color:'#8F00FF'}}>0</span>bby
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, color:'#FF7927' }}>-E</span>
                  </div>
                  <p style={{ fontSize:9, color:'#aaa', marginTop:4, letterSpacing:'0.08em', textTransform:'uppercase' }}>
                    ETE Cícero Dias — Desenvolvimento de Sistemas — Recife, PE
                  </p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <span style={{ display:'inline-block', background:'#8F00FF', color:'#fff', padding:'3px 10px', fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' }}>
                    {event.category}
                  </span>
                  <p style={{ fontSize:8, color:'#bbb', marginTop:3 }}>ID: ETE-{event.id?.slice(-4).toUpperCase()}</p>
                </div>
              </div>

              {/* Corpo */}
              <div>
                <p style={{ fontSize:11, color:'#888', marginBottom:8, letterSpacing:'0.06em', textTransform:'uppercase' }}>Certificamos que</p>
                <p style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:52, color:'#0a0a0a', lineHeight:1, letterSpacing:'-0.01em', marginBottom:8 }}>
                  {student.name?.toUpperCase()}
                </p>
                <p style={{ fontSize:11, color:'#888', lineHeight:1.6, marginBottom:8 }}>
                  matrícula <strong style={{color:'#0a0a0a'}}>{student.matricula}</strong>
                  {student.turma && <> · turma <strong style={{color:'#0a0a0a'}}>{student.turma}</strong></>}
                </p>
                <p style={{ fontSize:12, color:'#555', lineHeight:1.6, marginBottom:4 }}>participou e concluiu com presença confirmada o evento</p>
                <p style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:28, color:'#8F00FF', letterSpacing:'0.01em', lineHeight:1.2, marginBottom:6 }}>
                  {event.title}
                </p>
                <p style={{ fontSize:11, color:'#888' }}>
                  ministrado por <strong style={{color:'#0a0a0a'}}>{event.instructor}</strong>
                  {event.dateLabel && <> · {event.dateLabel}</>}
                  {event.location && <> · {event.location}</>}
                </p>
              </div>

              {/* Footer */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', paddingTop:16, borderTop:'1px solid #f0f0f0' }}>
                <div>
                  <p style={{ fontSize:8, color:'#aaa', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4 }}>Carga horária</p>
                  <p style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:40, color:'#FF7927', lineHeight:1 }}>{event.hours}H</p>
                </div>
                <div style={{ textAlign:'center' }}>
                  <p style={{ fontSize:8, color:'#aaa', letterSpacing:'0.06em', marginBottom:4 }}>Emitido em</p>
                  <p style={{ fontSize:12, fontWeight:700, color:'#0a0a0a' }}>{today}</p>
                </div>
                <div style={{ textAlign:'right', minWidth:140 }}>
                  <div style={{ width:120, height:1, background:'#0a0a0a', marginBottom:6, marginLeft:'auto' }} />
                  <p style={{ fontSize:10, color:'#888', letterSpacing:'0.06em' }}>Coordenação</p>
                  <p style={{ fontSize:9, color:'#bbb' }}>ETE Cícero Dias</p>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  )
}