import api from './api';

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
  labTest: any;
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

// Create lab test parameter request interface
export interface CreateLabTestParameterRequest {
  doctorId?: string;
  doctor_id?: string;
  clinicId?: string;
  clinic_id?: string;
  labTestId?: number;
  lab_test_id?: number;
  parameterName?: string;
  parameter_name?: string;
  [key: string]: any;
}

// Create lab test parameter response interface
export interface CreateLabTestParameterResponse {
  success?: boolean;
  id?: number;
  message?: string;
  error?: string;
  [key: string]: any;
}

// Update lab test parameter request interface
export interface UpdateLabTestParameterRequest extends CreateLabTestParameterRequest {}

// Update lab test parameter response interface
export interface UpdateLabTestParameterResponse extends CreateLabTestParameterResponse {}

// Delete lab test parameter response interface
export interface DeleteLabTestParameterResponse {
  success?: boolean;
  message?: string;
  error?: string;
  [key: string]: any;
}

// Lab Test and Parameter Request interface
// This replaces the USP_Insert_LabTest_And_Parameters stored procedure functionality
export interface LabTestAndParameterRequest {
  doctorId?: string;
  doctor_id?: string;
  clinicId?: string;
  clinic_id?: string;
  groupName?: string;
  group_name?: string;
  Group_Name?: string;
  oldDescription?: string;
  old_description?: string;
  Old_Description?: string;
  newDescription?: string;
  new_description?: string;
  New_Description?: string;
  description?: string;
  Description?: string;
  priority?: number;
  Priority?: number;
  Priority_Value?: number;
  priorityValue?: number;
  parameters?: Array<{
    parameterName?: string;
    parameter_name?: string;
    Parameter_Name?: string;
    [key: string]: any;
  }> | string[];
  [key: string]: any;
}

// Lab Test and Parameter Response interface
export interface LabTestAndParameterResponse {
  success?: boolean;
  labTestId?: number;
  lab_test_id?: number;
  id?: number;
  message?: string;
  error?: string;
  data?: any;
  [key: string]: any;
}

