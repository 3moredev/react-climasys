import api from './api';

export interface ProcedureMaster {
  procedureDescription: string;
  doctorId: string;
  clinicId: string;
  createdOn?: string;
  createdByName?: string;
  modifiedOn?: string;
  modifiedByName?: string;
  priorityValue?: number | null;
}

export interface ProcedureFindings {
  doctorId: string;
  procedureDescription: string;
  findingsDescription: string;
  createdOn?: string;
  createdByName?: string;
  modifiedOn?: string;
  modifiedByName?: string;
  priorityValue?: number | null;
}

export const procedureService = {
  /**
   * Get all procedures for a doctor
   * @param doctorId - Doctor ID
   * @returns Promise<ProcedureMaster[]> - Array of procedures
   */
  async getAllProceduresForDoctor(doctorId: string): Promise<ProcedureMaster[]> {
    try {
      if (!doctorId) {
        throw new Error('Doctor ID is required to load procedures.');
      }

      console.log('Fetching procedures for doctor:', doctorId);
      
      const response = await api.get<ProcedureMaster[]>(`/procedure-master/doctor/${doctorId}`);
      console.log('Get procedures response:', response.data);
      
      return response.data || [];
    } catch (error: any) {
      console.error('Procedures API Error:', error);
      
      // Handle CORS and network errors
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      // Handle HTTP errors
      if (error.response?.status === 400) {
        throw new Error('Invalid request. Please check your doctor ID.');
      } else if (error.response?.status === 404) {
        throw new Error('Procedures endpoint not found. Please check your backend configuration.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching procedures.');
      }
      
      // Handle backend-specific errors
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to fetch procedures');
    }
  },

  /**
   * Search procedures by description for a doctor
   * @param doctorId - Doctor ID
   * @param searchTerm - Search term
   * @returns Promise<ProcedureMaster[]> - Array of filtered procedures
   */
  async searchProcedures(doctorId: string, searchTerm: string): Promise<ProcedureMaster[]> {
    try {
      if (!doctorId) {
        throw new Error('Doctor ID is required to search procedures.');
      }
      if (!searchTerm || !searchTerm.trim()) {
        // If search term is empty, return all procedures
        return this.getAllProceduresForDoctor(doctorId);
      }

      console.log('Searching procedures for doctor:', doctorId, 'with term:', searchTerm);
      
      const response = await api.get<ProcedureMaster[]>(`/procedure-master/doctor/${doctorId}/search`, {
        params: { term: searchTerm }
      });
      console.log('Search procedures API response:', response.data);
      
      return response.data || [];
    } catch (error: any) {
      console.error('Search procedures API Error:', error);
      
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
        throw new Error('Server error occurred while searching procedures.');
      }
      
      // Handle backend-specific errors
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to search procedures');
    }
  },

  /**
   * Get all findings for a procedure
   * @param doctorId - Doctor ID
   * @param procedureDescription - Procedure description
   * @returns Promise<ProcedureFindings[]> - Array of findings
   */
  async getFindingsForProcedure(doctorId: string, procedureDescription: string): Promise<ProcedureFindings[]> {
    try {
      if (!doctorId) {
        throw new Error('Doctor ID is required to load findings.');
      }
      if (!procedureDescription) {
        throw new Error('Procedure description is required to load findings.');
      }

      console.log('Fetching findings for procedure:', procedureDescription, 'doctor:', doctorId);
      
      const response = await api.get<ProcedureFindings[]>(`/procedure-master/doctor/${doctorId}/procedure/${encodeURIComponent(procedureDescription)}/findings`);
      console.log('Get findings response:', response.data);
      
      return response.data || [];
    } catch (error: any) {
      console.error('Findings API Error:', error);
      
      // Handle CORS and network errors
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      // Handle HTTP errors
      if (error.response?.status === 400) {
        throw new Error('Invalid request. Please check your parameters.');
      } else if (error.response?.status === 404) {
        // Findings not found is not necessarily an error - return empty array
        return [];
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching findings.');
      }
      
      // Handle backend-specific errors
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to fetch findings');
    }
  },

  /**
   * Create a new procedure
   * @param procedure - Procedure data
   * @returns Promise<ProcedureMaster> - Created procedure
   */
  async createProcedure(procedure: ProcedureMaster): Promise<ProcedureMaster> {
    try {
      console.log('Creating procedure:', procedure);
      
      const response = await api.post<ProcedureMaster>('/procedure-master', procedure);
      console.log('Create procedure response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Create procedure API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.error || 'Invalid procedure data.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while creating procedure.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to create procedure');
    }
  },

  /**
   * Update an existing procedure
   * @param procedure - Procedure data
   * @returns Promise<ProcedureMaster> - Updated procedure
   */
  async updateProcedure(procedure: ProcedureMaster): Promise<ProcedureMaster> {
    try {
      console.log('Updating procedure:', procedure);
      
      const response = await api.put<ProcedureMaster>('/procedure-master', procedure);
      console.log('Update procedure response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Update procedure API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.error || 'Invalid procedure data.');
      } else if (error.response?.status === 404) {
        throw new Error('Procedure not found.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while updating procedure.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to update procedure');
    }
  },

  /**
   * Add a finding to a procedure
   * @param finding - Finding data
   * @returns Promise<ProcedureFindings> - Created finding
   */
  async addFinding(finding: ProcedureFindings): Promise<ProcedureFindings> {
    try {
      console.log('Adding finding:', finding);
      
      const response = await api.post<ProcedureFindings>('/procedure-master/findings', finding);
      console.log('Add finding response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Add finding API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.error || 'Invalid finding data.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while adding finding.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to add finding');
    }
  },

  /**
   * Delete a finding from a procedure
   * @param doctorId - Doctor ID
   * @param procedureDescription - Procedure description
   * @param findingsDescription - Findings description
   * @returns Promise<void>
   */
  async deleteFinding(doctorId: string, procedureDescription: string, findingsDescription: string): Promise<void> {
    try {
      console.log('Deleting finding:', findingsDescription, 'from procedure:', procedureDescription, 'for doctor:', doctorId);
      
      await api.delete(`/procedure-master/doctor/${doctorId}/procedure/${encodeURIComponent(procedureDescription)}/finding/${encodeURIComponent(findingsDescription)}`);
      console.log('Delete finding successful');
    } catch (error: any) {
      console.error('Delete finding API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.error || 'Invalid request.');
      } else if (error.response?.status === 404) {
        throw new Error('Finding not found.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while deleting finding.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to delete finding');
    }
  },

  /**
   * Delete a procedure
   * @param doctorId - Doctor ID
   * @param clinicId - Clinic ID
   * @param procedureDescription - Procedure description
   * @returns Promise<void>
   */
  async deleteProcedure(doctorId: string, clinicId: string, procedureDescription: string): Promise<void> {
    try {
      console.log('Deleting procedure:', procedureDescription, 'for doctor:', doctorId, 'clinic:', clinicId);
      
      await api.delete(`/procedure-master/doctor/${doctorId}/clinic/${clinicId}/procedure/${encodeURIComponent(procedureDescription)}`);
      console.log('Delete procedure successful');
    } catch (error: any) {
      console.error('Delete procedure API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.error || 'Invalid request.');
      } else if (error.response?.status === 404) {
        throw new Error('Procedure not found.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while deleting procedure.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to delete procedure');
    }
  }
};

export default procedureService;

