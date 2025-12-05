import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Add, Delete, Edit, Refresh, Search } from '@mui/icons-material'
import { Snackbar } from '@mui/material'
import { doctorService, Doctor } from '../services/doctorService'
import { useSession } from '../store/hooks/useSession'
import prescriptionSubCategoryService, {
  PrescriptionSubCategory as PrescriptionSubCategoryApiModel,
} from '../services/prescriptionSubCategoryService'
import prescriptionCategoryService, {
  PrescriptionCategory as PrescriptionCategoryApiModel,
} from '../services/prescriptionCategoryService'

type SubCategoryRow = {
  id: string
  categoryName: string
  subCategoryName: string
}

// Fallback options in case API is unavailable or returns no data
const FALLBACK_CATEGORY_OPTIONS = [
  'ALLERGY',
  'ANAESTHETICS',
  'ANTIBIOTICS',
  'ANTIBODIES',
  'CNS',
  'CVS & HA',
  'DERMATOLOGY',
]

const INITIAL_SUBCATEGORIES: SubCategoryRow[] = [
  { id: 'SUB-1', categoryName: 'ALLERGY', subCategoryName: 'Antihistamines & Antiallergics' },
  { id: 'SUB-2', categoryName: 'ALLERGY', subCategoryName: 'Immunosuppressants' },
  { id: 'SUB-3', categoryName: 'ALLERGY', subCategoryName: 'Vaccines, Antsera & Immunoglobulins' },
  { id: 'SUB-4', categoryName: 'ANAESTHETICS', subCategoryName: 'ANAESTHETICS, LOCAL & GENERAL' },
  { id: 'SUB-5', categoryName: 'ANTIBIOTICS', subCategoryName: 'Aminoglycosides' },
  { id: 'SUB-6', categoryName: 'ANTIBIOTICS', subCategoryName: 'Amphenicols' },
  { id: 'SUB-7', categoryName: 'ANTIBIOTICS', subCategoryName: 'Antimalarials' },
  { id: 'SUB-8', categoryName: 'ANTIBIOTICS', subCategoryName: 'Antituberculars' },
]

