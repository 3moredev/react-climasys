import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useLocation } from "react-router-dom";
import { sessionService, SessionInfo } from "../services/sessionService";
import { Delete, Edit, Add, Info } from '@mui/icons-material';
import { complaintService, ComplaintOption } from "../services/complaintService";

// Specific styles for Duration/Comment input in table
const durationCommentStyles = `
  .duration-comment-table-input {
    border-radius: 0 !important;
  }
  .duration-comment-table-input:focus {
    border-radius: 0 !important;
  }
  .medicine-instruction-table-input {
    border-radius: 0 !important;
  }
  .medicine-instruction-table-input:focus {
    border-radius: 0 !important;
  }
  .prescription-table-input {
    border-radius: 0 !important;
  }
  .prescription-table-input:focus {
    border-radius: 0 !important;
  }
  /* Override global input styles for checkboxes in complaints dropdown */
  .complaints-dropdown input[type="checkbox"] {
    width: auto !important;
    padding: 0 !important;
    border: none !important;
    border-radius: 0 !important;
    background: transparent !important;
    font-size: inherit !important;
    font-family: inherit !important;
    margin: 0 !important;
  }
  .complaints-dropdown input[type="checkbox"]:focus {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
  }
`;

interface TreatmentData {
    patientId: string;
    patientName: string;
    visitNumber?: number;
    doctorId?: string;
    clinicId?: string;
    appointmentId?: string;
}

interface PreviousVisit {
    id: string;
    date: string;
    type: string;
    patientName: string;
    isActive?: boolean;
}

interface ComplaintRow {
    id: string;
    value: string;
    label: string;
    comment: string;
}

interface DiagnosisRow {
    id: string;
    diagnosis: string;
    comment: string;
}

interface MedicineRow {
    id: string;
    medicine: string;
    instruction: string;
}

interface PrescriptionRow {
    id: string;
    prescription: string;
    b: string;
    l: string;
    d: string;
    days: string;
    instruction: string;
}

interface InvestigationRow {
    id: string;
    investigation: string;
}

interface Attachment {
    id: string;
    name: string;
    type: 'pdf' | 'docx' | 'xlsx';
}

