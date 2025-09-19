import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import patientSlice from './slices/patientSlice'
import visitSlice from './slices/visitSlice'
import uiSlice from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    patients: patientSlice,
    visits: visitSlice,
    ui: uiSlice,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
