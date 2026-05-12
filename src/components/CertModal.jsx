import { useEffect, useRef, useState } from 'react'
import { useSound } from '../hooks/useSound'

export default function CertModal({ event, student, onClose }) {
  const { play } = useSound()
  const certRef = useRef(null)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    play('cert')
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  if (!event || !student) return null

  const today = new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })

  const handleDownload = async () => {
    if (!certRef.current) return
    play('click')
    setGenerating(true)
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])
      const canvas = await html2canvas(certRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: certRef.current.offsetWidth,
        height: certRef.current.offsetHeight,
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      pdf.addImage(imgData, 'PNG', 0, 0, 297, 210)
      pdf.save(`certificado-${student.name.toLowerCase().replace(/\s+/g, '-')}.pdf`)
    } catch (err) {
      console.error(err)
    }
    setGenerating(false)
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div style={{ width:'min(900px,95vw)', display:'flex', flexDirection:'column' }}
        onClick={e => e.stopPropagation()}>

        {/* Header do modal */}
        <div style={{
          display:'flex', justifyContent:'space-between', alignItems:'center',
          padding:'0.75rem 1rem', background:'var(--surface)',
          border:'1px solid var(--border)', borderBottom:'none',
        }}>
          <span className="tech-label" style={{ marginBottom:0 }}>// certificado_digital</span>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-v btn-sm" onClick={handleDownload}
              disabled={generating} onMouseEnter={() => play('hover')}>
              {generating ? '// gerando...' : '⬇ salvar PDF'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={onClose}
              onMouseEnter={() => play('hover')}>✕</button>
          </div>
        </div>

        {/* Preview do certificado */}
        <div style={{ background:'#e5e5e5', padding:'1.5rem', display:'flex', justifyContent:'center' }}>
          <div ref={certRef} style={{
            width: 794, height: 560,
            background: '#fff',
            fontFamily: "'JetBrains Mono', monospace",
            position: 'relative', overflow: 'hidden',
            boxSizing: 'border-box', flexShrink: 0,
          }}>
            {/* Barra lateral roxa */}
            <div style={{ position:'absolute', top:0, left:0, bottom:0, width:10, background:'#8F00FF' }} />
            {/* Borda interna */}
            <div style={{ position:'absolute', top:16, left:22, right:16, bottom:16, border:'1px solid #ececec', pointerEvents:'none' }} />

            {/* Conteúdo */}
            <div style={{ position:'absolute', top:28, left:34, right:24, bottom:24, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>

              {/* Header */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:28, color:'#0a0a0a', lineHeight:1 }}>
                    l<span style={{color:'#8F00FF'}}>0</span>bby
                    <span style={{fontFamily:"'JetBrains Mono',monospace", fontSize:14, color:'#FF7927'}}>-E</span>
                  </div>
                  <p style={{ fontSize:9, color:'#aaa', marginTop:4, letterSpacing:'0.08em', textTransform:'uppercase' }}>
                    ETE Cícero Dias — Desenvolvimento de Sistemas — Recife, PE
                  </p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <span style={{ display:'inline-block', background:'#8F00FF', color:'#fff', padding:'3px 10px', fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' }}>
                    {event.category}
                  </span>
                  <p style={{ fontSize:8, color:'#bbb', marginTop:3 }}>
                    ID: ETE-{event.id?.slice(-4).toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Corpo */}
              <div>
                <p style={{ fontSize:11, color:'#888', marginBottom:8, letterSpacing:'0.06em', textTransform:'uppercase' }}>
                  Certificamos que
                </p>
                <p style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:52, color:'#0a0a0a', lineHeight:1, letterSpacing:'-0.01em', marginBottom:8 }}>
                  {student.name.toUpperCase()}
                </p>
                <p style={{ fontSize:11, color:'#888', lineHeight:1.6, marginBottom:8 }}>
                  matrícula <strong style={{color:'#0a0a0a'}}>{student.matricula}</strong>
                  {student.turma && <> · turma <strong style={{color:'#0a0a0a'}}>{student.turma}</strong></>}
                </p>
                <p style={{ fontSize:12, color:'#555', lineHeight:1.6, marginBottom:4 }}>
                  participou e concluiu com presença confirmada o evento
                </p>
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
                  <p style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:40, color:'#FF7927', lineHeight:1 }}>
                    {event.hours}H
                  </p>
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