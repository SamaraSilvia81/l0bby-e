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

  const login = async (login, pass) => {
    // Aceita username, matrícula ou COORD-xxx
    const student = await DB.getStudentByLogin(login)
    if (!student)              return { ok: false, msg: 'Usuário não encontrado.' }
    if (student.pass !== pass) return { ok: false, msg: 'Senha incorreta.' }
    sessionStorage.setItem('lobby_session', student.id)
    setUser(student)
    return { ok: true, firstAccess: student.firstAccess === true }
  }

  const changePassword = async (newPass) => {
    if (!user) return
    await DB.updateStudent(user.id, { pass: newPass, firstAccess: false })
    setUser(u => ({ ...u, pass: newPass, firstAccess: false }))
  }

  const logout = () => {
    sessionStorage.removeItem('lobby_session')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user, setUser, login, logout, loading, changePassword,
      isAdmin: user?.role === 'admin',
      isStaff: user?.role === 'staff',
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)