import React from 'react'
import { Box, Typography, Button } from '@mui/material'

export default function LoginTest() {
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
        Login Test Component
      </Typography>
      <Typography variant="body1" gutterBottom>
        If you can see this, the routing is working correctly.
      </Typography>
      <Button 
        variant="contained" 
        onClick={() => window.location.href = '/login'}
        sx={{ mt: 2 }}
      >
        Go to Login
      </Button>
    </Box>
  )
}
