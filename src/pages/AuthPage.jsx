import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  
  const { login, register, isLoading, error, setError, user } = useAuth()
  const navigate = useNavigate()

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/')
  }, [user, navigate])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (error) setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isLogin) {
      await login(formData.email, formData.password)
    } else {
      if (!formData.name.trim()) {
        setError("Nama tidak boleh kosong")
        return
      }
      await register(formData.name, formData.email, formData.password)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-container rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary-container rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-container text-on-primary text-3xl shadow-lg mb-4">
            ➗
          </div>
          <h1 className="text-3xl font-headline font-bold text-on-surface">MathQuest</h1>
          <p className="text-on-surface-variant text-sm mt-1">Petualangan matematika menantimu!</p>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-[0_8px_30px_rgba(45,42,38,0.08)] border border-surface-variant/20">
          {/* Tab Switcher */}
          <div className="flex p-1 bg-surface-variant/20 rounded-xl mb-6 relative">
            <div className="flex-1 text-center relative z-10">
              <button
                onClick={() => setIsLogin(true)}
                className={`w-full py-2 text-sm font-semibold transition-colors ${isLogin ? 'text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Masuk
              </button>
            </div>
            <div className="flex-1 text-center relative z-10">
              <button
                onClick={() => setIsLogin(false)}
                className={`w-full py-2 text-sm font-semibold transition-colors ${!isLogin ? 'text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Daftar
              </button>
            </div>
            <motion.div
              className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm"
              initial={false}
              animate={{ x: isLogin ? 0 : '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scaleY: 0 }}
                  animate={{ opacity: 1, height: 'auto', scaleY: 1 }}
                  exit={{ opacity: 0, height: 0, scaleY: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-xs font-semibold text-on-surface mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-surface text-sm px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-on-surface-variant/50"
                    placeholder="Contoh: Budi Santoso"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-surface text-sm px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-on-surface-variant/50"
                placeholder="email@sekolah.edu"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">Kata Sandi</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-surface text-sm px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-on-surface-variant/50"
                placeholder="Min. 6 karakter"
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-error font-medium bg-error-container/20 px-3 py-2 rounded-lg"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full bg-primary text-on-primary font-bold py-3.5 rounded-xl shadow-[0_4px_14px_rgba(45,42,38,0.1)] hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center"
            >
              {isLoading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full" />
              ) : (
                isLogin ? 'Masuk' : 'Daftar'
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
