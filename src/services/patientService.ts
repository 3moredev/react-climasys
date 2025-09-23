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
  }
};

export default patientService;
