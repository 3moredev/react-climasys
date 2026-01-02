import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Edit, Delete, Search, Refresh } from "@mui/icons-material";
import { CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, IconButton, MenuItem } from "@mui/material";
import { Close } from "@mui/icons-material";
import GlobalSnackbar from "../components/GlobalSnackbar";

// Charge type definition
type Charge = {
    id: number;
    chargesCategory: string;
    chargesSubCategory: string;
    calculationType: string;
    sortOrder: number;
    comments: string;
    advance: number;
};

// Static data
const STATIC_CHARGES: Charge[] = [
    { id: 1, chargesCategory: "DR MRUNMAYA PANDA (GASTRO)", chargesSubCategory: "FEES", calculationType: "Units", sortOrder: 1, comments: "", advance: 1200.00 },
    { id: 2, chargesCategory: "Dr Naresh Rao (Urologist)", chargesSubCategory: "FEES", calculationType: "Units", sortOrder: 1, comments: "", advance: 1200.00 },
    { id: 3, chargesCategory: "Dr Nemade (Gastroenterology)", chargesSubCategory: "FEES", calculationType: "Units", sortOrder: 1, comments: "", advance: 800.00 },
    { id: 4, chargesCategory: "DR NITIN GANDHI (SURGEON)", chargesSubCategory: "FEES", calculationType: "Units", sortOrder: 1, comments: "", advance: 500.00 },
    { id: 5, chargesCategory: "Dr PRAAKASH KULKARNI (ENT)", chargesSubCategory: "FEES", calculationType: "Units", sortOrder: 1, comments: "", advance: 1200.00 },
    { id: 6, chargesCategory: "DR PRASHANT KAMAT (PHYSIO)", chargesSubCategory: "FEES", calculationType: "Units", sortOrder: 1, comments: "", advance: 1200.00 },
    { id: 7, chargesCategory: "Dr Ranjit More (Cardio)", chargesSubCategory: "FEES", calculationType: "Units", sortOrder: 1, comments: "", advance: 800.00 },
    { id: 8, chargesCategory: "DR SACHIN HUNDEKAR (CARDIO)", chargesSubCategory: "FEES", calculationType: "Units", sortOrder: 1, comments: "", advance: 500.00 },
    { id: 9, chargesCategory: "Lab Test - Blood Count", chargesSubCategory: "LABORATORY", calculationType: "Units", sortOrder: 2, comments: "Complete Blood Count", advance: 350.00 },
    { id: 10, chargesCategory: "X-Ray Chest PA View", chargesSubCategory: "RADIOLOGY", calculationType: "Units", sortOrder: 3, comments: "", advance: 450.00 },
    { id: 11, chargesCategory: "ECG 12 Lead", chargesSubCategory: "DIAGNOSTIC", calculationType: "Units", sortOrder: 4, comments: "", advance: 200.00 },
    { id: 12, chargesCategory: "ICU Per Day Charges", chargesSubCategory: "ROOM CHARGES", calculationType: "Days", sortOrder: 5, comments: "", advance: 3500.00 },
];

