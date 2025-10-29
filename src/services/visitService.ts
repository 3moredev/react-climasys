import api from './api';

// Visit interface based on the backend response
export interface Visit {
  visit_date: string;
  visit_time: string;
  visit_number: string;
  visit_id: string;
  doctor_id: string;
  clinic_id: string;
  visit_status: string;
  visit_type: string;
}

// Visit history response interface
export interface VisitHistoryResponse {
  visits: Visit[];
  total_visits: number;
  patient_id: string;
}

// Visit details interface for comprehensive visit data
export interface VisitDetails {
  visitId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  clinicId: string;
  visitDate: string;
  shiftId: number;
  status: string;
  chiefComplaint?: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
}

// Comprehensive visit data request interface
export interface ComprehensiveVisitDataRequest {
  patientId: string;
  doctorId: string;
  clinicId: string;
  shiftId: number;
  visitDate: string;
  patientVisitNo: number;
  referBy: string;
  referralName: string;
  referralContact: string;
  referralEmail: string;
  referralAddress: string;
  pulse: number;
  heightInCms: number;
  weightInKgs: number;
  bloodPressure: string;
  sugar: string;
  tft: string;
  pastSurgicalHistory: string;
  previousVisitPlan: string;
  chiefComplaint: string;
  visitComments: string;
  currentMedicines: string;
  hypertension: boolean;
  diabetes: boolean;
  cholestrol: boolean;
  ihd: boolean;
  th: boolean;
  asthama: boolean;
  smoking: boolean;
  tobaco: boolean;
  alchohol: boolean;
  habitDetails: string;
  allergyDetails: string;
  observation: string;
  inPerson: boolean;
  symptomComment: string;
  reason: string;
  impression: string;
  attendedBy: string;
  paymentById: number;
  paymentRemark: string;
  attendedById: number;
  followUp: string;
  followUpFlag: boolean;
  currentComplaint: string;
  visitCommentsField: string;
  tpr: string;
  importantFindings: string;
  additionalComments: string;
  systemic: string;
  odeama: string;
  pallor: string;
  gc: string;
  fmp: string;
  prmc: string;
  pamc: string;
  lmp: string;
  obstetricHistory: string;
  surgicalHistory: string;
  menstrualAddComments: string;
  followUpComment: string;
  followUpDate: string;
  pregnant: boolean;
  edd: string;
  followUpType: string;
  feesToCollect: number;
  feesPaid: number;
  discount: number;
  originalDiscount: number;
  statusId: number;
  userId: string;
  isSubmitPatientVisitDetails: boolean;
}

export const visitService = {
  /**
   * Get patient's visit history (last visits)
   * @param patientId - Patient ID or folder number
   * @returns Promise<VisitHistoryResponse>
   */
  async getPatientVisitHistory(patientId: string): Promise<VisitHistoryResponse> {
    try {
      console.log(`Fetching visit history for patient: ${patientId}`);
      const response = await api.get(`/patients/${patientId}/visits/dates`);
      console.log('Visit history response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get visit history API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 404) {
        throw new Error('Patient visit history not found.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching visit history.');
      }
      
      throw new Error(error.response?.data?.error || 'Failed to fetch visit history');
    }
  },

  /**
   * Get last visit details for a patient
   * @param patientId - Patient ID or folder number
   * @returns Promise<any>
   */
  async getLastVisitDetails(patientId: string): Promise<any> {
    try {
      console.log(`Fetching last visit details for patient: ${patientId}`);
      const response = await api.get(`/visits/last-visit/${patientId}`);
      console.log('Last visit details response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get last visit details API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 404) {
        throw new Error('Last visit details not found.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching last visit details.');
      }
      
      throw new Error(error.response?.data?.error || 'Failed to fetch last visit details');
    }
  },

  /**
   * Get today's visits for a doctor
   * @param params - Parameters including doctorId, shiftId, clinicId, roleId
   * @returns Promise<VisitDetails[]>
   */
  async getTodaysVisits(params: {
    doctorId: string;
    shiftId: string;
    clinicId: string;
    roleId: string;
  }): Promise<VisitDetails[]> {
    try {
      console.log('Fetching today\'s visits with params:', params);
      const response = await api.get('/visits/today', { params });
      console.log('Today\'s visits response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get today\'s visits API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching today\'s visits.');
      }
      
      throw new Error(error.response?.data?.error || 'Failed to fetch today\'s visits');
    }
  },

  /**
   * Get specific visit details
   * @param visitId - Visit ID
   * @returns Promise<VisitDetails>
   */
  async getVisitDetails(visitId: string): Promise<VisitDetails> {
    try {
      console.log(`Fetching visit details for visit: ${visitId}`);
      const response = await api.get(`/visits/${visitId}/details`);
      console.log('Visit details response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get visit details API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 404) {
        throw new Error('Visit details not found.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching visit details.');
      }
      
      throw new Error(error.response?.data?.error || 'Failed to fetch visit details');
    }
  },

  /**
   * Get appointment details for a patient
   * @param params - Parameters including patientId, doctorId, shiftId, clinicId, patientVisitNo, languageId
   * @returns Promise<any>
   */
  async getAppointmentDetails(params: {
    patientId: string;
    doctorId: string;
    shiftId: number;
    clinicId: string;
    patientVisitNo: number;
    languageId?: number;
  }): Promise<any> {
    try {
      console.log('Fetching appointment details with params:', params);
      const response = await api.get('/visits/appointment-details', { params });
      console.log('Appointment details response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get appointment details API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 404) {
        throw new Error('Appointment details not found.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching appointment details.');
      }
      
      throw new Error(error.response?.data?.error || 'Failed to fetch appointment details');
    }
  },

  /**
   * Save comprehensive visit data
   * @param visitData - Comprehensive visit data
   * @returns Promise<any>
   */
  async saveComprehensiveVisitData(visitData: ComprehensiveVisitDataRequest): Promise<any> {
    try {
      console.log('Saving comprehensive visit data:', visitData);
      const response = await api.post('/visits/comprehensive-save-jpa', visitData);
      console.log('Comprehensive visit save response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Save comprehensive visit API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.error || 'Validation failed. Please check your input data.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while saving visit data.');
      }
      
      throw new Error(error.response?.data?.error || 'Failed to save visit data');
    }
  }
};

export default visitService;
