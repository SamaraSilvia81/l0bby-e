import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useSound } from '../hooks/useSound'

export default function FirstAccess() {
  const { user, changePassword } = useAuth()
  const { toast } = useToast()
  const { play }  = useSound()
  const navigate  = useNavigate()

  const [nova,    setNova]    = useState('')
  const [confirma, setConfirma] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (nova.length < 6) {
      play('error'); toast('A senha precisa ter pelo menos 6 caracteres.', 'error'); return
    }
    if (nova !== confirma) {
      play('error'); toast('As senhas não coincidem.', 'error'); return
    }
    play('click')
    setLoading(true)
    await changePassword(nova)
    play('success')
    toast('Senha definida! Bem-vindo(a) ao l0bby-E.', 'success')
    navigate('/home', { replace: true })
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav>
        <span className="nav-logo" style={{ cursor: 'default' }}>
          l<span className="z">0</span>bby
          <sup style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.42em', color: 'var(--o)', verticalAlign: 'super' }}>-E</sup>
        </span>
      </nav>

      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            border: '1px solid var(--v)', padding: '4px 12px',
            marginBottom: '1.75rem',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--v)', display: 'inline-block', animation: 'pulse 1.4s infinite' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--v-pale)', textTransform: 'uppercase' }}>
              primeiro acesso
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2.2rem', color: 'var(--text)', lineHeight: 1.1, marginBottom: '0.5rem' }}>
            DEFINA SUA<br />
            <span style={{ color: 'var(--v)' }}>SENHA</span>
          </h1>

          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text3)', lineHeight: 1.8, marginBottom: '2rem' }}>
            Olá, <span style={{ color: 'var(--v-pale)' }}>{user?.name?.split(' ')[0] || 'aluno'}</span>. Sua conta foi criada pela coordenação.<br />
            Crie uma senha pessoal para continuar.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label className="input-label">nova senha</label>
              <input
                className="input"
                type="password"
                placeholder="mín. 6 caracteres"
                value={nova}
                onChange={e => setNova(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="input-label">confirmar senha</label>
              <input
                className="input"
                type="password"
                placeholder="repita a senha"
                value={confirma}
                onChange={e => setConfirma(e.target.value)}
                required
              />
              {nova && confirma && nova !== confirma && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--danger)', marginTop: 4, display: 'block' }}>
                  // senhas não coincidem
                </span>
              )}
              {nova && confirma && nova === confirma && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--success)', marginTop: 4, display: 'block' }}>
                  ✓ senhas coincidem
                </span>
              )}
            </div>

            {/* Requisitos */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '0.85rem 1rem' }}>
              <span className="tech-label" style={{ marginBottom: '0.5rem' }}>requisitos</span>
              {[
                { ok: nova.length >= 6,               txt: 'mínimo 6 caracteres' },
                { ok: nova === confirma && nova !== '', txt: 'senhas coincidem' },
              ].map(({ ok, txt }) => (
                <div key={txt} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: ok ? 'var(--success)' : 'var(--text3)', marginTop: 4 }}>
                  <span>{ok ? '✓' : '○'}</span>
                  <span>{txt}</span>
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="btn btn-v btn-full"
              style={{ padding: '11px', marginTop: '0.25rem' }}
              disabled={loading || nova.length < 6 || nova !== confirma}
              onMouseEnter={() => play('hover')}
            >
              {loading ? '// salvando...' : 'confirmar senha →'}
            </button>
          </form>
        </div>
      </div>

      <footer>
        <span><span className="logo-sm">l<span>0</span>bby-e</span> · ETE Cícero Dias</span>
        <span>desenvolvimento de sistemas · recife, pe</span>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}
