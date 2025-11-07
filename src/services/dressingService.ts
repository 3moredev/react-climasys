import api from './api';

export interface DressingOption {
  value: string;
  label: string;
  short_description?: string;
  description?: string;
}

export interface PatientProfileRefDataResponse {
  dressings?: Array<{
    id?: string | number;
    value?: string;
    label?: string;
    short_description?: string;
    description?: string;
    dressing_description?: string;
    [key: string]: any;
  }>;
  [key: string]: any; // Allow other arrays in the response
}

export const dressingService = {
  /**
   * Get all dressings for a doctor and clinic from patient profile ref data
   * @param doctorId - Doctor ID (e.g., DR-00C10)
   * @param clinicId - Clinic ID (e.g., CL-00001)
   * @returns Promise<DressingOption[]> - Array of dressing options
   */
  async getDressingsForDoctorAndClinic(doctorId: string, clinicId: string): Promise<DressingOption[]> {
    try {
      console.log('Fetching dressings for doctor:', doctorId, 'and clinic:', clinicId);
      
      const response = await api.get(`/refdata/patient-profile`, {
        params: {
          doctorId,
          clinicId
        }
      });
      console.log('Patient profile ref data API response:', response.data);
      
      const data: PatientProfileRefDataResponse = response.data;
      
      // Extract only the dressings array from the response
      if (!data.dressings || !Array.isArray(data.dressings)) {
        console.warn('No dressings array found in response or dressings is not an array');
        return [];
      }
      
      // Transform API response to dropdown options format
      const dressings: DressingOption[] = data.dressings.map((dressing: any) => {
        // Handle different possible field names from the API
        const value = dressing.value || dressing.id || dressing.short_description || String(dressing.id || '');
        const label = dressing.label || dressing.description || dressing.dressing_description || dressing.short_description || value;
        
        return {
          value: String(value),
          label: String(label),
          short_description: dressing.short_description || dressing.value,
          description: dressing.description || dressing.dressing_description || dressing.label
        };
      });
      
      console.log('Transformed dressings:', dressings);
      return dressings;
    } catch (error: any) {
      console.error('Dressings API Error:', error);
      
      // Handle CORS and network errors
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      // Handle HTTP errors
      if (error.response?.status === 400) {
        throw new Error('Invalid request. Please check your doctor ID and clinic ID.');
      } else if (error.response?.status === 404) {
        throw new Error('Dressings endpoint not found. Please check your backend configuration.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching dressings.');
      }
      
      // Handle backend-specific errors
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to fetch dressings');
    }
  }
};

export default dressingService;

