import React, { useState } from 'react';
import { Close, Add, Delete } from '@mui/icons-material';
import { Snackbar, Alert } from '@mui/material';
import { visitService, ComprehensiveVisitDataRequest } from '../services/visitService';
import { complaintService, ComplaintOption } from '../services/complaintService';
import { DocumentService, DocumentUploadRequest } from '../services/documentService';
import { sessionService } from '../services/sessionService';
import { doctorService } from '../services/doctorService';
import AddReferralPopup, { ReferralData } from '../components/AddReferralPopup';
import AddPatientPage from './AddPatientPage';
import PatientNameDisplay from '../components/PatientNameDisplay';

interface AppointmentRow {
    reports_received: any;
    appointmentId?: string;
    sr: number;
    patient: string;
    patientId: number;
    age: number;
    contact: string;
    time: string;
    provider: string;
    online: string;
    statusColor: string;
    status: string;
    lastOpd: string;
    labs: string;
    actions: boolean;
    gender_description?: string;
    // Optional fields that are present on real appointment objects
    doctorId?: string | number;
    clinicId?: string | number;
    shiftId?: string | number;
    visitDate?: string;
    visitNumber?: number | string;
}

interface PatientVisitDetailsProps {
    open: boolean;
    onClose: () => void;
    patientData: AppointmentRow | null;
    onVisitDetailsSubmitted?: (isSubmitFlag: boolean) => void;
    readOnly?: boolean;
}

