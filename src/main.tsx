import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import './global-migration.css'
import './login-styles.css'
import './no-scroll-optimization.css'
import './table-scroll-optimization.css'
import { store } from './store'
import AuthGuard from './components/Auth/AuthGuard'
import MainLayout from './components/Layout/MainLayout'
import LoginPage from './pages/Login'
import LoginDebug from './pages/LoginDebug'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import Visits from './pages/Visits'
import Billing from './pages/Billing'
import RegistrationPage from './pages/Registration'
// import AppointmentsPage from './pages/Appointments'
import LabPage from './pages/Lab'
import PharmacyPage from './pages/Pharmacy'
import APITest from './components/Test/APITest'
import AppointmentTable from './pages/Appointment'
import Treatment from './pages/Treatment'
import ExampleTemplatePage from './pages/ExampleTemplatePage'
import SessionTest from './pages/SessionTest'
import QuickRegistration from './pages/QuickRegistration'
import LoginTest from './components/Test/LoginTest'
import EmergencyTest from './EmergencyTest'
import DiagnosticTest from './DiagnosticTest'
import SimpleDashboardTest from './SimpleDashboardTest'
// Import dev helpers for console access
import './utils/devHelpers'
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login-debug" element={<LoginDebug />} />
            <Route path="/login-test" element={<LoginTest />} />
            <Route path="/session-test" element={<SessionTest />} />
            <Route path="/api-test" element={<APITest />} />
            <Route path="/emergency-test" element={<EmergencyTest />} />
            <Route path="/diagnostic" element={<DiagnosticTest />} />
            <Route path="/test-dashboard" element={
              <MainLayout>
                <Dashboard />
              </MainLayout>
            } />
            <Route path="/test-appointment" element={
              <MainLayout>
                <AppointmentTable />
              </MainLayout>
            } />
            <Route path="/" element={<Navigate to="/appointment" replace />} />
            <Route path="/dashboard" element={
              <AuthGuard>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </AuthGuard>
            } />
            <Route path="/patients" element={
              <AuthGuard>
                <MainLayout>
                  <Patients />
                </MainLayout>
              </AuthGuard>
            } />
            <Route path="/visits" element={
              <AuthGuard>
                <MainLayout>
                  <Visits />
                </MainLayout>
              </AuthGuard>
            } />
            <Route path="/billing" element={
              <AuthGuard>
                <MainLayout>
                  <Billing />
                </MainLayout>
              </AuthGuard>
            } />
            <Route path="/registration" element={
              <AuthGuard>
                <MainLayout>
                  <RegistrationPage />
                </MainLayout>
              </AuthGuard>
            } />
            <Route path="/quick-registration" element={
              <AuthGuard>
                <MainLayout>
                  <QuickRegistration />
                </MainLayout>
              </AuthGuard>
            } />
            <Route path="/lab" element={
              <AuthGuard>
                <MainLayout>
                  <LabPage />
                </MainLayout>
              </AuthGuard>
            } />
            <Route path="/pharmacy" element={
              <AuthGuard>
                <MainLayout>
                  <PharmacyPage />
                </MainLayout>
              </AuthGuard>
            } />
            <Route path="/appointment" element={
              <AuthGuard>
                <MainLayout>
                  <AppointmentTable />
                </MainLayout>
              </AuthGuard>
            } />
            <Route path="/treatment" element={
              <AuthGuard>
                <MainLayout>
                  <Treatment />
                </MainLayout>
              </AuthGuard>
            } />
            <Route path="/example-template" element={
              <AuthGuard>
                <MainLayout>
                  <ExampleTemplatePage />
                </MainLayout>
              </AuthGuard>
            } />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)