export default function PrescriptionSubCategory() {
  const { clinicId, doctorId: sessionDoctorId, userId } = useSession()

  const [subCategories, setSubCategories] = useState<SubCategoryRow[]>([])
  const [formData, setFormData] = useState({ categoryName: '', subCategoryName: '' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchDraft, setSearchDraft] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [loadingSubCategories, setLoadingSubCategories] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [categoryOptions, setCategoryOptions] = useState<string[]>(FALLBACK_CATEGORY_OPTIONS)
  const [error, setError] = useState<string | null>(null)
  
  // Snackbar state management
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')

  const fetchDoctors = useCallback(async () => {
    try {
      setLoadingDoctors(true)
      const allDoctors = await doctorService.getAllDoctors()
      const clinicDoctors = clinicId
        ? allDoctors.filter((doctor: any) => {
          const doctorClinicId = doctor.clinicId || doctor.clinic_id || doctor.clinic
          return !doctorClinicId || doctorClinicId === clinicId
        })
        : allDoctors
      const availableDoctors = clinicDoctors.length > 0 ? clinicDoctors : allDoctors
      setDoctors(availableDoctors)

      if (!selectedDoctorId && availableDoctors.length > 0) {
        const defaultDoctor = availableDoctors.find((doc) => doc.id === sessionDoctorId) || availableDoctors[0]
        setSelectedDoctorId(defaultDoctor.id)
      }
    } catch (error: any) {
      console.error('Failed to fetch doctors', error)
      setError('Unable to load providers right now.')
    } finally {
      setLoadingDoctors(false)
    }
  }, [clinicId, sessionDoctorId, selectedDoctorId])

  const transformApiToRow = (apiModel: PrescriptionSubCategoryApiModel): SubCategoryRow => ({
    id: `${apiModel.catShortName}||${apiModel.catsubDescription}`,
    categoryName: apiModel.catShortName,
    subCategoryName: apiModel.catsubDescription,
  })

  const loadSubCategories = useCallback(
    async (doctorId: string) => {
      try {
        if (!doctorId) {
          setError('Doctor ID not available')
          setSubCategories([])
          return
        }
        setLoadingSubCategories(true)
        setError(null)
        const apiSubCategories = await prescriptionSubCategoryService.getAllSubCategoriesForDoctor(doctorId)
        const rows: SubCategoryRow[] = apiSubCategories.map(transformApiToRow)
        setSubCategories(rows)
      } catch (err: any) {
        console.error('Error loading subcategories:', err)
        setError(err.message || 'Failed to load subcategories')
        setSubCategories([])
      } finally {
        setLoadingSubCategories(false)
      }
    },
    [],
  )

  const loadCategoriesForDoctor = useCallback(
    async (doctorId: string) => {
      try {
        if (!doctorId) {
          setCategoryOptions(FALLBACK_CATEGORY_OPTIONS)
          return
        }
        setLoadingCategories(true)
        const apiCategories = await prescriptionCategoryService.getAllCategoriesForDoctor(doctorId)
        if (apiCategories && apiCategories.length > 0) {
          const options = apiCategories
            .map((c: PrescriptionCategoryApiModel) => c.catShortName)
            .filter((v, idx, arr) => !!v && arr.indexOf(v) === idx)
          setCategoryOptions(options)
        } else {
          // If no categories from API, keep fallback so UI is not empty
          setCategoryOptions(FALLBACK_CATEGORY_OPTIONS)
        }
      } catch (err) {
        console.error('Error loading categories for subcategory screen:', err)
        // On error, keep fallback options instead of breaking the dropdown
        setCategoryOptions(FALLBACK_CATEGORY_OPTIONS)
      } finally {
        setLoadingCategories(false)
      }
    },
    [],
  )

  useEffect(() => {
    fetchDoctors()
  }, [fetchDoctors])

  useEffect(() => {
    if (selectedDoctorId) {
      loadSubCategories(selectedDoctorId)
      loadCategoriesForDoctor(selectedDoctorId)
    }
  }, [selectedDoctorId, loadSubCategories, loadCategoriesForDoctor])

  const filteredSubCategories = useMemo(() => {
    if (!searchQuery.trim()) return subCategories
    const query = searchQuery.toLowerCase()
    return subCategories.filter(
      (row) =>
        row.categoryName.toLowerCase().includes(query) ||
        row.subCategoryName.toLowerCase().includes(query)
    )
  }, [subCategories, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredSubCategories.length / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const paginatedRows = filteredSubCategories.slice(startIndex, startIndex + pageSize)
  const shouldEnableTableScroll = filteredSubCategories.length > pageSize

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, subCategories.length])

  const resetForm = () => {
    setFormData({ categoryName: '', subCategoryName: '' })
    setEditingId(null)
  }

  const handleAddOrUpdate = async () => {
    if (!formData.categoryName.trim() || !formData.subCategoryName.trim()) {
      setSnackbarMessage('Please select a category and enter a sub-category name.')
      setSnackbarOpen(true)
      return
    }

    if (!selectedDoctorId) {
      setError('Doctor ID not available')
      setSnackbarMessage('Doctor ID not available')
      setSnackbarOpen(true)
      return
    }

    try {
      setLoadingSubCategories(true)
      setError(null)

      // Normalize text fields to uppercase before saving
      const newCatShortName = formData.categoryName.trim().toUpperCase()
      const newCatsubDescription = formData.subCategoryName.trim().toUpperCase()

      if (editingId) {
        // For update, allow changing both category and subcategory.
        // If keys changed, simulate a rename by delete + create.
        const [originalCat, originalSub] = editingId.split('||')
        const keysUnchanged =
          originalCat === newCatShortName && originalSub === newCatsubDescription

        if (keysUnchanged) {
          const payload: PrescriptionSubCategoryApiModel = {
            catShortName: originalCat,
            catsubDescription: originalSub,
            doctorId: selectedDoctorId,
          }
          await prescriptionSubCategoryService.updateSubCategory(payload)
          setSnackbarMessage('SubCategory updated successfully!')
        } else {
          // Delete old record and create a new one with updated keys
          await prescriptionSubCategoryService.deleteSubCategory(
            selectedDoctorId,
            originalCat,
            originalSub,
          )
          const payload: PrescriptionSubCategoryApiModel = {
            catShortName: newCatShortName,
            catsubDescription: newCatsubDescription,
            doctorId: selectedDoctorId,
          }
          await prescriptionSubCategoryService.createSubCategory(payload)
          setSnackbarMessage('SubCategory updated successfully!')
        }
      } else {
        // New subcategory
        const payload: PrescriptionSubCategoryApiModel = {
          catShortName: newCatShortName,
          catsubDescription: newCatsubDescription,
          doctorId: selectedDoctorId,
        }
        await prescriptionSubCategoryService.createSubCategory(payload)
        setSnackbarMessage('SubCategory created successfully!')
      }

      await loadSubCategories(selectedDoctorId)
      resetForm()
      setSnackbarOpen(true)
    } catch (err: any) {
      console.error('Error saving subcategory:', err)
      setError(err.message || 'Failed to save subcategory')
      setSnackbarMessage(err.message || (editingId ? 'Failed to update subcategory' : 'Failed to create subcategory'))
      setSnackbarOpen(true)
    } finally {
      setLoadingSubCategories(false)
    }
  }

  const handleEdit = (row: SubCategoryRow) => {
    setEditingId(row.id)
    setFormData({ categoryName: row.categoryName, subCategoryName: row.subCategoryName })
  }

  const handleDelete = async (row: SubCategoryRow) => {
    if (!selectedDoctorId) {
      setError('Doctor ID not available')
      setSnackbarMessage('Doctor ID not available')
      setSnackbarOpen(true)
      return
    }

    if (!window.confirm(`Delete sub category "${row.subCategoryName}"?`)) {
      return
    }

    try {
      setLoadingSubCategories(true)
      setError(null)
      await prescriptionSubCategoryService.deleteSubCategory(selectedDoctorId, row.categoryName, row.subCategoryName)
      await loadSubCategories(selectedDoctorId)
      setSnackbarMessage('SubCategory deleted successfully!')
      setSnackbarOpen(true)
    } catch (err: any) {
      console.error('Error deleting subcategory:', err)
      setError(err.message || 'Failed to delete subcategory')
      setSnackbarMessage(err.message || 'Failed to delete subcategory')
      setSnackbarOpen(true)
    } finally {
      setLoadingSubCategories(false)
    }
  }

  const handleSearch = async () => {
    const term = searchDraft.trim()
    setSearchQuery(term)
  }

  const handleRefresh = () => {
    setSearchDraft('')
    setSearchQuery('')
    resetForm()
    if (selectedDoctorId) {
      loadSubCategories(selectedDoctorId)
      loadCategoriesForDoctor(selectedDoctorId)
    }
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1)
  }

  return (
    <div className="container-fluid" style={{ fontFamily: "'Roboto', sans-serif", padding: "20px" }}>
      <style>{`
        .form-row {
          display: flex;
          gap: 20px;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }
        .form-field {
          flex: 1;
          min-width: 240px;
        }
        .form-field label {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 6px;
          color: #4c5d7a;
        }
        .form-field select,
        .form-field input {
          width: 100%;
          padding: 10px 12px;
          border-radius: 4px;
          border: 1px solid #ced4da;
          font-size: 13px;
          color: #1d2b4f;
          font-family: 'Roboto', sans-serif;
          height: 40px;
          box-sizing: border-box;
        }
        .form-field input:disabled,
        .form-field select:disabled {
          background-color: #f5f5f5;
          color: #777777;
          cursor: not-allowed;
        }
        .form-actions {
          display: flex;
          gap: 12px;
          align-items: center;
          white-space: nowrap;
          margin-top: 16px;
          min-width: 240px;
        }
        .btn-primary-custom {
          background-color: rgb(0, 123, 255);
          color: #ffffff;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 0.9rem;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-family: 'Roboto', sans-serif;
          transition: background-color 0.2s;
          height: 40px;
          box-sizing: border-box;
        }
        .btn-primary-custom label {
          white-space: nowrap;
          cursor: pointer;
        }
        .btn-primary-custom:hover {
          background-color: rgb(0, 100, 200);
        }
        .btn-secondary {
          background-color: rgb(0, 123, 255);
          color: #ffffff;
          border: none;
          padding: 0 16px;
          border-radius: 4px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          font-family: 'Roboto', sans-serif;
          transition: background-color 0.2s;
          height: 40px;
          box-sizing: border-box;
        }
        .btn-secondary:hover {
          background-color: rgb(0, 100, 200);
        }
        .search-section {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: nowrap;
          overflow-x: auto;
        }
        .search-input-wrapper {
          position: relative;
          flex: 1;
          min-width: 300px;
          max-width: 500px;
        }
        .search-input-wrapper input {
          width: 100%;
          padding: 8px 40px 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 12px;
          font-family: 'Roboto', sans-serif;
        }
        .search-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
        }
        .provider-select {
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 0.9rem;
          width: 300px;
          max-width: 300px;
        }
        .subcategory-table {
          width: 100%;
          border-collapse: collapse;
        }
        .subcategory-table thead th {
          background-color: rgb(0, 123, 255);
          color: #ffffff;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          font-size: 0.9rem;
          border: 1px solid #dee2e6;
        }
        .subcategory-table tbody td {
          padding: 12px;
          border: 1px solid #dee2e6;
          font-size: 0.9rem;
          background-color: #ffffff;
        }
        .subcategory-table tbody tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        .subcategory-table tbody tr:nth-child(odd) {
          background-color: #ffffff;
        }
        .subcategory-table tbody tr:hover {
          background-color: #e9ecef;
        }
        .action-icons {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .action-icons > div {
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        .action-icons svg {
          color: #666;
          transition: color 0.2s;
        }
        .action-icons > div:hover svg {
          color: rgb(0, 123, 255);
        }
        .pagination-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
          padding: 15px 0;
          border-top: 1px solid #e0e0e0;
        }
        .pagination-info {
          display: flex;
          align-items: center;
          gap: 15px;
          font-size: 0.9rem;
          color: #666;
        }
        .page-size-selector {
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
        }
        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .page-btn {
          padding: 6px 12px;
          border: 1px solid #ddd;
          background: rgba(0, 0, 0, 0.35);
          color: #333;
          cursor: pointer;
          border-radius: 4px;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }
        .page-btn:hover:not(:disabled) {
          border-color: #999;
        }
        .page-btn.active {
          background: #1E88E5;
          color: white;
          border-color: #1E88E5;
        }
        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .nav-btn {
          background: #1E88E5;
          color: #fff;
          border-color: #000;
        }
        .nav-btn:hover:not(:disabled) {
          color: #fff;
          border-color: #000;
        }
        .nav-btn:disabled {
          background: #000;
          color: #fff;
          opacity: 0.35;
        }
        .page-size-select {
          padding: 4px 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.9rem;
        }
        .btn-icon {
          background: rgb(0, 123, 255);
          border: none;
          cursor: pointer;
          color: #ffffff;
          padding: 4px;
          display: flex;
          align-items: center;
          transition: background-color 0.2s;
          border-radius: 4px;
        }
        .btn-icon:hover {
          background-color: rgb(0, 100, 200);
        }
      `}</style>

      {/* Page Title */}
      <h1 style={{ 
        fontWeight: 'bold', 
        fontSize: '1.8rem', 
        color: '#212121',
        marginBottom: '24px'
      }}>
        Prescription Sub-Category
      </h1>

      {/* Error Message */}
      {error && (
        <div style={{
          padding: '12px 20px',
          margin: '0 0 20px 0',
          backgroundColor: '#fee',
          color: '#c33',
          border: '1px solid #fcc',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {/* Category Management Form */}
      <div className="form-row">
        <div className="form-field">
          <label>Category Name</label>
          <select
            value={formData.categoryName}
            onChange={(event) => setFormData((prev) => ({ ...prev, categoryName: event.target.value }))}
          >
            <option value="">Select Category</option>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label>SubCategory Name</label>
          <input
            type="text"
            placeholder="SubCategory Name"
            value={formData.subCategoryName}
            onChange={(event) => setFormData((prev) => ({ ...prev, subCategoryName: event.target.value }))}
          />
        </div>
        <div className="form-actions">
          <button className="btn-primary-custom" onClick={handleAddOrUpdate}>
            <Add fontSize="small" />
            {editingId ? 'Update SubCategory' : 'Add SubCategory'}
          </button>
          <button className="btn-secondary" onClick={resetForm}>
            Cancel
          </button>
        </div>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={searchDraft}
            onChange={(event) => {
              const value = event.target.value
              setSearchDraft(value)
              setSearchQuery(value)
            }}
            placeholder="Enter Category / Category Description"
          />
          <Search className="search-icon" style={{ fontSize: '20px' }} />
        </div>
        <button className="btn-icon" onClick={handleRefresh} title="Refresh">
          <Refresh style={{ fontSize: '20px' }} />
        </button>
        {userId !== 7 && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.9rem', color: '#666', whiteSpace: 'nowrap' }}>For Provider</span>
            <select
              className="provider-select"
              value={selectedDoctorId}
              onChange={(event) => setSelectedDoctorId(event.target.value)}
              disabled={loadingDoctors || doctors.length === 0}
            >
              {loadingDoctors ? (
                <option value="">Loading doctors...</option>
              ) : doctors.length === 0 ? (
                <option value="">No doctors available</option>
              ) : (
                doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name || doctor.id}
                  </option>
                ))
              )}
            </select>
          </div>
        )}
      </div>

      {/* SubCategories Table */}
      <div
        className="table-responsive"
        style={shouldEnableTableScroll ? { maxHeight: '510px', overflowY: 'auto' } : undefined}
      >
        <table className="subcategory-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Sr.</th>
              <th>Category Name</th>
              <th>SubCategory Name</th>
              <th style={{ width: '110px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row, index) => (
                <tr key={row.id}>
                  <td>{startIndex + index + 1}</td>
                  <td>{row.categoryName}</td>
                  <td>{row.subCategoryName}</td>
                  <td>
                    <div className="action-icons">
                      <div title="Edit" onClick={() => handleEdit(row)}>
                        <Edit style={{ fontSize: '20px' }} />
                      </div>
                      <div title="Delete" onClick={() => handleDelete(row)}>
                        <Delete style={{ fontSize: '20px' }} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  No sub categories found for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredSubCategories.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            <span>
              Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredSubCategories.length)} of{' '}
              {filteredSubCategories.length} sub categories
            </span>
            <div className="page-size-selector">
              <span>Show:</span>
              <select
                className="page-size-select"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span style={{ whiteSpace: 'nowrap' }}>per page</span>
            </div>
          </div>

          <div className="pagination-controls">
            <button
              className="page-btn nav-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                return (
                  <button
                    key={page}
                    className={`page-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                )
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <span
                    key={page}
                    className="page-btn"
                    style={{ border: 'none', background: 'none', cursor: 'default' }}
                  >
                    ...
                  </span>
                )
              }
              return null
            })}

            <button
              className="page-btn nav-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => {
          setSnackbarOpen(false);
        }}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          zIndex: 99999, // Ensure snackbar appears above everything
          '& .MuiSnackbarContent-root': {
            backgroundColor: snackbarMessage.includes('successfully') ? '#4caf50' : '#f44336',
            color: 'white',
            fontWeight: 'bold'
          }
        }}
      />
    </div>
  )
}

