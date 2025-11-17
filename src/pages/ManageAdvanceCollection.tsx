import React, { useState, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Edit, Close } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { patientService, Patient } from "../services/patientService";
import AddPatientPage from "./AddPatientPage";
import { sessionService } from "../services/sessionService";
import { admissionService, AdmissionCardDTO, AdmissionCardsRequest } from "../services/admissionService";
import { advanceCollectionService, AdvanceCollectionSearchRequest, AdvanceCollectionSearchResultDTO } from "../services/advanceCollectionService";
import { useSession } from "../store/hooks/useSession";
import AdvanceCollectionDialog from "../components/AdvanceCollectionDialog";

// Advance Collection type definition
type AdvanceCollection = {
    sr: number;
    patientName: string;
    patientId?: string;
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
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [searchingAdvanceCards, setSearchingAdvanceCards] = useState<boolean>(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    const [showQuickRegistration, setShowQuickRegistration] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
    const [sessionData, setSessionData] = useState<any>(null);
    const { clinicId, doctorId } = useSession();
    const [loadingAdvanceCollections, setLoadingAdvanceCollections] = useState<boolean>(false);
    const [showAdvanceCollectionDialog, setShowAdvanceCollectionDialog] = useState<boolean>(false);
    const [dialogPatientData, setDialogPatientData] = useState<{ name?: string; id?: string; gender?: string; age?: number } | null>(null);
    const [dialogAdmissionData, setDialogAdmissionData] = useState<any>(null);
    const [loadingAdmissionData, setLoadingAdmissionData] = useState<boolean>(false);

    // Dynamic data from API
    const [advanceCollections, setAdvanceCollections] = useState<AdvanceCollection[]>([]);
    
    // Search results for first table
    const [searchResultsTable, setSearchResultsTable] = useState<AdvanceCollection[]>([]);
    
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

            // Check if query looks like an IPD number (starts with IPD- or contains IPD pattern)
            const isIpdSearch = /^IPD-/i.test(query.trim()) || /IPD/i.test(query.trim());
            
            // Try advance collection search first (supports IPD numbers and patient names)
            // This is especially important for IPD number searches
            try {
                const advanceSearchParams: AdvanceCollectionSearchRequest = {
                    searchStr: query.trim()
                };
                
                console.log('Dropdown: Calling advance collection search API with params:', advanceSearchParams, 'isIpdSearch:', isIpdSearch);
                const advanceResponse = await advanceCollectionService.searchPatientsWithAdvanceCard(advanceSearchParams);
                console.log('Dropdown: Advance collection search API response:', advanceResponse);
                
                if (advanceResponse.success && advanceResponse.data && advanceResponse.data.length > 0) {
                    console.log(`Dropdown: Found ${advanceResponse.data.length} results from advance collection search`);
                    // Map advance collection search results to Patient format for dropdown
                    const mappedPatients: Patient[] = advanceResponse.data.map((result: AdvanceCollectionSearchResultDTO) => {
                        // Parse patient name from the search result (backend provides full name)
                        const fullName = (result.patientName || '').trim();
                        const nameParts = fullName.split(/\s+/).filter(part => part.length > 0);
                        const firstName = nameParts[0] || '';
                        const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';
                        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
                        
                        console.log(`Dropdown: Mapping result - IPD: ${result.ipdRefNo}, Patient: ${result.patientId}, Name: ${fullName}`);
                        
                        return {
                            id: result.patientId,
                            first_name: firstName,
                            middle_name: middleName,
                            last_name: lastName,
                            mobile_1: result.mobile || '',
                            gender_id: 0, // Not available in search response
                            age_given: 0 // Not available in search response
                        };
                    });
                    
                    console.log(`Dropdown: Mapped ${mappedPatients.length} patients for dropdown`);
                    setSearchResults(mappedPatients);
                    setShowDropdown(true);
                    return;
                } else {
                    console.log('Dropdown: Advance collection search returned no results', {
                        success: advanceResponse.success,
                        dataLength: advanceResponse.data?.length,
                        isIpdSearch: isIpdSearch,
                        searchStr: query.trim()
                    });
                    if (isIpdSearch) {
                        // If it's an IPD search and no results, show empty dropdown with "No patients found"
                        setSearchResults([]);
                        setShowDropdown(true); // Show dropdown to display "No patients found"
                        setSearchError(""); // Clear any previous errors
                        return;
                    }
                    // For non-IPD searches, continue to fallback patient search
                }
            } catch (advanceError: any) {
                console.error('Dropdown: Advance collection search failed:', advanceError);
                console.error('Error details:', {
                    message: advanceError.message,
                    response: advanceError.response?.data,
                    status: advanceError.response?.status,
                    url: advanceError.config?.url
                });
                
                if (isIpdSearch) {
                    // For IPD searches, don't fall back - show error
                    setSearchError(advanceError.message || "Failed to search IPD number");
                    setSearchResults([]);
                    setShowDropdown(true); // Show dropdown to display error
                    return;
                }
                // For non-IPD searches, continue to fallback patient search
                console.warn('Dropdown: Advance collection search failed, falling back to patient search');
            }

            // Fallback to regular patient search for non-IPD queries or if advance search fails
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
        
        // Clear selected patient when user types
        setSelectedPatient(null);
        
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
        
        // Store selected patient
        setSelectedPatient(patient);
        
        console.log("Selected patient:", patient);
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            console.log("Search term is empty");
            setSearchResultsTable([]);
            return;
        }

        try {
            setSearchingAdvanceCards(true);
            setSearchError("");
            
            // Use the search API endpoint for patients with advance cards
            // Not passing doctorId or clinicId as per user requirement
            const searchParams: AdvanceCollectionSearchRequest = {
                searchStr: searchTerm.trim()
            };

            console.log('Calling advance collection search API with params:', searchParams);
            const response = await advanceCollectionService.searchPatientsWithAdvanceCard(searchParams);
            
            console.log('Search advance cards response:', response);
            console.log('Response details:', {
                success: response.success,
                count: response.count,
                dataLength: response.data?.length,
                data: response.data
            });
            
            if (response.success && response.data && response.data.length > 0) {
                // Map the search results to AdvanceCollection format for first table
                const mappedCollections: AdvanceCollection[] = response.data.map((result: AdvanceCollectionSearchResultDTO, index: number) => ({
                    sr: index + 1,
                    patientName: result.patientName || '--',
                    patientId: result.patientId,
                    admissionIpdNo: result.ipdRefNo || '--',
                    admissionDate: result.visitDate || '--', // visitDate is the field name in the DTO
                    reasonOfAdmission: '--', // Not available in search response
                    insurance: '--', // Not available in search response
                    dateOfAdvance: '--', // Not available in search response
                    receiptNo: '--', // Not available in search response
                    advance: 0.00 // Not available in search response
                }));
                
                // Update the search results table (first table)
                setSearchResultsTable(mappedCollections);
                
                console.log(`Found ${response.data.length} patients with advance cards`);
            } else {
                console.log("No patients with advance cards found for:", searchTerm);
                // Set empty array to show table with dashes
                setSearchResultsTable([]);
            }
        } catch (error: any) {
            console.error("Error searching advance cards:", error);
            console.error("Error details:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                url: error.config?.url
            });
            const errorMessage = error.message || error.response?.data?.error || "Failed to search advance cards";
            setSearchError(errorMessage);
            // Set empty array to show table with dashes
            setSearchResultsTable([]);
        } finally {
            setSearchingAdvanceCards(false);
        }
    };

    // // Helper function to get gender from gender_id
    // const getGenderFromId = (genderId: number): string => {
    //     switch (genderId) {
    //         case 1: return 'Male';
    //         case 2: return 'Female';
    //         default: return 'N/A';
    //     }
    // };

    const handleNewAdvanceCollection = async () => {
        // Open dialog for new advance collection
        // User needs to select a patient first or search for one
        if (!selectedPatient) {
            setSearchError("Please select a patient first by searching and selecting from the dropdown.");
            return;
        }
        
        const patientIdStr = String(selectedPatient.id);
        const patientName = `${selectedPatient.first_name} ${selectedPatient.middle_name || ''} ${selectedPatient.last_name}`.trim();

        setDialogPatientData({
            name: patientName,
            id: patientIdStr,
            gender: selectedPatient.gender_id.toString(),
            age: selectedPatient.age_given
        });

        try {
            setLoadingAdmissionData(true);
            
            // Fetch full admission data by patient ID
            const response = await admissionService.getAdmissionDataByPatientId(patientIdStr);
            
            console.log('Admission Data by Patient ID Response:', response);
            
            if (response.success && response.data && response.data.length > 0) {
                // Get the first (most recent) admission record
                const admissionData = response.data[0];
                
                // Map API response fields to dialog format
                setDialogAdmissionData({
                    admissionIpdNo: admissionData.ipd_refno || '',
                    ipdFileNo: admissionData.ipdfileno || '',
                    admissionDate: admissionData.admission_date || '',
                    dischargeDate: admissionData.discharge_date || '',
                    reasonOfAdmission: admissionData.reason_of_admission || '',
                    insurance: admissionData.isinsurance ? 'Yes' : 'No',
                    company: admissionData.insurance_company_id || '',
                    advanceRs: admissionData.first_advance || admissionData.advance_rs || 0,
                    department: admissionData.department || '',
                    room: admissionData.roomno || '',
                    bed: admissionData.bedno || '',
                    packageRemarks: admissionData.packageremarks || '',
                    hospitalBillNo: admissionData.hospital_bill_no || '',
                    hospitalBillDate: admissionData.hospital_bill_date || ''
                });
            } else {
                // No admission data found, set minimal data
                console.warn('No admission data found for patient');
                setDialogAdmissionData({
                    admissionIpdNo: '',
                    admissionDate: '',
                    dischargeDate: '',
                    reasonOfAdmission: '',
                    insurance: 'No',
                    company: '',
                    advanceRs: 0,
                    department: '',
                    room: '',
                    bed: '',
                    packageRemarks: '',
                    hospitalBillNo: '',
                    hospitalBillDate: ''
                });
            }
        } catch (error: any) {
            console.error('Error fetching admission data:', error);
            // On error, set minimal data
            setDialogAdmissionData({
                admissionIpdNo: '',
                admissionDate: '',
                dischargeDate: '',
                reasonOfAdmission: '',
                insurance: 'No',
                company: '',
                advanceRs: 0,
                department: '',
                room: '',
                bed: '',
                packageRemarks: '',
                hospitalBillNo: '',
                hospitalBillDate: ''
            });
        } finally {
            setLoadingAdmissionData(false);
            setShowAdvanceCollectionDialog(true);
        }
    };

    const handleEdit = async (collection: AdvanceCollection) => {
        // Open dialog for editing advance collection
        try {
            setLoadingAdmissionData(true);
            
            // Try to get patient details
            let patient: Patient | null = null;
            if (collection.patientId) {
                try {
                    patient = await patientService.getPatient(collection.patientId);
                } catch (error) {
                    console.error('Error fetching patient:', error);
                }
            }

            // If patient not found by ID, try searching by name
            if (!patient && collection.patientName) {
                try {
                    const response = await patientService.searchPatients({
                        query: collection.patientName,
                        status: 'all',
                        page: 0,
                        size: 10
                    });
                    if (response.patients && response.patients.length > 0) {
                        patient = response.patients[0];
                    }
                } catch (error) {
                    console.error('Error searching patient:', error);
                }
            }

            setDialogPatientData(patient ? {
                name: `${patient.first_name} ${patient.middle_name || ''} ${patient.last_name}`.trim(),
                id: String(patient.id),
                gender: patient.gender_id.toString(),
                age: patient.age_given
            } : {
                name: collection.patientName,
                id: collection.patientId
            });

            // Fetch full admission data by patient ID
            if (collection.patientId) {
                try {
                    const response = await admissionService.getAdmissionDataByPatientId(collection.patientId);
                    
                    console.log('Admission Data by Patient ID Response (Edit):', response);
                    
                    if (response.success && response.data && response.data.length > 0) {
                        // Get the first (most recent) admission record
                        const admissionData = response.data[0];
                        
                        // Map API response fields to dialog format
                        setDialogAdmissionData({
                            admissionIpdNo: admissionData.ipd_refno || collection.admissionIpdNo || '',
                            ipdFileNo: admissionData.ipdfileno || '',
                            admissionDate: admissionData.admission_date || collection.admissionDate || '',
                            dischargeDate: admissionData.discharge_date || '',
                            reasonOfAdmission: admissionData.reason_of_admission || collection.reasonOfAdmission || '',
                            insurance: admissionData.isinsurance ? 'Yes' : (collection.insurance || 'No'),
                            company: admissionData.insurance_company_id || '',
                            advanceRs: admissionData.first_advance || admissionData.advance_rs || collection.advance || 0,
                            department: admissionData.department || '',
                            room: admissionData.roomno || '',
                            bed: admissionData.bedno || '',
                            packageRemarks: admissionData.packageremarks || '',
                            hospitalBillNo: admissionData.hospital_bill_no || '',
                            hospitalBillDate: admissionData.hospital_bill_date || ''
                        });
                    } else {
                        // No admission data found, use collection data
                        setDialogAdmissionData({
                            admissionIpdNo: collection.admissionIpdNo,
                            admissionDate: collection.admissionDate,
                            dischargeDate: '',
                            reasonOfAdmission: collection.reasonOfAdmission,
                            insurance: collection.insurance,
                            company: '',
                            advanceRs: collection.advance,
                            department: '',
                            room: '',
                            bed: '',
                            packageRemarks: '',
                            hospitalBillNo: '',
                            hospitalBillDate: ''
                        });
                    }
                } catch (error: any) {
                    console.error('Error fetching admission data:', error);
                    // On error, use collection data
                    setDialogAdmissionData({
                        admissionIpdNo: collection.admissionIpdNo,
                        admissionDate: collection.admissionDate,
                        dischargeDate: '',
                        reasonOfAdmission: collection.reasonOfAdmission,
                        insurance: collection.insurance,
                        company: '',
                        advanceRs: collection.advance,
                        department: '',
                        room: '',
                        bed: '',
                        packageRemarks: '',
                        hospitalBillNo: '',
                        hospitalBillDate: ''
                    });
                }
            } else {
                // No patient ID, use collection data only
                setDialogAdmissionData({
                    admissionIpdNo: collection.admissionIpdNo,
                    admissionDate: collection.admissionDate,
                    dischargeDate: '',
                    reasonOfAdmission: collection.reasonOfAdmission,
                    insurance: collection.insurance,
                    company: '',
                    advanceRs: collection.advance,
                    department: '',
                    room: '',
                    bed: '',
                    packageRemarks: '',
                    hospitalBillNo: '',
                    hospitalBillDate: ''
                });
            }

            setShowAdvanceCollectionDialog(true);
        } catch (error) {
            console.error('Error opening edit dialog:', error);
        } finally {
            setLoadingAdmissionData(false);
        }
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
    const totalPages = Math.ceil(advanceCollections.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentAdvanceCollections = advanceCollections.slice(startIndex, endIndex);

    // Reset pagination when advanceCollections changes
    useEffect(() => {
        setCurrentPage(1);
    }, [advanceCollections.length]);

    const handlePatientNameClick = async (collection: AdvanceCollection) => {
        // If patientId is already available, use it directly
        if (collection.patientId) {
            setSelectedPatientId(collection.patientId);
            setShowQuickRegistration(true);
            return;
        }

        // Otherwise, search for patient by name to get the ID
        try {
            const response = await patientService.searchPatients({
                query: collection.patientName,
                status: 'all',
                page: 0,
                size: 10
            });

            const patients = response.patients || [];
            // Try to find exact match by name
            const matchedPatient = patients.find((p: any) => {
                const fullName = `${p.first_name || ''} ${p.middle_name || ''} ${p.last_name || ''}`.trim();
                return fullName.toLowerCase() === collection.patientName.toLowerCase();
            });

            if (matchedPatient && matchedPatient.id) {
                setSelectedPatientId(String(matchedPatient.id));
                setShowQuickRegistration(true);
            } else if (patients.length > 0 && patients[0].id) {
                // Use first result if exact match not found
                setSelectedPatientId(String(patients[0].id));
                setShowQuickRegistration(true);
            } else {
                console.warn('Patient not found for:', collection.patientName);
            }
        } catch (error) {
            console.error('Error searching for patient:', error);
        }
    };

    // Load session data on component mount
    useEffect(() => {
        const loadSessionData = async () => {
            try {
                const sessionResult = await sessionService.getSessionInfo();
                if (sessionResult.success && sessionResult.data) {
                    setSessionData(sessionResult.data);
                }
            } catch (error) {
                console.error('Error getting session data:', error);
            }
        };
        loadSessionData();
    }, []);

    // Fetch advance collections (admission cards) on component mount
    useEffect(() => {
        const fetchAdvanceCollections = async () => {
            if (!clinicId) {
                console.warn('ClinicId not available, skipping advance collections fetch');
                return;
            }

            try {
                setLoadingAdvanceCollections(true);
                const params: AdmissionCardsRequest = {
                    clinicId: clinicId
                };

                const response = await admissionService.getAdmissionCards(params);
                
                console.log('Advance Collections API Response:', response);
                
                if (response.success && response.data) {
                    // Map the API response to AdvanceCollection format
                    const mappedCollections: AdvanceCollection[] = response.data.map((card: AdmissionCardDTO, index: number) => ({
                        sr: index + 1,
                        patientName: card.patientName || '--',
                        patientId: undefined, // Not available in API response
                        admissionIpdNo: card.admissionIpdNo || '--',
                        admissionDate: card.admissionDate || '--',
                        reasonOfAdmission: card.reasonOfAdmission || '--',
                        insurance: card.insurance || '--',
                        dateOfAdvance: '--', // Not available in API response
                        receiptNo: '--', // Not available in API response
                        advance: card.advanceRs || 0.00
                    }));
                    
                    setAdvanceCollections(mappedCollections);
                } else {
                    console.error('Failed to fetch advance collections:', response.error);
                    setAdvanceCollections([]);
                }
            } catch (error: any) {
                console.error('Error fetching advance collections:', error);
                setAdvanceCollections([]);
            } finally {
                setLoadingAdvanceCollections(false);
            }
        };

        fetchAdvanceCollections();
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
                    style={{
                        ...buttonStyle,
                        opacity: searchingAdvanceCards ? 0.7 : 1,
                        cursor: searchingAdvanceCards ? 'not-allowed' : 'pointer'
                    }}
                    onClick={handleSearch}
                    disabled={searchingAdvanceCards}
                >
                    {searchingAdvanceCards ? 'Searching...' : 'Search'}
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
                <h5 style={{ 
                    fontWeight: '600', 
                    fontSize: '1.1rem', 
                    color: '#212121',
                    marginBottom: '16px'
                }}>
                    Search Results
                </h5>
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
                            {searchingAdvanceCards ? (
                                <tr>
                                    <td colSpan={9} className="text-center p-4">
                                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <span className="ms-2">Searching...</span>
                                    </td>
                                </tr>
                            ) : searchResultsTable.length > 0 ? (
                                searchResultsTable.map((collection, index) => (
                                    <tr 
                                        key={collection.sr || index}
                                        onClick={async () => {
                                            // When clicking on a row, open dialog with that patient's data
                                            if (collection.patientId) {
                                                try {
                                                    // Fetch patient details
                                                    const patient = await patientService.getPatient(collection.patientId);
                                                    
                                                    setDialogPatientData({
                                                        name: `${patient.first_name} ${patient.middle_name || ''} ${patient.last_name}`.trim(),
                                                        id: String(patient.id),
                                                        gender: patient.gender_id.toString(),
                                                        age: patient.age_given
                                                    });

                                                    // Fetch admission data
                                                    setLoadingAdmissionData(true);
                                                    const response = await admissionService.getAdmissionDataByPatientId(collection.patientId);
                                                    
                                                    if (response.success && response.data && response.data.length > 0) {
                                                        const admissionData = response.data[0];
                                                        setDialogAdmissionData({
                                                            admissionIpdNo: admissionData.ipd_refno || collection.admissionIpdNo || '',
                                                            ipdFileNo: admissionData.ipdfileno || '',
                                                            admissionDate: admissionData.admission_date || collection.admissionDate || '',
                                                            dischargeDate: admissionData.discharge_date || '',
                                                            reasonOfAdmission: admissionData.reason_of_admission || collection.reasonOfAdmission || '',
                                                            insurance: admissionData.isinsurance ? 'Yes' : (collection.insurance || 'No'),
                                                            company: admissionData.insurance_company_id || '',
                                                            advanceRs: admissionData.first_advance || admissionData.advance_rs || collection.advance || 0,
                                                            department: admissionData.department || '',
                                                            room: admissionData.roomno || '',
                                                            bed: admissionData.bedno || '',
                                                            packageRemarks: admissionData.packageremarks || '',
                                                            hospitalBillNo: admissionData.hospital_bill_no || '',
                                                            hospitalBillDate: admissionData.hospital_bill_date || ''
                                                        });
                                                    } else {
                                                        setDialogAdmissionData({
                                                            admissionIpdNo: collection.admissionIpdNo,
                                                            admissionDate: collection.admissionDate,
                                                            dischargeDate: '',
                                                            reasonOfAdmission: collection.reasonOfAdmission,
                                                            insurance: collection.insurance,
                                                            company: '',
                                                            advanceRs: collection.advance,
                                                            department: '',
                                                            room: '',
                                                            bed: '',
                                                            packageRemarks: '',
                                                            hospitalBillNo: '',
                                                            hospitalBillDate: ''
                                                        });
                                                    }
                                                    
                                                    setShowAdvanceCollectionDialog(true);
                                                } catch (error) {
                                                    console.error('Error opening dialog from search result:', error);
                                                } finally {
                                                    setLoadingAdmissionData(false);
                                                }
                                            }
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <td className="sr-col">{collection.sr}</td>
                                        <td className="admission-ipd-col">{collection.admissionIpdNo}</td>
                                        <td className="admission-date-col">{collection.admissionDate}</td>
                                        <td className="reason-col">{collection.reasonOfAdmission}</td>
                                        <td className="insurance-col">{collection.insurance}</td>
                                        <td className="date-advance-col">{collection.dateOfAdvance}</td>
                                        <td className="receipt-col">{collection.receiptNo}</td>
                                        <td className="advance-col">{collection.advance.toFixed(2)}</td>
                                        <td className="action-col" onClick={(e) => e.stopPropagation()}>
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
                                ))
                            ) : (
                                <tr className="empty-table-row">
                                    <td className="sr-col">--</td>
                                    <td className="admission-ipd-col">--</td>
                                    <td className="admission-date-col">--</td>
                                    <td className="reason-col">--</td>
                                    <td className="insurance-col">--</td>
                                    <td className="date-advance-col">--</td>
                                    <td className="receipt-col">--</td>
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
                            {loadingAdvanceCollections ? (
                                <tr>
                                    <td colSpan={10} className="text-center p-4">
                                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <span className="ms-2">Loading advance collections...</span>
                                    </td>
                                </tr>
                            ) : advanceCollections.length > 0 ? (
                                currentAdvanceCollections.map((collection, index) => (
                                    <tr key={collection.sr}>
                                        <td className="sr-col">{startIndex + index + 1}</td>
                                        <td 
                                            className="patient-name-col"
                                            onClick={() => handlePatientNameClick(collection)}
                                            style={{
                                                cursor: 'pointer',
                                                textDecoration: 'underline',
                                                color: '#1E88E5'
                                            }}
                                            title="Click to view patient details"
                                        >
                                            {collection.patientName}
                                        </td>
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
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={10} className="text-center p-4 text-muted">
                                        No advance collections found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {advanceCollections.length > 0 && (
                    <div className="pagination-container">
                        <div className="pagination-info">
                            <span>
                                Showing {startIndex + 1} to {Math.min(endIndex, advanceCollections.length)} of {advanceCollections.length} advance collections
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

            {/* Quick Registration Modal */}
            {showQuickRegistration && selectedPatientId && (
                <AddPatientPage
                    open={showQuickRegistration}
                    onClose={() => {
                        setShowQuickRegistration(false);
                        setSelectedPatientId(null);
                    }}
                    patientId={selectedPatientId}
                    readOnly={true}
                    doctorId={sessionData?.doctorId}
                    clinicId={sessionData?.clinicId}
                />
            )}

            {/* Advance Collection Dialog */}
            <AdvanceCollectionDialog
                open={showAdvanceCollectionDialog}
                onClose={() => {
                    setShowAdvanceCollectionDialog(false);
                    setDialogPatientData(null);
                    setDialogAdmissionData(null);
                }}
                onSubmit={(data) => {
                    // Refresh the advance collections list after successful submission
                    // This will be handled by the dialog's internal refresh
                    console.log('Advance collection submitted:', data);
                }}
                patientData={dialogPatientData || undefined}
                admissionData={dialogAdmissionData || undefined}
            />
        </div>
    );
}

