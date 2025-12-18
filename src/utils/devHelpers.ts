/**
 * Development Helper Utilities
 * 
 * This file provides utilities for development and debugging
 */

/**
 * Enable development auth bypass
 */
export const enableDevAuthBypass = () => {
  if (process.env.NODE_ENV === 'development') {
    localStorage.setItem('bypassAuth', 'true')
    console.log('Development auth bypass enabled')
    console.log('Refresh the page to see the effect')
  } else {
    console.warn('Auth bypass is only available in development mode')
  }
}

/**
 * Disable development auth bypass
 */
export const disableDevAuthBypass = () => {
  if (process.env.NODE_ENV === 'development') {
    localStorage.removeItem('bypassAuth')
    console.log('Development auth bypass disabled')
    console.log('Refresh the page to see the effect')
  } else {
    console.warn('Auth bypass is only available in development mode')
  }
}

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('token')
  localStorage.removeItem('bypassAuth')
  console.log('All authentication data cleared')
  console.log('Refresh the page to see the effect')
}

/**
 * Get current authentication status
 */
export const getAuthStatus = () => {
  const user = localStorage.getItem('user')
  const token = localStorage.getItem('token')
  const bypassAuth = localStorage.getItem('bypassAuth')
  
  const status = {
    hasUser: !!user,
    hasToken: !!token,
    bypassAuth: bypassAuth === 'true',
    userData: user ? JSON.parse(user) : null
  }
  
  console.log('Authentication Status:', status)
  return status
}

/**
 * Simulate successful login
 */
export const simulateLogin = () => {
  if (process.env.NODE_ENV === 'development') {
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
    localStorage.setItem('token', 'mock-token')
    console.log('Mock login data set')
    console.log('Refresh the page to see the effect')
  } else {
    console.warn('Simulate login is only available in development mode')
  }
}

// Add global functions for console access in development
if (process.env.NODE_ENV === 'development') {
  try {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined' && window !== null) {
      // Safely assign functions to window object
      const win = window as any
      if (win) {
        win.enableDevAuthBypass = enableDevAuthBypass
        win.disableDevAuthBypass = disableDevAuthBypass
        win.clearAuthData = clearAuthData
        win.getAuthStatus = getAuthStatus
        win.simulateLogin = simulateLogin
        
        console.log('Development helpers available:')
        console.log('- enableDevAuthBypass() - Enable auth bypass')
        console.log('- disableDevAuthBypass() - Disable auth bypass')
        console.log('- clearAuthData() - Clear all auth data')
        console.log('- getAuthStatus() - Get current auth status')
        console.log('- simulateLogin() - Simulate successful login')
      }
    } else {
      console.log('Development helpers not available (not in browser environment)')
    }
  } catch (error) {
    console.warn('Failed to set up development helpers:', error)
  }
}

export default {
  enableDevAuthBypass,
  disableDevAuthBypass,
  clearAuthData,
  getAuthStatus,
  simulateLogin,
}
