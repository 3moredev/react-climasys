import api from './api';

export interface Keyword {
    id?: number;
    keyword: string;
    description: string;
    isActive: boolean;
}

export const keywordService = {
    /**
     * Get all keywords
     */
    async getAllKeywords(): Promise<Keyword[]> {
        const response = await api.get('/keywords');
        return response.data;
    },

    /**
     * Get active keywords
     */
    async getActiveKeywords(): Promise<Keyword[]> {
        const response = await api.get('/keywords/active');
        return response.data;
    },

    /**
     * Get keyword by ID
     */
    async getKeywordById(id: number): Promise<Keyword> {
        const response = await api.get(`/keywords/${id}`);
        return response.data;
    },

    /**
     * Create new keyword
     */
    async createKeyword(keyword: Keyword): Promise<Keyword> {
        const response = await api.post('/keywords', keyword);
        return response.data;
    },

    /**
     * Update existing keyword
     */
    async updateKeyword(id: number, keyword: Keyword): Promise<Keyword> {
        const response = await api.put(`/keywords/${id}`, keyword);
        return response.data;
    },

    /**
     * Delete keyword
     */
    async deleteKeyword(id: number): Promise<void> {
        await api.delete(`/keywords/${id}`);
    }
};
