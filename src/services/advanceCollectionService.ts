import api from './api';

// Advance Collection DTO interface
export interface AdvanceCollectionDTO {
  dateOfAdvance: string;
  receiptNo: string;
  advance: number;
  // Add other fields as needed based on backend response
}

// Advance Collection Details Response
export interface AdvanceCollectionDetailsResponse {
  success: boolean;
  count: number;
  data: AdvanceCollectionDTO[];
  patientId: string;
  clinicId: string;
  ipdRefNo: string;
  error?: string;
}

// Advance Collection Details Request
export interface AdvanceCollectionDetailsRequest {
  patientId: string;
  clinicId: string;
  ipdRefNo: string;
}

// Advance Collection Search Result DTO
export interface AdvanceCollectionSearchResultDTO {
  patientId: string;
  patientName: string;
  ipdRefNo: string;
  admissionDate?: string;
  // Add other fields as needed based on backend response
}

// Advance Collection Search Response
export interface AdvanceCollectionSearchResponse {
  success: boolean;
  count: number;
  data: AdvanceCollectionSearchResultDTO[];
  searchStr: string;
  doctorId?: string;
  error?: string;
}

// Advance Collection Search Request
export interface AdvanceCollectionSearchRequest {
  searchStr: string;
  doctorId?: string; // Optional - if not provided, searches across all doctors
}

// Advance Collection Request (for save)
export interface AdvanceCollectionRequest {
  patientId: string;
  clinicId: string;
  doctorId: string;
  ipdRefNo: string;
  dateOfAdvance: string;
  receiptNo: string;
  advance: number;
  // Add other fields as needed based on backend request
}

// Advance Collection Save Response
export interface AdvanceCollectionSaveResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export const advanceCollectionService = {
  /**
   * Get advance collection details for a specific patient's IPD admission
   * Mirrors backend @GetMapping("/details") under @RequestMapping("/api/advance-collections")
   * Retrieves advance payment details for a specific patient's IPD admission.
   * @param params - Request parameters including patientId (required), clinicId (required), and ipdRefNo (required)
   * @returns Promise<AdvanceCollectionDetailsResponse>
   */
  async getAdvanceDetails(params: AdvanceCollectionDetailsRequest): Promise<AdvanceCollectionDetailsResponse> {
    try {
      console.log('Fetching advance collection details with params:', params);
      
      // Build query parameters
      const query: Record<string, string> = {
        patientId: params.patientId,
        clinicId: params.clinicId,
        ipdRefNo: params.ipdRefNo
      };
      
      // Call the backend endpoint /api/advance-collections/details
      // Note: baseURL already includes /api, so we use /advance-collections/details
      const resp = await api.get<AdvanceCollectionDetailsResponse>(`/advance-collections/details`, { params: query });
      console.log('Get advance collection details response:', resp.data);
      return resp.data;
    } catch (error: any) {
      console.error('Get advance collection details API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        const msg = error.response?.data?.message || error.response?.data?.error || 'Invalid request parameters.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('Advance collection details endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching advance collection details.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to fetch advance collection details');
    }
  },

  /**
   * Search patients with advance cards (autocomplete)
   * Mirrors backend @GetMapping("/search") under @RequestMapping("/api/advance-collections")
   * Autocomplete search for patients with advance cards by patient ID, name, or IPD number.
   * @param params - Request parameters including searchStr (required) and doctorId (required)
   * @returns Promise<AdvanceCollectionSearchResponse>
   */
  async searchPatientsWithAdvanceCard(params: AdvanceCollectionSearchRequest): Promise<AdvanceCollectionSearchResponse> {
    try {
      console.log('Searching patients with advance cards with params:', params);
      
      // Build query parameters
      const query: Record<string, string> = {
        searchStr: params.searchStr
      };
      
      // Only add doctorId if provided
      if (params.doctorId) {
        query.doctorId = params.doctorId;
      }
      
      // Call the backend endpoint /api/advance-collections/search
      // Note: baseURL already includes /api, so we use /advance-collections/search
      const resp = await api.get<AdvanceCollectionSearchResponse>(`/advance-collections/search`, { params: query });
      console.log('Search patients with advance cards response:', resp.data);
      return resp.data;
    } catch (error: any) {
      console.error('Search patients with advance cards API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        const msg = error.response?.data?.message || error.response?.data?.error || 'Invalid request parameters.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('Search patients with advance cards endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while searching patients with advance cards.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to search patients with advance cards');
    }
  },

  /**
   * Insert or update advance collection
   * Mirrors backend @PostMapping under @RequestMapping("/api/advance-collections")
   * Insert new or update existing advance collection record.
   * @param request - Advance collection request data
   * @returns Promise<AdvanceCollectionSaveResponse>
   */
  async saveAdvanceCollection(request: AdvanceCollectionRequest): Promise<AdvanceCollectionSaveResponse> {
    try {
      console.log('Saving advance collection with data:', request);
      
      // Call the backend endpoint /api/advance-collections
      // Note: baseURL already includes /api, so we use /advance-collections
      const resp = await api.post<AdvanceCollectionSaveResponse>(`/advance-collections`, request);
      console.log('Save advance collection response:', resp.data);
      return resp.data;
    } catch (error: any) {
      console.error('Save advance collection API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        const msg = error.response?.data?.message || error.response?.data?.error || 'Invalid request data.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('Save advance collection endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while saving advance collection.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to save advance collection');
    }
  }
};

export default advanceCollectionService;

