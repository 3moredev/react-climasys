import api from './api'

export interface PrescriptionCategory {
  catShortName: string
  catLongDescription: string
  doctorId: string
  createdOn?: string
  createdByName?: string
  modifiedOn?: string
  modifiedByName?: string
}

export const prescriptionCategoryService = {
  /**
   * Get all prescription categories for a doctor
   */
  async getAllCategoriesForDoctor(doctorId: string): Promise<PrescriptionCategory[]> {
    try {
      if (!doctorId) {
        throw new Error('Doctor ID is required to load categories.')
      }

      const response = await api.get<PrescriptionCategory[]>(`/prescription-category/doctor/${doctorId}`)
      return response.data || []
    } catch (error: any) {
      console.error('PrescriptionCategory API Error (getAll):', error)

      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.')
      }

      if (error.response?.status === 400) {
        throw new Error('Invalid request. Please check your doctor ID.')
      } else if (error.response?.status === 404) {
        throw new Error('Prescription category endpoint not found. Please check your backend configuration.')
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching categories.')
      }

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }

      throw new Error(error.response?.data?.message || 'Failed to fetch categories')
    }
  },

  /**
   * Search categories for a doctor by short name or description
   */
  async searchCategories(doctorId: string, searchTerm: string): Promise<PrescriptionCategory[]> {
    try {
      if (!doctorId) {
        throw new Error('Doctor ID is required to search categories.')
      }
      if (!searchTerm || !searchTerm.trim()) {
        return this.getAllCategoriesForDoctor(doctorId)
      }

      const response = await api.get<PrescriptionCategory[]>(`/prescription-category/doctor/${doctorId}/search`, {
        params: { term: searchTerm },
      })
      return response.data || []
    } catch (error: any) {
      console.error('PrescriptionCategory API Error (search):', error)

      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.')
      }

      if (error.response?.status === 400) {
        throw new Error('Invalid request. Please check your doctor ID.')
      } else if (error.response?.status === 404) {
        throw new Error('Prescription category endpoint not found. Please check your backend configuration.')
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while searching categories.')
      }

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }

      throw new Error(error.response?.data?.message || 'Failed to search categories')
    }
  },

  /**
   * Create a new prescription category
   */
  async createCategory(category: PrescriptionCategory): Promise<PrescriptionCategory> {
    try {
      const response = await api.post<PrescriptionCategory>('/prescription-category', category)
      return response.data
    } catch (error: any) {
      console.error('PrescriptionCategory API Error (create):', error)

      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.')
      }

      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.error || 'Invalid request.')
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while creating category.')
      }

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }

      throw new Error(error.response?.data?.message || 'Failed to create category')
    }
  },

  /**
   * Update an existing prescription category
   */
  async updateCategory(category: PrescriptionCategory): Promise<PrescriptionCategory> {
    try {
      const response = await api.put<PrescriptionCategory>('/prescription-category', category)
      return response.data
    } catch (error: any) {
      console.error('PrescriptionCategory API Error (update):', error)

      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.')
      }

      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.error || 'Invalid request.')
      } else if (error.response?.status === 404) {
        throw new Error('Category not found.')
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while updating category.')
      }

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }

      throw new Error(error.response?.data?.message || 'Failed to update category')
    }
  },

  /**
   * Delete a prescription category
   */
  async deleteCategory(doctorId: string, catShortName: string): Promise<void> {
    try {
      await api.delete(`/prescription-category/doctor/${doctorId}/category/${encodeURIComponent(catShortName)}`)
    } catch (error: any) {
      console.error('PrescriptionCategory API Error (delete):', error)

      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.')
      }

      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.error || 'Invalid request.')
      } else if (error.response?.status === 404) {
        throw new Error('Category not found.')
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while deleting category.')
      }

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }

      throw new Error(error.response?.data?.message || 'Failed to delete category')
    }
  },
}

export default prescriptionCategoryService


