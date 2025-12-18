import api from './api'
import { sessionService } from './sessionService'

export interface LoginRequest {
  loginId: string
  password: string
  todaysDay: string
  languageId: number
}

export interface UserDetails {
  user_id: number
  doctor_id: string
  clinic_id: string
  login_id: string
  first_name: string
  password: string
  role_name: string
  role_id: number
  doctor_name: string
  clinic_name: string
  language_id: number
  is_active: boolean
  financial_year: number
  model_id: number
  config_id: number
  is_enabled: boolean
}

export interface ShiftTime {
  shift_id: number
  description: string
}

export interface AvailableRole {
  role_id: number
  role_name: string
}

export interface SystemParam {
  param_name: string
  param_value: string
  doctor_id: string
}

export interface LoginResponse {
  loginStatus: number
  userDetails: UserDetails | null
  shiftTimes: ShiftTime[]
  availableRoles: AvailableRole[]
  systemParams: SystemParam[]
  licenseKey: string
  userMasterDetails?: any
  errorMessage?: string
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials)
    return response.data
  },

  async changePassword(data: any): Promise<any> {
    const response = await api.post('/auth/change-password', data)
    return response.data
  },

  async testDatabase(): Promise<{ status: string; message: string }> {
    const response = await api.get('/test/database')
    return response.data
  },

  async testFunction(): Promise<{ status: string; function_result: string }> {
    const response = await api.get('/test/function')
    return response.data
  },

  async logout(): Promise<void> {
    try {
      // Logout from session API
      await sessionService.logout()
    } catch (error) {
      console.error('Session logout error:', error)
      // Continue with local cleanup even if session logout fails
    }
    // Clear local storage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  /**
   * Force logout - clears all data and redirects to login
   */
  forceLogout(): void {
    // Clear all local data
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // Force page reload to login
    window.location.href = '/login'
  },

  /**
   * Logout with timeout - attempts graceful logout but falls back to force logout
   */
  async logoutWithTimeout(timeoutMs: number = 3000): Promise<void> {
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        console.warn('Logout timeout reached, forcing logout')
        this.forceLogout()
        resolve()
      }, timeoutMs)

      this.logout()
        .then(() => {
          clearTimeout(timeoutId)
          this.forceLogout()
          resolve()
        })
        .catch((error) => {
          console.error('Logout failed:', error)
          clearTimeout(timeoutId)
          this.forceLogout()
          resolve()
        })
    })
  },

  getCurrentUser(): any {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  setCurrentUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user))
  }
}
