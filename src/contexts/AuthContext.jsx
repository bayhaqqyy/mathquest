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
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (token) localStorage.setItem('mathquest_token', token)
    else localStorage.removeItem('mathquest_token')
  }, [token])

  // Fetch actual user data from DB if token exists on mount
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setIsLoading(false)
        return
      }
      try {
        const response = await fetch('/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          setUser(data.data)
        } else {
          // Token invalid or expired
          setToken(null)
          setUser(null)
        }
      } catch (err) {
        console.warn("Backend offline, unable to fetch user profile")
      } finally {
        setIsLoading(false)
      }
    }
    fetchMe()
  }, [token])

  const login = async (email, password) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/login', {
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
      setError(err.message === 'Failed to fetch' ? "Server backend tidak merespons" : err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name, email, password) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/register', {
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
      setError(err.message === 'Failed to fetch' ? "Server backend tidak merespons" : err.message)
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
