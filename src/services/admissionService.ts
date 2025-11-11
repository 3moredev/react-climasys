import api from './api';

// Admission Card DTO interface
export interface AdmissionCardDTO {
  patientName: string;
  admissionIpdNo: string;
  ipdFileNo: string;
  admissionDate: string;
  reasonOfAdmission: string;
  dischargeDate: string;
  insurance: string;
  company: string;
  advance: number;
}

// Admission Cards request parameters
export interface AdmissionCardsRequest {
  patientId?: string;
  doctorId?: string;
  clinicId: string;
}

// Admission Cards response interface
export interface AdmissionCardsResponse {
  success: boolean;
  count: number;
  data: AdmissionCardDTO[];
  doctorId?: string;
  clinicId: string;
  error?: string;
}

// Search Admission Cards request parameters
export interface SearchAdmissionCardsRequest {
  searchStr: string;
  doctorId?: string;
  clinicId: string;
}

// Search Admission Cards response interface
export interface SearchAdmissionCardsResponse {
  success: boolean;
  count: number;
  data: AdmissionCardDTO[];
  searchStr: string;
  doctorId?: string;
  clinicId: string;
  error?: string;
}

export const admissionService = {
  /**
   * Get list of admitted patients (admission cards)
   * Mirrors backend @GetMapping("/cards") under @RequestMapping("/api/admission")
   * Retrieves all admission cards matching the Manage Admission Card page format.
   * Returns fields: Patient Name, Admission/IPD No, IPD File No, Admission Date,
   * Reason of Admission, Discharge Date, Insurance, Company, Advance (Rs).
   * If doctorId is not provided, returns admission cards for all doctors in the clinic.
   * @param params - Request parameters including patientId (optional), doctorId (optional), and clinicId (required)
   * @returns Promise<AdmissionCardsResponse>
   */
  async getAdmissionCards(params: AdmissionCardsRequest): Promise<AdmissionCardsResponse> {
    try {
      console.log('Fetching admission cards with params:', params);
      
      // Build query parameters
      const query: Record<string, string> = {
        clinicId: params.clinicId
      };
      
      if (params.patientId) {
        query.patientId = params.patientId;
      }
      
      if (params.doctorId) {
        query.doctorId = params.doctorId;
      }
      
      // Call the backend endpoint /api/admission/cards
      // Note: baseURL already includes /api, so we use /admission/cards
      const resp = await api.get<AdmissionCardsResponse>(`/admission/cards`, { params: query });
      console.log('Get admission cards response:', resp.data);
      return resp.data;
    } catch (error: any) {
      console.error('Get admission cards API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        const msg = error.response?.data?.message || error.response?.data?.error || 'Invalid request parameters.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('Admission cards endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching admission cards.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to fetch admission cards');
    }
  },

  /**
   * Search admission cards by patient ID, name, contact number, or IPD number
   * Mirrors backend @GetMapping("/cards/search") under @RequestMapping("/api/admission")
   * Search admission cards by patient ID, patient name, contact number, or IPD number.
   * If doctorId is not provided, searches across all doctors in the clinic.
   * @param params - Request parameters including searchStr (required), doctorId (optional), and clinicId (required)
   * @returns Promise<SearchAdmissionCardsResponse>
   */
  async searchAdmissionCards(params: SearchAdmissionCardsRequest): Promise<SearchAdmissionCardsResponse> {
    try {
      console.log('Searching admission cards with params:', params);
      
      // Build query parameters
      const query: Record<string, string> = {
        searchStr: params.searchStr,
        clinicId: params.clinicId
      };
      
      if (params.doctorId) {
        query.doctorId = params.doctorId;
      }
      
      // Call the backend endpoint /api/admission/cards/search
      // Note: baseURL already includes /api, so we use /admission/cards/search
      const resp = await api.get<SearchAdmissionCardsResponse>(`/admission/cards/search`, { params: query });
      console.log('Search admission cards response:', resp.data);
      return resp.data;
    } catch (error: any) {
      console.error('Search admission cards API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        const msg = error.response?.data?.message || error.response?.data?.error || 'Invalid request parameters.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('Search admission cards endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while searching admission cards.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to search admission cards');
    }
  }
};

export default admissionService;

