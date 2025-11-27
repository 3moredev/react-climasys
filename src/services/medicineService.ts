import api from './api';

export interface MedicineMaster {
  shortDescription: string;
  medicineDescription: string;
  doctorId: string;
  clinicId: string;
  priorityValue?: number | null;
  morning?: number | null;
  afternoon?: number | null;
  night?: number | null;
  noOfDays?: number | null;
  instruction?: string | null;
  active?: boolean | null;
  createdOn?: string;
  createdByName?: string;
  modifiedOn?: string;
  modifiedByName?: string;
}

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
   * Get all medicines for a doctor
   * @param doctorId - Doctor ID
   * @returns Promise<MedicineMaster[]> - Array of medicines
   */
  async getAllMedicinesForDoctor(doctorId: string): Promise<MedicineMaster[]> {
    try {
      if (!doctorId) {
        throw new Error('Doctor ID is required to load medicines.');
      }

      console.log('Fetching medicines for doctor:', doctorId);
      
      const response = await api.get<MedicineMaster[]>(`/medicine-master/doctor/${doctorId}`);
      console.log('Get medicines response:', response.data);
      
      return response.data || [];
    } catch (error: any) {
      console.error('Medicines API Error:', error);
      
      // Handle CORS and network errors
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      // Handle HTTP errors
      if (error.response?.status === 400) {
        throw new Error('Invalid request. Please check your doctor ID.');
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
  },

  /**
   * Search medicines by short description, medicine description, or priority for a doctor
   * @param doctorId - Doctor ID
   * @param searchTerm - Search term
   * @returns Promise<MedicineMaster[]> - Array of filtered medicines
   */
  async searchMedicines(doctorId: string, searchTerm: string): Promise<MedicineMaster[]> {
    try {
      if (!doctorId) {
        throw new Error('Doctor ID is required to search medicines.');
      }
      if (!searchTerm || !searchTerm.trim()) {
        // If search term is empty, return all medicines
        return this.getAllMedicinesForDoctor(doctorId);
      }

      console.log('Searching medicines for doctor:', doctorId, 'with term:', searchTerm);
      
      const response = await api.get<MedicineMaster[]>(`/medicine-master/doctor/${doctorId}/search`, {
        params: { term: searchTerm }
      });
      console.log('Search medicines API response:', response.data);
      
      return response.data || [];
    } catch (error: any) {
      console.error('Search medicines API Error:', error);
      
      // Handle CORS and network errors
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      // Handle HTTP errors
      if (error.response?.status === 400) {
        throw new Error('Invalid request. Please check your doctor ID.');
      } else if (error.response?.status === 404) {
        throw new Error('Medicines endpoint not found. Please check your backend configuration.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while searching medicines.');
      }
      
      // Handle backend-specific errors
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to search medicines');
    }
  },

  /**
   * Create a new medicine
   * @param medicine - Medicine data
   * @returns Promise<MedicineMaster> - Created medicine
   */
  async createMedicine(medicine: MedicineMaster): Promise<MedicineMaster> {
    try {
      console.log('Creating medicine:', medicine);
      const response = await api.post<MedicineMaster>('/medicine-master', medicine);
      console.log('Create medicine response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Create medicine API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.error || 'Invalid request.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while creating medicine.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to create medicine');
    }
  },

  /**
   * Update an existing medicine
   * @param medicine - Medicine data
   * @returns Promise<MedicineMaster> - Updated medicine
   */
  async updateMedicine(medicine: MedicineMaster): Promise<MedicineMaster> {
    try {
      console.log('Updating medicine:', medicine);
      const response = await api.put<MedicineMaster>('/medicine-master', medicine);
      console.log('Update medicine response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Update medicine API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.error || 'Invalid request.');
      } else if (error.response?.status === 404) {
        throw new Error('Medicine not found.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while updating medicine.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to update medicine');
    }
  },

  /**
   * Delete a medicine
   * @param doctorId - Doctor ID
   * @param clinicId - Clinic ID
   * @param shortDescription - Short description
   * @returns Promise<void>
   */
  async deleteMedicine(doctorId: string, clinicId: string, shortDescription: string): Promise<void> {
    try {
      console.log('Deleting medicine:', shortDescription, 'for doctor:', doctorId, 'clinic:', clinicId);
      
      await api.delete(`/medicine-master/doctor/${doctorId}/clinic/${clinicId}/medicine/${encodeURIComponent(shortDescription)}`);
      console.log('Delete medicine successful');
    } catch (error: any) {
      console.error('Delete medicine API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.error || 'Invalid request.');
      } else if (error.response?.status === 404) {
        throw new Error('Medicine not found.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while deleting medicine.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to delete medicine');
    }
  },

  /**
   * Get active medicines for a doctor and clinic (legacy method for backward compatibility)
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
