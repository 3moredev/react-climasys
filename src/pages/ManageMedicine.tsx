import React, { useState, useEffect, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Edit, Delete, Search, Refresh } from "@mui/icons-material";
import { Select, MenuItem } from "@mui/material";
import AddMedicinePopup from "../components/AddMedicinePopup";
import medicineService from "../services/medicineService";
import { doctorService, Doctor } from "../services/doctorService";
import { useSession } from "../store/hooks/useSession";
import GlobalSnackbar from "../components/GlobalSnackbar";
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog";
import SearchInput from "../components/SearchInput";

// Medicine type definition
type Medicine = {
  sr: number;
  shortDescription: string;
  medicineName: string;
  priority: string;
  b: string;
  l: string;
  d: string;
  days: string;
  instruction: string;
  addToActiveList?: boolean;
};

export default function ManageMedicine() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [showAddPopup, setShowAddPopup] = useState<boolean>(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState<boolean>(false);

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [medicineToDelete, setMedicineToDelete] = useState<Medicine | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Snackbar state management
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const { clinicId, doctorId: sessionDoctorId, userId } = useSession();

  // Load medicines from API
  const loadMedicines = useCallback(async (docId: string) => {
    try {
      setLoading(true);
      setError(null);

      const apiMedicines = await medicineService.getAllMedicinesForDoctor(docId);

      // Transform API response to component format
      const transformedMedicines: Medicine[] = apiMedicines.map((med, index) => ({
        sr: index + 1,
        shortDescription: med.shortDescription || "",
        medicineName: med.medicineDescription || "",
        priority: med.priorityValue?.toString() || "",
        b: med.morning?.toString() || "",
        l: med.afternoon?.toString() || "",
        d: med.night?.toString() || "",
        days: med.noOfDays?.toString() || "",
        instruction: med.instruction || "",
        addToActiveList: med.active !== undefined && med.active !== null ? med.active : true
      }));

      setMedicines(transformedMedicines);
    } catch (err: any) {
      console.error('Error loading medicines:', err);
      setError(err.message || 'Failed to load medicines');
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDoctors = useCallback(async () => {
    try {
      setLoadingDoctors(true);
      const allDoctors = await doctorService.getAllDoctors();
      const clinicDoctors = clinicId
        ? allDoctors.filter((doctor: any) => {
          const doctorClinicId = doctor.clinicId || doctor.clinic_id || doctor.clinic;
          return !doctorClinicId || doctorClinicId === clinicId;
        })
        : allDoctors;
      const doctorsToUse = clinicDoctors.length > 0 ? clinicDoctors : allDoctors;
      setDoctors(doctorsToUse);

      if (doctorsToUse.length > 0 && !selectedDoctorId) {
        const defaultDoctor =
          doctorsToUse.find((d) => d.id === sessionDoctorId) || doctorsToUse[0];
        setSelectedDoctorId(defaultDoctor.id);
      }
    } catch (err: any) {
      console.error('Error fetching doctors:', err);
      setError(err.message || 'Failed to fetch doctors');
    } finally {
      setLoadingDoctors(false);
    }
  }, [clinicId, sessionDoctorId, selectedDoctorId]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  useEffect(() => {
    if (selectedDoctorId) {
      loadMedicines(selectedDoctorId);
    }
  }, [selectedDoctorId, loadMedicines]);

  // Filter medicines based on search term (client-side filtering for display)
  const filteredMedicines = medicines.filter(medicine => {
    if (!searchTerm.trim()) return true;
    const search = searchTerm.toLowerCase();
    return (
      medicine.shortDescription.toLowerCase().includes(search) ||
      medicine.medicineName.toLowerCase().includes(search) ||
      medicine.priority.toLowerCase().includes(search)
    );
  });

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredMedicines.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentMedicines = filteredMedicines.slice(startIndex, endIndex);
  // Enable table scroll whenever total records are more than 10,
  // regardless of the currently selected page size
  const shouldEnableTableScroll = filteredMedicines.length > 10;

  const handleSearch = async () => {
    if (!selectedDoctorId) {
      setError('Doctor ID not available');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setCurrentPage(1); // Reset to first page on search

      if (searchTerm.trim()) {
        // Call search API
        const apiMedicines = await medicineService.searchMedicines(selectedDoctorId, searchTerm);

        // Transform API response to component format
        const transformedMedicines: Medicine[] = apiMedicines.map((med, index) => ({
          sr: index + 1,
          shortDescription: med.shortDescription || "",
          medicineName: med.medicineDescription || "",
          priority: med.priorityValue?.toString() || "",
          b: med.morning?.toString() || "",
          l: med.afternoon?.toString() || "",
          d: med.night?.toString() || "",
          days: med.noOfDays?.toString() || "",
          instruction: med.instruction || "",
          addToActiveList: med.active !== undefined && med.active !== null ? med.active : true
        }));

        setMedicines(transformedMedicines);
      } else {
        // If search term is empty, reload all medicines
        await loadMedicines(selectedDoctorId);
      }
    } catch (err: any) {
      console.error('Error searching medicines:', err);
      setError(err.message || 'Failed to search medicines');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setSearchTerm("");
    setCurrentPage(1);
    if (selectedDoctorId) {
      await loadMedicines(selectedDoctorId);
    } else {
      setError('Doctor ID not available');
    }
  };

  const handleAddNew = () => {
    setEditingMedicine(null);
    setShowAddPopup(true);
  };

  const handleCloseAddPopup = () => {
    setShowAddPopup(false);
    setEditingMedicine(null);
  };

  const handleSaveMedicine = async (data: {
    shortDescription: string;
    medicineName: string;
    priority: string;
    breakfast: string;
    lunch: string;
    dinner: string;
    days: string;
    instruction: string;
    addToActiveList: boolean;
  }) => {
    // The popup now handles the API calls directly
    // This callback is just for reloading the medicines list
    try {
      if (selectedDoctorId) {
        await loadMedicines(selectedDoctorId);
        setSnackbarMessage(editingMedicine ? 'Medicine updated successfully!' : 'Medicine created successfully!');
        setSnackbarOpen(true);
      } else {
        setError('Doctor ID not available');
        setSnackbarMessage('Doctor ID not available');
        setSnackbarOpen(true);
      }

      setShowAddPopup(false);
      setEditingMedicine(null);
    } catch (err: any) {
      console.error('Error saving medicine:', err);
      setSnackbarMessage(err.message || (editingMedicine ? 'Failed to update medicine' : 'Failed to create medicine'));
      setSnackbarOpen(true);
    }
  };

  const handleEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setShowAddPopup(true);
  };

  const handleDelete = (medicine: Medicine) => {
    setMedicineToDelete(medicine);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!medicineToDelete) return;

    const medicine = medicineToDelete;
    if (!selectedDoctorId) {
      setError('Doctor ID not available');
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);

      // Hardcoded clinicId fallback as requested
      const clinic = clinicId || "CL-00001";
      await medicineService.deleteMedicine(selectedDoctorId, clinic, medicine.shortDescription);

      // Reload medicines after delete
      await loadMedicines(selectedDoctorId);

      setSnackbarMessage('Medicine deleted successfully!');
      setSnackbarOpen(true);
      setShowDeleteConfirm(false);
      setMedicineToDelete(null);
    } catch (err: any) {
      console.error('Error deleting medicine:', err);
      setError(err.message || 'Failed to delete medicine');
      setSnackbarMessage(err.message || 'Failed to delete medicine');
      setSnackbarOpen(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Reset pagination when medicines change
  useEffect(() => {
    setCurrentPage(1);
  }, [medicines.length]);

  return (
    <div className="container-fluid" style={{ fontFamily: "'Roboto', sans-serif", padding: "20px" }}>
      <style>{`
        .medicines-table {
          width: 100%;
          border-collapse: collapse;
        }
        .medicines-table thead th {
          background-color: rgb(0, 123, 255);
          color: #ffffff;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          font-size: 0.9rem;
          border: 1px solid #dee2e6;
        }
        .medicines-table tbody td {
          padding: 12px;
          border: 1px solid #dee2e6;
          font-size: 0.9rem;
          background-color: #ffffff;
        }
        .medicines-table tbody tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        .medicines-table tbody tr:nth-child(odd) {
          background-color: #ffffff;
        }
        .medicines-table tbody tr:hover {
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
        .search-section {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: nowrap;
          padding-bottom: 18px;
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
          background-color: rgb(0, 123, 255);
          color: #ffffff;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background-color 0.2s;
          white-space: nowrap;
        }
        .btn-primary-custom label {
          white-space: nowrap;
          cursor: pointer;
        }
        .btn-primary-custom:hover {
          background-color: rgb(0, 100, 200);
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
        .provider-dropdown {
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 0.9rem;
          width: 300px;
          max-width: 300px;
        }
        /* Pagination styles */
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
        /* Prev/Next buttons */
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
        color: '#212121',
        marginBottom: '24px'
      }}>
        Manage Medicine
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

      {/* Loading Indicator */}
      {loading && (
        <div style={{
          padding: '12px 20px',
          margin: '0 0 20px 0',
          backgroundColor: '#e3f2fd',
          color: '#1976d2',
          border: '1px solid #90caf9',
          borderRadius: '4px',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          Loading medicines...
        </div>
      )}

      {/* Search and Action Section */}
      <div className="search-section">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          onClear={() => {
            setSearchTerm('');
            setCurrentPage(1);
          }}
          placeholder="Enter Short Description, Medicine Name, Priority"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          className="search-input-wrapper"
        />

        <button className="btn-primary-custom" onClick={handleAddNew}>
          <label>Add New Medicine</label>
        </button>

        <button className="btn-icon" onClick={handleRefresh} title="Refresh">
          <Refresh style={{ fontSize: '20px' }} />
        </button>

        {userId !== 7 && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.9rem', color: '#666', whiteSpace: 'nowrap' }}>For Provider</span>
            <Select
              className="provider-dropdown"
              value={selectedDoctorId}
              onChange={(e) => {
                const doctorIdValue = e.target.value;
                setSelectedDoctorId(doctorIdValue);
                setCurrentPage(1);
              }}
              disabled={loadingDoctors || doctors.length === 0}
              displayEmpty
              size="small"
              sx={{
                height: 38,
                backgroundColor: '#FFFFFF',
                width: 300,
                color: selectedDoctorId ? '#212121' : '#666c75',
                '& .MuiSelect-select': {
                  padding: '6px 12px',
                  fontSize: '0.9rem',
                  fontFamily: "'Roboto', sans-serif",
                  textAlign: 'left',
                }
              }}
              MenuProps={{
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'left',
                },
                transformOrigin: {
                  vertical: 'top',
                  horizontal: 'left',
                },
                PaperProps: {
                  sx: {
                    marginTop: '4px',
                    '& .MuiMenuItem-root.Mui-selected': {
                      backgroundColor: '#eeeeee !important',
                    },
                    '& .MuiMenuItem-root:hover': {
                      backgroundColor: '#eeeeee',
                    },
                    '& .MuiMenuItem-root.Mui-selected:hover': {
                      backgroundColor: '#eeeeee',
                    }
                  }
                }
              }}
            >
              {loadingDoctors ? (
                <MenuItem value="" disabled>Loading doctors...</MenuItem>
              ) : doctors.length === 0 ? (
                <MenuItem value="" disabled>No doctors available</MenuItem>
              ) : (
                doctors.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </div>
        )}
      </div>

      {/* Medicines Table */}
      <div
        className="table-responsive"
        style={shouldEnableTableScroll ? { maxHeight: '510px', overflowY: 'auto' } : undefined}
      >
        <table className="medicines-table">
          <thead>
            <tr>
              <th style={{ width: '3%' }}>Sr.</th>
              <th style={{ width: '15%' }}>Short Description</th>
              <th style={{ width: '20%' }}>Medicine Name</th>
              <th style={{ width: '8%' }}>Priority</th>
              <th style={{ width: '5%' }}>B</th>
              <th style={{ width: '5%' }}>L</th>
              <th style={{ width: '5%' }}>D</th>
              <th style={{ width: '8%' }}>Days</th>
              <th style={{ width: '15%' }}>Instruction</th>
              <th style={{ width: '10%' }} className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentMedicines.length > 0 ? (
              currentMedicines.map((medicine) => (
                <tr key={medicine.sr}>
                  <td>{medicine.sr}</td>
                  <td>{medicine.shortDescription}</td>
                  <td>{medicine.medicineName}</td>
                  <td>{medicine.priority}</td>
                  <td>{medicine.b}</td>
                  <td>{medicine.l}</td>
                  <td>{medicine.d}</td>
                  <td>{medicine.days}</td>
                  <td>{medicine.instruction || ''}</td>
                  <td className="d-flex justify-content-center">
                    <div className="action-icons">
                      <div title="Edit" onClick={() => handleEdit(medicine)}>
                        <Edit style={{ fontSize: '20px' }} />
                      </div>
                      <div title="Delete" onClick={() => handleDelete(medicine)}>
                        <Delete style={{ fontSize: '20px' }} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  No medicines found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredMedicines.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            <span>
              Showing {startIndex + 1} to {Math.min(endIndex, filteredMedicines.length)} of {filteredMedicines.length} medicines
            </span>
            <div className="page-size-selector">
              <span>Show:</span>
              <Select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                variant="outlined"
                size="small"
                sx={{
                  height: '30px',
                  backgroundColor: '#fff',
                  fontSize: '0.9rem',
                  '& .MuiSelect-select': {
                    padding: '4px 32px 4px 8px',
                    display: 'flex',
                    alignItems: 'center'
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#ddd'
                  }
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      '& .MuiMenuItem-root.Mui-selected': {
                        backgroundColor: '#eeeeee !important',
                      },
                      '& .MuiMenuItem-root:hover': {
                        backgroundColor: '#eeeeee',
                      },
                      '& .MuiMenuItem-root.Mui-selected:hover': {
                        backgroundColor: '#eeeeee',
                      }
                    }
                  }
                }}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
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

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first page, last page, current page, and pages around current page
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    className={`page-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                );
              } else if (
                page === currentPage - 2 ||
                page === currentPage + 2
              ) {
                return <span key={page} className="page-btn" style={{ border: 'none', background: 'none' }}>...</span>;
              }
              return null;
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

      {/* Add Medicine Popup */}
      <AddMedicinePopup
        open={showAddPopup}
        onClose={handleCloseAddPopup}
        onSave={handleSaveMedicine}
        editData={editingMedicine ? {
          shortDescription: editingMedicine.shortDescription,
          medicineName: editingMedicine.medicineName,
          priority: editingMedicine.priority,
          breakfast: editingMedicine.b,
          lunch: editingMedicine.l,
          dinner: editingMedicine.d,
          days: editingMedicine.days,
          instruction: editingMedicine.instruction,
          addToActiveList: editingMedicine.addToActiveList !== undefined ? editingMedicine.addToActiveList : true
        } : undefined}
      />

      {/* Success/Error Snackbar */}
      <GlobalSnackbar
        show={snackbarOpen}
        message={snackbarMessage}
        onClose={() => setSnackbarOpen(false)}
        autoHideDuration={5000}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Medicine"
        message={
          <>
            Are you sure you want to delete the medicine <strong>{medicineToDelete?.medicineName}</strong>?
          </>
        }
        loading={isDeleting}
      />
    </div>
  );
}

