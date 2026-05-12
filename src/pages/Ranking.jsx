import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DB } from '../db/firebaseDB'
import Navbar from '../components/Navbar'
import { PixelAvatar } from '../components/PixelAvatars'
import { useSound } from '../hooks/useSound'

export default function Ranking() {
  const { play } = useSound()
  const navigate = useNavigate()
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [students, checkins] = await Promise.all([
        DB.getStudents(),
        DB.getCheckins(),
      ])

      // Conta presenças por aluno
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
    }
    load()
  }, [])

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      <Navbar />

      {/* Blobs */}
      <div style={{ position:'fixed', width:500, height:500, top:'calc(50vh - 250px)', left:-200, background:'radial-gradient(circle, rgba(143,0,255,0.07) 0%, transparent 70%)', pointerEvents:'none', zIndex:-1 }} />
      <div style={{ position:'fixed', width:400, height:400, bottom:-100, right:-100, background:'radial-gradient(circle, rgba(255,121,39,0.05) 0%, transparent 70%)', pointerEvents:'none', zIndex:-1 }} />

      <div className="section" style={{ flex:1, maxWidth:720, margin:'0 auto', width:'100%', padding:'2rem' }}>
        <div style={{ marginBottom:'2rem' }}>
          <span className="tech-label">// ranking</span>
          <h1 style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'2rem', color:'var(--text)', lineHeight:1, marginTop:4 }}>
            HALL OF FAME
          </h1>
          <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text3)', marginTop:8 }}>
            alunos com mais presenças confirmadas em eventos
          </p>
        </div>

        {loading ? (
          <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text3)' }}>// carregando ranking...</p>
        ) : ranking.length === 0 ? (
          <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text3)' }}>// nenhum dado ainda</p>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
            {ranking.map((stu, i) => (
              <div key={stu.id} style={{
                background: i === 0 ? 'rgba(143,0,255,0.08)' : 'var(--surface)',
                border: i === 0 ? '1px solid var(--v)' : '1px solid var(--border)',
                padding:'1rem 1.25rem',
                display:'flex', alignItems:'center', gap:'1rem',
                transition:'all 0.15s',
              }}>
                {/* Posição */}
                <div style={{ fontFamily:'var(--font-mono)', fontWeight:700, fontSize: i < 3 ? '1.4rem' : '0.8rem', minWidth:36, textAlign:'center', color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'var(--text3)' }}>
                  {i < 3 ? medals[i] : `#${i+1}`}
                </div>

                {/* Avatar */}
                <div style={{ width:48, height:48, borderRadius:'50%', overflow:'hidden', border:'2px solid var(--border)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
                  {stu.customPhoto
                    ? <img src={stu.customPhoto} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : stu.avatar
                      ? <PixelAvatar id={stu.avatar} size={48} />
                      : <span style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'1rem', color:'var(--v)' }}>
                          {stu.name?.split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase()}
                        </span>
                  }
                </div>

                {/* Info */}
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'1rem', color:'var(--text)', lineHeight:1, marginBottom:3 }}>
                    {stu.name?.toUpperCase()}
                  </p>
                  <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.58rem', color:'var(--text3)' }}>
                    {stu.curso || 'Desenvolvimento de Sistemas'}{stu.turma ? ` · ${stu.turma}` : ''}
                  </p>
                </div>

                {/* Presenças */}
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <p style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'1.6rem', color:'var(--v)', lineHeight:1 }}>
                    {stu.presencas}
                  </p>
                  <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.52rem', color:'var(--text3)' }}>
                    {stu.presencas === 1 ? 'presença' : 'presenças'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer>
        <span><span className="logo-sm">l<span>0</span>bby-e</span> · ETE Cícero Dias</span>
        <span>desenvolvimento de sistemas · recife, pe</span>
      </footer>
    </div>
  )
}