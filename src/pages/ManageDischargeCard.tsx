import React, { useState, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Edit, Close } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { patientService, Patient } from "../services/patientService";
import { admissionService, AdmissionCardDTO, AdmissionCardsRequest } from "../services/admissionService";
import { useSession } from "../store/hooks/useSession";

type DischargeCard = {
    sr: number;
    patientName: string;
    patientId?: string;
    ipdRefNo: string;    
    ipdFileNo: string;
    admissionDate: string;
    dischargeDate: string;
    keywordOperation: string;
    advance: number;
    doctorId: string;
    clinicId: string;
};

export default function ManageDischargeCard() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [searchResults, setSearchResults] = useState<Patient[]>([]);
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchError, setSearchError] = useState<string>("");
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    const { clinicId, doctorId } = useSession();
    const [loadingDischargeCards, setLoadingDischargeCards] = useState<boolean>(false);
    const [searchingDischargeCards, setSearchingDischargeCards] = useState<boolean>(false);

    // Dynamic data from API
    const [dischargeCards, setDischargeCards] = useState<DischargeCard[]>([]);

    // Search results for first table
    const [searchResultsTable, setSearchResultsTable] = useState<DischargeCard[]>([]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);

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

            // Search through the admitted patients list (dischargeCards)
            const q = query.trim().toLowerCase();
            const queryWords = q.split(/\s+/).filter(word => word.length > 0);

            // Filter discharge cards based on search query
            const matchedCards = dischargeCards.filter((card) => {
                const patientName = (card.patientName || '').toLowerCase();
                const patientId = (card.patientId || '').toLowerCase();
                const ipdNo = (card.ipdRefNo || '').toLowerCase();
                const ipdFileNo = (card.ipdFileNo || '').toLowerCase();

                // Check if search term matches patient ID, patient name, IPD number, or IPD file number
                if (patientId.includes(q) || ipdNo.includes(q) || ipdFileNo.includes(q)) {
                    return true;
                }

                // For patient name, check if all query words are found in the name
                if (queryWords.length > 0) {
                    return queryWords.every(word => patientName.includes(word));
                }

                return patientName.includes(q);
            });

            // Convert discharge cards to Patient format for dropdown
            // Limit to first 20 results to avoid too many API calls
            const limitedCards = matchedCards.slice(0, 20);
            const patientResults: Patient[] = [];

            // Fetch patient details in parallel for better performance
            const patientPromises = limitedCards
                .filter(card => card.patientId)
                .map(async (card) => {
                    try {
                        // Fetch patient details by ID
                        const patient = await patientService.getPatient(card.patientId!);
                        return patient;
                    } catch (error) {
                        // If patient fetch fails, create a minimal patient object from card data
                        const nameParts = (card.patientName || '').split(/\s+/).filter(part => part.length > 0);
                        const firstName = nameParts[0] || '';
                        const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';
                        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

                        return {
                            id: card.patientId!,
                            folder_no: '',
                            full_name: card.patientName || '',
                            first_name: firstName,
                            middle_name: middleName || undefined,
                            last_name: lastName,
                            mobile_1: '',
                            date_of_birth: '',
                            gender_id: '0',
                            registration_status: '',
                            date_of_registration: '',
                            age_given: '0',
                            reports_received: false,
                            doctor_id: ''
                        } as Patient;
                    }
                });

            const fetchedPatients = await Promise.all(patientPromises);
            patientResults.push(...fetchedPatients);

            // Sort results by relevance
            const sortedResults = patientResults.sort((a: Patient, b: Patient) => {
                const getScore = (patient: Patient) => {
                    const id = String(patient.id || '').toLowerCase();
                    const firstName = String(patient.first_name || '').toLowerCase();
                    const middleName = String(patient.middle_name || '').toLowerCase();
                    const lastName = String(patient.last_name || '').toLowerCase();
                    const fullName = `${firstName} ${middleName} ${lastName}`.replace(/\s+/g, ' ').trim().toLowerCase();
                    const queryWords = q.split(/\s+/).filter(word => word.length > 0);

                    let score = 0;
                    if (id === q) score += 1000;
                    else if (id.startsWith(q)) score += 800;
                    else if (id.includes(q)) score += 600;

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
        // Set the search term to the patient's full name
        const patientFullName = `${patient.first_name} ${patient.middle_name || ''} ${patient.last_name}`.replace(/\s+/g, ' ').trim();
        setSearchTerm(patientFullName);
        setSearchResults([]);
        setShowDropdown(false);

        console.log("Selected patient:", patient);
        // Note: Table will be populated when user clicks the Search button
    };

    const handleSearch = () => {
        if (!searchTerm.trim()) {
            console.log("Search term is empty");
            setSearchResultsTable([]);
            return;
        }

        try {
            setSearchingDischargeCards(true);
            setSearchError("");

            const searchQuery = searchTerm.trim().toLowerCase();

            // Check if dischargeCards is loaded
            if (dischargeCards.length === 0) {
                console.warn('Discharge cards list is empty. Please wait for the list to load.');
                setSearchResultsTable([]);
                setSearchError("Discharge cards list is not loaded yet. Please wait and try again.");
                setSearchingDischargeCards(false);
                return;
            }

            // Search through the dischargeCards list (admitted patients)
            const filteredResults = dischargeCards.filter((card) => {
                const patientName = (card.patientName || '').toLowerCase().trim();
                const patientId = (card.patientId || '').toLowerCase().trim();
                const ipdNo = (card.ipdRefNo || '').toLowerCase().trim();
                const ipdFileNo = (card.ipdFileNo || '').toLowerCase().trim();

                // Normalize search query - remove extra spaces
                const normalizedQuery = searchQuery.replace(/\s+/g, ' ').trim();
                const normalizedPatientName = patientName.replace(/\s+/g, ' ').trim();

                // Check if search term matches patient ID, patient name, IPD number, or IPD file number
                // For patient name, check both exact match and contains match
                return (
                    patientId === normalizedQuery ||
                    patientId.includes(normalizedQuery) ||
                    normalizedPatientName === normalizedQuery ||
                    normalizedPatientName.includes(normalizedQuery) ||
                    ipdNo === normalizedQuery ||
                    ipdNo.includes(normalizedQuery) ||
                    ipdFileNo === normalizedQuery ||
                    ipdFileNo.includes(normalizedQuery)
                );
            });

            // Map results with sequential serial numbers
            const mappedResults: DischargeCard[] = filteredResults.map((card, index) => ({
                ...card,
                sr: index + 1
            }));

            // Populate the first table with search results
            setSearchResultsTable(mappedResults);

            if (mappedResults.length > 0) {
                console.log(`Search completed. Found ${mappedResults.length} discharge card(s) matching: "${searchTerm}"`);
                console.log('Search results:', mappedResults);
            } else {
                console.log(`No discharge cards found matching: "${searchTerm}"`);
                setSearchError(`No discharge cards found matching: "${searchTerm}"`);
            }
        } catch (error: any) {
            console.error("Error searching discharge cards:", error);
            setSearchError(error.message || "Failed to search discharge cards");
            setSearchResultsTable([]);
        } finally {
            setSearchingDischargeCards(false);
        }
    };

    const handleClear = () => {
        setSearchTerm("");
        setSearchResults([]);
        setSearchResultsTable([]);
        setShowDropdown(false);
    };


    const handleEdit = (card: DischargeCard) => {
        console.log("Editing:", card);
        navigate('/update-discharge-card', {
            state: {
                patientId: card.patientId,
                ipdRefNo: card.ipdRefNo,
                doctorId: card.doctorId,
                clinicId: card.clinicId
            }
        });
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
    const totalPages = Math.ceil(dischargeCards.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentDischargeCards = dischargeCards.slice(startIndex, endIndex);

    // Reset pagination when dischargeCards changes
    useEffect(() => {
        setCurrentPage(1);
    }, [dischargeCards.length]);

    // Fetch discharge cards (admission cards) on component mount
    useEffect(() => {
        const fetchDischargeCards = async () => {
            if (!clinicId) {
                console.warn('ClinicId not available, skipping discharge cards fetch');
                return;
            }

            try {
                setLoadingDischargeCards(true);
                const params: AdmissionCardsRequest = {
                    clinicId: clinicId
                };

                const response = await admissionService.getAdmissionCards(params);

                console.log('Discharge Cards API Response:', response);

                if (response.success && response.data && Array.isArray(response.data)) {
                    // Map the API response to DischargeCard format
                    // Use reasonOfAdmission for keywordOperation
                    const mappedCards: DischargeCard[] = response.data.map((card: AdmissionCardDTO, index: number) => ({
                        sr: index + 1,
                        patientName: card.patientName || '--',
                        patientId: card.patientId,
                        ipdRefNo: card.ipdRefNo || '--',
                        ipdFileNo: card.ipdFileNo || '--',
                        admissionDate: card.admissionDate || '--',
                        dischargeDate: card.dischargeDate || '--',
                        keywordOperation: card.reasonOfAdmission || '--', // Use reasonOfAdmission from API
                        advance: typeof card.advanceRs === 'number' ? card.advanceRs : 0.00,
                        doctorId: card.doctorId,
                        clinicId: card.clinicId
                    }));

                    console.log(`Mapped ${mappedCards.length} discharge cards from admission list:`, mappedCards);
                    setDischargeCards(mappedCards);
                } else {
                    console.error('Failed to fetch discharge cards - Response:', {
                        success: response.success,
                        hasData: !!response.data,
                        isArray: Array.isArray(response.data),
                        dataLength: response.data?.length,
                        error: response.error
                    });
                    setDischargeCards([]);
                }
            } catch (error: any) {
                console.error('Error fetching discharge cards:', error);
                setDischargeCards([]);
            } finally {
                setLoadingDischargeCards(false);
            }
        };

        fetchDischargeCards();
    }, [clinicId]);

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
                    style={{
                        ...buttonStyle,
                        opacity: searchingDischargeCards ? 0.7 : 1,
                        cursor: searchingDischargeCards ? 'not-allowed' : 'pointer'
                    }}
                    onClick={handleSearch}
                    disabled={searchingDischargeCards}
                >
                    {searchingDischargeCards ? 'Searching...' : 'Search'}
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
                <h5 style={{
                    fontWeight: '600',
                    fontSize: '1.1rem',
                    color: '#212121',
                    marginBottom: '16px'
                }}>
                    Search Results
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
                            {searchingDischargeCards ? (
                                <tr>
                                    <td colSpan={9} className="text-center p-4">
                                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <span className="ms-2">Searching...</span>
                                    </td>
                                </tr>
                            ) : searchResultsTable.length > 0 ? (
                                searchResultsTable.map((card, index) => (
                                    <tr key={`search-result-${card.patientId || card.ipdRefNo || index}-${card.sr || index}`}>
                                        <td className="sr-col">{card.sr || index + 1}</td>
                                        <td className="patient-name-col">{card.patientName || '--'}</td>
                                        <td className="ipd-no-col">{card.ipdRefNo || '--'}</td>
                                        <td className="ipd-file-col">{card.ipdFileNo || '--'}</td>
                                        <td className="admission-date-col">{card.admissionDate || '--'}</td>
                                        <td className="discharge-date-col">{card.dischargeDate || '--'}</td>
                                        <td className="keyword-col">{card.keywordOperation || '--'}</td>
                                        <td className="advance-col">{typeof card.advance === 'number' ? card.advance.toFixed(2) : '0.00'}</td>
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
                                ))
                            ) : (
                                <tr className="empty-table-row">
                                    <td className="sr-col">--</td>
                                    <td className="patient-name-col">--</td>
                                    <td className="ipd-no-col">--</td>
                                    <td className="ipd-file-col">--</td>
                                    <td className="admission-date-col">--</td>
                                    <td className="discharge-date-col">--</td>
                                    <td className="keyword-col">--</td>
                                    <td className="advance-col">--</td>
                                    <td className="action-col">--</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
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
                            {loadingDischargeCards ? (
                                <tr>
                                    <td colSpan={9} className="text-center p-4">
                                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <span className="ms-2">Loading discharge cards...</span>
                                    </td>
                                </tr>
                            ) : dischargeCards.length > 0 ? (
                                currentDischargeCards.map((card, index) => (
                                    <tr key={`discharge-card-${card.patientId || card.ipdRefNo || index}-${startIndex + index}`}>
                                        <td className="sr-col">{startIndex + index + 1}</td>
                                        <td className="patient-name-col">{card.patientName || '--'}</td>
                                        <td className="ipd-no-col">{card.ipdRefNo || '--'}</td>
                                        <td className="ipd-file-col">{card.ipdFileNo || '--'}</td>
                                        <td className="admission-date-col">{card.admissionDate || '--'}</td>
                                        <td className="discharge-date-col">{card.dischargeDate || '--'}</td>
                                        <td className="keyword-col">{card.keywordOperation || '--'}</td>
                                        <td className="advance-col">{typeof card.advance === 'number' ? card.advance.toFixed(2) : '0.00'}</td>
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
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={9} className="text-center p-4 text-muted">
                                        No discharge cards found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {dischargeCards.length > 0 && (
                    <div className="pagination-container">
                        <div className="pagination-info">
                            <span>
                                Showing {startIndex + 1} to {Math.min(endIndex, dischargeCards.length)} of {dischargeCards.length} discharge cards
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
        </div>
    );
}

