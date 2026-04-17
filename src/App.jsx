import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import ImmersiveLayout from './layouts/ImmersiveLayout'
import DashboardPage from './pages/DashboardPage'
import SkillTreePage from './pages/SkillTreePage'
import ProblemPage from './pages/ProblemPage'
import ReviewPage from './pages/ReviewPage'
import SummaryPage from './pages/SummaryPage'
import PracticePage from './pages/PracticePage'
import AnalyticsPage from './pages/AnalyticsPage'
import ProfilePage from './pages/ProfilePage'
import AuthPage from './pages/AuthPage'
import { useAuth } from './contexts/AuthContext'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) {
    return <Navigate to="/auth" replace />
  }
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      
      {/* Main app with bottom tab bar */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="practice" element={<PracticePage />} />
        <Route path="stats" element={<AnalyticsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="topic/:topicId" element={<SkillTreePage />} />
      </Route>

      {/* Immersive screens (no bottom nav) */}
      <Route element={<ProtectedRoute><ImmersiveLayout /></ProtectedRoute>}>
        <Route path="session/:topicId/:skillId" element={<ProblemPage />} />
        <Route path="review/:topicId/:skillId" element={<ReviewPage />} />
        <Route path="summary" element={<SummaryPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
