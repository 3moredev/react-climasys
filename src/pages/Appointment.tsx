import React, { useState, useEffect, useRef, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { List, CreditCard, MoreVert, Add as AddIcon, Save, Delete, Info, FastForward, Close, ChatBubbleOutline, Phone, SwapHoriz } from "@mui/icons-material";
import { appointmentService, Appointment, AppointmentRequest, TodayAppointmentsResponse, getDoctorStatusReference, getStatusOptionsByClinic } from "../services/appointmentService";
import { doctorService, DoctorDetail, Doctor } from "../services/doctorService";
import { patientService, Patient, formatVisitDateTime, getVisitStatusText } from "../services/patientService";
import type { PatientVisit } from "../services/patientService";
import { useNavigate, useLocation } from "react-router-dom";
import AddPatientPage from "./AddPatientPage";
import { sessionService, SessionInfo } from "../services/sessionService";

type AppointmentRow = {
    reports_received: any;
    appointmentId?: string;
    sr: number;
    patient: string;
    patientId: string;
    visitDate?: string;
    age: number;
    contact: string;
    time: string;
    provider: string;
    online: string;
    statusColor: string;
    status: string;
    lastOpd: string;
    labs: string;
    doctorId?: string;
    actions: boolean;
};


export default function AppointmentTable() {
    const [doctorDetails, setDoctorDetails] = useState<DoctorDetail[] | null>(null);
    const [doctorError, setDoctorError] = useState<string>("");
    const [doctorFirstName, setDoctorFirstName] = useState<string>("");
    const [providerOptions, setProviderOptions] = useState<string[]>([]);
    const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
    const [openStatusIndex, setOpenStatusIndex] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [searchResults, setSearchResults] = useState<Patient[]>([]);
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const [selectedPatients, setSelectedPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchError, setSearchError] = useState<string>("");
    const [activeView, setActiveView] = useState<'list' | 'card'>('list');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const searchRef = useRef<HTMLDivElement>(null);
    const filterBtnRef = useRef<HTMLButtonElement>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [showAddPatient, setShowAddPatient] = useState<boolean>(false);
    const [openActionIndex, setOpenActionIndex] = useState<number | null>(null);
    const [actionMenuPosition, setActionMenuPosition] = useState<{ top: number; left: number } | null>(null);
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [filterName, setFilterName] = useState<string>("");
    const [filterContact, setFilterContact] = useState<string>("");
    const [filterStatus, setFilterStatus] = useState<string>("");
    const [filterSize, setFilterSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
    
    // Session data state
    const [sessionData, setSessionData] = useState<SessionInfo | null>(null);
    const [doctorId, setDoctorId] = useState<string>('');
    const [clinicId, setClinicId] = useState<string>('');
    
    // Doctor selection state
    const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
    const [loadingDoctors, setLoadingDoctors] = useState<boolean>(false);

    // Fetch session data on component mount
    useEffect(() => {
        const fetchSessionData = async () => {
            try {
                console.log('=== FETCHING SESSION DATA ===');
                const result = await sessionService.getSessionInfo();
                if (result.success && result.data) {
                    console.log('Session data received:', result.data);
                    setSessionData(result.data);
                    setDoctorId(result.data.doctorId);
                    setClinicId(result.data.clinicId);
                    console.log('Doctor ID set to:', result.data.doctorId);
                    console.log('Clinic ID set to:', result.data.clinicId);
                } else {
                    console.error('Failed to fetch session data:', result.error);
                }
            } catch (error) {
                console.error('Error fetching session data:', error);
            }
        };

        fetchSessionData();
    }, []);

    // Fetch all doctors when component mounts
    useEffect(() => {
        const fetchAllDoctors = async () => {
            setLoadingDoctors(true);
            try {
                console.log('Fetching all doctors...');
                const doctors = await doctorService.getAllDoctors();
                setAllDoctors(doctors);
                
                // Set the first doctor as default selection if none is selected
                if (doctors.length > 0 && !selectedDoctorId) {
                    setSelectedDoctorId(doctors[0].id);
                }
                
                console.log('All doctors loaded:', doctors);
            } catch (error) {
                console.error('Error fetching all doctors:', error);
            } finally {
                setLoadingDoctors(false);
            }
        };

        fetchAllDoctors();
    }, [selectedDoctorId]);

    const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
    const [previousVisits, setPreviousVisits] = useState<Record<string, PatientVisit[]>>({});
    const [loadingVisits, setLoadingVisits] = useState<Record<string, boolean>>({});
    const searchInputRef = useRef<HTMLInputElement | null>(null);
    const [searchMenuPosition, setSearchMenuPosition] = useState<{ top: number; left: number; width: number } | null>(null);


    // Convert Patient data to table format
    const convertToTableFormat = (patients: Patient[]): AppointmentRow[] => {
        return patients.map((patient, index) => {
            // Prefer backend-provided age_given; fallback to DOB-derived age
            const dobMs = patient.date_of_birth ? new Date(patient.date_of_birth).getTime() : NaN;
            const dobAge = Number.isFinite(dobMs)
                ? Math.floor((Date.now() - dobMs) / (365.25 * 24 * 60 * 60 * 1000))
                : 0;
            const resolvedAge = typeof (patient as any).age_given === 'number' && (patient as any).age_given > 0
                ? (patient as any).age_given
                : dobAge;
            
            return {
                sr: appointments.length + index + 1,
                patientId: String(patient.id),
                patient: `${patient.first_name} ${patient.last_name}`,
                age: resolvedAge,
                contact: patient.mobile_1 || "",
                time: "10:00", // Current time as placeholder
                provider: "Dr.Tongaonkar", // Placeholder - you might want to get this from another API
                online: "", // Default value
                status: 'WAITING',
                statusColor: getStatusColor('WAITING'),
                lastOpd: "27 Sep 2025", // Placeholder
                labs: "No Reports", // Placeholder
                reports_received: patient.reports_received,
                actions: true
            };
        });
    };

    const formatProviderLabel = (name?: string): string => {
        const raw = String(name || '').trim();
        if (!raw) return '';
        const lower = raw.toLowerCase();
        if (lower.startsWith('dr.') || lower.startsWith('dr ')) return raw;
        return `Dr. ${raw}`;
    };

    // Convert SP endpoint resultSet1 rows to AppointmentRow format (best-effort field resolution)
    const convertSPResultToRows = (rows: any[]): AppointmentRow[] => {
        const toStringSafe = (v: any) => (v === null || v === undefined) ? '' : String(v);
        const toNumberSafe = (v: any) => {
            const n = Number(v);
            return Number.isFinite(n) ? n : 0;
        };
        const getField = (obj: any, candidates: string[], fallback: any = ''): any => {
            for (const key of candidates) {
                if (obj && obj[key] !== undefined && obj[key] !== null && toStringSafe(obj[key]).trim() !== '') {
                    return obj[key];
                }
            }
            return fallback;
        };
        return rows.map((row, index) => {
            // Use patient_id from the API response as the actual database patient ID (string, can be alphanumeric)
            const patientIdRaw = getField(row, ['patient_id','patientId','id','patientID'], '');
            const patientName = toStringSafe(getField(row, ['patientName','patient_name','fullName','full_name','name'], ''));
            const age = toNumberSafe(getField(row, ['age_given','age','patientAge','patient_age'], 0));
            const mobile = toStringSafe(getField(row, ['mobileNumber','mobile_number','contact','phone','mobile'], ''));
            const apptDate = toStringSafe(getField(row, ['appointmentDate','appointment_date','visitDate','visit_date'], new Date().toISOString().split('T')[0]));
            const apptTime = toStringSafe(getField(row, ['visit_time','appointmentTime','appointment_time','visitTime'], ''));
            const doctor = toStringSafe(getField(row, ['doctor_name','doctorName','provider','providerName'], doctorFirstName || 'Tongaonkar'));
            const status = toStringSafe(getField(row, ['status_description','status','appointmentStatus','appointment_status'], 'WAITING')).toUpperCase();
            const lastOpd = toStringSafe(getField(row, ['lastOpdVisit','last_opd_visit','lastVisit','last_visit'], ''));
            const onlineTime = toStringSafe(getField(row, ['onlineAppointmentTime','online_time','onlineTime'], ''));
            const reportsAsked = !!getField(row, ['reportsAsked','reports_asked','reportsReceived','reports_received'], false);
            
            // Fix time formatting - ensure proper HH:mm format
            let formattedTime = '00:00'; // Default fallback
            
            
            if (apptTime && apptTime !== 'null' && apptTime !== 'undefined') {
                const timeStr = String(apptTime).trim();
                
                if (timeStr.includes(':')) {
                    // Already in HH:mm format
                    const parts = timeStr.split(':');
                    if (parts.length >= 2) {
                        const hours = parseInt(parts[0], 10);
                        const minutes = parseInt(parts[1], 10);
                        if (!isNaN(hours) && !isNaN(minutes)) {
                            formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                        }
                    }
                } else if (timeStr.length === 4 && /^\d{4}$/.test(timeStr)) {
                    // HHMM format (e.g., "1430")
                    const hours = parseInt(timeStr.substring(0, 2), 10);
                    const minutes = parseInt(timeStr.substring(2, 4), 10);
                    if (!isNaN(hours) && !isNaN(minutes)) {
                        formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                    }
                } else if (timeStr.length === 3 && /^\d{3}$/.test(timeStr)) {
                    // HMM format (e.g., "930")
                    const hours = parseInt(timeStr.substring(0, 1), 10);
                    const minutes = parseInt(timeStr.substring(1, 3), 10);
                    if (!isNaN(hours) && !isNaN(minutes)) {
                        formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                    }
                } else if (!isNaN(Number(timeStr)) && Number(timeStr) > 0) {
                    // Numeric time (e.g., 1430, 930)
                    const numTime = Number(timeStr);
                    if (numTime < 100) {
                        // Just minutes (e.g., 30)
                        formattedTime = `00:${String(numTime).padStart(2, '0')}`;
                    } else if (numTime < 1000) {
                        // HMM format (e.g., 930)
                        const hours = Math.floor(numTime / 100);
                        const minutes = numTime % 100;
                        formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                    } else {
                        // HHMM format (e.g., 1430)
                        const hours = Math.floor(numTime / 100);
                        const minutes = numTime % 100;
                        formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                    }
                }
            }
            
            const timeString = `${apptDate}T${formattedTime}:00`;
            
            // Store the formatted time directly instead of creating a Date object
            let displayTime: string;
            try {
                const dateObj = new Date(timeString);
                if (isNaN(dateObj.getTime())) {
                    // If date parsing fails, use formatted time as fallback
                    displayTime = formattedTime;
                } else {
                    // Use the formatted time directly, not the Date object
                    displayTime = formattedTime;
                }
            } catch (error) {
                console.error('Date parsing error:', error, 'timeString:', timeString);
                displayTime = formattedTime;
            }
            
            const finalPatientId = String(patientIdRaw || '');
            
            return {
                appointmentId: toStringSafe(getField(row, ['appointmentId','appointment_id','id'], '')),
                sr: index + 1,
                patientId: finalPatientId,
                patient: patientName,
                visitDate: toStringSafe(getField(row, ['appointmentDate','appointment_date','visitDate','visit_date'], '')),
                age: age,
                contact: mobile,
                time: displayTime,
                provider: doctorId,
                online: onlineTime || '',
                status: status,
                statusColor: getStatusColor(status),
                lastOpd: lastOpd,
                labs: '',
                reports_received: reportsAsked,
                doctorId: toStringSafe(getField(row, ['doctor_id','doctorId'], '')),
                actions: true
            };
        });
    };

    // Normalize status for display
    const normalizeStatusLabel = (status: string): string => {
        const s = String(status || '').trim().toUpperCase();
        if (s === 'ON CALL') return 'WITH DOCTOR (ON PHONE)';
        if (s === 'COMPLETED') return 'COMPLETE';
        if (s === 'SAVED') return 'SAVE';
        return s;
    };

    // Get status color mapping for appointment workflow
    const getStatusColor = (status: string): string => {
        const normalized = normalizeStatusLabel(status);
        switch (normalized) {
            case 'WAITING': return 'bg-primary';
            case 'WITH DOCTOR': return 'bg-success';
            case 'WITH DOCTOR (ON PHONE)': return 'bg-info';
            case 'CHECK OUT': return 'bg-warning';
            case 'COMPLETE': return 'bg-dark';
            case 'SAVE': return 'bg-danger';
            default: return 'bg-secondary';
        }
    };

    // Map UI status label to backend statusId
    const mapStatusLabelToId = (status: string): number => {
        const s = normalizeStatusLabel(status);
        switch (s) {
            case 'WAITING': return 1;
            case 'WITH DOCTOR': return 2;
            case 'COMPLETED': return 3;
            case 'CHECK OUT': return 4;
            case 'ON CALL': return 5;
            case 'SAVE': return 6;
            default: return 1;
        }
    };

    // Get latest (max) visit number for a patient from loaded visits
    const getLatestVisitNumber = (patientId: string | number): number => {
        const key = String(patientId);
        const visits = previousVisits[key] || [];
        if (!visits.length) return 1;
        return visits.reduce((max, v) => {
            const n = typeof v.visit_number === 'number' ? v.visit_number : Number(v.visit_number) || 0;
            return n > max ? n : max;
        }, 1);
    };

    // Convert backend Appointment objects to AppointmentRow format
    const convertAppointmentsToRows = (items: Appointment[]): AppointmentRow[] => {
        return items.map((item, index) => {
            const timeString = `${item.appointmentDate}T${String(item.appointmentTime || '00:00').padStart(5, '0')}:00`;
            const status = (item.status || '').toUpperCase();
            return {
                appointmentId: item.appointmentId,
                sr: index + 1,
                patientId: String(item.patientId || ''),
                patient: item.patientName || '',
                visitDate: item.appointmentDate || '',
                age: typeof item.age === 'number' ? item.age : 0,
                contact: item.mobileNumber || '',
                time: new Date(timeString).toString(),
                provider: formatProviderLabel(item.doctorName || doctorFirstName || 'Tongaonkar'),
                online: item.onlineAppointmentTime || '',
                status: status,
                statusColor: getStatusColor(status),
                lastOpd: String(item.lastOpdVisit || ''),
                labs: '',
                reports_received: item.reportsAsked ?? false,
                doctorId: '',
                actions: true
            };
        });
    };

    // Enhanced search for patients using backend API
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
                size: 50 // Increased size to get more results for comprehensive search
            });
            
            const q = query.trim().toLowerCase();
            const patients = response.patients || [];
            
            
            // Enhanced search with multiple criteria and priority
            const searchResults = patients.filter((p: any) => {
                const patientId = String(p.id || '').toLowerCase();
                const firstName = String(p.first_name || '').toLowerCase();
                const lastName = String(p.last_name || '').toLowerCase();
                const fullName = `${firstName} ${lastName}`.trim().toLowerCase();
                const contact = String(p.mobile_1 || '').replace(/\D/g, ''); // Remove non-digits
                const queryDigits = q.replace(/\D/g, ''); // Remove non-digits from query
                
                // Check if query matches any of the search criteria
                return (
                    // Exact patient ID match (highest priority)
                    patientId === q ||
                    // Patient ID contains query
                    patientId.includes(q) ||
                    // First name starts with query
                    firstName.startsWith(q) ||
                    // Last name starts with query
                    lastName.startsWith(q) ||
                    // Full name contains query
                    fullName.includes(q) ||
                    // Contact number exact match (if query is numeric)
                    (queryDigits.length >= 3 && contact.includes(queryDigits)) ||
                    // First name contains query
                    firstName.includes(q) ||
                    // Last name contains query
                    lastName.includes(q)
                );
            });
            
            
            // Sort results by priority and relevance
            const sortedResults = searchResults.sort((a: any, b: any) => {
                const aId = String(a.id || '').toLowerCase();
                const aFirstName = String(a.first_name || '').toLowerCase();
                const aLastName = String(a.last_name || '').toLowerCase();
                const aFullName = `${aFirstName} ${aLastName}`.trim().toLowerCase();
                const aContact = String(a.mobile_1 || '').replace(/\D/g, '');
                const queryDigits = q.replace(/\D/g, '');
                
                const bId = String(b.id || '').toLowerCase();
                const bFirstName = String(b.first_name || '').toLowerCase();
                const bLastName = String(b.last_name || '').toLowerCase();
                const bFullName = `${bFirstName} ${bLastName}`.trim().toLowerCase();
                const bContact = String(b.mobile_1 || '').replace(/\D/g, '');
                
                // Priority scoring system
                const getScore = (patient: any) => {
                    const id = String(patient.id || '').toLowerCase();
                    const firstName = String(patient.first_name || '').toLowerCase();
                    const lastName = String(patient.last_name || '').toLowerCase();
                    const fullName = `${firstName} ${lastName}`.trim().toLowerCase();
                    const contact = String(patient.mobile_1 || '').replace(/\D/g, '');
                    
                    let score = 0;
                    
                    // Exact patient ID match (highest priority)
                    if (id === q) score += 1000;
                    // Patient ID starts with query
                    else if (id.startsWith(q)) score += 800;
                    // Patient ID contains query
                    else if (id.includes(q)) score += 600;
                    
                    // First name starts with query
                    if (firstName.startsWith(q)) score += 500;
                    // Last name starts with query
                    if (lastName.startsWith(q)) score += 400;
                    // Full name starts with query
                    if (fullName.startsWith(q)) score += 300;
                    
                    // Contact exact match
                    if (queryDigits.length >= 3 && contact === queryDigits) score += 200;
                    // Contact contains query
                    if (queryDigits.length >= 3 && contact.includes(queryDigits)) score += 100;
                    
                    // First name contains query
                    if (firstName.includes(q)) score += 50;
                    // Last name contains query
                    if (lastName.includes(q)) score += 40;
                    // Full name contains query
                    if (fullName.includes(q)) score += 30;
                    
                    return score;
                };
                
                const aScore = getScore(a);
                const bScore = getScore(b);
                
                // Sort by score (descending), then by name
                if (aScore !== bScore) {
                    return bScore - aScore;
                }
                
                // If scores are equal, sort alphabetically by first name, then last name
                if (aFirstName !== bFirstName) {
                    return aFirstName.localeCompare(bFirstName);
                }
                return aLastName.localeCompare(bLastName);
            });
            

            setSearchResults(sortedResults);
            setShowDropdown(sortedResults.length > 0);
        } catch (error: any) {
            console.error("Error searching patients:", error);
            setSearchResults([]);
            setShowDropdown(false);
            setSearchError(error.message || "Failed to search patients");
        } finally {
            setLoading(false);
        }
    };

     // Fetch doctor details for the session doctor (for backward compatibility)
      useEffect(() => {
        const doctorId = sessionData?.doctorId || '';
        if (!doctorId) return;
        
        (async () => {
            try {
                // Try to get the doctor's first name from the all doctors list first
                if (allDoctors.length > 0) {
                    const sessionDoctor = allDoctors.find(doctor => doctor.id === doctorId);
                    if (sessionDoctor) {
                        // Extract first name from the doctor's name
                        const firstName = sessionDoctor.firstName || 
                                        sessionDoctor.name.split(' ')[0] || 
                                        'Doctor';
                        setDoctorFirstName(firstName);
                        setDoctorError("");
                        return;
                    }
                }
                
                // Fallback: try to get doctor details (this might fail if endpoint doesn't exist)
                try {
                    const details = await doctorService.getDoctorDetails(doctorId);
                    setDoctorDetails(details);
                    setDoctorError("");
                    const fname = await doctorService.getDoctorFirstName(doctorId);
                    setDoctorFirstName(fname || "");
                } catch (detailsError) {
                    console.warn('Doctor details endpoint not available, using fallback:', detailsError);
                    // Use a fallback first name
                    setDoctorFirstName('Doctor');
                    setDoctorError("");
                }
            } catch (e: any) {
                console.error('Error fetching doctor information:', e);
                setDoctorDetails(null);
                setDoctorError(e?.message || 'Failed to fetch doctor details');
                setDoctorFirstName('Doctor'); // Fallback
            }
        })();
    }, [sessionData?.doctorId, allDoctors]);

    // Load today's appointments based on selected doctor via SP-based endpoint
    useEffect(() => {
        if (!selectedDoctorId || !sessionData?.clinicId) return;
        
        (async () => {
            try {
                const today = new Date().toISOString().split('T')[0];
                const doctorId = selectedDoctorId; // Use selected doctor from dropdown
                const clinicId = sessionData.clinicId;
                
                console.log('📅 Loading appointments for selected doctor:', doctorId, 'clinic:', clinicId);
                
                const resp: TodayAppointmentsResponse = await appointmentService.getAppointmentsForDateSP({
                    doctorId,
                    clinicId,
                    futureDate: today,
                    languageId: 1
                });
                console.log('📅 Today\'s appointments loaded for doctor', doctorId, ':', (resp?.resultSet1 || []).length, 'appointments');
                const rows = convertSPResultToRows(resp?.resultSet1 || []);
                setAppointments(rows);
            } catch (e) {
                console.error('Failed to load today\'s appointments (SP endpoint)', e);
            }
        })();
    }, [selectedDoctorId, sessionData?.clinicId]);

    // Load status reference for dynamic statuses
    useEffect(() => {
        (async () => {
            try {
                const ref = await getDoctorStatusReference();
                
                const pickLabel = (row: any): string | null => {
                    const candidates = ['status_description','statusDescription','description','name','label','status'];
                    for (const key of candidates) {
                        if (row && row[key]) {
                            const val = String(row[key]).trim();
                            if (val) return val.toUpperCase();
                        }
                    }
                    return null;
                };
                
                const labels = Array.from(new Set((ref || []).map(pickLabel).filter(Boolean))) as string[];
                setAvailableStatuses(labels);
            } catch (e) {
                console.error('❌ Failed to load status reference', e);
                setAvailableStatuses([]);
            }
        })();
    }, []);

    // Fetch previous visits for all appointments when appointments change
    useEffect(() => {
        if (appointments.length > 0) {
            appointments.forEach(appointment => {
                // Ensure patientId is passed as string key (supports alphanumeric IDs)
                if (appointment.patientId) {
                    fetchPreviousVisits(appointment.patientId);
                }
            });
        }
    }, [appointments]);

    // Handle search input change
    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        searchPatients(value);
    };

    // Handle patient selection from dropdown - only allow one patient
    const handlePatientSelect = (patient: Patient) => {
        // Clear any existing selection and select only this patient
        setSelectedPatients([patient]);
        
        setSearchTerm("");
        setSearchResults([]);
        setShowDropdown(false);
    };

    // Remove selected patient
    const removeSelectedPatient = (patientId: number) => {
        setSelectedPatients(prev => prev.filter(p => p.id !== patientId));
    };

    // Fetch previous visits for a patient
    const fetchPreviousVisits = async (patientId: string | number) => {
        const key = String(patientId);
        if (previousVisits[key] || loadingVisits[key]) {
            return; // Already loaded or loading
        }

        try {
            setLoadingVisits(prev => ({ ...prev, [key]: true }));
            const response = await patientService.getPreviousVisitDates(key);
            // Sort by visit_number descending so highest visit_number is first
            const sortedVisits = [...(response.visits || [])].sort((a, b) => {
                const an = typeof a.visit_number === 'number' ? a.visit_number : Number(a.visit_number) || 0;
                const bn = typeof b.visit_number === 'number' ? b.visit_number : Number(b.visit_number) || 0;
                return an - bn;
            });

            setPreviousVisits(prev => ({ ...prev, [key]: sortedVisits }));
        } catch (error) {
            console.error(`❌ Failed to fetch previous visits for patient ${key}:`, error);
            setPreviousVisits(prev => ({ ...prev, [key]: [] }));
        } finally {
            setLoadingVisits(prev => ({ ...prev, [key]: false }));
        }
    };

    // Format last visit display according to requirements: date-provider-L format
    const formatLastVisitDisplay = (patientId: string | number, reportsReceived: boolean): string => {
        const key = String(patientId);
        const visits = previousVisits[key];
        
        if (!visits || visits.length === 0) {
            return "-";
        }

        // Get the most recent visit (first in the array since they're ordered by date DESC)
        const lastVisit = visits[0];
        
        // Format date as DD-MM-YY
        const visitDate = new Date(lastVisit.visit_date);
        const formattedDate = `${String(visitDate.getDate()).padStart(2, '0')}-${String(visitDate.getMonth() + 1).padStart(2, '0')}-${String(visitDate.getFullYear()).slice(-2)}`;
        
        // Get provider name from doctor_id (prefer mapping to real doctor name)
        let providerName = getDoctorLabelById(lastVisit.doctor_id);
        if (!providerName) {
            const rawId = String(lastVisit.doctor_id || '').trim();
            if (rawId) {
                providerName = rawId.startsWith('DR-') ? `Dr. ${rawId.slice(3)}` : formatProviderLabel(rawId);
            } else {
                providerName = 'Unknown Provider';
            }
        }
        
        // Build the display string: date - provider
        let displayText = `${formattedDate} - ${providerName}`;
        
        // Add "L" if reports were received
        if (reportsReceived) {
            displayText += ' - L';
        }
        
        return displayText;
    };

    // Get selected doctor name for display
    const getSelectedDoctorName = () => {
        const selectedDoctor = allDoctors.find(doctor => doctor.id === selectedDoctorId);
        return selectedDoctor ? selectedDoctor.name : (doctorFirstName || 'Dr. Tongaonkar');
    };

    // Map doctorId to display label (Dr. Name)
    const getDoctorLabelById = (id?: string) => {
        if (!id) return '';
        const doc = allDoctors.find(d => d.id === id);
        return doc ? formatProviderLabel(doc.name) : '';
    };

    // Build provider options with selected doctor first
    const getProviderOptionsWithSelectedFirst = () => {
        if (!allDoctors.length) return [] as { id: string; label: string }[];
        const selectedId = selectedDoctorId;
        const options = allDoctors.map(d => ({ id: d.id, label: formatProviderLabel(d.name) }));
        if (!selectedId) return options;
        // Move selected to the top
        return options.sort((a, b) => (a.id === selectedId ? -1 : b.id === selectedId ? 1 : a.label.localeCompare(b.label)));
    };

    // Refresh appointments for the selected doctor
    const refreshAppointmentsForSelectedDoctor = async () => {
        if (!selectedDoctorId || !sessionData?.clinicId) return;
        
        try {
            const today = new Date().toISOString().split('T')[0];
            console.log('🔄 Refreshing appointments for selected doctor:', selectedDoctorId);
            
            const resp: TodayAppointmentsResponse = await appointmentService.getAppointmentsForDateSP({
                doctorId: selectedDoctorId,
                clinicId: sessionData.clinicId,
                futureDate: today,
                languageId: 1
            });
            
            const rows = convertSPResultToRows(resp?.resultSet1 || []);
            setAppointments(rows);
            console.log('✅ Appointments refreshed for doctor', selectedDoctorId, ':', rows.length, 'appointments');
        } catch (error) {
            console.error('Failed to refresh appointments for selected doctor:', error);
        }
    };

    // Book appointment - immediately call API
    const handleBookAppointment = async () => {
        if (selectedPatients.length === 0) {
            alert("Please select a patient to book an appointment.");
            return;
        }

        if (selectedPatients.length > 1) {
            alert("Please select only one patient at a time.");
            return;
        }

        if (!selectedDoctorId) {
            alert("Please select a doctor for the appointment.");
            return;
        }

        const patient = selectedPatients[0];
        
        try {
            // Block booking if patient has any non-COMPLETED appointment today
            const hasNonCompletedAppointment = appointments.some(
                (a) => a.patientId === String(patient.id) && String(a.status || '').toUpperCase() !== 'COMPLETED'
            );
            if (hasNonCompletedAppointment) {
                alert("This patient has an existing appointment that is not COMPLETED. Please complete it before booking a new one.");
                return;
            }

            const now = new Date();
            const hh = String(now.getHours()).padStart(2, '0');
            const mm = String(now.getMinutes()).padStart(2, '0');
            const currentVisitTime = `${hh}:${mm}`;

            const appointmentData: AppointmentRequest = {
                visitDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
                shiftId: 1, // Default shift ID
                clinicId: sessionData?.clinicId ?? '', // Default clinic ID
                doctorId: selectedDoctorId, // Use selected doctor from dropdown (this is the key change)
                patientId: String(patient.id),
                visitTime: currentVisitTime, // Real-time visit time (HH:mm)
                reportsReceived: false, // Default value
                inPerson: true // Default to in-person appointment
            };
            
            console.log('Selected doctor ID for appointment:', selectedDoctorId);
            console.log('Selected doctor name:', getSelectedDoctorName());
            
            console.log('Booking appointment with data:', appointmentData);

            const result = await appointmentService.bookAppointment(appointmentData);
            console.log('Booking result:', result);
            
            if (result.success) {
                // Refresh appointments from server to get the correct status and time
                // Note: This uses selected doctor ID to refresh the selected doctor's appointment view
                try {
                    const today = new Date().toISOString().split('T')[0];
                    const doctorId = selectedDoctorId; // Use selected doctor for refreshing appointment view
                    const clinicId = (sessionData?.clinicId ?? '');
                    
                    console.log('🔄 Refreshing appointments for selected doctor after booking:', doctorId);
                    
                    const resp: TodayAppointmentsResponse = await appointmentService.getAppointmentsForDateSP({
                        doctorId,
                        clinicId,
                        futureDate: today,
                        languageId: 1
                    });
                    const rows = convertSPResultToRows(resp?.resultSet1 || []);
                    setAppointments(rows);
                    // Log and fetch previous visits using booked patientId
            console.log('📌 Booked patientId (from appointmentData):', appointmentData.patientId);
                    try {
                        const visitsResp = await patientService.getPreviousVisitDates(appointmentData.patientId);
                        console.log('🧾 Visits fetched for booked patientId:', visitsResp);
                    } catch (e) {
                        console.warn('⚠️ Failed to fetch visits for booked patientId (string):', appointmentData.patientId, e);
                    }
            try {
                console.log('🔁 Also pushing into state via string patientId:', appointmentData.patientId);
                await fetchPreviousVisits(appointmentData.patientId);
            } catch (e) {
                console.warn('⚠️ fetchPreviousVisits failed for string pid:', appointmentData.patientId, e);
            }
                    setSelectedPatients([]);
                    alert(`Successfully booked appointment for ${patient.first_name} ${patient.last_name}!`);
                } catch (refreshError) {
                    console.error('Failed to refresh appointments after booking:', refreshError);
                    // Fallback: add with default status
                    const newAppointments = convertToTableFormat([patient]);
                    setAppointments(prev => [...prev, ...newAppointments]);
                    // Log and fetch previous visits using booked patientId (fallback path)
            console.log('📌 Booked patientId (from appointmentData):', appointmentData.patientId);
                    try {
                        const visitsResp = await patientService.getPreviousVisitDates(appointmentData.patientId);
                        console.log('🧾 Visits fetched for booked patientId:', visitsResp);
                    } catch (e) {
                        console.warn('⚠️ Failed to fetch visits for booked patientId (string):', appointmentData.patientId, e);
                    }
            try {
                console.log('🔁 Also pushing into state via string patientId:', appointmentData.patientId);
                await fetchPreviousVisits(appointmentData.patientId);
            } catch (e) {
                console.warn('⚠️ fetchPreviousVisits failed for string pid:', appointmentData.patientId, e);
            }
                    setSelectedPatients([]);
                    alert(`Successfully booked appointment for ${patient.first_name} ${patient.last_name}!`);
                }
            } else {
                alert(`Failed to book appointment: ${result.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Error booking appointment:", error);
            alert("Failed to book appointment. Please try again.");
        }
    };

    // Toggle view functions
    const handleListClick = () => {
        setActiveView('list');
    };

    const handleCardClick = () => {
        setActiveView('card');
    };

    // Filters and Pagination
    const filteredAppointments = appointments.filter(a => {
        const nameOk = filterName ? a.patient.toLowerCase().includes(filterName.toLowerCase()) : true;
        const contactOk = filterContact ? (a.contact || '').toString().includes(filterContact) : true;
        const statusOk = filterStatus ? (a.status || '').toUpperCase() === filterStatus.toUpperCase() : true;
        return nameOk && contactOk && statusOk;
    });
    const totalPages = Math.ceil(filteredAppointments.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentAppointments = filteredAppointments.slice(startIndex, endIndex);
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setCurrentPage(1); // Reset to first page when changing page size
    };

    // Reset pagination when appointments change
    useEffect(() => {
        setCurrentPage(1);
    }, [appointments.length]);

    // Handle click outside to close dropdowns and menus
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
            if (openStatusIndex !== null) {
                const target = event.target as HTMLElement;
                const isStatusMenu = target.closest('.status-menu');
                if (!isStatusMenu) {
                    setOpenStatusIndex(null);
                    setMenuPosition(null);
                }
            }
            if (openActionIndex !== null) {
                const target = event.target as HTMLElement;
                const isActionMenu = target.closest('.action-menu');
                const isActionTrigger = target.closest('[title="Actions"]');
                if (!isActionMenu && !isActionTrigger) {
                    setOpenActionIndex(null);
                    setActionMenuPosition(null);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openStatusIndex, openActionIndex]);

    // Measure Filter button to size filter inputs the same
    useEffect(() => {
        const measure = () => {
            if (filterBtnRef.current) {
                const rect = filterBtnRef.current.getBoundingClientRect();
                setFilterSize({ width: Math.round(rect.width), height: Math.round(rect.height) });
            }
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, []);

    // Update field by shared index - used by both views
    const updateAppointmentField = (index: number, field: keyof AppointmentRow, value: any) => {
        setAppointments(prev => {
            const updated = [...prev];
            (updated[index] as any)[field] = value;
            return updated;
        });
    };

    const handleOnlineChange = (index: number, value: string) => {
        updateAppointmentField(index, 'online', value);
    };

    const handleProviderChange = (index: number, value: string) => {
        updateAppointmentField(index, 'provider', value);
    };

    const extractTime = (dateTimeStr: string): string => {
        // If the string is already in HH:mm format, return it directly
        if (/^\d{2}:\d{2}$/.test(dateTimeStr)) {
            return dateTimeStr;
        }
        
        // Otherwise, try to parse it as a date and extract time
        try {
            const date = new Date(dateTimeStr);
            if (isNaN(date.getTime())) {
                return '00:00'; // Fallback for invalid dates
            }
            const hh = String(date.getHours()).padStart(2, "0");
            const mm = String(date.getMinutes()).padStart(2, "0");
            return `${hh}:${mm}`;
        } catch (error) {
            console.error('Error extracting time from:', dateTimeStr, error);
            return '00:00';
        }
    };

    const formatYearToTwoDigits = (dateLabel: string): string => {
        if (!dateLabel) return dateLabel;
        const parts = dateLabel.trim().split(/\s+/);
        if (parts.length >= 3) {
            const year = parts[parts.length - 1];
            if (/^\d{4}$/.test(year)) {
                parts[parts.length - 1] = year.slice(2);
                return parts.join(' ');
            }
        }
        return dateLabel;
    };

    const buttonStyle = {
        backgroundColor: "#1E88E5",
        color: "white",
        borderRadius: "6px",
        border: "2px solid #1E88E5",
        fontFamily: "'Roboto', sans-serif",
        fontWeight: 500,
        height: "38px"
    };

    // Derive counts by status for header badges (normalized)
    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = {
            'WAITING': 0,
            'WITH DOCTOR': 0,
            'WITH DOCTOR (ON PHONE)': 0,
            'CHECK OUT': 0,
            'COMPLETE': 0,
            'SAVE': 0
        };
        for (const appt of appointments) {
            const key = normalizeStatusLabel(appt.status);
            if (!(key in counts)) counts[key] = 0;
            counts[key] += 1;
        }
        return counts;
    }, [appointments]);

    return (
        <div className="container-fluid mt-3" style={{ fontFamily: "'Roboto', sans-serif" }}>
            <style>{`
        /* Let table size to content, not force 100% */
        // .table.appointments-table { table-layout: auto !important; width: auto !important; max-width: 100%; }
         .table.appointments-table { table-layout: auto !important; width: 100%;}
        /* Keep cells on a single line so content determines width */
        .appointments-table th, .appointments-table td { white-space: wrap; }
        /* Inputs inside cells shouldn't stretch the column */
        .appointments-table .form-control, .appointments-table .form-control-sm { width: auto; min-width: 10px; display: inline-block; }
        // // /* Compact table to fit ~10 rows */
        // .appointments-table thead th { padding: 6px 8px !important; font-size: 0.9rem; line-height: 1.1; }
        // .appointments-table tbody td { padding: 6px 8px !important; font-size: 0.9rem; line-height: 1.1; }
        // .appointments-table .btn.btn-sm { padding: 2px 6px !important; height: 28px; line-height: 1; }
        // .appointments-table .form-control-sm { padding: 2px 6px !important; height: 28px; }
        // .appointments-table .form-check-input { width: 16px; height: 16px; }
        /* Force a narrow Online column */
        .appointments-table th.online-col { width: 10px; }
        .appointments-table td.online-cell { width: 10px; }
        .appointments-table td.online-cell .form-control { width: 90px !important; min-width: 90px !important; }
        /* Column widths: Last Visit takes 20%, others auto to utilize remaining */
        .appointments-table th.last-col, .appointments-table td.last-col { width: 15%; }
        .appointments-table th.sr-col, .appointments-table td.sr-col { width: auto; }
        .appointments-table th.name-col, .appointments-table td.name-col { width: auto; }
        .appointments-table th.age-col, .appointments-table td.age-col { width: auto; }
        .appointments-table th.contact-col, .appointments-table td.contact-col { width: auto; }
        .appointments-table th.time-col, .appointments-table td.time-col { width: auto; }
        .appointments-table th.provider-col, .appointments-table td.provider-col { width: auto; }
        .appointments-table th.status-col, .appointments-table td.status-col { width: auto; }
        /* Labs column removed */
        .appointments-table th.action-col, .appointments-table td.action-col { width: auto; }
        /* Borderless table */
        .appointments-table, .appointments-table th, .appointments-table td { border: 0 !important; }
        .appointments-table tbody tr + tr { border-top: 0 !important; }
        /* Status menu */
        .status-menu { position: absolute; background: #fff; border: 1px solid #e0e0e0; border-radius: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.08); padding: 6px 0; z-index: 10; }
        .status-menu button { background: transparent; border: 0; padding: 6px 12px; width: 100%; text-align: left; font-size: 0.9rem; }
        .status-menu button:hover { background: #f5f5f5; }
        /* Compact layout to fit 10 rows without scroll on 1080p */
        .appointments-table thead th { padding: 4px 8px !important; font-size: 0.9rem; line-height: 1.1; }
        .appointments-table tbody td { padding: 4px 8px !important; font-size: 0.9rem; line-height: 1.1; }
        .appointments-table .btn.btn-sm { padding: 2px 6px !important; height: 28px; line-height: 1; }
        .appointments-table .form-control-sm { padding: 2px 6px !important; height: 28px; }
        .appointments-table .form-check-input { width: 14px; height: 14px; }
        .appointments-table .rounded-circle { width: 12px !important; height: 12px !important; }
        .appointments-table .content-gap-small { margin-bottom: 8px !important; }
        
        /* Card view styles - CRM-like */
        .card-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; }
        .appointment-card {
            background: #FFFFFF;
            border-radius: 10px;
            padding: 12px;
            margin-bottom: 6px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.10);
            position: relative;
            min-height: 150px;
        }
        .appointment-card:before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 10px;
            box-shadow: inset 0 0 0 2px #90CAF9;
            pointer-events: none;
        }
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
        }
        .patient-name {
            font-size: 1rem;
            font-weight: 600;
            color: #000000;
            font-family: 'Roboto', sans-serif;
        }
        .price-text { font-weight: 700; color: #2E7D32; font-family: 'Roboto', sans-serif; }
        .subtitle { color: #6b7280; margin-bottom: 8px; font-size: 0.85rem; font-family: 'Roboto', sans-serif; }
        .card-details { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 12px; margin-bottom: 10px; }
        .kv { display: flex; gap: 6px; align-items: center; min-width: 0; }
        .kv .k { color: #607D8B; font-size: 0.76rem; }
        .kv .v { color: #111827; font-size: 0.8rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .crm-actions { display: grid; grid-template-columns: repeat(4, 32px); gap: 8px; }
        .crm-btn { width: 36px; height: 36px; border-radius: 6px; background: #ECEFF1; display: inline-flex; align-items: center; justify-content: center; color: #607D8B; border: 1px solid #CFD8DC; }
        .crm-btn:hover { background: #E3F2FD; color:black; border-color: #90CAF9; }
        .status-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            display: inline-block;
            margin-right: 8px;
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
            gap: 5px;
        }
        .page-btn {
            padding: 6px 12px;
            border: 1px solid #ddd;
            background: white;
            color: #333;
            cursor: pointer;
            border-radius: 4px;
            font-size: 0.9rem;
            transition: all 0.2s ease;
        }
        .page-btn:hover:not(:disabled) {
            background: #f5f5f5;
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
        /* Prev/Next buttons as black */
        .nav-btn {
            background: #000;
            color: #fff;
            border-color: #000;
        }
        .nav-btn:hover:not(:disabled) {
            background: #111;
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
        
        /* Responsive adjustments for d-flex mb-3 align-items-center */
        @media (max-width: 991px) {
            .d-flex.mb-3.align-items-center {
                flex-direction: column;
                align-items: stretch;
                gap: 15px;
            }
            
            /* Search input becomes full width */
            .d-flex.mb-3.align-items-center .position-relative {
                width: 100%;
            }
            
            .d-flex.mb-3.align-items-center .position-relative input {
                width: 100% !important;
                min-width: auto !important;
            }
            
            /* Form selects become full width */
            .d-flex.mb-3.align-items-center .form-select {
                width: 100% !important;
                height: 38px !important;
            }
            
            /* Buttons stack vertically */
            .d-flex.mb-3.align-items-center .btn {
                width: 100%;
                margin-bottom: 8px;
            }
            
            /* List/Card toggle remains centered and properly sized */
            .d-flex.mb-3.align-items-center .d-flex.align-items-center.ms-auto {
                margin-left: 0 !important;
                align-self: center;
                width: auto !important;
                height: 38px !important;
            }
            
            .d-flex.mb-3.align-items-center .d-flex.align-items-center.ms-auto .btn {
                width: auto !important;
                margin-bottom: 0 !important;
            }
        }
        
        @media (max-width: 768px) {
            .d-flex.mb-3.align-items-center {
                gap: 12px;
            }
            
            /* Form selects maintain 30% width and 30px height on mobile */
            .d-flex.mb-3.align-items-center .form-select {
                width: 100% !important;
                height: auto !important;
            }
        }
        
        @media (max-width: 576px) {
            .d-flex.mb-3.align-items-center {
                gap: 10px;
            }
            
            /* Form selects maintain 30% width and 30px height on small mobile */
            .d-flex.mb-3.align-items-center .form-select {
                width: 100% !important;
                height: auto !important;
            }
        }
        /* Bootstrap-like breakpoints to maintain UI across resolutions */
        /* <= 1399.98px (Large desktops down) */
        @media (max-width: 1399.98px) {
            .d-flex.mb-3.align-items-center { flex-wrap: nowrap; overflow-x: auto; -webkit-overflow-scrolling: touch; gap: 8px; }
            .d-flex.mb-3.align-items-center .btn { white-space: nowrap; }
        }

        /* <= 1199.98px (Desktops) */
        @media (max-width: 1199.98px) {
            .d-flex.mb-3.align-items-center { flex-wrap: nowrap; overflow-x: auto; -webkit-overflow-scrolling: touch; gap: 8px; }
            .d-flex.mb-3.align-items-center .btn { white-space: nowrap; }
        }

        /* <= 991.98px (Tablets) */
        @media (max-width: 991.98px) {
            .d-flex.mb-3.align-items-center { flex-direction: column; align-items: stretch; gap: 12px; }
            .d-flex.mb-3.align-items-center .position-relative { width: 100%; }
            .d-flex.mb-3.align-items-center .position-relative input { width: 100% !important; min-width: auto !important; }
            .d-flex.mb-3.align-items-center .form-select { width: 100% !important; height: 38px !important; }
            .d-flex.mb-3.align-items-center .btn { width: 100%; }
            .d-flex.mb-3.align-items-center .d-flex.align-items-center.ms-auto { margin-left: 0 !important; align-self: center; }
        }

        /* <= 767.98px (Landscape phones) */
        @media (max-width: 767.98px) {
            .d-flex.mb-3.align-items-center { gap: 10px; }
            .d-flex.mb-3.align-items-center .form-select { width: 30% !important; height: 30px !important; }
        }

        /* <= 575.98px (Portrait phones) */
        @media (max-width: 575.98px) {
            .d-flex.mb-3.align-items-center { gap: 8px; }
            .d-flex.mb-3.align-items-center .form-select { width: 30% !important; height: 30px !important; }
        }

        /*============ Responsive table ============*/
        /* Large desktops down: enable horizontal scroll if needed */
        @media (max-width: 1399.98px) {
            .table-responsive { overflow-x: auto; -webkit-overflow-scrolling: touch; }
            .appointments-table thead th { white-space: nowrap; }
            .appointments-table tbody td { white-space: nowrap; }
        }
        /* Desktops */
        @media (max-width: 1199.98px) {
            .appointments-table { min-width: 1100px; }
            .appointments-table thead th { padding: 6px 8px !important; }
            .appointments-table tbody td { padding: 6px 8px !important; }
        }
        /* Tablets */
        @media (max-width: 991.98px) {
            .appointments-table { min-width: 980px; }
            .appointments-table thead th { font-size: 0.9rem; }
            .appointments-table tbody td { font-size: 0.9rem; }
        }
        /* Landscape phones */
        @media (max-width: 767.98px) {
            .appointments-table { min-width: 900px; }
            .appointments-table thead th { font-size: 0.85rem; padding: 4px 6px !important; }
            .appointments-table tbody td { font-size: 0.85rem; padding: 4px 6px !important; }
        }
        /* Portrait phones */
        @media (max-width: 575.98px) {
            .appointments-table { min-width: 820px; }
            .appointments-table thead th { font-size: 0.8rem; padding: 3px 5px !important; }
            .appointments-table tbody td { font-size: 0.8rem; padding: 3px 5px !important; }
        }
      `}</style>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Appointments</h2>
                <div className="d-flex align-items-center" style={{ fontSize: '0.85rem', color: '#455A64', gap: '8px', whiteSpace: 'nowrap' }}>
                    <span className="me-1"><span className="rounded-circle d-inline-block bg-primary" style={{ width: 10, height: 10 }}></span> {statusCounts['WAITING'] || 0} </span>
                    |
                    <span className="mx-1"><span className="rounded-circle d-inline-block bg-success" style={{ width: 10, height: 10 }}></span> {statusCounts['WITH DOCTOR'] || 0} </span>
                    |
                    <span className="mx-1"><span className="rounded-circle d-inline-block bg-info" style={{ width: 10, height: 10 }}></span> {statusCounts['WITH DOCTOR (ON PHONE)'] || 0} </span>
                    |
                    <span className="mx-1"><span className="rounded-circle d-inline-block bg-warning" style={{ width: 10, height: 10 }}></span> {statusCounts['CHECK OUT'] || 0} </span>
                    |
                    <span className="mx-1"><span className="rounded-circle d-inline-block bg-dark" style={{ width: 10, height: 10 }}></span> {statusCounts['COMPLETE'] || 0} </span>
                    |
                    <span className="ms-1"><span className="rounded-circle d-inline-block bg-danger" style={{ width: 10, height: 10 }}></span> {statusCounts['SAVE'] || 0} </span>
                </div>
            </div>

            {/* Primary row with controls will include CTAs */}

            {/* Search + Filter */}
            <div className="d-flex mb-3 align-items-center" style={{ gap: '8px',overflow: 'visible' }}>
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
                                    <span className="ms-2">Searching...</span>
                                </div>
                            ) : searchResults.length > 0 ? (
                                searchResults.map((patient) => {
                                    const age = patient.date_of_birth ? 
                                        Math.floor((new Date().getTime() - new Date(patient.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0;
                                    
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
                                                {patient.first_name} {patient.last_name}
                                            </div>
                                            <div className="text-muted small mt-1 text-nowrap">
                                                <i className="fas fa-id-card me-1"></i>
                                                <strong>ID:</strong> {patient.id} |  
                                                <i className="fas fa-birthday-cake me-1 ms-2"></i>
                                                <strong>Age:</strong> {age} |
                                                <i className="fas fa-phone me-1"></i>
                                                <strong>Contact:</strong> {patient.mobile_1 || 'N/A'}
                                            </div>
                                            {/* <div className="text-muted small mt-1"> | 
                                                <i className="fas fa-info-circle me-1 ms-2"></i>
                                                <strong>Status:</strong> {patient.registration_status}
                                            </div>
                                            <div className="text-muted small mt-1">
                                                <i className="fas fa-calendar me-1"></i>
                                                <strong>Registered:</strong> {new Date(patient.date_of_registration).toLocaleDateString()}
                                            </div> */}
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

                {/* 2) Provider (enabled with all doctors) - Changes filter appointments by selected doctor */}
                <select
                    className="form-select"
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    disabled={loadingDoctors}
                    style={{ 
                        height: 38, 
                        width: 255, 
                        color: '#212121', 
                        backgroundColor: loadingDoctors ? '#ECEFF1' : '#FFFFFF', 
                        padding: '6px 12px', 
                        lineHeight: '1.5', 
                        fontSize: '1rem', 
                        flex: '0 0 255px' 
                    }}
                >
                    {loadingDoctors ? (
                        <option>Loading doctors...</option>
                    ) : allDoctors.length > 0 ? (
                        allDoctors.map((doctor) => (
                            <option key={doctor.id} value={doctor.id}>
                                {doctor.name}
                            </option>
                        ))
                    ) : (
                        <option>No doctors available</option>
                    )}
                </select>

                {/* 3) Book and 4) Add buttons */}
                <button 
                    className="btn"
                    style={{ ...buttonStyle }}
                    onClick={handleBookAppointment}
                >
                    Book Appointment {selectedPatients.length > 0 && `(1)`}
                </button>
                <button 
                    className="btn" 
                    style={buttonStyle}
                    onClick={() => setShowAddPatient(true)}
                >
                    Add Patient
                </button>

                {/* 5) Status dropdown */}
                {(() => {
                    const statusOptions = availableStatuses.length ? availableStatuses : [
                        'WAITING','WITH DOCTOR','CHECK OUT','ON CALL','SAVED','COMPLETED'
                    ];
                    return null;
                })()}
                <select
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{ height: '38px', width: '160px', color: filterStatus ? '#212121' : '#6c757d', padding: '6px 12px', lineHeight: '1.5', fontSize: '1rem' }}
                >
                    <option value="">Select Status</option>
                    {(availableStatuses.length ? availableStatuses : [
                        'WAITING','WITH DOCTOR','CHECK OUT','ON CALL','SAVED','COMPLETED'
                    ]).map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                    
                </select>

                {/* 6) List/Card toggle */}
                <div 
                    className="d-flex align-items-center ms-auto"
                    style={{
                        height: "38px",
                        backgroundColor: "#607D8B",
                        borderColor: "#B7B7B7",
                        color: "#fff",
                        fontFamily: "'Roboto', sans-serif",
                        borderRadius: "6px",
                        border: "1px solid #B7B7B7",
                        overflow: "hidden"
                    }}
                >
                    <button
                        className="btn d-flex align-items-center justify-content-center"
                        style={{
                            height: "100%",
                            backgroundColor: activeView === 'list' ? "#4CAF50" : "transparent",
                            border: "none",
                            color: "#fff",
                            fontFamily: "'Roboto', sans-serif",
                            opacity: activeView === 'list' ? 0.7 : 1,
                            cursor: activeView === 'list' ? 'not-allowed' : 'pointer',
                            padding: "0 12px",
                            minWidth: "40px"
                        }}
                        onClick={handleListClick}
                        disabled={activeView === 'list'}
                        title="List View"
                    >
                        <List />
                    </button>
                    <div style={{ width: '1px', height: '100%', backgroundColor: '#fff', opacity: 0.7 }} />
                    <button
                        className="btn d-flex align-items-center justify-content-center"
                        style={{
                            height: "100%",
                            backgroundColor: activeView === 'card' ? "#4CAF50" : "transparent",
                            border: "none",
                            color: "#fff",
                            fontFamily: "'Roboto', sans-serif",
                            opacity: activeView === 'card' ? 0.7 : 1,
                            cursor: activeView === 'card' ? 'not-allowed' : 'pointer',
                            padding: "0 12px",
                            minWidth: "40px"
                        }}
                        onClick={handleCardClick}
                        disabled={activeView === 'card'}
                        title="Card View"
                    >
                        <CreditCard />
                    </button>
                </div>
            </div>

            {/* No extra filter row; status filter is inline above */}

            {/* Selected Patient */}
            {selectedPatients.length > 0 && (
                <div className="mb-3">
                    <h6 className="mb-2">Selected Patient:</h6>
                    <div className="d-flex flex-wrap gap-2">
                        {selectedPatients.map((patient) => (
                            <div
                                key={patient.id}
                                className="badge bg-primary d-flex align-items-center"
                                style={{ fontSize: "0.9rem", padding: "8px 12px" }}
                            >
                                {patient.first_name} {patient.last_name} (ID: {patient.id})
                                <button
                                    type="button"
                                    className="btn-close btn-close-white ms-2"
                                    style={{ fontSize: "0.7rem" }}
                                    onClick={() => removeSelectedPatient(patient.id)}
                                    aria-label="Remove"
                                ></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Content Area - List or Card View */}
            {appointments.length === 0 ? (
                <div className="text-center py-5">
                    <div className="mb-3">
                        <i className="fas fa-calendar-plus" style={{ fontSize: "3rem", color: "#6c757d" }}></i>
                    </div>
                    <h5 className="text-muted">No Appointments Booked</h5>
                    <p className="text-muted">Search for a patient and click "Book Appointment" to add them to your schedule.</p>
                </div>
            ) : (
                <>
                    {/* List View */}
                    {activeView === 'list' && (
                        <div className="table-responsive">
                            <table className="table table-borderless align-middle appointments-table">
                                <thead>
                                    <tr>
                                        <th className="sr-col">Sr.</th>
                                        <th className="name-col">Patient Name</th>
                                        <th className="age-col text-start">Age</th>
                                        <th className="contact-col text-start">Contact</th>
                                        <th className="time-col text-start">Time</th>
                                        <th className="provider-col text-start">Provider</th>
                                        <th className="online-col text-start">Online</th>
                                        <th className="status-col text-center">Status</th>
                                        <th className="last-col text-start">Last Visit</th>
                                        <th className="action-col text-start">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentAppointments.map((a, i) => {
                                        const originalIndex = startIndex + i;
                                        return (
                                        <tr key={i} style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 500 }}>
                                            <td className="sr-col">{a.sr}</td>
                                            <td className="name-col"><a href={`/patients/${a.patientId}`} style={{ textDecoration: "underline", color: "#1E88E5" }}>{a.patient}</a></td>
                                            <td className="age-col">{a.age}</td>
                                            <td className="contact-col">{(a.contact || '').toString().slice(0, 12)}</td>
                                            <td className="time-col">{extractTime(a.time)}</td>
                                            <td className="provider-col">
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={a.provider || getDoctorLabelById(selectedDoctorId) || ''}
                                                    onChange={(e) => handleProviderChange(originalIndex, e.target.value)}
                                                >
                                                    {getProviderOptionsWithSelectedFirst().map(opt => (
                                                        <option key={opt.id} value={opt.label}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="online-cell">
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    value={a.online}
                                                    onChange={(e) => handleOnlineChange(originalIndex, e.target.value)}
                                                    placeholder="HH:mm"
                                                    style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 500, height: "28px", padding: "2px 6px" }}
                                                />
                                            </td>
                                            <td className="text-center center-cell" style={{ position: "relative" }} title={a.status}>
                                                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                                    <span className={`d-inline-block rounded-circle ${a.statusColor}`} style={{ width: "14px", height: "14px" }}></span>
                                                    <span style={{ fontSize: '0.9rem', color: '#263238' }}>{a.status}</span>
                                                    <div
                                                        onClick={async (e) => {
                                                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                                            setMenuPosition({ top: rect.bottom + 6, left: rect.left - 66 });
                                                            // Fetch clinic-based status options on open
                                                            try {
                                                                const activeClinicId = clinicId || (sessionData?.clinicId ?? '');
                                                                const resp = await getStatusOptionsByClinic(activeClinicId);
                                                                if (resp?.success) {
                                                                    const pickLabel = (row: any): string | null => {
                                                                        const candidates = ['status_description','statusDescription','description','name','label','status'];
                                                                        for (const key of candidates) {
                                                                            if (row && row[key]) {
                                                                                const val = String(row[key]).trim();
                                                                                if (val) return val.toUpperCase();
                                                                            }
                                                                        }
                                                                        return null;
                                                                    };
                                                                    const labels = Array.from(new Set((resp.statusOptions || []).map(pickLabel).filter(Boolean))) as string[];
                                                                    const ensured = labels.includes('WAITING') ? labels : ['WAITING', ...labels];
                                                                    setAvailableStatuses(ensured);
                                                                }
                                                            } catch (err) {
                                                                console.error('Failed loading clinic status options', err);
                                                            }
                                                            setOpenStatusIndex(openStatusIndex === originalIndex ? null : originalIndex);
                                                        }}
                                                        aria-label="Change Status"
                                                        title="Change Status"
                                                        style={{
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            width: "28px",
                                                            height: "28px",
                                                            cursor: "pointer",
                                                            color: "#607D8B",
                                                            backgroundColor: "transparent",
                                                            borderRadius: "4px",
                                                        }}
                                                    >
                                                        <MoreVert fontSize="small" />
                                                    </div>
                                                </div>

                                                {openStatusIndex === originalIndex && menuPosition && (
                                                    <div
                                                        className="status-menu"
                                                        style={{
                                                            position: "fixed",
                                                            top: menuPosition.top,
                                                            left: menuPosition.left,
                                                            background: "#ffffff",
                                                            border: "1px solid #ccc",
                                                            borderRadius: "6px",
                                                            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                                                            zIndex: 2000,
                                                            minWidth: "180px",
                                                            fontFamily: "'Roboto', sans-serif",
                                                        }}
                                                    >
                                                        {(availableStatuses.length ? availableStatuses : ["WAITING","WITH DOCTOR","CHECK OUT","ON CALL","SAVED","COMPLETED"]).map((status) => (
                                                            <div
                                                                key={status}
                                                                onClick={() => {
                                                                    updateAppointmentField(originalIndex, 'status', status);
                                                                    updateAppointmentField(originalIndex, 'statusColor', getStatusColor(status));
                                                                    setOpenStatusIndex(null);
                                                                    setMenuPosition(null);
                                                                }}
                                                                style={{
                                                                    padding: "8px 12px",
                                                                    cursor: "pointer",
                                                                    fontSize: "14px",
                                                                    color: "#212121",
                                                                    backgroundColor: "#fff",
                                                                    textAlign: "left",
                                                                }}
                                                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
                                                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
                                                            >
                                                                {status}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                            {/* <td><a href={`/patients/${a.patientId}/visits`} style={{ textDecoration: "underline", color: "#1E88E5" }}>{a.lastOpd}</a></td> */}
                                            <td className="last-col">
                                                <a
                                                    href={`/patients/${a.patientId}/visits`}
                                                    title={`View visit history`}
                                                    style={{ textDecoration: "underline", color: "#1E88E5" }}
                                                >
                                                    {loadingVisits[a.patientId] ? (
                                                        <span className="text-muted">
                                                            <i className="fas fa-spinner fa-spin me-1"></i>
                                                            Loading...
                                                        </span>
                                                    ) : (
                                                        formatLastVisitDisplay(a.patientId, a.reports_received)
                                                    )}
                                                </a>
                                            </td>
                                            <td className="action-col" style={{ whiteSpace: "nowrap", position: 'relative' }}>
                                                <div
                                                    onClick={(e) => {
                                                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                                        setActionMenuPosition({ top: rect.bottom + 6, left: rect.left - 120 });
                                                        setOpenActionIndex(openActionIndex === originalIndex ? null : originalIndex);
                                                    }}
                                                    title="Actions"
                                                    style={{
                                                        display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                                                        width: '28px',
                                                        height: '28px',
                                                        cursor: 'pointer',
                                                        color: '#607D8B',
                                                        backgroundColor: 'transparent',
                                                        borderRadius: '4px'
                                                    }}
                                                >
                                                    <MoreVert fontSize="small" />
                                                </div>

                                                {openActionIndex === originalIndex && actionMenuPosition && (
                                                    <div
                                                        className="action-menu"
                                                        style={{
                                                            position: 'fixed',
                                                            top: actionMenuPosition.top,
                                                            left: actionMenuPosition.left,
                                                            background: '#fff',
                                                            border: '1px solid #ccc',
                                                            borderRadius: '6px',
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                                            zIndex: 2000,
                                                            minWidth: '180px',
                                                            fontFamily: "'Roboto', sans-serif",
                                                        }}
                                                    >
                                                        {[
                                                            { key: 'save', label: 'Save', icon: <Save fontSize='small' /> },
                                                            { key: 'delete', label: 'Delete', icon: <Delete fontSize='small' /> },
                                                            { key: 'info', label: 'Visit Details', icon: <Info fontSize='small' /> },
                                                            { key: 'forward', label: 'Collection', icon: <FastForward fontSize='small' /> },
                                                            { key: 'add', label: 'Lab Details', icon: <AddIcon fontSize='small' /> },
                                                        ].map((item) => (
                                                            <div
                                                                key={item.key}
                                                                title={item.label}
                                                                onClick={async () => {
                                                                    setOpenActionIndex(null);
                                                                    setActionMenuPosition(null);
                                                                    if (item.key === 'delete') {
                                                                        try {
                                                                            const pid = a.patientId;
                                                                            const vdate = String(a.visitDate || new Date().toISOString().split('T')[0]);
                                                                            const did = a.doctorId || selectedDoctorId;
                                                                            if (!pid || !vdate || !did) {
                                                                                alert('Missing identifiers to delete appointment');
                                                                                return;
                                                                            }
                                                                            const confirmDelete = window.confirm('Delete this appointment?');
                                                                            if (!confirmDelete) return;
                                                                            await appointmentService.deleteAppointment({ patientId: String(pid), visitDate: String(vdate), doctorId: String(did), userId: String(sessionData?.userId || 'system') });
                                                                            setAppointments(prev => prev.filter((_, i) => i !== originalIndex));
                                                                        } catch (err) {
                                                                            console.error('Delete appointment failed:', err);
                                                                            alert('Failed to delete appointment');
                                                                        }
                                                                    } else if (item.key === 'save') {
                                                                        try {
                                                                            const pid = a.patientId;
                                                                            const vno = getLatestVisitNumber(a.patientId);
                                                                            const shift = 1;
                                                                            const clinic = sessionData?.clinicId || '';
                                                                            const onlineTime = (a.online || '').trim() || undefined;
                                                                            const doctor = selectedDoctorId || a.doctorId || '';
                                                                            const statusId = mapStatusLabelToId(a.status);
                                                                            if (!pid || !clinic || !doctor) {
                                                                                alert('Missing identifiers to update appointment');
                                                                                return;
                                                                            }
                                                                            await appointmentService.updateTodaysAppointment({
                                                                                patientId: String(pid),
                                                                                patientVisitNo: Number(vno),
                                                                                shiftId: Number(shift),
                                                                                clinicId: String(clinic),
                                                                                onlineAppointmentTime: onlineTime,
                                                                                doctorId: String(doctor),
                                                                                statusId: Number(statusId),
                                                                                userId: String(sessionData?.userId || 'system')
                                                                            });
                                                                            alert('Appointment updated');
                                                                        } catch (err) {
                                                                            console.error('Update appointment failed:', err);
                                                                            alert('Failed to update appointment');
                                                                        }
                                                                    }
                                                                }}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '8px',
                                                                    padding: '8px 12px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '14px',
                                                                    color: '#212121',
                                                                    backgroundColor: '#fff',
                                                                }}
                                                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
                                                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
                                                            >
                                                                {item.icon}
                                                                <span>{item.label}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Card View */}
                    {activeView === 'card' && (
                        <div className="card-grid">
                            {currentAppointments.map((appointment, index) => {
                                const originalIndex = startIndex + index;
                                return (
                                <div key={index}>
                                    <div className="appointment-card">
                                        <div className="card-header">
                                            <div className="d-flex align-items-center" style={{ gap: '8px' }}>
                                                <span className={`d-inline-block rounded-circle ${appointment.statusColor}`} style={{ width: '10px', height: '10px' }}></span>
                                                <a href={`/patients/${appointment.patientId}`} className="patient-name" style={{ textDecoration: 'underline', color: '#1E88E5' }}>{appointment.patient}</a>
                                            </div>
                                            <div
                                                onClick={(e) => {
                                                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                                    setMenuPosition({ top: rect.bottom + 6, left: rect.left - 120 });
                                                    setOpenStatusIndex(openStatusIndex === originalIndex ? null : originalIndex);
                                                }}
                                                title="Change Status"
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '28px',
                                                    height: '28px',
                                                    cursor: 'pointer',
                                                    color: '#607D8B',
                                                    backgroundColor: 'transparent',
                                                    borderRadius: '4px'
                                                }}
                                            >
                                                <MoreVert fontSize="small" />
                                            </div>
                                        </div>
                                        {openStatusIndex === originalIndex && menuPosition && (
                                            <div
                                                className="status-menu"
                                                style={{
                                                    position: 'fixed',
                                                    top: menuPosition.top,
                                                    left: menuPosition.left,
                                                    background: '#ffffff',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '6px',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                                    zIndex: 2000,
                                                    minWidth: '180px',
                                                    fontFamily: "'Roboto', sans-serif",
                                                }}
                                            >
                                                {(availableStatuses.length ? availableStatuses : ["WAITING","WITH DOCTOR","CHECK OUT","ON CALL","SAVED","COMPLETED"]).map((status) => (
                                                    <div
                                                        key={status}
                                                        onClick={() => {
                                                            updateAppointmentField(originalIndex, 'status', status);
                                                            updateAppointmentField(originalIndex, 'statusColor', getStatusColor(status));
                                                            setOpenStatusIndex(null);
                                                            setMenuPosition(null);
                                                        }}
                                                        style={{
                                                            padding: '8px 12px',
                                                            cursor: 'pointer',
                                                            fontSize: '14px',
                                                            color: '#212121',
                                                            backgroundColor: '#fff',
                                                            textAlign: 'left',
                                                        }}
                                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
                                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
                                                    >
                                                        {status}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="card-details">
                                            <div className="kv"><span className="k">Age:</span><span className="v">{appointment.age}</span></div>
                                            <div className="kv"><span className="k">Contact:</span><span className="v">{appointment.contact}</span></div>
                                            <div className="kv">
                                                <span className="k">Last Visit:</span>
                                                <span className="v">
                                                    <a 
                                                        href={`/patients/${appointment.patientId}/visits`} 
                                                        title={`View visit history`} 
                                                        style={{ textDecoration: 'underline', color: '#1E88E5' }}
                                                    >
                                                        {loadingVisits[appointment.patientId] ? (
                                                            <span className="text-muted">
                                                                <i className="fas fa-spinner fa-spin me-1"></i>
                                                                Loading...
                                                            </span>
                                                        ) : (
                                                            formatLastVisitDisplay(appointment.patientId, appointment.reports_received)
                                                        )}
                                                    </a>
                                                </span>
                                            </div>
                                            {/* <div className="kv"><span className="k">Last Visit:</span><span className="v"><a href={`/patients/${appointment.patientId}/visits`} title={`Dr.Tongaonkar`} style={{ textDecoration: 'underline', color: '#1E88E5' }}>{`${formatYearToTwoDigits(appointment.lastOpd)}`} -L</a></span></div> */}
                                            <div className="kv"><span className="k">Dr. Tongaonkar</span></div>
                                            <div className="kv"><span className="k">Time:</span><span className="v">{extractTime(appointment.time)}</span></div>
                                            <div className="kv"><span className="k">Provider:</span><span className="v">
                                                <select
                                                    className="form-select"
                                                    value={appointment.provider || getDoctorLabelById(selectedDoctorId) || ''}
                                                    onChange={(e) => handleProviderChange(originalIndex, e.target.value)}
                                                    style={{ width: '151px', height: '28px', padding: '2px', fontSize: 11 }}
                                                >
                                                    {getProviderOptionsWithSelectedFirst().map(opt => (
                                                        <option key={opt.id} value={opt.label}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </span></div>
                                            
                                        </div>
                                        {/* <div className="crm-actions">
                                            <div className="crm-btn" title="Chat"><ChatBubbleOutline fontSize="small" /></div>
                                            <div className="crm-btn" title="Call"><Phone fontSize="small" /></div>
                                            <div className="crm-btn" title="Add"><AddIcon fontSize="small" /></div>
                                            <div className="crm-btn" title="Transfer"><SwapHoriz fontSize="small" /></div>
                                        </div> */}
                                        <div className="d-flex align-items-center" style={{ gap: '8px' }}>
                                            <div className="crm-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, max-content)', alignItems: 'center', gap: '8px' }}>
                                                <div
                                                    className="crm-btn"
                                                    title="Save"
                                                    onClick={async () => {
                                                        try {
                                                            const pid = appointment.patientId;
                                                            const vno = getLatestVisitNumber(appointment.patientId);
                                                            const shift = 1; // using default shift
                                                            const clinic = sessionData?.clinicId || '';
                                                            const onlineTime = (appointment.online || '').trim() || undefined;
                                                            const doctor = selectedDoctorId || appointment.doctorId || '';
                                                            const statusId: number = mapStatusLabelToId(appointment.status);
                                                            if (!pid || !clinic || !doctor) {
                                                                alert('Missing identifiers to update appointment');
                                                                return;
                                                            }
                                                            await appointmentService.updateTodaysAppointment({
                                                                patientId: String(pid),
                                                                patientVisitNo: Number(vno),
                                                                shiftId: Number(shift),
                                                                clinicId: String(clinic),
                                                                onlineAppointmentTime: onlineTime,
                                                                doctorId: String(doctor),
                                                                statusId: Number(statusId),
                                                                userId: String(sessionData?.userId || 'system')
                                                            });
                                                            alert('Appointment updated');
                                                        } catch (err) {
                                                            console.error('Update appointment failed:', err);
                                                            alert('Failed to update appointment');
                                                        }
                                                    }}
                                                >
                                                    <Save fontSize="small" />
                                                </div>
                                                <div
                                                    className="crm-btn"
                                                    title="Delete"
                                                    onClick={async () => {
                                                        try {
                                                            const pid = appointment.patientId;
                                                            const vdate = String(appointment.visitDate || new Date().toISOString().split('T')[0]);
                                                            const did = appointment.doctorId || selectedDoctorId;
                                                            if (!pid || !vdate || !did) {
                                                                alert('Missing identifiers to delete appointment');
                                                                return;
                                                            }
                                                            const confirmDelete = window.confirm('Delete this appointment?');
                                                            if (!confirmDelete) return;
                                                            await appointmentService.deleteAppointment({ patientId: String(pid), visitDate: String(vdate), doctorId: String(did), userId: String(sessionData?.userId || 'system') });
                                                            // Remove from UI
                                                            setAppointments(prev => prev.filter((_, i) => i !== originalIndex));
                                                        } catch (err) {
                                                            console.error('Delete appointment failed:', err);
                                                            alert('Failed to delete appointment');
                                                        }
                                                    }}
                                                >
                                                    <Delete fontSize="small" />
                                                </div>
                                                <div className="crm-btn" title="Visit Details"><Info fontSize="small" /></div>
                                                <div className="crm-btn" title="Lab details"><AddIcon fontSize="small" /></div>
                                                <div className="kv">
                                                    <span className="k">Online:</span>
                                                    <span className="v">
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            placeholder="HH:mm"
                                                            value={appointment.online}
                                                            onChange={(e) => handleOnlineChange(originalIndex, e.target.value)}
                                                            style={{ width: '80px', height: '28px', padding: '2px 6px', display: 'inline-block' }}
                                                        />
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="crm-btn ms-auto" title="Collection"><FastForward fontSize="small" /></div>
                                        </div>
                                    </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {filteredAppointments.length > 0 && (
                        <div className="pagination-container">
                            <div className="pagination-info">
                                <span>
                                    Showing {startIndex + 1} to {Math.min(endIndex, filteredAppointments.length)} of {filteredAppointments.length} appointments
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
                </>
            )}
            {/* Add Patient Modal */}
            <AddPatientPage 
                open={showAddPatient} 
                onClose={() => setShowAddPatient(false)}
                doctorId={selectedDoctorId || doctorId}
                clinicId={clinicId}
            />
        </div>
    );
}