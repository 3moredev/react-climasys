import React, { useState } from 'react';
import { Close, Add, Delete } from '@mui/icons-material';
import {
    Snackbar, Alert, Dialog, DialogTitle, DialogContent,
    DialogActions, Grid, Box, Typography, TextField, Button,
    IconButton, Checkbox, FormControlLabel, MenuItem,
    InputAdornment, CircularProgress, Tooltip
} from '@mui/material';
import { visitService, ComprehensiveVisitDataRequest } from '../services/visitService';
import { complaintService, ComplaintOption } from '../services/complaintService';
import { DocumentService } from '../services/documentService';
import { sessionService } from '../services/sessionService';
import { doctorService } from '../services/doctorService';
import AddReferralPopup, { ReferralData } from '../components/AddReferralPopup';
import AddPatientPage from './AddPatientPage';
import PatientNameDisplay from '../components/PatientNameDisplay';
import ClearableTextField from '../components/ClearableTextField';
import { getFieldConfig } from '../utils/fieldValidationConfig';
import { validateField } from '../utils/validationUtils';

interface AppointmentRow {
    reports_received: any;
    appointmentId?: string;
    sr: number;
    patient: string;
    patientId: string;
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

    const [formData, setFormData] = useState({
        referralBy: '',
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
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning'>('success');


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
    const [fileValidationMessage, setFileValidationMessage] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string | null }>({});

    const isSelfReferral = formData.referralBy === 'Self' || formData.referralBy === 'S' || referByOptions.find(opt => opt.id === formData.referralBy)?.name === 'Self';

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
    const [deletingDocumentId, setDeletingDocumentId] = useState<number | null>(null);
    const [initialComplaintsFromApi, setInitialComplaintsFromApi] = useState<string | null>(null);

    // Check ref to store the computed follow-up state for restoration on Reset
    const computedFollowUp = React.useRef<{ followUp: boolean, followUpType: string } | null>(null);

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
        const config = getFieldConfig('complaintComment', 'visit');
        if (config?.maxLength && text.length > config.maxLength) {
            return;
        }
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
            const result = await DocumentService.uploadMultipleDocumentsToBackend(
                files,
                patientId,
                doctorId,
                clinicId,
                patientVisitNo,
                'recep', // You may want to get this from auth context
                new Date().toISOString().slice(0, 19).replace('T', ' ')
            );

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

        try {

            const result = await DocumentService.getDocumentsByVisit(patientId, visitNo);

            if (result.success && result.documents) {
                setExistingDocuments(result.documents);
            } else {
                setExistingDocuments([]);
            }
        } catch (error) {
            console.error('Error loading existing documents:', error);
            setExistingDocuments([]);
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

        // Parse format like: "ComplaintName (Duration/Comment), AnotherComplaint (Comment), ThirdComplaint"
        // Regex to split by comma but ignore commas inside parentheses
        const parts = raw.split(/,(?![^(]*\))/).map(s => s.trim()).filter(Boolean);
        if (parts.length === 0) return;

        const foundValues: string[] = [];
        const foundRows: ComplaintRow[] = [];
        const seen = new Set<string>();

        parts.forEach(fullString => {
            // Extract Name and optional Comment
            // Match "Name (Comment)" or just "Name"
            const match = fullString.match(/^(.*?)(?:\s*\((.*)\))?$/);
            if (!match) return;

            const namePart = match[1].trim();
            const commentPart = match[2] ? match[2].trim() : '';

            // Try to match by value first, then by label (case-insensitive)
            const byValue = complaintsOptions.find(o => (o.value || '').toLowerCase() === namePart.toLowerCase());
            const byLabel = byValue ? undefined : complaintsOptions.find(o => (o.label || '').toLowerCase() === namePart.toLowerCase());
            const matchedOption = byValue || byLabel;

            if (matchedOption && !seen.has(matchedOption.value)) {
                seen.add(matchedOption.value);
                foundValues.push(matchedOption.value);
                foundRows.push({
                    id: `${matchedOption.value}`,
                    value: matchedOption.value,
                    label: matchedOption.label,
                    comment: commentPart
                });
            } else if (!matchedOption && namePart) {
                // Use name as value if not found in options (fallback)
                // This handles cases where complaint might not be in current doctor's list
                if (!seen.has(namePart)) {
                    seen.add(namePart);
                    foundValues.push(namePart);
                    foundRows.push({
                        id: `${namePart}`,
                        value: namePart,
                        label: namePart,
                        comment: commentPart
                    });
                }
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

    // Automate Follow-Up checkbox state based on visit history
    React.useEffect(() => {
        if (!open || !patientData?.patientId) return;

        let cancelled = false;
        async function checkVisitHistory() {
            try {
                const history = await visitService.getPatientVisitHistory(String(patientData!.patientId));
                if (cancelled) return;

                if (history && history.visits && Array.isArray(history.visits)) {
                    // Check if any visit has statusId === 5 (Visited/Completed)
                    // We check multiple property names to be safe as backend response format varies
                    const hasVisitedStatus = history.visits.some((v: any) => {
                        const sid = v.statusId ?? v.status_id ?? v.visitStatusId;
                        return Number(sid) === 5;
                    });

                    if (hasVisitedStatus) {
                        const newState = {
                            followUp: true,
                            followUpType: 'Follow-up'
                        };
                        computedFollowUp.current = newState;
                        setVisitType(prev => ({
                            ...prev,
                            ...newState
                        }));
                    } else {
                        const newState = {
                            followUp: false,
                            followUpType: 'New'
                        };
                        computedFollowUp.current = newState;
                        setVisitType(prev => ({
                            ...prev,
                            ...newState
                        }));
                    }
                }
            } catch (error) {
                console.error('Failed to check visit history for follow-up status:', error);
            }
        }

        checkVisitHistory();

        return () => { cancelled = true; };
    }, [open, patientData?.patientId]);

    // Load appointment details when dialog opens and patient data is available
    React.useEffect(() => {
        let cancelled = false;
        async function loadAppointmentDetails() {
            try {
                if (!open || !patientData?.patientId) return;

                setIsLoadingAppointmentDetails(true);
                setError(null); // Clear any previous errors            
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

                const result: any = await visitService.getAppointmentDetails(appointmentParams);
                if (cancelled) return;

                if (!result || !result.found || !result.mainData || result.mainData.length === 0) {
                    setIsLoadingAppointmentDetails(false);
                    return;
                }

                // Use the first item from mainData array as requested
                const appointmentData = result.mainData[0];

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
                    // Treat zero values as empty strings for vital signs
                    pulse: (appointmentData.pulse && appointmentData.pulse !== 0) ? appointmentData.pulse : '',
                    height: (appointmentData.heightInCms && appointmentData.heightInCms !== 0) ? appointmentData.heightInCms : '',
                    weight: (appointmentData.weightInKgs && appointmentData.weightInKgs !== 0) ? appointmentData.weightInKgs : '',
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
                        patched.referralBy = matchExists ? referIdStr : '';
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

                // Load existing documents for this patient visit using the correct visit number
                if (patientData?.patientId) {
                    const visitNoToLoad = Number(patientData.visitNumber || appointmentData?.patientVisitNo || 1);
                    await loadExistingDocuments(String(patientData.patientId), visitNoToLoad);
                }

            } catch (e) {
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
                            // Treat zero values as empty strings for vital signs
                            pulse: ((payload.pulse ?? payload.pulsePerMin) && (payload.pulse ?? payload.pulsePerMin) !== 0) ? (payload.pulse ?? payload.pulsePerMin) : '',
                            height: ((payload.heightInCms ?? payload.height) && (payload.heightInCms ?? payload.height) !== 0) ? (payload.heightInCms ?? payload.height) : '',
                            weight: ((payload.weightInKgs ?? payload.weight) && (payload.weightInKgs ?? payload.weight) !== 0) ? (payload.weightInKgs ?? payload.weight) : '',
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
                                patched.referralBy = matchExists ? referIdStr : '';
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
                    const pid = String(patientData.patientId);
                    let lastVisitResult: any = null;
                    try {
                        lastVisitResult = await visitService.getLastVisitDetails(pid);
                    } catch (lastVisitError: any) {
                        // If API returns 404 or "not found" error, there's no last visit
                        if (lastVisitError?.response?.status === 404 ||
                            lastVisitError?.message?.includes('not found') ||
                            lastVisitError?.message?.includes('Last visit details not found')) {
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

                            const planValue = previousPlan ? String(previousPlan).trim() : '';
                            const complaintValue = previousComplaint ? String(previousComplaint).trim() : '';

                            setFormData(prev => {
                                const updated = {
                                    ...prev,
                                    ...(planValue && { previousVisitPlan: planValue }),
                                    ...(complaintValue && { chiefComplaint: complaintValue })
                                };
                                return updated;
                            });

                            console.log('Valid last visit exists - Loaded plan and complaint');
                        } else {
                            console.log('No valid last visit - lastVisitPayload is empty or missing key fields');
                        }
                    } else {
                        console.log('No last visit result');
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

    const handleInputChange = (field: string, value: any) => {
        const fieldConfig = getFieldConfig(field, 'visit');
        let processedValue = value;

        // Strict Character Filtering at Source
        if (field === 'referralName') {
            processedValue = value.replace(/[^a-zA-Z\s.'-]/g, '');
        } else if (field === 'referralContact' || field === 'pulse') {
            processedValue = value.replace(/[^0-9]/g, '');
        } else if (field === 'height' || field === 'weight') {
            // Allow digits and at most one dot
            processedValue = value.replace(/[^0-9.]/g, '');
            const parts = processedValue.split('.');
            if (parts.length > 2) {
                processedValue = parts[0] + '.' + parts.slice(1).join('');
            }
        }

        // Real-time Validation Result
        let { allowed, error } = validateField(field, processedValue, undefined, undefined, 'visit');

        // Input blocking: Prevent typing beyond maxLength, but still set the validation error
        if (!allowed) {
            setValidationErrors(prev => ({ ...prev, [field]: error }));
            return;
        }

        // Custom error message override for height and weight to include units
        if (error) {
            if (field === 'height' && (parseFloat(processedValue) < 30 || parseFloat(processedValue) > 250)) {
                error = 'Height must be between 30 and 250';
            } else if (field === 'weight' && (parseFloat(processedValue) < 1 || parseFloat(processedValue) > 250)) {
                error = 'Weight must be between 1 and 250';
            } else if (field === 'pulse' && (parseFloat(processedValue) < 30 || parseFloat(processedValue) > 220)) {
                error = 'Pulse must be between 30 and 220';
            }
        }

        setFormData(prev => {
            const newData = { ...prev, [field]: processedValue };

            // Calculate BMI when height or weight changes
            if (field === 'height' || field === 'weight') {
                const height = field === 'height' ? parseFloat(processedValue) : parseFloat(prev.height);
                const weight = field === 'weight' ? parseFloat(processedValue) : parseFloat(prev.weight);

                if (height > 0 && weight > 0) {
                    newData.bmi = (weight / ((height / 100) * (height / 100))).toFixed(1);
                } else {
                    newData.bmi = '';
                }
            }

            // Clear referral contact fields when referral name is cleared or changed from selected doctor
            if (field === 'referralName' && (!processedValue || processedValue.trim() === '' || (selectedDoctor && processedValue !== selectedDoctor.doctorName))) {
                newData.referralContact = '';
                newData.referralEmail = '';
                newData.referralAddress = '';
            }

            // Reset referral name search when referral type changes
            if (field === 'referralBy') {
                newData.referralName = '';
                newData.referralContact = '';
                newData.referralEmail = '';
                newData.referralAddress = '';
                setSelectedDoctor(null);
                setReferralNameSearch('');
                setReferralNameOptions([]);
            }

            return newData;
        });

        // Clear selectedDoctor state if referralName input changes and doesn't match anymore
        if (field === 'referralName' && selectedDoctor && processedValue !== selectedDoctor.doctorName) {
            setSelectedDoctor(null);
        }

        // Update validation errors state
        setValidationErrors(prev => {
            const newErrors = { ...prev };
            if (error) {
                newErrors[field] = error;
            } else {
                delete newErrors[field];
            }
            return newErrors;
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFileValidationMessage(null);
        const newFiles = Array.from(e.target.files || []);
        if (newFiles.length === 0) return;

        const maxFiles = 3;
        const maxSizeMB = 150;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'xls', 'xlsx', 'doc', 'docx'];

        const currentTotalCount = (formData.attachments?.length || 0) + (existingDocuments?.length || 0);

        // Check file extensions first
        const invalidFiles = newFiles.filter(file => {
            const ext = file.name.split('.').pop()?.toLowerCase();
            return !ext || !allowedExtensions.includes(ext);
        });

        if (invalidFiles.length > 0) {
            setFileValidationMessage(`Invalid file format. Allowed: .jpg, .jpeg, .png, .pdf, .xls, .xlsx, .doc, .docx`);
            if (e.target) e.target.value = '';
            return;
        }

        if (currentTotalCount + newFiles.length > maxFiles) {
            setFileValidationMessage(`Total files (uploaded + existing) cannot exceed ${maxFiles}.`);
            if (e.target) e.target.value = '';
            return;
        }

        // Check for duplicate names (case-insensitive) - check against BOTH pending attachments and existing documents
        const existingNames = new Set<string>();

        // Add names from pending attachments
        (formData.attachments || []).forEach(f => existingNames.add(f.name.toLowerCase()));

        // Add names from existing documents (need to handle partial paths if present)
        (existingDocuments || []).forEach(doc => {
            const name = doc.documentName || doc.name || '';
            // Extract filename from path if needed (e.g. "path/to/file.pdf" -> "file.pdf")
            const cleanName = name.split('/').pop()?.split('\\').pop() || name;
            existingNames.add(cleanName.toLowerCase());
        });

        // Check if any new file conflicts
        const duplicateFiles = newFiles.filter(file => existingNames.has(file.name.toLowerCase()));

        if (duplicateFiles.length > 0) {
            const duplicateNames = duplicateFiles.map(f => f.name).join(', ');
            setFileValidationMessage(`Duplicate file(s) detected: ${duplicateNames}. Please rename or remove existing files.`);
            if (e.target) e.target.value = '';
            return;
        }

        const attachedSize = (formData.attachments || []).reduce((sum, f) => sum + f.size, 0);
        const existingSize = (existingDocuments || []).reduce((sum, doc) => sum + (doc.fileSize || 0), 0);
        const newFilesSize = newFiles.reduce((sum, f) => sum + f.size, 0);

        if (attachedSize + existingSize + newFilesSize > maxSizeBytes) {
            setFileValidationMessage(`Total file size (including existing) exceeds the ${maxSizeMB}MB limit.`);
            if (e.target) e.target.value = '';
            return;
        }

        setFormData(prev => ({
            ...prev,
            attachments: [...(prev.attachments || []), ...newFiles]
        }));

        if (e.target) e.target.value = '';
    };

    // Search referral names when typing
    const handleReferralNameSearch = async (searchTerm: string) => {
        const fieldConfig = getFieldConfig('referralName', 'visit');

        // Allow only alphabets and spaces
        const cleanSearchTerm = searchTerm.replace(/[^a-zA-Z\s.'-]/g, '');

        // Input blocking: Prevent typing beyond maxLength
        if (fieldConfig?.maxLength && cleanSearchTerm.length > fieldConfig.maxLength) {
            return;
        }

        setReferralNameSearch(cleanSearchTerm);

        // Real-time Validation Result
        const { error } = validateField('referralName', cleanSearchTerm, undefined, undefined, 'visit');

        // Update validation errors state
        setValidationErrors(prev => {
            const newErrors = { ...prev };
            if (error) {
                newErrors.referralName = error;
            } else {
                delete newErrors.referralName;
            }
            return newErrors;
        });

        if (cleanSearchTerm.length < 2) {
            setReferralNameOptions([]);
            return;
        }

        setIsSearchingReferral(true);
        try {
            // Call the actual referral doctors API
            const { getReferralDoctors } = await import('../services/referralService');
            const doctors = await getReferralDoctors(1); // languageId = 1

            // Filter doctors by name containing the search term
            const filteredDoctors = doctors.filter(doctor =>
                doctor.doctorName.toLowerCase().includes(cleanSearchTerm.toLowerCase())
            );

            // Store the full doctor data for later use
            setReferralNameOptions(filteredDoctors.map(doctor => ({
                id: doctor.rdId.toString(),
                name: doctor.doctorName,
                fullData: doctor // Store the complete doctor object
            })));
        } catch (error) {
            console.error('Error searching referral names:', error);
            setReferralNameOptions([]);
        } finally {
            setIsSearchingReferral(false);
        }
    };

    // Check if current referral by is a doctor (specifically referId "D")
    const isDoctorReferral = () => {
        return formData.referralBy === 'D' || referByOptions.find(opt => opt.id === formData.referralBy)?.name === 'Doctor';
    };


    const validateForm = () => {
        const errors: { [key: string]: string } = {};

        // Pulse validation (optional, but range check if provided)
        if (formData.pulse) {
            const val = parseFloat(formData.pulse);
            if (isNaN(val) || val < 30 || val > 220) {
                errors.pulse = 'Pulse must be between 30 and 220';
            }
        }

        // Height range check if provided
        if (formData.height) {
            const val = parseFloat(formData.height);
            if (isNaN(val) || val < 30 || val > 250) {
                errors.height = 'Height must be between 30 and 250';
            }
        }

        // Weight range check if provided
        if (formData.weight) {
            const val = parseFloat(formData.weight);
            if (isNaN(val) || val < 1 || val > 250) {
                errors.weight = 'Weight must be between 1 and 250';
            }
        }

        // BP format check if provided
        if (formData.bp) {
            const bpRegex = /^\d{2,3}[\/\-]\d{2,3}$/;
            if (!bpRegex.test(formData.bp)) {
                errors.bp = 'Invalid BP format (e.g. 120/80)';
            }
        }

        // Referral Contact/Email checks if provided
        if (formData.referralContact) {
            if (!/^\d{10}$/.test(formData.referralContact)) {
                errors.referralContact = 'Mobile number must be 10 digits';
            }
        }
        if (formData.referralEmail) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.referralEmail)) {
                errors.referralEmail = 'Invalid email address';
            }
        }

        // Generic Max Length Checks
        const fieldsToCheck = [
            'visitComments', 'currentMedicines', 'referralName',
            'referralAddress', 'tft', 'pastSurgicalHistory',
            'instructionGroupComments', 'sugar'
        ];

        fieldsToCheck.forEach(field => {
            const value = (formData as any)[field];
            const config = getFieldConfig(field, 'visit');
            if (config?.maxLength && value && value.length > config.maxLength) {
                errors[field] = `${config.fieldName} exceeds maximum length of ${config.maxLength} characters`;
            }
        });

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleDownloadDocument = (docId: number) => {
        try {
            // Get the direct download URL
            const url = DocumentService.getDownloadUrl(docId);

            // Create a temporary anchor element and trigger download
            // Browsers will handle this as a navigation/download, showing native progress
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank'; // Open in new tab to avoid disrupting current page
            link.rel = 'noopener noreferrer';

            // Append to body, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error("Error initiating download", error);
            setSnackbarMessage(`Error initiating download: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const [documentsToDelete, setDocumentsToDelete] = useState<number[]>([]);

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }
        try {
            const todayDate = new Date();

            setIsLoading(true);
            setError(null);
            setSuccess(null);
            // Don't set initial success severity, as we want to handle all messages at end

            let sessionData = null;
            try {
                const sessionResult = await sessionService.getSessionInfo();
                if (sessionResult.success) {
                    sessionData = sessionResult.data;
                }
            } catch (sessionError) {
                console.warn('Could not load session data:', sessionError);
            }
            const doctorId = (patientData as any)?.doctorId || sessionData?.doctorId;
            const clinicId = (patientData as any)?.clinicId || sessionData?.clinicId;
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

            const patientVisitNo = (patientData as any)?.visitNumber;
            if (!patientVisitNo) {
                throw new Error('Patient Visit Number is required but not found in appointment data');
            }

            const visitData: ComprehensiveVisitDataRequest = {
                patientId: patientData?.patientId?.toString() || '',
                doctorId: String(doctorId),
                clinicId: String(clinicId),
                shiftId: String(shiftId),
                visitDate: (() => {
                    const now = new Date();
                    return now.toISOString().slice(0, 10) + 'T' + now.toTimeString().slice(0, 8);
                })(),
                patientVisitNo: String(patientVisitNo),

                referBy: (formData.referralBy === 'Self')
                    ? (referByOptions.find(o => o.name.toLowerCase() === 'self')?.id || 'Self')
                    : formData.referralBy,
                referralName: formData.referralBy === 'Self' ? 'Self' : formData.referralName,
                referralContact: formData.referralBy === 'Self' ? '' : formData.referralContact,
                referralEmail: formData.referralBy === 'Self' ? '' : formData.referralEmail,
                referralAddress: formData.referralBy === 'Self' ? '' : formData.referralAddress,

                pulse: parseFloat(formData.pulse) || 0,
                heightInCms: parseFloat(formData.height) || 0,
                weightInKgs: parseFloat(formData.weight) || 0,
                bloodPressure: formData.bp,
                sugar: formData.sugar,
                tft: formData.tft,

                pastSurgicalHistory: formData.pastSurgicalHistory,
                previousVisitPlan: formData.previousVisitPlan,
                chiefComplaint: formData.chiefComplaint,
                visitComments: formData.visitComments,
                currentMedicines: formData.currentMedicines,

                hypertension: false,
                diabetes: false,
                cholestrol: false,
                ihd: false,
                th: false,
                asthama: false,
                smoking: false,
                tobaco: false,
                alchohol: false,

                habitDetails: '',
                allergyDetails: '',
                observation: '',
                inPerson: inPersonChecked,
                symptomComment: '',
                reason: '',
                impression: '',
                attendedBy: '',
                paymentById: 1,
                paymentRemark: '',
                attendedById: 0,
                followUp: visitType.followUpType,
                followUpFlag: visitType.followUp,

                currentComplaint: complaintsRows.map(row => {
                    const cleanLabel = row.label.trim();
                    const cleanComment = row.comment.trim();
                    if (cleanComment) {
                        return `${cleanLabel} (${cleanComment})`;
                    }
                    return cleanLabel;
                }).join(', '),
                visitCommentsField: formData.visitComments,

                tpr: '',
                importantFindings: '',
                additionalComments: '',
                systemic: '',
                odeama: '',
                pallor: '',
                gc: '',
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

                feesToCollect: 0,
                feesPaid: 0,
                discount: 0,
                originalDiscount: 0,

                // Status and user - Use appropriate status for submitted visit details
                statusId: 1, // WITH DOCTOR status for submitted visit details
                userId: String(userId), // Use validated user ID as string
                isSubmitPatientVisitDetails: true
            };

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
                throw new Error(`Required fields are missing: ${nullFields.join(', ')}`);
            }

            console.log('DEBUG: Submitting visitData:', visitData);
            console.log('DEBUG: formData.referralBy:', formData.referralBy);
            // console.log('DEBUG: referByOptions:', referByOptions);

            const result = await visitService.saveComprehensiveVisitData(visitData);

            let hasUploadError = false;
            let hasDeleteError = false;

            if (result.success) {

                // Process Deletions
                if (documentsToDelete.length > 0) {
                    try {
                        await Promise.all(documentsToDelete.map(docId => DocumentService.deleteDocument(docId)));
                        // Clear deletion list on success
                        setDocumentsToDelete([]);
                    } catch (deleteErr) {
                        console.error("Error deleting documents:", deleteErr);
                        hasDeleteError = true;
                    }
                }

                // Upload documents if any are attached
                if (formData.attachments && formData.attachments.length > 0) {
                    try {
                        const documentResults = await handleDocumentUpload(
                            formData.attachments,
                            patientData?.patientId?.toString() || '',
                            String(doctorId), // Use validated doctor ID
                            String(clinicId), // Use validated clinic ID
                            Number(patientVisitNo) // Use validated visit number
                        );

                        // Check if all documents uploaded successfully
                        const failedUploads = documentResults.filter(result => !result.success);
                        if (failedUploads.length > 0) {
                            hasUploadError = true;
                        }

                        // Clear selected attachments after successful upload
                        setFormData(prev => ({ ...prev, attachments: [] }));
                    } catch (documentError) {
                        hasUploadError = true;
                    }
                }

                // Consolidate Feedback
                if (hasUploadError || hasDeleteError) {
                    setSnackbarSeverity('warning');
                    setSnackbarMessage('Visit details saved, but there were issues with document updates.');
                } else {
                    setSnackbarSeverity('success');
                    setSnackbarMessage('Patient details saved successfully');
                }

                // Show success snackbar
                setSnackbarOpen(true);

                // Refresh existing documents list
                try {
                    if (patientData?.patientId && patientVisitNo) {
                        await loadExistingDocuments(String(patientData.patientId), Number(patientVisitNo));
                    }
                } catch (reloadErr) {
                    console.warn('Failed to reload existing documents:', reloadErr);
                }

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
                    }
                } catch (e) {
                    console.error('Failed to save visit submission state to localStorage', e);
                }

                setError(null);
                setSuccess(null);

                // Close modal after showing snackbar
                setTimeout(() => {
                    if (onClose) onClose();
                }, 2000);
            } else {
                console.error('Error:', result.error || 'Failed to save visit details');
                setError(result.error || 'Failed to save visit details');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred while saving visit details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            referralBy: '',
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
        setValidationErrors({})
        // Reset inPerson based on current status
        const status = String(patientData?.status || '').trim().toUpperCase();
        const normalizedStatus = status === 'ON CALL' ? 'CONSULT ON CALL' : status;
        const resetInPerson = normalizedStatus === 'CONSULT ON CALL' || (normalizedStatus !== 'WAITING' && normalizedStatus !== 'WITH DOCTOR') ? false : true;

        setVisitType({
            inPerson: resetInPerson,
            followUp: computedFollowUp.current?.followUp ?? false,
            followUpType: computedFollowUp.current?.followUpType ?? 'New'
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
        setDeletingDocumentId(null);
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
                <DialogTitle sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }} className='mb-0'>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight="bold" className='mb-0'>Patient Visit Details</Typography>
                        {onClose && (
                            <IconButton
                                onClick={onClose}
                                size="small"
                                sx={{
                                    backgroundColor: '#1976d2',
                                    color: 'white',
                                    '&:hover': { backgroundColor: '#1565c0' }
                                }}
                            >
                                <Close fontSize="small" />
                            </IconButton>
                        )}
                    </Box>

                    <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap">
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

                        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                            <Typography sx={{ color: '#1565c0', fontSize: '14px' }}>{doctorDisplayName}</Typography>
                            <Box display="flex" alignItems="center" gap={1} sx={{ cursor: 'not-allowed' }}>
                                    <Box component="span" sx={{ cursor: 'not-allowed', display: 'inline-flex' }}>
                                        <FormControlLabel
                                            control={<Checkbox checked={inPersonChecked} disabled size="small" />}
                                            label={<Typography fontSize="12px" className='text-black'>In-Person</Typography>}
                                            sx={{ mr: 0, ml: 0, pointerEvents: 'none' }}
                                        />
                                    </Box>

                                    <Box component="span" sx={{ cursor: 'not-allowed', display: 'inline-flex' }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={visitType.followUp}
                                                    disabled={true}
                                                    size="small"
                                                />
                                            }
                                            label={<Typography fontSize="12px" className='text-black'>Follow-up</Typography>}
                                            sx={{ mr: 0, ml: 0, pointerEvents: 'none' }}
                                        />
                                    </Box>

                            </Box>
                        </Box>
                    </Box>
                </DialogTitle>
                <DialogContent dividers sx={{
                    p: 2,
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderWidth: '2px',
                            borderColor: '#B7B7B7'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#999'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderWidth: '2px',
                            borderColor: '#1E88E5'
                        },
                        '&.Mui-disabled': {
                            backgroundColor: '#f5f5f5 !important',
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#B7B7B7 !important'
                            }
                        }
                    },
                    '& .MuiInputBase-input.Mui-disabled': {
                        WebkitTextFillColor: 'rgba(0,0,0,0.87) !important'
                    },
                    '& .MuiFormHelperText-root': {
                        fontSize: '0.75rem',
                        lineHeight: 1.66,
                        fontFamily: "'Roboto', sans-serif",
                        margin: '3px 0 0 0 !important',
                        padding: '0 !important',
                        minHeight: '1.25rem',
                        textAlign: 'left !important'
                    }
                }}>
                    {/* Error/Success Messages */}
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                    {/* Document Upload Loading */}
                    {isUploadingDocuments && (
                        <Alert severity="warning" icon={false} sx={{ mb: 2 }}>
                            Uploading documents... ({formData.attachments.length} file(s))
                        </Alert>
                    )}

                    {/* Document Upload Results */}
                    {documentUploadResults.length > 0 && (
                        <Box sx={{ bgcolor: '#f3e5f5', color: '#7b1fa2', p: 1, borderRadius: 1, mb: 2, fontSize: '14px', border: '1px solid #ce93d8' }}>
                            <Typography fontWeight="bold" fontSize="inherit" className='text-black'>Document Upload Results:</Typography>
                            {documentUploadResults.map((result, index) => (
                                <Box key={index} sx={{ fontSize: '12px', color: result.success ? '#2e7d32' : '#d32f2f' }}>
                                    {result.success ? '✓' : '✗'} {result.documentName || `Document ${index + 1}`}:
                                    {result.success ? ' Uploaded successfully' : ` Failed - ${result.error || 'Unknown error'}`}
                                </Box>
                            ))}
                        </Box>
                    )}

                    {/* Referral Information */}
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12} sm={6} md={2}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                    Referred By
                                </Typography>
                                <TextField
                                    select
                                    fullWidth
                                    size="small"
                                    value={formData.referralBy}
                                    onChange={(e) => handleInputChange('referralBy', e.target.value)}
                                    disabled={readOnly}
                                    variant="outlined"
                                    SelectProps={{
                                        displayEmpty: true,
                                        renderValue: (selected: any) => {
                                            if (selected === '' || selected === null || selected === undefined) {
                                                return <span style={{ color: 'rgba(0,0,0,0.6)' }}>Referred By</span>;
                                            }
                                            const option = referByOptions.find(opt => opt.id === selected);
                                            return option ? option.name : String(selected ?? '');
                                        }
                                    }}
                                >
                                    {referByOptions.map(opt => (
                                        <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>
                                    ))}
                                </TextField>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            {isDoctorReferral() ? (
                                (formData.referralName && formData.referralName.trim() !== '') || selectedDoctor !== null ? (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                            {isDoctorReferral() ? 'Doctor Name' : 'Referral Name'}
                                        </Typography>
                                        <ClearableTextField
                                            fullWidth
                                            size="small"
                                            value={formData.referralName}
                                            onChange={(value) => handleInputChange('referralName', value)}
                                            onClear={() => {
                                                handleInputChange('referralName', '');
                                                setReferralNameSearch('');
                                                setSelectedDoctor(null);
                                                setReferralNameOptions([]);
                                            }}
                                            onKeyDown={(e) => {
                                                // Prevent any keyboard input when doctor is selected (except Tab for navigation)
                                                if (selectedDoctor && e.key !== 'Tab') {
                                                    e.preventDefault();
                                                }
                                            }}
                                            disabled={readOnly || isSelfReferral}
                                            sx={{
                                                '& .MuiInputBase-root.Mui-disabled': {
                                                    backgroundColor: '#f5f5f5 !important'
                                                },
                                                '& .MuiInputBase-input.Mui-disabled': {
                                                    color: '#666666 !important',
                                                    WebkitTextFillColor: '#666666 !important'
                                                },
                                                '& .MuiInputBase-input.Mui-disabled::placeholder': {
                                                    color: '#666666 !important',
                                                    opacity: '0.5 !important'
                                                }
                                            }}
                                            variant="outlined"
                                            placeholder={isDoctorReferral() ? 'Type Doctor Name' : 'Type Referral Name'}
                                            error={!!validationErrors.referralName}
                                            helperText={validationErrors.referralName}
                                            InputProps={{
                                                endAdornment: (
                                                    <React.Fragment>
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => !readOnly && !isSelfReferral && setShowReferralPopup(true)}
                                                                disabled={readOnly || isSelfReferral}
                                                                title="Add New Referral Doctor"
                                                                sx={{
                                                                    backgroundColor: readOnly ? '#9e9e9e' : '#1976d2',
                                                                    color: 'white',
                                                                    width: 24,
                                                                    height: 24,
                                                                    padding: 0,
                                                                    '&:hover': {
                                                                        backgroundColor: readOnly ? '#9e9e9e' : '#1565c0',
                                                                    }
                                                                }}
                                                            >
                                                                <Add sx={{ fontSize: 16 }} />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    </React.Fragment>
                                                )
                                            }}
                                        />
                                    </Box>
                                ) : (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                            {isDoctorReferral() ? 'Doctor Name' : 'Referral Name'}
                                        </Typography>
                                        <Box position="relative">
                                            <ClearableTextField
                                                fullWidth
                                                size="small"
                                                placeholder={isDoctorReferral() ? 'Type Doctor Name' : 'Type Referral Name'}
                                                value={referralNameSearch}
                                                onChange={(value) => handleReferralNameSearch(value)}
                                                onClear={() => {
                                                    handleInputChange('referralName', '');
                                                    setReferralNameSearch('');
                                                    setSelectedDoctor(null);
                                                    setReferralNameOptions([]);
                                                }}
                                                onBlur={() => {
                                                    // When user clicks away, ensure the typed name is saved
                                                    if (referralNameSearch && referralNameSearch !== formData.referralName) {
                                                        handleInputChange('referralName', referralNameSearch);
                                                    }
                                                }}
                                                disabled={readOnly || isSelfReferral}
                                                sx={{
                                                    '& .MuiInputBase-root.Mui-disabled': {
                                                        backgroundColor: '#f5f5f5 !important'
                                                    },
                                                    '& .MuiInputBase-input.Mui-disabled': {
                                                        color: '#666666 !important',
                                                        WebkitTextFillColor: '#666666 !important'
                                                    },
                                                    '& .MuiInputBase-input.Mui-disabled::placeholder': {
                                                        color: '#666666 !important',
                                                        opacity: '0.5 !important'
                                                    }
                                                }}
                                                variant="outlined"
                                                error={!!validationErrors.referralName}
                                                helperText={validationErrors.referralName}
                                                InputProps={{
                                                    endAdornment: (
                                                        <React.Fragment>
                                                            {isSearchingReferral && <CircularProgress color="inherit" size={20} sx={{ mr: 1 }} />}
                                                            <InputAdornment position="end">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => !readOnly && !isSelfReferral && setShowReferralPopup(true)}
                                                                    disabled={readOnly || isSelfReferral}
                                                                    title="Add New Referral Doctor"
                                                                    sx={{
                                                                        backgroundColor: readOnly ? '#9e9e9e' : '#1976d2',
                                                                        color: 'white',
                                                                        width: 24,
                                                                        height: 24,
                                                                        padding: 0,
                                                                        '&:hover': {
                                                                            backgroundColor: readOnly ? '#9e9e9e' : '#1565c0',
                                                                        }
                                                                    }}
                                                                >
                                                                    <Add sx={{ fontSize: 16 }} />
                                                                </IconButton>
                                                            </InputAdornment>
                                                        </React.Fragment>
                                                    )
                                                }}
                                            />
                                            {/* Search Results Dropdown */}
                                            {referralNameOptions.length > 0 && (
                                                <Box sx={{
                                                    position: 'absolute',
                                                    top: 'calc(100% + 4px)',
                                                    left: 0,
                                                    right: 0,
                                                    backgroundColor: 'white',
                                                    borderRadius: '4px',
                                                    boxShadow: '0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)',
                                                    zIndex: 1000,
                                                    maxHeight: '200px',
                                                    overflowY: 'auto'
                                                }}>
                                                    {referralNameOptions.map((option) => (
                                                        <Box
                                                            key={option.id}
                                                            onMouseDown={() => {
                                                                console.log('DEBUG: Doctor selected from list', option)
                                                                setSelectedDoctor((option as any).fullData);
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    referralName: option.name,
                                                                    referralContact: (option as any).fullData?.doctorMob || '',
                                                                    referralEmail: (option as any).fullData?.doctorMail || '',
                                                                    referralAddress: (option as any).fullData?.doctorAddress || ''
                                                                }));
                                                                setReferralNameSearch(option.name);
                                                                setReferralNameOptions([]);
                                                            }}
                                                            sx={{
                                                                padding: '8px 12px',
                                                                cursor: 'pointer',
                                                                fontSize: '14px',
                                                                borderBottom: '1px solid #f0f0f0',
                                                                '&:hover': { backgroundColor: '#f5f5f5' }
                                                            }}
                                                        >
                                                            {option.name}
                                                        </Box>
                                                    ))}
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                )
                            ) : (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                        {isDoctorReferral() ? 'Doctor Name' : 'Referral Name'}
                                    </Typography>
                                    <ClearableTextField
                                        fullWidth
                                        size="small"
                                        value={formData.referralName}
                                        onChange={(value) => handleInputChange('referralName', value)}
                                        disabled={readOnly || isSelfReferral}
                                        sx={{
                                            '& .MuiInputBase-root.Mui-disabled': {
                                                backgroundColor: '#f5f5f5 !important'
                                            },
                                            '& .MuiInputBase-input.Mui-disabled': {
                                                color: '#666666 !important',
                                                WebkitTextFillColor: '#666666 !important'
                                            },
                                            '& .MuiInputBase-input.Mui-disabled::placeholder': {
                                                color: '#666666 !important',
                                                opacity: '0.5 !important'
                                            }
                                        }}
                                        variant="outlined"
                                        placeholder={isDoctorReferral() ? 'Type Doctor Name' : 'Type Referral Name'}
                                        error={!!validationErrors.referralName}
                                        helperText={validationErrors.referralName}
                                    />
                                </Box>
                            )}
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                    Referral Contact
                                </Typography>
                                <ClearableTextField
                                    fullWidth
                                    size="small"
                                    value={formData.referralContact}
                                    onChange={(value) => handleInputChange('referralContact', value)}
                                    disabled={readOnly || isSelfReferral || isDoctorReferral()}
                                    sx={{
                                        '& .MuiInputBase-root.Mui-disabled': {
                                            backgroundColor: '#f5f5f5 !important'
                                        },
                                        '& .MuiInputBase-input.Mui-disabled': {
                                            color: '#666666 !important',
                                            WebkitTextFillColor: '#666666 !important'
                                        },
                                        '& .MuiInputBase-input.Mui-disabled::placeholder': {
                                            color: '#666666 !important',
                                            opacity: '0.5 !important'
                                        }
                                    }}
                                    variant="outlined"
                                    placeholder='Referral Contact'
                                    inputProps={{ maxLength: getFieldConfig('referralContact', 'visit')?.maxLength }}
                                    error={!!validationErrors.referralContact}
                                    helperText={validationErrors.referralContact}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                    Referral Email
                                </Typography>
                                <ClearableTextField
                                    fullWidth
                                    size="small"
                                    type="email"
                                    value={formData.referralEmail}
                                    onChange={(value) => handleInputChange('referralEmail', value)}
                                    disabled={readOnly || isSelfReferral || isDoctorReferral()}
                                    sx={{
                                        '& .MuiInputBase-root.Mui-disabled': {
                                            backgroundColor: '#f5f5f5 !important'
                                        },
                                        '& .MuiInputBase-input.Mui-disabled': {
                                            color: '#666666 !important',
                                            WebkitTextFillColor: '#666666 !important'
                                        },
                                        '& .MuiInputBase-input.Mui-disabled::placeholder': {
                                            color: '#666666 !important',
                                            opacity: '0.5 !important'
                                        }
                                    }}
                                    variant="outlined"
                                    placeholder='Referral Email'
                                    inputProps={{ maxLength: getFieldConfig('referralEmail', 'visit')?.maxLength }}
                                    error={!!validationErrors.referralEmail}
                                    helperText={validationErrors.referralEmail}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                    Referral Address
                                </Typography>
                                <ClearableTextField
                                    fullWidth
                                    size="small"
                                    value={formData.referralAddress}
                                    onChange={(value) => handleInputChange('referralAddress', value)}
                                    disabled={readOnly || isSelfReferral || isDoctorReferral()}
                                    sx={{
                                        '& .MuiInputBase-root.Mui-disabled': {
                                            backgroundColor: '#f5f5f5 !important'
                                        },
                                        '& .MuiInputBase-input.Mui-disabled': {
                                            color: '#666666 !important',
                                            WebkitTextFillColor: '#666666 !important'
                                        },
                                        '& .MuiInputBase-input.Mui-disabled::placeholder': {
                                            color: '#666666 !important',
                                            opacity: '0.5 !important'
                                        }
                                    }}
                                    variant="outlined"
                                    inputProps={{ maxLength: getFieldConfig('referralAddress', 'visit')?.maxLength }}
                                    placeholder='Referral Address'
                                    error={!!validationErrors.referralAddress}
                                    helperText={validationErrors.referralAddress}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                    Pulse (/min)
                                </Typography>
                                <ClearableTextField
                                    fullWidth
                                    size="small"
                                    value={formData.pulse}
                                    placeholder='Pulse'
                                    onChange={(value) => handleInputChange('pulse', value)}
                                    disabled={readOnly}
                                    variant="outlined"
                                    inputProps={{
                                        // Removed maxLength to allow validation logic to trigger at/above limit
                                    }}
                                    error={!!validationErrors.pulse}
                                    helperText={validationErrors.pulse}
                                />
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Vital Signs */}
                    <Box sx={{ mb: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={2}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                        Height (Cm)
                                    </Typography>
                                    <ClearableTextField
                                        fullWidth
                                        size="small"
                                        value={formData.height}
                                        onChange={(value) => handleInputChange('height', value)}
                                        disabled={readOnly}
                                        variant="outlined"
                                        inputProps={{
                                            // Removed maxLength to allow validation logic to trigger at/above limit
                                        }}
                                        placeholder='Height'
                                        error={!!validationErrors.height}
                                        helperText={validationErrors.height}
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                        Weight (Kg)
                                    </Typography>
                                    <ClearableTextField
                                        fullWidth
                                        size="small"
                                        value={formData.weight}
                                        placeholder='Weight'
                                        onChange={(value) => handleInputChange('weight', value)}
                                        disabled={readOnly}
                                        variant="outlined"
                                        inputProps={{
                                            // Removed maxLength to allow validation logic to trigger at/above limit
                                        }}
                                        error={!!validationErrors.weight}
                                        helperText={validationErrors.weight}
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                        BMI
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={formData.bmi}
                                        disabled={true} // BMI is always calculated
                                        variant="outlined"
                                        placeholder='BMI'
                                        sx={{
                                            '& .MuiInputBase-input.Mui-disabled::placeholder': {
                                                color: '#666666 !important',
                                                opacity: '0.5 !important'
                                            }
                                        }}
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                        BP
                                    </Typography>
                                    <ClearableTextField
                                        fullWidth
                                        size="small"
                                        value={formData.bp}
                                        onChange={(value) => {
                                            if (value === '') {
                                                handleInputChange('bp', value);
                                                return;
                                            }
                                            if (value.trim().startsWith('-')) return;
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
                                            if (e.key === '-') {
                                                const input = e.currentTarget as HTMLInputElement;
                                                const cursorPos = input.selectionStart || 0;
                                                if (cursorPos === 0 || (input.value.length === 0)) {
                                                    e.preventDefault();
                                                }
                                            }
                                        }}
                                        disabled={readOnly}
                                        variant="outlined"
                                        placeholder='BP'
                                        inputProps={{ maxLength: getFieldConfig('bp', 'visit')?.maxLength }}
                                        error={!!validationErrors.bp}
                                        helperText={validationErrors.bp}
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                        Sugar
                                    </Typography>
                                    <ClearableTextField
                                        fullWidth
                                        size="small"
                                        value={formData.sugar}
                                        onChange={(value) => handleInputChange('sugar', value)}
                                        disabled={readOnly}
                                        variant="outlined"
                                        placeholder='Sugar'
                                        inputProps={{ maxLength: getFieldConfig('sugar', 'visit')?.maxLength }}
                                        error={!!validationErrors.sugar}
                                        helperText={validationErrors.sugar}
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                        TFT
                                    </Typography>
                                    <ClearableTextField
                                        fullWidth
                                        size="small"
                                        value={formData.tft}
                                        onChange={(value) => handleInputChange('tft', value)}
                                        disabled={readOnly}
                                        variant="outlined"
                                        placeholder='TFT'
                                        inputProps={{ maxLength: getFieldConfig('tft', 'visit')?.maxLength }}
                                        error={!!validationErrors.tft}
                                        helperText={validationErrors.tft}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={12} md={4}>
                                <Box sx={{ mb: 2 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                        <Typography variant="subtitle2" fontWeight="bold" className='mb-0'>
                                            Surgical History
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>
                                            {(formData.pastSurgicalHistory || '').length}/{getFieldConfig('pastSurgicalHistory', 'visit')?.maxLength || 1000}
                                        </Typography>
                                    </div>
                                    <textarea
                                        rows={2}
                                        value={formData.pastSurgicalHistory}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'pastSurgicalHistory',
                                                e.target.value.slice(
                                                    0,
                                                    getFieldConfig('pastSurgicalHistory', 'visit')?.maxLength
                                                )
                                            )
                                        }
                                        disabled={readOnly}
                                        maxLength={getFieldConfig('pastSurgicalHistory', 'visit')?.maxLength}
                                        id="textarea-autosize"
                                        style={{
                                            border: validationErrors.pastSurgicalHistory
                                                ? '1px solid #d32f2f'
                                                : '1px solid #b7b7b7',
                                            borderRadius: '8px',
                                            padding: '8px',
                                            resize: 'vertical',
                                            width: '100%'
                                        }}
                                    />
                                    {validationErrors.pastSurgicalHistory && (
                                        <Typography
                                            variant="caption"
                                            color="error"
                                            sx={{ mt: 0.5, display: 'block' }}
                                        >
                                            {validationErrors.pastSurgicalHistory}
                                        </Typography>
                                    )}
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Box sx={{ mb: 2 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                        <Typography variant="subtitle2" fontWeight="bold" className="mb-0">
                                            Previous Visit Plan
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>
                                            {(formData.previousVisitPlan || '').length}/{getFieldConfig('plan', 'visit')?.maxLength || 1000}
                                        </Typography>
                                    </div>
                                    <textarea
                                        rows={2}
                                        value={formData.previousVisitPlan}
                                        disabled
                                        id="textarea-autosize"
                                        style={{
                                            border: '1px solid #b7b7b7',
                                            borderRadius: '8px',
                                            padding: '8px',
                                            resize: 'vertical',
                                            width: '100%'
                                        }}
                                    />
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Box sx={{ mb: 2 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                        <Typography variant="subtitle2" fontWeight="bold" className="mb-0">
                                            Chief complaint entered by patient
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>
                                            {(formData.chiefComplaint || '').length}/{getFieldConfig('chiefComplaint', 'visit')?.maxLength || 400}
                                        </Typography>
                                    </div>
                                    <textarea
                                        rows={2}
                                        value={formData.chiefComplaint}
                                        disabled
                                        id="textarea-autosize"
                                        style={{
                                            border: '1px solid #b7b7b7',
                                            borderRadius: '8px',
                                            padding: '8px',
                                            resize: 'vertical',
                                            width: '100%'
                                        }}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Visit Comments and Medicines */}
                    <Grid container spacing={2} sx={{ mb: 0 }}>
                        <Grid item xs={12} md={4}>
                            <Box sx={{ mb: 2 }}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs>
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                                Select Complaints
                                            </Typography>
                                            <div ref={complaintsRef} style={{ position: 'relative', flex: 1 }}>
                                                <div
                                                    onClick={() => !readOnly && setIsComplaintsOpen(prev => !prev)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        height: '40px',
                                                        padding: '4px 8px',
                                                        border: '2px solid #B7B7B7',
                                                        borderRadius: '8px',
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
                                                                onChange={(e) => {
                                                                    const config = getFieldConfig('complaintSearch', 'visit');
                                                                    if (config?.maxLength && e.target.value.length > config.maxLength) return;
                                                                    setComplaintSearch(e.target.value);
                                                                }}
                                                                disabled={readOnly}
                                                                maxLength={getFieldConfig('complaintSearch', 'visit')?.maxLength}
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
                                                                                flexWrap: 'nowrap',
                                                                                width: '100%',
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
                                                                            <div style={{ width: '8.33%', flexShrink: 0 }}></div>
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
                                                                                style={{ margin: 0, width: '16.66%', flexShrink: 0 }}
                                                                            />
                                                                            <span
                                                                                title={opt.label}
                                                                                style={{
                                                                                    whiteSpace: 'nowrap',
                                                                                    overflow: 'hidden',
                                                                                    textOverflow: 'ellipsis',
                                                                                    width: '66.66%',
                                                                                    flexGrow: 1,
                                                                                    marginLeft: '8px'
                                                                                }}
                                                                            >
                                                                                {opt.label}
                                                                            </span>
                                                                        </label>
                                                                    </React.Fragment>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </Box>
                                    </Grid>
                                    <Grid item>
                                        <Button
                                            variant="contained"
                                            onClick={handleAddComplaints}
                                            disabled={readOnly}
                                            sx={{ height: 40 }}
                                        >
                                            Add
                                        </Button>
                                    </Grid>
                                </Grid>

                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Box sx={{ mb: 2 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <Typography variant="subtitle2" fontWeight="bold" className="mb-0">
                                        Visit Comments
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>
                                        {(formData.visitComments || '').length}/{getFieldConfig('visitComments', 'visit')?.maxLength || 1000}
                                    </Typography>
                                </div>
                                <textarea
                                    rows={2}
                                    value={formData.visitComments}
                                    onChange={(e) => handleInputChange('visitComments', e.target.value)}
                                    disabled={readOnly}
                                    style={{
                                        border: validationErrors.visitComments
                                            ? '1px solid #d32f2f'
                                            : '1px solid #b7b7b7',
                                        borderRadius: '8px',
                                        padding: '8px',
                                        resize: 'vertical',
                                        width: '100%'
                                    }}
                                />
                                {validationErrors.visitComments && (
                                    <Typography
                                        variant="caption"
                                        color="error"
                                        sx={{ mt: 0.5, display: 'block' }}
                                    >
                                        {validationErrors.visitComments}
                                    </Typography>
                                )}
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Box sx={{ mb: 2 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <Typography variant="subtitle2" fontWeight="bold" className='mb-0'>
                                        Medicines
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>
                                        {(formData.currentMedicines || '').length}/{getFieldConfig('currentMedicines', 'visit')?.maxLength || 1000}
                                    </Typography>
                                </div>
                                <textarea
                                    rows={2}
                                    value={formData.currentMedicines}
                                    onChange={(e) => handleInputChange('currentMedicines', e.target.value)}
                                    disabled={readOnly}
                                    style={{
                                        border: validationErrors.currentMedicines
                                            ? '1px solid #d32f2f'
                                            : '1px solid #b7b7b7',
                                        borderRadius: '8px',
                                        padding: '8px',
                                        resize: 'vertical',
                                        width: '100%'
                                    }}
                                />
                                {validationErrors.currentMedicines && (
                                    <Typography
                                        variant="caption"
                                        color="error"
                                        sx={{ mt: 0.5, display: 'block' }}
                                    >
                                        {validationErrors.currentMedicines}
                                    </Typography>
                                )}
                            </Box>
                        </Grid>
                    </Grid>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12} md={4} className='pt-0'>
                            {complaintsRows.length > 0 && (
                                <div style={{
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                }}>
                                    {/* Header Table (Static) */}
                                    <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'separate', borderSpacing: 0 }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#1976d2' }}>
                                                <th style={{
                                                    padding: '12px',
                                                    textAlign: 'left',
                                                    borderBottom: '1px solid #ddd',
                                                    fontWeight: 'normal',
                                                    color: 'white',
                                                    width: '10%',
                                                    fontSize: '12px'
                                                }}>
                                                    Sr.
                                                </th>
                                                <th style={{
                                                    padding: '12px',
                                                    textAlign: 'left',
                                                    borderBottom: '1px solid #ddd',
                                                    fontWeight: 'normal',
                                                    color: 'white',
                                                    width: '30%',
                                                    fontSize: '12px'
                                                }}>
                                                    Complaint Description
                                                </th>
                                                <th style={{
                                                    padding: '12px',
                                                    textAlign: 'left',
                                                    borderBottom: '1px solid #ddd',
                                                    fontWeight: 'normal',
                                                    color: 'white',
                                                    width: '40%',
                                                    fontSize: '12px'
                                                }}>
                                                    Duration / Comment
                                                </th>
                                                <th style={{
                                                    padding: '12px',
                                                    borderBottom: '1px solid #ddd',
                                                    fontWeight: 'normal',
                                                    color: 'white',
                                                    width: '20%',
                                                    fontSize: '12px',
                                                    textAlign: 'center'
                                                }}>
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>
                                    </table>

                                    <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
                                        <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'separate', borderSpacing: 0 }}>
                                            <tbody>
                                                {complaintsRows.map((row, idx) => (
                                                    <tr key={row.id}>
                                                        <td style={{
                                                            padding: '12px',
                                                            borderBottom: '1px solid #eee',
                                                            color: 'black',
                                                            height: '38px',
                                                            fontSize: '12px',
                                                            width: '10%'
                                                        }}>
                                                            {idx + 1}
                                                        </td>
                                                        <td style={{
                                                            padding: '12px',
                                                            borderBottom: '1px solid #eee',
                                                            color: 'black',
                                                            height: '38px',
                                                            fontSize: '12px',
                                                            width: '30%'
                                                        }}>
                                                            {row.label}
                                                        </td>
                                                        <td style={{
                                                            padding: '12px',
                                                            width: '40%'
                                                        }}>
                                                            <ClearableTextField
                                                                fullWidth
                                                                size="small"
                                                                value={row.comment}
                                                                onChange={(value) => handleComplaintCommentChange(row.value, value)}
                                                                disabled={readOnly}
                                                                placeholder="Enter Duration/Comment"
                                                                variant="outlined"
                                                                inputProps={{ maxLength: getFieldConfig('complaintComment', 'visit')?.maxLength }}
                                                                InputProps={{ disableUnderline: true }}
                                                            />
                                                        </td>
                                                        <td style={{
                                                            padding: '12px',
                                                            borderBottom: '1px solid #eee',
                                                            textAlign: 'center',
                                                            height: '38px',
                                                            width: '20%'
                                                        }}>
                                                            <button
                                                                onClick={() => !readOnly && handleRemoveComplaint(row.value)}
                                                                style={{
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    color: '#f44336',
                                                                    padding: '6px',
                                                                    borderRadius: '4px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    margin: '0 auto'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.backgroundColor = '#ffebee';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                                }}
                                                                title="Remove"
                                                                disabled={readOnly}
                                                            >
                                                                <Delete fontSize="small" style={{ color: 'black' }} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </Grid>
                        <Grid item xs={12} md={8} className='pt-0'>

                            {/* Attachments */}
                            <Box sx={{ mt: 3, mb: 2 }}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom className='mb-0'>
                                    Attachments (Max 3 , Size 150Mb)
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                                    <Button
                                        component="label"
                                        variant="contained"
                                        disabled={readOnly || (formData.attachments.length + existingDocuments.length >= 3)}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Choose Files
                                        <input
                                            type="file"
                                            hidden
                                            multiple
                                            accept=".jpg,.jpeg,.png,.pdf,.xls,.xlsx,.doc,.docx"
                                            onChange={handleFileChange}
                                        />
                                    </Button>

                                    <Typography variant="body2" color="textSecondary">
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
                                                return ` (Total size: ${size.toFixed(1)} ${units[unitIndex]})`;
                                            }
                                            return '';
                                        })()}
                                    </Typography>
                                </Box>
                                {fileValidationMessage && (
                                    <Typography variant="body2" color="error" sx={{ display: 'block', mt: 1 }}>
                                        {fileValidationMessage}
                                    </Typography>
                                )}

                                {/* File List */}
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {/* Existing Documents */}
                                    {existingDocuments.map((doc, index) => {
                                        const docId = doc.documentId || doc.id || (doc as any).document_id || (doc as any).documentID;
                                        const isDeleting = deletingDocumentId === docId;
                                        const originalName = (doc.documentName ? doc.documentName.split('/').pop() : null) || `Document ${index + 1}`;
                                        const displayName = originalName.length > 20 ? originalName.substring(0, 20) + '...' : originalName;
                                        const fileSize = doc.fileSize ? (doc.fileSize > 1024 * 1024 ? ` (${(doc.fileSize / (1024 * 1024)).toFixed(1)} MB)` : ` (${(doc.fileSize / 1024).toFixed(1)} KB)`) : '';

                                        return (
                                            <Box key={`existing-${index}`} sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                bgcolor: '#e8f5e8',
                                                border: '1px solid darkgray',
                                                borderRadius: 8,
                                                pl: 1, pr: 0.5, py: 0.5
                                            }}>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: '#2e7d32',
                                                        mr: 0.5,
                                                        fontWeight: 500,
                                                        cursor: 'pointer',
                                                        textDecoration: 'underline',
                                                        '&:hover': {
                                                            color: '#1b5e20'
                                                        }
                                                    }}
                                                    title={`Click to download ${originalName}`}
                                                    onClick={() => !isDeleting && handleDownloadDocument(docId)}
                                                >
                                                    {displayName}{fileSize}
                                                </Typography>
                                                <span
                                                    onClick={async () => {
                                                        if (readOnly || isDeleting) return;

                                                        // Mark for deletion in state
                                                        setDocumentsToDelete(prev => [...prev, docId]);

                                                        // Remove from UI immediately
                                                        setExistingDocuments(prev => prev.filter(d => (d.documentId || d.id || (d as any).document_id || (d as any).documentID) !== docId));
                                                    }}
                                                    style={{
                                                        marginLeft: '4px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        cursor: (readOnly || isDeleting) ? 'default' : 'pointer',
                                                        color: isDeleting ? 'rgba(0, 0, 0, 0.38)' : '#d32f2f'
                                                    }}
                                                    className='py-2 pe-2'
                                                >
                                                    <Close fontSize="small" sx={{ fontSize: '16px' }} />
                                                </span>
                                            </Box>
                                        );
                                    })}

                                    {/* New Attachments */}
                                    {formData.attachments.map((file, index) => {
                                        const displayName = file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name;
                                        const fileSize = file.size > 1024 * 1024 ? ` (${(file.size / (1024 * 1024)).toFixed(1)} MB)` : ` (${(file.size / 1024).toFixed(1)} KB)`;
                                        return (
                                            <Box key={`new-${index}`} sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                bgcolor: '#fff',
                                                border: '1px solid darkgray',
                                                borderRadius: 8,
                                                pl: 1, pr: 0.5, py: 0
                                            }}>
                                                <Typography variant="caption" sx={{ mr: 0.5, fontWeight: 500 }} title={file.name}>
                                                    {displayName}{fileSize}
                                                </Typography>
                                                <span
                                                    onClick={() => {
                                                        if (!readOnly) {
                                                            const newAttachments = [...formData.attachments];
                                                            newAttachments.splice(index, 1);
                                                            handleInputChange('attachments', newAttachments);
                                                        }
                                                    }}
                                                    style={{
                                                        marginLeft: '4px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        cursor: readOnly ? 'default' : 'pointer',
                                                        color: 'rgba(0, 0, 0, 0.54)'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!readOnly) e.currentTarget.style.color = '#d32f2f';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (!readOnly) e.currentTarget.style.color = 'rgba(0, 0, 0, 0.54)';
                                                    }}
                                                    className='py-2 pe-2'
                                                >
                                                    <Close fontSize="small" sx={{ fontSize: '16px' }} />
                                                </span>
                                            </Box>
                                        )
                                    })}
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e0e0e0' }}>
                    <Button onClick={onClose} disabled={readOnly} color="primary" variant="contained">
                        Close
                    </Button>
                    <Button onClick={handleReset} disabled={readOnly} color="primary" variant="contained">
                        Reset
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={readOnly || isLoading}
                        variant="contained"
                        color="primary"
                        startIcon={isLoading ? <Box component="span" sx={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : null}
                    >
                        {isLoading ? 'Saving...' : 'Submit'}
                    </Button>
                </DialogActions>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </Dialog>

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
                    if (isDoctorReferral()) {
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
