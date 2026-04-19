import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../App'
import { useSound } from '../hooks/useSound'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const { isDark, toggle } = useTheme()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { play } = useSound()
  const a = (p) => pathname === p ? 'nav-link active' : 'nav-link'

  return (
    <nav>
      <Link to="/home" className="nav-logo" onClick={() => play('nav')}>
        l<span className="z">0</span>bby<sup>-E</sup>
      </Link>
      <div className="nav-links">
        <Link to="/home"    className={a('/home')}    onClick={() => play('nav')}>events</Link>
        {user && !isAdmin && (
          <Link to="/profile" className={a('/profile')} onClick={() => play('nav')}>meu painel</Link>
        )}
        {isAdmin && (
          <Link to="/admin" className={a('/admin')} onClick={() => play('nav')}>coordenação</Link>
        )}
        <button className="theme-btn" onClick={() => { play('click'); toggle() }}
          onMouseEnter={() => play('hover')}>
          {isDark ? '◑ claro' : '◐ escuro'}
        </button>
        {user ? (
          <>
            <span className="nav-mat">{user.matricula}</span>
            <button className="btn btn-ghost btn-sm"
              onClick={() => { play('click'); logout(); navigate('/home') }}
              onMouseEnter={() => play('hover')}>
              sair
            </button>
          </>
        ) : (
          <button className="btn btn-v btn-sm"
            onClick={() => { play('click'); navigate('/login') }}
            onMouseEnter={() => play('hover')}>
            entrar →
          </button>
        )}
      </div>
    </nav>
  )
}
