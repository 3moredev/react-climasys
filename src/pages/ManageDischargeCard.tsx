import React, { useState, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Edit, Close } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { patientService, Patient } from "../services/patientService";

type DischargeCard = {
    sr: number;
    patientName: string;
    ipdNo: string;
    ipdFileNo: string;
    admissionDate: string;
    dischargeDate: string;
    keywordOperation: string;
    advance: number;
};

export default function ManageDischargeCard() {
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
    const [dischargeCards, setDischargeCards] = useState<DischargeCard[]>([
        {
            sr: 1,
            patientName: "OMKAR JADHAV",
            ipdNo: "IPD-2020-05-0174",
            ipdFileNo: "149",
            admissionDate: "28-May-2019 13:15:00",
            dischargeDate: "--",
            keywordOperation: "--",
            advance: 0.00
        },
        {
            sr: 2,
            patientName: "AISHWARYA RANDIVE",
            ipdNo: "IPD-2020-07-0319",
            ipdFileNo: "263",
            admissionDate: "22-Jul-2019 11:30:00",
            dischargeDate: "--",
            keywordOperation: "--",
            advance: 10000.00
        },
        {
            sr: 3,
            patientName: "ANMOL RAI",
            ipdNo: "IPD-2020-07-0318",
            ipdFileNo: "294",
            admissionDate: "23-Jul-2019 14:30:00",
            dischargeDate: "--",
            keywordOperation: "--",
            advance: 0.00
        },
        {
            sr: 4,
            patientName: "SHEKHAR DENGWEKAR",
            ipdNo: "IPD-2020-07-0317",
            ipdFileNo: "293",
            admissionDate: "30-Jul-2019 16:00:00",
            dischargeDate: "--",
            keywordOperation: "--",
            advance: 10000.00
        },
        {
            sr: 5,
            patientName: "RONAK NAGAR",
            ipdNo: "IPD-2020-07-0316",
            ipdFileNo: "292",
            admissionDate: "08-Aug-2019 14:00:00",
            dischargeDate: "--",
            keywordOperation: "--",
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

    const handleClear = () => {
        setSearchTerm("");
        setSearchResults([]);
        setShowDropdown(false);
    };

    const handleClose = () => {
        setShowEmptyTable(false);
    };

    const handleEdit = (card: DischargeCard) => {
        console.log("Editing:", card);
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

    const clearButtonStyle: React.CSSProperties = {
        ...buttonStyle,
        backgroundColor: "#6c757d"
    };

    return (
        <div className="container-fluid mt-3" style={{ fontFamily: "'Roboto', sans-serif" }}>
            <style>{`
                .table.discharge-table { 
                    table-layout: fixed !important; 
                    width: 100%;
                }
                .discharge-table th, .discharge-table td { 
                    white-space: wrap; 
                }
                .discharge-table, .discharge-table th, .discharge-table td { 
                    border: 1px solid #dee2e6 !important; 
                }
                .discharge-table thead th { 
                    background-color: #007bff;
                    color: #ffffff;
                    padding: 8px 12px !important; 
                    font-size: 0.9rem; 
                    line-height: 1.2;
                    font-weight: 600;
                    text-align: left;
                }
                .discharge-table tbody td { 
                    padding: 8px 12px !important; 
                    font-size: 0.9rem; 
                    line-height: 1.2;
                    background-color: #ffffff;
                }
                .discharge-table tbody tr:hover {
                    background-color: #f8f9fa;
                }
                .discharge-table th.sr-col, .discharge-table td.sr-col { width: 4%; }
                .discharge-table th.patient-name-col, .discharge-table td.patient-name-col { width: 12%; }
                .discharge-table th.ipd-no-col, .discharge-table td.ipd-no-col { width: 12%; }
                .discharge-table th.ipd-file-col, .discharge-table td.ipd-file-col { width: 10%; }
                .discharge-table th.admission-date-col, .discharge-table td.admission-date-col { width: 12%; }
                .discharge-table th.discharge-date-col, .discharge-table td.discharge-date-col { width: 12%; }
                .discharge-table th.keyword-col, .discharge-table td.keyword-col { width: 12%; }
                .discharge-table th.advance-col, .discharge-table td.advance-col { width: 8%; }
                .discharge-table th.action-col, .discharge-table td.action-col { width: 6%; }
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
                    Manage Discharge Card
                </h2>
            </div>

            <div className="d-flex mb-3 align-items-center" style={{ gap: '8px', flexWrap: 'wrap', overflow: 'visible' }}>
                <div className="position-relative" ref={searchRef}>
                    <input
                        type="text"
                        placeholder="Search with Patient ID / Patient Name / IPD Number"
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
                    style={clearButtonStyle}
                    onClick={handleClear}
                >
                    Clear
                </button>
            </div>

            <div className="mb-4">
                <div className="table-responsive">
                    <table className="table discharge-table">
                        <thead>
                            <tr>
                                <th className="sr-col">Sr.</th>
                                <th className="patient-name-col">Patient Name</th>
                                <th className="ipd-no-col">IPD No</th>
                                <th className="ipd-file-col">IPD File No</th>
                                <th className="admission-date-col">Admission Date</th>
                                <th className="discharge-date-col">Discharge Date</th>
                                <th className="keyword-col">Keyword / Operation</th>
                                <th className="advance-col">Advance (Rs)</th>
                                <th className="action-col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {showEmptyTable && (
                                <tr className="empty-table-row">
                                    <td className="sr-col">--</td>
                                    <td className="patient-name-col">--</td>
                                    <td className="ipd-no-col"></td>
                                    <td className="ipd-file-col"></td>
                                    <td className="admission-date-col"></td>
                                    <td className="discharge-date-col"></td>
                                    <td className="keyword-col"></td>
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
                    <table className="table discharge-table">
                        <thead>
                            <tr>
                                <th className="sr-col">Sr.</th>
                                <th className="patient-name-col">Patient Name</th>
                                <th className="ipd-no-col">IPD No</th>
                                <th className="ipd-file-col">IPD File No</th>
                                <th className="admission-date-col">Admission Date</th>
                                <th className="discharge-date-col">Discharge Date</th>
                                <th className="keyword-col">Keyword / Operation</th>
                                <th className="advance-col">Advance (Rs)</th>
                                <th className="action-col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dischargeCards.map((card) => (
                                <tr key={card.sr}>
                                    <td className="sr-col">{card.sr}</td>
                                    <td className="patient-name-col">{card.patientName}</td>
                                    <td className="ipd-no-col">{card.ipdNo}</td>
                                    <td className="ipd-file-col">{card.ipdFileNo}</td>
                                    <td className="admission-date-col">{card.admissionDate}</td>
                                    <td className="discharge-date-col">{card.dischargeDate}</td>
                                    <td className="keyword-col">{card.keywordOperation}</td>
                                    <td className="advance-col">{card.advance.toFixed(2)}</td>
                                    <td className="action-col">
                                        <button
                                            onClick={() => handleEdit(card)}
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

