import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export const TB_URL = import.meta.env.VITE_TB_URL 
const EMAIL_MAP = {
  'student@studenti.hr': import.meta.env.VITE_TB_ADMIN_USER 
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('tb_token') || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = useCallback(async (username, password) => {
    setLoading(true)
    setError(null)
    try {
      const mappedUsername = EMAIL_MAP[username.toLowerCase()]
      if (!mappedUsername) throw new Error('Nepoznat korisnički račun')

      const res = await fetch(`${TB_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: mappedUsername, password }),
      })
      if (!res.ok) throw new Error('Pogrešno korisničko ime ili lozinka')
      const data = await res.json()
      sessionStorage.setItem('tb_token', data.token)
      setToken(data.token)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem('tb_token')
    setToken(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
