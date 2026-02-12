import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useLocation } from "react-router-dom";
import { visitService, ComprehensiveVisitDataRequest } from '../services/visitService';
import { sessionService, SessionInfo } from "../services/sessionService";
import { DocumentService } from "../services/documentService";
import { Delete, Edit, Add, Info, TrendingUp, Download as DownloadIcon, Close } from '@mui/icons-material';
import { Snackbar, Typography, MenuItem } from '@mui/material';
import { complaintService, ComplaintOption } from "../services/complaintService";
import { medicineService, MedicineOption } from "../services/medicineService";
import { diagnosisService, DiagnosisOption } from "../services/diagnosisService";
import { investigationService, InvestigationOption } from "../services/investigationService";
import { dressingService, DressingOption } from "../services/dressingService";
import { appointmentService } from "../services/appointmentService";
import { getFollowUpTypes, FollowUpTypeItem } from "../services/referenceService";
import PatientFormTest from "../components/Test/PatientFormTest";
import AddComplaintPopup from "../components/AddComplaintPopup";
import AddDiagnosisPopup from "../components/AddDiagnosisPopup";
import AddMedicinePopup from "../components/AddMedicinePopup";
import AddPrescriptionPopup, { PrescriptionData } from "../components/AddPrescriptionPopup";
import AddBillingPopup from "../components/AddBillingPopup";
import AddTestLabPopup, { TestLabData } from "../components/AddLabTestPopup";
import LabTestEntry from "../components/LabTestEntry";
import InstructionGroupsPopup, { InstructionGroup } from "../components/InstructionGroupsPopup";
import { patientService } from "../services/patientService";
import PastServicesPopup from "../components/PastServicesPopup";
import AccountsPopup from "../components/AccountsPopup";
import LabTrendPopup from "../components/LabTrendPopup";
import VitalsTrendPopup from "../components/VitalsTrendPopup";
import AddPatientPage from "./AddPatientPage";
import { buildPrescriptionPrintHTML, buildLabTestsPrintHTML, getHeaderImageUrl } from "../utils/printTemplates";
import prescriptionDetailsService, {
    PrescriptionTemplate as PrescriptionTemplateApiModel,
} from "../services/prescriptionDetailsService";
import ClearableTextField from "../components/ClearableTextField";
import { getFieldConfig } from '../utils/fieldValidationConfig';
import { validateField } from '../utils/validationUtils';


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
  /* Dressing dropdown checkboxes */
  .dressings-dropdown input[type="checkbox"] {
    width: auto !important;
    padding: 0 !important;
    border: none !important;
    border-radius: 0 !important; 
    background: transparent !important;
    font-size: inherit !important;
    font-family: inherit !important;
    margin: 0 !important;
  }
  .dressings-dropdown input[type="checkbox"]:focus {
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
  /* Hide number input spinners */
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type="number"] {
    -moz-appearance: textfield;
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
    statusId?: number;
    status?: string;
    referralName?: string;
    referralCode?: string;
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
    priority?: number;
}

interface AddComplaintFormData {
    shortDescription: string;
    complaintDescription: string;
    priority: string;
    displayToOperator: boolean;
}

interface DiagnosisRow {
    id: string;
    value?: string;
    diagnosis: string;
    comment: string;
    priority?: number;
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
    priority?: number;
}

interface MedicineData {
    shortDescription: string;
    medicineName: string;
    priority: string;
    breakfast: string;
    lunch: string;
    dinner: string;
    days: string;
    instruction: string;
    addToActiveList: boolean;
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

interface DressingRow {
    id: string;
    value?: string;
    dressing: string;
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
    // Validation errors state
    const [errors, setErrors] = useState<Record<string, string>>({});

