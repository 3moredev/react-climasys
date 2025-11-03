import api from './api';

// Document upload request interface
export interface DocumentUploadRequest {
  patientId: string;
  doctorId: string;
  clinicId: string;
  documentName: string;
  createdByName: string;
  patientVisitNo: number;
  visitDate?: string; // Optional, will use current date if not provided
}

// Document response interface
export interface DocumentResponse {
  success: boolean;
  message?: string;
  documentId?: number;
  patientId?: string;
  doctorId?: string;
  clinicId?: string;
  documentName?: string;
  patientVisitNo?: number;
  visitDate?: string;
  createdOn?: string;
  createdBy?: string;
  error?: string;
}

// Get documents by patient visit response
export interface DocumentsByVisitResponse {
  success: boolean;
  documents?: DocumentResponse[];
  count?: number;
  patientId?: string;
  visitNo?: number;
  error?: string;
}

// Get documents by patient response
export interface DocumentsByPatientResponse {
  success: boolean;
  documents?: DocumentResponse[];
  count?: number;
  patientId?: string;
  error?: string;
}

// Update document request interface
export interface UpdateDocumentRequest {
  documentName: string;
  userId: string;
}

// Document service class
export class DocumentService {
  
  /**
   * Upload a document for patient treatment
   * @param request Document upload request
   * @returns Promise<DocumentResponse>
   */
  static async uploadDocument(request: DocumentUploadRequest): Promise<DocumentResponse> {
    try {
      const response = await api.post('/patient-documents/treatment', request);
      return response.data;
    } catch (error: any) {
      console.error('Error uploading document:', error);
      throw new Error(error.response?.data?.error || 'Failed to upload document');
    }
  }

  /**
   * Upload multiple documents using the backend upload-multiple endpoint
   * @param files Array of files to upload
   * @param patientId Patient ID
   * @param doctorId Doctor ID
   * @param clinicId Clinic ID
   * @param patientVisitNo Patient visit number
   * @param createdByName Name of the user creating the documents
   * @param visitDate Optional visit date
   * @returns Promise<any> - Response from the backend
   */
  static async uploadMultipleDocumentsToBackend(
    files: File[],
    patientId: string,
    doctorId: string,
    clinicId: string,
    patientVisitNo: number,
    createdByName: string,
    visitDate?: string
  ): Promise<any> {
    try {
      const formData = new FormData();
      
      // Add files to FormData
      files.forEach(file => {
        formData.append('files', file);
      });
      
      // Add other required parameters
      formData.append('patientId', patientId);
      formData.append('doctorId', doctorId);
      formData.append('clinicId', clinicId);
      formData.append('createdByName', createdByName);
      formData.append('patientVisitNo', patientVisitNo.toString());
      
      // Add visit date if provided
      if (visitDate) {
        formData.append('visitDate', visitDate);
      }

      const response = await api.post('/patient-documents/treatment/upload-multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error uploading multiple documents:', error);
      throw new Error(error.response?.data?.error || 'Failed to upload documents');
    }
  }

  /**
   * Get documents for a specific patient visit
   * @param patientId Patient ID
   * @param visitNo Visit number
   * @returns Promise<DocumentsByVisitResponse>
   */
  static async getDocumentsByVisit(patientId: string, visitNo: number): Promise<DocumentsByVisitResponse> {
    try {
      const response = await api.get(`/patient-documents/treatment/patient/${patientId}/visit/${visitNo}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching documents by visit:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch documents');
    }
  }

  /**
   * Get all documents for a patient
   * @param patientId Patient ID
   * @returns Promise<DocumentsByPatientResponse>
   */
  static async getDocumentsByPatient(patientId: string): Promise<DocumentsByPatientResponse> {
    try {
      const response = await api.get(`/patient-documents/treatment/patient/${patientId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching documents by patient:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch documents');
    }
  }

  /**
   * Download a document file by documentId
   * Returns blob and best-effort filename from Content-Disposition
   */
  static async downloadDocumentFile(documentId: number): Promise<{ blob: Blob; filename?: string }>{
    try {
      const response = await api.get(`/patient-documents/treatment/download/${documentId}` as string, {
        responseType: 'blob'
      });
      const headers: any = response.headers || {};
      const disposition: string | undefined = headers['content-disposition'];
      let filename: string | undefined;
      if (disposition) {
        const match = disposition.match(/filename\s*=\s*"?([^";]+)"?/i);
        if (match && match[1]) filename = decodeURIComponent(match[1]);
      }
      return { blob: response.data as Blob, filename };
    } catch (error: any) {
      console.error('Error downloading document:', error);
      throw new Error(error.response?.data?.error || 'Failed to download document');
    }
  }

  /**
   * Update document name
   * @param documentId Document ID
   * @param request Update request
   * @returns Promise<DocumentResponse>
   */
  static async updateDocument(documentId: number, request: UpdateDocumentRequest): Promise<DocumentResponse> {
    try {
      const response = await api.put(`/patient-documents/treatment/${documentId}`, request);
      return response.data;
    } catch (error: any) {
      console.error('Error updating document:', error);
      throw new Error(error.response?.data?.error || 'Failed to update document');
    }
  }

  /**
   * Delete a document (soft delete)
   * @param documentId Document ID
   * @param userId User ID performing the deletion
   * @returns Promise<DocumentResponse>
   */
  static async deleteDocument(documentId: number, userId: string = 'system'): Promise<DocumentResponse> {
    try {
      const response = await api.delete(`/patient-documents/treatment/${documentId}?userId=${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting document:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete document');
    }
  }

  /**
   * Delete a document with physical file deletion
   * @param documentId Document ID
   * @param userId User ID performing the deletion
   * @returns Promise<DocumentResponse>
   */
  static async deleteDocumentWithPhysicalFile(documentId: number, userId: string = 'system'): Promise<DocumentResponse> {
    try {
      console.log('=== DOCUMENT SERVICE DELETE CALL ===');
      console.log('Document ID:', documentId);
      console.log('User ID:', userId);
      console.log('API URL:', `/patient-documents/treatment/${documentId}/with-file?userId=${userId}`);
      
      const response = await api.delete(`/patient-documents/treatment/${documentId}/with-file?userId=${userId}`);
      
      console.log('=== DELETE API RESPONSE ===');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('=== DELETE API ERROR ===');
      console.error('Error deleting document with file:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      throw new Error(error.response?.data?.error || 'Failed to delete document with file');
    }
  }

  /**
   * Upload multiple files for a patient visit
   * @param files Array of files to upload
   * @param patientId Patient ID
   * @param doctorId Doctor ID
   * @param clinicId Clinic ID
   * @param patientVisitNo Patient visit number
   * @param createdByName Name of the user creating the documents
   * @param visitDate Optional visit date
   * @returns Promise<DocumentResponse[]>
   */
  static async uploadMultipleDocuments(
    files: File[],
    patientId: string,
    doctorId: string,
    clinicId: string,
    patientVisitNo: number,
    createdByName: string,
    visitDate?: string
  ): Promise<DocumentResponse[]> {
    const uploadPromises = files.map(async (file) => {
      const request: DocumentUploadRequest = {
        patientId,
        doctorId,
        clinicId,
        documentName: file.name,
        createdByName,
        patientVisitNo,
        visitDate
      };
      
      return await this.uploadDocument(request);
    });

    try {
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error: any) {
      console.error('Error uploading multiple documents:', error);
      throw new Error('Failed to upload one or more documents');
    }
  }
}

export default DocumentService;
