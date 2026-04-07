import { AppProvider, useApp } from './context/Appcontext.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import Sidebar from './components/layout/Sidebar.jsx'
import Topbar from './components/layout/Topbar.jsx'

// Pages
import LoginPage              from './pages/Loginpage.jsx'
import DashboardPage          from './pages/DashboardPage.jsx'
import PatientsPage           from './pages/PatientsPage.jsx'
import PatientDetailPage      from './pages/PatientDetailPage.jsx'
import ConsultationsPage      from './pages/ConsultationsPage.jsx'
import ConsultationDetailPage from './pages/ConsultationDetailPage.jsx'
import ExamensPage            from './pages/ExamensPage.jsx'
import StatsPage              from './pages/StatsPage.jsx'
import MedecinsManager from './pages/MedecinsManager.jsx'
import LaborantinPage from './pages/LaborantinPage.jsx'

function Router() {
  const { activePage } = useApp()

  const routes = {
    dashboard:             <DashboardPage />,
    patients:              <PatientsPage />,
    'patient-detail':      <PatientDetailPage />,
    consultations:         <ConsultationsPage />,
    'consultation-detail': <ConsultationDetailPage />,
    examens:               <ExamensPage />,
    stats:                 <StatsPage />,
    medecins:              <MedecinsManager />,
    laborantin:            <LaborantinPage />,
  }

  return routes[activePage] || <DashboardPage />
}

function AppShell() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <Router />
      </div>
    </div>
  )
}

/** Guard : si non authentifié → LoginPage */
function AuthGate() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <LoginPage />
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  )
}