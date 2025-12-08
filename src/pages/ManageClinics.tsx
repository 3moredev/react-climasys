import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Edit, Delete, Search, Add, Download } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { clinicService, Clinic } from "../services/clinicService";

export default function ManageClinics() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Filter clinics based on search term
  const filteredClinics = clinics.filter(clinic => {
    if (!searchTerm.trim()) return true;
    const search = searchTerm.toLowerCase();
    return (
      clinic.name.toLowerCase().includes(search) ||
      clinic.city.toLowerCase().includes(search) ||
      clinic.phoneNo.includes(search) ||
      clinic.status.toLowerCase().includes(search)
    );
  });

  const navigate = useNavigate();

  const handleSearch = () => {
    // Search is handled by filtering the local state
    setCurrentPage(1); // Reset to first page on search
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleAddClinic = () => {
    navigate("/add-clinic");
  };

  const handleEdit = (clinic: Clinic) => {
    navigate("/add-clinic", { state: clinic });
  };

  const handleDelete = async (clinic: Clinic) => {
    if (!window.confirm(`Are you sure you want to delete the clinic "${clinic.name}"?`)) {
      return;
    }
    try {
      setLoading(true);
      await clinicService.deleteClinic(clinic.id);
      await fetchClinics();
    } catch (err: any) {
      console.error("Error deleting clinic:", err);
      setError(err.message || "Failed to delete clinic");
    } finally {
      setLoading(false);
    }
  };

  const fetchClinics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clinicService.getAllClinics();
      setClinics(data);
    } catch (err: any) {
      console.error("Error fetching clinics:", err);
      setError(err.message || "Failed to fetch clinics");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDownloadExcel = () => {
    const excelData = filteredClinics.map(clinic => ({
      "Clinic Name": clinic.name,
      "City": clinic.city,
      "Phone No": clinic.phoneNo,
      "Status": clinic.status,
      "Since": clinic.since,
      "License Till": clinic.licenseTill
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Auto-size columns
    const maxWidth = (rows: any[], key: string) => {
      return Math.max(
        key.length,
        ...rows.map(row => (row[key] ? row[key].toString().length : 0))
      );
    };

    const wscols = [
      { wch: maxWidth(excelData, "Clinic Name") + 2 },
      { wch: maxWidth(excelData, "City") + 2 },
      { wch: maxWidth(excelData, "Phone No") + 2 },
      { wch: maxWidth(excelData, "Status") + 2 },
      { wch: maxWidth(excelData, "Since") + 2 },
      { wch: maxWidth(excelData, "License Till") + 2 }
    ];

    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clinics");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, "clinics.xlsx");
  };

  useEffect(() => {
    fetchClinics();
  }, [fetchClinics]);

  return (
    <div className="container-fluid" style={{ fontFamily: "'Roboto', sans-serif", padding: "20px" }}>
      <style>{`
        .clinics-table {
          width: 100%;
          border-collapse: collapse;
        }
        .clinics-table thead th {
          background-color: rgb(0, 123, 255);
          color: #ffffff;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          font-size: 0.9rem;
          border: 1px solid #dee2e6;
        }
        .clinics-table tbody td {
          padding: 12px;
          border: 1px solid #dee2e6;
          font-size: 0.9rem;
          vertical-align: middle;
        }
        .clinics-table tbody tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        .clinics-table tbody tr:nth-child(odd) {
          background-color: #ffffff;
        }
        .clinics-table tbody tr:hover {
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
      <h1 className="header-title">
        Manage Clinic
      </h1>

      {/* Search and Action Section */}
      <div className="search-section">
        <label style={{ fontWeight: 500, marginRight: '8px' }}>Search</label>
        <div className="search-input-wrapper">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search change
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <Search className="search-icon" style={{ fontSize: '20px' }} />
        </div>

        <button className="btn-primary-custom" onClick={handleSearch}>
          Search
        </button>

        <button className="btn-primary-custom" onClick={handleAddClinic}>
          Add Clinic
        </button>

        <button className="btn-icon" title="Download" onClick={handleDownloadExcel}>
          <Download style={{ fontSize: '24px' }} />
        </button>
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

      {/* Clinics Table */}
      <div className="table-responsive">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <CircularProgress style={{ color: 'rgb(0, 123, 255)' }} />
            <p style={{ marginTop: '16px', color: '#666' }}>Loading clinics...</p>
          </div>
        ) : (
          <table className="clinics-table">
            <thead>
              <tr>
                <th style={{ width: '20%' }}>Clinic Name</th>
                <th style={{ width: '15%' }}>City</th>
                <th style={{ width: '15%' }}>Phone No</th>
                <th style={{ width: '10%' }}>Status</th>
                <th style={{ width: '15%' }}>Since</th>
                <th style={{ width: '15%' }}>License Till</th>
                <th className='center-text' style={{ width: '10%', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredClinics.slice((currentPage - 1) * pageSize, currentPage * pageSize).length > 0 ? (
                filteredClinics.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((clinic) => (
                  <tr key={clinic.id}>
                    <td>{clinic.name}</td>
                    <td>{clinic.city}</td>
                    <td>{clinic.phoneNo}</td>
                    <td>{clinic.status}</td>
                    <td>{clinic.since}</td>
                    <td>{clinic.licenseTill}</td>
                    <td>
                      <div className="action-icons">
                        <div title="Edit" onClick={() => handleEdit(clinic)}>
                          <Edit style={{ fontSize: '20px' }} />
                        </div>
                        <div title="Delete" onClick={() => handleDelete(clinic)}>
                          <Delete style={{ fontSize: '20px' }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    {error ? 'Error loading clinics' : 'No clinics found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {filteredClinics.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            <span>
              Showing {currentPage * pageSize - pageSize + 1} to {Math.min(currentPage * pageSize, filteredClinics.length)} of {filteredClinics.length} clinics
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
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            {Array.from({ length: Math.ceil(filteredClinics.length / pageSize) }, (_, i) => i + 1).map((page) => {
              if (
                page === 1 ||
                page === Math.ceil(filteredClinics.length / pageSize) ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    className={`page-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
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
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === Math.ceil(filteredClinics.length / pageSize)}
            >
              Next
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
