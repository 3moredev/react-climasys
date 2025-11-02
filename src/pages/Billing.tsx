import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useLocation } from "react-router-dom";
import { visitService, ComprehensiveVisitDataRequest } from '../services/visitService';
import { sessionService, SessionInfo } from "../services/sessionService";
import { Delete, Edit, Add, Info, ExpandMore, ExpandLess } from '@mui/icons-material';
import { Snackbar } from '@mui/material';
import { complaintService, ComplaintOption } from "../services/complaintService";
import { medicineService, MedicineOption } from "../services/medicineService";
import { diagnosisService, DiagnosisOption } from "../services/diagnosisService";
import { investigationService, InvestigationOption } from "../services/investigationService";
import { appointmentService } from "../services/appointmentService";
import { getFollowUpTypes, FollowUpTypeItem } from "../services/referenceService";
import { patientService, MasterListsRequest, SaveMedicineOverwriteRequest } from "../services/patientService";
import PatientFormTest from "../components/Test/PatientFormTest";
import AddComplaintPopup from "../components/AddComplaintPopup";
import AddDiagnosisPopup from "../components/AddDiagnosisPopup";
import AddMedicinePopup, { MedicineData } from "../components/AddMedicinePopup";
import AddPrescriptionPopup, { PrescriptionData } from "../components/AddPrescriptionPopup";
import AddTestLabPopup, { TestLabData } from "../components/AddTestLabPopup";

