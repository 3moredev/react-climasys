import React, { useEffect } from 'react'
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
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
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth)

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    defaultValues: {
      loginId: '',
      password: '',
      todaysDay: new Date().toLocaleString('en-US', { weekday: 'long' }),
      languageId: 1,
    }
  })

  useEffect(() => {
    console.log('Login useEffect - isAuthenticated:', isAuthenticated)
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/'
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
      {/* Left Section - Climasys Branding and Features */}
      <div className="ptwikki-left-section">
        {/* Medical Background Element */}
        <div className="medical-cross"></div>
        
        <div className="ptwikki-welcome-content">
          <div className="climasys-branding">
            <Typography variant="h2" className="climasys-brand-name">
              Climasys®
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
              <div className="ptwikki-logo-icon">C</div>
            </div>
            <Typography variant="h5" className="ptwikki-brand-text">
              Climasys
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
                  <TextField
                    {...field}
                    fullWidth
                    variant="outlined"
                    error={!!errors.loginId}
                    helperText={errors.loginId?.message}
                    disabled={loading}
                    className="ptwikki-input"
                    InputProps={{
                      className: 'ptwikki-input-field'
                    }}
                  />
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
                  <TextField
                    {...field}
                    fullWidth
                    type="password"
                    variant="outlined"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    disabled={loading}
                    className="ptwikki-input"
                    InputProps={{
                      className: 'ptwikki-input-field',
                      endAdornment: (
                        <span className="ptwikki-eye-icon">👁</span>
                      )
                    }}
                  />
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
              <FormControlLabel
                control={
                  <Checkbox
                    className="ptwikki-checkbox"
                  />
                }
                label="Keep me signed in"
                className="ptwikki-checkbox-label"
              />
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


