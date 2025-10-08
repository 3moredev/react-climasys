import api from './api'

export interface Appointment {
  appointmentId: string
  patientId: string
  patientName: string
  appointmentDate: string
  appointmentTime: string
  status: string
  appointmentType: string
  notes?: string
  clinicId: string
  age?: number
  mobileNumber?: string
  doctorName?: string
  lastOpdVisit?: string
  onlineAppointmentTime?: string
  reportsAsked?: boolean
  visitNumber?: number
}

export interface AppointmentParams {
  doctorId: string
  appointmentDate?: string
}

export interface AppointmentRequest {
  visitDate: string
  shiftId: number
  clinicId: string
  doctorId: string
  patientId: string
  visitTime?: string
  reportsReceived?: boolean
  inPerson?: boolean
}

export interface TodayAppointmentsResponse {
  success: boolean
  resultSet1: any[]
  resultSet2: any[]
  resultSet3: any[]
  resultSet4: any[]
  doctorId: string
  clinicId: string
  futureDate: string
  languageId: number
}

export const appointmentService = {
  /**
   * Get all future appointments for a doctor
   * @param doctorId - The doctor's ID
   * @returns Promise<Appointment[]> - List of future appointments
   */
  async getFutureAppointments(doctorId: string): Promise<Appointment[]> {
    try {
      const response = await api.get(`/api/appointments/${doctorId}/future`)
      console.log('Future appointments response:', response.data)
      return response.data || []
    } catch (error) {
      console.error('Appointments API Error:', error)
      throw error
    }
  },

  /**
   * Get appointments for a specific date
   * @param doctorId - The doctor's ID
   * @param appointmentDate - The date to get appointments for (YYYY-MM-DD)
   * @returns Promise<Appointment[]> - List of appointments for the date
   */
  async getAppointmentsForDate(doctorId: string, appointmentDate: string): Promise<Appointment[]> {
    try {
      const response = await api.get(`/api/appointments/${doctorId}/future-for-date`, {
        params: { appointmentDate }
      })
      console.log('Appointments for date response:', response.data)
      return response.data || []
    } catch (error) {
      console.error('Appointments API Error:', error)
      throw error
    }
  },

  /**
   * Get holiday details for a doctor
   * @param doctorId - The doctor's ID
   * @returns Promise<any[]> - List of holiday details
   */
  async getHolidayDetails(doctorId: string): Promise<any[]> {
    try {
      const response = await api.get(`/api/appointments/${doctorId}/holidays`)
      return response.data || []
    } catch (error) {
      console.error('Holiday API Error:', error)
      return []
    }
  },

  /**
   * Get gender options for appointments
   * @returns Promise<any[]> - List of gender options
   */
  async getGenderOptions(): Promise<any[]> {
    try {
      const response = await api.get('/api/appointments/gender-options')
      return response.data || []
    } catch (error) {
      console.error('Gender Options API Error:', error)
      return []
    }
  },

  /**
   * Book a new appointment
   * @param appointmentData - The appointment data matching the backend API structure
   * @returns Promise<any> - Booking result
   */
  async bookAppointment(appointmentData: AppointmentRequest): Promise<any> {
    try {
      const response = await api.post('/appointments', appointmentData)
      console.log('Book appointment response:', response.data)
      return response.data
    } catch (error) {
      console.error('Book Appointment API Error:', error)
      throw new Error('Failed to book appointment')
    }
  },

  /**
   * Get today's appointments (and related sets) for a given date using SP-like endpoint
   * Returns 4 result sets mirroring USP_Get_TodaysAppointments_ForGivenDate
   */
  async getAppointmentsForDateSP(params: { doctorId: string; clinicId: string; futureDate: string; languageId?: number }): Promise<TodayAppointmentsResponse> {
    const { doctorId, clinicId, futureDate, languageId = 1 } = params
    try {
      const response = await api.get('/visits/appointments-for-date', {
        params: { doctorId, clinicId, futureDate, languageId }
      })
      console.log('appointments-for-date response:', response.data)
      return response.data as TodayAppointmentsResponse
    } catch (error) {
      console.error('Appointments-for-date API Error:', error)
      throw error
    }
  },

  /**
   * Search appointments by patient criteria
   * @param doctorId - The doctor's ID
   * @param searchTerm - Search term (patient ID, name, or contact)
   * @returns Promise<Appointment[]> - List of matching appointments
   */
  async searchAppointments(doctorId: string, searchTerm: string): Promise<Appointment[]> {
    try {
      // For now, get all future appointments and filter on frontend
      // In a real implementation, this would be a dedicated search endpoint
      const allAppointments = await this.getFutureAppointments(doctorId)
      const searchLower = searchTerm.toLowerCase()
      
      return allAppointments.filter(appointment => 
        appointment.patientId.toLowerCase().includes(searchLower) ||
        appointment.patientName.toLowerCase().includes(searchLower)
      )
    } catch (error) {
      console.error('Search Appointments API Error:', error)
      return []
    }
  },

  /**
   * Delete an appointment by patient, visit date, and doctor
   * Mirrors backend @DeleteMapping("/appointments") with query params
   */
  async deleteAppointment(params: { patientId: string; visitDate: string; doctorId: string; userId?: string }): Promise<any> {
    const { patientId, visitDate, doctorId, userId = 'system' } = params
    try {
      const response = await api.delete('/appointments', {
        params: { patientId, visitDate, doctorId, userId }
      })
      console.log('Delete appointment response:', response.data)
      return response.data
    } catch (error) {
      console.error('Delete Appointment API Error:', error)
      throw error
    }
  },

  /**
   * Update today's appointment: online time, doctor and status
   * Mirrors backend @PutMapping("/appointments/online-time-doctor")
   */
  async updateTodaysAppointment(params: {
    patientId: string
    patientVisitNo: number
    shiftId: number
    clinicId: string
    onlineAppointmentTime?: string
    doctorId: string
    statusId: number
    userId?: string
  }): Promise<any> {
    const {
      patientId,
      patientVisitNo,
      shiftId,
      clinicId,
      onlineAppointmentTime,
      doctorId,
      statusId,
      userId = 'system'
    } = params
    try {
      const response = await api.put('/appointments/online-time-doctor', null, {
        params: {
          patientId,
          patientVisitNo,
          shiftId,
          clinicId,
          onlineAppointmentTime,
          doctorId,
          statusId,
          userId
        }
      })
      console.log('Update todays appointment response:', response.data)
      return response.data
    } catch (error) {
      console.error('Update Todays Appointment API Error:', error)
      throw error
    }
  },

  /**
   * Get patient's previous visits with optional doctor/clinic/today filters
   * Mirrors backend @GetMapping("/previous-visits/{patientId}")
   */
  async getPatientPreviousVisits(params: { patientId: string; doctorId?: string; clinicId?: string; todaysVisitDate?: string }): Promise<any> {
    const { patientId, doctorId, clinicId, todaysVisitDate } = params
    try {
      // Backend route is typically under /visits; adjust if your controller uses a different prefix
      const response = await api.get(`/visits/previous-visits/${encodeURIComponent(patientId)}`, {
        params: { doctorId, clinicId, todaysVisitDate }
      })
      return response.data
    } catch (error) {
      console.error('Previous visits API Error:', error)
      throw error
    }
  }
}

/**
 * Get doctor status reference data
 */
export async function getDoctorStatusReference(): Promise<any[]> {
  try {
    const response = await api.get('/doctors/status-reference')
    console.log('status-reference response:', response.data)
    return (response.data as any[]) || []
  } catch (error) {
    console.error('Status-reference API Error:', error)
    return []
  }
}

/**
 * Get status options filtered by clinicId
 */
export async function getStatusOptionsByClinic(clinicId: string): Promise<{ success: boolean; statusOptions: any[]; clinicId: string }> {
  try {
    const response = await api.get('/appointments/status-options', { params: { clinicId } })
    return response.data as { success: boolean; statusOptions: any[]; clinicId: string }
  } catch (error) {
    console.error('Status-options (by clinic) API Error:', error)
    return { success: false, statusOptions: [], clinicId }
  }
}

export default appointmentService
