import api from './api';

// Admission Card DTO interface
export interface AdmissionCardDTO {
  patientId?: string;
  patientName: string;
  admissionIpdNo: string;
  ipdFileNo: string;
  admissionDate: string;
  reasonOfAdmission: string;
  dischargeDate: string;
  insurance: string;
  company: string;
  advanceRs: number;
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

// Save Admission Card request interface
export interface AdmissionCardRequest {
  patientId: string;
  doctorId: string;
  clinicId: string;
  ipdRefNo?: string;
  relativeName?: string;
  relation?: string;
  contactNo?: string;
  admissionDate?: string;
  admissionTime?: string;
  reasonOfAdmission?: string;
  department?: string;
  isInsurance?: boolean;
  insuranceDetails?: string;
  treatingDoctor?: string;
  consultingDoctor?: string;
  ipdFileNo?: string;
  roomNo?: string;
  bedNo?: string;
  packageRemarks?: string;
  shiftId?: string;
  loginId?: string;
  referredDoctor?: string;
  commentsNote?: string;
  insuranceCompanyId?: string;
}

// Save Admission Card response interface
export interface SaveAdmissionCardResponse {
  success: boolean;
  saveStatus?: number; // 1 for insert, 2 for update
  message?: string;
  ipdRefNo?: string;
  error?: string;
}

// Department interface
export interface Department {
  name: string; // department_name
}

// Departments response interface
export interface DepartmentsResponse {
  success: boolean;
  count: number;
  data: Department[];
  error?: string;
}

// Admission Data by Patient ID response interface
export interface AdmissionDataByPatientIdResponse {
  success: boolean;
  count: number;
  data: Record<string, any>[]; // All fields from admission_data table
  patientId: string;
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
      
      // if (params.doctorId) {
      //   query.doctorId = params.doctorId;
      // }
      
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
  },

  /**
   * Save or update an admission card
   * Mirrors backend @PostMapping("/save") under @RequestMapping("/api/admission")
   * Saves a new admission card or updates an existing one based on the IPD reference number.
   * If ipdRefNo is provided and an admission exists, it will be updated (saveStatus: 2).
   * Otherwise, a new admission will be created (saveStatus: 1).
   * @param request - Admission card request data
   * @returns Promise<SaveAdmissionCardResponse>
   */
  async saveAdmissionCard(request: AdmissionCardRequest): Promise<SaveAdmissionCardResponse> {
    try {
      console.log('Saving admission card with data:', request);
      
      // Call the backend endpoint /api/admission/save
      // Note: baseURL already includes /api, so we use /admission/save
      const resp = await api.post<SaveAdmissionCardResponse>(`/admission`, request);
      console.log('Save admission card response:', resp.data);
      return resp.data;
    } catch (error: any) {
      console.error('Save admission card API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        const msg = error.response?.data?.message || error.response?.data?.error || 'Invalid request parameters.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('Save admission card endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while saving admission card.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to save admission card');
    }
  },

  /**
   * Get all departments
   * Mirrors backend @GetMapping("/departments") 
   * Retrieves all distinct departments from doctors_department table.
   * Returns departments with Name and ID (both are department_name).
   * Used for populating department dropdown in Admission Card form.
   * @returns Promise<DepartmentsResponse>
   */
  async getAllDepartments(): Promise<DepartmentsResponse> {
    try {
      console.log('Fetching all departments');
      
      // Call the backend endpoint /api/admission/departments
      // Note: baseURL already includes /api, so we use /admission/departments
      const resp = await api.get<DepartmentsResponse>(`/departments`);
      console.log('Get all departments response:', resp.data);
      return resp.data;
    } catch (error: any) {
      console.error('Get all departments API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        const msg = error.response?.data?.message || error.response?.data?.error || 'Invalid request parameters.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('Get all departments endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching departments.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to fetch departments');
    }
  },

  /**
   * Get admission data by patient ID
   * Mirrors backend @GetMapping("/patient/{patientId}") under @RequestMapping("/api/admission")
   * Retrieves all admission records from admission_data table for a specific patient.
   * Returns all fields from the admission_data table including IPD reference number,
   * admission date/time, reason, department, insurance details, etc.
   * @param patientId - Patient ID (required, e.g., "01-10-2021-051429")
   * @returns Promise<AdmissionDataByPatientIdResponse>
   */
  async getAdmissionDataByPatientId(patientId: string): Promise<AdmissionDataByPatientIdResponse> {
    try {
      console.log('Fetching admission data for patient ID:', patientId);
      
      // Call the backend endpoint /api/admission/patient/{patientId}
      // Note: baseURL already includes /api, so we use /admission/patient/{patientId}
      const resp = await api.get<AdmissionDataByPatientIdResponse>(`/admission/patient/${patientId}`);
      console.log('Get admission data by patient ID response:', resp.data);
      return resp.data;
    } catch (error: any) {
      console.error('Get admission data by patient ID API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        const msg = error.response?.data?.message || error.response?.data?.error || 'Invalid request parameters.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        // 404 is a valid response when no records are found, but we still return the response
        if (error.response?.data) {
          return error.response.data;
        }
        throw new Error('No admission records found for the patient.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching admission data.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to fetch admission data by patient ID');
    }
  }
};

export default admissionService;

