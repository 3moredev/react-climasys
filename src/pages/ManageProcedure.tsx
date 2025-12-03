import React, { useState, useEffect, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Edit, Delete, Search, Refresh } from "@mui/icons-material";
import AddProcedurePopup from "../components/AddProcedurePopup";
import procedureService, { ProcedureMaster } from "../services/procedureService";
import { doctorService, Doctor } from "../services/doctorService";
import { useSession } from "../store/hooks/useSession";

// Procedure type definition
type Procedure = {
  sr: number;
  procedureDescription: string;
  priority: string;
  findings?: Array<{ id: string; description: string }>;
};

export default function ManageProcedure() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [showAddPopup, setShowAddPopup] = useState<boolean>(false);
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState<boolean>(false);

  const { clinicId, doctorId: sessionDoctorId, userId } = useSession();

  // Load procedures from API
  const loadProcedures = useCallback(async (docId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const apiProcedures = await procedureService.getAllProceduresForDoctor(docId);
      
      // Transform API response to component format
      const transformedProcedures: Procedure[] = apiProcedures.map((proc, index) => ({
        sr: index + 1,
        procedureDescription: proc.procedureDescription,
        priority: proc.priorityValue?.toString() || "",
        findings: [] // Will be loaded separately if needed
      }));
      
      setProcedures(transformedProcedures);
    } catch (err: any) {
      console.error('Error loading procedures:', err);
      setError(err.message || 'Failed to load procedures');
      setProcedures([]);
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
      loadProcedures(selectedDoctorId);
    }
  }, [selectedDoctorId, loadProcedures]);

  // Filter procedures based on search term (client-side filtering for display)
  const filteredProcedures = procedures.filter(procedure => {
    if (!searchTerm.trim()) return true;
    const search = searchTerm.toLowerCase();
    return (
      procedure.procedureDescription.toLowerCase().includes(search) ||
      procedure.priority.toLowerCase().includes(search)
    );
  });

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredProcedures.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentProcedures = filteredProcedures.slice(startIndex, endIndex);
  const shouldEnableTableScroll = filteredProcedures.length > pageSize;

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
        const apiProcedures = await procedureService.searchProcedures(selectedDoctorId, searchTerm);
        
        // Transform API response to component format
        const transformedProcedures: Procedure[] = apiProcedures.map((proc, index) => ({
          sr: index + 1,
          procedureDescription: proc.procedureDescription,
          priority: proc.priorityValue?.toString() || "",
          findings: []
        }));
        
        setProcedures(transformedProcedures);
      } else {
        // If search term is empty, reload all procedures
        await loadProcedures(selectedDoctorId);
      }
    } catch (err: any) {
      console.error('Error searching procedures:', err);
      setError(err.message || 'Failed to search procedures');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setSearchTerm("");
    setCurrentPage(1);
    if (selectedDoctorId) {
      await loadProcedures(selectedDoctorId);
    } else {
      setError('Doctor ID not available');
    }
  };

  const handleAddNew = () => {
    setEditingProcedure(null);
    setShowAddPopup(true);
  };

  const handleCloseAddPopup = () => {
    setShowAddPopup(false);
    setEditingProcedure(null);
  };

  const handleSaveProcedure = async (data: {
    procedureDescription: string;
    priority: string;
    findings: Array<{ id: string; description: string }>;
  }) => {
    if (!selectedDoctorId) {
      setError('Doctor ID not available');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const clinic = clinicId || "CL-00001";
      
      const procedureData: ProcedureMaster = {
        procedureDescription: data.procedureDescription,
        doctorId: selectedDoctorId,
        clinicId: clinic,
        priorityValue: data.priority ? parseInt(data.priority) : null
      };

      if (editingProcedure) {
        // Update existing procedure
        await procedureService.updateProcedure(procedureData);
      } else {
        // Create new procedure
        await procedureService.createProcedure(procedureData);
      }
      
      // Reload procedures after save
      await loadProcedures(selectedDoctorId);
      
      setShowAddPopup(false);
      setEditingProcedure(null);
    } catch (err: any) {
      console.error('Error saving procedure:', err);
      setError(err.message || 'Failed to save procedure');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (procedure: Procedure) => {
    setEditingProcedure(procedure);
    setShowAddPopup(true);
  };

  const handleDelete = async (procedure: Procedure) => {
    if (!selectedDoctorId) {
      setError('Doctor ID not available');
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${procedure.procedureDescription}"?`)) {
      try {
        setLoading(true);
        setError(null);
        
        // Hardcoded clinicId fallback as requested
        const clinic = clinicId || "CL-00001";
        await procedureService.deleteProcedure(selectedDoctorId, clinic, procedure.procedureDescription);
        
        // Reload procedures after delete
        await loadProcedures(selectedDoctorId);
      } catch (err: any) {
        console.error('Error deleting procedure:', err);
        setError(err.message || 'Failed to delete procedure');
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Reset pagination when procedures change
  useEffect(() => {
    setCurrentPage(1);
  }, [procedures.length]);

  return (
    <div className="container-fluid" style={{ fontFamily: "'Roboto', sans-serif", padding: "20px" }}>
      <style>{`
        .procedures-table {
          width: 100%;
          border-collapse: collapse;
        }
        .procedures-table thead th {
          background-color: #1976d2;
          color: #ffffff;
          padding: 12px;
          text-align: left;
          font-weight: bold;
          font-size: 11px;
          font-family: 'Roboto', sans-serif;
          border: 1px solid #dee2e6;
        }
        .procedures-table tbody td {
          padding: 12px;
          border: 1px solid #dee2e6;
          font-size: 12px;
          font-family: 'Roboto', sans-serif;
          background-color: #ffffff;
        }
        .procedures-table tbody tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        .procedures-table tbody tr:nth-child(odd) {
          background-color: #ffffff;
        }
        .procedures-table tbody tr:hover {
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
        .search-section {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
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
        .btn-icon {
          background: #1976d2;
          border: none;
          cursor: pointer;
          color: #ffffff;
          padding: 4px;
          display: flex;
          align-items: center;
          transition: background-color 0.2s;
          border-radius: 6px;
          width: 32px;
          height: 32px;
        }
        .btn-icon:hover {
          background-color: #1565c0;
        }
        .provider-dropdown {
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 12px;
          font-family: 'Roboto', sans-serif;
          width: 250px;
          background-color: #fff;
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
        color: '#000000',
        marginBottom: '30px',
        marginTop: '0'
      }}>
        Manage Procedures
      </h1>

      {/* Error Message */}
      {error && (
        <div style={{
          padding: '12px',
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
          padding: '20px',
          textAlign: 'center',
          color: '#666',
          fontSize: '14px'
        }}>
          Loading procedures...
        </div>
      )}

      {/* Search and Action Section */}
      <div className="search-section">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Enter Procedure Description, Priority"
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

        <button className="btn-primary-custom" onClick={handleSearch}>
          <Search style={{ fontSize: '18px' }} />
          Search
        </button>

        <button className="btn-primary-custom" onClick={handleAddNew}>
          Add New Procedure
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
              className="provider-dropdown"
              value={selectedDoctorId}
              onChange={(e) => {
                const doctorIdValue = e.target.value;
                setSelectedDoctorId(doctorIdValue);
                setCurrentPage(1);
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

      {/* Procedures Table */}
      <div
        className="table-responsive"
        style={shouldEnableTableScroll ? { maxHeight: '510px', overflowY: 'auto' } : undefined}
      >
        <table className="procedures-table">
          <thead>
            <tr>
              <th style={{ width: '5%' }}>Sr.</th>
              <th style={{ width: '75%' }}>Procedure Description</th>
              <th style={{ width: '10%' }}>Priority</th>
              <th style={{ width: '10%' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentProcedures.length > 0 ? (
              currentProcedures.map((procedure) => (
                <tr key={procedure.sr}>
                  <td>{procedure.sr}</td>
                  <td>{procedure.procedureDescription}</td>
                  <td>{procedure.priority || ''}</td>
                  <td>
                    <div className="action-icons">
                      <div title="Edit" onClick={() => handleEdit(procedure)}>
                        <Edit style={{ fontSize: '20px' }} />
                      </div>
                      <div title="Delete" onClick={() => handleDelete(procedure)}>
                        <Delete style={{ fontSize: '20px' }} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  No procedures found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredProcedures.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            <span>
              Showing {startIndex + 1} to {Math.min(endIndex, filteredProcedures.length)} of {filteredProcedures.length} procedures
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

      {/* Add Procedure Popup */}
      <AddProcedurePopup
        open={showAddPopup}
        onClose={handleCloseAddPopup}
        onSave={handleSaveProcedure}
        editData={editingProcedure ? {
          procedureDescription: editingProcedure.procedureDescription,
          priority: editingProcedure.priority,
          findings: editingProcedure.findings || []
        } : undefined}
      />
    </div>
  );
}

