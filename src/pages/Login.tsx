import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material'
import GlobalWrapper from '../components/Layout/GlobalWrapper'
import { useForm, Controller } from 'react-hook-form'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { login, clearError } from '../store/slices/authSlice'
import '../login-styles.css'

interface LoginFormData {
  loginId: string
  password: string
  todaysDay: string
  languageId: number
}

export default function LoginPage() {
  console.log('LoginPage: Component rendering')
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth)
  const [showPassword, setShowPassword] = useState(false)

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    defaultValues: {
      loginId: '',
      password: '',
      todaysDay: new Date().toLocaleString('en-US', { weekday: 'long' }),
      languageId: 1,
    }
  })

  useEffect(() => {
    console.log('Login useEffect - isAuthenticated:', isAuthenticated, 'location:', location.pathname)
    if (isAuthenticated && location.pathname === '/login') {
      // Redirect to appointments screen after successful login
      const from = (location.state as any)?.from?.pathname || '/appointment'
      console.log('Navigating to:', from)
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const onSubmit = async (data: LoginFormData) => {
    dispatch(login(data))
  }

  return (
    <div className="ptwikki-login-container">
      {/* Left Section - MyHealth Branding and Features */}
      <div className="ptwikki-left-section">
        {/* Medical Background Element */}
        <div className="medical-cross"></div>
        
        <div className="ptwikki-welcome-content">
          <div className="climasys-branding">
            <Typography variant="h2" className="climasys-brand-name">
              MyHealth
            </Typography>
            <Typography variant="h6" className="climasys-tagline">
              A Step towards Smart Clinic...
            </Typography>
          </div>
          
          <div className="climasys-features">
            <div className="feature-item">
              <div className="feature-icon">👨‍⚕️</div>
              <div className="feature-text">
                Patient Specific <strong>EHR</strong>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">📝</div>
              <div className="feature-text">
                Comprehensive <strong>Digital prescription</strong>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <div className="feature-text">
                Real-time <strong>Dashboards and Financials</strong>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">💬</div>
              <div className="feature-text">
                Proactive <strong>Patient Communication</strong>
              </div>
            </div>
          </div>
        </div>
        
      </div>

      {/* Right Section - Login Form */}
      <div className="ptwikki-right-section">
        <div className="ptwikki-form-container">
          {/* Logo and Brand */}
          <div className="ptwikki-logo-section">
            <div className="ptwikki-logo">
              <div className="ptwikki-logo-icon"></div>
            </div>
            <Typography variant="h5" className="ptwikki-brand-text">
              MyHealth
            </Typography>
          </div>

            <Typography variant="h4" className="ptwikki-form-title">
              Login
            </Typography>
          
          {error && (
            <Alert severity="error" onClose={() => dispatch(clearError())} className="ptwikki-error">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="ptwikki-form">
            <div className="ptwikki-input-group">
              <label className="ptwikki-label">Login ID*</label>
              <Controller
                name="loginId"
                control={control}
                rules={{ required: 'Login ID is required' }}
                render={({ field }) => (
                  <div>
                    <input
                      {...field}
                      type="text"
                      disabled={loading}
                      className="simple-input"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#ccc';
                        e.target.style.boxShadow = 'none';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#ccc';
                      }}
                    />
                    {errors.loginId && (
                      <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                        {errors.loginId.message}
                      </div>
                    )}
                  </div>
                )}
              />
            </div>
            
            <div className="ptwikki-input-group">
              <label className="ptwikki-label">Password*</label>
              <Controller
                name="password"
                control={control}
                rules={{ required: 'Password is required' }}
                render={({ field }) => (
                  <div style={{ position: 'relative' }}>
                    <input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      disabled={loading}
                      className="simple-input"
                      style={{
                        width: '100%',
                        padding: '12px 40px 12px 16px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#ccc';
                        e.target.style.boxShadow = 'none';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#ccc';
                      }}
                    />
                    <span 
                      className="ptwikki-eye-icon"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        cursor: 'pointer',
                        color: '#666666',
                        userSelect: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '20px',
                        height: '20px'
                      }}
                    >
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                        {showPassword && (
                          <line x1="1" y1="1" x2="23" y2="23" stroke="#ff4444" strokeWidth="2"/>
                        )}
                      </svg>
                    </span>
                    {errors.password && (
                      <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                        {errors.password.message}
                      </div>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Hidden fields for API requirements */}
            <Controller
              name="todaysDay"
              control={control}
              render={({ field }) => (
                <input type="hidden" {...field} />
              )}
            />
            <Controller
              name="languageId"
              control={control}
              render={({ field }) => (
                <input type="hidden" {...field} />
              )}
            />

            <Box className="ptwikki-options">
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                color: '#333333',
                fontSize: '13px',
                cursor: 'pointer'
              }}>
                <input 
                  type="checkbox" 
                  style={{
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }}
                />
                Keep me signed in
              </label>
              <Link href="#" className="ptwikki-forgot-link">
                Forgot Password?
              </Link>
            </Box>

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              className="ptwikki-signin-btn"
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}


