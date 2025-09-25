import React from 'react'
import { Card, CardContent, Typography, Box, Chip, Button } from '@mui/material'
import { useSession } from '../../store/hooks/useSession'

const SessionInfo: React.FC = () => {
  const { 
    sessionData, 
    username, 
    doctorName, 
    clinicName, 
    isLoading, 
    error, 
    isValid, 
    refreshSession 
  } = useSession()

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading session information...</Typography>
        </CardContent>
      </Card>
    )
  }

  if (error || !isValid) {
    return (
      <Card>
        <CardContent>
          <Typography color="error">
            {error || 'Session is invalid'}
          </Typography>
          <Button onClick={refreshSession} variant="outlined" size="small">
            Refresh Session
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Session Information
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Username:
            </Typography>
            <Chip label={username} size="small" color="primary" />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Doctor:
            </Typography>
            <Chip label={doctorName || 'N/A'} size="small" />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Clinic:
            </Typography>
            <Chip label={clinicName || 'N/A'} size="small" />
          </Box>
          
          {sessionData && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Session ID:
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {sessionData.sessionId}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Login Time:
                </Typography>
                <Typography variant="body2">
                  {new Date(sessionData.loginTime).toLocaleString()}
                </Typography>
              </Box>
            </>
          )}
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Button onClick={refreshSession} variant="outlined" size="small">
            Refresh Session
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

export default SessionInfo