const PatientVisitDetails: React.FC<PatientVisitDetailsProps> = ({ open, onClose, patientData, onVisitDetailsSubmitted, readOnly = false }) => {
    // Debug: Log readOnly prop
    React.useEffect(() => {
        console.log('PatientVisitDetails - readOnly prop:', readOnly);
    }, [readOnly]);

    const [formData, setFormData] = useState({
        referralBy: 'Self',
        referralName: '',
        referralContact: '',
        referralEmail: '',
        referralAddress: '',
        pulse: '',
        height: '',
        weight: '',
        bmi: '',
        bp: '',
        sugar: '',
        tft: '',
        pastSurgicalHistory: '',
        previousVisitPlan: '',
        chiefComplaint: '',
        visitComments: '',
        currentMedicines: '',
        selectedComplaint: '',
        attachments: [] as File[]
    });

    const [visitType, setVisitType] = useState({
        inPerson: true,
        followUp: false, // Will be set to true only if last visit exists
        followUpType: 'New' // Will be set to "Follow-up" only if last visit exists
    });

    const [referByOptions, setReferByOptions] = useState<{ id: string; name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingAppointmentDetails, setIsLoadingAppointmentDetails] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');


    // New states for referral name search and popup
    const [referralNameSearch, setReferralNameSearch] = useState('');
    const [showReferralPopup, setShowReferralPopup] = useState(false);
    const [referralNameOptions, setReferralNameOptions] = useState<{ id: string; name: string; fullData?: any }[]>([]);
    const [isSearchingReferral, setIsSearchingReferral] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null);

    // (Reverted) complaints multi-select state removed

    // Complaints multi-select state
    const [selectedComplaints, setSelectedComplaints] = useState<string[]>([]);
    const [complaintSearch, setComplaintSearch] = useState('');
    const [isComplaintsOpen, setIsComplaintsOpen] = useState(false);
    const complaintsRef = React.useRef<HTMLDivElement | null>(null);
    const [complaintsOptions, setComplaintsOptions] = useState<ComplaintOption[]>([]);
    const [complaintsLoading, setComplaintsLoading] = useState(false);
    const [complaintsError, setComplaintsError] = useState<string | null>(null);
    const [showQuickRegistration, setShowQuickRegistration] = useState(false);
    const [sessionDataForQuickReg, setSessionDataForQuickReg] = useState<any>(null);
    const [currentClinicId, setCurrentClinicId] = useState<string>('');
    const [allDoctors, setAllDoctors] = useState<any[]>([]);

    const filteredComplaints = React.useMemo(() => {
        const term = complaintSearch.trim().toLowerCase();

        if (!term) {
            // No search term - show all options with selected ones first
            const selectedOptions = complaintsOptions.filter(opt => selectedComplaints.includes(opt.value));
            const unselectedOptions = complaintsOptions.filter(opt => !selectedComplaints.includes(opt.value));
            return [...selectedOptions, ...unselectedOptions];
        } else {
            // Search term provided - show selected items first, then search results
            const selectedOptions = complaintsOptions.filter(opt =>
                selectedComplaints.includes(opt.value) && opt.label.toLowerCase().includes(term)
            );
            const unselectedSearchResults = complaintsOptions.filter(opt =>
                !selectedComplaints.includes(opt.value) && opt.label.toLowerCase().includes(term)
            );
            return [...selectedOptions, ...unselectedSearchResults];
        }
    }, [complaintsOptions, complaintSearch, selectedComplaints]);

    // Complaints table rows
    type ComplaintRow = { id: string; value: string; label: string; comment: string };
    const [complaintsRows, setComplaintsRows] = useState<ComplaintRow[]>([]);

    // Document upload states
    const [isUploadingDocuments, setIsUploadingDocuments] = useState(false);
    const [documentUploadResults, setDocumentUploadResults] = useState<any[]>([]);
    const [existingDocuments, setExistingDocuments] = useState<any[]>([]);
    const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
    const [deletingDocumentId, setDeletingDocumentId] = useState<number | null>(null);
    // Hold complaints coming from API until options are loaded
    const [initialComplaintsFromApi, setInitialComplaintsFromApi] = useState<string | null>(null);

    const handleAddComplaints = () => {
        if (selectedComplaints.length === 0) return;
        setComplaintsRows(prev => {
            const existingValues = new Set(prev.map(r => r.value));
            const newRows: ComplaintRow[] = [];
            selectedComplaints.forEach(val => {
                if (!existingValues.has(val)) {
                    const opt = complaintsOptions.find(o => o.value === val);
                    if (opt) {
                        newRows.push({ id: `${val}`, value: val, label: opt.label, comment: '' });
                    }
                }
            });
            const next = [...prev, ...newRows];
            return next;
        });
        // Keep dropdown selections as-is; close menu
        setIsComplaintsOpen(false);
    };

    const handleComplaintCommentChange = (rowValue: string, text: string) => {
        setComplaintsRows(prev => prev.map(r => r.value === rowValue ? { ...r, comment: text } : r));
    };

    const handleRemoveComplaint = (rowValue: string) => {
        setComplaintsRows(prev => prev.filter(r => r.value !== rowValue));
        // Also uncheck from selector
        setSelectedComplaints(prev => prev.filter(v => v !== rowValue));
    };

    // Handle document uploads
    const handleDocumentUpload = async (files: File[], patientId: string, doctorId: string, clinicId: string, patientVisitNo: number) => {
        if (files.length === 0) return [];

        setIsUploadingDocuments(true);
        setDocumentUploadResults([]);

        try {
            console.log('=== UPLOADING DOCUMENTS ===');
            console.log('Files to upload:', files.map(f => f.name));
            console.log('Patient ID:', patientId);
            console.log('Doctor ID:', doctorId);
            console.log('Clinic ID:', clinicId);
            console.log('Visit No:', patientVisitNo);

            // Use the new backend API method for multiple file upload
            const result = await DocumentService.uploadMultipleDocumentsToBackend(
                files,
                patientId,
                doctorId,
                clinicId,
                patientVisitNo,
                'recep', // You may want to get this from auth context
                new Date().toISOString().slice(0, 19).replace('T', ' ')
            );

            console.log('Document upload result:', result);

            // Handle the response based on the backend API structure
            if (result.success) {
                // If successful, create a success result for each file
                const successResults = files.map((file, index) => ({
                    success: true,
                    documentName: file.name,
                    documentId: result.documentIds?.[index] || null,
                    message: 'Uploaded successfully'
                }));

                setDocumentUploadResults(successResults);
                return successResults;
            } else {
                // If failed, create error results for each file
                const errorResults = files.map(file => ({
                    success: false,
                    documentName: file.name,
                    error: result.error || 'Upload failed'
                }));

                setDocumentUploadResults(errorResults);
                return errorResults;
            }
        } catch (error) {
            console.error('Error uploading documents:', error);
            // Create error results for each file
            const errorResults = files.map(file => ({
                success: false,
                documentName: file.name,
                error: error instanceof Error ? error.message : 'Upload failed'
            }));

            setDocumentUploadResults(errorResults);
            return errorResults;
        } finally {
            setIsUploadingDocuments(false);
        }
    };

    // Load existing documents for the patient visit
    const loadExistingDocuments = async (patientId: string, visitNo: number) => {
        if (!patientId || !visitNo) return;

        setIsLoadingDocuments(true);
        try {
            console.log('=== LOADING EXISTING DOCUMENTS ===');
            console.log('Patient ID:', patientId);
            console.log('Visit No:', visitNo);

            const result = await DocumentService.getDocumentsByVisit(patientId, visitNo);
            console.log('Existing documents result:', result);

            if (result.success && result.documents) {
                setExistingDocuments(result.documents);
                console.log('Loaded existing documents:', result.documents);
            } else {
                console.log('No existing documents found or error:', result.error);
                setExistingDocuments([]);
            }
        } catch (error) {
            console.error('Error loading existing documents:', error);
            setExistingDocuments([]);
        } finally {
            setIsLoadingDocuments(false);
        }
    };

    // Test function to debug document deletion
    const testDocumentDeletion = async (documentId: number) => {
        console.log('=== TESTING DOCUMENT DELETION ===');
        console.log('Testing with document ID:', documentId);

        try {
            // Test the API call directly
            const response = await fetch(`http://localhost:8080/api/patient-documents/treatment/${documentId}/with-file?userId=recep`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log('Test response status:', response.status);
            const responseData = await response.json();
            console.log('Test response data:', responseData);

            return responseData;
        } catch (error) {
            console.error('Test deletion error:', error);
            throw error;
        }
    };

    // Keep joined complaints in formData for API compatibility
    React.useEffect(() => {
        setFormData(prev => ({ ...prev, selectedComplaint: selectedComplaints.join(',') }));
    }, [selectedComplaints]);

    // Load session data when Quick Registration modal opens
    React.useEffect(() => {
        if (showQuickRegistration && !sessionDataForQuickReg) {
            const loadSessionData = async () => {
                try {
                    const sessionResult = await sessionService.getSessionInfo();
                    if (sessionResult.success && sessionResult.data) {
                        setSessionDataForQuickReg(sessionResult.data);
                    }
                } catch (error) {
                    console.error('Error getting session data for Quick Registration:', error);
                }
            };
            loadSessionData();
        }
    }, [showQuickRegistration, sessionDataForQuickReg]);

    // Load clinicId from patientData or session when dialog opens
    React.useEffect(() => {
        if (open) {
            const loadClinicId = async () => {
                try {
                    // First try to get from patientData
                    const clinicIdFromPatient = (patientData as any)?.clinicId;
                    if (clinicIdFromPatient) {
                        setCurrentClinicId(String(clinicIdFromPatient));
                        return;
                    }

                    // If not in patientData, try to get from session
                    const sessionResult = await sessionService.getSessionInfo();
                    if (sessionResult.success && sessionResult.data?.clinicId) {
                        setCurrentClinicId(String(sessionResult.data.clinicId));
                    }
                } catch (error) {
                    console.error('Error loading clinicId:', error);
                }
            };
            loadClinicId();
        }
    }, [open, patientData]);

    // Close complaints dropdown on outside click
    React.useEffect(() => {
        if (!isComplaintsOpen) return;
        function handleClickOutside(e: MouseEvent) {
            if (complaintsRef.current && !complaintsRef.current.contains(e.target as Node)) {
                setIsComplaintsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isComplaintsOpen]);

    // Load referral options from API
    React.useEffect(() => {
        let cancelled = false;
        async function loadReferBy() {
            try {
                const { getReferByTranslations } = await import('../services/referralService');
                const items = await getReferByTranslations(1);
                if (!cancelled) setReferByOptions(items);
            } catch (e) {
                console.error('Failed to load refer-by options', e);
            }
        }
        loadReferBy();
        return () => {
            cancelled = true;
        };
    }, []);

    // Load doctors list for provider name mapping
    React.useEffect(() => {
        let cancelled = false;
        async function loadDoctors() {
            if (!open) return;
            try {
                const doctors = await doctorService.getOpdDoctors();
                if (!cancelled) {
                    setAllDoctors(doctors);
                    console.log('Loaded doctors for provider name mapping:', doctors);
                }
            } catch (e) {
                console.error('Failed to load doctors', e);
            }
        }
        loadDoctors();
        return () => {
            cancelled = true;
        };
    }, [open]);

    // Format provider label (adds Dr. prefix if not present)
    const formatProviderLabel = (name?: string): string => {
        const raw = String(name || '').trim();
        if (!raw) return '';
        const cleaned = raw.replace(/\s+/g, ' ').trim();
        const lower = cleaned.toLowerCase();
        if (lower.startsWith('dr.') || lower.startsWith('dr ')) return cleaned;
        return `Dr. ${cleaned}`;
    };

    // Map doctorId to display label (Dr. Name)
    const getDoctorLabelById = (id?: string | number): string => {
        if (!id) return '';
        const idStr = String(id);
        const doc = allDoctors.find(d => d.id === idStr);
        return doc ? formatProviderLabel(doc.name) : '';
    };

    // Get doctor display name from patientData
    const doctorDisplayName = React.useMemo(() => {
        // First try to get doctor name from provider field (which might be ID or name)
        const providerValue = patientData?.provider;
        if (providerValue) {
            // Check if it's already a name (contains letters/spaces) or an ID (like DR-00A10)
            const isLikelyId = /^DR-/.test(String(providerValue).toUpperCase());

            if (isLikelyId) {
                // It's an ID, try to get name from doctors list
                const doctorName = getDoctorLabelById(providerValue);
                if (doctorName) return doctorName;
            } else {
                // It's already a name, format it
                return formatProviderLabel(providerValue);
            }
        }

        // Fallback: try doctorId field
        const doctorId = (patientData as any)?.doctorId;
        if (doctorId) {
            const doctorName = getDoctorLabelById(doctorId);
            if (doctorName) return doctorName;
        }

        // Final fallback
        return providerValue || 'N/A';
    }, [patientData?.provider, (patientData as any)?.doctorId, allDoctors]);

    // Determine In-Person checkbox state based on status
    // Check statusPending first (if status was changed but not saved), then fall back to status
    const inPersonChecked = React.useMemo(() => {
        const currentStatus = (patientData as any)?.statusPending || patientData?.status;
        if (!currentStatus) return true; // Default to true if no status
        const status = String(currentStatus).trim().toUpperCase();
        const normalizedStatus = status === 'ON CALL' ? 'CONSULT ON CALL' : status;
        // If status is "CONSULT ON CALL" or other non-in-person statuses, set to false
        if (normalizedStatus === 'CONSULT ON CALL' || (normalizedStatus !== 'WAITING' && normalizedStatus !== 'WITH DOCTOR')) {
            return false;
        }
        return true; // Default to true for WAITING or WITH DOCTOR
    }, [patientData?.status, (patientData as any)?.statusPending]);

    // Load complaints from API when dialog opens
    React.useEffect(() => {
        let cancelled = false;
        async function loadComplaints() {
            if (!open) return;

            const doctorId = patientData?.provider || sessionDataForQuickReg?.doctorId;
            const clinicId = patientData?.clinicId || sessionDataForQuickReg?.clinicId;
            if (!doctorId || !clinicId) return;

            setComplaintsLoading(true);
            setComplaintsError(null);

            try {
                console.log('Loading complaints for doctor:', doctorId, 'clinic:', clinicId);

                const complaints = await complaintService.getAllComplaintsForDoctor(String(doctorId), String(clinicId));
                if (!cancelled) {
                    setComplaintsOptions(complaints);
                    console.log('Loaded complaints:', complaints);
                }
            } catch (e) {
                console.error('Failed to load complaints:', e);
                if (!cancelled) {
                    setComplaintsError(e instanceof Error ? e.message : 'Failed to load complaints');
                }
            } finally {
                if (!cancelled) {
                    setComplaintsLoading(false);
                }
            }
        }

        loadComplaints();
        return () => {
            cancelled = true;
        };
    }, [open, patientData?.provider, patientData?.clinicId, sessionDataForQuickReg?.doctorId, sessionDataForQuickReg?.clinicId]);

    // When complaints options are loaded, hydrate selections from API-provided complaints
    React.useEffect(() => {
        if (!open) return;
        if (!initialComplaintsFromApi) return;
        if (!complaintsOptions || complaintsOptions.length === 0) return;

        // If user already selected something or rows exist, do not override
        if (selectedComplaints.length > 0 || complaintsRows.length > 0) return;

        const raw = initialComplaintsFromApi.trim();
        if (!raw) return;

        // Support both '*' and ',' delimiters
        const parts = raw.split(/\*|,/).map(s => s.trim()).filter(Boolean);
        if (parts.length === 0) return;

        const foundValues: string[] = [];
        const foundRows: ComplaintRow[] = [];
        const seen = new Set<string>();
        parts.forEach(token => {
            // Try to match by value first, then by label (case-insensitive)
            const byValue = complaintsOptions.find(o => (o.value || '').toLowerCase() === token.toLowerCase());
            const byLabel = byValue ? undefined : complaintsOptions.find(o => (o.label || '').toLowerCase() === token.toLowerCase());
            const match = byValue || byLabel;
            if (match && !seen.has(match.value)) {
                seen.add(match.value);
                foundValues.push(match.value);
                foundRows.push({ id: `${match.value}`, value: match.value, label: match.label, comment: '' });
            }
        });

        if (foundValues.length > 0) {
            setSelectedComplaints(foundValues);
            setComplaintsRows(foundRows);
        }
    }, [open, initialComplaintsFromApi, complaintsOptions]);

    // Load referral doctors when referral type is "Doctor"
    React.useEffect(() => {
        let cancelled = false;
        async function loadReferralDoctors() {
            if (isDoctorReferral()) {
                try {
                    const { getReferralDoctors } = await import('../services/referralService');
                    const doctors = await getReferralDoctors(1); // languageId = 1

                    console.log('=== LOADING REFERRAL DOCTORS ON MOUNT ===');
                    console.log('All referral doctors:', doctors);
                    console.log('=== END LOADING REFERRAL DOCTORS ON MOUNT ===');
                } catch (e) {
                    console.error('Failed to load referral doctors', e);
                }
            }
        }
        loadReferralDoctors();
        return () => {
            cancelled = true;
        };
    }, [formData.referralBy]);

    // Load appointment details when dialog opens and patient data is available
    React.useEffect(() => {
        let cancelled = false;
        async function loadAppointmentDetails() {
            try {
                if (!open || !patientData?.patientId) return;

                setIsLoadingAppointmentDetails(true);
                setError(null); // Clear any previous errors
                console.log('=== LOADING APPOINTMENT DETAILS ===');
                console.log('Patient data:', patientData);

                // Use actual appointment data instead of hardcoded values
                // Try to get session data as fallback
                let sessionData = null;
                try {
                    const sessionResult = await sessionService.getSessionInfo();
                    if (sessionResult.success) {
                        sessionData = sessionResult.data;
                    }
                } catch (sessionError) {
                    console.warn('Could not load session data:', sessionError);
                }

                const appointmentParams = {
                    patientId: String(patientData.patientId),
                    doctorId: String((patientData as any).doctorId || sessionData?.doctorId || 'DR-00010'), // Use actual doctor ID from appointment or session
                    shiftId: Number((patientData as any).shiftId || (sessionData as any)?.shiftId || 1), // Use actual shift ID from appointment or session
                    clinicId: String((patientData as any).clinicId || sessionData?.clinicId || 'CL-00001'), // Use actual clinic ID from appointment or session
                    patientVisitNo: Number((patientData as any).visitNumber || 1), // Use actual visit number from appointment
                    languageId: 1
                };

                console.log('Appointment params:', appointmentParams);

                const result: any = await visitService.getAppointmentDetails(appointmentParams);
                if (cancelled) return;

                console.log('=== APPOINTMENT DETAILS RESPONSE ===');
                console.log('Full response:', result);

                if (!result || !result.found || !result.mainData || result.mainData.length === 0) {
                    console.log('No appointment details found, using empty form');
                    setIsLoadingAppointmentDetails(false);
                    return;
                }

                // Use the first item from mainData array as requested
                const appointmentData = result.mainData[0];
                console.log('Using appointment data (first item):', appointmentData);

                // Capture complaints string (supports both keys)
                const complaintsFromApi: string = (appointmentData.currentComplaints || appointmentData.currentComplaint || '') as string;
                setInitialComplaintsFromApi(complaintsFromApi);

                // Map appointment data to form fields
                // Note: previousVisitPlan and chiefComplaint should come from previous visit, not current appointment
                const normalized = {
                    referByRaw: appointmentData.referBy ?? '',
                    referralName: appointmentData.referralName ?? '',
                    // Check for correct field names first, then fallback to alternative names
                    // Backend might return doctorMobile/doctorEmail/doctorAddress or referralContact/referralEmail/referralAddress
                    referralContact: appointmentData.referralContact ?? appointmentData.doctorMobile ?? '',
                    referralEmail: appointmentData.referralEmail ?? appointmentData.doctorEmail ?? '',
                    referralAddress: appointmentData.referralAddress ?? appointmentData.doctorAddress ?? '',
                    pulse: appointmentData.pulse ?? '',
                    height: appointmentData.heightInCms ?? '',
                    weight: appointmentData.weightInKgs ?? '',
                    bp: appointmentData.bloodPressure ?? '',
                    sugar: appointmentData.sugar ?? '',
                    tft: appointmentData.tft ?? '',
                    pastSurgicalHistory: appointmentData.surgicalHistory ?? '',
                    // previousVisitPlan and chiefComplaint will be loaded from previous visit separately
                    visitComments: appointmentData.visitComments ?? '',
                    currentMedicines: appointmentData.currentMedicines ?? '',
                    inPerson: appointmentData.inPerson ?? undefined,
                    followUpFlag: appointmentData.followUpFlag ?? undefined,
                    followUpType: appointmentData.followUp ?? undefined
                } as any;

                console.log('Normalized appointment data:', normalized);
                console.log('=== REFERRAL FIELDS DEBUG ===');
                console.log('Raw appointmentData.referralContact:', appointmentData.referralContact);
                console.log('Raw appointmentData.doctorMobile:', appointmentData.doctorMobile);
                console.log('Raw appointmentData.referralEmail:', appointmentData.referralEmail);
                console.log('Raw appointmentData.doctorEmail:', appointmentData.doctorEmail);
                console.log('Raw appointmentData.referralAddress:', appointmentData.referralAddress);
                console.log('Raw appointmentData.doctorAddress:', appointmentData.doctorAddress);
                console.log('Normalized referralContact:', normalized.referralContact);
                console.log('Normalized referralEmail:', normalized.referralEmail);
                console.log('Normalized referralAddress:', normalized.referralAddress);
                console.log('Normalized referralName:', normalized.referralName);
                console.log('=== END REFERRAL FIELDS DEBUG ===');

                // Patch form fields with appointment data
                setFormData(prev => {
                    const patched = { ...prev } as any;
                    const maybeSet = (key: keyof typeof patched, value: any) => {
                        if (value === undefined || value === null || value === '') return;
                        if (patched[key] === '' || patched[key] === undefined || patched[key] === null) {
                            patched[key] = String(value);
                        }
                    };
                    const alwaysSet = (key: keyof typeof patched, value: any) => {
                        if (value !== undefined && value !== null && value !== '') {
                            patched[key] = String(value);
                        }
                    };

                    // Set referralBy based on appointment data and available options
                    if (normalized.referByRaw) {
                        const referIdStr = String(normalized.referByRaw);
                        const matchExists = referByOptions.some(o => String(o.id) === referIdStr);
                        patched.referralBy = matchExists ? referIdStr : 'Self';
                    } else if (!patched.referralBy) {
                        patched.referralBy = 'Self';
                    }

                    // Patch referral name and contact fields from API if it's a doctor referral
                    // Always set these from API when available (they were saved when doctor was selected)
                    if (patched.referralBy === 'D' || normalized.referByRaw === 'D') {
                        // If it's a doctor referral, always load all referral details from API
                        alwaysSet('referralName', normalized.referralName);
                        // Only set contact/email/address if they are different from referral name
                        // (Backend bug: sometimes returns doctor name in these fields instead of actual values)
                        if (normalized.referralContact && normalized.referralContact.trim() !== '' &&
                            normalized.referralContact.trim() !== normalized.referralName.trim()) {
                            alwaysSet('referralContact', normalized.referralContact);
                        }
                        if (normalized.referralEmail && normalized.referralEmail.trim() !== '' &&
                            normalized.referralEmail.trim() !== normalized.referralName.trim()) {
                            alwaysSet('referralEmail', normalized.referralEmail);
                        }
                        if (normalized.referralAddress && normalized.referralAddress.trim() !== '' &&
                            normalized.referralAddress.trim() !== normalized.referralName.trim()) {
                            alwaysSet('referralAddress', normalized.referralAddress);
                        }
                    } else {
                        // For non-doctor referrals, use maybeSet to avoid overwriting user input
                        maybeSet('referralName', normalized.referralName);
                        maybeSet('referralContact', normalized.referralContact);
                        maybeSet('referralEmail', normalized.referralEmail);
                        maybeSet('referralAddress', normalized.referralAddress);
                    }
                    maybeSet('pulse', normalized.pulse);
                    maybeSet('height', normalized.height);
                    maybeSet('weight', normalized.weight);
                    maybeSet('bp', normalized.bp);
                    maybeSet('sugar', normalized.sugar);
                    maybeSet('tft', normalized.tft);
                    maybeSet('pastSurgicalHistory', normalized.pastSurgicalHistory);
                    // previousVisitPlan and chiefComplaint will be loaded from previous visit separately
                    maybeSet('visitComments', normalized.visitComments);
                    maybeSet('currentMedicines', normalized.currentMedicines);

                    // Derive BMI if height/weight became available
                    const heightNum = parseFloat(patched.height);
                    const weightNum = parseFloat(patched.weight);
                    if (!isNaN(heightNum) && heightNum > 0 && !isNaN(weightNum) && weightNum > 0) {
                        patched.bmi = (weightNum / ((heightNum / 100) * (heightNum / 100))).toFixed(1);
                    }

                    console.log('Updated form data with appointment details:', patched);
                    return patched;
                });

                // Patch visit type if provided (but followUp will be set based on last visit check later)
                setVisitType(prev => {
                    const next = { ...prev };
                    next.inPerson = true; // Always true, cannot be changed
                    // Don't set followUp here - it will be set based on last visit existence
                    // Only set followUpType if it's provided, but it will be overridden by last visit check
                    if (normalized.followUpType && typeof normalized.followUpType === 'string') next.followUpType = normalized.followUpType;
                    console.log('Updated visit type:', next);
                    return next;
                });

                console.log('=== APPOINTMENT DETAILS LOADED SUCCESSFULLY ===');

                // Load existing documents for this patient visit using the correct visit number
                if (patientData?.patientId) {
                    const visitNoToLoad = Number(patientData.visitNumber || appointmentData?.patientVisitNo || 1);
                    await loadExistingDocuments(String(patientData.patientId), visitNoToLoad);
                }

            } catch (e) {
                console.error('Failed to load appointment details:', e);
                // Fall back to loading last visit details if appointment details fail
                console.log('Falling back to last visit details...');
                try {
                    if (!cancelled && patientData?.patientId) {
                        const pid = String(patientData.patientId);
                        const result: any = await visitService.getLastVisitDetails(pid);
                        if (cancelled) return;

                        if (!result) return;
                        const payload = result.data || result.lastVisit || result.visit || result.payload || result;
                        if (!payload) return;

                        // Capture complaints string from fallback payload as well
                        const complaintsFromApi: string = (payload.currentComplaints || payload.currentComplaint || '') as string;
                        setInitialComplaintsFromApi(complaintsFromApi);

                        // Attempt to normalize keys from payload
                        const normalized = {
                            referByRaw: payload.referBy ?? payload.referralBy ?? '',
                            referralName: payload.referralName ?? '',
                            // Check for correct field names first, then fallback to alternative names
                            // Backend might return doctorMobile/doctorEmail/doctorAddress or referralContact/referralEmail/referralAddress
                            referralContact: payload.referralContact ?? payload.doctorMobile ?? '',
                            referralEmail: payload.referralEmail ?? payload.doctorEmail ?? '',
                            referralAddress: payload.referralAddress ?? payload.doctorAddress ?? '',
                            pulse: payload.pulse ?? payload.pulsePerMin ?? '',
                            height: payload.heightInCms ?? payload.height ?? '',
                            weight: payload.weightInKgs ?? payload.weight ?? '',
                            bp: payload.bloodPressure ?? payload.bp ?? '',
                            sugar: payload.sugar ?? '',
                            tft: payload.tft ?? '',
                            pastSurgicalHistory: payload.pastSurgicalHistory ?? payload.surgicalHistory ?? '',
                            previousVisitPlan: payload.previousVisitPlan ?? payload.plan ?? '',
                            chiefComplaint: payload.chiefComplaint ?? payload.currentComplaint ?? '',
                            visitComments: payload.visitComments ?? payload.visitCommentsField ?? '',
                            currentMedicines: payload.currentMedicines ?? '',
                            inPerson: payload.inPerson ?? undefined,
                            followUpFlag: payload.followUpFlag ?? payload.followUp ?? undefined,
                            followUpType: payload.followUpType ?? payload.followUp ?? undefined
                        } as any;

                        // Patch form fields only if currently empty
                        setFormData(prev => {
                            const patched = { ...prev } as any;
                            const maybeSet = (key: keyof typeof patched, value: any) => {
                                if (value === undefined || value === null || value === '') return;
                                if (patched[key] === '' || patched[key] === undefined || patched[key] === null) {
                                    patched[key] = String(value);
                                }
                            };
                            const alwaysSet = (key: keyof typeof patched, value: any) => {
                                if (value !== undefined && value !== null && value !== '') {
                                    patched[key] = String(value);
                                }
                            };
                            // Set referralBy based on payload and available options, default to 'Self'
                            if (normalized.referByRaw) {
                                const referIdStr = String(normalized.referByRaw);
                                const matchExists = referByOptions.some(o => String(o.id) === referIdStr);
                                patched.referralBy = matchExists ? referIdStr : 'Self';
                            } else if (!patched.referralBy) {
                                patched.referralBy = 'Self';
                            }
                            // Patch referral name and contact fields from API if it's a doctor referral
                            // Always set these from API when available (they were saved when doctor was selected)
                            if (patched.referralBy === 'D' || normalized.referByRaw === 'D') {
                                // If it's a doctor referral, always load all referral details from API
                                alwaysSet('referralName', normalized.referralName);
                                // Only set contact/email/address if they are different from referral name
                                // (Backend bug: sometimes returns doctor name in these fields instead of actual values)
                                if (normalized.referralContact && normalized.referralContact.trim() !== '' &&
                                    normalized.referralContact.trim() !== normalized.referralName.trim()) {
                                    alwaysSet('referralContact', normalized.referralContact);
                                }
                                if (normalized.referralEmail && normalized.referralEmail.trim() !== '' &&
                                    normalized.referralEmail.trim() !== normalized.referralName.trim()) {
                                    alwaysSet('referralEmail', normalized.referralEmail);
                                }
                                if (normalized.referralAddress && normalized.referralAddress.trim() !== '' &&
                                    normalized.referralAddress.trim() !== normalized.referralName.trim()) {
                                    alwaysSet('referralAddress', normalized.referralAddress);
                                }
                            } else {
                                // For non-doctor referrals, use maybeSet to avoid overwriting user input
                                maybeSet('referralName', normalized.referralName);
                            }
                            maybeSet('pulse', normalized.pulse);
                            maybeSet('height', normalized.height);
                            maybeSet('weight', normalized.weight);
                            maybeSet('bp', normalized.bp);
                            maybeSet('sugar', normalized.sugar);
                            maybeSet('tft', normalized.tft);
                            maybeSet('pastSurgicalHistory', normalized.pastSurgicalHistory);
                            maybeSet('previousVisitPlan', normalized.previousVisitPlan);
                            maybeSet('chiefComplaint', normalized.chiefComplaint);
                            maybeSet('visitComments', normalized.visitComments);
                            maybeSet('currentMedicines', normalized.currentMedicines);

                            // Derive BMI if height/weight became available
                            const heightNum = parseFloat(patched.height);
                            const weightNum = parseFloat(patched.weight);
                            if (!isNaN(heightNum) && heightNum > 0 && !isNaN(weightNum) && weightNum > 0) {
                                patched.bmi = (weightNum / ((heightNum / 100) * (heightNum / 100))).toFixed(1);
                            }
                            return patched;
                        });

                        // Patch visit type if provided (but followUp will be set based on last visit check later)
                        setVisitType(prev => {
                            const next = { ...prev };
                            next.inPerson = true; // Always true, cannot be changed
                            // Don't set followUp here - it will be set based on last visit existence
                            // Only set followUpType if it's provided, but it will be overridden by last visit check
                            if (normalized.followUpType && typeof normalized.followUpType === 'string') next.followUpType = normalized.followUpType;
                            return next;
                        });
                    }
                } catch (fallbackError) {
                    console.error('Failed to load last visit details as fallback:', fallbackError);
                }
            }

            // Always load previous visit data for "Previous Visit Plan" and "Chief complaint entered by patient"
            // These fields should come from the last visit, not the current appointment
            try {
                if (!cancelled && patientData?.patientId) {
                    console.log('=== LOADING PREVIOUS VISIT DATA FOR PLAN AND COMPLAINT ===');
                    const pid = String(patientData.patientId);
                    let lastVisitResult: any = null;
                    try {
                        lastVisitResult = await visitService.getLastVisitDetails(pid);
                    } catch (lastVisitError: any) {
                        // If API returns 404 or "not found" error, there's no last visit
                        if (lastVisitError?.response?.status === 404 ||
                            lastVisitError?.message?.includes('not found') ||
                            lastVisitError?.message?.includes('Last visit details not found')) {
                            console.log('No last visit found (404 or not found error)');
                            lastVisitResult = null;
                        } else {
                            // Re-throw other errors
                            throw lastVisitError;
                        }
                    }
                    if (cancelled) return;

                    if (lastVisitResult) {
                        // Try multiple possible response structures
                        const lastVisitPayload = lastVisitResult.data
                            || lastVisitResult.lastVisit
                            || lastVisitResult.visit
                            || lastVisitResult.payload
                            || (lastVisitResult as any).mainData?.[0]  // Check if it's in mainData array
                            || lastVisitResult;

                        // Check if lastVisitPayload actually contains valid visit data
                        // A valid last visit should have at least one of these key fields: patientId, visitDate, patientVisitNo
                        const hasValidLastVisit = lastVisitPayload && (
                            lastVisitPayload.patientId ||
                            lastVisitPayload.visitDate ||
                            lastVisitPayload.patientVisitNo ||
                            lastVisitPayload.visit_date ||
                            lastVisitPayload.patient_visit_no ||
                            (lastVisitResult as any)?.found === true ||
                            (lastVisitResult as any)?.success === true
                        );

                        if (hasValidLastVisit) {
                            console.log('=== PREVIOUS VISIT DATA DEBUG ===');
                            console.log('Full lastVisitResult:', JSON.stringify(lastVisitResult, null, 2));
                            console.log('Extracted lastVisitPayload:', lastVisitPayload);
                            console.log('All keys in lastVisitPayload:', Object.keys(lastVisitPayload));

                            // Log all possible plan-related fields
                            console.log('plan:', lastVisitPayload.plan);
                            console.log('previousVisitPlan:', lastVisitPayload.previousVisitPlan);
                            console.log('treatmentPlan:', (lastVisitPayload as any).treatmentPlan);
                            console.log('instructions:', (lastVisitPayload as any).instructions);
                            console.log('advice:', (lastVisitPayload as any).advice);
                            console.log('followUp:', lastVisitPayload.followUp);
                            console.log('followUpComment:', (lastVisitPayload as any).followUpComment);

                            // Extract plan from previous visit - check multiple possible field names
                            const previousPlan = lastVisitPayload.plan
                                || lastVisitPayload.previousVisitPlan
                                || (lastVisitPayload as any).treatmentPlan
                                || (lastVisitPayload as any).instructions
                                || (lastVisitPayload as any).advice
                                || lastVisitPayload.followUp
                                || (lastVisitPayload as any).followUpComment
                                || (lastVisitPayload as any).Plan
                                || (lastVisitPayload as any).PLAN
                                || '';

                            // Extract chief complaint from previous visit
                            const previousComplaint = lastVisitPayload.currentComplaint
                                || lastVisitPayload.chiefComplaint
                                || '';

                            console.log('Previous Visit Plan (extracted):', previousPlan);
                            console.log('Previous Visit Plan (stringified):', previousPlan ? String(previousPlan).trim() : '(empty)');
                            console.log('Previous Chief Complaint:', previousComplaint);
                            console.log('=== END PREVIOUS VISIT DATA DEBUG ===');

                            // Update only these two fields from previous visit
                            // Only update if we found a non-empty value
                            const planValue = previousPlan ? String(previousPlan).trim() : '';
                            const complaintValue = previousComplaint ? String(previousComplaint).trim() : '';

                            setFormData(prev => {
                                const updated = {
                                    ...prev,
                                    ...(planValue && { previousVisitPlan: planValue }),
                                    ...(complaintValue && { chiefComplaint: complaintValue })
                                };
                                console.log('Updating form data - previousVisitPlan:', planValue || '(keeping existing)');
                                console.log('Updating form data - chiefComplaint:', complaintValue || '(keeping existing)');
                                return updated;
                            });

                            // If there's a valid last visit, set followUp to true and followUpType to "Follow-up"
                            setVisitType(prev => ({
                                ...prev,
                                followUp: true,
                                followUpType: 'Follow-up'
                            }));
                            console.log('Valid last visit exists - Setting followUp to true and followUpType to "Follow-up"');
                        } else {
                            console.warn('No valid last visit found - lastVisitPayload is empty or missing key fields');
                            // No valid last visit - set followUp to false and followUpType to "New"
                            setVisitType(prev => ({
                                ...prev,
                                followUp: false,
                                followUpType: 'New'
                            }));
                            console.log('No valid last visit - Setting followUp to false and followUpType to "New"');
                        }
                    } else {
                        console.warn('lastVisitResult is null or undefined');
                        // No last visit result - set followUp to false and followUpType to "New"
                        setVisitType(prev => ({
                            ...prev,
                            followUp: false,
                            followUpType: 'New'
                        }));
                        console.log('No last visit result - Setting followUp to false and followUpType to "New"');
                    }
                }
            } catch (previousVisitError) {
                console.error('Failed to load previous visit data for plan and complaint:', previousVisitError);
                // Don't throw - this is not critical, just log the error
            } finally {
                if (!cancelled) {
                    setIsLoadingAppointmentDetails(false);
                }
            }
        }
        loadAppointmentDetails();
        return () => { cancelled = true; };
    }, [open, patientData?.patientId, referByOptions]);

    // Sync referralNameSearch with formData.referralName when data is loaded
    React.useEffect(() => {
        if (formData.referralName && formData.referralName.trim() !== '' && referralNameSearch !== formData.referralName) {
            setReferralNameSearch(formData.referralName);
        }
    }, [formData.referralName]);

    // Auto-match referralName from saved data with referral doctors and patch fields
    React.useEffect(() => {
        let cancelled = false;
        async function tryAutofillDoctorFromReferralName() {
            if (!open) return;
            const name = (formData.referralName || '').trim();
            if (!name) return;
            // Only auto-match if referralBy is 'D' (Doctor) or if we have referral contact details
            const isDoctorReferral = formData.referralBy === 'D';
            const hasReferralDetails = formData.referralContact || formData.referralEmail || formData.referralAddress;

            // If it's not a doctor referral and we don't have details, skip
            if (!isDoctorReferral && !hasReferralDetails) return;

            // If selectedDoctor is already set, don't re-run
            if (selectedDoctor !== null) return;

            try {
                const { getReferralDoctors } = await import('../services/referralService');
                const doctors = await getReferralDoctors(1);
                const match = doctors.find(d => (d.doctorName || '').trim().toLowerCase() === name.toLowerCase());
                if (!cancelled && match) {
                    setSelectedDoctor(match as any);
                    setFormData(prev => ({
                        ...prev,
                        referralBy: 'D', // Ensure it's set to 'D'
                        referralName: match.doctorName || prev.referralName,
                        // Use saved values from API if they exist, otherwise use doctor's default values
                        referralContact: prev.referralContact || match.doctorMob || '',
                        referralEmail: prev.referralEmail || (match as any).doctorMail || match.doctorEmail || '',
                        referralAddress: prev.referralAddress || (match as any).doctorAddress || match.doctorAddress || ''
                    }));
                    setReferralNameSearch(match.doctorName || name);
                } else if (!cancelled && isDoctorReferral && hasReferralDetails) {
                    // If we have a doctor referral with details but no match found, 
                    // still set selectedDoctor to indicate it's a doctor (even if not in the list)
                    // This allows the fields to remain populated from saved data and shows regular text field
                    setSelectedDoctor({
                        doctorName: name,
                        doctorMob: formData.referralContact,
                        doctorMail: formData.referralEmail,
                        doctorAddress: formData.referralAddress
                    } as any);
                    setReferralNameSearch(name);
                }
            } catch (e) {
                console.error('Failed to auto-match referralName to doctor', e);
            }
        }
        tryAutofillDoctorFromReferralName();
        return () => { cancelled = true; };
    }, [open, formData.referralName, formData.referralBy, formData.referralContact, formData.referralEmail, formData.referralAddress]);

    if (!open || !patientData) return null;

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };

            // Calculate BMI when height or weight changes
            if (field === 'height' || field === 'weight') {
                const height = field === 'height' ? parseFloat(value) : parseFloat(prev.height);
                const weight = field === 'weight' ? parseFloat(value) : parseFloat(prev.weight);

                if (height > 0 && weight > 0) {
                    const bmi = (weight / ((height / 100) * (height / 100))).toFixed(1);
                    newData.bmi = bmi;
                } else {
                    newData.bmi = '';
                }
            }

            // Reset referral name search when referral type changes
            if (field === 'referralBy') {
                // Clear referral details
                newData.referralName = '';
                newData.referralContact = '';
                newData.referralEmail = '';
                newData.referralAddress = '';

                // Clear selected doctor state
                setSelectedDoctor(null);
                setReferralNameSearch('');
                setReferralNameOptions([]);
            }

            // Handle alphabets-only input for referralName
            if (field === 'referralName') {
                newData[field] = value.replace(/[^a-zA-Z\s]/g, '');
            }

            return newData;
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = Array.from(e.target.files || []);
        if (newFiles.length === 0) return;

        const maxFiles = 3;
        const maxSizeMB = 150;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'xls', 'xlsx', 'doc', 'docx'];

        const currentTotalCount = (formData.attachments?.length || 0) + (existingDocuments?.length || 0);

        // Check file extensions first
        const invalidFiles = newFiles.filter(file => {
            const ext = file.name.split('.').pop()?.toLowerCase();
            return !ext || !allowedExtensions.includes(ext);
        });

        if (invalidFiles.length > 0) {
            setSnackbarSeverity('error');
            setSnackbarMessage(`Invalid file format. Allowed: Image, PDF, Excel, DOC.`);
            setSnackbarOpen(true);
            if (e.target) e.target.value = '';
            return;
        }

        if (currentTotalCount + newFiles.length > maxFiles) {
            setSnackbarSeverity('error');
            setSnackbarMessage(`Total files (uploaded + existing) cannot exceed ${maxFiles}.`);
            setSnackbarOpen(true);
            if (e.target) e.target.value = '';
            return;
        }

        const attachedSize = (formData.attachments || []).reduce((sum, f) => sum + f.size, 0);
        const existingSize = (existingDocuments || []).reduce((sum, doc) => sum + (doc.fileSize || 0), 0);
        const newFilesSize = newFiles.reduce((sum, f) => sum + f.size, 0);

        console.log('=== ATTACHMENT SIZE VALIDATION ===');
        console.log('Current selection size (bytes):', attachedSize);
        console.log('Existing documents size (bytes):', existingSize);
        console.log('New files picking (bytes):', newFilesSize);
        console.log('Total intended size (bytes):', attachedSize + existingSize + newFilesSize);
        console.log('Limit (bytes):', maxSizeBytes);

        if (attachedSize + existingSize + newFilesSize > maxSizeBytes) {
            console.error('TOTAL SIZE EXCEEDED: Limit is 150MB');
            setSnackbarSeverity('error');
            setSnackbarMessage(`Total file size (including existing) exceeds the ${maxSizeMB}MB limit.`);
            setSnackbarOpen(true);
            if (e.target) e.target.value = '';
            return;
        }

        setFormData(prev => ({
            ...prev,
            attachments: [...(prev.attachments || []), ...newFiles]
        }));

        if (e.target) e.target.value = '';
    };

    const removeFile = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, index) => index !== indexToRemove)
        }));
    };



    // Search referral names when typing
    const handleReferralNameSearch = async (searchTerm: string) => {
        // Allow only alphabets and spaces
        const cleanSearchTerm = searchTerm.replace(/[^a-zA-Z\s]/g, '');
        setReferralNameSearch(cleanSearchTerm);

        if (cleanSearchTerm.length < 2) {
            setReferralNameOptions([]);
            return;
        }

        setIsSearchingReferral(true);
        try {
            // Call the actual referral doctors API
            const { getReferralDoctors } = await import('../services/referralService');
            const doctors = await getReferralDoctors(1); // languageId = 1

            console.log('=== REFERRAL DOCTORS SEARCH DEBUG ===');
            console.log('Search term:', cleanSearchTerm);
            console.log('All doctors from API:', doctors);

            // Filter doctors by name containing the search term
            const filteredDoctors = doctors.filter(doctor =>
                doctor.doctorName.toLowerCase().includes(cleanSearchTerm.toLowerCase())
            );

            console.log('Filtered doctors:', filteredDoctors);

            // Deduplicate results by name (case-insensitive)
            const uniqueDoctorsMap = new Map();
            filteredDoctors.forEach(doctor => {
                const nameLower = doctor.doctorName.toLowerCase().trim();
                if (!uniqueDoctorsMap.has(nameLower)) {
                    uniqueDoctorsMap.set(nameLower, doctor);
                }
            });

            const uniqueDoctors = Array.from(uniqueDoctorsMap.values());

            // Store the full doctor data for later use
            setReferralNameOptions(uniqueDoctors.map(doctor => ({
                id: doctor.rdId.toString(),
                name: doctor.doctorName,
                fullData: doctor // Store the complete doctor object
            })));

            console.log('Mapped results for dropdown:', filteredDoctors.map(doctor => ({
                id: doctor.rdId.toString(),
                name: doctor.doctorName,
                fullData: doctor
            })));
            console.log('=== END REFERRAL DOCTORS SEARCH DEBUG ===');
        } catch (error) {
            console.error('Error searching referral names:', error);
            setReferralNameOptions([]);
        } finally {
            setIsSearchingReferral(false);
        }
    };

    // Check if current referral by is a doctor (specifically referId "D")
    const isDoctorReferral = () => {
        return formData.referralBy === 'D';
    };

    // Check if "Self" is selected in Referred By
    const isSelfReferral = () => {
        return formData.referralBy === 'Self' || formData.referralBy === 'S' || referByOptions.find(opt => opt.id === formData.referralBy)?.name === 'Self';
    };

    // Normalize a variety of input date formats to ISO yyyy-MM-dd for backend
    const toYyyyMmDd = (input?: string): string => {
        try {
            if (!input) return new Date().toISOString().slice(0, 10);
            // Try native parsing first
            const direct = new Date(input);
            if (!isNaN(direct.getTime())) return direct.toISOString().slice(0, 10);
            // Match common patterns: dd-MM-yyyy, dd-MMM-yy, dd-MMM-yyyy
            const m = input.match(/^(\d{1,2})-(\d{1,2}|[A-Za-z]{3})-(\d{2,4})$/);
            if (m) {
                const day = parseInt(m[1], 10);
                const monToken = m[2];
                let year = parseInt(m[3], 10);
                if (year < 100) year = 2000 + year; // two-digit year → 20xx
                const month = /^(\d{1,2})$/.test(monToken)
                    ? Math.max(0, Math.min(11, parseInt(monToken, 10) - 1))
                    : ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].indexOf(monToken.toLowerCase());
                if (month >= 0) {
                    const dt = new Date(Date.UTC(year, month, day));
                    return dt.toISOString().slice(0, 10);
                }
            }
        } catch { }
        return new Date().toISOString().slice(0, 10);
    };

    const handleSubmit = async () => {
        try {
            console.log('=== VISIT DETAILS FORM SUBMISSION STARTED ===');
            console.log('Form data:', formData);
            console.log('Visit type:', visitType);
            console.log('Patient data:', patientData);
            console.log('Original visitDate from patientData:', patientData?.visitDate);
            // Use today's date instead of patientData visitDate to avoid creating records with future dates
            const todayDate = new Date();
            const todayDateString = todayDate.toISOString().slice(0, 10) + 'T' + todayDate.toTimeString().slice(0, 8);
            console.log('Using today\'s date for visitDate:', todayDateString);

            setIsLoading(true);
            setError(null);
            setSuccess(null);
            setSnackbarSeverity('success'); // Reset to success by default

            // Fetch session data for dynamic values
            let sessionData = null;
            try {
                const sessionResult = await sessionService.getSessionInfo();
                if (sessionResult.success) {
                    sessionData = sessionResult.data;
                    console.log('Session data loaded:', sessionData);
                }
            } catch (sessionError) {
                console.warn('Could not load session data:', sessionError);
            }

            // Validate required fields are present
            const doctorId = (patientData as any)?.doctorId || sessionData?.doctorId;
            const clinicId = (patientData as any)?.clinicId || sessionData?.clinicId;
            // sessionData type may not declare shiftId, so access it via any
            const shiftId = (patientData as any)?.shiftId || (sessionData as any)?.shiftId;
            const userId = sessionData?.userId;

            if (!doctorId) {
                throw new Error('Doctor ID is required but not found in appointment data or session');
            }
            if (!clinicId) {
                throw new Error('Clinic ID is required but not found in appointment data or session');
            }
            if (!shiftId) {
                throw new Error('Shift ID is required but not found in appointment data or session');
            }
            if (!userId) {
                throw new Error('User ID is required but not found in session data');
            }

            // Validate patient visit number
            const patientVisitNo = (patientData as any)?.visitNumber;
            if (!patientVisitNo) {
                throw new Error('Patient Visit Number is required but not found in appointment data');
            }

            console.log('=== VALIDATION PASSED ===');
            console.log('Doctor ID:', doctorId);
            console.log('Clinic ID:', clinicId);
            console.log('Shift ID:', shiftId);
            console.log('User ID:', userId);
            console.log('Patient Visit No:', patientVisitNo);

            // Map form data to API request format
            const visitData: ComprehensiveVisitDataRequest = {
                // Required fields - using validated values
                patientId: patientData?.patientId?.toString() || '',
                doctorId: String(doctorId), // Use validated doctor ID
                clinicId: String(clinicId), // Use validated clinic ID
                shiftId: String(shiftId), // Use validated shift ID
                // Use today's date instead of patientData visitDate to avoid creating records with future dates
                visitDate: (() => {
                    const now = new Date();
                    return now.toISOString().slice(0, 10) + 'T' + now.toTimeString().slice(0, 8);
                })(),
                patientVisitNo: String(patientVisitNo), // Use validated visit number

                // Referral information
                referBy: (formData.referralBy === 'Self')
                    ? (referByOptions.find(o => o.name.toLowerCase() === 'self')?.id || 'Self')
                    : formData.referralBy,
                referralName: formData.referralBy === 'Self' ? 'Self' : formData.referralName,
                referralContact: formData.referralBy === 'Self' ? '' : formData.referralContact,
                referralEmail: formData.referralBy === 'Self' ? '' : formData.referralEmail,
                referralAddress: formData.referralBy === 'Self' ? '' : formData.referralAddress,

                // Vital signs
                pulse: parseFloat(formData.pulse) || 0,
                heightInCms: parseFloat(formData.height) || 0,
                weightInKgs: parseFloat(formData.weight) || 0,
                bloodPressure: formData.bp,
                sugar: formData.sugar,
                tft: formData.tft,

                // Medical history
                pastSurgicalHistory: formData.pastSurgicalHistory,
                previousVisitPlan: formData.previousVisitPlan,
                chiefComplaint: formData.chiefComplaint,
                visitComments: formData.visitComments,
                currentMedicines: formData.currentMedicines,

                // Medical conditions (set to false by default - you may want to add UI for these)
                hypertension: false,
                diabetes: false,
                cholestrol: false,
                ihd: false,
                th: false,
                asthama: false,
                smoking: false,
                tobaco: false,
                alchohol: false,

                // Additional fields
                habitDetails: '',
                allergyDetails: '',
                observation: '',
                inPerson: inPersonChecked, // Set based on status (false for ON CALL, true for WAITING/WITH DOCTOR)
                symptomComment: '',
                reason: '',
                impression: '',
                attendedBy: '',
                paymentById: 1,
                paymentRemark: '',
                attendedById: 0,
                followUp: visitType.followUpType,
                followUpFlag: visitType.followUp,
                currentComplaint: selectedComplaints.join(','),
                visitCommentsField: formData.visitComments,

                // Clinical fields
                tpr: '',
                importantFindings: '',
                additionalComments: '',
                systemic: '',
                odeama: '',
                pallor: '',
                gc: '',

                // Gynecological fields
                fmp: '',
                prmc: '',
                pamc: '',
                lmp: '',
                obstetricHistory: '',
                surgicalHistory: formData.pastSurgicalHistory,
                menstrualAddComments: '',
                followUpComment: '',
                followUpDate: new Date().toISOString().slice(0, 19),
                pregnant: false,
                edd: new Date().toISOString().slice(0, 19),
                followUpType: '',

                // Financial fields
                feesToCollect: 0,
                feesPaid: 0,
                discount: 0,
                originalDiscount: 0,

                // Status and user - Use appropriate status for submitted visit details
                statusId: 1, // WITH DOCTOR status for submitted visit details
                userId: String(userId), // Use validated user ID as string
                isSubmitPatientVisitDetails: true
            };

            console.log('=== SUBMITTING VISIT DATA TO API ===');
            console.log('=== CURRENT FORM DATA (ENTERED BY USER) ===');
            console.log('Form Data - Height:', formData.height);
            console.log('Form Data - Weight:', formData.weight);
            console.log('Form Data - BP:', formData.bp);
            console.log('Form Data - Sugar:', formData.sugar);
            console.log('Form Data - TFT:', formData.tft);
            console.log('Form Data - Pulse:', formData.pulse);
            console.log('Form Data - Past Surgical History:', formData.pastSurgicalHistory);
            console.log('Form Data - Visit Comments:', formData.visitComments);
            console.log('Form Data - Current Medicines:', formData.currentMedicines);
            console.log('Form Data - Previous Visit Plan (read-only):', formData.previousVisitPlan);
            console.log('Form Data - Chief Complaint (read-only):', formData.chiefComplaint);
            console.log('=== DATA BEING SENT TO API ===');
            console.log('API - Height (Cm):', visitData.heightInCms, '(from formData.height:', formData.height, ')');
            console.log('API - Weight (Kg):', visitData.weightInKgs, '(from formData.weight:', formData.weight, ')');
            console.log('API - BP:', visitData.bloodPressure, '(from formData.bp:', formData.bp, ')');
            console.log('API - Sugar:', visitData.sugar, '(from formData.sugar:', formData.sugar, ')');
            console.log('API - TFT:', visitData.tft, '(from formData.tft:', formData.tft, ')');
            console.log('API - Pulse:', visitData.pulse, '(from formData.pulse:', formData.pulse, ')');
            console.log('API - Past Surgical History:', visitData.pastSurgicalHistory);
            console.log('API - Visit Comments:', visitData.visitComments);
            console.log('API - Current Medicines:', visitData.currentMedicines);
            console.log('API - Previous Visit Plan (should not be saved):', visitData.previousVisitPlan);
            console.log('API - Chief Complaint (should not be saved):', visitData.chiefComplaint);
            console.log('=== VALIDATION PARAMETERS ===');
            console.log('Patient ID:', visitData.patientId);
            console.log('Doctor ID:', visitData.doctorId);
            console.log('Clinic ID:', visitData.clinicId);
            console.log('Shift ID:', visitData.shiftId);
            console.log('Status ID:', visitData.statusId);
            console.log('Visit Date:', visitData.visitDate);
            console.log('Patient Visit No:', visitData.patientVisitNo);
            console.log('User ID:', visitData.userId);
            console.log('Discount:', visitData.discount);
            console.log('=== FULL VISIT DATA JSON ===');
            console.log(JSON.stringify(visitData, null, 2));

            // Check for null/undefined values that might cause validation errors
            const nullFields = [];
            if (!visitData.patientId) nullFields.push('patientId');
            if (!visitData.doctorId) nullFields.push('doctorId');
            if (!visitData.clinicId) nullFields.push('clinicId');
            if (!visitData.shiftId) nullFields.push('shiftId');
            if (!visitData.patientVisitNo) nullFields.push('patientVisitNo');
            if (!visitData.visitDate) nullFields.push('visitDate');
            if (!visitData.statusId) nullFields.push('statusId');
            if (visitData.discount === null || visitData.discount === undefined) nullFields.push('discount');
            if (!visitData.userId) nullFields.push('userId');

            if (nullFields.length > 0) {
                console.error('=== NULL/UNDEFINED FIELDS DETECTED ===');
                console.error('Fields with null/undefined values:', nullFields);
                throw new Error(`Required fields are missing: ${nullFields.join(', ')}`);
            }

            const result = await visitService.saveComprehensiveVisitData(visitData);

            console.log('=== API RESPONSE ===');
            console.log('API Response:', result);
            console.log('Success status:', result.success);
            console.log('Response data:', result);

            let hasUploadError = false;
            if (result.success) {
                console.log('=== VISIT DETAILS SAVED SUCCESSFULLY ===');

                // Upload documents if any are attached
                if (formData.attachments && formData.attachments.length > 0) {
                    try {
                        console.log('=== UPLOADING ATTACHED DOCUMENTS ===');
                        const documentResults = await handleDocumentUpload(
                            formData.attachments,
                            patientData?.patientId?.toString() || '',
                            String(doctorId), // Use validated doctor ID
                            String(clinicId), // Use validated clinic ID
                            Number(patientVisitNo) // Use validated visit number
                        );

                        console.log('Document upload results:', documentResults);

                        // Check if all documents uploaded successfully
                        const failedUploads = documentResults.filter(result => !result.success);
                        if (failedUploads.length > 0) {
                            console.warn('Some documents failed to upload:', failedUploads);
                            hasUploadError = true;
                            setSnackbarSeverity('error');
                            setSnackbarMessage('Visit details saved successfully, but documents failed to upload');
                        } else {
                            setSnackbarMessage('Visit details and documents saved successfully!');
                        }

                        // Refresh existing documents list to reflect newly uploaded files
                        try {
                            if (patientData?.patientId && patientVisitNo) {
                                await loadExistingDocuments(String(patientData.patientId), Number(patientVisitNo));
                            }
                        } catch (reloadErr) {
                            console.warn('Failed to reload existing documents after upload:', reloadErr);
                        }

                        // Clear selected attachments after successful upload to avoid duplicates
                        setFormData(prev => ({ ...prev, attachments: [] }));
                    } catch (documentError) {
                        console.error('Error uploading documents:', documentError);
                        hasUploadError = true;
                        setSnackbarSeverity('error');
                        setSnackbarMessage('Visit details saved successfully, but documents failed to upload');
                    }
                } else {
                    setSnackbarMessage('Visit details saved successfully!');
                }

                // Show success snackbar
                console.log('=== SETTING SNACKBAR STATE ===');
                console.log('Setting snackbar open to true');
                setSnackbarOpen(true);
                console.log('Snackbar state set - open:', true);

                // Notify parent component that visit details were submitted
                if (onVisitDetailsSubmitted) {
                    onVisitDetailsSubmitted(true);
                }

                // Persist submission state to localStorage for persistence across refreshes
                try {
                    if (patientData?.patientId && patientData?.visitDate) {
                        const pid = String(patientData.patientId).trim();
                        // Extract YYYY-MM-DD from visitDate
                        const vDate = String(patientData.visitDate).split('T')[0];
                        const lsKey = `onehealth_visit_submitted_${pid}_${vDate}`;
                        localStorage.setItem(lsKey, 'true');
                        console.log(`Saved visit submission state to localStorage: ${lsKey} = true`);
                    }
                } catch (e) {
                    console.error('Failed to save visit submission state to localStorage', e);
                }

                setError(null);
                setSuccess(null);

                // Close modal after showing snackbar if there was no upload error
                if (!hasUploadError) {
                    setTimeout(() => {
                        console.log('=== CLOSING MODAL AFTER SUCCESS ===');
                        if (onClose) onClose();
                    }, 2000); // 2 second delay like AddPatientPage
                }
            } else {
                console.error('=== VISIT DETAILS SAVE FAILED ===');
                console.error('Error:', result.error || 'Failed to save visit details');
                setError(result.error || 'Failed to save visit details');
            }
        } catch (err: any) {
            console.error('=== ERROR DURING VISIT DETAILS SAVE ===');
            console.error('Error saving visit data:', err);
            console.error('Error type:', typeof err);
            console.error('Error message:', err instanceof Error ? err.message : 'Unknown error');
            console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace');
            setError(err.message || 'An error occurred while saving visit details');
        } finally {
            console.log('=== FINALLY BLOCK ===');
            console.log('Setting loading to false');
            setIsLoading(false);
            console.log('Loading state updated');
        }
    };

    const handleReset = () => {
        setFormData({
            referralBy: 'Self',
            referralName: '',
            referralContact: '',
            referralEmail: '',
            referralAddress: '',
            pulse: '',
            height: '',
            weight: '',
            bmi: '',
            bp: '',
            sugar: '',
            tft: '',
            pastSurgicalHistory: '',
            previousVisitPlan: '',
            chiefComplaint: '',
            visitComments: '',
            currentMedicines: '',
            selectedComplaint: '',
            attachments: []
        });
        // Reset inPerson based on current status
        const status = String(patientData?.status || '').trim().toUpperCase();
        const normalizedStatus = status === 'ON CALL' ? 'CONSULT ON CALL' : status;
        const resetInPerson = normalizedStatus === 'CONSULT ON CALL' || (normalizedStatus !== 'WAITING' && normalizedStatus !== 'WITH DOCTOR') ? false : true;

        setVisitType({
            inPerson: resetInPerson,
            followUp: false, // Will be set based on last visit existence
            followUpType: 'New' // Will be set based on last visit existence
        });
        setError(null);
        setSuccess(null);
        setSnackbarOpen(false);
        setSelectedDoctor(null);
        setReferralNameSearch('');
        setReferralNameOptions([]);
        setSnackbarMessage('');
        setSelectedComplaints([]);
        setComplaintSearch('');
        setIsComplaintsOpen(false);
        setComplaintsRows([]);
        setIsUploadingDocuments(false);
        setDocumentUploadResults([]);
        setExistingDocuments([]);
        setIsLoadingDocuments(false);
        setDeletingDocumentId(null);

    };

    return (
        <>
            <style>
                {`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}
            </style>
            {open && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10000,
                    }}
                >
                    <div
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            maxWidth: '1400px',
                            width: '98%',
                            maxHeight: '95vh',
                            overflow: 'auto',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Section */}
                        <div style={{
                            background: 'white',
                            padding: '15px 20px',
                            borderTopLeftRadius: '8px',
                            borderTopRightRadius: '8px',
                            fontFamily: "'Roboto', sans-serif",
                            color: '#212121',
                            fontSize: '0.9rem'
                        }}>
                            {/* Title and Close Button Row */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '10px'
                            }}>
                                <h3 style={{ margin: 0, color: '#000000', fontSize: '20px', fontWeight: 'bold' }}>
                                    Patient Visit Details
                                </h3>
                                {onClose && (
                                    <button
                                        onClick={onClose}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '5px',
                                            borderRadius: '8px',
                                            color: '#fff',
                                            backgroundColor: '#1976d2',
                                            width: '36px',
                                            height: '36px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#1565c0';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#1976d2';
                                        }}
                                    >
                                        <Close fontSize="small" />
                                    </button>
                                )}
                            </div>

                            {/* Patient Info, Doctor Info and Visit Type Row */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                <PatientNameDisplay
                                    patientData={{
                                        ...patientData,
                                        gender: (patientData as any).gender_description || (patientData as any).gender
                                    }}
                                    onClick={() => {
                                        if (patientData?.patientId) {
                                            setShowQuickRegistration(true);
                                        }
                                    }}
                                    style={{
                                        color: '#2e7d32',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: patientData?.patientId ? 'pointer' : 'default',
                                        textDecoration: patientData?.patientId ? 'underline' : 'none'
                                    }}
                                    title={patientData?.patientId ? 'Click to view patient details' : ''}
                                />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                                    <div style={{ color: '#1565c0', fontSize: '14px' }}>
                                        {doctorDisplayName}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', whiteSpace: 'nowrap' }}>
                                            <span>In-Person:</span>
                                            <input
                                                type="checkbox"
                                                checked={inPersonChecked}
                                                disabled={true}
                                                readOnly
                                            />
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', whiteSpace: 'nowrap' }}>
                                            <span>Follow-up:</span>
                                            <input
                                                type="checkbox"
                                                checked={visitType.followUp}
                                                onChange={(e) => setVisitType(prev => ({ ...prev, followUp: e.target.checked }))}
                                                disabled={readOnly}
                                            />
                                        </label>
                                        <span style={{ fontSize: '12px' }}>
                                            Follow-Up Type: {visitType.followUpType}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div style={{ padding: '20px', flex: 1, overflow: 'auto', fontFamily: "'Roboto', sans-serif", color: '#212121', fontSize: '0.9rem' }}>
                            {/* Error/Success Messages */}
                            {error && (
                                <div style={{
                                    backgroundColor: '#ffebee',
                                    color: '#c62828',
                                    padding: '10px 15px',
                                    borderRadius: '4px',
                                    marginBottom: '15px',
                                    border: '1px solid #ffcdd2',
                                    fontSize: '14px'
                                }}>
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div style={{
                                    backgroundColor: '#e8f5e8',
                                    color: '#2e7d32',
                                    padding: '10px 15px',
                                    borderRadius: '4px',
                                    marginBottom: '15px',
                                    border: '1px solid #c8e6c9',
                                    fontSize: '14px'
                                }}>
                                    {success}
                                </div>
                            )}
                            {/* Loading Appointment Details */}
                            {/* {isLoadingAppointmentDetails && (
                        <div style={{
                            backgroundColor: '#e3f2fd',
                            color: '#1976d2',
                            padding: '10px 15px',
                            borderRadius: '4px',
                            marginBottom: '15px',
                            border: '1px solid #bbdefb',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <div style={{
                                width: '16px',
                                height: '16px',
                                border: '2px solid #1976d2',
                                borderTop: '2px solid transparent',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }}></div>
                            Loading appointment details...
                        </div>
                    )} */}

                            {/* Document Upload Loading */}
                            {isUploadingDocuments && (
                                <div style={{
                                    backgroundColor: '#fff3e0',
                                    color: '#f57c00',
                                    padding: '10px 15px',
                                    borderRadius: '4px',
                                    marginBottom: '15px',
                                    border: '1px solid #ffcc02',
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}>
                                    <div style={{
                                        width: '16px',
                                        height: '16px',
                                        border: '2px solid #f57c00',
                                        borderTop: '2px solid transparent',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite'
                                    }}></div>
                                    Uploading documents... ({formData.attachments.length} file(s))
                                </div>
                            )}

                            {/* Document Upload Results */}
                            {documentUploadResults.length > 0 && (
                                <div style={{
                                    backgroundColor: '#f3e5f5',
                                    color: '#7b1fa2',
                                    padding: '10px 15px',
                                    borderRadius: '4px',
                                    marginBottom: '15px',
                                    border: '1px solid #ce93d8',
                                    fontSize: '14px'
                                }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Document Upload Results:</div>
                                    {documentUploadResults.map((result, index) => (
                                        <div key={index} style={{
                                            fontSize: '12px',
                                            marginBottom: '2px',
                                            color: result.success ? '#2e7d32' : '#d32f2f'
                                        }}>
                                            {result.success ? '✓' : '✗'} {result.documentName || `Document ${index + 1}`}:
                                            {result.success ? ' Uploaded successfully' : ` Failed - ${result.error || 'Unknown error'}`}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Referral Information */}
                            <div style={{ marginBottom: '10px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', gap: '10px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                            Referred By
                                        </label>
                                        <select
                                            value={formData.referralBy}
                                            onChange={(e) => handleInputChange('referralBy', e.target.value)}
                                            disabled={readOnly}
                                            style={{
                                                width: '100%',
                                                height: '32px',
                                                padding: '4px 8px',
                                                border: '2px solid #B7B7B7',
                                                borderRadius: '6px',
                                                fontSize: '0.9rem',
                                                fontFamily: "'Roboto', sans-serif",
                                                fontWeight: '500',
                                                backgroundColor: readOnly ? '#f5f5f5' : 'white',
                                                outline: 'none',
                                                transition: 'border-color 0.2s',
                                                cursor: readOnly ? 'not-allowed' : 'default'
                                            }}
                                            onFocus={(e) => {
                                                if (!readOnly) {
                                                    e.target.style.borderColor = '#1E88E5';
                                                    e.target.style.boxShadow = 'none';
                                                }
                                            }}
                                            onBlur={(e) => {
                                                if (!readOnly) {
                                                    e.target.style.borderColor = '#B7B7B7';
                                                }
                                            }}
                                        >
                                            {/* Removed placeholder option to avoid reverting selection */}
                                            <option value="Self">Self</option>
                                            {referByOptions.map(opt => (
                                                <option key={opt.id} value={opt.id}>{opt.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                            Referral Name
                                        </label>
                                        {!isSelfReferral() ? (
                                            // Show regular text field if referral name exists (data was patched/loaded)
                                            // Show search field with add button only if no referral name exists yet
                                            (formData.referralName && formData.referralName.trim() !== '') || selectedDoctor !== null ? (
                                                <div style={{ position: 'relative' }}>
                                                    <input
                                                        type="text"
                                                        placeholder="Referral Name"
                                                        value={formData.referralName}
                                                        onChange={(e) => handleInputChange('referralName', e.target.value)}
                                                        disabled={false}
                                                        style={{
                                                            width: '100%',
                                                            height: '32px',
                                                            padding: '4px 8px',
                                                            border: '2px solid #B7B7B7',
                                                            borderRadius: '6px',
                                                            fontSize: '0.9rem',
                                                            fontFamily: "'Roboto', sans-serif",
                                                            fontWeight: '500',
                                                            backgroundColor: 'white',
                                                            outline: 'none',
                                                            transition: 'border-color 0.2s',
                                                            cursor: 'text'
                                                        }}
                                                        onFocus={(e) => {
                                                            e.target.style.borderColor = '#1E88E5';
                                                            e.target.style.boxShadow = 'none';
                                                        }}
                                                        onBlur={(e) => {
                                                            e.target.style.borderColor = '#B7B7B7';
                                                        }}
                                                    />
                                                    {isDoctorReferral() && (
                                                        <button
                                                            type="button"
                                                            className="referral-add-icon"
                                                            onClick={() => setShowReferralPopup(true)}
                                                            disabled={false}
                                                            title="Add New Referral Doctor"
                                                            style={{
                                                                position: 'absolute',
                                                                right: '4px',
                                                                top: '50%',
                                                                transform: 'translateY(-50%)',
                                                                backgroundColor: '#1976d2',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                padding: '2px',
                                                                borderRadius: '3px',
                                                                color: 'white',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                width: '16px',
                                                                opacity: 1,
                                                                height: '20px',
                                                                transition: 'background-color 0.2s'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.backgroundColor = '#1565c0';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.backgroundColor = '#1976d2';
                                                            }}
                                                        >
                                                            <Add style={{ fontSize: '12px' }} />
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div style={{ position: 'relative' }}>
                                                    <input
                                                        type="text"
                                                        placeholder="Search Doctor Name"
                                                        value={referralNameSearch}
                                                        onChange={(e) => handleReferralNameSearch(e.target.value)}
                                                        disabled={false}
                                                        style={{
                                                            width: '100%',
                                                            height: '32px',
                                                            padding: '4px 8px',
                                                            paddingRight: '40px',
                                                            border: '2px solid #B7B7B7',
                                                            borderRadius: '6px',
                                                            fontSize: '0.9rem',
                                                            fontFamily: "'Roboto', sans-serif",
                                                            fontWeight: '500',
                                                            backgroundColor: 'white',
                                                            outline: 'none',
                                                            transition: 'border-color 0.2s',
                                                            cursor: 'text'
                                                        }}
                                                        onFocus={(e) => {
                                                            e.target.style.borderColor = '#1E88E5';
                                                            e.target.style.boxShadow = 'none';
                                                        }}
                                                        onBlur={(e) => {
                                                            e.target.style.borderColor = '#B7B7B7';
                                                        }}
                                                    />
                                                    {isDoctorReferral() && (
                                                        <button
                                                            type="button"
                                                            className="referral-add-icon"
                                                            onClick={() => setShowReferralPopup(true)}
                                                            disabled={false}
                                                            title="Add New Referral Doctor"
                                                            style={{
                                                                position: 'absolute',
                                                                right: '4px',
                                                                top: '50%',
                                                                transform: 'translateY(-50%)',
                                                                backgroundColor: '#1976d2',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                padding: '2px',
                                                                borderRadius: '3px',
                                                                color: 'white',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                width: '16px',
                                                                opacity: 1,
                                                                height: '20px',
                                                                transition: 'background-color 0.2s'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.backgroundColor = '#1565c0';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.backgroundColor = '#1976d2';
                                                            }}
                                                        >
                                                            <Add style={{ fontSize: '12px' }} />
                                                        </button>
                                                    )}

                                                    {/* Search Results Dropdown */}
                                                    {referralNameOptions.length > 0 && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: '100%',
                                                            left: 0,
                                                            right: 0,
                                                            backgroundColor: 'white',
                                                            border: '1px solid #B7B7B7',
                                                            borderRadius: '6px',
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                            zIndex: 1000,
                                                            maxHeight: '200px',
                                                            overflowY: 'auto'
                                                        }}>
                                                            {referralNameOptions.map((option) => (
                                                                <div
                                                                    key={option.id}
                                                                    onClick={() => {
                                                                        // Store the selected doctor data
                                                                        setSelectedDoctor((option as any).fullData);

                                                                        // Update form data with doctor information
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            referralName: option.name,
                                                                            referralContact: (option as any).fullData?.doctorMob || '',
                                                                            referralEmail: (option as any).fullData?.doctorMail || '',
                                                                            referralAddress: (option as any).fullData?.doctorAddress || ''
                                                                        }));

                                                                        setReferralNameSearch(option.name);
                                                                        setReferralNameOptions([]);

                                                                        console.log('=== DOCTOR SELECTED ===');
                                                                        console.log('Selected doctor data:', (option as any).fullData);
                                                                        console.log('Updated form data:', {
                                                                            referralName: option.name,
                                                                            referralContact: (option as any).fullData?.doctorMob || '',
                                                                            referralEmail: (option as any).fullData?.doctorMail || '',
                                                                            referralAddress: (option as any).fullData?.doctorAddress || ''
                                                                        });
                                                                        console.log('=== END DOCTOR SELECTED ===');
                                                                    }}
                                                                    style={{
                                                                        padding: '8px 12px',
                                                                        cursor: 'pointer',
                                                                        fontSize: '0.9rem',
                                                                        borderBottom: '1px solid #f0f0f0',
                                                                        transition: 'background-color 0.2s'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.backgroundColor = 'white';
                                                                    }}
                                                                >
                                                                    {option.name}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        ) : (
                                            <input
                                                type="text"
                                                placeholder="Referral Name"
                                                value={formData.referralName}
                                                onChange={(e) => handleInputChange('referralName', e.target.value)}
                                                disabled={readOnly}
                                                style={{
                                                    width: '100%',
                                                    height: '32px',
                                                    padding: '4px 8px',
                                                    border: '2px solid #B7B7B7',
                                                    borderRadius: '6px',
                                                    fontSize: '0.9rem',
                                                    fontFamily: "'Roboto', sans-serif",
                                                    fontWeight: '500',
                                                    backgroundColor: readOnly ? '#f5f5f5' : 'white',
                                                    outline: 'none',
                                                    transition: 'border-color 0.2s',
                                                    cursor: readOnly ? 'not-allowed' : 'text'
                                                }}
                                                onFocus={(e) => {
                                                    if (!readOnly) {
                                                        e.target.style.borderColor = '#1E88E5';
                                                        e.target.style.boxShadow = 'none';
                                                    }
                                                }}
                                                onBlur={(e) => {
                                                    if (!readOnly) {
                                                        e.target.style.borderColor = '#B7B7B7';
                                                    }
                                                }}
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                            Referral Contact
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Contact"
                                            value={formData.referralContact}
                                            onChange={(e) => handleInputChange('referralContact', e.target.value)}
                                            disabled={readOnly || selectedDoctor !== null}
                                            style={{
                                                width: '100%',
                                                height: '32px',
                                                padding: '4px 8px',
                                                border: '2px solid #B7B7B7',
                                                borderRadius: '6px',
                                                fontSize: '0.9rem',
                                                fontFamily: "'Roboto', sans-serif",
                                                fontWeight: '500',
                                                backgroundColor: (readOnly || selectedDoctor !== null) ? '#f5f5f5' : 'white',
                                                outline: 'none',
                                                transition: 'border-color 0.2s',
                                                cursor: selectedDoctor !== null ? 'not-allowed' : 'text'
                                            }}
                                            onFocus={(e) => {
                                                if (selectedDoctor === null) {
                                                    e.target.style.borderColor = '#1E88E5';
                                                    e.target.style.boxShadow = 'none';
                                                }
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#B7B7B7';
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                            Referral Email
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={formData.referralEmail}
                                            onChange={(e) => handleInputChange('referralEmail', e.target.value)}
                                            disabled={readOnly || selectedDoctor !== null}
                                            style={{
                                                width: '100%',
                                                height: '32px',
                                                padding: '4px 8px',
                                                border: '2px solid #B7B7B7',
                                                borderRadius: '6px',
                                                fontSize: '0.9rem',
                                                fontFamily: "'Roboto', sans-serif",
                                                fontWeight: '500',
                                                backgroundColor: (readOnly || selectedDoctor !== null) ? '#f5f5f5' : 'white',
                                                outline: 'none',
                                                transition: 'border-color 0.2s',
                                                cursor: selectedDoctor !== null ? 'not-allowed' : 'text'
                                            }}
                                            onFocus={(e) => {
                                                if (selectedDoctor === null) {
                                                    e.target.style.borderColor = '#1E88E5';
                                                    e.target.style.boxShadow = 'none';
                                                }
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#B7B7B7';
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                            Referral Address
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Address"
                                            maxLength={150}
                                            value={formData.referralAddress}
                                            onChange={(e) => handleInputChange('referralAddress', e.target.value)}
                                            disabled={readOnly || selectedDoctor !== null}
                                            style={{
                                                width: '100%',
                                                height: '32px',
                                                padding: '4px 8px',
                                                border: '2px solid #B7B7B7',
                                                borderRadius: '6px',
                                                fontSize: '0.9rem',
                                                fontFamily: "'Roboto', sans-serif",
                                                fontWeight: '500',
                                                backgroundColor: (readOnly || selectedDoctor !== null) ? '#f5f5f5' : 'white',
                                                outline: 'none',
                                                transition: 'border-color 0.2s',
                                                cursor: selectedDoctor !== null ? 'not-allowed' : 'text'
                                            }}
                                            onFocus={(e) => {
                                                if (selectedDoctor === null) {
                                                    e.target.style.borderColor = '#1E88E5';
                                                    e.target.style.boxShadow = 'none';
                                                }
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#B7B7B7';
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                            Pulse (/min)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="Pulse"
                                            value={formData.pulse}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                // Allow empty string or non-negative numbers
                                                if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                                                    handleInputChange('pulse', value);
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                // Prevent minus key from being entered
                                                if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                                                    e.preventDefault();
                                                }
                                            }}
                                            min="0"
                                            step="1"
                                            disabled={readOnly}
                                            style={{
                                                width: '100%',
                                                height: '32px',
                                                padding: '4px 8px',
                                                border: '2px solid #B7B7B7',
                                                borderRadius: '6px',
                                                fontSize: '0.9rem',
                                                fontFamily: "'Roboto', sans-serif",
                                                fontWeight: '500',
                                                backgroundColor: readOnly ? '#f5f5f5' : 'white',
                                                outline: 'none',
                                                transition: 'border-color 0.2s',
                                                cursor: readOnly ? 'not-allowed' : 'text'
                                            }}
                                            onFocus={(e) => {
                                                if (!readOnly) {
                                                    e.target.style.borderColor = '#1E88E5';
                                                    e.target.style.boxShadow = 'none';
                                                }
                                            }}
                                            onBlur={(e) => {
                                                if (!readOnly) {
                                                    e.target.style.borderColor = '#B7B7B7';
                                                }
                                                // Ensure value is not negative on blur
                                                const numValue = parseFloat(e.target.value);
                                                if (isNaN(numValue) || numValue < 0) {
                                                    handleInputChange('pulse', '');
                                                }
                                            }}
                                        />
                                    </div>

                                </div>
                            </div>

                            {/* Vital Signs */}
                            <div style={{ marginBottom: '10px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', gap: '10px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                            Height (Cm)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="Height"
                                            value={formData.height}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                // Allow empty string or non-negative numbers
                                                if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                                                    handleInputChange('height', value);
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                // Prevent minus key from being entered
                                                if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                                                    e.preventDefault();
                                                }
                                            }}
                                            min="0"
                                            step="0.1"
                                            disabled={readOnly}
                                            style={{
                                                width: '100%',
                                                height: '32px',
                                                padding: '4px 8px',
                                                border: '2px solid #B7B7B7',
                                                borderRadius: '6px',
                                                fontSize: '0.9rem',
                                                fontFamily: "'Roboto', sans-serif",
                                                fontWeight: '500',
                                                backgroundColor: readOnly ? '#f5f5f5' : 'white',
                                                outline: 'none',
                                                transition: 'border-color 0.2s',
                                                cursor: readOnly ? 'not-allowed' : 'text'
                                            }}
                                            onFocus={(e) => {
                                                if (!readOnly) {
                                                    e.target.style.borderColor = '#1E88E5';
                                                    e.target.style.boxShadow = 'none';
                                                }
                                            }}
                                            onBlur={(e) => {
                                                if (!readOnly) {
                                                    e.target.style.borderColor = '#B7B7B7';
                                                }
                                                // Ensure value is not negative on blur
                                                const numValue = parseFloat(e.target.value);
                                                if (isNaN(numValue) || numValue < 0) {
                                                    handleInputChange('height', '');
                                                }
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                            Weight (Kg)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="Weight"
                                            value={formData.weight}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                // Allow empty string or non-negative numbers
                                                if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                                                    handleInputChange('weight', value);
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                // Prevent minus key from being entered
                                                if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                                                    e.preventDefault();
                                                }
                                            }}
                                            min="0"
                                            step="0.1"
                                            disabled={readOnly}
                                            style={{
                                                width: '100%',
                                                height: '32px',
                                                padding: '4px 8px',
                                                border: '2px solid #B7B7B7',
                                                borderRadius: '6px',
                                                fontSize: '0.9rem',
                                                fontFamily: "'Roboto', sans-serif",
                                                fontWeight: '500',
                                                backgroundColor: readOnly ? '#f5f5f5' : 'white',
                                                outline: 'none',
                                                transition: 'border-color 0.2s',
                                                cursor: readOnly ? 'not-allowed' : 'text'
                                            }}
                                            onFocus={(e) => {
                                                if (!readOnly) {
                                                    e.target.style.borderColor = '#1E88E5';
                                                    e.target.style.boxShadow = 'none';
                                                }
                                            }}
                                            onBlur={(e) => {
                                                if (!readOnly) {
                                                    e.target.style.borderColor = '#B7B7B7';
                                                }
                                                // Ensure value is not negative on blur
                                                const numValue = parseFloat(e.target.value);
                                                if (isNaN(numValue) || numValue < 0) {
                                                    handleInputChange('weight', '');
                                                }
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                            BMI
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="BMI"
                                            value={formData.bmi}
                                            disabled={readOnly || true}
                                            style={{
                                                width: '100%',
                                                height: '32px',
                                                padding: '4px 8px',
                                                border: '2px solid #B7B7B7',
                                                borderRadius: '6px',
                                                fontSize: '0.9rem',
                                                fontFamily: "'Roboto', sans-serif",
                                                fontWeight: '500',
                                                backgroundColor: '#f5f5f5',
                                                outline: 'none',
                                                transition: 'border-color 0.2s'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                            BP
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="BP"
                                            value={formData.bp}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                // Allow empty string
                                                if (value === '') {
                                                    handleInputChange('bp', value);
                                                    return;
                                                }
                                                // Check if value starts with minus sign (negative number)
                                                if (value.trim().startsWith('-')) {
                                                    return; // Reject negative values
                                                }
                                                // Check for negative numbers in formats like "120/-80" or "-120/80"
                                                // Split by common separators and check each part
                                                const parts = value.split(/[\/\-]/);
                                                const hasNegative = parts.some(part => {
                                                    const trimmed = part.trim();
                                                    return trimmed.startsWith('-') || (trimmed !== '' && !isNaN(parseFloat(trimmed)) && parseFloat(trimmed) < 0);
                                                });
                                                if (!hasNegative) {
                                                    handleInputChange('bp', value);
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                // Prevent minus key if it would create a negative number
                                                if (e.key === '-') {
                                                    const input = e.currentTarget as HTMLInputElement;
                                                    const cursorPos = input.selectionStart || 0;
                                                    // Allow minus only if it's in the middle (like "120-80" format)
                                                    // But prevent if it's at the start or would create a negative number
                                                    if (cursorPos === 0 || (input.value.length === 0)) {
                                                        e.preventDefault();
                                                    }
                                                }
                                            }}
                                            disabled={readOnly}
                                            style={{
                                                width: '100%',
                                                height: '32px',
                                                padding: '4px 8px',
                                                border: '2px solid #B7B7B7',
                                                borderRadius: '6px',
                                                fontSize: '0.9rem',
                                                fontFamily: "'Roboto', sans-serif",
                                                fontWeight: '500',
                                                backgroundColor: readOnly ? '#f5f5f5' : 'white',
                                                outline: 'none',
                                                transition: 'border-color 0.2s',
                                                cursor: readOnly ? 'not-allowed' : 'text'
                                            }}
                                            onFocus={(e) => {
                                                if (!readOnly) {
                                                    e.target.style.borderColor = '#1E88E5';
                                                    e.target.style.boxShadow = 'none';
                                                }
                                            }}
                                            onBlur={(e) => {
                                                if (!readOnly) {
                                                    e.target.style.borderColor = '#B7B7B7';
                                                }
                                                // Clean up any negative values on blur
                                                const value = e.target.value;
                                                if (value.trim().startsWith('-')) {
                                                    handleInputChange('bp', '');
                                                } else {
                                                    // Check for negative numbers in the value
                                                    const parts = value.split(/[\/\-]/);
                                                    const hasNegative = parts.some(part => {
                                                        const trimmed = part.trim();
                                                        return trimmed.startsWith('-') || (trimmed !== '' && !isNaN(parseFloat(trimmed)) && parseFloat(trimmed) < 0);
                                                    });
                                                    if (hasNegative) {
                                                        handleInputChange('bp', '');
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                            Sugar
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Sugar"
                                            value={formData.sugar}
                                            onChange={(e) => handleInputChange('sugar', e.target.value)}
                                            disabled={readOnly}
                                            style={{
                                                width: '100%',
                                                height: '32px',
                                                padding: '4px 8px',
                                                border: '2px solid #B7B7B7',
                                                borderRadius: '6px',
                                                fontSize: '0.9rem',
                                                fontFamily: "'Roboto', sans-serif",
                                                fontWeight: '500',
                                                backgroundColor: readOnly ? '#f5f5f5' : 'white',
                                                outline: 'none',
                                                transition: 'border-color 0.2s',
                                                cursor: readOnly ? 'not-allowed' : 'text'
                                            }}
                                            onFocus={(e) => {
                                                if (!readOnly) {
                                                    e.target.style.borderColor = '#1E88E5';
                                                    e.target.style.boxShadow = 'none';
                                                }
                                            }}
                                            onBlur={(e) => {
                                                if (!readOnly) {
                                                    e.target.style.borderColor = '#B7B7B7';
                                                }
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                            TFT
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="TFT"
                                            value={formData.tft}
                                            onChange={(e) => handleInputChange('tft', e.target.value)}
                                            disabled={readOnly}
                                            style={{
                                                width: '100%',
                                                height: '32px',
                                                padding: '4px 8px',
                                                border: '2px solid #B7B7B7',
                                                borderRadius: '6px',
                                                fontSize: '0.9rem',
                                                fontFamily: "'Roboto', sans-serif",
                                                fontWeight: '500',
                                                backgroundColor: readOnly ? '#f5f5f5' : 'white',
                                                outline: 'none',
                                                transition: 'border-color 0.2s',
                                                cursor: readOnly ? 'not-allowed' : 'text'
                                            }}
                                            onFocus={(e) => {
                                                if (!readOnly) {
                                                    e.target.style.borderColor = '#1E88E5';
                                                    e.target.style.boxShadow = 'none';
                                                }
                                            }}
                                            onBlur={(e) => {
                                                if (!readOnly) {
                                                    e.target.style.borderColor = '#B7B7B7';
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* History and Plans */}
                            <div style={{ marginBottom: '10px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                            Past Surgical History
                                        </label>
                                        <textarea
                                            value={formData.pastSurgicalHistory}
                                            onChange={(e) => handleInputChange('pastSurgicalHistory', e.target.value)}
                                            disabled={readOnly}
                                            rows={2}
                                            style={{
                                                width: '100%',
                                                padding: '4px 8px',
                                                border: '2px solid #B7B7B7',
                                                borderRadius: '6px',
                                                fontSize: '0.9rem',
                                                fontFamily: "'Roboto', sans-serif",
                                                fontWeight: '500',
                                                backgroundColor: readOnly ? '#f5f5f5' : 'white',
                                                outline: 'none',
                                                resize: 'vertical',
                                                transition: 'border-color 0.2s',
                                                cursor: readOnly ? 'not-allowed' : 'text'
                                            }}
                                            onFocus={(e) => {
                                                if (!readOnly) {
                                                    e.target.style.borderColor = '#1E88E5';
                                                    e.target.style.boxShadow = 'none';
                                                }
                                            }}
                                            onBlur={(e) => {
                                                if (!readOnly) {
                                                    e.target.style.borderColor = '#B7B7B7';
                                                }
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                            Previous Visit Plan
                                        </label>
                                        <textarea
                                            value={formData.previousVisitPlan}
                                            disabled={readOnly || true}
                                            rows={2}
                                            style={{
                                                width: '100%',
                                                padding: '4px 8px',
                                                border: '2px solid #B7B7B7',
                                                borderRadius: '6px',
                                                fontSize: '0.9rem',
                                                fontFamily: "'Roboto', sans-serif",
                                                fontWeight: '500',
                                                backgroundColor: '#f5f5f5',
                                                outline: 'none',
                                                resize: 'none',
                                                transition: 'border-color 0.2s'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                            Chief complaint entered by patient
                                        </label>
                                        <textarea
                                            value={formData.chiefComplaint}
                                            disabled={readOnly || true}
                                            rows={2}
                                            style={{
                                                width: '100%',
                                                padding: '4px 8px',
                                                border: '2px solid #B7B7B7',
                                                borderRadius: '6px',
                                                fontSize: '0.9rem',
                                                fontFamily: "'Roboto', sans-serif",
                                                fontWeight: '500',
                                                backgroundColor: '#f5f5f5',
                                                outline: 'none',
                                                resize: 'none',
                                                transition: 'border-color 0.2s'
                                            }}
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '10px' }}>
                                    <div style={{ position: 'relative' }}>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                            Select Complaints
                                        </label>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'end' }}>
                                            <div ref={complaintsRef} style={{ position: 'relative', flex: 1 }}>
                                                <div
                                                    onClick={() => !readOnly && setIsComplaintsOpen(prev => !prev)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        height: '32px',
                                                        padding: '4px 8px',
                                                        border: '2px solid #B7B7B7',
                                                        borderRadius: '6px',
                                                        fontSize: '12px',
                                                        fontFamily: "'Roboto', sans-serif",
                                                        fontWeight: 500,
                                                        backgroundColor: readOnly ? '#f5f5f5' : 'white',
                                                        cursor: readOnly ? 'not-allowed' : 'pointer',
                                                        userSelect: 'none',
                                                        pointerEvents: readOnly ? 'none' : 'auto',
                                                        opacity: readOnly ? 0.6 : 1
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!readOnly) {
                                                            (e.currentTarget as HTMLDivElement).style.borderColor = '#1E88E5';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (!readOnly) {
                                                            (e.currentTarget as HTMLDivElement).style.borderColor = '#B7B7B7';
                                                        }
                                                    }}
                                                >
                                                    <span style={{ color: selectedComplaints.length ? '#000' : '#9e9e9e' }}>
                                                        {selectedComplaints.length === 0 && 'Select Complaints'}
                                                        {selectedComplaints.length === 1 && '1 selected'}
                                                        {selectedComplaints.length > 1 && `${selectedComplaints.length} selected`}
                                                    </span>
                                                    <span style={{ marginLeft: '8px', color: '#666' }}>▾</span>
                                                </div>

                                                {isComplaintsOpen && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '100%',
                                                        left: 0,
                                                        right: 0,
                                                        backgroundColor: 'white',
                                                        border: '1px solid #B7B7B7',
                                                        borderRadius: '6px',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                        zIndex: 1000,
                                                        marginTop: '4px'
                                                    }}>
                                                        {/* Search Field inside dropdown */}
                                                        <div style={{ padding: '6px' }}>
                                                            <input
                                                                type="text"
                                                                value={complaintSearch}
                                                                onChange={(e) => setComplaintSearch(e.target.value)}
                                                                disabled={readOnly}
                                                                placeholder="Search complaints"
                                                                style={{
                                                                    width: '100%',
                                                                    height: '28px',
                                                                    padding: '4px 8px',
                                                                    border: '1px solid #B7B7B7',
                                                                    borderRadius: '4px',
                                                                    fontSize: '12px',
                                                                    outline: 'none'
                                                                }}
                                                                onFocus={(e) => {
                                                                    (e.target as HTMLInputElement).style.borderColor = '#1E88E5';
                                                                }}
                                                                onBlur={(e) => {
                                                                    (e.target as HTMLInputElement).style.borderColor = '#B7B7B7';
                                                                }}
                                                            />
                                                        </div>

                                                        <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '4px 6px', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', columnGap: '8px', rowGap: '6px' }}>
                                                            {complaintsLoading && (
                                                                <div style={{ padding: '6px', fontSize: '12px', color: '#777', gridColumn: '1 / -1', textAlign: 'center' }}>
                                                                    Loading complaints...
                                                                </div>
                                                            )}
                                                            {complaintsError && (
                                                                <div style={{ padding: '6px', fontSize: '12px', color: '#d32f2f', gridColumn: '1 / -1', textAlign: 'center' }}>
                                                                    {complaintsError}
                                                                    <button
                                                                        onClick={() => {
                                                                            if (readOnly) return;
                                                                            const doctorId = patientData?.provider || sessionDataForQuickReg?.doctorId;
                                                                            const clinicId = patientData?.clinicId || sessionDataForQuickReg?.clinicId;
                                                                            if (!doctorId || !clinicId) {
                                                                                setComplaintsError('Doctor or clinic information is unavailable.');
                                                                                return;
                                                                            }
                                                                            setComplaintsError(null);
                                                                            setComplaintsLoading(true);
                                                                            complaintService.getAllComplaintsForDoctor(String(doctorId), String(clinicId))
                                                                                .then(setComplaintsOptions)
                                                                                .catch(e => setComplaintsError(e.message))
                                                                                .finally(() => setComplaintsLoading(false));
                                                                        }}
                                                                        disabled={readOnly}
                                                                        style={{
                                                                            marginLeft: '8px',
                                                                            padding: '2px 6px',
                                                                            fontSize: '10px',
                                                                            backgroundColor: readOnly ? '#9e9e9e' : '#1976d2',
                                                                            color: 'white',
                                                                            border: 'none',
                                                                            borderRadius: '3px',
                                                                            cursor: readOnly ? 'not-allowed' : 'pointer'
                                                                        }}
                                                                    >
                                                                        Retry
                                                                    </button>
                                                                </div>
                                                            )}
                                                            {!complaintsLoading && !complaintsError && filteredComplaints.length === 0 && (
                                                                <div style={{ padding: '6px', fontSize: '12px', color: '#777', gridColumn: '1 / -1' }}>No complaints found</div>
                                                            )}
                                                            {!complaintsLoading && !complaintsError && filteredComplaints.map((opt, index) => {
                                                                const checked = selectedComplaints.includes(opt.value);
                                                                const isFirstUnselected = !checked && index > 0 && selectedComplaints.includes(filteredComplaints[index - 1].value);

                                                                return (
                                                                    <React.Fragment key={opt.value}>
                                                                        {isFirstUnselected && (
                                                                            <div style={{
                                                                                gridColumn: '1 / -1',
                                                                                height: '1px',
                                                                                backgroundColor: '#e0e0e0',
                                                                                margin: '4px 0'
                                                                            }} />
                                                                        )}
                                                                        <label
                                                                            style={{
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                gap: '4px',
                                                                                padding: '4px 2px',
                                                                                cursor: readOnly ? 'not-allowed' : 'pointer',
                                                                                fontSize: '12px',
                                                                                border: 'none',
                                                                                backgroundColor: checked ? '#e3f2fd' : 'transparent',
                                                                                borderRadius: '3px',
                                                                                fontWeight: checked ? '600' : '400',
                                                                                opacity: readOnly ? 0.6 : 1,
                                                                                pointerEvents: readOnly ? 'none' : 'auto'
                                                                            }}
                                                                        >
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={checked}
                                                                                onChange={(e) => {
                                                                                    if (readOnly) return;
                                                                                    setSelectedComplaints(prev => {
                                                                                        if (e.target.checked) {
                                                                                            if (prev.includes(opt.value)) return prev;
                                                                                            return [...prev, opt.value];
                                                                                        } else {
                                                                                            return prev.filter(v => v !== opt.value);
                                                                                        }
                                                                                    });
                                                                                }}
                                                                                disabled={readOnly}
                                                                                style={{ margin: 0 }}
                                                                            />
                                                                            <span title={opt.label} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{opt.label}</span>
                                                                        </label>
                                                                    </React.Fragment>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                style={{
                                                    padding: '0 10px',
                                                    backgroundColor: readOnly ? '#9e9e9e' : '#1976d2',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: readOnly ? 'not-allowed' : 'pointer',
                                                    fontSize: '12px',
                                                    fontWeight: '500',
                                                    height: '32px',
                                                    transition: 'background-color 0.2s',
                                                    opacity: readOnly ? 0.6 : 1
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!readOnly) {
                                                        e.currentTarget.style.backgroundColor = '#1565c0';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!readOnly) {
                                                        e.currentTarget.style.backgroundColor = '#1976d2';
                                                    }
                                                }}
                                                onClick={handleAddComplaints}
                                                disabled={readOnly}
                                            >
                                                Add
                                            </button>
                                        </div>

                                        {/* Complaints table overlay (absolute) */}
                                        {complaintsRows.length > 0 && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: '80px', // add extra gap below the select/add row
                                                    left: 0,
                                                    right: 0,
                                                    backgroundColor: 'white',
                                                    border: '1px solid #B7B7B7',
                                                    borderRadius: '6px',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                    zIndex: 900, // keep below complaints dropdown (which uses 1000)
                                                }}
                                            >
                                                <div style={{ width: '100%', overflow: 'hidden' }}>
                                                    {/* Header */}
                                                    <div style={{ display: 'grid', gridTemplateColumns: '60px 1.5fr 1.5fr 80px', background: '#1565c0', color: 'white', fontWeight: 600, fontSize: '12px' }}>
                                                        <div style={{ padding: '8px 10px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Sr.</div>
                                                        <div style={{ padding: '8px 10px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Complaint Description</div>
                                                        <div style={{ padding: '8px 10px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Duration / Comment</div>
                                                        <div style={{ padding: '8px 10px' }}>Action</div>
                                                    </div>
                                                    {/* Rows */}
                                                    {complaintsRows.map((row, idx) => (
                                                        <div key={row.value} style={{ display: 'grid', gridTemplateColumns: '60px 1.5fr 1.5fr 80px', background: idx % 2 === 0 ? '#f7fbff' : 'white', fontSize: '12px', alignItems: 'center' }}>
                                                            <div style={{ padding: '8px 10px', borderTop: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0' }}>{idx + 1}</div>
                                                            <div style={{ padding: '8px 10px', borderTop: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0' }}>{row.label}</div>
                                                            <div style={{ padding: '0', borderTop: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0' }}>
                                                                <input
                                                                    type="text"
                                                                    value={row.comment}
                                                                    placeholder="Enter duration/comment"
                                                                    onChange={(e) => handleComplaintCommentChange(row.value, e.target.value)}
                                                                    disabled={readOnly}
                                                                    className="duration-comment-input"
                                                                    style={{
                                                                        width: '100%',
                                                                        height: '100%',
                                                                        padding: '8px 10px',
                                                                        border: 'none !important',
                                                                        borderWidth: '0 !important',
                                                                        borderStyle: 'none !important',
                                                                        borderColor: 'transparent !important',
                                                                        borderRadius: '0 !important',
                                                                        outline: 'none',
                                                                        background: 'transparent',
                                                                        boxShadow: 'none !important'
                                                                    }}
                                                                />
                                                            </div>
                                                            <div style={{ padding: '8px 10px', borderTop: '1px solid #e0e0e0' }}>
                                                                <div
                                                                    onClick={() => !readOnly && handleRemoveComplaint(row.value)}
                                                                    title="Remove"
                                                                    style={{
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        width: '24px',
                                                                        height: '24px',
                                                                        cursor: readOnly ? 'not-allowed' : 'pointer',
                                                                        color: readOnly ? '#9e9e9e' : '#000000',
                                                                        backgroundColor: 'transparent',
                                                                        opacity: readOnly ? 0.6 : 1,
                                                                        pointerEvents: readOnly ? 'none' : 'auto'
                                                                    }}
                                                                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.color = '#EF5350'; }}
                                                                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.color = '#000000'; }}
                                                                >
                                                                    <Delete fontSize="small" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                            Visit Comments
                                        </label>
                                        <textarea
                                            value={formData.visitComments}
                                            onChange={(e) => handleInputChange('visitComments', e.target.value)}
                                            disabled={readOnly}
                                            rows={2}
                                            style={{
                                                width: '100%',
                                                padding: '4px 8px',
                                                border: '2px solid #B7B7B7',
                                                borderRadius: '6px',
                                                fontSize: '0.9rem',
                                                fontFamily: "'Roboto', sans-serif",
                                                fontWeight: '500',
                                                backgroundColor: readOnly ? '#f5f5f5' : 'white',
                                                outline: 'none',
                                                resize: 'vertical',
                                                transition: 'border-color 0.2s',
                                                cursor: readOnly ? 'not-allowed' : 'text'
                                            }}
                                            onFocus={(e) => {
                                                if (!readOnly) {
                                                    e.target.style.borderColor = '#1E88E5';
                                                    e.target.style.boxShadow = 'none';
                                                }
                                            }}
                                            onBlur={(e) => {
                                                if (!readOnly) {
                                                    e.target.style.borderColor = '#B7B7B7';
                                                }
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                            Current Medicines
                                        </label>
                                        <textarea
                                            value={formData.currentMedicines}
                                            onChange={(e) => handleInputChange('currentMedicines', e.target.value)}
                                            disabled={readOnly}
                                            rows={2}
                                            style={{
                                                width: '100%',
                                                padding: '4px 8px',
                                                border: '2px solid #B7B7B7',
                                                borderRadius: '6px',
                                                fontSize: '0.9rem',
                                                fontFamily: "'Roboto', sans-serif",
                                                fontWeight: '500',
                                                backgroundColor: readOnly ? '#f5f5f5' : 'white',
                                                outline: 'none',
                                                resize: 'vertical',
                                                transition: 'border-color 0.2s',
                                                cursor: readOnly ? 'not-allowed' : 'text'
                                            }}
                                            onFocus={(e) => {
                                                if (!readOnly) {
                                                    e.target.style.borderColor = '#1E88E5';
                                                    e.target.style.boxShadow = 'none';
                                                }
                                            }}
                                            onBlur={(e) => {
                                                if (!readOnly) {
                                                    e.target.style.borderColor = '#B7B7B7';
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Attachments Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '10px' }}>
                                <div>
                                    {/* Empty first column */}
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                        Attachments (Max 3 , Size 150Mb)
                                    </label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                        <button
                                            type="button"
                                            onClick={() => !readOnly && document.getElementById('fileInput')?.click()}
                                            disabled={readOnly}
                                            style={{
                                                padding: '8px 16px',
                                                backgroundColor: readOnly ? '#9e9e9e' : '#1976d2',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: readOnly ? 'not-allowed' : 'pointer',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                transition: 'background-color 0.2s',
                                                opacity: readOnly ? 0.6 : 1
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!readOnly) {
                                                    e.currentTarget.style.backgroundColor = '#1565c0';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!readOnly) {
                                                    e.currentTarget.style.backgroundColor = '#1976d2';
                                                }
                                            }}
                                        >
                                            Choose Files
                                        </button>
                                        <span style={{ fontSize: '12px', color: '#666' }}>
                                            Files uploaded: {formData.attachments.length + existingDocuments.length}
                                            {(() => {
                                                const newFilesSize = formData.attachments.reduce((sum, file) => sum + file.size, 0);
                                                const existingFilesSize = existingDocuments.reduce((sum, doc) => sum + (doc.fileSize || 0), 0);
                                                const totalSize = newFilesSize + existingFilesSize;

                                                if (totalSize > 0) {
                                                    const units = ['B', 'KB', 'MB', 'GB'];
                                                    let size = totalSize;
                                                    let unitIndex = 0;
                                                    while (size >= 1024 && unitIndex < units.length - 1) {
                                                        size /= 1024;
                                                        unitIndex++;
                                                    }
                                                    return (
                                                        <span style={{ marginLeft: '5px', fontWeight: '500' }}>
                                                            (Total size: {`${size.toFixed(1)} ${units[unitIndex]}`})
                                                        </span>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </span>
                                    </div>
                                    <input
                                        id="fileInput"
                                        type="file"
                                        multiple
                                        accept=".jpg,.jpeg,.png,.gif,.pdf,.xls,.xlsx,.doc,.docx"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                    <div style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
                                        {/* Show loading indicator for existing documents */}
                                        {/* {isLoadingDocuments && (
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '5px', 
                                        color: '#2e7d32',
                                        marginBottom: '5px'
                                    }}>
                                        <div style={{
                                            width: '12px',
                                            height: '12px',
                                            border: '2px solid #2e7d32',
                                            borderTop: '2px solid transparent',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite'
                                        }}></div>
                                        Loading existing documents...
                                    </div>
                                )} */}

                                        {/* Show existing documents */}
                                        {existingDocuments.length > 0 && (
                                            <div style={{ marginBottom: '5px' }}>
                                                {/* Debug Test Button - Can be removed if not needed */}
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center' }}>
                                                    {existingDocuments.map((doc, index) => {
                                                        // Debug logging can be removed if not needed

                                                        // Try different possible field names for document ID
                                                        const docId = doc.documentId || doc.id || doc.document_id || doc.documentID;

                                                        return (
                                                            <span key={`existing-${index}`} style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                padding: '4px 8px',
                                                                backgroundColor: '#e8f5e8',
                                                                borderRadius: '6px',
                                                                border: '1px solid #c8e6c9',
                                                                fontSize: '12px',
                                                                fontFamily: "'Roboto', sans-serif",
                                                                fontWeight: '500',
                                                                color: '#2e7d32'
                                                            }}>
                                                                <span style={{ marginRight: '5px' }}>📄</span>
                                                                <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                    {(doc.documentName ? doc.documentName.split('/').pop() : null) || `Document ${index + 1}`}
                                                                </span>
                                                                {doc.fileSize && (
                                                                    <span style={{
                                                                        marginRight: '5px',
                                                                        fontSize: '11px',
                                                                        color: '#2e7d32',
                                                                        fontWeight: '400'
                                                                    }}>
                                                                        ({(() => {
                                                                            const size = doc.fileSize;
                                                                            if (size === 0) return '0 B';
                                                                            const units = ['B', 'KB', 'MB', 'GB'];
                                                                            let fileSize = size;
                                                                            let unitIndex = 0;
                                                                            while (fileSize >= 1024 && unitIndex < units.length - 1) {
                                                                                fileSize /= 1024;
                                                                                unitIndex++;
                                                                            }
                                                                            return `${fileSize.toFixed(1)} ${units[unitIndex]}`;
                                                                        })()})
                                                                    </span>
                                                                )}
                                                                <span
                                                                    onClick={async () => {
                                                                        if (readOnly || deletingDocumentId === docId) return; // Prevent multiple clicks and disable in readOnly

                                                                        try {
                                                                            // Call backend API to delete the document
                                                                            if (docId) {
                                                                                setDeletingDocumentId(docId);
                                                                                console.log('=== DELETING DOCUMENT FROM BACKEND ===');
                                                                                console.log('Document ID:', docId);
                                                                                console.log('Document name:', doc.documentName);
                                                                                console.log('Full document object:', doc);

                                                                                // Try the DocumentService first
                                                                                let result;
                                                                                try {
                                                                                    result = await DocumentService.deleteDocumentWithPhysicalFile(
                                                                                        docId,
                                                                                        'recep' // You may want to get this from auth context
                                                                                    );
                                                                                    console.log('Delete API response:', result);
                                                                                } catch (serviceError) {
                                                                                    console.warn('DocumentService failed, trying direct API call:', serviceError);
                                                                                    // Fallback to direct API call
                                                                                    result = await testDocumentDeletion(docId);
                                                                                }

                                                                                if (result.success) {
                                                                                    console.log('Document deleted successfully from backend');
                                                                                    // Remove document from existing documents list
                                                                                    setExistingDocuments(prev => prev.filter((_, i) => i !== index));
                                                                                    const fileNameOnly = doc.documentName.split('/').pop() || doc.documentName;
                                                                                    setSnackbarMessage(`Document "${fileNameOnly}" deleted successfully!`);
                                                                                    setSnackbarOpen(true);
                                                                                } else {
                                                                                    console.error('Failed to delete document from backend:', result.error);
                                                                                    setSnackbarMessage(`Failed to delete document: ${result.error || 'Unknown error'}`);
                                                                                    setSnackbarOpen(true);
                                                                                }
                                                                            } else {
                                                                                console.warn('No document ID found, removing from UI only');
                                                                                console.log('Document object without ID:', doc);
                                                                                // Remove document from existing documents list (fallback)
                                                                                setExistingDocuments(prev => prev.filter((_, i) => i !== index));
                                                                            }
                                                                        } catch (error: any) {
                                                                            console.error('Error deleting document:', error);
                                                                            console.error('Error details:', {
                                                                                message: error instanceof Error ? error.message : 'Unknown error',
                                                                                stack: error instanceof Error ? error.stack : 'No stack trace',
                                                                                response: error.response || 'No response object'
                                                                            });
                                                                            setSnackbarSeverity('error');
                                                                            setSnackbarMessage(`Error deleting document: ${error instanceof Error ? error.message : 'Unknown error'}`);
                                                                            setSnackbarOpen(true);
                                                                        } finally {
                                                                            setDeletingDocumentId(null);
                                                                        }
                                                                    }}
                                                                    style={{
                                                                        color: (readOnly || deletingDocumentId === docId) ? '#9e9e9e' : '#d32f2f',
                                                                        cursor: (readOnly || deletingDocumentId === docId) ? 'not-allowed' : 'pointer',
                                                                        fontSize: '14px',
                                                                        padding: '0',
                                                                        marginLeft: '5px',
                                                                        fontWeight: 'bold',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        width: '16px',
                                                                        height: '16px',
                                                                        borderRadius: '50%',
                                                                        backgroundColor: (readOnly || deletingDocumentId === docId) ? 'rgba(158, 158, 158, 0.1)' : 'rgba(211, 47, 47, 0.1)',
                                                                        transition: 'background-color 0.2s',
                                                                        opacity: (readOnly || deletingDocumentId === docId) ? 0.6 : 1,
                                                                        pointerEvents: readOnly ? 'none' : 'auto'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        if (!readOnly && deletingDocumentId !== docId) {
                                                                            e.currentTarget.style.backgroundColor = 'rgba(211, 47, 47, 0.2)';
                                                                        }
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        if (!readOnly && deletingDocumentId !== docId) {
                                                                            e.currentTarget.style.backgroundColor = 'rgba(211, 47, 47, 0.1)';
                                                                        }
                                                                    }}
                                                                    title={readOnly ? "Read-only mode" : (deletingDocumentId === docId ? "Deleting..." : "Remove document")}
                                                                >
                                                                    ×
                                                                </span>
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Show uploaded files */}
                                        {formData.attachments.length > 0 && (
                                            <div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center' }}>
                                                    {formData.attachments.map((file, index) => (
                                                        <span key={index} style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            padding: '4px 8px',
                                                            backgroundColor: 'white',
                                                            borderRadius: '6px',
                                                            border: '1px solid #B7B7B7',
                                                            fontSize: '12px',
                                                            fontFamily: "'Roboto', sans-serif",
                                                            fontWeight: '500'
                                                        }}>
                                                            <span style={{ marginRight: '5px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                {file.name}
                                                            </span>
                                                            <span style={{
                                                                marginRight: '5px',
                                                                fontSize: '11px',
                                                                color: '#666',
                                                                fontWeight: '400'
                                                            }}>
                                                                ({(() => {
                                                                    const size = file.size;
                                                                    if (size === 0) return '0 B';
                                                                    const units = ['B', 'KB', 'MB', 'GB'];
                                                                    let fileSize = size;
                                                                    let unitIndex = 0;
                                                                    while (fileSize >= 1024 && unitIndex < units.length - 1) {
                                                                        fileSize /= 1024;
                                                                        unitIndex++;
                                                                    }
                                                                    return `${fileSize.toFixed(1)} ${units[unitIndex]}`;
                                                                })()})
                                                            </span>
                                                            <span
                                                                onClick={() => !readOnly && removeFile(index)}
                                                                style={{
                                                                    color: readOnly ? '#9e9e9e' : 'black',
                                                                    cursor: readOnly ? 'not-allowed' : 'pointer',
                                                                    fontSize: '14px',
                                                                    padding: '0',
                                                                    marginLeft: '5px',
                                                                    fontWeight: 'bold',
                                                                    opacity: readOnly ? 0.5 : 1,
                                                                    pointerEvents: readOnly ? 'none' : 'auto'
                                                                }}
                                                                title={readOnly ? "Read-only mode" : "Remove file"}
                                                            >
                                                                ×
                                                            </span>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                </div>
                                <div>
                                    {/* Empty third column */}
                                </div>
                            </div>

                        </div>

                        {/* Attachments */}
                        <style>{`
                    .attachmentInput{ border: none !important; }
                    .referral-add-icon {
                        padding: 8px 15px !important;
                        outline: none !important;
                        box-shadow: none !important;
                        border: none !important;
                        margin: 0 !important;
                        transform: translateY(-50%) !important;
                        position: absolute !important;
                        top: 50% !important;
                        right: 4px !important;
                        left: auto !important;
                        bottom: auto !important;
                    }
                    .referral-add-icon:focus,
                    .referral-add-icon:active,
                    .referral-add-icon:hover {
                        outline: none !important;
                        box-shadow: none !important;
                        border: none !important;
                        margin: 0 !important;
                        transform: translateY(-50%) !important;
                        position: absolute !important;
                        top: 50% !important;
                        right: 4px !important;
                        left: auto !important;
                        bottom: auto !important;
                    }
                    input[type="checkbox"] {
                        width: auto !important;
                    }
                    /* Hide number input spinners */
                    input[type="number"]::-webkit-inner-spin-button,
                    input[type="number"]::-webkit-outer-spin-button {
                        -webkit-appearance: none;
                        margin: 0;
                    }
                    input[type="number"] {
                        -moz-appearance: textfield;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>

                        {/* Footer */}
                        <div style={{
                            background: 'transparent',
                            padding: '0 20px 14px',
                            borderBottomLeftRadius: '8px',
                            borderBottomRightRadius: '8px',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '8px'
                        }}>
                            <button
                                onClick={onClose}
                                disabled={readOnly}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: readOnly ? '#9e9e9e' : '#1976d2',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: readOnly ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    transition: 'background-color 0.2s',
                                    opacity: readOnly ? 0.6 : 1
                                }}
                                onMouseEnter={(e) => {
                                    if (!readOnly) {
                                        e.currentTarget.style.backgroundColor = '#1565c0';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!readOnly) {
                                        e.currentTarget.style.backgroundColor = '#1976d2';
                                    }
                                }}
                            >
                                Close
                            </button>
                            <button
                                onClick={handleReset}
                                disabled={readOnly}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: readOnly ? '#9e9e9e' : '#1976d2',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: readOnly ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    transition: 'background-color 0.2s',
                                    opacity: readOnly ? 0.6 : 1
                                }}
                                onMouseEnter={(e) => {
                                    if (!readOnly) {
                                        e.currentTarget.style.backgroundColor = '#1565c0';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!readOnly) {
                                        e.currentTarget.style.backgroundColor = '#1976d2';
                                    }
                                }}
                            >
                                Reset
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                style={{
                                    backgroundColor: isLoading ? '#9e9e9e' : '#1976d2',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 20px',
                                    borderRadius: '4px',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    fontWeight: 'bold',
                                    opacity: isLoading ? 0.6 : 1
                                }}
                                onMouseEnter={(e) => {
                                    if (!isLoading) {
                                        e.currentTarget.style.backgroundColor = '#1565c0';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isLoading) {
                                        e.currentTarget.style.backgroundColor = '#1976d2';
                                    }
                                }}
                            >
                                {isLoading ? 'Saving...' : 'Submit'}
                            </button>
                        </div>
                    </div>
                </div >
            )}

            {/* Success Snackbar - Always rendered outside modal */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000} // Increased duration to 4 seconds for readability
                onClose={() => {
                    console.log('=== SNACKBAR ONCLOSE TRIGGERED ===');
                    setSnackbarOpen(false);
                }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                sx={{ zIndex: 99999 }}
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity={snackbarSeverity}
                    variant="filled"
                    sx={{
                        width: '100%',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        backgroundColor: snackbarSeverity === 'error' ? '#d32f2f' : '#2e7d32',
                        color: 'white',
                        '& .MuiAlert-icon': {
                            fontSize: '24px',
                            color: 'white'
                        }
                    }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>

            {/* Add New Referral Popup */}
            <AddReferralPopup
                open={showReferralPopup}
                onClose={() => setShowReferralPopup(false)}
                onSave={(referralData: ReferralData) => {
                    // Update form data with the new doctor info
                    setFormData(prev => ({
                        ...prev,
                        referralName: referralData.doctorName || '',
                        referralContact: referralData.doctorMob || '',
                        referralEmail: referralData.doctorMail || '',
                        referralAddress: referralData.doctorAddress || ''
                    }));
                    setReferralNameSearch(referralData.doctorName || '');
                    setSelectedDoctor(referralData as any);
                    setShowReferralPopup(false);

                    // Also refresh options if needed
                    if (!isSelfReferral()) {
                        handleReferralNameSearch(referralData.doctorName || '');
                    }
                }}
                clinicId={currentClinicId || String((patientData as any)?.clinicId || sessionDataForQuickReg?.clinicId || '')}
            />

            {/* Quick Registration Modal - appears on top of Patient Visit Details window */}
            {
                showQuickRegistration && patientData?.patientId && (
                    <AddPatientPage
                        open={showQuickRegistration}
                        onClose={() => {
                            setShowQuickRegistration(false);
                            setSessionDataForQuickReg(null);
                        }}
                        patientId={String(patientData.patientId)}
                        readOnly={true}
                        doctorId={(patientData as any)?.doctorId || sessionDataForQuickReg?.doctorId}
                        clinicId={(patientData as any)?.clinicId || sessionDataForQuickReg?.clinicId}
                    />
                )
            }
        </>
    );
};

export default PatientVisitDetails;

// Page wrapper to render via route and accept patientData through location.state
// (Standalone page wrapper removed as per revert request)
