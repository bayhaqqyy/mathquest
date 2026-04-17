import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { topics, currentSession, userStats } from '../data/topics'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Selamat Pagi'
  if (hour < 17) return 'Selamat Siang'
  if (hour < 19) return 'Selamat Sore'
  return 'Selamat Malam'
}

const statsPills = [
  { emoji: '⚡', value: `${850} XP`, bg: 'bg-primary-container/20', text: 'text-on-primary-container', border: 'border-primary-container/10' },
  { emoji: '🔥', value: '12d Streak', bg: 'bg-primary-fixed/40', text: 'text-on-primary-fixed', border: 'border-primary-fixed/20' },
  { emoji: '💎', value: '25 Gems', bg: 'bg-tertiary-container/20', text: 'text-on-tertiary-container', border: 'border-tertiary-container/10' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function DashboardPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header & Greeting */}
      <header className="pt-8 px-6 pb-4">
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-container to-primary-fixed-dim flex items-center justify-center text-xl shadow-[0_2px_12px_rgba(45,42,38,0.08)] border border-surface-variant/50">
                👨‍🎓
              </div>
              <div className="absolute -bottom-1 -right-1 bg-surface-container-highest border-2 border-surface rounded-full w-4 h-4 flex items-center justify-center">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="font-headline font-semibold text-lg tracking-tight text-on-surface">
                {getGreeting()}, {userStats.name}! <span className="text-xl">👋</span>
              </h1>
              <span className="font-mono text-xs font-medium text-primary bg-primary/10 w-fit px-2 py-0.5 rounded-full mt-0.5">
                Level {userStats.level}
              </span>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors shadow-[0_2px_12px_rgba(45,42,38,0.04)]">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
        </motion.div>

        {/* Stats Pills */}
        <motion.div variants={itemVariants} className="flex gap-3 overflow-x-auto no-scrollbar -mx-6 px-6 pb-2">
          {statsPills.map((pill, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 ${pill.bg} ${pill.text} px-3 py-1.5 rounded-full whitespace-nowrap shadow-sm backdrop-blur-sm border ${pill.border}`}
            >
              <span className="text-lg">{pill.emoji}</span>
              <span className="font-mono font-semibold text-sm">{pill.value}</span>
            </motion.div>
          ))}
        </motion.div>
      </header>

      <main className="px-6 flex flex-col gap-8">
        {/* Lanjutkan Belajar */}
        <motion.section variants={itemVariants} className="flex flex-col gap-4">
          <h2 className="font-headline font-semibold text-lg tracking-tight text-on-surface">Lanjutkan Belajar</h2>
          <Link to={`/session/${currentSession.topicId}/linear`}>
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_4px_20px_rgba(45,42,38,0.06)] relative overflow-hidden group cursor-pointer transition-transform duration-200"
            >
              {/* Decorative element */}
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary-container/10 rounded-full blur-xl group-hover:bg-primary-container/20 transition-colors"></div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-2xl shadow-[0_2px_8px_rgba(45,42,38,0.04)]">
                    {currentSession.icon}
                  </div>
                  <div>
                    <h3 className="font-headline font-semibold text-base text-on-surface">{currentSession.topicName}</h3>
                    <p className="font-body text-sm text-on-surface-variant mt-0.5">{currentSession.skillName}</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">play_circle</span>
              </div>

              <div className="relative z-10 mt-6 flex flex-col gap-2">
                <div className="flex justify-between items-end mb-1">
                  <span className="font-mono text-xs font-semibold text-primary">{currentSession.remaining} soal lagi →</span>
                  <span className="font-mono text-xs font-bold text-on-surface-variant">{currentSession.progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-variant rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${currentSession.progress}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full relative"
                  >
                    <div className="absolute inset-0 progress-shimmer"></div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.section>

        {/* Pilih Topik */}
        <motion.section variants={itemVariants} className="flex flex-col gap-4">
          <h2 className="font-headline font-semibold text-lg tracking-tight text-on-surface">Pilih Topik</h2>
          <div className="grid grid-cols-2 gap-4">
            {topics.map((topic, index) => (
              <motion.div
                key={topic.id}
                variants={itemVariants}
                custom={index}
              >
                {topic.unlocked ? (
                  <Link to={`/topic/${topic.id}`}>
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="bg-surface-container-low rounded-xl p-4 shadow-[0_2px_12px_rgba(45,42,38,0.04)] flex flex-col gap-4 cursor-pointer hover:bg-surface-container transition-colors h-full"
                    >
                      <div className="text-2xl mb-1">{topic.icon}</div>
                      <div>
                        <h4 className="font-headline font-medium text-sm text-on-surface">{topic.name}</h4>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-mono text-[10px] text-on-surface-variant font-medium">{topic.progress}%</span>
                          <div className="h-1 w-12 bg-surface-variant rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${topic.progress}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 + index * 0.1 }}
                              className="h-full bg-primary rounded-full"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ) : (
                  <div className="bg-surface-container rounded-xl p-4 border border-outline-variant/15 flex flex-col gap-4 opacity-75 grayscale-[0.2] h-full">
                    <div className="flex justify-between items-start mb-1">
                      <div className="text-2xl text-on-surface-variant/50">{topic.icon}</div>
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant">lock</span>
                    </div>
                    <div>
                      <h4 className="font-headline font-medium text-sm text-on-surface-variant">{topic.name}</h4>
                      <div className="mt-2 font-mono text-[10px] text-outline">Level {topic.requiredLevel}+</div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>
    </motion.div>
  )
}