export default function ManageCharges() {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [charges, setCharges] = useState<Charge[]>(STATIC_CHARGES);
    const [loading, setLoading] = useState<boolean>(false);

    // Popup state
    const [showAddPopup, setShowAddPopup] = useState<boolean>(false);
    const [editData, setEditData] = useState<Charge | null>(null);
    const [formData, setFormData] = useState<Charge>({
        id: 0,
        chargesCategory: "",
        chargesSubCategory: "",
        calculationType: "Units",
        sortOrder: 1,
        comments: "",
        advance: 0
    });

    // Snackbar state
    const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>('');

    // Filter charges based on search term
    const filteredCharges = charges.filter(charge => {
        if (!searchTerm.trim()) return true;
        const search = searchTerm.toLowerCase();
        return (
            charge.chargesCategory.toLowerCase().includes(search) ||
            charge.chargesSubCategory.toLowerCase().includes(search) ||
            charge.comments.toLowerCase().includes(search) ||
            charge.advance.toString().includes(search)
        );
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredCharges.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentCharges = filteredCharges.slice(startIndex, endIndex);

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
        setEditData(null);
        setFormData({
            id: 0,
            chargesCategory: "",
            chargesSubCategory: "",
            calculationType: "Units",
            sortOrder: 1,
            comments: "",
            advance: 0
        });
        setShowAddPopup(true);
    };

    const handleEdit = (charge: Charge) => {
        setEditData(charge);
        setFormData({ ...charge });
        setShowAddPopup(true);
    };

    const handleClosePopup = () => {
        setShowAddPopup(false);
        setEditData(null);
    };

    const handleClear = () => {
        setFormData({
            id: 0,
            chargesCategory: "",
            chargesSubCategory: "",
            calculationType: "Units",
            sortOrder: 1,
            comments: "",
            advance: 0
        });
    };

    const handleSave = () => {
        if (!formData.chargesCategory.trim() || !formData.chargesSubCategory.trim()) {
            setSnackbarMessage("Charges Category and Sub-Category are required");
            setShowSnackbar(true);
            return;
        }

        if (editData && editData.id) {
            // Update existing charge
            setCharges(charges.map(c => c.id === editData.id ? { ...formData, id: editData.id } : c));
            setSnackbarMessage("Charge updated successfully");
        } else {
            // Add new charge
            const newId = Math.max(...charges.map(c => c.id), 0) + 1;
            setCharges([...charges, { ...formData, id: newId }]);
            setSnackbarMessage("Charge created successfully");
        }

        setShowSnackbar(true);
        handleClosePopup();
    };

    const handleDelete = (charge: Charge) => {
        if (!window.confirm(`Are you sure you want to delete "${charge.chargesCategory}"?`)) {
            return;
        }

        setCharges(charges.filter(c => c.id !== charge.id));
        setSnackbarMessage("Charge deleted successfully");
        setShowSnackbar(true);
    };

    const handleRefresh = () => {
        setSearchTerm("");
        setCurrentPage(1);
        setCharges(STATIC_CHARGES);
    };

    return (
        <div className="container-fluid" style={{ fontFamily: "'Roboto', sans-serif", padding: "20px" }}>
            <style>{`
        .charges-table {
          width: 100%;
          border-collapse: collapse;
        }
        .charges-table thead th {
          background-color: rgb(0, 123, 255);
          color: #ffffff;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          font-size: 0.9rem;
          border: 1px solid #dee2e6;
        }
        .charges-table tbody td {
          padding: 12px;
          border: 1px solid #dee2e6;
          font-size: 0.9rem;
        }
        .charges-table tbody tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        .charges-table tbody tr:nth-child(odd) {
          background-color: #ffffff;
        }
        .charges-table tbody tr:hover {
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
                Manage Hospital Charges Master
            </h1>

            {/* Search and Action Section */}
            <div className="search-section">
                <div className="search-input-wrapper">
                    <input
                        type="text"
                        placeholder="Enter Category / Sub-Category / Comments / Amount"
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
                    Search
                </button>

                <button className="btn-primary-custom" onClick={handleAddNew}>
                    Add New Charges
                </button>

                <button className="btn-icon" onClick={handleRefresh} title="Refresh">
                    <Refresh style={{ fontSize: '20px' }} />
                </button>
            </div>

            {/* Charges Table */}
            <div
                className="table-responsive"
                style={pageSize > 10 ? { maxHeight: '60vh', overflowY: 'auto' } : undefined}
            >
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <CircularProgress style={{ color: 'rgb(0, 123, 255)' }} />
                        <p style={{ marginTop: '16px', color: '#666' }}>Loading charges...</p>
                    </div>
                ) : (
                    <table className="charges-table">
                        <thead>
                            <tr>
                                <th style={{ width: '5%' }}>Sr.</th>
                                <th style={{ width: '25%' }}>Charges Category</th>
                                <th style={{ width: '15%' }}>Charges Sub Category</th>
                                <th style={{ width: '12%' }}>Calculation Type</th>
                                <th style={{ width: '8%' }}>Sort Order</th>
                                <th style={{ width: '15%' }}>Comments</th>
                                <th style={{ width: '10%' }}>Advance (Rs)</th>
                                <th style={{ width: '10%' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentCharges.length > 0 ? (
                                currentCharges.map((charge, index) => (
                                    <tr key={charge.id}>
                                        <td>{startIndex + index + 1}</td>
                                        <td>{charge.chargesCategory}</td>
                                        <td>{charge.chargesSubCategory}</td>
                                        <td>{charge.calculationType}</td>
                                        <td>{charge.sortOrder}</td>
                                        <td>{charge.comments || '–'}</td>
                                        <td>{charge.advance.toFixed(2)}</td>
                                        <td>
                                            <div className="action-icons">
                                                <div title="Edit" onClick={() => handleEdit(charge)}>
                                                    <Edit style={{ fontSize: '20px' }} />
                                                </div>
                                                <div title="Delete" onClick={() => handleDelete(charge)}>
                                                    <Delete style={{ fontSize: '20px' }} />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                        No charges found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {filteredCharges.length > 0 && (
                <div className="pagination-container">
                    <div className="pagination-info">
                        <span>
                            Showing {startIndex + 1} to {Math.min(endIndex, filteredCharges.length)} of {filteredCharges.length} charges
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
                    <span>{editData ? 'Edit Charge' : 'Add New Charge'}</span>
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
                                label="Charges Category"
                                value={formData.chargesCategory}
                                onChange={(e) => setFormData({ ...formData, chargesCategory: e.target.value })}
                                fullWidth
                                required
                                variant="outlined"
                                placeholder="Charges Category"
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
                                label="Charges Sub Category"
                                value={formData.chargesSubCategory}
                                onChange={(e) => setFormData({ ...formData, chargesSubCategory: e.target.value })}
                                fullWidth
                                required
                                variant="outlined"
                                placeholder="Charges Sub Category"
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
                                label="Calculation Type"
                                value={formData.calculationType}
                                onChange={(e) => setFormData({ ...formData, calculationType: e.target.value })}
                                fullWidth
                                select
                                variant="outlined"
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
                            >
                                <MenuItem value="Units">Units</MenuItem>
                                <MenuItem value="Days">Days</MenuItem>
                                <MenuItem value="Percentage">Percentage</MenuItem>
                                <MenuItem value="Fixed">Fixed</MenuItem>
                            </TextField>
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
                                label="Comments"
                                value={formData.comments}
                                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                                fullWidth
                                variant="outlined"
                                placeholder="Comments"
                                multiline
                                rows={2}
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
                                label="Advance (Rs)"
                                value={formData.advance || ''}
                                onChange={(e) => setFormData({ ...formData, advance: parseFloat(e.target.value) || 0 })}
                                fullWidth
                                variant="outlined"
                                type="number"
                                placeholder="Advance Amount"
                                InputLabelProps={{
                                    style: { color: '#000', fontWeight: 'bold' },
                                    shrink: true
                                }}
                                InputProps={{
                                    notched: false
                                }}
                                inputProps={{
                                    style: { textAlign: 'left', padding: '8px 12px' },
                                    step: "0.01"
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
                        style={{ backgroundColor: '#007bff', textTransform: 'none', minWidth: '80px' }}
                    >
                        Clear
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
