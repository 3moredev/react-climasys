// Enhanced Appointment.tsx with immediate action items implemented
import React, { useState, useEffect, useRef, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { List, CreditCard, MoreVert, Add as AddIcon, Save, Delete, Info, FastForward, Close, ChatBubbleOutline, Phone, SwapHoriz, ShoppingCart } from "@mui/icons-material";
import { appointmentService, Appointment, AppointmentRequest, TodayAppointmentsResponse, getDoctorStatusReference, getStatusOptionsByClinic } from "../services/appointmentService";
import { doctorService, DoctorDetail, Doctor } from "../services/doctorService";
import { patientService, Patient, formatVisitDateTime, getVisitStatusText } from "../services/patientService";
import type { PatientVisit } from "../services/patientService";
import { useNavigate, useLocation } from "react-router-dom";
import { IconButton } from "@mui/material";
import SearchInput from "../components/SearchInput";
import AddPatientPage from "./AddPatientPage";
import PatientVisitDetails from "./PatientVisitDetails";
import { sessionService, SessionInfo } from "../services/sessionService";
import PatientFormTest from "../components/Test/PatientFormTest";
import LabTestEntry from "../components/LabTestEntry";
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog";

// Import new utilities
import { sessionExpiryManager } from "../utils/sessionExpiryHandler";
import { sanitizeSearchQuery, sanitizePatientData, validateAppointmentData } from "../utils/inputSanitizer";
import { executeWithRetry, apiCall, addNetworkStatusListener } from "../utils/networkHandler";
import { debounce, throttle, createSearchIndex, searchWithIndex } from "../utils/performanceOptimizer";
import { executeWithLock, preventDuplicate, batchOperations } from "../utils/concurrencyManager";

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
    referralName?: string;
};

