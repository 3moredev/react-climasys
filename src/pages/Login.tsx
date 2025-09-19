import React, { useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Paper,
} from '@mui/material'
import GlobalWrapper from '../components/Layout/GlobalWrapper'
import { useForm, Controller } from 'react-hook-form'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { login, clearError } from '../store/slices/authSlice'

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
    <GlobalWrapper className="login-page-bg">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
      <Container maxWidth="sm">
        <Paper elevation={10} className="login-form" sx={{ p: 4, borderRadius: 2 }}>
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" component="h1" className="login-form-text" gutterBottom>
              Climasys
            </Typography>
            <Typography variant="h6" className="login-form-text" color="textSecondary">
              Clinic Management System
            </Typography>
          </Box>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Controller
                name="loginId"
                control={control}
                rules={{ required: 'Login ID is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Login ID"
                    variant="outlined"
                    error={!!errors.loginId}
                    helperText={errors.loginId?.message}
                    disabled={loading}
                  />
                )}
              />

              <Controller
                name="password"
                control={control}
                rules={{ required: 'Password is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Password"
                    type="password"
                    variant="outlined"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    disabled={loading}
                  />
                )}
              />

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

              {error && (
                <Alert severity="error" onClose={() => dispatch(clearError())}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Sign In'}
              </Button>
            </Box>
          </form>

          <Box textAlign="center" mt={3}>
            <Typography variant="body2" color="textSecondary">
              © 2024 Climasys. All rights reserved.
            </Typography>
          </Box>
        </Paper>
      </Container>
      </Box>
    </GlobalWrapper>
  )
}


