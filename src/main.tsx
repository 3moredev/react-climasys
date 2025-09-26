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
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import Visits from './pages/Visits'
import Billing from './pages/Billing'
import RegistrationPage from './pages/Registration'
// import AppointmentsPage from './pages/Appointments'
import LabPage from './pages/Lab'
import PharmacyPage from './pages/Pharmacy'
import APITest from './components/Test/APITest'
import Appointment from './pages/Appointment'
import ExampleTemplatePage from './pages/ExampleTemplatePage'
import SessionTest from './pages/SessionTest'
import QuickRegistration from './pages/QuickRegistration'
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
            {/* <Route path="/appointment" element={<Appointment />} /> */}
            <Route
              path="/*"
              element={
                <AuthGuard>
                  <MainLayout>
                    <Routes>
                      <Route path="/" element={<Navigate to="/appointment" />} />
                      <Route path="/patients" element={<Patients />} />
                      <Route path="/registration" element={<RegistrationPage />} />
                      <Route path="/registration/quick" element={<QuickRegistration />} />
                      {/* <Route path="/appointments" element={<AppointmentsPage />} /> */}
                      <Route path="/appointment" element={<Appointment />} />
                      <Route path="/visits" element={<Visits />} />
                      <Route path="/lab" element={<LabPage />} />
                      <Route path="/pharmacy" element={<PharmacyPage />} />
                      <Route path="/billing" element={<Billing />} />
                      <Route path="/api-test" element={<APITest />} />
                      <Route path="/template-example" element={<ExampleTemplatePage />} />
                      <Route path="/session-test" element={<SessionTest />} />
                      <Route path="/reports" element={<div>Reports (Coming Soon)</div>} />
                      <Route path="/settings" element={<div>Settings (Coming Soon)</div>} />
                      <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                  </MainLayout>
                </AuthGuard>
              }
            />
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


