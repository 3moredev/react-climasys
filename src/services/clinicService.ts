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
                city: item.city || '',
                phoneNo: item.phoneNo || item.phone_no || item.mobile || '',
                status: item.status || 'Active', // Default to Active if not provided
                since: item.since || item.createdOn || '',
                licenseTill: item.licenseTill || item.license_till || '',
                address: item.address || '',
                countryId: item.countryId || item.country_id || '',
                stateId: item.stateId || item.state_id || '',
                areaId: item.areaId || item.area_id || '',
                pincode: item.pincode || '',
                tips: item.tips || '',
                news: item.news || '',
                faxNo: item.faxNo || item.fax_no || ''
            }));
        } catch (error: any) {
            console.error('Error fetching clinics:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch clinics');
        }
    },

    /**
     * Create a new clinic
     */
    async createClinic(clinicData: Partial<Clinic>): Promise<Clinic> {
        try {
            const response = await api.post('/clinics', clinicData);
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
            const response = await api.put(`/clinics/${id}`, clinicData);
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
            await api.delete(`/clinics/${id}`);
        } catch (error: any) {
            console.error('Error deleting clinic:', error);
            throw new Error(error.response?.data?.message || 'Failed to delete clinic');
        }
    }
};
