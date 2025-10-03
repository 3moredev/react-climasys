import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { store } from '../../store'
import LoginDebug from '../../pages/LoginDebug'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})

export default function SimpleApp() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginDebug />} />
            <Route path="*" element={<LoginDebug />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  )
}
