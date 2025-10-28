import api from './api';

export interface MedicineOption {
  value: string;
  label: string;
  short_description: string;
  medicine_description: string;
  morning: number;
  afternoon: number;
  priority_value: number;
  active: boolean;
  clinic_id: string;
  created_on: string;
  modified_on: string | null;
}

export interface MedicineApiResponse {
  afternoon: number;
  modified_on: string | null;
  short_description: string;
  created_on: string;
  priority_value: number;
  medicine_description: string;
  active: boolean;
  clinic_id: string;
  morning: number;
}

export const medicineService = {
  /**
   * Get active medicines for a doctor and clinic
   * @param doctorId - Doctor ID
   * @param clinicId - Clinic ID
   * @returns Promise<MedicineOption[]> - Array of medicine options
   */
  async getActiveMedicinesByDoctorAndClinic(doctorId: string, clinicId: string): Promise<MedicineOption[]> {
    try {
      console.log('Fetching active medicines for doctor:', doctorId, 'and clinic:', clinicId);
      
      const response = await api.get(`/medicine/master-data/active-medicines/${doctorId}/clinic/${clinicId}`);
      console.log('Medicines API response:', response.data);
      
      // Transform API response to dropdown options format
      const medicines: MedicineOption[] = response.data.map((medicine: MedicineApiResponse) => ({
        value: medicine.short_description, // Use short_description as unique identifier
        label: medicine.short_description,
        short_description: medicine.short_description,
        medicine_description: medicine.medicine_description,
        morning: medicine.morning,
        afternoon: medicine.afternoon,
        priority_value: medicine.priority_value,
        active: medicine.active,
        clinic_id: medicine.clinic_id,
        created_on: medicine.created_on,
        modified_on: medicine.modified_on
      }));
      
      return medicines;
    } catch (error: any) {
      console.error('Medicines API Error:', error);
      
      // Handle CORS and network errors
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      // Handle HTTP errors
      if (error.response?.status === 400) {
        throw new Error('Invalid request. Please check your doctor ID and clinic ID.');
      } else if (error.response?.status === 404) {
        throw new Error('Medicines endpoint not found. Please check your backend configuration.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching medicines.');
      }
      
      // Handle backend-specific errors
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to fetch medicines');
    }
  }
};

export default medicineService;
