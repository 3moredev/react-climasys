import api from './api'

export interface PrescriptionSubCategory {
  catShortName: string
  catsubDescription: string
  doctorId: string
  createdOn?: string
  createdByName?: string
  modifiedOn?: string
  modifiedByName?: string
}

export const prescriptionSubCategoryService = {
  /**
   * Get all prescription subcategories for a doctor
   */
  async getAllSubCategoriesForDoctor(doctorId: string): Promise<PrescriptionSubCategory[]> {
    try {
      if (!doctorId) {
        throw new Error('Doctor ID is required to load subcategories.')
      }

      const response = await api.get<PrescriptionSubCategory[]>(`/prescription-subcategory/doctor/${doctorId}`)
      return response.data || []
    } catch (error: any) {
      console.error('PrescriptionSubCategory API Error (getAll):', error)

      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.')
      }

      if (error.response?.status === 400) {
        throw new Error('Invalid request. Please check your doctor ID.')
      } else if (error.response?.status === 404) {
        throw new Error('Prescription subcategory endpoint not found. Please check your backend configuration.')
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while fetching subcategories.')
      }

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }

      throw new Error(error.response?.data?.message || 'Failed to fetch subcategories')
    }
  },

  /**
   * Search subcategories for a doctor by category or subcategory description
   */
  async searchSubCategories(doctorId: string, searchTerm: string): Promise<PrescriptionSubCategory[]> {
    try {
      if (!doctorId) {
        throw new Error('Doctor ID is required to search subcategories.')
      }
      if (!searchTerm || !searchTerm.trim()) {
        return this.getAllSubCategoriesForDoctor(doctorId)
      }

      const response = await api.get<PrescriptionSubCategory[]>(`/prescription-subcategory/doctor/${doctorId}/search`, {
        params: { term: searchTerm },
      })
      return response.data || []
    } catch (error: any) {
      console.error('PrescriptionSubCategory API Error (search):', error)

      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.')
      }

      if (error.response?.status === 400) {
        throw new Error('Invalid request. Please check your doctor ID.')
      } else if (error.response?.status === 404) {
        throw new Error('Prescription subcategory endpoint not found. Please check your backend configuration.')
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while searching subcategories.')
      }

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }

      throw new Error(error.response?.data?.message || 'Failed to search subcategories')
    }
  },

  /**
   * Create a new prescription subcategory
   */
  async createSubCategory(subCategory: PrescriptionSubCategory): Promise<PrescriptionSubCategory> {
    try {
      const response = await api.post<PrescriptionSubCategory>('/prescription-subcategory', subCategory)
      return response.data
    } catch (error: any) {
      console.error('PrescriptionSubCategory API Error (create):', error)

      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.')
      }

      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.error || 'Invalid request.')
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while creating subcategory.')
      }

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }

      throw new Error(error.response?.data?.message || 'Failed to create subcategory')
    }
  },

  /**
   * Update an existing prescription subcategory
   */
  async updateSubCategory(subCategory: PrescriptionSubCategory): Promise<PrescriptionSubCategory> {
    try {
      const response = await api.put<PrescriptionSubCategory>('/prescription-subcategory', subCategory)
      return response.data
    } catch (error: any) {
      console.error('PrescriptionSubCategory API Error (update):', error)

      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.')
      }

      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.error || 'Invalid request.')
      } else if (error.response?.status === 404) {
        throw new Error('Subcategory not found.')
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while updating subcategory.')
      }

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }

      throw new Error(error.response?.data?.message || 'Failed to update subcategory')
    }
  },

  /**
   * Delete a prescription subcategory
   */
  async deleteSubCategory(doctorId: string, catShortName: string, catsubDescription: string): Promise<void> {
    try {
      await api.delete(
        `/prescription-subcategory/doctor/${doctorId}/category/${encodeURIComponent(
          catShortName,
        )}/subcategory/${encodeURIComponent(catsubDescription)}`,
      )
    } catch (error: any) {
      console.error('PrescriptionSubCategory API Error (delete):', error)

      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Cannot connect to backend server. Please check if the server is running and CORS is configured.')
      }

      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.error || 'Invalid request.')
      } else if (error.response?.status === 404) {
        throw new Error('Subcategory not found.')
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while deleting subcategory.')
      }

      if (error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }

      throw new Error(error.response?.data?.message || 'Failed to delete subcategory')
    }
  },
}

export default prescriptionSubCategoryService


