import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import api from '../../services/api'

interface Patient {
  patientId: string
  firstName: string
  lastName: string
  middleName?: string
  mobile: string
  gender: string
  age?: string
  dob?: string
  address?: string
  bloodGroup?: string
  registrationDate: string
}

interface PatientState {
  patients: Patient[]
  currentPatient: Patient | null
  loading: boolean
  error: string | null
  searchResults: Patient[]
  totalCount: number
}

const initialState: PatientState = {
  patients: [],
  currentPatient: null,
  loading: false,
  error: null,
  searchResults: [],
  totalCount: 0,
}

export const searchPatients = createAsyncThunk(
  'patients/search',
  async (params: { query: string; status?: string; page?: number; size?: number; clinicId?: string }, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/patients/search', { params })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Search failed')
    }
  }
)

export const getPatient = createAsyncThunk(
  'patients/get',
  async (patientId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/patients/${patientId}`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to get patient')
    }
  }
)

export const createPatient = createAsyncThunk(
  'patients/create',
  async (patientData: any, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/patients', patientData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create patient')
    }
  }
)

export const updatePatient = createAsyncThunk(
  'patients/update',
  async ({ patientId, patientData }: { patientId: string; patientData: any }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/patients/${patientId}`, patientData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update patient')
    }
  }
)

const patientSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentPatient: (state, action: PayloadAction<Patient | null>) => {
      state.currentPatient = action.payload
    },
    clearSearchResults: (state) => {
      state.searchResults = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchPatients.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(searchPatients.fulfilled, (state, action) => {
        state.loading = false
        state.searchResults = action.payload.items || []
        state.totalCount = action.payload.totalCount || 0
      })
      .addCase(searchPatients.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(getPatient.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getPatient.fulfilled, (state, action) => {
        state.loading = false
        state.currentPatient = action.payload
      })
      .addCase(getPatient.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createPatient.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createPatient.fulfilled, (state, action) => {
        state.loading = false
        // Add new patient to the list
        if (action.payload.patientId) {
          state.patients.unshift(action.payload)
        }
      })
      .addCase(createPatient.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setCurrentPatient, clearSearchResults } = patientSlice.actions
export default patientSlice.reducer