// Specific styles for Duration/Comment input in table
const durationCommentStyles = `
  /* Global typography for Billing page */
  .billing-root, .billing-root * {
    font-family: sans-serif !important;
    font-size: 12px;
  }

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

export default function Treatment() {
    const navigate = useNavigate();
    const location = useLocation();
    const [sessionData, setSessionData] = useState<SessionInfo | null>(null);
    const [treatmentData, setTreatmentData] = useState<TreatmentData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [showVitalsTrend, setShowVitalsTrend] = useState<boolean>(false);
    const [showInstructionPopup, setShowInstructionPopup] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [hasSubmittedSuccessfully, setHasSubmittedSuccessfully] = useState<boolean>(false);
    const [statusId, setStatusId] = useState<number>(9);
    
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

    // Toggle state for showing details till Provisional Diagnosis
    const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);

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
    const [prescriptionRows, setPrescriptionRows] = useState<PrescriptionRow[]>([
        { id: '1', prescription: 'RABIPLS D (RABEPRAZOLE & DOMPERIDONE)', b: '1', l: '1', d: '1', days: '10', instruction: 'AFTER MEAL' },
        { id: '2', prescription: 'DYTOR 5 (TORSEMIDE)', b: '1', l: '', d: '', days: '10', instruction: 'AFTER MEAL' },
        { id: '3', prescription: 'BIO D3 PLUS (CALCIUM + CALCITRIOL)', b: '1', l: '', d: '', days: '10', instruction: 'AFTER MEAL' },
        { id: '4', prescription: 'VALIAM FORTE (MULTIVITAMIN + MULTIMINERAL)', b: '1', l: '', d: '', days: '10', instruction: 'AFTER MEAL' }
    ]);
    const [selectedComplaint, setSelectedComplaint] = useState('');
    const [selectedDiagnosis, setSelectedDiagnosis] = useState('');
    const [prescriptionInput, setPrescriptionInput] = useState('');
    
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
        followUpDate: '',
        remarkComments: '',
        planAdv: ''
    });

    // Follow-up types data
    const [followUpTypesOptions, setFollowUpTypesOptions] = useState<FollowUpTypeItem[]>([]);
    const [followUpTypesLoading, setFollowUpTypesLoading] = useState(false);
    const [followUpTypesError, setFollowUpTypesError] = useState<string | null>(null);
    
    // Master list driven display data for tables
    const [mlComplaints, setMlComplaints] = useState<Array<{ label: string; comment?: string }>>([]);
    const [mlDiagnosis, setMlDiagnosis] = useState<Array<{ label: string }>>([]);
    const [mlMedicinesTable, setMlMedicinesTable] = useState<PrescriptionRow[]>([]);
    const [mlPrescriptionsTable, setMlPrescriptionsTable] = useState<PrescriptionRow[]>([]);
    const [mlInstructionsTable, setMlInstructionsTable] = useState<PrescriptionRow[]>([]);
    const [mlTestsTable, setMlTestsTable] = useState<string[]>([]);

    const [billingData, setBillingData] = useState({
        billed: '',
        discount: '',
        acBalance: '',
        dues: '',
        receiptNo: '',
        paymentBy: '',
        feesCollected: '',
        paymentRemark: ''
    });
    
    // Attachments data
    const [attachments, setAttachments] = useState<Attachment[]>([
        { id: '1', name: 'AniruddhaTongaonkar.Pdf', type: 'pdf' },
        { id: '2', name: 'Jyoti Shinde.docx', type: 'docx' },
        { id: '3', name: 'Sachin Patankar.xlsx', type: 'xlsx' }
    ]);

    // Addendum modal moved to Treatment page

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

    // Load Payment By reference data and populate dropdown
    React.useEffect(() => {
        let cancelled = false;
        async function loadPaymentByOptions() {
            try {
                const ref = await patientService.getAllReferenceData();
                if (cancelled) return;
                // Prefer exact key shape: paymentMethods [{ id, paymentDescription }]
                const preferKeys = ['paymentMethods', 'paymentBy', 'paymentTypes', 'paymentModes', 'payments', 'paymentByList'];
                let raw: any[] = [];
                for (const key of preferKeys) {
                    if (Array.isArray((ref as any)?.[key])) { raw = (ref as any)[key]; break; }
                }
                // If specific keys not found, try to find an array with recognizable fields
                if (raw.length === 0) {
                    const firstArrayKey = Object.keys(ref || {}).find(k => Array.isArray((ref as any)[k]) && ((ref as any)[k][0] && (('description' in (ref as any)[k][0]) || ('label' in (ref as any)[k][0]) || ('name' in (ref as any)[k][0]))));
                    if (firstArrayKey) raw = (ref as any)[firstArrayKey];
                }
                const toStr = (v: any) => (v === undefined || v === null ? '' : String(v));
                const options: { value: string; label: string }[] = Array.isArray(raw)
                    ? raw.map((r: any) => ({
                        value: toStr(r?.id ?? r?.value ?? r?.code ?? r?.paymentById ?? r?.key ?? r),
                        label: toStr(r?.paymentDescription ?? r?.description ?? r?.label ?? r?.name ?? r?.paymentBy ?? r)
                      })).filter(o => o.label)
                    : [];
                // Initialize selected value if empty
                if (options.length > 0) {
                    setBillingData(prev => ({ ...prev, paymentBy: prev.paymentBy || options[0].value }));
                }
                setPaymentByOptions(options);
            } catch (e) {
                // swallow; non-critical for page rendering
            }
        }
        loadPaymentByOptions();
        return () => { cancelled = true; };
    }, []);

    const [paymentByOptions, setPaymentByOptions] = useState<Array<{ value: string; label: string }>>([]);

    // Load master lists for the current visit context
    useEffect(() => {
        const fetchMasterLists = async () => {
            try {
                if (!treatmentData?.patientId || !sessionData?.clinicId) return;
                const doctorId = treatmentData?.doctorId || sessionData?.doctorId;
                const clinicId = sessionData?.clinicId;
                const shiftId = (sessionData as any)?.shiftId ?? 1;
                const patientVisitNo = treatmentData?.visitNumber;

                if (!doctorId || !patientVisitNo) return;

                const params: MasterListsRequest = {
                    patientId: String(treatmentData.patientId),
                    shiftId: Number(shiftId),
                    clinicId: String(clinicId),
                    doctorId: String(doctorId),
                    visitDate: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
                    patientVisitNo: Number(patientVisitNo)
                };

                console.log('Requesting master lists with:', params);
                const resp = await patientService.getMasterLists(params);
                console.log('Master lists (Billing):', resp);
                // Patch vitals (from resp.data.vitals[0]) into form fields
                try {
                    const vitals = (resp as any)?.data?.vitals?.[0];
                    const dataRoot = (resp as any)?.data || {};
                    const medicinesFromMaster = Array.isArray(dataRoot?.medicines) ? dataRoot.medicines : [];
                    const medicinesJoined = medicinesFromMaster
                        .map((m: any) => String(m?.short_description ?? m?.medicine ?? m?.medicineName ?? m?.name ?? ''))
                        .filter(Boolean)
                        .join(', ');
                    if (vitals && typeof vitals === 'object') {
                        setFormData(prev => ({
                            ...prev,
                            height: vitals.height_in_cms !== undefined ? String(vitals.height_in_cms) : prev.height,
                            weight: vitals.weight_in_kgs !== undefined ? String(vitals.weight_in_kgs) : prev.weight,
                            pulse: vitals.pulse !== undefined ? String(vitals.pulse) : prev.pulse,
                            bp: vitals.blood_pressure !== undefined ? String(vitals.blood_pressure) : prev.bp,
                            sugar: vitals.sugar !== undefined ? String(vitals.sugar) : prev.sugar,
                            tft: vitals.tft !== undefined ? String(vitals.tft) : prev.tft,
                            pallorHb: vitals.pallor !== undefined ? String(vitals.pallor) : prev.pallorHb,
                            allergy: vitals.allergy_dtls !== undefined ? String(vitals.allergy_dtls) : prev.allergy,
                            medicalHistoryText: vitals.habits_comments !== undefined ? String(vitals.habits_comments) : prev.medicalHistoryText,
                            visitComments: vitals.instructions !== undefined ? String(vitals.instructions) : prev.visitComments,
                            medicines: medicinesJoined || prev.medicines,
                            medicalHistory: {
                                ...prev.medicalHistory,
                                hypertension: Boolean(vitals.hypertension ?? prev.medicalHistory.hypertension),
                                diabetes: Boolean(vitals.diabetes ?? prev.medicalHistory.diabetes),
                                cholesterol: Boolean((vitals.cholestrol !== undefined ? vitals.cholestrol : prev.medicalHistory.cholesterol)),
                                ihd: Boolean(vitals.ihd ?? prev.medicalHistory.ihd),
                                asthma: Boolean((vitals.asthama !== undefined ? vitals.asthama : prev.medicalHistory.asthma)),
                                th: Boolean(vitals.th ?? prev.medicalHistory.th),
                                smoking: Boolean(vitals.smoking ?? prev.medicalHistory.smoking),
                                tobacco: Boolean((vitals.tobaco !== undefined ? vitals.tobaco : prev.medicalHistory.tobacco)),
                                alcohol: Boolean((vitals.alchohol !== undefined ? vitals.alchohol : prev.medicalHistory.alcohol))
                            }
                        }));
                        try {
                            const uiFields = (dataRoot as any)?.uiFields || {};
                            const fuType = (uiFields?.followUpType ?? vitals.follow_up_type ?? '') as any;
                            const fu = (uiFields?.followUp ?? vitals.follow_up ?? '') as any;
                            const fuDate = (uiFields?.followUpDate ?? vitals.follow_up_date ?? '') as any;
                            setFollowUpData(prev => ({
                                ...prev,
                                followUpType: fuType ? String(fuType) : prev.followUpType,
                                followUp: fu ? String(fu) : prev.followUp,
                                followUpDate: fuDate ? String(fuDate) : prev.followUpDate
                            }));

                            // Patch billing fields from master lists (uiFields)
                            setBillingData(prev => ({
                                ...prev,
                                billed: uiFields?.billedRs !== undefined && uiFields?.billedRs !== null ? String(uiFields.billedRs) : prev.billed,
                                discount: uiFields?.discountRs !== undefined && uiFields?.discountRs !== null ? String(uiFields.discountRs) : prev.discount,
                                dues: uiFields?.duesRs !== undefined && uiFields?.duesRs !== null ? String(uiFields.duesRs) : prev.dues,
                                acBalance: uiFields?.acBalanceRs !== undefined && uiFields?.acBalanceRs !== null ? String(uiFields.acBalanceRs) : prev.acBalance,
                                receiptNo: uiFields?.receiptNo !== undefined && uiFields?.receiptNo !== null ? String(uiFields.receiptNo) : prev.receiptNo,
                                feesCollected: uiFields?.feesCollected !== undefined && uiFields?.feesCollected !== null ? String(uiFields.feesCollected) : prev.feesCollected,
                                paymentRemark: uiFields?.paymentRemark !== undefined && uiFields?.paymentRemark !== null ? String(uiFields.paymentRemark) : prev.paymentRemark,
                                paymentBy: uiFields?.paymentById !== undefined && uiFields?.paymentById !== null ? String(uiFields.paymentById) : prev.paymentBy
                            }));
                        } catch (_) {
                            // ignore mapping errors
                        }
                    }

                    // Patch table data from master lists
                    try {
                        const safeToStr = (v: any) => (v === undefined || v === null ? '' : String(v));
                        const mlComplaintsArr = Array.isArray(dataRoot?.complaints) ? dataRoot.complaints : [];
                        setMlComplaints(mlComplaintsArr.map((c: any) => ({
                            label: safeToStr(c?.complaint_description ?? c?.label ?? c?.name ?? c?.complaint ?? c?.description ?? ''),
                            comment: safeToStr(c?.complaint_comment ?? c?.comment ?? c?.remarks ?? '')
                        })).filter((c: any) => c.label));

                        const mlDiagArr = Array.isArray(dataRoot?.diagnosis) ? dataRoot.diagnosis : [];
                        setMlDiagnosis(mlDiagArr.map((d: any) => ({
                            label: safeToStr(d?.desease_description ?? d?.description ?? d?.diagnosis ?? d?.name ?? d?.label ?? '')
                        })).filter((d: any) => d.label));

                        const mapToRxRow = (p: any, idx: number, prefix: string): PrescriptionRow => {
                            // Build prescription as "medicine_name(brand_name)" when available
                            const medicineName = safeToStr(p?.medicine_name ?? '');
                            const brandName = safeToStr(p?.brand_name ?? '');
                            const fallbackPrescription = safeToStr(p?.prescription ?? p?.medicine ?? p?.medicineName ?? p?.short_description ?? p?.name ?? '');
                            const prescription = medicineName
                                ? (brandName ? `${medicineName}(${brandName})` : medicineName)
                                : (brandName || fallbackPrescription);
                            const b = safeToStr(p?.b ?? p?.morning ?? p?.Morning ?? '');
                            const l = safeToStr(p?.l ?? p?.afternoon ?? p?.Afternoon ?? '');
                            const d = safeToStr(p?.d ?? p?.night ?? p?.Night ?? '');
                            const days = safeToStr(p?.days ?? p?.no_of_days ?? p?.noOfDays ?? p?.duration ?? '');
                            const instruction = safeToStr(p?.instruction ?? p?.Instructions ?? '');
                            return { id: `${prefix}_${idx}`, prescription, b, l, d, days, instruction };
                        };

                        const mlMedArr = Array.isArray(dataRoot?.medicines) ? dataRoot.medicines : [];
                        setMlMedicinesTable(mlMedArr.map((m: any, idx: number) => mapToRxRow(m, idx, 'mlmed')).filter((r: PrescriptionRow) => !!r.prescription));

                        const mlRxArr = Array.isArray(dataRoot?.prescriptions) ? dataRoot.prescriptions : [];
                        setMlPrescriptionsTable(mlRxArr.map((p: any, idx: number) => mapToRxRow(p, idx, 'mlrx')).filter((r: PrescriptionRow) => !!r.prescription));

                        // If specific instruction list not provided, reuse prescriptions as instructions
                        const mlInstrArr = Array.isArray(dataRoot?.instructions) ? dataRoot.instructions : mlRxArr;
                        setMlInstructionsTable(mlInstrArr.map((p: any, idx: number) => mapToRxRow(p, idx, 'mlins')).filter((r: PrescriptionRow) => !!r.prescription));

                        const testsArr = Array.isArray(dataRoot?.labTestsAsked) ? dataRoot.labTestsAsked : [];
                        setMlTestsTable(testsArr.map((t: any) => safeToStr(t?.id ?? t?.name ?? t?.testName ?? t?.label ?? t)).filter((s: string) => !!s));
                    } catch (e2) {
                        console.warn('Billing: could not map table data from master lists', e2);
                    }
                } catch (e) {
                    console.warn('Billing: could not map vitals from master lists response', e);
                }
            } catch (error) {
                console.error('Failed to fetch master lists (Billing):', error);
            }
        };

        fetchMasterLists();
    }, [treatmentData?.patientId, treatmentData?.visitNumber, sessionData?.clinicId, sessionData?.doctorId, (sessionData as any)?.shiftId, treatmentData?.doctorId]);

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
            // ensure the dialog uses the correct index for date navigation
            setCurrentVisitIndex(visitIndex);
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

    // Display helper: show '-' when value is null/undefined/empty string
    const display = (value: any): string => {
        if (value === null || value === undefined) return '-';
        const str = String(value);
        return str.trim() === '' ? '-' : str;
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
            // Status 5 = Complete, 9 = Draft/Saved
            const statusForRequest = isSubmit ? 5 : 9;
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
                
                // Status and user - Use 5 for submit (Complete), 9 for save (Draft)
                statusId: statusForRequest,
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
            
            // Route to appropriate API based on action
            let result: any;
            if (isSubmit) {
                const overwriteRequest: SaveMedicineOverwriteRequest = {
                    visitDate: visitData.visitDate,
                    patientVisitNo: visitData.patientVisitNo,
                    shiftId: visitData.shiftId,
                    clinicId: visitData.clinicId,
                    doctorId: visitData.doctorId,
                    patientId: visitData.patientId,
                    medicineRows: medicineRows as any,
                    prescriptionRows: prescriptionRows as any,
                    feesToCollect: visitData.feesToCollect,
                    feesCollected: parseFloat(billingData.feesCollected) || 0,
                    userId: visitData.userId,
                    statusId: statusForRequest,
                    bloodPressure: visitData.bloodPressure,
                    allergyDetails: visitData.allergyDetails,
                    habitDetails: visitData.habitDetails,
                    comment: visitData.visitComments,
                    paymentById: parseInt(billingData.paymentBy) || undefined,
                    paymentRemark: billingData.paymentRemark || undefined,
                    discount: visitData.discount
                };
                result = await patientService.saveMedicineOverwrite(overwriteRequest);
            } else {
                result = await visitService.saveComprehensiveVisitData(visitData);
            }
            
            console.log('=== API RESPONSE ===');
            console.log('API Response:', result);
            console.log('Success status:', result.success);
            
            if (result.success) {
                console.log(`=== TREATMENT ${actionType}ED SUCCESSFULLY ===`);
                setSnackbarMessage(`Treatment ${isSubmit ? 'submitted' : 'saved'} successfully!`);
                setSnackbarOpen(true);
                if (isSubmit) {
                    setHasSubmittedSuccessfully(true);
                    setStatusId(5);
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
        await handleTreatmentAction(true); // true = submit
    };

    const handleComplaintCommentChange = (rowValue: string, text: string) => {
        setComplaintsRows(prev => prev.map(r => r.value === rowValue ? { ...r, comment: text } : r));
    };

    const handleRemoveComplaint = (rowValue: string) => {
        setComplaintsRows(prev => prev.filter((r: ComplaintRow) => r.value !== rowValue));
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
        setDiagnosisRows(prev => prev.filter((r: DiagnosisRow) => r.value !== rowValue));
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
        setInvestigationRows(prev => prev.filter((r: InvestigationRow) => r.investigation !== value));
        setSelectedInvestigations(prev => prev.filter(v => v !== value));
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
        // <>
        <div className="page billing-root">
            <style dangerouslySetInnerHTML={{ __html: durationCommentStyles }} />
            <div className="body">
                {/* Header */}
                <div className="dashboard-header" style={{ background: 'transparent', display: 'flex', alignItems: 'center', padding: '5px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h1 className="dashboard-title" style={{ color: '#000',fontSize: 20, }}>Collections</h1>
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
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'not-allowed', fontSize: '12px', whiteSpace: 'nowrap' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.visitType.inPerson}
                                            onChange={(e) => handleVisitTypeChange('inPerson', e.target.checked)}
                                            disabled
                                            style={{ backgroundColor: '#D5D5D8' }}
                                        />
                                        In-Person
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'not-allowed', fontSize: '12px', whiteSpace: 'nowrap' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.visitType.followUp}
                                            onChange={(e) => handleVisitTypeChange('followUp', e.target.checked)}
                                            disabled
                                            style={{ backgroundColor: '#D5D5D8' }}
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
                                        cursor: 'default',
                                        fontSize: '13px',
                                        // backgroundColor: value ? '#e3f2fd' : 'transparent',
                                        borderRadius: '4px',
                                        // border: value ? '1px solid #1976d2' : '1px solid transparent'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={value}
                                            disabled
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
                                            value={display(formData[key as keyof typeof formData] as string)}
                                            onChange={(e) => handleInputChange(key, e.target.value)}
                                            disabled
                                            style={{
                                                width: '100%',
                                                padding: '6px 10px',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                fontSize: '13px',
                                                backgroundColor: '#D5D5D8',
                                                color: '#333',
                                                cursor: 'not-allowed'
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Static UI Sections */}
                        <div style={{ marginBottom: isDetailsOpen ? '10px' : '0' }}>
                            <div
                                onClick={() => setIsDetailsOpen(prev => !prev)}
                                style={{ fontWeight: 600, fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', userSelect: 'none' }}
                                aria-label={isDetailsOpen ? 'Hide details' : 'Show details'}
                                title={isDetailsOpen ? 'Hide details' : 'Show details'}
                            >
                                Show {isDetailsOpen ? '▴' : '▾'}
                            </div>
                            {isDetailsOpen && (
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginTop: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <label style={{ fontSize: '12px', color: '#555', whiteSpace: 'nowrap' }}>Height (Cm)</label>
                                        <input type="text" disabled value={display(formData.height)} style={{ width: 90, padding: '4px 6px', border: '1px solid #ddd', borderRadius: 4, background: '#D5D5D8' }} />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <label style={{ fontSize: '12px', color: '#555', whiteSpace: 'nowrap' }}>Weight (Kg)</label>
                                        <input type="text" disabled value={display(formData.weight)} style={{ width: 90, padding: '4px 6px', border: '1px solid #ddd', borderRadius: 4, background: '#D5D5D8' }} />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <label style={{ fontSize: '12px', color: '#555', whiteSpace: 'nowrap' }}>BMI</label>
                                        <input type="text" disabled value={display(formData.bmi)} style={{ width: 90, padding: '4px 6px', border: '1px solid #ddd', borderRadius: 4, background: '#D5D5D8' }} />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <label style={{ fontSize: '12px', color: '#555', whiteSpace: 'nowrap' }}>Pulse (min)</label>
                                        <input type="text" disabled value={display(formData.pulse)} style={{ width: 90, padding: '4px 6px', border: '1px solid #ddd', borderRadius: 4, background: '#D5D5D8' }} />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <label style={{ fontSize: '12px', color: '#555', whiteSpace: 'nowrap' }}>BP</label>
                                        <input type="text" disabled value={display(formData.bp)} style={{ width: 90, padding: '4px 6px', border: '1px solid #ddd', borderRadius: 4, background: '#D5D5D8' }} />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <label style={{ fontSize: '12px', color: '#555', whiteSpace: 'nowrap' }}>Sugar</label>
                                        <input type="text" disabled value={display(formData.sugar)} style={{ width: 90, padding: '4px 6px', border: '1px solid #ddd', borderRadius: 4, background: '#D5D5D8' }} />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <label style={{ fontSize: '12px', color: '#555', whiteSpace: 'nowrap' }}>TFT</label>
                                        <input type="text" disabled value={display(formData.tft)} style={{ width: 90, padding: '4px 6px', border: '1px solid #ddd', borderRadius: 4, background: '#D5D5D8' }} />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <label style={{ fontSize: '12px', color: '#555', whiteSpace: 'nowrap' }}>Pallor/HB</label>
                                        <input type="text" disabled value={display(formData.pallorHb)} style={{ width: 90, padding: '4px 6px', border: '1px solid #ddd', borderRadius: 4, background: '#D5D5D8' }} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {isDetailsOpen && (
                        <div style={{ border: '1px solid #e0e0e0', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
                            {/* <div style={{ background: '#1976d2', color: '#fff', padding: '8px 10px', fontWeight: 600, fontSize: 13 }}>Complaints, Diagnosis, Medicines</div> */}
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#1976D2' }}>
                                        {['Sr.','Complaint Description','Duration / Comment'].map(h => (
                                            <th key={h} style={{ padding: 8, borderBottom: '1px solid #e0e0e0', fontSize: 12, color: 'white', textAlign: 'left' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {mlComplaints.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 1, color: '#777' }}>No complaints</td>
                                        </tr>
                                    ) : mlComplaints.map((c, idx) => (
                                        <tr key={`c_${idx}`}>
                                            <td style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12 }}>{idx+1}</td>
                                            <td style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12 }}>{c.label}</td>
                                            <td style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12 }}>{c.comment}</td>                                            
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, padding: 12 }}>
                                <textarea value={display(formData.detailedHistory)} placeholder="Detailed History" disabled style={{ height: 64, width: '100%', border: '1px solid #ddd', padding: 8, fontSize: 12, background: '#D5D5D8' }} />
                                <textarea value={display(formData.examinationFindings)} placeholder="Examination Findings" disabled style={{ height: 64, width: '100%', border: '1px solid #ddd', padding: 8, fontSize: 12, background: '#D5D5D8' }} />
                                <textarea value={display(formData.additionalComments)} placeholder="Additional Comments" disabled style={{ height: 64, width: '100%', border: '1px solid #ddd', padding: 8, fontSize: 12, background: '#D5D5D8' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 160px', gap: 12, padding: 12, alignItems: 'end' }}>
                                <textarea value={display(formData.procedurePerformed)} placeholder="Procedure Performed" disabled style={{ height: 64, width: '100%', border: '1px solid #ddd', padding: 8, fontSize: 12, background: '#D5D5D8' }} />
                                <textarea value={display(formData.dressingBodyParts)} placeholder="Dressing (body parts)" disabled style={{ height: 64, width: '100%', border: '1px solid #ddd', padding: 8, fontSize: 12, background: '#D5D5D8' }} />                                
                            </div>
                        </div>
                        )}

                        {isDetailsOpen && (
                        <div style={{ border: '1px solid #e0e0e0', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
                            {/* <div style={{ background: '#1976d2', color: '#fff', padding: '8px 10px', fontWeight: 600, fontSize: 13 }}>Provisional Diagnosis</div> */}
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#1976d2' }}>
                                        {['Sr.','Provisional Diagnosis'].map(h => (
                                            <th key={h} style={{ padding: 8, borderBottom: '1px solid #e0e0e0', fontSize: 12, color: '#fff', textAlign: 'left' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {mlDiagnosis.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12, color: '#777' }}>No diagnoses</td>
                                        </tr>
                                    ) : mlDiagnosis.map((d, idx) => (
                                        <tr key={`d_${idx}`}>
                                            <td style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12 }}>{idx+1}</td>
                                            <td style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12 }}>{d.label}</td>                                            
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        )}

                        <div style={{ border: '1px solid #e0e0e0', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
                            {/* <div style={{ background: '#1976d2', color: '#fff', padding: '8px 10px', fontWeight: 600, fontSize: 13 }}>Medicines</div> */}
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#1976d2' }}>
                                        {['Sr.','Medicines','B','L','D','Days','Instruction'].map(h => (
                                            <th key={h} style={{ padding: 8, borderBottom: '1px solid #e0e0e0', fontSize: 12, color: '#fff', textAlign: 'left' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {mlMedicinesTable.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12, color: '#777' }}>No medicines</td>
                                        </tr>
                                    ) : mlMedicinesTable.map((row, idx) => (
                                        <tr key={row.id} style={{ background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                                            <td style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12 }}>{idx+1}</td>
                                            <td style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12 }}>{row.prescription}</td>
                                            <td style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12 }}>{row.b}</td>
                                            <td style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12 }}>{row.l}</td>
                                            <td style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12 }}>{row.d}</td>
                                            <td style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12 }}>{row.days}</td>
                                            <td style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12 }}>{row.instruction}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ border: '1px solid #e0e0e0', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
                            {/* <div style={{ background: '#1976d2', color: '#fff', padding: '8px 10px', fontWeight: 600, fontSize: 13 }}>Prescriptions</div> */}
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#1976d2' }}>
                                        {['Sr.','Prescriptions','B','L','D','Days','Instruction'].map(h => (
                                            <th key={h} style={{ padding: 8, borderBottom: '1px solid #e0e0e0', fontSize: 12, color: '#fff', textAlign: 'left' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {mlPrescriptionsTable.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12, color: '#777' }}>No prescriptions</td>
                                        </tr>
                                    ) : mlPrescriptionsTable.map((row, idx) => (
                                        <tr key={row.id} style={{ background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                                            <td style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12 }}>{idx+1}</td>
                                            <td style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12 }}>{row.prescription}</td>
                                            <td style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12 }}>{row.b}</td>
                                            <td style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12 }}>{row.l}</td>
                                            <td style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12 }}>{row.d}</td>
                                            <td style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12 }}>{row.days}</td>
                                            <td style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12 }}>{row.instruction}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ border: '1px solid #e0e0e0', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
                            {/* <div style={{ background: '#1976d2', color: '#fff', padding: '8px 10px', fontWeight: 600, fontSize: 13 }}>Instructions</div> */}
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#1976d2' }}>
                                        {['Sr.','Instructions','B','L','D','Days','Instruction'].map(h => (
                                            <th key={h} style={{ padding: 8, borderBottom: '1px solid #e0e0e0', fontSize: 12, color: '#fff', textAlign: 'left' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {mlInstructionsTable.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12, color: '#777' }}>No instructions</td>
                                        </tr>
                                    ) : mlInstructionsTable.map((row, idx) => (
                                        <tr key={row.id} style={{ background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                                            <td style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12 }}>{idx+1}</td>
                                            <td style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12 }}>{row.prescription}</td>
                                            <td style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12 }}>{row.b || '1'}</td>
                                            <td style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12 }}>{row.l || '1'}</td>
                                            <td style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12 }}>{row.d || '1'}</td>
                                            <td style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12 }}>{row.days}</td>
                                            <td style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12 }}>{row.instruction}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ border: '1px solid #e0e0e0', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
                            {/* <div style={{ background: '#1976d2', color: '#fff', padding: '8px 10px', fontWeight: 600, fontSize: 13 }}>Suggested Tests</div> */}
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#1976d2' }}>
                                        {['Sr.','Suggested Tests'].map(h => (
                                            <th key={h} style={{ padding: 8, borderBottom: '1px solid #e0e0e0', fontSize: 12, color: '#fff', textAlign: 'left' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {mlTestsTable.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12, color: '#777' }}>No tests suggested</td>
                                        </tr>
                                    ) : mlTestsTable.map((t, idx) => (
                                        <tr key={`${t}_${idx}`} style={{ background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                                            <td style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12 }}>{idx+1}</td>
                                            <td style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12 }}>{t}</td>                                           
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                                {/* Follow-up Type */}
                                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Follow-up Type</label>
                                    <select
                                        disabled
                                        value={followUpData.followUpType || ''}
                                        style={{ border: '1px solid #ddd', padding: '6px 8px', fontSize: 12, background: '#D5D5D8' }}
                                    >
                                        <option value="">—</option>
                                        {followUpData.followUpType && (
                                            <option value={followUpData.followUpType}>{followUpData.followUpType}</option>
                                        )}
                                    </select>
                                </div>

                                {/* Follow up */}
                                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Follow up</label>
                                    <input
                                        type="text"
                                        disabled
                                        value={display(followUpData.followUp || '')}
                                        style={{ border: '1px solid #ddd', padding: '6px 8px', fontSize: 12, background: '#D5D5D8' }}
                                    />
                                </div>

                                {/* Follow-up Date */}
                                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Follow-up Date</label>
                                    <input
                                        type="text"
                                        disabled
                                        value={followUpData.followUpDate ? new Date(followUpData.followUpDate).toLocaleDateString('en-GB') : '-'}
                                        style={{ border: '1px solid #ddd', padding: '6px 8px', fontSize: 12, background: '#D5D5D8' }}
                                    />
                                </div>
                            </div>
                        <div style={{ marginBottom: 12 }}>
                            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>Plan / Adv</label>
                            <textarea value={display(followUpData.planAdv)} disabled style={{ width: '100%', height: 38, border: '1px solid #ddd', padding: 8, fontSize: 12, background: '#D5D5D8' }} />
                            {/* Addendum button moved to Treatment page */}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 12 }}>
                            {/* Billed (disabled) */}
                            <div>
                                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>Billed (Rs)</label>
                                <input
                                    type="text"
                                    disabled
                                    value={display(billingData.billed)}
                                    onChange={(e) => handleBillingChange('billed', e.target.value)}
                                    style={{ width: '100%', border: '1px solid #ddd', padding: '6px 8px', fontSize: 12, background: '#D5D5D8' }}
                                />
                            </div>
                            {/* Discount (enabled) */}
                            <div>
                                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>Discount (Rs)</label>
                                <input
                                    type="text"
                                    value={billingData.discount}
                                    onChange={(e) => handleBillingChange('discount', e.target.value)}
                                    style={{ width: '100%', border: '1px solid #ddd', padding: '6px 8px', fontSize: 12, background: 'white' }}
                                />
                            </div>
                            {/* Dues (disabled) */}
                            <div>
                                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>Dues (Rs)</label>
                                <input
                                    type="text"
                                    disabled
                                    value={display(billingData.dues)}
                                    onChange={(e) => handleBillingChange('dues', e.target.value)}
                                    style={{ width: '100%', border: '1px solid #ddd', padding: '6px 8px', fontSize: 12, background: '#D5D5D8' }}
                                />
                            </div>
                            {/* A/C Balance (disabled) */}
                            <div>
                                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>A/C Balance (Rs)</label>
                                <input
                                    type="text"
                                    disabled
                                    value={display(billingData.acBalance)}
                                    onChange={(e) => handleBillingChange('acBalance', e.target.value)}
                                    style={{ width: '100%', border: '1px solid #ddd', padding: '6px 8px', fontSize: 12, background: '#D5D5D8' }}
                                />
                            </div>
                            {/* Receipt No (disabled) */}
                            <div>
                                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>Receipt No</label>
                                <input
                                    type="text"
                                    disabled
                                    value={display(billingData.receiptNo)}
                                    style={{ width: '100%', border: '1px solid #ddd', padding: '6px 8px', fontSize: 12, background: '#D5D5D8' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 16 }}>
                            {/* Collected (enabled) */}
                            <div>
                                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>Collected (Rs)</label>
                                <input 
                                    type="text" 
                                    value={billingData.feesCollected}
                                    onChange={(e) => handleBillingChange('feesCollected', e.target.value)}
                                    style={{ width: '100%', border: '1px solid #ddd', padding: '6px 8px', fontSize: 12, background: 'white' }} 
                                />
                            </div>
                            {/* Reason (enabled) */}
                            <div>
                                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>Reason</label>
                                <input type="text" style={{ width: '100%', border: '1px solid #ddd', padding: '6px 8px', fontSize: 12, background: 'white' }} />
                            </div>
                            {/* Payment By (enabled) */}
                            <div>
                                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>Payment By</label>
                                <select
                                    value={billingData.paymentBy}
                                    onChange={(e) => handleBillingChange('paymentBy', e.target.value)}
                                    style={{ width: '100%', border: '1px solid #ddd', padding: '6px 8px', fontSize: 12, background: 'white' }}
                                >
                                    {paymentByOptions.length === 0 ? (
                                        <option value="">—</option>
                                    ) : (
                                        paymentByOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))
                                    )}
                                </select>
                            </div>
                            {/* Payment Remark (enabled) */}
                            <div>
                                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>Payment Remark</label>
                                <input 
                                    type="text" 
                                    value={billingData.paymentRemark}
                                    onChange={(e) => handleBillingChange('paymentRemark', e.target.value)}
                                    style={{ width: '100%', border: '1px solid #ddd', padding: '6px 8px', fontSize: 12, background: 'white' }} 
                                />
                            </div>
                            {/* Receipt Date (disabled) */}
                            <div>
                                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>Receipt Date</label>
                                <input type="text" disabled value={'-'} style={{ width: '100%', border: '1px solid #ddd', padding: '6px 8px', fontSize: 12, background: '#D5D5D8' }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    disabled
                                    style={{
                                        backgroundColor: '#1976D2', // gray background to show it's disabled
                                        color: '#666',
                                        border: 'none',
                                        padding: '8px 12px',
                                        borderRadius: '4px',
                                        cursor: 'not-allowed', // shows the "no" cursor
                                        fontSize: '12px',
                                        opacity: 0.7
                                    }}
                                >
                                    Print Receipt
                                </button>
                            <button 
                                type="button" 
                                onClick={() => window.print()}
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
                                Close
                            </button>
                            <button 
                                type="button" 
                                onClick={handleTreatmentSubmit}
                                disabled={isSubmitting || hasSubmittedSuccessfully}
                                style={{
                                    backgroundColor: (isSubmitting || hasSubmittedSuccessfully) ? '#ccc' : '#1976d2',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 12px',
                                    borderRadius: '4px',
                                    cursor: (isSubmitting || hasSubmittedSuccessfully) ? 'not-allowed' : 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                {isSubmitting ? 'Submitting...' : hasSubmittedSuccessfully ? 'Submitted' : 'Submit'}
                            </button>
                        </div>
                        </div>
                    </div>
                </div>
            </div>

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

            {showPatientFormDialog && (
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
                    onClick={() => setShowPatientFormDialog(false)}
                >
                    <div
                        style={{
                            width: '95%',
                            maxWidth: 1200,
                            maxHeight: '90vh',
                            overflow: 'auto',
                            background: '#fff',
                            borderRadius: 8,
                            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <PatientFormTest
                            initialData={formPatientData || undefined}
                            visitDates={visitDates}
                            currentVisitIndex={currentVisitIndex}
                            onVisitDateChange={(idx) => {
                                try {
                                    setCurrentVisitIndex(idx);
                                    const selectedVisit = allVisits[idx];
                                    if (!selectedVisit) return;
                                    const patientName = treatmentData?.patientName || '';
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
                                } catch (e) {
                                    console.error('Failed to change visit date in dialog:', e);
                                }
                            }}
                            onClose={() => setShowPatientFormDialog(false)}
                        />
                    </div>
                </div>
            )}

            {/* Addendum Modal moved to Treatment page */}

        </div>
    );
}
