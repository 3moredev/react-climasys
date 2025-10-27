import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { authService, LoginRequest, LoginResponse, UserDetails } from '../../services/authService'
import { sessionPersistence, PersistedUser } from '../../utils/sessionPersistence'

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
  isAuthenticated: false, // Start as false, will be validated by AuthGuard
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
  try {
    await authService.logout()
  } catch (error) {
    console.error('Logout error:', error)
    // Even if logout fails, we should still clear local state
  }
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
      // First try to get user from session persistence
      const persistedUser = sessionPersistence.loadUser()
      if (persistedUser) {
        // Check if session is still valid
        if (sessionPersistence.isSessionValid(30)) { // 30 minutes max inactivity
          state.user = {
            loginId: persistedUser.loginId,
            firstName: persistedUser.firstName,
            roleName: persistedUser.roleName,
            roleId: persistedUser.roleId,
            doctorId: persistedUser.doctorId,
            clinicId: persistedUser.clinicId,
            doctorName: persistedUser.doctorName,
            clinicName: persistedUser.clinicName,
            languageId: persistedUser.languageId,
            isActive: persistedUser.isActive,
            financialYear: persistedUser.financialYear,
          }
          state.isAuthenticated = true
          console.log('AuthSlice: User restored from persisted session')
          return
        } else {
          console.log('AuthSlice: Persisted session expired, clearing data')
          sessionPersistence.clearAll()
        }
      }

      // Fallback to legacy authService method
      const user = authService.getCurrentUser()
      if (user) {
        state.user = user
        state.isAuthenticated = true
        // Also save to session persistence for future page refreshes
        sessionPersistence.saveUser({
          ...user,
          lastLoginTime: Date.now(),
          sessionId: sessionPersistence.loadSessionId() || undefined
        })
        console.log('AuthSlice: User restored from legacy authService')
      } else {
        state.user = null
        state.isAuthenticated = false
        console.log('AuthSlice: No user found, not authenticated')
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
            
            // Store user data in localStorage (legacy)
            authService.setCurrentUser(state.user)
            
            // Also save to session persistence for page refresh survival
            sessionPersistence.saveUser({
              ...state.user,
              lastLoginTime: Date.now(),
              sessionId: sessionPersistence.loadSessionId() || undefined
            })
            
            // Save complete auth state
            sessionPersistence.saveAuthState({
              user: {
                ...state.user,
                lastLoginTime: Date.now(),
                sessionId: sessionPersistence.loadSessionId() || undefined
              },
              isAuthenticated: true,
              lastActivityTime: Date.now()
            })
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
        
        // Clear session persistence data
        sessionPersistence.clearAll()
        console.log('AuthSlice: Logout completed, session persistence cleared')
      })
      .addCase(logout.rejected, (state) => {
        // Even if logout fails, clear the state
        state.user = null
        state.userDetails = null
        state.shiftTimes = []
        state.availableRoles = []
        state.systemParams = []
        state.licenseKey = null
        state.isAuthenticated = false
        state.error = null
        
        // Clear session persistence data
        sessionPersistence.clearAll()
        console.log('AuthSlice: Logout failed but state cleared, session persistence cleared')
      })
  },
})

export const { clearError, setUser, initializeAuth } = authSlice.actions
export default authSlice.reducer
