import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Add, Delete, Edit, Refresh, Search } from '@mui/icons-material'
import AddPrescriptionPopup, { PrescriptionData } from '../components/AddPrescriptionPopup'
import { doctorService, Doctor } from '../services/doctorService'
import { useSession } from '../store/hooks/useSession'
import prescriptionDetailsService, {
  PrescriptionTemplate as PrescriptionTemplateApiModel,
} from '../services/prescriptionDetailsService'

type PrescriptionRow = {
  id: string
  categoryName: string
  subCategoryName: string
  brandName: string
  medicineName: string
  marketedBy: string
  priority: number
  breakfast: number
  lunch: number
  dinner: number
  days: number
  instruction: string
  providerId: string
}

const INITIAL_PRESCRIPTIONS: PrescriptionRow[] = [
  { id: 'RX-1', categoryName: 'ALLERGY', subCategoryName: 'Antihistamines & Antiallergics', brandName: 'loratadine 10 mg', medicineName: 'ALSPAN', marketedBy: 'BAYER\'S', priority: 1, breakfast: 1, lunch: 1, dinner: 1, days: 5, instruction: 'भोजनंतर / AFTER FOOD', providerId: 'DR-ANIRUDDHA' },
  { id: 'RX-2', categoryName: 'ALLERGY', subCategoryName: 'Antihistamines & Antiallergics', brandName: 'LEVOCETIRIZINE', medicineName: 'ALERIK M', marketedBy: 'ERIS LIFE', priority: 1, breakfast: 1, lunch: 1, dinner: 1, days: 5, instruction: 'भोजनंतर / AFTER FOOD', providerId: 'DR-ANIRUDDHA' },
  { id: 'RX-3', categoryName: 'ALLERGY', subCategoryName: 'Antihistamines & Antiallergics', brandName: 'FEXOFENADINE', medicineName: 'ALLEGRA', marketedBy: 'AVENTIS LTD', priority: 1, breakfast: 1, lunch: 1, dinner: 1, days: 5, instruction: 'भोजनंतर / AFTER FOOD', providerId: 'DR-ANIRUDDHA' },
  { id: 'RX-4', categoryName: 'ALLERGY', subCategoryName: 'Antihistamines & Antiallergics', brandName: 'FEXOFENADINE', medicineName: 'ALLEGRA', marketedBy: 'AVENTIS LTD', priority: 1, breakfast: 1, lunch: 1, dinner: 1, days: 5, instruction: 'भोजनंतर / AFTER FOOD', providerId: 'DR-ANIRUDDHA' },
  { id: 'RX-5', categoryName: 'ALLERGY', subCategoryName: 'Antihistamines & Antiallergics', brandName: 'MONTELUKAST', medicineName: 'ALLEGRA', marketedBy: 'AVENTIS LTD', priority: 1, breakfast: 1, lunch: 1, dinner: 1, days: 5, instruction: 'भोजनंतर / AFTER FOOD', providerId: 'DR-ANIRUDDHA' },
  { id: 'RX-6', categoryName: 'ALLERGY', subCategoryName: 'Antihistamines & Antiallergics', brandName: 'Hydroxyzine', medicineName: 'ATRAX', marketedBy: 'WYETH LTD', priority: 1, breakfast: 1, lunch: 1, dinner: 1, days: 5, instruction: 'भोजनंतर / AFTER FOOD', providerId: 'DR-ANIRUDDHA' },
  { id: 'RX-7', categoryName: 'ALLERGY', subCategoryName: 'Antihistamines & Antiallergics', brandName: 'PHENIRAMINE', medicineName: 'AVIL INJECTION', marketedBy: 'AVENTIS LTD', priority: 1, breakfast: 1, lunch: 1, dinner: 1, days: 5, instruction: 'भोजनंतर / AFTER FOOD', providerId: 'DR-ANIRUDDHA' },
  { id: 'RX-8', categoryName: 'ALLERGY', subCategoryName: 'Antihistamines & Antiallergics', brandName: 'PHENIRAMINE', medicineName: 'AVIL 25', marketedBy: 'AVENTIS LTD', priority: 1, breakfast: 1, lunch: 1, dinner: 1, days: 5, instruction: 'भोजनंतर / AFTER FOOD', providerId: 'DR-ANIRUDDHA' },
]

