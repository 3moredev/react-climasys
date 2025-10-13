import api from './api';

export interface ComplaintOption {
  value: string;
  label: string;
  short_description?: string;
  complaint_description?: string;
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
  async getAllComplaintsForDoctor(doctorId: string): Promise<ComplaintOption[]> {
    try {
      console.log('Fetching complaints for doctor:', doctorId);
      
      const response = await api.get(`/complain/all/${doctorId}`);
      console.log('Complaints API response:', response.data);
      
      // Transform API response to dropdown options format
      const complaints: ComplaintOption[] = response.data.map((complaint: ComplaintApiResponse) => ({
        value: complaint.id, // Use the concatenated ID as unique identifier
        label: complaint.short_description || complaint.complaint_description,
        short_description: complaint.short_description,
        complaint_description: complaint.complaint_description
      }));
      
      return complaints;
    } catch (error: any) {
      console.error('Complaints API Error:', error);
      
      // Handle CORS and network errors
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      // Handle HTTP errors
      if (error.response?.status === 400) {
        throw new Error('Invalid request. Please check your doctor ID.');
      } else if (error.response?.status === 404) {
        throw new Error('Complaints endpoint not found. Please check your backend configuration.');
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
      const complaints: ComplaintOption[] = response.data.map((complaint: ComplaintApiResponse) => ({
        value: complaint.id, // Use the concatenated ID as unique identifier
        label: complaint.short_description || complaint.complaint_description,
        short_description: complaint.short_description,
        complaint_description: complaint.complaint_description
      }));
      
      return complaints;
    } catch (error: any) {
      console.error('Search complaints API Error:', error);
      
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
      const complaints: ComplaintOption[] = response.data.map((complaint: ComplaintApiResponse) => ({
        value: complaint.id, // Use the concatenated ID as unique identifier
        label: complaint.short_description || complaint.complaint_description,
        short_description: complaint.short_description,
        complaint_description: complaint.complaint_description
      }));
      
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
