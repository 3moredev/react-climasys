import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Add, Delete, Edit, Refresh, Search } from '@mui/icons-material'
import { doctorService, Doctor } from '../services/doctorService'
import { useSession } from '../store/hooks/useSession'
import prescriptionCategoryService, {
  PrescriptionCategory as PrescriptionCategoryApiModel,
} from '../services/prescriptionCategoryService'

type CategoryRow = {
  id: string
  categoryName: string
  description: string
}

export default function PrescriptionCategory() {
  const { clinicId, doctorId: sessionDoctorId, userId } = useSession()

  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [formData, setFormData] = useState({ categoryName: '', description: '' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchDraft, setSearchDraft] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [loadingCategories, setLoadingCategories] = useState(false)

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
    } catch (err: any) {
      console.error('Failed to load providers', err)
      setError('Unable to load providers right now.')
    } finally {
      setLoadingDoctors(false)
    }
  }, [clinicId, sessionDoctorId, selectedDoctorId])

  const transformApiToRow = (apiModel: PrescriptionCategoryApiModel, index: number): CategoryRow => ({
    id: apiModel.catShortName,
    categoryName: apiModel.catShortName,
    description: apiModel.catLongDescription || '',
  })

  const loadCategories = useCallback(
    async (doctorId: string) => {
      try {
        if (!doctorId) {
          setError('Doctor ID not available')
          setCategories([])
          return
        }
        setLoadingCategories(true)
        setError(null)
        const apiCategories = await prescriptionCategoryService.getAllCategoriesForDoctor(doctorId)
        const rows: CategoryRow[] = apiCategories.map((cat, index) => transformApiToRow(cat, index))
        setCategories(rows)
      } catch (err: any) {
        console.error('Error loading categories:', err)
        setError(err.message || 'Failed to load categories')
        setCategories([])
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
      loadCategories(selectedDoctorId)
    }
  }, [selectedDoctorId, loadCategories])

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories
    const query = searchQuery.toLowerCase()
    return categories.filter((category) =>
      category.categoryName.toLowerCase().includes(query) ||
      category.description.toLowerCase().includes(query)
    )
  }, [categories, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + pageSize)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, categories.length])

  const resetForm = () => {
    setFormData({ categoryName: '', description: '' })
    setEditingId(null)
  }

  const handleAddOrUpdate = async () => {
    if (!formData.categoryName.trim() || !formData.description.trim()) {
      alert('Please provide both category name and description.')
      return
    }

    if (!selectedDoctorId) {
      setError('Doctor ID not available')
      return
    }

    try {
      setLoadingCategories(true)
      setError(null)

      const catShortName = editingId || formData.categoryName.trim()

      const payload: PrescriptionCategoryApiModel = {
        catShortName,
        catLongDescription: formData.description.trim(),
        doctorId: selectedDoctorId,
      }

      if (editingId) {
        await prescriptionCategoryService.updateCategory(payload)
      } else {
        await prescriptionCategoryService.createCategory(payload)
      }

      await loadCategories(selectedDoctorId)
      resetForm()
    } catch (err: any) {
      console.error('Error saving category:', err)
      setError(err.message || 'Failed to save category')
    } finally {
      setLoadingCategories(false)
    }
  }

  const handleEdit = (row: CategoryRow) => {
    setEditingId(row.id)
    setFormData({ categoryName: row.categoryName, description: row.description })
  }

  const handleDelete = async (row: CategoryRow) => {
    if (!selectedDoctorId) {
      setError('Doctor ID not available')
      return
    }

    if (!window.confirm(`Delete category "${row.categoryName}"?`)) {
      return
    }

    try {
      setLoadingCategories(true)
      setError(null)
      await prescriptionCategoryService.deleteCategory(selectedDoctorId, row.categoryName)
      await loadCategories(selectedDoctorId)
    } catch (err: any) {
      console.error('Error deleting category:', err)
      setError(err.message || 'Failed to delete category')
    } finally {
      setLoadingCategories(false)
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
      loadCategories(selectedDoctorId)
    }
  }

  const handlePageChange = (nextPage: number) => {
    if (nextPage >= 1 && nextPage <= totalPages) {
      setCurrentPage(nextPage)
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
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 6px;
          color: #4c5d7a;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
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
        .form-field input:disabled {
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
          background-color: #1976d2;
          color: #ffffff;
          border: none;
          padding: 0 16px;
          border-radius: 4px;
          font-size: 13px;
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
        .btn-primary-custom:hover {
          background-color: #1565c0;
        }
        .btn-secondary {
          background-color: #1976d2;
          color: #ffffff;
          border: none;
          padding: 0 16px;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'Roboto', sans-serif;
          transition: background-color 0.2s;
          height: 40px;
          box-sizing: border-box;
        }
        .btn-secondary:hover {
          background-color: #1565c0;
        }
        .search-section {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .search-label {
          font-weight: bold;
          color: #333;
          font-size: 13px;
          margin-bottom: 4px;
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
          font-size: 12px;
          font-family: 'Roboto', sans-serif;
          width: 250px;
          background-color: #fff;
        }
        .category-table {
          width: 100%;
          border-collapse: collapse;
        }
        .category-table thead th {
          background-color: #1976d2;
          color: #ffffff;
          padding: 12px;
          text-align: left;
          font-weight: bold;
          font-size: 11px;
          font-family: 'Roboto', sans-serif;
          border: 1px solid #dee2e6;
        }
        .category-table tbody td {
          padding: 12px;
          border: 1px solid #dee2e6;
          font-size: 12px;
          font-family: 'Roboto', sans-serif;
          background-color: #ffffff;
        }
        .category-table tbody tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        .category-table tbody tr:nth-child(odd) {
          background-color: #ffffff;
        }
        .category-table tbody tr:hover {
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
          color: #1976d2;
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
      `}</style>

      {/* Page Title */}
      <h1 style={{ 
        fontWeight: 'bold', 
        fontSize: '1.8rem', 
        color: '#000000',
        marginBottom: '50px',
        marginTop: '0',
        paddingBottom: '20px',
        borderBottom: '2px solid #e0e0e0'
      }}>
        Prescription Category
      </h1>

      {/* Error Message */}
      {error && (
        <div style={{
          padding: '12px 20px',
          margin: '0 50px 20px 50px',
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
      <div className="form-row" style={{ paddingLeft: '50px', paddingRight: '50px' }}>
        <div className="form-field">
          <label>Category Name</label>
          <input
            type="text"
            placeholder="Category Name"
            value={formData.categoryName}
            onChange={(event) => setFormData((prev) => ({ ...prev, categoryName: event.target.value }))}
            // When editing, keep category name (short name) fixed to avoid creating a new record
            disabled={!!editingId}
          />
        </div>
        <div className="form-field">
          <label>Category Description</label>
          <input
            type="text"
            placeholder="Category Description"
            value={formData.description}
            onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
          />
        </div>
        <div className="form-actions">
          <button className="btn-primary-custom" onClick={handleAddOrUpdate}>
            <Add fontSize="small" />
            {editingId ? 'Update Category' : 'Add Category'}
          </button>
          <button className="btn-secondary" onClick={resetForm}>
            Cancel
          </button>
        </div>
      </div>

      {/* Search Section */}
      <div className="search-section" style={{ paddingLeft: '50px', paddingRight: '50px' }}>
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
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
              }
            }}
          />
          <Search className="search-icon" style={{ fontSize: '20px' }} />
        </div>
        <button className="btn-primary-custom" onClick={handleSearch}>
          <Search style={{ fontSize: '18px' }} />
          Search
        </button>
        <div 
          onClick={handleRefresh} 
          title="Refresh"
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1976d2',
            transition: 'color 0.2s',
            padding: '4px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#1565c0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#1976d2';
          }}
        >
          <Refresh style={{ fontSize: '20px' }} />
        </div>
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

      {/* Categories Table */}
      <div className="table-responsive" style={{ paddingLeft: '50px', paddingRight: '50px' }}>
        <table className="category-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Sr.</th>
              <th>Category Name</th>
              <th>Category Description</th>
              <th style={{ width: '110px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCategories.length > 0 ? (
              paginatedCategories.map((category, index) => (
                <tr key={category.id}>
                  <td>{startIndex + index + 1}</td>
                  <td>{category.categoryName}</td>
                  <td>{category.description}</td>
                  <td>
                    <div className="action-icons">
                      <div title="Edit" onClick={() => handleEdit(category)}>
                        <Edit style={{ fontSize: '20px' }} />
                      </div>
                      <div title="Delete" onClick={() => handleDelete(category)}>
                        <Delete style={{ fontSize: '20px' }} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  No categories found for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredCategories.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            <span>
              Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredCategories.length)} of{' '}
              {filteredCategories.length} categories
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
    </div>
  )
}

