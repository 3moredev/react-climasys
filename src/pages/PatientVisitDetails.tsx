import React, { useState } from 'react';
import { Close, Add, Delete } from '@mui/icons-material';
import { Snackbar } from '@mui/material';
import { visitService, ComprehensiveVisitDataRequest } from '../services/visitService';
import { complaintService, ComplaintOption } from '../services/complaintService';
import AddReferralPopup, { ReferralData } from '../components/AddReferralPopup';

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
}

interface PatientVisitDetailsProps {
    open: boolean;
    onClose: () => void;
    patientData: AppointmentRow | null;
}

const PatientVisitDetails: React.FC<PatientVisitDetailsProps> = ({ open, onClose, patientData }) => {
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
        followUp: true,
        followUpType: 'Follow-up'
    });

    const [referByOptions, setReferByOptions] = useState<{ id: string; name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    
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

    // Keep joined complaints in formData for API compatibility
    React.useEffect(() => {
        setFormData(prev => ({ ...prev, selectedComplaint: selectedComplaints.join(',') }));
    }, [selectedComplaints]);

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

    // Load complaints from API when dialog opens
    React.useEffect(() => {
        let cancelled = false;
        async function loadComplaints() {
            if (!open || !patientData?.provider) return;
            
            setComplaintsLoading(true);
            setComplaintsError(null);
            
            try {
                // Extract doctor ID from provider field or use a default
                const doctorId = patientData.provider || '1'; // fallback to doctor ID 1
                console.log('Loading complaints for doctor:', doctorId);
                
                const complaints = await complaintService.getAllComplaintsForDoctor(doctorId);
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
    }, [open, patientData?.provider]);

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

    // Load last visit details when dialog opens and patient data is available
    React.useEffect(() => {
        let cancelled = false;
        async function loadLastVisitIfAny() {
            try {
                if (!open || !patientData?.patientId) return;
                const pid = String(patientData.patientId);
                const result: any = await visitService.getLastVisitDetails(pid);
                if (cancelled) return;

                if (!result) return;
                const payload = result.data || result.lastVisit || result.visit || result.payload || result;
                if (!payload) return;

                // Attempt to normalize keys from payload
                const normalized = {
                    referByRaw: payload.referBy ?? payload.referralBy ?? '',
                    referralName: payload.referralName ?? '',
                    referralContact: payload.referralContact ?? '',
                    referralEmail: payload.referralEmail ?? '',
                    referralAddress: payload.referralAddress ?? '',
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
                    // Set referralBy based on payload and available options, default to 'Self'
                    if (normalized.referByRaw) {
                        const referIdStr = String(normalized.referByRaw);
                        const matchExists = referByOptions.some(o => String(o.id) === referIdStr);
                        patched.referralBy = matchExists ? referIdStr : 'Self';
                    } else if (!patched.referralBy) {
                        patched.referralBy = 'Self';
                    }
                    maybeSet('referralName', normalized.referralName);
                    maybeSet('referralContact', normalized.referralContact);
                    maybeSet('referralEmail', normalized.referralEmail);
                    maybeSet('referralAddress', normalized.referralAddress);
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

                // Patch visit type if provided
                setVisitType(prev => {
                    const next = { ...prev };
                    if (typeof normalized.inPerson === 'boolean') next.inPerson = normalized.inPerson;
                    if (typeof normalized.followUpFlag === 'boolean') next.followUp = normalized.followUpFlag;
                    if (normalized.followUpType && typeof normalized.followUpType === 'string') next.followUpType = normalized.followUpType;
                    return next;
                });
            } catch (e) {
                console.error('Failed to load last visit details', e);
            }
        }
        loadLastVisitIfAny();
        return () => { cancelled = true; };
    }, [open, patientData?.patientId, referByOptions]);

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
                setReferralNameSearch('');
                setReferralNameOptions([]);
                // Clear selected doctor if not a doctor referral
                if (value !== 'D') {
                    setSelectedDoctor(null);
                }
            }
            
            return newData;
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = Array.from(e.target.files || []);
        setFormData(prev => {
            const existingFiles = prev.attachments || [];
            const combinedFiles = [...existingFiles, ...newFiles];
            return { ...prev, attachments: combinedFiles.slice(0, 3) };
        });
    };

    const removeFile = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, index) => index !== indexToRemove)
        }));
    };

    // Search referral names when typing
    const handleReferralNameSearch = async (searchTerm: string) => {
        setReferralNameSearch(searchTerm);
        if (searchTerm.length < 2) {
            setReferralNameOptions([]);
            return;
        }
        
        setIsSearchingReferral(true);
        try {
            // Call the actual referral doctors API
            const { getReferralDoctors } = await import('../services/referralService');
            const doctors = await getReferralDoctors(1); // languageId = 1
            
            console.log('=== REFERRAL DOCTORS SEARCH DEBUG ===');
            console.log('Search term:', searchTerm);
            console.log('All doctors from API:', doctors);
            
            // Filter doctors by name containing the search term
            const filteredDoctors = doctors.filter(doctor => 
                doctor.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
            );
            
            console.log('Filtered doctors:', filteredDoctors);
            
            // Store the full doctor data for later use
            setReferralNameOptions(filteredDoctors.map(doctor => ({
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

    const handleSubmit = async () => {
        try {
            console.log('=== VISIT DETAILS FORM SUBMISSION STARTED ===');
            console.log('Form data:', formData);
            console.log('Visit type:', visitType);
            console.log('Patient data:', patientData);
            
            setIsLoading(true);
            setError(null);
            setSuccess(null);

            // Map form data to API request format
            const visitData: ComprehensiveVisitDataRequest = {
                // Required fields - you may need to adjust these based on your actual data
                patientId: patientData?.patientId?.toString() || '',
                doctorId: 'DR-00010', // You may need to get this from context or props
                clinicId: 'CL-00001', // You may need to get this from context or props
                shiftId: '1', // You may need to get this from context or props
                visitDate: new Date().toISOString().slice(0, 19).replace('T', ' '), // Current date/time
                patientVisitNo: '1', // You may need to generate this or get from props
                
                // Referral information
                referBy: formData.referralBy,
                referralName: formData.referralName,
                referralContact: formData.referralContact,
                referralEmail: formData.referralEmail,
                referralAddress: formData.referralAddress,
                
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
                inPerson: visitType.inPerson,
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
                followUpDate: new Date().toISOString(),
                pregnant: false,
                edd: new Date().toISOString(),
                followUpType: '',
                
                // Financial fields
                feesToCollect: 0,
                feesPaid: 0,
                discount: 0,
                originalDiscount: 0,
                
                // Status and user
                statusId: 1,
                userId: 'recep', // You may need to get this from auth context
                isSubmitPatientVisitDetails: true
            };

            console.log('=== SUBMITTING VISIT DATA TO API ===');
            console.log('Visit data object:', visitData);
            console.log('Visit data JSON:', JSON.stringify(visitData, null, 2));
            
            const result = await visitService.saveComprehensiveVisitData(visitData);
            
            console.log('=== API RESPONSE ===');
            console.log('API Response:', result);
            console.log('Success status:', result.success);
            console.log('Response data:', result);
            
            if (result.success) {
                console.log('=== VISIT DETAILS SAVED SUCCESSFULLY ===');
                console.log('Visit details saved successfully!');
                
                // Show success snackbar immediately
                console.log('=== SETTING SNACKBAR STATE ===');
                console.log('Setting snackbar message:', 'Visit details saved successfully!');
                console.log('Setting snackbar open to true');
                setSnackbarMessage('Visit details saved successfully!');
                setSnackbarOpen(true);
                console.log('Snackbar state set - message:', 'Visit details saved successfully!', 'open:', true);
                
                setError(null);
                setSuccess(null);
                
                // Close modal after showing snackbar
                setTimeout(() => {
                    console.log('=== CLOSING MODAL AFTER SUCCESS ===');
        if (onClose) onClose();
                }, 2000); // 2 second delay like AddPatientPage
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
        setVisitType({
            inPerson: true,
            followUp: true,
            followUpType: 'Follow-up'
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
        
    };

    return (
        <>
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
            onClick={onClose}
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
                        <div style={{ color: '#2e7d32', fontSize: '14px', fontWeight: '500' }}>
                            {patientData.patient} / {(patientData as any).gender_description || 'N/A'} / {patientData.age === 0 ? 'Unknown' : patientData.age} Y / {patientData.contact || 'N/A'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                            <div style={{ color: '#1565c0', fontSize: '14px' }}>
                                Dr. Tongaonkar - Medicine
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', whiteSpace: 'nowrap' }}>
                                    <span>In-Person:</span>
                                    <input
                                        type="checkbox"
                                        checked={visitType.inPerson}
                                        onChange={(e) => setVisitType(prev => ({ ...prev, inPerson: e.target.checked }))}
                                    />
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', whiteSpace: 'nowrap' }}>
                                    <span>Follow-up:</span>
                                    <input
                                        type="checkbox"
                                        checked={visitType.followUp}
                                        onChange={(e) => setVisitType(prev => ({ ...prev, followUp: e.target.checked }))}
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
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1E88E5';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#B7B7B7';
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
                                {isDoctorReferral() ? (
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            placeholder="Search Doctor Name"
                                            value={referralNameSearch}
                                            onChange={(e) => handleReferralNameSearch(e.target.value)}
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
                                                transition: 'border-color 0.2s'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#1E88E5';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#B7B7B7';
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="referral-add-icon"
                                            onClick={() => setShowReferralPopup(true)}
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
                                ) : (
                                    <input
                                        type="text"
                                        placeholder="Referral Name"
                                        value={formData.referralName}
                                        onChange={(e) => handleInputChange('referralName', e.target.value)}
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
                                            transition: 'border-color 0.2s'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#1E88E5';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#B7B7B7';
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
                                    disabled={selectedDoctor !== null}
                                    style={{
                                        width: '100%',
                                        height: '32px',
                                        padding: '4px 8px',
                                        border: '2px solid #B7B7B7',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        fontFamily: "'Roboto', sans-serif",
                                        fontWeight: '500',
                                        backgroundColor: selectedDoctor !== null ? '#f5f5f5' : 'white',
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
                                    disabled={selectedDoctor !== null}
                                    style={{
                                        width: '100%',
                                        height: '32px',
                                        padding: '4px 8px',
                                        border: '2px solid #B7B7B7',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        fontFamily: "'Roboto', sans-serif",
                                        fontWeight: '500',
                                        backgroundColor: selectedDoctor !== null ? '#f5f5f5' : 'white',
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
                                    value={formData.referralAddress}
                                    onChange={(e) => handleInputChange('referralAddress', e.target.value)}
                                    disabled={selectedDoctor !== null}
                                    style={{
                                        width: '100%',
                                        height: '32px',
                                        padding: '4px 8px',
                                        border: '2px solid #B7B7B7',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        fontFamily: "'Roboto', sans-serif",
                                        fontWeight: '500',
                                        backgroundColor: selectedDoctor !== null ? '#f5f5f5' : 'white',
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
                                    onChange={(e) => handleInputChange('pulse', e.target.value)}
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
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1E88E5';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#B7B7B7';
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
                                    onChange={(e) => handleInputChange('height', e.target.value)}
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
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1E88E5';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#B7B7B7';
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
                                    onChange={(e) => handleInputChange('weight', e.target.value)}
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
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1E88E5';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#B7B7B7';
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
                                    disabled={true}
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
                                    onChange={(e) => handleInputChange('bp', e.target.value)}
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
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1E88E5';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#B7B7B7';
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                    Sugar
                                </label>
                                <input
                                    type="number"
                                    placeholder="Sugar"
                                    value={formData.sugar}
                                    onChange={(e) => handleInputChange('sugar', e.target.value)}
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
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1E88E5';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#B7B7B7';
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
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1E88E5';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#B7B7B7';
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
                                    rows={2}
                                    style={{
                                        width: '100%',
                                        padding: '4px 8px',
                                        border: '2px solid #B7B7B7',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        fontFamily: "'Roboto', sans-serif",
                                        fontWeight: '500',
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        resize: 'vertical',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1E88E5';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#B7B7B7';
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                    Previous Visit Plan
                            </label>
                                <textarea
                                    value={formData.previousVisitPlan}
                                    disabled={true}
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
                                    disabled={true}
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
                                        onClick={() => setIsComplaintsOpen(prev => !prev)}
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
                                            backgroundColor: 'white',
                                            cursor: 'pointer',
                                            userSelect: 'none'
                                        }}
                                        onMouseEnter={(e) => {
                                            (e.currentTarget as HTMLDivElement).style.borderColor = '#1E88E5';
                                        }}
                                        onMouseLeave={(e) => {
                                            (e.currentTarget as HTMLDivElement).style.borderColor = '#B7B7B7';
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
                                                                setComplaintsError(null);
                                                                // Trigger reload by updating a dependency
                                                                const doctorId = patientData?.provider || '1';
                                                                complaintService.getAllComplaintsForDoctor(doctorId)
                                                                    .then(setComplaintsOptions)
                                                                    .catch(e => setComplaintsError(e.message));
                                                            }}
                                                            style={{ 
                                                                marginLeft: '8px', 
                                                                padding: '2px 6px', 
                                                                fontSize: '10px', 
                                                                backgroundColor: '#1976d2', 
                                                                color: 'white', 
                                                                border: 'none', 
                                                                borderRadius: '3px', 
                                                                cursor: 'pointer' 
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
                                                                    cursor: 'pointer', 
                                                                    fontSize: '12px', 
                                                                    border: 'none',
                                                                    backgroundColor: checked ? '#e3f2fd' : 'transparent',
                                                                    borderRadius: '3px',
                                                                    fontWeight: checked ? '600' : '400'
                                                                }}
                                                            >
                                                            <input
                                                                type="checkbox"
                                                                checked={checked}
                                                                onChange={(e) => {
                                                                    setSelectedComplaints(prev => {
                                                                        if (e.target.checked) {
                                                                            if (prev.includes(opt.value)) return prev;
                                                                            return [...prev, opt.value];
                                                                        } else {
                                                                            return prev.filter(v => v !== opt.value);
                                                                        }
                                                                    });
                                                                }}
                                                                style={{ margin: 0 }}
                                                            />
                                                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{opt.label}</span>
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
                                            backgroundColor: '#1976d2',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            height: '32px',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#1565c0';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#1976d2';
                                        }}
                                        onClick={handleAddComplaints}
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
                                                            onClick={() => handleRemoveComplaint(row.value)}
                                                            title="Remove"
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                width: '24px',
                                                                height: '24px',
                                                                cursor: 'pointer',
                                                                color: '#000000',
                                                                backgroundColor: 'transparent'
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
                                    rows={2}
                                    style={{
                                        width: '100%',
                                        padding: '4px 8px',
                                        border: '2px solid #B7B7B7',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        fontFamily: "'Roboto', sans-serif",
                                        fontWeight: '500',
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        resize: 'vertical',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1E88E5';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#B7B7B7';
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
                                    rows={2}
                                    style={{
                                        width: '100%',
                                        padding: '4px 8px',
                                        border: '2px solid #B7B7B7',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        fontFamily: "'Roboto', sans-serif",
                                        fontWeight: '500',
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        resize: 'vertical',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1E88E5';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#B7B7B7';
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
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold', color: '#333' }}>
                                Attachments (Max 3 , Size 150Mb):
                            </label>
                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="attachmentInput"
                                style={{
                                    width: '100%',
                                    height: '32px',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontFamily: "'Roboto', sans-serif",
                                    fontWeight: '500',
                                    backgroundColor: 'white',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#1E88E5';
                                    e.target.style.boxShadow = 'none';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#B7B7B7';
                                }}
                            />
                            <div style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
                                {formData.attachments.length > 0 ? (
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
                                                <span
                                                    onClick={() => removeFile(index)}
                                                    style={{
                                                        color: 'black',
                                                        cursor: 'pointer',
                                                        fontSize: '14px',
                                                        padding: '0',
                                                        marginLeft: '5px',
                                                        fontWeight: 'bold'
                                                    }}
                                                    title="Remove file"
                                                >
                                                    ×
                                                </span>
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    'No file chosen'
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
                        onClick={handleReset}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#1976d2',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#1565c0';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#1976d2';
                        }}
                    >
                        Reset
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: isLoading ? '#9e9e9e' : '#1976d2',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'background-color 0.2s',
                            opacity: isLoading ? 0.7 : 1
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
        </div>
        )}
        
        {/* Success Snackbar - Always rendered outside modal */}
        <Snackbar
            open={snackbarOpen}
            autoHideDuration={2000}
            onClose={() => {
                console.log('=== SNACKBAR ONCLOSE TRIGGERED ===');
                setSnackbarOpen(false);
            }}
            message={snackbarMessage}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            sx={{
                zIndex: 99999, // Ensure snackbar appears above everything
                '& .MuiSnackbarContent-root': {
                    backgroundColor: '#4caf50',
                    color: 'white',
                    fontWeight: 'bold'
                }
            }}
        />

        {/* Add New Referral Popup */}
        <AddReferralPopup
            open={showReferralPopup}
            onClose={() => setShowReferralPopup(false)}
            onSave={(referralData: ReferralData) => {
                // Handle save new referral logic here
                console.log('New referral data:', referralData);
                // You can add API call to save the new referral
                // Example: await referralService.createReferral(referralData);
            }}
        />
        </>
    );
};

export default PatientVisitDetails;

// Page wrapper to render via route and accept patientData through location.state
// (Standalone page wrapper removed as per revert request)
