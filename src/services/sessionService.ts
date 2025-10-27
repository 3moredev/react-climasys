import api from './api'
import { sessionPersistence } from '../utils/sessionPersistence'

export interface SessionInfo {
  userId: number
  loginId: string
  firstName: string
  languageId: number
  doctorId: string
  doctorName: string
  doctorSpeciality?: string
  doctorQualification?: string
  clinicId: string
  clinicName: string
  clinicAddress?: string
  clinicPhone?: string
  loginTime: number
  sessionType: string
  sessionId: string
  lastAccessedTime: number
  maxInactiveInterval: number
}

export interface SessionValidation {
  valid: boolean
  expired: boolean
  sessionId: string | null
}

export const sessionService = {
  /**
   * Get complete session information
   */
  async getSessionInfo(): Promise<{ success: boolean; data: SessionInfo | null; error: string | null }> {
    try {
      const response = await api.get<SessionInfo>('/auth/session/info')
      
      // Save session ID for persistence
      if (response.data?.sessionId) {
        sessionPersistence.saveSessionId(response.data.sessionId)
      }
      
      return {
        success: true,
        data: response.data,
        error: null
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Session expired, clear persistence data
        sessionPersistence.clearAll()
        return {
          success: false,
          data: null,
          error: 'Session expired'
        }
      }
      return {
        success: false,
        data: null,
        error: error.response?.data?.error || 'Failed to load session'
      }
    }
  },

  /**
   * Get username from session
   */
  async getUsername(): Promise<string | null> {
    try {
      const result = await this.getSessionInfo()
      if (result.success && result.data) {
        return result.data.firstName || result.data.loginId || null
      }
      return null
    } catch (error) {
      console.error('Error getting username:', error)
      return null
    }
  },

  /**
   * Get login ID from session
   */
  async getLoginId(): Promise<string | null> {
    try {
      const response = await api.get<{ loginId: string; status: string }>('/auth/session/login-id')
      return response.data.loginId || null
    } catch (error) {
      console.error('Error getting login ID:', error)
      return null
    }
  },

  /**
   * Get doctor ID from session
   */
  async getDoctorId(): Promise<string | null> {
    try {
      const response = await api.get<{ doctorId: string; status: string }>('/auth/session/doctor-id')
      return response.data.doctorId || null
    } catch (error) {
      console.error('Error getting doctor ID:', error)
      return null
    }
  },

  /**
   * Get clinic ID from session
   */
  async getClinicId(): Promise<string | null> {
    try {
      const response = await api.get<{ clinicId: string; status: string }>('/auth/session/clinic-id')
      return response.data.clinicId || null
    } catch (error) {
      console.error('Error getting clinic ID:', error)
      return null
    }
  },

  /**
   * Validate current session
   */
  async validateSession(): Promise<SessionValidation> {
    try {
      const response = await api.get<SessionValidation>('/auth/session/validate')
      return response.data
    } catch (error) {
      console.error('Session validation error:', error)
      return { valid: false, expired: true, sessionId: null }
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<boolean> {
    try {
      const response = await api.post('/auth/session/logout')
      
      // Clear session persistence data on successful logout
      if (response.status === 200) {
        sessionPersistence.clearAll()
      }
      
      return response.status === 200
    } catch (error) {
      console.error('Logout error:', error)
      // Even if logout fails, clear local persistence
      sessionPersistence.clearAll()
      return false
    }
  },

  /**
   * Update session timeout
   */
  async updateSessionTimeout(timeoutInSeconds: number): Promise<boolean> {
    try {
      const response = await api.post(`/auth/session/timeout?timeoutInSeconds=${timeoutInSeconds}`)
      return response.status === 200
    } catch (error) {
      console.error('Session timeout update error:', error)
      return false
    }
  }
}
