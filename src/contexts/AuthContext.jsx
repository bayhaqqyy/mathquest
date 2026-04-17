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

  const applySessionStats = ({ totalProblems = 0, correctCount = 0, gainedXp = null } = {}) => {
    setUser(prev => {
      if (!prev) return prev

      const solvedBefore = prev.total_solved || 0
      const accuracyBefore = prev.total_accuracy || 0
      const solvedAfter = solvedBefore + totalProblems
      const pastCorrects = (accuracyBefore / 100) * solvedBefore
      const newAccuracy = solvedAfter > 0
        ? ((pastCorrects + correctCount) / solvedAfter) * 100
        : 0
      const xpGain = gainedXp ?? (correctCount * 25 + (correctCount === totalProblems ? 50 : 0))
      const xpAfter = (prev.xp || 0) + xpGain

      const nextUser = {
        ...prev,
        xp: xpAfter,
        level: Math.floor(xpAfter / 200) + 1,
        total_solved: solvedAfter,
        total_accuracy: newAccuracy,
      }

      localStorage.setItem('mathquest_user', JSON.stringify(nextUser))
      return nextUser
    })
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, error, login, register, logout, applySessionStats, setError }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
