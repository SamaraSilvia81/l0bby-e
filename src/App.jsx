import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Login       from './pages/Login'
import FirstAccess from './pages/FirstAccess'
import Home        from './pages/Home'
import Details     from './pages/Details'
import Profile     from './pages/Profile'
import Admin       from './pages/Admin'

export const ThemeContext = createContext({ isDark: true, toggle: () => {} })
export const useTheme = () => useContext(ThemeContext)

function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-mono)', fontSize:'0.6rem', color:'var(--text3)', letterSpacing:'0.1em' }}>
      // loading...
    </div>
  )
  if (!user) return <Navigate to="/login" state={{ from: window.location.pathname }} replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/home" replace />
  return children
}

// Rota exclusiva para o fluxo de primeiro acesso
function FirstAccessRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-mono)', fontSize:'0.6rem', color:'var(--text3)' }}>
      // loading...
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (user.firstAccess !== true) return <Navigate to="/home" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login"           element={user ? <Navigate to={user.role==='admin'?'/admin':'/home'} replace /> : <Login />} />
      <Route path="/primeiro-acesso" element={<FirstAccessRoute><FirstAccess /></FirstAccessRoute>} />
      <Route path="/home"            element={<Home />} />
      <Route path="/details/:id"     element={<Details />} />
      <Route path="/profile"         element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/admin"           element={<PrivateRoute adminOnly><Admin /></PrivateRoute>} />
      <Route path="*"                element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('lobby-theme')
    return saved !== null ? saved === 'dark' : true
  })
  useEffect(() => {
    document.body.classList.toggle('light', !isDark)
    localStorage.setItem('lobby-theme', isDark ? 'dark' : 'light')
  }, [isDark])
  return (
    <ThemeContext.Provider value={{ isDark, toggle: () => setIsDark(d => !d) }}>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeContext.Provider>
  )
}
