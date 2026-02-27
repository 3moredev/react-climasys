import api from './api'

export interface PrescriptionTemplate {
  catShortName: string
  catsubDescription: string
  brandName: string
  medicineName: string
  clinicId?: string
  marketedBy?: string | null
  priorityValue?: number | null
  morning?: number | null
  afternoon?: number | null
  night?: number | null
  noOfDays?: number | null
  instruction?: string | null
  doctorId: string
  active?: boolean | null
}

export const prescriptionDetailsService = {
  /**
   * Get all prescription templates (master data) for a doctor
   */
  async getAllPrescriptionsForDoctor(doctorId: string): Promise<PrescriptionTemplate[]> {
    try {
      if (!doctorId) {
        throw new Error('Doctor ID is required to load prescriptions.')
      }

      const response = await api.get<PrescriptionTemplate[]>(`/prescription-medicines/doctor/${doctorId}`)
      return response.data || []
    } catch (error: any) {
      console.error('PrescriptionDetails API Error (getAll):', error)

      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.')
      }

      if (error.response?.status === 400) {
        throw new Error('Invalid request. Please check your doctor ID.')
      } else if (error.response?.status === 404) {
        throw new Error('Prescription medicines endpoint not found. Please check your backend configuration.')
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching prescriptions.')
      }

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }

      throw new Error(error.response?.data?.message || 'Failed to fetch prescriptions')
    }
  },

  /**
   * Build a human-readable autocomplete label for a PrescriptionTemplate.
   * Combines brandName / catsubDescription / medicineName into a single string.
   */
  toSearchLabel(p: PrescriptionTemplate): string {
    const name = (p.brandName || p.catsubDescription || p.medicineName || '').trim();
    const composition = (p.medicineName || '').trim();
    const dose = `${p.morning ?? 0}-${p.afternoon ?? 0}-${p.night ?? 0}`;
    const days = p.noOfDays ?? '';
    const instruction = p.instruction || '';
    
    return `${name} | ${composition} | ${dose} | ${days} | ${instruction}`;
  },

  /**
   * Get active prescriptions for a doctor (and optionally a clinic).
   * Uses the existing /prescription-medicines/doctor endpoint and filters client-side
   * by active !== false so it mirrors the Manage Prescription (OPD Master) checked list.
   * @param doctorId - Doctor ID
   * @param clinicId - Clinic ID (optional filter)
   * @returns Promise<PrescriptionTemplate[]> - Active prescriptions only
   */
  async getActivePrescriptionsForDoctor(doctorId: string, clinicId?: string): Promise<PrescriptionTemplate[]> {
    try {
      if (!doctorId) throw new Error('Doctor ID is required.');
      const response = await api.get<PrescriptionTemplate[]>(`/prescription-medicines/doctor/${doctorId}`);
      const all: PrescriptionTemplate[] = response.data || [];

      const active = all.filter((p) => {
        const isActive = p.active !== false; // null or true → active
        if (clinicId && p.clinicId) {
          return isActive && p.clinicId === clinicId;
        }
        return isActive;
      });

      console.log(`Prescriptions fallback: ${all.length} total → ${active.length} active for clinic ${clinicId ?? 'any'}`);
      return active;
    } catch (error: any) {
      console.error('PrescriptionDetails getActivePrescriptionsForDoctor error:', error);
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server.');
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch active prescriptions');
    }
  },

  /**
   * Search prescription templates for a doctor
   */
  async searchPrescriptionsForDoctor(doctorId: string, searchTerm: string): Promise<PrescriptionTemplate[]> {
    try {
      if (!doctorId) {
        throw new Error('Doctor ID is required to search prescriptions.')
      }
      if (!searchTerm || !searchTerm.trim()) {
        return this.getAllPrescriptionsForDoctor(doctorId)
      }

      const response = await api.get<PrescriptionTemplate[]>(`/prescription-medicines/doctor/${doctorId}/search`, {
        params: { term: searchTerm },
      })
      return response.data || []
    } catch (error: any) {
      console.error('PrescriptionDetails API Error (search):', error)

      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.')
      }

      if (error.response?.status === 400) {
        throw new Error('Invalid request. Please check your doctor ID.')
      } else if (error.response?.status === 404) {
        throw new Error('Prescription medicines endpoint not found. Please check your backend configuration.')
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while searching prescriptions.')
      }

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }

      throw new Error(error.response?.data?.message || 'Failed to search prescriptions')
    }
  },

  /**
   * Create a new prescription template
   */
  async createPrescription(prescription: PrescriptionTemplate): Promise<PrescriptionTemplate> {
    try {
      const response = await api.post<PrescriptionTemplate>('/prescription-medicines', prescription)
      return response.data
    } catch (error: any) {
      console.error('PrescriptionDetails API Error (create):', error)

      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.')
      }

      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.error || 'Invalid request.')
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while creating prescription.')
      }

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }

      throw new Error(error.response?.data?.message || 'Failed to create prescription')
    }
  },

  /**
   * Update an existing prescription template
   */
  async updatePrescription(prescription: PrescriptionTemplate): Promise<PrescriptionTemplate> {
    try {
      const response = await api.put<PrescriptionTemplate>('/prescription-medicines', prescription)
      return response.data
    } catch (error: any) {
      console.error('PrescriptionDetails API Error (update):', error)

      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.')
      }

      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.error || 'Invalid request.')
      } else if (error.response?.status === 404) {
        throw new Error('Prescription not found.')
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while updating prescription.')
      }

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }

      throw new Error(error.response?.data?.message || 'Failed to update prescription')
    }
  },

  /**
   * Delete a prescription template
   */
  async deletePrescription(
    doctorId: string,
    catShortName: string,
    catsubDescription: string,
    medicineName: string,
    brandName: string,
  ): Promise<void> {
    try {
      await api.delete(
        `/prescription-medicines/doctor/${doctorId}/category/${encodeURIComponent(
          catShortName,
        )}/subcategory/${encodeURIComponent(catsubDescription)}/medicine/${encodeURIComponent(
          medicineName,
        )}/brand/${encodeURIComponent(brandName)}`,
      )
    } catch (error: any) {
      console.error('PrescriptionDetails API Error (delete):', error)

      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.')
      }

      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.error || 'Invalid request.')
      } else if (error.response?.status === 404) {
        throw new Error('Prescription not found.')
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while deleting prescription.')
      }

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }

      throw new Error(error.response?.data?.message || 'Failed to delete prescription')
    }
  },
}

export default prescriptionDetailsService


