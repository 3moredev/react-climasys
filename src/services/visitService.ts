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
  }
};

export default visitService;
