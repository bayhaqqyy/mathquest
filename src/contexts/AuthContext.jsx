import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('mathquest_user')
    return saved ? JSON.parse(saved) : null
  })
  
  const [token, setToken] = useState(() => {
    return localStorage.getItem('mathquest_token') || null
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (user) localStorage.setItem('mathquest_user', JSON.stringify(user))
    else localStorage.removeItem('mathquest_user')

    if (token) localStorage.setItem('mathquest_token', token)
    else localStorage.removeItem('mathquest_token')
  }, [user, token])

  const login = async (email, password) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Login gagal')
      }
      
      const data = await response.json()
      setToken(data.token)
      setUser(data.user)
      navigate('/')
    } catch (err) {
      console.warn("Backend might be offline, using fallback auth:", err)
      // Fallback for Demo Purposes if Go backend is not running yet
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        const dummyUser = { id: 1, name: "Siswa MathQuest", email: email, level: 1, xp: 0, streak: 0 }
        setUser(dummyUser)
        setToken("dummy_token_123")
        navigate('/')
      } else {
        setError(err.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name, email, password) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })
      
      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Gagal mendaftar')
      }
      
      // Auto login after register
      await login(email, password)
    } catch (err) {
      console.warn("Backend might be offline, using fallback auth:", err)
      // Fallback
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        await login(email, password)
      } else {
        setError(err.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    navigate('/auth')
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, error, login, register, logout, setError }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