export const labParameterService = {
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
  },

  /**
   * Create a new lab test parameter
   * POST /api/lab/master/parameters
   * @param parameter - Lab test parameter data to create
   * @returns Promise<CreateLabTestParameterResponse> - Created parameter or error message
   */
  async createLabTestParameter(
    parameter: CreateLabTestParameterRequest
  ): Promise<CreateLabTestParameterResponse> {
    try {
      console.log('Creating new lab test parameter:', parameter);
      
      const resp = await api.post<CreateLabTestParameterResponse>(`/lab/master/parameters`, parameter);
      console.log('Create lab test parameter response:', resp.data);
      return resp.data;
    } catch (error: any) {
      console.error('Create lab test parameter API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        const msg = error.response?.data?.error || error.response?.data?.message || 'Invalid request parameters.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('Create lab test parameter endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while creating lab test parameter.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to create lab test parameter');
    }
  },

  /**
   * Create a new lab test parameter for a specific doctor, clinic, and lab test
   * POST /api/lab/master/parameters/doctor/{doctorId}/clinic/{clinicId}/test-id/{labTestId}
   * The parameter ID will be automatically generated.
   * @param doctorId - Doctor ID (e.g., "DR-00001")
   * @param clinicId - Clinic ID (e.g., "CLINIC001")
   * @param labTestId - Lab test ID
   * @param parameterName - Parameter name (required)
   * @param createdbyName - Created by name (optional)
   * @returns Promise<CreateLabTestParameterResponse> - Created parameter or error message
   */
  async createLabTestParameterByDoctorClinicAndTestId(
    doctorId: string,
    clinicId: string,
    labTestId: number,
    parameterName: string,
    createdbyName?: string
  ): Promise<CreateLabTestParameterResponse> {
    try {
      console.log(`Creating lab test parameter for doctor: ${doctorId}, clinic: ${clinicId}, test ID: ${labTestId}, parameter: ${parameterName}`);
      
      if (!parameterName || parameterName.trim().length === 0) {
        throw new Error('Parameter name is required');
      }
      
      const requestBody: { parameterName: string; createdbyName?: string } = {
        parameterName: parameterName.trim()
      };
      
      if (createdbyName) {
        requestBody.createdbyName = createdbyName;
      }
      
      const resp = await api.post<CreateLabTestParameterResponse>(
        `/lab/master/parameters/doctor/${encodeURIComponent(doctorId)}/clinic/${encodeURIComponent(clinicId)}/test-id/${labTestId}`,
        requestBody
      );
      console.log('Create lab test parameter by doctor/clinic/test ID response:', resp.data);
      return resp.data;
    } catch (error: any) {
      console.error('Create lab test parameter by doctor/clinic/test ID API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        const msg = error.response?.data?.error || error.response?.data?.message || 'Invalid request parameters.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('Create lab test parameter endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while creating lab test parameter.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to create lab test parameter');
    }
  },

  /**
   * Create multiple lab test parameters
   * POST /api/lab/master/parameters/batch
   * @param parameters - Array of lab test parameter data to create
   * @returns Promise<CreateLabTestParameterResponse[]> - Created parameters or error message
   */
  async createLabTestParametersBatch(
    parameters: CreateLabTestParameterRequest[]
  ): Promise<CreateLabTestParameterResponse[]> {
    try {
      console.log('Creating multiple lab test parameters:', parameters);
      
      const resp = await api.post<CreateLabTestParameterResponse[]>(`/lab/master/parameters/batch`, parameters);
      console.log('Create lab test parameters batch response:', resp.data);
      return resp.data;
    } catch (error: any) {
      console.error('Create lab test parameters batch API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        const msg = error.response?.data?.error || error.response?.data?.message || 'Invalid request parameters.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        // If batch endpoint doesn't exist, create parameters one by one
        console.log('Batch endpoint not found, creating parameters individually');
        const results: CreateLabTestParameterResponse[] = [];
        for (const param of parameters) {
          try {
            const result = await this.createLabTestParameter(param);
            results.push(result);
          } catch (err: any) {
            console.error('Error creating individual parameter:', err);
            results.push({
              success: false,
              error: err.message || 'Failed to create parameter'
            });
          }
        }
        return results;
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while creating lab test parameters.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to create lab test parameters');
    }
  },

  /**
   * Insert/Update lab test and parameters
   * This endpoint replaces the USP_Insert_LabTest_And_Parameters stored procedure functionality
   * 
   * The stored procedure logic:
   * 1. MERGE operation on Lab_Test_Master (update if exists with old description, insert if not)
   * 2. Gets the lab test ID from the inserted/updated lab test
   * 3. Inserts parameters from the request into Lab_Test_Parameter table
   * 
   * POST /api/lab/master/test-and-parameters
   * @param request - Request containing doctor ID, clinic ID, group name, old description, new description, priority, and parameter data
   * @returns Promise<LabTestAndParameterResponse> - Created/updated lab test and parameters
   */
  async insertLabTestAndParameters(
    request: LabTestAndParameterRequest
  ): Promise<LabTestAndParameterResponse> {
    try {
      console.log('Inserting/updating lab test and parameters:', request);
      
      const resp = await api.post<LabTestAndParameterResponse>(
        `/lab/master/parameters`,
        request
      );
      console.log('Insert lab test and parameters response:', resp.data);
      return resp.data;
    } catch (error: any) {
      console.error('Insert lab test and parameters API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        const msg = error.response?.data?.error || error.response?.data?.message || 'Invalid request parameters.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('Insert lab test and parameters endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while inserting/updating lab test and parameters.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to insert/update lab test and parameters');
    }
  },

  /**
   * Update an existing lab test parameter
   * PUT /api/lab/master/parameters/{parameterId}
   * @param parameterId - Parameter ID to update
   * @param parameter - Updated parameter data
   * @returns Promise<UpdateLabTestParameterResponse> - Updated parameter or error message
   */
  async updateLabTestParameter(
    parameterId: number,
    parameter: UpdateLabTestParameterRequest
  ): Promise<UpdateLabTestParameterResponse> {
    try {
      console.log('Updating lab test parameter:', parameterId, parameter);
      
      const resp = await api.put<UpdateLabTestParameterResponse>(
        `/lab/master/parameters/${parameterId}`,
        parameter
      );
      console.log('Update lab test parameter response:', resp.data);
      return resp.data;
    } catch (error: any) {
      console.error('Update lab test parameter API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        const msg = error.response?.data?.error || error.response?.data?.message || 'Invalid request parameters.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('Update lab test parameter endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while updating lab test parameter.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to update lab test parameter');
    }
  },

  /**
   * Delete a lab test parameter
   * DELETE /api/lab/master/parameters/{parameterId}
   * @param parameterId - Parameter ID to delete
   * @returns Promise<DeleteLabTestParameterResponse> - Success or error message
   */
  async deleteLabTestParameter(
    parameterId: number
  ): Promise<DeleteLabTestParameterResponse> {
    try {
      console.log('Deleting lab test parameter:', parameterId);
      
      const resp = await api.delete<DeleteLabTestParameterResponse>(
        `/lab/master/parameters/${parameterId}`
      );
      console.log('Delete lab test parameter response:', resp.data);
      return resp.data;
    } catch (error: any) {
      console.error('Delete lab test parameter API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        const msg = error.response?.data?.error || error.response?.data?.message || 'Invalid request parameters.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('Delete lab test parameter endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while deleting lab test parameter.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to delete lab test parameter');
    }
  }
};

export default labParameterService;

