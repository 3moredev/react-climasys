import api from './api';

export interface SaveReceiptPayload {
  patientId: string;
  clinicId: string;
  doctorId: string;
  shiftId: number;
  visitDate: string; // yyyy-MM-dd
  patientVisitNo: number;
  receiptNumber?: string;
  receiptAmount: number;
  treatmentDetails?: string;
  title?: number;
  fromDate?: string;
  toDate?: string;
  visitType: string;
  paymentById?: number;
  paymentRemark?: string;
  userId: string;
  userName?: string;
  discount?: number;
  feesCollected?: number;
}

export interface SaveReceiptResponse {
  success: boolean;
  message?: string;
  error?: string;
  receiptNumber?: string;
  receiptDate?: string;
}

export const receiptService = {
  async saveReceipt(payload: SaveReceiptPayload): Promise<SaveReceiptResponse> {
    try {
      const response = await api.post('/receipts/save', payload);
      return response.data;
    } catch (error: any) {
      const apiMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to save receipt';
      throw new Error(apiMessage);
    }
  },
};

export default receiptService;

