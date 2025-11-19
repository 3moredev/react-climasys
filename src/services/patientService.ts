import api from './api';
import type { 
  AdmissionCardDTO as AdmissionServiceAdmissionCardDTO,
  AdmissionCardsRequest as AdmissionServiceAdmissionCardsRequest,
  AdmissionCardsResponse as AdmissionServiceAdmissionCardsResponse
} from './admissionService';

// Patient interface based on the backend response
export interface Patient {
  id: string;
  folder_no: string;
  full_name: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  mobile_1: string;
  date_of_birth: string;
  gender_id: string;
  registration_status: string;
  date_of_registration: string;
  age_given: string;
  reports_received: boolean;
  doctor_id: string;
  
}

// Search response interface
export interface PatientSearchResponse {
  patients: Patient[];
  total_count: number;
  page: number;
  size: number;
  query: string;
  status: string;
}

// Search parameters interface
export interface PatientSearchParams {
  query: string;
  status?: string;
  page?: number;
  size?: number;
  clinicId?: string;
}

// Error response interface
export interface ErrorResponse {
  error: string;
}

// Response for lab tests by doctor
export interface LabTestsByDoctorResponse {
  success: boolean;
  // The backend may return additional keys like data, tests, message, etc.
  [key: string]: any;
}

// Lab tests with parameters response
export interface LabTestsWithParametersResponse {
  success: boolean;
  // Expected shape: { success, labTests: [...], parameters: {...} } but keep flexible
  [key: string]: any;
}

// Submit Lab Test Results - request/response contracts
export interface LabTestResultRequest {
  patientId: string;
  patientVisitNo: number;
  doctorId: string;
  clinicId: string;
  shiftId: number;
  userId: string;
  doctorName: string;
  labName: string;
  reportDate: string;
  comment: string;
  testReportData: Array<{
    visitDate: string;
    patientVisitNo: number;
    shiftId: number;
    clinicId: string;
    doctorId: string;
    patientId: string;
    labTestDescription: string;
    parameterName: string;
    testParameterValue: string;
  }>;
}

export interface LabTestResultResponse {
  success: boolean;
  message?: string;
  // Flexible payload fields from backend
  [key: string]: any;
}

// Save Medicine Overwrite request/response contracts
export interface SaveMedicineOverwriteRequest {
  visitDate: string;
  patientVisitNo: number;
  shiftId: number;
  clinicId: string;
  doctorId: string;
  patientId: string;
  medicineRows: Array<Record<string, any>>;
  prescriptionRows: Array<Record<string, any>>;
  feesToCollect: number;
  feesCollected: number;
  userId: string;
  statusId: number;
  bloodPressure?: string;
  allergyDetails?: string;
  habitDetails?: string;
  comment?: string;
  paymentById?: number;
  paymentRemark?: string;
  discount?: number;
}

export interface SaveMedicineOverwriteResponse {
  success: boolean;
  message?: string;
  [key: string]: any;
}

// Update addendum request/response contracts
export interface UpdateAddendumRequest {
  addendum: string;
  visitDate: string; // YYYY-MM-DD or ISO date-time
  patientId: string;
  patientVisitNo: number;
  userId: string;
}

export interface UpdateAddendumResponse {
  success: boolean;
  message?: string;
  [key: string]: any;
}

// Master lists request/response contracts
export interface MasterListsRequest {
  patientId: string;
  shiftId: number; // Java Short -> number in TS
  clinicId: string;
  doctorId: string;
  visitDate: string; // YYYY-MM-DD
  patientVisitNo: number;
}

export interface MasterListsResponse {
  success: boolean;
  // Backend returns a map of lists; keep flexible
  [key: string]: any;
}

// All reference data response (flexible map)
export interface AllReferenceDataResponse {
  // The backend returns a map of reference lists keyed by name
  [key: string]: any;
}

// Patient profile ref data response (flexible map)
export interface PatientProfileRefDataResponse {
  [key: string]: any;
}

// Previous service visit dates response (flexible map)
export interface PreviousServiceVisitDatesResponse {
  success?: boolean;
  [key: string]: any;
}

// Previous service visit items response (flexible map)
export interface PreviousServiceVisitItemsResponse {
  success?: boolean;
  items?: any[];
  [key: string]: any;
}

// Consolidated family fees request interface
export interface ConsolidatedFamilyFeesRequest {
  patientId: string;
  doctorId?: string; // optional
  clinicId: string;
}

// Consolidated family fees response (flexible map)
export interface ConsolidatedFamilyFeesResponse {
  success?: boolean;
  [key: string]: any;
}

// Fees details request interface
export interface FeesDetailsRequest {
  patientId: string;
  doctorId?: string; // optional
  clinicId: string;
}

// Fees details response (flexible map)
export interface FeesDetailsResponse {
  success?: boolean;
  [key: string]: any;
}

// Complaints for doctor response (flexible map array)
export type ComplaintsForDoctorResponse = Array<Record<string, any>>;

// Delete complaint response interface
export interface DeleteComplaintResponse {
  message?: string;
  error?: string;
  success?: boolean;
  [key: string]: any;
}

// Create complaint request interface
export interface CreateComplaintRequest {
  shortDescription?: string;
  short_description?: string;
  complaintDescription?: string;
  complaint_description?: string;
  priority?: number;
  priority_value?: number;
  displayToOperator?: boolean;
  display_to_operator?: boolean | number;
  doctorId?: string;
  doctor_id?: string;
  clinicId?: string;
  clinic_id?: string;
  [key: string]: any; // Allow additional fields
}

// Create complaint response interface
export interface CreateComplaintResponse {
  id?: string;
  shortDescription?: string;
  short_description?: string;
  complaintDescription?: string;
  complaint_description?: string;
  priority?: number;
  priority_value?: number;
  displayToOperator?: boolean;
  display_to_operator?: boolean | number;
  message?: string;
  error?: string;
  success?: boolean;
  [key: string]: any;
}

