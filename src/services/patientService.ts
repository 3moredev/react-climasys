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
  visit_id: number;
  doctor_id: string;
  clinic_id: string;
  visit_status: number;
  visit_type: number;
}

// Previous visit dates response interface
export interface PreviousVisitDatesResponse {
  visits: PatientVisit[];
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
  async getPreviousVisitDates(patientId: string): Promise<PreviousVisitDatesResponse> {
    try {
      console.log(`Fetching previous visit dates for patient ID: ${patientId}`);
      
      // Use the patient_id from the database, not the folder number or other identifier
      const response = await api.get(`/patients/${patientId}/visits/dates`);
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

export default patientService;
