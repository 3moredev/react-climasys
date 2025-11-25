import api from './api';

export interface LabTestApiResponse {
  labTestName: string;
  Lab_Test_Description?: string;
  lab_test_description?: string;
  test_name?: string;
  priorityValue: number;
  Priority_Value?: number;
  priority_value?: number;
  priority?: number;
  doctor_id: string;
  doctorId?: string;
  Doctor_ID?: string;
  clinic_id: string;
  clinicId?: string;
  Clinic_ID?: string;
  created_on?: string;
  Created_On?: string;
  createdOn?: string;
  modified_on?: string | null;
  Modified_On?: string | null;
  modifiedOn?: string | null;
  ID?: string | number;
  [key: string]: any; // Allow additional fields
}

// Create lab test request interface
export interface CreateLabTestRequest {
  labTestName?: string;
  Lab_Test_Description?: string;
  labTestDescription?: string;
  priority?: number;
  priorityValue?: number;
  Priority_Value?: number;
  doctorId?: string;
  doctor_id?: string;
  clinicId?: string;
  clinic_id?: string;
  ID?: number | string;
  id?: number | string;
  groupName?: string;
  Group_Name?: string;
  group_name?: string;
  [key: string]: any; // Allow additional fields
}

// Create lab test response interface
export interface CreateLabTestResponse {
  id?: string;
  labTestName?: string;
  Lab_Test_Description?: string;
  priority?: number;
  priorityValue?: number;
  Priority_Value?: number;
  message?: string;
  error?: string;
  success?: boolean;
  [key: string]: any;
}

// Delete lab test response interface
export interface DeleteLabTestResponse {
  message?: string;
  error?: string;
  success?: boolean;
  [key: string]: any;
}

// Update lab test request interface
export interface UpdateLabTestRequest extends CreateLabTestRequest {
  ID?: number | string;
  id?: number | string;
  groupName?: string;
  Group_Name?: string;
  group_name?: string;
}

// Update lab test response interface (same as create)
export interface UpdateLabTestResponse extends CreateLabTestResponse {}

// Lab Test Parameter interfaces
export interface LabTestParameter {
  id?: number;
  labTestId?: number;
  parameterName?: string;
  parameter_name?: string;
  doctorId?: string;
  doctor_id?: string;
  clinicId?: string;
  clinic_id?: string;
  [key: string]: any;
}

export interface LabTestParameterResponse {
  success: boolean;
  data?: LabTestParameter[] | any;
  error?: string;
  message?: string;
  [key: string]: any;
}

export interface ParameterExistsResponse {
  success: boolean;
  exists: boolean;
  doctorId: string;
  labTestId: number;
  parameterName: string;
  error?: string;
}

export interface ParameterCountResponse {
  success: boolean;
  count: number;
  doctorId: string;
  labTestId: number;
  error?: string;
}

export interface LabTestWithParameters {
  labTest: LabTestApiResponse;
  parameters: LabTestParameter[];
  [key: string]: any;
}

export interface AllLabTestsWithParametersResponse {
  success: boolean;
  data?: LabTestWithParameters[];
  error?: string;
  message?: string;
  [key: string]: any;
}

