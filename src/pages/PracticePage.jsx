import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { topics } from '../data/topics'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

// Simulated quick practice topics
const practiceCategories = [
  { id: 'daily', label: 'Latihan Harian', icon: '📅', desc: '5 soal campuran', color: 'primary' },
  { id: 'weak', label: 'Topik Terlemah', icon: '🎯', desc: 'Fokus di area yang perlu diperbaiki', color: 'error' },
  { id: 'review', label: 'Ulang Materi', icon: '🔄', desc: 'Soal dari topik yang sudah selesai', color: 'secondary' },
  { id: 'challenge', label: 'Tantangan', icon: '⚔️', desc: 'Soal level lanjut', color: 'tertiary' },
]

export default function PracticePage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <header className="pt-8 px-6 pb-6">
        <motion.div variants={itemVariants}>
          <h1 className="font-headline font-bold text-2xl text-on-surface mb-1">Latihan</h1>
          <p className="text-sm text-on-surface-variant">Pilih mode latihan yang kamu inginkan</p>
        </motion.div>
      </header>

      <main className="px-6 flex flex-col gap-6">
        {/* Practice Mode Cards */}
        <motion.section variants={itemVariants} className="space-y-3">
          {practiceCategories.map((cat, index) => (
            <motion.div
              key={cat.id}
              variants={itemVariants}
              custom={index}
            >
              <Link to={`/session/aljabar/linear`}>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_2px_12px_rgba(45,42,38,0.04)] flex items-center gap-4 cursor-pointer hover:bg-surface-container-low transition-colors border border-surface-variant/10"
                >
                  <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-2xl flex-shrink-0">
                    {cat.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-headline font-semibold text-sm text-on-surface">{cat.label}</h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">{cat.desc}</p>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant/40 text-[20px]">chevron_right</span>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.section>

        {/* Quick Topic Select */}
        <motion.section variants={itemVariants} className="flex flex-col gap-4">
          <h2 className="font-headline font-semibold text-lg text-on-surface">Pilih Topik</h2>
          <div className="grid grid-cols-3 gap-3">
            {topics.filter(t => t.unlocked).map((topic, index) => (
              <Link key={topic.id} to={`/topic/${topic.id}`}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-surface-container-low rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:bg-surface-container transition-colors text-center"
                >
                  <span className="text-2xl">{topic.icon}</span>
                  <span className="text-xs font-medium text-on-surface">{topic.name}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.section>
      </main>
    </motion.div>
  )
}