    const navigate = useNavigate();
    const location = useLocation();
    const [sessionData, setSessionData] = useState<SessionInfo | null>(null);
    const [treatmentData, setTreatmentData] = useState<TreatmentData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [showVitalsTrend, setShowVitalsTrend] = useState<boolean>(false);
    const [showInstructionPopup, setShowInstructionPopup] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [billingError, setBillingError] = useState<string | null>(null);
    const [discountError, setDiscountError] = useState<string | null>(null);
    const [followUpError, setFollowUpError] = useState<string | null>(null);
    const [planAdvError, setPlanAdvError] = useState<string | null>(null);
    const [remarkCommentsError, setRemarkCommentsError] = useState<string | null>(null);
    const [prescriptionError, setPrescriptionError] = useState<string | null>(null);
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
        importantFindings: '',
        additionalComments: '',
        procedurePerformed: '',
        dressingBodyParts: ''
    });

    // Previous visits data - now will be populated from API
    const [previousVisits, setPreviousVisits] = useState<PreviousVisit[]>([]);
    const [loadingPreviousVisits, setLoadingPreviousVisits] = useState(false);
    const [showQuickRegistration, setShowQuickRegistration] = useState(false);
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
    // Use ref to store latest lab test results for closure access
    const labTestResultsRef = useRef<any[] | null>(null);

    // Handler to receive lab test results from LabTestEntry popup
    const handleLabTestResultsFetched = (results: any[] | null) => {
        if (results && results.length > 0) {
            labTestResultsRef.current = results;
        } else {
            labTestResultsRef.current = null;
        }
    };

    // Past Services popup state
    const [showPastServicesPopup, setShowPastServicesPopup] = useState(false);
    const [selectedPastServiceDate, setSelectedPastServiceDate] = useState<string | null>(null);
    const [pastServiceDates, setPastServiceDates] = useState<string[]>([]);
    const [loadingPastServices, setLoadingPastServices] = useState<boolean>(false);
    const [pastServicesError, setPastServicesError] = useState<string | null>(null);

    // Addendum modal state
    const [showAddendumModal, setShowAddendumModal] = useState<boolean>(false);
    const [addendumText, setAddendumText] = useState<string>("");

    // Billing popup state
    const [showBillingPopup, setShowBillingPopup] = useState<boolean>(false);
    const [referByOptions, setReferByOptions] = useState<{ id: string; name: string }[]>([]);

    // Accounts popup state
    const [showAccountsPopup, setShowAccountsPopup] = useState<boolean>(false);

    // Lab Trend popup state
    const [showLabTrendPopup, setShowLabTrendPopup] = useState<boolean>(false);

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
    const complaintsRowsBuiltFromApiRef = React.useRef(false);
    const selectedComplaintsPatchedFromApiRef = React.useRef(false);
    const complaintsRowsLoadedFromSaveResponseRef = React.useRef(false);
    const diagnosisRowsLoadedFromSaveResponseRef = React.useRef(false);
    const medicineRowsLoadedFromSaveResponseRef = React.useRef(false);
    const prescriptionRowsLoadedFromSaveResponseRef = React.useRef(false);
    const investigationRowsLoadedFromSaveResponseRef = React.useRef(false);

    const filteredComplaints = React.useMemo(() => {
        const term = complaintSearch.trim().toLowerCase();

        // Helper function to sort by priority (lower priority number = higher priority)
        const sortByPriority = (a: ComplaintOption, b: ComplaintOption) => {
            const priorityA = a.priority ?? a.priority_value ?? 999;
            const priorityB = b.priority ?? b.priority_value ?? 999;
            return priorityA - priorityB;
        };

        if (!term) {
            // No search term - show all options with selected ones first, sorted by priority
            const selectedOptions = complaintsOptions
                .filter(opt => selectedComplaints.includes(opt.value))
                .sort(sortByPriority);
            const unselectedOptions = complaintsOptions
                .filter(opt => !selectedComplaints.includes(opt.value))
                .sort(sortByPriority);
            return [...selectedOptions, ...unselectedOptions];
        } else {
            // Search term provided - show selected items first, then search results, both sorted by priority
            const selectedOptions = complaintsOptions
                .filter(opt =>
                    selectedComplaints.includes(opt.value) && opt.label.toLowerCase().includes(term)
                )
                .sort(sortByPriority);
            const unselectedSearchResults = complaintsOptions
                .filter(opt =>
                    !selectedComplaints.includes(opt.value) && opt.label.toLowerCase().includes(term)
                )
                .sort(sortByPriority);
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

        // Helper function to sort by priority (lower priority number = higher priority)
        const sortByPriority = (a: MedicineOption, b: MedicineOption) => {
            const priorityA = a.priority ?? a.priority_value ?? 999;
            const priorityB = b.priority ?? b.priority_value ?? 999;
            return priorityA - priorityB;
        };

        if (!term) {
            // No search term - show all options with selected ones first, sorted by priority
            const selectedOptions = medicinesOptions
                .filter(opt => selectedMedicines.includes(opt.value))
                .sort(sortByPriority);
            const unselectedOptions = medicinesOptions
                .filter(opt => !selectedMedicines.includes(opt.value))
                .sort(sortByPriority);
            return [...selectedOptions, ...unselectedOptions];
        } else {
            // Search term provided - show selected items first, then search results, both sorted by priority
            const selectedOptions = medicinesOptions
                .filter(opt =>
                    selectedMedicines.includes(opt.value) && opt.label.toLowerCase().includes(term)
                )
                .sort(sortByPriority);
            const unselectedSearchResults = medicinesOptions
                .filter(opt =>
                    !selectedMedicines.includes(opt.value) && opt.label.toLowerCase().includes(term)
                )
                .sort(sortByPriority);
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

        // Helper function to sort by priority (lower priority number = higher priority)
        const sortByPriority = (a: DiagnosisOption, b: DiagnosisOption) => {
            const priorityA = a.priority ?? a.priority_value ?? 999;
            const priorityB = b.priority ?? b.priority_value ?? 999;
            return priorityA - priorityB;
        };

        if (!term) {
            // No search term - show all options with selected ones first, sorted by priority
            const selectedOptions = diagnosesOptions
                .filter(opt => selectedDiagnoses.includes(opt.value))
                .sort(sortByPriority);
            const unselectedOptions = diagnosesOptions
                .filter(opt => !selectedDiagnoses.includes(opt.value))
                .sort(sortByPriority);
            return [...selectedOptions, ...unselectedOptions];
        } else {
            // Search term provided - show selected items first, then search results, both sorted by priority
            const selectedOptions = diagnosesOptions
                .filter(opt =>
                    selectedDiagnoses.includes(opt.value) && opt.label.toLowerCase().includes(term)
                )
                .sort(sortByPriority);
            const unselectedSearchResults = diagnosesOptions
                .filter(opt =>
                    !selectedDiagnoses.includes(opt.value) && opt.label.toLowerCase().includes(term)
                )
                .sort(sortByPriority);
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

    // Dressing multi-select state (mirrors Diagnosis/Investigation)
    const [selectedDressings, setSelectedDressings] = useState<string[]>([]);

    // Instruction groups state
    const [selectedInstructionGroups, setSelectedInstructionGroups] = useState<InstructionGroup[]>([]);

    // Helper function to normalize InstructionGroup - ensure only required fields (id, name, nameHindi, instructions)
    const normalizeInstructionGroup = (group: any): InstructionGroup => {
        return {
            id: String(group?.id || ''),
            name: String(group?.name || ''),
            nameHindi: String(group?.nameHindi || ''),
            instructions: String(group?.instructions || '')
        };
    };

    // Helper function to normalize array of InstructionGroups
    const normalizeInstructionGroups = (groups: any[]): InstructionGroup[] => {
        if (!Array.isArray(groups)) return [];
        return groups.map(normalizeInstructionGroup);
    };

    React.useEffect(() => {
        console.log('*** selectedInstructionGroups state updated ***');
        console.log('New selectedInstructionGroups:', selectedInstructionGroups);
        console.log('selectedInstructionGroups length:', selectedInstructionGroups?.length || 0);
        if (selectedInstructionGroups && selectedInstructionGroups.length > 0) {
            console.log('selectedInstructionGroups clean format:', JSON.stringify(selectedInstructionGroups, null, 2));
        }
    }, [selectedInstructionGroups]);
    const [dressingSearch, setDressingSearch] = useState('');
    const [isDressingsOpen, setIsDressingsOpen] = useState(false);
    const dressingsRef = React.useRef<HTMLDivElement | null>(null);
    const [dressingsOptions, setDressingsOptions] = useState<DressingOption[]>([]);
    const [dressingsLoading, setDressingsLoading] = useState(false);
    const [dressingsError, setDressingsError] = useState<string | null>(null);

    const filteredDressings = React.useMemo(() => {
        const term = dressingSearch.trim().toLowerCase();
        if (!term) {
            const selectedOptions = dressingsOptions.filter(opt => selectedDressings.includes(opt.value));
            const unselectedOptions = dressingsOptions.filter(opt => !selectedDressings.includes(opt.value));
            return [...selectedOptions, ...unselectedOptions];
        } else {
            const selectedOptions = dressingsOptions.filter(opt =>
                selectedDressings.includes(opt.value) && opt.label.toLowerCase().includes(term)
            );
            const unselectedSearchResults = dressingsOptions.filter(opt =>
                !selectedDressings.includes(opt.value) && opt.label.toLowerCase().includes(term)
            );
            return [...selectedOptions, ...unselectedSearchResults];
        }
    }, [dressingsOptions, dressingSearch, selectedDressings]);

    const [dressingRows, setDressingRows] = useState<DressingRow[]>([]);

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
        dues: '',
        collected: ''
    });

    // Folder amount API response data
    const [folderAmountData, setFolderAmountData] = useState<{
        success?: boolean;
        totalAcBalance?: number;
        rows?: any[];
    } | null>(null);

    // Existing documents for current visit (from backend)
    const [existingDocuments, setExistingDocuments] = useState<any[]>([]);
    const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
    const [downloadingDocumentId, setDownloadingDocumentId] = useState<number | null>(null);
    const [openingDocumentId, setOpeningDocumentId] = useState<number | null>(null);

    // Load existing documents for the current patient visit
    const loadExistingDocuments = async (patientId: string, visitNo: number) => {
        if (!patientId || !visitNo) return;
        setIsLoadingDocuments(true);
        try {
            const result = await DocumentService.getDocumentsByVisit(patientId, visitNo);
            if (result.success && result.documents) {
                setExistingDocuments(result.documents);
            } else {
                setExistingDocuments([]);
            }
        } catch (e: any) {
            console.error("Failed to load existing documents:", e);
            if (e.response && e.response.data) {
                console.error("Error details:", e.response.data);
            }
            setExistingDocuments([]);
        } finally {
            setIsLoadingDocuments(false);
        }
    };

    // Whenever treatmentData changes, fetch documents for that visit
    useEffect(() => {
        const pid = treatmentData?.patientId;
        const vno = treatmentData?.visitNumber;
        if (pid && vno) {
            loadExistingDocuments(String(pid), Number(vno));
        }
    }, [treatmentData?.patientId, treatmentData?.visitNumber]);

    // Download a document by ID
    const handleDownloadDocument = async (doc: any) => {
        // Support various id field names
        const docId: number | undefined = doc.documentId || doc.id || doc.document_id || doc.documentID;
        if (!docId) return;
        if (downloadingDocumentId === docId) return;
        try {
            setDownloadingDocumentId(docId);
            const { blob, filename } = await DocumentService.downloadDocumentFile(docId);
            const objectUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = objectUrl;
            const safeName = (filename || doc.documentName || `document-${docId}`).toString();
            link.download = safeName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(objectUrl);
        } catch (e) {
            console.error('Error downloading document', e);
        } finally {
            setDownloadingDocumentId(null);
        }
    };

    // Open a document in a new tab
    const handleOpenDocument = async (doc: any) => {
        // Support various id field names
        const docId: number | undefined = doc.documentId || doc.id || doc.document_id || doc.documentID;
        if (!docId) return;
        if (openingDocumentId === docId || downloadingDocumentId === docId) return;
        try {
            setOpeningDocumentId(docId);
            const { blob, filename } = await DocumentService.downloadDocumentFile(docId);
            const objectUrl = window.URL.createObjectURL(blob);
            window.open(objectUrl, '_blank');
            // Note: We don't revoke the URL immediately as the new tab needs it
            // The browser will clean it up when the tab is closed
        } catch (e) {
            console.error('Error opening document', e);
        } finally {
            setOpeningDocumentId(null);
        }
    };

    // Helper function to escape HTML
    const escapeHtml = (text: string): string => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    // Print prescription/report
    const handlePrint = () => {
        const headerImageUrl = getHeaderImageUrl();
        // Get current date and time
        const now = new Date();

        // Format visit date
        const visitDate = treatmentData?.visitNumber
            ? new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }).replace(/ /g, '-')
            : new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }).replace(/ /g, '-');

        // Get patient info
        const patientName = escapeHtml(treatmentData?.patientName || '');
        const gender = escapeHtml(treatmentData?.gender || '');
        const age = treatmentData?.age ? `${treatmentData.age}` : '';
        const patientId = escapeHtml(treatmentData?.patientId || '');
        const contact = escapeHtml(treatmentData?.contact || '-');
        const weight = escapeHtml(formData.weight || '-');
        const height = escapeHtml(formData.height || '-');
        const bmi = escapeHtml(formData.bmi || '-');

        // Get medical details
        const complaints = complaintsRows.length > 0
            ? complaintsRows.map(c => escapeHtml(c.label)).join(', ')
            : (selectedComplaints.length > 0
                ? complaintsOptions.filter(opt => selectedComplaints.includes(opt.value))
                    .map(opt => escapeHtml(opt.label)).join(', ')
                : '-');

        const examinationFindings = escapeHtml(formData.importantFindings || formData.examinationFindings || '-');
        const diagnosis = diagnosisRows.length > 0
            ? diagnosisRows.map(d => escapeHtml(d.diagnosis)).join(', ')
            : (selectedDiagnoses.length > 0
                ? diagnosesOptions.filter(opt => selectedDiagnoses.includes(opt.value))
                    .map(opt => escapeHtml(opt.label)).join(', ')
                : escapeHtml(selectedDiagnosis || '-'));

        const pulse = escapeHtml(formData.pulse || '-');
        const bp = escapeHtml(formData.bp || '-');
        const sugar = escapeHtml(formData.sugar || '-');

        // Get advice
        const advice = escapeHtml(formData.visitComments || formData.additionalComments || '');

        // Build instructions HTML from selectedInstructionGroups
        let instructionsHTML = '';
        if (selectedInstructionGroups && selectedInstructionGroups.length > 0) {
            // Sort by id (which contains sequence_no) to maintain order
            const sortedGroups = [...selectedInstructionGroups].sort((a, b) => {
                const idA = parseInt(a.id) || 0;
                const idB = parseInt(b.id) || 0;
                return idA - idB;
            });

            instructionsHTML = sortedGroups.map((group) => {
                if (!group.instructions || !group.instructions.trim()) {
                    return '';
                }
                const groupName = group.name ? escapeHtml(group.name) : '';
                let instructionText = group.instructions.trim();

                // Escape HTML first
                instructionText = escapeHtml(instructionText);

                // Replace multiple spaces (2 or more) with line breaks to separate instruction items
                // This handles cases like "item1        item2        item3"
                let formattedText = instructionText.replace(/\s{2,}/g, '<br/>');

                // Also handle explicit line breaks
                formattedText = formattedText.replace(/\n/g, '<br/>');

                return `
                    <div style="margin-top: 15px; margin-bottom: 10px;">
                        ${groupName ? `<div style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">${groupName}</div>` : ''}
                        <div style="font-size: 12px; white-space: pre-wrap; line-height: 1.8; padding-left: 0;">${formattedText}</div>
                    </div>
                `;
            }).filter(html => html.trim()).join('');
        }

        // Build prescription table HTML
        let prescriptionTableHTML = '';
        if (prescriptionRows.length > 0) {
            prescriptionTableHTML = `
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                    <thead>
                        <tr style="background-color: #f5f5f5;">
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold;">Medicines</th>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">Morning<br/>सकाळी</th>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">Afternoon<br/>दुपारी</th>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">Evening<br/>रात्री</th>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">Days</th>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold;">Instruction</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${prescriptionRows.map(row => `
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px;">${escapeHtml(row.prescription || '-')}</td>
                                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${escapeHtml(row.b || '0')}</td>
                                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${escapeHtml(row.l || '0')}</td>
                                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${escapeHtml(row.d || '0')}</td>
                                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${escapeHtml(row.days || '-')}</td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${escapeHtml(row.instruction || '-')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            prescriptionTableHTML = '<p style="margin-top: 10px;">No prescriptions found.</p>';
        }

        const patientInfo = {
            name: patientName,
            gender,
            age,
            patientId,
            visitDate,
            contact,
            weight,
            height,
            bmi
        };

        const printHTML = buildPrescriptionPrintHTML({
            headerImageUrl,
            title: `Prescription - ${patientName}`,
            patientInfo,
            medicalDetails: {
                complaints,
                examinationFindings,
                diagnosis,
                pulse,
                bp,
                sugar
            },
            prescriptionTableHTML,
            adviceContent: advice,
            instructionsHTML
        });

        // Print within the same tab using a hidden iframe
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        // Use srcdoc so we don't navigate away or open a new tab
        iframe.srcdoc = printHTML;
        document.body.appendChild(iframe);

        // Flag to track if we've already triggered lab results print
        let labResultsPrinted = false;

        // Function to handle printing lab results after prescription print
        const handleLabResultsPrint = () => {
            // Use ref to get labTestsAsked from API (instead of popup data)
            const currentLabTestsAsked = labTestsAskedRef.current;
            if (!labResultsPrinted) {
                // Check if labTestsAsked exist using ref
                if (currentLabTestsAsked && Array.isArray(currentLabTestsAsked) && currentLabTestsAsked.length > 0) {
                    labResultsPrinted = true;
                    // Delay to ensure first print dialog is fully closed
                    setTimeout(() => {
                        try {
                            printLabTestResults();
                        } catch (error) {
                            console.error('❌ Error in printLabTestResults:', error);
                        }
                    }, 1000); // 1 second delay after first print closes
                } else {
                    console.log('❌ Cannot print lab results - no labTestsAsked available:', {
                        alreadyPrinted: labResultsPrinted,
                        hasLabTestsAsked: !!currentLabTestsAsked,
                        isArray: Array.isArray(currentLabTestsAsked),
                        labTestsAskedLength: currentLabTestsAsked?.length || 0
                    });
                }
            } else {
                console.log('❌ Already printed lab results');
            }
        };

        iframe.onload = () => {
            try {
                const win = iframe.contentWindow;
                if (win) {
                    let cleanupDone = false;

                    const cleanup = () => {
                        if (cleanupDone) return;
                        cleanupDone = true;
                        setTimeout(() => {
                            if (iframe.parentNode) {
                                iframe.parentNode.removeChild(iframe);
                            }
                        }, 100);
                    };

                    // Method 1: Listen for afterprint event
                    const handleAfterPrint = () => {
                        cleanup();
                        handleLabResultsPrint();
                    };

                    // Add listeners to both iframe and main window
                    win.addEventListener('afterprint', handleAfterPrint);
                    window.addEventListener('afterprint', handleAfterPrint);

                    // Method 2: Use window focus/blur events (more reliable)
                    let printDialogOpened = false;

                    const handleWindowBlur = () => {
                        console.log('Window blurred - print dialog opened');
                        printDialogOpened = true;
                    };

                    const handleWindowFocus = () => {
                        if (printDialogOpened) {
                            console.log('✅ Window focused - print dialog closed');
                            window.removeEventListener('blur', handleWindowBlur);
                            window.removeEventListener('focus', handleWindowFocus);
                            cleanup();
                            // Small delay to ensure print dialog is fully closed
                            setTimeout(() => {
                                handleLabResultsPrint();
                            }, 300);
                        }
                    };

                    // Add focus/blur listeners
                    window.addEventListener('blur', handleWindowBlur);
                    window.addEventListener('focus', handleWindowFocus);

                    // Clean up listeners after 10 seconds
                    setTimeout(() => {
                        window.removeEventListener('blur', handleWindowBlur);
                        window.removeEventListener('focus', handleWindowFocus);
                        window.removeEventListener('afterprint', handleAfterPrint);
                    }, 10000);

                    // Method 3: Simple timeout fallback (like old application pattern)
                    // After calling print(), wait a reasonable time then show second print
                    win.focus();
                    win.print();

                    // Fallback timeout - triggers second print after 2 seconds
                    // This ensures second print shows even if events don't fire
                    setTimeout(() => {
                        if (!labResultsPrinted) {
                            console.log('✅ Fallback timeout: triggering lab results print');
                            window.removeEventListener('blur', handleWindowBlur);
                            window.removeEventListener('focus', handleWindowFocus);
                            window.removeEventListener('afterprint', handleAfterPrint);
                            cleanup();
                            handleLabResultsPrint();
                        }
                    }, 2000); // 2 second fallback (similar to old app's 500ms-5s pattern)
                }
            } catch (error) {
                console.error('Error printing prescription:', error);
                // Fallback: remove iframe and check for lab results after timeout
                setTimeout(() => {
                    if (iframe.parentNode) {
                        iframe.parentNode.removeChild(iframe);
                    }
                    handleLabResultsPrint();
                }, 2000);
            }
        };
    };

    // Print lab test results
    const printLabTestResults = () => {
        // Use ref to get labTestsAsked from API (instead of popup data)
        const currentLabTestsAsked = labTestsAskedRef.current;

        if (!currentLabTestsAsked || !Array.isArray(currentLabTestsAsked) || currentLabTestsAsked.length === 0) {
            console.log('❌ No lab tests asked to print - invalid or empty data');
            return;
        }

        // Format visit date (same as prescription print)
        const visitDate = treatmentData?.visitNumber
            ? new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }).replace(/ /g, '-')
            : new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }).replace(/ /g, '-');

        // Get patient info (same as prescription print)
        const patientName = escapeHtml(treatmentData?.patientName || '');
        const gender = escapeHtml(treatmentData?.gender || '');
        const age = treatmentData?.age ? `${treatmentData.age}` : '';
        const patientId = escapeHtml(treatmentData?.patientId || '');
        const contact = escapeHtml(treatmentData?.contact || '-');
        const weight = escapeHtml(formData.weight || '-');
        const height = escapeHtml(formData.height || '-');
        const bmi = escapeHtml(formData.bmi || '-');

        // Build lab test list HTML from labTestsAsked
        let labTestListHTML = '';
        if (currentLabTestsAsked.length > 0) {
            labTestListHTML = '<ul style="list-style-type: none; padding-left: 0; margin-top: 10px;">';
            currentLabTestsAsked.forEach((labTest: any) => {
                const labTestName = labTest.id || labTest.name || labTest.labTestName || 'Unknown Test';
                labTestListHTML += `
                    <li style="font-size: 14px; margin-bottom: 8px; padding-left: 20px; position: relative;">
                        <span style="position: absolute; left: 0;">•</span>
                        ${escapeHtml(labTestName)}
                    </li>
                `;
            });
            labTestListHTML += '</ul>';
        }

        const patientInfo = {
            name: patientName,
            gender,
            age,
            patientId,
            visitDate,
            contact,
            weight,
            height,
            bmi
        };

        const printHTML = buildLabTestsPrintHTML({
            headerImageUrl: getHeaderImageUrl(),
            title: `Lab Tests Asked - ${patientName}`,
            patientInfo,
            labTestListHTML
        });

        // Print lab test results using iframe
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        iframe.srcdoc = printHTML;
        document.body.appendChild(iframe);
        iframe.onload = () => {
            try {
                const win = iframe.contentWindow;
                if (win) {
                    win.addEventListener('afterprint', () => {
                        setTimeout(() => {
                            if (iframe.parentNode) {
                                iframe.parentNode.removeChild(iframe);
                            }
                        }, 100);
                    });
                    win.focus();
                    win.print();
                }
            } catch (error) {
                console.error('Error printing lab test results:', error);
                setTimeout(() => {
                    if (iframe.parentNode) {
                        iframe.parentNode.removeChild(iframe);
                    }
                }, 2000);
            }
        };
    };

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
            const stateData = location.state as any;
            const normalizedData: TreatmentData = {
                ...stateData,
                referralCode: stateData.referralCode || stateData.referBy
            };
            setTreatmentData(normalizedData);

            // Initialize referralBy from state if present
            if (normalizedData.referralName) {
                setFormData(prev => ({
                    ...prev,
                    referralBy: normalizedData.referralName || ''
                }));
            }
        }
    }, [location.state]);

    // Load referral options from API
    React.useEffect(() => {
        let cancelled = false;
        async function loadReferBy() {
            try {
                const { getReferByTranslations } = await import('../services/referralService');
                const items = await getReferByTranslations(1); // languageId = 1
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



    // Check if form should be disabled (status is "Waiting for Medicine" or "Complete")
    const isFormDisabled = React.useMemo(() => {
        if (!treatmentData) return false;
        const statusId = treatmentData.statusId;
        const status = (treatmentData.status || '').toUpperCase().trim();
        const isWaitingForMedicine = status === 'WAITING FOR MEDICINE' || status === 'WAITINGFOR MEDICINE' || status === 'WAITINGFORMEDICINE';
        const isComplete = status === 'COMPLETE' || status === 'COMPLETED';
        // Consider common IDs as well (4: Waiting for Medicine, 6: Complete/Submitted in some flows)
        return isWaitingForMedicine || isComplete || statusId === 4 || statusId === 6;
    }, [treatmentData?.statusId, treatmentData?.status]);

    // Determine In-Person checkbox state based on status
    const inPersonChecked = React.useMemo(() => {
        if (!treatmentData?.status) return true; // Default to true if no status
        const status = String(treatmentData.status).trim().toUpperCase();
        const normalizedStatus = status === 'ON CALL' ? 'CONSULT ON CALL' : status;
        // If status is "CONSULT ON CALL" or other non-in-person statuses, set to false
        if (normalizedStatus === 'CONSULT ON CALL' || (normalizedStatus !== 'WAITING' && normalizedStatus !== 'WITH DOCTOR')) {
            return false;
        }
        return true; // Default to true for WAITING or WITH DOCTOR
    }, [treatmentData?.status]);

    // Determine if In-Person checkbox should be disabled based on status
    const inPersonDisabled = React.useMemo(() => {
        if (!treatmentData?.status) return isFormDisabled; // Use form disabled state if no status
        const status = String(treatmentData.status).trim().toUpperCase();
        const normalizedStatus = status === 'ON CALL' ? 'CONSULT ON CALL' : status;
        // Disable if status is not WAITING or WITH DOCTOR
        return normalizedStatus !== 'WAITING' && normalizedStatus !== 'WITH DOCTOR';
    }, [treatmentData?.status, isFormDisabled]);

    // Update inPerson value when status changes
    React.useEffect(() => {
        if (treatmentData?.status) {
            setFormData(prev => {
                // Only update if the computed value differs from current value
                if (prev.visitType.inPerson !== inPersonChecked) {
                    return {
                        ...prev,
                        visitType: {
                            ...prev.visitType,
                            inPerson: inPersonChecked
                        }
                    };
                }
                return prev;
            });
        }
    }, [treatmentData?.status, inPersonChecked]);

    // Sync referralBy from treatmentData (initial or patched) to formData
    React.useEffect(() => {
        if (treatmentData?.patientId) {
            setFormData(prev => {
                const newReferralBy = treatmentData.referralCode || treatmentData.referralName || prev.referralBy || '';
                // Only update if something changed
                if (prev.referralBy !== newReferralBy || prev.referralBy !== treatmentData.referralName) {
                    return {
                        ...prev,
                        referralBy: treatmentData.referralName || ''
                    };
                }
                return prev;
            });
        }
    }, [treatmentData?.patientId, treatmentData?.referralName, treatmentData?.referralCode]);


    // Check if Addendum button should be enabled (for "Waiting for Medicine" and "Complete")
    const isAddendumEnabled = React.useMemo(() => {
        if (!treatmentData) return false;
        const statusId = treatmentData.statusId;
        const status = (treatmentData.status || '').toUpperCase().trim();
        const isWaitingForMedicine = status === 'WAITING FOR MEDICINE' || status === 'WAITINGFOR MEDICINE' || status === 'WAITINGFORMEDICINE';
        const isComplete = status === 'COMPLETE' || status === 'COMPLETED';
        return isWaitingForMedicine || isComplete || statusId === 4 || statusId === 6;
    }, [treatmentData?.statusId, treatmentData?.status]);

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

    // Close Dressing dropdown on outside click
    React.useEffect(() => {
        if (!isDressingsOpen) return;
        function handleClickOutside(e: MouseEvent) {
            if (dressingsRef.current && !dressingsRef.current.contains(e.target as Node)) {
                setIsDressingsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDressingsOpen]);

    // Load Dressing options based on doctor/clinic
    React.useEffect(() => {
        let cancelled = false;
        async function loadDressings() {
            if (!treatmentData?.doctorId || !sessionData?.clinicId) return;
            setDressingsLoading(true);
            setDressingsError(null);
            try {
                const doctorId = treatmentData.doctorId;
                const clinicId = sessionData.clinicId;
                const options = await dressingService.getDressingsForDoctorAndClinic(doctorId, clinicId);
                if (!cancelled) setDressingsOptions(options);
            } catch (error: any) {
                if (!cancelled) setDressingsError(error.message || 'Failed to load dressings');
            } finally {
                if (!cancelled) setDressingsLoading(false);
            }
        }
        loadDressings();
        return () => { cancelled = true; };
    }, [treatmentData?.doctorId, sessionData?.clinicId]);

    // Load Investigation options based on doctor/clinic
    React.useEffect(() => {
        let cancelled = false;
        async function loadInvestigations() {
            const doctorId = treatmentData?.doctorId || sessionData?.doctorId;
            const clinicId = treatmentData?.clinicId || sessionData?.clinicId;
            if (!doctorId || !clinicId) return;
            setInvestigationsLoading(true);
            setInvestigationsError(null);
            try {
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
            const doctorId = treatmentData?.doctorId || sessionData?.doctorId;
            const clinicId = treatmentData?.clinicId || sessionData?.clinicId;
            if (!doctorId || !clinicId) return;

            setComplaintsLoading(true);
            setComplaintsError(null);

            try {
                console.log('Loading complaints for doctor:', doctorId, 'clinic:', clinicId);

                const complaints = await complaintService.getAllComplaintsForDoctor(doctorId, clinicId);
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
    }, [treatmentData?.doctorId, treatmentData?.clinicId, sessionData?.doctorId, sessionData?.clinicId]);

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

                const diagnoses = await diagnosisService.getDiagnosesFromPatientProfile(doctorId, clinicId);
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


    // Store master-lists billing data in a ref to use after billing options load
    const masterListsBillingRef = React.useRef<any[]>([]);
    // Store labTestsAsked from master-lists API
    const labTestsAskedRef = React.useRef<any[]>([]);
    // Track if billing data has been set from master-lists (to prevent overwriting)
    const billingDataSetFromMasterListsRef = React.useRef(false);


    // Load billing data from master-lists API
    React.useEffect(() => {
        let cancelled = false;
        async function loadBillingFromMasterLists() {
            // Only load if we have all required parameters
            if (!treatmentData?.patientId || !treatmentData?.doctorId || !sessionData?.clinicId ||
                !treatmentData?.visitNumber) {
                console.log('⏳ Skipping master-lists load: missing context', {
                    hasPatientId: !!treatmentData?.patientId,
                    hasDoctorId: !!treatmentData?.doctorId,
                    hasClinicId: !!sessionData?.clinicId,
                    hasVisitNumber: !!treatmentData?.visitNumber,
                    shiftId: (sessionData as any)?.shiftId
                });
                return;
            }

            try {
                console.log('🔄 Fetching master-lists data for instruction groups...');
                // Use today's date for visitDate
                const visitDate = toYyyyMmDd(new Date());

                const params = new URLSearchParams();
                params.set('patientId', String(treatmentData.patientId));
                params.set('shiftId', String((sessionData as any)?.shiftId || 1));
                params.set('clinicId', String(sessionData.clinicId));
                params.set('doctorId', String(treatmentData.doctorId));
                params.set('visitDate', visitDate);
                params.set('patientVisitNo', String(treatmentData.visitNumber));

                const resp = await fetch(`/api/visits/master-lists?${params.toString()}`);
                if (!resp.ok) {
                    console.warn('Failed to load master-lists billing data:', resp.status);
                    return;
                }

                const data = await resp.json();
                if (cancelled) return;

                // Extract billing array from response
                const billingArray = data?.data?.billing || [];

                // Store in ref for later matching
                if (Array.isArray(billingArray) && billingArray.length > 0) {
                    masterListsBillingRef.current = billingArray;
                } else {
                    masterListsBillingRef.current = [];
                }

                // Extract and set billing data from uiFields
                const uiFields = data?.data?.uiFields;
                if (uiFields && !cancelled) {
                    const billedRs = uiFields.billedRs ?? uiFields.billed ?? 0;
                    const discountRs = uiFields.discountRs ?? uiFields.discount ?? 0;
                    const collectedRs = uiFields.collectedRs ?? uiFields.collected ?? 0;
                    const duesRs = uiFields.duesRs ?? uiFields.dues ?? 0;
                    const acBalanceRs = uiFields.acBalanceRs ?? uiFields.acBalance ?? 0;

                    setBillingData({
                        billed: String(billedRs),
                        discount: String(discountRs),
                        collected: String(collectedRs),
                        dues: String(duesRs),
                        acBalance: String(acBalanceRs)
                    });

                    // Mark that billing data has been set from master-lists
                    billingDataSetFromMasterListsRef.current = true;
                }

                // Extract labTestsAsked array from response
                const labTestsAskedArray = data?.data?.labTestsAsked || [];
                if (Array.isArray(labTestsAskedArray) && labTestsAskedArray.length > 0) {
                    labTestsAskedRef.current = labTestsAskedArray;
                    console.log('Stored labTestsAsked from master-lists:', labTestsAskedArray);
                } else {
                    labTestsAskedRef.current = [];
                }

                // Extract instructionGroups array from response (this contains the selected groups)
                const instructionGroupsArray = data?.data?.instructionGroups || [];
                const instructionsArray = data?.data?.instructions || [];

                if (Array.isArray(instructionGroupsArray) && instructionGroupsArray.length > 0) {
                    // Map instructionGroups to InstructionGroup format
                    // Match with instructions array to get full instruction text
                    const normalize = (value: any) => String(value ?? '').trim().toUpperCase();
                    const mappedInstructionGroups: InstructionGroup[] = instructionGroupsArray.map((group: any, idx: number) => {
                        const groupDescRaw = group?.group_description ?? group?.Group_Description ?? group?.groupName ?? group?.name ?? '';
                        const groupNameUpper = normalize(groupDescRaw);

                        // Find matching instruction text from instructions array
                        const matchingInstruction = Array.isArray(instructionsArray)
                            ? instructionsArray.find((instr: any) => {
                                const instrGroupDesc = instr?.group_description ?? instr?.Group_Description ?? instr?.groupDescription ?? instr?.GroupDescription ?? '';
                                return normalize(instrGroupDesc) === groupNameUpper;
                            })
                            : null;

                        const instrDesc = matchingInstruction
                            ? (matchingInstruction?.instructions_description ?? matchingInstruction?.Instructions_Description ?? matchingInstruction?.instructionText ?? '')
                            : '';
                        const trimmedInstructions = String(instrDesc ?? '').trim();
                        const sequenceNo = matchingInstruction?.sequence_no ?? matchingInstruction?.Sequence_No ?? group?.sequence_no ?? group?.Sequence_No ?? idx + 1;

                        return {
                            id: String(sequenceNo),
                            name: groupNameUpper,
                            nameHindi: '', // Not provided in API response
                            instructions: trimmedInstructions
                        };
                    });

                    if (!cancelled) {
                        // Normalize the mapped groups to ensure clean format
                        const normalizedMappedGroups = normalizeInstructionGroups(mappedInstructionGroups);
                        setSelectedInstructionGroups(normalizedMappedGroups);
                    }
                } else {
                    if (!cancelled) {
                        setSelectedInstructionGroups([]);
                    }
                }

            } catch (e) {
                console.error('Error loading billing from master-lists:', e);
                masterListsBillingRef.current = [];
            }
        }
        loadBillingFromMasterLists();
        return () => { cancelled = true; };
    }, [treatmentData?.patientId, treatmentData?.doctorId, treatmentData?.visitNumber,
    sessionData?.clinicId, (sessionData as any)?.shiftId]);

    // Match and pre-select billing items after billing options are loaded
    React.useEffect(() => {
        // Only proceed if we have both billing options and master-lists billing data
        if (billingDetailsOptions.length === 0 || masterListsBillingRef.current.length === 0) {
            return;
        }

        const billingArray = masterListsBillingRef.current;

        // Match billing items from master-lists to existing billing options by fields
        const matchedIds: string[] = [];

        billingArray.forEach((billingItem: any) => {
            // Find matching option by comparing billing fields (case-insensitive, trimmed)
            const match = billingDetailsOptions.find(opt => {
                const optGroup = (opt.billing_group_name || '').trim().toLowerCase();
                const optSubgroup = (opt.billing_subgroup_name || '').trim().toLowerCase();
                const optDetails = (opt.billing_details || '').trim().toLowerCase();

                const itemGroup = (billingItem.billing_group_name || '').trim().toLowerCase();
                const itemSubgroup = (billingItem.billing_subgroup_name || '').trim().toLowerCase();
                const itemDetails = (billingItem.billing_details || '').trim().toLowerCase();

                return optGroup === itemGroup && optSubgroup === itemSubgroup && optDetails === itemDetails;
            });

            if (match) {
                matchedIds.push(match.id);
                console.log('✓ Matched:', billingItem.billing_details, '→ ID:', match.id);
            } else {
                console.warn('✗ Could not match:', billingItem.billing_details,
                    'Group:', billingItem.billing_group_name,
                    'Subgroup:', billingItem.billing_subgroup_name);
            }
        });

        // Pre-select the matched billing items (only if we have matches and not already selected)
        if (matchedIds.length > 0) {
            setSelectedBillingDetailIds(prev => {
                // Check if we already have these selected
                const allAlreadySelected = matchedIds.every(id => prev.includes(id));
                if (allAlreadySelected) {
                    console.log('Billing items already selected');
                    return prev;
                }

                // Merge with existing selections, avoiding duplicates
                const combined = [...new Set([...prev, ...matchedIds])];
                console.log('Pre-selected billing IDs:', combined);
                return combined;
            });
        } else {
            console.warn('No billing items matched for pre-selection');
        }
    }, [billingDetailsOptions]);


    // Load Previous Service Visit Dates for sidebar
    React.useEffect(() => {
        let cancelled = false;
        async function loadPastServices() {
            try {
                if (!treatmentData?.patientId || !sessionData?.doctorId || !sessionData?.clinicId) return;
                setLoadingPastServices(true);
                setPastServicesError(null);
                const todaysVisitDate = new Date().toISOString().slice(0, 10);
                const resp: any = await patientService.getPreviousServiceVisitDates({
                    patientId: String(treatmentData.patientId),
                    clinicId: String(sessionData.clinicId),
                    todaysVisitDate
                });
                if (cancelled) return;
                // Extract visitDate from visits array (priority: resp.visits)
                let dates: string[] = [];
                if (resp?.success && Array.isArray(resp?.visits)) {
                    // Parse visits array and extract visitDate
                    dates = resp.visits
                        .map((visit: any) => visit?.visitDate || visit?.visit_date || visit?.Visit_Date)
                        .filter((d: any) => d && String(d).trim() !== '')
                        .map((d: any) => String(d));
                } else {
                    // Fallback to previous parsing logic
                    const tryArrays: any[] = [];
                    if (Array.isArray(resp)) tryArrays.push(resp);
                    if (Array.isArray(resp?.dates)) tryArrays.push(resp.dates);
                    if (Array.isArray(resp?.resultSet1)) tryArrays.push(resp.resultSet1);
                    if (Array.isArray(resp?.visits)) tryArrays.push(resp.visits);
                    const firstArray = tryArrays.find(arr => Array.isArray(arr)) || [];
                    if (firstArray.length > 0) {
                        dates = firstArray.map((item: any) => {
                            if (typeof item === 'string') return item;
                            const d = item?.visitDate || item?.visit_date || item?.Visit_Date || item?.appointmentDate || item?.appointment_date || item?.serviceDate || item?.date;
                            return d ? String(d) : '';
                        }).filter((s: string) => !!s);
                    }
                }
                setPastServiceDates(dates);
            } catch (e: any) {
                if (!cancelled) setPastServicesError(e?.message || 'Failed to load past services');
            } finally {
                if (!cancelled) setLoadingPastServices(false);
            }
        }
        loadPastServices();
        return () => { cancelled = true; };
    }, [treatmentData?.patientId, sessionData?.doctorId, sessionData?.clinicId]);

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

    // Fetch previous visits for the current patient
    const fetchPreviousVisits = async () => {
        if (!treatmentData?.patientId || !sessionData?.doctorId || !sessionData?.clinicId) {
            ;
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

                    // Determine visit type using PLR indicators (Prescription/Lab/Radiology)
                    const getVisitType = (visit: any): string => {
                        const plr = String(visit.PLR || visit.plr || visit.plr_indicators || '').toUpperCase();

                        if (plr) {
                            if (plr.includes('L')) {
                                return 'L';
                            }
                            if (plr.includes('P')) {
                                return 'P';
                            }
                            if (plr.includes('R')) {
                                return 'L';
                            }
                        }

                        return '';
                    };

                    return {
                        id: String(visit.id || index),
                        date: visit.visit_date || visit.Visit_Date || visit.appointmentDate || visit.appointment_date || '',
                        type: getVisitType(visit),
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

    // Load patient folder amount for billing
    useEffect(() => {
        let cancelled = false;
        async function loadPatientFolderAmount() {
            if (!treatmentData?.patientId || !sessionData?.clinicId) {
                return;
            }

            try {
                const clinicId = String(sessionData.clinicId);
                const doctorId = treatmentData?.doctorId || sessionData?.doctorId;
                const patientId = String(treatmentData.patientId);

                if (!doctorId) {
                    console.error('Doctor ID is required but not found in treatment data or session');
                    return;
                }

                const params = new URLSearchParams();
                params.set('clinicId', clinicId);
                params.set('doctorId', String(doctorId));
                params.set('patientId', patientId);

                const response = await fetch(`/api/fees/folder-amount?${params.toString()}`);

                if (cancelled) return;

                if (!response.ok) {
                    console.error('Failed to fetch folder amount:', response.status, response.statusText);
                    return;
                }

                const data = await response.json();
                if (!cancelled && data) {
                    setFolderAmountData(data);
                    // Only update A/C Balance if billing data hasn't been set from master-lists
                    // This prevents overwriting the complete billing data from master-lists
                    if (!billingDataSetFromMasterListsRef.current &&
                        data.totalAcBalance !== undefined &&
                        data.totalAcBalance !== null) {
                        setBillingData(prev => ({
                            ...prev,
                            acBalance: String(data.totalAcBalance.toFixed(2))
                        }));
                    }
                }
            } catch (error) {
                console.error('Error fetching patient folder amount:', error);
            }
        }

        loadPatientFolderAmount();

        return () => {
            cancelled = true;
        };
    }, [treatmentData?.patientId, treatmentData?.doctorId, sessionData?.clinicId, sessionData?.doctorId]);

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


    // Handler for Past Services date click
    const handlePastServiceDateClick = (date: string) => {
        setSelectedPastServiceDate(date);
        setShowPastServicesPopup(true);
    };

    // Helper function to format date as dd-mmm-yy for Past Services
    const formatPastServiceDate = (dateString: string): string => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            const day = String(date.getDate()).padStart(2, '0');
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const month = monthNames[date.getMonth()];
            const year = String(date.getFullYear()).slice(-2);
            return `${day}-${month}-${year}`;
        } catch (error) {
            return dateString;
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
            height: (get(visit, 'height_cm', 'height', 'Height_In_Cms', 'Height') === 0 || get(visit, 'height_cm', 'height', 'Height_In_Cms', 'Height') === '0') ? '' : toStr(get(visit, 'height_cm', 'height', 'Height_In_Cms', 'Height')),
            weight: (get(visit, 'weight_kg', 'weight', 'Weight_IN_KGS', 'Weight') === 0 || get(visit, 'weight_kg', 'weight', 'Weight_IN_KGS', 'Weight') === '0') ? '' : toStr(get(visit, 'weight_kg', 'weight', 'Weight_IN_KGS', 'Weight')),
            pulse: (get(visit, 'pulse', 'Pulse', 'pulse_rate') === 0 || get(visit, 'pulse', 'Pulse', 'pulse_rate') === '0') ? '' : toStr(get(visit, 'pulse', 'Pulse', 'pulse_rate')),
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
            dressingBodyParts: toStr(get(visit, 'dressingBodyParts', 'dressing_body_parts', 'Dressing_Body_Parts', 'body_parts_dressed')),

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
        let processedValue = value;

        // Strict Character Filtering at Source (Matching PatientVisitDetails.tsx)
        if (field === 'pulse') {
            processedValue = String(value).replace(/[^0-9]/g, '');
        } else if (field === 'height' || field === 'weight') {
            // Allow digits and at most one dot
            processedValue = String(value).replace(/[^0-9.]/g, '');
            const parts = processedValue.split('.');
            if (parts.length > 2) {
                processedValue = parts[0] + '.' + parts.slice(1).join('');
            }
        }

        // Validate the field early
        let { allowed, error } = validateField(field, processedValue, undefined, undefined, 'visit');

        // Input blocking: Prevent typing beyond maxLength, but still set the validation error to trigger gray message
        if (!allowed) {
            setErrors(prev => ({ ...prev, [field]: error }));
            return;
        }

        // Custom error message override for height and weight to match PatientVisitDetails.tsx
        if (error) {
            const numValue = parseFloat(processedValue);
            if (field === 'height' && (numValue < 30 || numValue > 250)) {
                error = 'Height must be between 30 and 250';
            } else if (field === 'weight' && (numValue < 1 || numValue > 250)) {
                error = 'Weight must be between 1 and 250';
            } else if (field === 'pulse' && (numValue < 30 || numValue > 220)) {
                error = 'Pulse must be between 30 and 220';
            }
        }

        setErrors(prev => {
            const newErrors = { ...prev };
            if (error) {
                newErrors[field] = error;
            } else {
                delete newErrors[field];
            }
            return newErrors;
        });

        // Always update the value to allow user to see what they typed and the error message
        setFormData(prev => ({
            ...prev,
            [field]: processedValue
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
                        newRows.push({
                            id: `${val}`,
                            value: val,
                            label: opt.label,
                            comment: '',
                            priority: opt.priority ?? opt.priority_value ?? 999
                        });
                    }
                }
            });
            const next = [...prev, ...newRows];
            // Sort by priority (lower priority number = higher priority)
            return next.sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
        });
        // Clear selections and close menu after adding
        setSelectedComplaints([]);
        setIsComplaintsOpen(false);
    };

    const handleAddCustomComplaint = () => {
        setShowComplaintPopup(true);
    };

    const handleSaveComplaint = async ({
        shortDescription,
        complaintDescription,
        priority,
        displayToOperator
    }: AddComplaintFormData): Promise<boolean | void> => {
        const doctorId = treatmentData?.doctorId || sessionData?.doctorId;
        const clinicId = treatmentData?.clinicId || sessionData?.clinicId;

        if (!doctorId || !clinicId) {
            setComplaintsError('Doctor and clinic information are required to add a complaint.');
            return false;
        }

        const trimmedShortDescription = shortDescription?.trim() || '';
        const trimmedComplaintDescription = complaintDescription?.trim() || '';
        const priorityValue = priority ? parseInt(priority, 10) : 0;

        if (!trimmedShortDescription || !trimmedComplaintDescription) {
            setComplaintsError('Short description and complaint description are required.');
            return false;
        }

        // Check for duplicate complaint before API call (check both label and short description)
        const normalizedShortDesc = trimmedShortDescription.toLowerCase().trim();
        const normalizedComplaintDesc = trimmedComplaintDescription.toLowerCase().trim();

        // Check if it already exists in the table
        const existingByLabel = complaintsRows.find(
            row => row.label?.toLowerCase().trim() === normalizedShortDesc ||
                row.label?.toLowerCase().trim() === normalizedComplaintDesc
        );

        // Check if it already exists in complaintsOptions (dropdown list) - prevent adding if it exists in dropdown
        const existingInOptions = complaintsOptions.find(
            opt => opt.short_description?.toLowerCase().trim() === normalizedShortDesc ||
                opt.complaint_description?.toLowerCase().trim() === normalizedComplaintDesc ||
                opt.label?.toLowerCase().trim() === normalizedShortDesc ||
                opt.label?.toLowerCase().trim() === normalizedComplaintDesc
        );

        if (existingByLabel || existingInOptions) {
            const duplicateName = existingByLabel?.label ||
                existingInOptions?.label ||
                existingInOptions?.short_description ||
                existingInOptions?.complaint_description ||
                trimmedComplaintDescription;
            setSnackbarMessage(`Complaint "${duplicateName}" is already added.`);
            setSnackbarOpen(true);
            setComplaintsError(null);
            // Do NOT close popup here; signal to popup to stay open
            return false;
        }

        try {
            setComplaintsError(null);

            const payload = {
                shortDescription: trimmedShortDescription,
                short_description: trimmedShortDescription,
                complaintDescription: trimmedComplaintDescription,
                complaint_description: trimmedComplaintDescription,
                priority: Number.isNaN(priorityValue) ? 0 : priorityValue,
                priority_value: Number.isNaN(priorityValue) ? 0 : priorityValue,
                displayToOperator,
                display_to_operator: displayToOperator,
                doctorId,
                clinicId
            };

            const response = await patientService.createComplaint(payload);

            const responseId = response?.id ? String(response.id) : `custom_${Date.now()}`;
            const responseShort =
                response?.shortDescription ||
                response?.short_description ||
                trimmedShortDescription;
            const responseDescription =
                response?.complaintDescription ||
                response?.complaint_description ||
                trimmedComplaintDescription;
            const label = responseShort || responseDescription || responseId;

            const newComplaint: ComplaintRow = {
                id: responseId,
                value: responseId,
                label,
                comment: '',
                priority: response?.priority ?? response?.priority_value ?? 999
            };

            setComplaintsRows(prev => {
                const next = [...prev, newComplaint];
                // Sort by priority (lower priority number = higher priority)
                return next.sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
            });
            setComplaintsOptions(prev => [
                ...prev,
                {
                    value: responseId,
                    label,
                    short_description: responseShort,
                    complaint_description: responseDescription
                }
            ]);

            // Show success message
            setSnackbarMessage('Complaint added successfully!');
            setSnackbarOpen(true);

            setShowComplaintPopup(false);
        } catch (error: any) {
            console.error('Failed to create complaint from Treatment screen:', error);
            setComplaintsError(error?.message || 'Failed to create complaint. Please try again.');
            return false;
        }
    };

    const handleAddCustomDiagnosis = () => {
        setShowDiagnosisPopup(true);
    };

    const handleSaveDiagnosis = async ({
        shortDescription,
        diagnosisDescription,
        priority
    }: {
        shortDescription: string;
        diagnosisDescription: string;
        priority: string;
    }) => {
        const doctorId = treatmentData?.doctorId || sessionData?.doctorId;
        const clinicId = treatmentData?.clinicId || sessionData?.clinicId;

        if (!doctorId || !clinicId) {
            setDiagnosesError('Doctor and clinic information are required to add a diagnosis.');
            return false;
        }

        const trimmedShortDescription = shortDescription?.trim() || '';
        const trimmedDiagnosisDescription = diagnosisDescription?.trim() || '';
        const priorityValue = priority ? parseInt(priority, 10) : 0;

        if (!trimmedShortDescription || !trimmedDiagnosisDescription) {
            setDiagnosesError('Short description and diagnosis description are required.');
            return false;
        }

        // Check for duplicate diagnosis before API call (check both value and diagnosis name)
        const normalizedShortDesc = trimmedShortDescription.toLowerCase().trim();
        const normalizedDiagnosisDesc = trimmedDiagnosisDescription.toLowerCase().trim();

        // Check if it already exists in the table
        const existingByValue = diagnosisRows.find(
            row => row.value?.toLowerCase().trim() === normalizedShortDesc
        );
        const existingByDiagnosis = diagnosisRows.find(
            row => row.diagnosis?.toLowerCase().trim() === normalizedDiagnosisDesc
        );

        // Check if it already exists in diagnosesOptions (dropdown list) - prevent adding if it exists in dropdown
        const existingInOptions = diagnosesOptions.find(
            opt => opt.value?.toLowerCase().trim() === normalizedShortDesc ||
                opt.label?.toLowerCase().trim() === normalizedDiagnosisDesc
        );

        if (existingByValue || existingByDiagnosis || existingInOptions) {
            const duplicateName = existingByDiagnosis?.diagnosis ||
                existingByValue?.diagnosis ||
                existingInOptions?.label ||
                trimmedDiagnosisDescription;
            setSnackbarMessage(`Diagnosis "${duplicateName}" is already added.`);
            setSnackbarOpen(true);
            setDiagnosesError(null);
            // Do NOT close popup here; signal to popup to stay open
            return false;
        }

        try {
            setDiagnosesError(null);

            const normalizedPriority = Number.isNaN(priorityValue) ? 0 : priorityValue;
            const payload = {
                shortDescription: trimmedShortDescription,
                short_description: trimmedShortDescription,
                diagnosisDescription: trimmedDiagnosisDescription,
                diagnosis_description: trimmedDiagnosisDescription,
                priority: normalizedPriority,
                priorityValue: normalizedPriority,
                priority_value: normalizedPriority,
                doctorId,
                doctor_id: doctorId,
                clinicId,
                clinic_id: clinicId
            };

            const response = await diagnosisService.createDiagnosis(payload);
            const responseValue =
                response?.shortDescription ||
                response?.short_description ||
                trimmedShortDescription;
            const responseLabel =
                response?.diagnosisDescription ||
                response?.diagnosis_description ||
                trimmedDiagnosisDescription;
            const responseId = response?.id
                ? String(response.id)
                : `custom_${Date.now()}`;

            const newDiagnosis: DiagnosisRow = {
                id: responseId,
                value: responseValue,
                diagnosis: responseLabel,
                comment: '',
                priority: response?.priority ?? response?.priority_value ?? 999
            };

            // Check for duplicate diagnosis before adding (using functional update to get current state)
            let diagnosisAdded = false;
            setDiagnosisRows(prev => {
                // Check for duplicate by diagnosis name (case-insensitive)
                const existingDiagnosis = prev.find(
                    row => row.diagnosis?.toLowerCase().trim() === responseLabel.toLowerCase().trim()
                );

                if (existingDiagnosis) {
                    // Show error in snackbar instead of diagnosis error section
                    setSnackbarMessage(`Diagnosis "${responseLabel}" is already added.`);
                    setSnackbarOpen(true);
                    setDiagnosesError(null); // Clear any existing error
                    // Keep popup open by signalling failure to parent
                    diagnosisAdded = false;
                    return prev; // Return previous state without adding
                }

                diagnosisAdded = true; // Mark that diagnosis was successfully added
                const next = [...prev, newDiagnosis];
                // Sort by priority (lower priority number = higher priority)
                return next.sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
            });
            setDiagnosesOptions(prev => {
                const exists = prev.some(opt => opt.value === responseValue);
                if (exists) return prev;
                return [
                    ...prev,
                    {
                        value: responseValue,
                        label: responseLabel,
                        short_description: responseValue,
                        diagnosis_description: responseLabel
                    }
                ];
            });

            // Show success message when a new diagnosis was actually added
            if (diagnosisAdded) {
                setSnackbarMessage('Diagnosis added successfully!');
                setSnackbarOpen(true);
            }

            // Let popup know whether this was a success (true) or duplicate/error (false)
            return diagnosisAdded;
        } catch (error: any) {
            console.error('Failed to create diagnosis from Treatment screen:', error);
            setDiagnosesError(error?.message || 'Failed to create diagnosis. Please try again.');
        }
    };

    const handleAddCustomMedicine = () => {
        setShowMedicinePopup(true);
    };

    const handleSaveMedicine = (medicineData: MedicineData) => {
        const doctorId = treatmentData?.doctorId || sessionData?.doctorId;
        const clinicId = treatmentData?.clinicId || sessionData?.clinicId || '';

        if (!doctorId || !clinicId) {
            setMedicinesError('Doctor and clinic information are required to add a medicine.');
            return;
        }
        setMedicinesError(null);

        const trimmedShortDescription = medicineData.shortDescription?.trim() || '';
        const trimmedMedicineName = medicineData.medicineName?.trim() || trimmedShortDescription;
        const priorityValue = medicineData.priority ? parseInt(medicineData.priority, 10) : 0;
        const breakfastValue = medicineData.breakfast ? parseFloat(medicineData.breakfast) : 0;
        const lunchValue = medicineData.lunch ? parseFloat(medicineData.lunch) : 0;
        const dinnerValue = medicineData.dinner ? parseFloat(medicineData.dinner) : 0;

        const normalizedPriority = Number.isNaN(priorityValue) ? 0 : priorityValue;
        const normalizedBreakfast = Number.isNaN(breakfastValue) ? 0 : breakfastValue;
        const normalizedLunch = Number.isNaN(lunchValue) ? 0 : lunchValue;
        const normalizedDinner = Number.isNaN(dinnerValue) ? 0 : dinnerValue;

        const id = `custom_${Date.now()}`;
        const optionValue = trimmedShortDescription || id;
        const optionLabel = trimmedMedicineName || optionValue;

        const isActive = !!medicineData.addToActiveList;

        const newMedicine: MedicineRow = {
            id,
            medicine: `${trimmedMedicineName}${trimmedShortDescription ? ` (${trimmedShortDescription})` : ''}`,
            short_description: trimmedShortDescription || optionValue,
            morning: normalizedBreakfast,
            afternoon: normalizedLunch,
            b: medicineData.breakfast || String(normalizedBreakfast || ''),
            l: medicineData.lunch || String(normalizedLunch || ''),
            d: medicineData.dinner || String(normalizedDinner || ''),
            days: medicineData.days || '',
            instruction: medicineData.instruction || '',
            priority: normalizedPriority || 999
        };

        // Check for duplicate medicine before adding (using functional update to get current state)
        let medicineAdded = false;
        setMedicineRows(prev => {
            // Check for duplicate by short_description (case-insensitive)
            const existingMedicine = prev.find(
                row => row.short_description?.toLowerCase().trim() === trimmedShortDescription.toLowerCase().trim()
            );

            if (existingMedicine) {
                // Show error in snackbar instead of medicine error section
                setSnackbarMessage(`Medicine "${trimmedShortDescription}" is already added.`);
                setSnackbarOpen(true);
                setMedicinesError(null); // Clear any existing error
                return prev; // Return previous state without adding
            }

            medicineAdded = true; // Mark that medicine was successfully added
            const next = [...prev, newMedicine];
            // Sort by priority (lower priority number = higher priority)
            return next.sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
        });

        // Only add to search dropdown if user marked it as active and medicine was added
        if (isActive && medicineAdded) {
            setMedicinesOptions(prev => {
                const exists = prev.some(opt => opt.value === optionValue);
                if (exists) return prev;
                return [
                    ...prev,
                    {
                        value: optionValue,
                        label: optionLabel,
                        short_description: optionValue,
                        medicine_description: optionLabel,
                        morning: normalizedBreakfast,
                        afternoon: normalizedLunch,
                        priority_value: normalizedPriority,
                        active: true,
                        clinic_id: clinicId,
                        created_on: new Date().toISOString(),
                        modified_on: null
                    }
                ];
            });
        }

        setShowMedicinePopup(false);

        // Show success message after popup closes (only if medicine was actually added)
        if (medicineAdded) {
            setTimeout(() => {
                setSnackbarMessage('Medicine added successfully!');
                setSnackbarOpen(true);
            }, 100); // Small delay to ensure popup is closed
        }
    };

    const handleAddCustomPrescription = () => {
        setShowPrescriptionPopup(true);
    };

    const handleSavePrescription = async (prescriptionData: PrescriptionData) => {
        const doctorId = treatmentData?.doctorId || sessionData?.doctorId;
        const clinicIdForPayload = treatmentData?.clinicId || sessionData?.clinicId || "";

        if (!doctorId) {
            setSnackbarMessage("Doctor information is required to add a prescription.");
            setSnackbarOpen(true);
            return;
        }

        // Build payload for master Prescription API so it appears in search lists
        const payload: PrescriptionTemplateApiModel = {
            catShortName: prescriptionData.categoryName.trim(),
            catsubDescription: prescriptionData.subCategoryName.trim(),
            brandName: prescriptionData.brandName.trim(),
            medicineName: prescriptionData.genericName.trim(),
            clinicId: clinicIdForPayload,
            marketedBy: prescriptionData.marketedBy || "",
            priorityValue: prescriptionData.priority ? parseInt(prescriptionData.priority, 10) || 0 : 0,
            morning: prescriptionData.breakfast ? parseInt(prescriptionData.breakfast, 10) || 0 : 0,
            afternoon: prescriptionData.lunch ? parseInt(prescriptionData.lunch, 10) || 0 : 0,
            night: prescriptionData.dinner ? parseInt(prescriptionData.dinner, 10) || 0 : 0,
            noOfDays: prescriptionData.days ? parseInt(prescriptionData.days, 10) || 0 : 0,
            instruction: prescriptionData.instruction || "",
            doctorId,
            active: true,
        };

        try {
            // Persist in master table so it shows up on refresh/search screens
            await prescriptionDetailsService.createPrescription(payload);

            // Also add to current visit's prescription table
            const newPrescription: PrescriptionRow = {
                id: `custom_${Date.now()}`,
                prescription: prescriptionData.genericName || "",
                b: prescriptionData.breakfast,
                l: prescriptionData.lunch,
                d: prescriptionData.dinner,
                days: prescriptionData.days,
                instruction: prescriptionData.instruction || "",
            };

            setPrescriptionRows((prev) => [...prev, newPrescription]);
        } catch (error: any) {
            console.error("Failed to create prescription from Treatment screen:", error);
            setSnackbarMessage(error?.message || "Failed to create prescription. Please try again.");
            setSnackbarOpen(true);
        } finally {
            setShowPrescriptionPopup(false);
        }
    };

    const handleAddCustomTestLab = () => {
        setShowTestLabPopup(true);
    };

    const handleSaveTestLab = (testLabData: TestLabData): boolean => {
        const labTestName = testLabData.labTestName?.trim();
        if (!labTestName) {
            setInvestigationsError('Lab test name is required to add an investigation.');
            return false;
        }

        const normalizedName = labTestName;
        const normalizedNameLower = normalizedName.toLowerCase().trim();

        // Check for duplicate investigation before adding (check both table and dropdown options)
        const existingInTable = investigationRows.find(
            row => row.investigation?.toLowerCase().trim() === normalizedNameLower
        );

        // Check if it already exists in investigationsOptions (dropdown list) - prevent adding if it exists in dropdown
        const existingInOptions = investigationsOptions.find(
            opt => opt.label?.toLowerCase().trim() === normalizedNameLower ||
                opt.value?.toLowerCase().trim() === normalizedNameLower
        );

        if (existingInTable || existingInOptions) {
            const duplicateName = existingInTable?.investigation ||
                existingInOptions?.label ||
                normalizedName;
            setSnackbarMessage(`Investigation "${duplicateName}" is already added.`);
            setSnackbarOpen(true);
            setInvestigationsError(null);
            // Do NOT close popup here; signal to popup to stay open
            return false;
        }

        setInvestigationsError(null);

        // Check for duplicate investigation before adding (using functional update to get current state)
        let investigationAdded = false;
        setInvestigationRows(prev => {
            // Check for duplicate by investigation name (case-insensitive)
            const existingInvestigation = prev.find(
                row => row.investigation?.toLowerCase().trim() === normalizedNameLower
            );

            if (existingInvestigation) {
                // Show error in snackbar instead of investigation error section
                setSnackbarMessage(`Investigation "${normalizedName}" is already added.`);
                setSnackbarOpen(true);
                setInvestigationsError(null); // Clear any existing error
                // Keep popup open by not adding anything
                investigationAdded = false;
                return prev; // Return previous state without adding
            }

            investigationAdded = true; // Mark that investigation was successfully added
            const newRow: InvestigationRow = {
                id: `custom_inv_${Date.now()}`,
                investigation: normalizedName
            };
            return [...prev, newRow];
        });

        // Only add to options if investigation was actually added
        if (investigationAdded) {
            setInvestigationsOptions(prev => {
                const exists = prev.some(opt =>
                    opt.label?.toLowerCase() === normalizedNameLower ||
                    opt.value?.toLowerCase() === normalizedNameLower
                );
                if (exists) {
                    return prev;
                }
                const newOption: InvestigationOption = {
                    value: normalizedName,
                    label: normalizedName,
                    short_description: normalizedName,
                    description: normalizedName
                };
                return [...prev, newOption];
            });
        }

        // Show success message only if investigation was actually added
        if (investigationAdded) {
            setSnackbarMessage('Investigation added successfully!');
            setSnackbarOpen(true);
        }

        // Let popup know whether this was a success (true) or duplicate/error (false)
        return investigationAdded;
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
    }, opts?: { retries?: number; delayMs?: number }) => {
        try {
            // Add retry loop to tolerate eventual consistency after save
            const retries = Math.max(0, opts?.retries ?? 0);
            const delayMs = Math.max(0, opts?.delayMs ?? 0);
            let result: any = null;
            for (let attempt = 0; attempt <= retries; attempt++) {
                result = await visitService.getAppointmentDetails({
                    patientId: String(params.patientId),
                    doctorId: String(params.doctorId),
                    shiftId: Number(params.shiftId),
                    clinicId: String(params.clinicId),
                    patientVisitNo: Number(params.patientVisitNo),
                    languageId: params.languageId ?? 1
                });
                if (result && result.found && result.mainData && result.mainData.length > 0) {
                    break;
                }
                if (attempt < retries && delayMs > 0) {
                    await new Promise(res => setTimeout(res, delayMs));
                }
            }
            if (!result || !result.found || !result.mainData || result.mainData.length === 0) {
                return;
            }

            const appointmentData = result.mainData[0] || {};

            const normalized: any = {
                pulse: (appointmentData.pulse === 0 || appointmentData.pulse === '0') ? '' : (appointmentData.pulse ?? ''),
                height: (appointmentData.heightInCms === 0 || appointmentData.heightInCms === '0') ? '' : (appointmentData.heightInCms ?? ''),
                weight: (appointmentData.weightInKgs === 0 || appointmentData.weightInKgs === '0') ? '' : (appointmentData.weightInKgs ?? ''),
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
                followUpType: appointmentData.followUpType ?? appointmentData.followUp,
                billed: appointmentData.feesToCollect ?? appointmentData.fees ?? '',
                discount: appointmentData.discount ?? appointmentData.originalDiscount ?? '',
                feesPaid: appointmentData.feesPaid ?? 0,
                // Medical history checkboxes (handling spelling differences from API)
                hypertension: appointmentData.hypertension ?? false,
                diabetes: appointmentData.diabetes ?? false,
                cholesterol: appointmentData.cholestrol ?? false, // API uses "cholestrol"
                ihd: appointmentData.ihd ?? false,
                asthma: appointmentData.asthama ?? false, // API uses "asthama"
                th: appointmentData.th ?? false,
                smoking: appointmentData.smoking ?? false,
                tobacco: appointmentData.tobaco ?? false, // API uses "tobaco"
                alcohol: appointmentData.alchohol ?? false, // API uses "alchohol"
                // Additional fields
                pallorHb: appointmentData.pallor ?? '',
                detailedHistory: appointmentData.symptomComment ?? '',
                examinationFindings: appointmentData.observation ?? appointmentData.importantFindings ?? '',
                importantFindings: appointmentData.importantFindings ?? appointmentData.observation ?? '',
                additionalComments: appointmentData.additionalComments ?? appointmentData.impression ?? '',
                habitDetails: appointmentData.habitDetails ?? '',
                procedurePerformed: appointmentData.observation ?? '',
                dressingBodyParts: appointmentData.dressingBodyParts ?? appointmentData.dressing_body_parts ?? '',
                followUpComment: appointmentData.followUpComment ?? '',
                // Robust referral name extraction
                referralName: appointmentData.referralName ||
                    appointmentData.referral_name ||
                    appointmentData.ReferralName ||
                    appointmentData.Referral_Name ||
                    appointmentData.Refer_Doctor_Details ||
                    appointmentData.refer_doctor_details ||
                    appointmentData.referredBy ||
                    appointmentData.referred_by ||
                    appointmentData.Referred_By ||
                    appointmentData.referred_to ||
                    appointmentData.referalName ||
                    appointmentData.ReferalName || '',
                referralCode: appointmentData.referBy ||
                    appointmentData.refer_by ||
                    appointmentData.refer_id ||
                    appointmentData.Refer_By ||
                    appointmentData.referredBy ||
                    appointmentData.referred_by || ''
            };

            // Sync treatmentData with fetched details so header display is correct
            setTreatmentData(prev => ({
                ...prev,
                ...normalized,
                // Ensure referBy/referralCode is preserved
                referralCode: normalized.referralCode,
                referralName: normalized.referralName,
                referBy: normalized.referralCode // canonical field name often used
            }));

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
                maybeSet('pallorHb', normalized.pallorHb);
                maybeSet('detailedHistory', normalized.detailedHistory);
                maybeSet('examinationFindings', normalized.examinationFindings);
                maybeSet('importantFindings', normalized.importantFindings);
                maybeSet('additionalComments', normalized.additionalComments);
                maybeSet('medicalHistoryText', normalized.habitDetails);
                maybeSet('procedurePerformed', normalized.procedurePerformed);
                maybeSet('dressingBodyParts', normalized.dressingBodyParts);

                // Patch referral name
                if (normalized.referralName) {
                    next.referralBy = normalized.referralName;
                }

                // Do not patch PC with complaints fetched from appointment details

                const heightNum = parseFloat(String(next.height));
                const weightNum = parseFloat(String(next.weight));
                if (!isNaN(heightNum) && heightNum > 0 && !isNaN(weightNum) && weightNum > 0) {
                    next.bmi = (weightNum / ((heightNum / 100) * (heightNum / 100))).toFixed(1);
                }

                // Patch medical history checkboxes
                if (next.medicalHistory) {
                    next.medicalHistory = {
                        ...(next.medicalHistory || {}),
                        hypertension: typeof normalized.hypertension === 'boolean' ? normalized.hypertension : (next.medicalHistory?.hypertension ?? false),
                        diabetes: typeof normalized.diabetes === 'boolean' ? normalized.diabetes : (next.medicalHistory?.diabetes ?? false),
                        cholesterol: typeof normalized.cholesterol === 'boolean' ? normalized.cholesterol : (next.medicalHistory?.cholesterol ?? false),
                        ihd: typeof normalized.ihd === 'boolean' ? normalized.ihd : (next.medicalHistory?.ihd ?? false),
                        asthma: typeof normalized.asthma === 'boolean' ? normalized.asthma : (next.medicalHistory?.asthma ?? false),
                        th: typeof normalized.th === 'boolean' ? normalized.th : (next.medicalHistory?.th ?? false),
                        smoking: typeof normalized.smoking === 'boolean' ? normalized.smoking : (next.medicalHistory?.smoking ?? false),
                        tobacco: typeof normalized.tobacco === 'boolean' ? normalized.tobacco : (next.medicalHistory?.tobacco ?? false),
                        alcohol: typeof normalized.alcohol === 'boolean' ? normalized.alcohol : (next.medicalHistory?.alcohol ?? false)
                    };
                } else {
                    next.medicalHistory = {
                        hypertension: normalized.hypertension ?? false,
                        diabetes: normalized.diabetes ?? false,
                        cholesterol: normalized.cholesterol ?? false,
                        ihd: normalized.ihd ?? false,
                        asthma: normalized.asthma ?? false,
                        th: normalized.th ?? false,
                        smoking: normalized.smoking ?? false,
                        tobacco: normalized.tobacco ?? false,
                        alcohol: normalized.alcohol ?? false
                    };
                }

                // Patch visitType flags if present
                if (typeof normalized.inPerson === 'boolean' || typeof normalized.followUpFlag === 'boolean' || normalized.followUpFlag !== undefined || typeof normalized.followUpType === 'string') {
                    // Handle followUpFlag: convert to boolean if needed (handles true, "true", 1, etc.)
                    let followUpValue = false;
                    if (normalized.followUpFlag !== undefined && normalized.followUpFlag !== null) {
                        if (typeof normalized.followUpFlag === 'boolean') {
                            followUpValue = normalized.followUpFlag;
                        } else if (typeof normalized.followUpFlag === 'string') {
                            followUpValue = normalized.followUpFlag.toLowerCase() === 'true' || normalized.followUpFlag === '1';
                        } else if (typeof normalized.followUpFlag === 'number') {
                            followUpValue = normalized.followUpFlag === 1;
                        }
                    }

                    // Determine inPerson value
                    let computedInPerson = next.visitType?.inPerson ?? true; // Default to current value or true

                    // Get status from appointment data
                    const status = appointmentData.status || appointmentData.statusDescription || '';
                    const normalizedStatus = String(status).trim().toUpperCase();
                    const finalStatus = normalizedStatus === 'ON CALL' ? 'CONSULT ON CALL' : normalizedStatus;

                    // Only patch inPerson if status is "SAVED" or "WAITING FOR MEDICINE"
                    const shouldPatchInPerson = finalStatus === 'SAVE' ||
                        finalStatus === 'WAITING FOR MEDICINE' ||
                        finalStatus === 'WAITINGFOR MEDICINE' ||
                        finalStatus === 'WAITINGFORMEDICINE';

                    if (shouldPatchInPerson && typeof normalized.inPerson === 'boolean') {
                        // Patch with the actual value from API (true or false)
                        computedInPerson = normalized.inPerson;
                        console.log('Patching inPerson from API for status', finalStatus, ':', computedInPerson);
                    } else if (!shouldPatchInPerson) {
                        // For other statuses, compute based on status logic
                        if (finalStatus === 'CONSULT ON CALL' || (finalStatus !== 'WAITING' && finalStatus !== 'WITH DOCTOR')) {
                            computedInPerson = false;
                        } else if (finalStatus === 'WAITING' || finalStatus === 'WITH DOCTOR') {
                            computedInPerson = true;
                        }
                    }

                    next.visitType = {
                        ...(next.visitType || {}),
                        inPerson: computedInPerson,
                        followUp: normalized.followUpFlag !== undefined ? followUpValue : (next.visitType?.followUp ?? false)
                    };
                }
                console.log('Patched Treatment formData with appointment details:', next);
                return next;
            });

            // Patch billing fields based on appointment details
            // try {
            //     const billedNum = parseFloat(String(normalized.billed || '')) || 0;
            //     const discountNum = parseFloat(String(normalized.discount || '')) || 0;
            //     const paidNum = parseFloat(String(normalized.feesPaid || '')) || 0;
            //     const duesNum = Math.max(0, billedNum - discountNum - paidNum);
            //     setBillingData(prev => ({
            //         ...prev,
            //         billed: billedNum ? String(billedNum) : (prev.billed || ''),
            //         discount: String(discountNum),
            //         dues: String(duesNum),
            //         acBalance: prev.acBalance // keep previous if not provided by API
            //     }));
            //     console.log('Patched billingData from appointment details:', { billed: billedNum, discount: discountNum, feesPaid: paidNum, dues: duesNum });
            // } catch (billingPatchError) {
            //     console.warn('Could not patch billing data from appointment details:', billingPatchError);
            // }

            // Patch followUpData with followUpComment from API
            if (normalized.followUpComment && normalized.followUpComment !== '') {
                setFollowUpData(prev => ({
                    ...prev,
                    followUp: String(normalized.followUpComment)
                }));
                console.log('Patched followUpData.followUp from appointment details:', normalized.followUpComment);
            }

            // Patch followUpData.followUpType from API (should be 1 for "New" or 2 for "Follow-up")
            if (normalized.followUpType !== undefined && normalized.followUpType !== null && normalized.followUpType !== '') {
                const followUpTypeValue = String(normalized.followUpType).trim();
                // Map API value to dropdown ID: 1 -> "1" (New), 2 -> "2" (Follow-up)
                // Also handle string representations like "N" for New, "F" for Follow-up
                let followUpTypeId = '';
                const numValue = parseInt(followUpTypeValue, 10);
                if (numValue === 1 || followUpTypeValue.toUpperCase() === 'N' || followUpTypeValue === 'New') {
                    followUpTypeId = '1';
                } else if (numValue === 2 || followUpTypeValue.toUpperCase() === 'F' || followUpTypeValue === 'Follow-up' || followUpTypeValue === 'Followup') {
                    followUpTypeId = '2';
                }

                if (followUpTypeId) {
                    setFollowUpData(prev => ({
                        ...prev,
                        followUpType: followUpTypeId
                    }));
                    console.log('Patched followUpData.followUpType from appointment details:', followUpTypeId, '(original:', normalized.followUpType, ')');
                }
            }

            // Patch Plan/Adv textarea using instructions payload (prefer plain text over arrays)
            const resolvePlanAdvText = () => {
                const candidates = [
                    appointmentData.instructionsText,
                    appointmentData.InstructionsText,
                    appointmentData.plan,
                    appointmentData.planAdv,
                    typeof appointmentData.instructions === 'string' ? appointmentData.instructions : null,
                    typeof appointmentData.Instructions === 'string' ? appointmentData.Instructions : null
                ];
                for (const candidate of candidates) {
                    if (candidate !== null && candidate !== undefined) {
                        const text = String(candidate).trim();
                        if (text.length > 0) {
                            return text;
                        }
                    }
                }
                return '';
            };
            const planAdvText = resolvePlanAdvText();
            if (planAdvText) {
                setFollowUpData(prev => ({
                    ...prev,
                    planAdv: planAdvText
                }));
            }

            // Patch Remark Comments using additional instruction fields
            const remarkSource = appointmentData.additionalInstructions
                ?? appointmentData.additionalInstruction
                ?? appointmentData.remarkComments
                ?? appointmentData.remarks
                ?? appointmentData.remark;
            if (remarkSource && remarkSource !== '') {
                setFollowUpData(prev => ({
                    ...prev,
                    remarkComments: String(remarkSource)
                }));
            }

            // Load complaints rows from API response (support multiple shapes)
            // Skip if we just loaded from save response to prevent overwriting deletions
            if (!complaintsRowsLoadedFromSaveResponseRef.current) {
                const complaintsSource = Array.isArray(appointmentData.complaintsRows)
                    ? appointmentData.complaintsRows
                    : (Array.isArray(appointmentData.complaints) ? appointmentData.complaints : null);
                if (complaintsSource && complaintsSource.length > 0) {
                    const mappedComplaintsRows: ComplaintRow[] = complaintsSource.map((row: any, index: number) => {
                        let value = row.value || row.complaint_description || row.short_description || row.complaint || '';
                        let label = row.label || row.complaint_description || row.complaint || row.short_description || '';
                        let comment = row.comment || row.complaint_comment || row.duration || '';

                        // Attempt to parse "Name (Comment)" format if present in value/label and comment is empty
                        // OR if value/label contains parenthesis
                        const parseString = (str: string) => {
                            const match = str.match(/^(.*?)(?:\s*\((.*)\))?$/);
                            if (match && match[2]) {
                                return { name: match[1].trim(), comment: match[2].trim() };
                            }
                            return null;
                        };

                        const parsedValue = parseString(value);
                        if (parsedValue) {
                            value = parsedValue.name;
                            if (!comment) comment = parsedValue.comment;
                        }

                        const parsedLabel = parseString(label);
                        if (parsedLabel) {
                            label = parsedLabel.name;
                            if (!comment) comment = parsedLabel.comment;
                        }

                        const opt = complaintsOptions.find(o => o.value === value);
                        return {
                            id: `complaint-${index}-${Date.now()}`,
                            value,
                            label: label,
                            comment: comment,
                            priority: opt?.priority ?? opt?.priority_value ?? row.priority ?? row.priority_value ?? 999
                        };
                    });
                    // Sort by priority (lower priority number = higher priority)
                    const sortedRows = mappedComplaintsRows.sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
                    setComplaintsRows(sortedRows);
                    complaintsRowsBuiltFromApiRef.current = true; // Mark as built from API
                    console.log('Loaded complaints rows from API (parsed):', mappedComplaintsRows);
                } else if (Array.isArray(complaintsSource)) {
                    // Empty array - clear existing rows
                    setComplaintsRows([]);
                    complaintsRowsBuiltFromApiRef.current = false; // Reset flag
                }
            } else {
                console.log('Skipping complaints rows reload - already loaded from save response');
                // Reset the flag after skipping so future loads work normally
                complaintsRowsLoadedFromSaveResponseRef.current = false;
            }

            // Update complaint selections if available (for dropdown display)
            // Update complaint selections if available (for dropdown display)
            if (normalized.currentComplaint && typeof normalized.currentComplaint === 'string') {
                const raw = normalized.currentComplaint.trim();

                if (raw) {
                    // Regex to split by comma but ignore commas inside parentheses
                    const parts = raw.split(/,(?![^(]*\))/).map((s: string) => s.trim()).filter(Boolean);

                    if (parts.length > 0) {
                        const foundValues: string[] = [];
                        const foundRows: ComplaintRow[] = [];
                        const seen = new Set<string>();

                        parts.forEach((fullString: string, index: number) => {
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
                                    id: `complaint-parsed-${index}-${Date.now()}`,
                                    value: matchedOption.value,
                                    label: matchedOption.label,
                                    comment: commentPart,
                                    priority: matchedOption.priority ?? matchedOption.priority_value ?? 999
                                });
                            } else if (!matchedOption && namePart) {
                                // Use name as value if not found in options (fallback)
                                if (!seen.has(namePart)) {
                                    seen.add(namePart);
                                    foundValues.push(namePart);
                                    foundRows.push({
                                        id: `complaint-parsed-${index}-${Date.now()}`,
                                        value: namePart,
                                        label: namePart,
                                        comment: commentPart,
                                        priority: 999
                                    });
                                }
                            }
                        });

                        if (foundValues.length > 0) {
                            selectedComplaintsPatchedFromApiRef.current = true;
                            setSelectedComplaints(foundValues);
                            setComplaintsRows(foundRows);
                            console.log('Patched selectedComplaints from appointment details (parsed):', foundValues);
                        }
                    }
                }
            }

            // Load diagnosis rows from API response (support multiple shapes)
            // Skip if we just loaded from save response to prevent overwriting deletions
            if (!diagnosisRowsLoadedFromSaveResponseRef.current) {
                const diagnosisSource = Array.isArray(appointmentData.diagnosisRows)
                    ? appointmentData.diagnosisRows
                    : (Array.isArray(appointmentData.diagnosis) ? appointmentData.diagnosis : null);
                if (diagnosisSource && diagnosisSource.length > 0) {
                    const mappedDiagnosisRows: DiagnosisRow[] = diagnosisSource.map((row: any, index: number) => {
                        const value = row.short_description || row.diagnosis_description || row.desease_description || '';
                        const opt = diagnosesOptions.find(o => o.value === value);
                        return {
                            id: `diag-${index}-${Date.now()}`,
                            value,
                            diagnosis: row.diagnosis || row.desease_description || row.diagnosis_description || '',
                            comment: '',
                            priority: opt?.priority ?? opt?.priority_value ?? row.priority ?? row.priority_value ?? 999
                        };
                    });
                    // Sort by priority (lower priority number = higher priority)
                    const sortedRows = mappedDiagnosisRows.sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
                    setDiagnosisRows(sortedRows);
                    console.log('Loaded diagnosis rows from API:', mappedDiagnosisRows);
                } else if (Array.isArray(diagnosisSource)) {
                    // Empty array - clear existing rows
                    setDiagnosisRows([]);
                }
            } else {
                console.log('Skipping diagnosis rows reload - already loaded from save response');
                diagnosisRowsLoadedFromSaveResponseRef.current = false;
            }

            // Load medicine rows from API response (support multiple shapes)
            // Skip if we just loaded from save response to prevent overwriting deletions
            if (!medicineRowsLoadedFromSaveResponseRef.current) {
                const medicineSource = Array.isArray(appointmentData.medicineRows)
                    ? appointmentData.medicineRows
                    : (Array.isArray(appointmentData.medicines) ? appointmentData.medicines : null);
                if (medicineSource && medicineSource.length > 0) {
                    const mappedMedicineRows: MedicineRow[] = medicineSource.map((row: any, index: number) => {
                        const shortDesc = row.short_description || row.medicine_description || '';
                        const opt = medicinesOptions.find(o => o.short_description === shortDesc);
                        // Handle various field name variations from API
                        const morning = row.morning ?? row.morning_value ?? 0;
                        const afternoon = row.afternoon ?? row.afternoon_value ?? 0;
                        const night = row.night ?? row.night_value ?? row.d ?? 0;
                        const days = row.days ?? row.no_of_days ?? row.days_value ?? '';
                        const instruction = row.instruction ?? row.medicine_instruction ?? '';
                        return {
                            id: `med-${index}-${Date.now()}`,
                            medicine: row.medicine || row.medicine_description || row.short_description || '',
                            short_description: shortDesc,
                            morning: morning,
                            afternoon: afternoon,
                            b: String(morning || ''),
                            l: String(afternoon || ''),
                            d: String(night || ''),
                            days: String(days || ''),
                            instruction: instruction,
                            priority: opt?.priority ?? opt?.priority_value ?? row.priority ?? row.priority_value ?? 999
                        };
                    });
                    // Sort by priority (lower priority number = higher priority)
                    const sortedRows = mappedMedicineRows.sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
                    setMedicineRows(sortedRows);
                    console.log('Loaded medicine rows from API:', mappedMedicineRows);
                } else if (Array.isArray(medicineSource)) {
                    setMedicineRows([]);
                }
            } else {
                console.log('Skipping medicine rows reload - already loaded from save response');
                medicineRowsLoadedFromSaveResponseRef.current = false;
            }

            // Load prescription rows from API response (support multiple shapes)
            // Skip if we just loaded from save response to prevent overwriting deletions
            if (!prescriptionRowsLoadedFromSaveResponseRef.current) {
                const prescriptionSource = Array.isArray(appointmentData.prescriptionRows)
                    ? appointmentData.prescriptionRows
                    : (Array.isArray(appointmentData.prescriptions) ? appointmentData.prescriptions : null);
                if (prescriptionSource && prescriptionSource.length > 0) {
                    const mappedPrescriptionRows: PrescriptionRow[] = prescriptionSource.map((row: any, index: number) => ({
                        id: `pres-${index}-${Date.now()}`,
                        prescription: row.prescription || `${row.brand_name || ''} ${row.medicine_name || ''}`.trim() || row.medicine_description || row.short_description || '',
                        b: String(row.b || row.morning || ''),
                        l: String(row.l || row.afternoon || ''),
                        d: String(row.d || row.night || ''),
                        days: String(row.days || row.no_of_days || ''),
                        instruction: row.instruction || ''
                    }));
                    setPrescriptionRows(mappedPrescriptionRows);
                    console.log('Loaded prescription rows from API:', mappedPrescriptionRows);
                } else if (Array.isArray(prescriptionSource)) {
                    setPrescriptionRows([]);
                }
            } else {
                console.log('Skipping prescription rows reload - already loaded from save response');
                prescriptionRowsLoadedFromSaveResponseRef.current = false;
            }

            // Load investigation rows from API response (support multiple shapes)
            // Skip if we just loaded from save response to prevent overwriting deletions
            if (!investigationRowsLoadedFromSaveResponseRef.current) {
                const investigationSource = Array.isArray(appointmentData.investigationRows)
                    ? appointmentData.investigationRows
                    : (Array.isArray(appointmentData.investigations) ? appointmentData.investigations : null);
                if (investigationSource && investigationSource.length > 0) {
                    const mappedInvestigationRows: InvestigationRow[] = investigationSource.map((row: any, index: number) => ({
                        id: `inv-${index}-${Date.now()}`,
                        investigation: row.investigation || row.lab_test_description || row.id || ''
                    }));
                    setInvestigationRows(mappedInvestigationRows);
                    console.log('Loaded investigation rows from API:', mappedInvestigationRows);
                } else if (Array.isArray(investigationSource)) {
                    setInvestigationRows([]);
                }
            } else {
                console.log('Skipping investigation rows reload - already loaded from save response');
                investigationRowsLoadedFromSaveResponseRef.current = false;
            }

            // Update treatmentData status if available from appointment data
            if (appointmentData.status || appointmentData.statusDescription) {
                const status = String(appointmentData.status || appointmentData.statusDescription || '').trim();
                const statusId = appointmentData.statusId || appointmentData.status_id;
                setTreatmentData(prev => {
                    const status = String(appointmentData.status || appointmentData.statusDescription || (prev?.status || '')).trim();
                    const statusId = appointmentData.statusId || appointmentData.status_id || prev?.statusId;
                    const referralName = appointmentData.referralName ||
                        appointmentData.referral_name ||
                        appointmentData.ReferralName ||
                        appointmentData.Refer_Doctor_Details ||
                        appointmentData.refer_doctor_details ||
                        appointmentData.referredBy ||
                        appointmentData.referred_by ||
                        appointmentData.Referred_By ||
                        (prev?.referralName || '');

                    const referralCode = appointmentData.referBy ||
                        appointmentData.refer_by ||
                        appointmentData.refer_id ||
                        appointmentData.Refer_By ||
                        appointmentData.referredBy ||
                        appointmentData.referred_by ||
                        (prev?.referralCode || '');

                    if (prev && (prev.status !== status || prev.statusId !== statusId || prev.referralName !== referralName || prev.referralCode !== referralCode)) {
                        return {
                            ...prev,
                            status: status,
                            statusId: statusId,
                            referralName: referralName,
                            referralCode: referralCode
                        };
                    }
                    return prev;
                });
                console.log('Updated treatmentData status:', status, 'statusId:', statusId);
            }

            console.log('=== FINISHED PATCHING FROM APPOINTMENT DETAILS ===');

            // Automate Follow-Up checkbox state based on visit history
            // We do this here as part of the initial data fetch flow
            if (params.patientId) {
                try {
                    const history = await visitService.getPatientVisitHistory(String(params.patientId));
                    if (history && history.visits && Array.isArray(history.visits)) {
                        // Check if any visit has statusId === 5 (Visited/Completed)
                        const hasVisitedStatus = history.visits.some((v: any) => {
                            const sid = v.statusId ?? v.status_id ?? v.visitStatusId;
                            return Number(sid) === 5;
                        });

                        if (hasVisitedStatus) {
                            setFormData(prev => ({
                                ...prev,
                                visitType: {
                                    ...prev.visitType,
                                    followUp: true
                                }
                            }));
                            setFollowUpData(prev => ({ ...prev, followUpType: '2' }));
                            console.log('Updated Follow-up to TRUE based on visit history (found completed visit)');
                        } else {
                            setFormData(prev => ({
                                ...prev,
                                visitType: {
                                    ...prev.visitType,
                                    followUp: false
                                }
                            }));
                            setFollowUpData(prev => ({ ...prev, followUpType: '1' }));
                            console.log('Updated Follow-up to FALSE based on visit history (no completed visit)');
                        }
                    }
                } catch (historyError) {
                    console.error('Failed to check visit history for follow-up status in fetchAndPatch:', historyError);
                }
            }

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
            setIsSubmitting(true);
            setSnackbarOpen(false);
            setSnackbarMessage('');

            // Fetch session data for dynamic values if not already available
            let currentSessionData = sessionData;
            if (!currentSessionData) {
                try {
                    const sessionResult = await sessionService.getSessionInfo();
                    if (sessionResult.success) {
                        currentSessionData = sessionResult.data;
                    }
                } catch (sessionError) {
                    console.warn('Could not load session data:', sessionError);
                }
            }

            // Validate required fields are present
            const doctorId = treatmentData?.doctorId || currentSessionData?.doctorId;
            const clinicId = treatmentData?.clinicId || currentSessionData?.clinicId;
            // Get shiftId from session, must be numeric - never use clinicId as fallback since it's not numeric (e.g., "CL-00001")
            const shiftId = (currentSessionData as any)?.shiftId || 1;
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

            // Explicit Character Length Validation
            const validationErrors: string[] = [];

            // Check the real-time errors state first (from handleInputChange)
            const errorKeys = Object.keys(errors);
            if (errorKeys.length > 0) {
                setSnackbarMessage('Please fill all required fields');
                setSnackbarOpen(true);
                setIsSubmitting(false);
                return;
            }

            const checkLength = (value: any, maxLength: number, fieldName: string) => {
                if (value && String(value).length > maxLength) {
                    validationErrors.push(`${fieldName} exceeds maximum length of ${maxLength} characters`);
                }
            };

            // Main fields
            checkLength(formData.allergy, 500, 'Allergy');
            checkLength(formData.medicalHistoryText, 1000, 'Medical History');
            checkLength(formData.surgicalHistory, 1000, 'Surgical History');
            checkLength(formData.medicines, 1000, 'Medicines');
            checkLength(formData.visitComments, 1000, 'Visit Comments');
            checkLength(formData.pc, 400, 'PC');

            // Vitals
            checkLength(formData.bp, 10, 'BP');
            checkLength(formData.sugar, 25, 'Sugar');
            checkLength(formData.tft, 25, 'TFT');
            checkLength(formData.pallorHb, 25, 'Pallor/HB');
            checkLength(formData.pulse, 5, 'Pulse');
            checkLength(formData.height, 10, 'Height');
            checkLength(formData.weight, 10, 'Weight');

            // Follow-up
            checkLength(followUpData.planAdv, 1000, 'Plan / Advice');
            checkLength(followUpData.planAdv, 1000, 'Plan / Advice');
            checkLength(followUpData.remarkComments, 1000, 'Remark');

            if (followUpData.remarkComments && followUpData.remarkComments.length >= 1000) {
                setRemarkCommentsError('Remark cannot exceed 1000 characters');
                validationErrors.push('Remark cannot exceed 1000 characters');
            }

            if (prescriptionInput && prescriptionInput.length >= 200) {
                setPrescriptionError('Prescription cannot exceed 200 characters');
                validationErrors.push('Prescription cannot exceed 200 characters');
            }
            checkLength(followUpData.followUp, 100, 'Follow-up');

            // Rows validation
            medicineRows.forEach((row, idx) => {
                const prefix = `Medicine Row ${idx + 1}`;
                checkLength(row.b, 10, `${prefix} Morning`);
                checkLength(row.l, 10, `${prefix} Afternoon`);
                checkLength(row.d, 10, `${prefix} Night`);
                checkLength(row.days, 10, `${prefix} Days`);
                checkLength(row.instruction, 4000, `${prefix} Instruction`);
            });

            prescriptionRows.forEach((row, idx) => {
                const prefix = `Prescription Row ${idx + 1}`;
                checkLength(row.b, 10, `${prefix} B`);
                checkLength(row.l, 10, `${prefix} L`);
                checkLength(row.d, 10, `${prefix} D`);
                checkLength(row.days, 10, `${prefix} Days`);
                checkLength(row.instruction, 4000, `${prefix} Instruction`);
            });

            if (validationErrors.length > 0) {
                const firstError = validationErrors[0];
                setSnackbarMessage(firstError);
                setSnackbarOpen(true);
                setIsSubmitting(false);
                return;
            }

            // Map form data to API request format
            const visitData: ComprehensiveVisitDataRequest = {
                // Required fields - using validated values
                patientId: treatmentData?.patientId?.toString() || '',
                doctorId: String(doctorId),
                clinicId: String(clinicId),
                shiftId: String(shiftId || 1), // Convert to string - must be numeric (backend parses as Short)
                visitDate: `${toYyyyMmDd(new Date())} ${new Date().toTimeString().slice(0, 8)}`,
                patientVisitNo: String(patientVisitNo || 0), // Convert to string

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
                instructions: followUpData.planAdv ? String(followUpData.planAdv) : '',
                additionalInstructions: followUpData.remarkComments ? String(followUpData.remarkComments) : '',

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
                habitDetails: formData.medicalHistoryText || '',
                allergyDetails: formData.allergy,
                observation: formData.procedurePerformed || '',
                dressingBodyParts: formData.dressingBodyParts || '',
                inPerson: formData.visitType.inPerson, // Use form state value
                symptomComment: formData.detailedHistory,
                reason: '',
                impression: formData.additionalComments,
                attendedBy: '',
                paymentById: 1,
                paymentRemark: '',
                attendedById: 0,
                followUp: followUpData.followUpType ? String(followUpData.followUpType).charAt(0) : 'N', // First character of followUpType or 'N'
                followUpFlag: formData.visitType.followUp,
                currentComplaint: Array.from(new Set(selectedComplaints)).join(','),
                visitCommentsField: formData.visitComments,

                // Clinical fields
                tpr: '',
                importantFindings: formData.importantFindings,
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
                statusId: isSubmit ? 4 : 9, // Status 6 for submit (SUBMITTED), Status 9 for save
                userId: String(userId),
                isSubmitPatientVisitDetails: isSubmit, // true for submit, false for save

                // Complaints rows - map to API format
                complaintsRows: complaintsRows.map(row => {
                    // Extract short_description: if value contains "*", take the part before "*"
                    // Otherwise, use value or label as short_description
                    let shortDescription = '';
                    if (row.value && row.value.includes('*')) {
                        shortDescription = row.value.split('*')[0].trim();
                    } else {
                        shortDescription = row.value || row.label || '';
                    }

                    return {
                        short_description: shortDescription,
                        complaint_description: row.label || '',
                        complaint_comment: row.comment || ''
                    };
                }),

                // Diagnosis rows - minimal API shape
                diagnosisRows: diagnosisRows.map(row => ({
                    short_description: row.value || '',
                    diagnosis: row.diagnosis || ''
                })),

                // Medicine rows - map to API format (ensure numeric days)
                medicineRows: medicineRows.map(row => {
                    // Use user input values (b, l, d) instead of default morning/afternoon values
                    let morning = 0;
                    if (row.b && !isNaN(parseFloat(row.b))) {
                        morning = parseFloat(row.b) || 0;
                    } else if (row.morning) {
                        morning = row.morning;
                    }

                    let afternoon = 0;
                    if (row.l && !isNaN(parseFloat(row.l))) {
                        afternoon = parseFloat(row.l) || 0;
                    } else if (row.afternoon) {
                        afternoon = row.afternoon;
                    }

                    let night = 0;
                    if (row.d && !isNaN(parseFloat(row.d))) {
                        night = parseFloat(row.d) || 0;
                    }

                    const daysNum = isNaN(Number(row.days)) ? 0 : Number(row.days);
                    return {
                        short_description: row.short_description || '',
                        medicine: row.medicine || '',
                        morning: morning,
                        afternoon: afternoon,
                        night: night,
                        days: daysNum,
                        instruction: row.instruction || ''
                    };
                }),

                // Prescription rows - numeric b/l/d/days
                prescriptionRows: prescriptionRows.map(row => ({
                    prescription: row.prescription || '',
                    b: isNaN(Number(row.b)) ? 0 : Number(row.b),
                    l: isNaN(Number(row.l)) ? 0 : Number(row.l),
                    d: isNaN(Number(row.d)) ? 0 : Number(row.d),
                    days: isNaN(Number(row.days)) ? 0 : Number(row.days),
                    instruction: row.instruction || ''
                })),

                // Investigation rows - map to API format
                investigationRows: investigationRows.map(row => ({
                    investigation: row.investigation || ''
                })),

                // Instruction groups - map to API format
                // Backend expects: groupDescription, instructionsDescription, sequenceNo
                // Table: visit_groups_instructions
                instructionGroups: selectedInstructionGroups.length > 0
                    ? selectedInstructionGroups.map((group, index) => {
                        // Ensure we're using clean normalized data
                        const cleanGroup = normalizeInstructionGroup(group);
                        const mapped = {
                            groupDescription: cleanGroup.name || '',
                            instructionsDescription: cleanGroup.instructions || '',
                            sequenceNo: index + 1
                        };
                        console.log(`Instruction Group ${index + 1} mapped to backend:`, {
                            cleanGroup: cleanGroup,
                            mapped: mapped
                        });
                        return mapped;
                    })
                    : []
            };

            if (visitData.instructionGroups && visitData.instructionGroups.length > 0) {

                visitData.instructionGroups.forEach((ig, idx) => {
                    console.log(`Backend Instruction Group ${idx + 1}:`, {
                        groupDescription: ig.groupDescription,
                        instructionsDescription: ig.instructionsDescription,
                        sequenceNo: ig.sequenceNo
                    });
                });
            } else {
                console.warn('⚠️ NO INSTRUCTION GROUPS IN REQUEST! selectedInstructionGroups:', JSON.stringify(selectedInstructionGroups, null, 2));
            }

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

            const result = await visitService.saveComprehensiveVisitData(visitData);

            if (result.success) {
                setSnackbarMessage(`Treatment ${isSubmit ? 'submitted' : 'saved'} successfully!`);
                setSnackbarOpen(true);

                // Load rows directly from save response if available
                // Load complaints rows from save response first (to preserve deletions)
                if (result.complaintsRows && Array.isArray(result.complaintsRows)) {
                    if (result.complaintsRows.length > 0) {
                        const mappedComplaintsRows: ComplaintRow[] = result.complaintsRows.map((row: any, index: number) => {
                            const value = row.value || row.complaint_description || row.short_description || row.complaint || '';
                            const opt = complaintsOptions.find(o => o.value === value);
                            return {
                                id: `complaint-${index}-${Date.now()}`,
                                value,
                                label: row.label || row.complaint_description || row.complaint || row.short_description || '',
                                comment: row.comment || row.complaint_comment || row.duration || '',
                                priority: opt?.priority ?? opt?.priority_value ?? row.priority ?? row.priority_value ?? 999
                            };
                        });
                        // Sort by priority (lower priority number = higher priority)
                        const sortedRows = mappedComplaintsRows.sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
                        setComplaintsRows(sortedRows);
                        complaintsRowsBuiltFromApiRef.current = true; // Mark as built from API
                        complaintsRowsLoadedFromSaveResponseRef.current = true; // Mark as loaded from save response
                    } else {
                        // Empty array - clear existing rows
                        setComplaintsRows([]);
                        complaintsRowsBuiltFromApiRef.current = false;
                        complaintsRowsLoadedFromSaveResponseRef.current = true; // Mark as loaded from save response (even if empty)
                    }
                }

                // Load diagnosis rows from save response (to preserve deletions)
                if (result.diagnosisRows && Array.isArray(result.diagnosisRows)) {
                    if (result.diagnosisRows.length > 0) {
                        const mappedDiagnosisRows: DiagnosisRow[] = result.diagnosisRows.map((row: any, index: number) => {
                            const value = row.short_description || '';
                            const opt = diagnosesOptions.find(o => o.value === value);
                            return {
                                id: `diag-${index}-${Date.now()}`,
                                value,
                                diagnosis: row.diagnosis || row.desease_description || '',
                                comment: '',
                                priority: opt?.priority ?? opt?.priority_value ?? row.priority ?? row.priority_value ?? 999
                            };
                        });
                        // Sort by priority (lower priority number = higher priority)
                        const sortedRows = mappedDiagnosisRows.sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
                        setDiagnosisRows(sortedRows);
                        diagnosisRowsLoadedFromSaveResponseRef.current = true;
                    } else {
                        // Empty array - clear existing rows
                        setDiagnosisRows([]);
                        diagnosisRowsLoadedFromSaveResponseRef.current = true;
                    }
                }

                // Load medicine rows from save response (to preserve deletions)
                if (result.medicineRows && Array.isArray(result.medicineRows)) {
                    if (result.medicineRows.length > 0) {
                        const mappedMedicineRows: MedicineRow[] = result.medicineRows.map((row: any, index: number) => {
                            const shortDesc = row.short_description || '';
                            const opt = medicinesOptions.find(o => o.short_description === shortDesc);
                            // Handle various field name variations from API
                            const morning = row.morning ?? row.morning_value ?? 0;
                            const afternoon = row.afternoon ?? row.afternoon_value ?? 0;
                            const night = row.night ?? row.night_value ?? row.d ?? 0;
                            const days = row.days ?? row.no_of_days ?? row.days_value ?? '';
                            const instruction = row.instruction ?? row.medicine_instruction ?? '';
                            return {
                                id: `med-${index}-${Date.now()}`,
                                medicine: row.medicine || row.medicine_description || '',
                                short_description: shortDesc,
                                morning: morning,
                                afternoon: afternoon,
                                b: String(morning || ''),
                                l: String(afternoon || ''),
                                d: String(night || ''),
                                days: String(days || ''),
                                instruction: instruction,
                                priority: opt?.priority ?? opt?.priority_value ?? row.priority ?? row.priority_value ?? 999
                            };
                        });
                        // Sort by priority (lower priority number = higher priority)
                        const sortedRows = mappedMedicineRows.sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
                        setMedicineRows(sortedRows);
                        medicineRowsLoadedFromSaveResponseRef.current = true;
                    } else {
                        // Empty array - clear existing rows
                        setMedicineRows([]);
                        medicineRowsLoadedFromSaveResponseRef.current = true;
                    }
                }

                // Load prescription rows from save response (to preserve deletions)
                if (result.prescriptionRows && Array.isArray(result.prescriptionRows)) {
                    if (result.prescriptionRows.length > 0) {
                        const mappedPrescriptionRows: PrescriptionRow[] = result.prescriptionRows.map((row: any, index: number) => ({
                            id: `pres-${index}-${Date.now()}`,
                            prescription: row.prescription || `${row.brand_name || ''} ${row.medicine_name || ''}`.trim() || '',
                            b: String(row.b || row.morning || ''),
                            l: String(row.l || row.afternoon || ''),
                            d: String(row.d || row.night || ''),
                            days: String(row.days || row.no_of_days || ''),
                            instruction: row.instruction || ''
                        }));
                        setPrescriptionRows(mappedPrescriptionRows);
                        prescriptionRowsLoadedFromSaveResponseRef.current = true;
                    } else {
                        // Empty array - clear existing rows
                        setPrescriptionRows([]);
                        prescriptionRowsLoadedFromSaveResponseRef.current = true;
                    }
                }

                // Load investigation rows from save response (to preserve deletions)
                if (result.investigationRows && Array.isArray(result.investigationRows)) {
                    if (result.investigationRows.length > 0) {
                        const mappedInvestigationRows: InvestigationRow[] = result.investigationRows.map((row: any, index: number) => ({
                            id: `inv-${index}-${Date.now()}`,
                            investigation: row.investigation || row.lab_test_description || ''
                        }));
                        setInvestigationRows(mappedInvestigationRows);
                        investigationRowsLoadedFromSaveResponseRef.current = true;
                    } else {
                        // Empty array - clear existing rows
                        setInvestigationRows([]);
                        investigationRowsLoadedFromSaveResponseRef.current = true;
                    }
                }

                // Fetch latest appointment details and patch values before navigating away
                try {
                    const apptParams = {
                        patientId: String(treatmentData?.patientId || ''),
                        doctorId: String(doctorId),
                        shiftId: Number(shiftId) || 1,
                        clinicId: String(clinicId),
                        patientVisitNo: Number(patientVisitNo) || 0,
                        languageId: 1
                    };
                    await fetchAndPatchAppointmentDetails(apptParams, { retries: 3, delayMs: 500 });
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
                setSnackbarMessage(result.error || `Failed to ${isSubmit ? 'submit' : 'save'} treatment`);
                setSnackbarOpen(true);

                // Even on failure, attempt to fetch latest appointment details for debugging/visibility
                try {
                    const apptParams = {
                        patientId: String(treatmentData?.patientId || ''),
                        doctorId: String(doctorId),
                        shiftId: Number(shiftId) || 1,
                        clinicId: String(clinicId),
                        patientVisitNo: Number(patientVisitNo) || 0,
                        languageId: 1
                    };
                    await fetchAndPatchAppointmentDetails(apptParams, { retries: 3, delayMs: 500 });
                } catch (e) {
                    console.warn('Could not patch appointment details after failed save:', e);
                }
            }
        } catch (err: any) {
            const actionType = isSubmit ? 'SUBMIT' : 'SAVE';
            setSnackbarMessage(err.message || `An error occurred while ${isSubmit ? 'submitting' : 'saving'} treatment`);
            setSnackbarOpen(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Specific handlers for save and submit
    const handleTreatmentSave = async () => {
        const billedNum = parseFloat(billingData.billed) || 0;
        if (billedNum <= 0) {
            setBillingError('Billed (Rs) is required');
            setSnackbarMessage('Please fill all required fields');
            setSnackbarOpen(true);
            return;
        }
        setBillingError(null);
        await handleTreatmentAction(false); // false = save
    };

    const handleTreatmentSubmit = async () => {
        const billedNum = parseFloat(billingData.billed) || 0;
        if (billedNum <= 0) {
            setBillingError('Billed (Rs) is required');
            setSnackbarMessage('Please fill all required fields');
            setSnackbarOpen(true);
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

    // Build complaintsRows from selectedComplaints when loading existing visit data
    // This only runs when complaintsOptions are loaded (after API call) and selectedComplaints exist
    // This is needed for loading existing visit data, but won't interfere with manual selection
    React.useEffect(() => {
        // Only build rows if:
        // 1. complaintsOptions are loaded (meaning we're ready to map values to labels)
        // 2. selectedComplaints exist 
        // 3. complaintsRows are empty (meaning we're loading from appointment data)
        // 4. We haven't already built rows from API (to prevent interfering with manual selection)
        if (complaintsOptions.length === 0 || selectedComplaints.length === 0) return;
        // 5. selectedComplaints must have been patched from API (not from manual user selection)
        if (!selectedComplaintsPatchedFromApiRef.current) return;
        if (complaintsRows.length > 0) {
            complaintsRowsBuiltFromApiRef.current = true; // Mark as built
            return; // Don't overwrite if rows already exist
        }
        if (complaintsRowsBuiltFromApiRef.current) return; // Don't run if we've already built from API

        // Build rows from selectedComplaints (only on initial load from appointment data)
        const newRows: ComplaintRow[] = selectedComplaints.map(val => {
            const opt = complaintsOptions.find(o => o.value === val);
            return {
                id: `${val}`,
                value: val,
                label: opt?.label || val,
                comment: '',
                priority: opt?.priority ?? opt?.priority_value ?? 999
            };
        });

        // Sort by priority (lower priority number = higher priority)
        const sortedRows = newRows.sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
        setComplaintsRows(sortedRows);
        complaintsRowsBuiltFromApiRef.current = true; // Mark as built
        selectedComplaintsPatchedFromApiRef.current = false; // Reset so manual changes do not auto-build
    }, [complaintsOptions, selectedComplaints, complaintsRows.length]); // Include complaintsRows.length to detect when it changes

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
                comment: '',
                priority: 999 // Default priority for custom diagnoses
            };
            setDiagnosisRows(prev => {
                const next = [...prev, newDiagnosis];
                // Sort by priority (lower priority number = higher priority)
                return next.sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
            });
            setSelectedDiagnosis('');
        }
    };

    const handleRemoveDiagnosis = (id: string) => {
        setDiagnosisRows(prev => prev.filter(row => row.id !== id));
    };

    const handleAddDiagnoses = () => {
        if (selectedDiagnoses.length === 0) return;
        setDiagnosisRows(prev => {
            // Normalize existing values and diagnoses for comparison
            const existingValues = new Set(prev.map(r => r.value?.toLowerCase().trim()).filter(Boolean));
            const existingDiagnoses = new Set(prev.map(r => r.diagnosis?.toLowerCase().trim()).filter(Boolean));
            const newRows: DiagnosisRow[] = [];
            const duplicateDiagnoses: string[] = [];
            // Track what's being added in this batch to prevent duplicates within the same batch
            const currentBatchValues = new Set<string>();
            const currentBatchDiagnoses = new Set<string>();

            selectedDiagnoses.forEach(val => {
                const diagnosisOption = diagnosesOptions.find(opt => opt.value === val);
                const diagnosisLabel = diagnosisOption?.label || val;
                const normalizedValue = val?.toLowerCase().trim() || '';
                const normalizedDiagnosis = diagnosisLabel?.toLowerCase().trim() || '';

                // Check for duplicates by both value and diagnosis name (case-insensitive)
                if (existingValues.has(normalizedValue) ||
                    existingDiagnoses.has(normalizedDiagnosis) ||
                    currentBatchValues.has(normalizedValue) ||
                    currentBatchDiagnoses.has(normalizedDiagnosis)) {
                    duplicateDiagnoses.push(diagnosisLabel);
                } else {
                    newRows.push({
                        id: Date.now().toString() + Math.random(),
                        value: val,
                        diagnosis: diagnosisLabel,
                        comment: '',
                        priority: diagnosisOption?.priority ?? diagnosisOption?.priority_value ?? 999
                    });
                    // Track what we're adding in this batch
                    currentBatchValues.add(normalizedValue);
                    currentBatchDiagnoses.add(normalizedDiagnosis);
                }
            });

            // Show error if duplicates found
            if (duplicateDiagnoses.length > 0) {
                setDiagnosesError(`The following diagnosis(es) are already added: ${duplicateDiagnoses.join(', ')}`);
            } else {
                setDiagnosesError(null);
            }

            const next = [...prev, ...newRows];
            // Sort by priority (lower priority number = higher priority)
            return next.sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
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

    const handleAddMedicine = () => {
        if (selectedMedicines.length > 0) {
            setMedicineRows(prev => {
                const existingShortDescriptions = new Set(prev.map(r => r.short_description?.toLowerCase().trim()));
                const newRows: MedicineRow[] = [];
                const duplicateMedicines: string[] = [];

                selectedMedicines.forEach(medicineValue => {
                    const medicineOption = medicinesOptions.find(opt => opt.value === medicineValue);
                    if (medicineOption) {
                        const shortDesc = medicineOption.short_description?.toLowerCase().trim() || '';

                        // Check for duplicates by short_description
                        if (existingShortDescriptions.has(shortDesc)) {
                            duplicateMedicines.push(medicineOption.short_description);
                        } else {
                            newRows.push({
                                id: Date.now().toString() + Math.random(),
                                medicine: medicineOption.short_description,
                                short_description: medicineOption.short_description,
                                morning: medicineOption.morning ?? 0,
                                afternoon: medicineOption.afternoon ?? 0,
                                b: (medicineOption.morning ?? 0).toString(),
                                l: (medicineOption.afternoon ?? 0).toString(),
                                d: (medicineOption.night ?? 0).toString(),
                                days: (medicineOption.no_of_days ?? 1).toString(),
                                instruction: medicineOption.instruction || '',
                                priority: medicineOption.priority ?? medicineOption.priority_value ?? 999
                            });
                            existingShortDescriptions.add(shortDesc);
                        }
                    }
                });

                // Show error if duplicates found
                if (duplicateMedicines.length > 0) {
                    setMedicinesError(`The following medicine(s) are already added: ${duplicateMedicines.join(', ')}`);
                } else {
                    setMedicinesError(null);
                }

                const next = [...prev, ...newRows];
                // Sort by priority (lower priority number = higher priority)
                return next.sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
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
        if (instruction.length > 150) return;
        setMedicineRows(prev => prev.map(row =>
            row.id === id ? { ...row, instruction } : row
        ));
    };

    const handleAddPrescription = () => {
        const raw = prescriptionInput.trim();
        if (!raw) {
            setSnackbarMessage('Prescription cannot be empty');
            setSnackbarOpen(true);
            return;
        }

        if (raw.length > 200) {
            setSnackbarMessage('Prescription cannot exceed 200 characters');
            setSnackbarOpen(true);
            return;
        }

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
        if (instruction.length > 150) return;
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
            const existingInvestigationLabels = new Set(prev.map(r => r.investigation.toLowerCase()));
            const newRows: InvestigationRow[] = [];
            const duplicateInvestigations: string[] = [];

            selectedInvestigations.forEach(val => {
                const investigationOption = investigationsOptions.find(opt => opt.value === val);
                const investigationLabel = (investigationOption?.label || val).toLowerCase();

                // Check for duplicates by investigation name (case-insensitive)
                if (existingInvestigationLabels.has(investigationLabel)) {
                    duplicateInvestigations.push(investigationOption?.label || val);
                } else {
                    newRows.push({ id: `inv_${Date.now()}_${val}`, investigation: investigationOption?.label || val });
                    existingInvestigationLabels.add(investigationLabel);
                }
            });

            // Show error if duplicates found
            if (duplicateInvestigations.length > 0) {
                setSnackbarMessage(`The following investigation(s) are already added: ${duplicateInvestigations.join(', ')}`);
                setSnackbarOpen(true);
            } else {
                setInvestigationsError(null);
            }

            return [...prev, ...newRows];
        });
        setSelectedInvestigations([]);
    };

    const handleRemoveInvestigation = (id: string) => {
        setInvestigationRows(prev => prev.filter(row => row.id !== id));
    };

    const handleFollowUpChange = (field: string, value: string) => {
        setFollowUpData(prev => ({
            ...prev,
            [field]: value
        }));

        if (field === 'planAdv') {
            const { error } = validateField('planAdv', value, 1000, 'Plan / Advice', 'visit');
            setPlanAdvError(error || null);
        }

        if (field === 'remarkComments') {
            const { error } = validateField('remarkComments', value, 1000, 'Remark', 'visit');
            setRemarkCommentsError(error || null);
        }

        if (field === 'followUp') {
            const { error } = validateField('followUp', value, 100, 'Follow up', 'visit');
            setFollowUpError(error || null);
        }
    };

    const handleBillingChange = (field: string, value: string) => {
        // Strict blocking for discount field AND billed field
        if ((field === 'discount' || field === 'billed') && value && !/^\d*\.?\d*$/.test(value)) {
            return; // Block non-numeric input
        }

        setBillingData(prev => {
            const next = { ...prev, [field]: value };
            const billedNum = parseFloat(next.billed) || 0;
            const discountNum = parseFloat(next.discount);

            let newError: string | null = null;

            if (field === 'discount') {
                if (value.length > 3) {
                    newError = 'Discount (Rs) cannot exceed 3 characters';
                } else if (value && isNaN(Number(value))) {
                    // Should be caught by blocking above, but fallback
                    newError = 'Discount must be a valid number';
                } else if (!isNaN(discountNum) && discountNum < 0) {
                    newError = 'Discount cannot be negative';
                } else if ((!isNaN(discountNum) ? discountNum : 0) > billedNum && billedNum > 0) {
                    newError = 'Discount cannot be greater than billed amount';
                }
            }

            setDiscountError(newError);

            // Calculate remaining amount after discount and collection (Dues)
            const validDiscount = isNaN(discountNum) ? 0 : discountNum;
            const collectedNum = parseFloat(next.collected) || 0;
            const remainingAmount = Math.max(0, billedNum - validDiscount - collectedNum);
            return { ...next, dues: String(remainingAmount) };
        });
    };

    // Helper style for disabled state (visual only - individual elements have disabled props)
    // Note: We don't apply opacity here as it affects all children including enabled buttons
    const disabledStyle = isFormDisabled ? {
        cursor: 'not-allowed'
    } : {};

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
        <div className="page" >
            <style dangerouslySetInnerHTML={{ __html: durationCommentStyles }} />
            <style>{`
                /* Override Material-UI container overflow to prevent duplicate scrollbar */
                [class*="css-1kjibxc"] {
                    overflow: hidden !important;
                }
            `}</style>
            <div className="body" style={{ overflowY: 'auto' }}>
                {/* Header */}
                <div className="dashboard-header" style={{ background: 'transparent', display: 'flex', alignItems: 'center', padding: '12px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 className="dashboard-title" style={{ color: '#000' }}>Patient's Treatment Details</h2>
                    </div>
                </div>

                {/* Main Content - Two Column Layout */}
                <div style={{ display: 'flex', minHeight: 'calc(100vh - 120px)', fontFamily: "'Roboto', sans-serif", ...disabledStyle }}>
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
                                Previous Visits ({previousVisits.length})
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
                                    previousVisits.slice(-10).reverse().map((visit, index) => (
                                        <div
                                            key={visit.id}
                                            style={{
                                                padding: '10px 15px',
                                                borderBottom: '1px solid #e0e0e0',
                                                backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                transition: 'background-color 0.2s ease'
                                            }}
                                            onClick={() => handlePreviousVisitClick(visit)}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#eeeeee';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#f8f9fa' : 'white';
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
                            <div style={{ padding: '10px', maxWidth: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
                                {isLoadingDocuments && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        color: '#2e7d32',
                                        fontSize: '12px'
                                    }}>
                                        <div style={{
                                            width: '12px',
                                            height: '12px',
                                            border: '2px solid #2e7d32',
                                            borderTop: '2px solid transparent',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite'
                                        }}></div>
                                        Loading documents...
                                    </div>
                                )}

                                {!isLoadingDocuments && existingDocuments.length === 0 && (
                                    <div style={{ color: '#666', fontSize: '12px' }}>
                                        No documents found for this visit
                                    </div>
                                )}

                                {!isLoadingDocuments && existingDocuments.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: '100%' }}>
                                        {existingDocuments.map((doc, index) => {
                                            const docId: number | undefined = doc.documentId || doc.id || doc.document_id || doc.documentID;
                                            const isDownloading = downloadingDocumentId === docId;
                                            const isOpening = openingDocumentId === docId;
                                            const isProcessing = isDownloading || isOpening;
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
                                                    fontWeight: 500,
                                                    color: '#2e7d32',
                                                    maxWidth: '100%',
                                                    cursor: docId && !isProcessing ? 'pointer' : 'default',
                                                    opacity: isProcessing ? 0.7 : 1,
                                                    transition: 'opacity 0.2s'
                                                }}
                                                    onClick={() => {
                                                        if (docId && !isProcessing) {
                                                            handleOpenDocument(doc);
                                                        }
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (docId && !isProcessing) {
                                                            e.currentTarget.style.backgroundColor = '#d4edda';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (docId && !isProcessing) {
                                                            e.currentTarget.style.backgroundColor = '#e8f5e8';
                                                        }
                                                    }}
                                                    title={isProcessing ? (isOpening ? 'Opening...' : 'Downloading...') : docId ? 'Click to open document' : ''}
                                                >
                                                    <span style={{ marginRight: '5px' }}>📄</span>
                                                    <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {(() => {
                                                            const fullPath = doc.documentName;
                                                            // Split by forward or backward slash, filter out empty strings (e.g. trailing slash), and take the last part
                                                            const parts = String(fullPath).split('/').pop();
                                                            console.log('/part', parts);
                                                            return parts || fullPath;
                                                        })()}
                                                    </span>
                                                    {doc.fileSize && (
                                                        <span style={{
                                                            marginLeft: '6px',
                                                            fontSize: '11px',
                                                            color: '#2e7d32',
                                                            fontWeight: 400
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
                                                    {docId && (
                                                        <span
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // Prevent triggering the parent onClick
                                                                if (!isProcessing) handleDownloadDocument(doc);
                                                            }}
                                                            style={{
                                                                marginLeft: '8px',
                                                                width: '24px',
                                                                height: '24px',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: isProcessing ? '#9e9e9e' : '#000000',
                                                                cursor: isProcessing ? 'not-allowed' : 'pointer'
                                                            }}
                                                            title={isProcessing ? (isOpening ? 'Opening...' : 'Downloading...') : 'Download'}
                                                        >
                                                            <DownloadIcon style={{ fontSize: '16px' }} />
                                                        </span>
                                                    )}
                                                </span>
                                            );
                                        })}
                                    </div>
                                )}
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
                                {loadingPastServices ? (
                                    <div style={{
                                        padding: '10px 15px',
                                        textAlign: 'center',
                                        color: '#666',
                                        fontSize: '12px'
                                    }}>
                                        Loading...
                                    </div>
                                ) : pastServicesError ? (
                                    <div style={{
                                        padding: '10px 15px',
                                        textAlign: 'center',
                                        color: '#d32f2f',
                                        fontSize: '12px',
                                        backgroundColor: '#ffebee',
                                        border: '1px solid #ffcdd2',
                                        margin: '8px'
                                    }}>
                                        {pastServicesError}
                                    </div>
                                ) : pastServiceDates.length === 0 ? (
                                    <div style={{
                                        padding: '10px 15px',
                                        textAlign: 'center',
                                        color: '#666',
                                        fontSize: '12px'
                                    }}>
                                        No past services
                                    </div>
                                ) : (
                                    pastServiceDates.map((dateStr, idx) => (
                                        <div
                                            key={`${dateStr}_${idx}`}
                                            style={{
                                                padding: '10px 15px',
                                                borderBottom: '1px solid #e0e0e0',
                                                backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9f9f9',
                                                fontSize: '13px'
                                            }}
                                        >
                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handlePastServiceDateClick(dateStr);
                                                }}
                                                style={{ color: '#1976d2', textDecoration: 'underline', cursor: 'pointer' }}
                                            >
                                                {formatPastServiceDate(dateStr)}
                                            </a>
                                        </div>
                                    ))
                                )}
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
                                    <div
                                        onClick={() => {
                                            if (treatmentData?.patientId) {
                                                setShowQuickRegistration(true);
                                            }
                                        }}
                                        style={{
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            color: '#2e7d32',
                                            cursor: treatmentData?.patientId ? 'pointer' : 'default',
                                            textDecoration: treatmentData?.patientId ? 'underline' : 'none'
                                        }}
                                        title={treatmentData?.patientId ? 'Click to view patient details' : ''}
                                    >
                                        {treatmentData?.patientName || 'Patient'} / {treatmentData?.gender || 'N/A'} / {treatmentData?.age ? `${treatmentData.age} Y` : 'N/A'} / {treatmentData?.contact || 'N/A'}
                                    </div>
                                    {/* <PatientNameDisplay onClick={() => {
                                        if (treatmentData?.patientId) {
                                            setShowQuickRegistration(true);
                                        }
                                    }}
                                        style={{
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            color: '#2e7d32',
                                            cursor: treatmentData?.patientId ? 'pointer' : 'default',
                                            textDecoration: treatmentData?.patientId ? 'underline' : 'none'
                                        }}
                                        title={treatmentData?.patientId ? 'Click to view patient details' : ''}
                                        patientData={treatmentData}
                                    /> */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <label style={{ fontWeight: 'bold', color: '#333', fontSize: '13px', whiteSpace: 'nowrap' }}>Referred By:</label>
                                            <span style={{
                                                fontSize: '12px',
                                                color: '#333',
                                                fontWeight: 500
                                            }}>
                                                {(() => {
                                                    // Robust extraction of code/ID (e.g., "D", "S", "1")
                                                    let rawCode = treatmentData?.referralCode ||
                                                        treatmentData?.referralName ||
                                                        (treatmentData?.referralName === '');



                                                    // Normalize code (trim, uppercase)
                                                    const code = String(rawCode || '').trim().toUpperCase();

                                                    const name = treatmentData?.referralName || formData.referralBy;


                                                    // Static mapping for known codes (robust fallback)
                                                    const staticMap: Record<string, string> = {
                                                        'D': 'Doctor',
                                                        'S': 'Self',
                                                        'O': 'Other',
                                                        'F': 'Family-Friend',
                                                        'I': 'Internet'
                                                    };
                                                    if (code && staticMap[code]) {
                                                        return staticMap[code];
                                                    }

                                                    if (!referByOptions || referByOptions.length === 0) {
                                                        // Fallback to name if available and not 'Self' (already handled)
                                                        if (name && name !== 'Self') return name;
                                                        // If code is descriptive (len > 1), show it (e.g. "Doctor")
                                                        if (rawCode && String(rawCode).length > 1) return rawCode;
                                                        return '';
                                                    }

                                                    // Helper to extract ID string safely
                                                    const getOptId = (opt: any) => {
                                                        if (typeof opt.id === 'object' && opt.id !== null) {
                                                            return String(opt.id.referId || opt.id.id || '').toUpperCase();
                                                        }
                                                        return String(opt.id).toUpperCase();
                                                    };

                                                    // 1. Try to find option by ID (exact match)
                                                    const optById = referByOptions.find(o => getOptId(o) === code);
                                                    if (optById) {
                                                        return optById.name || (optById as any).referByDescription || '';
                                                    }

                                                    // 2. Try to find option by Name (case-insensitive)
                                                    const optByName = referByOptions.find(o =>
                                                        o.name.toLowerCase() === code.toLowerCase() ||
                                                        o.name.toLowerCase() === String(name).toLowerCase()
                                                    );
                                                    if (optByName) {
                                                        return optByName.name || (optByName as any).referByDescription || '';
                                                    }

                                                    // 3. Fallback: If code is a descriptive string allow it
                                                    if (rawCode && String(rawCode).length > 2) {
                                                        return rawCode;
                                                    }

                                                    // 4. Ultimate fallback name
                                                    if (name) {
                                                        return name;
                                                    }

                                                    return '';
                                                })()}

                                            </span>
                                        </div>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: (isFormDisabled || inPersonDisabled) ? 'not-allowed' : 'pointer', fontSize: '12px', whiteSpace: 'nowrap' }}>
                                            <input
                                                type="checkbox"
                                                checked={true}
                                                onChange={(e) => handleVisitTypeChange('inPerson', e.target.checked)}
                                                disabled={true}
                                                readOnly={inPersonDisabled}
                                            />
                                            In-Person
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: isFormDisabled ? 'not-allowed' : 'pointer', fontSize: '12px', whiteSpace: 'nowrap' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.visitType.followUp}
                                                onChange={(e) => handleVisitTypeChange('followUp', e.target.checked)}
                                                disabled={true}
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
                                            cursor: isFormDisabled ? 'not-allowed' : 'pointer',
                                            fontSize: '13px',
                                            borderRadius: '4px'
                                        }}>
                                            <input
                                                type="checkbox"
                                                checked={value}
                                                onChange={(e) => handleMedicalHistoryChange(key, e.target.checked)}
                                                disabled={isFormDisabled}
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
                                <div className="row row-cols-5 g-3">
                                    {[
                                        { key: 'allergy', label: 'Allergy' },
                                        { key: 'medicalHistoryText', label: 'Medical History' },
                                        { key: 'surgicalHistory', label: 'Surgical History' },
                                        { key: 'medicines', label: 'Medicines' },
                                        { key: 'visitComments', label: 'Visit Comments' },
                                    ].map(({ key, label }) => (
                                        <div key={key} className="col">
                                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                                {label}
                                            </label>
                                            <ClearableTextField
                                                value={formData[key as keyof typeof formData] as string}
                                                onChange={(e) => handleInputChange(key, e)}
                                                disabled={isFormDisabled}
                                                error={!!errors[key]}
                                                helperText={errors[key]}
                                                style={{
                                                    width: '100%'
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Vitals Row */}
                            <div style={{ marginBottom: '15px' }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'stretch' }}>
                                    <div style={{ flex: '1 1 700px', minWidth: '260px' }}>
                                        <div className="row g-3">
                                            {[
                                                { key: 'height', label: 'Height (Cm)' },
                                                { key: 'weight', label: 'Weight (Kg)' },
                                                { key: 'bmi', label: 'BMI' },
                                                { key: 'pulse', label: 'Pulse (/min)' },
                                                { key: 'bp', label: 'BP' },
                                                { key: 'sugar', label: 'Sugar' },
                                                { key: 'tft', label: 'TFT' },
                                                { key: 'pallorHb', label: 'Pallor/HB' }
                                            ].map(({ key, label }) => {
                                                const isNumberField = key === 'pulse' || key === 'height' || key === 'weight';
                                                return (
                                                    <div key={key} className="col-6 col-md">
                                                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                                            {label}
                                                        </label>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                            <ClearableTextField
                                                                value={formData[key as keyof typeof formData] as string}
                                                                onChange={(value) => {
                                                                    handleInputChange(key, value);
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    if (isNumberField) {
                                                                        // Prevent minus key from being entered
                                                                        if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                                                                            e.preventDefault();
                                                                        }
                                                                    }
                                                                }}
                                                                onBlur={(e) => {
                                                                    if (isNumberField) {
                                                                        // Ensure value is not negative on blur
                                                                        const numValue = parseFloat(e.target.value);
                                                                        if (isNaN(numValue) || numValue < 0) {
                                                                            handleInputChange(key, '');
                                                                        }
                                                                    }
                                                                }}
                                                                disabled={key === 'bmi' || isFormDisabled}
                                                                error={!!errors[key]}
                                                                helperText={errors[key]}
                                                                inputProps={{
                                                                    // Removed maxLength to allow validation logic to trigger at/above limit
                                                                }}
                                                                sx={{
                                                                    flex: 1,
                                                                    '& .MuiInputBase-input': {
                                                                        padding: '6px 10px',
                                                                        fontSize: '13px',
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                        <button
                                            type="button"
                                            disabled={isFormDisabled}
                                            title="Show vitals trend"
                                            style={{
                                                padding: '0 14px',
                                                backgroundColor: isFormDisabled ? '#ccc' : '#1976d2',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: isFormDisabled ? 'not-allowed' : 'pointer',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                height: '32px',
                                                transition: 'background-color 0.2s',
                                                whiteSpace: 'nowrap'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isFormDisabled) e.currentTarget.style.backgroundColor = '#1565c0';
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isFormDisabled) e.currentTarget.style.backgroundColor = '#1976d2';
                                            }}
                                            onClick={() => setShowVitalsTrend(true)}
                                        >
                                            Trend
                                        </button>
                                    </div>
                                </div>
                            </div>


                            {/* Complaints Section */}
                            <div style={{ marginBottom: '15px' }}>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'flex-start' }}>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', width: '88%', gap: '8px' }}>
                                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>Complaints</label>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div ref={complaintsRef} style={{ position: 'relative', flex: 1 }}>
                                                <div
                                                    onClick={() => !isFormDisabled && setIsComplaintsOpen(prev => !prev)}
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
                                                        backgroundColor: isFormDisabled ? '#f5f5f5' : 'white',
                                                        cursor: isFormDisabled ? 'not-allowed' : 'pointer',
                                                        userSelect: 'none',
                                                        opacity: isFormDisabled ? 0.6 : 1
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
                                                        <div style={{ padding: '6px' }}>
                                                            <ClearableTextField
                                                                fullWidth
                                                                size="small"
                                                                value={complaintSearch}
                                                                onChange={(val) => {
                                                                    // Cap at 100 characters
                                                                    if (val.length <= 100) {
                                                                        setComplaintSearch(val);
                                                                    }
                                                                }}
                                                                placeholder="Search complaints"
                                                                variant="outlined"
                                                                error={complaintSearch.length >= 100}
                                                                helperText={complaintSearch.length >= 100 ? 'Search term cannot exceed 100 characters' : ''}
                                                                sx={{
                                                                    '& .MuiOutlinedInput-root': {
                                                                        height: '32px',
                                                                        borderRadius: '4px',
                                                                        fontSize: '12px'
                                                                    }
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
                                                                            const doctorId = treatmentData?.doctorId || sessionData?.doctorId;
                                                                            const clinicId = treatmentData?.clinicId || sessionData?.clinicId;
                                                                            if (!doctorId || !clinicId) {
                                                                                setComplaintsError('Doctor or clinic details are missing. Please reload the visit.');
                                                                                return;
                                                                            }

                                                                            setComplaintsError(null);
                                                                            setComplaintsLoading(true);

                                                                            complaintService.getAllComplaintsForDoctor(doctorId, clinicId)
                                                                                .then(setComplaintsOptions)
                                                                                .catch(e => setComplaintsError(e.message))
                                                                                .finally(() => setComplaintsLoading(false));
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
                                                                // Check if this complaint is already added to the table
                                                                const isAdded = complaintsRows.some(row => row.value === opt.value);
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
                                                                            title={opt.label}
                                                                            style={{
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                gap: '4px',
                                                                                padding: '4px 2px',
                                                                                cursor: isAdded ? 'not-allowed' : 'pointer',
                                                                                fontSize: '12px',
                                                                                border: 'none',
                                                                                backgroundColor: (checked || isAdded) ? '#eeeeee' : 'transparent',
                                                                                borderRadius: '3px',
                                                                                fontWeight: 400,
                                                                                minWidth: 0,
                                                                                opacity: isAdded ? 0.6 : 1
                                                                            }}
                                                                        >
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={checked || isAdded}
                                                                                disabled={isAdded}
                                                                                onChange={(e) => {
                                                                                    if (isAdded) return;
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
                                                                            <span style={{
                                                                                whiteSpace: 'nowrap',
                                                                                overflow: 'hidden',
                                                                                textOverflow: 'ellipsis'
                                                                            }}>{opt.label}{isAdded ? ' (Added)' : ''}</span>
                                                                        </label>
                                                                    </React.Fragment>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                disabled={isFormDisabled}
                                                title="Add selected complaints"
                                                style={{
                                                    padding: '0 10px',
                                                    backgroundColor: isFormDisabled ? '#ccc' : '#1976d2',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: isFormDisabled ? 'not-allowed' : 'pointer',
                                                    fontSize: '12px',
                                                    fontWeight: '500',
                                                    height: '32px',
                                                    transition: 'background-color 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isFormDisabled) e.currentTarget.style.backgroundColor = '#1565c0';
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isFormDisabled) e.currentTarget.style.backgroundColor = '#1976d2';
                                                }}
                                                onClick={handleAddComplaints}
                                            >
                                                Add
                                            </button>
                                            <button
                                                type="button"
                                                disabled={isFormDisabled}
                                                title="Add custom complaint"
                                                style={{
                                                    backgroundColor: isFormDisabled ? '#ccc' : '#1976d2',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '6px',
                                                    borderRadius: '6px',
                                                    cursor: isFormDisabled ? 'not-allowed' : 'pointer',
                                                    width: '32px',
                                                    height: '32px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '14px',
                                                    transition: 'background-color 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isFormDisabled) e.currentTarget.style.backgroundColor = '#1565c0';
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isFormDisabled) e.currentTarget.style.backgroundColor = '#1976d2';
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
                                    <div
                                        style={{
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            overflow: 'hidden',
                                            opacity: isFormDisabled ? 0.6 : 1
                                        }}
                                    >
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{
                                                    backgroundColor: '#1976d2',
                                                    color: 'white',
                                                    fontSize: '13px'
                                                }}>
                                                    <th style={{ borderRight: '1px solid rgba(255,255,255,0.2)', width: '60px', textAlign: 'left' }} className="py-3">Sr.</th>
                                                    <th style={{ borderRight: '1px solid rgba(255,255,255,0.2)', textAlign: 'left' }} className="py-3">Complaint Description</th>
                                                    <th style={{ borderRight: '1px solid rgba(255,255,255,0.2)', textAlign: 'left' }} className="py-3">Duration / Comment</th>
                                                    <th style={{ width: '80px', textAlign: 'center' }} className="py-3">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[...complaintsRows].sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999)).map((row, index) => (
                                                    <tr key={row.id} style={{
                                                        backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                                                        borderBottom: '1px solid #e0e0e0'
                                                    }}>
                                                        <td style={{ borderRight: '1px solid #e0e0e0', fontSize: '12px' }} className="px-3">{index + 1}</td>
                                                        <td style={{ borderRight: '1px solid #e0e0e0', fontSize: '12px' }} className="px-3">{row.label}</td>
                                                        <td style={{ borderRight: '1px solid #e0e0e0' }} className="px-1 py-1">
                                                            <ClearableTextField
                                                                fullWidth
                                                                size="small"
                                                                value={row.comment}
                                                                onChange={(val) => handleComplaintCommentChange(row.value, val)}
                                                                disabled={isFormDisabled}
                                                                placeholder="Enter duration/comment"
                                                                sx={{
                                                                    '& .MuiOutlinedInput-root': {
                                                                        borderRadius: 0,
                                                                        backgroundColor: isFormDisabled ? '#f5f5f5' : 'transparent',
                                                                        fontSize: '11px',
                                                                        '& fieldset': { border: 'none' }
                                                                    },
                                                                    '& .MuiInputBase-input': {
                                                                        padding: '8px 10px',
                                                                        color: isFormDisabled ? '#666' : '#333',
                                                                        cursor: isFormDisabled ? 'not-allowed' : 'text'
                                                                    }
                                                                }}
                                                            />
                                                        </td>
                                                        <td style={{ padding: '6px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <div
                                                                    onClick={() => {
                                                                        if (isFormDisabled) return;
                                                                        handleRemoveComplaint(row.value);
                                                                    }}
                                                                    title="Remove"
                                                                    style={{
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        width: '24px',
                                                                        height: '24px',
                                                                        cursor: isFormDisabled ? 'not-allowed' : 'pointer',
                                                                        color: isFormDisabled ? '#9e9e9e' : '#000000',
                                                                        backgroundColor: 'transparent'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        if (isFormDisabled) return;
                                                                        (e.currentTarget as HTMLDivElement).style.color = '#EF5350';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        (e.currentTarget as HTMLDivElement).style.color = isFormDisabled ? '#9e9e9e' : '#000000';
                                                                    }}
                                                                >
                                                                    <Delete fontSize="small" />
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Detailed Text Areas */}
                            <div style={{ marginBottom: '15px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' as const, gap: '12px' }}>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <label style={{ fontWeight: 'bold', color: '#333', fontSize: '13px' }}>Detailed History</label>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>
                                                {(formData.detailedHistory || '').length}/{getFieldConfig('detailedHistory', 'visit')?.maxLength || 1000}
                                            </Typography>
                                        </div>
                                        <textarea
                                            value={formData.detailedHistory}
                                            onChange={(e) => handleInputChange('detailedHistory', e.target.value.slice(0, getFieldConfig('detailedHistory', 'visit')?.maxLength || 1000))}
                                            disabled={isFormDisabled}
                                            rows={3}
                                            maxLength={getFieldConfig('detailedHistory', 'visit')?.maxLength}
                                            style={{
                                                width: '100%',
                                                padding: '6px 10px',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                fontSize: '13px',
                                                resize: 'vertical',
                                                backgroundColor: isFormDisabled ? '#f5f5f5' : 'white',
                                                color: isFormDisabled ? '#666' : '#333',
                                                cursor: isFormDisabled ? 'not-allowed' : 'text'
                                            }}
                                        />
                                        {errors.detailedHistory && (
                                            <div style={{
                                                color: errors.detailedHistory.includes('cannot exceed') ? '#333333' : '#d32f2f',
                                                fontSize: '13px',
                                                marginTop: '3px'
                                            }}>
                                                {errors.detailedHistory}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <label style={{ fontWeight: 'bold', color: '#333', fontSize: '13px' }}>Examination Findings</label>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>
                                                {(formData.importantFindings || '').length}/{getFieldConfig('importantFindings', 'visit')?.maxLength || 1000}
                                            </Typography>
                                        </div>
                                        <textarea
                                            value={formData.importantFindings}
                                            onChange={(e) => handleInputChange('importantFindings', e.target.value.slice(0, getFieldConfig('importantFindings', 'visit')?.maxLength || 1000))}
                                            disabled={isFormDisabled}
                                            rows={3}
                                            maxLength={getFieldConfig('importantFindings', 'visit')?.maxLength}
                                            style={{
                                                width: '100%',
                                                padding: '6px 10px',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                fontSize: '13px',
                                                resize: 'vertical',
                                                backgroundColor: isFormDisabled ? '#f5f5f5' : 'white',
                                                color: isFormDisabled ? '#666' : '#333',
                                                cursor: isFormDisabled ? 'not-allowed' : 'text'
                                            }}
                                        />
                                        {errors.importantFindings && (
                                            <div style={{
                                                color: errors.importantFindings.includes('cannot exceed') ? '#333333' : '#d32f2f',
                                                fontSize: '13px',
                                                marginTop: '3px'
                                            }}>
                                                {errors.importantFindings}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <label style={{ fontWeight: 'bold', color: '#333', fontSize: '13px' }}>Additional Comments</label>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>
                                                {(formData.additionalComments || '').length}/{getFieldConfig('additionalComments', 'visit')?.maxLength || 1000}
                                            </Typography>
                                        </div>
                                        <textarea
                                            value={formData.additionalComments}
                                            onChange={(e) => handleInputChange('additionalComments', e.target.value.slice(0, getFieldConfig('additionalComments', 'visit')?.maxLength || 1000))}
                                            disabled={isFormDisabled}
                                            rows={3}
                                            maxLength={getFieldConfig('additionalComments', 'visit')?.maxLength}
                                            style={{
                                                width: '100%',
                                                padding: '6px 10px',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                fontSize: '13px',
                                                resize: 'vertical',
                                                backgroundColor: isFormDisabled ? '#f5f5f5' : 'white',
                                                color: isFormDisabled ? '#666' : '#333',
                                                cursor: isFormDisabled ? 'not-allowed' : 'text'
                                            }}
                                        />
                                        {errors.additionalComments && (
                                            <div style={{
                                                color: errors.additionalComments.includes('cannot exceed') ? '#333333' : '#d32f2f',
                                                fontSize: '13px',
                                                marginTop: '3px'
                                            }}>
                                                {errors.additionalComments}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Procedure Performed */}
                            <div style={{ marginBottom: '15px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' as const, gap: '12px' }}>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <label style={{ fontWeight: 'bold', color: '#333', fontSize: '13px' }}>Procedure Performed</label>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>
                                                {(formData.procedurePerformed || '').length}/{getFieldConfig('procedurePerformed', 'visit')?.maxLength || 1000}
                                            </Typography>
                                        </div>
                                        <textarea
                                            value={formData.procedurePerformed}
                                            onChange={(e) => handleInputChange('procedurePerformed', e.target.value.slice(0, getFieldConfig('procedurePerformed', 'visit')?.maxLength || 1000))}
                                            disabled={isFormDisabled}
                                            rows={3}
                                            maxLength={getFieldConfig('procedurePerformed', 'visit')?.maxLength}
                                            style={{
                                                width: '100%',
                                                padding: '6px 10px',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                fontSize: '13px',
                                                resize: 'vertical',
                                                backgroundColor: isFormDisabled ? '#f5f5f5' : 'white',
                                                color: isFormDisabled ? '#666' : '#333',
                                                cursor: isFormDisabled ? 'not-allowed' : 'text'
                                            }}
                                        />
                                        {errors.procedurePerformed && (
                                            <div style={{
                                                color: errors.procedurePerformed.includes('cannot exceed') ? '#333333' : '#d32f2f',
                                                fontSize: '13px',
                                                marginTop: '3px'
                                            }}>
                                                {errors.procedurePerformed}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <label style={{ fontWeight: 'bold', color: '#333', fontSize: '13px' }}>Dressing (body parts)</label>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>
                                                {(formData.dressingBodyParts || '').length}/{getFieldConfig('dressingBodyParts', 'visit')?.maxLength || 1000}
                                            </Typography>
                                        </div>
                                        <textarea
                                            value={formData.dressingBodyParts}
                                            onChange={(e) => handleInputChange('dressingBodyParts', e.target.value.slice(0, getFieldConfig('dressingBodyParts', 'visit')?.maxLength || 1000))}
                                            disabled={isFormDisabled}
                                            rows={3}
                                            maxLength={getFieldConfig('dressingBodyParts', 'visit')?.maxLength}
                                            style={{
                                                width: '100%',
                                                padding: '6px 10px',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                fontSize: '13px',
                                                resize: 'vertical',
                                                backgroundColor: isFormDisabled ? '#f5f5f5' : 'white',
                                                color: isFormDisabled ? '#666' : '#333',
                                                cursor: isFormDisabled ? 'not-allowed' : 'text'
                                            }}
                                        />
                                        {errors.dressingBodyParts && (
                                            <div style={{
                                                color: errors.dressingBodyParts.includes('cannot exceed') ? '#333333' : '#d32f2f',
                                                fontSize: '13px',
                                                marginTop: '3px'
                                            }}>
                                                {errors.dressingBodyParts}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px', visibility: 'hidden' }}>
                                            Button Label
                                        </label>
                                        <button
                                            type="button"
                                            disabled={isFormDisabled}
                                            title="Lab Details"
                                            style={{
                                                width: '100%',
                                                height: '40px',
                                                padding: '6px 10px',
                                                backgroundColor: isFormDisabled ? '#ccc' : '#1976d2',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                fontSize: '13px',
                                                fontWeight: 'bold',
                                                cursor: isFormDisabled ? 'not-allowed' : 'pointer',
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
                                                    shiftId: 1,
                                                    visitDate: new Date().toISOString().slice(0, 10)
                                                };
                                                setSelectedPatientForLab(appointmentRow);
                                                setShowLabTestEntry(true);
                                            }}
                                        >
                                            RECORD LAB TEST RESULT
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Diagnosis Section  */}
                            <div style={{ marginBottom: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px', width: '88%', gap: '8px' }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>Diagnosis</label>
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
                                                backgroundColor: isFormDisabled ? '#f5f5f5' : 'white',
                                                cursor: isFormDisabled ? 'not-allowed' : 'pointer',
                                                userSelect: 'none',
                                                opacity: isFormDisabled ? 0.6 : 1
                                            }}
                                            onClick={() => !isFormDisabled && setIsDiagnosesOpen(!isDiagnosesOpen)}
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
                                                    <ClearableTextField
                                                        fullWidth
                                                        size="small"
                                                        value={diagnosisSearch}
                                                        onChange={(val) => setDiagnosisSearch(val)}
                                                        placeholder="Search diagnoses"
                                                        variant="outlined"
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                height: '32px',
                                                                borderRadius: '4px',
                                                                fontSize: '12px'
                                                            }
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
                                                                    const doctorId = treatmentData?.doctorId || sessionData?.doctorId;
                                                                    const clinicId = treatmentData?.clinicId || sessionData?.clinicId;
                                                                    if (!doctorId || !clinicId) {
                                                                        setDiagnosesError('Doctor and clinic information are required to reload diagnoses.');
                                                                        return;
                                                                    }
                                                                    diagnosisService.getDiagnosesFromPatientProfile(doctorId, clinicId)
                                                                        .then(setDiagnosesOptions)
                                                                        .catch(e => setDiagnosesError(e.message || 'Failed to load diagnoses.'));
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
                                                        // Check if this diagnosis is already added to the table
                                                        // Using the same logic as the add handler: check value and diagnosis name
                                                        const normalizedValue = opt.value?.toLowerCase().trim() || '';
                                                        const normalizedLabel = opt.label?.toLowerCase().trim() || '';

                                                        const isAdded = diagnosisRows.some(row =>
                                                            (row.value && row.value.toLowerCase().trim() === normalizedValue) ||
                                                            (row.diagnosis && row.diagnosis.toLowerCase().trim() === normalizedLabel)
                                                        );

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
                                                                    title={opt.label}
                                                                    style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '4px',
                                                                        padding: '4px 2px',
                                                                        cursor: isAdded ? 'not-allowed' : 'pointer',
                                                                        fontSize: '12px',
                                                                        border: 'none',
                                                                        backgroundColor: (checked || isAdded) ? '#eeeeee' : 'transparent',
                                                                        borderRadius: '3px',
                                                                        fontWeight: 400,
                                                                        minWidth: 0,
                                                                        opacity: isAdded ? 0.6 : 1
                                                                    }}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={checked || isAdded}
                                                                        disabled={isAdded}
                                                                        onChange={(e) => {
                                                                            if (isAdded) return;
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
                                                                    <span style={{
                                                                        whiteSpace: 'nowrap',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis'
                                                                    }}>{opt.label}{isAdded ? ' (Added)' : ''}</span>
                                                                </label>
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        disabled={isFormDisabled}
                                        title="Add selected diagnoses"
                                        style={{
                                            padding: '0 10px',
                                            backgroundColor: isFormDisabled ? '#ccc' : '#1976d2',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: isFormDisabled ? 'not-allowed' : 'pointer',
                                            fontSize: '12px',
                                            height: '32px',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isFormDisabled) e.currentTarget.style.backgroundColor = '#1565c0';
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isFormDisabled) e.currentTarget.style.backgroundColor = '#1976d2';
                                        }}
                                        onClick={handleAddDiagnoses}
                                    >
                                        Add
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isFormDisabled}
                                        title="Add custom diagnosis"
                                        style={{
                                            backgroundColor: isFormDisabled ? '#ccc' : '#1976d2',
                                            color: 'white',
                                            border: 'none',
                                            padding: '6px',
                                            borderRadius: '6px',
                                            cursor: isFormDisabled ? 'not-allowed' : 'pointer',
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '14px',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isFormDisabled) e.currentTarget.style.backgroundColor = '#1565c0';
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isFormDisabled) e.currentTarget.style.backgroundColor = '#1976d2';
                                        }}
                                        onClick={handleAddCustomDiagnosis}
                                    >
                                        <Add fontSize="small" />
                                    </button>
                                </div>

                                {/* Diagnosis Table */}
                                {diagnosisRows.length > 0 && (
                                    <div
                                        style={{
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            overflow: 'hidden',
                                            opacity: isFormDisabled ? 0.6 : 1
                                        }}
                                    >
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{
                                                    backgroundColor: '#1976d2',
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    fontSize: '13px'
                                                }}>
                                                    <th style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)', width: '60px', textAlign: 'left' }}>Sr.</th>
                                                    <th style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)', textAlign: 'left' }}>Provisional Diagnosis</th>
                                                    <th style={{ padding: '6px', width: '80px', textAlign: 'center' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[...diagnosisRows].sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999)).map((row, index) => (
                                                    <tr key={row.id} style={{
                                                        backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                                                        borderBottom: '1px solid #e0e0e0'
                                                    }}>
                                                        <td style={{ borderRight: '1px solid #e0e0e0', fontSize: '12px' }}>{index + 1}</td>
                                                        <td style={{ borderRight: '1px solid #e0e0e0', fontSize: '12px' }}>{row.diagnosis}</td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <div
                                                                    onClick={() => {
                                                                        if (isFormDisabled) return;
                                                                        row.value ? handleRemoveDiagnosisFromSelector(row.value) : handleRemoveDiagnosis(row.id);
                                                                    }}
                                                                    title="Remove"
                                                                    style={{
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        width: '24px',
                                                                        height: '24px',
                                                                        cursor: isFormDisabled ? 'not-allowed' : 'pointer',
                                                                        color: isFormDisabled ? '#9e9e9e' : '#000000',
                                                                        backgroundColor: 'transparent'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        if (isFormDisabled) return;
                                                                        (e.currentTarget as HTMLDivElement).style.color = '#EF5350';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        (e.currentTarget as HTMLDivElement).style.color = isFormDisabled ? '#9e9e9e' : '#000000';
                                                                    }}
                                                                >
                                                                    <Delete fontSize="small" />
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Medicine Section */}
                            <div style={{ marginBottom: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px', width: '88%', gap: '8px' }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>Medicine</label>
                                </div>

                                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                    <div style={{ position: 'relative', flex: 1 }} ref={medicinesRef}>
                                        <div
                                            onClick={() => !isFormDisabled && setIsMedicinesOpen(!isMedicinesOpen)}
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
                                                backgroundColor: isFormDisabled ? '#f5f5f5' : 'white',
                                                cursor: isFormDisabled ? 'not-allowed' : 'pointer',
                                                userSelect: 'none',
                                                opacity: isFormDisabled ? 0.6 : 1
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
                                                    <ClearableTextField
                                                        fullWidth
                                                        size="small"
                                                        value={medicineSearch}
                                                        onChange={(val) => setMedicineSearch(val)}
                                                        placeholder="Search medicines"
                                                        variant="outlined"
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                height: '32px',
                                                                borderRadius: '4px',
                                                                fontSize: '12px'
                                                            }
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
                                                        // Check if medicine is already added using short_description mathing the helper logic
                                                        const shortDesc = opt.short_description?.toLowerCase().trim() || '';
                                                        const isAdded = medicineRows.some(row =>
                                                            row.short_description?.toLowerCase().trim() === shortDesc
                                                        );

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
                                                                    title={opt.label}
                                                                    style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '4px',
                                                                        padding: '4px 2px',
                                                                        cursor: isAdded ? 'not-allowed' : 'pointer',
                                                                        fontSize: '12px',
                                                                        border: 'none',
                                                                        backgroundColor: (checked || isAdded) ? '#eeeeee' : 'transparent',
                                                                        borderRadius: '3px',
                                                                        fontWeight: 400,
                                                                        minWidth: 0,
                                                                        opacity: isAdded ? 0.6 : 1
                                                                    }}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={checked || isAdded}
                                                                        disabled={isAdded}
                                                                        onChange={(e) => {
                                                                            if (isAdded) return;
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
                                                                    <span style={{
                                                                        whiteSpace: 'nowrap',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis'
                                                                    }}>{opt.label}{isAdded ? ' (Added)' : ''}</span>
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
                                        disabled={isFormDisabled}
                                        title="Add selected medicines"
                                        style={{
                                            backgroundColor: isFormDisabled ? '#ccc' : '#1976d2',
                                            color: 'white',
                                            border: 'none',
                                            padding: '6px 12px',
                                            borderRadius: '4px',
                                            cursor: isFormDisabled ? 'not-allowed' : 'pointer',
                                            fontSize: '12px'
                                        }}
                                    >
                                        Add
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isFormDisabled}
                                        title="Add custom medicine"
                                        style={{
                                            backgroundColor: isFormDisabled ? '#ccc' : '#1976d2',
                                            color: 'white',
                                            border: 'none',
                                            padding: '6px',
                                            borderRadius: '6px',
                                            cursor: isFormDisabled ? 'not-allowed' : 'pointer',
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '14px',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isFormDisabled) e.currentTarget.style.backgroundColor = '#1565c0';
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isFormDisabled) e.currentTarget.style.backgroundColor = '#1976d2';
                                        }}
                                        onClick={handleAddCustomMedicine}
                                    >
                                        <Add fontSize="small" />
                                    </button>
                                </div>

                                {/* Medicine Table */}
                                {medicineRows.length > 0 && (
                                    <div
                                        style={{
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            overflow: 'hidden',
                                            opacity: isFormDisabled ? 0.6 : 1
                                        }}
                                    >
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{
                                                    backgroundColor: '#1976d2',
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    fontSize: '13px'
                                                }}>
                                                    <th style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)', width: '50px', textAlign: 'left' }}>Sr.</th>
                                                    <th style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)', textAlign: 'left' }}>Medicine</th>
                                                    <th style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)', width: '50px', textAlign: 'center' }}>B</th>
                                                    <th style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)', width: '50px', textAlign: 'center' }}>L</th>
                                                    <th style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)', width: '50px', textAlign: 'center' }}>D</th>
                                                    <th style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)', width: '50px', textAlign: 'center' }}>Days</th>
                                                    <th style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)', textAlign: 'left' }}>Instruction</th>
                                                    <th style={{ padding: '6px', width: '80px', textAlign: 'center' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[...medicineRows].sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999)).map((row, index) => (
                                                    <tr key={row.id} style={{
                                                        backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                                                        borderBottom: '1px solid #e0e0e0'
                                                    }}>
                                                        <td style={{ borderRight: '1px solid #e0e0e0', fontSize: '12px' }}>{index + 1}</td>
                                                        <td style={{ borderRight: '1px solid #e0e0e0', fontSize: '12px' }}>{row.short_description || row.medicine}</td>
                                                        <td style={{ borderRight: '1px solid #e0e0e0' }} className="px-1 py-1">
                                                            <input
                                                                type="text"
                                                                value={row.b}
                                                                inputMode="numeric"
                                                                pattern="[0-9]*"
                                                                onKeyDown={(e) => { const k = e.key; if (k === 'e' || k === 'E' || k === '+' || k === '-' || k === '.') { e.preventDefault(); } }}
                                                                onChange={(e) => handleMedicineFieldChange(row.id, 'b', e.target.value.replace(/\D/g, ''))}
                                                                disabled={isFormDisabled}
                                                                className="medicine-table-input"
                                                                style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    padding: '8px 6px',
                                                                    border: 'none',
                                                                    borderRadius: 0,
                                                                    outline: 'none',
                                                                    backgroundColor: isFormDisabled ? '#f5f5f5' : 'transparent',
                                                                    boxShadow: 'none',
                                                                    fontSize: '11px',
                                                                    textAlign: 'center',
                                                                    color: isFormDisabled ? '#666' : '#333',
                                                                    cursor: isFormDisabled ? 'not-allowed' : 'text'
                                                                }}
                                                            />
                                                        </td>
                                                        <td style={{ borderRight: '1px solid #e0e0e0' }} className="px-1 py-1">
                                                            <input
                                                                type="text"
                                                                value={row.l}
                                                                inputMode="numeric"
                                                                pattern="[0-9]*"
                                                                onKeyDown={(e) => { const k = e.key; if (k === 'e' || k === 'E' || k === '+' || k === '-' || k === '.') { e.preventDefault(); } }}
                                                                onChange={(e) => handleMedicineFieldChange(row.id, 'l', e.target.value.replace(/\D/g, ''))}
                                                                disabled={isFormDisabled}
                                                                className="medicine-table-input"
                                                                style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    padding: '8px 6px',
                                                                    border: 'none',
                                                                    borderRadius: 0,
                                                                    outline: 'none',
                                                                    backgroundColor: isFormDisabled ? '#f5f5f5' : 'transparent',
                                                                    boxShadow: 'none',
                                                                    fontSize: '11px',
                                                                    textAlign: 'center',
                                                                    color: isFormDisabled ? '#666' : '#333',
                                                                    cursor: isFormDisabled ? 'not-allowed' : 'text'
                                                                }}
                                                            />
                                                        </td>
                                                        <td style={{ borderRight: '1px solid #e0e0e0' }} className="px-1 py-1">
                                                            <ClearableTextField
                                                                size="small"
                                                                value={row.d}
                                                                onChange={(val) => handleMedicineFieldChange(row.id, 'd', val.replace(/\D/g, ''))}
                                                                disabled={isFormDisabled}
                                                                inputProps={{
                                                                    inputMode: 'numeric',
                                                                    pattern: '[0-9]*',
                                                                    maxLength: 10
                                                                }}
                                                                onKeyDown={(e) => { const k = e.key; if (k === 'e' || k === 'E' || k === '+' || k === '-' || k === '.') { e.preventDefault(); } }}
                                                                sx={{
                                                                    '& .MuiOutlinedInput-root': {
                                                                        height: '100%',
                                                                        borderRadius: 0,
                                                                        backgroundColor: isFormDisabled ? '#f5f5f5' : 'transparent',
                                                                        fontSize: '11px',
                                                                        '& fieldset': { border: 'none' }
                                                                    },
                                                                    '& .MuiInputBase-input': {
                                                                        padding: '8px 6px',
                                                                        textAlign: 'center',
                                                                        color: isFormDisabled ? '#666' : '#333',
                                                                        cursor: isFormDisabled ? 'not-allowed' : 'text'
                                                                    }
                                                                }}
                                                            />
                                                        </td>
                                                        <td style={{ borderRight: '1px solid #e0e0e0' }} className="px-1 py-1">
                                                            <ClearableTextField
                                                                size="small"
                                                                value={row.days}
                                                                onChange={(val) => handleMedicineFieldChange(row.id, 'days', val.replace(/\D/g, ''))}
                                                                disabled={isFormDisabled}
                                                                inputProps={{
                                                                    inputMode: 'numeric',
                                                                    pattern: '[0-9]*',
                                                                    maxLength: 10
                                                                }}
                                                                onKeyDown={(e) => { const k = e.key; if (k === 'e' || k === 'E' || k === '+' || k === '-' || k === '.') { e.preventDefault(); } }}
                                                                sx={{
                                                                    '& .MuiOutlinedInput-root': {
                                                                        height: '100%',
                                                                        borderRadius: 0,
                                                                        backgroundColor: isFormDisabled ? '#f5f5f5' : 'transparent',
                                                                        fontSize: '11px',
                                                                        '& fieldset': { border: 'none' }
                                                                    },
                                                                    '& .MuiInputBase-input': {
                                                                        padding: '8px 6px',
                                                                        textAlign: 'center',
                                                                        color: isFormDisabled ? '#666' : '#333',
                                                                        cursor: isFormDisabled ? 'not-allowed' : 'text'
                                                                    }
                                                                }}
                                                            />
                                                        </td>
                                                        <td style={{ borderRight: '1px solid #e0e0e0' }} className="px-1 py-1">
                                                            <ClearableTextField
                                                                size="small"
                                                                value={row.instruction}
                                                                onChange={(val) => handleMedicineInstructionChange(row.id, val)}
                                                                disabled={isFormDisabled}
                                                                placeholder="Enter instruction"
                                                                inputProps={{
                                                                    maxLength: 4000
                                                                }}
                                                                sx={{
                                                                    '& .MuiOutlinedInput-root': {
                                                                        height: '100%',
                                                                        borderRadius: 0,
                                                                        backgroundColor: isFormDisabled ? '#f5f5f5' : 'transparent',
                                                                        fontSize: '11px',
                                                                        '& fieldset': { border: 'none' }
                                                                    },
                                                                    '& .MuiInputBase-input': {
                                                                        padding: '8px 10px',
                                                                        color: isFormDisabled ? '#666' : '#333',
                                                                        cursor: isFormDisabled ? 'not-allowed' : 'text'
                                                                    }
                                                                }}
                                                            />
                                                        </td>
                                                        <td style={{ padding: '6px', textAlign: 'center' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <div
                                                                    onClick={() => {
                                                                        if (isFormDisabled) return;
                                                                        handleRemoveMedicine(row.id);
                                                                    }}
                                                                    title="Remove"
                                                                    style={{
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        width: '24px',
                                                                        height: '24px',
                                                                        cursor: isFormDisabled ? 'not-allowed' : 'pointer',
                                                                        color: isFormDisabled ? '#9e9e9e' : '#000000',
                                                                        backgroundColor: 'transparent'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        if (isFormDisabled) return;
                                                                        (e.currentTarget as HTMLDivElement).style.color = '#EF5350';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        (e.currentTarget as HTMLDivElement).style.color = isFormDisabled ? '#9e9e9e' : '#000000';
                                                                    }}
                                                                >
                                                                    <Delete fontSize="small" />
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Prescription Section */}
                            <div style={{ marginBottom: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px', width: '88%', gap: '8px' }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>Prescription</label>
                                </div>

                                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <ClearableTextField
                                            fullWidth
                                            size="small"
                                            value={prescriptionInput}
                                            onChange={(val) => {
                                                if (!isFormDisabled) {
                                                    setPrescriptionInput(val);
                                                    if (val.length >= 200) {
                                                        setPrescriptionError('Prescription cannot exceed 200 characters');
                                                    } else {
                                                        setPrescriptionError(null);
                                                    }
                                                }
                                            }}
                                            disabled={isFormDisabled}
                                            placeholder="Enter Brand Name / Prescription"
                                            variant="outlined"
                                            inputProps={{
                                                maxLength: 200
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    height: '32px',
                                                    borderRadius: '4px',
                                                    fontSize: '13px',
                                                    backgroundColor: isFormDisabled ? '#f5f5f5' : 'white'
                                                },
                                                '& .MuiInputBase-input': {
                                                    color: isFormDisabled ? '#666' : '#333',
                                                    cursor: isFormDisabled ? 'not-allowed' : 'text'
                                                }
                                            }}
                                            error={!!prescriptionError}
                                            helperText={prescriptionError}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddPrescription}
                                        disabled={isFormDisabled}
                                        title="Add prescription"
                                        style={{
                                            backgroundColor: isFormDisabled ? '#ccc' : '#1976d2',
                                            color: 'white',
                                            border: 'none',
                                            padding: '6px 12px',
                                            borderRadius: '4px',
                                            cursor: isFormDisabled ? 'not-allowed' : 'pointer',
                                            fontSize: '12px'
                                        }}
                                    >
                                        Add Rx
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isFormDisabled}
                                        title="Add custom prescription"
                                        style={{
                                            backgroundColor: isFormDisabled ? '#ccc' : '#1976d2',
                                            color: 'white',
                                            border: 'none',
                                            padding: '6px',
                                            borderRadius: '6px',
                                            cursor: isFormDisabled ? 'not-allowed' : 'pointer',
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '14px',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isFormDisabled) e.currentTarget.style.backgroundColor = '#1565c0';
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isFormDisabled) e.currentTarget.style.backgroundColor = '#1976d2';
                                        }}
                                        onClick={handleAddCustomPrescription}
                                    >
                                        <Add fontSize="small" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowInstructionPopup(true)}
                                        disabled={isFormDisabled}
                                        title="Show instruction groups"
                                        style={{
                                            backgroundColor: isFormDisabled
                                                ? '#ccc'
                                                : (selectedInstructionGroups && selectedInstructionGroups.length > 0
                                                    ? '#ffc107'
                                                    : '#1976d2'),
                                            color: 'white',
                                            border: 'none',
                                            padding: '6px',
                                            borderRadius: '50%',
                                            cursor: isFormDisabled ? 'not-allowed' : 'pointer',
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
                                            if (!isFormDisabled) {
                                                e.currentTarget.style.backgroundColor = (selectedInstructionGroups && selectedInstructionGroups.length > 0)
                                                    ? '#ffb300'
                                                    : '#1565c0';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isFormDisabled) {
                                                e.currentTarget.style.backgroundColor = (selectedInstructionGroups && selectedInstructionGroups.length > 0)
                                                    ? '#ffc107'
                                                    : '#1976d2';
                                            }
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
                                    <div
                                        style={{
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            overflow: 'hidden',
                                            opacity: isFormDisabled ? 0.6 : 1
                                        }}
                                    >
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: '50px 1fr 50px 50px 50px 50px 1fr 80px' as const,
                                            backgroundColor: '#1976d2',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            fontSize: '12px'
                                        }}>
                                            <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Sr.</div>
                                            <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Prescriptions</div>
                                            <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>B</div>
                                            <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>L</div>
                                            <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>D</div>
                                            <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Days</div>
                                            <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Instruction</div>
                                            <div style={{ padding: '6px' }} className="text-center">Action</div>
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
                                                        onKeyDown={(e) => { const k = e.key; if (k === 'e' || k === 'E' || k === '+' || k === '-' || k === '.') { e.preventDefault(); } }}
                                                        onChange={(e) => handlePrescriptionFieldChange(row.id, 'b', e.target.value.replace(/\D/g, ''))}
                                                        disabled={isFormDisabled}
                                                        maxLength={10}
                                                        className="medicine-table-input"
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            padding: '8px 6px',
                                                            border: 'none',
                                                            borderRadius: 0,
                                                            outline: 'none',
                                                            backgroundColor: isFormDisabled ? '#f5f5f5' : 'transparent',
                                                            boxShadow: 'none',
                                                            fontSize: '11px',
                                                            textAlign: 'center',
                                                            color: isFormDisabled ? '#666' : '#333',
                                                            cursor: isFormDisabled ? 'not-allowed' : 'text'
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
                                                        onChange={(e) => handlePrescriptionFieldChange(row.id, 'l', e.target.value.replace(/\D/g, ''))}
                                                        disabled={isFormDisabled}
                                                        maxLength={10}
                                                        className="medicine-table-input"
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            padding: '8px 6px',
                                                            border: 'none',
                                                            borderRadius: 0,
                                                            outline: 'none',
                                                            backgroundColor: isFormDisabled ? '#f5f5f5' : 'transparent',
                                                            boxShadow: 'none',
                                                            fontSize: '11px',
                                                            textAlign: 'center',
                                                            color: isFormDisabled ? '#666' : '#333',
                                                            cursor: isFormDisabled ? 'not-allowed' : 'text'
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
                                                        onChange={(e) => handlePrescriptionFieldChange(row.id, 'd', e.target.value.replace(/\D/g, ''))}
                                                        disabled={isFormDisabled}
                                                        maxLength={10}
                                                        className="medicine-table-input"
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            padding: '8px 6px',
                                                            border: 'none',
                                                            borderRadius: 0,
                                                            outline: 'none',
                                                            backgroundColor: isFormDisabled ? '#f5f5f5' : 'transparent',
                                                            boxShadow: 'none',
                                                            fontSize: '11px',
                                                            textAlign: 'center',
                                                            color: isFormDisabled ? '#666' : '#333',
                                                            cursor: isFormDisabled ? 'not-allowed' : 'text'
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
                                                        onChange={(e) => handlePrescriptionFieldChange(row.id, 'days', e.target.value.replace(/\D/g, ''))}
                                                        disabled={isFormDisabled}
                                                        maxLength={10}
                                                        className="medicine-table-input"
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            padding: '8px 6px',
                                                            border: 'none',
                                                            borderRadius: 0,
                                                            outline: 'none',
                                                            backgroundColor: isFormDisabled ? '#f5f5f5' : 'transparent',
                                                            boxShadow: 'none',
                                                            fontSize: '11px',
                                                            textAlign: 'center',
                                                            color: isFormDisabled ? '#666' : '#333',
                                                            cursor: isFormDisabled ? 'not-allowed' : 'text'
                                                        }}
                                                    />
                                                </div>
                                                <div style={{ padding: '0', borderRight: '1px solid #e0e0e0' }}>
                                                    <input
                                                        type="text"
                                                        value={row.instruction}
                                                        onChange={(e) => handlePrescriptionInstructionChange(row.id, e.target.value)}
                                                        disabled={isFormDisabled}
                                                        maxLength={4000}
                                                        placeholder="Enter instruction"
                                                        className="medicine-table-input"
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            padding: '8px 10px',
                                                            border: 'none',
                                                            borderRadius: 0,
                                                            outline: 'none',
                                                            backgroundColor: isFormDisabled ? '#f5f5f5' : 'transparent',
                                                            boxShadow: 'none',
                                                            fontSize: '11px',
                                                            color: isFormDisabled ? '#666' : '#333',
                                                            cursor: isFormDisabled ? 'not-allowed' : 'text'
                                                        }}
                                                    />
                                                </div>
                                                <div style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                                    <div
                                                        onClick={() => {
                                                            if (isFormDisabled) return;
                                                            handleRemovePrescription(row.id);
                                                        }}
                                                        title="Remove"
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            width: '24px',
                                                            height: '24px',
                                                            cursor: isFormDisabled ? 'not-allowed' : 'pointer',
                                                            color: isFormDisabled ? '#9e9e9e' : '#000000',
                                                            backgroundColor: 'transparent'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (isFormDisabled) return;
                                                            (e.currentTarget as HTMLDivElement).style.color = '#EF5350';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            (e.currentTarget as HTMLDivElement).style.color = isFormDisabled ? '#9e9e9e' : '#000000';
                                                        }}
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
                                        title={showPreviousVisit ? 'Hide previous visit prescriptions' : 'Show previous visit prescriptions'}
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
                                                backgroundColor: isFormDisabled ? '#f5f5f5' : 'white',
                                                cursor: isFormDisabled ? 'not-allowed' : 'pointer',
                                                userSelect: 'none',
                                                opacity: isFormDisabled ? 0.6 : 1
                                            }}
                                            onClick={() => !isFormDisabled && setIsInvestigationsOpen(!isInvestigationsOpen)}
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
                                                    <ClearableTextField
                                                        fullWidth
                                                        size="small"
                                                        value={investigationSearch}
                                                        onChange={(val) => setInvestigationSearch(val)}
                                                        placeholder="Search investigations"
                                                        variant="outlined"
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                height: '32px',
                                                                borderRadius: '4px',
                                                                fontSize: '12px'
                                                            }
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
                                                        // Check if investigation is already added
                                                        const normalizedOpt = opt.label?.toLowerCase().trim() || '';
                                                        const isAdded = investigationRows.some(row =>
                                                            row.investigation?.toLowerCase().trim() === normalizedOpt
                                                        );

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
                                                                    title={opt.label}
                                                                    style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '4px',
                                                                        padding: '4px 2px',
                                                                        cursor: isAdded ? 'not-allowed' : 'pointer',
                                                                        fontSize: '12px',
                                                                        border: 'none',
                                                                        backgroundColor: (checked || isAdded) ? '#eeeeee' : 'transparent',
                                                                        borderRadius: '3px',
                                                                        fontWeight: 400,
                                                                        color: isAdded ? '#999' : '#333',
                                                                        minWidth: 0,
                                                                        opacity: isAdded ? 0.7 : 1
                                                                    }}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={checked || isAdded}
                                                                        disabled={isAdded}
                                                                        onChange={(e) => {
                                                                            if (isAdded) return;
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
                                                                    <span style={{
                                                                        whiteSpace: 'nowrap',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis'
                                                                    }}>{opt.label}{isAdded ? ' (Added)' : ''}</span>
                                                                </label>
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        disabled={isFormDisabled}
                                        title="Add selected investigations"
                                        style={{
                                            padding: '0 10px',
                                            backgroundColor: isFormDisabled ? '#ccc' : '#1976d2',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: isFormDisabled ? 'not-allowed' : 'pointer',
                                            fontSize: '12px',
                                            height: '32px',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isFormDisabled) e.currentTarget.style.backgroundColor = '#1565c0';
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isFormDisabled) e.currentTarget.style.backgroundColor = '#1976d2';
                                        }}
                                        onClick={handleAddInvestigations}
                                    >
                                        Add
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isFormDisabled}
                                        title="Add custom investigation"
                                        style={{
                                            backgroundColor: isFormDisabled ? '#ccc' : '#1976d2',
                                            color: 'white',
                                            border: 'none',
                                            padding: '6px',
                                            borderRadius: '6px',
                                            cursor: isFormDisabled ? 'not-allowed' : 'pointer',
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '14px',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isFormDisabled) e.currentTarget.style.backgroundColor = '#1565c0';
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isFormDisabled) e.currentTarget.style.backgroundColor = '#1976d2';
                                        }}
                                        onClick={handleAddCustomTestLab}
                                    >
                                        <Add fontSize="small" />
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isFormDisabled}
                                        title="Show lab trends"
                                        style={{
                                            backgroundColor: isFormDisabled ? '#ccc' : '#1976d2',
                                            color: 'white',
                                            border: 'none',
                                            padding: '6px',
                                            borderRadius: '50%',
                                            cursor: isFormDisabled ? 'not-allowed' : 'pointer',
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
                                            if (!isFormDisabled) e.currentTarget.style.backgroundColor = '#1565c0';
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isFormDisabled) e.currentTarget.style.backgroundColor = '#1976d2';
                                        }}
                                        onClick={() => {
                                            if (!isFormDisabled) {
                                                setShowLabTrendPopup(true);
                                            }
                                        }}
                                    >
                                        <TrendingUp fontSize="small" />
                                    </button>
                                </div>

                                {/* Investigation Table */}
                                {investigationRows.length > 0 && (
                                    <div
                                        style={{
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            overflow: 'hidden',
                                            opacity: isFormDisabled ? 0.6 : 1
                                        }}
                                    >
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{
                                                    backgroundColor: '#1976d2',
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    fontSize: '13px'
                                                }}>
                                                    <th style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)', width: '60px', textAlign: 'left' }}>Sr.</th>
                                                    <th style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)', textAlign: 'left' }}>Investigation</th>
                                                    <th style={{ padding: '6px', width: '80px', textAlign: 'center' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {investigationRows.map((row, index) => (
                                                    <tr key={row.id} style={{
                                                        backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                                                        borderBottom: '1px solid #e0e0e0'
                                                    }}>
                                                        <td style={{ borderRight: '1px solid #e0e0e0', fontSize: '12px' }}>{index + 1}</td>
                                                        <td style={{ borderRight: '1px solid #e0e0e0', fontSize: '12px' }}>{row.investigation}</td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <div
                                                                    onClick={() => {
                                                                        if (isFormDisabled) return;
                                                                        handleRemoveInvestigation(row.id);
                                                                    }}
                                                                    title="Remove"
                                                                    style={{
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        width: '24px',
                                                                        height: '24px',
                                                                        cursor: isFormDisabled ? 'not-allowed' : 'pointer',
                                                                        color: isFormDisabled ? '#9e9e9e' : '#000000',
                                                                        backgroundColor: 'transparent'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        if (isFormDisabled) return;
                                                                        (e.currentTarget as HTMLDivElement).style.color = '#EF5350';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        (e.currentTarget as HTMLDivElement).style.color = isFormDisabled ? '#9e9e9e' : '#000000';
                                                                    }}
                                                                >
                                                                    <Delete fontSize="small" />
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
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
                                        <ClearableTextField
                                            select
                                            fullWidth
                                            size="small"
                                            value={followUpData.followUpType}
                                            onChange={(val) => handleFollowUpChange('followUpType', val)}
                                            disabled={followUpTypesLoading || isFormDisabled}
                                            sx={{
                                                '& .MuiInputBase-root': {
                                                    fontSize: '13px',
                                                    height: '32px',
                                                    backgroundColor: isFormDisabled ? '#f5f5f5 !important' : 'white !important',
                                                    cursor: isFormDisabled ? 'not-allowed !important' : 'pointer'
                                                },
                                                '& .MuiSelect-select': {
                                                    padding: '6px 10px !important'
                                                },
                                                marginBottom: '0px'
                                            }}
                                            SelectProps={{
                                                displayEmpty: true,
                                                renderValue: (selected) => {
                                                    if (selected === "" || selected === undefined || selected === null) {
                                                        return <span style={{ color: '#aaa' }}>{followUpTypesLoading ? 'Loading...' : 'Select Follow-up Type'}</span>;
                                                    }
                                                    const option = followUpTypesOptions.find(opt => String(opt.id) === String(selected));
                                                    return option ? option.followUpDescription : selected;
                                                },
                                                MenuProps: {
                                                    PaperProps: {
                                                        sx: {
                                                            '& .MuiMenuItem-root.Mui-selected': {
                                                                backgroundColor: '#eeeeee !important',
                                                                '&:hover': {
                                                                    backgroundColor: '#e0e0e0 !important',
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }}
                                        >
                                            <MenuItem value="" sx={{ display: 'none' }}>
                                                Select Follow-up Type
                                            </MenuItem>
                                            {followUpTypesOptions.map((option) => (
                                                <MenuItem key={option.id} value={option.id}>
                                                    {option.followUpDescription}
                                                </MenuItem>
                                            ))}
                                            {followUpTypesError && (
                                                <MenuItem value="" disabled>
                                                    Error: {followUpTypesError}
                                                </MenuItem>
                                            )}
                                        </ClearableTextField>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                            Follow up
                                        </label>
                                        <ClearableTextField
                                            fullWidth
                                            size="small"
                                            value={followUpData.followUp}
                                            onChange={(val) => handleFollowUpChange('followUp', val)}
                                            disabled={isFormDisabled}
                                            inputProps={{
                                                maxLength: 100
                                            }}
                                            placeholder="Enter follow up"
                                            variant="outlined"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '4px',
                                                    fontSize: '13px',
                                                    backgroundColor: isFormDisabled ? '#f5f5f5' : 'white'
                                                },
                                                '& .MuiInputBase-input': {
                                                    color: isFormDisabled ? '#666' : '#333',
                                                    cursor: isFormDisabled ? 'not-allowed' : 'text'
                                                }
                                            }}
                                            error={!!followUpError}
                                            helperText={followUpError}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                            Remark Comments
                                        </label>
                                        <ClearableTextField
                                            multiline
                                            rows={1}
                                            fullWidth
                                            value={followUpData.remarkComments}
                                            onChange={(val) => handleFollowUpChange('remarkComments', val)}
                                            disabled={isFormDisabled}
                                            inputProps={{
                                                maxLength: 1000
                                            }}
                                            placeholder="Enter remark comments"
                                            variant="outlined"
                                            size="small"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '4px',
                                                    fontSize: '13px',
                                                    backgroundColor: isFormDisabled ? '#f5f5f5' : 'white',
                                                    minHeight: '32px',
                                                    maxHeight: '32px'
                                                },
                                                '& .MuiInputBase-input': {
                                                    color: isFormDisabled ? '#666' : '#333',
                                                    cursor: isFormDisabled ? 'not-allowed' : 'text'
                                                }
                                            }}
                                            error={!!remarkCommentsError}
                                            helperText={remarkCommentsError}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Plan/Adv Section */}
                            <div style={{ marginBottom: '15px' }}>
                                <div style={{ marginBottom: '4px' }}>
                                    <label style={{ fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                        Plan / Adv
                                    </label>
                                </div>
                                <ClearableTextField
                                    multiline
                                    rows={2}
                                    fullWidth
                                    value={followUpData.planAdv}
                                    onChange={(val) => handleFollowUpChange('planAdv', val)}
                                    disabled={isFormDisabled}
                                    inputProps={{
                                        maxLength: 1000
                                    }}
                                    placeholder="Enter Plan/Advice"
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '4px',
                                            fontSize: '13px',
                                            backgroundColor: isFormDisabled ? '#f5f5f5' : 'white'
                                        },
                                        '& .MuiInputBase-input': {
                                            color: isFormDisabled ? '#666' : '#333',
                                            cursor: isFormDisabled ? 'not-allowed' : 'text'
                                        }
                                    }}
                                    error={!!planAdvError}
                                    helperText={planAdvError}
                                />
                            </div>



                            {/* Billing Section */}
                            <div style={{ marginBottom: '15px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                            Billed (Rs) <span style={{ color: 'red' }}>*</span>
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type="text"
                                                value={billingData.billed}
                                                onChange={(e) => handleBillingChange('billed', e.target.value)}
                                                disabled
                                                placeholder="Billed Amount"
                                                style={{
                                                    width: '100%',
                                                    padding: '6px 34px 6px 10px',
                                                    border: billingError ? '1px solid red' : '1px solid #ccc',
                                                    borderRadius: '4px',
                                                    fontSize: '13px',
                                                    backgroundColor: '#f5f5f5',
                                                    color: '#666',
                                                    cursor: 'not-allowed'
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowBillingPopup(true)}
                                                title="Add billed item"
                                                className="fixed-icon-btn"
                                                style={{
                                                    position: 'absolute',
                                                    right: 6,
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: 22,
                                                    height: 22,
                                                    borderRadius: 4,
                                                    border: 'none',
                                                    backgroundColor: isFormDisabled ? '#ccc' : '#1976d2',
                                                    color: '#fff',
                                                    fontWeight: 700,
                                                    lineHeight: '22px',
                                                    cursor: isFormDisabled ? 'not-allowed' : 'pointer',
                                                    padding: 0,
                                                    boxSizing: 'border-box',
                                                    outline: 'none',
                                                    boxShadow: 'none',
                                                    transition: 'none',
                                                    zIndex: 1
                                                }}
                                                disabled={isFormDisabled}
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                }}
                                            >
                                                +
                                            </button>
                                        </div>
                                        {billingError && (
                                            <div style={{ color: 'red', fontSize: '12px', marginTop: '4px', marginLeft: 0, textAlign: 'left' }}>
                                                {billingError}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                            Discount (Rs)
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <ClearableTextField
                                                fullWidth
                                                size="small"
                                                value={billingData.discount}
                                                onChange={(val) => handleBillingChange('discount', val)}
                                                disabled={isFormDisabled}
                                                inputProps={{
                                                    maxLength: 4
                                                }}
                                                placeholder="0.00"
                                                variant="outlined"
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '4px',
                                                        fontSize: '13px',
                                                        backgroundColor: isFormDisabled ? '#f5f5f5' : 'white'
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        color: isFormDisabled ? '#666' : '#333',
                                                        cursor: isFormDisabled ? 'not-allowed' : 'text'
                                                    }
                                                }}
                                                error={!!discountError}
                                                helperText={discountError}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                            Dues (Rs)
                                        </label>
                                        <ClearableTextField
                                            fullWidth
                                            size="small"
                                            value={billingData.dues}
                                            onChange={(val) => handleBillingChange('dues', val)}
                                            disabled
                                            inputProps={{
                                                maxLength: 10
                                            }}
                                            placeholder="0.00"
                                            variant="outlined"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '4px',
                                                    fontSize: '13px',
                                                    backgroundColor: '#f5f5f5'
                                                },
                                                '& .MuiInputBase-input': {
                                                    color: '#666',
                                                    cursor: 'not-allowed'
                                                }
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                            <span>A/C Balance (Rs)</span>
                                            <span
                                                style={{
                                                    color: '#1976d2',
                                                    fontWeight: 'normal',
                                                    fontSize: '11px',
                                                    cursor: 'pointer',
                                                    userSelect: 'none'
                                                }}
                                                onClick={() => setShowAccountsPopup(true)}
                                                title="View Accounts"
                                            >Payment History</span>
                                        </label>
                                        <div style={{ position: 'relative', width: '100%' }}>
                                            <ClearableTextField
                                                fullWidth
                                                size="small"
                                                value={Math.abs(parseFloat(billingData.acBalance) || 0).toFixed(2)}
                                                onChange={(val) => handleBillingChange('acBalance', val)}
                                                disabled
                                                placeholder="0.00"
                                                variant="outlined"
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '4px',
                                                        fontSize: '13px',
                                                        backgroundColor: '#f5f5f5',
                                                        paddingRight: folderAmountData?.totalAcBalance !== undefined &&
                                                            folderAmountData?.totalAcBalance !== null &&
                                                            folderAmountData?.rows &&
                                                            folderAmountData.rows.length > 0 ? '120px' : '10px'
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        color: folderAmountData?.totalAcBalance !== undefined &&
                                                            folderAmountData?.totalAcBalance !== null &&
                                                            folderAmountData?.rows &&
                                                            folderAmountData.rows.length > 0
                                                            ? (folderAmountData.totalAcBalance < 0 ? '#d32f2f' : '#2e7d32')
                                                            : '#666',
                                                        cursor: 'not-allowed'
                                                    }
                                                }}
                                            />
                                            {folderAmountData?.totalAcBalance !== undefined &&
                                                folderAmountData?.totalAcBalance !== null &&
                                                folderAmountData?.rows &&
                                                folderAmountData.rows.length > 0 && (
                                                    <span style={{
                                                        position: 'absolute',
                                                        right: '10px',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        fontSize: '11px',
                                                        fontWeight: 'bold',
                                                        color: '#333', // Always black for status text
                                                        whiteSpace: 'nowrap',
                                                        pointerEvents: 'none'
                                                    }}>
                                                        {folderAmountData.totalAcBalance < 0 ? 'Outstanding' : 'Excess'}
                                                    </span>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '8px',
                                marginTop: '20px',
                                marginBottom: '40px',
                                flexWrap: 'wrap',
                                pointerEvents: 'auto',
                                opacity: 1,
                                position: 'relative',
                                zIndex: 10
                            }}>
                                <button
                                    type="button"
                                    onClick={() => isAddendumEnabled && setShowAddendumModal(true)}
                                    disabled={!isAddendumEnabled}
                                    title="Add an addendum to this visit"
                                    style={{
                                        backgroundColor: isAddendumEnabled ? '#1976d2' : '#ccc',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 12px',
                                        borderRadius: '4px',
                                        cursor: isAddendumEnabled ? 'pointer' : 'not-allowed',
                                        fontSize: '12px',
                                        pointerEvents: 'auto',
                                        opacity: 1,
                                        zIndex: 11,
                                        position: 'relative',
                                        fontWeight: 'bold',
                                        boxShadow: isAddendumEnabled ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
                                        transition: 'background-color 0.2s, box-shadow 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (isAddendumEnabled) {
                                            e.currentTarget.style.backgroundColor = '#1565c0';
                                            e.currentTarget.style.boxShadow = '0 3px 6px rgba(0,0,0,0.3)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (isAddendumEnabled) {
                                            e.currentTarget.style.backgroundColor = '#1976d2';
                                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                                        }
                                    }}
                                >
                                    Addendum
                                </button>
                                <button
                                    type="button"
                                    onClick={handlePrint}
                                    title="Print prescription/report"
                                    style={{
                                        backgroundColor: '#1976d2',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 12px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        opacity: 1,
                                        zIndex: 11,
                                        position: 'relative',
                                        fontWeight: 'bold',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                        transition: 'background-color 0.2s, box-shadow 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#1565c0';
                                        e.currentTarget.style.boxShadow = '0 3px 6px rgba(0,0,0,0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#1976d2';
                                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                                    }}
                                >
                                    Print
                                </button>
                                <button
                                    type="button"
                                    onClick={handleBackToAppointments}
                                    title="Cancel and go back to appointments"
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
                                    onClick={handleTreatmentSave}
                                    disabled={isSubmitting || isFormDisabled}
                                    title="Save treatment"
                                    style={{
                                        backgroundColor: (isSubmitting || isFormDisabled) ? '#ccc' : '#1976d2',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 12px',
                                        borderRadius: '4px',
                                        cursor: (isSubmitting || isFormDisabled) ? 'not-allowed' : 'pointer',
                                        fontSize: '12px'
                                    }}
                                >
                                    {isSubmitting ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleTreatmentSubmit}
                                    disabled={isSubmitting || isFormDisabled}
                                    title="Submit treatment"
                                    style={{
                                        backgroundColor: (isSubmitting || isFormDisabled) ? '#ccc' : '#1976d2',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 12px',
                                        borderRadius: '4px',
                                        cursor: (isSubmitting || isFormDisabled) ? 'not-allowed' : 'pointer',
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
            {
                showPatientFormDialog && (
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
                )
            }

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
                onError={(message) => {
                    setSnackbarMessage(message);
                    setSnackbarOpen(true);
                }}
                doctorId={treatmentData?.doctorId || sessionData?.doctorId}
                clinicId={treatmentData?.clinicId || sessionData?.clinicId}
            />

            {/* Add Prescription Popup */}
            <AddPrescriptionPopup
                open={showPrescriptionPopup}
                onClose={() => setShowPrescriptionPopup(false)}
                onSave={handleSavePrescription}
                doctorId={treatmentData?.doctorId || sessionData?.doctorId}
                clinicId={treatmentData?.clinicId || sessionData?.clinicId}
            />

            {/* Instruction Groups Popup */}
            <InstructionGroupsPopup
                isOpen={showInstructionPopup}
                onClose={() => {
                    if (selectedInstructionGroups && selectedInstructionGroups.length > 0) {
                        selectedInstructionGroups.forEach((group, idx) => {
                            console.log(`Final Group ${idx + 1}:`, {
                                id: group.id,
                                name: group.name,
                                nameHindi: group.nameHindi,
                                instructions: group.instructions
                            });
                        });
                    } else {
                        console.warn('⚠️ selectedInstructionGroups is EMPTY after closing popup!');
                    }
                    setShowInstructionPopup(false);
                }}
                patientName={treatmentData?.patientName || ''}
                patientAge={Number(treatmentData?.age || 0)}
                patientGender={(treatmentData?.gender || '').toString()}
                initialSelectedGroups={selectedInstructionGroups}
                onChange={(groups) => {
                    // Normalize groups to ensure clean format (only id, name, nameHindi, instructions)
                    const normalizedGroups = normalizeInstructionGroups(groups || []);

                    if (normalizedGroups && normalizedGroups.length > 0) {
                        normalizedGroups.forEach((group, idx) => {
                            console.log(`Normalized Group ${idx + 1}:`, {
                                id: group.id,
                                name: group.name,
                                nameHindi: group.nameHindi,
                                instructions: group.instructions
                            });
                        });
                    } else {
                        console.warn('⚠️ Received EMPTY groups array from popup onChange!');
                    }

                    // Store normalized (clean) groups
                    setSelectedInstructionGroups(normalizedGroups);
                }}
            />
            {/* Debug: Log when popup opens */}
            {
                showInstructionPopup && (() => {
                    if (selectedInstructionGroups && selectedInstructionGroups.length > 0) {
                        console.log('selectedInstructionGroups content:', JSON.stringify(selectedInstructionGroups, null, 2));
                        selectedInstructionGroups.forEach((group, idx) => {
                            console.log(`Group ${idx + 1}:`, {
                                id: group.id,
                                name: group.name,
                                nameHindi: group.nameHindi,
                                instructions: group.instructions,
                                hasName: !!group.name,
                                hasInstructions: !!group.instructions
                            });
                        });
                    } else {
                        console.warn('⚠️ selectedInstructionGroups is EMPTY or UNDEFINED!');
                    }
                    return null;
                })()
            }

            {/* Add Test Lab Popup */}
            <AddTestLabPopup
                open={showTestLabPopup}
                onClose={() => setShowTestLabPopup(false)}
                onSave={handleSaveTestLab}
                onError={(message) => {
                    setSnackbarMessage(message);
                    setSnackbarOpen(true);
                }}
                doctorId={treatmentData?.doctorId || sessionData?.doctorId}
                clinicId={treatmentData?.clinicId || sessionData?.clinicId}
            />

            {/* Addendum Modal */}
            {
                showAddendumModal && (
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
                                fontSize: 16,
                                textDecoration: 'underline'
                            }}>
                                {treatmentData?.patientName || 'Patient'} / {treatmentData?.gender || 'N/A'} / {treatmentData?.age ? `${treatmentData.age} Y` : 'N/A'} / {treatmentData?.contact || 'N/A'}
                            </div>

                            <div style={{ padding: 16 }}>
                                <div style={{ fontWeight: 600, color: '#2e7d32', marginBottom: 8 }}>Addendum:</div>
                                <ClearableTextField
                                    multiline
                                    rows={5}
                                    fullWidth
                                    value={addendumText}
                                    onChange={(val) => {
                                        const text = val.slice(0, 1000);
                                        setAddendumText(text);
                                    }}
                                    placeholder="Type addendum..."
                                    variant="outlined"
                                    size="small"
                                    inputProps={{
                                        maxLength: 1000
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 6,
                                            fontSize: 13,
                                            backgroundColor: 'white'
                                        },
                                        '& .MuiInputBase-input': {
                                            color: '#333'
                                        }
                                    }}
                                    helperText="Maximum 1000 character"
                                />

                                <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddendumModal(false)}
                                        title="Close addendum"
                                        style={{ backgroundColor: 'rgb(24, 120, 215)', color: '#fff', border: '1px solid #cfd8dc', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAddendumText('')}
                                        title="Reset addendum"
                                        style={{ backgroundColor: 'rgb(25, 118, 210)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                                    >
                                        Reset
                                    </button>
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
                                        title="Submit addendum"
                                        style={{ backgroundColor: '#1976d2', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                                    >
                                        Submit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            <AddBillingPopup
                open={showBillingPopup}
                onClose={() => setShowBillingPopup(false)}
                isFormDisabled={isFormDisabled}
                onSubmit={(totalAmount) => {
                    if (isFormDisabled) {
                        return;
                    }
                    setBillingData(prev => {
                        const discountNum = parseFloat(prev.discount) || 0;
                        const billedNum = Number(totalAmount) || 0;
                        const acBal = Math.max(0, billedNum - discountNum);
                        return {
                            ...prev,
                            billed: billedNum.toFixed(2),
                            dues: acBal.toFixed(2)
                        };
                    });
                }}
                onTotalFeesChange={(total) => {
                    if (isFormDisabled) {
                        return;
                    }
                    const billedNum = Number(total) || 0;
                    const discountNum = parseFloat(billingData.discount) || 0;

                    let newError: string | null = null;
                    if (discountNum > 0 && discountNum > billedNum) {
                        newError = 'Discount cannot be greater than billed amount';
                    }
                    setDiscountError(newError);

                    setBillingData(prev => {
                        const acBal = Math.max(0, billedNum - discountNum);
                        return {
                            ...prev,
                            billed: billedNum.toFixed(2),
                            dues: acBal.toFixed(2)
                        };
                    });
                }}
                billingSearch={billingSearch}
                setBillingSearch={setBillingSearch}
                filteredBillingDetails={filteredBillingDetails}
                selectedBillingDetailIds={selectedBillingDetailIds}
                setSelectedBillingDetailIds={setSelectedBillingDetailIds}
                followUp={formData.visitType.followUp}
                userId={sessionData?.userId ? String(sessionData.userId) : undefined}
                doctorId={treatmentData?.doctorId || sessionData?.doctorId}
                patientId={treatmentData?.patientId}
                clinicId={sessionData?.clinicId || treatmentData?.clinicId}
                visitDate={toYyyyMmDd(new Date())}
                patientVisitNo={treatmentData?.visitNumber}
                shiftId={(sessionData as any)?.shiftId || 1}
                useOverwrite={false}
                discount={billingData.discount}
                discountError={discountError}
                setDiscountError={setDiscountError}
            />

            {
                showLabTestEntry && selectedPatientForLab && (
                    <LabTestEntry
                        open={true}
                        onClose={() => {
                            setShowLabTestEntry(false);
                            setSelectedPatientForLab(null);
                        }}
                        patientData={selectedPatientForLab}
                        appointment={selectedPatientForLab}
                        sessionData={sessionData}
                        onLabTestResultsFetched={handleLabTestResultsFetched}
                    />
                )
            }

            {/* Past Services Popup */}
            <PastServicesPopup
                open={showPastServicesPopup}
                onClose={() => {
                    setShowPastServicesPopup(false);
                    setSelectedPastServiceDate(null);
                }}
                date={selectedPastServiceDate}
                patientData={treatmentData ? {
                    patientName: treatmentData.patientName,
                    gender: treatmentData.gender,
                    age: treatmentData.age,
                    patientId: treatmentData.patientId
                } : null}
                sessionData={sessionData}
            />

            {/* Accounts Popup */}
            <AccountsPopup
                open={showAccountsPopup}
                onClose={() => setShowAccountsPopup(false)}
                patientId={(() => {
                    const pid = selectedPatientForForm?.id || selectedPatientForForm?.patientId || treatmentData?.patientId;
                    const result = pid ? String(pid) : undefined;
                    return result;
                })()}
                patientName={selectedPatientForForm?.name || treatmentData?.patientName}
            />

            {/* Lab Trend Popup */}
            <LabTrendPopup
                open={showLabTrendPopup}
                onClose={() => setShowLabTrendPopup(false)}
                patientId={treatmentData?.patientId || ''}
                patientName={treatmentData?.patientName || ''}
                gender={treatmentData?.gender || ''}
                age={treatmentData?.age || 0}
                doctorId={treatmentData?.doctorId || sessionData?.doctorId}
                clinicId={treatmentData?.clinicId || sessionData?.clinicId || ''}
                visitDate={new Date().toISOString().split('T')[0]}
                shiftId={(sessionData as any)?.shiftId || 1}
                patientVisitNo={treatmentData?.visitNumber || 0}
            />

            {/* Vitals Trend Popup */}
            <VitalsTrendPopup
                open={showVitalsTrend}
                onClose={() => setShowVitalsTrend(false)}
                patientId={treatmentData?.patientId}
                clinicId={treatmentData?.clinicId || sessionData?.clinicId}
                doctorId={treatmentData?.doctorId || sessionData?.doctorId}
                visitNumber={treatmentData?.visitNumber}
            />

            {/* Quick Registration Modal - appears on top of Treatment screen */}
            {
                showQuickRegistration && treatmentData?.patientId && (
                    <AddPatientPage
                        open={showQuickRegistration}
                        onClose={() => {
                            setShowQuickRegistration(false);
                        }}
                        patientId={String(treatmentData.patientId)}
                        readOnly={true}
                        doctorId={treatmentData?.doctorId || sessionData?.doctorId}
                        clinicId={treatmentData?.clinicId || sessionData?.clinicId}
                    />
                )
            }

            {/* Success/Error Snackbar - Always rendered at bottom center */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={2000}
                onClose={() => {
                    setSnackbarOpen(false);
                }}
                message={snackbarMessage}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                sx={{
                    zIndex: 99999, // Ensure snackbar appears above everything
                    '& .MuiSnackbarContent-root': {
                        backgroundColor: snackbarMessage.toLowerCase().includes('error') ||
                            snackbarMessage.toLowerCase().includes('failed') ||
                            snackbarMessage.toLowerCase().includes('already added') ||
                            snackbarMessage.toLowerCase().includes('required') ||
                            snackbarMessage.toLowerCase().includes('must be') ||
                            snackbarMessage.toLowerCase().includes('cannot exceed') ? '#f44336' : '#4caf50',
                        color: 'white',
                        fontWeight: 'bold'
                    }
                }}
            />

        </div >
    );
}