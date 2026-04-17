import { motion } from 'framer-motion'
import { topics } from '../data/topics'
import { useSettings } from '../contexts/SettingsContext'
import { useAuth } from '../contexts/AuthContext'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

// Achievements are dynamically generated in the component

export default function ProfilePage() {
  const completedTopics = topics.filter(t => t.progress >= 100).length
  const totalTopics = topics.length

  // Use global Settings Context
  const { settings, toggleSetting } = useSettings()
  
  // Auth context for logout
  const { logout, user } = useAuth()

  // Dynamic achievements based on User Model
  const achievements = []
  if (user) {
    if ((user.total_solved || 0) >= 1) achievements.push({ emoji: '🌱', label: 'Langkah Pertama', date: 'Mencoba 1 Soal' })
    if ((user.total_solved || 0) >= 50) achievements.push({ emoji: '🔥', label: 'Ahli Rajin', date: '50 Soal Selesai' })
    if ((user.total_solved || 0) >= 100) achievements.push({ emoji: '💎', label: 'Ratusan Terselesaikan', date: '100 Soal Selesai' })
    if ((user.total_accuracy || 0) >= 80 && (user.total_solved || 0) >= 10) achievements.push({ emoji: '🎯', label: 'Penembak Jitu', date: 'Akurasi 80%+' })
    if ((user.total_accuracy || 0) >= 95 && (user.total_solved || 0) >= 20) achievements.push({ emoji: '👑', label: 'Si Tak Terkalahkan', date: 'Akurasi 95%+' })
    if ((user.level || 0) >= 5) achievements.push({ emoji: '🌟', label: 'Si Cerdas', date: 'Mencapai Level 5' })
  }
  if (achievements.length === 0) {
    achievements.push({ emoji: '🚀', label: 'Mulai Perjalanan', date: 'Ayo belajar!' })
  }

  const settingsItems = [
    { id: 'notifications', type: 'toggle', icon: 'notifications', label: 'Notifikasi', desc: 'Pengingat belajar harian' },
    { id: 'timer', type: 'toggle', icon: 'timer', label: 'Timer Soal', desc: 'Batasi waktu 3 menit per soal' },
    { id: 'sound', type: 'toggle', icon: 'volume_up', label: 'Efek Suara', desc: 'Suara untuk benar/salah' },
    { id: 'dark_mode', type: 'toggle', icon: 'dark_mode', label: 'Mode Gelap', desc: 'Ubah tampilan aplikasi' },
    { id: 'help', type: 'link', icon: 'help', label: 'Bantuan', desc: 'FAQ & dukungan' },
    { id: 'info', type: 'link', icon: 'info', label: 'Tentang MathQuest', desc: 'Versi 1.0.0' },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="pb-20"
    >
      {/* Profile Header */}
      <header className="pt-8 px-6 pb-6">
        <motion.div variants={itemVariants} className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-container to-primary-fixed-dim flex items-center justify-center text-3xl shadow-[0_4px_20px_rgba(45,42,38,0.1)] border-2 border-surface-variant/30 mb-4 cursor-pointer hover:scale-105 transition-transform">
            👨‍🎓
          </div>
          <h1 className="font-headline font-bold text-xl text-on-surface">{user?.name || 'Siswa'}</h1>
          <span className="font-mono text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full mt-2">
            Level {user?.level || 1} • {user?.xp || 0} XP
          </span>
          <p className="text-xs text-on-surface-variant mt-2">
            Pelajar Antusias
          </p>
        </motion.div>

        {/* Stats Summary */}
        <motion.div variants={itemVariants} className="flex justify-center gap-8 mt-6">
          <div className="text-center">
            <p className="font-mono font-bold text-lg text-on-surface">{Math.floor((user?.total_solved || 0) / 10)}</p>
            <p className="text-[10px] text-on-surface-variant">🔥 Streak (est)</p>
          </div>
          <div className="w-px bg-surface-variant"></div>
          <div className="text-center">
            <p className="font-mono font-bold text-lg text-on-surface">{user?.total_solved || 0}</p>
            <p className="text-[10px] text-on-surface-variant">📝 Soal</p>
          </div>
          <div className="w-px bg-surface-variant"></div>
          <div className="text-center">
            <p className="font-mono font-bold text-lg text-on-surface">{(user?.total_accuracy || 0).toFixed(1)}%</p>
            <p className="text-[10px] text-on-surface-variant">🎯 Akurasi</p>
          </div>
        </motion.div>
      </header>

      <main className="px-6 flex flex-col gap-6">
        {/* Achievements */}
        <motion.section variants={itemVariants} className="flex flex-col gap-3">
          <div className="flex justify-between items-end">
            <h2 className="font-headline font-semibold text-sm text-on-surface">Pencapaian Terbaru</h2>
            <span className="text-xs font-medium text-primary cursor-pointer hover:underline">Lihat Semua</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((achievement, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="bg-surface-container-lowest rounded-xl p-3 border border-surface-variant/10 shadow-[0_1px_6px_rgba(45,42,38,0.04)] flex items-center gap-3 cursor-pointer hover:border-primary/20 transition-all"
              >
                <span className="text-xl">{achievement.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-on-surface truncate">{achievement.label}</p>
                  <p className="text-[10px] text-on-surface-variant">{achievement.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Settings */}
        <motion.section variants={itemVariants} className="flex flex-col gap-1">
          <h2 className="font-headline font-semibold text-sm text-on-surface mb-2">Pengaturan</h2>
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_1px_6px_rgba(45,42,38,0.04)] border border-surface-variant/10">
            {settingsItems.map((item, i) => (
              <div
                key={item.id}
                onClick={() => {
                  if (item.type === 'toggle') {
                    toggleSetting(item.id)
                  } else if (item.id === 'help') {
                    alert('Mohon email ke elhaqi921@gmail.com untuk bantuan.')
                  } else if (item.id === 'info') {
                    alert('MathQuest v1.0.0\nBelajar Matematika Jadi Menyenangkan!\nDibuat dengan Vite, React, Golang & Python.')
                  }
                }}
                className={`w-full flex items-center gap-4 px-4 py-3.5 text-left transition-colors cursor-pointer hover:bg-surface-container-low ${i < settingsItems.length - 1 ? 'border-b border-surface-variant/15' : ''}`}
              >
                <span className={`material-symbols-outlined text-[20px] ${settings[item.id] ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {item.icon}
                </span>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${settings[item.id] && item.type === 'toggle' ? 'text-primary' : 'text-on-surface'}`}>{item.label}</p>
                  <p className="text-[10px] text-on-surface-variant">{item.desc}</p>
                </div>
                
                {/* Render Toggle or Arrow based on item type */}
                {item.type === 'toggle' ? (
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ease-in-out ${settings[item.id] ? 'bg-primary' : 'bg-surface-variant'}`}>
                     <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-300 ease-in-out ${settings[item.id] ? 'translate-x-6 shadow-[-2px_0_5px_rgba(0,0,0,0.2)]' : 'translate-x-1 shadow-[2px_0_5px_rgba(0,0,0,0.2)]'}`} />
                  </div>
                ) : (
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant/40">chevron_right</span>
                )}
              </div>
            ))}
          </div>
        </motion.section>

        {/* Logout */}
        <motion.section variants={itemVariants} className="pb-4">
          <button 
             onClick={logout}
             className="w-full py-3 rounded-xl border border-error/20 text-error text-sm font-medium hover:bg-error-container/10 transition-colors"
          >
            Keluar
          </button>
        </motion.section>
      </main>
    </motion.div>
  )
}
