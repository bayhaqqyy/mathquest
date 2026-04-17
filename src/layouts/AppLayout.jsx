import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const tabs = [
  { to: '/', icon: 'home', activeIcon: 'home', label: 'Beranda' },
  { to: '/practice', icon: 'account_tree', activeIcon: 'account_tree', label: 'Latihan' },
  { to: '/stats', icon: 'insights', activeIcon: 'insights', label: 'Stats' },
  { to: '/profile', icon: 'person', activeIcon: 'person', label: 'Profil' },
]

export default function AppLayout() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-surface pb-24">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      <nav className="bg-surface/80 backdrop-blur-md font-label text-[11px] font-medium shadow-[0_-4px_20px_rgba(45,42,38,0.06)] fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 z-50 border-t border-surface-variant/30">
        {tabs.map((tab) => {
          const isExactMatch = tab.to === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(tab.to)
          
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className="flex flex-col items-center justify-center px-4 py-1 transition-all duration-200 relative"
            >
              {({ isActive }) => {
                const active = tab.to === '/' ? location.pathname === '/' : isActive
                return (
                  <div className={`flex flex-col items-center justify-center rounded-2xl px-4 py-1 transition-all duration-200 ${
                    active 
                      ? 'bg-primary-container/15 text-primary' 
                      : 'text-on-surface-variant/60 hover:text-primary/70'
                  }`}>
                    <span 
                      className={`material-symbols-outlined mb-0.5 text-[22px] ${active ? 'filled' : ''}`}
                      style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                      {active ? tab.activeIcon : tab.icon}
                    </span>
                    <span className={`${active ? 'font-semibold' : ''}`}>{tab.label}</span>
                  </div>
                )
              }}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
