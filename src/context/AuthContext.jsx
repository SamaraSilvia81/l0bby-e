import { createContext, useContext, useState, useEffect } from 'react'
import { DB } from '../db/firebaseDB'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = sessionStorage.getItem('lobby_session')
    if (stored) {
      DB.getStudentById(stored)
        .then(student => { if (student) setUser(student) })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (matricula, pass) => {
    const student = await DB.getStudentByMat(matricula)
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
