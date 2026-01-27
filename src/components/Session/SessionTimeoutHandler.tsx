import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material'
import { Warning as WarningIcon } from '@mui/icons-material'
import { getSessionConfig, sessionMessages, sessionActions } from '../../config/sessionConfig'

interface SessionTimeoutHandlerProps {
  onSessionTimeout?: () => void
  warningTimeMinutes?: number
  sessionTimeoutMinutes?: number
}

export default function SessionTimeoutHandler({ 
  onSessionTimeout,
  warningTimeMinutes,
  sessionTimeoutMinutes
}: SessionTimeoutHandlerProps) {
  const navigate = useNavigate()
  const [showWarning, setShowWarning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isSessionExpired, setIsSessionExpired] = useState(false)
  
  // Get configuration
  const config = getSessionConfig()
  const warningTime = warningTimeMinutes ?? config.warningTimeMinutes
  const sessionTimeout = sessionTimeoutMinutes ?? config.sessionTimeoutMinutes

  // Define handlers outside useEffect so they can be used in JSX
  const handleSessionExpired = () => {
    setIsSessionExpired(true)
    setShowWarning(false)
    
    // Clear local storage
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    
    // Call custom handler if provided
    if (onSessionTimeout) {
      onSessionTimeout()
    }
    
    // Navigate to login
    navigate('/login', { replace: true })
  }

  const handleExtendSession = () => {
    setShowWarning(false)
    setTimeRemaining(0)
    // The timers will be restarted when the useEffect runs again
  }

  const handleLogout = () => {
    setShowWarning(false)
    setTimeRemaining(0)
    handleSessionExpired()
  }

  useEffect(() => {
    let warningTimer: NodeJS.Timeout
    let countdownTimer: NodeJS.Timeout
    let sessionTimer: NodeJS.Timeout

    const startSessionTimers = () => {
      // Clear any existing timers
      clearTimeout(warningTimer)
      clearTimeout(sessionTimer)
      clearInterval(countdownTimer)

      // Set warning timer (show warning before session expires)
      const warningTimeMs = (sessionTimeout - warningTime) * 60 * 1000
      warningTimer = setTimeout(() => {
        setShowWarning(true)
        setTimeRemaining(warningTime * 60) // Convert to seconds

        // Start countdown
        countdownTimer = setInterval(() => {
          setTimeRemaining(prev => {
            if (prev <= 1) {
              setIsSessionExpired(true)
              setShowWarning(false)
              clearInterval(countdownTimer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }, warningTimeMs)

      // Set session timeout timer
      sessionTimer = setTimeout(() => {
        handleSessionExpired()
      }, sessionTimeout * 60 * 1000)
    }


    // Start timers when component mounts
    startSessionTimers()

    // Listen for activity to reset timers
    const resetTimers = () => {
      startSessionTimers()
    }

    // Add event listeners for user activity
    if (config.resetOnActivity) {
      config.activityEvents.forEach(event => {
        document.addEventListener(event, resetTimers, true)
      })
    }

    // Listen for custom session timeout events from API interceptor
    const handleApiSessionTimeout = () => {
      setIsSessionExpired(true)
      setShowWarning(false)
    }

    window.addEventListener('sessionTimeout', handleApiSessionTimeout)

    return () => {
      clearTimeout(warningTimer)
      clearTimeout(sessionTimer)
      clearInterval(countdownTimer)
      
      if (config.resetOnActivity) {
        config.activityEvents.forEach(event => {
          document.removeEventListener(event, resetTimers, true)
        })
      }
      
      window.removeEventListener('sessionTimeout', handleApiSessionTimeout)
    }
  }, [navigate, onSessionTimeout, warningTimeMinutes, sessionTimeoutMinutes])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <>
      {/* Session Warning Dialog */}
      <Dialog 
        open={showWarning && !isSessionExpired} 
        onClose={() => {}} // Prevent closing by clicking outside
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <WarningIcon color="warning" />
            <Typography variant="h6">Session Timeout Warning</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Your session will expire in <strong>{formatTime(timeRemaining)}</strong> due to inactivity.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click "Extend Session" to continue working, or "Logout" to end your session now.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogout} color="secondary">
            {sessionActions.logout}
          </Button>
          <Button onClick={handleExtendSession} variant="contained" color="primary">
            {sessionActions.extend}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Session Expired Dialog */}
      <Dialog 
        open={isSessionExpired} 
        onClose={() => {}}        
        disableEscapeKeyDown
        maxWidth={'xs'}        
      >
        <DialogTitle className='mb-0'>
          <Box display="flex" alignItems="center" justifyContent='center' gap={1}>            
            <Typography variant="h5" className='mb-0' color={'error'}>Session Expired</Typography>
          </Box>
        </DialogTitle>
        <DialogContent className='d-flex justify-content-center'>
          <Typography variant="body2" color="text.secondary">
            No active session.
          </Typography>
        </DialogContent>
        <DialogActions className='justify-content-center mb-3'>
          <Button 
            onClick={() => navigate('/login', { replace: true })} 
            variant="contained" 
            color="primary"            
          >
            {sessionActions.login}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
