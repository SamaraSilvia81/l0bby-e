import { useNavigate } from 'react-router-dom'
import { useSound } from '../hooks/useSound'
import { DB } from '../db/localDB'

const CAT_DOT = {
  FRONTEND:'dot-v', BACKEND:'dot-c', DESIGN:'dot-o',
  DEVOPS:'dot-g', DADOS:'dot-p', SEGURANCA:'dot-y',
}

export default function EventCard({ event, enrolled, onEnroll, onUnenroll }) {
  const navigate = useNavigate()
  const { play } = useSound()
  const isClosed = event.status === 'closed'
  const pct = event._pct ?? 0
  const fillClass = pct >= 90 ? 'full' : pct >= 70 ? 'warn' : ''

  // label da categoria em PT
  const cats = DB.getCategorias()
  const catObj = cats.find(c => c.slug === event.category)
  const catLabel = catObj?.label || event.category

  const handleBtn = (e) => {
    e.stopPropagation()
    if (enrolled) { play('click'); onUnenroll?.(event.id) }
    else          { play('enroll'); onEnroll?.(event.id) }
  }

  return (
    <div className={`event-card cat-${event.category}${isClosed?' closed':''}`}
      onMouseEnter={() => play('hover')}>
      <div className="card-progress">
        <div className={`card-progress-fill ${fillClass}`} style={{ width:`${pct}%` }} />
      </div>
      <div className="card-body">
        <div className="card-cat">
          <span className={`cat-dot ${CAT_DOT[event.category]||'dot-v'}`} />
          {catLabel}
          {event.tipo === 'evento' && (
            <span style={{ marginLeft:6, fontFamily:'var(--font-mono)', fontSize:'0.5rem', fontWeight:700, letterSpacing:'0.08em', border:'1px solid var(--o)', color:'var(--o)', padding:'1px 6px' }}>
              evento
            </span>
          )}
        </div>
        <div className="card-title" style={{ cursor:'pointer' }}
          onClick={() => { play('nav'); navigate(`/details/${event.id}`) }}>
          {event.title}
        </div>
        <div className="card-instructor">{event.instructor}</div>
        <div className="card-meta">
          <span className="card-meta-item"><b>{event.dateLabel}</b></span>
          <span className="card-meta-item">{event.location}</span>
          <span className="card-meta-item">{event._enrolled ?? 0}/{event.capacity} inscritos</span>
          {event.material_link && (
            <span className="card-meta-item" style={{ color:'var(--v-pale)' }}>material ↗</span>
          )}
        </div>
      </div>
      <div className="card-footer">
        <span className="card-hours">{event.hours}h · cert</span>
        {isClosed ? (
          <button className="btn btn-ghost btn-sm" disabled>encerrado</button>
        ) : enrolled ? (
          <button className="btn btn-sm btn-danger" onClick={handleBtn}
            onMouseEnter={() => play('hover')}>
            ✕ cancelar
          </button>
        ) : (
          <button className="btn btn-v btn-sm" onClick={handleBtn}
            onMouseEnter={() => play('hover')}>
            inscrever →
          </button>
        )}
      </div>
    </div>
  )
}
