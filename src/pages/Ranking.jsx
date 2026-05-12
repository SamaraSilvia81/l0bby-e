import { useState, useEffect, useRef } from 'react'
import { DB } from '../db/firebaseDB'
import Navbar from '../components/Navbar'
import { PixelAvatar } from '../components/PixelAvatars'
import { useSound } from '../hooks/useSound'

const PODIUM_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32']
const PODIUM_HEIGHTS = [140, 100, 80]
const MEDALS = ['🥇', '🥈', '🥉']

function AvatarBall({ stu, size = 56 }) {
  const initials = stu.name?.split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase()
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', overflow:'hidden', border:'3px solid var(--v)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      {stu.customPhoto
        ? <img src={stu.customPhoto} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        : stu.avatar
          ? <PixelAvatar id={stu.avatar} size={size} />
          : <span style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:size*0.35, color:'var(--v)' }}>{initials}</span>
      }
    </div>
  )
}

function PodiumBlock({ stu, position, animate }) {
  const h = PODIUM_HEIGHTS[position]
  const color = PODIUM_COLORS[position]
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, flex:1 }}>
      {/* Avatar + nome */}
      <div style={{
        display:'flex', flexDirection:'column', alignItems:'center', gap:6,
        opacity: animate ? 1 : 0,
        transform: animate ? 'translateY(0)' : 'translateY(20px)',
        transition: `all 0.6s ease ${position * 0.15}s`,
      }}>
        <div style={{ fontSize: position === 0 ? '1.8rem' : '1.4rem' }}>{MEDALS[position]}</div>
        <AvatarBall stu={stu} size={position === 0 ? 72 : 56} />
        <p style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize: position === 0 ? '0.9rem' : '0.75rem', color:'var(--text)', textAlign:'center', lineHeight:1.2, maxWidth:100 }}>
          {stu.name?.split(' ').slice(0,2).join(' ').toUpperCase()}
        </p>
        <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.55rem', color:'var(--text3)', textAlign:'center' }}>
          {stu.presencas} {stu.presencas === 1 ? 'presença' : 'presenças'}
        </p>
      </div>

      {/* Bloco do pódio */}
      <div style={{
        width:'100%', height: animate ? h : 0,
        background: `linear-gradient(180deg, ${color}22 0%, ${color}11 100%)`,
        border: `1px solid ${color}44`,
        borderBottom: 'none',
        display:'flex', alignItems:'flex-start', justifyContent:'center',
        paddingTop:10,
        transition: `height 0.8s cubic-bezier(0.34,1.56,0.64,1) ${position * 0.1}s`,
        overflow:'hidden',
      }}>
        <span style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'2rem', color, opacity:0.4 }}>
          {position + 1}
        </span>
      </div>
    </div>
  )
}

