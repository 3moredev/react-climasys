import React, { useState, useEffect, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Edit, Delete, Search, Refresh, Add } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import { patientService } from "../services/patientService";
import { doctorService, Doctor } from "../services/doctorService";
import { useSession } from "../store/hooks/useSession";
import { useAppSelector } from "../store/hooks";
import AddComplaintPopup from "../components/AddComplaintPopup";
import GlobalSnackbar from "../components/GlobalSnackbar";
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog";
import SearchInput from "../components/SearchInput";

// Complaint type definition
type Complaint = {
  sr: number;
  shortDescription: string;
  complaintDescription: string;
  priority: number;
  displayToOperator: boolean;
};

export default function ManageComplaints() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const { clinicId, doctorId, userId } = useSession();

  // Get login API response data from Redux auth state
  const authState = useAppSelector((state) => state.auth);

  // Dynamic data from API
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState<boolean>(false);
  const [showAddPopup, setShowAddPopup] = useState<boolean>(false);
  const [editData, setEditData] = useState<Complaint | null>(null);

  // Snackbar state
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [complaintToDelete, setComplaintToDelete] = useState<Complaint | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Filter complaints based on search term
  const filteredComplaints = complaints.filter(complaint => {
    if (!searchTerm.trim()) return true;
    const search = searchTerm.toLowerCase();
    return (
      complaint.shortDescription.toLowerCase().includes(search) ||
      complaint.complaintDescription.toLowerCase().includes(search) ||
      complaint.priority.toString().includes(search)
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredComplaints.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentComplaints = filteredComplaints.slice(startIndex, endIndex);

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page on search
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  const handleAddNew = () => {
    setEditData(null);
    setShowAddPopup(true);
  };

  const handleCloseAddPopup = () => {
    setShowAddPopup(false);
    setEditData(null);
  };

  const handleSaveComplaint = async (data: {
    shortDescription: string;
    complaintDescription: string;
    priority: string;
    displayToOperator: boolean;
  }) => {
    if (!clinicId) {
      setSnackbarMessage('Clinic ID is required');
      setShowSnackbar(true);
      return;
    }

    // Use selectedDoctorId if available, otherwise fall back to doctorId from session
    const doctorIdToUse = selectedDoctorId || doctorId;
    if (!doctorIdToUse) {
      setSnackbarMessage('Doctor ID is required');
      setShowSnackbar(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare complaint data for API
      const complaintData = {
        shortDescription: data.shortDescription,
        short_description: data.shortDescription,
        complaintDescription: data.complaintDescription,
        complaint_description: data.complaintDescription,
        priority: data.priority ? parseInt(data.priority, 10) : 0,
        priorityValue: data.priority ? parseInt(data.priority, 10) : 0,
        priority_value: data.priority ? parseInt(data.priority, 10) : 0,
        displayToOperator: data.displayToOperator,
        display_to_operator: data.displayToOperator,
        doctorId: doctorIdToUse,
        doctor_id: doctorIdToUse,
        clinicId: clinicId,
        clinic_id: clinicId
      };

      if (editData) {
        // Update existing complaint
        console.log('Updating complaint:', complaintData);
        await patientService.updateComplaint(complaintData);
        console.log('Complaint updated successfully');
        setSnackbarMessage('Complaint updated successfully');
        setShowSnackbar(true);
      } else {
        // Create new complaint
        console.log('Creating complaint:', complaintData);
        await patientService.createComplaint(complaintData);
        console.log('Complaint created successfully');
        setSnackbarMessage('Complaint created successfully');
        setShowSnackbar(true);
      }

      // Close popup and clear edit data
      setShowAddPopup(false);
      setEditData(null);

      // Refresh complaints list
      await fetchComplaints(doctorIdToUse);
    } catch (err: any) {
      console.error('Error saving complaint:', err);
      setSnackbarMessage(err.message || (editData ? 'Failed to update complaint' : 'Failed to create complaint'));
      setShowSnackbar(true);
      // Keep popup open on error so user can retry
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (complaint: Complaint) => {
    setEditData(complaint);
    setShowAddPopup(true);
  };

  const handleDelete = (complaint: Complaint) => {
    setComplaintToDelete(complaint);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!complaintToDelete) return;

    const complaint = complaintToDelete;

    if (!clinicId) {
      setSnackbarMessage('Clinic ID is required to delete complaint');
      setShowSnackbar(true);
      return;
    }

    // Use selectedDoctorId if available, otherwise fall back to doctorId from session
    const doctorIdToUse = selectedDoctorId || doctorId;
    if (!doctorIdToUse) {
      setSnackbarMessage('Doctor ID is required to delete complaint');
      setShowSnackbar(true);
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);

      console.log('Deleting complaint:', complaint.shortDescription, 'for doctor:', doctorIdToUse, 'and clinic:', clinicId);
      await patientService.deleteComplaint(doctorIdToUse, clinicId, complaint.shortDescription);

      setSnackbarMessage('Complaint deleted successfully');
      setShowSnackbar(true);

      // Refresh the complaints list after successful deletion
      await fetchComplaints(doctorIdToUse);

      setShowDeleteConfirm(false);
      setComplaintToDelete(null);
    } catch (err: any) {
      console.error('Error deleting complaint:', err);
      setSnackbarMessage(err.message || 'Failed to delete complaint');
      setShowSnackbar(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setCurrentPage(1);
    fetchComplaints();
  };

  // Fetch complaints from API
  const fetchComplaints = useCallback(async (doctorIdToFetch?: string) => {
    if (!clinicId) {
      console.warn('ClinicId not available, skipping complaints fetch');
      setError('Clinic ID is required to fetch complaints');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use provided doctorId, then selectedDoctorId, then fall back to doctorId from session
      const doctorIdToUse = doctorIdToFetch || selectedDoctorId || doctorId;
      console.log('Fetching complaints for clinic:', clinicId, 'doctor:', doctorIdToUse);
      const response = await patientService.getAllComplaintsForDoctor(clinicId, doctorIdToUse);

      // Map API response to Complaint type
      const mappedComplaints: Complaint[] = response.map((item: any, index: number) => ({
        sr: index + 1,
        shortDescription: item.short_description || item.shortDescription || item.complaint_short_description || '',
        complaintDescription: item.complaint_description || item.complaintDescription || item.description || '',
        priority: item.priority || item.priority_value || item.priorityValue || 0,
        displayToOperator: item.display_to_operator === true || item.displayToOperator === true || item.display_to_operator === 1 || item.displayToOperator === 1
      }));

      setComplaints(mappedComplaints);
      setCurrentPage(1); // Reset to first page when new data is loaded
    } catch (err: any) {
      console.error('Error fetching complaints:', err);
      setError(err.message || 'Failed to fetch complaints');
      setComplaints([]); // Clear complaints on error
    } finally {
      setLoading(false);
    }
  }, [clinicId, selectedDoctorId, doctorId]);

  // Fetch doctors for the clinic
  const fetchDoctors = useCallback(async () => {
    if (!clinicId) {
      console.warn('ClinicId not available, skipping doctors fetch');
      return;
    }

    setLoadingDoctors(true);
    try {
      console.log('Fetching OPD doctors for clinic:', clinicId);
      const allDoctors = await doctorService.getOpdDoctors();

      // Filter doctors by clinic if clinicId is available in doctor data
      // If clinicId is not in the response, show all doctors
      const clinicDoctors = allDoctors.filter((doctor: any) => {
        // Check if doctor has clinicId field and matches
        const doctorClinicId = doctor.clinicId || doctor.clinic_id || doctor.clinic;
        return !doctorClinicId || doctorClinicId === clinicId;
      });

      // If no clinic-specific filtering found, use all doctors
      const doctorsToUse = clinicDoctors.length > 0 ? clinicDoctors : allDoctors;

      setDoctors(doctorsToUse);

      // Set default selected doctor
      if (doctorsToUse.length > 0 && !selectedDoctorId) {
        const defaultDoctor = doctorsToUse.find(d => d.id === doctorId) || doctorsToUse[0];
        setSelectedDoctorId(defaultDoctor.id);
        setSelectedProvider(defaultDoctor.name);
      }
    } catch (err: any) {
      console.error('Error fetching doctors:', err);
      setError('Failed to fetch doctors');
    } finally {
      setLoadingDoctors(false);
    }
  }, [clinicId, doctorId, selectedDoctorId]);

  // Fetch doctors when component mounts or when clinicId changes
  useEffect(() => {
    if (clinicId) {
      fetchDoctors();
    }
  }, [clinicId, fetchDoctors]);

  // Fetch complaints when component mounts or when clinicId/selectedDoctorId changes
  useEffect(() => {
    if (clinicId && selectedDoctorId) {
      fetchComplaints();
    } else if (clinicId && !selectedDoctorId && doctorId) {
      // If no doctor is selected but we have a session doctorId, use that
      fetchComplaints();
    }
  }, [clinicId, selectedDoctorId, fetchComplaints, doctorId]);

  // Console log login API response data
  useEffect(() => {
    const loginResponseData = {
      loginStatus: authState.user ? 1 : 0,
      userDetails: authState.userDetails,
      shiftTimes: authState.shiftTimes,
      availableRoles: authState.availableRoles,
      systemParams: authState.systemParams,
      licenseKey: authState.licenseKey,
      userMasterDetails: null,
      errorMessage: authState.error
    };
    console.log('Login API Response Data:', loginResponseData);
    console.log('Available Roles:', loginResponseData.availableRoles);
    console.log('User Details:', loginResponseData.userDetails);
    console.log('Shift Times:', loginResponseData.shiftTimes);
    console.log('System Params:', loginResponseData.systemParams);
    console.log('License Key:', loginResponseData.licenseKey);
  }, [authState]);

  return (
    <div className="container-fluid" style={{ fontFamily: "'Roboto', sans-serif", padding: "20px" }}>
      <style>{`
        .complaints-table {
          width: 100%;
          border-collapse: collapse;
        }
        .complaints-table thead th {
          background-color: rgb(0, 123, 255);
          color: #ffffff;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          font-size: 0.9rem;
          border: 1px solid #dee2e6;
        }
        .complaints-table tbody td {
          padding: 12px;
          border: 1px solid #dee2e6;
          font-size: 0.9rem;
        }
        .complaints-table tbody tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        .complaints-table tbody tr:nth-child(odd) {
          background-color: #ffffff;
        }
        .complaints-table tbody tr:hover {
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
          font-size: 0.9rem;
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
        Manage Complaints
      </h1>

      {/* Search and Action Section */}
      <div className="search-section">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          onClear={() => {
            setSearchTerm('');
            setCurrentPage(1);
          }}
          placeholder="Enter Short Description / Complaint Description / Priority"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          className="search-input-wrapper"
        />

        <button className="btn-primary-custom " onClick={handleAddNew}>
          <label>Add New Complaint</label>
        </button>

        <button className="btn-icon" onClick={handleRefresh} title="Refresh">
          <Refresh style={{ fontSize: '20px' }} />
        </button>

        {userId !== 7 && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.9rem', color: '#666', whiteSpace: 'nowrap' }}>For Provider</span>
            <select
              className="provider-dropdown"
              value={selectedDoctorId}
              onChange={async (e) => {
                const doctorIdValue = e.target.value;
                setSelectedDoctorId(doctorIdValue);
                const doctor = doctors.find(d => d.id === doctorIdValue);
                setSelectedProvider(doctor?.name || '');
                setCurrentPage(1); // Reset to first page when doctor changes

                // Immediately fetch complaints for the selected doctor
                if (clinicId && doctorIdValue) {
                  await fetchComplaints(doctorIdValue);
                }
              }}
              disabled={loadingDoctors || doctors.length === 0}
            >
              {loadingDoctors ? (
                <option value="">Loading doctors...</option>
              ) : doctors.length === 0 ? (
                <option value="">No doctors available</option>
              ) : (
                doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </option>
                ))
              )}
            </select>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          padding: '12px',
          marginBottom: '20px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}

      {/* Complaints Table */}
      <div
        className="table-responsive"
        style={pageSize > 10 ? { maxHeight: '60vh', overflowY: 'auto' } : undefined}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <CircularProgress style={{ color: 'rgb(0, 123, 255)' }} />
            <p style={{ marginTop: '16px', color: '#666' }}>Loading complaints...</p>
          </div>
        ) : (
          <table className="complaints-table">
            <thead>
              <tr>
                <th style={{ width: '5%' }}>Sr.</th>
                <th style={{ width: '20%' }}>Short Description</th>
                <th style={{ width: '30%' }}>Complaint Description</th>
                <th style={{ width: '10%' }}>Priority</th>
                <th style={{ width: '20%' }} className="text-center">Display to Operator</th>
                <th style={{ width: '15%' }} className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentComplaints.length > 0 ? (
                currentComplaints.map((complaint) => (
                  <tr key={complaint.sr}>
                    <td>{complaint.sr}</td>
                    <td>{complaint.shortDescription}</td>
                    <td>{complaint.complaintDescription}</td>
                    <td>{complaint.priority}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={complaint.displayToOperator}
                        readOnly
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td className="d-flex justify-content-center">
                      <div className="action-icons">
                        <div title="Edit" onClick={() => handleEdit(complaint)}>
                          <Edit style={{ fontSize: '20px' }} />
                        </div>
                        <div title="Delete" onClick={() => handleDelete(complaint)}>
                          <Delete style={{ fontSize: '20px' }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    {error ? 'Error loading complaints' : 'No complaints found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {filteredComplaints.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            <span>
              Showing {startIndex + 1} to {Math.min(endIndex, filteredComplaints.length)} of {filteredComplaints.length} complaints
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

      {/* Add Complaint Popup */}
      <AddComplaintPopup
        open={showAddPopup}
        onClose={handleCloseAddPopup}
        onSave={handleSaveComplaint}
        editData={editData ? {
          shortDescription: editData.shortDescription,
          complaintDescription: editData.complaintDescription,
          priority: editData.priority,
          displayToOperator: editData.displayToOperator
        } : null}
      />

      {/* Global Snackbar */}
      <GlobalSnackbar
        show={showSnackbar}
        message={snackbarMessage}
        onClose={() => setShowSnackbar(false)}
        autoHideDuration={5000}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Complaint"
        message={
          <>
            Are you sure you want to delete the complaint <strong>{complaintToDelete?.shortDescription}</strong>?
          </>
        }
        loading={isDeleting}
      />
    </div>
  );
}

