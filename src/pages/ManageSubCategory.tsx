import React, { useState, useEffect, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Edit, Delete, Search, Refresh, Add, Close } from "@mui/icons-material";
import { CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, IconButton } from "@mui/material";
import { subCategoryService, SubCategory } from "../services/subCategoryService";
import GlobalSnackbar from "../components/GlobalSnackbar";

export default function ManageSubCategory() {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);

    // Data state
    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Popup state
    const [showAddPopup, setShowAddPopup] = useState<boolean>(false);
    const [editData, setEditData] = useState<SubCategory | null>(null);
    const [formData, setFormData] = useState<SubCategory>({
        chargesSubCategory: "",
        sortOrder: 0
    });

    // Snackbar state
    const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>('');

    // Filter sub categories based on search term
    const filteredSubCategories = subCategories.filter(item => {
        if (!searchTerm.trim()) return true;
        const search = searchTerm.toLowerCase();
        return (
            item.chargesSubCategory.toLowerCase().includes(search)
        );
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredSubCategories.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentSubCategories = filteredSubCategories.slice(startIndex, endIndex);

    const fetchSubCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await subCategoryService.getAllSubCategories();
            setSubCategories(data);
            setCurrentPage(1);
        } catch (err: any) {
            console.error('Error fetching sub categories:', err);
            setError(err.response?.data?.error || err.message || 'Failed to fetch sub categories');
            setSubCategories([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSubCategories();
    }, [fetchSubCategories]);

    const handleSearch = () => {
        setCurrentPage(1);
    };

    const handleAddNew = () => {
        setEditData(null);
        setFormData({
            chargesSubCategory: "",
            sortOrder: 0
        });
        setShowAddPopup(true);
    };

    const handleEdit = (subCategory: SubCategory) => {
        setEditData(subCategory);
        setFormData({ ...subCategory });
        setShowAddPopup(true);
    };

    const handleClosePopup = () => {
        setShowAddPopup(false);
        setEditData(null);
    };

    const handleClear = () => {
        setFormData({
            chargesSubCategory: "",
            sortOrder: 0
        });
    };

    const handleSave = async () => {
        if (!formData.chargesSubCategory.trim()) {
            setSnackbarMessage("Charges SubCategory is required");
            setShowSnackbar(true);
            return;
        }

        try {
            if (editData && editData.id) {
                await subCategoryService.updateSubCategory(editData.id, formData);
                setSnackbarMessage("Sub Category updated successfully");
            } else {
                await subCategoryService.createSubCategory(formData);
                setSnackbarMessage("Sub Category created successfully");
            }
            setShowSnackbar(true);
            handleClosePopup();
            fetchSubCategories();
        } catch (err: any) {
            console.error('Error saving sub category:', err);
            setSnackbarMessage(err.response?.data?.error || "Failed to save sub category");
            setShowSnackbar(true);
        }
    };

    const handleDelete = async (subCategory: SubCategory) => {
        if (!subCategory.id) return;
        if (!window.confirm(`Are you sure you want to delete "${subCategory.chargesSubCategory}"?`)) {
            return;
        }

        try {
            await subCategoryService.deleteSubCategory(subCategory.id);
            setSnackbarMessage("Sub Category deleted successfully");
            setShowSnackbar(true);
            fetchSubCategories();
        } catch (err: any) {
            console.error('Error deleting sub category:', err);
            setSnackbarMessage(err.response?.data?.error || "Failed to delete sub category");
            setShowSnackbar(true);
        }
    };

    return (
        <div className="container-fluid" style={{ fontFamily: "'Roboto', sans-serif", padding: "20px" }}>
            <style>{`
        .subcategory-table {
          width: 100%;
          border-collapse: collapse;
        }
        .subcategory-table thead th {
          background-color: rgb(0, 123, 255);
          color: #ffffff;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          font-size: 0.9rem;
          border: 1px solid #dee2e6;
        }
        .subcategory-table thead th:nth-child(3) {
          text-align: center;
        }
        .subcategory-table tbody td {
          padding: 12px;
          border: 1px solid #dee2e6;
          font-size: 0.9rem;
        }
        .subcategory-table tbody td:nth-child(3) {
          text-align: center;
        }
        .subcategory-table tbody tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        .subcategory-table tbody tr:hover {
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
        .pagination-controls {
          display: flex;
          gap: 8px;
        }
        .page-btn {
          padding: 6px 12px;
          border: 1px solid #ddd;
          background: #fff;
          cursor: pointer;
          border-radius: 4px;
        }
        .page-btn.active {
          background: #007bff;
          color: white;
          border-color: #007bff;
        }
        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>

            {/* Page Title */}
            <h1 style={{ fontWeight: 'bold', fontSize: '1.8rem', color: '#212121', marginBottom: '24px' }}>
                Manage Sub-Category
            </h1>

            {/* Search and Action Section */}
            <div className="search-section">
                <div className="search-input-wrapper">
                    <input
                        type="text"
                        placeholder="Enter Sub-Category"
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
                    Add New
                </button>

                <button className="btn-icon" onClick={fetchSubCategories} title="Refresh">
                    <Refresh style={{ fontSize: '20px' }} />
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div style={{ padding: '12px', marginBottom: '20px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px' }}>
                    {error}
                </div>
            )}

            {/* Sub Category Table */}
            <div className="table-responsive" style={pageSize > 10 ? { maxHeight: '60vh', overflowY: 'auto' } : undefined}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <CircularProgress />
                        <p style={{ marginTop: '16px', color: '#666' }}>Loading sub categories...</p>
                    </div>
                ) : (
                    <table className="subcategory-table">
                        <thead>
                            <tr>
                                <th style={{ width: '5%' }}>Sr.</th>
                                <th style={{ width: '40%' }}>Charges Sub Category</th>
                                <th style={{ width: '20%' }}>Sort Order</th>
                                <th style={{ width: '15%' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentSubCategories.length > 0 ? (
                                currentSubCategories.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{startIndex + index + 1}</td>
                                        <td>{item.chargesSubCategory}</td>
                                        <td>{item.sortOrder}</td>
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
                                    <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                        {error ? 'Error loading data' : 'No sub categories found'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {filteredSubCategories.length > 0 && (
                <div className="pagination-container">
                    <div>
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredSubCategories.length)} of {filteredSubCategories.length} entries
                    </div>
                    <div className="pagination-controls">
                        <button
                            className="page-btn"
                            onClick={() => setCurrentPage(c => Math.max(1, c - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <button
                            className="page-btn"
                            onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}
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
                    <span>{editData ? 'Edit Sub-Category' : 'Add Sub-Category'}</span>
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
                                label="Charges SubCategory"
                                value={formData.chargesSubCategory}
                                onChange={(e) => setFormData({ ...formData, chargesSubCategory: e.target.value })}
                                fullWidth
                                required
                                variant="outlined"
                                placeholder="Charges SubCategory"
                                InputLabelProps={{
                                    style: { color: '#000', fontWeight: 'bold' },
                                    shrink: true
                                }}
                                inputProps={{
                                    style: { textAlign: 'left', padding: '8px 12px' }
                                }}
                            />
                        </div>
                        <div className="modal-textfield">
                            <TextField
                                label="Sort Order"
                                value={formData.sortOrder || ''}
                                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                                fullWidth
                                variant="outlined"
                                type="number"
                                placeholder="Sort Order"
                                InputLabelProps={{
                                    style: { color: '#000', fontWeight: 'bold' },
                                    shrink: true
                                }}
                                inputProps={{
                                    style: { textAlign: 'left', padding: '8px 12px' }
                                }}
                            />
                        </div>
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
                    <Button
                        onClick={handleClear}
                        variant="contained"
                        style={{ backgroundColor: '#5a9', textTransform: 'none', minWidth: '80px' }}
                    >
                        Clear
                    </Button>
                    <Button
                        onClick={handleClosePopup}
                        variant="contained"
                        style={{ backgroundColor: '#007bff', textTransform: 'none', minWidth: '80px' }}
                    >
                        Back
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