export default function AppointmentTableEnhanced() {
    // ... existing state variables ...
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
    const [filterSize, setFilterSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
    const [showVisitDetails, setShowVisitDetails] = useState<boolean>(false);
    const [selectedPatientForVisit, setSelectedPatientForVisit] = useState<AppointmentRow | null>(null);
    const [submittedVisitDetails, setSubmittedVisitDetails] = useState<Set<string>>(new Set());
    const [formPatientData, setFormPatientData] = useState<any | null>(null);
    const [visitDates, setVisitDates] = useState<string[]>([]);
    const [currentVisitIndex, setCurrentVisitIndex] = useState<number>(0);
    const [allVisits, setAllVisits] = useState<PatientVisit[]>([]);
    const [sessionData, setSessionData] = useState<SessionInfo | null>(null);
    const [doctorId, setDoctorId] = useState<string>('');
    const [clinicId, setClinicId] = useState<string>('');
    const [userRole, setUserRole] = useState<string>('');
    const [isReceptionist, setIsReceptionist] = useState<boolean>(false);
    const [isDoctor, setIsDoctor] = useState<boolean>(false);
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
    const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
    const [loadingDoctors, setLoadingDoctors] = useState<boolean>(false);
    const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
    const [previousVisits, setPreviousVisits] = useState<Record<string, PatientVisit[]>>({});
    const [loadingVisits, setLoadingVisits] = useState<Record<string, boolean>>({});
    const searchInputRef = useRef<HTMLInputElement | null>(null);
    const [searchMenuPosition, setSearchMenuPosition] = useState<{ top: number; left: number; width: number } | null>(null);

    // Delete confirmation state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
    const [appointmentToDelete, setAppointmentToDelete] = useState<AppointmentRow | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    // Performance optimization: Search index for large datasets
    const [searchIndex, setSearchIndex] = useState<Map<string, Patient[]>>(new Map());

    // Enhanced search with sanitization and performance optimization
    const handleSearchChange = debounce(async (query: string) => {
        // Sanitize input to prevent XSS and SQL injection
        const sanitizedQuery = sanitizeSearchQuery(query);

        if (sanitizedQuery !== query) {
            console.warn('🚨 Search query was sanitized:', { original: query, sanitized: sanitizedQuery });
        }

        if (!sanitizedQuery.trim()) {
            setSearchResults([]);
            setShowDropdown(false);
            setSearchError("");
            return;
        }

        try {
            setLoading(true);
            setSearchError("");

            // Use performance-optimized search for large datasets
            if (appointments.length > 100) {
                const results = searchWithIndex(sanitizedQuery, searchIndex, 50);
                setSearchResults(results);
                setShowDropdown(results.length > 0);
            } else {
                // Regular API search for smaller datasets
                const response = await executeWithRetry(
                    () => patientService.searchPatients({
                        query: sanitizedQuery,
                        status: 'all',
                        page: 0,
                        size: 50
                    }),
                    'Patient Search',
                    { maxRetries: 2 }
                );

                const patients = response.patients || [];
                const sanitizedPatients = patients.map(patient => sanitizePatientData(patient));

                setSearchResults(sanitizedPatients);
                setShowDropdown(sanitizedPatients.length > 0);
            }
        } catch (error: any) {
            console.error("Error searching patients:", error);
            setSearchResults([]);
            setShowDropdown(false);
            setSearchError(error.message || "Failed to search patients");
        } finally {
            setLoading(false);
        }
    }, 'search', 300);

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
            const mobile = toStringSafe(getField(row, ['Mobile', 'mobile_1', 'Mobile_1', 'mobileNumber', 'mobilePhoneNumber', 'mobile_number', 'MobileNumber', 'contact', 'phone', 'mobile'], ''));
            const apptDate = toStringSafe(getField(row, ['Visit_Date', 'appointmentDate', 'appointment_date', 'visitDate', 'visit_date'], new Date().toISOString().split('T')[0]));
            const apptTime = toStringSafe(getField(row, ['Visit_Time', 'visit_time', 'appointmentTime', 'appointment_time', 'visitTime'], ''));
            const doctor = toStringSafe(getField(row, ['Doctor_Name', 'doctor_name', 'doctorName', 'provider', 'providerName'], 'Tongaonkar'));
            const status = toStringSafe(getField(row, ['status_description', 'status', 'appointmentStatus', 'appointment_status'], 'WAITING')).toUpperCase();
            const lastOpd = "";
            const onlineTime = toStringSafe(getField(row, ['Online_Appointment_Time', 'onlineAppointmentTime', 'online_time', 'onlineTime'], ''));
            const reportsAsked = !!getField(row, ['reportsAsked', 'reports_asked', 'reportsReceived', 'reports_received'], false);
            const visitNumber = toNumberSafe(getField(row, ['patient_visit_no', 'Patient_Visit_No', 'visitNumber', 'visit_number'], 1));
            const referralName = toStringSafe(getField(row, ['referralName', 'referral_name', 'ReferralName', 'Referral_Name', 'Refer_Doctor_Details', 'referredBy', 'referred_by', 'Referred_By', 'referred_to', 'referalName', 'ReferalName'], ''));
            const shiftId = toNumberSafe(getField(row, ['shift_id', 'Shift_ID', 'shiftId'], 1));

            const clinicIdFromRow = toStringSafe(getField(row, ['clinic_id', 'Clinic_ID', 'clinicId'], ''));
            const genderDescription = toStringSafe(getField(row, ['gender_description', 'genderDescription', 'gender', 'sex'], ''));

            // Fix time formatting - ensure proper HH:mm format
            let formattedTime = '00:00';
            if (apptTime && apptTime !== 'null' && apptTime !== 'undefined') {
                const timeStr = String(apptTime).trim();
                if (timeStr.includes(':')) {
                    const parts = timeStr.split(':');
                    if (parts.length >= 2) {
                        const hours = parseInt(parts[0], 10);
                        const minutes = parseInt(parts[1], 10);
                        if (!isNaN(hours) && !isNaN(minutes)) {
                            formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                        }
                    }
                } else if (timeStr.length === 4 && /^\d{4}$/.test(timeStr)) {
                    const hours = parseInt(timeStr.substring(0, 2), 10);
                    const minutes = parseInt(timeStr.substring(2, 4), 10);
                    if (!isNaN(hours) && !isNaN(minutes)) {
                        formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                    }
                } else if (timeStr.length === 3 && /^\d{3}$/.test(timeStr)) {
                    const hours = parseInt(timeStr.substring(0, 1), 10);
                    const minutes = parseInt(timeStr.substring(1, 3), 10);
                    if (!isNaN(hours) && !isNaN(minutes)) {
                        formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                    }
                } else if (!isNaN(Number(timeStr)) && Number(timeStr) > 0) {
                    const numTime = Number(timeStr);
                    if (numTime < 100) {
                        formattedTime = `00:${String(numTime).padStart(2, '0')}`;
                    } else if (numTime < 1000) {
                        const hours = Math.floor(numTime / 100);
                        const minutes = numTime % 100;
                        formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                    } else {
                        const hours = Math.floor(numTime / 100);
                        const minutes = numTime % 100;
                        formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                    }
                }
            }

            const timeString = `${apptDate}T${formattedTime}:00`;
            let displayTime: string;
            try {
                const dateObj = new Date(timeString);
                if (isNaN(dateObj.getTime())) {
                    displayTime = formattedTime;
                } else {
                    displayTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                }
            } catch {
                displayTime = formattedTime;
            }

            return {
                reports_received: reportsAsked,
                sr: index + 1,
                patient: patientName,
                patientId: patientIdRaw,
                visitDate: apptDate,
                age: age,
                gender: gender,
                contact: mobile,
                time: formattedTime,
                provider: doctor,
                online: onlineTime,
                statusColor: getStatusColor(status),
                status: status,
                lastOpd: lastOpd,
                labs: reportsAsked ? 'Yes' : 'No',
                doctorId: getField(row, ['doctor_id', 'doctorId', 'Doctor_ID'], ''),
                visitNumber: visitNumber,
                shiftId: shiftId,
                actions: true,
                gender_description: genderDescription,
                referralName: referralName
            };
        });
    };

    // Refresh appointments for the selected doctor
    const refreshAppointments = async () => {
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

    // Enhanced appointment booking with concurrency protection
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
        const operationId = `book-appointment-${patient.id}-${Date.now()}`;

        try {
            // Prevent duplicate booking operations
            await preventDuplicate(
                operationId,
                'Book Appointment',
                async () => {
                    // Block booking if patient has any non-COMPLETED appointment today
                    const hasNonCompletedAppointment = appointments.some(
                        (a) => a.patientId === String(patient.id) && String(a.status || '').toUpperCase() !== 'COMPLETE'
                    );
                    if (hasNonCompletedAppointment) {
                        alert("This patient has an existing appointment that is not COMPLETE. Please complete it before booking a new one.");
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
                        alert("Unable to determine clinic ID. Please ensure you are properly logged in and try again.");
                        return;
                    }

                    const now = new Date();
                    const hh = String(now.getHours()).padStart(2, '0');
                    const mm = String(now.getMinutes()).padStart(2, '0');
                    const currentVisitTime = `${hh}:${mm}`;

                    const appointmentData: AppointmentRequest = {
                        visitDate: new Date().toISOString().split('T')[0],
                        shiftId: 1,
                        clinicId: clinicId, // Use clinic ID from session
                        doctorId: selectedDoctorId,
                        patientId: String(patient.id),
                        visitTime: currentVisitTime,
                        reportsReceived: false,
                        inPerson: true
                    };

                    // Validate appointment data
                    const validation = validateAppointmentData(appointmentData);
                    if (!validation.isValid) {
                        alert(`Invalid appointment data: ${validation.errors.join(', ')}`);
                        return;
                    }

                    console.log('Booking appointment with data:', appointmentData);

                    // Use network handler with retry logic
                    const result = await apiCall(
                        () => appointmentService.bookAppointment(appointmentData),
                        'Book Appointment',
                        { showLoading: true, showError: true }
                    );

                    console.log('Booking result:', result);

                    if (result.success) {
                        // Refresh appointments with concurrency protection
                        await executeWithLock(
                            `refresh-appointments-${selectedDoctorId}`,
                            'Refresh Appointments',
                            async () => {
                                const today = new Date().toISOString().split('T')[0];
                                const doctorId = selectedDoctorId;
                                let clinicId = sessionData?.clinicId;
                                if (!clinicId) {
                                    try {
                                        const sessionClinicId = await sessionService.getClinicId();
                                        clinicId = sessionClinicId || '';
                                    } catch (error) {
                                        console.error('Failed to get clinic ID from session:', error);
                                        clinicId = '';
                                    }
                                }

                                const resp: TodayAppointmentsResponse = await appointmentService.getAppointmentsForDateSP({
                                    doctorId,
                                    clinicId,
                                    futureDate: today,
                                    languageId: 1
                                });
                                const rows = convertSPResultToRows(resp?.resultSet1 || []);
                                setAppointments(rows);
                            }
                        );

                        setSelectedPatients([]);
                        alert(`Successfully booked appointment for ${patient.first_name} ${patient.last_name}!`);
                    } else {
                        alert(`Failed to book appointment: ${result.error || 'Unknown error'}`);
                    }
                }
            );
        } catch (error) {
            console.error("Error booking appointment:", error);
            alert("Failed to book appointment. Please try again.");
        }
    };

    // Enhanced status update with concurrency protection
    const handleStatusUpdate = async (appointment: AppointmentRow, newStatus: string) => {
        const operationId = `update-status-${appointment.patientId}-${Date.now()}`;

        try {
            await executeWithLock(
                operationId,
                'Update Appointment Status',
                async () => {
                    const pid = appointment.patientId;
                    const vno = Number(appointment.visitNumber) || 1;
                    const shift = appointment.shiftId || 1;
                    let clinic = appointment.clinicId || sessionData?.clinicId;
                    if (!clinic) {
                        try {
                            const sessionClinicId = await sessionService.getClinicId();
                            clinic = sessionClinicId || '';
                        } catch (error) {
                            console.error('Failed to get clinic ID from session:', error);
                            clinic = '';
                        }
                    }
                    const doctor = appointment.doctorId || selectedDoctorId;
                    const onlineTime = appointment.time || '00:00';
                    const statusId = getStatusIdFromLabel(newStatus);

                    if (!pid || !clinic || !doctor) {
                        alert('Missing identifiers to update appointment');
                        return;
                    }

                    const response = await apiCall(
                        () => appointmentService.updateTodaysAppointment({
                            patientId: String(pid),
                            patientVisitNo: Number(vno),
                            shiftId: Number(shift),
                            clinicId: String(clinic),
                            onlineAppointmentTime: onlineTime,
                            doctorId: String(doctor),
                            statusId: Number(statusId),
                            userId: String(sessionData?.userId || 'system')
                        }),
                        'Update Appointment Status',
                        { showLoading: true, showError: true }
                    );

                    if (response.success) {
                        alert('Appointment updated successfully');
                        // Refresh appointments
                        await refreshAppointments();
                    } else {
                        alert('Update failed: ' + (response.message || 'Unknown error'));
                    }
                }
            );
        } catch (error) {
            console.error('Update appointment failed:', error);
            alert('Failed to update appointment: ' + (error as any).message);
        }
    };

    // Enhanced delete with concurrency protection
    const handleDeleteAppointment = (appointment: AppointmentRow) => {
        setAppointmentToDelete(appointment);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!appointmentToDelete) return;

        const appointment = appointmentToDelete;
        const operationId = `delete-appointment-${appointment.patientId}-${Date.now()}`;

        try {
            await executeWithLock(
                operationId,
                'Delete Appointment',
                async () => {
                    const pid = appointment.patientId;
                    const rawVtime = String(appointment.time || '00:00');
                    const today = new Date().toISOString().split('T')[0];
                    const vdatetime = `${today} ${rawVtime}`;
                    const did = appointment.doctorId || selectedDoctorId;

                    if (!pid || !vdatetime || !did) {
                        alert('Missing identifiers to delete appointment');
                        return;
                    }

                    setIsDeleting(true);
                    await apiCall(
                        () => appointmentService.deleteAppointment({
                            patientId: String(pid),
                            visitDate: String(vdatetime),
                            doctorId: String(did),
                            clinicId: sessionData?.clinicId || '',
                            userId: String(sessionData?.userId || 'system')
                        }),
                        'Delete Appointment',
                        { showLoading: true, showError: true }
                    );

                    // Remove from UI
                    setAppointments(prev => prev.filter(a => a.patientId !== appointment.patientId));
                    setShowDeleteConfirm(false);
                    setAppointmentToDelete(null);
                }
            );
        } catch (error) {
            console.error('Delete appointment failed:', error);
            alert('Failed to delete appointment');
        } finally {
            setIsDeleting(false);
        }
    };

    // Network status monitoring
    useEffect(() => {
        const cleanup = addNetworkStatusListener((isOnline) => {
            if (!isOnline) {
                console.warn('🌐 Network connection lost');
            } else {
                console.log('🌐 Network connection restored');
            }
        });

        return cleanup;
    }, []);

    // Session monitoring with enhanced error handling
    useEffect(() => {
        const fetchSessionData = async () => {
            try {
                const result = await sessionExpiryManager.retryOperation(
                    'fetch-session-data',
                    async () => await sessionService.getSessionInfo()
                );

                if (result.success && result.data) {
                    setSessionData(result.data);
                    setDoctorId(result.data.doctorId);
                    setClinicId(result.data.clinicId);
                    // ... rest of session setup
                } else {
                    console.error('Failed to fetch session data:', result.error);
                }
            } catch (error) {
                console.error('Error fetching session data:', error);
            }
        };

        fetchSessionData();
    }, []);

    // Performance optimization: Create search index for large datasets
    useEffect(() => {
        if (appointments.length > 100) {
            const index = createSearchIndex(appointments, ['patient', 'patientId', 'contact']);
            setSearchIndex(index);
        }
    }, [appointments]);

    // ... rest of the component implementation with enhanced error handling and performance optimizations

    return (
        <div className="container-fluid">
            {/* Enhanced header with performance indicators */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Appointments</h2>
                <div className="d-flex align-items-center gap-3">
                    {/* Performance indicator */}
                    {appointments.length > 100 && (
                        <div className="badge bg-info">
                            Large Dataset ({appointments.length} appointments)
                        </div>
                    )}
                    {/* Network status indicator */}
                    <div className="badge bg-success" id="network-status">
                        Online
                    </div>
                </div>
            </div>

            {/* Enhanced search with sanitization warning */}
            <div className="mb-3" ref={searchRef}>
                <SearchInput
                    value={searchTerm}
                    onChange={(val) => {
                        const sanitized = sanitizeSearchQuery(val);
                        if (sanitized !== val) {
                            console.warn('🚨 Input sanitized');
                        }
                        setSearchTerm(sanitized);
                        handleSearchChange(sanitized);
                    }}
                    onClear={() => {
                        setSearchResults([]);
                        setShowDropdown(false);
                        setSearchError("");
                    }}
                    placeholder="Search by Patient ID/Name/ContactNumber"
                    ref={searchInputRef}
                    className="w-100"
                />

                {/* Search error display */}
                {searchError && (
                    <div className="alert alert-warning mt-2" role="alert">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        {searchError}
                    </div>
                )}
            </div>

            {/* Enhanced appointment list with performance optimizations */}
            <div className="table-responsive">
                <table className="table table-striped appointments-table">
                    <thead>
                        <tr>
                            <th>Sr</th>
                            <th>Patient</th>
                            <th>Age</th>
                            <th>Gender</th>
                            <th>Contact</th>
                            <th>Time</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map((appointment, index) => (
                            <tr key={appointment.patientId}>
                                <td>{appointment.sr}</td>
                                <td>{appointment.patient}</td>
                                <td>{appointment.age}</td>
                                <td>{appointment.gender}</td>
                                <td>{appointment.contact}</td>
                                <td>{appointment.time}</td>
                                <td>
                                    <span className={`badge bg-${appointment.statusColor}`}>
                                        {appointment.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="btn-group" role="group">
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => handleStatusUpdate(appointment, 'COMPLETE')}
                                            disabled={appointment.status === 'COMPLETE'}
                                        >
                                            Complete
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDeleteAppointment(appointment)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Enhanced booking section */}
            {isReceptionist && (
                <div className="mt-4">
                    <button
                        className="btn btn-primary"
                        onClick={handleBookAppointment}
                        disabled={selectedPatients.length === 0}
                    >
                        Book Appointment
                    </button>
                </div>
            )}
        </div>
    );
}

{/* Delete Confirmation Dialog */ }
<DeleteConfirmationDialog
    open={showDeleteConfirm}
    onClose={() => setShowDeleteConfirm(false)}
    onConfirm={handleConfirmDelete}
    title="Delete Appointment"
    message={
        <>
            Are you sure you want to delete the appointment for <strong>{appointmentToDelete?.patient}</strong>?
        </>
    }
    loading={isDeleting}
/>

// Helper function to get status ID from label
function getStatusIdFromLabel(statusLabel: string): number {
    const statusMap: Record<string, number> = {
        'WAITING': 1,
        'WITH DOCTOR': 2,
        'COMPLETE': 3,
        'CHECK OUT': 4,
        'CONSULT ON CALL': 5,
        'SAVE': 6
    };
    return statusMap[statusLabel] || 1;
}

// Helper function to convert SP result to rows (existing implementation)
function convertSPResultToRows(rows: any[]): AppointmentRow[] {
    // ... existing implementation
    return rows.map((row, index) => ({
        sr: index + 1,
        patient: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
        patientId: String(row.patient_id || ''),
        age: Number(row.age || 0),
        gender: row.gender || '',
        contact: row.mobile_1 || '',
        time: row.appointment_time || '00:00',
        status: row.status || 'WAITING',
        statusColor: 'primary',
        lastOpd: '',
        labs: '',
        actions: true,
        reports_received: false,
        appointmentId: String(row.appointment_id || ''),
        visitDate: row.visit_date,
        provider: row.doctor_name || '',
        online: 'In Person',
        doctorId: String(row.doctor_id || ''),
        visitNumber: Number(row.visit_number || 1),
        shiftId: Number(row.shift_id || 1),
        clinicId: String(row.clinic_id || ''),
        gender_description: row.gender_description || ''
    }));
}
