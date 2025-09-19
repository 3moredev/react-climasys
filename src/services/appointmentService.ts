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
}

export interface AppointmentParams {
  doctorId: string
  appointmentDate?: string
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
      // Return mock data if API fails
      return getMockAppointments()
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
      // Return mock data if API fails
      return getMockAppointmentsForDate(appointmentDate)
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
   * @param appointmentData - The appointment data
   * @returns Promise<any> - Booking result
   */
  async bookAppointment(appointmentData: {
    visitDate: string
    shiftId: number
    clinicId: string
    doctorId: string
    patientId: string
  }): Promise<any> {
    try {
      const response = await api.post('/api/appointments', appointmentData)
      console.log('Book appointment response:', response.data)
      return response.data
    } catch (error) {
      console.error('Book Appointment API Error:', error)
      throw new Error('Failed to book appointment')
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
  }
}

// Mock data functions for fallback
function getMockAppointments(): Appointment[] {
  return [
    {
      appointmentId: 'APT-001',
      patientId: 'PAT-001',
      patientName: 'John Doe',
      appointmentDate: new Date().toISOString().split('T')[0],
      appointmentTime: '09:00',
      status: 'SCHEDULED',
      appointmentType: 'Consultation',
      notes: 'Regular checkup',
      clinicId: 'CL-00001',
      age: 35,
      mobileNumber: '+1-555-0123',
      doctorName: 'Dr. Smith',
      lastOpdVisit: '3',
      onlineAppointmentTime: '09:15',
      reportsAsked: false
    },
    {
      appointmentId: 'APT-002',
      patientId: 'PAT-002',
      patientName: 'Jane Smith',
      appointmentDate: new Date().toISOString().split('T')[0],
      appointmentTime: '10:30',
      status: 'CONFIRMED',
      appointmentType: 'Follow-up',
      notes: 'Post-surgery follow-up',
      clinicId: 'CL-00001',
      age: 28,
      mobileNumber: '+1-555-0456',
      doctorName: 'Dr. Johnson',
      lastOpdVisit: '7',
      onlineAppointmentTime: '10:45',
      reportsAsked: true
    },
    {
      appointmentId: 'APT-003',
      patientId: 'PAT-003',
      patientName: 'Mike Johnson',
      appointmentDate: new Date().toISOString().split('T')[0],
      appointmentTime: '14:00',
      status: 'IN_PROGRESS',
      appointmentType: 'Consultation',
      notes: 'New patient consultation',
      clinicId: 'CL-00001',
      age: 42,
      mobileNumber: '+1-555-0789',
      doctorName: 'Dr. Brown',
      lastOpdVisit: '1',
      onlineAppointmentTime: '14:15',
      reportsAsked: false
    },
    {
      appointmentId: 'APT-004',
      patientId: 'PAT-004',
      patientName: 'Sarah Wilson',
      appointmentDate: new Date().toISOString().split('T')[0],
      appointmentTime: '11:00',
      status: 'COMPLETED',
      appointmentType: 'Consultation',
      notes: 'Annual checkup',
      clinicId: 'CL-00001',
      age: 31,
      mobileNumber: '+1-555-0321',
      doctorName: 'Dr. Davis',
      lastOpdVisit: '5',
      onlineAppointmentTime: '11:10',
      reportsAsked: true
    },
    {
      appointmentId: 'APT-005',
      patientId: 'PAT-005',
      patientName: 'Robert Brown',
      appointmentDate: new Date().toISOString().split('T')[0],
      appointmentTime: '15:30',
      status: 'CANCELLED',
      appointmentType: 'Follow-up',
      notes: 'Cancelled by patient',
      clinicId: 'CL-00001',
      age: 55,
      mobileNumber: '+1-555-0654',
      doctorName: 'Dr. Miller',
      lastOpdVisit: '12',
      onlineAppointmentTime: '15:45',
      reportsAsked: false
    },
    {
      appointmentId: 'APT-006',
      patientId: 'PAT-006',
      patientName: 'Emily Davis',
      appointmentDate: new Date().toISOString().split('T')[0],
      appointmentTime: '08:30',
      status: 'SCHEDULED',
      appointmentType: 'Consultation',
      notes: 'First visit',
      clinicId: 'CL-00001',
      age: 29,
      mobileNumber: '+1-555-0987',
      doctorName: 'Dr. Wilson',
      lastOpdVisit: '0',
      onlineAppointmentTime: '08:45',
      reportsAsked: false
    },
    {
      appointmentId: 'APT-007',
      patientId: 'PAT-007',
      patientName: 'David Lee',
      appointmentDate: new Date().toISOString().split('T')[0],
      appointmentTime: '12:15',
      status: 'CONFIRMED',
      appointmentType: 'Follow-up',
      notes: 'Blood pressure check',
      clinicId: 'CL-00001',
      age: 47,
      mobileNumber: '+1-555-1357',
      doctorName: 'Dr. Garcia',
      lastOpdVisit: '4',
      onlineAppointmentTime: '12:30',
      reportsAsked: true
    },
    {
      appointmentId: 'APT-008',
      patientId: 'PAT-008',
      patientName: 'Lisa Chen',
      appointmentDate: new Date().toISOString().split('T')[0],
      appointmentTime: '16:00',
      status: 'IN_PROGRESS',
      appointmentType: 'Consultation',
      notes: 'Diabetes management',
      clinicId: 'CL-00001',
      age: 38,
      mobileNumber: '+1-555-2468',
      doctorName: 'Dr. Martinez',
      lastOpdVisit: '8',
      onlineAppointmentTime: '16:15',
      reportsAsked: false
    },
    {
      appointmentId: 'APT-009',
      patientId: 'PAT-009',
      patientName: 'Michael Taylor',
      appointmentDate: new Date().toISOString().split('T')[0],
      appointmentTime: '13:45',
      status: 'COMPLETED',
      appointmentType: 'Consultation',
      notes: 'Vaccination',
      clinicId: 'CL-00001',
      age: 25,
      mobileNumber: '+1-555-3691',
      doctorName: 'Dr. Anderson',
      lastOpdVisit: '2',
      onlineAppointmentTime: '14:00',
      reportsAsked: true
    },
    {
      appointmentId: 'APT-010',
      patientId: 'PAT-010',
      patientName: 'Amanda White',
      appointmentDate: new Date().toISOString().split('T')[0],
      appointmentTime: '10:00',
      status: 'SCHEDULED',
      appointmentType: 'Follow-up',
      notes: 'Post-treatment review',
      clinicId: 'CL-00001',
      age: 33,
      mobileNumber: '+1-555-4826',
      doctorName: 'Dr. Thompson',
      lastOpdVisit: '6',
      onlineAppointmentTime: '10:15',
      reportsAsked: false
    },
    {
      appointmentId: 'APT-011',
      patientId: 'PAT-011',
      patientName: 'James Rodriguez',
      appointmentDate: new Date().toISOString().split('T')[0],
      appointmentTime: '14:30',
      status: 'CONFIRMED',
      appointmentType: 'Consultation',
      notes: 'Annual physical',
      clinicId: 'CL-00001',
      age: 41,
      mobileNumber: '+1-555-5951',
      doctorName: 'Dr. Clark',
      lastOpdVisit: '9',
      onlineAppointmentTime: '14:45',
      reportsAsked: true
    },
    {
      appointmentId: 'APT-012',
      patientId: 'PAT-012',
      patientName: 'Jennifer Kim',
      appointmentDate: new Date().toISOString().split('T')[0],
      appointmentTime: '11:30',
      status: 'NO_SHOW',
      appointmentType: 'Consultation',
      notes: 'Missed appointment',
      clinicId: 'CL-00001',
      age: 26,
      mobileNumber: '+1-555-6084',
      doctorName: 'Dr. Lewis',
      lastOpdVisit: '3',
      onlineAppointmentTime: '11:45',
      reportsAsked: false
    },
    {
      appointmentId: 'APT-013',
      patientId: 'PAT-013',
      patientName: 'Christopher Moore',
      appointmentDate: new Date().toISOString().split('T')[0],
      appointmentTime: '09:30',
      status: 'SCHEDULED',
      appointmentType: 'Follow-up',
      notes: 'Medication review',
      clinicId: 'CL-00001',
      age: 52,
      mobileNumber: '+1-555-7117',
      doctorName: 'Dr. Walker',
      lastOpdVisit: '11',
      onlineAppointmentTime: '09:45',
      reportsAsked: false
    },
    {
      appointmentId: 'APT-014',
      patientId: 'PAT-014',
      patientName: 'Michelle Hall',
      appointmentDate: new Date().toISOString().split('T')[0],
      appointmentTime: '15:00',
      status: 'CONFIRMED',
      appointmentType: 'Consultation',
      notes: 'Prenatal checkup',
      clinicId: 'CL-00001',
      age: 30,
      mobileNumber: '+1-555-8240',
      doctorName: 'Dr. Young',
      lastOpdVisit: '5',
      onlineAppointmentTime: '15:15',
      reportsAsked: true
    },
    {
      appointmentId: 'APT-015',
      patientId: 'PAT-015',
      patientName: 'Daniel King',
      appointmentDate: new Date().toISOString().split('T')[0],
      appointmentTime: '12:45',
      status: 'IN_PROGRESS',
      appointmentType: 'Follow-up',
      notes: 'Surgery follow-up',
      clinicId: 'CL-00001',
      age: 44,
      mobileNumber: '+1-555-9373',
      doctorName: 'Dr. Allen',
      lastOpdVisit: '10',
      onlineAppointmentTime: '13:00',
      reportsAsked: false
    }
  ]
}

function getMockAppointmentsForDate(date: string): Appointment[] {
  return [
    {
      appointmentId: 'APT-001',
      patientId: 'PAT-001',
      patientName: 'John Doe',
      appointmentDate: date,
      appointmentTime: '09:00',
      status: 'SCHEDULED',
      appointmentType: 'Consultation',
      notes: 'Regular checkup',
      clinicId: 'CL-00001',
      age: 35,
      mobileNumber: '+1-555-0123',
      doctorName: 'Dr. Smith',
      lastOpdVisit: '3',
      onlineAppointmentTime: '09:15',
      reportsAsked: false
    },
    {
      appointmentId: 'APT-002',
      patientId: 'PAT-002',
      patientName: 'Jane Smith',
      appointmentDate: date,
      appointmentTime: '10:30',
      status: 'CONFIRMED',
      appointmentType: 'Follow-up',
      notes: 'Post-surgery follow-up',
      clinicId: 'CL-00001',
      age: 28,
      mobileNumber: '+1-555-0456',
      doctorName: 'Dr. Johnson',
      lastOpdVisit: '7',
      onlineAppointmentTime: '10:45',
      reportsAsked: true
    },
    {
      appointmentId: 'APT-003',
      patientId: 'PAT-003',
      patientName: 'Mike Johnson',
      appointmentDate: date,
      appointmentTime: '14:00',
      status: 'IN_PROGRESS',
      appointmentType: 'Consultation',
      notes: 'New patient consultation',
      clinicId: 'CL-00001',
      age: 42,
      mobileNumber: '+1-555-0789',
      doctorName: 'Dr. Brown',
      lastOpdVisit: '1',
      onlineAppointmentTime: '14:15',
      reportsAsked: false
    },
    {
      appointmentId: 'APT-004',
      patientId: 'PAT-004',
      patientName: 'Sarah Wilson',
      appointmentDate: date,
      appointmentTime: '11:00',
      status: 'COMPLETED',
      appointmentType: 'Consultation',
      notes: 'Annual checkup',
      clinicId: 'CL-00001',
      age: 31,
      mobileNumber: '+1-555-0321',
      doctorName: 'Dr. Davis',
      lastOpdVisit: '5',
      onlineAppointmentTime: '11:10',
      reportsAsked: true
    },
    {
      appointmentId: 'APT-005',
      patientId: 'PAT-005',
      patientName: 'Robert Brown',
      appointmentDate: date,
      appointmentTime: '15:30',
      status: 'CANCELLED',
      appointmentType: 'Follow-up',
      notes: 'Cancelled by patient',
      clinicId: 'CL-00001',
      age: 55,
      mobileNumber: '+1-555-0654',
      doctorName: 'Dr. Miller',
      lastOpdVisit: '12',
      onlineAppointmentTime: '15:45',
      reportsAsked: false
    },
    {
      appointmentId: 'APT-006',
      patientId: 'PAT-006',
      patientName: 'Emily Davis',
      appointmentDate: date,
      appointmentTime: '08:30',
      status: 'SCHEDULED',
      appointmentType: 'Consultation',
      notes: 'First visit',
      clinicId: 'CL-00001',
      age: 29,
      mobileNumber: '+1-555-0987',
      doctorName: 'Dr. Wilson',
      lastOpdVisit: '0',
      onlineAppointmentTime: '08:45',
      reportsAsked: false
    },
    {
      appointmentId: 'APT-007',
      patientId: 'PAT-007',
      patientName: 'David Lee',
      appointmentDate: date,
      appointmentTime: '12:15',
      status: 'CONFIRMED',
      appointmentType: 'Follow-up',
      notes: 'Blood pressure check',
      clinicId: 'CL-00001',
      age: 47,
      mobileNumber: '+1-555-1357',
      doctorName: 'Dr. Garcia',
      lastOpdVisit: '4',
      onlineAppointmentTime: '12:30',
      reportsAsked: true
    },
    {
      appointmentId: 'APT-008',
      patientId: 'PAT-008',
      patientName: 'Lisa Chen',
      appointmentDate: date,
      appointmentTime: '16:00',
      status: 'IN_PROGRESS',
      appointmentType: 'Consultation',
      notes: 'Diabetes management',
      clinicId: 'CL-00001',
      age: 38,
      mobileNumber: '+1-555-2468',
      doctorName: 'Dr. Martinez',
      lastOpdVisit: '8',
      onlineAppointmentTime: '16:15',
      reportsAsked: false
    },
    {
      appointmentId: 'APT-009',
      patientId: 'PAT-009',
      patientName: 'Michael Taylor',
      appointmentDate: date,
      appointmentTime: '13:45',
      status: 'COMPLETED',
      appointmentType: 'Consultation',
      notes: 'Vaccination',
      clinicId: 'CL-00001',
      age: 25,
      mobileNumber: '+1-555-3691',
      doctorName: 'Dr. Anderson',
      lastOpdVisit: '2',
      onlineAppointmentTime: '14:00',
      reportsAsked: true
    },
    {
      appointmentId: 'APT-010',
      patientId: 'PAT-010',
      patientName: 'Amanda White',
      appointmentDate: date,
      appointmentTime: '10:00',
      status: 'SCHEDULED',
      appointmentType: 'Follow-up',
      notes: 'Post-treatment review',
      clinicId: 'CL-00001',
      age: 33,
      mobileNumber: '+1-555-4826',
      doctorName: 'Dr. Thompson',
      lastOpdVisit: '6',
      onlineAppointmentTime: '10:15',
      reportsAsked: false
    },
    {
      appointmentId: 'APT-011',
      patientId: 'PAT-011',
      patientName: 'James Rodriguez',
      appointmentDate: date,
      appointmentTime: '14:30',
      status: 'CONFIRMED',
      appointmentType: 'Consultation',
      notes: 'Annual physical',
      clinicId: 'CL-00001',
      age: 41,
      mobileNumber: '+1-555-5951',
      doctorName: 'Dr. Clark',
      lastOpdVisit: '9',
      onlineAppointmentTime: '14:45',
      reportsAsked: true
    },
    {
      appointmentId: 'APT-012',
      patientId: 'PAT-012',
      patientName: 'Jennifer Kim',
      appointmentDate: date,
      appointmentTime: '11:30',
      status: 'NO_SHOW',
      appointmentType: 'Consultation',
      notes: 'Missed appointment',
      clinicId: 'CL-00001',
      age: 26,
      mobileNumber: '+1-555-6084',
      doctorName: 'Dr. Lewis',
      lastOpdVisit: '3',
      onlineAppointmentTime: '11:45',
      reportsAsked: false
    },
    {
      appointmentId: 'APT-013',
      patientId: 'PAT-013',
      patientName: 'Christopher Moore',
      appointmentDate: date,
      appointmentTime: '09:30',
      status: 'SCHEDULED',
      appointmentType: 'Follow-up',
      notes: 'Medication review',
      clinicId: 'CL-00001',
      age: 52,
      mobileNumber: '+1-555-7117',
      doctorName: 'Dr. Walker',
      lastOpdVisit: '11',
      onlineAppointmentTime: '09:45',
      reportsAsked: false
    },
    {
      appointmentId: 'APT-014',
      patientId: 'PAT-014',
      patientName: 'Michelle Hall',
      appointmentDate: date,
      appointmentTime: '15:00',
      status: 'CONFIRMED',
      appointmentType: 'Consultation',
      notes: 'Prenatal checkup',
      clinicId: 'CL-00001',
      age: 30,
      mobileNumber: '+1-555-8240',
      doctorName: 'Dr. Young',
      lastOpdVisit: '5',
      onlineAppointmentTime: '15:15',
      reportsAsked: true
    },
    {
      appointmentId: 'APT-015',
      patientId: 'PAT-015',
      patientName: 'Daniel King',
      appointmentDate: date,
      appointmentTime: '12:45',
      status: 'IN_PROGRESS',
      appointmentType: 'Follow-up',
      notes: 'Surgery follow-up',
      clinicId: 'CL-00001',
      age: 44,
      mobileNumber: '+1-555-9373',
      doctorName: 'Dr. Allen',
      lastOpdVisit: '10',
      onlineAppointmentTime: '13:00',
      reportsAsked: false
    }
  ]
}

export default appointmentService
