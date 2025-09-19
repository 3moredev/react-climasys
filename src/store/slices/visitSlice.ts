import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'

interface Visit {
  visitId: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  clinicId: string
  visitDate: string
  shiftId: number
  status: string
  chiefComplaint?: string
  diagnosis?: string
  treatment?: string
  notes?: string
}

interface VisitState {
  visits: Visit[]
  todaysVisits: Visit[]
  currentVisit: Visit | null
  loading: boolean
  error: string | null
}

const initialState: VisitState = {
  visits: [],
  todaysVisits: [],
  currentVisit: null,
  loading: false,
  error: null,
}

export const getTodaysVisits = createAsyncThunk(
  'visits/getTodays',
  async (params: { doctorId: string; shiftId: string; clinicId: string; roleId: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/visits/today', { params })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to get today\'s visits')
    }
  }
)

export const addToVisit = createAsyncThunk(
  'visits/add',
  async (visitData: any, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/visits', visitData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to add to visit')
    }
  }
)

export const getVisitDetails = createAsyncThunk(
  'visits/getDetails',
  async (visitId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/visits/${visitId}/details`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to get visit details')
    }
  }
)

export const saveVisitDetails = createAsyncThunk(
  'visits/saveDetails',
  async ({ visitId, visitData }: { visitId: string; visitData: any }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/visits/${visitId}/save`, visitData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to save visit details')
    }
  }
)

const visitSlice = createSlice({
  name: 'visits',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentVisit: (state, action: PayloadAction<Visit | null>) => {
      state.currentVisit = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTodaysVisits.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getTodaysVisits.fulfilled, (state, action) => {
        state.loading = false
        state.todaysVisits = action.payload.items || []
      })
      .addCase(getTodaysVisits.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(addToVisit.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addToVisit.fulfilled, (state, action) => {
        state.loading = false
        // Refresh today's visits after adding
      })
      .addCase(addToVisit.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(getVisitDetails.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getVisitDetails.fulfilled, (state, action) => {
        state.loading = false
        state.currentVisit = action.payload
      })
      .addCase(getVisitDetails.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setCurrentVisit } = visitSlice.actions
export default visitSlice.reducer
