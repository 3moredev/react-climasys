import React, { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store'
import { initializeAuth } from '../../store/slices/authSlice'
import { Box, CircularProgress, Typography } from '@mui/material'
import { sessionService } from '../../services/sessionService'
import { startSessionMonitoring, resetSessionTimeoutWarning } from '../../services/api'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth)
  const [isValidatingSession, setIsValidatingSession] = useState(true)

  // If we're on the login page, don't run any auth logic
  if (location.pathname === '/login') {
    console.log('AuthGuard: On login page, skipping auth logic')
    return <>{children}</>
  }

  // Temporary development bypass - remove in production
  if (process.env.NODE_ENV === 'development' && localStorage.getItem('bypassAuthGuard') === 'true') {
    console.log('AuthGuard: Development bypass enabled, rendering children directly')
    return <>{children}</>
  }

  // Temporary bypass for development - remove in production
  const isDevelopment = process.env.NODE_ENV === 'development'
  const bypassAuth = localStorage.getItem('bypassAuth') === 'true'

  useEffect(() => {
    const validateSession = async () => {
      try {
        setIsValidatingSession(true)
        console.log('AuthGuard: Starting session validation...')
        
        // Development bypass - create a mock user
        if (isDevelopment && bypassAuth) {
          console.log('AuthGuard: Using development bypass')
          const mockUser = {
            loginId: 'dev-user',
            firstName: 'Development',
            roleName: 'Doctor',
            roleId: 1,
            doctorId: 'DR-00001',
            clinicId: 'CL-001',
            doctorName: 'Dr. Development',
            clinicName: 'Dev Clinic',
            languageId: 1,
            isActive: true,
            financialYear: new Date().getFullYear()
          }
          localStorage.setItem('user', JSON.stringify(mockUser))
          dispatch(initializeAuth())
          setIsValidatingSession(false)
          return
        }
        
        // First check if there's a user in localStorage
        const localUser = localStorage.getItem('user')
        console.log('AuthGuard: Local user found:', !!localUser)
        
        if (!localUser) {
          // No local user, definitely not authenticated
          console.log('AuthGuard: No local user, not authenticated')
          dispatch(initializeAuth())
          setIsValidatingSession(false)
          return
        }

        // For now, if we have a local user, consider them authenticated
        // This prevents the blank screen issue while session validation is being fixed
        console.log('AuthGuard: Local user exists, initializing auth')
        dispatch(initializeAuth())
        setIsValidatingSession(false)
        
        // TODO: Re-enable session validation once backend is stable
        /*
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session validation timeout')), 5000)
        )

        // Try to validate session with backend
        const sessionResult = await Promise.race([
          sessionService.getSessionInfo(),
          timeoutPromise
        ]) as any
        
        if (sessionResult.success && sessionResult.data) {
          // Valid session exists, create user object from session data
          const sessionData = sessionResult.data
          
          const userFromSession = {
            loginId: sessionData.loginId,
            firstName: sessionData.firstName,
            roleName: 'Doctor', // Default role
            roleId: 1, // Default role ID
            doctorId: sessionData.doctorId,
            clinicId: sessionData.clinicId,
            doctorName: sessionData.doctorName,
            clinicName: sessionData.clinicName,
            languageId: sessionData.languageId,
            isActive: true,
            financialYear: new Date().getFullYear()
          }
          
          // Store user data in localStorage and Redux
          localStorage.setItem('user', JSON.stringify(userFromSession))
          dispatch(initializeAuth())
        } else {
          // Session invalid or expired, clear local storage and redirect to login
          localStorage.removeItem('user')
          localStorage.removeItem('token')
          dispatch(initializeAuth())
        }
        */
      } catch (error) {
        console.error('AuthGuard: Session validation error:', error)
        // On error, clear local storage and redirect to login
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        dispatch(initializeAuth())
      } finally {
        setIsValidatingSession(false)
        console.log('AuthGuard: Session validation complete')
      }
    }

    // Only validate session if we're not already on the login page
    if (location.pathname !== '/login') {
      validateSession()
    } else {
      setIsValidatingSession(false)
    }
  }, [dispatch, location.pathname, isDevelopment, bypassAuth])

  // Watch for authentication state changes and redirect gracefully if not authenticated
  useEffect(() => {
    console.log('AuthGuard: Auth state changed:', { 
      isAuthenticated, 
      loading, 
      isValidatingSession,
      pathname: location.pathname 
    })
    
    if (!loading && !isValidatingSession && !isAuthenticated) {
      console.log('AuthGuard: Not authenticated, redirecting to login...')
      // Add a small delay to prevent blank screens during rapid state changes
      const timeoutId = setTimeout(() => {
        navigate('/login', { replace: true })
      }, 100)
      
      return () => clearTimeout(timeoutId)
    }
  }, [isAuthenticated, loading, isValidatingSession, navigate, location.pathname])

  // Fallback timeout to prevent infinite loading
  useEffect(() => {
    const fallbackTimeout = setTimeout(() => {
      if (isValidatingSession) {
        console.warn('Session validation taking too long, redirecting to login')
        setIsValidatingSession(false)
        navigate('/login', { replace: true })
      }
    }, 10000) // 10 second fallback

    return () => clearTimeout(fallbackTimeout)
  }, [isValidatingSession, navigate])

  // Start session monitoring when authenticated
  useEffect(() => {
    let cleanupSessionMonitoring: (() => void) | null = null

    if (isAuthenticated && !loading && !isValidatingSession) {
      // Reset any existing session timeout warnings
      resetSessionTimeoutWarning()
      
      // Start session monitoring
      cleanupSessionMonitoring = startSessionMonitoring()
    }

    return () => {
      if (cleanupSessionMonitoring) {
        cleanupSessionMonitoring()
      }
    }
  }, [isAuthenticated, loading, isValidatingSession])

  console.log('AuthGuard: Rendering with state:', { 
    loading, 
    isValidatingSession, 
    isAuthenticated,
    pathname: location.pathname,
    user: useSelector((state: RootState) => state.auth.user)
  })

  if (loading || isValidatingSession) {
    console.log('AuthGuard: Showing loading screen')
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        sx={{ backgroundColor: '#f8f9fa' }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2, color: '#666' }}>
          {isValidatingSession ? 'Validating session...' : 'Loading...'}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, color: '#999' }}>
          Please wait while we verify your session.
        </Typography>
      </Box>
    )
  }

  if (!isAuthenticated) {
    console.log('AuthGuard: Not authenticated, showing redirect screen')
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        sx={{ backgroundColor: '#f8f9fa' }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2, color: '#666' }}>
          Redirecting to login...
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, color: '#999' }}>
          Please wait while we redirect you to the login page.
        </Typography>
      </Box>
    )
  }

  console.log('AuthGuard: Authenticated, rendering children')
  return <>{children}</>
}
