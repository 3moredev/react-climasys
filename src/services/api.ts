import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for session cookies
})

// Session timeout handling
let sessionTimeoutWarningShown = false
let sessionTimeoutTimer: NodeJS.Timeout | null = null

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
  
  // Show session timeout message
  if (!sessionTimeoutWarningShown) {
    sessionTimeoutWarningShown = true
    
    // Create a modal or alert for session timeout
    const timeoutModal = document.createElement('div')
    timeoutModal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      font-family: Arial, sans-serif;
    `
    
    timeoutModal.innerHTML = `
      <div style="
        background: white;
        padding: 30px;
        border-radius: 8px;
        text-align: center;
        max-width: 400px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      ">
        <h3 style="color: #d32f2f; margin-bottom: 15px;">Session Expired</h3>
        <p style="margin-bottom: 20px; color: #666;">${message}</p>
        <button onclick="window.location.href='/login'" style="
          background: #1976d2;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        ">Go to Login</button>
      </div>
    `
    
    document.body.appendChild(timeoutModal)
    
    // Auto redirect after 5 seconds
    sessionTimeoutTimer = setTimeout(() => {
      window.location.href = '/login'
    }, 5000)
  }
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

// Session monitoring function
export const startSessionMonitoring = () => {
  // Check session validity every 5 minutes
  const sessionCheckInterval = setInterval(async () => {
    try {
      const response = await api.get('/auth/session/validate')
      if (!response.data.valid) {
        handleSessionTimeout('Your session has expired due to inactivity.')
        clearInterval(sessionCheckInterval)
      }
    } catch (error) {
      // If session validation fails, assume session is expired
      handleSessionTimeout('Unable to validate session. Please log in again.')
      clearInterval(sessionCheckInterval)
    }
  }, 5 * 60 * 1000) // 5 minutes

  // Return cleanup function
  return () => clearInterval(sessionCheckInterval)
}

// Function to reset session timeout warning
export const resetSessionTimeoutWarning = () => {
  sessionTimeoutWarningShown = false
  if (sessionTimeoutTimer) {
    clearTimeout(sessionTimeoutTimer)
    sessionTimeoutTimer = null
  }
}

export default api
