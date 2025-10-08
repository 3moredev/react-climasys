import React, { useState } from 'react';
import { Close, Add } from '@mui/icons-material';
import { Snackbar } from '@mui/material';
import { visitService, ComprehensiveVisitDataRequest } from '../services/visitService';

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
    const [referralNameOptions, setReferralNameOptions] = useState<{ id: string; name: string }[]>([]);
    const [isSearchingReferral, setIsSearchingReferral] = useState(false);

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
            }
            
            return newData;
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setFormData(prev => ({ ...prev, attachments: files.slice(0, 3) }));
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
            // Mock search - replace with actual API call
            const mockResults = [
                { id: '1', name: `Dr. ${searchTerm} Smith` },
                { id: '2', name: `Dr. ${searchTerm} Johnson` },
                { id: '3', name: `Dr. ${searchTerm} Williams` }
            ].filter(option => 
                option.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setReferralNameOptions(mockResults);
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
                currentComplaint: formData.selectedComplaint,
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
        setSnackbarMessage('');
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
                                                            setFormData(prev => ({ ...prev, referralName: option.name }));
                                                            setReferralNameSearch(option.name);
                                                            setReferralNameOptions([]);
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
                                    Referral Email
                                </label>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={formData.referralEmail}
                                    onChange={(e) => handleInputChange('referralEmail', e.target.value)}
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
                                    Referral Address
                                </label>
                                <input
                                    type="text"
                                    placeholder="Address"
                                    value={formData.referralAddress}
                                    onChange={(e) => handleInputChange('referralAddress', e.target.value)}
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
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                    Select Complaints
                                </label>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'end' }}>
                                    <select
                                        value={formData.selectedComplaint}
                                        onChange={(e) => handleInputChange('selectedComplaint', e.target.value)}
                                        style={{
                                            flex: 1,
                                            height: '32px',
                                            padding: '4px 8px',
                                            border: '2px solid #B7B7B7',
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
                                    >
                                        <option value="">Select Complaint</option>
                                        <option value="fever">Fever</option>
                                        <option value="cough">Cough</option>
                                        <option value="headache">Headache</option>
                                        <option value="chest-pain">Chest Pain</option>
                                    </select>
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
                                    >
                                        Add
                                    </button>
                                </div>
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
                    `}</style>
                    <div style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold', color: '#333' }}>
                                    Attachments (Max 3):
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
                                    {formData.attachments.length > 0 
                                        ? `${formData.attachments.length} file(s) selected`
                                        : 'No file chosen'
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
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
        {showReferralPopup && (
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
                    zIndex: 10001,
                }}
                onClick={() => setShowReferralPopup(false)}
            >
                <div
                    style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        maxWidth: '500px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'auto',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Popup Header */}
                    <div style={{
                        background: 'white',
                        padding: '15px 20px',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                        fontFamily: "'Roboto', sans-serif",
                        color: '#212121',
                        fontSize: '0.9rem',
                        borderBottom: '1px solid #e0e0e0'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h3 style={{ margin: 0, color: '#000000', fontSize: '18px', fontWeight: 'bold' }}>
                                Add New Referral
                            </h3>
                            <button
                                onClick={() => setShowReferralPopup(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '5px',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    backgroundColor: '#1976d2',
                                    width: '32px',
                                    height: '32px',
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
                        </div>
                    </div>

                    {/* Popup Content */}
                    <div style={{ padding: '20px', flex: 1 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                    Doctor Name *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter doctor name"
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
                                    Specialization
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter specialization"
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
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                    Contact Number
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter contact number"
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
                                    Email
                                </label>
                                <input
                                    type="email"
                                    placeholder="Enter email"
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
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                Address
                            </label>
                            <textarea
                                placeholder="Enter address"
                                rows={3}
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

                    {/* Popup Footer */}
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
                            onClick={() => setShowReferralPopup(false)}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#9e9e9e',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#757575';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#9e9e9e';
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                // Handle save new referral logic here
                                setShowReferralPopup(false);
                                // You can add API call to save the new referral
                            }}
                            style={{
                                padding: '8px 16px',
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
                            Save
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default PatientVisitDetails;

// Page wrapper to render via route and accept patientData through location.state
// (Standalone page wrapper removed as per revert request)
