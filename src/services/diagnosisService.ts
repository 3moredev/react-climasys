import api from './api';

export interface DiagnosisOption {
  value: string;
  label: string;
  short_description?: string;
  diagnosis_description?: string;
}

export interface DiagnosisApiResponse {
  priorityValue: number;
  diagnosisDescription: string;
  shortDescription: string;
  modified_on: string | null;
  doctor_id: string;
  created_on: string;
  clinic_id: string;
}

// Create diagnosis request interface
export interface CreateDiagnosisRequest {
  shortDescription?: string;
  short_description?: string;
  diagnosisDescription?: string;
  diagnosis_description?: string;
  priority?: number;
  priorityValue?: number;
  priority_value?: number;
  doctorId?: string;
  doctor_id?: string;
  clinicId?: string;
  clinic_id?: string;
  [key: string]: any; // Allow additional fields
}

// Create diagnosis response interface
export interface CreateDiagnosisResponse {
  id?: string;
  shortDescription?: string;
  short_description?: string;
  diagnosisDescription?: string;
  diagnosis_description?: string;
  priority?: number;
  priorityValue?: number;
  priority_value?: number;
  message?: string;
  error?: string;
  success?: boolean;
  [key: string]: any;
}

// Delete diagnosis response interface
export interface DeleteDiagnosisResponse {
  message?: string;
  error?: string;
  success?: boolean;
  [key: string]: any;
}

// Update diagnosis request interface (same as create)
export interface UpdateDiagnosisRequest extends CreateDiagnosisRequest {}

// Update diagnosis response interface (same as create)
export interface UpdateDiagnosisResponse extends CreateDiagnosisResponse {}

