import api from './api'

export interface DashboardStats {
  totalPatients: number
  todaysAppointments: number
  pendingLabTests: number
  pendingPrescriptions: number
  todaysRevenue: number
  monthlyRevenue: number
  revenueGrowth: number
  patientQueue: number
  emergencyCases: number
  dailyCollection: number
  outstandingPayments: number
  staffOnDuty: number
  averageConsultationTime: number
  noShowRate: number
  patientSatisfaction: number
  // Legacy dashboard fields
  newPatientsLast30Days: number
  malePatients: number
  femalePatients: number
  totalPatientVisits: number
  patientsPerDay: number
  totalPrescriptions: number
  installationDate: string
  licenseExpiryDate: string
  // Doctor information
  doctorName?: string
  doctorFirstName?: string
  doctorMiddleName?: string
  doctorLastName?: string
  doctorSpecialization?: string
  doctorQualification?: string
  mainDoctorId?: string
  // Clinic information
  clinicName?: string
  clinicAddress?: string
  clinicPhone?: string
  clinicEmail?: string
}

export interface DashboardParams {
  clinicId?: string
  doctorId?: string
  date?: string
}

export const dashboardService = {
  /**
   * Fetch dashboard statistics from the backend API
   * @param params - Query parameters for the dashboard request
   * @returns Promise<DashboardStats> - Dashboard statistics data
   */
  async getDashboardStats(params: DashboardParams): Promise<DashboardStats> {
    try {
      const response = await api.get('/api/reports/dashboard', {
        params: {
          clinicId: params.clinicId,
          doctorId: params.doctorId,
          date: params.date || new Date().toISOString().split('T')[0],
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Dashboard API Error:', error)
      throw new Error('Failed to fetch dashboard statistics')
    }
  },

  /**
   * Refresh dashboard data
   * @param params - Query parameters for the dashboard request
   * @returns Promise<DashboardStats> - Updated dashboard statistics
   */
  async refreshDashboard(params: DashboardParams): Promise<DashboardStats> {
    return this.getDashboardStats(params)
  }
}

export default dashboardService
