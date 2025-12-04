import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Edit, Delete, Search, Download } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import { doctorService, Doctor } from "../services/doctorService";

export default function ManageDoctors() {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Filter doctors based on search term
    const filteredDoctors = doctors.filter(doctor => {
        if (!searchTerm.trim()) return true;
        const search = searchTerm.toLowerCase();
        return (
            (doctor.name || '').toLowerCase().includes(search) ||
            (doctor.clinicName || '').toLowerCase().includes(search) ||
            (doctor.registrationNo || '').toLowerCase().includes(search) ||
            (doctor.speciality || '').toLowerCase().includes(search) ||
            (doctor.mobileNo || '').includes(search)
        );
    });

    const navigate = useNavigate();

    const handleSearch = () => {
        // Search is handled by filtering the local state
    };

    const handleAddDoctor = () => {
        // Navigate to add doctor page (placeholder for now)
        navigate("/add-doctor");
    };

    const handleEdit = (doctor: Doctor) => {
        navigate("/add-doctor", { state: doctor });
    };

    const handleDelete = async (doctor: Doctor) => {
        if (!window.confirm(`Are you sure you want to delete the doctor "${doctor.name}"?`)) {
            return;
        }
        try {
            setLoading(true);
            await doctorService.deleteDoctor(doctor.id);
            await fetchDoctors();
        } catch (err: any) {
            console.error("Error deleting doctor:", err);
            setError(err.message || "Failed to delete doctor");
        } finally {
            setLoading(false);
        }
    };

    const fetchDoctors = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await doctorService.getAllDoctors();
            setDoctors(data);
        } catch (err: any) {
            console.error("Error fetching doctors:", err);
            setError(err.message || "Failed to fetch doctors");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDoctors();
    }, [fetchDoctors]);

    return (
        <div className="container-fluid" style={{ fontFamily: "'Roboto', sans-serif", padding: "20px" }}>
            <style>{`
        .doctors-table {
          width: 100%;
          border-collapse: collapse;
        }
        .doctors-table thead th {
          background-color: rgb(0, 123, 255);
          color: #ffffff;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          font-size: 0.9rem;
          border: 1px solid #dee2e6;
        }
        .doctors-table tbody td {
          padding: 12px;
          border: 1px solid #dee2e6;
          font-size: 0.9rem;
          vertical-align: middle;
        }
        .doctors-table tbody tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        .doctors-table tbody tr:nth-child(odd) {
          background-color: #ffffff;
        }
        .doctors-table tbody tr:hover {
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
          border: none;
          cursor: pointer;          
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color 0.2s;
          background: transparent;
          color: rgb(0, 123, 255);
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
                Manage Doctor
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

                <button className="btn-primary-custom" onClick={handleAddDoctor}>
                    Add Doctor
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

            {/* Doctors Table */}
            <div className="table-responsive">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <CircularProgress style={{ color: 'rgb(0, 123, 255)' }} />
                        <p style={{ marginTop: '16px', color: '#666' }}>Loading doctors...</p>
                    </div>
                ) : (
                    <table className="doctors-table">
                        <thead>
                            <tr>
                                <th style={{ width: '20%' }}>Doctor Name</th>
                                <th style={{ width: '20%' }}>Clinic Name</th>
                                <th style={{ width: '15%' }}>Registration No</th>
                                <th style={{ width: '15%' }}>Speciality</th>
                                <th style={{ width: '15%' }}>Mobile No</th>
                                <th style={{ width: '10%' }}>OPD / IPD</th>
                                <th style={{ width: '5%' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDoctors.length > 0 ? (
                                filteredDoctors.map((doctor) => (
                                    <tr key={doctor.id}>
                                        <td>{doctor.name}</td>
                                        <td>{doctor.clinicName}</td>
                                        <td>{doctor.registrationNo}</td>
                                        <td>{doctor.speciality}</td>
                                        <td>{doctor.mobileNo}</td>
                                        <td>{doctor.opdIpd || '-'}</td>
                                        <td>
                                            <div className="action-icons">
                                                <div title="Edit" onClick={() => handleEdit(doctor)}>
                                                    <Edit style={{ fontSize: '20px' }} />
                                                </div>
                                                <div title="Delete" onClick={() => handleDelete(doctor)}>
                                                    <Delete style={{ fontSize: '20px' }} />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                        {error ? 'Error loading doctors' : 'No doctors found'}
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
