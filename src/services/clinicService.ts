import api from './api';

export interface Clinic {
    id: string;
    name: string;
    city: string;
    phoneNo: string;
    status: string;
    since: string;
    licenseTill: string;
    address?: string;
    countryId?: string;
    cityId?: string;
    stateId?: string;
    areaId?: string;
    pincode?: string;
    tips?: string;
    news?: string;
    faxNo?: string;    
}

export const clinicService = {
    /**
     * Get all clinics
     */
    async getAllClinics(): Promise<Clinic[]> {
        try {
            console.log('Fetching all clinics...');
            // Assuming endpoint is /clinics or /clinics/all based on other services
            // Adjust endpoint as needed after testing
            const response = await api.get('/clinics/all');
            console.log('Get all clinics response:', response.data);

            const data = Array.isArray(response.data) ? response.data : [];

            return data.map((item: any) => ({
                id: item.id || item.clinicId || '',
                name: item.name || item.clinicName || '',
                city: item.cityName || '',
                phoneNo: item.phoneNo || '',
                status: item.status || 'Active', // Default to Active if not provided
                since: item.since || item.createdOn || '',
                licenseTill: item.licenseValidTo || '',
                address: item.address || '',
                countryId: item.countryId || '',
                stateId: item.stateId || '',
                areaId: item.areaId || '',
                pincode: item.pincode || '',
                tips: item.tips || '',
                news: item.news || '',
                faxNo: item.faxNo || ''
            }));
        } catch (error: any) {
            console.error('Error fetching clinics:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch clinics');
        }
    },

    /**
     * Get clinic by ID
     */
    async getClinicById(id: string): Promise<Clinic> {
        try {
            const response = await api.get(`/clinics/${id}`);
            const item = response.data;
            return {
                id: item.clinicId || '',
                name: item.clinicName || '',
                city: item.cityName || '',
                phoneNo: item.phoneNo || '',
                status: item.status || 'Active',
                since: item.since || item.createdOn || '',
                licenseTill: item.licenseValidTo || '',
                address: item.clinicAddress || '',
                countryId: item.countryId || '',
                stateId: item.stateId || '',
                cityId: item.cityId || '',
                areaId: item.areaId ||'',
                pincode: item.pincode || '',
                tips: item.tips || '',
                news: item.news || '',
                faxNo: item.faxNo || ''                
            };
        } catch (error: any) {
            console.error('Error fetching clinic details:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch clinic details');
        }
    },

    /**
     * Create a new clinic
     */
    async createClinic(clinicData: Partial<Clinic>): Promise<Clinic> {
        try {
            const payload = {
                clinicId: '',                
                clinicName: clinicData.name,
                clinicAddress: clinicData.address,
                countryId: clinicData.countryId,
                stateId: clinicData.stateId,
                cityId: clinicData.cityId,
                areaId: clinicData.areaId,
                pincode: clinicData.pincode,
                tips: clinicData.tips,
                news: clinicData.news,
                phoneNo: clinicData.phoneNo,
                faxNo: clinicData.faxNo
            };
            const response = await api.post('/clinics/save', payload);
            return response.data;
        } catch (error: any) {
            console.error('Error creating clinic:', error);
            throw new Error(error.response?.data?.message || 'Failed to create clinic');
        }
    },

    /**
     * Update an existing clinic
     */
    async updateClinic(id: string, clinicData: Partial<Clinic>): Promise<Clinic> {
        try {
            const payload = {                
                clinicId: id,
                clinicName: clinicData.name,
                clinicAddress: clinicData.address,
                countryId: clinicData.countryId,
                stateId: clinicData.stateId,
                cityId: clinicData.cityId,
                areaId: clinicData.areaId,
                pincode: clinicData.pincode,
                tips: clinicData.tips,
                news: clinicData.news,
                phoneNo: clinicData.phoneNo,
                faxNo: clinicData.faxNo
            };
            const response = await api.put(`/clinics/update/${id}`, payload);
            return response.data;
        } catch (error: any) {
            console.error('Error updating clinic:', error);
            throw new Error(error.response?.data?.message || 'Failed to update clinic');
        }
    },

    /**
     * Delete a clinic
     */
    async deleteClinic(id: string): Promise<void> {
        try {
            await api.delete(`/clinics/delete/${id}`);
        } catch (error: any) {
            console.error('Error deleting clinic:', error);
            throw new Error(error.response?.data?.message || 'Failed to delete clinic');
        }
    }
};
