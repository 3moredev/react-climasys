import api from './api';

export interface InsuranceCompany {
    id?: number;
    insuranceCompanyName: string;
}

export const insuranceCompanyService = {
    /**
     * Get all insurance companies
     */
    async getAllInsuranceCompanies(): Promise<InsuranceCompany[]> {
        const response = await api.get('/insurance-companies');
        return response.data;
    },

    /**
     * Get insurance company by ID
     */
    async getInsuranceCompanyById(id: number): Promise<InsuranceCompany> {
        const response = await api.get(`/insurance-companies/${id}`);
        return response.data;
    },

    /**
     * Create new insurance company
     */
    async createInsuranceCompany(insuranceCompany: InsuranceCompany): Promise<InsuranceCompany> {
        const response = await api.post('/insurance-companies', insuranceCompany);
        return response.data;
    },

    /**
     * Update existing insurance company
     */
    async updateInsuranceCompany(id: number, insuranceCompany: InsuranceCompany): Promise<InsuranceCompany> {
        const response = await api.put(`/insurance-companies/${id}`, insuranceCompany);
        return response.data;
    },

    /**
     * Delete insurance company
     */
    async deleteInsuranceCompany(id: number): Promise<void> {
        await api.delete(`/insurance-companies/${id}`);
    }
};

