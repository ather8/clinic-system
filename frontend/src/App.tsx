import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import PatientsPage from './pages/PatientsPage'
import NewPatientPage from './pages/NewPatientPage'
import PatientDetailPage from './pages/PatientsDetailPage'
import AppointmentsPage from './pages/AppointmentsPage'
import NewAppointmentPage from './pages/NewAppointmentPage'
import NotificationsPage from './pages/NotificationsPage'
import BillingPage from './pages/BillingPage'
import TriageChatPage from './pages/TriageChatPage'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/DashboardLayout'
import NewInvoicePage from './pages/NewInvoicePage'
import DocumentToolsPage from './pages/DocumentToolsPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/patients" element={<PatientsPage />} />
          <Route path="/dashboard/patients/new" element={<NewPatientPage />} />
          <Route path="/dashboard/patients/:id" element={<PatientDetailPage />} />
          <Route path="/dashboard/appointments" element={<AppointmentsPage />} />
          <Route path="/dashboard/appointments/new" element={<NewAppointmentPage />} />
          <Route path="/dashboard/notifications" element={<NotificationsPage />} />
          <Route path="/dashboard/billing" element={<BillingPage />} />
          <Route path="/dashboard/billing/new" element={<NewInvoicePage />} />
          <Route path="/dashboard/symptom-check" element={<TriageChatPage />} />
          <Route path="/dashboard/document-tools" element={<DocumentToolsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App