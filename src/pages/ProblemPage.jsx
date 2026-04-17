import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useSettings } from '../contexts/SettingsContext'

// Custom Exit Confirmation Modal
function ExitModal({ isOpen, onConfirm, onCancel }) {
  // ... (unchanged)
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-6"
          onClick={onCancel}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-on-surface/30 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative bg-surface-container-lowest rounded-2xl p-6 w-full max-w-sm shadow-[0_8px_40px_rgba(45,42,38,0.15)] border border-surface-variant/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-error-container/30 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-[28px] text-error">logout</span>
              </div>
              <h3 className="font-headline font-semibold text-lg text-on-surface mb-2">Keluar dari Sesi?</h3>
              <p className="text-sm text-on-surface-variant">Progressmu di sesi ini akan hilang dan tidak bisa dikembalikan.</p>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onCancel}
                className="flex-1 py-3 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface font-medium text-sm hover:bg-surface-container-high transition-colors"
              >
                Lanjutkan
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onConfirm}
                className="flex-1 py-3 rounded-xl bg-error text-on-error font-semibold text-sm hover:bg-error/90 transition-colors shadow-lg shadow-error/20"
              >
                Ya, Keluar
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function ProblemPage() {
  const { topicId, skillId } = useParams()
  const navigate = useNavigate()
  const { settings, playSound } = useSettings()

  const totalProblems = 5 // Hardcoded 5 problems per session for production

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [hintsUsed, setHintsUsed] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [isCorrect, setIsCorrect] = useState(null)
  const [results, setResults] = useState([])
  const [startTime] = useState(Date.now())
  const [showExitModal, setShowExitModal] = useState(false)
  const [timeLeft, setTimeLeft] = useState(settings.timer ? 180 : null) // 3 minutes per problem if setting is ON
  
  // State for dynamic problems from Backend
  const [dynamicProblem, setDynamicProblem] = useState(null)
  const [isLoadingDynamic, setIsLoadingDynamic] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  const fetchDynamicProblem = async () => {
    setIsLoadingDynamic(true)
    setFetchError(null)
    try {
      // Trying to fetch from Golang Core Backend
      const response = await fetch('/api/problems/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: `${topicId}/${skillId}` })
      })
      
      if (!response.ok) throw new Error("Backend offline")
      const data = await response.json()
      setDynamicProblem(data)
    } catch (err) {
      console.warn("Failed to generate problem. Backend error:", err)
      setFetchError("Gagal terhubung ke Server AI. Pastikan layanan backend berjalan.")
    } finally {
      setIsLoadingDynamic(false)
    }
  }

  // Fetch on mount or when currentIndex changes
  useEffect(() => {
    fetchDynamicProblem()
    setAnswer('')
    setIsCorrect(null)
    setHintsUsed(0)
    setShowHint(false)
    if (settings.timer) setTimeLeft(180)
  }, [currentIndex, topicId, skillId, settings.timer])

  // Timer logic
  useEffect(() => {
    if (settings.timer && timeLeft !== null && timeLeft > 0 && isCorrect === null) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timerId)
    } else if (settings.timer && timeLeft === 0 && isCorrect === null) {
      // Time is up
      handleTimeUp()
    }
  }, [timeLeft, isCorrect, settings.timer])

  const problem = dynamicProblem
  const progress = ((currentIndex) / totalProblems) * 100

  const handleTimeUp = () => {
    setIsCorrect(false)
    playSound('error')
    setResults(prev => [...prev, { id: problem?.id, correct: false, hintsUsed, timeSpent: Date.now() - startTime }])
    setTimeout(() => {
      navigate(`/review/${topicId}/${skillId}`, {
        state: { problem, isCorrect: false, userAnswer: 'Waktu Habis', currentIndex, totalProblems, results: [...results, { id: problem?.id, correct: false, hintsUsed }], problemSet: null }
      })
    }, 1200)
  }

  const handleSubmit = () => {
    if ((!answer.trim() && timeLeft > 0) || !problem || isCorrect !== null) return
    const correct = answer.trim() === problem?.answer
    setIsCorrect(correct)
    
    // Play sound based on global setting
    playSound(correct ? 'success' : 'error')

    setResults(prev => [...prev, { id: problem?.id, correct, hintsUsed, timeSpent: Date.now() - startTime }])

    // Auto-advance after showing feedback
    setTimeout(() => {
      // Go to review page for this problem
      navigate(`/review/${topicId}/${skillId}`, {
        state: {
          problem,
          isCorrect: correct,
          userAnswer: answer,
          currentIndex,
          totalProblems,
          results: [...results, { id: problem?.id, correct, hintsUsed }],
          problemSet: null,
        },
      })
    }, 1200)
  }

  const handleHint = () => {
    if (problem?.hints && hintsUsed < problem.hints.length && isCorrect === null) {
      setHintsUsed(prev => prev + 1)
      setShowHint(true)
    }
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Exit Confirmation Modal */}
      <ExitModal
        isOpen={showExitModal}
        onConfirm={() => navigate('/')}
        onCancel={() => setShowExitModal(false)}
      />

      {/* Top Bar */}
      <header className="px-4 pt-6 pb-4 flex items-center gap-4 relative z-10">
        <button
          onClick={() => setShowExitModal(true)}
          className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-surface-container active:scale-95 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {settings.timer && timeLeft !== null && (
          <div className={`flex items-center gap-1 font-mono font-bold text-sm px-3 py-1.5 rounded-full border ${timeLeft <= 30 ? 'bg-error-container text-error border-error/30 animate-pulse' : 'bg-surface-container text-on-surface-variant border-surface-variant/30'}`}>
            <span className="material-symbols-outlined text-[16px]">timer</span>
            {formatTime(timeLeft)}
          </div>
        )}

        {/* Progress Bar */}
        <div className="flex-1">
          <div className="h-2 bg-surface-variant rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <span className="font-mono text-xs font-semibold text-on-surface-variant whitespace-nowrap">
          {currentIndex + 1}/{totalProblems}
        </span>
      </header>

      {/* Problem Content */}
      <main className="flex-1 px-6 flex flex-col">
        {isLoadingDynamic ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent flex items-center justify-center rounded-full animate-spin mb-4" />
            <h3 className="font-headline font-semibold text-lg text-on-surface">AI Sedang Meracik Soal...</h3>
            <p className="text-on-surface-variant text-sm mt-2">Menyesuaikan kesulitan untukmu.</p>
          </div>
        ) : fetchError ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <span className="material-symbols-outlined text-[64px] text-error mb-4">cloud_off</span>
            <h3 className="font-headline font-semibold text-xl text-error mb-2">Gagal Memuat Soal</h3>
            <p className="text-on-surface-variant text-sm mb-6 max-w-xs">{fetchError}</p>
            <button onClick={fetchDynamicProblem} className="px-6 py-3 bg-primary text-on-primary rounded-xl font-medium shadow-md">
              Coba Lagi
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col"
            >
              {/* Question */}
              <div className="mb-4 mt-4">
                <p className="text-on-surface-variant text-sm font-medium mb-4">{problem?.question || "Selesaikan persamaan berikut:"}</p>
                
                {/* Dynamic Graph from Matplotlib */}
                {problem?.graph && (
                  <div className="mb-4 rounded-xl overflow-hidden shadow-sm border border-surface-variant/20 flex justify-center bg-white p-2">
                    <img src={problem.graph} alt="Grafik" className="max-w-full h-auto object-contain max-h-48" />
                  </div>
                )}

                <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_20px_rgba(45,42,38,0.06)] border border-surface-variant/20">
                  <p className="font-mono text-xl font-semibold text-on-surface text-center tracking-wide">
                    {problem?.expression}
                  </p>
                </div>
              </div>

            {/* Hints */}
            <AnimatePresence>
              {showHint && hintsUsed > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="space-y-2">
                    {problem.hints.slice(0, hintsUsed).map((hint, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.15 }}
                        className="bg-primary-fixed/20 border border-primary-fixed/30 rounded-lg px-4 py-3"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-sm">💡</span>
                          <p className="text-sm text-on-surface font-mono">{hint}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Feedback */}
            <AnimatePresence>
              {isCorrect !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`mb-6 rounded-xl p-4 text-center font-headline font-semibold ${
                    isCorrect
                      ? 'bg-secondary-container/30 text-secondary border border-secondary/20'
                      : 'bg-error-container/30 text-error border border-error/20'
                  }`}
                >
                  {isCorrect ? '🎉 Benar!' : `❌ Jawaban yang benar: ${problem.answer}`}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Answer Input */}
            <div className="mb-4">
              <label className="text-sm font-medium text-on-surface-variant mb-2 block">Jawaban:</label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-on-surface-variant text-sm">x =</span>
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="..."
                    disabled={isCorrect !== null}
                    className="w-full pl-12 pr-4 py-3.5 bg-surface-container-lowest border border-outline-variant/40 rounded-xl font-mono text-lg text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pb-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleHint}
                disabled={hintsUsed >= problem.hints.length || isCorrect !== null}
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface-variant font-medium text-sm hover:bg-surface-container-high transition-colors disabled:opacity-40"
              >
                <span className="text-lg">💡</span>
                Hint {hintsUsed > 0 ? `(${hintsUsed}/${problem.hints.length})` : ''}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={!answer.trim() || isCorrect !== null}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-primary text-on-primary font-semibold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:shadow-none"
              >
                Jawab
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
        )}
      </main>
    </div>
  )
}
