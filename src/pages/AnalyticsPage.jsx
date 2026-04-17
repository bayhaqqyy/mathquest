import { motion } from 'framer-motion'
import { weeklyActivity, topicStrengths } from '../data/problems'
import { userStats } from '../data/topics'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

const quickStats = [
  { label: 'Akurasi', value: `${userStats.accuracy}%`, emoji: '🎯', bg: 'bg-secondary-container/20' },
  { label: 'Soal Dijawab', value: `${userStats.totalSolved}`, emoji: '📝', bg: 'bg-primary-fixed/20' },
  { label: 'Streak', value: `${userStats.streak} Hari`, emoji: '🔥', bg: 'bg-primary-container/20' },
]

export default function AnalyticsPage() {
  const maxActivity = Math.max(...weeklyActivity.map(d => d.count), 1)

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <header className="pt-8 px-6 pb-6">
        <motion.div variants={itemVariants}>
          <h1 className="font-headline font-bold text-2xl text-on-surface mb-1">Statistik</h1>
          <p className="text-sm text-on-surface-variant">Pantau progres belajarmu</p>
        </motion.div>
      </header>

      <main className="px-6 flex flex-col gap-6">
        {/* Quick Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
          {quickStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className={`${stat.bg} rounded-xl p-4 text-center border border-surface-variant/10`}
            >
              <span className="text-2xl block mb-1">{stat.emoji}</span>
              <p className="font-mono font-bold text-lg text-on-surface">{stat.value}</p>
              <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Weekly Activity */}
        <motion.section variants={itemVariants} className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_2px_12px_rgba(45,42,38,0.06)] border border-surface-variant/10">
          <h2 className="font-headline font-semibold text-sm text-on-surface mb-4">Aktivitas Mingguan</h2>
          <div className="flex items-end justify-between gap-2 h-32">
            {weeklyActivity.map((day, i) => {
              const height = day.count > 0 ? (day.count / maxActivity) * 100 : 4
              const isToday = i === 3
              return (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.6, delay: 0.3 + i * 0.08, ease: 'easeOut' }}
                    className={`w-full rounded-t-lg min-h-[4px] ${
                      isToday
                        ? 'bg-primary-container'
                        : day.count > 0
                        ? 'bg-primary/60'
                        : 'bg-surface-variant/40'
                    }`}
                  />
                  <span className={`text-[10px] font-medium ${
                    isToday ? 'text-primary font-bold' : 'text-on-surface-variant'
                  }`}>
                    {day.day}
                  </span>
                </div>
              )
            })}
          </div>
        </motion.section>

        {/* Topic Strengths */}
        <motion.section variants={itemVariants} className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_2px_12px_rgba(45,42,38,0.06)] border border-surface-variant/10">
          <h2 className="font-headline font-semibold text-sm text-on-surface mb-4">Kekuatan Topik</h2>
          <div className="space-y-4">
            {topicStrengths.map((topic, i) => (
              <div key={topic.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-on-surface font-medium">{topic.name}</span>
                  <span className="font-mono text-[10px] font-bold text-on-surface-variant">{topic.strength}%</span>
                </div>
                <div className="h-2 bg-surface-variant/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${topic.strength}%` }}
                    transition={{ duration: 0.8, delay: 0.5 + i * 0.1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: topic.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Recommendation */}
        <motion.section variants={itemVariants}>
          <div className="bg-primary-fixed/15 rounded-xl p-4 border border-primary-fixed/20 flex items-center gap-3">
            <span className="text-2xl">💡</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-on-surface">Rekomendasi</p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Topik terlemahmu: <span className="font-semibold text-primary">Probabilitas</span>. Coba latihan di topik ini!
              </p>
            </div>
            <span className="material-symbols-outlined text-primary text-[20px]">arrow_forward</span>
          </div>
        </motion.section>
      </main>
    </motion.div>
  )
}
