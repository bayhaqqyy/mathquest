import { useLocation, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { markSkillCompleted } from '../utils/skillProgress'
import { useAuth } from '../contexts/AuthContext'

// Confetti component
function Confetti() {
  const colors = ['#e8913a', '#006c44', '#6d4ea2', '#ffb778', '#93f7bf', '#d4bbff']
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 0.8,
    duration: 1 + Math.random() * 1.5,
    size: 4 + Math.random() * 6,
    rotation: Math.random() * 360,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0 }}
          animate={{ y: '110vh', opacity: 0, rotate: p.rotation + 720 }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.size > 7 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  )
}

export default function SummaryPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { applySessionStats } = useAuth()
  const [showConfetti, setShowConfetti] = useState(true)
  const [statsApplied, setStatsApplied] = useState(false)

  const {
    results = [],
    topicId = 'aljabar',
    skillId = 'linear',
    topicName = 'Aljabar',
    skillName = 'Persamaan Linear',
    totalProblems = 5
  } = location.state || {}

  const correctCount = results.filter(r => r.correct).length
  const accuracy = totalProblems > 0 ? Math.round((correctCount / totalProblems) * 100) : 0
  const isPerfect = accuracy === 100
  const sessionStatsKey = `mathquest_session_stats_${topicId}_${skillId}_${results.map(item => item.id).join('_')}_${correctCount}_${totalProblems}`

  const [backendXp, setBackendXp] = useState(null)

  useEffect(() => {
    markSkillCompleted(topicId, skillId)
    if (localStorage.getItem(sessionStatsKey)) {
      setStatsApplied(true)
      return undefined
    }
    localStorage.setItem(sessionStatsKey, '1')

    // Show confetti
    const timer = setTimeout(() => setShowConfetti(false), 3000)

    // Submit session result to Backend
    const submitResult = async () => {
      const token = localStorage.getItem('mathquest_token')
      let gainedXp = null

      if (token) {
        try {
          const timeSpent = results.reduce((acc, curr) => acc + (curr.timeSpent || 0), 0) / 1000 // Convert total ms to s
          const res = await fetch('/api/sessions/result', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              topic: topicId,
              total_problems: totalProblems,
              correct_count: correctCount,
              time_spent: Math.round(timeSpent) || 60
            })
          })
          if (res.ok) {
            const data = await res.json()
            gainedXp = data.gained_xp
            setBackendXp(gainedXp)
          }
        } catch (err) {
          console.error("Failed to sync session with server", err)
        }
      }

      applySessionStats({ totalProblems, correctCount, gainedXp })
      setStatsApplied(true)
    }

    if (!statsApplied) submitResult()
    return () => clearTimeout(timer)
  }, [results, topicId, skillId, totalProblems, correctCount, applySessionStats, statsApplied, sessionStatsKey])

  const displayXp = backendXp !== null ? backendXp : (correctCount * 25 + (accuracy >= 80 ? 50 : 0))

  const stats = [
    { label: 'Benar', value: `${correctCount}/${totalProblems}`, emoji: '✅' },
    { label: 'XP', value: `+${displayXp}`, emoji: '⚡' },
    { label: 'Akurasi', value: `${accuracy}%`, emoji: '🎯' },
  ]

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient Background Blobs (Abstract CSS Shapes) */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-10 left-10 w-12 h-12 bg-primary-container rounded-full blur-xl"></div>
        <div className="absolute top-1/4 right-1/4 w-16 h-16 bg-tertiary-container rounded-full blur-xl"></div>
        <div className="absolute bottom-1/3 left-1/4 w-20 h-20 bg-secondary-container rounded-full blur-xl"></div>
      </div>

      {showConfetti && accuracy >= 60 && <Confetti />}

      {/* Main Content Canvas */}
      <main className="w-full max-w-sm z-10 flex flex-col items-center text-center space-y-8 animate-[fade-in_0.5s_ease-out]">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="text-6xl mb-6 inline-block transform hover:scale-110 transition-transform duration-300"
          >
            {isPerfect ? '🏆' : accuracy >= 80 ? '🎉' : accuracy >= 60 ? '👍' : '💪'}
          </motion.div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">Sesi Selesai!</h1>
          <p className="text-on-surface-variant text-lg">Kerja bagus! Mari kita lihat perkembanganmu.</p>
        </motion.div>

        {/* Metric Pills (Bento Grid Style) */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-3 w-full"
        >
          {/* Benar */}
          <div className="bg-surface-container-low rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden group hover:bg-surface-container transition-colors">
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary-container rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <span className="material-symbols-outlined text-secondary mb-1">check_circle</span>
            <span className="font-bold text-lg text-secondary">{correctCount}/{totalProblems}</span>
            <span className="text-xs text-on-surface-variant font-medium">Benar</span>
          </div>

          {/* XP */}
          <div className="bg-surface-container-low rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden group hover:bg-surface-container transition-colors">
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-container rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <span className="material-symbols-outlined text-primary mb-1">stars</span>
            <span className="font-bold text-lg text-primary">+{displayXp}</span>
            <span className="text-xs text-on-surface-variant font-medium">XP</span>
          </div>

          {/* Waktu (Simulated static for now as per HTML, or dynamic if time log tracked later) */}
          <div className="bg-surface-container-low rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden group hover:bg-surface-container transition-colors">
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-surface-variant rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <span className="material-symbols-outlined text-on-surface-variant mb-1">timer</span>
            <span className="font-mono font-bold text-lg text-on-surface">4:32</span>
            <span className="text-xs text-on-surface-variant font-medium">Waktu</span>
          </div>
        </motion.div>

        {/* Progress Card */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full bg-surface-container-low rounded-xl p-6 text-left relative overflow-hidden shadow-[0_4px_20px_rgba(45,42,38,0.06)]"
        >
          <div className="flex justify-between items-end mb-3">
            <div>
              <h3 className="font-semibold text-lg text-on-surface">{topicName}</h3>
              <p className="text-sm text-on-surface-variant mt-1">Penguasaan Bab</p>
            </div>
            <div className="text-right">
              <span className="font-bold text-xl text-primary">85%</span>
              <span className="text-xs font-bold text-secondary bg-secondary-container px-2 py-1 rounded-full ml-2">+13%</span>
            </div>
          </div>
          <div className="h-3 w-full bg-surface-variant rounded-full overflow-hidden mt-4 flex">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: '72%' }}
               transition={{ duration: 1, ease: 'easeOut', delay: 0.8 }}
               className="h-full bg-primary"
            ></motion.div>
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: '13%' }}
               transition={{ duration: 0.5, ease: 'easeOut', delay: 1.8 }}
               className="h-full bg-primary-container animate-pulse"
            ></motion.div>
          </div>
        </motion.div>

        {/* Badge Section (Glassmorphism) */}
        {accuracy >= 80 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, type: 'spring' }}
            className="w-full bg-tertiary-container/30 backdrop-blur-[12px] rounded-xl p-5 border border-tertiary-container/50 shadow-[0_4px_20px_rgba(45,42,38,0.06)] flex items-center space-x-4"
          >
            <div className="w-14 h-14 bg-tertiary rounded-full flex items-center justify-center shadow-lg shrink-0">
              <span className="material-symbols-outlined text-on-tertiary text-3xl">emoji_events</span>
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-tertiary uppercase tracking-wider mb-1">🏅 Badge Baru!</p>
              <h4 className="font-bold text-on-tertiary-container leading-tight">Ahli {skillName}</h4>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="w-full flex flex-col space-y-3 mt-6"
        >
          <button 
             onClick={() => navigate(`/topic/${topicId}`)}
             className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold py-4 rounded-full shadow-[0_4px_20px_rgba(45,42,38,0.08)] hover:scale-[0.98] transition-transform duration-200 flex items-center justify-center space-x-2"
          >
            <span>Lanjut Belajar</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
          <Link to="/" className="w-full block">
             <button className="w-full bg-transparent text-on-surface-variant font-semibold py-4 rounded-full hover:bg-surface-container-low transition-colors duration-200">
                  Kembali ke Beranda
             </button>
          </Link>
        </motion.div>
      </main>
    </div>
  )
}
