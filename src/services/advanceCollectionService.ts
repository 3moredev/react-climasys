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
  visitDate?: string; // Visit date from discharge_data
  mobile?: string;
  searchValue?: string; // Full search value string
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
  date: string; // Backend expects 'date' field in date-only format (yyyy-mm-dd) (NOT NULL constraint)
  advanceDate?: string; // Optional: advance_date column in date-only format (yyyy-mm-dd)
  receiptNo: string;
  amountReceived: number;
  paymentById?: number; // Payment method ID
  paymentRemark?: string;
  shiftId: number;
  loginId: string;
  receiptDate?: string; // Optional: receipt date in date-only format (yyyy-mm-dd)
  // Add other fields as needed based on backend request
}

// Advance Collection Save Response
export interface AdvanceCollectionSaveResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

// Admission Card Data Request
export interface AdmissionCardDataRequest {
  patientId: string;
  clinicId: string;
  doctorId: string;
  ipdRefNo: string;
  ipdDate: string; // ISO date format (yyyy-mm-dd)
}

// Admission Card Data Response
export interface AdmissionCardDataResponse {
  success: boolean;
  data?: any; // Will contain previous advance records, current advance details, admission data, and total advance amount
  error?: string;
}

// Receipt Details Request
export interface ReceiptDetailsRequest {
  // Add fields based on backend ReceiptDetailsRequest DTO
  // Common fields might include:
  patientId: string;
  clinicId: string;
  doctorId: string;
  ipdRefNo?: string;
  receiptNo: string;
  amount: number;
  paymentById?: number;
  paymentRemark?: string;
  shiftId: number;
  loginId: string;
  date?: string;
  // Add other fields as needed based on backend request
}

// Receipt Details Response
export interface ReceiptDetailsResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

// Hospital Bill Receipt Data Request
export interface HospitalBillReceiptDataRequest {
  patientId: string;
  shiftId: number;
  clinicId: string;
  doctorId: string;
  visitDate: string; // ISO date format (yyyy-mm-dd)
  visitType: string;
  billNo?: string; // Optional
  receiptNo: string;
}

// Hospital Bill Receipt Data Response
export interface HospitalBillReceiptDataResponse {
  success: boolean;
  data?: any; // Will contain receipt information and payment details
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
      const resp = await api.get<AdvanceCollectionDetailsResponse>(`/advance-collection/details`, { params: query });
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
      
      // // Only add doctorId if provided
      // if (params.doctorId) {
      //   query.doctorId = params.doctorId;
      // }
      
