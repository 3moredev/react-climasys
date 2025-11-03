import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useLocation } from "react-router-dom";
import { visitService, ComprehensiveVisitDataRequest } from '../services/visitService';
import trendsService, { PatientTrendItem } from '../services/trendsService';
import { sessionService, SessionInfo } from "../services/sessionService";
import { Delete, Edit, Add, Info, TrendingUp } from '@mui/icons-material';
import { Snackbar } from '@mui/material';
import { complaintService, ComplaintOption } from "../services/complaintService";
import { medicineService, MedicineOption } from "../services/medicineService";
import { diagnosisService, DiagnosisOption } from "../services/diagnosisService";
import { investigationService, InvestigationOption } from "../services/investigationService";
import { appointmentService } from "../services/appointmentService";
import { getFollowUpTypes, FollowUpTypeItem } from "../services/referenceService";
import PatientFormTest from "../components/Test/PatientFormTest";
import AddComplaintPopup from "../components/AddComplaintPopup";
import AddDiagnosisPopup from "../components/AddDiagnosisPopup";
import AddMedicinePopup, { MedicineData } from "../components/AddMedicinePopup";
import AddPrescriptionPopup, { PrescriptionData } from "../components/AddPrescriptionPopup";
import AddTestLabPopup, { TestLabData } from "../components/AddTestLabPopup";
import LabTestEntry from "../components/LabTestEntry";
import InstructionGroupsPopup from "../components/InstructionGroupsPopup";
import { patientService } from "../services/patientService";

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
  .medicine-table-input {
    border-radius: 0 !important;
  }
  .medicine-table-input:focus {
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
  /* Override global input styles for checkboxes in medicines dropdown */
  .medicines-dropdown input[type="checkbox"] {
    width: auto !important;
    padding: 0 !important;
    border: none !important;
    border-radius: 0 !important;
    background: transparent !important;
    font-size: inherit !important;
    font-family: inherit !important;
    margin: 0 !important;
  }
  /* Override global input styles for checkboxes in diagnoses dropdown */
  .diagnoses-dropdown input[type="checkbox"] {
    width: auto !important;
    padding: 0 !important;
    border: none !important;
    border-radius: 0 !important;
    background: transparent !important;
    font-size: inherit !important;
    font-family: inherit !important;
    margin: 0 !important;
  }
  .medicines-dropdown input[type="checkbox"]:focus {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
  }
  .complaints-dropdown input[type="checkbox"]:focus {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
  }
  .diagnoses-dropdown input[type="checkbox"]:focus {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
  }
  /* Investigation dropdown checkboxes */
  .investigations-dropdown input[type="checkbox"] {
    width: auto !important;
    padding: 0 !important;
    border: none !important;
    border-radius: 0 !important;
    background: transparent !important;
    font-size: inherit !important;
    font-family: inherit !important;
    margin: 0 !important;
  }
  .investigations-dropdown input[type="checkbox"]:focus {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
  }
  /* Billing dropdown checkboxes */
  .billing-dropdown input[type="checkbox"] {
    width: auto !important;
    padding: 0 !important;
    border: none !important;
    border-radius: 0 !important;
    background: transparent !important;
    font-size: inherit !important;
    font-family: inherit !important;
    margin: 0 !important;
  }
  .billing-dropdown input[type="checkbox"]:focus {
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
    age?: number;
    gender?: string;
    contact?: string;
}

interface PreviousVisit {
    id: string;
    date: string;
    type: string;
    patientName: string;
    doctorName: string;
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
    value?: string;
    diagnosis: string;
    comment: string;
}

interface MedicineRow {
    id: string;
    medicine: string;
    short_description: string;
    morning: number;
    afternoon: number;
    b: string;
    l: string;
    d: string;
    days: string;
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

interface BillingDetailOption {
    id: string; // synthesized key
    billing_details: string;
    billing_group_name?: string;
    billing_subgroup_name?: string;
    default_fees?: number;
    visit_type?: string;
    visit_type_description?: string;
    visit_type_id?: string;
    isdefault?: boolean;
    sequence_no?: number;
}

export default function Treatment() {
    const navigate = useNavigate();
    const location = useLocation();
    const [sessionData, setSessionData] = useState<SessionInfo | null>(null);
    const [treatmentData, setTreatmentData] = useState<TreatmentData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [showVitalsTrend, setShowVitalsTrend] = useState<boolean>(false);
    const [trendLoading, setTrendLoading] = useState<boolean>(false);
    const [trendError, setTrendError] = useState<string | null>(null);
    const [trendRows, setTrendRows] = useState<Array<{ date: string; height: string; weight: string; pulse: string; bp: string; sugar: string; tft: string; pallorHb: string; findings: string; history: string }>>([]);
    const [showInstructionPopup, setShowInstructionPopup] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
    const [billingError, setBillingError] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    
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

    // Previous visits data - now will be populated from API
    const [previousVisits, setPreviousVisits] = useState<PreviousVisit[]>([]);
    const [loadingPreviousVisits, setLoadingPreviousVisits] = useState(false);
    const [showPatientFormDialog, setShowPatientFormDialog] = useState(false);
    const [formPatientData, setFormPatientData] = useState<any>(null);
    const [selectedPatientForForm, setSelectedPatientForForm] = useState<any>(null);
    const [allVisits, setAllVisits] = useState<any[]>([]);
    const [visitDates, setVisitDates] = useState<string[]>([]);
    const [currentVisitIndex, setCurrentVisitIndex] = useState(0);
    const [previousVisitsError, setPreviousVisitsError] = useState<string | null>(null);
    const [allDoctors, setAllDoctors] = useState<any[]>([]);

    // Complaint popup state
    const [showComplaintPopup, setShowComplaintPopup] = useState(false);
    
    // Diagnosis popup state
    const [showDiagnosisPopup, setShowDiagnosisPopup] = useState(false);
    
    // Medicine popup state
    const [showMedicinePopup, setShowMedicinePopup] = useState(false);
    
    // Prescription popup state
    const [showPrescriptionPopup, setShowPrescriptionPopup] = useState(false);
    
    // Test Lab popup state
    const [showTestLabPopup, setShowTestLabPopup] = useState(false);
    const [showLabTestEntry, setShowLabTestEntry] = useState<boolean>(false);
    const [selectedPatientForLab, setSelectedPatientForLab] = useState<any>(null);

    // Addendum modal state
    const [showAddendumModal, setShowAddendumModal] = useState<boolean>(false);
    const [addendumText, setAddendumText] = useState<string>("");

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
    
    // Medicine multi-select state
    const [selectedMedicines, setSelectedMedicines] = useState<string[]>([]);
    const [medicineSearch, setMedicineSearch] = useState('');
    const [isMedicinesOpen, setIsMedicinesOpen] = useState(false);
    const medicinesRef = React.useRef<HTMLDivElement | null>(null);
    const [medicinesOptions, setMedicinesOptions] = useState<MedicineOption[]>([]);
    const [medicinesLoading, setMedicinesLoading] = useState(false);
    const [medicinesError, setMedicinesError] = useState<string | null>(null);
    
    const filteredMedicines = React.useMemo(() => {
        const term = medicineSearch.trim().toLowerCase();
        
        if (!term) {
            // No search term - show all options with selected ones first
            const selectedOptions = medicinesOptions.filter(opt => selectedMedicines.includes(opt.value));
            const unselectedOptions = medicinesOptions.filter(opt => !selectedMedicines.includes(opt.value));
            return [...selectedOptions, ...unselectedOptions];
        } else {
            // Search term provided - show selected items first, then search results
            const selectedOptions = medicinesOptions.filter(opt => 
                selectedMedicines.includes(opt.value) && opt.label.toLowerCase().includes(term)
            );
            const unselectedSearchResults = medicinesOptions.filter(opt => 
                !selectedMedicines.includes(opt.value) && opt.label.toLowerCase().includes(term)
            );
            return [...selectedOptions, ...unselectedSearchResults];
        }
    }, [medicinesOptions, medicineSearch, selectedMedicines]);
    
    // Diagnosis multi-select state
    const [selectedDiagnoses, setSelectedDiagnoses] = useState<string[]>([]);
    const [diagnosisSearch, setDiagnosisSearch] = useState('');
    const [isDiagnosesOpen, setIsDiagnosesOpen] = useState(false);
    const diagnosesRef = React.useRef<HTMLDivElement | null>(null);
    const [diagnosesOptions, setDiagnosesOptions] = useState<DiagnosisOption[]>([]);
    const [diagnosesLoading, setDiagnosesLoading] = useState(false);
    const [diagnosesError, setDiagnosesError] = useState<string | null>(null);
    
    const filteredDiagnoses = React.useMemo(() => {
        const term = diagnosisSearch.trim().toLowerCase();
        
        if (!term) {
            // No search term - show all options with selected ones first
            const selectedOptions = diagnosesOptions.filter(opt => selectedDiagnoses.includes(opt.value));
            const unselectedOptions = diagnosesOptions.filter(opt => !selectedDiagnoses.includes(opt.value));
            return [...selectedOptions, ...unselectedOptions];
        } else {
            // Search term provided - show selected items first, then search results
            const selectedOptions = diagnosesOptions.filter(opt => 
                selectedDiagnoses.includes(opt.value) && opt.label.toLowerCase().includes(term)
            );
            const unselectedSearchResults = diagnosesOptions.filter(opt => 
                !selectedDiagnoses.includes(opt.value) && opt.label.toLowerCase().includes(term)
            );
            return [...selectedOptions, ...unselectedSearchResults];
        }
    }, [diagnosesOptions, diagnosisSearch, selectedDiagnoses]);
    
    const [diagnosisRows, setDiagnosisRows] = useState<DiagnosisRow[]>([]);
    const [medicineRows, setMedicineRows] = useState<MedicineRow[]>([]);
    const [prescriptionRows, setPrescriptionRows] = useState<PrescriptionRow[]>([]);
    const [selectedComplaint, setSelectedComplaint] = useState('');
    const [selectedDiagnosis, setSelectedDiagnosis] = useState('');
    const [prescriptionInput, setPrescriptionInput] = useState('');
    const [rxSuggestions, setRxSuggestions] = useState<string[]>([]);
    const [isRxOpen, setIsRxOpen] = useState(false);
    const rxRef = React.useRef<HTMLDivElement | null>(null);
    
    // Investigation multi-select state (mirrors Diagnosis)
    const [selectedInvestigations, setSelectedInvestigations] = useState<string[]>([]);
    const [investigationSearch, setInvestigationSearch] = useState('');
    const [isInvestigationsOpen, setIsInvestigationsOpen] = useState(false);
    const investigationsRef = React.useRef<HTMLDivElement | null>(null);
    const [investigationsOptions, setInvestigationsOptions] = useState<InvestigationOption[]>([]);
    const [investigationsLoading, setInvestigationsLoading] = useState(false);
    const [investigationsError, setInvestigationsError] = useState<string | null>(null);

    const filteredInvestigations = React.useMemo(() => {
        const term = investigationSearch.trim().toLowerCase();
        if (!term) {
            const selectedOptions = investigationsOptions.filter(opt => selectedInvestigations.includes(opt.value));
            const unselectedOptions = investigationsOptions.filter(opt => !selectedInvestigations.includes(opt.value));
            return [...selectedOptions, ...unselectedOptions];
        } else {
            const selectedOptions = investigationsOptions.filter(opt => 
                selectedInvestigations.includes(opt.value) && opt.label.toLowerCase().includes(term)
            );
            const unselectedSearchResults = investigationsOptions.filter(opt => 
                !selectedInvestigations.includes(opt.value) && opt.label.toLowerCase().includes(term)
            );
            return [...selectedOptions, ...unselectedSearchResults];
        }
    }, [investigationsOptions, investigationSearch, selectedInvestigations]);

    const [investigationRows, setInvestigationRows] = useState<InvestigationRow[]>([]);
    
    // Previous visit prescriptions state
    const [showPreviousVisit, setShowPreviousVisit] = useState(false);
    const [previousVisitPrescriptions, setPreviousVisitPrescriptions] = useState<PrescriptionRow[]>([]);
    
    // Additional form data
    const [followUpData, setFollowUpData] = useState({
        followUpType: '',
        followUp: '',
        remarkComments: '',
        planAdv: ''
    });

    // Follow-up types data
    const [followUpTypesOptions, setFollowUpTypesOptions] = useState<FollowUpTypeItem[]>([]);
    const [followUpTypesLoading, setFollowUpTypesLoading] = useState(false);
    const [followUpTypesError, setFollowUpTypesError] = useState<string | null>(null);
    
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

    // Close prescription suggestions on outside click
    React.useEffect(() => {
        if (!isRxOpen) return;
        function handleClickOutside(e: MouseEvent) {
            if (rxRef.current && !rxRef.current.contains(e.target as Node)) {
                setIsRxOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isRxOpen]);

    // Fetch prescription suggestions from API on input
    React.useEffect(() => {
        const term = prescriptionInput.trim();
        const doctorId = treatmentData?.doctorId;
        const clinicId = sessionData?.clinicId;
        if (!term || !doctorId || !clinicId) {
            setRxSuggestions([]);
            setIsRxOpen(false);
            return;
        }

        let cancelled = false;
        const timer = setTimeout(async () => {
            try {
                const q = new URLSearchParams({
                    prefixText: term,
                    doctorId: doctorId,
                    clinicId: clinicId
                }).toString();
                const resp = await fetch(`/api/refdata/prescription-search?${q}`);
                if (!resp.ok) throw new Error(`Failed to load prescriptions (${resp.status})`);
                const data = await resp.json();
                if (cancelled) return;
                const list: string[] = Array.isArray(data?.resultSet1) ? data.resultSet1 : [];
                setRxSuggestions(list);
                setIsRxOpen(list.length > 0);
            } catch (e) {
                if (!cancelled) {
                    setRxSuggestions([]);
                    setIsRxOpen(false);
                }
            }
        }, 300);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [prescriptionInput, treatmentData?.doctorId, sessionData?.clinicId]);

    // Get treatment data from location state
    useEffect(() => {
        if (location.state) {
            setTreatmentData(location.state as TreatmentData);
        }
    }, [location.state]);

    // Close Investigation dropdown on outside click
    React.useEffect(() => {
        if (!isInvestigationsOpen) return;
        function handleClickOutside(e: MouseEvent) {
            if (investigationsRef.current && !investigationsRef.current.contains(e.target as Node)) {
                setIsInvestigationsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isInvestigationsOpen]);

    // Load Investigation options based on doctor/clinic
    React.useEffect(() => {
        let cancelled = false;
        async function loadInvestigations() {
            if (!treatmentData?.doctorId || !sessionData?.clinicId) return;
            setInvestigationsLoading(true);
            setInvestigationsError(null);
            try {
                const doctorId = treatmentData.doctorId;
                const clinicId = sessionData.clinicId;
                const options = await investigationService.getInvestigationsForDoctorAndClinic(doctorId, clinicId);
                if (!cancelled) setInvestigationsOptions(options);
            } catch (error: any) {
                if (!cancelled) setInvestigationsError(error.message || 'Failed to load investigations');
            } finally {
                if (!cancelled) setInvestigationsLoading(false);
            }
        }
        loadInvestigations();
        return () => { cancelled = true; };
    }, [treatmentData?.doctorId, sessionData?.clinicId]);

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

    // Close medicines dropdown on outside click
    React.useEffect(() => {
        if (!isMedicinesOpen) return;
        function handleClickOutside(e: MouseEvent) {
            if (medicinesRef.current && !medicinesRef.current.contains(e.target as Node)) {
                setIsMedicinesOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMedicinesOpen]);

    // Load medicines from API when component mounts
    React.useEffect(() => {
        let cancelled = false;
        async function loadMedicines() {
            if (!treatmentData?.doctorId || !sessionData?.clinicId) return;
            
            setMedicinesLoading(true);
            setMedicinesError(null);
            
            try {
                const doctorId = treatmentData.doctorId;
                const clinicId = sessionData.clinicId;
                console.log('Loading medicines for doctor:', doctorId, 'and clinic:', clinicId);
                
                const medicines = await medicineService.getActiveMedicinesByDoctorAndClinic(doctorId, clinicId);
                if (!cancelled) {
                    setMedicinesOptions(medicines);
                    console.log('Loaded medicines:', medicines);
                }
            } catch (error: any) {
                console.error('Error loading medicines:', error);
                if (!cancelled) {
                    setMedicinesError(error.message);
                }
            } finally {
                if (!cancelled) {
                    setMedicinesLoading(false);
                }
            }
        }
        
        loadMedicines();
        return () => { cancelled = true; };
    }, [treatmentData?.doctorId, sessionData?.clinicId]);

    // Close diagnoses dropdown on outside click
    React.useEffect(() => {
        if (!isDiagnosesOpen) return;
        function handleClickOutside(e: MouseEvent) {
            if (diagnosesRef.current && !diagnosesRef.current.contains(e.target as Node)) {
                setIsDiagnosesOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDiagnosesOpen]);

    // Load diagnoses from API when component mounts
    React.useEffect(() => {
        let cancelled = false;
        async function loadDiagnoses() {
            if (!treatmentData?.doctorId || !sessionData?.clinicId) return;
            
            setDiagnosesLoading(true);
            setDiagnosesError(null);
            
            try {
                const doctorId = treatmentData.doctorId;
                const clinicId = sessionData.clinicId;
                console.log('Loading diagnoses for doctor:', doctorId, 'and clinic:', clinicId);
                
                const diagnoses = await diagnosisService.getAllDiagnosesForDoctorAndClinic(doctorId, clinicId);
                if (!cancelled) {
                    setDiagnosesOptions(diagnoses);
                    console.log('Loaded diagnoses:', diagnoses);
                }
            } catch (error: any) {
                console.error('Error loading diagnoses:', error);
                if (!cancelled) {
                    setDiagnosesError(error.message);
                }
            } finally {
                if (!cancelled) {
                    setDiagnosesLoading(false);
                }
            }
        }
        
        loadDiagnoses();
        return () => { cancelled = true; };
    }, [treatmentData?.doctorId, sessionData?.clinicId]);

    // Load follow-up types from API when component mounts
    React.useEffect(() => {
        let cancelled = false;
        async function loadFollowUpTypes() {
            setFollowUpTypesLoading(true);
            setFollowUpTypesError(null);
            
            try {
                const options = await getFollowUpTypes();
                if (!cancelled) {
                    setFollowUpTypesOptions(options);
                }
            } catch (error: any) {
                console.error('Error loading follow-up types:', error);
                if (!cancelled) {
                    setFollowUpTypesError(error.message);
                }
            } finally {
                if (!cancelled) {
                    setFollowUpTypesLoading(false);
                }
            }
        }
        
        loadFollowUpTypes();
        return () => { cancelled = true; };
    }, []);

    const handleBackToAppointments = () => {
        navigate('/appointment');
    };

    // Billing details (from symptom-data API)
    const [billingDetailsOptions, setBillingDetailsOptions] = useState<BillingDetailOption[]>([]);
    const [selectedBillingDetailIds, setSelectedBillingDetailIds] = useState<string[]>([]);
    const [isBillingOpen, setIsBillingOpen] = useState(false);
    const [billingSearch, setBillingSearch] = useState('');
    const billingRef = React.useRef<HTMLDivElement | null>(null);

    const filteredBillingDetails = React.useMemo(() => {
        const term = billingSearch.trim().toLowerCase();
        if (!term) {
            const selectedOptions = billingDetailsOptions.filter(opt => selectedBillingDetailIds.includes(opt.id));
            const unselectedOptions = billingDetailsOptions.filter(opt => !selectedBillingDetailIds.includes(opt.id));
            return [...selectedOptions, ...unselectedOptions];
        }
        const matches = (opt: BillingDetailOption) =>
            (opt.billing_details || '').toLowerCase().includes(term) ||
            (opt.billing_group_name || '').toLowerCase().includes(term) ||
            (opt.billing_subgroup_name || '').toLowerCase().includes(term);

        const selectedFiltered = billingDetailsOptions.filter(opt => selectedBillingDetailIds.includes(opt.id) && matches(opt));
        const unselectedFiltered = billingDetailsOptions.filter(opt => !selectedBillingDetailIds.includes(opt.id) && matches(opt));
        return [...selectedFiltered, ...unselectedFiltered];
    }, [billingDetailsOptions, billingSearch, selectedBillingDetailIds]);

    useEffect(() => {
        let cancelled = false;
        async function loadBillingDetails() {
            if (!treatmentData?.doctorId || !sessionData?.clinicId) return;
            try {
                const doctorId = encodeURIComponent(treatmentData.doctorId);
                const clinicId = encodeURIComponent(sessionData.clinicId);
                const resp = await fetch(`/api/refdata/symptom-data?doctorId=${doctorId}&clinicId=${clinicId}`);
                if (!resp.ok) throw new Error(`Failed to load billing details (${resp.status})`);
                const data = await resp.json();
                const raw: any[] = Array.isArray(data?.billingDetails)
                    ? data.billingDetails
                    : Array.isArray(data?.resultSet2)
                        ? data.resultSet2
                        : [];
                const mapped: BillingDetailOption[] = raw.map((item: any, idx: number) => ({
                    id: String(item.id ?? item.sequence_no ?? idx),
                    billing_details: String(item.billing_details ?? item.billing_group_name ?? 'Unknown'),
                    billing_group_name: item.billing_group_name,
                    billing_subgroup_name: item.billing_subgroup_name,
                    default_fees: typeof item.default_fees === 'number' ? item.default_fees : Number(item.default_fees ?? 0),
                    visit_type: item.visit_type,
                    visit_type_description: item.visit_type_description,
                    visit_type_id: item.visit_type_id,
                    isdefault: Boolean(item.isdefault),
                    sequence_no: typeof item.sequence_no === 'number' ? item.sequence_no : Number(item.sequence_no ?? idx)
                }));
                if (!cancelled) setBillingDetailsOptions(mapped);
            } catch (e) {
                console.error('Error loading billing details:', e);
                if (!cancelled) setBillingDetailsOptions([]);
            }
        }
        loadBillingDetails();
        return () => { cancelled = true; };
    }, [treatmentData?.doctorId, sessionData?.clinicId]);

    // Close Billing dropdown on outside click
    React.useEffect(() => {
        if (!isBillingOpen) return;
        function handleClickOutside(e: MouseEvent) {
            if (billingRef.current && !billingRef.current.contains(e.target as Node)) {
                setIsBillingOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isBillingOpen]);

    const toggleBillingDetail = (id: string) => {
        setSelectedBillingDetailIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    // Fetch previous visits for the current patient
    const fetchPreviousVisits = async () => {
        if (!treatmentData?.patientId || !sessionData?.doctorId || !sessionData?.clinicId) {
            console.log('Missing required data for fetching previous visits:', {
                patientId: treatmentData?.patientId,
                doctorId: sessionData?.doctorId,
                clinicId: sessionData?.clinicId
            });
            return;
        }

        try {
            setLoadingPreviousVisits(true);
            setPreviousVisitsError(null);
            const todaysVisitDate = new Date().toISOString().split('T')[0];
            
            const response = await appointmentService.getPatientPreviousVisits({
                patientId: treatmentData.patientId,
                doctorId: sessionData.doctorId,
                clinicId: sessionData.clinicId,
                todaysVisitDate
            });

            console.log('Previous visits response:', response);

            // Try common shapes
            const visits = response?.visits || response?.data?.visits || response?.resultSet1 || [];
            const success = response?.success !== false;

            if (success && Array.isArray(visits)) {
                // Parse visit dates and sort chronologically (oldest -> newest)
                const parseVisitDate = (v: any): number => {
                    const s: string = v.visit_date || v.Visit_Date || v.appointmentDate || v.appointment_date || '';
                    if (!s) return 0;
                    const d = new Date(s);
                    const t = d.getTime();
                    return isNaN(t) ? 0 : t;
                };

                const sortedVisits = [...visits].sort((a, b) => parseVisitDate(a) - parseVisitDate(b));
                setAllVisits(sortedVisits);
                
                // Extract visit dates for navigation (same as Appointment page)
                const dates = sortedVisits
                    .map((visit: any) => visit.visit_date || visit.Visit_Date || visit.appointmentDate || visit.appointment_date || '')
                    .filter((date: any) => date);
                setVisitDates(dates);

                // Convert to PreviousVisit format for display
                const formattedVisits: PreviousVisit[] = sortedVisits.map((visit: any, index: number) => {
                    // Extract doctor name from visit data
                    const getDoctorName = (visit: any): string => {
                        // Try different possible doctor name fields
                        const doctorName = visit.DoctorName || visit.doctor_name || visit.Doctor_Name || 
                                         visit.doctorName || visit.provider || '';
                        
                        if (doctorName) {
                            return doctorName;
                        }
                        
                        // If no direct doctor name, try to get from doctor ID
                        const doctorId = visit.doctor_id || visit.Doctor_ID || visit.doctorId;
                        if (doctorId) {
                            const doctor = allDoctors.find(d => d.id === doctorId);
                            return doctor ? `${doctor.firstName} ${doctor.lastName}`.trim() : '';
                        }
                        
                        return 'Unknown Doctor';
                    };

                    return {
                        id: String(visit.id || index),
                        date: visit.visit_date || visit.Visit_Date || visit.appointmentDate || visit.appointment_date || '',
                        type: visit.visit_type === 1 ? 'P' : 'L', // Assuming 1 = Physical, 2 = Lab
                        patientName: treatmentData?.patientName || '',
                        doctorName: getDoctorName(visit),
                        isActive: index === sortedVisits.length - 1 // Make the latest visit active
                    };
                });

                setPreviousVisits(formattedVisits);
                setCurrentVisitIndex(Math.max(0, sortedVisits.length - 1));

                // Extract prescriptions from the latest visit
                if (sortedVisits.length > 0) {
                    const latestVisit = sortedVisits[sortedVisits.length - 1];
                    console.log('Latest visit for prescription extraction:', latestVisit);
                    
                    // Extract prescriptions using the same logic as mapPreviousVisitToInitialData
                    const rxArray = ((): any[] => {
                        // First try the existing prescription fields
                        const arr = latestVisit.visit_prescription_overwrite || latestVisit.Visit_Prescription_Overwrite || latestVisit.prescriptions;
                        console.log('Rx array (existing):', arr);

                        // If no prescriptions found, try rawVisit.Prescriptions
                        if (!arr || !Array.isArray(arr) || arr.length === 0) {
                            const rawPrescriptions = latestVisit.Prescriptions;
                            console.log('Raw Prescriptions data:', rawPrescriptions);
                            if (Array.isArray(rawPrescriptions) && rawPrescriptions.length > 0) {
                                console.log('Using rawVisit.Prescriptions data');
                                return rawPrescriptions;
                            }
                        }

                        if (Array.isArray(arr)) return arr;
                        return [];
                    })();

                    if (rxArray.length > 0) {
                        // Convert prescriptions to PrescriptionRow format
                        const prescriptionRows: PrescriptionRow[] = rxArray.map((p: any, index: number) => {
                            // Try multiple field name variations for medicine
                            const med = p.medicineName || p.Medicine_Name || p.medicine || p.drug_name || p.item || p.Medicine || p.Drug || p.med_name || p.medication || p.MedName || '';

                            // Try multiple field name variations for dosage
                            const m = p.Morning || p.morningDose || p.morning || p.M || p.morn || p.AM || '0';
                            const a = p.Afternoon || p.afternoonDose || p.afternoon || p.A || p.aft || p.PM || '0';
                            const n = p.Night || p.nightDose || p.night || p.N || p.eve || p.Evening || '0';

                            // Get number of days
                            const noOfdays = p.noOfDays || p.NoOfDays || p.no_of_days || p.No_Of_Days || p.days || p.Days || p.duration || p.Duration || '';

                            // Try multiple field name variations for instructions
                            const instr = p.Instruction || p.Instructions || p.instruction || p.instructions || p.Instruction_Text || p.directions || p.how_to_take || p.Directions || '';

                            return {
                                id: `pv_${index + 1}`,
                                prescription: med,
                                b: m !== '0' ? m : '',
                                l: a !== '0' ? a : '',
                                d: n !== '0' ? n : '',
                                days: noOfdays,
                                instruction: instr
                            };
                        });

                        console.log('Extracted prescription rows:', prescriptionRows);
                        setPreviousVisitPrescriptions(prescriptionRows);
                    } else {
                        console.log('No prescriptions found in latest visit');
                        setPreviousVisitPrescriptions([]);
                    }
                } else {
                    setPreviousVisitPrescriptions([]);
                }
            } else {
                console.log('No previous visits found or invalid response format');
                setPreviousVisits([]);
                setAllVisits([]);
                setVisitDates([]);
                setCurrentVisitIndex(0);
                setPreviousVisitPrescriptions([]);
            }
        } catch (error: any) {
            console.error('Error fetching previous visits:', error);
            setPreviousVisitsError(error?.message || 'Failed to fetch previous visits');
            setPreviousVisits([]);
            setAllVisits([]);
            setVisitDates([]);
            setCurrentVisitIndex(0);
            setPreviousVisitPrescriptions([]);
        } finally {
            setLoadingPreviousVisits(false);
        }
    };

    // Load previous visits when component mounts and treatment data is available
    useEffect(() => {
        if (treatmentData?.patientId && sessionData?.doctorId && sessionData?.clinicId) {
            fetchPreviousVisits();
        }
    }, [treatmentData?.patientId, sessionData?.doctorId, sessionData?.clinicId]);

    // Auto-calculate BMI when height or weight changes
    useEffect(() => {
        const calculatedBMI = calculateBMI(formData.height, formData.weight);
        if (calculatedBMI !== formData.bmi) {
            setFormData(prev => ({
                ...prev,
                bmi: calculatedBMI
            }));
        }
    }, [formData.height, formData.weight]);

    // Handle previous visit click - same as Appointment page's handleLastVisitClick
    const handlePreviousVisitClick = async (visit: PreviousVisit) => {
        try {
            const visitIndex = previousVisits.findIndex(v => v.id === visit.id);
            if (visitIndex === -1 || !allVisits[visitIndex]) return;

            const selectedVisit = allVisits[visitIndex];
            const patientName = treatmentData?.patientName || '';
            
            setSelectedPatientForForm({ 
                id: treatmentData?.patientId, 
                name: patientName, 
                appointmentRow: null 
            });

            // Map the selected visit to form data (similar to Appointment page)
            const appointmentRow = {
                patientId: treatmentData?.patientId,
                patient: treatmentData?.patientName,
                age: treatmentData?.age,
                gender: treatmentData?.gender,
                contact: treatmentData?.contact,
                doctorId: treatmentData?.doctorId,
                provider: getDoctorLabelById(treatmentData?.doctorId)
            };
            const mapped = mapPreviousVisitToInitialData(selectedVisit, patientName, appointmentRow);
            console.log('Mapped form data from previous visit:', mapped);
            setFormPatientData(mapped);
        } catch (e) {
            console.error('Error loading previous visit:', e);
            setFormPatientData(null);
        } finally {
            setShowPatientFormDialog(true);
        }
    };


    // Helper function to format date for display
    const formatVisitDate = (dateString: string): string => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString; // Return original if invalid
            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: '2-digit'
            });
        } catch (error) {
            return dateString; // Return original if parsing fails
        }
    };

    // Map previous visit data to form data (copied from Appointment page)
    const mapPreviousVisitToInitialData = (visit: any, patientName: string, appointmentRow?: any) => {
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

    // Helper function to get doctor label by ID (copied from Appointment page)
    const getDoctorLabelById = (id?: string) => {
        if (!id) return '';
        const doctor = allDoctors.find(d => d.id === id);
        return doctor ? `${doctor.firstName} ${doctor.lastName}`.trim() : '';
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // BMI calculation function
    const calculateBMI = (height: string, weight: string): string => {
        const heightNum = parseFloat(height);
        const weightNum = parseFloat(weight);
        
        if (isNaN(heightNum) || isNaN(weightNum) || heightNum <= 0 || weightNum <= 0) {
            return '';
        }
        
        // BMI = weight (kg) / height (m)²
        // Height is in cm, so convert to meters
        const heightInMeters = heightNum / 100;
        const bmi = weightNum / (heightInMeters * heightInMeters);
        
        return bmi.toFixed(1);
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

    const handleAddCustomComplaint = () => {
        setShowComplaintPopup(true);
    };

    const handleSaveComplaint = (complaintDescription: string) => {
        // Add the new complaint to the complaints rows
        const newComplaint: ComplaintRow = {
            id: `custom_${Date.now()}`,
            value: `custom_${Date.now()}`,
            label: complaintDescription,
            comment: ''
        };
        
        setComplaintsRows(prev => [...prev, newComplaint]);
        setShowComplaintPopup(false);
    };

    const handleAddCustomDiagnosis = () => {
        setShowDiagnosisPopup(true);
    };

    const handleSaveDiagnosis = (diagnosisDescription: string) => {
        // Add the new diagnosis to the diagnosis rows
        const newDiagnosis: DiagnosisRow = {
            id: `custom_${Date.now()}`,
            diagnosis: diagnosisDescription,
            comment: ''
        };
        
        setDiagnosisRows(prev => [...prev, newDiagnosis]);
        setShowDiagnosisPopup(false);
    };

    const handleAddCustomMedicine = () => {
        setShowMedicinePopup(true);
    };

    const handleSaveMedicine = (medicineData: MedicineData) => {
        // Add the new medicine to the medicine rows
        const newMedicine: MedicineRow = {
            id: `custom_${Date.now()}`,
            medicine: `${medicineData.medicineName} (${medicineData.shortDescription})`,
            short_description: medicineData.shortDescription,
            morning: parseInt(medicineData.breakfast) || 0,
            afternoon: parseInt(medicineData.lunch) || 0,
            b: medicineData.breakfast || '',
            l: medicineData.lunch || '',
            d: medicineData.dinner || '',
            days: medicineData.days || '',
            instruction: `${medicineData.instruction} - Priority: ${medicineData.priority}`
        };
        
        setMedicineRows(prev => [...prev, newMedicine]);
        setShowMedicinePopup(false);
    };

    const handleAddCustomPrescription = () => {
        setShowPrescriptionPopup(true);
    };

    const handleSavePrescription = (prescriptionData: PrescriptionData) => {
        // Add the new prescription to the prescription rows
        const newPrescription: PrescriptionRow = {
            id: `custom_${Date.now()}`,
            prescription: `${prescriptionData.brandName} (${prescriptionData.genericName})`,
            b: prescriptionData.breakfast,
            l: prescriptionData.lunch,
            d: prescriptionData.dinner,
            days: prescriptionData.days,
            instruction: `${prescriptionData.instruction} - Priority: ${prescriptionData.priority} - Category: ${prescriptionData.categoryName} - SubCategory: ${prescriptionData.subCategoryName} - Marketed By: ${prescriptionData.marketedBy}`
        };
        
        setPrescriptionRows(prev => [...prev, newPrescription]);
        setShowPrescriptionPopup(false);
    };

    const handleAddCustomTestLab = () => {
        setShowTestLabPopup(true);
    };

    const handleSaveTestLab = (testLabData: TestLabData) => {
        // Add the new test lab data
        console.log('Test Lab Data:', testLabData);
        setShowTestLabPopup(false);
    };

    // Function to collect all form fields into an array
    const collectAllFormFields = () => {
        const allFields = [
            // Basic form data
            { field: 'referralBy', value: formData.referralBy },
            { field: 'visitType.inPerson', value: formData.visitType.inPerson },
            { field: 'visitType.followUp', value: formData.visitType.followUp },
            { field: 'allergy', value: formData.allergy },
            { field: 'medicalHistoryText', value: formData.medicalHistoryText },
            { field: 'surgicalHistory', value: formData.surgicalHistory },
            { field: 'medicines', value: formData.medicines },
            { field: 'visitComments', value: formData.visitComments },
            { field: 'pc', value: formData.pc },
            
            // Vitals
            { field: 'height', value: formData.height },
            { field: 'weight', value: formData.weight },
            { field: 'bmi', value: formData.bmi },
            { field: 'pulse', value: formData.pulse },
            { field: 'bp', value: formData.bp },
            { field: 'sugar', value: formData.sugar },
            { field: 'tft', value: formData.tft },
            { field: 'pallorHb', value: formData.pallorHb },
            
            // Medical history checkboxes
            { field: 'medicalHistory.hypertension', value: formData.medicalHistory.hypertension },
            { field: 'medicalHistory.diabetes', value: formData.medicalHistory.diabetes },
            { field: 'medicalHistory.cholesterol', value: formData.medicalHistory.cholesterol },
            { field: 'medicalHistory.ihd', value: formData.medicalHistory.ihd },
            { field: 'medicalHistory.asthma', value: formData.medicalHistory.asthma },
            { field: 'medicalHistory.th', value: formData.medicalHistory.th },
            { field: 'medicalHistory.smoking', value: formData.medicalHistory.smoking },
            { field: 'medicalHistory.tobacco', value: formData.medicalHistory.tobacco },
            { field: 'medicalHistory.alcohol', value: formData.medicalHistory.alcohol },
            
            // Clinical data
            { field: 'detailedHistory', value: formData.detailedHistory },
            { field: 'examinationFindings', value: formData.examinationFindings },
            { field: 'additionalComments', value: formData.additionalComments },
            { field: 'procedurePerformed', value: formData.procedurePerformed },
            { field: 'dressingBodyParts', value: formData.dressingBodyParts },
            
            // Selected complaints
            { field: 'selectedComplaints', value: selectedComplaints },
            { field: 'complaintsRows', value: complaintsRows },
            
            // Selected diagnoses
            { field: 'selectedDiagnoses', value: selectedDiagnoses },
            { field: 'diagnosisRows', value: diagnosisRows },
            
            // Selected medicines
            { field: 'selectedMedicines', value: selectedMedicines },
            { field: 'medicineRows', value: medicineRows },
            
            // Prescriptions
            { field: 'prescriptionRows', value: prescriptionRows },
            
            // Selected investigations
            { field: 'selectedInvestigations', value: selectedInvestigations },
            { field: 'investigationRows', value: investigationRows },
            
            // Follow-up data
            { field: 'followUpData.followUpType', value: followUpData.followUpType },
            { field: 'followUpData.followUp', value: followUpData.followUp },
            
            // Billing data
            { field: 'billingData.billed', value: billingData.billed },
            { field: 'billingData.discount', value: billingData.discount },
            
            // Attachments
            { field: 'attachments', value: attachments },
            
            // Session data
            { field: 'sessionData', value: sessionData },
            { field: 'treatmentData', value: treatmentData }
        ];
        
        return allFields;
    };

    // Function to convert date to YYYY-MM-DD format
    const toYyyyMmDd = (date: any): string => {
        if (!date) return new Date().toISOString().slice(0, 10);
        const d = new Date(date);
        return d.toISOString().slice(0, 10);
    };

    // After saving treatment, fetch latest appointment details and patch form values (like PatientVisitDetails)
    const fetchAndPatchAppointmentDetails = async (params: {
        patientId: string;
        doctorId: string;
        shiftId: number;
        clinicId: string;
        patientVisitNo: number;
        languageId?: number;
    }) => {
        try {
            console.log('=== FETCHING APPOINTMENT DETAILS AFTER SAVE ===');
            console.log('Request params:', params);
            const result: any = await visitService.getAppointmentDetails({
                patientId: String(params.patientId),
                doctorId: String(params.doctorId),
                shiftId: Number(params.shiftId),
                clinicId: String(params.clinicId),
                patientVisitNo: Number(params.patientVisitNo),
                languageId: params.languageId ?? 1
            });
            console.log('Raw appointment-details API result:', result);
            if (!result || !result.found || !result.mainData || result.mainData.length === 0) {
                console.log('No appointment details found to patch.');
                return;
            }

            const appointmentData = result.mainData[0] || {};
            console.log('Appointment data (first item):', appointmentData);

            const normalized: any = {
                pulse: appointmentData.pulse ?? '',
                height: appointmentData.heightInCms ?? '',
                weight: appointmentData.weightInKgs ?? '',
                bp: appointmentData.bloodPressure ?? '',
                sugar: appointmentData.sugar ?? '',
                tft: appointmentData.tft ?? '',
                surgicalHistory: appointmentData.surgicalHistory ?? '',
                previousVisitPlan: appointmentData.plan ?? '',
                currentComplaint: appointmentData.currentComplaint ?? appointmentData.currentComplaints ?? '',
                visitComments: appointmentData.visitComments ?? appointmentData.visitCommentsField ?? '',
                currentMedicines: appointmentData.currentMedicines ?? '',
                allergyDetails: appointmentData.allergyDetails ?? appointmentData.allergy ?? '',
                inPerson: appointmentData.inPerson,
                followUpFlag: appointmentData.followUpFlag,
                followUpType: appointmentData.followUp,
                billed: appointmentData.feesToCollect ?? appointmentData.fees ?? '',
                discount: appointmentData.discount ?? appointmentData.originalDiscount ?? '',
                feesPaid: appointmentData.feesPaid ?? 0
            };
            console.log('Normalized appointment fields:', normalized);

            setFormData(prev => {
                const next: any = { ...prev };
                const maybeSet = (key: keyof typeof next, value: any) => {
                    if (value === undefined || value === null || value === '') return;
                    if (next[key] === '' || next[key] === undefined || next[key] === null) {
                        next[key] = String(value);
                    } else {
                        next[key] = String(value);
                    }
                };

                maybeSet('pulse', normalized.pulse);
                maybeSet('height', normalized.height);
                maybeSet('weight', normalized.weight);
                maybeSet('bp', normalized.bp);
                maybeSet('sugar', normalized.sugar);
                maybeSet('tft', normalized.tft);
                maybeSet('surgicalHistory', normalized.surgicalHistory);
                maybeSet('allergy', normalized.allergyDetails);
                maybeSet('visitComments', normalized.visitComments);
                maybeSet('medicines', normalized.currentMedicines);
                // Do not patch PC with complaints fetched from appointment details

                const heightNum = parseFloat(String(next.height));
                const weightNum = parseFloat(String(next.weight));
                if (!isNaN(heightNum) && heightNum > 0 && !isNaN(weightNum) && weightNum > 0) {
                    next.bmi = (weightNum / ((heightNum / 100) * (heightNum / 100))).toFixed(1);
                }

                // Patch visitType flags if present
                if (typeof normalized.inPerson === 'boolean' || typeof normalized.followUpFlag === 'boolean' || typeof normalized.followUpType === 'string') {
                    next.visitType = {
                        ...(next.visitType || {}),
                        inPerson: typeof normalized.inPerson === 'boolean' ? normalized.inPerson : (next.visitType?.inPerson ?? true),
                        followUp: typeof normalized.followUpFlag === 'boolean' ? normalized.followUpFlag : (next.visitType?.followUp ?? false)
                    };
                }
                console.log('Patched Treatment formData with appointment details:', next);
                return next;
            });

            // Patch billing fields based on appointment details
            try {
                const billedNum = parseFloat(String(normalized.billed || '')) || 0;
                const discountNum = parseFloat(String(normalized.discount || '')) || 0;
                const paidNum = parseFloat(String(normalized.feesPaid || '')) || 0;
                const duesNum = Math.max(0, billedNum - discountNum - paidNum);
                setBillingData(prev => ({
                    ...prev,
                    billed: billedNum ? String(billedNum) : (prev.billed || ''),
                    discount: String(discountNum),
                    dues: String(duesNum),
                    acBalance: prev.acBalance // keep previous if not provided by API
                }));
                console.log('Patched billingData from appointment details:', { billed: billedNum, discount: discountNum, feesPaid: paidNum, dues: duesNum });
            } catch (billingPatchError) {
                console.warn('Could not patch billing data from appointment details:', billingPatchError);
            }

            // Update complaint selections if available
            if (normalized.currentComplaint && typeof normalized.currentComplaint === 'string') {
                const parts = normalized.currentComplaint.split(/\*|,/).map((s: string) => s.trim()).filter(Boolean);
                if (Array.isArray(parts) && parts.length > 0) {
                    setSelectedComplaints(parts);
                    console.log('Patched selectedComplaints from appointment details:', parts);
                }
            }
            console.log('=== FINISHED PATCHING FROM APPOINTMENT DETAILS ===');
        } catch (e) {
            console.warn('Failed to fetch/patch appointment details after save:', e);
        }
    };

    // On page load: fetch today's latest appointment details (if data available) and patch form
    const appointmentPatchedRef = React.useRef(false);
    React.useEffect(() => {
        const pid = treatmentData?.patientId;
        const did = treatmentData?.doctorId || sessionData?.doctorId;
        const cid = treatmentData?.clinicId || sessionData?.clinicId;
        const visitNo = treatmentData?.visitNumber;
        const shiftId = (sessionData as any)?.shiftId || 1;

        if (!pid || !did || !cid || !visitNo) {
            return;
        }
        if (appointmentPatchedRef.current) {
            return;
        }

        console.log('=== AUTO FETCH APPOINTMENT DETAILS ON LOAD ===');
        console.log('Resolved params:', { patientId: pid, doctorId: did, clinicId: cid, shiftId, patientVisitNo: visitNo });

        appointmentPatchedRef.current = true;
        fetchAndPatchAppointmentDetails({
            patientId: String(pid),
            doctorId: String(did),
            shiftId: Number(shiftId) || 1,
            clinicId: String(cid),
            patientVisitNo: Number(visitNo) || 0,
            languageId: 1
        });
    }, [treatmentData?.patientId, treatmentData?.doctorId, sessionData?.doctorId, treatmentData?.clinicId, sessionData?.clinicId, treatmentData?.visitNumber]);

    // Generic treatment handler for both save and submit
    const handleTreatmentAction = async (isSubmit: boolean) => {
        try {
            const actionType = isSubmit ? 'SUBMIT' : 'SAVE';
            console.log(`=== TREATMENT FORM ${actionType} STARTED ===`);
            console.log('Form data:', formData);
            console.log('Treatment data:', treatmentData);
            console.log('Session data:', sessionData);
            console.log('Is Submit:', isSubmit);
            
            setIsSubmitting(true);
            setSubmitError(null);
            setSubmitSuccess(null);
            setSnackbarOpen(false);
            setSnackbarMessage('');
            
            // Fetch session data for dynamic values if not already available
            let currentSessionData = sessionData;
            if (!currentSessionData) {
                try {
                    const sessionResult = await sessionService.getSessionInfo();
                    if (sessionResult.success) {
                        currentSessionData = sessionResult.data;
                        console.log('Session data loaded:', currentSessionData);
                    }
                } catch (sessionError) {
                    console.warn('Could not load session data:', sessionError);
                }
            }
            
            // Validate required fields are present
            const doctorId = treatmentData?.doctorId || currentSessionData?.doctorId;
            const clinicId = treatmentData?.clinicId || currentSessionData?.clinicId;
            const shiftId = currentSessionData?.clinicId; // Using clinicId as shiftId fallback
            const userId = currentSessionData?.userId;
            
            if (!doctorId) {
                throw new Error('Doctor ID is required but not found in treatment data or session');
            }
            if (!clinicId) {
                throw new Error('Clinic ID is required but not found in treatment data or session');
            }
            if (!userId) {
                throw new Error('User ID is required but not found in session data');
            }
            
            // Validate patient visit number
            const patientVisitNo = treatmentData?.visitNumber;
            if (!patientVisitNo) {
                throw new Error('Patient Visit Number is required but not found in treatment data');
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
                patientId: treatmentData?.patientId?.toString() || '',
                doctorId: String(doctorId),
                clinicId: String(clinicId),
                shiftId: parseInt(String(shiftId || clinicId)) || 1, // Use shiftId or fallback to clinicId, default to 1
                visitDate: toYyyyMmDd(new Date()) + 'T' + new Date().toTimeString().slice(0, 8),
                patientVisitNo: parseInt(String(patientVisitNo)) || 0,
                
                // Referral information
                referBy: (formData.referralBy === 'Self')
                    ? 'S'
                    : 'O', // S for Self, O for Other
                referralName: formData.referralBy === 'Self' ? 'Self' : (formData.referralBy || ''),
                referralContact: formData.referralBy === 'Self' ? '' : '',
                referralEmail: formData.referralBy === 'Self' ? '' : '',
                referralAddress: formData.referralBy === 'Self' ? '' : '',
                
                // Vital signs
                pulse: parseInt(formData.pulse) || 0,
                heightInCms: parseFloat(formData.height) || 0,
                weightInKgs: parseFloat(formData.weight) || 0,
                bloodPressure: formData.bp,
                sugar: formData.sugar,
                tft: formData.tft,
                
                // Medical history
                pastSurgicalHistory: formData.surgicalHistory,
                previousVisitPlan: formData.visitComments,
                chiefComplaint: formData.pc,
                visitComments: formData.visitComments,
                currentMedicines: formData.medicines,
                
                // Medical conditions from form data
                hypertension: formData.medicalHistory.hypertension,
                diabetes: formData.medicalHistory.diabetes,
                cholestrol: formData.medicalHistory.cholesterol,
                ihd: formData.medicalHistory.ihd,
                th: formData.medicalHistory.th,
                asthama: formData.medicalHistory.asthma,
                smoking: formData.medicalHistory.smoking,
                tobaco: formData.medicalHistory.tobacco,
                alchohol: formData.medicalHistory.alcohol,
                
                // Additional fields
                habitDetails: '',
                allergyDetails: formData.allergy,
                observation: formData.examinationFindings,
                inPerson: formData.visitType.inPerson,
                symptomComment: formData.detailedHistory,
                reason: '',
                impression: formData.additionalComments,
                attendedBy: '',
                paymentById: 1,
                paymentRemark: '',
                attendedById: 0,
                followUp: followUpData.followUpType ? String(followUpData.followUpType).charAt(0) : 'N', // First character of followUpType or 'N'
                followUpFlag: formData.visitType.followUp,
                currentComplaint: selectedComplaints.join(','),
                visitCommentsField: formData.visitComments,
                
                // Clinical fields
                tpr: '',
                importantFindings: formData.examinationFindings,
                additionalComments: formData.additionalComments,
                systemic: '',
                odeama: '',
                pallor: formData.pallorHb,
                gc: '',
                
                // Gynecological fields
                fmp: '',
                prmc: '',
                pamc: '',
                lmp: '',
                obstetricHistory: '',
                surgicalHistory: formData.surgicalHistory,
                menstrualAddComments: '',
                followUpComment: followUpData.followUp,
                followUpDate: new Date().toISOString().slice(0, 19),
                pregnant: false,
                edd: new Date().toISOString().slice(0, 19),
                followUpType: followUpData.followUpType ? String(followUpData.followUpType).charAt(0) : '0', // Single character: first char of followUpType or '0'
                
                // Financial fields
                feesToCollect: parseFloat(billingData.billed) || 0,
                feesPaid: 0,
                discount: parseFloat(billingData.discount) || 0,
                originalDiscount: parseFloat(billingData.discount) || 0,
                
                // Status and user - Use different status IDs for save vs submit
                // Based on climasys2.0 Constants.cs: SUBMITTED_STATUS_ID = 6, Save_STATUS_ID = 9
                statusId: isSubmit ? 6 : 9, // Status 6 for submit (SUBMITTED), Status 9 for save
                userId: String(userId),
                isSubmitPatientVisitDetails: isSubmit // true for submit, false for save
            };

            console.log(`=== ${actionType}ING TREATMENT DATA TO API ===`);
            console.log('Visit data object:', visitData);
            console.log('Visit data JSON:', JSON.stringify(visitData, null, 2));
            console.log('Status ID:', visitData.statusId);
            console.log('Is Submit Patient Visit Details:', visitData.isSubmitPatientVisitDetails);
            console.log('Clinic ID:', visitData.clinicId);
            console.log('Doctor ID:', visitData.doctorId);
            console.log('Shift ID:', visitData.shiftId);
            console.log('Patient Visit No:', visitData.patientVisitNo);
            
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
            
            if (result.success) {
                console.log(`=== TREATMENT ${actionType}ED SUCCESSFULLY ===`);
                setSnackbarMessage(`Treatment ${isSubmit ? 'submitted' : 'saved'} successfully!`);
                setSnackbarOpen(true);
                
                // Fetch latest appointment details and patch values before navigating away
                try {
                    const apptParams = {
                        patientId: String(treatmentData?.patientId || ''),
                        doctorId: String(doctorId),
                        shiftId: parseInt(String(shiftId || clinicId)) || 1,
                        clinicId: String(clinicId),
                        patientVisitNo: Number(patientVisitNo) || 0,
                        languageId: 1
                    };
                    await fetchAndPatchAppointmentDetails(apptParams);
                } catch (e) {
                    console.warn('Could not patch appointment details after save:', e);
                }

                // Clear form data after successful submission
                setTimeout(() => {
                    setSnackbarOpen(false);
                    setSnackbarMessage('');
                    // Navigate back to appointments with refresh trigger
                    navigate('/appointment', { 
                        state: { 
                            refreshAppointments: true,
                            treatmentSubmitted: true,
                            patientId: treatmentData?.patientId 
                        } 
                    });
                }, 2000);
            } else {
                console.error(`=== TREATMENT ${actionType} FAILED ===`);
                console.error('Error:', result.error || `Failed to ${isSubmit ? 'submit' : 'save'} treatment`);
                setSnackbarMessage(result.error || `Failed to ${isSubmit ? 'submit' : 'save'} treatment`);
                setSnackbarOpen(true);

                // Even on failure, attempt to fetch latest appointment details for debugging/visibility
                try {
                    const apptParams = {
                        patientId: String(treatmentData?.patientId || ''),
                        doctorId: String(doctorId),
                        shiftId: parseInt(String(shiftId || clinicId)) || 1,
                        clinicId: String(clinicId),
                        patientVisitNo: Number(patientVisitNo) || 0,
                        languageId: 1
                    };
                    await fetchAndPatchAppointmentDetails(apptParams);
                } catch (e) {
                    console.warn('Could not patch appointment details after failed save:', e);
                }
            }
        } catch (err: any) {
            const actionType = isSubmit ? 'SUBMIT' : 'SAVE';
            console.error(`=== ERROR DURING TREATMENT ${actionType} ===`);
            console.error(`Error ${isSubmit ? 'submitting' : 'saving'} treatment data:`, err);
            console.error('Error type:', typeof err);
            console.error('Error message:', err instanceof Error ? err.message : 'Unknown error');
            setSnackbarMessage(err.message || `An error occurred while ${isSubmit ? 'submitting' : 'saving'} treatment`);
            setSnackbarOpen(true);
        } finally {
            console.log('=== FINALLY BLOCK ===');
            console.log('Setting submitting to false');
            setIsSubmitting(false);
            console.log('Submitting state updated');
        }
    };

    // Specific handlers for save and submit
    const handleTreatmentSave = async () => {
        await handleTreatmentAction(false); // false = save
    };

    const handleTreatmentSubmit = async () => {
        const billedNum = parseFloat(billingData.billed) || 0;
        if (billedNum <= 0) {
            setBillingError('Please enter billed amount');
            return;
        }
        setBillingError(null);
        await handleTreatmentAction(true); // true = submit
    };

    const handleComplaintCommentChange = (rowValue: string, text: string) => {
        setComplaintsRows(prev => prev.map(r => r.value === rowValue ? { ...r, comment: text } : r));
    };

    const handleRemoveComplaint = (rowValue: string) => {
        setComplaintsRows(prev => prev.filter(r => r.value !== rowValue));
        // Also uncheck from selector
        setSelectedComplaints(prev => prev.filter(v => v !== rowValue));
    };

    // Keep complaints table in sync with selectedComplaints and available options
    React.useEffect(() => {
        if (!Array.isArray(selectedComplaints)) return;

        setComplaintsRows(prev => {
            const existingByValue = new Map(prev.map(r => [r.value, r]));

            // Build rows for all currently selected complaints
            const nextRows: ComplaintRow[] = selectedComplaints.map(val => {
                const opt = complaintsOptions.find(o => o.value === val);
                const existing = existingByValue.get(val);
                return {
                    id: existing?.id || String(val),
                    value: val,
                    label: opt?.label || existing?.label || val,
                    comment: existing?.comment || ''
                };
            });

            return nextRows;
        });
    }, [selectedComplaints, complaintsOptions]);

    // Auto-select billed charges based on billed amount from appointment details
    React.useEffect(() => {
        const billedAmount = parseFloat(billingData.billed);
        if (!billedAmount || billedAmount <= 0) return;
        if (!billingDetailsOptions || billingDetailsOptions.length === 0) return;
        if (selectedBillingDetailIds.length > 0) return; // respect manual selections

        // Try exact match first
        const exact = billingDetailsOptions.find(opt => {
            const fee = typeof opt.default_fees === 'number' ? opt.default_fees : Number(opt.default_fees || 0);
            return fee === billedAmount;
        });
        if (exact) {
            setSelectedBillingDetailIds([exact.id]);
            return;
        }

        // Otherwise, pick the single closest fee below or equal to billed amount
        const withFees = billingDetailsOptions
            .map(opt => ({ id: opt.id, fee: (typeof opt.default_fees === 'number' ? opt.default_fees : Number(opt.default_fees || 0)) }))
            .filter(x => !isNaN(x.fee) && x.fee > 0)
            .sort((a, b) => b.fee - a.fee);
        const candidate = withFees.find(x => x.fee <= billedAmount);
        if (candidate) {
            setSelectedBillingDetailIds([candidate.id]);
        }
    }, [billingData.billed, billingDetailsOptions]);

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

    const handleAddDiagnoses = () => {
        if (selectedDiagnoses.length === 0) return;
        setDiagnosisRows(prev => {
            const existingValues = new Set(prev.map(r => r.value));
            const newRows: DiagnosisRow[] = [];
            selectedDiagnoses.forEach(val => {
                if (!existingValues.has(val)) {
                    const diagnosisOption = diagnosesOptions.find(opt => opt.value === val);
                    newRows.push({
                        id: Date.now().toString() + Math.random(),
                        value: val,
                        diagnosis: diagnosisOption?.label || val,
                        comment: ''
                    });
                }
            });
            return [...prev, ...newRows];
        });
        setSelectedDiagnoses([]);
    };

    const handleDiagnosisCommentChange = (rowValue: string, text: string) => {
        setDiagnosisRows(prev => prev.map(r => r.value === rowValue ? { ...r, comment: text } : r));
    };

    const handleRemoveDiagnosisFromSelector = (rowValue: string) => {
        setDiagnosisRows(prev => prev.filter(r => r.value !== rowValue));
        // Also uncheck from selector
        setSelectedDiagnoses(prev => prev.filter(v => v !== rowValue));
    };

    const handleDiagnosisCommentChangeById = (id: string, comment: string) => {
        setDiagnosisRows(prev => prev.map(row => 
            row.id === id ? { ...row, comment } : row
        ));
    };

    const handleAddMedicine = () => {
        if (selectedMedicines.length > 0) {
            selectedMedicines.forEach(medicineValue => {
                const medicineOption = medicinesOptions.find(opt => opt.value === medicineValue);
                if (medicineOption) {
                    const newMedicine: MedicineRow = {
                        id: Date.now().toString() + Math.random(),
                        medicine: medicineOption.short_description,
                        short_description: medicineOption.short_description,
                        morning: medicineOption.morning,
                        afternoon: medicineOption.afternoon,
                        b: medicineOption.morning.toString(),
                        l: medicineOption.afternoon.toString(),
                        d: '0',
                        days: '1',
                        instruction: ''
                    };
                    setMedicineRows(prev => [...prev, newMedicine]);
                }
            });
            setSelectedMedicines([]);
        }
    };

    const handleRemoveMedicine = (id: string) => {
        setMedicineRows(prev => prev.filter(row => row.id !== id));
    };

    const handleMedicineFieldChange = (id: string, field: string, value: string) => {
        setMedicineRows(prev => prev.map(row => 
            row.id === id ? { ...row, [field]: value } : row
        ));
    };

    const handleMedicineInstructionChange = (id: string, instruction: string) => {
        setMedicineRows(prev => prev.map(row => 
            row.id === id ? { ...row, instruction } : row
        ));
    };

    const handleAddPrescription = () => {
        const raw = prescriptionInput.trim();
        if (!raw) return;

        // Expected format: Name | composition | B-L-D | Days | Instruction
        // We only use Name as prescription column, split B-L-D into b/l/d, map days and instruction
        const parts = raw.split('|').map(p => p.trim()).filter(p => p.length > 0);
        const name = parts[0] || raw;
        const dose = (parts[2] || '').replace(/\s+/g, ''); // e.g., 1-1-1
        const days = (parts[3] || '').trim();
        const instruction = parts[4] || '';

        let b = '', l = '', d = '';
        if (dose) {
            const dparts = dose.split('-');
            b = dparts[0] || '';
            l = dparts[1] || '';
            d = dparts[2] || '';
        }

        const newPrescription: PrescriptionRow = {
            id: Date.now().toString(),
            prescription: name,
            b,
            l,
            d,
            days,
            instruction
        };

        setPrescriptionRows(prev => [...prev, newPrescription]);
        setPrescriptionInput('');
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
    const handleAddInvestigations = () => {
        if (selectedInvestigations.length === 0) return;
        setInvestigationRows(prev => {
            const existingValues = new Set(prev.map(r => r.investigation));
            const newRows: InvestigationRow[] = [];
            selectedInvestigations.forEach(val => {
                if (!existingValues.has(val)) {
                    newRows.push({ id: `inv_${Date.now()}_${val}`, investigation: val });
                }
            });
            return [...prev, ...newRows];
        });
        setSelectedInvestigations([]);
    };

    const handleRemoveInvestigation = (id: string) => {
        setInvestigationRows(prev => prev.filter(row => row.id !== id));
    };

    const handleRemoveInvestigationFromSelector = (value: string) => {
        setInvestigationRows(prev => prev.filter(r => r.investigation !== value));
        setSelectedInvestigations(prev => prev.filter(v => v !== value));
    };

    const handleFollowUpChange = (field: string, value: string) => {
        setFollowUpData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleBillingChange = (field: string, value: string) => {
        setBillingData(prev => {
            const next = { ...prev, [field]: value };
            const billedNum = parseFloat(next.billed) || 0;
            const discountNum = parseFloat(next.discount) || 0;
            const newAcBalance = billedNum - discountNum;
            return { ...next, acBalance: String(newAcBalance) };
        });
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
        // <>
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
                                {loadingPreviousVisits ? (
                                    <div style={{ 
                                        padding: '20px', 
                                        textAlign: 'center', 
                                        color: '#666',
                                        fontSize: '12px'
                                    }}>
                                        Loading previous visits...
                                    </div>
                                ) : previousVisits.length > 0 ? (
                                    previousVisits.map((visit, index) => (
                                        <div 
                                            key={visit.id}
                                            style={{
                                                padding: '10px 15px',
                                                borderBottom: '1px solid #e0e0e0',
                                                backgroundColor: index % 2 === 0 ? '#e3f2fd' : 'white',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                transition: 'background-color 0.2s ease'
                                            }}
                                            onClick={() => handlePreviousVisitClick(visit)}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#bbdefb';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#e3f2fd' : 'white';
                                            }}
                                        >
                                            <div style={{ fontWeight: '500', color: '#333' }}>
                                                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                                                    <a 
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handlePreviousVisitClick(visit);
                                                        }}
                                                        style={{ 
                                                            textDecoration: 'underline', 
                                                            color: '#1976d2',
                                                            cursor: 'pointer',
                                                            fontWeight: 'bold'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.color = '#0d47a1';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.color = '#1976d2';
                                                        }}
                                                    >
                                                        {formatVisitDate(visit.date)}
                                                    </a> | {visit.type}
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                                                    {visit.doctorName}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : previousVisitsError ? (
                                    <div style={{ 
                                        padding: '20px', 
                                        textAlign: 'center', 
                                        color: '#d32f2f',
                                        fontSize: '12px',
                                        backgroundColor: '#ffebee',
                                        border: '1px solid #ffcdd2',
                                        borderRadius: '4px',
                                        margin: '8px'
                                    }}>
                                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Error loading visits</div>
                                        <div>{previousVisitsError}</div>
                                        <button
                                            onClick={fetchPreviousVisits}
                                            style={{
                                                marginTop: '8px',
                                                padding: '4px 8px',
                                                backgroundColor: '#1976d2',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '11px'
                                            }}
                                        >
                                            Retry
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ 
                                        padding: '20px', 
                                        textAlign: 'center', 
                                        color: '#666',
                                        fontSize: '12px'
                                    }}>
                                        No previous visits found
                                    </div>
                                )}
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

                        {/* Past Services Section */}
                        <div style={{ marginTop: '2px' }}>
                            <div style={{ 
                                backgroundColor: '#1976d2', 
                                color: 'white', 
                                padding: '12px 15px', 
                                fontWeight: 'bold',
                                fontSize: '14px'
                            }}>
                                Past Services
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
                                    {treatmentData?.patientName || 'Amit Kalamkar'} / {treatmentData?.gender || 'Male'} / {treatmentData?.age || 48} Y / {treatmentData?.contact || 'N/A'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px', whiteSpace: 'nowrap' }}>Referred By:</label>
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
                                        borderRadius: '4px'
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
                                            disabled={key === 'pc'}
                                            style={{
                                                width: '100%',
                                                padding: '6px 10px',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                fontSize: '13px',
                                                backgroundColor: key === 'pc' ? '#f5f5f5' : 'white',
                                                color: key === 'pc' ? '#666' : '#333',
                                                cursor: key === 'pc' ? 'not-allowed' : 'text'
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
                                                disabled={key === 'bmi'}
                                                style={{
                                                    flex: 1,
                                                    padding: '6px 10px',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '4px',
                                                    fontSize: '13px',
                                                    backgroundColor: key === 'bmi' ? '#f5f5f5' : 'white',
                                                    color: key === 'bmi' ? '#666' : '#333',
                                                    cursor: key === 'bmi' ? 'not-allowed' : 'text'
                                                }}
                                            />
                                            {key === 'pallorHb' && (
                                                <button
                                                    type="button"
                                                    style={{
                                                        position: 'absolute',
                                                        left: 'calc(100% + 13px)',
                                                        top: '50%',
                                                        marginTop: '-16px',
                                                        backgroundColor: '#1976d2',
                                                        color: 'white',
                                                        border: 'none',
                                                        height: '32px',
                                                        padding: '0 10px',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px',
                                                        fontWeight: '500',
                                                        lineHeight: 1,
                                                        whiteSpace: 'nowrap',
                                                        outline: 'none',
                                                        transition: 'background-color 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#1565c0';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#1976d2';
                                                    }}
                                                    onClick={async () => {
                                                        const next = !showVitalsTrend;
                                                        setShowVitalsTrend(next);
                                                        if (next) {
                                                            // Load trends when opening
                                                            try {
                                                                setTrendError(null);
                                                                setTrendLoading(true);
                                                                const patientId = treatmentData?.patientId;
                                                                const clinicId = (treatmentData?.clinicId || sessionData?.clinicId) as string | undefined;
                                                                const doctorId = (treatmentData?.doctorId || sessionData?.doctorId) as string | undefined;
                                                                const shiftId = 1; // fallback if no shift available in session
                                                                const visitDate = new Date().toISOString().slice(0, 10);
                                                                const patientVisitNo = (treatmentData?.visitNumber ?? 0) as number;

                                                                if (!patientId || !clinicId) {
                                                                    throw new Error('Missing patient or clinic to load trends');
                                                                }

                                                                const data: PatientTrendItem[] = await trendsService.getPatientTrends({
                                                                    patientId,
                                                                    doctorId: doctorId ?? null,
                                                                    clinicId,
                                                                    shiftId,
                                                                    visitDate,
                                                                    patientVisitNo,
                                                                });

                                                                const mapped = (data || []).map((item) => {
                                                                    const datePart = item.preDates ?? (item.visitDate ?? '--');
                                                                    const shiftPart = item.shiftDescription ? ` ${item.shiftDescription}` : '';
                                                                    const date = `${datePart}${shiftPart}`.trim();

                                                                    const height = (item.heightInCms?.toFixed?.(2) ?? item.preHeightInCms ?? '--').toString();
                                                                    const weight = (item.weightInKgs?.toFixed?.(2) ?? item.preWeight ?? '--').toString();
                                                                    const pulse = ((item.pulse as unknown as string) ?? item.prePulse ?? '--').toString();
                                                                    const bp = (item.bloodPressure ?? item.preBp ?? '--').toString();
                                                                    const sugar = (item.sugar ?? item.preSugar ?? '--').toString();
                                                                    const tft = (item.thtext ?? item.preThtext ?? '--').toString();
                                                                    const pallorHb = (item.pallor ?? item.prePallor ?? '--').toString();
                                                                    const findings = (item.importantFindings ?? item.preImportantFindings ?? '--').toString();
                                                                    const history = (item.additionalComments ?? item.preAdditionalComments ?? '--').toString();
                                                                    return { date, height, weight, pulse, bp, sugar, tft, pallorHb, findings, history };
                                                                });

                                                                setTrendRows(mapped);
                                                            } catch (err: any) {
                                                                setTrendError(err?.message || 'Failed to load patient trends');
                                                                setTrendRows([]);
                                                            } finally {
                                                                setTrendLoading(false);
                                                            }
                                                        }
                                                    }}
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
                                    {trendLoading && (
                                        <div style={{ padding: '10px', fontSize: '12px' }}>Loading trends...</div>
                                    )}
                                    {trendError && !trendLoading && (
                                        <div style={{ padding: '10px', color: '#d32f2f', fontSize: '12px' }}>{trendError}</div>
                                    )}
                                    {!trendLoading && !trendError && trendRows.length === 0 && (
                                        <div style={{ padding: '10px', fontSize: '12px' }}>No trends available.</div>
                                    )}
                                    {trendRows.map((row, index) => (
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
                                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>Complaints</label>
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
                                                <span style={{ marginLeft: '8px', color: '#666', fontSize: '16px', lineHeight: '1' }}>▾</span>
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
                                                                            backgroundColor: 'transparent',
                                                                            borderRadius: '3px',
                                                                            fontWeight: 400
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
                                            onClick={handleAddCustomComplaint}
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
                                            backgroundColor: '#1976d2',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            fontSize: '13px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            textTransform: 'uppercase'
                                        }}
                                        onClick={() => {
                                            const appointmentRow: any = {
                                                patient: treatmentData?.patientName || '',
                                                patientId: String(treatmentData?.patientId || ''),
                                                age: Number(treatmentData?.age || 0),
                                                gender: treatmentData?.gender || '',
                                                contact: treatmentData?.contact || '',
                                                doctorId: treatmentData?.doctorId || '',
                                                clinicId: treatmentData?.clinicId || '',
                                                visitNumber: Number(treatmentData?.visitNumber || 0),
                                                provider: getDoctorLabelById(treatmentData?.doctorId),
                                                visitDate: new Date().toISOString().slice(0, 10)
                                            };
                                            setSelectedPatientForLab(appointmentRow);
                                            setShowLabTestEntry(true);
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
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>Diagnosis</label>
                                <span style={{ fontSize: '12px', color: '#666', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 1 }}>
                                    Diagnosis are copied from previous visit
                                </span>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                <div style={{ flex: 1, position: 'relative' }} ref={diagnosesRef}>
                                    <div
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
                                        onClick={() => setIsDiagnosesOpen(!isDiagnosesOpen)}
                                        onMouseEnter={(e) => {
                                            (e.currentTarget as HTMLDivElement).style.borderColor = '#1E88E5';
                                        }}
                                        onMouseLeave={(e) => {
                                            (e.currentTarget as HTMLDivElement).style.borderColor = '#B7B7B7';
                                        }}
                                    >
                                        <span style={{ color: selectedDiagnoses.length > 0 ? '#000' : '#9e9e9e' }}>
                                            {selectedDiagnoses.length > 0 
                                                ? `${selectedDiagnoses.length} diagnosis selected`
                                                : 'Select Diagnosis'
                                            }
                                        </span>
                                        <span style={{ marginLeft: '8px', color: '#666', fontSize: '16px', lineHeight: '1' }}>▾</span>
                                    </div>

                                    {isDiagnosesOpen && (
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
                                            marginTop: '4px',
                                            maxHeight: '300px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{ padding: '6px' }}>
                                                <input
                                                    type="text"
                                                    placeholder="Search diagnoses..."
                                                    value={diagnosisSearch}
                                                    onChange={(e) => setDiagnosisSearch(e.target.value)}
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

                                            <div className="diagnoses-dropdown" style={{ maxHeight: '200px', overflowY: 'auto', padding: '4px 6px', display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', columnGap: '8px', rowGap: '6px' }}>
                                                {diagnosesLoading && (
                                                    <div style={{ padding: '6px', fontSize: '12px', color: '#777', gridColumn: '1 / -1', textAlign: 'center' }}>
                                                        Loading diagnoses...
                                                    </div>
                                                )}
                                                {diagnosesError && (
                                                    <div style={{ padding: '6px', fontSize: '12px', color: '#d32f2f', gridColumn: '1 / -1', textAlign: 'center' }}>
                                                        {diagnosesError}
                                                        <button
                                                            onClick={() => {
                                                                setDiagnosesError(null);
                                                                // Trigger reload by updating a dependency
                                                                const doctorId = treatmentData?.doctorId || '1';
                                                                const clinicId = sessionData?.clinicId || '1';
                                                                diagnosisService.getAllDiagnosesForDoctorAndClinic(doctorId, clinicId)
                                                                    .then(setDiagnosesOptions)
                                                                    .catch(e => setDiagnosesError(e.message));
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
                                                {!diagnosesLoading && !diagnosesError && filteredDiagnoses.length === 0 && (
                                                    <div style={{ padding: '6px', fontSize: '12px', color: '#777', gridColumn: '1 / -1' }}>No diagnoses found</div>
                                                )}
                                                {!diagnosesLoading && !diagnosesError && filteredDiagnoses.map((opt, index) => {
                                                    const checked = selectedDiagnoses.includes(opt.value);
                                                    const isFirstUnselected = !checked && index > 0 && selectedDiagnoses.includes(filteredDiagnoses[index - 1].value);
                                                    
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
                                                                    backgroundColor: 'transparent',
                                                                    borderRadius: '3px',
                                                                    fontWeight: 400
                                                                }}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={checked}
                                                                    onChange={(e) => {
                                                                        setSelectedDiagnoses(prev => {
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
                                        height: '32px',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#1565c0';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#1976d2';
                                    }}
                                    onClick={handleAddDiagnoses}
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
                                    onClick={handleAddCustomDiagnosis}
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
                                                    onClick={() => row.value ? handleRemoveDiagnosisFromSelector(row.value) : handleRemoveDiagnosis(row.id)}
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
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>Medicine</label>
                                <span style={{ fontSize: '12px', color: '#666', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 1 }}>
                                    Medicine saved successfully!!
                                </span>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                <div style={{ position: 'relative', flex: 1 }} ref={medicinesRef}>
                                    <div
                                        onClick={() => setIsMedicinesOpen(!isMedicinesOpen)}
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
                                        <span style={{ color: selectedMedicines.length ? '#000' : '#9e9e9e' }}>
                                            {selectedMedicines.length === 0 && 'Select Medicines'}
                                            {selectedMedicines.length === 1 && '1 selected'}
                                            {selectedMedicines.length > 1 && `${selectedMedicines.length} selected`}
                                        </span>
                                        <span style={{ marginLeft: '8px', color: '#666', fontSize: '16px', lineHeight: '1' }}>▾</span>
                                    </div>

                                    {isMedicinesOpen && (
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
                                                    value={medicineSearch}
                                                    onChange={(e) => setMedicineSearch(e.target.value)}
                                                    placeholder="Search medicines"
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

                                            <div className="medicines-dropdown" style={{ maxHeight: '200px', overflowY: 'auto', padding: '4px 6px', display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', columnGap: '8px', rowGap: '6px' }}>
                                                {medicinesLoading && (
                                                    <div style={{ padding: '6px', fontSize: '12px', color: '#777', gridColumn: '1 / -1', textAlign: 'center' }}>
                                                        Loading medicines...
                                                    </div>
                                                )}
                                                {medicinesError && (
                                                    <div style={{ padding: '6px', fontSize: '12px', color: '#d32f2f', gridColumn: '1 / -1', textAlign: 'center' }}>
                                                        {medicinesError}
                                                        <button
                                                            onClick={() => {
                                                                setMedicinesError(null);
                                                                // Trigger reload by updating a dependency
                                                                const doctorId = treatmentData?.doctorId || '1';
                                                                const clinicId = sessionData?.clinicId || '1';
                                                                medicineService.getActiveMedicinesByDoctorAndClinic(doctorId, clinicId)
                                                                    .then(setMedicinesOptions)
                                                                    .catch(e => setMedicinesError(e.message));
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
                                                {!medicinesLoading && !medicinesError && filteredMedicines.length === 0 && (
                                                    <div style={{ padding: '6px', fontSize: '12px', color: '#777', gridColumn: '1 / -1' }}>No medicines found</div>
                                                )}
                                                {!medicinesLoading && !medicinesError && filteredMedicines.map((opt, index) => {
                                                    const checked = selectedMedicines.includes(opt.value);
                                                    const isFirstUnselected = !checked && index > 0 && selectedMedicines.includes(filteredMedicines[index - 1].value);
                                                    
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
                                                                    backgroundColor: 'transparent',
                                                                    borderRadius: '3px',
                                                                    fontWeight: 400
                                                                }}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={checked}
                                                                    onChange={(e) => {
                                                                        setSelectedMedicines(prev => {
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
                                    onClick={handleAddCustomMedicine}
                                >
                                    <Add fontSize="small" />
                                </button>
                            </div>

                            {/* Medicine Table */}
                            {medicineRows.length > 0 && (
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
                                        <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Medicine</div>
                                        <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>B</div>
                                        <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>L</div>
                                        <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>D</div>
                                        <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Days</div>
                                        <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Instruction</div>
                                        <div style={{ padding: '6px' }}>Action</div>
                                    </div>
                                    {medicineRows.map((row, index) => (
                                        <div key={row.id} style={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: '50px 1fr 50px 50px 50px 50px 1fr 80px' as const,
                                            backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                                            borderBottom: '1px solid #e0e0e0'
                                        }}>
                                            <div style={{ padding: '6px', borderRight: '1px solid #e0e0e0', fontSize: '12px' }}>{index + 1}</div>
                                            <div style={{ padding: '6px', borderRight: '1px solid #e0e0e0', fontSize: '12px' }}>{row.short_description || row.medicine}</div>
                                            <div style={{ padding: '0', borderRight: '1px solid #e0e0e0' }}>
                                                <input
                                                    type="text"
                                                    value={row.b}
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    onKeyDown={(e) => { const k = e.key; if (k === 'e' || k === 'E' || k === '+' || k === '-' || k === '.') { e.preventDefault(); } }}
                                                    onChange={(e) => handleMedicineFieldChange(row.id, 'b', e.target.value.replace(/\D/g, ''))}
                                                    className="medicine-table-input"
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
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    onKeyDown={(e) => { const k = e.key; if (k === 'e' || k === 'E' || k === '+' || k === '-' || k === '.') { e.preventDefault(); } }}
                                                    onChange={(e) => handleMedicineFieldChange(row.id, 'l', e.target.value.replace(/\D/g, ''))}
                                                    className="medicine-table-input"
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
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    onKeyDown={(e) => { const k = e.key; if (k === 'e' || k === 'E' || k === '+' || k === '-' || k === '.') { e.preventDefault(); } }}
                                                    onChange={(e) => handleMedicineFieldChange(row.id, 'd', e.target.value.replace(/\D/g, ''))}
                                                    className="medicine-table-input"
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
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    onKeyDown={(e) => { const k = e.key; if (k === 'e' || k === 'E' || k === '+' || k === '-' || k === '.') { e.preventDefault(); } }}
                                                    onChange={(e) => handleMedicineFieldChange(row.id, 'days', e.target.value.replace(/\D/g, ''))}
                                                    className="medicine-table-input"
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
                                                    onChange={(e) => handleMedicineInstructionChange(row.id, e.target.value)}
                                                    placeholder="Enter instruction"
                                                    className="medicine-table-input"
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
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>Prescription</label>
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
                                    Add Rx
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
                                    onClick={handleAddCustomPrescription}
                                >
                                    <Add fontSize="small" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowInstructionPopup(true)}
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

                            {isRxOpen && rxSuggestions.length > 0 && (
                                <div ref={rxRef} style={{ border: '1px solid #ccc', borderRadius: '4px', background: '#fff', maxHeight: '180px', overflowY: 'auto', width: '88%', marginBottom: '12px' }}>
                                    {rxSuggestions.map((item, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => { setPrescriptionInput(item); setIsRxOpen(false); }}
                                            style={{ padding: '6px 10px', cursor: 'pointer', fontSize: '12px', borderBottom: '1px solid #eee' }}
                                            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f5f5f5'; }}
                                            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = '#fff'; }}
                                            title={item}
                                        >
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            )}

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
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    onKeyDown={(e) => { const k = e.key; if (k === 'e' || k === 'E' || k === '+' || k === '-' || k === '.' ) { e.preventDefault(); } }}
                                                    onChange={(e) => handlePrescriptionFieldChange(row.id, 'b', e.target.value.replace(/\D/g, ''))}
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
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    onKeyDown={(e) => { const k = e.key; if (k === 'e' || k === 'E' || k === '+' || k === '-' || k === '.' ) { e.preventDefault(); } }}
                                                    onChange={(e) => handlePrescriptionFieldChange(row.id, 'l', e.target.value.replace(/\D/g, ''))}
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
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    onKeyDown={(e) => { const k = e.key; if (k === 'e' || k === 'E' || k === '+' || k === '-' || k === '.' ) { e.preventDefault(); } }}
                                                    onChange={(e) => handlePrescriptionFieldChange(row.id, 'd', e.target.value.replace(/\D/g, ''))}
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
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    onKeyDown={(e) => { const k = e.key; if (k === 'e' || k === 'E' || k === '+' || k === '-' || k === '.' ) { e.preventDefault(); } }}
                                                    onChange={(e) => handlePrescriptionFieldChange(row.id, 'days', e.target.value.replace(/\D/g, ''))}
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
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px', width: '100%', gap: '8px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>Prescriptions suggested in previous visit</label>
                                <div
                                    onClick={() => setShowPreviousVisit(!showPreviousVisit)}
                                    style={{
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        color: '#000000',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '20px',
                                        width: '20px',
                                        lineHeight: '1'
                                    }}
                                >
                                    {showPreviousVisit ? '▲' : '▼'}
                                </div>
                            </div>
                            
                            {/* Previous Visit Prescriptions Table */}
                            {showPreviousVisit && (
                                <>
                                    {previousVisitPrescriptions.length > 0 ? (
                                        <div style={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ 
                                                display: 'grid', 
                                                gridTemplateColumns: '50px 1fr 50px 50px 50px 50px 1fr' as const, 
                                                backgroundColor: '#f5f5f5', 
                                                color: '#666',
                                                fontWeight: 'bold',
                                                fontSize: '11px',
                                                borderBottom: '1px solid #ccc'
                                            }}>
                                                <div style={{ padding: '6px', borderRight: '1px solid #ccc' }}>Sr.</div>
                                                <div style={{ padding: '6px', borderRight: '1px solid #ccc' }}>Prescriptions</div>
                                                <div style={{ padding: '6px', borderRight: '1px solid #ccc' }}>B</div>
                                                <div style={{ padding: '6px', borderRight: '1px solid #ccc' }}>L</div>
                                                <div style={{ padding: '6px', borderRight: '1px solid #ccc' }}>D</div>
                                                <div style={{ padding: '6px', borderRight: '1px solid #ccc' }}>Days</div>
                                                <div style={{ padding: '6px' }}>Instruction</div>
                                            </div>
                                            {previousVisitPrescriptions.map((row, index) => (
                                                <div key={row.id} style={{ 
                                                    display: 'grid', 
                                                    gridTemplateColumns: '50px 1fr 50px 50px 50px 50px 1fr' as const,
                                                    backgroundColor: '#f5f5f5',
                                                    borderBottom: '1px solid #ccc'
                                                }}>
                                                    <div style={{ padding: '6px', borderRight: '1px solid #ccc', fontSize: '12px', color: '#666' }}>{index + 1}</div>
                                                    <div style={{ padding: '6px', borderRight: '1px solid #ccc', fontSize: '12px', color: '#666' }}>{row.prescription}</div>
                                                    <div style={{ padding: '6px', borderRight: '1px solid #ccc', fontSize: '12px', color: '#666', textAlign: 'center' }}>{row.b}</div>
                                                    <div style={{ padding: '6px', borderRight: '1px solid #ccc', fontSize: '12px', color: '#666', textAlign: 'center' }}>{row.l}</div>
                                                    <div style={{ padding: '6px', borderRight: '1px solid #ccc', fontSize: '12px', color: '#666', textAlign: 'center' }}>{row.d}</div>
                                                    <div style={{ padding: '6px', borderRight: '1px solid #ccc', fontSize: '12px', color: '#666', textAlign: 'center' }}>{row.days}</div>
                                                    <div style={{ padding: '6px', fontSize: '12px', color: '#666' }}>{row.instruction}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ 
                                            padding: '10px', 
                                            textAlign: 'center', 
                                            color: '#666', 
                                            fontSize: '12px',
                                            border: '1px solid #ccc', 
                                            borderRadius: '4px',
                                            backgroundColor: '#f5f5f5'
                                        }}>
                                            No Prescriptions suggested in previous visit.
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Investigation Section */}
                        <div style={{ marginBottom: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px', width: '88%', gap: '8px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>Investigation</label>
                                <span style={{ fontSize: '12px', color: '#666', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 1 }}>
                                    Investigation saved successfully!!
                                </span>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                <div style={{ flex: 1, position: 'relative' }} ref={investigationsRef}>
                                    <div
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
                                        onClick={() => setIsInvestigationsOpen(!isInvestigationsOpen)}
                                        onMouseEnter={(e) => {
                                            (e.currentTarget as HTMLDivElement).style.borderColor = '#1E88E5';
                                        }}
                                        onMouseLeave={(e) => {
                                            (e.currentTarget as HTMLDivElement).style.borderColor = '#B7B7B7';
                                        }}
                                    >
                                        <span style={{ color: selectedInvestigations.length > 0 ? '#000' : '#9e9e9e' }}>
                                            {selectedInvestigations.length > 0 
                                                ? `${selectedInvestigations.length} investigation selected`
                                                : 'Select Investigation'
                                            }
                                        </span>
                                        <span style={{ marginLeft: '8px', color: '#666', fontSize: '16px', lineHeight: '1' }}>▾</span>
                                    </div>

                                    {isInvestigationsOpen && (
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
                                            marginTop: '4px',
                                            maxHeight: '300px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{ padding: '6px' }}>
                                                <input
                                                    type="text"
                                                    placeholder="Search investigations..."
                                                    value={investigationSearch}
                                                    onChange={(e) => setInvestigationSearch(e.target.value)}
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

                                            <div className="investigations-dropdown" style={{ maxHeight: '200px', overflowY: 'auto', padding: '4px 6px', display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', columnGap: '8px', rowGap: '6px' }}>
                                                {investigationsLoading && (
                                                    <div style={{ padding: '6px', fontSize: '12px', color: '#777', gridColumn: '1 / -1', textAlign: 'center' }}>
                                                        Loading investigations...
                                                    </div>
                                                )}
                                                {investigationsError && (
                                                    <div style={{ padding: '6px', fontSize: '12px', color: '#d32f2f', gridColumn: '1 / -1', textAlign: 'center' }}>
                                                        {investigationsError}
                                                        <button
                                                            onClick={() => {
                                                                setInvestigationsError(null);
                                                                const doctorId = treatmentData?.doctorId || '1';
                                                                const clinicId = sessionData?.clinicId || '1';
                                                                investigationService.getInvestigationsForDoctorAndClinic(doctorId, clinicId)
                                                                    .then(setInvestigationsOptions)
                                                                    .catch(e => setInvestigationsError(e.message));
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
                                                {!investigationsLoading && !investigationsError && filteredInvestigations.length === 0 && (
                                                    <div style={{ padding: '6px', fontSize: '12px', color: '#777', gridColumn: '1 / -1' }}>No investigations found</div>
                                                )}
                                                {!investigationsLoading && !investigationsError && filteredInvestigations.map((opt, index) => {
                                                    const checked = selectedInvestigations.includes(opt.value);
                                                    const isFirstUnselected = !checked && index > 0 && selectedInvestigations.includes(filteredInvestigations[index - 1].value);
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
                                                                    backgroundColor: 'transparent',
                                                                    borderRadius: '3px',
                                                                    fontWeight: 400,
                                                                    color: '#333'
                                                                }}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={checked}
                                                                    onChange={(e) => {
                                                                        setSelectedInvestigations(prev => {
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
                                        height: '32px',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#1565c0';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#1976d2';
                                    }}
                                    onClick={handleAddInvestigations}
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
                                    onClick={handleAddCustomTestLab}
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
                                    <TrendingUp fontSize="small" />
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
                                        disabled={followUpTypesLoading}
                                        style={{
                                            width: '100%',
                                            padding: '6px 10px',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            fontSize: '13px',
                                            height: '32px',
                                            opacity: followUpTypesLoading ? 0.6 : 1
                                        }}
                                    >
                                        <option value="">
                                            {followUpTypesLoading ? 'Loading...' : 'Select Follow-up Type'}
                                        </option>
                                        {followUpTypesOptions.map((option) => (
                                            <option key={option.id} value={option.id}>
                                                {option.followUpDescription}
                                            </option>
                                        ))}
                                        {followUpTypesError && (
                                            <option value="" disabled>
                                                Error: {followUpTypesError}
                                            </option>
                                        )}
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

                        {/* Select Billed Charges - Diagnosis */}
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                Select Billed charges
                            </label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                                <div style={{ flex: 1, position: 'relative' }} ref={billingRef}>
                                    <div
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
                                        onClick={() => setIsBillingOpen(!isBillingOpen)}
                                        onMouseEnter={(e) => {
                                            (e.currentTarget as HTMLDivElement).style.borderColor = '#1E88E5';
                                        }}
                                        onMouseLeave={(e) => {
                                            (e.currentTarget as HTMLDivElement).style.borderColor = '#B7B7B7';
                                        }}
                                    >
                                        <span style={{ color: selectedBillingDetailIds.length > 0 ? '#000' : '#9e9e9e' }}>
                                            {selectedBillingDetailIds.length > 0 
                                                ? `${selectedBillingDetailIds.length} item(s) selected`
                                                : 'Select Charges'}
                                        </span>
                                        <span style={{ marginLeft: '8px', color: '#666', fontSize: '16px', lineHeight: '1' }}>▾</span>
                                    </div>

                                    {isBillingOpen && (
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '100%',
                                            left: 0,
                                            right: 0,
                                            backgroundColor: 'white',
                                            border: '1px solid #B7B7B7',
                                            borderRadius: '6px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                            zIndex: 1000,
                                            marginBottom: '4px',
                                            maxHeight: '300px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{ padding: '6px' }}>
                                                <input
                                                    type="text"
                                                    placeholder="Search charges..."
                                                    value={billingSearch}
                                                    onChange={(e) => setBillingSearch(e.target.value)}
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

                                            <div className="billing-dropdown" style={{ maxHeight: '200px', overflowY: 'auto', padding: '4px 6px', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', columnGap: '8px', rowGap: '6px' }}>
                                                {filteredBillingDetails.length === 0 && (
                                                    <div style={{ padding: '6px', fontSize: '12px', color: '#777', gridColumn: '1 / -1' }}>No charges found</div>
                                                )}
                                                {filteredBillingDetails.map((opt, index) => {
                                                    const checked = selectedBillingDetailIds.includes(opt.id);
                                                    const isFirstUnselected = !checked && index > 0 && selectedBillingDetailIds.includes(filteredBillingDetails[index - 1].id);
                                                    return (
                                                        <React.Fragment key={opt.id}>
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
                                                                    backgroundColor: 'transparent',
                                                                    borderRadius: '3px',
                                                                    fontWeight: 400
                                                                }}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={checked}
                                                                    onChange={(e) => {
                                                                        setSelectedBillingDetailIds(prev => {
                                                                            if (e.target.checked) {
                                                                                if (prev.includes(opt.id)) return prev;
                                                                                return [...prev, opt.id];
                                                                            } else {
                                                                                return prev.filter(v => v !== opt.id);
                                                                            }
                                                                        });
                                                                    }}
                                                                    style={{ margin: 0 }}
                                                                />
                                                                <span style={{ whiteSpace: 'nowrap', display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                                                                    <span>
                                                                        {[
                                                                            opt.billing_group_name,
                                                                            opt.billing_subgroup_name,
                                                                            opt.billing_details
                                                                        ]
                                                                            .filter((v) => v !== undefined && v !== null && String(v).trim() !== '')
                                                                            .map((part, idx, arr) => (
                                                                                <React.Fragment key={idx}>
                                                                                    <span>{part}</span>
                                                                                    {idx < arr.length - 1 && (
                                                                                        <span style={{ color: '#555', opacity: 0.8, padding: '0 2px' }}>||</span>
                                                                                    )}
                                                                                </React.Fragment>
                                                                            ))}
                                                                    </span>
                                                                    {typeof opt.default_fees === 'number' && !isNaN(opt.default_fees) && (
                                                                        <span style={{ color: '#1976d2' }}>₹{opt.default_fees}</span>
                                                                    )}
                                                                </span>
                                                            </label>
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    style={{
                                        padding: '0 10px',
                                        height: '32px',
                                        alignSelf: 'flex-start',
                                        backgroundColor: '#1976d2',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap'
                                    }}
                                    onClick={() => {
                                        const total = billingDetailsOptions
                                            .filter(opt => selectedBillingDetailIds.includes(opt.id))
                                            .reduce((sum, opt) => sum + (typeof opt.default_fees === 'number' && !isNaN(opt.default_fees) ? opt.default_fees : Number(opt.default_fees || 0)), 0);
                                        setBillingData(prev => {
                                            const discountNum = parseFloat(prev.discount) || 0;
                                            const newAcBalance = total - discountNum;
                                            return { ...prev, billed: String(total), acBalance: String(newAcBalance) };
                                        });
                                        if (total > 0) {
                                            setBillingError(null);
                                        }
                                    }}
                                >
                                    Add
                                </button>
                            </div>
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
                                        disabled
                                        placeholder="Billed Amount"
                                        style={{
                                            width: '100%',
                                            padding: '6px 10px',
                                            border: billingError ? '1px solid red' : '1px solid #ccc',
                                            borderRadius: '4px',
                                            fontSize: '13px',
                                            backgroundColor: '#f5f5f5',
                                            color: '#666',
                                            cursor: 'not-allowed'
                                        }}
                                    />
                                    {billingError && (
                                        <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                                            {billingError}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                        Discount (Rs)
                                    </label>
                                    <input
                                        type="text"
                                        value={billingData.discount}
                                        onChange={(e) => handleBillingChange('discount', e.target.value)}
                                        placeholder="0.00"
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
                                        disabled
                                        placeholder="0.00"
                                        style={{
                                            width: '100%',
                                            padding: '6px 10px',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            fontSize: '13px',
                                            backgroundColor: '#f5f5f5',
                                            color: '#666',
                                            cursor: 'not-allowed'
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
                                        disabled
                                        placeholder="0.00"
                                        style={{
                                            width: '100%',
                                            padding: '6px 10px',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            fontSize: '13px',
                                            backgroundColor: '#f5f5f5',
                                            color: '#666',
                                            cursor: 'not-allowed'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
                            <button 
                                type="button" 
                                onClick={() => setShowAddendumModal(true)}
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
                                onClick={handleTreatmentSave}
                                disabled={isSubmitting}
                                style={{
                                    backgroundColor: isSubmitting ? '#ccc' : '#1976d2',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 12px',
                                    borderRadius: '4px',
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                {isSubmitting ? 'Saving...' : 'Save'}
                            </button>
                            <button 
                                type="button" 
                                onClick={handleTreatmentSubmit}
                                disabled={isSubmitting}
                                style={{
                                    backgroundColor: isSubmitting ? '#ccc' : '#1976d2',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 12px',
                                    borderRadius: '4px',
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                        </div>
                    </div>
                </div>
            </div>

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
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999
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
                            width: '95%',
                            maxWidth: '1200px',
                            maxHeight: '95vh',
                            overflow: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative'
                        }}
                    >
                        {/* Patient Form Content */}
                        <PatientFormTest
                            onClose={() => setShowPatientFormDialog(false)}
                            initialData={formPatientData || undefined}
                            visitDates={visitDates}
                            currentVisitIndex={currentVisitIndex}
                            onVisitDateChange={(newIndex: number) => {
                                if (newIndex >= 0 && newIndex < allVisits.length) {
                                    setCurrentVisitIndex(newIndex);
                                    const selectedVisit = allVisits[newIndex];
                                    const patientName = selectedPatientForForm?.name || '';
                                    const appointmentRow = {
                                        patientId: treatmentData?.patientId,
                                        patient: treatmentData?.patientName,
                                        age: treatmentData?.age,
                                        gender: treatmentData?.gender,
                                        contact: treatmentData?.contact,
                                        doctorId: treatmentData?.doctorId,
                                        provider: getDoctorLabelById(treatmentData?.doctorId)
                                    };
                                    const mapped = mapPreviousVisitToInitialData(selectedVisit, patientName, appointmentRow);
                                    setFormPatientData(mapped);
                                }
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Add Complaint Popup */}
            <AddComplaintPopup
                open={showComplaintPopup}
                onClose={() => setShowComplaintPopup(false)}
                onSave={handleSaveComplaint}
            />

            {/* Add Diagnosis Popup */}
            <AddDiagnosisPopup
                open={showDiagnosisPopup}
                onClose={() => setShowDiagnosisPopup(false)}
                onSave={handleSaveDiagnosis}
            />

            {/* Add Medicine Popup */}
            <AddMedicinePopup
                open={showMedicinePopup}
                onClose={() => setShowMedicinePopup(false)}
                onSave={handleSaveMedicine}
            />

            {/* Add Prescription Popup */}
            <AddPrescriptionPopup
                open={showPrescriptionPopup}
                onClose={() => setShowPrescriptionPopup(false)}
                onSave={handleSavePrescription}
            />

            {/* Instruction Groups Popup */}
            <InstructionGroupsPopup
                isOpen={showInstructionPopup}
                onClose={() => setShowInstructionPopup(false)}
                patientName={treatmentData?.patientName || ''}
                patientAge={Number(treatmentData?.age || 0)}
                patientGender={(treatmentData?.gender || '').toString()}
            />

            {/* Add Test Lab Popup */}
            <AddTestLabPopup
                open={showTestLabPopup}
                onClose={() => setShowTestLabPopup(false)}
                onSave={handleSaveTestLab}
            />

            {/* Addendum Modal */}
            {showAddendumModal && (
                <div
                    role="dialog"
                    aria-modal="true"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 100000
                    }}
                    onClick={() => setShowAddendumModal(false)}
                >
                    <div
                        style={{
                            width: '95%',
                            maxWidth: 700,
                            maxHeight: '80vh',
                            overflow: 'auto',
                            background: '#fff',
                            borderRadius: 8,
                            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                            fontFamily: 'Roboto, sans-serif'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{
                            background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                            color: '#fff',
                            padding: '12px 16px',
                            borderTopLeftRadius: 8,
                            borderTopRightRadius: 8,
                            fontWeight: 700,
                            fontSize: 16
                        }}>
                            {treatmentData?.patientName || 'Patient'} / {treatmentData?.gender || ''} / {treatmentData?.age ? `${treatmentData.age} Y` : ''}
                        </div>

                        <div style={{ padding: 16 }}>
                            <div style={{ fontWeight: 600, color: '#2e7d32', marginBottom: 8 }}>Addendum:</div>
                            <textarea
                                value={addendumText}
                                onChange={(e) => {
                                    const text = e.target.value.slice(0, 1000);
                                    setAddendumText(text);
                                }}
                                placeholder="Type addendum..."
                                style={{
                                    width: '100%',
                                    height: 140,
                                    border: '1px solid #cfd8dc',
                                    borderRadius: 6,
                                    padding: 10,
                                    fontSize: 13,
                                    outline: 'none'
                                }}
                            />
                            <div style={{ color: '#607d8b', fontSize: 11, marginTop: 6 }}>Maximum 1000 character</div>

                            <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        try {
                                            const pid = String(treatmentData?.patientId || '').trim();
                                            const visitNo = Number(treatmentData?.visitNumber || 0);
                                            const userId = String(sessionData?.userId || '').trim();
                                            const visitDate = new Date().toISOString().slice(0, 10);
                                            if (!pid || !visitNo || !userId) {
                                                throw new Error('Missing patient, visit or user context');
                                            }
                                            const resp = await patientService.updateAddendum({
                                                addendum: addendumText || '',
                                                visitDate,
                                                patientId: pid,
                                                patientVisitNo: visitNo,
                                                userId
                                            });
                                            const msg = resp?.message || 'Addendum updated';
                                            setSnackbarMessage(msg);
                                            setSnackbarOpen(true);
                                            setShowAddendumModal(false);
                                        } catch (e: any) {
                                            setSnackbarMessage(e?.message || 'Failed to update addendum');
                                            setSnackbarOpen(true);
                                        }
                                    }}
                                    style={{ backgroundColor: '#1976d2', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                                >
                                    Submit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAddendumText('')}
                                    style={{ backgroundColor: 'rgb(25, 118, 210)', color: '#000', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                                >
                                    Clear
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddendumModal(false)}
                                    style={{ backgroundColor: 'rgb(24, 120, 215)', color: '#000', border: '1px solid #cfd8dc', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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

            {/* Success/Error Snackbar - Always rendered at bottom center */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={2000}
                onClose={() => {
                    setSnackbarOpen(false);
                    setSnackbarMessage('');
                }}
                message={snackbarMessage}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                sx={{
                    zIndex: 99999, // Ensure snackbar appears above everything
                    '& .MuiSnackbarContent-root': {
                        backgroundColor: snackbarMessage.toLowerCase().includes('error') || snackbarMessage.toLowerCase().includes('failed') ? '#f44336' : '#4caf50',
                        color: 'white',
                        fontWeight: 'bold'
                    }
                }}
            />

        </div>
    );
}
