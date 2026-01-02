import React, { useState, useEffect, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Edit, Delete, Search, Refresh, Add, Close } from "@mui/icons-material";
import { CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControlLabel, Checkbox, IconButton, InputLabel, FormControl } from "@mui/material";
import { keywordService, Keyword } from "../services/keywordService";
import GlobalSnackbar from "../components/GlobalSnackbar";

export default function ManageKeyword() {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);

    // Data state
    const [keywords, setKeywords] = useState<Keyword[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Popup state
    const [showAddPopup, setShowAddPopup] = useState<boolean>(false);
    const [editData, setEditData] = useState<Keyword | null>(null);
    const [formData, setFormData] = useState<Keyword>({
        keyword: "",
        description: "",
        isActive: true
    });

    // Snackbar state
    const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>('');

    // Filter keywords based on search term
    const filteredKeywords = keywords.filter(item => {
        if (!searchTerm.trim()) return true;
        const search = searchTerm.toLowerCase();
        return (
            item.keyword.toLowerCase().includes(search) ||
            (item.description && item.description.toLowerCase().includes(search))
        );
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredKeywords.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentKeywords = filteredKeywords.slice(startIndex, endIndex);

    const fetchKeywords = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await keywordService.getAllKeywords();
            setKeywords(data);
            setCurrentPage(1);
        } catch (err: any) {
            console.error('Error fetching keywords:', err);
            setError(err.response?.data?.error || err.message || 'Failed to fetch keywords');
            setKeywords([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchKeywords();
    }, [fetchKeywords]);

    const handleSearch = () => {
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setCurrentPage(1);
    };

    const handleAddNew = () => {
        setEditData(null);
        setFormData({
            keyword: "",
            description: "",
            isActive: true
        });
        setShowAddPopup(true);
    };

    const handleEdit = (keyword: Keyword) => {
        setEditData(keyword);
        setFormData({ ...keyword });
        setShowAddPopup(true);
    };

    const handleClosePopup = () => {
        setShowAddPopup(false);
        setEditData(null);
    };

    const handleSave = async () => {
        if (!formData.keyword.trim()) {
            setSnackbarMessage("Keyword is required");
            setShowSnackbar(true);
            return;
        }

        try {
            if (editData && editData.id) {
                await keywordService.updateKeyword(editData.id, formData);
                setSnackbarMessage("Keyword updated successfully");
            } else {
                await keywordService.createKeyword(formData);
                setSnackbarMessage("Keyword created successfully");
            }
            setShowSnackbar(true);
            handleClosePopup();
            fetchKeywords();
        } catch (err: any) {
            console.error('Error saving keyword:', err);
            setSnackbarMessage(err.response?.data?.error || "Failed to save keyword");
            setShowSnackbar(true);
        }
    };

    const handleDelete = async (keyword: Keyword) => {
        if (!keyword.id) return;
        if (!window.confirm(`Are you sure you want to delete "${keyword.keyword}"?`)) {
            return;
        }

        try {
            await keywordService.deleteKeyword(keyword.id);
            setSnackbarMessage("Keyword deleted successfully");
            setShowSnackbar(true);
            fetchKeywords();
        } catch (err: any) {
            console.error('Error deleting keyword:', err);
            setSnackbarMessage(err.response?.data?.error || "Failed to delete keyword");
            setShowSnackbar(true);
        }
    };

    const handleRefresh = () => {
        setSearchTerm("");
        setCurrentPage(1);
        fetchKeywords();
    };

    return (
        <div className="container-fluid" style={{ fontFamily: "'Roboto', sans-serif", padding: "20px" }}>
            <style>{`
        .keyword-table {
          width: 100%;
          border-collapse: collapse;
        }
        .keyword-table thead th {
          background-color: rgb(0, 123, 255);
          color: #ffffff;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          font-size: 0.9rem;
          border: 1px solid #dee2e6;
        }
        .keyword-table tbody td {
          padding: 12px;
          border: 1px solid #dee2e6;
          font-size: 0.9rem;
        }
        .keyword-table tbody tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        .keyword-table tbody tr:hover {
          background-color: #e9ecef;
        }
        .action-icons {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .action-icons > div {
          cursor: pointer;
          color: #666;
          transition: color 0.2s;
        }
        .action-icons > div:hover {
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
                Manage Keyword
            </h1>

            {/* Search and Action Section */}
            <div className="search-section">
                <div className="search-input-wrapper">
                    <input
                        type="text"
                        placeholder="Enter Keyword (Operation) / Keyword Description"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Search className="search-icon" style={{ fontSize: '20px' }} />
                </div>

                <button className="btn-primary-custom" onClick={handleSearch}>
                    Search
                </button>

                <button className="btn-primary-custom" onClick={handleAddNew}>
                    Add New Keyword
                </button>

                <button className="btn-icon" onClick={handleRefresh} title="Refresh">
                    <Refresh style={{ fontSize: '20px' }} />
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div style={{ padding: '12px', marginBottom: '20px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px' }}>
                    {error}
                </div>
            )}

            {/* Keyword Table */}
            <div className="table-responsive" style={pageSize > 10 ? { maxHeight: '60vh', overflowY: 'auto' } : undefined}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <CircularProgress />
                        <p style={{ marginTop: '16px', color: '#666' }}>Loading keywords...</p>
                    </div>
                ) : (
                    <table className="keyword-table">
                        <thead>
                            <tr>
                                <th style={{ width: '5%' }}>Sr.</th>
                                <th style={{ width: '30%' }}>Keyword (Operation)</th>
                                <th style={{ width: '40%' }}>Keyword Description</th>
                                <th style={{ width: '15%' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentKeywords.length > 0 ? (
                                currentKeywords.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{startIndex + index + 1}</td>
                                        <td>{item.keyword}</td>
                                        <td>{item.description}</td>
                                        <td>
                                            <div className="action-icons">
                                                <div title="Edit" onClick={() => handleEdit(item)}>
                                                    <Edit style={{ fontSize: '20px' }} />
                                                </div>
                                                <div title="Delete" onClick={() => handleDelete(item)}>
                                                    <Delete style={{ fontSize: '20px' }} />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                        {error ? 'Error loading data' : 'No keywords found'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {filteredKeywords.length > 0 && (
                <div className="pagination-container">
                    <div className="pagination-info">
                        <span>
                            Showing {startIndex + 1} to {Math.min(endIndex, filteredKeywords.length)} of {filteredKeywords.length} keywords
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

            {/* Add/Edit Dialog */}
            <Dialog open={showAddPopup} onClose={handleClosePopup} maxWidth="sm" fullWidth>
                <DialogTitle style={{
                    fontWeight: 'bold',
                    fontSize: '1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px 24px'
                }}>
                    <span>{editData ? 'Edit Keyword (Operation)' : 'Add Keyword (Operation)'}</span>
                    <IconButton
                        onClick={handleClosePopup}
                        size="small"
                        style={{
                            backgroundColor: '#007bff',
                            color: '#ffffff',
                            padding: '4px',
                            minWidth: '32px',
                            width: '32px',
                            height: '32px'
                        }}
                    >
                        <Close style={{ fontSize: '20px' }} />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers style={{ padding: '24px' }}>
                    <style>{`
                        .MuiInputLabel-root {
                            color: #666 !important;
                        }
                        .MuiInputLabel-asterisk {
                            color: red !important;
                        }
                        .modal-textfield .MuiOutlinedInput-input {
                            padding: 8px 12px !important;
                            text-align: left !important;
                        }
                        .modal-textfield .MuiInputLabel-root {
                            position: static !important;
                            transform: none !important;
                            margin-bottom: 8px !important;
                            font-weight: bold !important;
                            color: #000 !important;
                        }
                        .modal-textfield .MuiOutlinedInput-root {
                            margin-top: 0 !important;
                        }
                    `}</style>
                    <div className="d-flex flex-column gap-3">
                        <div className="modal-textfield">
                            <TextField
                                label="Keyword (Operation)"
                                value={formData.keyword}
                                onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                                fullWidth
                                required
                                variant="outlined"
                                placeholder="Keyword (Operation)"
                                InputLabelProps={{
                                    style: { color: '#000', fontWeight: 'bold' },
                                    shrink: true
                                }}
                                InputProps={{
                                    notched: false
                                }}
                                inputProps={{
                                    style: { textAlign: 'left', padding: '8px 12px' }
                                }}
                            />
                        </div>
                        <div className="modal-textfield">
                            <TextField
                                label="Keyword Description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                fullWidth
                                variant="outlined"
                                placeholder="Keyword Description"
                                InputLabelProps={{
                                    style: { color: '#000', fontWeight: 'bold' },
                                    shrink: true
                                }}
                                InputProps={{
                                    notched: false
                                }}
                                inputProps={{
                                    style: { textAlign: 'left', padding: '8px 12px' }
                                }}
                            />
                        </div>
                        {/* Status is always active implicitly based on design, or we can keep it hidden/default */}
                    </div>
                </DialogContent>
                <DialogActions style={{ padding: '16px 24px', justifyContent: 'flex-end', gap: '8px' }}>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        style={{ backgroundColor: '#007bff', textTransform: 'none', minWidth: '80px' }}
                    >
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>

            <GlobalSnackbar
                show={showSnackbar}
                message={snackbarMessage}
                onClose={() => setShowSnackbar(false)}
            />
        </div>
    );
}
