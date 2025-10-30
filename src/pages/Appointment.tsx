import React, { useState, useEffect, useRef, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { List, CreditCard, MoreVert, Add as AddIcon, Save, Delete, Info, FastForward, Close, ChatBubbleOutline, Phone, SwapHoriz, ShoppingCart } from "@mui/icons-material";
import { Snackbar } from '@mui/material';
import { appointmentService, Appointment, AppointmentRequest, TodayAppointmentsResponse, getDoctorStatusReference, getStatusOptionsByClinic } from "../services/appointmentService";
import { doctorService, DoctorDetail, Doctor } from "../services/doctorService";
import { patientService, Patient, formatVisitDateTime, getVisitStatusText } from "../services/patientService";
import type { PatientVisit } from "../services/patientService";
import { useNavigate, useLocation } from "react-router-dom";
import AddPatientPage from "./AddPatientPage";
import PatientVisitDetails from "./PatientVisitDetails";
import { sessionService, SessionInfo } from "../services/sessionService";
import PatientFormTest from "../components/Test/PatientFormTest";
import LabTestEntry from "../components/LabTestEntry";

type AppointmentRow = {
    reports_received: any;
    appointmentId?: string;
    sr: number;
    patient: string;
    patientId: string;
    visitDate?: string;
    age: number;
    gender: string;
    contact: string;
    time: string;
    provider: string;
    online: string;
    statusColor: string;
    status: string;
    lastOpd: string;
    labs: string;
    doctorId?: string;
    visitNumber?: number;
    shiftId?: number;
    clinicId?: string;
    actions: boolean;
    gender_description?: string;
    visitDetailsSubmitted?: boolean;
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
    const [showPatientFormDialog, setShowPatientFormDialog] = useState<boolean>(false);
    const [selectedPatientForForm, setSelectedPatientForForm] = useState<any>(null);
    const [showLabTestEntry, setShowLabTestEntry] = useState<boolean>(false);
    const [selectedPatientForLab, setSelectedPatientForLab] = useState<AppointmentRow | null>(null);
    const [filterName, setFilterName] = useState<string>("");
    const [filterContact, setFilterContact] = useState<string>("");
    const [filterStatus, setFilterStatus] = useState<string>("");
    const [filterSize, setFilterSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
    const [showVisitDetails, setShowVisitDetails] = useState<boolean>(false);
    const [selectedPatientForVisit, setSelectedPatientForVisit] = useState<AppointmentRow | null>(null);
    const [submittedVisitDetails, setSubmittedVisitDetails] = useState<Set<string>>(new Set());
    const [formPatientData, setFormPatientData] = useState<any | null>(null);
    const [visitDates, setVisitDates] = useState<string[]>([]);
    const [currentVisitIndex, setCurrentVisitIndex] = useState<number>(0);
    const [allVisits, setAllVisits] = useState<any[]>([]);
    const [showRefreshNotification, setShowRefreshNotification] = useState<boolean>(false);

    // Session data state
    const [sessionData, setSessionData] = useState<SessionInfo | null>(null);
    const [doctorId, setDoctorId] = useState<string>('');
    const [clinicId, setClinicId] = useState<string>('');

    // User role state
    const [userRole, setUserRole] = useState<string>('');
    const [isReceptionist, setIsReceptionist] = useState<boolean>(false);
    const [isDoctor, setIsDoctor] = useState<boolean>(false);

    // Snackbar state
    const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>('');
    // Snackbar for booking success
    const [showBookedSnackbar, setShowBookedSnackbar] = useState<boolean>(false);
    const [bookedSnackbarMessage, setBookedSnackbarMessage] = useState<string>('');

    // Doctor selection state
    const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
    const [loadingDoctors, setLoadingDoctors] = useState<boolean>(false);

    // Comprehensive loading states
    const [loadingSessionData, setLoadingSessionData] = useState<boolean>(true);
    const [loadingAppointments, setLoadingAppointments] = useState<boolean>(false);
    const [loadingStatuses, setLoadingStatuses] = useState<boolean>(false);
    const [isInitialLoadComplete, setIsInitialLoadComplete] = useState<boolean>(false);

    // Fetch session data on component mount
    useEffect(() => {
        const fetchSessionData = async () => {
            setLoadingSessionData(true);
            try {
                console.log('=== FETCHING SESSION DATA ===');
                const result = await sessionService.getSessionInfo();
                if (result.success && result.data) {
                    console.log('Session data received:', result.data);
                    setSessionData(result.data);
                    setDoctorId(result.data.doctorId);
                    setClinicId(result.data.clinicId);

                    // Determine user role based on sessionType or userId
                    const sessionType = result.data.sessionType?.toLowerCase() || '';
                    const userId = result.data.userId;

                    // Set role based on sessionType or userId
                    if (sessionType.includes('receptionist') || userId === 1) {
                        setUserRole('Receptionist');
                        setIsReceptionist(true);
                        setIsDoctor(false);
                    } else if (sessionType.includes('doctor') || userId === 7) {
                        setUserRole('Doctor');
                        setIsReceptionist(false);
                        setIsDoctor(true);
                    } else {
                        // Default fallback - check userId
                        if (userId === 1) {
                            setUserRole('Receptionist');
                            setIsReceptionist(true);
                            setIsDoctor(false);
                        } else if (userId === 2) {
                            setUserRole('Doctor');
                            setIsReceptionist(false);
                            setIsDoctor(true);
                        } else {
                            // Default to receptionist if role cannot be determined
                            setUserRole('Receptionist');
                            setIsReceptionist(true);
                            setIsDoctor(false);
                        }
                    }

                    console.log('User role determined:', userRole, 'isReceptionist:', isReceptionist, 'isDoctor:', isDoctor);
                    console.log('Doctor ID set to:', result.data.doctorId);
                    console.log('Clinic ID set to:', result.data.clinicId);
                } else {
                    console.error('Failed to fetch session data:', result.error);
                }
            } catch (error) {
                console.error('Error fetching session data:', error);
            } finally {
                setLoadingSessionData(false);
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
                // gender: getGenderName(patient.gender_id),
                gender: 'Male',
                contact: patient.mobile_1 || "",
                time: "10:00", // Current time as placeholder
                provider: "Dr.Tongaonkar", // Placeholder - you might want to get this from another API
                online: "", // Default value
                status: 'WAITING',
                statusColor: getStatusColor('WAITING'),
                lastOpd: "", // Will be populated by formatLastVisitDisplay
                labs: "No Reports", // Placeholder
                reports_received: patient.reports_received,
                visitNumber: 1, // New patients start with visit number 1
                actions: true
            };
        });
    };

    const formatProviderLabel = (name?: string): string => {
        const raw = String(name || '').trim();
        if (!raw) return '';

        // Clean up multiple spaces and normalize the name
        const cleaned = raw.replace(/\s+/g, ' ').trim();

        const lower = cleaned.toLowerCase();
        if (lower.startsWith('dr.') || lower.startsWith('dr ')) return cleaned;
        return `Dr. ${cleaned}`;
    };

    // Map gender_id to gender name
    const getGenderName = (genderId?: number): string => {
        if (!genderId) return '';
        // Common gender mappings - you might want to fetch this from an API
        switch (genderId) {
            case 1: return 'Male';
            case 2: return 'Female';
            case 3: return 'Other';
            default: return `Gender ${genderId}`;
        }
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
            const patientIdRaw = getField(row, ['patient_id', 'patientId', 'id', 'patientID'], '');
            const patientNameRaw = toStringSafe(getField(row, ['Name', 'patientName', 'patient_name', 'fullName', 'full_name', 'name'], ''));
            const firstNameRaw = toStringSafe(getField(row, ['First_Name', 'first_name', 'FirstName', 'firstName'], ''));
            const middleNameRaw = toStringSafe(getField(row, ['Middle_Name', 'middle_name', 'MiddleName', 'middleName'], ''));
            const lastNameRaw = toStringSafe(getField(row, ['Last_Name', 'last_name', 'LastName', 'lastName'], ''));
            const composedName = `${firstNameRaw} ${middleNameRaw} ${lastNameRaw}`.replace(/\s+/g, ' ').trim();
            const patientName = composedName || patientNameRaw;
            const age = toNumberSafe(getField(row, ['AgeYearsIntRound', 'age_given', 'age', 'patientAge', 'patient_age'], 0));
            const gender = toStringSafe(getField(row, ['gender_description', 'gender', 'genderName', 'gender_name', 'patientGender', 'patient_gender'], ''));
            const mobile = toStringSafe(getField(row, ['Mobile', 'mobileNumber', 'mobile_number', 'contact', 'phone', 'mobile'], ''));
            const apptDate = toStringSafe(getField(row, ['Visit_Date', 'appointmentDate', 'appointment_date', 'visitDate', 'visit_date'], new Date().toISOString().split('T')[0]));
            const apptTime = toStringSafe(getField(row, ['Visit_Time', 'visit_time', 'appointmentTime', 'appointment_time', 'visitTime'], ''));
            const doctor = toStringSafe(getField(row, ['Doctor_Name', 'doctor_name', 'doctorName', 'provider', 'providerName'], doctorFirstName || 'Tongaonkar'));
            const status = toStringSafe(getField(row, ['status_description', 'status', 'appointmentStatus', 'appointment_status'], 'WAITING')).toUpperCase();
            // Don't populate lastOpd from backend - it will be handled by formatLastVisitDisplay
            const lastOpd = "";
            const onlineTime = toStringSafe(getField(row, ['Online_Appointment_Time', 'onlineAppointmentTime', 'online_time', 'onlineTime'], ''));
            const reportsAsked = !!getField(row, ['reportsAsked', 'reports_asked', 'reportsReceived', 'reports_received'], false);
            const visitNumber = toNumberSafe(getField(row, ['patient_visit_no', 'Patient_Visit_No', 'visitNumber', 'visit_number'], 1));
            const shiftId = toNumberSafe(getField(row, ['shift_id', 'Shift_ID', 'shiftId'], 1));
            const clinicIdFromRow = toStringSafe(getField(row, ['clinic_id', 'Clinic_ID', 'clinicId'], ''));
            const genderDescription = toStringSafe(getField(row, ['gender_description', 'genderDescription', 'gender', 'sex'], ''));
            const visitDetailsSubmitted = !!getField(row, ['Is_Submit_Patient_Visit_Details', 'is_submit_patient_visit_details', 'visitDetailsSubmitted'], false);

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
                appointmentId: toStringSafe(getField(row, ['appointmentId', 'appointment_id', 'id'], '')),
                sr: index + 1,
                patientId: finalPatientId,
                patient: patientName,
                visitDate: toStringSafe(getField(row, ['appointmentDate', 'appointment_date', 'visitDate', 'visit_date'], '')),
                age: age,
                gender: gender,
                contact: mobile,
                time: displayTime,
                provider: doctorId,
                online: onlineTime || '',
                status: status,
                statusColor: getStatusColor(status),
                lastOpd: lastOpd,
                labs: '',
                reports_received: reportsAsked,
                doctorId: toStringSafe(getField(row, ['doctor_id', 'doctorId'], '')),
                visitNumber: visitNumber,
                shiftId: shiftId,
                clinicId: clinicIdFromRow,
                actions: true,
                gender_description: genderDescription,
                visitDetailsSubmitted: visitDetailsSubmitted
            };
        });
    };

    // Normalize status for display
    const normalizeStatusLabel = (status: string): string => {
        const s = String(status || '').trim().toUpperCase();
        if (s === 'ON CALL') return 'CONSULT ON CALL';
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
            case 'CONSULT ON CALL': return 'bg-info';
            case 'CHECK OUT': return 'bg-warning';
            case 'COMPLETE': return 'bg-dark';
            case 'SAVE': return 'bg-danger';
            default: return 'bg-secondary';
        }
    };

    const mapStatusLabelToId = (status: string): number => {
        const s = normalizeStatusLabel(status);
        switch (s) {
            case 'WAITING': return 1;
            case 'WITH DOCTOR': return 2;
            case 'CONSULT ON CALL': return 3;
            case 'WAITING FOR MEDICINE': return 4;
            case 'COMPLETE': return 5;
            case 'SUBMITTED': return 6;
            case 'WAITING FOR SERVICE': return 7;
            case 'SERVICE COMPLETED': return 8;
            case 'SAVE': return 9;
            case 'BOOKED': return 10;
            case 'FUTURE': return 11;
            case 'SENT FOR SERVICE': return 12;
            default: return -1; // 👈 better to return -1 (invalid) instead of always 1
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
            // Fix time handling - properly format the time string
            let timeString: string;
            let displayTime: string;

            if (item.appointmentTime) {
                // Handle LocalTime object from backend (e.g., "14:30:00" or "14:30")
                const timeStr = String(item.appointmentTime);
                const timeParts = timeStr.split(':');

                if (timeParts.length >= 2) {
                    const hours = timeParts[0].padStart(2, '0');
                    const minutes = timeParts[1].padStart(2, '0');
                    displayTime = `${hours}:${minutes}`;
                    timeString = `${item.appointmentDate}T${hours}:${minutes}:00`;
                } else {
                    displayTime = '00:00';
                    timeString = `${item.appointmentDate}T00:00:00`;
                }
            } else {
                displayTime = '00:00';
                timeString = `${item.appointmentDate}T00:00:00`;
            }

            const status = (item.status || '').toUpperCase();
            // Prefer First Middle Last if available in item fields
            const first = String((item as any).firstName || (item as any).first_name || '').trim();
            const middle = String((item as any).middleName || (item as any).middle_name || '').trim();
            const last = String((item as any).lastName || (item as any).last_name || '').trim();
            const nameComposed = `${first} ${middle} ${last}`.replace(/\s+/g, ' ').trim();

            return {
                appointmentId: item.appointmentId,
                sr: index + 1,
                patientId: String(item.patientId || ''),
                patient: nameComposed || item.patientName || '',
                visitDate: item.appointmentDate || '',
                age: typeof item.age === 'number' ? item.age : 0,
                gender: '', // Gender not available in Appointment interface
                contact: item.mobileNumber || '',
                time: displayTime, // Use the properly formatted time directly
                provider: formatProviderLabel(item.doctorName || doctorFirstName || 'Tongaonkar'),
                online: item.onlineAppointmentTime || '',
                status: status,
                statusColor: getStatusColor(status),
                lastOpd: "", // Will be populated by formatLastVisitDisplay
                labs: '',
                reports_received: item.reportsAsked ?? false,
                doctorId: '',
                visitNumber: (item as any).visitNumber || 1, // Use visit number from API or default to 1
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
                size: 200 // larger page size to increase coverage
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
                const contact = String(p.mobile_1 || '').replace(/\D/g, ''); // Remove non-digits
                const queryDigits = q.replace(/\D/g, ''); // Remove non-digits from query

                // Check if query matches any of the search criteria
                return (
                    // Exact patient ID match (highest priority)
                    patientId === q ||
                    // Patient ID contains query
                    patientId.includes(q) ||
                    // Contact number exact match (if query is numeric)
                    (queryDigits.length >= 3 && contact.includes(queryDigits)) ||
                    // Multi-word name search - all words must be found in any order across common combinations
                    (queryWords.length > 1 && ([fullName, firstLast, lastFirst]
                        .some(name => queryWords.every(word => name.includes(word))))) ||
                    // Single word name search
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

            // Fallback: if no results for multi-word query, fetch per-token and merge, then filter client-side
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


            // Sort results by priority and relevance
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

                // Priority scoring system
                const getScore = (patient: any) => {
                    const id = String(patient.id || '').toLowerCase();
                    const firstName = String(patient.first_name || '').toLowerCase();
                    const middleName = String(patient.middle_name || '').toLowerCase();
                    const lastName = String(patient.last_name || '').toLowerCase();
                    const fullName = `${firstName} ${middleName} ${lastName}`.replace(/\s+/g, ' ').trim().toLowerCase();
                    const contact = String(patient.mobile_1 || '').replace(/\D/g, '');
                    const queryWords = q.split(/\s+/).filter(word => word.length > 0);

                    let score = 0;

                    // Exact patient ID match (highest priority)
                    if (id === q) score += 1000;
                    // Patient ID starts with query
                    else if (id.startsWith(q)) score += 800;
                    // Patient ID contains query
                    else if (id.includes(q)) score += 600;

                    // Contact exact match
                    if (queryDigits.length >= 3 && contact === queryDigits) score += 200;
                    // Contact contains query
                    if (queryDigits.length >= 3 && contact.includes(queryDigits)) score += 100;

                    // Multi-word name search scoring
                    if (queryWords.length > 1) {
                        const allWordsFound = queryWords.every(word => fullName.includes(word));
                        if (allWordsFound) {
                            // Check if full name starts with the query
                            if (fullName.startsWith(q)) score += 500;
                            // Check if first word matches first name start
                            else if (firstName.startsWith(queryWords[0])) score += 450;
                            // Check if middle word matches middle name start
                            else if (middleName && middleName.startsWith(queryWords[1] || '')) score += 425;
                            // Check if last word matches last name start
                            else if (lastName.startsWith(queryWords[queryWords.length - 1])) score += 400;
                            // All words found but not at start
                            else score += 350;
                        }
                    } else {
                        // Single word name search scoring
                        // First name starts with query
                        if (firstName.startsWith(q)) score += 500;
                        // Middle name starts with query
                        if (middleName.startsWith(q)) score += 450;
                        // Last name starts with query
                        if (lastName.startsWith(q)) score += 400;
                        // Full name starts with query
                        if (fullName.startsWith(q)) score += 300;

                        // First name contains query
                        if (firstName.includes(q)) score += 50;
                        // Middle name contains query
                        if (middleName.includes(q)) score += 45;
                        // Last name contains query
                        if (lastName.includes(q)) score += 40;
                        // Full name contains query
                        if (fullName.includes(q)) score += 30;
                    }

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
            setLoadingAppointments(true);
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
            } finally {
                setLoadingAppointments(false);
            }
        })();
    }, [selectedDoctorId, sessionData?.clinicId]);

    // Load status reference for dynamic statuses
    useEffect(() => {
        (async () => {
            setLoadingStatuses(true);
            try {
                const ref = await getDoctorStatusReference();

                const pickLabel = (row: any): string | null => {
                    const candidates = ['status_description', 'statusDescription', 'description', 'name', 'label', 'status'];
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
            } finally {
                setLoadingStatuses(false);
            }
        })();
    }, []);

    // Track when all initial loading is complete
    useEffect(() => {
        const isComplete = Boolean(
            !loadingSessionData && 
            !loadingDoctors && 
            !loadingAppointments && 
            !loadingStatuses && 
            sessionData && 
            allDoctors.length > 0 && 
            selectedDoctorId
        );
        setIsInitialLoadComplete(isComplete);
    }, [loadingSessionData, loadingDoctors, loadingAppointments, loadingStatuses, sessionData, allDoctors, selectedDoctorId]);

    // Handle refresh trigger from treatment screen
    useEffect(() => {
        if (location.state?.refreshAppointments && location.state?.treatmentSubmitted) {
            console.log('🔄 Treatment submitted, refreshing appointments...');
            // Show refresh notification
            setShowRefreshNotification(true);
            // Clear the state to prevent infinite refresh
            window.history.replaceState({}, document.title);
            // Refresh appointments for the selected doctor
            if (selectedDoctorId && sessionData?.clinicId) {
                refreshAppointmentsForSelectedDoctor();
            }
            // Hide notification after 3 seconds
            setTimeout(() => {
                setShowRefreshNotification(false);
            }, 3000);
        }
    }, [location.state, selectedDoctorId, sessionData?.clinicId]);

    // Fetch previous visits for all appointments when appointments change
    // Removed automatic fetching of previous visits - now only fetch when user clicks on last visit link
    // useEffect(() => {
    //     if (appointments.length > 0) {
    //         appointments.forEach(appointment => {
    //             // Ensure patientId is passed as string key (supports alphanumeric IDs)
    //             if (appointment.patientId) {
    //                 fetchPreviousVisits(appointment.patientId);
    //             }
    //         });
    //     }
    // }, [appointments]);

    // Handle search input change
    // const handleSearchChange = (value: string) => {
    //     setSearchTerm(value);
    //     searchPatients(value);
    // };



    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
    
        const search = value.trim().toLowerCase();
        if (!search) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }
    
        // Use the existing searchPatients function for API-based search
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

    // Handle search button click - filter table on Doctor screen; keep snackbar flow for others
    const handleSearchButtonClick = () => {
        // Doctor screen: apply filters to the table based on selected patient or typed query
        if (isDoctor) {
            const q = (searchTerm || '').trim();

            if (selectedPatients.length > 0) {
                const p = selectedPatients[0] as any;
                const fullName = `${p.first_name || ''} ${p.middle_name || ''} ${p.last_name || ''}`.replace(/\s+/g, ' ').trim();
                setFilterName(fullName || q);
                // If patient has a contact, use it to narrow results
                if (p.mobile_1) setFilterContact(String(p.mobile_1));
                setCurrentPage(1);
                setShowDropdown(false);
                return;
            }

            if (q) {
                setFilterName(q);
                const digits = q.replace(/\D/g, '');
                if (digits.length >= 3) setFilterContact(digits);
                setCurrentPage(1);
                setShowDropdown(false);
                return;
            }

            // If nothing to filter by, show a gentle prompt
            setSnackbarMessage("Type a search term or select a patient to filter");
            setShowSnackbar(true);
            setTimeout(() => setShowSnackbar(false), 2500);
            return;
        }

        // Existing receptionist behavior: check if selected patient has appointment today
        if (selectedPatients.length === 0) {
            setSnackbarMessage("Please select a patient first!");
            setShowSnackbar(true);
            setTimeout(() => setShowSnackbar(false), 3000);
            return;
        }

        const selectedPatient = selectedPatients[0];
        const patientId = String(selectedPatient.id);

        // Check if patient exists in current appointments
        const hasAppointment = appointments.some(appointment =>
            appointment.patientId === patientId
        );

        if (!hasAppointment) {
            setSnackbarMessage("This patient doesn't have an appointment today!!");
            setShowSnackbar(true);
            setTimeout(() => setShowSnackbar(false), 3000);
        } else {
            // Patient has appointment - could show success message or highlight the appointment
            setSnackbarMessage("Patient found in today's appointments!");
            setShowSnackbar(true);
            setTimeout(() => setShowSnackbar(false), 2000);
        }
    };

    // Map backend visit object to PatientFormTest initialData
    const mapPreviousVisitToInitialData = (visit: any, patientName: string, appointmentRow?: AppointmentRow) => {
        console.log('=== MAPPING VISIT DATA ===');
        console.log('Raw visit object:', visit);
        console.log('Visit keys:', Object.keys(visit || {}));
        console.log('Patient name:', patientName);
        console.log('Appointment row:', appointmentRow);

        const [firstName, ...rest] = String(patientName || '').trim().split(/\s+/);
        const lastName = rest.join(' ');
        const get = (obj: any, ...keys: string[]) => {
            for (const k of keys) {
                if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
            }
            return '';
        };
        const bool = (v: any) => Boolean(v);
        const toStr = (v: any) => (v === undefined || v === null ? '' : String(v));

        // Build prescriptions from visit_prescription_overwrite if available; fallback to rawVisit.Prescriptions
        const rxArray = ((): any[] => {
            // First try the existing prescription fields
            const arr = get(visit, 'visit_prescription_overwrite', 'Visit_Prescription_Overwrite', 'prescriptions');
            console.log('Rx array (existing):', arr);

            // If no prescriptions found, try rawVisit.Prescriptions
            if (!arr || !Array.isArray(arr) || arr.length === 0) {
                const rawPrescriptions = get(visit, 'Prescriptions');
                console.log('Raw Prescriptions data:', rawPrescriptions);
                if (Array.isArray(rawPrescriptions) && rawPrescriptions.length > 0) {
                    console.log('Using rawVisit.Prescriptions data');
                    return rawPrescriptions;
                }
            }

            if (Array.isArray(arr)) return arr;
            return [];
        })();
        const prescriptions = rxArray.length > 0
            ? rxArray.map((p: any) => {
                console.log('Mapping prescription item:', p);

                // Try multiple field name variations for medicine
                const med = toStr(get(p, 'medicineName', 'Medicine_Name', 'medicine', 'drug_name', 'item', 'Medicine', 'Drug', 'med_name', 'medication', 'MedName'));

                // Try multiple field name variations for dosage
                const m = toStr(get(p, 'Morning', 'morningDose', 'morning', 'M', 'morn', 'AM')) || '0';
                const a = toStr(get(p, 'Afternoon', 'afternoonDose', 'afternoon', 'A', 'aft', 'PM')) || '0';
                const n = toStr(get(p, 'Night', 'nightDose', 'night', 'N', 'eve', 'Evening')) || '0';

                // Get number of days
                const noOfdays = toStr(get(p, 'noOfDays'));

                // If we have individual dosage components, combine them
                let doseCombined = '';
                if (m !== '0' || a !== '0' || n !== '0') {
                    doseCombined = `${m}-${a}-${n}`;
                    // Add number of days if available
                    if (noOfdays) {
                        doseCombined += ` (${noOfdays} Days)`;
                    }
                } else {
                    // Try to get pre-formatted dosage
                    doseCombined = toStr(get(p, 'Dosage', 'dosage', 'dose', 'Dose', 'dosage_formatted', 'frequency', 'Frequency'));
                    // Add number of days if available and not already included
                    if (noOfdays && !doseCombined.toLowerCase().includes('day')) {
                        doseCombined += ` (${noOfdays} Days)`;
                    }
                }

                // Try multiple field name variations for instructions
                const instr = toStr(get(p, 'Instruction', 'Instructions', 'instruction', 'instructions', 'Instruction_Text', 'directions', 'how_to_take', 'Directions'));

                const mappedPrescription = {
                    medicine: med,
                    dosage: doseCombined,
                    instructions: instr
                };

                console.log('Mapped prescription:', mappedPrescription);
                console.log('Number of days found:', noOfdays);
                return mappedPrescription;
            })
            : (toStr(get(visit, 'Medicine_Name'))
                ? [{
                    medicine: toStr(get(visit, 'Medicine_Name')),
                    dosage: (() => {
                        const baseDosage = toStr(get(visit, 'Dosage', 'dosage', 'dose'));
                        const fallbackDays = toStr(get(visit, 'noOfdays', 'NoOfDays', 'no_of_days', 'No_Of_Days', 'days', 'Days', 'duration', 'Duration'));
                        if (fallbackDays && !baseDosage.toLowerCase().includes('day')) {
                            return `${baseDosage} (${fallbackDays} Days)`;
                        }
                        return baseDosage;
                    })(),
                    instructions: toStr(get(visit, 'Instructions'))
                }]
                : []);


        // Build combined plan including Instructions from previous visit if present
        const planBase = toStr(get(visit, 'plan', 'Plan', 'Treatment_Plan'));
        const planInstr = toStr(get(visit, 'Instructions', 'instructions'));
        const planCombined = [planBase, planInstr].filter(s => s && s.trim().length > 0).join(' | ');

        const mappedData = {
            firstName: toStr(firstName),
            lastName: toStr(lastName),
            age: toStr(appointmentRow?.age || get(visit, 'age', 'age_years')),
            gender: toStr(appointmentRow?.gender || get(visit, 'gender', 'sex', 'gender_description')).charAt(0).toUpperCase(),
            contact: toStr(appointmentRow?.contact || get(visit, 'mobile', 'mobile_1', 'contact')),
            email: toStr(get(visit, 'email')),
            provider: (() => {
                console.log('Provider mapping - appointmentRow?.provider:', appointmentRow?.provider);
                console.log('Provider mapping - appointmentRow?.doctorId:', appointmentRow?.doctorId);

                // First try rawVisit.DoctorName
                const rawDoctorName = toStr(get(visit, 'DoctorName', 'doctor_name', 'Doctor_Name'));
                console.log('Raw visit DoctorName:', rawDoctorName);
                if (rawDoctorName) {
                    console.log('Using rawVisit.DoctorName:', rawDoctorName);
                    return rawDoctorName;
                }

                // Then try appointment row provider
                if (appointmentRow?.provider) {
                    console.log('Using appointment row provider:', appointmentRow.provider);
                    return toStr(appointmentRow.provider);
                }

                // Then try to get doctor name from appointment row doctorId
                const appointmentDoctorName = getDoctorLabelById(appointmentRow?.doctorId);
                console.log('Appointment doctor name result:', appointmentDoctorName);
                if (appointmentDoctorName) {
                    console.log('Using appointment doctor name:', appointmentDoctorName);
                    return appointmentDoctorName;
                }

                // Then try to get doctor name from visit doctorId
                const visitDoctorId = get(visit, 'doctor_id', 'Doctor_ID', 'doctorId');
                console.log('Visit doctor ID:', visitDoctorId);
                const visitDoctorName = getDoctorLabelById(visitDoctorId);
                console.log('Visit doctor name result:', visitDoctorName);
                if (visitDoctorName) {
                    console.log('Using visit doctor name:', visitDoctorName);
                    return visitDoctorName;
                }

                // Finally fallback to other visit doctor name fields
                const fallbackName = toStr(get(visit, 'provider', 'doctor', 'Doctor'));
                console.log('Using fallback name:', fallbackName);
                return fallbackName;
            })(),

            // Vitals
            height: toStr(get(visit, 'height_cm', 'height', 'Height_In_Cms', 'Height')),
            weight: toStr(get(visit, 'weight_kg', 'weight', 'Weight_IN_KGS', 'Weight')),
            pulse: toStr(get(visit, 'pulse', 'Pulse', 'pulse_rate')),
            bp: toStr(get(visit, 'bp', 'blood_pressure', 'Blood_Pressure', 'BP')),
            temperature: toStr(get(visit, 'temperature_f', 'temperature', 'Temperature', 'temp')),
            sugar: toStr(get(visit, 'sugar', 'Sugar', 'blood_sugar', 'glucose')),
            tft: toStr(get(visit, 'tft', 'TFT', 'thyroid_function_test')),
            pallorHb: toStr(get(visit, 'Pallor', 'pallorHb', 'pallor_hb', 'Pallor_HB', 'hemoglobin', 'hb')),
            referredBy: toStr(get(visit, 'Refer_Doctor_Details', 'referredBy', 'referred_by', 'Referred_By', 'referred_to')),

            // Flags
            inPerson: bool(get(visit, 'in_person', 'inPerson')),
            hypertension: bool(get(visit, 'hypertension', 'htn', 'Hypertension')),
            diabetes: bool(get(visit, 'diabetes', 'dm', 'Diabetes')),
            cholesterol: bool(get(visit, 'cholesterol', 'Cholestrol')),
            ihd: bool(get(visit, 'ihd', 'Ihd')),
            asthma: bool(get(visit, 'asthma', 'Asthama')),
            th: bool(get(visit, 'th', 'Th')),
            smoking: bool(get(visit, 'smoking', 'Smoking')),
            tobacco: bool(get(visit, 'tobacco', 'Tobaco')),
            alcohol: bool(get(visit, 'alcohol', 'Alchohol')),

            // Narrative
            allergy: toStr(get(visit, 'allergy', 'Allergy', 'allergies', 'Allergies')),
            medicalHistory: toStr(get(visit, 'medical_history', 'Medical_History', 'medicalHistory', 'past_history', 'Past_History')),
            surgicalHistory: toStr(get(visit, 'surgical_history', 'Surgical_History', 'surgicalHistory', 'surgery_history', 'Surgery_History')),
            visitComments: toStr(get(visit, 'visit_comments', 'Visit_Comments', 'visitComments', 'comments', 'Comments')),
            medicines: toStr(get(visit, 'medicines', 'Current_Medicines', 'current_medicines', 'currentMedicines', 'medications')),
            detailedHistory: toStr(get(visit, 'detailed_history', 'Detailed_History', 'Additional_Comments', 'detailedHistory', 'additional_comments', 'history')),
            examinationFindings: toStr(get(visit, 'examination_findings', 'Important_Findings', 'examinationFindings', 'findings', 'Findings', 'clinical_findings')),
            examinationComments: toStr(get(visit, 'examination_comments', 'Examination_Comments', 'examinationComments', 'exam_comments', 'Exam_Comments')),
            procedurePerformed: toStr(get(visit, 'procedure_performed', 'Procedure_Performed', 'procedurePerformed', 'procedures', 'Procedures')),

            // Current visit text
            complaints: toStr(get(visit, 'Complaints')),
            provisionalDiagnosis: toStr(get(visit, 'Diagnosis')),
            // Plan content includes PV Instructions when present
            plan: planCombined,
            addendum: toStr(get(visit, 'addendum', 'Addendum', 'notes', 'Notes', 'additional_notes')),

            // New current visit fields
            labSuggested: toStr(get(visit, 'labSuggested', 'lab_suggested', 'Lab_Suggested', 'lab_tests', 'Lab_Tests', 'investigations')),
            dressing: toStr(get(visit, 'dressing', 'Dressing', 'dressing_required', 'Dressing_Required')),
            procedure: toStr(get(visit, 'procedure', 'Procedure', 'procedures_done', 'Procedures_Done', 'treatment_procedure')),

            prescriptions,

            // Billing
            billed: toStr(get(visit, 'billed_amount', 'Billed_Amount', 'billed', 'Billed', 'total_amount', 'Total_Amount')),
            discount: toStr(get(visit, 'discount_amount', 'Discount', 'Original_Discount', 'discount', 'Discount_Amount')),
            dues: toStr(get(visit, 'dues_amount', 'Fees_To_Collect', 'dues', 'Dues', 'pending_amount', 'Pending_Amount')),
            collected: toStr(get(visit, 'collected_amount', 'Fees_Collected', 'collected', 'Collected', 'paid_amount', 'Paid_Amount')),
            receiptAmount: toStr(get(visit, 'receipt_amount', 'Receipt_Amount', 'receiptAmount', 'receipt_total', 'Receipt_Total')),
            receiptNo: toStr(get(visit, 'receipt_no', 'Receipt_No', 'receiptNo', 'receipt_number', 'Receipt_Number')),
            receiptDate: toStr(get(visit, 'receipt_date', 'Receipt_Date', 'receiptDate', 'receipt_issue_date', 'Receipt_Issue_Date')),
            followUpType: toStr(get(visit, 'followup_type', 'Follow_Up_Type', 'followUpType', 'follow_up_type', 'Follow_Up_Type')),
            followUp: toStr(get(visit, 'followup_label', 'Follow_Up', 'followUp', 'follow_up', 'Follow_Up', 'next_visit')),
            followUpDate: toStr(get(visit, 'followup_date', 'Follow_Up_Date', 'followUpDate', 'follow_up_date', 'Follow_Up_Date', 'next_visit_date')),
            remark: toStr(get(visit, 'remark', 'Remark', 'remarks', 'Remarks', 'notes', 'Notes', 'comments', 'Comments')),
            // Include the full raw visit payload for access to all fields
            rawVisit: visit
        };

        console.log('=== MAPPED FORM DATA ===');
        console.log('Final mapped data:', mappedData);
        console.log('=== END MAPPED FORM DATA ===');

        return mappedData;
    };

    const handleLastVisitClick = async (patientId: string, patientName: string, appointmentRow?: AppointmentRow) => {
        try {
            console.log('handleLastVisitClick - appointmentRow:', appointmentRow);
            console.log('appointmentRow.doctorId:', appointmentRow?.doctorId);
            console.log('appointmentRow.provider:', appointmentRow?.provider);
            setSelectedPatientForForm({ id: patientId, name: patientName, appointmentRow });
            const todaysVisitDate = new Date().toISOString().split('T')[0];
            const resp: any = await appointmentService.getPatientPreviousVisits({
                patientId,
                doctorId: selectedDoctorId || doctorId || '',
                clinicId: sessionData?.clinicId || '',
                todaysVisitDate
            });

            // Try common shapes
            const visits = resp?.visits || resp?.data?.visits || resp?.resultSet1 || [];
            const success = resp?.success !== false; // default true if not provided
            const latest = Array.isArray(visits) && visits.length ? visits[0] : null;

            // Store all visits and extract/sort visit dates chronologically (oldest -> newest)
            const parseVisitDate = (v: any): number => {
                const s: string = v.visit_date || v.Visit_Date || v.appointmentDate || v.appointment_date || '';
                if (!s) return 0;
                const d = new Date(s);
                const t = d.getTime();
                return isNaN(t) ? 0 : t;
            };

            const sortedVisits = Array.isArray(visits)
                ? [...visits].sort((a, b) => parseVisitDate(a) - parseVisitDate(b)) // ascending: oldest -> newest
                : [];

            setAllVisits(sortedVisits);
            const dates = sortedVisits
                .map((visit: any) => visit.visit_date || visit.Visit_Date || visit.appointmentDate || visit.appointment_date || '')
                .filter((date: any) => date);
            setVisitDates(dates);
            // Start at newest visit (last index) so that back (prev) goes to older, next goes to newer
            setCurrentVisitIndex(Math.max(0, sortedVisits.length - 1));

            if (success && latest) {
                const mapped = mapPreviousVisitToInitialData(latest, patientName, appointmentRow);
                console.log('Mapped form data:', mapped);
                console.log('Provider in mapped data:', mapped.provider);
                console.log('Full latest visit payload:', latest);
                setFormPatientData(mapped);
            } else {
                // If no previous visit data, create basic form data from appointment row
                const basicData = appointmentRow ? {
                    firstName: patientName.split(' ')[0] || '',
                    lastName: patientName.split(' ').slice(1).join(' ') || '',
                    age: String(appointmentRow.age || ''),
                    gender: appointmentRow.gender || '',
                    contact: appointmentRow.contact || '',
                    email: '',
                    provider: appointmentRow.provider || getDoctorLabelById(appointmentRow.doctorId) || '',
                    height: '',
                    weight: '',
                    pulse: '',
                    bp: '',
                    temperature: '',
                    hypertension: false,
                    diabetes: false,
                    cholesterol: false,
                    ihd: false,
                    asthma: false,
                    th: false,
                    smoking: false,
                    tobacco: false,
                    alcohol: false,
                    inPerson: true,
                    allergy: '',
                    medicalHistory: '',
                    surgicalHistory: '',
                    visitComments: '',
                    medicines: '',
                    detailedHistory: '',
                    examinationFindings: '',
                    examinationComments: '',
                    procedurePerformed: '',
                    complaints: '',
                    provisionalDiagnosis: '',
                    plan: '',
                    addendum: '',
                    prescriptions: [],
                    billed: '',
                    discount: '',
                    dues: '',
                    collected: '',
                    receiptAmount: '',
                    receiptNo: '',
                    receiptDate: '',
                    followUpType: '',
                    followUp: '',
                    followUpDate: '',
                    remark: ''
                } : null;
                console.log('Basic form data (no previous visit):', basicData);
                console.log('Provider in basic data:', basicData?.provider);
                setFormPatientData(basicData);
            }
        } catch (e) {
            console.error('Error loading previous visit for patient:', patientId, e);
            setFormPatientData(null);
        } finally {
            setShowPatientFormDialog(true);
        }
    };

    // Handle visit date navigation
    const handleVisitDateChange = (newIndex: number) => {
        if (newIndex >= 0 && newIndex < allVisits.length) {
            setCurrentVisitIndex(newIndex);
            const selectedVisit = allVisits[newIndex];
            const patientName = selectedPatientForForm?.name || '';
            const appointmentRow = selectedPatientForForm?.appointmentRow;

            const mapped = mapPreviousVisitToInitialData(selectedVisit, patientName, appointmentRow);
            setFormPatientData(mapped);
        }
    };

    // Handle ESC key to close dialog
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && showPatientFormDialog) {
                setShowPatientFormDialog(false);
            }
        };

        if (showPatientFormDialog) {
            document.addEventListener('keydown', handleEscKey);
            // Prevent body scroll when dialog is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
            document.body.style.overflow = 'unset';
        };
    }, [showPatientFormDialog]);

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

            // Build query parameters for doctor and clinic context
            const params = new URLSearchParams();
            if (doctorId) params.append('doctorId', doctorId);
            if (clinicId) params.append('clinicId', clinicId);
            // Ensure backend filters for completed visits (statusId 3 = Completed)
            params.append('statusId', '3');

            console.log(`🔍 Fetching previous visits for patient ${key} with doctorId: ${doctorId}, clinicId: ${clinicId}`);
            const response = await (patientService.getPreviousVisitDates as any)(key, params.toString());

            console.log(`🔍 Fetched visits for patient ${key}:`, {
                totalVisits: response.total_visits,
                usesDirectQuery: (response as any).uses_direct_query,
                completedStatusId: (response as any).completed_status_id,
                statusFilterUsed: (response as any).status_filter_used,
                doctorId: (response as any).doctor_id,
                clinicId: (response as any).clinic_id,
                visits: response.visits
            });

            // Debug: Log the first few visits in detail
            if (response.visits && response.visits.length > 0) {
                console.log(`📋 Visit details for patient ${key}:`);
                response.visits.slice(0, 3).forEach((visit: any, index: number) => {
                    console.log(`  Visit ${index}: Date=${visit.visit_date}, Time=${visit.visit_time}, VisitNo=${visit.patient_visit_no}, Status=${visit.status_id}, Doctor=${visit.doctor_id}`);
                });
            }

            // Normalize visit data across possible field name variations from backend
            const normalizedVisits = (response.visits || []).map((visit: any) => {
                // Normalize common field names from various API shapes
                const visitDate = visit.visit_date ?? visit.Visit_Date ?? visit.appointmentDate ?? visit.appointment_date;
                const doctorId = visit.doctor_id ?? visit.Doctor_ID ?? visit.prevDoctor_ID ?? visit.doctorId;
                const patientVisitNo = visit.patient_visit_no ?? visit.visit_number ?? visit.Patient_Visit_No ?? visit.Patient_Visit_No?.toString?.();
                const statusId = visit.status_id ?? visit.Status_ID ?? visit.statusId;
                // Normalize time if provided in combined strings like "28-Jun-2025 - 23:34:00"
                let visitTime = visit.visit_time ?? visit.visitTime;
                const visitDateTime = visit.Visit_DateTime ?? visit.visit_date_time ?? visit.Visit_Date_Shift ?? visit.DATE_TIME_NUMBER;
                if (!visitTime && typeof visitDateTime === 'string') {
                    const timeMatch = visitDateTime.match(/\b(\d{1,2}:\d{2}:\d{2})\b/);
                    if (timeMatch) visitTime = timeMatch[1];
                }
                return {
                    ...visit,
                    visit_date: visitDate,
                    doctor_id: doctorId,
                    patient_visit_no: patientVisitNo,
                    status_id: statusId,
                    visit_time: visitTime
                };
            });

            // With the updated API, visits are already filtered to show only completed visits
            // Add validation after normalization so we don't drop valid visits due to field mismatch
            const validVisits = normalizedVisits.filter((visit: PatientVisit | any) => {
                const hasVisitNo = (visit as any).patient_visit_no != null && (visit as any).patient_visit_no !== '';
                const isValid = Boolean(visit.visit_date && visit.doctor_id && hasVisitNo);
                if (!isValid) {
                    console.log(`⚠️ Invalid visit filtered out for patient ${key}:`, visit);
                }
                return isValid;
            });

            console.log(`✅ Found ${validVisits.length} completed visits for patient ${key} (status filter: ${(response as any).status_filter_used})`);

            setPreviousVisits(prev => ({ ...prev, [key]: validVisits }));
        } catch (error) {
            console.error(`❌ Failed to fetch previous visits for patient ${key}:`, error);
            setPreviousVisits(prev => ({ ...prev, [key]: [] }));
        } finally {
            setLoadingVisits(prev => ({ ...prev, [key]: false }));
        }
    };

    // Cache for last-visit suffix decision (whether to append "- L") per patient
    const [lastVisitSuffix, setLastVisitSuffix] = useState<Record<string, boolean>>({});
    const [loadingLastVisitSuffix, setLoadingLastVisitSuffix] = useState<Record<string, boolean>>({});

    const fetchLastVisitSuffix = async (patientId: string | number) => {
        const key = String(patientId);
        setLoadingLastVisitSuffix(prev => ({ ...prev, [key]: true }));
        try {
            const data: any = await appointmentService.getLastVisitDetails(String(patientId));
            console.log('Last visit details:', data);
            const plrStr = String(data?.visit?.plr?? '');
            // const plrStr = typeof plr === 'string' ? plr : plr != null ? String(plr) : '';
            const shouldAppend = plrStr == 'PLR' || plrStr.includes('L');
            setLastVisitSuffix(prev => ({ ...prev, [key]: shouldAppend }));
        } catch (error) {
            console.error(`❌ Failed to fetch last visit PLR for patient ${key}:`, error);
            setLastVisitSuffix(prev => ({ ...prev, [key]: false }));
        } finally {
            setLoadingLastVisitSuffix(prev => ({ ...prev, [key]: false }));
        }
    };

    // Format last visit display according to requirements: date-provider-L format
    const formatLastVisitDisplay = (patientId: string | number, reportsReceived: boolean, isNewPatient: boolean = false): string => {
        const key = String(patientId);
        const visits = previousVisits[key];

        // If this is a new patient (first visit), show "-"
        if (isNewPatient) {
            return "-";
        }

        // If no previous visits data is loaded yet, show "Loading..." or fetch the data
        if (!visits) {
            // Trigger fetch for this patient if not already loading
            if (!loadingVisits[key]) {
                fetchPreviousVisits(patientId);
            }
            return "Loading...";
        }

        // If visits array is empty, this means patient has no valid previous visits
        // (all visits were cancelled/no-show or patient is truly new)
        if (visits.length === 0) {
            return "-";
        }

        // With the updated API, visits are now filtered by status and sorted by date DESC
        // The first visit in the array should be the most recent valid visit

        // With the updated API, visits are now sorted by date DESC (newest first)
        // So the first visit in the array is the latest completed visit (including today's if completed)
        // This is exactly what we want to show as "Last Visit"

        const displayVisit = visits[0]; // First visit is the latest completed visit
        const visitIndex = 0;

        console.log(`🔍 Formatting last visit for patient ${key}:`, {
            totalVisits: visits.length,
            isNewPatient: isNewPatient,
            allVisits: visits.map((v, i) => ({
                index: i,
                date: v.visit_date,
                visitNo: v.patient_visit_no,
                status: v.status_id
            })),
            selectedVisit: {
                index: visitIndex,
                date: displayVisit.visit_date,
                visitNo: displayVisit.patient_visit_no,
                status: displayVisit.status_id,
                reason: visits.length === 1 ? "Only one visit" : "Latest completed visit"
            }
        });

        // Format date as DD-MMM-YY
        const visitDate = new Date(displayVisit.visit_date);
        const monthAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formattedDate = `${String(visitDate.getDate()).padStart(2, '0')}-${monthAbbr[visitDate.getMonth()]}-${String(visitDate.getFullYear()).slice(-2)}`;

        // Get provider name from doctor_id (prefer mapping to real doctor name)
        let providerName = getDoctorLabelById(displayVisit.doctor_id);
        if (!providerName) {
            const rawId = String(displayVisit.doctor_id || '').trim();
            if (rawId) {
                providerName = rawId.startsWith('DR-') ? `Dr. ${rawId.slice(3)}` : formatProviderLabel(rawId);
            } else {
                providerName = 'Unknown Provider';
            }
        }

        // Build the display string: date - provider
        let displayText = `${formattedDate} - ${providerName}`;

        // Decide whether to append "- L" based on PLR from last-visit API
        const cached = lastVisitSuffix[key];
        if (cached === undefined) {
            if (!loadingLastVisitSuffix[key]) {
                fetchLastVisitSuffix(patientId);
            }
        } else if (cached) {
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
        if (!id) {
            console.log('getDoctorLabelById: No ID provided');
            return '';
        }
        const doc = allDoctors.find(d => d.id === id);
        const result = doc ? formatProviderLabel(doc.name) : '';
        console.log(`getDoctorLabelById: ID=${id}, Found doctor:`, doc);
        console.log(`getDoctorLabelById: Original name="${doc?.name}", Formatted result="${result}"`);
        return result;
    };

    // Helper function to convert provider name back to doctor ID
    const getDoctorIdFromProviderName = (providerName: string): string => {
        if (!providerName || !allDoctors.length) {
            return '';
        }
        
        // Find doctor by matching the formatted label
        const doctor = allDoctors.find(d => {
            const formattedName = formatProviderLabel(d.name);
            return formattedName === providerName;
        });
        
        console.log(`getDoctorIdFromProviderName: Provider="${providerName}", Found doctor:`, doctor);
        return doctor ? doctor.id : '';
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

        setLoadingAppointments(true);
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
        } finally {
            setLoadingAppointments(false);
        }
    };

    // Book appointment - immediately call API
    const handleBookAppointment = async () => {
        if (selectedPatients.length === 0) {
            setSnackbarMessage("Please select a patient to book an appointment.");
            setShowSnackbar(true);
            setTimeout(() => setShowSnackbar(false), 3000);
            return;
        }

        if (selectedPatients.length > 1) {
            setSnackbarMessage("Please select only one patient at a time.");
            setShowSnackbar(true);
            setTimeout(() => setShowSnackbar(false), 3000);
            return;
        }

        if (!selectedDoctorId) {
            setSnackbarMessage("Please select a doctor for the appointment.");
            setShowSnackbar(true);
            setTimeout(() => setShowSnackbar(false), 3000);
            return;
        }

        const patient = selectedPatients[0];

        try {
            // Block booking if patient has any non-COMPLETED appointment today
            const hasNonCompletedAppointment = appointments.some(
                (a) => a.patientId === String(patient.id) && String(a.status || '').toUpperCase() !== 'COMPLETE'
            );
            if (hasNonCompletedAppointment) {
                setSnackbarMessage("This patient has an existing appointment that is not COMPLETE. Please complete it before booking a new one.");
                setShowSnackbar(true);
                setTimeout(() => setShowSnackbar(false), 4000);
                return;
            }

            // Get clinic ID from session
            let clinicId = sessionData?.clinicId;
            if (!clinicId) {
                try {
                    const sessionClinicId = await sessionService.getClinicId();
                    clinicId = sessionClinicId || undefined;
                } catch (error) {
                    console.error('Failed to get clinic ID from session:', error);
                }
            }

            if (!clinicId) {
                setSnackbarMessage("Unable to determine clinic ID. Please ensure you are properly logged in and try again.");
                setShowSnackbar(true);
                setTimeout(() => setShowSnackbar(false), 4000);
                return;
            }

            const now = new Date();
            const hh = String(now.getHours()).padStart(2, '0');
            const mm = String(now.getMinutes()).padStart(2, '0');
            const currentVisitTime = `${hh}:${mm}`;

            const appointmentData: AppointmentRequest = {
                visitDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
                shiftId: 1, // Default shift ID
                clinicId: clinicId, // Use clinic ID from session
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
                    setBookedSnackbarMessage(`Appointment booked for ${patient.first_name} ${patient.last_name}`);
                    setShowBookedSnackbar(true);
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
                    setBookedSnackbarMessage(`Appointment booked for ${patient.first_name} ${patient.last_name}`);
                    setShowBookedSnackbar(true);
                }
            } else {
                setSnackbarMessage(`Failed to book appointment: ${result.error || 'Unknown error'}`);
                setShowSnackbar(true);
                setTimeout(() => setShowSnackbar(false), 4000);
            }
        } catch (error) {
            console.error("Error booking appointment:", error);
            setSnackbarMessage("Failed to book appointment. Please try again.");
            setShowSnackbar(true);
            setTimeout(() => setShowSnackbar(false), 4000);
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

        // For doctor screen, show patients with "WAITING", "WITH DOCTOR", or "CONSULT ON CALL" status
        if (isDoctor) {
            const normalizedStatus = normalizeStatusLabel(a.status);
            const doctorStatusOk = normalizedStatus === 'WAITING' || normalizedStatus === 'WITH DOCTOR' || normalizedStatus === 'CONSULT ON CALL' || normalizedStatus === 'SAVE';
            return nameOk && contactOk && statusOk && doctorStatusOk;
        }

        return nameOk && contactOk && statusOk;
    });
    // Sort order depends on role
    // - Doctor: WITH DOCTOR (top) -> CONSULT ON CALL -> WAITING
    // - Others: WAITING (top) as before
    const sortedAppointments = isDoctor
        ? [...filteredAppointments].sort((a, b) => {
            const priority = (s: string) => {
                const n = normalizeStatusLabel(s);
                if (n === 'WITH DOCTOR') return 0;
                if (n === 'CONSULT ON CALL') return 1;
                if (n === 'WAITING' || n === 'SAVE') return 2;
                return 99;
            };
            const pa = priority(a.status);
            const pb = priority(b.status);
            if (pa !== pb) return pa - pb;
            return 0;
        })
        : [...filteredAppointments].sort((a, b) => {
            const aIsWaiting = mapStatusLabelToId(a.status) === 1;
            const bIsWaiting = mapStatusLabelToId(b.status) === 1;
            if (aIsWaiting === bIsWaiting) return 0;
            return aIsWaiting ? -1 : 1;
        });
    const totalPages = Math.ceil(filteredAppointments.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentAppointments = sortedAppointments.slice(startIndex, endIndex);
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
        // Update visible provider label
        updateAppointmentField(index, 'provider', value);
        // Also keep underlying doctorId in sync for filtering/refresh logic
        const resolvedDoctorId = getDoctorIdFromProviderName(value);
        if (resolvedDoctorId) {
            updateAppointmentField(index, 'doctorId' as any, resolvedDoctorId);
        }
    };

    // Handle visit details submission flag
    const handleVisitDetailsSubmitted = (isSubmitFlag: boolean) => {
        console.log('Visit details submitted with flag:', isSubmitFlag);
        if (isSubmitFlag && selectedPatientForVisit?.patientId) {
            // Add the patient ID to the submitted set to change icon color
            setSubmittedVisitDetails(prev => new Set([...prev, selectedPatientForVisit.patientId.toString()]));
            console.log('Patient visit details submitted for patient ID:', selectedPatientForVisit.patientId);
            
            // Update the appointment in the local state to reflect the change immediately
            setAppointments(prev => prev.map(appointment => 
                appointment.patientId === selectedPatientForVisit.patientId 
                    ? { ...appointment, visitDetailsSubmitted: true }
                    : appointment
            ));
        }
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
            'CONSULT ON CALL': 0,
            'CHECK OUT': 0,
            'COMPLETE': 0,
            'SAVE': 0
        };

        // For doctor screen, count patients with "WAITING", "WITH DOCTOR", or "CONSULT ON CALL" status
        const appointmentsToCount = isDoctor
            ? appointments.filter(appt => {
                const normalizedStatus = normalizeStatusLabel(appt.status);
                return normalizedStatus === 'WAITING' || normalizedStatus === 'WITH DOCTOR' || normalizedStatus === 'CONSULT ON CALL';
            })
            : appointments;

        for (const appt of appointmentsToCount) {
            const key = normalizeStatusLabel(appt.status);
            if (!(key in counts)) counts[key] = 0;
            counts[key] += 1;
        }
        return counts;
    }, [appointments, isDoctor]);

    // Doctor Screen Component - Same UI but different functionality
    const DoctorScreen = () => {
        // Show loader until all essential API calls complete for doctor view
        const isDoctorLoading = (
            loadingSessionData ||
            loadingDoctors ||
            loadingStatuses ||
            loadingAppointments ||
            !sessionData ||
            allDoctors.length === 0 ||
            !selectedDoctorId
        );

        return (
            <div className="container-fluid mt-3" style={{ fontFamily: "'Roboto', sans-serif" }}>

                <style>{`
        /* Fixed table layout to respect column widths */
        .table.appointments-table { table-layout: fixed !important; width: 100%;}
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
        /* Fixed column widths: 10% for Sr, Age, Online, Action; 20% for Patient Name, Contact, Provider, Status, Last Visit */
        .appointments-table th.sr-col, .appointments-table td.sr-col { width: 2%; }
        .appointments-table th.name-col, .appointments-table td.name-col { width: 10%; }
        .appointments-table th.gender-col, .appointments-table td.gender-col { width: 6%; }
        .appointments-table th.age-col, .appointments-table td.age-col { width: 3%; }
        .appointments-table th.contact-col, .appointments-table td.contact-col { width: 8%; }
        .appointments-table th.time-col, .appointments-table td.time-col { width:3%; }
        .appointments-table th.provider-col, .appointments-table td.provider-col { width: 15%; }
        .appointments-table th.online-col, .appointments-table td.online-cell { width: 6%; }
        .appointments-table td.online-cell .form-control { width: 70px !important; min-width: 40px !important; }
        .appointments-table th.status-col, .appointments-table td.status-col { width: 14%; }
        .appointments-table th.last-col, .appointments-table td.last-col { width: 15%; }
        .appointments-table th.action-col, .appointments-table td.action-col { width: 10%; }
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
        .card-details { display: grid; grid-template-columns: 3fr 1fr; gap: 6px 12px; margin-bottom: 10px; }
        .kv { display: flex; gap: 6px; align-items: center; min-width: 0; }
        .kv .k { color: #607D8B; font-size: 0.76rem; }
        .kv .v { color: #111827; font-size: 0.8rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .crm-actions { display: grid; grid-template-columns: repeat(4, 32px); gap: 8px; }
        .crm-btn { width: 36px; height: 36px; border-radius: 6px; background: 'transparent'; display: inline-flex; align-items: center; justify-content: center; color:black; border: 1px solid #CFD8DC; cursor: pointer; }
        .crm-btn:hover { background: 'transparent'; color:black; border-color:'transparent'; }
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
            // background: #f5f5f5;
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
            background: #1E88E5;
            color: #fff;
            border-color: #000;
        }
        .nav-btn:hover:not(:disabled) {
            // background: #111;
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
        
                
        /* Snackbar animation */
        @keyframes slideInUp {
            from {
                transform: translateY(100%);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
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
            /* Adjust column widths for large desktops */
            .appointments-table th.sr-col, .appointments-table td.sr-col { width: 5%; }
            .appointments-table th.name-col, .appointments-table td.name-col { width: 18%; }
            .appointments-table th.age-col, .appointments-table td.age-col { width: 4%; }
            .appointments-table th.contact-col, .appointments-table td.contact-col { width: 10%; }
            .appointments-table th.time-col, .appointments-table td.time-col { width: 6%; }
            .appointments-table th.online-col, .appointments-table td.online-cell { width: 10%; }
            .appointments-table th.status-col, .appointments-table td.status-col { width: 17%; }
            .appointments-table th.last-col, .appointments-table td.last-col { width: 15%; }
            .appointments-table th.action-col, .appointments-table td.action-col { width: 15%; }
        }

        /* <= 1199.98px (Desktops) */
        @media (max-width: 1199.98px) {
            .d-flex.mb-3.align-items-center { flex-wrap: nowrap; overflow-x: auto; -webkit-overflow-scrolling: touch; gap: 8px; }
            .d-flex.mb-3.align-items-center .btn { white-space: nowrap; }
            /* Adjust column widths for desktops */
            .appointments-table th.sr-col, .appointments-table td.sr-col { width: 6%; }
            .appointments-table th.name-col, .appointments-table td.name-col { width: 20%; }
            .appointments-table th.age-col, .appointments-table td.age-col { width: 5%; }
            .appointments-table th.contact-col, .appointments-table td.contact-col { width: 12%; }
            .appointments-table th.time-col, .appointments-table td.time-col { width: 7%; }
            .appointments-table th.online-col, .appointments-table td.online-cell { width: 10%; }
            .appointments-table th.status-col, .appointments-table td.status-col { width: 20%; }
            .appointments-table th.last-col, .appointments-table td.last-col { width: 10%; }
            .appointments-table th.action-col, .appointments-table td.action-col { width: 10%; }
        }

        /* <= 991.98px (Tablets) */
        @media (max-width: 991.98px) {
            .d-flex.mb-3.align-items-center { flex-direction: column; align-items: stretch; gap: 12px; }
            .d-flex.mb-3.align-items-center .position-relative { width: 100%; }
            .d-flex.mb-3.align-items-center .position-relative input { width: 100% !important; min-width: auto !important; }
            .d-flex.mb-3.align-items-center .form-select { width: 100% !important; height: 38px !important; }
            .d-flex.mb-3.align-items-center .btn { width: 100%; }
            .d-flex.mb-3.align-items-center .d-flex.align-items-center.ms-auto { margin-left: 0 !important; align-self: center; }
            /* Adjust column widths for tablets */
            .appointments-table th.sr-col, .appointments-table td.sr-col { width: 8%; }
            .appointments-table th.name-col, .appointments-table td.name-col { width: 28%; }
            .appointments-table th.age-col, .appointments-table td.age-col { width: 6%; }
            .appointments-table th.contact-col, .appointments-table td.contact-col { width: 18%; }
            .appointments-table th.time-col, .appointments-table td.time-col { width: 8%; }
            .appointments-table th.online-col, .appointments-table td.online-cell { width: 12%; }
            .appointments-table th.status-col, .appointments-table td.status-col { width: 20%; }
            .appointments-table th.last-col, .appointments-table td.last-col { width: 0%; display: none; }
            .appointments-table th.action-col, .appointments-table td.action-col { width: 0%; display: none; }
        }

        /* <= 767.98px (Landscape phones) */
        @media (max-width: 767.98px) {
            .d-flex.mb-3.align-items-center { gap: 10px; }
            .d-flex.mb-3.align-items-center .form-select { width: 30% !important; height: 30px !important; }
            /* Narrow screens: reduce columns shown */
            .appointments-table th.sr-col, .appointments-table td.sr-col { width: 10%; }
            .appointments-table th.name-col, .appointments-table td.name-col { width: 45%; }
            .appointments-table th.age-col, .appointments-table td.age-col { width: 10%; }
            .appointments-table th.contact-col, .appointments-table td.contact-col { width: 35%; }
            .appointments-table th.time-col, .appointments-table td.time-col, 
            .appointments-table th.provider-col, .appointments-table td.provider-col,
            .appointments-table th.online-col, .appointments-table td.online-cell,
            .appointments-table th.status-col, .appointments-table td.status-col,
            .appointments-table th.last-col, .appointments-table td.last-col,
            .appointments-table th.action-col, .appointments-table td.action-col { display: none; }
        }

        /* <= 575.98px (Portrait phones) */
        @media (max-width: 575.98px) {
            .d-flex.mb-3.align-items-center { gap: 8px; }
            .d-flex.mb-3.align-items-center .form-select { width: 30% !important; height: 30px !important; }
            /* Smallest screens: show only essential columns */
            .appointments-table th.sr-col, .appointments-table td.sr-col { width: 15%; }
            .appointments-table th.name-col, .appointments-table td.name-col { width: 85%; }
            .appointments-table th.age-col, .appointments-table td.age-col,
            .appointments-table th.contact-col, .appointments-table td.contact-col,
            .appointments-table th.time-col, .appointments-table td.time-col,
            .appointments-table th.provider-col, .appointments-table td.provider-col,
            .appointments-table th.online-col, .appointments-table td.online-cell,
            .appointments-table th.status-col, .appointments-table td.status-col,
            .appointments-table th.last-col, .appointments-table td.last-col,
            .appointments-table th.action-col, .appointments-table td.action-col { display: none; }
        }

        /*============ Responsive table ============*/
        /* Large desktops down: enable horizontal scroll if needed */
        @media (max-width: 1399.98px) {
            .table-responsive { overflow-x: auto; -webkit-overflow-scrolling: touch; }
            .appointments-table thead th { white-space: nowrap; }
            .appointments-table tbody td { white-space: nowrap; }
        }
        /* Ensure table is always visible with horizontal scroll on smaller screens */
        .container-fluid { overflow-x: auto; }
        
        /* Desktops */
        @media (max-width: 1199.98px) {
            .appointments-table { min-width: 100%; }
            .appointments-table thead th { padding: 6px 8px !important; }
            .appointments-table tbody td { padding: 6px 8px !important; }
        }
        /* Tablets */
        @media (max-width: 991.98px) {
            .appointments-table { min-width: 100%; }
            .appointments-table thead th { font-size: 0.9rem; }
            .appointments-table tbody td { font-size: 0.9rem; }
        }
        /* Landscape phones */
        @media (max-width: 767.98px) {
            .appointments-table { min-width: 100%; }
            .appointments-table thead th { font-size: 0.85rem; padding: 4px 6px !important; }
            .appointments-table tbody td { font-size: 0.85rem; padding: 4px 6px !important; }
        }
        /* Portrait phones */
        @media (max-width: 575.98px) {
            .appointments-table { min-width: 100%; }
            .appointments-table thead th { font-size: 0.8rem; padding: 3px 5px !important; }
            .appointments-table tbody td { font-size: 0.8rem; padding: 3px 5px !important; }
        }
      `}</style>

                {/* Refresh notification */}
                {showRefreshNotification && (
                    <div className="alert alert-success alert-dismissible fade show" role="alert" style={{ marginBottom: '1rem' }}>
                        <i className="fas fa-check-circle me-2"></i>
                        <strong>Appointments refreshed!</strong> Treatment submitted successfully.
                        <button type="button" className="btn-close" onClick={() => setShowRefreshNotification(false)}></button>
                    </div>
                )}

                {/* Header with Doctor-specific title */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2>Appointments</h2>
                    <div className="d-flex align-items-center" style={{ fontSize: '0.85rem', color: '#455A64', gap: '8px', whiteSpace: 'nowrap' }}>
                        <span className="me-1"><span className="rounded-circle d-inline-block bg-primary" style={{ width: 10, height: 10 }}></span> {statusCounts['WAITING'] || 0} </span>
                        |
                        <span className="mx-1"><span className="rounded-circle d-inline-block bg-success" style={{ width: 10, height: 10 }}></span> {statusCounts['WITH DOCTOR'] || 0} </span>
                        |
                        <span className="mx-1"><span className="rounded-circle d-inline-block bg-info" style={{ width: 10, height: 10 }}></span> {statusCounts['CONSULT ON CALL'] || 0} </span>
                        |
                        <span className="mx-1"><span className="rounded-circle d-inline-block bg-warning" style={{ width: 10, height: 10 }}></span> {statusCounts['CHECK OUT'] || 0} </span>
                        |
                        <span className="mx-1"><span className="rounded-circle d-inline-block bg-dark" style={{ width: 10, height: 10 }}></span> {statusCounts['COMPLETE'] || 0} </span>
                        |
                        <span className="ms-1"><span className="rounded-circle d-inline-block bg-danger" style={{ width: 10, height: 10 }}></span> {statusCounts['SAVE'] || 0} </span>
                    </div>
                </div>

                {/* Doctor-specific controls - No booking, only viewing and status updates */}
                <div className="d-flex mb-3 align-items-center" style={{ gap: '8px', overflow: 'visible' }}>
                    {/* Search for patients - Read only for doctors */}
                    <div className="position-relative" ref={searchRef}>
                        <input
                            type="text"
                            placeholder="Search by Patient ID/Name/ContactNumber"
                            className="form-control"
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            ref={searchInputRef}
                            autoFocus={isDoctor}
                            onBlur={() => {
                                // Keep search ready for continuous typing in doctor screen
                                if (isDoctor) {
                                    setTimeout(() => searchInputRef.current?.focus(), 0);
                                }
                            }}
                            style={{ borderWidth: "2px", height: "38px", fontFamily: "'Roboto', sans-serif", fontWeight: 500, minWidth: "300px", width: "400px" }}
                        />

                        {/* Search Dropdown for Doctor Screen */}
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
                                onMouseDown={(e) => {
                                    // Keep input focused when clicking items in the dropdown
                                    e.preventDefault();
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
                                        // Math.floor((new Date().getTime() - new Date(patient.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0;

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

                    {/* Search Button for Doctor Screen */}
                    <button
                        className="btn"
                        onClick={handleSearchButtonClick}
                        style={{
                            backgroundColor: "rgb(0, 123, 255)",
                            color: "white",
                            borderColor: "#28a745",
                            height: "38px",
                            padding: "6px 16px",
                            fontSize: "0.9rem",
                            borderRadius: "6px",
                            fontFamily: "'Roboto', sans-serif",
                            fontWeight: 500
                        }}
                        title="Check if selected patient has appointment today"
                    >
                        <i className="fas fa-search me-1"></i>
                        Search
                    </button>

                    {/* Status filter
                    <select
                        className="form-select"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ height: '38px', width: '160px', color: filterStatus ? '#212121' : '#6c757d', padding: '6px 12px', lineHeight: '1.5', fontSize: '1rem' }}
                    >
                        <option value="">Select Status</option>
                        {(availableStatuses.length ? availableStatuses : [
                            'WAITING','WITH DOCTOR','WITH DOCTOR (ON PHONE)','CHECK OUT','SAVE','COMPLETE'
                        ]).map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select> */}

                    {/* List/Card toggle */}
                    <div
                        className="d-flex align-items-center ms-auto"
                        style={{
                            height: "38px",
                            backgroundColor: "#f8f9fa",
                            // border: "1px solid #dee2e6",
                            fontFamily: "'Roboto', sans-serif",
                            borderRadius: "6px",
                            overflow: "hidden",
                            gap: "8px"
                        }}
                    >
                        <button
                            className="btn d-flex align-items-center justify-content-center"
                            style={{
                                height: "100%",
                                backgroundColor: activeView === 'list' ? "#007bff" : "rgba(0, 0, 0, 0.35)",
                                border: "none",
                                color: "#ffffff",
                                fontFamily: "'Roboto', sans-serif",
                                cursor: "pointer",
                                padding: "0 12px",
                                minWidth: "40px",
                                transition: "all 0.2s ease"
                            }}
                            onClick={handleListClick}
                            title="List View"
                        >
                            <List style={{ color: '#ffffff' }} />
                        </button>
                        {/* <div style={{ width: '1px', height: '100%', backgroundColor: '#dee2e6' }} /> */}
                        <button
                            className="btn d-flex align-items-center justify-content-center"
                            style={{
                                height: "100%",
                                backgroundColor: activeView === 'card' ? "#007bff" : "rgba(0, 0, 0, 0.35)",
                                border: "none",
                                color: "#ffffff",
                                fontFamily: "'Roboto', sans-serif",
                                cursor: "pointer",
                                padding: "0 12px",
                                minWidth: "40px",
                                transition: "all 0.2s ease"
                            }}
                            onClick={handleCardClick}
                            title="Card View"
                        >
                            <CreditCard style={{ color: '#ffffff' }} />
                        </button>
                    </div>
                </div>

                {/* Content Area - Same as receptionist but without booking functionality */}
                {filteredAppointments.length === 0 ? (
                    isDoctorLoading ? (
                        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-5">
                            <div className="mb-3">
                                <i className="fas fa-calendar-check" style={{ fontSize: "3rem", color: "#6c757d" }}></i>
                            </div>
                            <h5 className="text-muted">No Patients Currently With You</h5>
                            <p className="text-muted">No patients are waiting or have "WITH DOCTOR" or "CONSULT ON CALL" status at the moment.</p>
                        </div>
                    )
                ) : (
                    <>
                        {/* List View - Same as receptionist */}
                        {activeView === 'list' && (
                            <div className="table-responsive position-relative">
                                {/* Loading overlay for appointments refresh (Doctor screen) */}
                                {isDoctorLoading && (
                                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" 
                                         style={{ 
                                             backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                                             zIndex: 10,
                                             minHeight: '200px'
                                         }}>
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Refreshing...</span>
                                        </div>
                                    </div>
                                )}
                                <table className="table table-borderless align-middle appointments-table">
                                    <thead>
                                        <tr>
                                            <th className="sr-col">Sr.</th>
                                            <th className="name-col">Patient Name</th>
                                            <th className="gender-col text-start">Gender</th>
                                            <th className="age-col text-start">Age</th>
                                            <th className="contact-col text-start">Contact</th>
                                            <th className="time-col text-start">Time</th>
                                            <th className="online-col text-start">Online</th>
                                            <th className="status-col text-start">Status</th>
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
                                                    <td className="gender-col">{a.gender}</td>
                                                    <td className="age-col">{a.age}</td>
                                                    <td className="contact-col">{(a.contact || '').toString().slice(0, 12)}</td>
                                                    <td className="time-col">{extractTime(a.time)}</td>
                                                    <td className="online-cell">
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            value={a.online}
                                                            onChange={(e) => { /* disabled on doctor screen */ }}
                                                            placeholder="HH:mm"
                                                            disabled
                                                            title="Online time is disabled on this screen"
                                                            style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 500, height: "28px", padding: "2px 6px", cursor: 'not-allowed', backgroundColor: '#f5f5f5' }}
                                                        />
                                                    </td>
                                                    <td style={{ position: "relative" }} title={(a as any).statusPending || a.status}>
                                                        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                                            <span className={`d-inline-block rounded-circle ${(a as any).statusColorPending || a.statusColor}`} style={{ width: "14px", height: "14px" }}></span>
                                                            <span style={{ fontSize: '0.9rem', color: '#263238' }}>{(a as any).statusPending || a.status}</span>
                                                            <div
                                                                aria-label="Change Status (Disabled)"
                                                                title="Status changes are disabled on this screen"
                                                                style={{
                                                                    display: "inline-flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    width: "28px",
                                                                    height: "28px",
                                                                    cursor: "not-allowed",
                                                                    color: "#B0BEC5",
                                                                    backgroundColor: "transparent",
                                                                    borderRadius: "4px",
                                                                    opacity: 0.6
                                                                }}
                                                            >
                                                                <MoreVert fontSize="small" />
                                                            </div>
                                                        </div>

                                                    </td>
                                                    <td className="last-col">
                                                        <a
                                                            href="#"
                                                            title={`View visit history`}
                                                            style={{ textDecoration: "underline", color: "#1E88E5", cursor: "pointer" }}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleLastVisitClick(a.patientId, a.patient, a);
                                                            }}
                                                        >

                                                            {loadingVisits[a.patientId] ? (
                                                                <span className="text-muted">
                                                                    <i className="fas fa-spinner fa-spin me-1"></i>
                                                                    Loading...
                                                                </span>
                                                            ) : (
                                                                formatLastVisitDisplay(a.patientId, a.reports_received, a.visitNumber === 1)
                                                            )}
                                                        </a>
                                                    </td>
                                                    <td className="action-col" style={{ whiteSpace: "nowrap" }}>
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            justifyContent: 'flex-start'
                                                        }}>
                                                            {/* Lab Details Button - Disabled for Doctor */}
                                                            <div
                                                                title="Lab Details (Disabled)"
                                                                style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    width: '28px',
                                                                    height: '28px',
                                                                    cursor: 'not-allowed',
                                                                    color: '#9e9e9e',
                                                                    backgroundColor: '#f5f5f5',
                                                                    borderRadius: '4px',
                                                                    border: '1px solid #ddd',
                                                                    opacity: 0.5
                                                                }}
                                                            >
                                                                <img src="/images/avatar/test-tubes_3523917.png" alt="Lab Test" style={{ width: 16, height: 16 }} />
                                                            </div>

                                                            {/* Save Button - Disabled for Doctor */}
                                                            <div
                                                                title="Save (Disabled)"
                                                                style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    width: '28px',
                                                                    height: '28px',
                                                                    cursor: 'not-allowed',
                                                                    color: '#9e9e9e',
                                                                    backgroundColor: '#f5f5f5',
                                                                    borderRadius: '4px',
                                                                    border: '1px solid #ddd',
                                                                    opacity: 0.5
                                                                }}
                                                            >
                                                                <Save fontSize="small" />
                                                            </div>

                                                            {/* Delete Button - Disabled for Doctor */}
                                                            <div
                                                                title="Delete (Disabled)"
                                                                style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    width: '28px',
                                                                    height: '28px',
                                                                    cursor: 'not-allowed',
                                                                    color: '#9e9e9e',
                                                                    backgroundColor: '#f5f5f5',
                                                                    borderRadius: '4px',
                                                                    border: '1px solid #ddd',
                                                                    opacity: 0.5
                                                                }}
                                                            >
                                                                <Delete fontSize="small" />
                                                            </div>

                                                            {/* Checkout Button - Disabled for Doctor */}
                                                            <div
                                                                title="Checkout (Disabled)"
                                                                style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    width: '28px',
                                                                    height: '28px',
                                                                    cursor: 'not-allowed',
                                                                    color: '#9e9e9e',
                                                                    backgroundColor: '#f5f5f5',
                                                                    borderRadius: '4px',
                                                                    border: '1px solid #ddd',
                                                                    opacity: 0.5
                                                                }}
                                                            >
                                                                <img src="/images/avatar/Visit_details.svg" alt="Checkout" style={{ width: 16, height: 16 }} />
                                                            </div>

                                                            {/* Treatment Button - Enabled for WITH DOCTOR, CONSULT ON CALL, or SAVE */}
                                                            <div
                                                                title={(() => {
                                                                    const normalizedStatus = normalizeStatusLabel(a.status);
                                                                    const isEnabled = normalizedStatus === 'WITH DOCTOR' || normalizedStatus === 'CONSULT ON CALL' || normalizedStatus === 'SAVE';
                                                                    return isEnabled ? "Treatment" : "Treatment (Disabled - Patient not with doctor)";
                                                                })()}
                                                                onClick={() => {
                                                                    const normalizedStatus = normalizeStatusLabel(a.status);
                                                                    const isEnabled = normalizedStatus === 'WITH DOCTOR' || normalizedStatus === 'CONSULT ON CALL' || normalizedStatus === 'SAVE';
                                                                    if (isEnabled) {
                                                                        // Navigate to treatment or open modal
                                                                        console.log('Treatment clicked for patient:', a.patientId);
                                                                        console.log('Treatment clicked for patient:', a.patientId);
                                                                    navigate('/treatment', {
                                                                        state: {
                                                                            patientId: a.patientId,
                                                                            patientName: a.patient,
                                                                            visitNumber: a.visitNumber,
                                                                            doctorId: a.doctorId,
                                                                            clinicId: clinicId,
                                                                            shiftId: Number(a.shiftId || 1),
                                                                            visitDate: String(a.visitDate || ''),
                                                                            appointmentId: a.appointmentId,
                                                                            age: a.age,
                                                                            gender: a.gender,
                                                                            contact: a.contact
                                                                        }
                                                                    });
                                                                    }
                                                                }}
                                                                style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    width: '28px',
                                                                    height: '28px',
                                                                    cursor: (() => {
                                                                        const normalizedStatus = normalizeStatusLabel(a.status);
                                                                        const isEnabled = normalizedStatus === 'WITH DOCTOR' || normalizedStatus === 'CONSULT ON CALL' || normalizedStatus === 'SAVE';
                                                                        return isEnabled ? 'pointer' : 'not-allowed';
                                                                    })(),
                                                                    color: (() => {
                                                                        const normalizedStatus = normalizeStatusLabel(a.status);
                                                                        const isEnabled = normalizedStatus === 'WITH DOCTOR' || normalizedStatus === 'CONSULT ON CALL' || normalizedStatus === 'SAVE';
                                                                        return isEnabled ? '#607D8B' : '#BDBDBD';
                                                                    })(),
                                                                    backgroundColor: 'transparent',
                                                                    borderRadius: '4px',
                                                                    border: (() => {
                                                                        const normalizedStatus = normalizeStatusLabel(a.status);
                                                                        const isEnabled = normalizedStatus === 'WITH DOCTOR' || normalizedStatus === 'CONSULT ON CALL' || normalizedStatus === 'SAVE';
                                                                        return isEnabled ? '1px solid #ddd' : '1px solid #E0E0E0';
                                                                    })(),
                                                                    opacity: (() => {
                                                                        const normalizedStatus = normalizeStatusLabel(a.status);
                                                                        const isEnabled = normalizedStatus === 'WITH DOCTOR' || normalizedStatus === 'CONSULT ON CALL' || normalizedStatus === 'SAVE';
                                                                        return isEnabled ? 1 : 0.5;
                                                                    })()
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    const normalizedStatus = normalizeStatusLabel(a.status);
                                                                    const isEnabled = normalizedStatus === 'WITH DOCTOR' || normalizedStatus === 'CONSULT ON CALL' || normalizedStatus === 'SAVE';
                                                                    if (isEnabled) {
                                                                        e.currentTarget.style.backgroundColor = '#FFF3E0';
                                                                        e.currentTarget.style.borderColor = '#FF9800';
                                                                    }
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    const normalizedStatus = normalizeStatusLabel(a.status);
                                                                    const isEnabled = normalizedStatus === 'WITH DOCTOR' || normalizedStatus === 'CONSULT ON CALL' || normalizedStatus === 'SAVE';
                                                                    if (isEnabled) {
                                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                                        e.currentTarget.style.borderColor = '#ddd';
                                                                    }
                                                                }}
                                                            >
                                                                <img 
                                                                    src="/images/avatar/Treatment.svg" 
                                                                    alt="Treatment" 
                                                                    style={{ 
                                                                        width: 16, 
                                                                        height: 16,
                                                                        filter: (() => {
                                                                            const normalizedStatus = normalizeStatusLabel(a.status);
                                                                            const isEnabled = normalizedStatus === 'WITH DOCTOR' || normalizedStatus === 'CONSULT ON CALL' || normalizedStatus === 'SAVE';
                                                                            return isEnabled ? 'none' : 'grayscale(100%)';
                                                                        })()
                                                                    }} 
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Card View - Same as receptionist */}
                        {activeView === 'card' && (
                            <div className="card-grid position-relative">
                                {/* Loading overlay for appointments refresh (Doctor screen) */}
                                {isDoctorLoading && (
                                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" 
                                         style={{ 
                                             backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                                             zIndex: 10,
                                             minHeight: '200px'
                                         }}>
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Refreshing...</span>
                                        </div>
                                    </div>
                                )}
                                {currentAppointments.map((appointment, index) => {
                                    const originalIndex = startIndex + index;
                                    return (
                                        <div key={index}>
                                            <div className="appointment-card">
                                                <div className="card-header">
                                                    <div className="d-flex align-items-center" style={{ gap: '8px' }}>
                                                        <span className={`d-inline-block rounded-circle ${(appointment as any).statusColorPending || appointment.statusColor}`} style={{ width: '10px', height: '10px' }}></span>
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
                                                            cursor: 'not-allowed',
                                                            color: '#B0BEC5',
                                                            backgroundColor: 'transparent',
                                                            borderRadius: '4px'
                                                        }}
                                                    >
                                                        <MoreVert fontSize="small" />
                                                    </div>
                                                </div>
                                                {/* Status menu disabled on this screen */}
                                                <div className="card-details">
                                                    <div className="kv"><span className="k">Contact:</span><span className="v">{appointment.contact}</span></div>
                                                    <div className="kv"><span className="k">Age:</span><span className="v">{appointment.age}</span></div>
                                                    <div className="kv">
                                                        <span className="k">Last Visit:</span>
                                                        <span className="v">
                                                            <a
                                                                href="#"
                                                                title={`View visit history`}
                                                                style={{ textDecoration: 'underline', color: '#1E88E5', cursor: 'pointer' }}
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    handleLastVisitClick(appointment.patientId, appointment.patient, appointment);
                                                                }}
                                                            >
                                                                {loadingVisits[appointment.patientId] ? (
                                                                    <span className="text-muted">
                                                                        <i className="fas fa-spinner fa-spin me-1"></i>
                                                                        Loading...
                                                                    </span>
                                                                ) : (
                                                                    formatLastVisitDisplay(appointment.patientId, appointment.reports_received, appointment.visitNumber === 1)
                                                                )}
                                                            </a>
                                                        </span>
                                                    </div>
                                                    <div className="kv"><span className="k">Gender:</span><span className="v">{appointment.gender}</span></div>
                                                    <div className="kv"><span className="k">Time:</span><span className="v">{extractTime(appointment.time)}</span></div>
                                                </div>
                                                <div className="d-flex align-items-center" style={{ gap: '8px' }}>
                                                    <div className="crm-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, max-content)', alignItems: 'center', gap: '8px' }}>
                                                        <div
                                                            className="crm-btn"
                                                            title="Lab Details (Disabled)"
                                                            style={{
                                                                opacity: 0.7,
                                                                cursor: 'not-allowed',
                                                                backgroundColor: '#f5f5f5',
                                                                color: '#000000'
                                                            }}
                                                        >
                                                            <img src="/images/avatar/test-tubes_3523917.png" alt="Lab Test" style={{ width: 16, height: 16, filter: 'brightness(0)' }} />
                                                        </div>
                                                        <div
                                                            className="crm-btn"
                                                            title="Save (Disabled)"
                                                            style={{
                                                                opacity: 0.5,
                                                                cursor: 'not-allowed',
                                                                backgroundColor: '#f5f5f5',
                                                                color: '#9e9e9e'
                                                            }}
                                                        >
                                                            <Save fontSize="small" sx={{ color: '#000000' }} />
                                                        </div>
                                                        <div
                                                            className="crm-btn"
                                                            title="Delete (Disabled)"
                                                            style={{
                                                                opacity: 0.5,
                                                                cursor: 'not-allowed',
                                                                backgroundColor: '#f5f5f5',
                                                                color: '#9e9e9e'
                                                            }}
                                                        >
                                                            <Delete fontSize="small" sx={{ color: '#000000' }} />
                                                        </div>
                                                        <div
                                                            className="crm-btn"
                                                            title="Checkout (Disabled)"
                                                            style={{
                                                                cursor: 'not-allowed',
                                                                backgroundColor: '#f5f5f5',
                                                                color: '#9e9e9e',
                                                                border: '1px solid #CFD8DC',
                                                                opacity: 0.5
                                                            }}
                                                        >
                                                            <img src="/images/avatar/Visit_details.svg" alt="Checkout" style={{ width: 16, height: 16, filter: 'brightness(0)' }} />
                                                        </div>
                                                    </div>
                                                    <div className="kv">
                                                        <span className="k">Online:</span>
                                                        <span className="v">
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                placeholder="HH:mm"
                                                                value={appointment.online}
                                                                onChange={(e) => { /* disabled on doctor screen */ }}
                                                                disabled
                                                                title="Online time is disabled on this screen"
                                                                style={{ width: '80px', height: '28px', padding: '2px 6px', display: 'inline-block', cursor: 'not-allowed', backgroundColor: '#f5f5f5' }}
                                                            />
                                                        </span>
                                                    </div>
                                                    <div
                                                        className="crm-btn ms-auto"
                                                        title={(() => {
                                                            const normalizedStatus = normalizeStatusLabel(appointment.status);
                                                            const isEnabled = normalizedStatus === 'WITH DOCTOR' || normalizedStatus === 'CONSULT ON CALL';
                                                            return isEnabled ? "Treatment" : "Treatment (Disabled - Patient not with doctor)";
                                                        })()}
                                                        onClick={() => {
                                                            const normalizedStatus = normalizeStatusLabel(appointment.status);
                                                            const isEnabled = normalizedStatus === 'WITH DOCTOR' || normalizedStatus === 'CONSULT ON CALL';
                                                            if (isEnabled) {
                                                                // Treatment button functionality - can be implemented as needed
                                                                console.log('Treatment clicked for patient:', appointment.patientId);
                                                            }
                                                        }}
                                                        style={{
                                                            cursor: (() => {
                                                                const normalizedStatus = normalizeStatusLabel(appointment.status);
                                                                const isEnabled = normalizedStatus === 'WITH DOCTOR' || normalizedStatus === 'CONSULT ON CALL';
                                                                return isEnabled ? 'pointer' : 'not-allowed';
                                                            })(),
                                                            backgroundColor: (() => {
                                                                const normalizedStatus = normalizeStatusLabel(appointment.status);
                                                                const isEnabled = normalizedStatus === 'WITH DOCTOR' || normalizedStatus === 'CONSULT ON CALL';
                                                                return isEnabled ? '#ECEFF1' : '#F5F5F5';
                                                            })(),
                                                            color: (() => {
                                                                const normalizedStatus = normalizeStatusLabel(appointment.status);
                                                                const isEnabled = normalizedStatus === 'WITH DOCTOR' || normalizedStatus === 'CONSULT ON CALL';
                                                                return isEnabled ? '#607D8B' : '#BDBDBD';
                                                            })(),
                                                            border: (() => {
                                                                const normalizedStatus = normalizeStatusLabel(appointment.status);
                                                                const isEnabled = normalizedStatus === 'WITH DOCTOR' || normalizedStatus === 'CONSULT ON CALL';
                                                                return isEnabled ? '1px solid #CFD8DC' : '1px solid #E0E0E0';
                                                            })(),
                                                            opacity: (() => {
                                                                const normalizedStatus = normalizeStatusLabel(appointment.status);
                                                                const isEnabled = normalizedStatus === 'WITH DOCTOR' || normalizedStatus === 'CONSULT ON CALL';
                                                                return isEnabled ? 1 : 0.5;
                                                            })()
                                                        }}
                                                    >
                                                        <img 
                                                            src="/images/avatar/Treatment.svg" 
                                                            alt="Treatment" 
                                                            style={{ 
                                                                width: 16, 
                                                                height: 16, 
                                                                filter: (() => {
                                                                    const normalizedStatus = normalizeStatusLabel(appointment.status);
                                                                    const isEnabled = normalizedStatus === 'WITH DOCTOR' || normalizedStatus === 'CONSULT ON CALL';
                                                                    return isEnabled ? 'brightness(0)' : 'grayscale(100%) brightness(0.5)';
                                                                })()
                                                            }} 
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Pagination - Same as receptionist */}
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
                    </>
                )}

                {/* Patient Visit Details Popup (Doctor screen) */}
                {showVisitDetails && selectedPatientForVisit && (
                    <PatientVisitDetails
                        open={true}
                        onClose={() => {
                            setShowVisitDetails(false);
                            setSelectedPatientForVisit(null);
                        }}
                        patientData={selectedPatientForVisit as any}
                        onVisitDetailsSubmitted={handleVisitDetailsSubmitted}
                    />
                )}

                {/* Patient Form Dialog (Doctor screen) */}
                {showPatientFormDialog && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            zIndex: 9999,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px'
                        }}
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                setShowPatientFormDialog(false);
                            }
                        }}
                    >
                        <div
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                width: '1100vw',
                                maxWidth: '1500px',
                                maxHeight: '85vh',
                                overflow: 'auto',
                                position: 'relative'
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                        >
                            <PatientFormTest
                                onClose={() => setShowPatientFormDialog(false)}
                                initialData={formPatientData || undefined}
                                visitDates={visitDates}
                                currentVisitIndex={currentVisitIndex}
                                onVisitDateChange={handleVisitDateChange}
                            />
                        </div>
                    </div>
                )}

                {/* Snackbar for search results */}
                {showSnackbar && (
                    <div
                        style={{
                            position: 'fixed',
                            bottom: '20px',
                            right: '20px',
                            backgroundColor: snackbarMessage.includes("doesn't have") || snackbarMessage.includes("Failed to book") || snackbarMessage.includes("Please select") || snackbarMessage.includes("existing appointment") || snackbarMessage.includes("Unable to determine") || snackbarMessage.includes("Missing identifiers") || snackbarMessage.includes("Update failed") || snackbarMessage.includes("Failed to update") || snackbarMessage.includes("Failed to delete") || snackbarMessage.includes("but failed to refresh") ? '#dc3545' : '#28a745',
                            color: 'white',
                            padding: '12px 20px',
                            borderRadius: '6px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            zIndex: 9999,
                            fontFamily: "'Roboto', sans-serif",
                            fontWeight: 500,
                            fontSize: '0.9rem',
                            maxWidth: '400px',
                            animation: 'slideInUp 0.3s ease-out'
                        }}
                    >
                        <div className="d-flex align-items-center">
                            <i className={`fas ${snackbarMessage.includes("doesn't have") || snackbarMessage.includes("Failed to book") || snackbarMessage.includes("Please select") || snackbarMessage.includes("existing appointment") || snackbarMessage.includes("Unable to determine") || snackbarMessage.includes("Missing identifiers") || snackbarMessage.includes("Update failed") || snackbarMessage.includes("Failed to update") || snackbarMessage.includes("Failed to delete") || snackbarMessage.includes("but failed to refresh") ? 'fa-exclamation-triangle' : 'fa-check-circle'} me-2`}></i>
                            <span>{snackbarMessage}</span>
                            <button
                                onClick={() => setShowSnackbar(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '1.2rem',
                                    marginLeft: '10px',
                                    cursor: 'pointer',
                                    opacity: 0.8
                                }}
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Conditional rendering based on user role
    if (isDoctor) {
        return <DoctorScreen />;
    }

    // Show loading spinner while initial data is loading
    if (!isInitialLoadComplete) {
        return (
            <div className="container-fluid mt-3 d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    // Default receptionist screen
    return (
        <div className="container-fluid mt-3" style={{ fontFamily: "'Roboto', sans-serif" }}>
            <style>{`
        /* Fixed table layout to respect column widths */
        .table.appointments-table { table-layout: fixed !important; width: 100%;}
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
        /* Fixed column widths: 10% for Sr, Age, Online, Action; 20% for Patient Name, Contact, Provider, Status, Last Visit */
        .appointments-table th.sr-col, .appointments-table td.sr-col { width: 2%; }
        .appointments-table th.name-col, .appointments-table td.name-col { width: 10%; }
        .appointments-table th.gender-col, .appointments-table td.gender-col { width: 6%; }
        .appointments-table th.age-col, .appointments-table td.age-col { width: 3%; }
        .appointments-table th.contact-col, .appointments-table td.contact-col { width: 8%; }
        .appointments-table th.time-col, .appointments-table td.time-col { width:3%; }
        .appointments-table th.provider-col, .appointments-table td.provider-col { width: 15%; }
        .appointments-table th.online-col, .appointments-table td.online-cell { width: 6%; }
        .appointments-table td.online-cell .form-control { width: 70px !important; min-width: 40px !important; }
        .appointments-table th.status-col, .appointments-table td.status-col { width: 14%; }
        .appointments-table th.last-col, .appointments-table td.last-col { width: 15%; }
        .appointments-table th.action-col, .appointments-table td.action-col { width: 10%; }
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
        .card-details { display: grid; grid-template-columns: 3fr 1fr; gap: 6px 12px; margin-bottom: 10px; }
        .kv { display: flex; gap: 6px; align-items: center; min-width: 0; }
        .kv .k { color: #607D8B; font-size: 0.76rem; }
        .kv .v { color: #111827; font-size: 0.8rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .crm-actions { display: grid; grid-template-columns: repeat(4, 32px); gap: 8px; }
        .crm-btn { width: 36px; height: 36px; border-radius: 6px; background: 'transparent'; display: inline-flex; align-items: center; justify-content: center; color: black; border: 1px solid #CFD8DC; cursor: pointer; }
        .crm-btn:hover { background:'transparent'; color:black; border-color: 'transparent'; }
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
            // background: #f5f5f5;
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
            background: #1E88E5;
            color: #fff;
            border-color: #000;
        }
        .nav-btn:hover:not(:disabled) {
            // background: #111;
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
        /* Ensure table is always visible with horizontal scroll on smaller screens */
        .container-fluid { overflow-x: auto; }
        
        /* Desktops */
        @media (max-width: 1199.98px) {
            .appointments-table { min-width: 100%; }
            .appointments-table thead th { padding: 6px 8px !important; }
            .appointments-table tbody td { padding: 6px 8px !important; }
        }
        /* Tablets */
        @media (max-width: 991.98px) {
            .appointments-table { min-width: 100%; }
            .appointments-table thead th { font-size: 0.9rem; }
            .appointments-table tbody td { font-size: 0.9rem; }
        }
        /* Landscape phones */
        @media (max-width: 767.98px) {
            .appointments-table { min-width: 100%; }
            .appointments-table thead th { font-size: 0.85rem; padding: 4px 6px !important; }
            .appointments-table tbody td { font-size: 0.85rem; padding: 4px 6px !important; }
        }
        /* Portrait phones */
        @media (max-width: 575.98px) {
            .appointments-table { min-width: 100%; }
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
                    <span className="mx-1"><span className="rounded-circle d-inline-block bg-info" style={{ width: 10, height: 10 }}></span> {statusCounts['CONSULT ON CALL'] || 0} </span>
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
            <div className="d-flex mb-3 align-items-center" style={{ gap: '8px', overflow: 'visible' }}>
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
                                    // Math.floor((new Date().getTime() - new Date(patient.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0;

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
                                {formatProviderLabel(doctor.name)}
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
                {/* Status filter dropdown (filters list/card by selected status) */}
                <select
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{ height: '38px', width: '160px', color: filterStatus ? '#212121' : '#6c757d', padding: '6px 12px', lineHeight: '1.5', fontSize: '1rem' }}
                >
                    <option value="">Select Status</option>
                    {(() => {
                        const filteredStatuses = (availableStatuses.length ? availableStatuses : [
                            'WAITING', 'WITH DOCTOR', 'CONSULT ON CALL', 'CHECK OUT', 'SAVE', 'COMPLETE'
                        ]).filter(status => {
                            const statusId = mapStatusLabelToId(status);
                            return statusId === 1 || statusId === 2 || statusId === 3; // show key workflow statuses
                        });
                        return filteredStatuses.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ));
                    })()}
                </select>

                {/* 6) List/Card toggle */}
                <div
                    className="d-flex align-items-center ms-auto"
                    style={{
                        height: "38px",
                        backgroundColor: "#f8f9fa",
                        // border: "1px solid #dee2e6",
                        fontFamily: "'Roboto', sans-serif",
                        borderRadius: "6px",
                        overflow: "hidden",
                        gap: "8px"
                    }}
                >
                    <button
                        className="btn d-flex align-items-center justify-content-center"
                        style={{
                            height: "100%",
                            backgroundColor: activeView === 'list' ? "#007bff" : "rgba(0, 0, 0, 0.35)",
                            border: "none",
                            color: "#ffffff",
                            fontFamily: "'Roboto', sans-serif",
                            cursor: "pointer",
                            padding: "0 12px",
                            minWidth: "40px",
                            transition: "all 0.2s ease"
                        }}
                        onClick={handleListClick}
                        title="List View"
                    >
                        <List style={{ color: '#ffffff' }} />
                    </button>
                    {/* <div style={{ width: '1px', height: '100%', backgroundColor: '#dee2e6' }} /> */}
                    <button
                        className="btn d-flex align-items-center justify-content-center"
                        style={{
                            height: "100%",
                            backgroundColor: activeView === 'card' ? "#007bff" : "rgba(0, 0, 0, 0.35)",
                            border: "none",
                            color: "#ffffff",
                            fontFamily: "'Roboto', sans-serif",
                            cursor: "pointer",
                            padding: "0 12px",
                            minWidth: "40px",
                            transition: "all 0.2s ease"
                        }}
                        onClick={handleCardClick}
                        title="Card View"
                    >
                        <CreditCard style={{ color: '#ffffff' }} />
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
                                {patient.first_name} {patient.middle_name ? `${patient.middle_name} ` : ''}{patient.last_name} (ID: {patient.id})
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
                        <div className="table-responsive position-relative">
                            {/* Loading overlay for appointments refresh */}
                            {loadingAppointments && (
                                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" 
                                     style={{ 
                                         backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                                         zIndex: 10,
                                         minHeight: '200px'
                                     }}>
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Refreshing...</span>
                                    </div>
                                </div>
                            )}
                            <table className="table table-borderless align-middle appointments-table">
                                <thead>
                                    <tr>
                                        <th className="sr-col">Sr.</th>
                                        <th className="name-col">Patient Name</th>
                                        <th className="gender-col text-start">Gender</th>
                                        <th className="age-col text-start">Age</th>
                                        <th className="contact-col text-start">Contact</th>
                                        <th className="time-col text-start">Time</th>
                                        <th className="provider-col text-start">Provider</th>
                                        <th className="online-col text-start">Online</th>
                                        <th className="status-col text-start">Status</th>
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
                                                <td className="gender-col">{a.gender}</td>
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
                                                <td style={{ position: "relative" }} title={(a as any).statusPending || a.status}>
                                                    <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                                        <span className={`d-inline-block rounded-circle ${(a as any).statusColorPending || a.statusColor}`} style={{ width: "14px", height: "14px" }}></span>
                                                        <span style={{ fontSize: '0.9rem', color: '#263238' }}>{(a as any).statusPending || a.status}</span>
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
                                                                            const candidates = ['status_description', 'statusDescription', 'description', 'name', 'label', 'status'];
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
                                                                        // Filter to only show status IDs 1, 2, 3 for reception login
                                                                        const filteredStatuses = ensured.filter(status => {
                                                                            const statusId = mapStatusLabelToId(status);
                                                                            return statusId === 1 || statusId === 2 || statusId === 3;
                                                                        });
                                                                        console.log('🔍 Available Statuses (API Loaded):', {
                                                                            original: ensured,
                                                                            filtered: filteredStatuses,
                                                                            statusIds: filteredStatuses.map(s => ({ status: s, id: mapStatusLabelToId(s) }))
                                                                        });
                                                                        setAvailableStatuses(filteredStatuses);
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
                                                            {(() => {
                                                                const filteredStatuses = availableStatuses.length ? availableStatuses.filter(status => {
                                                                    const statusId = mapStatusLabelToId(status);
                                                                    return statusId === 1 || statusId === 2 || statusId === 3;
                                                                }) : ["WAITING", "WITH DOCTOR", "CONSULT ON CALL"];
                                                                console.log('🔄 List View Status Change Options:', {
                                                                    availableStatuses,
                                                                    filteredStatuses,
                                                                    statusIds: filteredStatuses.map(s => ({ status: s, id: mapStatusLabelToId(s) }))
                                                                });
                                                                return filteredStatuses.map((status) => (
                                                                    <div
                                                                        key={status}
                                                                        onClick={() => {
                                                                            // Store pending status locally; do not change saved status until API success
                                                                            updateAppointmentField(originalIndex, 'statusPending' as any, status);
                                                                            updateAppointmentField(originalIndex, 'statusColorPending' as any, getStatusColor(status));
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
                                                                ));
                                                            })()}
                                                        </div>
                                                    )}
                                                </td>
                                                {/* <td><a href={`/patients/${a.patientId}/visits`} style={{ textDecoration: "underline", color: "#1E88E5" }}>{a.lastOpd}</a></td> */}
                                                <td className="last-col">
                                                    <a
                                                        href="#"
                                                        title={`View visit history`}
                                                        style={{ textDecoration: "underline", color: "#1E88E5", cursor: "pointer" }}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleLastVisitClick(a.patientId, a.patient, a);
                                                        }}
                                                    >
                                                        {loadingVisits[a.patientId] ? (
                                                            <span className="text-muted">
                                                                <i className="fas fa-spinner fa-spin me-1"></i>
                                                                Loading...
                                                            </span>
                                                        ) : (
                                                            formatLastVisitDisplay(a.patientId, a.reports_received, a.visitNumber === 1)
                                                        )}
                                                    </a>
                                                </td>
                                                <td className="action-col" style={{ whiteSpace: "nowrap" }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        justifyContent: 'flex-start'
                                                    }}>
                                                        {/* Lab Details Button */}
                                                        <div
                                                            title={(() => {
                                                                const statusId = mapStatusLabelToId(a.status);
                                                                const isWaiting = statusId === 1;
                                                                const isComplete = statusId === 5;
                                                                const shouldEnable = !isReceptionist || isWaiting || isComplete;
                                                                return shouldEnable ? "Lab Details" : "Lab Details (Disabled for Reception)";
                                                            })()}
                                                            onClick={() => {
                                                                const statusId = mapStatusLabelToId(a.status);
                                                                const isWaiting = statusId === 1;
                                                                const isComplete = statusId === 5;
                                                                const shouldEnable = !isReceptionist || isWaiting || isComplete;
                                                                if (!shouldEnable) return; // Disable for reception login unless WAITING or COMPLETE
                                                                setSelectedPatientForLab(a);
                                                                setShowLabTestEntry(true);
                                                            }}
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                width: '28px',
                                                                height: '28px',
                                                                cursor: (() => {
                                                                    const statusId = mapStatusLabelToId(a.status);
                                                                    const isWaiting = statusId === 1;
                                                                    const isComplete = statusId === 5;
                                                                    const shouldEnable = !isReceptionist || isWaiting || isComplete;
                                                                    return shouldEnable ? 'pointer' : 'not-allowed';
                                                                })(),
                                                                color: '#000000',
                                                                backgroundColor: (() => {
                                                                    const statusId = mapStatusLabelToId(a.status);
                                                                    const isWaiting = statusId === 1;
                                                                    const isComplete = statusId === 5;
                                                                    const shouldEnable = !isReceptionist || isWaiting || isComplete;
                                                                    return shouldEnable ? 'transparent' : '#f5f5f5';
                                                                })(),
                                                                borderRadius: '4px',
                                                                border: '1px solid #ddd',
                                                                opacity: (() => {
                                                                    const statusId = mapStatusLabelToId(a.status);
                                                                    const isWaiting = statusId === 1;
                                                                    const isComplete = statusId === 5;
                                                                    const shouldEnable = !isReceptionist || isWaiting || isComplete;
                                                                    return shouldEnable ? 1 : 0.5;
                                                                })()
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                const statusId = mapStatusLabelToId(a.status);
                                                                const isWaiting = statusId === 1;
                                                                const isComplete = statusId === 5;
                                                                const shouldEnable = !isReceptionist || isWaiting || isComplete;
                                                                if (!shouldEnable) return; // Disable hover effects for reception
                                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                                e.currentTarget.style.borderColor = 'black';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                const statusId = mapStatusLabelToId(a.status);
                                                                const isWaiting = statusId === 1;
                                                                const isComplete = statusId === 5;
                                                                const shouldEnable = !isReceptionist || isWaiting || isComplete;
                                                                if (!shouldEnable) return; // Disable hover effects for reception
                                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                                e.currentTarget.style.borderColor = '#ddd';
                                                            }}
                                                        >
                                                            <img src="/images/avatar/test-tubes_3523917.png" alt="Lab Test" style={{ width: 16, height: 16 }} />
                                                        </div>

                                                        {/* Save Button */}
                                                        <div
                                                            title="Save"
                                                            onClick={async () => {
                                                                try {
                                                                    const pid = a.patientId;
                                                                    // Use the visit number from the selected appointment row
                                                                    const vno = Number(a.visitNumber) || getLatestVisitNumber(a.patientId);
                                                                    const shift = a.shiftId || 1;
                                                                    const clinic = a.clinicId || sessionData?.clinicId || '';
                                                                    const onlineTime = (a.online || '').trim() || undefined;
                                                                    // Get the updated provider from the dropdown
                                                                    const updatedProvider = a.provider || getDoctorLabelById(selectedDoctorId) || '';
                                                                    // Convert provider name back to doctor ID for API
                                                                    const doctor = getDoctorIdFromProviderName(updatedProvider) || selectedDoctorId || a.doctorId || '';
                                                                    // Use pending status if available, otherwise fall back to saved status
                                                                    const currentStatus = (a as any).statusPending || a.status;
                                                                    const statusId = mapStatusLabelToId(currentStatus);

                                                                    // Debug logging
                                                                    console.log('=== UPDATE ONLINE TIME DEBUG ===');
                                                                    console.log('Patient ID:', pid);
                                                                    console.log('Visit Number from row:', a.visitNumber);
                                                                    console.log('Visit Number being sent:', vno);
                                                                    console.log('Shift ID:', shift);
                                                                    console.log('Clinic ID:', clinic);
                                                                    console.log('Online Time:', onlineTime);
                                                                    console.log('Updated Provider:', updatedProvider);
                                                                    console.log('Doctor ID:', doctor);
                                                                    console.log('Current Status:', currentStatus);
                                                                    console.log('Status ID:', statusId);
                                                                    console.log('================================');

                                                                    if (!pid || !clinic || !doctor) {
                                                                        setSnackbarMessage('Missing identifiers to update appointment');
                                                                        setShowSnackbar(true);
                                                                        setTimeout(() => setShowSnackbar(false), 3000);
                                                                        return;
                                                                    }

                                                                    const response = await appointmentService.updateTodaysAppointment({
                                                                        patientId: String(pid),
                                                                        patientVisitNo: Number(vno),
                                                                        shiftId: Number(shift),
                                                                        clinicId: String(clinic),
                                                                        onlineAppointmentTime: onlineTime,
                                                                        doctorId: String(doctor),
                                                                        statusId: Number(statusId),
                                                                        userId: String(sessionData?.userId || 'system')
                                                                    });

                                                                    console.log('Update response:', response);

                                                                        if (response.success) {
                                                                        setSnackbarMessage('Appointment updated successfully');
                                                                        setShowSnackbar(true);
                                                                        setTimeout(() => setShowSnackbar(false), 3000);
                                                                            // Commit pending status to saved fields
                                                                            if ((appointments[originalIndex] as any).statusPending) {
                                                                                const committed = (appointments[originalIndex] as any).statusPending;
                                                                                updateAppointmentField(originalIndex, 'status', committed);
                                                                                updateAppointmentField(originalIndex, 'statusColor', getStatusColor(committed));
                                                                                updateAppointmentField(originalIndex, 'statusPending' as any, undefined);
                                                                                updateAppointmentField(originalIndex, 'statusColorPending' as any, undefined);
                                                                            }
                                                                        // If the appointment was moved to another provider, remove it locally
                                                                        const movedToDifferentDoctor = String(doctor) !== String(selectedDoctorId);
                                                                        if (movedToDifferentDoctor) {
                                                                            setAppointments(prev => prev.filter((_, i) => i !== originalIndex));
                                                                        } else {
                                                                            // Update row's doctorId to keep in sync
                                                                            updateAppointmentField(originalIndex, 'doctorId' as any, String(doctor));
                                                                        }
                                                                        // Refresh current provider's appointments to reflect server truth
                                                                        try {
                                                                            await refreshAppointmentsForSelectedDoctor();
                                                                        } catch (e) {
                                                                            console.warn('Refresh after save failed:', e);
                                                                        }
                                                                    } else {
                                                                        setSnackbarMessage('Update failed: ' + (response.message || 'Unknown error'));
                                                                        setShowSnackbar(true);
                                                                        setTimeout(() => setShowSnackbar(false), 4000);
                                                                    }
                                                                } catch (err) {
                                                                    console.error('Update appointment failed:', err);
                                                                    setSnackbarMessage('Failed to update appointment: ' + (err as any).message);
                                                                    setShowSnackbar(true);
                                                                    setTimeout(() => setShowSnackbar(false), 4000);
                                                                }
                                                            }}
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                width: '28px',
                                                                height: '28px',
                                                                cursor: 'pointer',
                                                                color: '#607D8B',
                                                                backgroundColor: 'transparent',
                                                                borderRadius: '4px',
                                                                border: '1px solid #ddd',
                                                                opacity: 1
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                                e.currentTarget.style.borderColor = 'black';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                                e.currentTarget.style.borderColor = '#ddd';
                                                            }}
                                                        >
                                                            <Save fontSize="small" sx={{ color: '#000000' }} />
                                                        </div>

                                                        {/* Delete Button */}
                                                        <div
                                                            title={(() => {
                                                                const statusId = mapStatusLabelToId(a.status);
                                                                const isWaiting = statusId === 1;
                                                                const isComplete = statusId === 5;
                                                                const shouldEnable = !isReceptionist || isWaiting || isComplete;
                                                                return shouldEnable ? "Delete" : "Delete (Disabled for Reception)";
                                                            })()}
                                                            onClick={async () => {
                                                                const statusId = mapStatusLabelToId(a.status);
                                                                const isWaiting = statusId === 1;
                                                                const isComplete = statusId === 5;
                                                                const shouldEnable = !isReceptionist || isWaiting || isComplete;
                                                                if (!shouldEnable) return; // Disable for reception login unless WAITING or COMPLETE
                                                                try {
                                                                    const pid = a.patientId;
                                                                    const rawVtime = String(a.time || '00:00');
                                                                    // Use today's date with the visit time for deletion
                                                                    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
                                                                    console.log('=== APPOINTMENT DELETION DEBUG (2nd function) ===');
                                                                    console.log('Appointment object:', a);
                                                                    console.log('Raw visit time:', rawVtime);
                                                                    console.log('Using today\'s date:', today);

                                                                    // Combine today's date with visit time for precise deletion
                                                                    const vdatetime = `${today} ${rawVtime}`;
                                                                    console.log('Final visit datetime being sent (today + time):', vdatetime);
                                                                    console.log('=== END DEBUG ===');
                                                                    const did = a.doctorId || selectedDoctorId;
                                                                    if (!pid || !vdatetime || !did) {
                                                                        setSnackbarMessage('Missing identifiers to delete appointment');
                                                                        setShowSnackbar(true);
                                                                        setTimeout(() => setShowSnackbar(false), 3000);
                                                                        return;
                                                                    }
                                                                    const confirmDelete = window.confirm('Delete this appointment?');
                                                                    if (!confirmDelete) return;
                                                                    
                                                                    await appointmentService.deleteAppointment({ 
                                                                        patientId: String(pid), 
                                                                        visitDate: String(vdatetime), 
                                                                        doctorId: String(did), 
                                                                        clinicId: sessionData?.clinicId || '',
                                                                        userId: String(sessionData?.userId || 'system') 
                                                                    });
                                                                    setAppointments(prev => prev.filter((_, i) => i !== originalIndex));
                                                                } catch (err) {
                                                                    console.error('Delete appointment failed:', err);
                                                                    setSnackbarMessage('Failed to delete appointment');
                                                                    setShowSnackbar(true);
                                                                    setTimeout(() => setShowSnackbar(false), 3000);
                                                                }
                                                            }}
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                width: '28px',
                                                                height: '28px',
                                                                cursor: (() => {
                                                                    const statusId = mapStatusLabelToId(a.status);
                                                                    const isWaiting = statusId === 1;
                                                                    const isComplete = statusId === 5;
                                                                    const shouldEnable = !isReceptionist || isWaiting || isComplete;
                                                                    return shouldEnable ? 'pointer' : 'not-allowed';
                                                                })(),
                                                                color: '#607D8B',
                                                                backgroundColor: (() => {
                                                                    const statusId = mapStatusLabelToId(a.status);
                                                                    const isWaiting = statusId === 1;
                                                                    const isComplete = statusId === 5;
                                                                    const shouldEnable = !isReceptionist || isWaiting || isComplete;
                                                                    return shouldEnable ? 'transparent' : '#f5f5f5';
                                                                })(),
                                                                borderRadius: '4px',
                                                                border: '1px solid #ddd',
                                                                opacity: (() => {
                                                                    const statusId = mapStatusLabelToId(a.status);
                                                                    const isWaiting = statusId === 1;
                                                                    const isComplete = statusId === 5;
                                                                    const shouldEnable = !isReceptionist || isWaiting || isComplete;
                                                                    return shouldEnable ? 1 : 0.5;
                                                                })()
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                const statusId = mapStatusLabelToId(a.status);
                                                                const isWaiting = statusId === 1;
                                                                const isComplete = statusId === 5;
                                                                const shouldEnable = !isReceptionist || isWaiting || isComplete;
                                                                if (!shouldEnable) return; // Disable hover effects for reception
                                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                                e.currentTarget.style.borderColor = 'black';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                const statusId = mapStatusLabelToId(a.status);
                                                                const isWaiting = statusId === 1;
                                                                const isComplete = statusId === 5;
                                                                const shouldEnable = !isReceptionist || isWaiting || isComplete;
                                                                if (!shouldEnable) return; // Disable hover effects for reception
                                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                                e.currentTarget.style.borderColor = '#ddd';
                                                            }}
                                                        >
                                                            <Delete fontSize="small" sx={{ color: '#000000' }} />
                                                        </div>

                                                        {/* Checkout Button */}
                                                        <div
                                                            title={(() => {
                                                                const statusId = mapStatusLabelToId(a.status);
                                                                const isWaiting = statusId === 1;
                                                                const isComplete = statusId === 5;
                                                                const shouldEnable = !isReceptionist || isWaiting || isComplete;
                                                                if (!shouldEnable) return "Visit Details (Disabled for Reception)";
                                                                return a.status === 'WITH DOCTOR' ? 'Visit Details (Disabled - Patient with doctor)' : 'Visit Details';
                                                            })()}
                                                            onClick={() => {
                                                                const statusId = mapStatusLabelToId(a.status);
                                                                const isWaiting = statusId === 1;
                                                                const isComplete = statusId === 5;
                                                                const shouldEnable = !isReceptionist || isWaiting || isComplete;
                                                                if (!shouldEnable) return; // Disable for reception login unless WAITING or COMPLETE
                                                                if (a.status === 'WITH DOCTOR') return; // Disable click when status is WITH DOCTOR
                                                                setSelectedPatientForVisit(a as any);
                                                                setShowVisitDetails(true);
                                                            }}
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                width: '28px',
                                                                height: '28px',
                                                                cursor: (() => {
                                                                    const statusId = mapStatusLabelToId(a.status);
                                                                    const isWaiting = statusId === 1;
                                                                    const isComplete = statusId === 5;
                                                                    const shouldEnable = !isReceptionist || isWaiting || isComplete;
                                                                    return (shouldEnable && a.status !== 'WITH DOCTOR') ? 'pointer' : 'not-allowed';
                                                                })(),
                                                                color: '#607D8B',
                                                                backgroundColor: (() => {
                                                                    const statusId = mapStatusLabelToId(a.status);
                                                                    const isWaiting = statusId === 1;
                                                                    const isComplete = statusId === 5;
                                                                    const shouldEnable = !isReceptionist || isWaiting || isComplete;
                                                                    if (!shouldEnable) return '#f5f5f5';
                                                                    return a.status === 'WITH DOCTOR' ? 'rgb(96, 125, 139)' : (a.visitDetailsSubmitted ? '#FFD700' : 'transparent');
                                                                })(),
                                                                borderRadius: '4px',
                                                                border: '1px solid #ddd',
                                                                opacity: (() => {
                                                                    const statusId = mapStatusLabelToId(a.status);
                                                                    const isWaiting = statusId === 1;
                                                                    const isComplete = statusId === 5;
                                                                    const shouldEnable = !isReceptionist || isWaiting || isComplete;
                                                                    return (shouldEnable && a.status !== 'WITH DOCTOR') ? 1 : 0.5;
                                                                })()
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                const statusId = mapStatusLabelToId(a.status);
                                                                const isWaiting = statusId === 1;
                                                                const isComplete = statusId === 5;
                                                                const shouldEnable = !isReceptionist || isWaiting || isComplete;
                                                                if (!shouldEnable || a.status === 'WITH DOCTOR') return; // Disable hover effects when disabled
                                                                // Preserve yellow color if visit has been submitted
                                                                if (a.visitDetailsSubmitted) {
                                                                    e.currentTarget.style.backgroundColor = '#FFD700';
                                                                    e.currentTarget.style.borderColor = '#FFA000'; // Slightly darker yellow border
                                                                } else {
                                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                                    e.currentTarget.style.borderColor = 'black';
                                                                }
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                const statusId = mapStatusLabelToId(a.status);
                                                                const isWaiting = statusId === 1;
                                                                const isComplete = statusId === 5;
                                                                const shouldEnable = !isReceptionist || isWaiting || isComplete;
                                                                if (!shouldEnable || a.status === 'WITH DOCTOR') return; // Disable hover effects when disabled
                                                                e.currentTarget.style.backgroundColor = a.status === 'WITH DOCTOR' ? 'rgb(96, 125, 139)' : (a.visitDetailsSubmitted ? '#FFD700' : 'transparent');
                                                                e.currentTarget.style.borderColor = '#ddd';
                                                            }}
                                                        >
                                                            <img src="/images/avatar/Visit_details.svg" alt="Visit Details" style={{ width: 16, height: 16, filter: a.status === 'WITH DOCTOR' ? 'brightness(0.3)' : 'brightness(0)' }} />
                                                        </div>

                                                        {/* Collection Button */}
                                                        <div
                                                            title={(() => {
                                                                const statusId = mapStatusLabelToId(a.status);
                                                                const isComplete = statusId === 5;
                                                                const shouldEnable = !isReceptionist || isComplete;
                                                                if (!shouldEnable) return "Collection (Disabled for Reception)";
                                                                return mapStatusLabelToId(a.status) !== 5 ? "Collection (Disabled - Status not Complete)" : "Collection";
                                                            })()}
                                                            onClick={() => {
                                                                const statusId = mapStatusLabelToId(a.status);
                                                                const isComplete = statusId === 5;
                                                                const shouldEnable = !isReceptionist || isComplete;
                                                                if (!shouldEnable) return; // Disable for reception login unless COMPLETE
                                                                if (mapStatusLabelToId(a.status) !== 5) return;
                                                                console.log('Collection clicked for patient:', a.patientId);
                                                            }}
                                                            aria-disabled={(() => {
                                                                const statusId = mapStatusLabelToId(a.status);
                                                                const isComplete = statusId === 5;
                                                                const shouldEnable = !isReceptionist || isComplete;
                                                                return !shouldEnable || mapStatusLabelToId(a.status) !== 5;
                                                            })()}
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                width: '28px',
                                                                height: '28px',
                                                                cursor: (() => {
                                                                    const statusId = mapStatusLabelToId(a.status);
                                                                    const isComplete = statusId === 5;
                                                                    const shouldEnable = !isReceptionist || isComplete;
                                                                    return (shouldEnable && mapStatusLabelToId(a.status) === 5) ? 'pointer' : 'not-allowed';
                                                                })(),
                                                                color: '#607D8B',
                                                                backgroundColor: (() => {
                                                                    const statusId = mapStatusLabelToId(a.status);
                                                                    const isComplete = statusId === 5;
                                                                    const shouldEnable = !isReceptionist || isComplete;
                                                                    if (!shouldEnable) return '#f5f5f5';
                                                                    return mapStatusLabelToId(a.status) !== 5 ? '#607D8B' : 'transparent';
                                                                })(),
                                                                borderRadius: '4px',
                                                                border: (() => {
                                                                    const statusId = mapStatusLabelToId(a.status);
                                                                    const isComplete = statusId === 5;
                                                                    const shouldEnable = !isReceptionist || isComplete;
                                                                    if (!shouldEnable) return '1px solid #ddd';
                                                                    return mapStatusLabelToId(a.status) !== 5 ? '1px solid #607D8B' : '1px solid #ddd';
                                                                })(),
                                                                opacity: (() => {
                                                                    const statusId = mapStatusLabelToId(a.status);
                                                                    const isComplete = statusId === 5;
                                                                    const shouldEnable = !isReceptionist || isComplete;
                                                                    return (shouldEnable && mapStatusLabelToId(a.status) === 5) ? 1 : 0.5;
                                                                })()
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                const statusId = mapStatusLabelToId(a.status);
                                                                const isComplete = statusId === 5;
                                                                const shouldEnable = !isReceptionist || isComplete;
                                                                if (!shouldEnable || mapStatusLabelToId(a.status) !== 5) return;
                                                                e.currentTarget.style.backgroundColor = '#FFF3E0';
                                                                e.currentTarget.style.borderColor = 'black';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                const statusId = mapStatusLabelToId(a.status);
                                                                const isComplete = statusId === 5;
                                                                const shouldEnable = !isReceptionist || isComplete;
                                                                if (!shouldEnable || mapStatusLabelToId(a.status) !== 5) return;
                                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                                e.currentTarget.style.borderColor = '#ddd';
                                                            }}
                                                        >
                                                            <img src="/images/avatar/wallet.png" alt="Collection" style={{ width: 16, height: 16, filter: 'brightness(0)' }} />
                                                        </div>
                                                    </div>
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
                        <div className="card-grid position-relative">
                            {/* Loading overlay for appointments refresh */}
                            {loadingAppointments && (
                                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" 
                                     style={{ 
                                         backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                                         zIndex: 10,
                                         minHeight: '200px'
                                     }}>
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Refreshing...</span>
                                    </div>
                                </div>
                            )}
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
                                                        color: '#000000',
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
                                                    {(() => {
                                                        const filteredStatuses = availableStatuses.length ? availableStatuses.filter(status => {
                                                            const statusId = mapStatusLabelToId(status);
                                                            return statusId === 1 || statusId === 2 || statusId === 3;
                                                        }) : ["WAITING", "WITH DOCTOR", "CONSULT ON CALL"];
                                                        console.log('🃏 Card View Status Change Options:', {
                                                            availableStatuses,
                                                            filteredStatuses,
                                                            statusIds: filteredStatuses.map(s => ({ status: s, id: mapStatusLabelToId(s) }))
                                                        });
                                                        return (
                                                            <>
                                                                {filteredStatuses.map((status) => (
                                                                    <div
                                                                        key={status}
                                                                        onClick={() => {
                                                                            // Stage pending status in card view as well
                                                                            updateAppointmentField(originalIndex, 'statusPending' as any, status);
                                                                            updateAppointmentField(originalIndex, 'statusColorPending' as any, getStatusColor(status));
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
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            )}
                                            <div className="card-details">
                                                <div className="kv"><span className="k">Contact:</span><span className="v">{appointment.contact}</span></div>
                                                <div className="kv"><span className="k">Age:</span><span className="v">{appointment.age}</span></div>
                                                <div className="kv">
                                                    <span className="k">Last Visit:</span>
                                                    <span className="v">
                                                        <a
                                                            href="#"
                                                            title={`View visit history`}
                                                            style={{ textDecoration: 'underline', color: '#1E88E5', cursor: 'pointer' }}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleLastVisitClick(appointment.patientId, appointment.patient, appointment);
                                                            }}
                                                        >
                                                            {loadingVisits[appointment.patientId] ? (
                                                                <span className="text-muted">
                                                                    <i className="fas fa-spinner fa-spin me-1"></i>
                                                                    Loading...
                                                                </span>
                                                            ) : (
                                                                formatLastVisitDisplay(appointment.patientId, appointment.reports_received, appointment.visitNumber === 1)
                                                            )}
                                                        </a>
                                                    </span>
                                                </div>
                                                <div className="kv"><span className="k">Gender:</span><span className="v">{appointment.gender}</span></div>
                                                <div className="kv"><span className="k">Provider:</span><span className="v">
                                                    <select
                                                        className="form-select"
                                                        value={appointment.provider || getDoctorLabelById(selectedDoctorId) || ''}
                                                        onChange={(e) => handleProviderChange(originalIndex, e.target.value)}
                                                        style={{ width: '161px', height: '28px', padding: '2px', fontSize: 11 }}
                                                    >
                                                        {getProviderOptionsWithSelectedFirst().map(opt => (
                                                            <option key={opt.id} value={opt.label}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                </span></div>
                                                <div className="kv"><span className="k">Time:</span><span className="v">{extractTime(appointment.time)}</span></div>
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
                                                        title={(() => {
                                                            const statusId = mapStatusLabelToId(appointment.status);
                                                            const isWaiting = statusId === 1;
                                                            const isComplete = statusId === 5;
                                                            const shouldEnable = !isReceptionist || isWaiting || isComplete;
                                                            return shouldEnable ? "Lab Details" : "Lab Details (Disabled for Reception)";
                                                        })()}
                                                        onClick={() => {
                                                            const statusId = mapStatusLabelToId(appointment.status);
                                                            const isWaiting = statusId === 1;
                                                            const isComplete = statusId === 5;
                                                            const shouldEnable = !isReceptionist || isWaiting || isComplete;
                                                            if (!shouldEnable) return; // Disable for reception login unless WAITING or COMPLETE
                                                            // Navigate to lab details or open modal
                                                            console.log('Lab Details clicked for patient:', appointment.patientId);
                                                        }}
                                                        style={{
                                                            opacity: (() => {
                                                                const statusId = mapStatusLabelToId(appointment.status);
                                                                const isWaiting = statusId === 1;
                                                                const isComplete = statusId === 5;
                                                                const shouldEnable = !isReceptionist || isWaiting || isComplete;
                                                                return shouldEnable ? 1 : 0.5;
                                                            })(),
                                                            cursor: (() => {
                                                                const statusId = mapStatusLabelToId(appointment.status);
                                                                const isWaiting = statusId === 1;
                                                                const isComplete = statusId === 5;
                                                                const shouldEnable = !isReceptionist || isWaiting || isComplete;
                                                                return shouldEnable ? 'pointer' : 'not-allowed';
                                                            })(),
                                                            backgroundColor: (() => {
                                                                const statusId = mapStatusLabelToId(appointment.status);
                                                                const isWaiting = statusId === 1;
                                                                const isComplete = statusId === 5;
                                                                const shouldEnable = !isReceptionist || isWaiting || isComplete;
                                                                return shouldEnable ? 'transparent' : '#f5f5f5';
                                                            })()
                                                        }}
                                                    >
                                                        <img src="/images/avatar/test-tubes_3523917.png" alt="Lab Test" style={{ width: 16, height: 16 }} />
                                                    </div>
                                                    <div
                                                        className="crm-btn"
                                                        title="Save"
                                                        onClick={async () => {
                                                            try {
                                                                const pid = appointment.patientId;
                                                                // Use the visit number from the selected appointment card
                                                                const vno = Number(appointment.visitNumber) || getLatestVisitNumber(appointment.patientId);
                                                                const shift = appointment.shiftId || 1;
                                                                const clinic = appointment.clinicId || sessionData?.clinicId || '';
                                                                const onlineTime = (appointment.online || '').trim() || undefined;
                                                                // Get the updated provider from the dropdown
                                                                const updatedProvider = appointment.provider || getDoctorLabelById(selectedDoctorId) || '';
                                                                // Convert provider name back to doctor ID for API
                                                                const doctor = getDoctorIdFromProviderName(updatedProvider) || selectedDoctorId || appointment.doctorId || '';
                                                                // Use pending status if available, otherwise fall back to saved status
                                                                const currentStatus = (appointment as any).statusPending || appointment.status;
                                                                const statusId: number = mapStatusLabelToId(currentStatus);

                                                                // Debug logging
                                                                console.log('=== UPDATE ONLINE TIME DEBUG (Card View) ===');
                                                                console.log('Patient ID:', pid);
                                                                console.log('Updated Provider:', updatedProvider);
                                                                console.log('Doctor ID:', doctor);
                                                                console.log('Current Status:', currentStatus);
                                                                console.log('Visit Number from card:', appointment.visitNumber);
                                                                console.log('Visit Number being sent:', vno);
                                                                console.log('Shift ID:', shift);
                                                                console.log('Clinic ID:', clinic);
                                                                console.log('Online Time:', onlineTime);
                                                                console.log('Doctor ID:', doctor);
                                                                console.log('Status ID:', statusId);
                                                                console.log('================================');

                                                                if (!pid || !clinic || !doctor) {
                                                                    setSnackbarMessage('Missing identifiers to update appointment');
                                                                    setShowSnackbar(true);
                                                                    setTimeout(() => setShowSnackbar(false), 3000);
                                                                    return;
                                                                }

                                                                const response = await appointmentService.updateTodaysAppointment({
                                                                    patientId: String(pid),
                                                                    patientVisitNo: Number(vno),
                                                                    shiftId: Number(shift),
                                                                    clinicId: String(clinic),
                                                                    onlineAppointmentTime: onlineTime,
                                                                    doctorId: String(doctor),
                                                                    statusId: Number(statusId),
                                                                    userId: String(sessionData?.userId || 'system')
                                                                });

                                                                console.log('Update response:', response);

                                                                if (response.success) {
                                                                    setSnackbarMessage('Appointment updated successfully');
                                                                    setShowSnackbar(true);
                                                                    setTimeout(() => setShowSnackbar(false), 2000);
                                                                    // Commit pending status to saved fields
                                                                    if ((appointments[originalIndex] as any).statusPending) {
                                                                        const committed = (appointments[originalIndex] as any).statusPending;
                                                                        updateAppointmentField(originalIndex, 'status', committed);
                                                                        updateAppointmentField(originalIndex, 'statusColor', getStatusColor(committed));
                                                                        updateAppointmentField(originalIndex, 'statusPending' as any, undefined);
                                                                        updateAppointmentField(originalIndex, 'statusColorPending' as any, undefined);
                                                                    }
                                                                    // If appointment moved to a different provider, drop from current view
                                                                    const movedToDifferentDoctor = String(doctor) !== String(selectedDoctorId);
                                                                    if (movedToDifferentDoctor) {
                                                                        setAppointments(prev => prev.filter((_, i) => i !== originalIndex));
                                                                    } else {
                                                                        updateAppointmentField(originalIndex, 'doctorId' as any, String(doctor));
                                                                    }
                                                                    try {
                                                                        await refreshAppointmentsForSelectedDoctor();
                                                                    } catch (e) {
                                                                        console.warn('Refresh after save failed (card view):', e);
                                                                    }
                                                                } else {
                                                                    setSnackbarMessage('Update failed: ' + (response.message || 'Unknown error'));
                                                                    setShowSnackbar(true);
                                                                    setTimeout(() => setShowSnackbar(false), 4000);
                                                                }
                                                            } catch (err) {
                                                                console.error('Update appointment failed:', err);
                                                                setSnackbarMessage('Failed to update appointment');
                                                                setShowSnackbar(true);
                                                                setTimeout(() => setShowSnackbar(false), 4000);
                                                            }
                                                        }}
                                                        style={{
                                                            opacity: 1,
                                                            cursor: 'pointer',
                                                            backgroundColor: 'transparent'
                                                        }}
                                                    >
                                                        <Save fontSize="small" />
                                                    </div>
                                                    <div
                                                        className="crm-btn"
                                                        title={(() => {
                                                            const statusId = mapStatusLabelToId(appointment.status);
                                                            const isWaiting = statusId === 1;
                                                            const isComplete = statusId === 5;
                                                            const shouldEnable = !isReceptionist || isWaiting || isComplete;
                                                            return shouldEnable ? "Delete" : "Delete (Disabled for Reception)";
                                                        })()}
                                                        onClick={async () => {
                                                            const statusId = mapStatusLabelToId(appointment.status);
                                                            const isWaiting = statusId === 1;
                                                            const isComplete = statusId === 5;
                                                            const shouldEnable = !isReceptionist || isWaiting || isComplete;
                                                            if (!shouldEnable) return; // Disable for reception login unless WAITING or COMPLETE
                                                            try {
                                                                const pid = appointment.patientId;
                                                                const rawVtime = String(appointment.time || '00:00');
                                                                // Use today's date with the visit time for deletion
                                                                const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
                                                                console.log('=== APPOINTMENT DELETION DEBUG ===');
                                                                console.log('Appointment object:', appointment);
                                                                console.log('Raw visit time:', rawVtime);
                                                                console.log('Using today\'s date:', today);

                                                                // Combine today's date with visit time for precise deletion
                                                                const vdatetime = `${today} ${rawVtime}`;
                                                                console.log('Final visit datetime being sent (today + time):', vdatetime);
                                                                console.log('=== END DEBUG ===');
                                                                const did = appointment.doctorId || selectedDoctorId;
                                                                if (!pid || !vdatetime || !did) {
                                                                    setSnackbarMessage('Missing identifiers to delete appointment');
                                                                    setShowSnackbar(true);
                                                                    setTimeout(() => setShowSnackbar(false), 3000);
                                                                    return;
                                                                }
                                                                const confirmDelete = window.confirm('Delete this appointment?');
                                                                if (!confirmDelete) return;
                                                                
                                                                await appointmentService.deleteAppointment({ 
                                                                    patientId: String(pid), 
                                                                    visitDate: String(vdatetime), 
                                                                    doctorId: String(did), 
                                                                    clinicId: sessionData?.clinicId || '',
                                                                    userId: String(sessionData?.userId || 'system') 
                                                                });
                                                                // Remove from UI
                                                                setAppointments(prev => prev.filter((_, i) => i !== originalIndex));
                                                            } catch (err) {
                                                                console.error('Delete appointment failed:', err);
                                                                setSnackbarMessage('Failed to delete appointment');
                                                                setShowSnackbar(true);
                                                                setTimeout(() => setShowSnackbar(false), 3000);
                                                            }
                                                        }}
                                                        style={{
                                                            opacity: (() => {
                                                                const statusId = mapStatusLabelToId(appointment.status);
                                                                const isWaiting = statusId === 1;
                                                                const isComplete = statusId === 5;
                                                                const shouldEnable = !isReceptionist || isWaiting || isComplete;
                                                                return shouldEnable ? 1 : 0.5;
                                                            })(),
                                                            cursor: (() => {
                                                                const statusId = mapStatusLabelToId(appointment.status);
                                                                const isWaiting = statusId === 1;
                                                                const isComplete = statusId === 5;
                                                                const shouldEnable = !isReceptionist || isWaiting || isComplete;
                                                                return shouldEnable ? 'pointer' : 'not-allowed';
                                                            })(),
                                                            backgroundColor: (() => {
                                                                const statusId = mapStatusLabelToId(appointment.status);
                                                                const isWaiting = statusId === 1;
                                                                const isComplete = statusId === 5;
                                                                const shouldEnable = !isReceptionist || isWaiting || isComplete;
                                                                return shouldEnable ? 'transparent' : '#f5f5f5';
                                                            })()
                                                        }}
                                                    >
                                                        <Delete fontSize="small" />
                                                    </div>
                                                    <div
                                                        className="crm-btn"
                                                        title={(() => {
                                                            const statusId = mapStatusLabelToId(appointment.status);
                                                            const isWaiting = statusId === 1;
                                                            const isComplete = statusId === 5;
                                                            const shouldEnable = !isReceptionist || isWaiting || isComplete;
                                                            if (!shouldEnable) return "Visit Details (Disabled for Reception)";
                                                            return appointment.status === 'WITH DOCTOR' ? 'Visit Details (Disabled - Patient with doctor)' : 'Visit Details';
                                                        })()}
                                                        onClick={() => {
                                                            const statusId = mapStatusLabelToId(appointment.status);
                                                            const isWaiting = statusId === 1;
                                                            const isComplete = statusId === 5;
                                                            const shouldEnable = !isReceptionist || isWaiting || isComplete;
                                                            if (!shouldEnable) return; // Disable for reception login unless WAITING or COMPLETE
                                                            if (appointment.status === 'WITH DOCTOR') return; // Disable click when status is WITH DOCTOR
                                                            setSelectedPatientForVisit(appointment as any);
                                                            setShowVisitDetails(true);
                                                        }}
                                                        style={{ 
                                                            cursor: (() => {
                                                                const statusId = mapStatusLabelToId(appointment.status);
                                                                const isWaiting = statusId === 1;
                                                                const isComplete = statusId === 5;
                                                                const shouldEnable = !isReceptionist || isWaiting || isComplete;
                                                                return (shouldEnable && appointment.status !== 'WITH DOCTOR') ? 'pointer' : 'not-allowed';
                                                            })(),
                                                            backgroundColor: (() => {
                                                                const statusId = mapStatusLabelToId(appointment.status);
                                                                const isWaiting = statusId === 1;
                                                                const isComplete = statusId === 5;
                                                                const shouldEnable = !isReceptionist || isWaiting || isComplete;
                                                                if (!shouldEnable) return '#f5f5f5';
                                                                return appointment.status === 'WITH DOCTOR' ? 'rgb(96, 125, 139)' : (appointment.visitDetailsSubmitted ? '#FFD700' : 'transparent');
                                                            })(),
                                                            borderRadius: '4px',
                                                            padding: '2px',
                                                            opacity: (() => {
                                                                const statusId = mapStatusLabelToId(appointment.status);
                                                                const isWaiting = statusId === 1;
                                                                const isComplete = statusId === 5;
                                                                const shouldEnable = !isReceptionist || isWaiting || isComplete;
                                                                return (shouldEnable && appointment.status !== 'WITH DOCTOR') ? 1 : 0.5;
                                                            })()
                                                        }}
                                                    >
                                                        <img 
                                                            src="/images/avatar/Visit_details.svg" 
                                                            alt="Visit Details" 
                                                            style={{ 
                                                                width: 16, 
                                                                height: 16,
                                                                filter: appointment.status === 'WITH DOCTOR' ? 'brightness(0.3)' : 'none'
                                                            }} 
                                                        />
                                                    </div>
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
                                                <div
                                                    className="crm-btn ms-auto"
                                                    title={(() => {
                                                        const statusId = mapStatusLabelToId(appointment.status);
                                                        const isComplete = statusId === 5;
                                                        const shouldEnable = !isReceptionist || isComplete;
                                                        if (!shouldEnable) return "Collection (Disabled for Reception)";
                                                        return mapStatusLabelToId(appointment.status) !== 5 ? "Collection (Disabled - Status not Complete)" : "Collection";
                                                    })()}
                                                    onClick={() => {
                                                        const statusId = mapStatusLabelToId(appointment.status);
                                                        const isComplete = statusId === 5;
                                                        const shouldEnable = !isReceptionist || isComplete;
                                                        if (!shouldEnable) return; // Disable for reception login unless COMPLETE
                                                        if (mapStatusLabelToId(appointment.status) !== 5) return;
                                                        console.log('Collection clicked for patient:', appointment.patientId);
                                                    }}
                                                    aria-disabled={(() => {
                                                        const statusId = mapStatusLabelToId(appointment.status);
                                                        const isComplete = statusId === 5;
                                                        const shouldEnable = !isReceptionist || isComplete;
                                                        return !shouldEnable || mapStatusLabelToId(appointment.status) !== 5;
                                                    })()}
                                                    style={{
                                                        opacity: (() => {
                                                            const statusId = mapStatusLabelToId(appointment.status);
                                                            const isComplete = statusId === 5;
                                                            const shouldEnable = !isReceptionist || isComplete;
                                                            return (shouldEnable && mapStatusLabelToId(appointment.status) === 5) ? 1 : 0.5;
                                                        })(),
                                                        cursor: (() => {
                                                            const statusId = mapStatusLabelToId(appointment.status);
                                                            const isComplete = statusId === 5;
                                                            const shouldEnable = !isReceptionist || isComplete;
                                                            return (shouldEnable && mapStatusLabelToId(appointment.status) === 5) ? 'pointer' : 'not-allowed';
                                                        })(),
                                                        backgroundColor: (() => {
                                                            const statusId = mapStatusLabelToId(appointment.status);
                                                            const isComplete = statusId === 5;
                                                            const shouldEnable = !isReceptionist || isComplete;
                                                            if (!shouldEnable) return '#f5f5f5';
                                                            return mapStatusLabelToId(appointment.status) !== 5 ? '#607D8B' : 'transparent';
                                                        })(),
                                                        borderColor: (() => {
                                                            const statusId = mapStatusLabelToId(appointment.status);
                                                            const isComplete = statusId === 5;
                                                            const shouldEnable = !isReceptionist || isComplete;
                                                            if (!shouldEnable) return '#ddd';
                                                            return mapStatusLabelToId(appointment.status) !== 5 ? '#607D8B' : 'black';
                                                        })()
                                                    }}
                                                >
                                                    <img src="/images/avatar/wallet.png" alt="Collection" style={{ width: 16, height: 16, filter: 'brightness(0)' }} />
                                                </div>
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
                onSave={async (patientData) => {
                    try {
                        console.log('🔄 Refreshing appointments after patient addition:', patientData);
                        
                        // Use the existing refresh function that properly handles session data
                        await refreshAppointmentsForSelectedDoctor();
                        
                        console.log('✅ Appointments refreshed successfully after patient addition');
                    } catch (error) {
                        console.error('❌ Failed to refresh appointments after adding patient:', error);
                        // Show user-friendly error message
                        setSnackbarMessage('Patient added successfully, but failed to refresh the appointments list. Please refresh the page manually.');
                        setShowSnackbar(true);
                        setTimeout(() => setShowSnackbar(false), 3000);
                    } finally {
                        setShowAddPatient(false);
                    }
                }}
                clinicId={clinicId}
            />

            {/* Patient Form Dialog */}
            {showPatientFormDialog && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    }}
                    onClick={(e) => {
                        // Close dialog when clicking on the overlay (outside the form)
                        if (e.target === e.currentTarget) {
                            setShowPatientFormDialog(false);
                        }
                    }}
                >
                    <div
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            width: '1100vw',
                            maxWidth: '1500px',
                            maxHeight: '85vh',
                            overflow: 'auto',
                            position: 'relative'
                        }}
                        onClick={(e) => {
                            // Prevent closing when clicking inside the form content
                            e.stopPropagation();
                        }}
                    >
                        {/* Patient Form Content */}
                        <PatientFormTest
                            onClose={() => setShowPatientFormDialog(false)}
                            initialData={formPatientData || undefined}
                            visitDates={visitDates}
                            currentVisitIndex={currentVisitIndex}
                            onVisitDateChange={handleVisitDateChange}
                        />
                    </div>
                </div>
            )}

            {/* Patient Visit Details Popup */}
            {showVisitDetails && selectedPatientForVisit && (
                <PatientVisitDetails
                    open={true}
                    onClose={() => {
                        setShowVisitDetails(false);
                        setSelectedPatientForVisit(null);
                    }}
                    patientData={selectedPatientForVisit as any}
                    onVisitDetailsSubmitted={handleVisitDetailsSubmitted}
                />
            )}

            {/* Lab Test Entry Popup */}
            {showLabTestEntry && selectedPatientForLab && (
                <LabTestEntry
                    open={true}
                    onClose={() => {
                        setShowLabTestEntry(false);
                        setSelectedPatientForLab(null);
                    }}
                    patientData={selectedPatientForLab}
                    appointment={selectedPatientForLab}
                    sessionData={sessionData}
                />
            )}
            <Snackbar
                open={showBookedSnackbar}
                autoHideDuration={3000}
                onClose={() => setShowBookedSnackbar(false)}
                message={bookedSnackbarMessage || 'Appointment booked successfully'}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center',}}
            />
        </div>
    );
}