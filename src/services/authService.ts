import api from './api'

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

  async testDatabase(): Promise<{ status: string; message: string }> {
    const response = await api.get('/test/database')
    return response.data
  },

  async testFunction(): Promise<{ status: string; function_result: string }> {
    const response = await api.get('/test/function')
    return response.data
  },

  logout(): void {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  getCurrentUser(): any {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  setCurrentUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user))
  }
}
