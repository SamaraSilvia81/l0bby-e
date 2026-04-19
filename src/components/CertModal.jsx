import { useEffect } from 'react'
import { useSound } from '../hooks/useSound'

export default function CertModal({ event, student, onClose }) {
  const { play } = useSound()

  useEffect(() => {
    play('cert')
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  if (!event || !student) return null

  const today = new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })

  const handlePrint = () => {
    play('click')
    // Revela o elemento de print, chama window.print(), depois esconde
    const el = document.getElementById('cert-print-root')
    if (el) {
      el.style.display = 'block'
      setTimeout(() => {
        window.print()
        setTimeout(() => { el.style.display = 'none' }, 800)
      }, 100)
    }
  }

  const CertContent = ({ forPrint = false }) => (
    <div style={{
      width: '100%', background: '#fff',
      fontFamily: "'JetBrains Mono', monospace",
      position: 'relative', overflow: 'hidden',
      minHeight: forPrint ? '100vh' : 'auto',
    }}>
      {/* Barra lateral violet */}
      <div style={{ position:'absolute', top:0, left:0, bottom:0, width:7, background:'#8F00FF' }} />
      {/* Watermark */}
      <div style={{
        position:'absolute', fontFamily:"'Barlow Condensed',sans-serif",
        fontWeight:900, fontSize:'8rem', color:'rgba(143,0,255,0.035)',
        top:'50%', left:'50%', transform:'translate(-50%,-50%) rotate(-14deg)',
        whiteSpace:'nowrap', pointerEvents:'none', letterSpacing:'-0.04em',
      }}>L0BBY-E</div>
      {/* Borda interna */}
      <div style={{ position:'absolute', inset:14, border:'1px solid #ececec', pointerEvents:'none' }} />

      <div style={{ padding:'2.5rem 3rem 2.5rem 3.5rem', position:'relative', zIndex:1 }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem' }}>
          <div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:'1.2rem', color:'#0a0a0a' }}>
              l<span style={{color:'#8F00FF'}}>0</span>bby
              <span style={{fontFamily:"'JetBrains Mono',monospace", fontSize:'0.5em', color:'#FF7927'}}>-E</span>
            </div>
            <p style={{ fontSize:'0.52rem', color:'#aaa', marginTop:2, letterSpacing:'0.08em', textTransform:'uppercase' }}>
              ETE Cícero Dias — Desenvolvimento de Sistemas — Recife, PE
            </p>
          </div>
          <div style={{ textAlign:'right' }}>
            <span style={{ display:'inline-block', background:'#8F00FF', color:'#fff', padding:'2px 9px', fontSize:'0.52rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' }}>
              {event.category}
            </span>
            <p style={{ fontSize:'0.5rem', color:'#bbb', marginTop:3 }}>
              ID: ETE-{event.id?.slice(-4).toUpperCase()}
            </p>
          </div>
        </div>

        {/* Corpo */}
        <p style={{ fontSize:'0.68rem', color:'#888', marginBottom:'0.4rem', letterSpacing:'0.06em', textTransform:'uppercase' }}>
          Certificamos que
        </p>
        <p style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:'2.5rem', color:'#0a0a0a', lineHeight:1, letterSpacing:'-0.01em', marginBottom:'0.5rem' }}>
          {student.name.toUpperCase()}
        </p>
        <p style={{ fontSize:'0.68rem', color:'#888', lineHeight:1.6, marginBottom:'0.75rem' }}>
          matrícula <strong style={{color:'#0a0a0a'}}>{student.matricula}</strong>
          {student.turma && <> · turma <strong style={{color:'#0a0a0a'}}>{student.turma}</strong></>}
        </p>
        <p style={{ fontSize:'0.72rem', color:'#555', lineHeight:1.65, marginBottom:'0.25rem' }}>
          participou e concluiu com presença confirmada o evento
        </p>
        <p style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:'1.6rem', color:'#8F00FF', letterSpacing:'0.01em', marginBottom:'0.25rem' }}>
          {event.title}
        </p>
        <p style={{ fontSize:'0.65rem', color:'#888' }}>
          ministrado por <strong style={{color:'#0a0a0a'}}>{event.instructor}</strong>
          {event.dateLabel && <> · {event.dateLabel}</>}
          {event.location && <> · {event.location}</>}
        </p>

        {/* Footer do cert */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', paddingTop:'1.5rem', marginTop:'1.5rem', borderTop:'1px solid #f0f0f0' }}>
          <div>
            <p style={{ fontSize:'0.52rem', color:'#aaa', letterSpacing:'0.08em', textTransform:'uppercase' }}>Carga horária</p>
            <p style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:'1.8rem', color:'#FF7927', lineHeight:1 }}>
              {event.hours}H
            </p>
          </div>
          <div style={{ textAlign:'center' }}>
            <p style={{ fontSize:'0.52rem', color:'#aaa', letterSpacing:'0.06em', marginBottom:4 }}>Emitido em</p>
            <p style={{ fontSize:'0.65rem', fontWeight:700, color:'#0a0a0a' }}>{today}</p>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ width:90, height:1, background:'#0a0a0a', marginBottom:4, marginLeft:'auto' }} />
            <p style={{ fontSize:'0.52rem', color:'#888', letterSpacing:'0.06em' }}>Coordenação DS</p>
            <p style={{ fontSize:'0.5rem', color:'#bbb' }}>ETE Cícero Dias</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Elemento oculto para print */}
      <div id="cert-print-root" style={{ display:'none' }}>
        <CertContent forPrint />
      </div>

      {/* Modal na tela */}
      <div className="modal-bg" onClick={onClose}>
        <div style={{ width:'min(880px,100%)', display:'flex', flexDirection:'column' }}
          onClick={e => e.stopPropagation()}>

          <div style={{
            display:'flex', justifyContent:'space-between', alignItems:'center',
            padding:'0.75rem 1rem', background:'var(--surface)',
            border:'1px solid var(--border)', borderBottom:'none',
          }}>
            <span className="tech-label" style={{ marginBottom:0 }}>certificado_digital</span>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-v btn-sm" onClick={handlePrint}
                onMouseEnter={() => play('hover')}>
                imprimir / salvar PDF
              </button>
              <button className="btn btn-ghost btn-sm" onClick={onClose}
                onMouseEnter={() => play('hover')}>
                ✕
              </button>
            </div>
          </div>
          <CertContent />
        </div>
      </div>
    </>
  )
}