export default function Ranking() {
  const { play } = useSound()
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)
  const [animate, setAnimate] = useState(false)
  const [showTop, setShowTop] = useState(false)
  const topRef = useRef()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [students, checkins] = await Promise.all([
        DB.getStudents(),
        DB.getCheckins(),
      ])
      const countMap = {}
      checkins.forEach(c => {
        if (c.checkin === true || c.status === 'presente') {
          countMap[c.studentId] = (countMap[c.studentId] || 0) + 1
        }
      })
      const ranked = students
        .filter(s => s.role === 'student')
        .map(s => ({ ...s, presencas: countMap[s.id] || 0 }))
        .sort((a, b) => b.presencas - a.presencas)
      setRanking(ranked)
      setLoading(false)
      setTimeout(() => setAnimate(true), 100)
    }
    load()

    const handleScroll = () => setShowTop(window.scrollY > 300)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const top3 = ranking.slice(0, 3)
  const rest  = ranking.slice(3)
  // Reordenar pódio: 2º, 1º, 3º
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean)
  const podiumPositions = top3[1] ? [1, 0, 2] : top3[0] ? [0] : []

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }} ref={topRef}>
      <Navbar />

      {/* Blobs */}
      <div style={{ position:'fixed', width:500, height:500, top:'calc(50vh - 250px)', left:-200, background:'radial-gradient(circle, rgba(143,0,255,0.07) 0%, transparent 70%)', pointerEvents:'none', zIndex:-1 }} />
      <div style={{ position:'fixed', width:400, height:400, bottom:-100, right:-100, background:'radial-gradient(circle, rgba(255,121,39,0.05) 0%, transparent 70%)', pointerEvents:'none', zIndex:-1 }} />
      <div style={{ position:'fixed', width:300, height:300, top:'20%', right:'15%', background:'radial-gradient(circle, rgba(255,215,0,0.03) 0%, transparent 70%)', pointerEvents:'none', zIndex:-1 }} />

      <div style={{ flex:1, maxWidth:760, margin:'0 auto', width:'100%', padding:'2rem' }}>

        {/* Header */}
        <div style={{ marginBottom:'2.5rem', textAlign:'center' }}>
          <span className="tech-label">// hall of fame</span>
          <h1 style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'2.5rem', color:'var(--text)', lineHeight:1, marginTop:4, letterSpacing:'-0.02em' }}>
            RANKING
          </h1>
          <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text3)', marginTop:8 }}>
            alunos com mais presenças confirmadas em eventos
          </p>
        </div>

        {loading ? (
          <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text3)', textAlign:'center' }}>// carregando ranking...</p>
        ) : ranking.length === 0 ? (
          <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text3)', textAlign:'center' }}>// nenhum dado ainda — participe de um evento!</p>
        ) : (
          <>
            {/* Pódio */}
            {top3.length > 0 && (
              <div style={{ marginBottom:'3rem' }}>
                <div style={{ display:'flex', alignItems:'flex-end', gap:4, height:280 }}>
                  {podiumOrder.map((stu, i) => (
                    <PodiumBlock
                      key={stu.id}
                      stu={stu}
                      position={podiumPositions[i]}
                      animate={animate}
                    />
                  ))}
                </div>
                {/* Base do pódio */}
                <div style={{ height:4, background:'var(--border)', marginTop:-1 }} />
              </div>
            )}

            {/* Lista restante */}
            {rest.length > 0 && (
              <div>
                <span className="tech-label" style={{ marginBottom:'1rem', display:'block' }}>// demais participantes</span>
                <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                  {rest.map((stu, i) => (
                    <div key={stu.id} style={{
                      background:'var(--surface)', border:'1px solid var(--border)',
                      padding:'0.75rem 1.25rem',
                      display:'flex', alignItems:'center', gap:'1rem',
                      opacity: animate ? 1 : 0,
                      transform: animate ? 'translateX(0)' : 'translateX(-20px)',
                      transition: `all 0.4s ease ${i * 0.05}s`,
                    }}>
                      <span style={{ fontFamily:'var(--font-mono)', fontWeight:700, fontSize:'0.75rem', color:'var(--text3)', minWidth:28 }}>
                        #{i + 4}
                      </span>
                      <AvatarBall stu={stu} size={36} />
                      <div style={{ flex:1 }}>
                        <p style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'0.9rem', color:'var(--text)', lineHeight:1, marginBottom:2 }}>
                          {stu.name?.toUpperCase()}
                        </p>
                        <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.55rem', color:'var(--text3)' }}>
                          {stu.curso || 'DS'}{stu.turma ? ` · ${stu.turma}` : ''}
                        </p>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <p style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'1.2rem', color:'var(--v)', lineHeight:1 }}>
                          {stu.presencas}
                        </p>
                        <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.5rem', color:'var(--text3)' }}>
                          {stu.presencas === 1 ? 'presença' : 'presenças'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <footer>
        <span><span className="logo-sm">l<span>0</span>bby-e</span> · ETE Cícero Dias</span>
        <span>desenvolvimento de sistemas · recife, pe</span>
      </footer>

      {/* Botão voltar ao topo */}
      {showTop && (
        <button
          onClick={() => { play('click'); window.scrollTo({ top:0, behavior:'smooth' }) }}
          style={{
            position:'fixed', bottom:'2rem', right:'2rem',
            width:44, height:44, borderRadius:'50%',
            background:'var(--v)', border:'none', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 0 20px rgba(143,0,255,0.5)',
            fontSize:'1.1rem', zIndex:100,
            animation:'fadeIn 0.2s ease',
          }}>
          ↑
        </button>
      )}
    </div>
  )
}