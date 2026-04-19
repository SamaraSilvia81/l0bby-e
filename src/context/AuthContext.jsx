import { createContext, useContext, useState, useEffect } from 'react'
import { DB } from '../db/localDB'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = sessionStorage.getItem('lobby_session')
    if (stored) {
      const student = DB.getStudentById(stored)
      if (student) setUser(student)
    }
    setLoading(false)
  }, [])

  const login = (matricula, pass) => {
    const student = DB.getStudentByMat(matricula)
    if (!student)              return { ok: false, msg: 'Matrícula não encontrada.' }
    if (student.pass !== pass) return { ok: false, msg: 'Senha incorreta.' }
    sessionStorage.setItem('lobby_session', student.id)
    setUser(student)
    return { ok: true }
  }

  const logout = () => {
    sessionStorage.removeItem('lobby_session')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user, login, logout, loading,
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