// Quick registration request interface
export interface QuickRegistrationRequest {
  doctorId: string;
  lastName: string;
  middleName?: string;
  firstName: string;
  mobile: string;
  areaId?: number;
  cityId?: string;
  stateId?: string;
  countryId?: string;
  dob?: string;
  age?: string;
  gender: string;
  regYear?: string;
  familyFolder?: string;
  registrationStatus?: string;
  userId: string;
  referBy?: string;
  referDoctorDetails?: string;
  maritalStatus?: string;
  occupation?: number;
  address?: string;
  patientEmail?: string;
  doctorAddress?: string;
  doctorMobile?: string;
  doctorEmail?: string;
  clinicId: string;
}

// Quick registration response interface
export interface QuickRegistrationResponse {
  ID?: string;
  message?: string;
  SAVE_STATUS?: number;
  success?: boolean;
  patientId?: string;
  rowsAffected?: number;
  error?: string;
}

// Visit interface for previous visit dates
export interface PatientVisit {
  visit_date: string;
  visit_time: string;
  visit_number: number;
  patient_visit_no: number;
  visit_id: number;
  doctor_id: string;
  clinic_id: string;
  visit_status: number;
  status_id: number;
  shift_id: number;
  visit_type: number;
  patient_last_visit_no?: number;
}

// Previous visit dates response interface
export interface PreviousVisitDatesResponse {
  visits: PatientVisit[];
  total_visits: number;
  patient_id: string;
  uses_patient_last_visit_no?: boolean;
}

// Detailed patient visit interface for previous visits with comprehensive data
export interface PatientVisitDetails {
  patient_id: string;
  doctor_id: string;
  clinic_id: string;
  shift_id: string;
  patient_visit_no: number;
  visit_date: string;
  visit_time: string;
  status_id: number;
  instructions: string;
  fees_to_collect: number;
  fees_collected: number;
  weight_in_kgs: number;
  visit_comments: string;
  observation: string;
  pulse: string;
  blood_pressure: string;
  height_in_cms: number;
  sugar: string;
  hypertension: boolean;
  diabetes: boolean;
  cholestrol: boolean;
  ihd: boolean;
  th: boolean;
  asthama: boolean;
  smoking: boolean;
  tobaco: boolean;
  alchohol: boolean;
  current_complaints: string;
  current_medicines: string;
  important_findings: string;
  additional_comments: string;
  systemic: string;
  odeama: string;
  pallor: string;
  gc: string;
  follow_up: boolean;
  is_follow_up: boolean;
  follow_up_comment: string;
  follow_up_date: string;
  follow_up_type: number;
  pregnant: boolean;
  edd: string;
  obstetrics_history: string;
  surgical_history_past_history: string;
  gynec_additional_comments: string;
  fmp: string;
  prmc: string;
  pamc: string;
  lmp: string;
  discount: number;
  original_discount: number;
  is_submit_patient_visit_details: boolean;
  refer_id: string;
  refer_doctor_details: string;
  addendum: string;
  created_on: string;
  createdby_name: string;
  modified_on: string;
  modifiedby_name: string;
  medicine_names: string;
  complaints: string;
  diagnosis: string;
  doctor_name: string;
  followup_description: string;
  plr_indicators: string;
}

// Previous visits with details response interface
export interface PreviousVisitsWithDetailsResponse {
  visits: PatientVisitDetails[];
  total_visits: number;
  patient_id: string;
}

// Admission Card DTO interface - DEPRECATED: Use admissionService types instead
// These are kept for backward compatibility but should be imported from admissionService
// Re-export for backward compatibility
export { 
  AdmissionServiceAdmissionCardDTO as AdmissionCardDTO,
  AdmissionServiceAdmissionCardsRequest as AdmissionCardsRequest,
  AdmissionServiceAdmissionCardsResponse as AdmissionCardsResponse
};

