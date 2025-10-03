/**
 * Session Timeout Configuration
 * 
 * This file contains configuration options for session timeout handling
 * across the application.
 */

export interface SessionConfig {
  // Session timeout in minutes
  sessionTimeoutMinutes: number
  
  // Warning time in minutes before session expires
  warningTimeMinutes: number
  
  // Session validation interval in minutes
  validationIntervalMinutes: number
  
  // Auto redirect delay in seconds
  autoRedirectDelaySeconds: number
  
  // Whether to show session timeout modal
  showTimeoutModal: boolean
  
  // Whether to enable session monitoring
  enableSessionMonitoring: boolean
  
  // Whether to reset timers on user activity
  resetOnActivity: boolean
  
  // Activity events to listen for
  activityEvents: string[]
}

// Default configuration
export const defaultSessionConfig: SessionConfig = {
  sessionTimeoutMinutes: 30,
  warningTimeMinutes: 5,
  validationIntervalMinutes: 5,
  autoRedirectDelaySeconds: 5,
  showTimeoutModal: true,
  enableSessionMonitoring: true,
  resetOnActivity: true,
  activityEvents: [
    'mousedown',
    'mousemove', 
    'keypress',
    'scroll',
    'touchstart',
    'click',
    'keydown',
    'focus',
    'blur'
  ]
}

// Development configuration (longer timeouts for development)
export const developmentSessionConfig: SessionConfig = {
  ...defaultSessionConfig,
  sessionTimeoutMinutes: 60,
  warningTimeMinutes: 10,
  validationIntervalMinutes: 10,
}

// Production configuration (shorter timeouts for security)
export const productionSessionConfig: SessionConfig = {
  ...defaultSessionConfig,
  sessionTimeoutMinutes: 15,
  warningTimeMinutes: 3,
  validationIntervalMinutes: 3,
  autoRedirectDelaySeconds: 3,
}

// Get configuration based on environment
export const getSessionConfig = (): SessionConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isProduction = process.env.NODE_ENV === 'production'
  
  if (isDevelopment) {
    return developmentSessionConfig
  } else if (isProduction) {
    return productionSessionConfig
  }
  
  return defaultSessionConfig
}

// Session timeout messages
export const sessionMessages = {
  warning: 'Your session will expire soon due to inactivity.',
  expired: 'Your session has expired. Please log in again.',
  invalid: 'Your session is invalid. Please log in again.',
  networkError: 'Unable to validate session. Please check your connection.',
  timeout: 'Request timeout. Your session may have expired.',
  forbidden: 'Access denied. Your session may have expired.',
}

// Session timeout actions
export const sessionActions = {
  extend: 'Extend Session',
  logout: 'Logout',
  login: 'Go to Login',
  retry: 'Retry',
}

export default getSessionConfig
