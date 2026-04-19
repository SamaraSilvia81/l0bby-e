import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useSound } from '../hooks/useSound'

export default function Login() {
  const { login } = useAuth()
  const { toast } = useToast()
  const { play } = useSound()
  const navigate = useNavigate()
  const [mat, setMat]   = useState('')
  const [pass, setPass] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault(); play('click'); setLoading(true)
    setTimeout(() => {
      const result = login(mat.trim(), pass.trim())
      if (result.ok) {
        play('success'); toast('Acesso concedido!', 'success')
        navigate(mat.startsWith('COORD') ? '/admin' : '/home')
      } else {
        play('error'); toast(result.msg, 'error')
      }
      setLoading(false)
    }, 350)
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      {/* Navbar simplificada com botão voltar */}
      <nav>
        <span className="nav-logo" style={{ cursor:'default' }}>
          l<span className="z">0</span>bby<sup style={{ fontFamily:'var(--font-mono)', fontWeight:700, fontSize:'0.42em', color:'var(--o)', verticalAlign:'super' }}>-E</sup>
        </span>
        <div className="nav-links">
          <button className="btn btn-ghost btn-sm"
            onClick={() => { play('nav'); navigate('/home') }}
            onMouseEnter={() => play('hover')}>
            ← voltar aos events
          </button>
        </div>
      </nav>

      <div className="login-wrap" style={{ flex:1 }}>
        <div className="login-left">
          <div className="hero-tag">ETE Cícero Dias · DS Portal</div>
          <div className="login-big-logo">
            l<span className="z">0</span>bby<br/>
            <span className="e">-SISTEMA DE EVENTS</span>
          </div>
          <p className="login-sub">
            Portal de inscrições, check-in e certificados para eventos técnicos do
            Curso Técnico em Desenvolvimento de Sistemas.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:7, marginTop:'0.5rem' }}>
            {[
              '✓ inscrição em palestras e workshops',
              '✓ confirmação de presença via check-in',
              '✓ geração de certificado digital',
              '✓ convide até 2 pessoas por event',
            ].map((item, i) => (
              <span key={i} style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text3)', letterSpacing:'0.04em' }}>
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="login-right">
          <span className="tech-label" style={{ marginBottom:'1.5rem' }}>protocolo_de_acesso</span>
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.1rem' }}>
            <div>
              <label className="input-label">matrícula</label>
              <input className="input" type="text" placeholder="2026-0041"
                value={mat} onChange={e => setMat(e.target.value)} required autoFocus />
            </div>
            <div>
              <label className="input-label">senha</label>
              <input className="input" type="password" placeholder="••••••••"
                value={pass} onChange={e => setPass(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-v btn-full" style={{ padding:'11px', marginTop:'0.25rem' }}
              disabled={loading} onMouseEnter={() => play('hover')}>
              {loading ? '// autenticando...' : 'autenticar →'}
            </button>
          </form>
          <div style={{ marginTop:'1.5rem', padding:'0.85rem 1rem', background:'var(--v-dim)', border:'1px solid var(--border)' }}>
            <span className="tech-label" style={{ marginBottom:'0.4rem' }}>credenciais_demo</span>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.62rem', color:'var(--text3)', lineHeight:2 }}>
              <span style={{ color:'var(--v-pale)' }}>aluno  </span>2026-0041 / 1234<br/>
              <span style={{ color:'var(--o)' }}>admin  </span>COORD-001 / admin
            </div>
          </div>
        </div>
      </div>

      <footer>
        <span><span className="logo-sm">l<span>0</span>bby-e</span> · ETE Cícero Dias</span>
        <span>desenvolvimento de sistemas · recife, pe</span>
      </footer>
    </div>
  )
}
