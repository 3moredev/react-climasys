import api from './api';

export interface DischargeDetailsRequest {
    patientId: string;
    clinicId: string;
    doctorId: string;
    ipdRefNo: string;
}

export interface DischargeDetailsResponse {
    success: boolean;
    data: any; // We can refine this later with a more specific type if the backend response structure is known
    error?: string;
}

export interface UpdateDischargeCardRequest {
    doctorId: string;
    clinicId: string;
    shiftId?: number;
    patientId: string;
    ipdRefNo: string;
    admissionDate: string;
    admissionTime: string;
    treatingDoctor: string;
    consultingDoctor: string;
    dischargeDate: string;
    dischargeTime: string;
    weight: number;
    ipdNo: string;
    userId: string;
    keywordAttachments?: string[];
    keyword?: string;
    visitDate?: string;
    operationStartDate?: string;
    operationEndDate?: string;
    operationStartTime?: string;
    operationEndTime?: string;
    operativeNotes?: string;
    remark?: string;
    followUpComments?: string;
    anesthesia?: string;
    reasonForDischarge?: string;
    referredDoctor?: string;
    conditionOnDischarge?: string;
    footer?: string;
    defaultDate?: string;
    ward?: string;
    room?: string;
    admittedDays?: string;
    otHours?: string;
    company?: string;
    followUpDate?: string;
    dischargeDetails?: DischargeDetailDTO[];
}

export interface DischargeDetailDTO {
    doctorId: string;
    clinicId: string;
    shiftId: number;
    patientId: string;
    ipdRefNo: string;
    diagnosis: string;
    complaints: string;
    history: string;
    investigation: string;
    oe: string;
    se: string;
    procedure: string;
    treatment: string;
    discharge: string;
    instruction: string;
}

export const dischargeService = {
    /**
     * Get discharge details
     * Mirrors backend @GetMapping("/details") under @RequestMapping("/api/discharge")
     * Retrieves discharge details for a specific patient and admission.
     */
    async getDischargeDetails(params: DischargeDetailsRequest): Promise<DischargeDetailsResponse> {
        try {
            console.log('Fetching discharge details with params:', params);

            const resp = await api.get<DischargeDetailsResponse>('/discharge/details', { params });
            return resp.data;
        } catch (error: any) {
            console.error('Get discharge details API Error:', error);

            if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
                throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
            }

            if (error.response?.status === 400) {
                const msg = error.response?.data?.message || error.response?.data?.error || 'Invalid request parameters.';
                throw new Error(msg);
            } else if (error.response?.status === 404) {
                throw new Error('Discharge details endpoint not found. Please confirm backend route.');
            } else if (error.response?.status === 500) {
                throw new Error('Server error occurred while fetching discharge details.');
            }

            if (error.response?.data?.error) {
                throw new Error(error.response.data.error);
            }

            throw new Error(error.response?.data?.message || 'Failed to fetch discharge details');
        }
    },

    /**
     * Save discharge details
     * Mirrors backend @PostMapping("/save") under @RequestMapping("/api/discharge")
     * Updates discharge card information.
     */
    async saveDischargeDetails(data: UpdateDischargeCardRequest): Promise<{ success: boolean; message?: string; error?: string }> {
        try {
            console.log('Saving discharge details with payload:', data);
            const resp = await api.post('/discharge/save', data);
            return resp.data;
        } catch (error: any) {
            console.error('Save discharge details API Error:', error);

            if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
                throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.');
            }

            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            if (error.response?.data?.error) {
                throw new Error(error.response.data.error);
            }

            throw new Error(error.response?.data?.message || 'Failed to save discharge details');
        }
    }
};

export default dischargeService;
