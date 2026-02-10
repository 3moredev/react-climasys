import api from './api';

export interface BillingDetail {
  id?: string | number;
  group: string;
  subGroup?: string;
  details?: string;
  defaultFee: number;
  sequenceNo: number;
  visitType: string;
  isDefault: boolean;
  lunch?: string;
}

export interface BillingDetailApiResponse {
  ID?: string | number;
  id?: string | number;
  Group?: string;
  group?: string;
  Sub_Group?: string;
  subGroup?: string;
  sub_group?: string;
  Details?: string;
  details?: string;
  Default_Fee?: number;
  defaultFee?: number;
  default_fee?: number;
  Sequence_No?: number;
  sequenceNo?: number;
  sequence_no?: number;
  Visit_Type?: string;
  visitType?: string;
  visit_type?: string;
  Is_Default?: boolean | number;
  isDefault?: boolean | number;
  is_default?: boolean | number;
  Lunch?: string;
  lunch?: string;
}

export interface BillingDataTableRow {
  OLD_GROUP?: string;
  OLD_SUBGROUP?: string;
  OLD_DETAILS?: string;
  OLD_AMOUNT?: number;
  NEW_GROUP?: string;
  NEW_SUBGROUP?: string;
  NEW_DETAILS?: string;
  NEW_AMOUNT?: number;
  DOCTOR_ID?: string;
  NEW_VISIT_TYPE?: string;
  OLD_VISIT_TYPE?: string;
}

export interface BillingMasterDataRequest {
  groupName: string;
  subgroupName?: string;
  userId: string;
  detail?: string;
  defaultFee: number;
  doctorId: string;
  clinicId: string;
  sequenceNo: number;
  isDefault: boolean;
  visitType: string;
  billingDataTable?: BillingDataTableRow[];
}

