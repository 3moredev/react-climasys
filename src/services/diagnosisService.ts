import api from './api';

export interface DiagnosisOption {
  value: string;
  label: string;
  short_description?: string;
  diagnosis_description?: string;
}

export interface DiagnosisApiResponse {
  modified_on: string | null;
  short_description: string;
  doctor_id: string;
  created_on: string;
  priority_value: number;
  diagnosis_description: string;
  clinic_id: string;
}

export const diagnosisService = {
  /**
   * Get all diagnoses for a doctor and clinic
   * @param doctorId - Doctor ID
   * @param clinicId - Clinic ID
   * @returns Promise<DiagnosisOption[]> - Array of diagnosis options
   */
  async getAllDiagnosesForDoctorAndClinic(doctorId: string, clinicId: string): Promise<DiagnosisOption[]> {
    try {
      console.log('Fetching diagnoses for doctor:', doctorId, 'and clinic:', clinicId);
      
      const response = await api.get(`/medicine/master-data/diseases/${doctorId}/clinic/${clinicId}`);
      console.log('Diagnoses API response:', response.data);
      
      // Transform API response to dropdown options format
      const diagnoses: DiagnosisOption[] = response.data.map((diagnosis: DiagnosisApiResponse) => ({
        value: diagnosis.short_description, // Use short_description as unique identifier
        label: diagnosis.diagnosis_description, // Show diagnosis_description in dropdown
        short_description: diagnosis.short_description,
        diagnosis_description: diagnosis.diagnosis_description
      }));
      
      return diagnoses;
    } catch (error: any) {
      console.error('Diagnoses API Error:', error);
      
      // Handle CORS and network errors
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      // Handle HTTP errors
      if (error.response?.status === 400) {
        throw new Error('Invalid request. Please check your doctor ID and clinic ID.');
      } else if (error.response?.status === 404) {
        throw new Error('Diagnoses endpoint not found. Please check your backend configuration.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching diagnoses.');
      }
      
      // Handle backend-specific errors
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to fetch diagnoses');
    }
  }
};

export default diagnosisService;
