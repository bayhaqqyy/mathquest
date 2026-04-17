import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { skillTrees } from '../data/skillTrees'

export default function ReviewPage() {
  const { topicId, skillId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { problem, isCorrect, userAnswer, currentIndex, totalProblems, results, problemSet } = location.state || {}
  const tree = skillTrees[topicId]
  const skill = tree?.skills.find(item => item.id === skillId)

  const [currentStep, setCurrentStep] = useState(0)
  const steps = problem?.steps || []

  if (!problem) {
    navigate('/')
    return null
  }

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleContinue = () => {
    const nextIndex = currentIndex + 1
    if (nextIndex < totalProblems) {
      // Go to next problem
      navigate(`/session/${topicId}/${skillId}`, {
        state: { startIndex: nextIndex, results, problemSet },
      })
    } else {
      // Session complete — go to summary
      navigate('/summary', {
        state: {
          results,
          topicId,
          skillId,
          topicName: problemSet?.topicName || tree?.name || topicId,
          skillName: problemSet?.skillName || skill?.name || skillId,
          totalProblems,
        },
      })
    }
  }

  const allStepsRevealed = currentStep >= steps.length - 1

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="px-6 pt-6 pb-4 border-b border-surface-variant/30">
        <div className="flex items-center justify-between">
          <h1 className="font-headline font-semibold text-lg text-on-surface">Pembahasan</h1>
          <span className="font-mono text-xs font-semibold text-on-surface-variant bg-surface-container px-3 py-1 rounded-full">
            Langkah {currentStep + 1}/{steps.length}
          </span>
        </div>
      </header>

      <main className="flex-1 px-6 py-6 flex flex-col">
        {/* Problem & Answer Status */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-[0_2px_12px_rgba(45,42,38,0.06)] border border-surface-variant/20">
            <p className="text-xs text-on-surface-variant font-medium mb-2">Soal:</p>
            <p className="font-mono text-lg font-semibold text-on-surface mb-3">{problem.expression}</p>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              isCorrect
                ? 'bg-secondary-container/30 text-secondary'
                : 'bg-error-container/40 text-error'
            }`}>
              {isCorrect ? '✅' : '❌'}
              <span>Jawaban kamu: <span className="font-mono font-bold">{userAnswer}</span></span>
              {isCorrect ? ' — Benar!' : ` — Jawaban: ${problem.answer}`}
            </div>
          </div>
        </motion.div>

        {/* Step Cards */}
        <div className="flex-1 space-y-3">
          <AnimatePresence>
            {steps.slice(0, currentStep + 1).map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className={`rounded-xl overflow-hidden border transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-surface-container-lowest border-primary-container/40 shadow-[0_4px_20px_rgba(232,145,58,0.1)]'
                    : 'bg-surface-container-low border-surface-variant/20'
                }`}
              >
                {/* Step Header */}
                <div className="px-4 py-3 flex items-center gap-3 border-b border-surface-variant/20">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    index < currentStep
                      ? 'bg-secondary/15 text-secondary'
                      : index === currentStep
                      ? 'bg-primary-container/20 text-primary'
                      : 'bg-surface-variant/30 text-on-surface-variant'
                  }`}>
                    {index < currentStep ? (
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <h3 className="font-headline font-semibold text-sm text-on-surface">{step.title}</h3>
                </div>

                {/* Step Body */}
                <div className="px-4 py-4">
                  <p className="text-sm text-on-surface-variant mb-3">{step.explanation}</p>
                  <div className="bg-surface-container rounded-lg px-4 py-3 border border-surface-variant/20">
                    <p className="font-mono text-base font-semibold text-on-surface text-center">
                      {step.math}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Action Button */}
        <div className="pt-6 pb-8">
          {!allStepsRevealed ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNextStep}
              className="w-full flex items-center justify-center gap-2 px-5 py-4 rounded-xl bg-primary text-on-primary font-semibold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors animate-pulse-glow"
            >
              Langkah Selanjutnya
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </motion.button>
          ) : (
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleContinue}
              className="w-full flex items-center justify-center gap-2 px-5 py-4 rounded-xl bg-secondary text-on-secondary font-semibold text-sm shadow-lg shadow-secondary/20 hover:bg-secondary/90 transition-colors"
            >
              {currentIndex + 1 < totalProblems ? 'Soal Berikutnya' : 'Lihat Hasil'}
              <span className="material-symbols-outlined text-[18px]">
                {currentIndex + 1 < totalProblems ? 'arrow_forward' : 'celebration'}
              </span>
            </motion.button>
          )}
        </div>
      </main>
    </div>
  )
}
