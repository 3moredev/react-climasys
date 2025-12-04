import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Edit, Delete, Search, Add, Download } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import { clinicService, Clinic } from "../services/clinicService";

export default function ManageClinics() {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

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
        }
        .search-input-wrapper {
          position: relative;
          flex: 1;
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
          height: 38px;
        }
        .btn-primary-custom:hover {
          background-color: rgb(0, 100, 200);
        }
        .btn-icon {
          font-color: rgb(0, 123, 255);
        //   background: rgb(0, 123, 255);          
          border: none;
          cursor: pointer;          
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        .btn-icon:hover {
          color: rgb(0, 100, 200);
        }
        .header-title {
          font-weight: bold;
          font-size: 1.8rem;
          color: #212121;
          margin-bottom: 24px;
          margin-top: 10px;
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

                <button className="btn-primary-custom" onClick={handleAddClinic}>
                    Add Clinic
                </button>

                <button className="btn-icon" title="Download">
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
                                <th style={{ width: '10%' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClinics.length > 0 ? (
                                filteredClinics.map((clinic) => (
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
        </div>
    );
}