export default function Treatment() {
    const navigate = useNavigate();
    const location = useLocation();
    const [sessionData, setSessionData] = useState<SessionInfo | null>(null);
    const [treatmentData, setTreatmentData] = useState<TreatmentData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [showVitalsTrend, setShowVitalsTrend] = useState<boolean>(false);
    
    // Form data state
    const [formData, setFormData] = useState({
        referralBy: 'Self',
        visitType: {
            inPerson: true,
            followUp: true
        },
        medicalHistory: {
            hypertension: false,
            diabetes: false,
            cholesterol: false,
            ihd: false,
            asthma: false,
            th: false,
            smoking: false,
            tobacco: false,
            alcohol: false
        },
        allergy: '',
        medicalHistoryText: '',
        surgicalHistory: '',
        medicines: '',
        visitComments: '',
        pc: '',
        height: '',
        weight: '',
        bmi: '',
        pulse: '',
        bp: '',
        sugar: '',
        tft: '',
        pallorHb: '',
        detailedHistory: '',
        examinationFindings: '',
        additionalComments: '',
        procedurePerformed: '',
        dressingBodyParts: ''
    });

    // Previous visits data
    const [previousVisits, setPreviousVisits] = useState<PreviousVisit[]>([
        { id: '1', date: '14-May-19', type: 'P', patientName: 'Aniruddha Tongaonkar', isActive: true },
        { id: '2', date: '02-May-19', type: 'P', patientName: 'Deepali Tongaonkar' },
        { id: '3', date: '03-May-19', type: 'L', patientName: 'Rajesh Mane' },
        { id: '4', date: '03-May-19', type: 'P', patientName: 'Kiran Patil' },
        { id: '5', date: '03-May-19', type: 'P', patientName: 'Jyoti Shinde' },
        { id: '6', date: '03-May-19', type: 'P', patientName: 'Vikrant Wagle' },
        { id: '7', date: '03-May-19', type: 'P', patientName: 'Sachin Patankar' },
        { id: '8', date: '03-May-19', type: 'P', patientName: 'Raj Surywanshi' },
        { id: '9', date: '03-May-19', type: 'P', patientName: 'Ram Patil' }
    ]);

    // Complaints and diagnosis data
    const [complaintsRows, setComplaintsRows] = useState<ComplaintRow[]>([]);
    
    // Enhanced complaints multi-select state
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
    
    const [diagnosisRows, setDiagnosisRows] = useState<DiagnosisRow[]>([
        { id: '1', diagnosis: 'HT', comment: '' }
    ]);
    const [medicineRows, setMedicineRows] = useState<MedicineRow[]>([]);
    const [prescriptionRows, setPrescriptionRows] = useState<PrescriptionRow[]>([
        { id: '1', prescription: 'RABIPLS D (RABEPRAZOLE & DOMPERIDONE)', b: '1', l: '1', d: '1', days: '10', instruction: 'AFTER MEAL' },
        { id: '2', prescription: 'DYTOR 5 (TORSEMIDE)', b: '1', l: '', d: '', days: '10', instruction: 'AFTER MEAL' },
        { id: '3', prescription: 'BIO D3 PLUS (CALCIUM + CALCITRIOL)', b: '1', l: '', d: '', days: '10', instruction: 'AFTER MEAL' },
        { id: '4', prescription: 'VALIAM FORTE (MULTIVITAMIN + MULTIMINERAL)', b: '1', l: '', d: '', days: '10', instruction: 'AFTER MEAL' }
    ]);
    const [selectedComplaint, setSelectedComplaint] = useState('');
    const [selectedDiagnosis, setSelectedDiagnosis] = useState('');
    const [selectedMedicine, setSelectedMedicine] = useState('');
    const [prescriptionInput, setPrescriptionInput] = useState('');
    
    // Investigation state
    const [investigationRows, setInvestigationRows] = useState<InvestigationRow[]>([
        { id: '1', investigation: 'BLOOD SUGAR (FASTING)' },
        { id: '2', investigation: 'BLOOD SUGAR (PP)' },
        { id: '3', investigation: 'HBA1C' }
    ]);
    const [investigationInput, setInvestigationInput] = useState('');
    
    // Previous visit prescriptions state
    const [showPreviousVisit, setShowPreviousVisit] = useState(false);
    const [previousVisitPrescriptions] = useState<PrescriptionRow[]>([
        { id: 'pv1', prescription: 'AMLOKIND-AT (AMLODIPINE + ATENOLOL)', b: '1', l: '1', d: '1', days: '15', instruction: 'AFTER MEAL' },
        { id: 'pv2', prescription: 'GLIMESTAR-MF (GLIMEPIRIDE + METFORMIN)', b: '1', l: '1', d: '1', days: '15', instruction: 'AFTER MEAL' },
        { id: 'pv3', prescription: 'TELMA 40 (TELMISARTAN)', b: '1', l: '', d: '', days: '15', instruction: 'AFTER MEAL' }
    ]);
    
    // Additional form data
    const [followUpData, setFollowUpData] = useState({
        followUpType: '',
        followUp: '',
        remarkComments: '',
        planAdv: ''
    });
    
    const [billingData, setBillingData] = useState({
        billed: '',
        discount: '',
        acBalance: '',
        dues: ''
    });
    
    // Attachments data
    const [attachments, setAttachments] = useState<Attachment[]>([
        { id: '1', name: 'AniruddhaTongaonkar.Pdf', type: 'pdf' },
        { id: '2', name: 'Jyoti Shinde.docx', type: 'docx' },
        { id: '3', name: 'Sachin Patankar.xlsx', type: 'xlsx' }
    ]);

    // Fetch session data on component mount
    useEffect(() => {
        const fetchSessionData = async () => {
            try {
                console.log('=== FETCHING SESSION DATA FOR TREATMENT ===');
                const result = await sessionService.getSessionInfo();
                if (result.success && result.data) {
                    console.log('Session data received:', result.data);
                    setSessionData(result.data);
                } else {
                    console.error('Failed to fetch session data:', result.error);
                }
            } catch (error) {
                console.error('Error fetching session data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSessionData();
    }, []);

    // Get treatment data from location state
    useEffect(() => {
        if (location.state) {
            setTreatmentData(location.state as TreatmentData);
        }
    }, [location.state]);

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

    // Load complaints from API when component mounts
    React.useEffect(() => {
        let cancelled = false;
        async function loadComplaints() {
            if (!treatmentData?.doctorId) return;
            
            setComplaintsLoading(true);
            setComplaintsError(null);
            
            try {
                const doctorId = treatmentData.doctorId;
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
    }, [treatmentData?.doctorId]);

    const handleBackToAppointments = () => {
        navigate('/appointment');
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleMedicalHistoryChange = (field: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            medicalHistory: {
                ...prev.medicalHistory,
                [field]: checked
            }
        }));
    };

    const handleVisitTypeChange = (field: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            visitType: {
                ...prev.visitType,
                [field]: checked
            }
        }));
    };

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

    const handleAddDiagnosis = () => {
        if (selectedDiagnosis.trim()) {
            const newDiagnosis: DiagnosisRow = {
                id: Date.now().toString(),
                diagnosis: selectedDiagnosis,
                comment: ''
            };
            setDiagnosisRows(prev => [...prev, newDiagnosis]);
            setSelectedDiagnosis('');
        }
    };

    const handleRemoveDiagnosis = (id: string) => {
        setDiagnosisRows(prev => prev.filter(row => row.id !== id));
    };

    const handleDiagnosisCommentChange = (id: string, comment: string) => {
        setDiagnosisRows(prev => prev.map(row => 
            row.id === id ? { ...row, comment } : row
        ));
    };

    const handleAddMedicine = () => {
        if (selectedMedicine.trim()) {
            const newMedicine: MedicineRow = {
                id: Date.now().toString(),
                medicine: selectedMedicine,
                instruction: ''
            };
            setMedicineRows(prev => [...prev, newMedicine]);
            setSelectedMedicine('');
        }
    };

    const handleRemoveMedicine = (id: string) => {
        setMedicineRows(prev => prev.filter(row => row.id !== id));
    };

    const handleMedicineInstructionChange = (id: string, instruction: string) => {
        setMedicineRows(prev => prev.map(row => 
            row.id === id ? { ...row, instruction } : row
        ));
    };

    const handleAddPrescription = () => {
        if (prescriptionInput.trim()) {
            const newPrescription: PrescriptionRow = {
                id: Date.now().toString(),
                prescription: prescriptionInput,
                b: '',
                l: '',
                d: '',
                days: '',
                instruction: ''
            };
            setPrescriptionRows(prev => [...prev, newPrescription]);
            setPrescriptionInput('');
        }
    };

    const handleRemovePrescription = (id: string) => {
        setPrescriptionRows(prev => prev.filter(row => row.id !== id));
    };

    const handlePrescriptionInstructionChange = (id: string, instruction: string) => {
        setPrescriptionRows(prev => prev.map(row => 
            row.id === id ? { ...row, instruction } : row
        ));
    };

    const handlePrescriptionFieldChange = (id: string, field: string, value: string) => {
        setPrescriptionRows(prev => prev.map(row => 
            row.id === id ? { ...row, [field]: value } : row
        ));
    };

    // Investigation handlers
    const handleAddInvestigation = () => {
        if (investigationInput.trim()) {
            const newInvestigation: InvestigationRow = {
                id: Date.now().toString(),
                investigation: investigationInput
            };
            setInvestigationRows(prev => [...prev, newInvestigation]);
            setInvestigationInput('');
        }
    };

    const handleRemoveInvestigation = (id: string) => {
        setInvestigationRows(prev => prev.filter(row => row.id !== id));
    };

    const handleFollowUpChange = (field: string, value: string) => {
        setFollowUpData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleBillingChange = (field: string, value: string) => {
        setBillingData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (loading) {
        return (
            <div className="page">
                <div className="body">
                    <div className="dashboard-header" style={{ background: 'transparent' }}>
                        <h2 className="dashboard-title">Loading Treatment...</h2>
                    </div>
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <style dangerouslySetInnerHTML={{ __html: durationCommentStyles }} />
            <div className="body">
                {/* Header */}
                <div className="dashboard-header" style={{ background: 'transparent', display: 'flex', alignItems: 'center', padding: '12px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 className="dashboard-title" style={{ color: '#000' }}>Patient's Treatment Details</h2>
                    </div>
                </div>

                {/* Main Content - Two Column Layout */}
                <div style={{ display: 'flex', minHeight: 'calc(100vh - 120px)', fontFamily: "'Roboto', sans-serif", overflowY: 'auto' }}>
                    {/* Left Sidebar - Previous Visits and Attachments */}
                    <div style={{ 
                        width: '240px', 
                        backgroundColor: '#f8f9fa', 
                        borderRight: '1px solid #dee2e6',
                        display: 'flex',
                        flexDirection: 'column',
                        marginTop: '8px',
                        marginLeft: '15px',
                        marginBottom: '8px',
                        marginRight: '24px'
                    }}>
                        {/* Previous Visits Section */}
                        <div>
                            <div style={{ 
                                backgroundColor: '#1976d2', 
                                color: 'white', 
                                padding: '12px 15px', 
                                fontWeight: 'bold',
                                fontSize: '14px'
                            }}>
                                Previous Visits
                            </div>
                            <div style={{ padding: '0' }}>
                                {previousVisits.map((visit, index) => (
                                    <div 
                                        key={visit.id}
                                        style={{
                                            padding: '10px 15px',
                                            borderBottom: '1px solid #e0e0e0',
                                            backgroundColor: visit.isActive ? '#e3f2fd' : 'white',
                                            cursor: 'pointer',
                                            fontSize: '13px'
                                        }}
                                        onClick={() => {
                                            setPreviousVisits(prev => prev.map(v => ({ ...v, isActive: v.id === visit.id })));
                                        }}
                                    >
                                        <div style={{ fontWeight: '500', color: '#333' }}>
                                            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                                                {visit.date} | {visit.type}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                                                {visit.patientName}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Attachments Section */}
                        <div style={{ marginTop: '2px' }}>
                            <div style={{ 
                                backgroundColor: '#1976d2', 
                                color: 'white', 
                                padding: '12px 15px', 
                                fontWeight: 'bold',
                                fontSize: '14px'
                            }}>
                                Attachments
                            </div>
                            <div style={{ padding: '0' }}>
                                {attachments.map((attachment, index) => (
                                    <div 
                                        key={attachment.id}
                                        style={{
                                            padding: '10px 15px',
                                            borderBottom: '1px solid #e0e0e0',
                                            backgroundColor: 'white',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <div style={{ fontSize: '16px' }}>
                                            {attachment.type === 'pdf' && '📄'}
                                            {attachment.type === 'docx' && '📝'}
                                            {attachment.type === 'xlsx' && '📊'}
                                        </div>
                                        <div style={{ fontWeight: '500', color: '#333', flex: 1 }}>
                                            {attachment.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Past Visit Section */}
                        <div style={{ marginTop: '2px' }}>
                            <div style={{ 
                                backgroundColor: '#1976d2', 
                                color: 'white', 
                                padding: '12px 15px', 
                                fontWeight: 'bold',
                                fontSize: '14px'
                            }}>
                                Past Visit
                            </div>
                            <div style={{ padding: '0' }}>
                                <div style={{
                                    padding: '10px 15px',
                                    borderBottom: '1px solid #e0e0e0',
                                    backgroundColor: 'white',
                                    fontSize: '13px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ fontWeight: '500', color: '#333' }}>
                                        03-May-19
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Treatment Form */}
                    <div style={{ flex: 1, padding: '15px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>
                        {/* Patient Header */}
                        <div style={{ 
                            marginBottom: '15px', 
                            padding: '0', 
                            backgroundColor: '#f8f9fa', 
                            borderRadius: '4px'
                        }}>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center'
                            }}>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2e7d32' }}>
                                    {treatmentData?.patientName || 'Amit Kalamkar'} / Male / 48 Y
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <label style={{ fontWeight: 'bold', color: '#333', fontSize: '12px', whiteSpace: 'nowrap' }}>Referred By:</label>
                                        <span style={{
                                            fontSize: '12px',
                                            color: '#333',
                                            fontWeight: 500
                                        }}>Self</span>
                                    </div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '12px', whiteSpace: 'nowrap' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.visitType.inPerson}
                                            onChange={(e) => handleVisitTypeChange('inPerson', e.target.checked)}
                                        />
                                        In-Person
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '12px', whiteSpace: 'nowrap' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.visitType.followUp}
                                            onChange={(e) => handleVisitTypeChange('followUp', e.target.checked)}
                                        />
                                        Follow-up
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Medical History Checkboxes */}
                        <div style={{ marginBottom: '15px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                {Object.entries(formData.medicalHistory).map(([key, value]) => (
                                    <label key={key} style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '5px', 
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        backgroundColor: value ? '#e3f2fd' : 'transparent',
                                        borderRadius: '4px',
                                        border: value ? '1px solid #1976d2' : '1px solid transparent'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={value}
                                            onChange={(e) => handleMedicalHistoryChange(key, e.target.checked)}
                                            style={{ margin: 0 }}
                                        />
                                        <span style={{ textTransform: 'capitalize', fontWeight: '500' }}>
                                            {key === 'ihd' ? 'IHD' : key === 'th' ? 'TH' : key.charAt(0).toUpperCase() + key.slice(1)}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Input Fields Row 1 */}
                        <div style={{ marginBottom: '15px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 180px)' as const, gap: '12px' }}>
                                {[
                                    { key: 'allergy', label: 'Allergy' },
                                    { key: 'medicalHistoryText', label: 'Medical History' },
                                    { key: 'surgicalHistory', label: 'Surgical History' },
                                    { key: 'medicines', label: 'Medicines' },
                                    { key: 'visitComments', label: 'Visit Comments' },
                                    { key: 'pc', label: 'PC' }
                                ].map(({ key, label }) => (
                                    <div key={key}>
                                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                            {label}
                                        </label>
                                        <input
                                            type="text"
                                            value={formData[key as keyof typeof formData] as string}
                                            onChange={(e) => handleInputChange(key, e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '6px 10px',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                fontSize: '13px'
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Vitals Row */}
                        <div style={{ marginBottom: '15px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 130px)' as const, gap: '12px' }}>
                                {[
                                    { key: 'height', label: 'Height (Cm)' },
                                    { key: 'weight', label: 'Weight (Kg)' },
                                    { key: 'bmi', label: 'BMI' },
                                    { key: 'pulse', label: 'Pulse (min)' },
                                    { key: 'bp', label: 'BP' },
                                    { key: 'sugar', label: 'Sugar' },
                                    { key: 'tft', label: 'TFT' },
                                    { key: 'pallorHb', label: 'Pallor/HB' }
                                ].map(({ key, label }) => (
                                    <div key={key}>
                                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                            {label}
                                        </label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', position: key === 'pallorHb' ? 'relative' as const : undefined }}>
                                            <input
                                                type="text"
                                                value={formData[key as keyof typeof formData] as string}
                                                onChange={(e) => handleInputChange(key, e.target.value)}
                                                style={{
                                                    flex: 1,
                                                    padding: '6px 10px',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '4px',
                                                    fontSize: '13px'
                                                }}
                                            />
                                            {key === 'pallorHb' && (
                                                <button
                                                    type="button"
                                                    style={{
                                                        position: 'absolute',
                                                        left: 'calc(100% + 16px)',
                                                        top: '50%',
                                                        marginTop: '-14px',
                                                        backgroundColor: '#1976d2',
                                                        color: 'white',
                                                        border: 'none',
                                                        height: '28px',
                                                        padding: '0 8px',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '10px',
                                                        lineHeight: 1,
                                                        whiteSpace: 'nowrap',
                                                        outline: 'none',
                                                    }}
                                                    onClick={() => setShowVitalsTrend((prev) => !prev)}
                                                >
                                                    Trend
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Historical Data Table */}
                        {showVitalsTrend && (
                            <div style={{ marginBottom: '15px' }}>
                                <div style={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: '120px 80px 80px 80px 100px 80px 80px 100px 120px 120px' as const, 
                                        backgroundColor: '#1976d2', 
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '11px'
                                    }}>
                                        <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Date</div>
                                        <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Height</div>
                                        <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Weight</div>
                                        <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Pulse</div>
                                        <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>BP</div>
                                        <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Sugar</div>
                                        <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>TFT</div>
                                        <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Pallor/HB</div>
                                        <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Important Findings</div>
                                        <div style={{ padding: '6px' }}>Detailed History</div>
                                    </div>
                                    {[
                                        { date: '07-Jun-2022 : M', height: '171.00', weight: '76.00', pulse: '78', bp: '132 - 82.0', sugar: '--', tft: '--', pallorHb: '--', findings: '--', history: '--' },
                                        { date: '07-Jun-2022 : M', height: '171.00', weight: '76.00', pulse: '78', bp: '132 - 82.0', sugar: '--', tft: '--', pallorHb: '--', findings: '--', history: '--' },
                                        { date: '07-Jun-2022 : M', height: '171.00', weight: '76.00', pulse: '78', bp: '132 - 82.0', sugar: '--', tft: '--', pallorHb: '--', findings: '--', history: '--' },
                                        { date: '07-Jun-2022 : M', height: '171.00', weight: '76.00', pulse: '78', bp: '132 - 82.0', sugar: '--', tft: '--', pallorHb: '--', findings: '--', history: '--' },
                                        { date: '07-Jun-2022 : M', height: '171.00', weight: '76.00', pulse: '78', bp: '132 - 82.0', sugar: '--', tft: '--', pallorHb: '--', findings: '--', history: '--' }
                                    ].map((row, index) => (
                                        <div key={index} style={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: '120px 80px 80px 80px 100px 80px 80px 100px 120px 120px' as const,
                                            backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                                            borderBottom: '1px solid #e0e0e0'
                                        }}>
                                            <div style={{ padding: '10px', borderRight: '1px solid #e0e0e0', fontSize: '11px' }}>{row.date}</div>
                                            <div style={{ padding: '10px', borderRight: '1px solid #e0e0e0', fontSize: '11px' }}>{row.height}</div>
                                            <div style={{ padding: '10px', borderRight: '1px solid #e0e0e0', fontSize: '11px' }}>{row.weight}</div>
                                            <div style={{ padding: '10px', borderRight: '1px solid #e0e0e0', fontSize: '11px' }}>{row.pulse}</div>
                                            <div style={{ padding: '10px', borderRight: '1px solid #e0e0e0', fontSize: '11px' }}>{row.bp}</div>
                                            <div style={{ padding: '10px', borderRight: '1px solid #e0e0e0', fontSize: '11px' }}>{row.sugar}</div>
                                            <div style={{ padding: '10px', borderRight: '1px solid #e0e0e0', fontSize: '11px' }}>{row.tft}</div>
                                            <div style={{ padding: '10px', borderRight: '1px solid #e0e0e0', fontSize: '11px' }}>{row.pallorHb}</div>
                                            <div style={{ padding: '10px', borderRight: '1px solid #e0e0e0', fontSize: '11px' }}>{row.findings}</div>
                                            <div style={{ padding: '10px', fontSize: '11px' }}>{row.history}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Complaints Section */}
                        <div style={{ marginBottom: '15px' }}>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'flex-start' }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', width: '88%', gap: '8px' }}>
                                        <label style={{ fontWeight: 'bold', color: '#333', fontSize: '13px' }}>Complaints</label>
                                        <span style={{ fontSize: '12px', color: '#666', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 1 }}>
                                            Complaints are copied from previous visit
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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

                                                    <div className="complaints-dropdown" style={{ maxHeight: '200px', overflowY: 'auto', padding: '4px 6px', display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', columnGap: '8px', rowGap: '6px' }}>
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
                                                                        const doctorId = treatmentData?.doctorId || '1';
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
                                                                        <span style={{ whiteSpace: 'nowrap' }}>{opt.label}</span>
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
                                        <button
                                            type="button"
                                            style={{
                                                backgroundColor: '#1976d2',
                                                color: 'white',
                                                border: 'none',
                                                padding: '6px',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                width: '32px',
                                                height: '32px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '14px',
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#1565c0';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = '#1976d2';
                                            }}
                                        >
                                            <Add fontSize="small" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Complaints Table */}
                            {complaintsRows.length > 0 && (
                                <div style={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: '60px 1.5fr 1.5fr 80px' as const, 
                                        backgroundColor: '#1976d2', 
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '11px'
                                    }}>
                                        <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Sr.</div>
                                        <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Complaint Description</div>
                                        <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Duration / Comment</div>
                                        <div style={{ padding: '6px' }}>Action</div>
                                    </div>
                                    {complaintsRows.map((row, index) => (
                                        <div key={row.id} style={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: '60px 1.5fr 1.5fr 80px' as const,
                                            backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                                            borderBottom: '1px solid #e0e0e0'
                                        }}>
                                            <div style={{ padding: '6px', borderRight: '1px solid #e0e0e0', fontSize: '12px' }}>{index + 1}</div>
                                            <div style={{ padding: '6px', borderRight: '1px solid #e0e0e0', fontSize: '12px' }}>{row.label}</div>
                                            <div style={{ padding: '0', borderRight: '1px solid #e0e0e0' }}>
                                                <input
                                                    type="text"
                                                    value={row.comment}
                                                    onChange={(e) => handleComplaintCommentChange(row.value, e.target.value)}
                                                    placeholder="Enter duration/comment"
                                                    className="duration-comment-input duration-comment-table-input"
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
                                                        boxShadow: 'none !important',
                                                        fontSize: '11px'
                                                    }}
                                                />
                                            </div>
                                            <div style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                            )}
                        </div>

                        {/* Detailed Text Areas */}
                        <div style={{ marginBottom: '15px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' as const, gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                        Detailed History
                                    </label>
                                    <textarea
                                        value={formData.detailedHistory}
                                        onChange={(e) => handleInputChange('detailedHistory', e.target.value)}
                                        rows={3}
                                        style={{
                                            width: '100%',
                                            padding: '6px 10px',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            fontSize: '13px',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                        Examination Findings
                                    </label>
                                    <textarea
                                        value={formData.examinationFindings}
                                        onChange={(e) => handleInputChange('examinationFindings', e.target.value)}
                                        rows={3}
                                        style={{
                                            width: '100%',
                                            padding: '6px 10px',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            fontSize: '13px',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                        Additional Comments
                                    </label>
                                    <textarea
                                        value={formData.additionalComments}
                                        onChange={(e) => handleInputChange('additionalComments', e.target.value)}
                                        rows={3}
                                        style={{
                                            width: '100%',
                                            padding: '6px 10px',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            fontSize: '13px',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Procedure Performed */}
                        <div style={{ marginBottom: '15px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' as const, gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                        Procedure Performed
                                    </label>
                                    <textarea
                                        value={formData.procedurePerformed}
                                        onChange={(e) => handleInputChange('procedurePerformed', e.target.value)}
                                        rows={3}
                                        style={{
                                            width: '100%',
                                            padding: '6px 10px',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            fontSize: '13px',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                        Dressing (body parts)
                                    </label>
                                    <textarea
                                        value={formData.dressingBodyParts}
                                        onChange={(e) => handleInputChange('dressingBodyParts', e.target.value)}
                                        rows={3}
                                        style={{
                                            width: '100%',
                                            padding: '6px 10px',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            fontSize: '13px',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px', visibility: 'hidden' }}>
                                        Button Label
                                    </label>
                                    <button
                                        type="button"
                                        style={{
                                            width: '100%',
                                            height: '40px',
                                            padding: '6px 10px',
                                            backgroundColor: '#007bff',
                                            color: 'white',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            fontSize: '13px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            textTransform: 'uppercase'
                                        }}
                                        onClick={() => {
                                            // Add your button click handler here
                                            console.log('Record test Result clicked');
                                        }}
                                    >
                                        RECORD TEST RESULT
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Diagnosis Section */}
                        <div style={{ marginBottom: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px', width: '88%', gap: '8px' }}>
                                <label style={{ fontWeight: 'bold', color: '#333', fontSize: '13px' }}>Diagnosis</label>
                                <span style={{ fontSize: '12px', color: '#666', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 1 }}>
                                    Diagnosis are copied from previous visit
                                </span>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                <select
                                    value={selectedDiagnosis}
                                    onChange={(e) => setSelectedDiagnosis(e.target.value)}
                                    style={{
                                        flex: 1,
                                        padding: '6px 10px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '13px'
                                    }}
                                >
                                    <option value="">Select Provisional Diagnosis</option>
                                    <option value="HT">HT</option>
                                    <option value="DM">DM</option>
                                    <option value="Common Cold">Common Cold</option>
                                    <option value="Fever">Fever</option>
                                </select>
                                <button
                                    type="button"
                                    onClick={handleAddDiagnosis}
                                    style={{
                                        backgroundColor: '#1976d2',
                                        color: 'white',
                                        border: 'none',
                                        padding: '6px 12px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '12px'
                                    }}
                                >
                                    ADD
                                </button>
                                <button
                                    type="button"
                                    style={{
                                        backgroundColor: '#1976d2',
                                        color: 'white',
                                        border: 'none',
                                        padding: '6px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '14px',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#1565c0';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#1976d2';
                                    }}
                                >
                                    <Add fontSize="small" />
                                </button>
                            </div>

                            {/* Diagnosis Table */}
                            {diagnosisRows.length > 0 && (
                                <div style={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: '60px 1fr 80px' as const, 
                                        backgroundColor: '#1976d2', 
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '11px'
                                    }}>
                                        <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Sr.</div>
                                        <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Provisional Diagnosis</div>
                                        <div style={{ padding: '6px' }}>Action</div>
                                    </div>
                                    {diagnosisRows.map((row, index) => (
                                        <div key={row.id} style={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: '60px 1fr 80px' as const,
                                            backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                                            borderBottom: '1px solid #e0e0e0'
                                        }}>
                                            <div style={{ padding: '6px', borderRight: '1px solid #e0e0e0', fontSize: '12px' }}>{index + 1}</div>
                                            <div style={{ padding: '6px', borderRight: '1px solid #e0e0e0', fontSize: '12px' }}>{row.diagnosis}</div>
                                            <div style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <div
                                                    onClick={() => handleRemoveDiagnosis(row.id)}
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
                            )}
                        </div>

                        {/* Medicine Section */}
                        <div style={{ marginBottom: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px', width: '88%', gap: '8px' }}>
                                <label style={{ fontWeight: 'bold', color: '#333', fontSize: '13px' }}>Medicine</label>
                                <span style={{ fontSize: '12px', color: '#666', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 1 }}>
                                    Medicine saved successfully!!
                                </span>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                <select
                                    value={selectedMedicine}
                                    onChange={(e) => setSelectedMedicine(e.target.value)}
                                    style={{
                                        flex: 1,
                                        padding: '6px 10px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '13px'
                                    }}
                                >
                                    <option value="">Select Medicines</option>
                                    <option value="Paracetamol">Paracetamol</option>
                                    <option value="Amoxicillin">Amoxicillin</option>
                                    <option value="Ibuprofen">Ibuprofen</option>
                                    <option value="Aspirin">Aspirin</option>
                                </select>
                                <button
                                    type="button"
                                    onClick={handleAddMedicine}
                                    style={{
                                        backgroundColor: '#1976d2',
                                        color: 'white',
                                        border: 'none',
                                        padding: '6px 12px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '12px'
                                    }}
                                >
                                    ADD
                                </button>
                                <button
                                    type="button"
                                    style={{
                                        backgroundColor: '#1976d2',
                                        color: 'white',
                                        border: 'none',
                                        padding: '6px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '14px',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#1565c0';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#1976d2';
                                    }}
                                >
                                    <Add fontSize="small" />
                                </button>
                            </div>

                            {/* Medicine Table */}
                            {medicineRows.length > 0 && (
                                <div style={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: '50px 1fr 1fr 60px' as const, 
                                        backgroundColor: '#1976d2', 
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '11px'
                                    }}>
                                        <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Sr.</div>
                                        <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Medicine</div>
                                        <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Instruction</div>
                                        <div style={{ padding: '6px' }}>Action</div>
                                    </div>
                                    {medicineRows.map((row, index) => (
                                        <div key={row.id} style={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: '50px 1fr 1fr 60px' as const,
                                            backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                                            borderBottom: '1px solid #e0e0e0'
                                        }}>
                                            <div style={{ padding: '6px', borderRight: '1px solid #e0e0e0', fontSize: '12px' }}>{index + 1}</div>
                                            <div style={{ padding: '6px', borderRight: '1px solid #e0e0e0', fontSize: '12px' }}>{row.medicine}</div>
                                            <div style={{ padding: '0', borderRight: '1px solid #e0e0e0' }}>
                                                <input
                                                    type="text"
                                                    value={row.instruction}
                                                    onChange={(e) => handleMedicineInstructionChange(row.id, e.target.value)}
                                                    placeholder="Enter instruction"
                                                    className="medicine-instruction-table-input"
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        padding: '8px 10px',
                                                        border: 'none',
                                                        outline: 'none',
                                                        fontSize: '11px',
                                                        borderRadius: '0 !important',
                                                        background: 'transparent',
                                                        boxShadow: 'none !important'
                                                    }}
                                                />
                                            </div>
                                            <div style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <div
                                                    onClick={() => handleRemoveMedicine(row.id)}
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
                            )}
                        </div>

                        {/* Prescription Section */}
                        <div style={{ marginBottom: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px', width: '88%', gap: '8px' }}>
                                <label style={{ fontWeight: 'bold', color: '#333', fontSize: '13px' }}>Prescription</label>
                                <span style={{ fontSize: '12px', color: '#666', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 1 }}>
                                    Prescription medicine saved successfully!!
                                </span>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                <input
                                    type="text"
                                    value={prescriptionInput}
                                    onChange={(e) => setPrescriptionInput(e.target.value)}
                                    placeholder="Enter Brand Name / Prescription"
                                    style={{
                                        flex: 1,
                                        padding: '6px 10px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '13px'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddPrescription}
                                    style={{
                                        backgroundColor: '#1976d2',
                                        color: 'white',
                                        border: 'none',
                                        padding: '6px 12px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '12px'
                                    }}
                                >
                                    ADD Rx
                                </button>
                                <button
                                    type="button"
                                    style={{
                                        backgroundColor: '#1976d2',
                                        color: 'white',
                                        border: 'none',
                                        padding: '6px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '14px',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#1565c0';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#1976d2';
                                    }}
                                >
                                    <Add fontSize="small" />
                                </button>
                                <button
                                    type="button"
                                    style={{
                                        backgroundColor: '#1976d2',
                                        color: 'white',
                                        border: 'none',
                                        padding: '6px',
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#1565c0';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#1976d2';
                                    }}
                                >
                                    i
                                </button>
                            </div>

                            {/* Prescription Table */}
                            {prescriptionRows.length > 0 && (
                                <div style={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: '50px 1fr 50px 50px 50px 50px 1fr 80px' as const, 
                                        backgroundColor: '#1976d2', 
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '11px'
                                    }}>
                                        <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Sr.</div>
                                        <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Prescriptions</div>
                                        <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>B</div>
                                        <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>L</div>
                                        <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>D</div>
                                        <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Days</div>
                                        <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Instruction</div>
                                        <div style={{ padding: '6px' }}>Action</div>
                                    </div>
                                    {prescriptionRows.map((row, index) => (
                                        <div key={row.id} style={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: '50px 1fr 50px 50px 50px 50px 1fr 80px' as const,
                                            backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                                            borderBottom: '1px solid #e0e0e0'
                                        }}>
                                            <div style={{ padding: '6px', borderRight: '1px solid #e0e0e0', fontSize: '12px' }}>{index + 1}</div>
                                            <div style={{ padding: '6px', borderRight: '1px solid #e0e0e0', fontSize: '12px' }}>{row.prescription}</div>
                                            <div style={{ padding: '0', borderRight: '1px solid #e0e0e0' }}>
                                                <input
                                                    type="text"
                                                    value={row.b}
                                                    onChange={(e) => handlePrescriptionFieldChange(row.id, 'b', e.target.value)}
                                                    className="prescription-table-input"
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        padding: '8px 6px',
                                                        border: 'none !important',
                                                        borderWidth: '0 !important',
                                                        borderStyle: 'none !important',
                                                        borderColor: 'transparent !important',
                                                        borderRadius: '0 !important',
                                                        outline: 'none',
                                                        background: 'transparent',
                                                        boxShadow: 'none !important',
                                                        fontSize: '11px',
                                                        textAlign: 'center'
                                                    }}
                                                />
                                            </div>
                                            <div style={{ padding: '0', borderRight: '1px solid #e0e0e0' }}>
                                                <input
                                                    type="text"
                                                    value={row.l}
                                                    onChange={(e) => handlePrescriptionFieldChange(row.id, 'l', e.target.value)}
                                                    className="prescription-table-input"
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        padding: '8px 6px',
                                                        border: 'none !important',
                                                        borderWidth: '0 !important',
                                                        borderStyle: 'none !important',
                                                        borderColor: 'transparent !important',
                                                        borderRadius: '0 !important',
                                                        outline: 'none',
                                                        background: 'transparent',
                                                        boxShadow: 'none !important',
                                                        fontSize: '11px',
                                                        textAlign: 'center'
                                                    }}
                                                />
                                            </div>
                                            <div style={{ padding: '0', borderRight: '1px solid #e0e0e0' }}>
                                                <input
                                                    type="text"
                                                    value={row.d}
                                                    onChange={(e) => handlePrescriptionFieldChange(row.id, 'd', e.target.value)}
                                                    className="prescription-table-input"
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        padding: '8px 6px',
                                                        border: 'none !important',
                                                        borderWidth: '0 !important',
                                                        borderStyle: 'none !important',
                                                        borderColor: 'transparent !important',
                                                        borderRadius: '0 !important',
                                                        outline: 'none',
                                                        background: 'transparent',
                                                        boxShadow: 'none !important',
                                                        fontSize: '11px',
                                                        textAlign: 'center'
                                                    }}
                                                />
                                            </div>
                                            <div style={{ padding: '0', borderRight: '1px solid #e0e0e0' }}>
                                                <input
                                                    type="text"
                                                    value={row.days}
                                                    onChange={(e) => handlePrescriptionFieldChange(row.id, 'days', e.target.value)}
                                                    className="prescription-table-input"
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        padding: '8px 6px',
                                                        border: 'none !important',
                                                        borderWidth: '0 !important',
                                                        borderStyle: 'none !important',
                                                        borderColor: 'transparent !important',
                                                        borderRadius: '0 !important',
                                                        outline: 'none',
                                                        background: 'transparent',
                                                        boxShadow: 'none !important',
                                                        fontSize: '11px',
                                                        textAlign: 'center'
                                                    }}
                                                />
                                            </div>
                                            <div style={{ padding: '0', borderRight: '1px solid #e0e0e0' }}>
                                                <input
                                                    type="text"
                                                    value={row.instruction}
                                                    onChange={(e) => handlePrescriptionInstructionChange(row.id, e.target.value)}
                                                    placeholder="Enter instruction"
                                                    className="prescription-table-input"
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
                                                        boxShadow: 'none !important',
                                                        fontSize: '11px'
                                                    }}
                                                />
                                            </div>
                                            <div style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                                <div
                                                    onClick={() => {
                                                        // Handle edit functionality
                                                        console.log('Edit prescription:', row.id);
                                                    }}
                                                    title="Edit"
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
                                                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.color = '#1976d2'; }}
                                                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.color = '#000000'; }}
                                                >
                                                    <Edit fontSize="small" />
                                                </div>
                                                <div
                                                    onClick={() => handleRemovePrescription(row.id)}
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
                            )}
                        </div>

                        {/* Previous Visit Section */}
                        <div style={{ marginBottom: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px', width: '88%' }}>
                                <label style={{ fontWeight: 'bold', color: '#333', fontSize: '13px' }}>Previous visit</label>
                                <div
                                    onClick={() => setShowPreviousVisit(!showPreviousVisit)}
                                    style={{
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        color: '#000000',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '24px',
                                        height: '24px'
                                    }}
                                >
                                    {showPreviousVisit ? '▲' : '▼'}
                                </div>
                            </div>
                            
                            {/* Previous Visit Prescriptions Table */}
                            {showPreviousVisit && previousVisitPrescriptions.length > 0 && (
                                <div style={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: '50px 1fr 50px 50px 50px 50px 1fr' as const, 
                                        backgroundColor: '#8D6E63', 
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '11px'
                                    }}>
                                        <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Sr.</div>
                                        <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Prescriptions</div>
                                        <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>B</div>
                                        <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>L</div>
                                        <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>D</div>
                                        <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Days</div>
                                        <div style={{ padding: '6px' }}>Instruction</div>
                                    </div>
                                    {previousVisitPrescriptions.map((row, index) => (
                                        <div key={row.id} style={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: '50px 1fr 50px 50px 50px 50px 1fr' as const,
                                            backgroundColor: index % 2 === 0 ? '#D7CCC8' : '#EFEBE9',
                                            borderBottom: '1px solid #BCAAA4'
                                        }}>
                                            <div style={{ padding: '6px', borderRight: '1px solid #BCAAA4', fontSize: '12px', color: '#5D4037' }}>{index + 1}</div>
                                            <div style={{ padding: '6px', borderRight: '1px solid #BCAAA4', fontSize: '12px', color: '#5D4037' }}>{row.prescription}</div>
                                            <div style={{ padding: '6px', borderRight: '1px solid #BCAAA4', fontSize: '12px', color: '#5D4037', textAlign: 'center' }}>{row.b}</div>
                                            <div style={{ padding: '6px', borderRight: '1px solid #BCAAA4', fontSize: '12px', color: '#5D4037', textAlign: 'center' }}>{row.l}</div>
                                            <div style={{ padding: '6px', borderRight: '1px solid #BCAAA4', fontSize: '12px', color: '#5D4037', textAlign: 'center' }}>{row.d}</div>
                                            <div style={{ padding: '6px', borderRight: '1px solid #BCAAA4', fontSize: '12px', color: '#5D4037', textAlign: 'center' }}>{row.days}</div>
                                            <div style={{ padding: '6px', fontSize: '12px', color: '#5D4037' }}>{row.instruction}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Investigation Section */}
                        <div style={{ marginBottom: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px', width: '88%', gap: '8px' }}>
                                <label style={{ fontWeight: 'bold', color: '#333', fontSize: '13px' }}>Investigation</label>
                                <span style={{ fontSize: '12px', color: '#666', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 1 }}>
                                    Investigation saved successfully!!
                                </span>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                <input
                                    type="text"
                                    value={investigationInput}
                                    onChange={(e) => setInvestigationInput(e.target.value)}
                                    placeholder="Enter Investigation Name"
                                    style={{
                                        flex: 1,
                                        padding: '6px 10px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '13px'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddInvestigation}
                                    style={{
                                        backgroundColor: '#1976d2',
                                        color: 'white',
                                        border: 'none',
                                        padding: '6px 12px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '12px'
                                    }}
                                >
                                    Add
                                </button>
                                <button
                                    type="button"
                                    style={{
                                        backgroundColor: '#1976d2',
                                        color: 'white',
                                        border: 'none',
                                        padding: '6px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '14px',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#1565c0';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#1976d2';
                                    }}
                                >
                                    <Add fontSize="small" />
                                </button>
                                <button
                                    type="button"
                                    style={{
                                        backgroundColor: '#1976d2',
                                        color: 'white',
                                        border: 'none',
                                        padding: '6px',
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#1565c0';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#1976d2';
                                    }}
                                >
                                    i
                                </button>
                            </div>

                            {/* Investigation Table */}
                            {investigationRows.length > 0 && (
                                <div style={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: '60px 1fr 80px' as const, 
                                        backgroundColor: '#1976d2', 
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '11px'
                                    }}>
                                        <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Sr.</div>
                                        <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Investigation</div>
                                        <div style={{ padding: '6px' }}>Action</div>
                                    </div>
                                    {investigationRows.map((row, index) => (
                                        <div key={row.id} style={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: '60px 1fr 80px' as const,
                                            backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                                            borderBottom: '1px solid #e0e0e0'
                                        }}>
                                            <div style={{ padding: '6px', borderRight: '1px solid #e0e0e0', fontSize: '12px' }}>{index + 1}</div>
                                            <div style={{ padding: '6px', borderRight: '1px solid #e0e0e0', fontSize: '12px' }}>{row.investigation}</div>
                                            <div style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <div
                                                    onClick={() => handleRemoveInvestigation(row.id)}
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
                                                    <Delete style={{ fontSize: '16px' }} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Follow-up Section */}
                        <div style={{ marginBottom: '15px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                        Follow-up Type
                                    </label>
                                    <select
                                        value={followUpData.followUpType}
                                        onChange={(e) => handleFollowUpChange('followUpType', e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '6px 10px',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            fontSize: '13px',
                                            height: '32px'
                                        }}
                                    >
                                        <option value="">Select Follow-up Type</option>
                                        <option value="Routine">Routine</option>
                                        <option value="Urgent">Urgent</option>
                                        <option value="Emergency">Emergency</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                        Follow up
                                    </label>
                                    <input
                                        type="text"
                                        value={followUpData.followUp}
                                        onChange={(e) => handleFollowUpChange('followUp', e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '6px 10px',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            fontSize: '13px'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                        Remark Comments
                                    </label>
                                    <textarea
                                        value={followUpData.remarkComments}
                                        onChange={(e) => handleFollowUpChange('remarkComments', e.target.value)}
                                        rows={1}
                                        style={{
                                            width: '100%',
                                            padding: '6px 10px',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            fontSize: '13px',
                                            resize: 'none',
                                            height: '32px',
                                            minHeight: '32px',
                                            maxHeight: '32px',
                                            overflow: 'hidden'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Plan/Adv Section */}
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                Plan / Adv
                            </label>
                            <textarea
                                value={followUpData.planAdv}
                                onChange={(e) => handleFollowUpChange('planAdv', e.target.value)}
                                rows={2}
                                style={{
                                    width: '100%',
                                    padding: '6px 10px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '13px',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        {/* Billing Section */}
                        <div style={{ marginBottom: '15px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                        Billed (Rs)
                                    </label>
                                    <input
                                        type="text"
                                        value={billingData.billed}
                                        onChange={(e) => handleBillingChange('billed', e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '6px 10px',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            fontSize: '13px'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                        Discount (Rs)
                                    </label>
                                    <input
                                        type="text"
                                        value={billingData.discount}
                                        onChange={(e) => handleBillingChange('discount', e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '6px 10px',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            fontSize: '13px'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                        Dues (Rs)
                                    </label>
                                    <input
                                        type="text"
                                        value={billingData.dues}
                                        onChange={(e) => handleBillingChange('dues', e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '6px 10px',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            fontSize: '13px'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                        <span>A/C Balance (Rs)</span>
                                        <span style={{ color: '#1976d2', fontWeight: 'bold' }}>₹</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={billingData.acBalance}
                                        onChange={(e) => handleBillingChange('acBalance', e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '6px 10px',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            fontSize: '13px'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
                            <button 
                                type="button" 
                                style={{
                                    backgroundColor: '#1976d2',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 12px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                Addendum
                            </button>
                            <button 
                                type="button" 
                                style={{
                                    backgroundColor: '#1976d2',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 12px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                Print
                            </button>
                            <button 
                                type="button" 
                                onClick={handleBackToAppointments}
                                style={{
                                    backgroundColor: '#1976d2',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 12px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                type="button" 
                                onClick={() => {
                                    console.log('Saving treatment...');
                                    alert('Treatment saved successfully!');
                                }}
                                style={{
                                    backgroundColor: '#1976d2',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 12px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                Save
                            </button>
                            <button 
                                type="button" 
                                style={{
                                    backgroundColor: '#1976d2',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 12px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                Submit
                            </button>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
