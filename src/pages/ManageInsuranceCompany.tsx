import React, { useState, useEffect, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Edit, Search, Refresh } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import { insuranceCompanyService, InsuranceCompany } from "../services/insuranceCompanyService";
import GlobalSnackbar from "../components/GlobalSnackbar";

export default function ManageInsuranceCompany() {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);

    // Data state
    const [insuranceCompanies, setInsuranceCompanies] = useState<InsuranceCompany[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Form state (for top add section)
    const [formData, setFormData] = useState<InsuranceCompany>({
        insuranceCompanyName: ""
    });
    const [editData, setEditData] = useState<InsuranceCompany | null>(null);

    // Snackbar state
    const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>('');

    // Filter insurance companies based on search term
    const filteredInsuranceCompanies = insuranceCompanies.filter(item => {
        if (!searchTerm.trim()) return true;
        const search = searchTerm.toLowerCase();
        return (
            item.insuranceCompanyName.toLowerCase().includes(search)
        );
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredInsuranceCompanies.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentInsuranceCompanies = filteredInsuranceCompanies.slice(startIndex, endIndex);

    const fetchInsuranceCompanies = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await insuranceCompanyService.getAllInsuranceCompanies();
            setInsuranceCompanies(data);
            setCurrentPage(1);
        } catch (err: any) {
            console.error('Error fetching insurance companies:', err);
            setError(err.response?.data?.error || err.message || 'Failed to fetch insurance companies');
            setInsuranceCompanies([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInsuranceCompanies();
    }, [fetchInsuranceCompanies]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setCurrentPage(1);
    };

    const handleSearch = () => {
        setCurrentPage(1);
    };

    const handleAddNew = () => {
        if (!formData.insuranceCompanyName.trim()) {
            setSnackbarMessage("Insurance Company name is required");
            setShowSnackbar(true);
            return;
        }

        const addInsuranceCompany = async () => {
            try {
                await insuranceCompanyService.createInsuranceCompany(formData);
                setSnackbarMessage("Insurance Company created successfully");
                setShowSnackbar(true);
                setFormData({ insuranceCompanyName: "" });
                setEditData(null);
                fetchInsuranceCompanies();
            } catch (err: any) {
                console.error('Error saving insurance company:', err);
                setSnackbarMessage(err.response?.data?.error || "Failed to save insurance company");
                setShowSnackbar(true);
            }
        };

        addInsuranceCompany();
    };

    const handleCancel = () => {
        setFormData({ insuranceCompanyName: "" });
        setEditData(null);
    };

    const handleEdit = (insuranceCompany: InsuranceCompany) => {
        setEditData(insuranceCompany);
        setFormData({ ...insuranceCompany });
        // Scroll to top to show the form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleUpdate = async () => {
        if (!formData.insuranceCompanyName.trim()) {
            setSnackbarMessage("Insurance Company name is required");
            setShowSnackbar(true);
            return;
        }

        if (!editData || !editData.id) return;

        try {
            await insuranceCompanyService.updateInsuranceCompany(editData.id, formData);
            setSnackbarMessage("Insurance Company updated successfully");
            setShowSnackbar(true);
            setFormData({ insuranceCompanyName: "" });
            setEditData(null);
            fetchInsuranceCompanies();
        } catch (err: any) {
            console.error('Error updating insurance company:', err);
            setSnackbarMessage(err.response?.data?.error || "Failed to update insurance company");
            setShowSnackbar(true);
        }
    };

    return (
        <div className="container-fluid" style={{ fontFamily: "'Roboto', sans-serif", padding: "20px" }}>
            <style>{`
        .insurance-table {
          width: 100%;
          border-collapse: collapse;
        }
        .insurance-table thead th {
          background-color: rgb(0, 123, 255);
          color: #ffffff;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          font-size: 0.9rem;
          border: 1px solid #dee2e6;
        }
        .insurance-table tbody td {
          padding: 12px;
          border: 1px solid #dee2e6;
          font-size: 0.9rem;
        }
        .insurance-table tbody tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        .insurance-table tbody tr:hover {
          background-color: #e9ecef;
        }
        .action-icons {
          display: flex;
          gap: 12px;
          align-items: center;
          justify-content: center;
        }
        .action-icons > div {
          cursor: pointer;
          color: #666;
          transition: color 0.2s;
        }
        .action-icons > div:hover {
          color: rgb(0, 123, 255);
        }
        .add-section {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        .add-section label {
          font-weight: bold;
          margin-bottom: 8px;
          display: block;
          color: #212121;
        }
        .add-section-input-group {
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }
        .add-section-input-wrapper {
          flex: 1;
        }
        .add-section-input-wrapper input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 0.9rem;
        }
        .btn-add {
          background-color: rgb(0, 123, 255);
          color: #ffffff;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          min-width: 150px;
        }
        .btn-cancel {
          background-color: #6c757d;
          color: #ffffff;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          min-width: 100px;
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
        }
        .btn-icon {
          background: rgb(0, 123, 255);
          border: none;
          cursor: pointer;
          color: #ffffff;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
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
            <h1 style={{ fontWeight: 'bold', fontSize: '1.8rem', color: '#212121', marginBottom: '24px' }}>
                Manage Insurance Company
            </h1>

            {/* Add/Edit Section */}
            <div className="add-section">
                <label>Insurance Company</label>
                <div className="add-section-input-group">
                    <div className="add-section-input-wrapper">
                        <input
                            type="text"
                            placeholder="Insurance Company"
                            value={formData.insuranceCompanyName}
                            onChange={(e) => setFormData({ ...formData, insuranceCompanyName: e.target.value })}
                        />
                    </div>
                    <button
                        className="btn-add"
                        onClick={editData ? handleUpdate : handleAddNew}
                    >
                        {editData ? "Update Insurance Company" : "Add Insurance Company"}
                    </button>
                    {editData && (
                        <button className="btn-cancel" onClick={handleCancel}>
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            {/* Search Section */}
            <div className="search-section">
                <div className="search-input-wrapper">
                    <input
                        type="text"
                        placeholder="Enter Insurance Company Name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Search className="search-icon" style={{ fontSize: '20px' }} />
                </div>

                <button className="btn-primary-custom" onClick={handleSearch}>
                    Search
                </button>

                <button className="btn-icon" onClick={fetchInsuranceCompanies} title="Refresh">
                    <Refresh style={{ fontSize: '20px' }} />
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div style={{ padding: '12px', marginBottom: '20px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px' }}>
                    {error}
                </div>
            )}

            {/* Insurance Company Table */}
            <div className="table-responsive" style={pageSize > 10 ? { maxHeight: '60vh', overflowY: 'auto' } : undefined}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <CircularProgress />
                        <p style={{ marginTop: '16px', color: '#666' }}>Loading insurance companies...</p>
                    </div>
                ) : (
                    <table className="insurance-table">
                        <thead>
                            <tr>
                                <th style={{ width: '10%' }}>Sr.</th>
                                <th style={{ width: '70%' }}>Insurance Company Name</th>
                                <th style={{ width: '20%' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentInsuranceCompanies.length > 0 ? (
                                currentInsuranceCompanies.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{startIndex + index + 1}</td>
                                        <td>{item.insuranceCompanyName}</td>
                                        <td>
                                            <div className="action-icons">
                                                <div title="Edit" onClick={() => handleEdit(item)}>
                                                    <Edit style={{ fontSize: '20px' }} />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                        {error ? 'Error loading data' : 'No insurance companies found'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {filteredInsuranceCompanies.length > 0 && (
                <div className="pagination-container">
                    <div className="pagination-info">
                        <span>
                            Showing {startIndex + 1} to {Math.min(endIndex, filteredInsuranceCompanies.length)} of {filteredInsuranceCompanies.length} insurance companies
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

            <GlobalSnackbar
                show={showSnackbar}
                message={snackbarMessage}
                onClose={() => setShowSnackbar(false)}
            />
        </div>
    );
}

