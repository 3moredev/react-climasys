import api from './api';

export interface InvestigationOption {
  value: string;
  label: string;
  short_description?: string;
  description?: string;
}

export interface InvestigationApiResponse {
  success: boolean;
  labTests: Array<{
    ID: string | number;
    Lab_Test_Description: string;
    Priority_Value?: number;
    Doctor_ID?: string;
    Clinic_ID?: string;
    Group_Name?: string;
    Created_On?: string;
    Modified_On?: string;
  }>;
  totalCount?: number;
  doctorId?: string;
  clinicId?: string;
  message?: string;
  error?: string;
}

export const investigationService = {
  /**
   * Get lab tests for a doctor and clinic
   */
  async getInvestigationsForDoctorAndClinic(doctorId: string, clinicId: string): Promise<InvestigationOption[]> {
    try {
      console.log(`Fetching lab tests for doctor: ${doctorId} and clinic: ${clinicId}`);

      // Primary endpoint exposed by LabTestMasterController
      let response = await api.get(`/lab/master/tests/doctor/${encodeURIComponent(doctorId)}/clinic/${encodeURIComponent(clinicId)}`);
      console.log('Lab tests API response (/lab/master/tests/...):', response.data);

      // Some deployments may return the legacy endpoint; try a fallback only on 404
      if (response?.status === 404) {
        response = await api.get(`/tests/doctor/${encodeURIComponent(doctorId)}/clinic/${encodeURIComponent(clinicId)}`);
        console.log('Lab tests API response fallback (/tests/doctor/...):', response.data);
      }

      const data: any = response.data;

      // Accept a few possible shapes and normalize to an array of items
      const items: any[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.labTests)
          ? data.labTests
          : Array.isArray(data?.data)
            ? data.data
            : [];

      // If success flag is present and false, raise the backend error
      if (typeof data?.success === 'boolean' && !data.success) {
        throw new Error(data?.error || data?.message || 'Failed to fetch lab tests');
      }

      const options: InvestigationOption[] = items.map((item: any) => ({
        value: item.Lab_Test_Description || item.test_id || item.test_name,
        label: item.Lab_Test_Description || item.test_name || item?.description || String(item.ID ?? ''),
        short_description: item.Lab_Test_Description || item.test_name,
        description: item.Lab_Test_Description || item.test_description || item?.description,
      }));

      return options;
    } catch (error: any) {
      console.error('Lab tests API Error:', error);

      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server.');
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch lab tests');
    }
  }
};


