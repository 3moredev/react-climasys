import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { authService, LoginRequest, LoginResponse, UserDetails } from '../../services/authService'

interface User {
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
}

interface AuthState {
  user: User | null
  userDetails: UserDetails | null
  shiftTimes: any[]
  availableRoles: any[]
  systemParams: any[]
  licenseKey: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  userDetails: null,
  shiftTimes: [],
  availableRoles: [],
  systemParams: [],
  licenseKey: null,
  isAuthenticated: !!localStorage.getItem('user'),
  loading: false,
  error: null,
}

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errorMessage || error.message || 'Login failed')
    }
  }
)

export const logout = createAsyncThunk('auth/logout', async () => {
  authService.logout()
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    initializeAuth: (state) => {
      const user = authService.getCurrentUser()
      if (user) {
        state.user = user
        state.isAuthenticated = true
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        
        if (action.payload.loginStatus === 1) {
          // Login successful
          const userDetails = action.payload.userDetails
          if (userDetails) {
            state.user = {
              loginId: userDetails.login_id,
              firstName: userDetails.first_name,
              roleName: userDetails.role_name,
              roleId: userDetails.role_id,
              doctorId: userDetails.doctor_id,
              clinicId: userDetails.clinic_id,
              doctorName: userDetails.doctor_name,
              clinicName: userDetails.clinic_name,
              languageId: userDetails.language_id,
              isActive: userDetails.is_active,
              financialYear: userDetails.financial_year,
            }
            state.userDetails = action.payload.userDetails
            state.shiftTimes = action.payload.shiftTimes || []
            state.availableRoles = action.payload.availableRoles || []
            state.systemParams = action.payload.systemParams || []
            state.licenseKey = action.payload.licenseKey
            state.isAuthenticated = true
            console.log('Login successful, isAuthenticated:', state.isAuthenticated)
            
            // Store user data in localStorage
            authService.setCurrentUser(state.user)
          }
        } else {
          // Login failed
          state.error = action.payload.errorMessage || 'Login failed'
          state.isAuthenticated = false
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.isAuthenticated = false
        state.user = null
        state.userDetails = null
        state.shiftTimes = []
        state.availableRoles = []
        state.systemParams = []
        state.licenseKey = null
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.userDetails = null
        state.shiftTimes = []
        state.availableRoles = []
        state.systemParams = []
        state.licenseKey = null
        state.isAuthenticated = false
        state.error = null
      })
  },
})

export const { clearError, setUser, initializeAuth } = authSlice.actions
export default authSlice.reducer
