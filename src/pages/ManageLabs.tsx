import React, { useState, useEffect, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Edit, Delete, Search, Refresh, Add } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import { labService, LabTestApiResponse } from "../services/labService";
import { doctorService, Doctor } from "../services/doctorService";
import { useSession } from "../store/hooks/useSession";
import AddLabTestPopup from "../components/AddLabTestPopup";

// Lab Test type definition
type LabTest = {
  sr: number;
  labTestName: string;
  priority: number;
};

export default function ManageLabs() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const { clinicId, doctorId, userId } = useSession();
  
  // Dynamic data from API
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState<boolean>(false);
  const [showAddPopup, setShowAddPopup] = useState<boolean>(false);
  const [editData, setEditData] = useState<LabTest | null>(null);

  // Filter lab tests based on search term
  const filteredLabTests = labTests.filter(labTest => {
    if (!searchTerm.trim()) return true;
    const search = searchTerm.toLowerCase();
    return (
      labTest.labTestName.toLowerCase().includes(search) ||
      labTest.priority.toString().includes(search)
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredLabTests.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentLabTests = filteredLabTests.slice(startIndex, endIndex);

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

  const handleSaveLabTest = async (data: {
    labTestName: string;
    priority: string;
  }) => {
    if (!clinicId) {
      setError('Clinic ID is required');
      return;
    }

    // Use selectedDoctorId if available, otherwise fall back to doctorId from session
    const doctorIdToUse = selectedDoctorId || doctorId;
    if (!doctorIdToUse) {
      setError('Doctor ID is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Prepare lab test data for API
      const labTestData = {
        labTestName: data.labTestName,
        Lab_Test_Description: data.labTestName,
        priority: data.priority ? parseInt(data.priority, 10) : 0,
        priorityValue: data.priority ? parseInt(data.priority, 10) : 0,
        Priority_Value: data.priority ? parseInt(data.priority, 10) : 0,
        doctorId: doctorIdToUse,
        doctor_id: doctorIdToUse,
        clinicId: clinicId,
        clinic_id: clinicId
      };
      
      if (editData) {
        // Update existing lab test
        console.log('Updating lab test:', labTestData);
        await labService.updateLabTest(doctorIdToUse, clinicId, editData.labTestName, labTestData);
        console.log('Lab test updated successfully');
      } else {
        // Create new lab test
        console.log('Creating lab test:', labTestData);
        await labService.createLabTest(labTestData);
        console.log('Lab test created successfully');
      }
      
      // Close popup and clear edit data
      setShowAddPopup(false);
      setEditData(null);
      
      // Refresh lab tests list
      await fetchLabTests(doctorIdToUse);
    } catch (err: any) {
      console.error('Error saving lab test:', err);
      setError(err.message || (editData ? 'Failed to update lab test' : 'Failed to create lab test'));
      // Keep popup open on error so user can retry
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (labTest: LabTest) => {
    setEditData(labTest);
    setShowAddPopup(true);
  };

  const handleDelete = async (labTest: LabTest) => {
    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete the lab test "${labTest.labTestName}"?`)) {
      return;
    }

    if (!clinicId) {
      setError('Clinic ID is required to delete lab test');
      return;
    }

    // Use selectedDoctorId if available, otherwise fall back to doctorId from session
    const doctorIdToUse = selectedDoctorId || doctorId;
    if (!doctorIdToUse) {
      setError('Doctor ID is required to delete lab test');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Deleting lab test:', labTest.labTestName, 'for doctor:', doctorIdToUse, 'and clinic:', clinicId);
      await labService.deleteLabTest(doctorIdToUse, clinicId, labTest.labTestName);
      
      // Refresh the lab tests list after successful deletion
      await fetchLabTests(doctorIdToUse);
      
      // Show success message (optional - you can remove this if you prefer)
      console.log('Lab test deleted successfully');
    } catch (err: any) {
      console.error('Error deleting lab test:', err);
      setError(err.message || 'Failed to delete lab test');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setCurrentPage(1);
    fetchLabTests();
  };

  // Fetch lab tests from API
  const fetchLabTests = useCallback(async (doctorIdToFetch?: string) => {
    setLoading(true);
    setError(null);

    try {
      // Use provided doctorId, then selectedDoctorId, then fall back to doctorId from session
      const doctorIdToUse = doctorIdToFetch || selectedDoctorId || doctorId;
      if (!doctorIdToUse) {
        setError('Doctor ID is required to fetch lab tests');
        setLoading(false);
        return;
      }
      
      console.log('Fetching lab tests for doctor:', doctorIdToUse);
      const response = await labService.getAllLabTestsForDoctor(doctorIdToUse);
      
      // Map API response to LabTest type
      const mappedLabTests: LabTest[] = response.map((item: LabTestApiResponse, index: number) => ({
        sr: index + 1,
        labTestName: item.labTestName || item.Lab_Test_Description || '',
        priority: item.priorityValue || item.Priority_Value || 0
      }));

      setLabTests(mappedLabTests);
      setCurrentPage(1); // Reset to first page when new data is loaded
    } catch (err: any) {
      console.error('Error fetching lab tests:', err);
      setError(err.message || 'Failed to fetch lab tests');
      setLabTests([]); // Clear lab tests on error
    } finally {
      setLoading(false);
    }
  }, [selectedDoctorId, doctorId]);

  // Fetch doctors for the clinic
  const fetchDoctors = useCallback(async () => {
    if (!clinicId) {
      console.warn('ClinicId not available, skipping doctors fetch');
      return;
    }

    setLoadingDoctors(true);
    try {
      console.log('Fetching doctors for clinic:', clinicId);
      const allDoctors = await doctorService.getAllDoctors();
      
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

  // Fetch lab tests when component mounts or when selectedDoctorId changes
  useEffect(() => {
    if (selectedDoctorId) {
      fetchLabTests();
    } else if (!selectedDoctorId && doctorId) {
      // If no doctor is selected but we have a session doctorId, use that
      fetchLabTests();
    }
  }, [selectedDoctorId, fetchLabTests, doctorId]);

  return (
    <div className="container-fluid" style={{ fontFamily: "'Roboto', sans-serif", padding: "20px" }}>
      <style>{`
        .lab-tests-table {
          width: 100%;
          border-collapse: collapse;
        }
        .lab-tests-table thead th {
          background-color: rgb(0, 123, 255);
          color: #ffffff;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          font-size: 0.9rem;
          border: 1px solid #dee2e6;
        }
        .lab-tests-table tbody td {
          padding: 12px;
          border: 1px solid #dee2e6;
          font-size: 0.9rem;
        }
        .lab-tests-table tbody tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        .lab-tests-table tbody tr:nth-child(odd) {
          background-color: #ffffff;
        }
        .lab-tests-table tbody tr:hover {
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
        Manage Labs
      </h1>

      {/* Search and Action Section */}
      <div className="search-section">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search Lab Test"
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

        <button className="btn-primary-custom " onClick={handleAddNew}>
          <label>Add New Lab Test</label>
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
                
                // Immediately fetch lab tests for the selected doctor
                if (doctorIdValue) {
                  await fetchLabTests(doctorIdValue);
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

      {/* Lab Tests Table */}
      <div className="table-responsive">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <CircularProgress style={{ color: 'rgb(0, 123, 255)' }} />
            <p style={{ marginTop: '16px', color: '#666' }}>Loading lab tests...</p>
          </div>
        ) : (
          <table className="lab-tests-table">
            <thead>
              <tr>
                <th style={{ width: '5%' }}>Sr.</th>
                <th style={{ width: '60%' }}>Lab Test Name</th>
                <th style={{ width: '10%' }}>Priority</th>
                <th style={{ width: '15%' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentLabTests.length > 0 ? (
                currentLabTests.map((labTest) => (
                  <tr key={labTest.sr}>
                    <td>{labTest.sr}</td>
                    <td>{labTest.labTestName}</td>
                    <td>{labTest.priority}</td>
                    <td>
                      <div className="action-icons">
                        <div title="Edit" onClick={() => handleEdit(labTest)}>
                          <Edit style={{ fontSize: '20px' }} />
                        </div>
                        <div title="Delete" onClick={() => handleDelete(labTest)}>
                          <Delete style={{ fontSize: '20px' }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    {error ? 'Error loading lab tests' : 'No lab tests found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {filteredLabTests.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            <span>
              Showing {startIndex + 1} to {Math.min(endIndex, filteredLabTests.length)} of {filteredLabTests.length} lab tests
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

      {/* Add Lab Test Popup */}
      <AddLabTestPopup
        open={showAddPopup}
        onClose={handleCloseAddPopup}
        onSave={handleSaveLabTest}
        editData={editData ? {
          labTestName: editData.labTestName,
          priority: editData.priority
        } : null}
      />
    </div>
  );
}

