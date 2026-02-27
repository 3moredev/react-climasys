import api from './api'

export interface PatientTrendsParams {
  patientId: string
  doctorId?: string | null
  clinicId: string
  shiftId: number
  visitDate: string // YYYY-MM-DD
  patientVisitNo: number
}

export interface PatientTrendItem {
  visitDate: string | null
  patientId: string
  patientVisitNo: number
  statusId: number
  visitTime: string | null
  shiftId: number
  shiftDescription: string | null
  bloodPressure: string | null
  sugar: string | null
  thtext: string | null
  weightInKgs: number | null
  pulse: number | null
  heightInCms: number | null
  tpr: string | null
  importantFindings: string | null
  additionalComments: string | null
  symptomComment: string | null
  systemic: string | null
  odeama: string | null
  pallor: string | null
  gc: string | null
  lastFiveBpValues?: string | null
  lastFiveSugarValues?: string | null
  lastFiveTHValues?: string | null
  lastFiveWeightValues?: string | null
  preDates?: string | null
  preBp?: string | null
  preSugar?: string | null
  preThtext?: string | null
  preWeight?: string | null
  prePulse?: string | null
  preTpr?: string | null
  preSystemic?: string | null
  preOdeama?: string | null
  preHeightInCms?: string | null
  preImportantFindings?: string | null
  preAdditionalComments?: string | null
  preSymptomComment?: string | null
  prePallor?: string | null
  preGc?: string | null
}

export const trendsService = {
  async getPatientTrends(params: PatientTrendsParams): Promise<PatientTrendItem[]> {
    const { patientId, doctorId, clinicId, shiftId, visitDate, patientVisitNo } = params
    const response = await api.get(`/trends/patients/${encodeURIComponent(patientId)}/previous`, {
      params: {
        doctorId: doctorId ?? undefined,
        clinicId,
        shiftId,
        visitDate,
        patientVisitNo,
      },
    })
    // API returns { success, data, ... }
    const data = response.data?.data ?? []
    return data as PatientTrendItem[]
  },
}

export default trendsService
