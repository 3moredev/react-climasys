import React from 'react'
import { Box, Typography, Button } from '@mui/material'

export default function LoginDebug() {
  console.log('LoginDebug: Component rendering')
  
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      sx={{ backgroundColor: '#f8f9fa' }}
    >
      <Typography variant="h4" gutterBottom>
        Login Debug Page
      </Typography>
      <Typography variant="body1" gutterBottom>
        This is a debug version of the login page.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        If you can see this, the routing and basic rendering is working.
      </Typography>
      <Button 
        variant="contained" 
        onClick={() => {
          console.log('Button clicked')
          // Simulate login
          localStorage.setItem('user', JSON.stringify({
            loginId: 'test-user',
            firstName: 'Test',
            roleName: 'Doctor',
            roleId: 1,
            doctorId: 'DR-001',
            clinicId: 'CL-001',
            doctorName: 'Dr. Test',
            clinicName: 'Test Clinic',
            languageId: 1,
            isActive: true,
            financialYear: new Date().getFullYear()
          }))
          window.location.href = '/appointment'
        }}
        sx={{ mt: 2 }}
      >
        Simulate Login
      </Button>
    </Box>
  )
}
