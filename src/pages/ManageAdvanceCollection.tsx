import React, { useState, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Edit, Close } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { patientService, Patient } from "../services/patientService";

type AdvanceCollection = {
    sr: number;
    patientName: string;
    admissionIpdNo: string;
    admissionDate: string;
    reasonOfAdmission: string;
    insurance: string;
    dateOfAdvance: string;
    receiptNo: string;
    advance: number;
};

export default function ManageAdvanceCollection() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [searchResults, setSearchResults] = useState<Patient[]>([]);
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchError, setSearchError] = useState<string>("");
    const [showEmptyTable, setShowEmptyTable] = useState<boolean>(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    // Sample data matching the image
    const [advanceCollections, setAdvanceCollections] = useState<AdvanceCollection[]>([
        {
            sr: 1,
            patientName: "OMKAR JADHAV",
            admissionIpdNo: "IPD-2020-05-0174",
            admissionDate: "28-May-2019",
            reasonOfAdmission: "SPINAL INJURY",
            insurance: "No",
            dateOfAdvance: "--",
            receiptNo: "--",
            advance: 0.00
        },
        {
            sr: 2,
            patientName: "AISHWARYA RANDIVE",
            admissionIpdNo: "IPD-2020-07-0319",
            admissionDate: "14-Jul-2020",
            reasonOfAdmission: "--",
            insurance: "No",
            dateOfAdvance: "23-Jul-2019",
            receiptNo: "--",
            advance: 10000.00
        },
        {
            sr: 3,
            patientName: "CHANDRA GWEKAR",
            admissionIpdNo: "IPD-2020-07-0318",
            admissionDate: "23-Jul-2019",
            reasonOfAdmission: "--",
            insurance: "No",
            dateOfAdvance: "--",
            receiptNo: "--",
            advance: 10000.00
        },
        {
            sr: 4,
            patientName: "ANMOL RAI",
            admissionIpdNo: "IPD-2020-07-0317",
            admissionDate: "30-Jul-2019",
            reasonOfAdmission: "--",
            insurance: "No",
            dateOfAdvance: "07-Aug-2019",
            receiptNo: "--",
            advance: 0.00
        },
        {
            sr: 5,
            patientName: "RONAK NAGAR",
            admissionIpdNo: "IPD-2020-07-0316",
            admissionDate: "23-Jul-2019",
            reasonOfAdmission: "--",
            insurance: "No",
            dateOfAdvance: "--",
            receiptNo: "--",
            advance: 0.00
        }
    ]);

    const searchPatients = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            setShowDropdown(false);
            setSearchError("");
            return;
        }

        try {
            setLoading(true);
            setSearchError("");

            const response = await patientService.searchPatients({
                query: query,
                status: 'all',
                page: 0,
                size: 200
            });

            const q = query.trim().toLowerCase();
            const patients = response.patients || [];

            const queryWords = q.split(/\s+/).filter(word => word.length > 0);

            const tokenMatch = (p: any): boolean => {
                const patientId = String(p.id || '').toLowerCase();
                const firstName = String(p.first_name || '').toLowerCase();
                const middleName = String(p.middle_name || '').toLowerCase();
                const lastName = String(p.last_name || '').toLowerCase();
                const fullName = `${firstName} ${middleName} ${lastName}`.replace(/\s+/g, ' ').trim().toLowerCase();
                const firstLast = `${firstName} ${lastName}`.replace(/\s+/g, ' ').trim();
                const lastFirst = `${lastName} ${firstName}`.replace(/\s+/g, ' ').trim();
                const contact = String(p.mobile_1 || '').replace(/\D/g, '');
                const queryDigits = q.replace(/\D/g, '');

                return (
                    patientId === q ||
                    patientId.includes(q) ||
                    (queryDigits.length >= 3 && contact.includes(queryDigits)) ||
                    (queryWords.length > 1 && ([fullName, firstLast, lastFirst]
                        .some(name => queryWords.every(word => name.includes(word))))) ||
                    (queryWords.length === 1 && (
                        firstName.startsWith(q) ||
                        middleName.startsWith(q) ||
                        lastName.startsWith(q) ||
                        fullName.includes(q) ||
                        firstName.includes(q) ||
                        middleName.includes(q) ||
                        lastName.includes(q)
                    ))
                );
            };

            let searchResults = patients.filter((p: any) => tokenMatch(p));

            if (searchResults.length === 0 && queryWords.length > 1) {
                try {
                    const tokenResponses = await Promise.all(
                        queryWords.map(word => patientService.searchPatients({
                            query: word,
                            status: 'all',
                            page: 0,
                            size: 200
                        }))
                    );
                    const mergedById: Record<string, any> = {};
                    for (const r of tokenResponses) {
                        const arr = (r?.patients || []) as any[];
                        for (const p of arr) {
                            const idKey = String(p.id || '').toLowerCase();
                            if (!mergedById[idKey]) mergedById[idKey] = p;
                        }
                    }
                    const mergedArray = Object.values(mergedById);
                    searchResults = mergedArray.filter((p: any) => tokenMatch(p));
                } catch (e) {
                    console.warn('Per-token search fallback failed', e);
                }
            }

            const sortedResults = searchResults.sort((a: any, b: any) => {
                const q = query.trim().toLowerCase();
                const getScore = (patient: any) => {
                    const id = String(patient.id || '').toLowerCase();
                    const firstName = String(patient.first_name || '').toLowerCase();
                    const middleName = String(patient.middle_name || '').toLowerCase();
                    const lastName = String(patient.last_name || '').toLowerCase();
                    const fullName = `${firstName} ${middleName} ${lastName}`.replace(/\s+/g, ' ').trim().toLowerCase();
                    const contact = String(patient.mobile_1 || '').replace(/\D/g, '');
                    const queryWords = q.split(/\s+/).filter(word => word.length > 0);
                    const queryDigits = q.replace(/\D/g, '');

                    let score = 0;
                    if (id === q) score += 1000;
                    else if (id.startsWith(q)) score += 800;
                    else if (id.includes(q)) score += 600;
                    if (queryDigits.length >= 3 && contact === queryDigits) score += 200;
                    if (queryDigits.length >= 3 && contact.includes(queryDigits)) score += 100;
                    if (queryWords.length > 1) {
                        const allWordsFound = queryWords.every(word => fullName.includes(word));
                        if (allWordsFound) {
                            if (fullName.startsWith(q)) score += 500;
                            else if (firstName.startsWith(queryWords[0])) score += 450;
                            else if (middleName && middleName.startsWith(queryWords[1] || '')) score += 425;
                            else if (lastName.startsWith(queryWords[queryWords.length - 1])) score += 400;
                            else score += 350;
                        }
                    } else {
                        if (firstName.startsWith(q)) score += 500;
                        else if (lastName.startsWith(q)) score += 450;
                        else if (middleName.startsWith(q)) score += 400;
                        else if (fullName.includes(q)) score += 300;
                        else score += 200;
                    }
                    return score;
                };
                return getScore(b) - getScore(a);
            });

            setSearchResults(sortedResults);
            setShowDropdown(true);
        } catch (error: any) {
            console.error("Search error:", error);
            setSearchError(error.message || "Failed to search patients");
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        const search = value.trim().toLowerCase();
        if (!search) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }
        searchPatients(value);
    };

    const handlePatientSelect = (patient: Patient) => {
        setSearchTerm("");
        setSearchResults([]);
        setShowDropdown(false);
        console.log("Selected patient:", patient);
    };

    const handleSearch = () => {
        console.log("Searching for:", searchTerm);
    };

    const handleNewAdvanceCollection = () => {
        // Implement new advance collection functionality
        console.log("New Advance Collection");
    };

    const handleClose = () => {
        setShowEmptyTable(false);
    };

    const handleEdit = (collection: AdvanceCollection) => {
        console.log("Editing:", collection);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const buttonStyle: React.CSSProperties = {
        backgroundColor: "#007bff",
        color: "#ffffff",
        border: "none",
        height: "38px",
        padding: "6px 16px",
        borderRadius: "4px",
        fontFamily: "'Roboto', sans-serif",
        fontWeight: 500,
        fontSize: "0.9rem",
        cursor: "pointer",
        whiteSpace: "nowrap"
    };

    return (
        <div className="container-fluid mt-3" style={{ fontFamily: "'Roboto', sans-serif" }}>
            <style>{`
                .table.advance-table { 
                    table-layout: fixed !important; 
                    width: 100%;
                }
                .advance-table th, .advance-table td { 
                    white-space: wrap; 
                }
                .advance-table, .advance-table th, .advance-table td { 
                    border: 1px solid #dee2e6 !important; 
                }
                .advance-table thead th { 
                    background-color: #007bff;
                    color: #ffffff;
                    padding: 8px 12px !important; 
                    font-size: 0.9rem; 
                    line-height: 1.2;
                    font-weight: 600;
                    text-align: left;
                }
                .advance-table tbody td { 
                    padding: 8px 12px !important; 
                    font-size: 0.9rem; 
                    line-height: 1.2;
                    background-color: #ffffff;
                }
                .advance-table tbody tr:hover {
                    background-color: #f8f9fa;
                }
                .advance-table th.sr-col, .advance-table td.sr-col { width: 4%; }
                .advance-table th.patient-name-col, .advance-table td.patient-name-col { width: 12%; }
                .advance-table th.admission-ipd-col, .advance-table td.admission-ipd-col { width: 12%; }
                .advance-table th.admission-date-col, .advance-table td.admission-date-col { width: 10%; }
                .advance-table th.reason-col, .advance-table td.reason-col { width: 12%; }
                .advance-table th.insurance-col, .advance-table td.insurance-col { width: 8%; }
                .advance-table th.date-advance-col, .advance-table td.date-advance-col { width: 10%; }
                .advance-table th.receipt-col, .advance-table td.receipt-col { width: 10%; }
                .advance-table th.advance-col, .advance-table td.advance-col { width: 8%; }
                .advance-table th.action-col, .advance-table td.action-col { width: 6%; }
                .empty-table-row td {
                    border-style: dashed !important;
                    border-color: #dee2e6 !important;
                    color: #6c757d;
                }
            `}</style>

            <div className="mb-4">
                <h2 style={{ 
                    fontWeight: 'bold', 
                    fontSize: '1.5rem', 
                    color: '#212121',
                    marginBottom: '0'
                }}>
                    Manage Advance Collection
                </h2>
            </div>

            <div className="d-flex mb-3 align-items-center" style={{ gap: '8px', flexWrap: 'wrap', overflow: 'visible' }}>
                <div className="position-relative" ref={searchRef}>
                    <input
                        type="text"
                        placeholder="Search with Patient ID / Patient Name / IPD No"
                        className="form-control"
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        ref={searchInputRef}
                        style={{ borderWidth: "2px", height: "38px", fontFamily: "'Roboto', sans-serif", fontWeight: 500, minWidth: "300px", width: "400px" }}
                    />

                    {showDropdown && (
                        <div
                            className="position-absolute w-100 bg-white border border-secondary rounded shadow-lg"
                            style={{
                                top: "100%",
                                left: 0,
                                zIndex: 1051,
                                maxHeight: "300px",
                                overflowY: "auto",
                                fontFamily: "'Roboto', sans-serif"
                            }}
                        >
                            {loading ? (
                                <div className="p-3 text-center">
                                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : searchResults.length > 0 ? (
                                searchResults.map((patient) => {
                                    const age = patient.age_given;
                                    return (
                                        <div
                                            key={patient.id}
                                            className="p-3 border-bottom cursor-pointer"
                                            style={{ cursor: "pointer" }}
                                            onClick={() => handlePatientSelect(patient)}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
                                        >
                                            <div className="fw-bold d-flex align-items-center">
                                                <i className="fas fa-user me-2 text-primary"></i>
                                                {patient.first_name} {patient.middle_name ? `${patient.middle_name} ` : ''}{patient.last_name}
                                            </div>
                                            <div className="text-muted small mt-1 text-nowrap">
                                                <i className="fas fa-id-card me-1"></i>
                                                <strong>ID:</strong> {patient.id} |
                                                <i className="fas fa-birthday-cake me-1 ms-2"></i>
                                                <strong>Age:</strong> {age} |
                                                <i className="fas fa-phone me-1"></i>
                                                <strong>Contact:</strong> {patient.mobile_1 || 'N/A'}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : searchError ? (
                                <div className="p-3 text-danger text-center">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    {searchError}
                                </div>
                            ) : (
                                <div className="p-3 text-muted text-center">No patients found</div>
                            )}
                        </div>
                    )}
                </div>

                <button
                    className="btn"
                    style={buttonStyle}
                    onClick={handleSearch}
                >
                    Search
                </button>

                <button
                    className="btn"
                    style={buttonStyle}
                    onClick={handleNewAdvanceCollection}
                >
                    New Advance Collection
                </button>
            </div>

            <div className="mb-4">
                <div className="table-responsive">
                    <table className="table advance-table">
                        <thead>
                            <tr>
                                <th className="sr-col">Sr.</th>
                                <th className="admission-ipd-col">Admission / IPD No</th>
                                <th className="admission-date-col">Admission Date</th>
                                <th className="reason-col">Reason of Admission</th>
                                <th className="insurance-col">Insurance</th>
                                <th className="date-advance-col">Date of Advance</th>
                                <th className="receipt-col">Receipt No</th>
                                <th className="advance-col">Advance (Rs)</th>
                                <th className="action-col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {showEmptyTable && (
                                <tr className="empty-table-row">
                                    <td className="sr-col">--</td>
                                    <td className="admission-ipd-col">--</td>
                                    <td className="admission-date-col"></td>
                                    <td className="reason-col"></td>
                                    <td className="insurance-col"></td>
                                    <td className="date-advance-col"></td>
                                    <td className="receipt-col"></td>
                                    <td className="advance-col"></td>
                                    <td className="action-col"></td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {showEmptyTable && (
                    <div className="d-flex justify-content-end mt-3">
                        <button
                            className="btn"
                            style={buttonStyle}
                            onClick={handleClose}
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-4">
                <h5 style={{ 
                    fontWeight: '600', 
                    fontSize: '1.1rem', 
                    color: '#212121',
                    marginBottom: '16px'
                }}>
                    List of Admitted Patient/s
                </h5>

                <div className="table-responsive">
                    <table className="table advance-table">
                        <thead>
                            <tr>
                                <th className="sr-col">Sr.</th>
                                <th className="patient-name-col">Patient Name</th>
                                <th className="admission-ipd-col">Admission / IPD No</th>
                                <th className="admission-date-col">Admission Date</th>
                                <th className="reason-col">Reason of Admission</th>
                                <th className="insurance-col">Insurance</th>
                                <th className="date-advance-col">Date of Advance</th>
                                <th className="receipt-col">Receipt No</th>
                                <th className="advance-col">Advance (Rs)</th>
                                <th className="action-col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {advanceCollections.map((collection) => (
                                <tr key={collection.sr}>
                                    <td className="sr-col">{collection.sr}</td>
                                    <td className="patient-name-col">{collection.patientName}</td>
                                    <td className="admission-ipd-col">{collection.admissionIpdNo}</td>
                                    <td className="admission-date-col">{collection.admissionDate}</td>
                                    <td className="reason-col">{collection.reasonOfAdmission}</td>
                                    <td className="insurance-col">{collection.insurance}</td>
                                    <td className="date-advance-col">{collection.dateOfAdvance}</td>
                                    <td className="receipt-col">{collection.receiptNo}</td>
                                    <td className="advance-col">{collection.advance.toFixed(2)}</td>
                                    <td className="action-col">
                                        <button
                                            onClick={() => handleEdit(collection)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: '4px',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            title="Edit"
                                        >
                                            <Edit style={{ fontSize: '18px', color: '#007bff' }} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

