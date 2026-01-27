import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for session cookies
})

// Session timeout handling
let sessionTimeoutWarningShown = false
let sessionTimeoutTimer: ReturnType<typeof setTimeout> | null = null

// Function to handle session timeout
const handleSessionTimeout = (message: string = 'Your session has expired. Please log in again.') => {
  // Clear any existing timers
  if (sessionTimeoutTimer) {
    clearTimeout(sessionTimeoutTimer)
  }

  // Clear local storage
  localStorage.removeItem('token')
  localStorage.removeItem('user')

  // Dispatch custom event for components to listen to
  window.dispatchEvent(new CustomEvent('sessionTimeout', {
    detail: { message }
  }))
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Reset session timeout warning flag on successful requests
    sessionTimeoutWarningShown = false

    // Add session cookie support
    config.withCredentials = true

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle session timeout and auth errors
api.interceptors.response.use(
  (response) => {
    // Reset session timeout warning flag on successful responses
    sessionTimeoutWarningShown = false
    return response
  },
  (error) => {
    const { response } = error

    // Handle connection refused errors
    if (error.code === 'ERR_NETWORK' || error.message?.includes('ERR_CONNECTION_REFUSED') || error.message?.includes('Network Error')) {
      console.error('Network error: Cannot connect to backend server. Please ensure the server is running on port 8080.')
      // Don't handle session timeout for connection errors - these are server availability issues
      return Promise.reject(error)
    }

    if (response?.status === 401) {
      // Session expired or unauthorized
      const errorMessage = response.data?.message || response.data?.error || 'Your session has expired. Please log in again.'
      handleSessionTimeout(errorMessage)
    } else if (response?.status === 403) {
      // Forbidden - might be session related
      const errorMessage = response.data?.message || 'Access denied. Your session may have expired.'
      handleSessionTimeout(errorMessage)
    } else if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      // Request timeout - might indicate server issues
      console.warn('Request timeout - this might indicate server connectivity issues')
    }

    return Promise.reject(error)
  }
)

// Function to reset session timeout warning
export const resetSessionTimeoutWarning = () => {
  sessionTimeoutWarningShown = false
  if (sessionTimeoutTimer) {
    clearTimeout(sessionTimeoutTimer)
    sessionTimeoutTimer = null
  }
}

// Export empty function for compatibility until removed from consumers
export const startSessionMonitoring = () => {
  return () => { }
}

export default api
