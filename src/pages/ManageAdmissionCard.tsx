import React, { useState, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Edit, Close } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AdmissionCardDialog from "../components/AdmissionCardDialog";
import { patientService, Patient } from "../services/patientService";
import { admissionService, AdmissionCardDTO, AdmissionCardsRequest } from "../services/admissionService";
import { useSession } from "../store/hooks/useSession";

type AdmissionCard = {
    sr: number;
    patientName: string;
    admissionIpdNo: string;
    ipdFileNo: string;
    admissionDate: string;
    reasonOfAdmission: string;
    dischargeDate: string;
    insurance: string;
    company: string;
    advance: number;
};

export default function ManageAdmissionCard() {
    const navigate = useNavigate();
    const { clinicId, doctorId } = useSession();
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [searchResults, setSearchResults] = useState<Patient[]>([]);
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchError, setSearchError] = useState<string>("");
    const [showEmptyTable, setShowEmptyTable] = useState<boolean>(false);
    const [showAdmissionCardDialog, setShowAdmissionCardDialog] = useState<boolean>(false);
    const [editingPatient, setEditingPatient] = useState<AdmissionCard | null>(null);
    const [loadingAdmissionCards, setLoadingAdmissionCards] = useState<boolean>(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    // Dynamic data from API
    const [admittedPatients, setAdmittedPatients] = useState<AdmissionCard[]>([]);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    
    // Selected admission card for first table (from search)
    const [selectedAdmissionCard, setSelectedAdmissionCard] = useState<AdmissionCard | null>(null);
    
    // Selected patient from search
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    
    // Enable "New Admission Card" button only when patient is selected but not in admitted list
    const [enableNewAdmissionCard, setEnableNewAdmissionCard] = useState<boolean>(false);

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

            // Enhanced search with multiple criteria and priority
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

            // Fallback: if no results for multi-word query, fetch per-token and merge
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

            // Sort results by priority
            const sortedResults = searchResults.sort((a: any, b: any) => {
                const aId = String(a.id || '').toLowerCase();
                const aFirstName = String(a.first_name || '').toLowerCase();
                const aMiddleName = String(a.middle_name || '').toLowerCase();
                const aLastName = String(a.last_name || '').toLowerCase();
                const aFullName = `${aFirstName} ${aMiddleName} ${aLastName}`.replace(/\s+/g, ' ').trim().toLowerCase();
                const aContact = String(a.mobile_1 || '').replace(/\D/g, '');
                const queryDigits = q.replace(/\D/g, '');

                const bId = String(b.id || '').toLowerCase();
                const bFirstName = String(b.first_name || '').toLowerCase();
                const bMiddleName = String(b.middle_name || '').toLowerCase();
                const bLastName = String(b.last_name || '').toLowerCase();
                const bFullName = `${bFirstName} ${bMiddleName} ${bLastName}`.replace(/\s+/g, ' ').trim().toLowerCase();
                const bContact = String(b.mobile_1 || '').replace(/\D/g, '');

                const getScore = (patient: any) => {
                    const id = String(patient.id || '').toLowerCase();
                    const firstName = String(patient.first_name || '').toLowerCase();
                    const middleName = String(patient.middle_name || '').toLowerCase();
                    const lastName = String(patient.last_name || '').toLowerCase();
                    const fullName = `${firstName} ${middleName} ${lastName}`.replace(/\s+/g, ' ').trim().toLowerCase();
                    const contact = String(patient.mobile_1 || '').replace(/\D/g, '');
                    const queryWords = q.split(/\s+/).filter(word => word.length > 0);

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
            setSelectedPatient(null);
            setSelectedAdmissionCard(null);
            setEnableNewAdmissionCard(false);
            return;
        }

        searchPatients(value);
    };

    const handlePatientSelect = (patient: Patient) => {
        // Set the search term to the patient's full name
        const patientFullName = `${patient.first_name} ${patient.middle_name || ''} ${patient.last_name}`.replace(/\s+/g, ' ').trim();
        setSearchTerm(patientFullName);
        setSearchResults([]);
        setShowDropdown(false);
        
        // Store selected patient
        setSelectedPatient(patient);
        
        // Check if patient has an admission card in the list
        const patientFullNameLower = patientFullName.toLowerCase();
        const hasAdmissionCard = admittedPatients.some(card => {
            const cardName = card.patientName.trim().toLowerCase();
            return cardName === patientFullNameLower || 
                   cardName.includes(patientFullNameLower) ||
                   patientFullNameLower.includes(cardName);
        });
        
        // Enable "New Admission Card" button only if patient is selected but NOT in admitted list
        setEnableNewAdmissionCard(!hasAdmissionCard);
        
        // Don't search immediately - wait for user to click Search button
        setSelectedAdmissionCard(null);
        
        console.log("Selected patient:", patient);
        console.log("Has admission card:", hasAdmissionCard);
    };

    const handleSearch = () => {
        if (!searchTerm.trim()) {
            setSelectedAdmissionCard(null);
            setSelectedPatient(null);
            setEnableNewAdmissionCard(false);
            return;
        }
        
        // Search for matching admission card by patient name
        const searchQuery = searchTerm.trim().toLowerCase();
        const matchingCard = admittedPatients.find(card => {
            const cardName = card.patientName.trim().toLowerCase();
            // Match by exact name or case-insensitive match
            return cardName === searchQuery || 
                   cardName.includes(searchQuery) ||
                   searchQuery.includes(cardName);
        });
        
        if (matchingCard) {
            setSelectedAdmissionCard(matchingCard);
            // If patient has admission card, disable the button
            setEnableNewAdmissionCard(false);
            console.log("Found matching admission card:", matchingCard);
        } else {
            // Clear selection if no match found
            setSelectedAdmissionCard(null);
            // If patient is selected but no admission card found, enable the button
            if (selectedPatient) {
                setEnableNewAdmissionCard(true);
            } else {
                setEnableNewAdmissionCard(false);
            }
            console.log("No matching admission card found for:", searchTerm);
        }
    };

    const handleNewAdmissionCard = () => {
        setEditingPatient(null);
        setShowAdmissionCardDialog(true);
    };

    const handleAdmissionCardSubmit = (data: any) => {
        // Handle form submission
        console.log("Admission Card Data:", data);
        // You can add API call here to save the data
    };

    const handleNewPatient = () => {
        navigate('/quick-registration');
    };

    const handleClose = () => {
        setShowEmptyTable(false);
    };

    const handleEdit = (patient: AdmissionCard) => {
        setEditingPatient(patient);
        setShowAdmissionCardDialog(true);
    };

    const handleCloseDialog = () => {
        setShowAdmissionCardDialog(false);
        setEditingPatient(null);
    };

    // Pagination handlers
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setCurrentPage(1); // Reset to first page when changing page size
    };

    // Pagination calculations
    const totalPages = Math.ceil(admittedPatients.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentAdmissionCards = admittedPatients.slice(startIndex, endIndex);

    // Reset pagination when admittedPatients changes
    useEffect(() => {
        setCurrentPage(1);
    }, [admittedPatients.length]);

    // Re-check button state when admittedPatients or selectedPatient changes
    useEffect(() => {
        if (selectedPatient) {
            const patientFullName = `${selectedPatient.first_name} ${selectedPatient.middle_name || ''} ${selectedPatient.last_name}`.replace(/\s+/g, ' ').trim().toLowerCase();
            const hasAdmissionCard = admittedPatients.some(card => {
                const cardName = card.patientName.trim().toLowerCase();
                return cardName === patientFullName || 
                       cardName.includes(patientFullName) ||
                       patientFullName.includes(cardName);
            });
            setEnableNewAdmissionCard(!hasAdmissionCard);
        } else {
            setEnableNewAdmissionCard(false);
        }
    }, [admittedPatients, selectedPatient]);

    // Fetch admission cards on component mount
    useEffect(() => {
        const fetchAdmissionCards = async () => {
            if (!clinicId) {
                console.warn('ClinicId not available, skipping admission cards fetch');
                return;
            }

            try {
                setLoadingAdmissionCards(true);
                const params: AdmissionCardsRequest = {
                    clinicId: clinicId
                };

                const response = await admissionService.getAdmissionCards(params);
                
                // Console log the response as requested
                console.log('Admission Cards API Response:', response);
                
                if (response.success && response.data) {
                    // Map the API response to AdmissionCard format with sr numbers
                    const mappedCards: AdmissionCard[] = response.data.map((card: AdmissionCardDTO, index: number) => ({
                        sr: index + 1,
                        patientName: card.patientName || '--',
                        admissionIpdNo: card.admissionIpdNo || '--',
                        ipdFileNo: card.ipdFileNo || '--',
                        admissionDate: card.admissionDate || '--',
                        reasonOfAdmission: card.reasonOfAdmission || '--',
                        dischargeDate: card.dischargeDate || '--',
                        insurance: card.insurance || '--',
                        company: card.company || '--',
                        advance: card.advance || 0.00
                    }));
                    
                    setAdmittedPatients(mappedCards);
                } else {
                    console.error('Failed to fetch admission cards:', response.error);
                    setAdmittedPatients([]);
                }
            } catch (error: any) {
                console.error('Error fetching admission cards:', error);
                setAdmittedPatients([]);
            } finally {
                setLoadingAdmissionCards(false);
            }
        };

        fetchAdmissionCards();
    }, [clinicId]);

    // Handle clicks outside the search dropdown
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
                /* Table styles matching Appointment page */
                .table.admission-table { 
                    table-layout: fixed !important; 
                    width: 100%;
                }
                .admission-table th, .admission-table td { 
                    white-space: wrap; 
                }
                .admission-table, .admission-table th, .admission-table td { 
                    border: 1px solid #dee2e6 !important; 
                }
                .admission-table thead th { 
                    background-color: #007bff;
                    color: #ffffff;
                    padding: 8px 12px !important; 
                    font-size: 0.9rem; 
                    line-height: 1.2;
                    font-weight: 600;
                    text-align: left;
                }
                .admission-table tbody td { 
                    padding: 8px 12px !important; 
                    font-size: 0.9rem; 
                    line-height: 1.2;
                    background-color: #ffffff;
                }
                .admission-table tbody tr:hover {
                    background-color: #f8f9fa;
                }
                
                /* Column widths */
                .admission-table th.sr-col, .admission-table td.sr-col { width: 4%; }
                .admission-table th.patient-name-col, .admission-table td.patient-name-col { width: 12%; }
                .admission-table th.admission-ipd-col, .admission-table td.admission-ipd-col { width: 12%; }
                .admission-table th.ipd-file-col, .admission-table td.ipd-file-col { width: 8%; }
                .admission-table th.admission-date-col, .admission-table td.admission-date-col { width: 10%; }
                .admission-table th.reason-col, .admission-table td.reason-col { width: 12%; }
                .admission-table th.discharge-date-col, .admission-table td.discharge-date-col { width: 10%; }
                .admission-table th.insurance-col, .admission-table td.insurance-col { width: 8%; }
                .admission-table th.company-col, .admission-table td.company-col { width: 10%; }
                .admission-table th.advance-col, .admission-table td.advance-col { width: 8%; }
                .admission-table th.action-col, .admission-table td.action-col { width: 6%; }
                
                /* Empty table template */
                .empty-table-row td {
                    border-style: dashed !important;
                    border-color: #dee2e6 !important;
                    color: #6c757d;
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
            <div className="mb-4">
                <h2 style={{ 
                    fontWeight: 'bold', 
                    fontSize: '1.5rem', 
                    color: '#212121',
                    marginBottom: '0'
                }}>
                    Manage Admission Card
                </h2>
            </div>

            {/* Search and Action Section */}
            <div className="d-flex mb-3 align-items-center" style={{ gap: '8px', flexWrap: 'wrap', overflow: 'visible' }}>
                <div className="position-relative" ref={searchRef}>
                    <input
                        type="text"
                        placeholder="Search by Patient ID/Name/ContactNumber"
                        className="form-control"
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        ref={searchInputRef}
                        style={{ borderWidth: "2px", height: "38px", fontFamily: "'Roboto', sans-serif", fontWeight: 500, minWidth: "300px", width: "400px" }}
                    />

                    {/* Search Dropdown */}
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
                    style={{
                        ...buttonStyle,
                        opacity: enableNewAdmissionCard ? 1 : 0.5,
                        cursor: enableNewAdmissionCard ? 'pointer' : 'not-allowed'
                    }}
                    onClick={handleNewAdmissionCard}
                    disabled={!enableNewAdmissionCard}
                >
                    New Admission Card
                </button>

                <button
                    className="btn"
                    style={buttonStyle}
                    onClick={handleNewPatient}
                >
                    New Patient
                </button>
            </div>

            {/* Static Table with Single Record (matching uploaded image) */}
            <div className="mb-4">
                <div className="table-responsive">
                    <table className="table admission-table">
                        <thead>
                            <tr>
                                <th className="sr-col">Sr.</th>
                                <th className="admission-ipd-col">Admission / IPD No</th>
                                <th className="ipd-file-col">IPD File No</th>
                                <th className="admission-date-col">Admission Date</th>
                                <th className="reason-col">Reason of Admission</th>
                                <th className="discharge-date-col">Discharge Date</th>
                                <th className="insurance-col">Insurance</th>
                                <th className="company-col">Company</th>
                                <th className="advance-col">Advance (Rs)</th>
                                <th className="action-col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedAdmissionCard ? (
                                <tr>
                                    <td className="sr-col">--</td>
                                    <td className="admission-ipd-col">{selectedAdmissionCard.admissionIpdNo}</td>
                                    <td className="ipd-file-col">{selectedAdmissionCard.ipdFileNo}</td>
                                    <td className="admission-date-col">{selectedAdmissionCard.admissionDate}</td>
                                    <td className="reason-col">{selectedAdmissionCard.reasonOfAdmission}</td>
                                    <td className="discharge-date-col">{selectedAdmissionCard.dischargeDate}</td>
                                    <td className="insurance-col">{selectedAdmissionCard.insurance}</td>
                                    <td className="company-col">{selectedAdmissionCard.company}</td>
                                    <td className="advance-col">{selectedAdmissionCard.advance.toFixed(2)}</td>
                                    <td className="action-col">
                                    </td>
                                </tr>
                            ) : (
                                <tr>
                                    <td className="sr-col">--</td>
                                    <td className="admission-ipd-col">--</td>
                                    <td className="ipd-file-col">--</td>
                                    <td className="admission-date-col">--</td>
                                    <td className="reason-col">--</td>
                                    <td className="discharge-date-col">--</td>
                                    <td className="insurance-col">--</td>
                                    <td className="company-col">--</td>
                                    <td className="advance-col">--</td>
                                    <td className="action-col">
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Empty Table Template */}
            {showEmptyTable && (
                <div className="mb-4">
                    <div className="table-responsive">
                        <table className="table admission-table">
                            <thead>
                                <tr>
                                    <th className="sr-col">Sr.</th>
                                    <th className="admission-ipd-col">Admission / IPD No</th>
                                    <th className="ipd-file-col">IPD File No</th>
                                    <th className="admission-date-col">Admission Date</th>
                                    <th className="reason-col">Reason of Admission</th>
                                    <th className="discharge-date-col">Discharge Date</th>
                                    <th className="insurance-col">Insurance</th>
                                    <th className="company-col">Company</th>
                                    <th className="advance-col">Advance (Rs)</th>
                                    <th className="action-col">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="empty-table-row">
                                    <td className="sr-col">--</td>
                                    <td className="admission-ipd-col"></td>
                                    <td className="ipd-file-col"></td>
                                    <td className="admission-date-col"></td>
                                    <td className="reason-col"></td>
                                    <td className="discharge-date-col"></td>
                                    <td className="insurance-col"></td>
                                    <td className="company-col"></td>
                                    <td className="advance-col"></td>
                                    <td className="action-col"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="d-flex justify-content-end mt-3">
                        <button
                            className="btn"
                            style={buttonStyle}
                            onClick={handleClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* List of Admitted Patients Section */}
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
                    <table className="table admission-table">
                        <thead>
                            <tr>
                                <th className="sr-col">Sr.</th>
                                <th className="patient-name-col">Patient Name</th>
                                <th className="admission-ipd-col">Admission / IPD No</th>
                                <th className="ipd-file-col">IPD File No</th>
                                <th className="admission-date-col">Admission Date</th>
                                <th className="reason-col">Reason of Admission</th>
                                <th className="discharge-date-col">Discharge Date</th>
                                <th className="insurance-col">Insurance</th>
                                <th className="company-col">Company</th>
                                <th className="advance-col">Advance (Rs)</th>
                                <th className="action-col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loadingAdmissionCards ? (
                                <tr>
                                    <td colSpan={11} className="text-center p-4">
                                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <span className="ms-2">Loading admission cards...</span>
                                    </td>
                                </tr>
                            ) : currentAdmissionCards.length > 0 ? (
                                currentAdmissionCards.map((patient, index) => (
                                    <tr key={patient.sr}>
                                        <td className="sr-col">{startIndex + index + 1}</td>
                                        <td className="patient-name-col">{patient.patientName}</td>
                                        <td className="admission-ipd-col">{patient.admissionIpdNo}</td>
                                        <td className="ipd-file-col">{patient.ipdFileNo}</td>
                                        <td className="admission-date-col">{patient.admissionDate}</td>
                                        <td className="reason-col">{patient.reasonOfAdmission}</td>
                                        <td className="discharge-date-col">{patient.dischargeDate}</td>
                                        <td className="insurance-col">{patient.insurance}</td>
                                        <td className="company-col">{patient.company}</td>
                                        <td className="advance-col">{patient.advance.toFixed(2)}</td>
                                        <td className="action-col">
                                            <button
                                                onClick={() => handleEdit(patient)}
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
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={11} className="text-center p-4 text-muted">
                                        No admission cards found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {admittedPatients.length > 0 && (
                    <div className="pagination-container">
                        <div className="pagination-info">
                            <span>
                                Showing {startIndex + 1} to {Math.min(endIndex, admittedPatients.length)} of {admittedPatients.length} admission cards
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
            </div>

            {/* Admission Card Dialog */}
            <AdmissionCardDialog
                open={showAdmissionCardDialog}
                onClose={handleCloseDialog}
                onSubmit={handleAdmissionCardSubmit}
                patientData={{
                    name: editingPatient?.patientName || "IRAWATI GIRISH KAMAT",
                    id: "01-06-2019-021099",
                    gender: "Female",
                    age: 31
                }}
                disabled={!!editingPatient}
                admissionData={editingPatient ? {
                    admissionIpdNo: editingPatient.admissionIpdNo,
                    ipdFileNo: editingPatient.ipdFileNo,
                    dateOfAdmission: editingPatient.admissionDate,
                    reasonForAdmission: editingPatient.reasonOfAdmission,
                    dateOfDischarge: editingPatient.dischargeDate,
                    insurance: editingPatient.insurance,
                    company: editingPatient.company,
                    firstAdvance: editingPatient.advance.toString(),
                } : undefined}
            />
        </div>
    );
}