export const diagnosisService = {
  // /**
  //  * Get all diagnoses for a doctor and clinic
  //  * @param doctorId - Doctor ID
  //  * @param clinicId - Clinic ID
  //  * @returns Promise<DiagnosisOption[]> - Array of diagnosis options
  //  */
  // async getAllDiagnosesForDoctorAndClinic(doctorId: string, clinicId: string): Promise<DiagnosisOption[]> {
  //   try {
  //     console.log('Fetching diagnoses for doctor:', doctorId, 'and clinic:', clinicId);
      
  //     const response = await api.get(`/medicine/master-data/diseases/${doctorId}/clinic/${clinicId}`);
  //     console.log('Diagnoses API response:', response.data);
      
  //     // Transform API response to dropdown options format
  //     const diagnoses: DiagnosisOption[] = response.data.map((diagnosis: DiagnosisApiResponse) => ({
  //       value: diagnosis.short_description, // Use short_description as unique identifier
  //       label: diagnosis.diagnosis_description, // Show diagnosis_description in dropdown
  //       short_description: diagnosis.short_description,
  //       diagnosis_description: diagnosis.diagnosis_description
  //     }));
      
  //     return diagnoses;
  //   } catch (error: any) {
  //     console.error('Diagnoses API Error:', error);
      
  //     // Handle CORS and network errors
  //     if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
  //       throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
  //     }
      
  //     // Handle HTTP errors
  //     if (error.response?.status === 400) {
  //       throw new Error('Invalid request. Please check your doctor ID and clinic ID.');
  //     } else if (error.response?.status === 404) {
  //       throw new Error('Diagnoses endpoint not found. Please check your backend configuration.');
  //     } else if (error.response?.status === 500) {
  //       throw new Error('Server error occurred while fetching diagnoses.');
  //     }
      
  //     // Handle backend-specific errors
  //     if (error.response?.data?.error) {
  //       throw new Error(error.response.data.error);
  //     }
      
  //     throw new Error(error.response?.data?.message || 'Failed to fetch diagnoses');
  //   }
  // },

  /**
   * Get all diagnoses for a doctor (for management page)
   * @param doctorId - Doctor ID
   * @returns Promise<DiagnosisApiResponse[]> - Array of diagnosis objects
   */
  async getAllDiagnosesForDoctor(doctorId: string): Promise<DiagnosisApiResponse[]> {
    try {
      console.log(`Getting all diagnoses for doctor: ${doctorId}`);
      
      const resp = await api.get<DiagnosisApiResponse[]>(`/diagnosis-master/doctor/${encodeURIComponent(doctorId)}`);
      console.log('Get all diagnoses for doctor response:', resp.data);
      return resp.data;
    } catch (error: any) {
      console.error('Get all diagnoses for doctor API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        const msg = error.response?.data?.error || error.response?.data?.message || 'Invalid request parameters.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('Diagnoses endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching diagnoses.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to get diagnoses');
    }
  },

  /**
   * Delete a diagnosis for a doctor in a clinic
   * Mirrors backend @DeleteMapping("/doctor/{doctorId}/clinic/{clinicId}/diagnosis/{shortDescription}")
   * @param doctorId - Doctor ID
   * @param clinicId - Clinic ID
   * @param shortDescription - Short description of the diagnosis to delete
   * @returns Promise<DeleteDiagnosisResponse> - Success or error message
   */
  async deleteDiagnosis(doctorId: string, clinicId: string, shortDescription: string): Promise<DeleteDiagnosisResponse> {
    try {
      console.log(`Deleting diagnosis: ${shortDescription} for doctor: ${doctorId} and clinic: ${clinicId}`);
      
      // Encode the shortDescription to handle special characters
      const encodedShortDescription = encodeURIComponent(shortDescription);
      
      // Try common mount points
      try {
        const resp = await api.delete<DeleteDiagnosisResponse>(
          `/diagnosis-master/doctor/${encodeURIComponent(doctorId)}/clinic/${encodeURIComponent(clinicId)}/diagnosis/${encodedShortDescription}`
        );
        console.log('Delete diagnosis response:', resp.data);
        return resp.data;
      } catch (e1: any) {
        if (e1?.response?.status !== 404) throw e1;
        // Fallback to alternative endpoint
        try {
          const resp = await api.delete<DeleteDiagnosisResponse>(
            `/diagnosis/doctor/${encodeURIComponent(doctorId)}/clinic/${encodeURIComponent(clinicId)}/diagnosis/${encodedShortDescription}`
          );
          console.log('Delete diagnosis response (fallback):', resp.data);
          return resp.data;
        } catch (e2: any) {
          if (e2?.response?.status !== 404) throw e2;
          // Last fallback
          const resp = await api.delete<DeleteDiagnosisResponse>(
            `/diagnoses/doctor/${encodeURIComponent(doctorId)}/clinic/${encodeURIComponent(clinicId)}/diagnosis/${encodedShortDescription}`
          );
          console.log('Delete diagnosis response (fallback 2):', resp.data);
          return resp.data;
        }
      }
    } catch (error: any) {
      console.error('Delete diagnosis API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        const msg = error.response?.data?.error || error.response?.data?.message || 'Invalid request parameters.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        const msg = error.response?.data?.error || 'Diagnosis not found or access denied.';
        throw new Error(msg);
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while deleting diagnosis.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to delete diagnosis');
    }
  },

  /**
   * Create a new diagnosis
   * Mirrors backend @PostMapping("/diagnosis-master") or similar
   * @param diagnosis - Diagnosis data to create
   * @returns Promise<CreateDiagnosisResponse> - Created diagnosis or error message
   */
  async createDiagnosis(diagnosis: CreateDiagnosisRequest): Promise<CreateDiagnosisResponse> {
    try {
      console.log('Creating new diagnosis:', diagnosis);
      
      // Try common mount points
      try {
        const resp = await api.post<CreateDiagnosisResponse>(`/medicine/master-data/diseases`, diagnosis);
        console.log('Create diagnosis response:', resp.data);
        return resp.data;
      } catch (e1: any) {
        if (e1?.response?.status !== 404) throw e1;
        // Fallback to alternative endpoint
        try {
          const resp = await api.post<CreateDiagnosisResponse>(`/diagnosis-master`, diagnosis);
          console.log('Create diagnosis response (fallback):', resp.data);
          return resp.data;
        } catch (e2: any) {
          if (e2?.response?.status !== 404) throw e2;
          // Last fallback
          const resp = await api.post<CreateDiagnosisResponse>(`/diagnosis`, diagnosis);
          console.log('Create diagnosis response (fallback 2):', resp.data);
          return resp.data;
        }
      }
    } catch (error: any) {
      console.error('Create diagnosis API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        const msg = error.response?.data?.error || error.response?.data?.message || 'Invalid request parameters.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('Create diagnosis endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while creating diagnosis.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to create diagnosis');
    }
  },

  /**
   * Update an existing diagnosis using path variables
   * Only updates diagnosis description and priority value
   * Short description, doctor ID, and clinic ID cannot be changed (they are part of the composite key)
   * PUT /api/diagnosis-master/doctor/{doctorId}/clinic/{clinicId}/diagnosis/{shortDescription}
   * @param doctorId - Doctor ID (path variable)
   * @param clinicId - Clinic ID (path variable)
   * @param shortDescription - Short description of the diagnosis to update (path variable, used as identifier)
   * @param diagnosis - Updated diagnosis data (only diagnosisDescription and priorityValue are updated)
   * @returns Promise<UpdateDiagnosisResponse> - Updated diagnosis or error message
   */
  async updateDiagnosis(diagnosis: UpdateDiagnosisRequest): Promise<UpdateDiagnosisResponse> {
    try {
      console.log('Updating diagnosis:', diagnosis);
      try {
        const resp = await api.put<UpdateDiagnosisResponse>(
          `/diagnosis-master`,diagnosis);
        console.log('Update diagnosis response:', resp.data);
        return resp.data;
      } catch (e1: any) {
        if (e1?.response?.status !== 404) throw e1;
        // Fallback to alternative endpoint
        try {
          const resp = await api.put<UpdateDiagnosisResponse>(
            `/api/diagnosis-master`,
            diagnosis
          );
          console.log('Update diagnosis response (fallback):', resp.data);
          return resp.data;
        } catch (e2: any) {
          if (e2?.response?.status !== 404) throw e2;
          // Last fallback
          const resp = await api.put<UpdateDiagnosisResponse>(
            `/api/diagnosis-master`,
            diagnosis
          );
          console.log('Update diagnosis response (fallback 2):', resp.data);
          return resp.data;
        }
      }
    } catch (error: any) {
      console.error('Update diagnosis API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        const msg = error.response?.data?.error || error.response?.data?.message || 'Invalid request parameters.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('Update diagnosis endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while updating diagnosis.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to update diagnosis');
    }
  }
};

export default diagnosisService;
