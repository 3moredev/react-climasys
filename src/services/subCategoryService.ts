import api from './api';

export interface SubCategory {
    id?: number;
    chargesSubCategory: string;
    sortOrder: number;
}

export const subCategoryService = {
    /**
     * Get all sub categories
     */
    async getAllSubCategories(): Promise<SubCategory[]> {
        const response = await api.get('/sub-categories');
        return response.data;
    },

    /**
     * Get sub category by ID
     */
    async getSubCategoryById(id: number): Promise<SubCategory> {
        const response = await api.get(`/sub-categories/${id}`);
        return response.data;
    },

    /**
     * Create new sub category
     */
    async createSubCategory(subCategory: SubCategory): Promise<SubCategory> {
        const response = await api.post('/sub-categories', subCategory);
        return response.data;
    },

    /**
     * Update existing sub category
     */
    async updateSubCategory(id: number, subCategory: SubCategory): Promise<SubCategory> {
        const response = await api.put(`/sub-categories/${id}`, subCategory);
        return response.data;
    },

    /**
     * Delete sub category
     */
    async deleteSubCategory(id: number): Promise<void> {
        await api.delete(`/sub-categories/${id}`);
    }
};

