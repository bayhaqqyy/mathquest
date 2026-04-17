import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { skillTrees } from '../data/skillTrees'
import { topics } from '../data/topics'
import { applySkillProgress } from '../utils/skillProgress'

const statusConfig = {
  completed: {
    bg: 'bg-secondary/15',
    border: 'border-secondary/40',
    iconColor: 'text-secondary',
    ringColor: 'ring-secondary/20',
    label: 'Selesai',
  },
  active: {
    bg: 'bg-primary-container/15',
    border: 'border-primary-container/60',
    iconColor: 'text-primary',
    ringColor: 'ring-primary-container/30',
    label: 'Aktif',
  },
  locked: {
    bg: 'bg-surface-variant/30',
    border: 'border-outline-variant/30',
    iconColor: 'text-on-surface-variant/40',
    ringColor: 'ring-surface-variant/20',
    label: 'Terkunci',
  },
}

export default function SkillTreePage() {
  const { topicId } = useParams()
  const navigate = useNavigate()
  const baseTree = skillTrees[topicId]
  const tree = baseTree ? applySkillProgress(baseTree, topicId) : null
  const topic = topics.find(t => t.id === topicId)

  if (!tree) {
    return (
      <div className="px-6 pt-12 text-center">
        <p className="text-on-surface-variant">Topik tidak ditemukan</p>
        <Link to="/" className="text-primary mt-4 inline-block">← Kembali</Link>
      </div>
    )
  }

  const maxY = Math.max(...tree.skills.map(s => s.position.y))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen"
    >
      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-surface-variant/30">
        <div className="px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <h1 className="font-headline font-semibold text-lg text-on-surface">{tree.name}</h1>
            <p className="text-xs text-on-surface-variant font-mono">
              {topic?.level || 'Dasar'} • {tree.skills.filter(s => s.status === 'completed').length}/{tree.skills.length} selesai
            </p>
          </div>
        </div>
      </header>

      {/* Skill Tree */}
      <div className="px-6 py-8">
        <div className="relative" style={{ minHeight: `${(maxY + 1) * 120}px` }}>
          {/* Connection Lines (SVG) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minHeight: `${(maxY + 1) * 120}px` }}>
            {tree.skills.map(skill =>
              skill.connections.map(targetId => {
                const target = tree.skills.find(s => s.id === targetId)
                if (!target) return null
                const x1 = `${skill.position.x}%`
                const y1 = skill.position.y * 120 + 40
                const x2 = `${target.position.x}%`
                const y2 = target.position.y * 120 + 40
                const isActive = skill.status === 'completed' || skill.status === 'active'
                return (
                  <line
                    key={`${skill.id}-${targetId}`}
                    x1={x1} y1={y1}
                    x2={x2} y2={y2}
                    stroke={isActive ? '#e8913a' : '#d9c2b1'}
                    strokeWidth="2"
                    strokeDasharray={isActive ? '0' : '8 4'}
                    className={isActive ? '' : 'skill-line'}
                    strokeOpacity={isActive ? 0.6 : 0.4}
                  />
                )
              })
            )}
          </svg>

          {/* Skill Nodes */}
          {tree.skills.map((skill, index) => {
            const config = statusConfig[skill.status]
            return (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="absolute flex flex-col items-center"
                style={{
                  left: `${skill.position.x}%`,
                  top: `${skill.position.y * 120}px`,
                  transform: 'translateX(-50%)',
                }}
              >
                {skill.status === 'active' ? (
                  <Link to={`/session/${topicId}/${skill.id}`}>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-16 h-16 rounded-full ${config.bg} border-2 ${config.border} flex items-center justify-center shadow-lg ring-4 ${config.ringColor} cursor-pointer animate-pulse-glow`}
                    >
                      <span className={`material-symbols-outlined text-[24px] ${config.iconColor}`}>
                        {skill.icon}
                      </span>
                    </motion.div>
                  </Link>
                ) : skill.status === 'completed' ? (
                  <div className={`w-16 h-16 rounded-full ${config.bg} border-2 ${config.border} flex items-center justify-center ring-4 ${config.ringColor} relative`}>
                    <span className={`material-symbols-outlined text-[24px] ${config.iconColor}`}>
                      {skill.icon}
                    </span>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-secondary rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-[12px] text-on-secondary font-bold">check</span>
                    </div>
                  </div>
                ) : (
                  <div className={`w-16 h-16 rounded-full ${config.bg} border-2 ${config.border} flex items-center justify-center ring-4 ${config.ringColor} opacity-60`}>
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant/40">lock</span>
                  </div>
                )}
                <span className={`mt-2 text-xs font-medium text-center max-w-[90px] leading-tight ${
                  skill.status === 'locked' ? 'text-on-surface-variant/50' : 'text-on-surface'
                }`}>
                  {skill.name}
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