export const labService = {
  /**
   * Get all lab tests for a doctor (for management page)
   * @param doctorId - Doctor ID
   * @param clinicId - Clinic ID
   * @returns Promise<LabTestApiResponse[]> - Array of lab test objects
   */
  async getAllLabTestsForDoctor(doctorId: string, clinicId: string): Promise<LabTestApiResponse[]> {
    try {
      console.log(`Getting all lab tests for doctor: ${doctorId}, clinic: ${clinicId}`);
      const resp = await api.get<any>(`/lab/master/tests/doctor/${encodeURIComponent(doctorId)}/clinic/${encodeURIComponent(clinicId)}`);
      console.log('Get all lab tests for doctor raw response:', resp.data);
      console.log('Response type:', typeof resp.data, 'Is array:', Array.isArray(resp.data));
      
      const data: any = resp.data;
      
      // Handle different response structures
      // 1. Direct array response
      // 2. Wrapped in { labTests: [...] }
      // 3. Wrapped in { data: [...] }
      // 4. Wrapped in { success: true, data: [...] }
      
      let items: any[] = [];
      
      if (Array.isArray(data)) {
        // Direct array response
        items = data;
      } else if (Array.isArray(data?.labTests)) {
        // Wrapped in labTests property
        items = data.labTests;
      } else if (Array.isArray(data?.data)) {
        // Wrapped in data property
        items = data.data;
      } else if (data?.success === true && Array.isArray(data?.data)) {
        // Success wrapper with data array
        items = data.data;
      } else if (data?.success === true && Array.isArray(data?.labTests)) {
        // Success wrapper with labTests array
        items = data.labTests;
      } else {
        // If no array found, log warning and return empty array
        console.warn('Unexpected response structure:', data);
        items = [];
      }
      
      // Check if success flag is present and false
      if (typeof data?.success === 'boolean' && !data.success) {
        throw new Error(data?.error || data?.message || 'Failed to fetch lab tests');
      }
      
      // Map the items to LabTestApiResponse format
      const mappedItems: LabTestApiResponse[] = items.map((item: any) => {
        // Handle different field name variations
        const labTestName = item.labTestName || item.Lab_Test_Description || item.lab_test_description || item.test_name || '';
        const priorityValue = item.priorityValue || item.Priority_Value || item.priority_value || item.priority || 0;
        const doctorIdValue = item.doctorId || item.doctor_id || item.Doctor_ID || doctorId;
        const clinicIdValue = item.clinicId || item.clinic_id || item.Clinic_ID || clinicId;
        
        return {
          labTestName: labTestName,
          Lab_Test_Description: labTestName,
          priorityValue: typeof priorityValue === 'number' ? priorityValue : parseInt(String(priorityValue), 10) || 0,
          Priority_Value: typeof priorityValue === 'number' ? priorityValue : parseInt(String(priorityValue), 10) || 0,
          doctor_id: doctorIdValue,
          clinic_id: clinicIdValue,
          ID: item.ID || item.id || item.Id || item.labTestId || item.lab_test_id,
          id: item.ID || item.id || item.Id || item.labTestId || item.lab_test_id,
          created_on: item.created_on || item.Created_On || item.createdOn,
          modified_on: item.modified_on || item.Modified_On || item.modifiedOn || null
        };
      });
      
      console.log('Mapped lab tests:', mappedItems);
      return mappedItems;
    } catch (error: any) {
      console.error('Get all lab tests for doctor API Error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        const msg = error.response?.data?.error || error.response?.data?.message || 'Invalid request parameters.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('Lab tests endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching lab tests.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to get lab tests');
    }
  },

  /**
   * Delete a lab test by ID
   * DELETE /api/lab/master/tests/doctor/{doctorId}/id/{id}/clinic/{clinicId}
   * @param doctorId - Doctor ID
   * @param id - Lab test ID
   * @param clinicId - Clinic ID
   * @returns Promise<DeleteLabTestResponse> - Success or error message
   */
  async deleteLabTest(doctorId: string, id: number | string, clinicId: string): Promise<DeleteLabTestResponse> {
    try {
      console.log(`Deleting lab test ID: ${id} for doctor: ${doctorId} and clinic: ${clinicId}`);
      
      const resp = await api.delete<DeleteLabTestResponse>(
        `/lab/master/tests/doctor/${encodeURIComponent(doctorId)}/id/${id}/clinic/${encodeURIComponent(clinicId)}`
      );
      console.log('Delete lab test response:', resp.data);
      return resp.data;
    } catch (error: any) {
      console.error('Delete lab test API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        const msg = error.response?.data?.error || error.response?.data?.message || 'Invalid request parameters.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        const msg = error.response?.data?.error || 'Lab test not found or access denied.';
        throw new Error(msg);
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while deleting lab test.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to delete lab test');
    }
  },

  /**
   * Delete a lab test by name (legacy method for backward compatibility)
   * @param doctorId - Doctor ID
   * @param clinicId - Clinic ID
   * @param labTestName - Lab test name to delete
   * @returns Promise<DeleteLabTestResponse> - Success or error message
   */
  async deleteLabTestByName(doctorId: string, clinicId: string, labTestName: string): Promise<DeleteLabTestResponse> {
    try {
      console.log(`Deleting lab test: ${labTestName} for doctor: ${doctorId} and clinic: ${clinicId}`);
      
      // Encode the labTestName to handle special characters
      const encodedLabTestName = encodeURIComponent(labTestName);
      
      // Try common mount points
      try {
        const resp = await api.delete<DeleteLabTestResponse>(
          `/lab-master/doctor/${encodeURIComponent(doctorId)}/clinic/${encodeURIComponent(clinicId)}/lab-test/${encodedLabTestName}`
        );
        console.log('Delete lab test response:', resp.data);
        return resp.data;
      } catch (e1: any) {
        if (e1?.response?.status !== 404) throw e1;
        // Fallback to alternative endpoint
        try {
          const resp = await api.delete<DeleteLabTestResponse>(
            `/lab-test/doctor/${encodeURIComponent(doctorId)}/clinic/${encodeURIComponent(clinicId)}/lab-test/${encodedLabTestName}`
          );
          console.log('Delete lab test response (fallback):', resp.data);
          return resp.data;
        } catch (e2: any) {
          if (e2?.response?.status !== 404) throw e2;
          // Last fallback
          const resp = await api.delete<DeleteLabTestResponse>(
            `/lab-tests/doctor/${encodeURIComponent(doctorId)}/clinic/${encodeURIComponent(clinicId)}/lab-test/${encodedLabTestName}`
          );
          console.log('Delete lab test response (fallback 2):', resp.data);
          return resp.data;
        }
      }
    } catch (error: any) {
      console.error('Delete lab test by name API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        const msg = error.response?.data?.error || error.response?.data?.message || 'Invalid request parameters.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        const msg = error.response?.data?.error || 'Lab test not found or access denied.';
        throw new Error(msg);
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while deleting lab test.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to delete lab test');
    }
  },

  /**
   * Create a new lab test
   * POST /api/lab/master/tests
   * @param labTest - Lab test data to create (must include doctorId, clinicId, and labTestDescription)
   * @returns Promise<CreateLabTestResponse> - Created lab test or error message
   */
  async createLabTest(labTest: CreateLabTestRequest): Promise<CreateLabTestResponse> {
    try {
      console.log('Creating new lab test:', labTest);
      
      const resp = await api.post<CreateLabTestResponse>(`/lab/master/tests`, labTest);
      console.log('Create lab test response:', resp.data);
      return resp.data;
    } catch (error: any) {
      console.error('Create lab test API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        const msg = error.response?.data?.error || error.response?.data?.message || 'Invalid request parameters or lab test already exists.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        // Fallback to legacy endpoints if new endpoint not found
        try {
          const resp = await api.post<CreateLabTestResponse>(`/lab-master`, labTest);
          console.log('Create lab test response (fallback):', resp.data);
          return resp.data;
        } catch (e1: any) {
          if (e1?.response?.status !== 404) throw e1;
          try {
            const resp = await api.post<CreateLabTestResponse>(`/lab-test-master`, labTest);
            console.log('Create lab test response (fallback 2):', resp.data);
            return resp.data;
          } catch (e2: any) {
            if (e2?.response?.status !== 404) throw e2;
            const resp = await api.post<CreateLabTestResponse>(`/lab-test`, labTest);
            console.log('Create lab test response (fallback 3):', resp.data);
            return resp.data;
          }
        }
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while creating lab test.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to create lab test');
    }
  },

  /**
   * Update an existing lab test using request body
   * Only updates lab test description, group name, and priority value
   * Doctor ID, ID, and Clinic ID cannot be changed (they are part of the composite key)
   * PUT /api/lab/master/tests
   * @param labTest - Updated lab test data (must include ID, doctorId, clinicId)
   * @returns Promise<UpdateLabTestResponse> - Updated lab test or error message
   */
  async updateLabTest(labTest: UpdateLabTestRequest): Promise<UpdateLabTestResponse> {
    try {
      console.log('Updating lab test:', labTest);
      
      const resp = await api.put<UpdateLabTestResponse>(`/lab/master/tests`, labTest);
      console.log('Update lab test response:', resp.data);
      return resp.data;
    } catch (error: any) {
      console.error('Update lab test API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        const msg = error.response?.data?.error || error.response?.data?.message || 'Invalid request parameters.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('Update lab test endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while updating lab test.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to update lab test');
    }
  },

  /**
   * Update an existing lab test using path variables (legacy method for backward compatibility)
   * Only updates lab test name and priority value
   * Lab test name, doctor ID, and clinic ID cannot be changed (they are part of the composite key)
   * PUT /api/lab-master/doctor/{doctorId}/clinic/{clinicId}/lab-test/{labTestName}
   * @param doctorId - Doctor ID (path variable)
   * @param clinicId - Clinic ID (path variable)
   * @param labTestName - Lab test name to update (path variable, used as identifier)
   * @param labTest - Updated lab test data (only labTestName and priorityValue are updated)
   * @returns Promise<UpdateLabTestResponse> - Updated lab test or error message
   */
  async updateLabTestByPath(doctorId: string, clinicId: string, labTestName: string, labTest: UpdateLabTestRequest): Promise<UpdateLabTestResponse> {
    try {
      console.log('Updating lab test:', labTestName, 'for doctor:', doctorId, 'and clinic:', clinicId);
      
      // Encode the labTestName to handle special characters
      const encodedLabTestName = encodeURIComponent(labTestName);
      
      // Primary endpoint: PUT /api/lab-master/doctor/{doctorId}/clinic/{clinicId}/lab-test/{labTestName}
      try {
        const resp = await api.put<UpdateLabTestResponse>(
          `/lab-master/doctor/${encodeURIComponent(doctorId)}/clinic/${encodeURIComponent(clinicId)}/lab-test/${encodedLabTestName}`,
          labTest
        );
        console.log('Update lab test response:', resp.data);
        return resp.data;
      } catch (e1: any) {
        if (e1?.response?.status !== 404) throw e1;
        // Fallback to alternative endpoint
        try {
          const resp = await api.put<UpdateLabTestResponse>(
            `/lab-test/doctor/${encodeURIComponent(doctorId)}/clinic/${encodeURIComponent(clinicId)}/lab-test/${encodedLabTestName}`,
            labTest
          );
          console.log('Update lab test response (fallback):', resp.data);
          return resp.data;
        } catch (e2: any) {
          if (e2?.response?.status !== 404) throw e2;
          // Last fallback
          const resp = await api.put<UpdateLabTestResponse>(
            `/lab-tests/doctor/${encodeURIComponent(doctorId)}/clinic/${encodeURIComponent(clinicId)}/lab-test/${encodedLabTestName}`,
            labTest
          );
          console.log('Update lab test response (fallback 2):', resp.data);
          return resp.data;
        }
      }
    } catch (error: any) {
      console.error('Update lab test API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        const msg = error.response?.data?.error || error.response?.data?.message || 'Invalid request parameters.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('Update lab test endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while updating lab test.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to update lab test');
    }
  },

  /**
   * Get lab test parameters for a specific doctor, clinic and lab test description
   * Replaces the USP_Get_LabTestAndParameter stored procedure functionality
   * GET /api/lab/master/parameters/doctor/{doctorId}/clinic/{clinicId}/test/{labTestDescription}
   * @param doctorId - Doctor ID
   * @param clinicId - Clinic ID
   * @param labTestDescription - Lab test description to filter parameters
   * @returns Promise<LabTestParameterResponse> - Lab test parameters response
   */
  async getLabTestParametersByDoctorClinicAndTest(
    doctorId: string,
    clinicId: string,
    labTestDescription: string
  ): Promise<LabTestParameterResponse> {
    try {
      console.log(`Getting lab test parameters for doctor: ${doctorId}, clinic: ${clinicId}, test: ${labTestDescription}`);
      
      const encodedDescription = encodeURIComponent(labTestDescription);
      const resp = await api.get<LabTestParameterResponse>(
        `/lab/master/parameters/doctor/${encodeURIComponent(doctorId)}/clinic/${encodeURIComponent(clinicId)}/test/${encodedDescription}`
      );
      console.log('Get lab test parameters response:', resp.data);
      return resp.data;
    } catch (error: any) {
      console.error('Get lab test parameters API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        const msg = error.response?.data?.error || error.response?.data?.message || 'Invalid request parameters.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('Lab test parameters endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching lab test parameters.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to get lab test parameters');
    }
  },

  /**
   * Get lab test parameters for a specific doctor, clinic and lab test ID
   * GET /api/lab/master/parameters/doctor/{doctorId}/clinic/{clinicId}/test-id/{labTestId}
   * @param doctorId - Doctor ID
   * @param clinicId - Clinic ID
   * @param labTestId - Lab test ID
   * @returns Promise<LabTestParameterResponse> - Lab test parameters response
   */
  async getLabTestParametersByDoctorClinicAndTestId(
    doctorId: string,
    clinicId: string,
    labTestId: number
  ): Promise<LabTestParameterResponse> {
    try {
      console.log(`Getting lab test parameters for doctor: ${doctorId}, clinic: ${clinicId}, test ID: ${labTestId}`);
      
      const resp = await api.get<LabTestParameterResponse>(
        `/lab/master/parameters/doctor/${encodeURIComponent(doctorId)}/clinic/${encodeURIComponent(clinicId)}/test-id/${labTestId}`
      );
      console.log('Get lab test parameters by test ID response:', resp.data);
      return resp.data;
    } catch (error: any) {
      console.error('Get lab test parameters by test ID API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        const msg = error.response?.data?.error || error.response?.data?.message || 'Invalid request parameters.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('Lab test parameters endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching lab test parameters.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to get lab test parameters');
    }
  },

  /**
   * Get all lab test parameters for a doctor and clinic
   * GET /api/lab/master/parameters/doctor/{doctorId}/clinic/{clinicId}
   * @param doctorId - Doctor ID
   * @param clinicId - Clinic ID
   * @returns Promise<LabTestParameterResponse> - All lab test parameters response
   */
  async getAllLabTestParametersForDoctorAndClinic(
    doctorId: string,
    clinicId: string
  ): Promise<LabTestParameterResponse> {
    try {
      console.log(`Getting all lab test parameters for doctor: ${doctorId}, clinic: ${clinicId}`);
      
      const resp = await api.get<LabTestParameterResponse>(
        `/lab/master/parameters/doctor/${encodeURIComponent(doctorId)}/clinic/${encodeURIComponent(clinicId)}`
      );
      console.log('Get all lab test parameters response:', resp.data);
      return resp.data;
    } catch (error: any) {
      console.error('Get all lab test parameters API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        const msg = error.response?.data?.error || error.response?.data?.message || 'Invalid request parameters.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('Lab test parameters endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching lab test parameters.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to get lab test parameters');
    }
  },

  /**
   * Check if lab test parameter exists
   * GET /api/lab/master/parameters/exists?doctorId={doctorId}&labTestId={labTestId}&parameterName={parameterName}
   * @param doctorId - Doctor ID
   * @param labTestId - Lab test ID
   * @param parameterName - Parameter name
   * @returns Promise<ParameterExistsResponse> - Parameter existence response
   */
  async checkParameterExists(
    doctorId: string,
    labTestId: number,
    parameterName: string
  ): Promise<ParameterExistsResponse> {
    try {
      console.log(`Checking if parameter exists: doctorId=${doctorId}, labTestId=${labTestId}, parameterName=${parameterName}`);
      
      const resp = await api.get<ParameterExistsResponse>(
        `/lab/master/parameters/exists`,
        {
          params: {
            doctorId: doctorId,
            labTestId: labTestId,
            parameterName: parameterName
          }
        }
      );
      console.log('Check parameter exists response:', resp.data);
      return resp.data;
    } catch (error: any) {
      console.error('Check parameter exists API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        const msg = error.response?.data?.error || error.response?.data?.message || 'Invalid request parameters.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('Parameter exists endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while checking parameter existence.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to check parameter existence');
    }
  },

  /**
   * Get count of lab test parameters for a doctor and lab test
   * GET /api/lab/master/parameters/count?doctorId={doctorId}&labTestId={labTestId}
   * @param doctorId - Doctor ID
   * @param labTestId - Lab test ID
   * @returns Promise<ParameterCountResponse> - Parameter count response
   */
  async getParameterCount(
    doctorId: string,
    labTestId: number
  ): Promise<ParameterCountResponse> {
    try {
      console.log(`Getting parameter count for doctor: ${doctorId}, labTestId: ${labTestId}`);
      
      const resp = await api.get<ParameterCountResponse>(
        `/lab/master/parameters/count`,
        {
          params: {
            doctorId: doctorId,
            labTestId: labTestId
          }
        }
      );
      console.log('Get parameter count response:', resp.data);
      return resp.data;
    } catch (error: any) {
      console.error('Get parameter count API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        const msg = error.response?.data?.error || error.response?.data?.message || 'Invalid request parameters.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('Parameter count endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while getting parameter count.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to get parameter count');
    }
  },

  /**
   * Get all lab tests with their parameters for a doctor and clinic
   * GET /api/lab/master/parameters/doctor/{doctorId}/clinic/{clinicId}/all-with-parameters
   * @param doctorId - Doctor ID
   * @param clinicId - Clinic ID
   * @returns Promise<AllLabTestsWithParametersResponse> - All lab tests with parameters response
   */
  async getAllLabTestsWithParameters(
    doctorId: string,
    clinicId: string
  ): Promise<AllLabTestsWithParametersResponse> {
    try {
      console.log(`Getting all lab tests with parameters for doctor: ${doctorId}, clinic: ${clinicId}`);
      
      const resp = await api.get<AllLabTestsWithParametersResponse>(
        `/lab/master/parameters/doctor/${encodeURIComponent(doctorId)}/clinic/${encodeURIComponent(clinicId)}/all-with-parameters`
      );
      console.log('Get all lab tests with parameters response:', resp.data);
      return resp.data;
    } catch (error: any) {
      console.error('Get all lab tests with parameters API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        const msg = error.response?.data?.error || error.response?.data?.message || 'Invalid request parameters.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('Get all lab tests with parameters endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching lab tests with parameters.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to get lab tests with parameters');
    }
  }
};

export default labService;

