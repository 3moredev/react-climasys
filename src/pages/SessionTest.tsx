import React from 'react'
import { Container, Typography, Box, Paper } from '@mui/material'
import SessionInfo from '../components/Session/SessionInfo'

const SessionTest: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Session Management Test
        </Typography>
        
        <Typography variant="body1" paragraph>
          This page tests the session management functionality. The username should now display 
          correctly in the profile icon in the top navigation bar.
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          <SessionInfo />
        </Box>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            What to Check:
          </Typography>
          <ul>
            <li>Profile icon in top navigation should show the username (not "undefined")</li>
            <li>Tooltip on profile icon should show username and doctor name</li>
            <li>Profile menu should show username and clinic name</li>
            <li>Session information above should display current user data</li>
          </ul>
        </Box>
      </Paper>
    </Container>
  )
}

export default SessionTest