export default function PrescriptionDetails() {
  const { clinicId, doctorId, userId } = useSession()

  const [prescriptions, setPrescriptions] = useState<PrescriptionRow[]>([])
  const [searchDraft, setSearchDraft] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [showPopup, setShowPopup] = useState(false)
  const [editingRow, setEditingRow] = useState<PrescriptionRow | null>(null)

  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        const defaultDoctor = availableDoctors.find((doc) => doc.id === doctorId) || availableDoctors[0]
        setSelectedDoctorId(defaultDoctor.id)
      }
    } catch (error: any) {
      console.error('Failed to load doctors', error)
      setError('Unable to load providers right now.')
    } finally {
      setLoadingDoctors(false)
    }
  }, [clinicId, doctorId, selectedDoctorId])

  useEffect(() => {
    fetchDoctors()
  }, [fetchDoctors])

  const transformApiToRow = (apiModel: PrescriptionTemplateApiModel): PrescriptionRow => ({
    id: `${apiModel.catShortName}||${apiModel.catsubDescription}||${apiModel.brandName}||${apiModel.medicineName}`,
    categoryName: apiModel.catShortName,
    subCategoryName: apiModel.catsubDescription,
    brandName: apiModel.brandName,
    medicineName: apiModel.medicineName,
    marketedBy: apiModel.marketedBy || '',
    priority: apiModel.priorityValue ?? 0,
    breakfast: apiModel.morning ?? 0,
    lunch: apiModel.afternoon ?? 0,
    dinner: apiModel.night ?? 0,
    days: apiModel.noOfDays ?? 0,
    instruction: apiModel.instruction || '',
    providerId: apiModel.doctorId,
  })

  const loadPrescriptions = useCallback(
    async (doctorIdVal: string) => {
      try {
        if (!doctorIdVal) {
          setError('Doctor ID not available')
          setPrescriptions([])
          return
        }
        setLoadingPrescriptions(true)
        setError(null)
        const apiPrescriptions = await prescriptionDetailsService.getAllPrescriptionsForDoctor(doctorIdVal)
        const rows: PrescriptionRow[] = apiPrescriptions.map(transformApiToRow)
        setPrescriptions(rows)
      } catch (err: any) {
        console.error('Error loading prescriptions:', err)
        setError(err.message || 'Failed to load prescriptions')
        setPrescriptions([])
      } finally {
        setLoadingPrescriptions(false)
      }
    },
    [],
  )

  useEffect(() => {
    if (selectedDoctorId) {
      loadPrescriptions(selectedDoctorId)
    }
  }, [selectedDoctorId, loadPrescriptions])

  const filteredPrescriptions = useMemo(() => {
    const bySearch = prescriptions.filter((row) => {
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        row.categoryName.toLowerCase().includes(q) ||
        row.subCategoryName.toLowerCase().includes(q) ||
        row.brandName.toLowerCase().includes(q) ||
        row.medicineName.toLowerCase().includes(q) ||
        row.marketedBy.toLowerCase().includes(q) ||
        row.instruction.toLowerCase().includes(q)
      )
    })

    if (!selectedDoctorId) return bySearch
    return bySearch.filter((row) => row.providerId === selectedDoctorId)
  }, [prescriptions, searchQuery, selectedDoctorId])

  const totalPages = Math.max(1, Math.ceil(filteredPrescriptions.length / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const paginatedRows = filteredPrescriptions.slice(startIndex, startIndex + pageSize)
  const shouldEnableTableScroll = filteredPrescriptions.length > pageSize

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedDoctorId, prescriptions.length])

  const handleSearch = async () => {
    const term = searchDraft.trim()
    setSearchQuery(term)
  }

  const handleRefresh = () => {
    setSearchDraft('')
    setSearchQuery('')
    setEditingRow(null)
    if (selectedDoctorId) {
      loadPrescriptions(selectedDoctorId)
    }
  }

  const openAddPopup = () => {
    setEditingRow(null)
    setShowPopup(true)
  }

  const handleSavePrescription = async (data: PrescriptionData) => {
    if (!selectedDoctorId) {
      setError('Doctor ID not available')
      return
    }

    try {
      setLoadingPrescriptions(true)
      setError(null)

      const newCatShortName = data.categoryName.trim()
      const newCatsubDescription = data.subCategoryName.trim()
      const newBrandName = data.brandName.trim()
      const newMedicineName = data.genericName.trim()

      const payload: PrescriptionTemplateApiModel = {
        catShortName: newCatShortName,
        catsubDescription: newCatsubDescription,
        brandName: newBrandName,
        medicineName: newMedicineName,
        clinicId: data.clinicId || clinicId || '',
        marketedBy: data.marketedBy,
        priorityValue: data.priority ? parseInt(data.priority, 10) || 0 : 0,
        morning: data.breakfast ? parseInt(data.breakfast, 10) || 0 : 0,
        afternoon: data.lunch ? parseInt(data.lunch, 10) || 0 : 0,
        night: data.dinner ? parseInt(data.dinner, 10) || 0 : 0,
        noOfDays: data.days ? parseInt(data.days, 10) || 0 : 0,
        instruction: data.instruction,
        doctorId: selectedDoctorId,
      }

      if (editingRow) {
        const originalCat = editingRow.categoryName
        const originalSub = editingRow.subCategoryName
        const originalBrand = editingRow.brandName
        const originalMed = editingRow.medicineName

        const keysUnchanged =
          originalCat === newCatShortName &&
          originalSub === newCatsubDescription &&
          originalBrand === newBrandName &&
          originalMed === newMedicineName

        if (keysUnchanged) {
          await prescriptionDetailsService.updatePrescription(payload)
        } else {
          await prescriptionDetailsService.deletePrescription(
            selectedDoctorId,
            originalCat,
            originalSub,
            originalMed,
            originalBrand,
          )
          await prescriptionDetailsService.createPrescription(payload)
        }
      } else {
        await prescriptionDetailsService.createPrescription(payload)
      }

      await loadPrescriptions(selectedDoctorId)
      setShowPopup(false)
      setEditingRow(null)
    } catch (err: any) {
      console.error('Error saving prescription:', err)
      setError(err.message || 'Failed to save prescription')
    } finally {
      setLoadingPrescriptions(false)
    }
  }

  const handleEdit = (row: PrescriptionRow) => {
    setEditingRow(row)
    setShowPopup(true)
  }

  const handleDelete = async (row: PrescriptionRow) => {
    if (!selectedDoctorId) {
      setError('Doctor ID not available')
      return
    }

    if (!window.confirm(`Delete prescription "${row.brandName}"?`)) {
      return
    }

    try {
      setLoadingPrescriptions(true)
      setError(null)
      await prescriptionDetailsService.deletePrescription(
        selectedDoctorId,
        row.categoryName,
        row.subCategoryName,
        row.medicineName,
        row.brandName,
      )
      await loadPrescriptions(selectedDoctorId)
    } catch (err: any) {
      console.error('Error deleting prescription:', err)
      setError(err.message || 'Failed to delete prescription')
    } finally {
      setLoadingPrescriptions(false)
    }
  }

  const popupInitialData: PrescriptionData | null = editingRow
    ? {
      categoryName: editingRow.categoryName,
      subCategoryName: editingRow.subCategoryName,
      genericName: editingRow.medicineName,
      brandName: editingRow.brandName,
      marketedBy: editingRow.marketedBy,
      instruction: editingRow.instruction,
      breakfast: editingRow.breakfast.toString(),
      lunch: editingRow.lunch.toString(),
      dinner: editingRow.dinner.toString(),
      days: editingRow.days.toString(),
      priority: editingRow.priority.toString(),
    }
    : null

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
        .btn-primary-custom {
          background-color: #1976d2;
          color: #ffffff;
          border: none;
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          font-family: 'Roboto', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background-color 0.2s;
          white-space: nowrap;
          height: 32px;
        }
        .btn-primary-custom:hover {
          background-color: #1565c0;
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
        .prescription-table {
          width: 100%;
          border-collapse: collapse;
        }
        .prescription-table thead th {
          background-color: #1976d2;
          color: #ffffff;
          padding: 12px;
          text-align: left;
          font-weight: bold;
          font-size: 11px;
          font-family: 'Roboto', sans-serif;
          border: 1px solid #dee2e6;
        }
        .prescription-table tbody td {
          padding: 12px;
          border: 1px solid #dee2e6;
          font-size: 12px;
          font-family: 'Roboto', sans-serif;
          background-color: #ffffff;
        }
        .prescription-table tbody tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        .prescription-table tbody tr:nth-child(odd) {
          background-color: #ffffff;
        }
        .prescription-table tbody tr:hover {
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
        marginBottom: '30px',
        marginTop: '0'
      }}>
        Prescription Details
      </h1>

      {/* Error Message */}
      {error && (
        <div
          style={{
            padding: '12px 20px',
            margin: '0 0 20px 0',
            backgroundColor: '#fee',
            color: '#c33',
            border: '1px solid #fcc',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}

      {/* Search and Action Section */}
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
            placeholder="Enter Category / Sub Category / Medicine / Brand / Priority"
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

        <button className="btn-primary-custom" onClick={openAddPopup}>
          Add New Prescription
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

      {/* Prescriptions Table */}
      <div
        className="table-responsive"
        style={shouldEnableTableScroll ? { maxHeight: '580px', overflowY: 'auto' } : undefined}
      >
        <table className="prescription-table">
          <thead>
            <tr>
              <th style={{ width: '3%' }}>Sr.</th>
              <th style={{ width: '10%' }}>Category Name</th>
              <th style={{ width: '15%' }}>SubCategory Name</th>
              <th style={{ width: '12%' }}>Brand Name</th>
              <th style={{ width: '12%' }}>Medicine Name</th>
              <th style={{ width: '12%' }}>Marketed By</th>
              <th style={{ width: '6%' }}>Priority</th>
              <th style={{ width: '4%' }}>B</th>
              <th style={{ width: '4%' }}>L</th>
              <th style={{ width: '4%' }}>D</th>
              <th style={{ width: '5%' }}>Days</th>
              <th style={{ width: '15%' }}>Instruction</th>
              <th style={{ width: '8%' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row, index) => (
                <tr key={row.id}>
                  <td>{startIndex + index + 1}</td>
                  <td>{row.categoryName}</td>
                  <td>{row.subCategoryName}</td>
                  <td>{row.brandName}</td>
                  <td>{row.medicineName}</td>
                  <td>{row.marketedBy}</td>
                  <td>{row.priority}</td>
                  <td>{row.breakfast}</td>
                  <td>{row.lunch}</td>
                  <td>{row.dinner}</td>
                  <td>{row.days}</td>
                  <td>{row.instruction}</td>
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
                <td colSpan={13} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  No prescriptions found for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredPrescriptions.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            <span>
              Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredPrescriptions.length)} of{' '}
              {filteredPrescriptions.length} prescriptions
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

      <AddPrescriptionPopup
        open={showPopup}
        onClose={() => {
          setShowPopup(false)
          setEditingRow(null)
        }}
        onSave={handleSavePrescription}
        initialData={popupInitialData}
        title={editingRow ? 'Edit Prescription' : 'Add Prescription'}
        primaryActionLabel={editingRow ? 'Update' : 'Save'}
        doctorId={selectedDoctorId}
        clinicId={clinicId}
      />
    </div>
  )
}

