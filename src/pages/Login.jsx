import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useSound } from '../hooks/useSound'
import { useTheme } from '../App'
import { DB } from '../db/firebaseDB'

export default function Login() {
  const { login } = useAuth()
  const { toast } = useToast()
  const { play } = useSound()
  const { isDark, toggle } = useTheme()
  const navigate = useNavigate()

  const [tab, setTab]     = useState('login')
  const [loading, setLoading] = useState(false)

  // login
  const [mat, setMat]   = useState('')
  const [pass, setPass] = useState('')

  // cadastro
  const [cNome, setCNome]       = useState('')
  const [cUser, setCUser]       = useState('')
  const [cMat,  setCMat]        = useState('')
  const [cSenha, setCSenha]     = useState('')
  const [cConfirm, setCConfirm] = useState('')
  const [cCurso, setCCurso]     = useState('Desenvolvimento de Sistemas')
  const [cTurma, setCTurma]     = useState('DS_MOD1_A')
  const [showPass, setShowPass]       = useState(false)
  const [showCPass, setShowCPass]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    play('click')
    setLoading(true)
    const result = await login(mat.trim(), pass.trim())
    if (result.ok) {
      play('success'); toast('Acesso concedido!', 'success')
      if (result.firstAccess) {
        navigate('/primeiro-acesso', { replace: true })
      } else {
        const stu = await DB.getStudentByLogin(mat.trim())
        const role = stu?.role || 'student'
        if (role === 'admin') navigate('/admin', { replace: true })
        else if (role === 'staff') navigate('/staff', { replace: true })
        else navigate('/home', { replace: true })
      }
    } else {
      play('error'); toast(result.msg, 'error')
    }
    setLoading(false)
  }

  const handleCadastro = async (e) => {
    e.preventDefault()
    play('click')
    if (cSenha !== cConfirm) { play('error'); toast('As senhas não coincidem.', 'error'); return }
    if (cSenha.length < 4)   { play('error'); toast('Senha deve ter pelo menos 4 caracteres.', 'error'); return }
    setLoading(true)
    try {
      if (!cUser.trim()) { play('error'); toast('Escolha um nome de usuário.', 'error'); setLoading(false); return }
      const existingUser = await DB.getStudentByUsername(cUser.toLowerCase().trim())
      if (existingUser) { play('error'); toast('Nome de usuário já em uso. Escolha outro.', 'error'); setLoading(false); return }
      const existing = await DB.getStudentByMat(cMat.trim())
      if (existing && cMat.trim()) { play('error'); toast('Matrícula já cadastrada.', 'error'); setLoading(false); return }
      await DB.createStudent({ name: cNome.trim(), username: cUser.toLowerCase().trim(), matricula: cMat.trim(), pass: cSenha, turma: cTurma, curso: cCurso, firstAccess: false })
      play('success'); toast('Cadastro realizado! Faça login.', 'success')
      setTab('login'); setMat(cMat.trim())
      setCNome(''); setCUser(''); setCMat(''); setCSenha(''); setCConfirm('')
    } catch (err) {
      play('error'); toast('Erro ao cadastrar. Tente novamente.', 'error'); console.error(err)
    }
    setLoading(false)
  }

  const turmasByCurso = {
    'Desenvolvimento de Sistemas': ['DS_MOD1_A','DS_MOD1_B','DS_MOD3_A','DS_MOD3_B'],
    'Design Gráfico': ['DG_MOD_A','DG_MOD_B','DG_MOD_ANOS'],
  }

  const switchLabel = tab === 'login'
    ? { txt: 'Não tem conta?', cta: 'Criar conta', next: 'cadastro' }
    : { txt: 'Já tem conta?',  cta: 'Fazer login', next: 'login'    }

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      <nav>
        <span className="nav-logo" style={{ cursor:'default' }}>
          l<span className="z">0</span>bby<sup style={{ fontFamily:'var(--font-mono)', fontWeight:700, fontSize:'0.42em', color:'var(--o)', verticalAlign:'super' }}>-E</sup>
        </span>
        <div className="nav-links">
          <button className="theme-btn" onClick={() => { play('click'); toggle() }} onMouseEnter={() => play('hover')}>
            {isDark ? '◑ claro' : '◐ escuro'}
          </button>
          <button className="btn btn-ghost btn-sm"
            onClick={() => { play('nav'); navigate('/home') }}
            onMouseEnter={() => play('hover')}>
            ← voltar aos events
          </button>
        </div>
      </nav>

      <div style={{ position:'fixed', width:500, height:500, top:'calc(50vh - 250px)', left:-200, background:'radial-gradient(circle, rgba(143,0,255,0.08) 0%, transparent 70%)', pointerEvents:'none', zIndex:-1 }} />
      <div style={{ position:'fixed', width:400, height:400, top:'calc(50vh - 200px)', right:-150, background:'radial-gradient(circle, rgba(255,121,39,0.06) 0%, transparent 70%)', pointerEvents:'none', zIndex:-1 }} />

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
          <span className="tech-label" style={{ marginBottom:'1.5rem' }}>
            {tab === 'login' ? 'protocolo_de_acesso' : 'novo_cadastro'}
          </span>

          {tab === 'login' ? (
            <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:'1.1rem' }}>
              <div>
                <label className="input-label">usuário ou matrícula</label>
                <input className="input" type="text" placeholder="sams81"
                  value={mat} onChange={e => setMat(e.target.value)} required autoFocus />
              </div>
              <div>
                <label className="input-label">senha</label>
                <div style={{ position:'relative' }}>
                  <input className="input" type={showPass ? 'text' : 'password'} placeholder="••••••••"
                    value={pass} onChange={e => setPass(e.target.value)} required style={{ paddingRight:'2.5rem', width:'100%', boxSizing:'border-box' }} />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    style={{ position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text3)', fontSize:'0.8rem', lineHeight:1 }}>
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-v btn-full" style={{ padding:'11px', marginTop:'0.25rem' }}
                disabled={loading} onMouseEnter={() => play('hover')}>
                {loading ? '// autenticando...' : 'autenticar →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleCadastro} style={{ display:'flex', flexDirection:'column', gap:'1.1rem' }}>
              <div>
                <label className="input-label">nome completo</label>
                <input className="input" type="text" placeholder="Seu nome completo"
                  value={cNome} onChange={e => setCNome(e.target.value)} required autoFocus />
              </div>
              <div>
                <label className="input-label">matrícula</label>
                <input className="input" type="text" placeholder="2026-0041"
                  value={cMat} onChange={e => setCMat(e.target.value)} required />
              </div>
              <div>
                <label className="input-label">senha</label>
                <div style={{ position:'relative' }}>
                  <input className="input" type={showCPass ? 'text' : 'password'} placeholder="mín. 4 caracteres"
                    value={cSenha} onChange={e => setCSenha(e.target.value)} required style={{ paddingRight:'2.5rem', width:'100%', boxSizing:'border-box' }} />
                  <button type="button" onClick={() => setShowCPass(v => !v)}
                    style={{ position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text3)', fontSize:'0.8rem', lineHeight:1 }}>
                    {showCPass ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
              <div>
                <label className="input-label">confirmar senha</label>
                <div style={{ position:'relative' }}>
                  <input className="input" type={showConfirm ? 'text' : 'password'} placeholder="••••••••"
                    value={cConfirm} onChange={e => setCConfirm(e.target.value)} required style={{ paddingRight:'2.5rem', width:'100%', boxSizing:'border-box' }} />
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    style={{ position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text3)', fontSize:'0.8rem', lineHeight:1 }}>
                    {showConfirm ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-v btn-full" style={{ padding:'11px', marginTop:'0.25rem' }}
                disabled={loading} onMouseEnter={() => play('hover')}>
                {loading ? '// cadastrando...' : 'cadastrar →'}
              </button>
            </form>
          )}

          {/* troca de tab — só um link embaixo */}
          <div style={{ marginTop:'1.25rem', textAlign:'center', fontFamily:'var(--font-mono)', fontSize:'0.6rem', color:'var(--text3)' }}>
            {switchLabel.txt}{' '}
            <span style={{ color:'var(--v)', cursor:'pointer', textDecoration:'underline' }}
              onClick={() => { setTab(switchLabel.next); play('nav') }}>
              {switchLabel.cta}
            </span>
          </div>

          {tab === 'login' && (
            <div style={{ marginTop:'1.25rem', padding:'0.85rem 1rem', background:'var(--v-dim)', border:'1px solid var(--border)' }}>
              <span className="tech-label" style={{ marginBottom:'0.4rem' }}>acesso</span>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.62rem', color:'var(--text3)', lineHeight:2 }}>
                <span style={{ color:'var(--o)' }}>admin  </span>COORD-001 / (sua senha)<br/>
                <span style={{ color:'var(--v-pale)' }}>aluno  </span>matrícula / senha inicial
              </div>
            </div>
          )}
        </div>
      </div>

      <footer>
        <span><span className="logo-sm">l<span>0</span>bby-e</span> · ETE Cícero Dias</span>
        <span>desenvolvimento de sistemas · recife, pe</span>
      </footer>
    </div>
  )
}