import api from './api';

export interface ComplaintOption {
  value: string;
  label: string;
  short_description?: string;
  complaint_description?: string;
  priority?: number;
  priority_value?: number;
  display_to_operator?: number;
}

export interface ComplaintApiResponse {
  id: string;
  short_description: string;
  complaint_description: string;
  priority_value: number;
  display_to_operator: number;
}

export const complaintService = {
  /**
   * Get all complaints for a doctor
   * @param doctorId - Doctor ID
   * @returns Promise<ComplaintOption[]> - Array of complaint options
   */
  async getAllComplaintsForDoctor(doctorId: string, clinicId: string): Promise<ComplaintOption[]> {
    try {
      if (!doctorId) {
        throw new Error('Doctor ID is required to load complaints.');
      }
      if (!clinicId) {
        throw new Error('Clinic ID is required to load complaints.');
      }

      console.log('Fetching complaints for doctor:', doctorId, 'clinic:', clinicId);

      const response = await api.get(`/refdata/patient-profile`, {
        params: { doctorId, clinicId }
      });
      console.log('Patient profile complaints response:', response.data);

      const data = response.data || {};
      const complaintsCandidates = [
        data.complaints,
        data.operatorComplaints,
        data.complaintMaster,
        data.complaintsList
      ];
      const complaintsSource =
        complaintsCandidates.find((list: any) => Array.isArray(list) && list.length > 0) || [];

      if (!Array.isArray(complaintsSource) || complaintsSource.length === 0) {
        console.warn('No complaints found in patient profile response.');
        return [];
      }

      const complaints: ComplaintOption[] = complaintsSource.map((complaint: any, index: number) => {
        const value =
          complaint.id ??
          complaint.short_description ??
          complaint.complaint_description ??
          `complaint_${index}`;
        const rawLabel = complaint.short_description || complaint.complaint_description || value;
        const label = rawLabel.includes('*') ? rawLabel.split('*').pop()?.trim() || rawLabel : rawLabel;

        const displayToOp =
          complaint.display_to_operator ??
          complaint.displayToOperator ??
          complaint.display_to_op ??
          (complaint.is_operator_visible === true || complaint.isOperatorVisible === true ? 1 : 0);

        return {
          value: String(value),
          label: String(label),
          short_description: complaint.short_description,
          complaint_description: complaint.complaint_description,
          priority: complaint.priority_value ?? complaint.priority ?? 0,
          priority_value: complaint.priority_value ?? complaint.priority ?? 0,
          display_to_operator: displayToOp ? 1 : 0
        };
      });

      return complaints;
    } catch (error: any) {
      console.error('Complaints API Error:', error);

      // Handle CORS and network errors
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }

      // Handle HTTP errors
      if (error.response?.status === 400) {
        throw new Error('Invalid request. Please check your doctor and clinic IDs.');
      } else if (error.response?.status === 404) {
        throw new Error('Patient profile complaints endpoint not found. Please check your backend configuration.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching complaints.');
      }

      // Handle backend-specific errors
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error(error.response?.data?.message || 'Failed to fetch complaints');
    }
  },

  /**
   * Search complaints for a doctor
   * @param doctorId - Doctor ID
   * @param searchTerm - Search term
   * @returns Promise<ComplaintOption[]> - Array of filtered complaint options
   */
  async searchComplaints(doctorId: string, searchTerm: string): Promise<ComplaintOption[]> {
    try {
      console.log('Searching complaints for doctor:', doctorId, 'with term:', searchTerm);

      const response = await api.get(`/complain/search/${doctorId}`, {
        params: { term: searchTerm }
      });
      console.log('Search complaints API response:', response.data);

      // Transform API response to dropdown options format
      const complaints: ComplaintOption[] = response.data.map((complaint: ComplaintApiResponse) => {
        const rawLabel = complaint.short_description || complaint.complaint_description || '';
        const label = rawLabel.includes('*') ? rawLabel.split('*').pop()?.trim() || rawLabel : rawLabel;
        return {
          value: complaint.id, // Use the concatenated ID as unique identifier
          label: label,
          short_description: complaint.short_description,
          complaint_description: complaint.complaint_description,
          priority: complaint.priority_value ?? 0,
          priority_value: complaint.priority_value ?? 0
        };
      });

      return complaints;
    } catch (error: any) {
      console.error('Search complaints API Error:', error);

      // Handle CORS and network errors
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }

      // Handle HTTP errors
      if (error.response?.status === 400) {
        throw new Error('Invalid search. Please check your search details and try again.');
      } else if (error.response?.status === 404) {
        throw new Error('Search endpoint not found. Please check your backend configuration.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while searching complaints.');
      }

      // Handle backend-specific errors
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error(error.response?.data?.message || 'Failed to search complaints');
    }
  },

  /**
   * Get operator visible complaints for a doctor
   * @param doctorId - Doctor ID
   * @returns Promise<ComplaintOption[]> - Array of complaint options
   */
  async getOperatorVisibleComplaints(doctorId: string): Promise<ComplaintOption[]> {
    try {
      console.log('Fetching operator visible complaints for doctor:', doctorId);

      const response = await api.get(`/complain/operator-visible/${doctorId}`);
      console.log('Operator visible complaints API response:', response.data);

      // Transform API response to dropdown options format
      const complaints: ComplaintOption[] = response.data.map((complaint: ComplaintApiResponse) => {
        const rawLabel = complaint.short_description || complaint.complaint_description || '';
        const label = rawLabel.includes('*') ? rawLabel.split('*').pop()?.trim() || rawLabel : rawLabel;
        return {
          value: complaint.id, // Use the concatenated ID as unique identifier
          label: label,
          short_description: complaint.short_description,
          complaint_description: complaint.complaint_description,
          priority: complaint.priority_value ?? 0,
          priority_value: complaint.priority_value ?? 0
        };
      });

      return complaints;
    } catch (error: any) {
      console.error('Operator visible complaints API Error:', error);

      // Handle CORS and network errors
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }

      // Handle HTTP errors
      if (error.response?.status === 400) {
        throw new Error('Invalid request. Please check your doctor ID.');
      } else if (error.response?.status === 404) {
        throw new Error('Operator visible complaints endpoint not found. Please check your backend configuration.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching operator visible complaints.');
      }

      // Handle backend-specific errors
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error(error.response?.data?.message || 'Failed to fetch operator visible complaints');
    }
  }
};

export default complaintService;