      // Call the backend endpoint /api/advance-collection/search
      // Note: baseURL already includes /api, so we use /advance-collection/search
      const resp = await api.get<AdvanceCollectionSearchResponse>(`/advance-collection/search`, { params: query });
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
      // Note: baseURL already includes /api, so we use /advance-collection
      const resp = await api.post<AdvanceCollectionSaveResponse>(`/advance-collection`, request);
      console.log('Save advance collection response:', resp.data);
      return resp.data;
    } catch (error: any) {
      console.error('Save advance collection API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        // Log full error response for debugging - expand all nested objects
        const errorData = error.response?.data;
        console.error('400 Bad Request - Full error response:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: errorData,
          dataStringified: JSON.stringify(errorData, null, 2),
          headers: error.response?.headers
        });
        console.error('400 Bad Request - Error data details:', errorData);
        
        // Try to extract detailed error message
        let errorMsg = 'Invalid request data.';
        if (errorData) {
          if (typeof errorData === 'string') {
            errorMsg = errorData;
          } else if (errorData.message) {
            errorMsg = errorData.message;
          } else if (errorData.error) {
            errorMsg = errorData.error;
          } else if (errorData.errors) {
            // Handle validation errors array
            const errors = Array.isArray(errorData.errors) 
              ? errorData.errors.join(', ')
              : JSON.stringify(errorData.errors);
            errorMsg = `Validation errors: ${errors}`;
          } else if (Object.keys(errorData).length > 0) {
            // If data is an object with properties, stringify it
            errorMsg = JSON.stringify(errorData, null, 2);
          } else {
            errorMsg = JSON.stringify(errorData);
          }
        }
        throw new Error(errorMsg);
      } else if (error.response?.status === 404) {
        throw new Error('Save advance collection endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        // Try to extract detailed error message from 500 response
        const errorMsg = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.response?.data?.errorMessage ||
                        (typeof error.response?.data === 'string' ? error.response.data : null) ||
                        'Server error occurred while saving advance collection.';
        console.error('Server 500 error details:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
        throw new Error(errorMsg);
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to save advance collection');
    }
  },

  /**
   * Get admission card data for Advance Collection screen
   * Replicates USP_Get_Patient_AdmissionCard_data
   * Mirrors backend @GetMapping("/admission-card-data")
   * Retrieves admission card data including previous advance records, current advance details, admission data, and total advance amount
   * @param params - Request parameters including patientId, clinicId, doctorId, ipdRefNo, and ipdDate
   * @returns Promise<AdmissionCardDataResponse>
   */
  async getAdmissionCardData(params: AdmissionCardDataRequest): Promise<AdmissionCardDataResponse> {
    try {
      console.log('Fetching admission card data with params:', params);
      
      // Build query parameters
      const query: Record<string, string> = {
        patientId: params.patientId,
        clinicId: params.clinicId,
        doctorId: params.doctorId,
        ipdRefNo: params.ipdRefNo,
        ipdDate: params.ipdDate
      };
      
      // Call the backend endpoint /api/advance-collection/admission-card-data
      const resp = await api.get<AdmissionCardDataResponse>(`/advance-collection/admission-card-data`, { params: query });
      console.log('Get admission card data response:', resp.data);
      return resp.data;
    } catch (error: any) {
      console.error('Get admission card data API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        const msg = error.response?.data?.message || error.response?.data?.error || 'Invalid request parameters.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('Admission card data endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        const errorMsg = error.response?.data?.error || 'Server error occurred while fetching admission card data.';
        throw new Error(errorMsg);
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to fetch admission card data');
    }
  },

  /**
   * Save advance receipt details
   * Replicates USP_Insert_AdvanceReceiptDetails
   * Mirrors backend @PostMapping("/receipt")
   * Saves receipt details for advance collection and updates advance_collection_details with receipt number
   * @param request - Receipt details request data
   * @returns Promise<ReceiptDetailsResponse>
   */
  async saveAdvanceReceiptDetails(request: ReceiptDetailsRequest): Promise<ReceiptDetailsResponse> {
    try {
      console.log('Saving advance receipt details with data:', request);
      
      // Call the backend endpoint /api/advance-collection/receipt
      const resp = await api.post<ReceiptDetailsResponse>(`/advance-collection/receipt`, request);
      console.log('Save advance receipt details response:', resp.data);
      return resp.data;
    } catch (error: any) {
      console.error('Save advance receipt details API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        const errorData = error.response?.data;
        console.error('400 Bad Request - Full error response:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: errorData,
          dataStringified: JSON.stringify(errorData, null, 2),
          headers: error.response?.headers
        });
        
        let errorMsg = 'Invalid request data.';
        if (errorData) {
          if (typeof errorData === 'string') {
            errorMsg = errorData;
          } else if (errorData.message) {
            errorMsg = errorData.message;
          } else if (errorData.error) {
            errorMsg = errorData.error;
          } else if (errorData.errors) {
            const errors = Array.isArray(errorData.errors) 
              ? errorData.errors.join(', ')
              : JSON.stringify(errorData.errors);
            errorMsg = `Validation errors: ${errors}`;
          } else if (Object.keys(errorData).length > 0) {
            errorMsg = JSON.stringify(errorData, null, 2);
          }
        }
        throw new Error(errorMsg);
      } else if (error.response?.status === 404) {
        throw new Error('Save advance receipt details endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        const errorMsg = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.response?.data?.errorMessage ||
                        (typeof error.response?.data === 'string' ? error.response.data : null) ||
                        'Server error occurred while saving advance receipt details.';
        console.error('Server 500 error details:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
        throw new Error(errorMsg);
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to save advance receipt details');
    }
  },

  /**
   * Get hospital bill receipt data for printing
   * Replicates USP_Get_PatientHospitalBillReceiptData
   * Mirrors backend @GetMapping("/receipt-data")
   * Retrieves receipt details for printing, including receipt information and payment details
   * @param params - Request parameters including patientId, shiftId, clinicId, doctorId, visitDate, visitType, billNo (optional), and receiptNo
   * @returns Promise<HospitalBillReceiptDataResponse>
   */
  async getHospitalBillReceiptData(params: HospitalBillReceiptDataRequest): Promise<HospitalBillReceiptDataResponse> {
    try {
      console.log('Fetching hospital bill receipt data with params:', params);
      
      // Build query parameters
      const query: Record<string, string | number> = {
        patientId: params.patientId,
        shiftId: params.shiftId,
        clinicId: params.clinicId,
        doctorId: params.doctorId,
        visitDate: params.visitDate,
        visitType: params.visitType,
        receiptNo: params.receiptNo
      };
      
      // Only add billNo if provided
      if (params.billNo) {
        query.billNo = params.billNo;
      }
      
      // Call the backend endpoint /api/advance-collection/receipt-data
      const resp = await api.get<HospitalBillReceiptDataResponse>(`/advance-collection/receipt-data`, { params: query });
      console.log('Get hospital bill receipt data response:', resp.data);
      return resp.data;
    } catch (error: any) {
      console.error('Get hospital bill receipt data API Error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }
      
      if (error.response?.status === 400) {
        const msg = error.response?.data?.message || error.response?.data?.error || 'Invalid request parameters.';
        throw new Error(msg);
      } else if (error.response?.status === 404) {
        throw new Error('Hospital bill receipt data endpoint not found. Please confirm backend route.');
      } else if (error.response?.status === 500) {
        const errorMsg = error.response?.data?.error || 'Server error occurred while fetching hospital bill receipt data.';
        throw new Error(errorMsg);
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.response?.data?.message || 'Failed to fetch hospital bill receipt data');
    }
  }
};

export default advanceCollectionService;

