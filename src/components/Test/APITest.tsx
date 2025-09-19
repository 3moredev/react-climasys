import React, { useState } from 'react'
import { Box, Button, Typography, Alert, Paper, Grid } from '@mui/material'
import { authService } from '../../services/authService'

export default function APITest() {
  const [testResults, setTestResults] = useState<{
    database?: any
    function?: any
    login?: any
  }>({})
  const [loading, setLoading] = useState<{
    database: boolean
    function: boolean
    login: boolean
  }>({
    database: false,
    function: false,
    login: false,
  })

  const testDatabase = async () => {
    setLoading(prev => ({ ...prev, database: true }))
    try {
      const result = await authService.testDatabase()
      setTestResults(prev => ({ ...prev, database: result }))
    } catch (error: any) {
      setTestResults(prev => ({ 
        ...prev, 
        database: { status: 'error', message: error.message } 
      }))
    } finally {
      setLoading(prev => ({ ...prev, database: false }))
    }
  }

  const testFunction = async () => {
    setLoading(prev => ({ ...prev, function: true }))
    try {
      const result = await authService.testFunction()
      setTestResults(prev => ({ ...prev, function: result }))
    } catch (error: any) {
      setTestResults(prev => ({ 
        ...prev, 
        function: { status: 'error', message: error.message } 
      }))
    } finally {
      setLoading(prev => ({ ...prev, function: false }))
    }
  }

  const testLogin = async () => {
    setLoading(prev => ({ ...prev, login: true }))
    try {
      const result = await authService.login({
        loginId: 'test_user',
        password: 'test_password',
        todaysDay: 'Monday',
        languageId: 1
      })
      setTestResults(prev => ({ ...prev, login: result }))
    } catch (error: any) {
      setTestResults(prev => ({ 
        ...prev, 
        login: { status: 'error', message: error.message } 
      }))
    } finally {
      setLoading(prev => ({ ...prev, login: false }))
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        API Test Panel
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Test the authentication API endpoints to verify connectivity and functionality.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Database Connection
            </Typography>
            <Button
              variant="contained"
              onClick={testDatabase}
              disabled={loading.database}
              fullWidth
              sx={{ mb: 2 }}
            >
              {loading.database ? 'Testing...' : 'Test Database'}
            </Button>
            {testResults.database && (
              <Alert 
                severity={testResults.database.status === 'success' ? 'success' : 'error'}
                sx={{ mt: 1 }}
              >
                <Typography variant="body2">
                  Status: {testResults.database.status}
                </Typography>
                <Typography variant="body2">
                  Message: {testResults.database.message}
                </Typography>
              </Alert>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              PostgreSQL Function
            </Typography>
            <Button
              variant="contained"
              onClick={testFunction}
              disabled={loading.function}
              fullWidth
              sx={{ mb: 2 }}
            >
              {loading.function ? 'Testing...' : 'Test Function'}
            </Button>
            {testResults.function && (
              <Alert 
                severity={testResults.function.status === 'success' ? 'success' : 'error'}
                sx={{ mt: 1 }}
              >
                <Typography variant="body2">
                  Status: {testResults.function.status}
                </Typography>
                <Typography variant="body2">
                  Result: {JSON.stringify(testResults.function.function_result || testResults.function.message)}
                </Typography>
              </Alert>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Login API
            </Typography>
            <Button
              variant="contained"
              onClick={testLogin}
              disabled={loading.login}
              fullWidth
              sx={{ mb: 2 }}
            >
              {loading.login ? 'Testing...' : 'Test Login'}
            </Button>
            {testResults.login && (
              <Alert 
                severity={testResults.login.loginStatus === 1 ? 'success' : 'error'}
                sx={{ mt: 1 }}
              >
                <Typography variant="body2">
                  Login Status: {testResults.login.loginStatus}
                </Typography>
                <Typography variant="body2">
                  Message: {testResults.login.errorMessage || 'Login test completed'}
                </Typography>
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