export const patientService = {
  /**
   * Search patients with pagination support
   * @param params - Search parameters including query, status, page, and size
   * @returns Promise<PatientSearchResponse>
   */
  async searchPatients(params: PatientSearchParams): Promise<PatientSearchResponse> {
    try {
      console.log('Searching patients with params:', params);
      
      const searchParams = new URLSearchParams({
        query: params.query,
        status: params.status || 'all',
        page: (params.page || 0).toString(),
        size: (params.size || 20).toString()
      });

      // Add clinicId if provided
      if (params.clinicId) {
        searchParams.append('clinicId', params.clinicId);
      }

      const response = await api.get(`/patients/search?${searchParams.toString()}`);
      console.log('Search patients response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Search patients API Error:', error);
      
      // Handle CORS and network errors
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      // Handle HTTP errors
      if (error.response?.status === 400) {
        throw new Error('Invalid search request. Please check your search parameters.');
      } else if (error.response?.status === 404) {
        throw new Error('Search endpoint not found. Please check your backend configuration.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while searching patients.');
      }
      
      // Handle backend-specific errors
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to search patients');
    }
  },

  /**
   * Get a single patient by ID
   * @param id - Patient ID
   * @returns Promise<Patient>
   */
  async getPatient(id: number | string): Promise<Patient> {
    try {
      console.log(`Fetching patient with ID: ${id}`);
      const response = await api.get(`/patients/${id}`);
      console.log('Get patient response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get patient API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 404) {
        throw new Error('Patient not found.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching patient.');
      }
      
      throw new Error(error.response?.data?.message || 'Failed to fetch patient');
    }
  },

  /**
   * Quick register a new patient
   * @param patientData - Patient registration data
   * @returns Promise<QuickRegistrationResponse>
   */
  async quickRegister(patientData: QuickRegistrationRequest): Promise<QuickRegistrationResponse> {
    try {
      console.log('Registering patient with data:', patientData);
      const response = await api.post<QuickRegistrationResponse>('/patients', patientData);
      console.log('Patient registration response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error registering patient:', error);
      if (error.response?.data) {
        return {
          success: false,
          error: error.response.data.error || 'Registration failed'
        };
      }
      return {
        success: false,
        error: 'Network error during registration'
      };
    }
  },

  /**
   * Get all patients with pagination
   * @param page - Page number (default: 0)
   * @param size - Page size (default: 20)
   * @param status - Registration status filter (default: 'all')
   * @returns Promise<PatientSearchResponse>
   */
  async getAllPatients(page: number = 0, size: number = 20, status: string = 'all', clinicId?: string): Promise<PatientSearchResponse> {
    try {
      console.log(`Fetching all patients - page: ${page}, size: ${size}, status: ${status}, clinicId: ${clinicId}`);
      
      const searchParams = new URLSearchParams({
        query: '', // Empty query to get all patients
        status: status,
        page: page.toString(),
        size: size.toString()
      });

      // Add clinicId if provided
      if (clinicId) {
        searchParams.append('clinicId', clinicId);
      }

      const response = await api.get(`/patients/search?${searchParams.toString()}`);
      console.log('Get all patients response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Get all patients API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching patients.');
      }
      
      throw new Error(error.response?.data?.message || 'Failed to fetch patients');
    }
  },

  /**
   * Get previous visit dates for a patient
   * @param patientId - Patient ID from the database (not folder number)
   * @returns Promise<PreviousVisitDatesResponse>
   */
  async getPreviousVisitDates(patientId: string, queryParams?: string): Promise<PreviousVisitDatesResponse> {
    try {
      console.log(`Fetching previous visit dates for patient ID: ${patientId}${queryParams ? ` with params: ${queryParams}` : ''}`);
      
      // Use the patient_id from the database, not the folder number or other identifier
      const url = queryParams ? `/patients/${patientId}/visits/dates?${queryParams}` : `/patients/${patientId}/visits/dates`;
      const response = await api.get(url);
      console.log('Get previous visit dates response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Get previous visit dates API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 404) {
        throw new Error('Patient not found or no visits found.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching visit dates.');
      }
      
      // Handle backend-specific errors
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to fetch previous visit dates');
    }
  },

  /**
   * Get patient previous visits with comprehensive details including medicines, complaints, diagnosis, and PLR indicators
   * @param patientId - Patient ID from the database
   * @param todaysDate - Today's date in YYYY-MM-DD format (optional, defaults to current date)
   * @returns Promise<PreviousVisitsWithDetailsResponse>
   */
  async getPatientPreviousVisitsWithDetails(patientId: string, todaysDate?: string): Promise<PreviousVisitsWithDetailsResponse> {
    try {
      console.log(`Fetching previous visits with details for patient ID: ${patientId}${todaysDate ? ` up to date: ${todaysDate}` : ''}`);
      
      // Use current date if not provided
      const dateParam = todaysDate || new Date().toISOString().split('T')[0];
      
      const searchParams = new URLSearchParams({
        patientId: patientId,
        todaysDate: dateParam
      });

      const response = await api.get(`/patients/${patientId}/visits/details?${searchParams.toString()}`);
      console.log('Get patient previous visits with details response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Get patient previous visits with details API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 404) {
        throw new Error('Patient not found or no visits found.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching visit details.');
      }
      
      // Handle backend-specific errors
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to fetch patient previous visits with details');
    }
  },



  
  /**
   * Get master lists required for visit-related UIs (diagnosis, complaints, meds, etc.)
   * Mirrors backend @GetMapping("/master-lists") which accepts query params.
   */
  async getMasterLists(params: MasterListsRequest): Promise<MasterListsResponse> {
    try {
      console.log('Fetching master lists with params:', params);
      // Primary endpoint as specified
      try {
        const resp = await api.get<MasterListsResponse>(`/visits/master-lists`, { params });
        console.log('Master lists response ("/master-lists"):', resp.data);
        return resp.data;
      } catch (e1: any) {
        if (e1?.response?.status !== 404) throw e1;
        // Common alternative mount points
        try {
          const resp = await api.get<MasterListsResponse>(`/visits/master-lists`, { params });
          console.log('Master lists response ("/visits/master-lists"):', resp.data);
          return resp.data;
        } catch (e2: any) {
          if (e2?.response?.status !== 404) throw e2;
          const resp = await api.get<MasterListsResponse>(`/lab/master/visits/master-lists`, { params });
          console.log('Master lists response ("/lab/master/visits/master-lists"):', resp.data);
          return resp.data;
        }
      }
    } catch (error: any) {
      console.error('Get master lists API Error:', error);
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      if (error.response?.status === 400) {
        const msg = error.response?.data?.message || error.response?.data?.error || 'Invalid request parameters.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('Master lists endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching master lists.');
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch master lists');
    }
  },

  /**
   * Get master lists for services
   * Mirrors backend @GetMapping("/master-lists") under services controller which calls getMasterListsForServices
   */
  async getMasterListsForServices(params: MasterListsRequest): Promise<MasterListsResponse> {
    try {
      console.log('Fetching master lists for services with params:', params);
      // Primary endpoint as specified - services-specific master lists
      try {
        const resp = await api.get<MasterListsResponse>(`/services/master-lists`, { params });
        console.log('Master lists for services response ("/services/master-lists"):', resp.data);
        return resp.data;
      } catch (e1: any) {
        if (e1?.response?.status !== 404) throw e1;
        // Fallback to alternative mount points
        try {
          const resp = await api.get<MasterListsResponse>(`/master-lists`, { params });
          console.log('Master lists for services response ("/master-lists"):', resp.data);
          return resp.data;
        } catch (e2: any) {
          if (e2?.response?.status !== 404) throw e2;
          const resp = await api.get<MasterListsResponse>(`/services/visits/master-lists`, { params });
          console.log('Master lists for services response ("/services/visits/master-lists"):', resp.data);
          return resp.data;
        }
      }
    } catch (error: any) {
      console.error('Get master lists for services API Error:', error);
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      if (error.response?.status === 400) {
        const msg = error.response?.data?.message || error.response?.data?.error || 'Invalid request parameters.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('Master lists for services endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching master lists for services.');
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch master lists for services');
    }
  },

  /**
   * Get lab tests available for a given doctor and clinic
   * @param doctorId - Doctor ID (e.g., DR-00001)
   * @param clinicId - Clinic ID (e.g., CLINIC001)
   * @returns Promise<LabTestsByDoctorResponse>
   */
  async getLabTestsByDoctor(doctorId: string, clinicId: string): Promise<LabTestsByDoctorResponse> {
    try {
      console.log(`Fetching lab tests for doctor: ${doctorId} and clinic: ${clinicId}`);
      // Primary endpoint with clinic ID
      try {
        const response = await api.get(`/lab/master/tests/doctor/${encodeURIComponent(doctorId)}/clinic/${encodeURIComponent(clinicId)}`);
        console.log('Get lab tests by doctor and clinic response (/lab/master/tests/doctor/{id}/clinic/{id}):', response.data);
        return response.data as LabTestsByDoctorResponse;
      } catch (primaryError: any) {
        // Fallback 1: query-param based
        if (primaryError?.response?.status !== 404) throw primaryError;
        try {
          const response = await api.get(`/lab/tests`, { params: { doctorId, clinicId } });
          console.log('Get lab tests by doctor and clinic response (/lab/tests):', response.data);
          return response.data as LabTestsByDoctorResponse;
        } catch (secondaryError: any) {
          // Fallback 2: legacy path
          if (secondaryError?.response?.status !== 404) throw secondaryError;
          const response = await api.get(`/tests/doctor/${encodeURIComponent(doctorId)}/clinic/${encodeURIComponent(clinicId)}`);
          console.log('Get lab tests by doctor and clinic response (/tests/doctor/{id}/clinic/{id}):', response.data);
          return response.data as LabTestsByDoctorResponse;
        }
      }
    } catch (error: any) {
      console.error('Get lab tests by doctor API Error:', error);
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      if (error.response?.status === 400) {
        throw new Error('Invalid doctor ID or request.');
      } else if (error.response?.status === 404) {
        throw new Error('Doctor not found or no lab tests available.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching lab tests.');
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch lab tests for doctor');
    }
  }

  ,

  /**
   * Get all lab tests WITH parameters for the given doctor and clinic
   * Mirrors backend @GetMapping("/doctor/{doctorId}/clinic/{clinicId}/all-with-parameters")
   */
  async getAllLabTestsWithParameters(doctorId: string, clinicId: string): Promise<LabTestsWithParametersResponse> {
    try {
      console.log(`Fetching lab tests WITH parameters for doctor: ${doctorId} and clinic: ${clinicId}`);
      // Try several common base paths to be resilient to routing differences
      // 1) As provided
      try {
        const resp = await api.get(`/lab/master/parameters/doctor/${encodeURIComponent(doctorId)}/clinic/${encodeURIComponent(clinicId)}/all-with-parameters`);
        console.log('Lab tests with parameters ("/doctor/{id}/clinic/{id}/all-with-parameters"):', resp.data);
        return resp.data as LabTestsWithParametersResponse;
      } catch (e1: any) {
        if (e1?.response?.status !== 404) throw e1;
        // 2) Under /lab/tests prefix
        try {
          const resp = await api.get(`/lab/tests/doctor/${encodeURIComponent(doctorId)}/clinic/${encodeURIComponent(clinicId)}/all-with-parameters`);
          console.log('Lab tests with parameters ("/lab/tests/doctor/{id}/clinic/{id}/all-with-parameters"):', resp.data);
          return resp.data as LabTestsWithParametersResponse;
        } catch (e2: any) {
          if (e2?.response?.status !== 404) throw e2;
          // 3) Under /lab/master/tests prefix
          try {
            const resp = await api.get(`/lab/master/tests/doctor/${encodeURIComponent(doctorId)}/clinic/${encodeURIComponent(clinicId)}/all-with-parameters`);
            console.log('Lab tests with parameters ("/lab/master/tests/doctor/{id}/clinic/{id}/all-with-parameters"):', resp.data);
            return resp.data as LabTestsWithParametersResponse;
          } catch (e3: any) {
            if (e3?.response?.status !== 404) throw e3;
            // 4) Query-param variant
            const resp = await api.get(`/lab/tests/with-parameters`, { params: { doctorId, clinicId } });
            console.log('Lab tests with parameters ("/lab/tests/with-parameters?doctorId=&clinicId="):', resp.data);
            return resp.data as LabTestsWithParametersResponse;
          }
        }
      }
    } catch (error: any) {
      console.error('Get lab tests WITH parameters API Error:', error);
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      if (error.response?.status === 400) {
        throw new Error('Invalid doctor ID or request.');
      } else if (error.response?.status === 404) {
        throw new Error('Doctor not found or no lab tests available.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching lab tests with parameters.');
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch lab tests with parameters');
    }
  }
  ,

  /**
   * Get previous service visit dates for a patient/doctor/clinic
   * Mirrors backend @GetMapping("/previous-visit-dates") with optional todaysVisitDate
   */
  async getPreviousServiceVisitDates(params: {
    patientId: string;
    // doctorId: string;
    clinicId: string;
    todaysVisitDate?: string;
  }): Promise<PreviousServiceVisitDatesResponse> {
    try {
      const { patientId, clinicId, todaysVisitDate } = params;
      console.log('Fetching previous service visit dates:', params);
      const query = {
        patientId,
        // doctorId,
        clinicId,
        ...(todaysVisitDate ? { todaysVisitDate } : {})
      } as Record<string, string>;
      // Try common mount points
      try {
        const resp = await api.get<PreviousServiceVisitDatesResponse>(`/services/previous-visit-dates`, { params: query });
        console.log('Previous service visit dates (/api/services/previous-visit-dates):', resp.data);
        return resp.data;
      } catch (e1: any) {
        if (e1?.response?.status !== 404) throw e1;
        try {
          const resp = await api.get<PreviousServiceVisitDatesResponse>(`/previous-visit-dates`, { params: query });
          console.log('Previous service visit dates (/previous-visit-dates):', resp.data);
          return resp.data;
        } catch (e2: any) {
          if (e2?.response?.status !== 404) throw e2;
          const resp = await api.get<PreviousServiceVisitDatesResponse>(`/services/previous-visit-dates`, { params: query });
          console.log('Previous service visit dates (/api/services/previous-visit-dates):', resp.data);
          return resp.data;
        }
      }
    } catch (error: any) {
      console.error('Get previous service visit dates API Error:', error);
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      if (error.response?.status === 400) {
        const msg = error.response?.data?.message || error.response?.data?.error || 'Invalid request.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('Previous service visit dates endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching previous service visit dates.');
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch previous service visit dates');
    }
  }
  ,
  /**
   * Get line items for a previous service visit
   * Mirrors backend @GetMapping("/previous-visit-items") with required params
   */
  async getPreviousServiceVisitItems(params: {
    patientId: string;
    doctorId: string;
    clinicId: string;
    shiftId: number; // Java Short -> number in TS
    visitNo: number; // Java Integer -> number in TS
    visitDate: string; // Accepts YYYY-MM-DD or date-time string
  }): Promise<PreviousServiceVisitItemsResponse> {
    try {
      const { patientId, clinicId, shiftId, visitNo, visitDate } = params;
      console.log('Fetching previous service visit items:', params);
      const query = {
        patientId,
        clinicId,
        shiftId: String(shiftId),
        visitNo: String(visitNo),
        visitDate
      } as Record<string, string>;
      // Try common mount points
      try {
        const resp = await api.get<PreviousServiceVisitItemsResponse>(`/services/previous-visit-items`, { params: query });
        console.log('Previous service visit items (/services/previous-visit-items):', resp.data);
        return resp.data;
      } catch (e1: any) {
        if (e1?.response?.status !== 404) throw e1;
        try {
          const resp = await api.get<PreviousServiceVisitItemsResponse>(`/previous-visit-items`, { params: query });
          console.log('Previous service visit items (/previous-visit-items):', resp.data);
          return resp.data;
        } catch (e2: any) {
          if (e2?.response?.status !== 404) throw e2;
          const resp = await api.get<PreviousServiceVisitItemsResponse>(`/services/previous-visit-items`, { params: query });
          console.log('Previous service visit items (retry /services/previous-visit-items):', resp.data);
          return resp.data;
        }
      }
    } catch (error: any) {
      console.error('Get previous service visit items API Error:', error);
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      if (error.response?.status === 400) {
        const msg = error.response?.data?.message || error.response?.data?.error || 'Invalid request.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('Previous service visit items endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching previous service visit items.');
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch previous service visit items');
    }
  }
  ,
  /**
   * Get consolidated family fees for a patient
   * Mirrors backend @GetMapping("/consolidated-family-fees")
   */
  async getConsolidatedFamilyFees(params: ConsolidatedFamilyFeesRequest): Promise<ConsolidatedFamilyFeesResponse> {
    try {
      const { patientId, doctorId, clinicId } = params;
      console.log('Fetching consolidated family fees:', params);
      
      // Build query parameters - doctorId is optional
      const query: Record<string, string> = {
        patientId,
        clinicId
      };
      if (doctorId) {
        query.doctorId = doctorId;
      }
      
      // Try common mount points
      try {
        const resp = await api.get<ConsolidatedFamilyFeesResponse>(`/fees/consolidated-family-fees`, { params: query });
        console.log('Consolidated family fees (/fees/consolidated-family-fees):', resp.data);
        return resp.data;
      } catch (e1: any) {
        if (e1?.response?.status !== 404) throw e1;
        try {
          const resp = await api.get<ConsolidatedFamilyFeesResponse>(`/consolidated-family-fees`, { params: query });
          console.log('Consolidated family fees (/consolidated-family-fees):', resp.data);
          return resp.data;
        } catch (e2: any) {
          if (e2?.response?.status !== 404) throw e2;
          const resp = await api.get<ConsolidatedFamilyFeesResponse>(`/services/consolidated-family-fees`, { params: query });
          console.log('Consolidated family fees (/services/consolidated-family-fees):', resp.data);
          return resp.data;
        }
      }
    } catch (error: any) {
      console.error('Get consolidated family fees API Error:', error);
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      if (error.response?.status === 400) {
        const msg = error.response?.data?.message || error.response?.data?.error || 'Invalid request.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('Consolidated family fees endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching consolidated family fees.');
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch consolidated family fees');
    }
  }
  ,
  /**
   * Get fees details for a patient
   * Mirrors backend @GetMapping("/details")
   */
  async getFeesDetails(params: FeesDetailsRequest): Promise<FeesDetailsResponse> {
    try {
      const { patientId, doctorId, clinicId } = params;
      console.log('Fetching fees details:', params);
      
      // Build query parameters - doctorId is optional
      const query: Record<string, string> = {
        patientId,
        clinicId
      };
      if (doctorId) {
        query.doctorId = doctorId;
      }
      
      // Try common mount points
      try {
        const resp = await api.get<FeesDetailsResponse>(`/fees/details`, { params: query });
        console.log('Fees details (/fees/details):', resp.data);
        return resp.data;
      } catch (e1: any) {
        if (e1?.response?.status !== 404) throw e1;
        try {
          const resp = await api.get<FeesDetailsResponse>(`/details`, { params: query });
          console.log('Fees details (/details):', resp.data);
          return resp.data;
        } catch (e2: any) {
          if (e2?.response?.status !== 404) throw e2;
          const resp = await api.get<FeesDetailsResponse>(`/services/details`, { params: query });
          console.log('Fees details (/services/details):', resp.data);
          return resp.data;
        }
      }
    } catch (error: any) {
      console.error('Get fees details API Error:', error);
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      if (error.response?.status === 400) {
        const msg = error.response?.data?.message || error.response?.data?.error || 'Invalid request.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('Fees details endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching fees details.');
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch fees details');
    }
  }
  ,
  /**
   * Submit lab test results
   * Mirrors backend @PostMapping("/submit") under the lab test results controller.
   * This method tries multiple common base paths for resilience.
   */
  async submitLabTestResults(request: LabTestResultRequest): Promise<LabTestResultResponse> {
    try {
      console.log('Submitting lab test results:', request);
      // Try several common base paths to accommodate different deployments
      // 1) Dedicated results controller under /lab/master/results
      try {
        const resp = await api.post<LabTestResultResponse>(`/lab/results/submit`, request);
        console.log('Submit lab test results (/lab/master/results/submit):', resp.data);
        return resp.data;
      } catch (e1: any) {
        if (e1?.response?.status !== 404) throw e1; 
        // 2) Under /lab/results
        try {
          const resp = await api.post<LabTestResultResponse>(`/lab/master/results/submit`, request);
          console.log('Submit lab test results (/lab/results/submit):', resp.data);
          return resp.data;
        } catch (e2: any) {
          if (e2?.response?.status !== 404) throw e2;
          // 3) Under /lab/tests/results
          try {
            const resp = await api.post<LabTestResultResponse>(`/lab/tests/results/submit`, request);
            console.log('Submit lab test results (/lab/tests/results/submit):', resp.data);
            return resp.data;
          } catch (e3: any) {
            if (e3?.response?.status !== 404) throw e3;
            // 4) Fallback root mapping if controller is mounted at "/submit"
            const resp = await api.post<LabTestResultResponse>(`/submit`, request);
            console.log('Submit lab test results (/submit):', resp.data);
            return resp.data;
          }
        }
      }
    } catch (error: any) {
      console.error('Submit lab test results API Error:', error);
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      if (error.response?.status === 400) {
        // Propagate backend validation messages when available
        const msg = error.response?.data?.message || error.response?.data?.error || 'Invalid request payload.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('Submit endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while submitting lab test results.');
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(error.response?.data?.message || 'Failed to submit lab test results');
    }
  },

  /**
   * Get lab test results for a patient visit
   * Mirrors backend @GetMapping("/visit") under the lab test results controller.
   */
  async getLabTestResultsForVisit(params: {
    patientId: string;
    patientVisitNo: number;
    shiftId: number;
    clinicId: string;
    doctorId: string;
    visitDate: string; // ISO date-time string or YYYY-MM-DD HH:mm:ss format
  }): Promise<any[]> {
    try {
      console.log('Fetching lab test results for visit:', params);
      
      // Build query parameters
      // Note: Backend expects 'visitDateStr' as parameter name
      const queryParams = new URLSearchParams({
        patientId: params.patientId,
        patientVisitNo: params.patientVisitNo.toString(),
        shiftId: params.shiftId.toString(),
        clinicId: params.clinicId,
        doctorId: params.doctorId,
        visitDateStr: params.visitDate  // Backend parameter name is visitDateStr
      });

      try {
        const resp = await api.get(`/lab/results/visit?${queryParams.toString()}`);
        console.log('Get lab test results response:', resp.data);
        return Array.isArray(resp.data) ? resp.data : [];
      } catch (e1: any) {
        if (e1?.response?.status !== 404) throw e1;
        // Fallback to alternative endpoint
        try {
          const resp = await api.get(`/lab/master/results/visit?${queryParams.toString()}`);
          console.log('Get lab test results response (fallback):', resp.data);
          return Array.isArray(resp.data) ? resp.data : [];
        } catch (e2: any) {
          if (e2?.response?.status !== 404) throw e2;
          // Last fallback
          const resp = await api.get(`/lab/tests/results/visit?${queryParams.toString()}`);
          console.log('Get lab test results response (fallback 2):', resp.data);
          return Array.isArray(resp.data) ? resp.data : [];
        }
      }
    } catch (error: any) {
      console.error('Get lab test results API Error:', error);
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      if (error.response?.status === 404) {
        // No results found is not an error, just return empty array
        console.log('No lab test results found for this visit');
        return [];
      } else if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Invalid request parameters');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching lab test results.');
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch lab test results');
    }
  }
  ,

  /**
   * Save medicine overwrite
   * Mirrors backend @PostMapping("/save-medicine-overwrite") and tries common base paths.
   */
  async saveMedicineOverwrite(request: SaveMedicineOverwriteRequest): Promise<SaveMedicineOverwriteResponse> {
    try {
      console.log('Saving medicine overwrite:', request);
      // Try several common base paths to accommodate different controller mount points
      // 1) Under /visits
      try {
        const resp = await api.post<SaveMedicineOverwriteResponse>(`/visits/save-medicine-overwrite`, request);
        console.log('Save medicine overwrite (/visits/save-medicine-overwrite):', resp.data);
        return resp.data;
      } catch (e1: any) {
        if (e1?.response?.status !== 404) throw e1;
        // 2) Root mapping
        try {
          const resp = await api.post<SaveMedicineOverwriteResponse>(`/save-medicine-overwrite`, request);
          console.log('Save medicine overwrite (/save-medicine-overwrite):', resp.data);
          return resp.data;
        } catch (e2: any) {
          if (e2?.response?.status !== 404) throw e2;
          // 3) Under /patient/visits
          const resp = await api.post<SaveMedicineOverwriteResponse>(`/patient/visits/save-medicine-overwrite`, request);
          console.log('Save medicine overwrite (/patient/visits/save-medicine-overwrite):', resp.data);
          return resp.data;
        }
      }
    } catch (error: any) {
      console.error('Save medicine overwrite API Error:', error);
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      if (error.response?.status === 400) {
        const msg = error.response?.data?.message || error.response?.data?.error || 'Invalid request payload.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('Save medicine endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while saving medicine overwrite.');
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(error.response?.data?.message || 'Failed to save medicine overwrite');
    }
  }
  ,

  /**
   * Get all reference data used across the application
   * Mirrors backend @GetMapping("/all-reference-data")
   */
  async getAllReferenceData(): Promise<AllReferenceDataResponse> {
    try {
      console.log('Fetching all reference data');
      const response = await api.get('/reference/all-reference-data');
      console.log('All reference data response:', response.data);
      return response.data as AllReferenceDataResponse;
    } catch (error: any) {
      console.error('Get all reference data API Error:', error);
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      if (error.response?.status === 400) {
        const msg = error.response?.data?.message || error.response?.data?.error || 'Invalid request.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('All reference data endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching reference data.');
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch all reference data');
    }
  }
  ,

  /**
   * Get patient profile reference data for a doctor and clinic
   * Mirrors backend @GetMapping("/patient-profile") with query params doctorId & clinicId
   */
  async getPatientProfileRefData(doctorId: string, clinicId: string): Promise<PatientProfileRefDataResponse> {
    try {
      console.log('Fetching patient profile ref data for:', { doctorId, clinicId });
      // Prefer /reference namespace; fall back to root or alternative
      try {
        const resp = await api.get<PatientProfileRefDataResponse>(`/reference/patient-profile`, { params: { doctorId, clinicId } });
        console.log('Patient profile ref data (/reference/patient-profile):', resp.data);
        return resp.data;
      } catch (e1: any) {
        if (e1?.response?.status !== 404) throw e1;
        try {
          const resp = await api.get<PatientProfileRefDataResponse>(`/patient-profile`, { params: { doctorId, clinicId } });
          console.log('Patient profile ref data (/patient-profile):', resp.data);
          return resp.data;
        } catch (e2: any) {
          if (e2?.response?.status !== 404) throw e2;
          const resp = await api.get<PatientProfileRefDataResponse>(`/refdata/patient-profile`, { params: { doctorId, clinicId } });
          console.log('Patient profile ref data (/refdata/patient-profile):', resp.data);
          return resp.data;
        }
      }
    } catch (error: any) {
      console.error('Get patient profile ref data API Error:', error);
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      if (error.response?.status === 400) {
        const msg = error.response?.data?.message || error.response?.data?.error || 'Invalid request.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('Patient profile ref data endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching patient profile ref data.');
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch patient profile ref data');
    }
  },

  /**
   * Update visit addendum text for a patient visit
   * Mirrors backend @PostMapping("/update-addendum")
   */
  async updateAddendum(request: UpdateAddendumRequest): Promise<UpdateAddendumResponse> {
    try {
      console.log('Updating addendum:', request);
      // Try several common base paths to accommodate different controller mount points
      // 1) Under /visits
      try {
        const resp = await api.post<UpdateAddendumResponse>(`/visits/update-addendum`, request);
        console.log('Update addendum (/visits/update-addendum):', resp.data);
        return resp.data;
      } catch (e1: any) {
        if (e1?.response?.status !== 404) throw e1;
        // 2) Under /patient/visits
        try {
          const resp = await api.post<UpdateAddendumResponse>(`/patient/visits/update-addendum`, request);
          console.log('Update addendum (/patient/visits/update-addendum):', resp.data);
          return resp.data;
        } catch (e2: any) {
          if (e2?.response?.status !== 404) throw e2;
          // 3) Root mapping
          const resp = await api.post<UpdateAddendumResponse>(`/update-addendum`, request);
          console.log('Update addendum (/update-addendum):', resp.data);
          return resp.data;
        }
      }
    } catch (error: any) {
      console.error('Update addendum API Error:', error);
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      if (error.response?.status === 400) {
        const msg = error.response?.data?.message || error.response?.data?.error || 'Invalid request payload.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('Update addendum endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while updating addendum.');
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(error.response?.data?.message || 'Failed to update addendum');
    }
  },

  /**
   * @deprecated This function has been moved to admissionService.getAdmissionCards()
   * Please use admissionService.getAdmissionCards() instead.
   * This function is kept for backward compatibility only.
   */
  async getAdmissionCards(params: AdmissionServiceAdmissionCardsRequest): Promise<AdmissionServiceAdmissionCardsResponse> {
    // Re-export from admissionService to maintain backward compatibility
    // Using dynamic import to avoid circular dependency
    const { admissionService } = await import('./admissionService');
    return admissionService.getAdmissionCards(params);
  },

  /**
   * Get all complaints for a doctor in a clinic
   * Mirrors backend @GetMapping("/all/{clinicId}") with optional doctorId query parameter
   * @param clinicId - Clinic ID
   * @param doctorId - Doctor ID (optional)
   * @returns Promise<ComplaintsForDoctorResponse> - Array of complaint objects
   */
  async getAllComplaintsForDoctor(clinicId: string, doctorId?: string): Promise<ComplaintsForDoctorResponse> {
    try {
      console.log(`Getting all complaints for clinic: ${clinicId} and doctor: ${doctorId || 'all'}`);
      
      // Build query parameters - doctorId is optional
      const params: Record<string, string> = {};
      if (doctorId) {
        params.doctorId = doctorId;
      }
      
      // Try common mount points
      try {
        const resp = await api.get<ComplaintsForDoctorResponse>(`/complain/all/${encodeURIComponent(clinicId)}`, { params });
        console.log('Get all complaints for doctor response:', resp.data);
        return resp.data;
      } catch (e1: any) {
        if (e1?.response?.status !== 404) throw e1;
        // Fallback to alternative endpoint
        try {
          const resp = await api.get<ComplaintsForDoctorResponse>(`/complaint/all/${encodeURIComponent(clinicId)}`, { params });
          console.log('Get all complaints for doctor response (fallback):', resp.data);
          return resp.data;
        } catch (e2: any) {
          if (e2?.response?.status !== 404) throw e2;
          // Last fallback
          const resp = await api.get<ComplaintsForDoctorResponse>(`/complaints/all/${encodeURIComponent(clinicId)}`, { params });
          console.log('Get all complaints for doctor response (fallback 2):', resp.data);
          return resp.data;
        }
      }
    } catch (error: any) {
      console.error('Get all complaints for doctor API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        const msg = error.response?.data?.error || error.response?.data?.message || 'Invalid request parameters.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('Complaints endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching complaints.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to get complaints');
    }
  },

  /**
   * Delete a complaint for a doctor in a clinic
   * Mirrors backend @DeleteMapping("/doctor/{doctorId}/clinic/{clinicId}/complaint/{shortDescription}")
   * @param doctorId - Doctor ID
   * @param clinicId - Clinic ID
   * @param shortDescription - Short description of the complaint to delete
   * @returns Promise<DeleteComplaintResponse> - Success or error message
   */
  async deleteComplaint(doctorId: string, clinicId: string, shortDescription: string): Promise<DeleteComplaintResponse> {
    try {
      console.log(`Deleting complaint: ${shortDescription} for doctor: ${doctorId} and clinic: ${clinicId}`);
      
      // Encode the shortDescription to handle special characters
      const encodedShortDescription = encodeURIComponent(shortDescription);
      
      // Try common mount points
      try {
        const resp = await api.delete<DeleteComplaintResponse>(
          `/complaint-master/doctor/${encodeURIComponent(doctorId)}/clinic/${encodeURIComponent(clinicId)}/complaint/${encodedShortDescription}`
        );
        console.log('Delete complaint response:', resp.data);
        return resp.data;
      } catch (e1: any) {
        if (e1?.response?.status !== 404) throw e1;
        // Fallback to alternative endpoint
        try {
          const resp = await api.delete<DeleteComplaintResponse>(
            `/complaint/doctor/${encodeURIComponent(doctorId)}/clinic/${encodeURIComponent(clinicId)}/complaint/${encodedShortDescription}`
          );
          console.log('Delete complaint response (fallback):', resp.data);
          return resp.data;
        } catch (e2: any) {
          if (e2?.response?.status !== 404) throw e2;
          // Last fallback
          const resp = await api.delete<DeleteComplaintResponse>(
            `/complaints/doctor/${encodeURIComponent(doctorId)}/clinic/${encodeURIComponent(clinicId)}/complaint/${encodedShortDescription}`
          );
          console.log('Delete complaint response (fallback 2):', resp.data);
          return resp.data;
        }
      }
    } catch (error: any) {
      console.error('Delete complaint API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        const msg = error.response?.data?.error || error.response?.data?.message || 'Invalid request parameters.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        const msg = error.response?.data?.error || 'Complaint not found or access denied.';
        throw new Error(msg);
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while deleting complaint.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to delete complaint');
    }
  },

  /**
   * Create a new complaint
   * Mirrors backend @PostMapping("/api/complaint-master")
   * @param complaint - Complaint data to create
   * @returns Promise<CreateComplaintResponse> - Created complaint or error message
   */
  async createComplaint(complaint: CreateComplaintRequest): Promise<CreateComplaintResponse> {
    try {
      console.log('Creating new complaint:', complaint);
      
      // Try common mount points
      try {
        const resp = await api.post<CreateComplaintResponse>(`/complaint-master`, complaint);
        console.log('Create complaint response:', resp.data);
        return resp.data;
      } catch (e1: any) {
        if (e1?.response?.status !== 404) throw e1;
        // Fallback to alternative endpoint
        try {
          const resp = await api.post<CreateComplaintResponse>(`/complaint`, complaint);
          console.log('Create complaint response (fallback):', resp.data);
          return resp.data;
        } catch (e2: any) {
          if (e2?.response?.status !== 404) throw e2;
          // Last fallback
          const resp = await api.post<CreateComplaintResponse>(`/complaints`, complaint);
          console.log('Create complaint response (fallback 2):', resp.data);
          return resp.data;
        }
      }
    } catch (error: any) {
      console.error('Create complaint API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        const msg = error.response?.data?.error || error.response?.data?.message || 'Invalid request parameters.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('Create complaint endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while creating complaint.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to create complaint');
    }
  }
};

// Utility function to format visit date and time
export const formatVisitDateTime = (visit: PatientVisit): string => {
  try {
    const visitDate = new Date(visit.visit_date);
    const visitTime = visit.visit_time;
    
    const formattedDate = visitDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    // Format time if available
    let formattedTime = '';
    if (visitTime && visitTime !== '00:00:00') {
      const timeParts = visitTime.split(':');
      if (timeParts.length >= 2) {
        const hours = parseInt(timeParts[0], 10);
        const minutes = timeParts[1];
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        formattedTime = ` at ${displayHours}:${minutes} ${ampm}`;
      }
    }
    
    return `${formattedDate}${formattedTime}`;
  } catch (error) {
    console.error('Error formatting visit date:', error);
    return visit.visit_date;
  }
};

// Utility function to get visit status text
export const getVisitStatusText = (statusId: number): string => {
  const statusMap: { [key: number]: string } = {
    1: 'Scheduled',
    2: 'In Progress',
    3: 'Completed',
    4: 'Cancelled',
    5: 'No Show'
  };
  
  return statusMap[statusId] || `Status ${statusId}`;
};

// Utility function to format visit date and time for detailed visits
export const formatDetailedVisitDateTime = (visit: PatientVisitDetails): string => {
  try {
    const visitDate = new Date(visit.visit_date);
    const visitTime = visit.visit_time;
    
    const formattedDate = visitDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    // Format time if available
    let formattedTime = '';
    if (visitTime && visitTime !== '00:00:00') {
      const timeParts = visitTime.split(':');
      if (timeParts.length >= 2) {
        const hours = parseInt(timeParts[0], 10);
        const minutes = timeParts[1];
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        formattedTime = ` at ${displayHours}:${minutes} ${ampm}`;
      }
    }
    
    return `${formattedDate}${formattedTime}`;
  } catch (error) {
    console.error('Error formatting detailed visit date:', error);
    return visit.visit_date;
  }
};

// Utility function to parse PLR indicators
export const parsePLRIndicators = (plrIndicators: string): { prescription: boolean; lab: boolean; radiology: boolean } => {
  return {
    prescription: plrIndicators.includes('P'),
    lab: plrIndicators.includes('L'),
    radiology: plrIndicators.includes('R')
  };
};

// Utility function to get PLR indicators text
export const getPLRIndicatorsText = (plrIndicators: string): string => {
  const indicators = parsePLRIndicators(plrIndicators);
  const parts: string[] = [];
  
  if (indicators.prescription) parts.push('Prescription');
  if (indicators.lab) parts.push('Lab');
  if (indicators.radiology) parts.push('Radiology');
  
  return parts.length > 0 ? parts.join(', ') : 'None';
};

// Utility function to format medical history flags
export const formatMedicalHistory = (visit: PatientVisitDetails): string[] => {
  const history: string[] = [];
  
  if (visit.hypertension) history.push('Hypertension');
  if (visit.diabetes) history.push('Diabetes');
  if (visit.cholestrol) history.push('Cholesterol');
  if (visit.ihd) history.push('IHD');
  if (visit.th) history.push('TH');
  if (visit.asthama) history.push('Asthma');
  if (visit.smoking) history.push('Smoking');
  if (visit.tobaco) history.push('Tobacco');
  if (visit.alchohol) history.push('Alcohol');
  if (visit.pregnant) history.push('Pregnant');
  
  return history;
};

export default patientService;
