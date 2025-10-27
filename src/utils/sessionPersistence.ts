/**
 * Session Persistence Utilities
 * 
 * This module provides utilities to persist and restore user authentication state
 * across page refreshes, ensuring users don't get logged out unexpectedly.
 */

export interface PersistedUser {
  loginId: string
  firstName: string
  roleName: string
  roleId: number
  doctorId?: string
  clinicId?: string
  doctorName?: string
  clinicName?: string
  languageId?: number
  isActive?: boolean
  financialYear?: number
  lastLoginTime: number
  sessionId?: string
}

export interface PersistedAuthState {
  user: PersistedUser | null
  isAuthenticated: boolean
  lastActivityTime: number
}

const STORAGE_KEYS = {
  USER: 'climasys_user',
  AUTH_STATE: 'climasys_auth_state',
  SESSION_ID: 'climasys_session_id',
  LAST_ACTIVITY: 'climasys_last_activity'
} as const

export const sessionPersistence = {
  /**
   * Save user data to localStorage with timestamp
   */
  saveUser(user: PersistedUser): void {
    try {
      const userWithTimestamp = {
        ...user,
        lastLoginTime: Date.now()
      }
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userWithTimestamp))
      localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString())
      console.log('SessionPersistence: User data saved to localStorage')
    } catch (error) {
      console.error('SessionPersistence: Failed to save user data:', error)
    }
  },

  /**
   * Load user data from localStorage
   */
  loadUser(): PersistedUser | null {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.USER)
      if (!userData) {
        return null
      }
      
      const user = JSON.parse(userData) as PersistedUser
      console.log('SessionPersistence: User data loaded from localStorage')
      return user
    } catch (error) {
      console.error('SessionPersistence: Failed to load user data:', error)
      return null
    }
  },

  /**
   * Save complete auth state to localStorage
   */
  saveAuthState(authState: PersistedAuthState): void {
    try {
      const stateWithTimestamp = {
        ...authState,
        lastActivityTime: Date.now()
      }
      localStorage.setItem(STORAGE_KEYS.AUTH_STATE, JSON.stringify(stateWithTimestamp))
      console.log('SessionPersistence: Auth state saved to localStorage')
    } catch (error) {
      console.error('SessionPersistence: Failed to save auth state:', error)
    }
  },

  /**
   * Load auth state from localStorage
   */
  loadAuthState(): PersistedAuthState | null {
    try {
      const authData = localStorage.getItem(STORAGE_KEYS.AUTH_STATE)
      if (!authData) {
        return null
      }
      
      const authState = JSON.parse(authData) as PersistedAuthState
      console.log('SessionPersistence: Auth state loaded from localStorage')
      return authState
    } catch (error) {
      console.error('SessionPersistence: Failed to load auth state:', error)
      return null
    }
  },

  /**
   * Save session ID
   */
  saveSessionId(sessionId: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId)
      console.log('SessionPersistence: Session ID saved')
    } catch (error) {
      console.error('SessionPersistence: Failed to save session ID:', error)
    }
  },

  /**
   * Load session ID
   */
  loadSessionId(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.SESSION_ID)
    } catch (error) {
      console.error('SessionPersistence: Failed to load session ID:', error)
      return null
    }
  },

  /**
   * Update last activity timestamp
   */
  updateLastActivity(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString())
    } catch (error) {
      console.error('SessionPersistence: Failed to update last activity:', error)
    }
  },

  /**
   * Get last activity timestamp
   */
  getLastActivity(): number {
    try {
      const lastActivity = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY)
      return lastActivity ? parseInt(lastActivity, 10) : 0
    } catch (error) {
      console.error('SessionPersistence: Failed to get last activity:', error)
      return 0
    }
  },

  /**
   * Check if session is still valid based on last activity
   */
  isSessionValid(maxInactiveMinutes: number = 30): boolean {
    try {
      const lastActivity = this.getLastActivity()
      if (!lastActivity) {
        return false
      }

      const now = Date.now()
      const inactiveTime = now - lastActivity
      const maxInactiveMs = maxInactiveMinutes * 60 * 1000

      return inactiveTime < maxInactiveMs
    } catch (error) {
      console.error('SessionPersistence: Failed to check session validity:', error)
      return false
    }
  },

  /**
   * Clear all persisted data
   */
  clearAll(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
      console.log('SessionPersistence: All data cleared')
    } catch (error) {
      console.error('SessionPersistence: Failed to clear data:', error)
    }
  },

  /**
   * Check if user data exists in localStorage
   */
  hasUserData(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.USER)
  },

  /**
   * Check if auth state exists in localStorage
   */
  hasAuthState(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.AUTH_STATE)
  },

  /**
   * Get session age in minutes
   */
  getSessionAgeMinutes(): number {
    try {
      const lastActivity = this.getLastActivity()
      if (!lastActivity) {
        return 0
      }

      const now = Date.now()
      const ageMs = now - lastActivity
      return Math.floor(ageMs / (1000 * 60))
    } catch (error) {
      console.error('SessionPersistence: Failed to get session age:', error)
      return 0
    }
  }
}

export default sessionPersistence
