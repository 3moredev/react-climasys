import React, { useState, useEffect, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Edit, Delete, Search, Refresh, Add } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import { billingService, BillingDetail } from "../services/billingService";
import { doctorService, Doctor } from "../services/doctorService";
import { useSession } from "../store/hooks/useSession";
import AddBillingDetailsPopup, { BillingDetailData } from "../components/AddBillingDetailsPopup";
import GlobalSnackbar from "../components/GlobalSnackbar";
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog";

type BillingDetailRow = BillingDetail & {
  sr: number;
};

export default function ManageBillingDetails() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const { clinicId, doctorId, userId } = useSession();

  // Dynamic data from API
  const [billingDetails, setBillingDetails] = useState<BillingDetailRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState<boolean>(false);
  const [showAddPopup, setShowAddPopup] = useState<boolean>(false);
  const [editData, setEditData] = useState<BillingDetailRow | null>(null);

  // Snackbar state
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [billingToDelete, setBillingToDelete] = useState<BillingDetailRow | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Filter billing details based on search term
  const filteredBillingDetails = billingDetails.filter(billing => {
    if (!searchTerm.trim()) return true;
    const search = searchTerm.toLowerCase();
    return (
      (billing.group || '').toLowerCase().includes(search) ||
      (billing.subGroup || '').toLowerCase().includes(search) ||
      (billing.details || '').toLowerCase().includes(search) ||
      (billing.defaultFee?.toString() || '').includes(search) ||
      (billing.sequenceNo?.toString() || '').includes(search)
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredBillingDetails.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentBillingDetails = filteredBillingDetails.slice(startIndex, endIndex);

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

  const handleSaveBillingDetail = async (data: BillingDetailData) => {
    // Use selectedDoctorId if available, otherwise fall back to doctorId from session
    const doctorIdToUse = selectedDoctorId || doctorId;
    if (!doctorIdToUse) {
      setSnackbarMessage('Doctor ID is required');
      setShowSnackbar(true);
      return;
    }

    if (!userId) {
      setSnackbarMessage('User ID is required');
      setShowSnackbar(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare billing master data request
      const billingMasterDataRequest: any = {
        groupName: data.group,
        subgroupName: data.subGroup || '',
        userId: userId.toString(),
        detail: data.details || '',
        defaultFee: Number(data.defaultFee),
        doctorId: doctorIdToUse.toString(),
        sequenceNo: Number(data.sequenceNo),
        isDefault: data.isDefault,
        visitType: data.visitType
      };

      // Include clinicId if provided from popup
      if (data.clinicId) {
        billingMasterDataRequest.clinicId = data.clinicId;
        billingMasterDataRequest.clinic_id = data.clinicId;
        billingMasterDataRequest.Clinic_ID = data.clinicId;
      }

      if (editData && editData.id) {
        // Update existing billing master data
        await billingService.updateBillingMasterData(billingMasterDataRequest);
      } else {
        // Insert new billing master data
        await billingService.insertBillingMasterData(billingMasterDataRequest);
      }

      // Close popup and clear edit data
      setShowAddPopup(false);
      setEditData(null);

      setSnackbarMessage(editData ? 'Billing detail updated successfully' : 'Billing detail created successfully');
      setShowSnackbar(true);

      // Refresh billing details list
      await fetchBillingDetails(doctorIdToUse);
    } catch (err: any) {
      console.error('Error saving billing detail:', err);
      setSnackbarMessage(err.message || (editData ? 'Failed to update billing detail' : 'Failed to create billing detail'));
      setShowSnackbar(true);
      // Keep popup open on error so user can retry
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (billing: BillingDetailRow) => {
    setEditData(billing);
    setShowAddPopup(true);
  };

  const handleDelete = (billing: BillingDetailRow) => {
    setBillingToDelete(billing);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!billingToDelete) return;

    const billing = billingToDelete;

    if (!clinicId) {
      setSnackbarMessage('Clinic ID is required to delete billing detail');
      setShowSnackbar(true);
      return;
    }

    // Use selectedDoctorId if available, otherwise fall back to doctorId from session
    const doctorIdToUse = selectedDoctorId || doctorId;
    if (!doctorIdToUse) {
      setSnackbarMessage('Doctor ID is required to delete billing detail');
      setShowSnackbar(true);
      return;
    }

    if (!billing.id) {
      setSnackbarMessage('Billing detail ID is missing');
      setShowSnackbar(true);
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);

      await billingService.deleteBillingDetail(billing.id, doctorIdToUse, clinicId);

      setSnackbarMessage('Billing detail deleted successfully');
      setShowSnackbar(true);

      // Refresh the billing details list after successful deletion
      await fetchBillingDetails(doctorIdToUse);
      setShowDeleteConfirm(false);
      setBillingToDelete(null);
    } catch (err: any) {
      console.error('Error deleting billing detail:', err);
      setSnackbarMessage(err.message || 'Failed to delete billing detail');
      setShowSnackbar(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setCurrentPage(1);
    fetchBillingDetails();
  };

  // Fetch billing details from API
  const fetchBillingDetails = useCallback(async (doctorIdToFetch?: string) => {
    setLoading(true);
    setError(null);

    try {
      if (!clinicId) {
        setError('Clinic ID is required to fetch billing details');
        setLoading(false);
        return;
      }

      // Use provided doctorId, then selectedDoctorId, then fall back to doctorId from session
      const doctorIdToUse = doctorIdToFetch || selectedDoctorId || doctorId;
      if (!doctorIdToUse) {
        setError('Doctor ID is required to fetch billing details');
        setLoading(false);
        return;
      }

      console.log('Fetching billing categories for doctor:', doctorIdToUse);

      // Call getBillingCategories API
      const categoriesResponse = await billingService.getBillingCategories(doctorIdToUse);
      console.log('Billing categories response:', categoriesResponse);

      // Map categories response to BillingDetailRow type
      // The API returns Record<string, any>[], so we need to map the fields
      const mappedBillingDetails: BillingDetailRow[] = categoriesResponse.map((category: Record<string, any>, index: number) => {
        // Map field names from the API response to our BillingDetail structure
        // API response fields: billing_details, billing_group_name, billing_subgroup_name, 
        // default_fees, isdefault, sequence_no, visit_type, visit_type_description
        const categoryId = category.id || category.ID || category.billingDetailId || category.Billing_Detail_ID;
        const uniqueId = categoryId !== undefined && categoryId !== null ? categoryId : `category-${doctorIdToUse}-${index}`;
        return {
          id: uniqueId,
          group: category.billing_group_name || category.group || category.Group || category.groupName || category.group_name || '',
          subGroup: category.billing_subgroup_name || category.subGroup || category.Sub_Group || category.sub_group || category.subGroupName || category.sub_group_name || '',
          details: category.billing_details || category.details || category.Details || category.description || category.Description || '',
          defaultFee: Number(category.default_fees) || Number(category.defaultFee) || Number(category.Default_Fee) || Number(category.default_fee) || Number(category.fee) || Number(category.Fee) || 0,
          sequenceNo: Number(category.sequence_no) || Number(category.sequenceNo) || Number(category.Sequence_No) || Number(category.sequence) || Number(category.Sequence) || 0,
          visitType: category.visit_type_description || (category.visit_type === 'N' ? 'New' : category.visit_type === 'F' ? 'Followup' : category.visit_type) || category.visitType || category.Visit_Type || category.visitTypeName || category.visit_type_name || '',
          isDefault: category.isdefault !== undefined ? Boolean(category.isdefault) : Boolean(category.isDefault || category.Is_Default || category.is_default || category.isDefaultFlag || false),
          lunch: category.lunch || category.Lunch || '',
          sr: index + 1
        };
      });

      console.log('Mapped billing details from categories:', mappedBillingDetails);

      setBillingDetails(mappedBillingDetails);
      setCurrentPage(1); // Reset to first page when new data is loaded
    } catch (err: any) {
      console.error('Error fetching billing details:', err);
      setError(err.message || 'Failed to fetch billing details');
      setBillingDetails([]); // Clear billing details on error
    } finally {
      setLoading(false);
    }
  }, [selectedDoctorId, doctorId, clinicId]);

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

  // Fetch billing details when component mounts or when selectedDoctorId changes
  useEffect(() => {
    if (selectedDoctorId) {
      fetchBillingDetails();
    } else if (!selectedDoctorId && doctorId) {
      // If no doctor is selected but we have a session doctorId, use that
      fetchBillingDetails();
    }
  }, [selectedDoctorId, fetchBillingDetails, doctorId]);

  return (
    <div className="container-fluid" style={{ fontFamily: "'Roboto', sans-serif", padding: "20px" }}>
      <style>{`
        .billing-details-table {
          width: 100%;
          border-collapse: collapse;
        }
        .billing-details-table thead th {
          background-color: rgb(0, 123, 255);
          color: #ffffff;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          font-size: 0.9rem;
          border: 1px solid #dee2e6;
        }
        .billing-details-table tbody td {
          padding: 12px;
          border: 1px solid #dee2e6;
          font-size: 0.9rem;
        }
        .billing-details-table tbody tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        .billing-details-table tbody tr:nth-child(odd) {
          background-color: #ffffff;
        }
        .billing-details-table tbody tr:hover {
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
        Manage Billing Details
      </h1>

      {/* Search and Action Section */}
      <div className="search-section">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Enter Group / Sub-Group / Details / Default Fees / Sequence Number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <Search className="search-icon" style={{ fontSize: '20px' }} />
        </div>

        <button className="btn-primary-custom" onClick={handleAddNew}>
          <Add style={{ fontSize: '18px' }} />
          <label>Add New Billing Detail</label>
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

                // Immediately fetch billing details for the selected doctor
                if (doctorIdValue) {
                  await fetchBillingDetails(doctorIdValue);
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

      {/* Billing Details Table */}
      <div
        className="table-responsive"
        style={pageSize > 10 ? { maxHeight: '60vh', overflowY: 'auto' } : undefined}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <CircularProgress style={{ color: 'rgb(0, 123, 255)' }} />
            <p style={{ marginTop: '16px', color: '#666' }}>Loading billing details...</p>
          </div>
        ) : (
          <table className="billing-details-table">
            <thead>
              <tr>
                <th style={{ width: '5%' }}>Sr.</th>
                <th style={{ width: '12%' }}>Group</th>
                <th style={{ width: '12%' }}>Sub-Group</th>
                <th style={{ width: '15%' }}>Details</th>
                <th style={{ width: '10%' }}>Default Fees</th>
                <th style={{ width: '8%' }}>Sequence No</th>
                <th style={{ width: '10%' }}>Visit Type</th>
                <th style={{ width: '8%' }}>Is Default</th>
                <th style={{ width: '10%' }} className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentBillingDetails.length > 0 ? (
                currentBillingDetails.map((billing, rowIndex) => (
                  <tr key={`billing-${billing.id || 'no-id'}-${billing.sr}-${rowIndex}`}>
                    <td>{billing.sr}</td>
                    <td>{billing.group || '-'}</td>
                    <td>{billing.subGroup || '-'}</td>
                    <td>{billing.details || '-'}</td>
                    <td>{billing.defaultFee?.toFixed(2) || '0.00'}</td>
                    <td>{billing.sequenceNo || '-'}</td>
                    <td>{billing.visitType || '-'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={billing.isDefault || false}
                        disabled
                        style={{ cursor: 'not-allowed' }}
                      />
                    </td>
                    <td className="d-flex justify-content-center">
                      <div className="action-icons">
                        <div title="Edit" onClick={() => handleEdit(billing)}>
                          <Edit style={{ fontSize: '20px' }} />
                        </div>
                        <div title="Delete" onClick={() => handleDelete(billing)}>
                          <Delete style={{ fontSize: '20px' }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    {error ? 'Error loading billing details' : 'No billing details found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {filteredBillingDetails.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            <span>
              Showing {startIndex + 1} to {Math.min(endIndex, filteredBillingDetails.length)} of {filteredBillingDetails.length} billing details
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
              &lt;&lt;
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
              &gt;&gt;
            </button>
          </div>
        </div>
      )}

      {/* Add Billing Detail Popup */}
      <AddBillingDetailsPopup
        open={showAddPopup}
        onClose={handleCloseAddPopup}
        onSave={handleSaveBillingDetail}
        editData={editData ? {
          group: editData.group || '',
          subGroup: editData.subGroup || '',
          details: editData.details || '',
          defaultFee: editData.defaultFee?.toString() || '',
          sequenceNo: editData.sequenceNo?.toString() || '',
          visitType: editData.visitType || '',
          isDefault: editData.isDefault || false,
          lunch: editData.lunch || ''
        } : null}
        doctorId={selectedDoctorId || doctorId}
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
        title="Delete Billing Detail"
        message={
          <>
            Are you sure you want to delete the billing detail for <strong>{billingToDelete?.details}</strong>?
          </>
        }
        loading={isDeleting}
      />
    </div>
  );
}

