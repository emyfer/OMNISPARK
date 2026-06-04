import { AuthProvider, useAuth } from './context/AuthContext'
import { ReservationProvider } from './context/ReservationContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'

function AppContent() {
  const { token } = useAuth()
  return token ? <DashboardPage /> : <LoginPage />
}

export default function App() {
  return (
    <AuthProvider>
      <ReservationProvider>
        <AppContent />
      </ReservationProvider>
    </AuthProvider>
  )
}
