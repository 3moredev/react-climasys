import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  sidebarOpen: boolean
  loading: boolean
  snackbar: {
    open: boolean
    message: string
    severity: 'success' | 'error' | 'warning' | 'info'
  }
  theme: 'light' | 'dark'
}

const initialState: UIState = {
  sidebarOpen: true,
  loading: false,
  snackbar: {
    open: false,
    message: '',
    severity: 'info',
  },
  theme: 'light',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    showSnackbar: (state, action: PayloadAction<{ message: string; severity?: 'success' | 'error' | 'warning' | 'info' }>) => {
      state.snackbar = {
        open: true,
        message: action.payload.message,
        severity: action.payload.severity || 'info',
      }
    },
    hideSnackbar: (state) => {
      state.snackbar.open = false
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
    },
  },
})

export const {
  toggleSidebar,
  setSidebarOpen,
  setLoading,
  showSnackbar,
  hideSnackbar,
  toggleTheme,
} = uiSlice.actions

export default uiSlice.reducer