export interface BillingMasterDataResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export const billingService = {
  /**
   * Get all billing details for a doctor
   * @param doctorId - Doctor ID
   * @param clinicId - Clinic ID
   * @returns Promise<BillingDetail[]> - Array of billing details
   */
  async getAllBillingDetailsForDoctor(doctorId: string, clinicId: string): Promise<BillingDetail[]> {
    try {
      if (!doctorId) {
        throw new Error('Doctor ID is required to load billing details.');
      }
      if (!clinicId) {
        throw new Error('Clinic ID is required to load billing details.');
      }

      console.log('Fetching billing details for doctor:', doctorId, 'clinic:', clinicId);

      // TODO: Replace with actual API endpoint when available
      const response = await api.get(`/billing/details`, {
        params: { doctorId, clinicId }
      });
      console.log('Billing details response:', response.data);

      const data = response.data || [];
      const billingDetailsList = Array.isArray(data) ? data : (data.billingDetails || data.data || []);

      if (!Array.isArray(billingDetailsList) || billingDetailsList.length === 0) {
        console.warn('No billing details found in response.');
        return [];
      }

      const billingDetails: BillingDetail[] = billingDetailsList.map((item: BillingDetailApiResponse) => ({
        id: item.ID || item.id,
        group: item.Group || item.group || '',
        subGroup: item.Sub_Group || item.subGroup || item.sub_group || '',
        details: item.Details || item.details || '',
        defaultFee: item.Default_Fee || item.defaultFee || item.default_fee || 0,
        sequenceNo: item.Sequence_No || item.sequenceNo || item.sequence_no || 0,
        visitType: item.Visit_Type || item.visitType || item.visit_type || '',
        isDefault: Boolean(item.Is_Default || item.isDefault || item.is_default || false),
        lunch: item.Lunch || item.lunch || ''
      }));

      return billingDetails;
    } catch (error: any) {
      console.error('Billing details API Error:', error);

      // Handle CORS and network errors
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }

      // Handle HTTP errors
      if (error.response?.status === 400) {
        throw new Error('Invalid request. Please check your doctor and clinic IDs.');
      } else if (error.response?.status === 404) {
        // Return empty array if endpoint doesn't exist yet (for development)
        console.warn('Billing details endpoint not found. Returning empty array.');
        return [];
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching billing details.');
      }

      // Handle backend-specific errors
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      // If 404, return empty array for now (endpoint might not exist yet)
      if (error.response?.status === 404) {
        return [];
      }

      throw new Error(error.response?.data?.message || 'Failed to fetch billing details');
    }
  },

  /**
   * Create a new billing detail
   * @param billingDetail - Billing detail data
   * @param doctorId - Doctor ID
   * @param clinicId - Clinic ID
   * @returns Promise<BillingDetail> - Created billing detail
   */
  async createBillingDetail(
    billingDetail: Omit<BillingDetail, 'id'>,
    doctorId: string,
    clinicId: string
  ): Promise<BillingDetail> {
    try {
      if (!doctorId) {
        throw new Error('Doctor ID is required to create billing detail.');
      }
      if (!clinicId) {
        throw new Error('Clinic ID is required to create billing detail.');
      }

      console.log('Creating billing detail:', billingDetail);

      const response = await api.post(`/billing/details`, {
        doctorId,
        doctor_id: doctorId,
        clinicId,
        clinic_id: clinicId,
        group: billingDetail.group,
        Group: billingDetail.group,
        subGroup: billingDetail.subGroup || '',
        Sub_Group: billingDetail.subGroup || '',
        sub_group: billingDetail.subGroup || '',
        details: billingDetail.details || '',
        Details: billingDetail.details || '',
        defaultFee: billingDetail.defaultFee,
        Default_Fee: billingDetail.defaultFee,
        default_fee: billingDetail.defaultFee,
        sequenceNo: billingDetail.sequenceNo,
        Sequence_No: billingDetail.sequenceNo,
        sequence_no: billingDetail.sequenceNo,
        visitType: billingDetail.visitType,
        Visit_Type: billingDetail.visitType,
        visit_type: billingDetail.visitType,
        isDefault: billingDetail.isDefault ? 1 : 0,
        Is_Default: billingDetail.isDefault ? 1 : 0,
        is_default: billingDetail.isDefault ? 1 : 0,
        lunch: billingDetail.lunch || '',
        Lunch: billingDetail.lunch || ''
      });

      console.log('Create billing detail response:', response.data);

      const data = response.data || {};
      return {
        id: data.ID || data.id,
        group: data.Group || data.group || billingDetail.group,
        subGroup: data.Sub_Group || data.subGroup || data.sub_group || billingDetail.subGroup,
        details: data.Details || data.details || billingDetail.details,
        defaultFee: data.Default_Fee || data.defaultFee || data.default_fee || billingDetail.defaultFee,
        sequenceNo: data.Sequence_No || data.sequenceNo || data.sequence_no || billingDetail.sequenceNo,
        visitType: data.Visit_Type || data.visitType || data.visit_type || billingDetail.visitType,
        isDefault: Boolean(data.Is_Default || data.isDefault || data.is_default || billingDetail.isDefault),
        lunch: data.Lunch || data.lunch || billingDetail.lunch
      };
    } catch (error: any) {
      console.error('Create billing detail API Error:', error);

      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }

      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid billing detail data.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while creating billing detail.');
      }

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error(error.response?.data?.message || 'Failed to create billing detail');
    }
  },

  /**
   * Update an existing billing detail
   * @param id - Billing detail ID
   * @param billingDetail - Updated billing detail data
   * @param doctorId - Doctor ID
   * @param clinicId - Clinic ID
   * @returns Promise<BillingDetail> - Updated billing detail
   */
  async updateBillingDetail(
    id: string | number,
    billingDetail: Omit<BillingDetail, 'id'>,
    doctorId: string,
    clinicId: string
  ): Promise<BillingDetail> {
    try {
      if (!id) {
        throw new Error('Billing detail ID is required to update.');
      }
      if (!doctorId) {
        throw new Error('Doctor ID is required to update billing detail.');
      }
      if (!clinicId) {
        throw new Error('Clinic ID is required to update billing detail.');
      }

      console.log('Updating billing detail:', id, billingDetail);

      const response = await api.put(`/billing/details/${id}`, {
        doctorId,
        doctor_id: doctorId,
        clinicId,
        clinic_id: clinicId,
        group: billingDetail.group,
        Group: billingDetail.group,
        subGroup: billingDetail.subGroup || '',
        Sub_Group: billingDetail.subGroup || '',
        sub_group: billingDetail.subGroup || '',
        details: billingDetail.details || '',
        Details: billingDetail.details || '',
        defaultFee: billingDetail.defaultFee,
        Default_Fee: billingDetail.defaultFee,
        default_fee: billingDetail.defaultFee,
        sequenceNo: billingDetail.sequenceNo,
        Sequence_No: billingDetail.sequenceNo,
        sequence_no: billingDetail.sequenceNo,
        visitType: billingDetail.visitType,
        Visit_Type: billingDetail.visitType,
        visit_type: billingDetail.visitType,
        isDefault: billingDetail.isDefault ? 1 : 0,
        Is_Default: billingDetail.isDefault ? 1 : 0,
        is_default: billingDetail.isDefault ? 1 : 0,
        lunch: billingDetail.lunch || '',
        Lunch: billingDetail.lunch || ''
      });

      console.log('Update billing detail response:', response.data);

      const data = response.data || {};
      return {
        id: data.ID || data.id || id,
        group: data.Group || data.group || billingDetail.group,
        subGroup: data.Sub_Group || data.subGroup || data.sub_group || billingDetail.subGroup,
        details: data.Details || data.details || billingDetail.details,
        defaultFee: data.Default_Fee || data.defaultFee || data.default_fee || billingDetail.defaultFee,
        sequenceNo: data.Sequence_No || data.sequenceNo || data.sequence_no || billingDetail.sequenceNo,
        visitType: data.Visit_Type || data.visitType || data.visit_type || billingDetail.visitType,
        isDefault: Boolean(data.Is_Default || data.isDefault || data.is_default || billingDetail.isDefault),
        lunch: data.Lunch || data.lunch || billingDetail.lunch
      };
    } catch (error: any) {
      console.error('Update billing detail API Error:', error);

      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }

      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid billing detail data.');
      } else if (error.response?.status === 404) {
        throw new Error('Billing detail not found.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while updating billing detail.');
      }

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error(error.response?.data?.message || 'Failed to update billing detail');
    }
  },

  /**
   * Delete a billing detail
   * @param id - Billing detail ID
   * @param doctorId - Doctor ID
   * @param clinicId - Clinic ID
   * @returns Promise<void>
   */
  async deleteBillingDetail(id: string | number, doctorId: string, clinicId: string): Promise<void> {
    try {
      if (!id) {
        throw new Error('Billing detail ID is required to delete.');
      }
      if (!doctorId) {
        throw new Error('Doctor ID is required to delete billing detail.');
      }
      if (!clinicId) {
        throw new Error('Clinic ID is required to delete billing detail.');
      }

      console.log('Deleting billing detail:', id);

      await api.delete(`/billing/details/${id}`, {
        params: { doctorId, clinicId }
      });

      console.log('Billing detail deleted successfully');
    } catch (error: any) {
      console.error('Delete billing detail API Error:', error);

      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }

      if (error.response?.status === 404) {
        throw new Error('Billing detail not found.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while deleting billing detail.');
      }

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error(error.response?.data?.message || 'Failed to delete billing detail');
    }
  },

  /**
   * Get billing categories grouped by doctor
   * @param doctorId - Doctor ID
   * @returns Promise<Record<string, any>[]> - Array of billing categories
   */
  async getBillingCategories(doctorId: string): Promise<Record<string, any>[]> {
    try {
      if (!doctorId) {
        throw new Error('Doctor ID is required to load billing categories.');
      }

      console.log('Fetching billing categories for doctor:', doctorId);

      const response = await api.get(`/billing/master-data/categories/${doctorId}`);
      console.log('Billing categories response:', response.data);

      const data = response.data || [];
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error('Billing categories API Error:', error);

      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }

      if (error.response?.status === 400) {
        throw new Error('Invalid request. Please check your doctor ID.');
      } else if (error.response?.status === 404) {
        console.warn('Billing categories endpoint not found. Returning empty array.');
        return [];
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching billing categories.');
      }

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      if (error.response?.status === 404) {
        return [];
      }

      throw new Error(error.response?.data?.message || 'Failed to fetch billing categories');
    }
  },

  /**
   * Get billing sub-categories based on selected group/category
   * @param groupName - Group name
   * @param doctorId - Doctor ID
   * @returns Promise<Record<string, any>[]> - Array of billing sub-categories
   */
  async getBillingSubCategories(groupName: string, doctorId: string): Promise<Record<string, any>[]> {
    try {
      if (!groupName) {
        throw new Error('Group name is required to load billing sub-categories.');
      }
      if (!doctorId) {
        throw new Error('Doctor ID is required to load billing sub-categories.');
      }

      console.log('Fetching billing sub-categories for group:', groupName, 'doctor:', doctorId);

      const response = await api.get(`/billing/master-data/sub-categories`, {
        params: { groupName, doctorId }
      });
      console.log('Billing sub-categories response:', response.data);

      const data = response.data || [];
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error('Billing sub-categories API Error:', error);

      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }

      if (error.response?.status === 400) {
        throw new Error('Invalid request. Please check your group name and doctor ID.');
      } else if (error.response?.status === 404) {
        console.warn('Billing sub-categories endpoint not found. Returning empty array.');
        return [];
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching billing sub-categories.');
      }

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      if (error.response?.status === 404) {
        return [];
      }

      throw new Error(error.response?.data?.message || 'Failed to fetch billing sub-categories');
    }
  },

  /**
   * Get companies for billing
   * @param doctorId - Doctor ID
   * @returns Promise<Record<string, any>[]> - Array of billing companies
   */
  async getBillingCompanies(doctorId: string): Promise<Record<string, any>[]> {
    try {
      if (!doctorId) {
        throw new Error('Doctor ID is required to load billing companies.');
      }

      console.log('Fetching billing companies for doctor:', doctorId);

      const response = await api.get(`/billing/master-data/companies/${doctorId}`);
      console.log('Billing companies response:', response.data);

      const data = response.data || [];
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error('Billing companies API Error:', error);

      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }

      if (error.response?.status === 400) {
        throw new Error('Invalid request. Please check your doctor ID.');
      } else if (error.response?.status === 404) {
        console.warn('Billing companies endpoint not found. Returning empty array.');
        return [];
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching billing companies.');
      }

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      if (error.response?.status === 404) {
        return [];
      }

      throw new Error(error.response?.data?.message || 'Failed to fetch billing companies');
    }
  },

  /**
   * Delete billing charges
   * @param chargeId - Charge ID
   * @returns Promise<Record<string, any>[]> - Result array
   */
  async deleteBillingCharges(chargeId: string | number): Promise<Record<string, any>[]> {
    try {
      if (!chargeId) {
        throw new Error('Charge ID is required to delete billing charges.');
      }

      console.log('Deleting billing charges:', chargeId);

      const response = await api.delete(`/billing/master-data/charges/${chargeId}`);
      console.log('Delete billing charges response:', response.data);

      const data = response.data || [];
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error('Delete billing charges API Error:', error);

      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }

      if (error.response?.status === 404) {
        throw new Error('Billing charge not found.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while deleting billing charges.');
      }

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error(error.response?.data?.message || 'Failed to delete billing charges');
    }
  },

  /**
   * Delete bill keyword charges
   * @param keywordChargeId - Keyword Charge ID
   * @returns Promise<Record<string, any>[]> - Result array
   */
  async deleteBillKeywordCharges(keywordChargeId: string | number): Promise<Record<string, any>[]> {
    try {
      if (!keywordChargeId) {
        throw new Error('Keyword Charge ID is required to delete bill keyword charges.');
      }

      console.log('Deleting bill keyword charges:', keywordChargeId);

      const response = await api.delete(`/billing/master-data/keyword-charges/${keywordChargeId}`);
      console.log('Delete bill keyword charges response:', response.data);

      const data = response.data || [];
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error('Delete bill keyword charges API Error:', error);

      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }

      if (error.response?.status === 404) {
        throw new Error('Bill keyword charge not found.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while deleting bill keyword charges.');
      }

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error(error.response?.data?.message || 'Failed to delete bill keyword charges');
    }
  },

  /**
   * Delete bill sub charges
   * @param subChargeId - Sub Charge ID
   * @returns Promise<Record<string, any>[]> - Result array
   */
  async deleteBillSubCharges(subChargeId: string | number): Promise<Record<string, any>[]> {
    try {
      if (!subChargeId) {
        throw new Error('Sub Charge ID is required to delete bill sub charges.');
      }

      console.log('Deleting bill sub charges:', subChargeId);

      const response = await api.delete(`/billing/master-data/sub-charges/${subChargeId}`);
      console.log('Delete bill sub charges response:', response.data);

      const data = response.data || [];
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error('Delete bill sub charges API Error:', error);

      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }

      if (error.response?.status === 404) {
        throw new Error('Bill sub charge not found.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while deleting bill sub charges.');
      }

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error(error.response?.data?.message || 'Failed to delete bill sub charges');
    }
  },

  /**
   * Delete master billing detail
   * @param billingDetailId - Billing Detail ID
   * @returns Promise<Record<string, any>[]> - Result array
   */
  async deleteMasterBillingDetail(billingDetailId: string | number, doctorId: string): Promise<Record<string, any>[]> {
    try {
      if (!billingDetailId) {
        throw new Error('Billing Detail ID is required to delete master billing detail.');
      }
      if (!doctorId) {
        throw new Error('Doctor ID is required to delete master billing detail.');
      }

      console.log('Deleting master billing detail:', billingDetailId, 'for doctor:', doctorId);

      const response = await api.delete(`/billing/master-data/billing-details/${billingDetailId}`, {
        params: { doctorId }
      });
      console.log('Delete master billing detail response:', response.data);

      const data = response.data || [];
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error('Delete master billing detail API Error:', error);

      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }

      if (error.response?.status === 404) {
        throw new Error('Master billing detail not found.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while deleting master billing detail.');
      }

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error(error.response?.data?.message || 'Failed to delete master billing detail');
    }
  },

  /**
   * Delete master company
   * @param companyId - Company ID
   * @returns Promise<Record<string, any>[]> - Result array
   */
  async deleteMasterCompany(companyId: string | number): Promise<Record<string, any>[]> {
    try {
      if (!companyId) {
        throw new Error('Company ID is required to delete master company.');
      }

      console.log('Deleting master company:', companyId);

      const response = await api.delete(`/billing/master-data/companies/${companyId}`);
      console.log('Delete master company response:', response.data);

      const data = response.data || [];
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error('Delete master company API Error:', error);

      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }

      if (error.response?.status === 404) {
        throw new Error('Master company not found.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while deleting master company.');
      }

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      throw new Error(error.response?.data?.message || 'Failed to delete master company');
    }
  },

  /**
   * Insert billing master data
   * POST /api/billing/master-data
   * 
   * Corresponds to USP_Insert_Billing_MasterData stored procedure
   * Used in: AddBillingDetails.aspx.cs - btnSubmit_Click() method
   * Service method: SaveBilling_MasterData()
   * 
   * @param request - Billing master data request
   * @returns Promise<BillingMasterDataResponse> - Response with success status
   */
  async insertBillingMasterData(request: BillingMasterDataRequest): Promise<BillingMasterDataResponse> {
    try {
      if (!request.doctorId) {
        throw new Error('Doctor ID is required to insert billing master data.');
      }
      if (!request.userId) {
        throw new Error('User ID is required to insert billing master data.');
      }
      if (!request.groupName) {
        throw new Error('Group name is required to insert billing master data.');
      }

      console.log('Inserting billing master data:', request);

      const requestBody: any = {
        groupName: request.groupName,
        group_name: request.groupName,
        subgroupName: request.subgroupName || '',
        subgroup_name: request.subgroupName || '',
        subGroupName: request.subgroupName || '',
        userId: request.userId,
        user_id: request.userId,
        user_Id: request.userId,
        detail: request.detail || '',
        details: request.detail || '',
        defaultFee: request.defaultFee,
        default_fee: request.defaultFee,
        defaultFeeAmount: request.defaultFee,
        doctorId: request.doctorId,
        doctor_id: request.doctorId,
        doctor_ID: request.doctorId,
        clinicId: request.clinicId,
        clinic_id: request.clinicId,
        sequenceNo: request.sequenceNo,
        sequence_no: request.sequenceNo,
        Sequence_No: request.sequenceNo,
        isDefault: request.isDefault ? 1 : 0,
        is_default: request.isDefault ? 1 : 0,
        Isdefault: request.isDefault ? 1 : 0,
        visitType: request.visitType,
        visit_type: request.visitType,
        VisitType: request.visitType
      };

      if (request.billingDataTable && request.billingDataTable.length > 0) {
        requestBody.billingDataTable = request.billingDataTable;
        requestBody.billing_data_table = request.billingDataTable;
        requestBody.p_var_Insert_Billing_Data = request.billingDataTable;
      }

      const response = await api.post(`/billing/master-data`, requestBody);
      console.log('Insert billing master data response:', response.data);

      const data = response.data || {};

      if (Boolean(data.success)) {
        return {
          success: true,
          message: data.message,
          data: data.data || data
        };
      } else {
        throw new Error(data.message || data.error || 'Failed to insert billing master data');
      }
    } catch (error: any) {
      console.error('Insert billing master data API Error:', error);

      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }

      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || error.response.data?.error || 'Invalid billing master data.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while inserting billing master data.');
      }

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      // If error message is already set, throw it
      if (error.message && !error.message.includes('Cannot connect') && !error.message.includes('Server error')) {
        throw error;
      }

      throw new Error(error.response?.data?.message || 'Failed to insert billing master data');
    }
  },

  /**
   * Update billing master data
   * PUT /api/billing/master-data
   * 
   * Corresponds to USP_Insert_Billing_MasterData stored procedure (handles both insert and update)
   * Used in: AddBillingDetails.aspx.cs - btnSubmit_Click() method
   * Service method: SaveBilling_MasterData()
   * 
   * @param request - Billing master data request
   * @returns Promise<BillingMasterDataResponse> - Response with success status
   */
  async updateBillingMasterData(request: BillingMasterDataRequest): Promise<BillingMasterDataResponse> {
    try {
      if (!request.doctorId) {
        throw new Error('Doctor ID is required to update billing master data.');
      }
      if (!request.userId) {
        throw new Error('User ID is required to update billing master data.');
      }
      if (!request.groupName) {
        throw new Error('Group name is required to update billing master data.');
      }

      console.log('Updating billing master data:', request);

      const requestBody: any = {
        groupName: request.groupName,
        group_name: request.groupName,
        subgroupName: request.subgroupName || '',
        subgroup_name: request.subgroupName || '',
        subGroupName: request.subgroupName || '',
        userId: request.userId,
        user_id: request.userId,
        user_Id: request.userId,
        detail: request.detail || '',
        details: request.detail || '',
        defaultFee: request.defaultFee,
        default_fee: request.defaultFee,
        defaultFeeAmount: request.defaultFee,
        doctorId: request.doctorId,
        doctor_id: request.doctorId,
        doctor_ID: request.doctorId,
        sequenceNo: request.sequenceNo,
        sequence_no: request.sequenceNo,
        Sequence_No: request.sequenceNo,
        isDefault: request.isDefault ? 1 : 0,
        is_default: request.isDefault ? 1 : 0,
        Isdefault: request.isDefault ? 1 : 0,
        visitType: request.visitType,
        visit_type: request.visitType,
        VisitType: request.visitType
      };

      if (request.billingDataTable && request.billingDataTable.length > 0) {
        requestBody.billingDataTable = request.billingDataTable;
        requestBody.billing_data_table = request.billingDataTable;
        requestBody.p_var_Insert_Billing_Data = request.billingDataTable;
      }

      const response = await api.put(`/billing/master-data`, requestBody);
      console.log('Update billing master data response:', response.data);

      const data = response.data || {};

      if (Boolean(data.success)) {
        return {
          success: true,
          message: data.message,
          data: data.data || data
        };
      } else {
        throw new Error(data.message || data.error || 'Failed to update billing master data');
      }
    } catch (error: any) {
      console.error('Update billing master data API Error:', error);

      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
      }

      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || error.response.data?.error || 'Invalid billing master data.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while updating billing master data.');
      }

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      // If error message is already set, throw it
      if (error.message && !error.message.includes('Cannot connect') && !error.message.includes('Server error')) {
        throw error;
      }

      throw new Error(error.response?.data?.message || 'Failed to update billing master data');
    }
  }
};

export default billingService;

