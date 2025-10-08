import api from './api';

// Patient interface based on the backend response
export interface Patient {
  id: number;
  folder_no: string;
  full_name: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  mobile_1: string;
  date_of_birth: string;
  gender_id: number;
  registration_status: string;
  date_of_registration: string;
  age_given: number;
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
}

// Error response interface
export interface ErrorResponse {
  error: string;
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
  async getPatient(id: number): Promise<Patient> {
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
  async getAllPatients(page: number = 0, size: number = 20, status: string = 'all'): Promise<PatientSearchResponse> {
    try {
      console.log(`Fetching all patients - page: ${page}, size: ${size}, status: ${status}`);
      
      const searchParams = new URLSearchParams({
        query: '', // Empty query to get all patients
        status: status,
        page: page.toString(),
        size: size.toString()
      });

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
