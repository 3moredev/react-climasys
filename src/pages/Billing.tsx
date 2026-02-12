import React, { useState, useEffect, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useLocation } from "react-router-dom";
import { visitService, ComprehensiveVisitDataRequest } from '../services/visitService';
import { sessionService, SessionInfo } from "../services/sessionService";
import { Download as DownloadIcon } from '@mui/icons-material';
import { Snackbar, Box, Typography, TextField, MenuItem } from '@mui/material';
import { complaintService, ComplaintOption } from "../services/complaintService";
import { medicineService, MedicineOption } from "../services/medicineService";
import { diagnosisService, DiagnosisOption } from "../services/diagnosisService";
import { investigationService, InvestigationOption } from "../services/investigationService";
import { appointmentService } from "../services/appointmentService";
import { getFollowUpTypes, FollowUpTypeItem } from "../services/referenceService";
import { patientService, MasterListsRequest, SaveMedicineOverwriteRequest } from "../services/patientService";
import PatientFormTest from "../components/Test/PatientFormTest";
import PastServicesPopup from "../components/PastServicesPopup";
import { DocumentService } from "../services/documentService";
import { SaveReceiptPayload } from "../services/receiptService";
import AccountsPopup from "../components/AccountsPopup";
import AddBillingPopup from "../components/AddBillingPopup";
import AddPatientPage from "./AddPatientPage";
import { buildPrescriptionPrintHTML, buildLabTestsPrintHTML, getHeaderImageUrl } from "../utils/printTemplates";
import PrintReceiptPopup, { PrintReceiptFormValues } from "../components/PrintReceiptPopup";
import ClearableTextField from "../components/ClearableTextField";


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
    const [billingError, setBillingError] = useState<string | null>(null);
    const [discountError, setDiscountError] = useState<string | null>(null);
    const [collectedError, setCollectedError] = useState<string | null>(null);
    const [reasonError, setReasonError] = useState<string | null>(null);
    const [paymentByError, setPaymentByError] = useState<string | null>(null);
    const [paymentRemarkError, setPaymentRemarkError] = useState<string | null>(null);
    const [isFormDisabled, setIsFormDisabled] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [hasSubmittedSuccessfully, setHasSubmittedSuccessfully] = useState<boolean>(false);
    const [statusId, setStatusId] = useState<number>(9);

    // Update isFormDisabled based on statusId (5 = Complete)
    useEffect(() => {
        setIsFormDisabled(statusId === 5);
    }, [statusId]);

    // Form data state
    const [formData, setFormData] = useState({
        referralBy: 'Self',
        visitType: {
            inPerson: true, // Always true and disabled (not user-editable) in Billing page
            followUp: false,
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
    const [showQuickRegistration, setShowQuickRegistration] = useState(false);
    const [showPatientFormDialog, setShowPatientFormDialog] = useState(false);
    const [formPatientData, setFormPatientData] = useState<any>(null);
    const [selectedPatientForForm, setSelectedPatientForForm] = useState<any>(null);
    const [allVisits, setAllVisits] = useState<any[]>([]);
    const [visitDates, setVisitDates] = useState<string[]>([]);
    const [currentVisitIndex, setCurrentVisitIndex] = useState(0);
    const [previousVisitsError, setPreviousVisitsError] = useState<string | null>(null);
    const [allDoctors, setAllDoctors] = useState<any[]>([]);

    // Past Services dates (service visits)
    const [pastServiceDates, setPastServiceDates] = useState<string[]>([]);
    const [loadingPastServices, setLoadingPastServices] = useState<boolean>(false);
    const [pastServicesError, setPastServicesError] = useState<string | null>(null);
    const [showPastServicesPopup, setShowPastServicesPopup] = useState(false);
    const [selectedPastServiceDate, setSelectedPastServiceDate] = useState<string | null>(null);
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

    // Accounts popup state
    const [showAccountsPopup, setShowAccountsPopup] = useState<boolean>(false);

    // Billing popup state
    const [showBillingPopup, setShowBillingPopup] = useState<boolean>(false);
    const [showPrintReceiptPopup, setShowPrintReceiptPopup] = useState<boolean>(false);

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

    const [diagnosisRows, setDiagnosisRows] = useState<DiagnosisRow[]>([]);
    const [medicineRows, setMedicineRows] = useState<MedicineRow[]>([]);
    const [prescriptionRows, setPrescriptionRows] = useState<PrescriptionRow[]>([]);
    const [selectedDiagnosis, setSelectedDiagnosis] = useState('');

    // Investigation multi-select state (mirrors Diagnosis)
    const [selectedInvestigations, setSelectedInvestigations] = useState<string[]>([]);
    const [investigationSearch, setInvestigationSearch] = useState('');
    const [isInvestigationsOpen, setIsInvestigationsOpen] = useState(false);
    const investigationsRef = React.useRef<HTMLDivElement | null>(null);
    const [investigationsOptions, setInvestigationsOptions] = useState<InvestigationOption[]>([]);
    const [investigationsLoading, setInvestigationsLoading] = useState(false);
    const [investigationsError, setInvestigationsError] = useState<string | null>(null);

    // Previous visit prescriptions state
    const [previousVisitPrescriptions, setPreviousVisitPrescriptions] = useState<PrescriptionRow[]>([]);

    // Additional form data
    const [followUpData, setFollowUpData] = useState({
        followUpType: '',
        followUp: '',
        followUpDate: '',
        remarkComments: '',
        planAdv: '',
        fud: '',
    });
    // Store followUpDescription for later matching when options load
    const [storedFollowUpDescription, setStoredFollowUpDescription] = useState<string>('');

    // Follow-up types data
    const [followUpTypesOptions, setFollowUpTypesOptions] = useState<FollowUpTypeItem[]>([]);

    // Master list driven display data for tables
    const [mlComplaints, setMlComplaints] = useState<Array<{ label: string; comment?: string }>>([]);
    const [mlDiagnosis, setMlDiagnosis] = useState<Array<{ label: string }>>([]);
    const [mlMedicinesTable, setMlMedicinesTable] = useState<PrescriptionRow[]>([]);
    const [mlPrescriptionsTable, setMlPrescriptionsTable] = useState<PrescriptionRow[]>([]);
    const [mlInstructionsTable, setMlInstructionsTable] = useState<PrescriptionRow[]>([]);
    const [mlTestsTable, setMlTestsTable] = useState<string[]>([]);
    // Store labTestsAsked from master-lists API for print
    const labTestsAskedRef = React.useRef<any[]>([]);


    const [billingData, setBillingData] = useState({
        billed: '',
        discount: '',
        acBalance: '',
        dues: '',
        receiptNo: '',
        paymentBy: '',
        feesCollected: '',
        paymentRemark: '',
        receiptDate: '',
        reason: ''
    });

    // Folder amount API response data
    const [folderAmountData, setFolderAmountData] = useState<{
        success?: boolean;
        totalAcBalance?: number;
        rows?: any[];
    } | null>(null);

    // Ref to track if folder-amount API has set acBalance (to prevent master-lists from overwriting)
    const folderAmountSetRef = React.useRef<boolean>(false);

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
        } catch (e) {
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

        const examinationFindings = escapeHtml(formData.examinationFindings || '-');
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
        const advice = escapeHtml(formData.additionalComments || '');

        // Build instructions HTML from mlInstructionsTable
        let instructionsHTML = '';
        if (mlInstructionsTable && mlInstructionsTable.length > 0) {
            instructionsHTML = mlInstructionsTable.map((row) => {
                if (!row.instruction || !row.instruction.trim()) {
                    return '';
                }
                const groupName = row.prescription ? escapeHtml(row.prescription) : '';
                let instructionText = row.instruction.trim();

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

        // Build prescription table HTML (only print if prescriptionRows has data, same as Treatment.tsx)
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

        // Print within the same tab using a hidden iframe (mirrors Treatment)
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        iframe.srcdoc = printHTML;
        document.body.appendChild(iframe);

        // Flag to track if we've already triggered lab results print
        let labResultsPrinted = false;

        // Function to handle printing lab results after prescription print
        const handleLabResultsPrint = () => {
            // Use ref to get labTestsAsked from API
            const currentLabTestsAsked = labTestsAskedRef.current;

            if (!labResultsPrinted) {
                // Check if labTestsAsked exist using ref
                if (currentLabTestsAsked && Array.isArray(currentLabTestsAsked) && currentLabTestsAsked.length > 0) {
                    labResultsPrinted = true;
                    console.log('✅ Triggering lab test results print with', currentLabTestsAsked.length, 'lab tests...');
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
                        console.log('✅ afterprint event detected');
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

                    // Method 3: Simple timeout fallback
                    win.focus();
                    win.print();

                    // Fallback timeout - triggers second print after 2 seconds
                    setTimeout(() => {
                        if (!labResultsPrinted) {
                            console.log('✅ Fallback timeout: triggering lab results print');
                            window.removeEventListener('blur', handleWindowBlur);
                            window.removeEventListener('focus', handleWindowFocus);
                            window.removeEventListener('afterprint', handleAfterPrint);
                            cleanup();
                            handleLabResultsPrint();
                        }
                    }, 2000);
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
        // Use ref to get labTestsAsked from API
        const currentLabTestsAsked = labTestsAskedRef.current;

        if (!currentLabTestsAsked || !Array.isArray(currentLabTestsAsked) || currentLabTestsAsked.length === 0) {
            return;
        }

        console.log('✅ Starting lab test results print with', currentLabTestsAsked.length, 'lab tests...');

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

    // Billing details (from symptom-data API)
    const [billingDetailsOptions, setBillingDetailsOptions] = useState<BillingDetailOption[]>([]);
    const [selectedBillingDetailIds, setSelectedBillingDetailIds] = useState<string[]>([]);
    const [billingSearch, setBillingSearch] = useState('');
    const billingRef = React.useRef<HTMLDivElement | null>(null);
    const masterListsBillingRef = React.useRef<any[]>([]);

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

    // Consolidate data fetching and matching to prevent race conditions
    useEffect(() => {
        let cancelled = false;

        async function loadAllData() {
            const doctorId = treatmentData?.doctorId || sessionData?.doctorId;
            const clinicId = sessionData?.clinicId || treatmentData?.clinicId; // fallback if needed
            const patientId = treatmentData?.patientId;
            const visitNumber = treatmentData?.visitNumber;
            const shiftId = (sessionData as any)?.shiftId ?? 1;

            // We need at least doctor and clinic to load billing options
            if (!doctorId || !clinicId) return;

            try {
                // 1. Define Fetch for Billing Options
                const fetchBillingOptions = async () => {
                    const encDr = encodeURIComponent(doctorId);
                    const encCl = encodeURIComponent(clinicId);
                    const resp = await fetch(`/api/refdata/symptom-data?doctorId=${encDr}&clinicId=${encCl}`);
                    if (!resp.ok) throw new Error(`Failed to load billing details (${resp.status})`);
                    const data = await resp.json();
                    const raw: any[] = Array.isArray(data?.billingDetails)
                        ? data.billingDetails
                        : Array.isArray(data?.resultSet2) ? data.resultSet2 : [];
                    return raw.map((item: any, idx: number) => ({
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
                };

                // 2. Define Fetch for Master Lists (only if patient context exists)
                const fetchMasterListsData = async () => {
                    if (!patientId || !visitNumber) return null;
                    const params: MasterListsRequest = {
                        patientId: String(patientId),
                        shiftId: Number(shiftId),
                        clinicId: String(clinicId),
                        doctorId: String(doctorId),
                        visitDate: new Date().toISOString().slice(0, 10),
                        patientVisitNo: Number(visitNumber)
                    };
                    console.log('Requesting master lists with:', params);
                    return await patientService.getMasterLists(params);
                };

                // 3. Execute Fetches in Parallel
                const [billingOptions, masterListsResp] = await Promise.all([
                    fetchBillingOptions(),
                    fetchMasterListsData()
                ]);

                if (cancelled) return;

                // --- Apply Billing Options ---
                setBillingDetailsOptions(billingOptions);

                // --- Apply Master Lists Data (if available) ---
                if (masterListsResp) {
                    const resp = masterListsResp; // Alias for compatibility with existing logic
                    console.log('Master lists (Billing):', resp);

                    // Patch vitals (from resp.data.vitals[0]) into form fields
                    try {
                        const vitals = (resp as any)?.data?.vitals?.[0];
                        const dataRoot = (resp as any)?.data || {};
                        const safeToStr = (v: any) => (v === undefined || v === null ? '' : String(v));

                        // ... (Processing Vitals and UI Fields) ...
                        const dressingFromMaster = Array.isArray(dataRoot?.dressing) ? dataRoot.dressing : [];
                        const dressingCombined = dressingFromMaster
                            .map((d: any) =>
                                safeToStr(d?.dressing_description ?? d?.short_description ?? d?.longdressing_description ?? d).trim()
                            )
                            .filter((text: string) => text.length > 0)
                            .join(', ');

                        if (vitals && typeof vitals === 'object') {
                            setFormData(prev => ({
                                ...prev,
                                // Map vitals exactly as before
                                height: vitals.height_in_cms !== undefined ? String(vitals.height_in_cms) : prev.height,
                                weight: vitals.weight_in_kgs !== undefined ? String(vitals.weight_in_kgs) : prev.weight,
                                pulse: vitals.pulse !== undefined ? String(vitals.pulse) : prev.pulse,
                                bp: vitals.blood_pressure !== undefined ? String(vitals.blood_pressure) : prev.bp,
                                sugar: vitals.sugar !== undefined ? String(vitals.sugar) : prev.sugar,
                                tft: vitals.thtext !== undefined ? String(vitals.thtext) : prev.tft,
                                pallorHb: vitals.pallor !== undefined ? String(vitals.pallor) : prev.pallorHb,
                                allergy: vitals.allergy_dtls !== undefined ? String(vitals.allergy_dtls) : prev.allergy,
                                medicalHistoryText: vitals.habits_comments !== undefined ? String(vitals.habits_comments) : prev.medicalHistoryText,
                                visitComments: vitals.visit_comments !== undefined ? String(vitals.visit_comments) : prev.visitComments,
                                detailedHistory: vitals.symptom_comment !== undefined ? String(vitals.symptom_comment) : prev.detailedHistory,
                                surgicalHistory: vitals.surgical_history_past_history !== undefined ? String(vitals.surgical_history_past_history) : prev.surgicalHistory,
                                procedurePerformed: vitals.observation !== undefined ? String(vitals.observation) : prev.procedurePerformed,
                                examinationFindings: vitals.important_findings !== undefined ? String(vitals.important_findings) : prev.examinationFindings,
                                additionalComments: vitals.impression !== undefined ? String(vitals.impression) : prev.additionalComments,
                                medicines: vitals.current_medicines !== undefined ? String(vitals.current_medicines) : prev.medicines,
                                dressingBodyParts: dressingCombined || prev.dressingBodyParts,
                                visitType: {
                                    ...prev.visitType,
                                    inPerson: vitals.in_person !== undefined ? Boolean(vitals.in_person) : prev.visitType.inPerson
                                    // followUp will be set separately based on previous visits
                                },
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
                                const followUpDesc = (uiFields?.followUpDescription ?? vitals?.follow_up_description ?? vitals?.followUpDescription ?? '') as string;

                                if (followUpDesc) {
                                    setStoredFollowUpDescription(followUpDesc);
                                }

                                let fuTypeId = '';
                                if (followUpDesc && followUpTypesOptions.length > 0) {
                                    const matchedOption = followUpTypesOptions.find(
                                        opt => opt.followUpDescription?.toLowerCase() === followUpDesc.toLowerCase() ||
                                            opt.followUpDescription === followUpDesc
                                    );
                                    if (matchedOption) fuTypeId = matchedOption.id;
                                }
                                if (!fuTypeId) {
                                    fuTypeId = (uiFields?.followUpType ?? vitals.follow_up_type ?? '') as any;
                                }
                                const fuDate = (uiFields?.followUpDate ?? vitals.follow_up_date ?? '') as any;
                                setFollowUpData(prev => ({
                                    ...prev,
                                    followUpType: fuTypeId ? String(fuTypeId) : prev.followUpType,
                                    followUp: vitals.follow_up_comment !== undefined ? String(vitals.follow_up_comment) : prev.followUp,
                                    followUpDate: fuDate ? String(fuDate) : prev.followUpDate,
                                    planAdv: vitals.instructions !== undefined ? String(vitals.instructions) : prev.planAdv,
                                    fud: vitals.follow_up_type !== undefined ? String(vitals.follow_up_type) : prev.fud
                                }));

                                // Billing Fields from master list
                                setBillingData(prev => {
                                    const billedValue = uiFields?.billedRs ?? vitals?.fees_to_collect ?? vitals?.Fees_To_Collect ?? prev.billed;
                                    const billedStr = billedValue !== undefined && billedValue !== null ? String(billedValue) : prev.billed;
                                    const acBalanceValue = folderAmountSetRef.current ? prev.acBalance :
                                        (uiFields?.acBalanceRs !== undefined && uiFields?.acBalanceRs !== null ? String(uiFields.acBalanceRs) : prev.acBalance);
                                    const collectedValue = dataRoot?.collectedRs ?? uiFields?.feesCollected ?? uiFields?.collectedRs ?? prev.feesCollected;
                                    const collectedStr = collectedValue !== undefined && collectedValue !== null ? String(collectedValue) : prev.feesCollected;

                                    let receiptDateStr = prev.receiptDate;
                                    if (uiFields?.receiptDate !== undefined && uiFields?.receiptDate !== null) {
                                        try {
                                            const receiptDate = new Date(uiFields.receiptDate);
                                            if (!isNaN(receiptDate.getTime())) {
                                                receiptDateStr = receiptDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
                                            } else {
                                                receiptDateStr = String(uiFields.receiptDate);
                                            }
                                        } catch (e) {
                                            receiptDateStr = String(uiFields.receiptDate);
                                        }
                                    }

                                    const paymentByValue = uiFields?.paymentBy !== undefined && uiFields?.paymentBy !== null ? String(uiFields.paymentBy) : prev.paymentBy;
                                    const paymentRemarkValue = uiFields?.paymentRemark !== undefined ? (uiFields.paymentRemark !== null ? String(uiFields.paymentRemark) : '') : prev.paymentRemark;
                                    const reasonValue = vitals?.comment ?? uiFields?.reason ?? uiFields?.Reason ?? dataRoot?.reason ?? dataRoot?.Reason ?? prev.reason;
                                    const reasonStr = reasonValue !== undefined && reasonValue !== null ? String(reasonValue) : prev.reason;

                                    return {
                                        ...prev,
                                        billed: billedStr,
                                        discount: uiFields?.discountRs !== undefined && uiFields?.discountRs !== null ? String(uiFields.discountRs) : prev.discount,
                                        dues: uiFields?.duesRs !== undefined && uiFields?.duesRs !== null ? String(uiFields.duesRs) : prev.dues,
                                        acBalance: acBalanceValue,
                                        receiptNo: uiFields?.receiptNo !== undefined && uiFields?.receiptNo !== null ? String(uiFields.receiptNo) : prev.receiptNo,
                                        receiptDate: receiptDateStr,
                                        feesCollected: collectedStr,
                                        paymentRemark: paymentRemarkValue,
                                        paymentBy: paymentByValue,
                                        reason: reasonStr
                                    };
                                });

                                const loadedStatusId = vitals?.statusId ?? vitals?.status_id ?? uiFields?.statusId ?? dataRoot?.statusId;
                                if (loadedStatusId !== undefined && loadedStatusId !== null) {
                                    setStatusId(Number(loadedStatusId));
                                }
                            } catch (_) { /* ignore */ }
                        }

                        // Patch Table Data
                        const mlComplaintsArr = Array.isArray(dataRoot?.complaints) ? dataRoot.complaints : [];
                        setMlComplaints(mlComplaintsArr.map((c: any) => ({
                            label: safeToStr(c?.complaint_description ?? c?.label ?? c?.name ?? c?.complaint ?? c?.description ?? ''),
                            comment: safeToStr(c?.complaint_comment ?? c?.comment ?? c?.remarks ?? '')
                        })).filter((c: any) => c.label));

                        const mlDiagArr = Array.isArray(dataRoot?.diagnosis) ? dataRoot.diagnosis : [];
                        setMlDiagnosis(mlDiagArr.map((d: any) => ({
                            label: safeToStr(d?.desease_description ?? d?.description ?? d?.diagnosis ?? d?.name ?? d?.label ?? '')
                        })).filter((d: any) => d.label));

                        // ... Map Prescriptions ...
                        const mapToRxRow = (p: any, idx: number, prefix: string): PrescriptionRow => {
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
                        const mappedPrescriptions = mlRxArr.map((p: any, idx: number) => mapToRxRow(p, idx, 'mlrx')).filter((r: PrescriptionRow) => !!r.prescription);
                        setMlPrescriptionsTable(mappedPrescriptions);
                        setPrescriptionRows(mappedPrescriptions.length > 0 ? mappedPrescriptions : []);

                        // ... Map Instructions ...
                        const instrArrRaw = Array.isArray((dataRoot as any)?.instructions) ? (dataRoot as any).instructions :
                            (Array.isArray((dataRoot as any)?.Instructions) ? (dataRoot as any).Instructions :
                                (Array.isArray((dataRoot as any)?.Instrctions) ? (dataRoot as any).Instrctions : []));

                        const instructionRows: PrescriptionRow[] = instrArrRaw.map((p: any, idx: number) => {
                            const groupName = safeToStr(p?.group_description ?? p?.Group_Description ?? '');
                            const instructionText = safeToStr(p?.instructions_description ?? p?.Instructions_Description ?? p?.instruction ?? p?.Instructions ?? '');
                            const title = groupName || safeToStr(p?.prescription ?? p?.name ?? '');
                            return { id: `mlins_${idx}`, prescription: title, b: '', l: '', d: '', days: '', instruction: instructionText };
                        }).filter((r: PrescriptionRow) => r.prescription || r.instruction);
                        setMlInstructionsTable(instructionRows);

                        const testsArr = Array.isArray(dataRoot?.labTestsAsked) ? dataRoot.labTestsAsked : [];
                        setMlTestsTable(testsArr.map((t: any) => safeToStr(t?.id ?? t?.name ?? t?.testName ?? t?.label ?? t)).filter((s: string) => !!s));
                        if (Array.isArray(testsArr) && testsArr.length > 0) {
                            labTestsAskedRef.current = testsArr;
                        } else {
                            labTestsAskedRef.current = [];
                        }

                        // Store billing array from master-lists API
                        const billingArray = Array.isArray(dataRoot?.billing) ? dataRoot.billing : [];
                        if (Array.isArray(billingArray) && billingArray.length > 0) {
                            masterListsBillingRef.current = billingArray;
                        } else {
                            masterListsBillingRef.current = [];
                        }
                    } catch (e) {
                        console.warn('Billing: Error processing master list data', e);
                    }
                }

                // --- Execute Matching Logic (consolidated) ---
                if (masterListsResp && billingOptions.length > 0) {
                    const billingArray = masterListsBillingRef.current; // already set above from masterListsResp
                    console.log('Matching billing items. Options:', billingOptions.length, 'Master-lists:', billingArray.length);

                    const matchedIds: string[] = [];
                    billingArray.forEach((billingItem: any) => {
                        const itemGroup = (billingItem.billing_group_name || '').trim().toLowerCase();
                        const itemSubgroup = (billingItem.billing_subgroup_name || '').trim().toLowerCase();
                        const itemDetails = (billingItem.billing_details || '').trim().toLowerCase();

                        let match = billingOptions.find((opt: any) => {
                            const optGroup = (opt.billing_group_name || '').trim().toLowerCase();
                            const optSubgroup = (opt.billing_subgroup_name || '').trim().toLowerCase();
                            const optDetails = (opt.billing_details || '').trim().toLowerCase();
                            return optGroup === itemGroup && optSubgroup === itemSubgroup && optDetails === itemDetails;
                        });

                        if (!match) {
                            match = billingOptions.find((opt: any) => {
                                const optGroup = (opt.billing_group_name || '').trim().toLowerCase();
                                const optSubgroup = (opt.billing_subgroup_name || '').trim().toLowerCase();
                                return optGroup === itemGroup && optSubgroup === itemSubgroup;
                            });
                        }

                        if (match) matchedIds.push(match.id);
                    });

                    if (matchedIds.length > 0) {
                        setSelectedBillingDetailIds(matchedIds);
                        console.log('Pre-selected billing IDs:', matchedIds);

                        // Calculate total fees
                        const totalFees = matchedIds.reduce((sum: number, id: string) => {
                            const opt = billingOptions.find((o: any) => o.id === id);
                            if (!opt) return sum;

                            const matchingItem = billingArray.find((item: any) => {
                                const itemGroup = (item.billing_group_name || '').trim().toLowerCase();
                                const itemSubgroup = (item.billing_subgroup_name || '').trim().toLowerCase();
                                const optGroup = (opt.billing_group_name || '').trim().toLowerCase();
                                const optSubgroup = (opt.billing_subgroup_name || '').trim().toLowerCase();
                                if (itemGroup !== optGroup || itemSubgroup !== optSubgroup) return false;
                                const itemDetails = (item.billing_details || '').trim().toLowerCase();
                                const optDetails = (opt.billing_details || '').trim().toLowerCase();
                                return !itemDetails || !optDetails || itemDetails === optDetails;
                            });

                            const fee = matchingItem?.collected_fees ?? matchingItem?.collectedFees ?? opt.default_fees ?? 0;
                            return sum + Number(fee);
                        }, 0);

                        console.log('Calculated total fees:', totalFees.toFixed(2));
                        setBillingData(prev => ({
                            ...prev,
                            // Only update billed if it wasn't already manually set? 
                            // Actually, if we are loading fresh, we should trust the calculated fees especially if they come from master lists.
                            billed: totalFees > 0 ? totalFees.toFixed(2) : prev.billed
                        }));
                    }
                }

            } catch (error) {
                console.error('Error loading initial billing data:', error);
            }
        }

        loadAllData();
        return () => { cancelled = true; };
    }, [treatmentData?.doctorId, sessionData?.clinicId, treatmentData?.patientId, treatmentData?.visitNumber]);

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

            try {
                const options = await getFollowUpTypes();
                if (!cancelled) {
                    setFollowUpTypesOptions(options);
                }
            } catch (error: any) {
                console.error('Error loading follow-up types:', error);
            }
        }

        loadFollowUpTypes();
        return () => { cancelled = true; };
    }, []);

    // Re-patch follow-up type when options become available and we have a stored description
    React.useEffect(() => {
        if (storedFollowUpDescription && followUpTypesOptions.length > 0) {
            const matchedOption = followUpTypesOptions.find(
                opt => opt.followUpDescription?.toLowerCase() === storedFollowUpDescription.toLowerCase() ||
                    opt.followUpDescription === storedFollowUpDescription
            );
            if (matchedOption) {
                setFollowUpData(prev => {
                    // Only update if the ID is different to avoid unnecessary re-renders
                    if (prev.followUpType !== matchedOption.id) {
                        return {
                            ...prev,
                            followUpType: matchedOption.id
                        };
                    }
                    return prev;
                });
            }
        }
    }, [followUpTypesOptions, storedFollowUpDescription]);

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
                    // doctorId: 'DR-00C10',
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

    const paymentByLabel = React.useMemo(() => {
        const match = paymentByOptions.find(opt => opt.value === billingData.paymentBy);
        return match?.label || '';
    }, [paymentByOptions, billingData.paymentBy]);

    const receiptDetailsText = React.useMemo(() => {
        if (selectedBillingDetailIds.length === 0) return '';

        const billingArray = masterListsBillingRef.current || [];

        const parts = selectedBillingDetailIds
            .map(id => {
                const opt = billingDetailsOptions.find(o => o.id === id);
                if (!opt) return '';

                // Try to find matching item in master list to get collected_fees if available
                const existingItem = billingArray.find((item: any) => {
                    const optGroup = (opt.billing_group_name || '').trim().toLowerCase();
                    const optSubgroup = (opt.billing_subgroup_name || '').trim().toLowerCase();
                    const optDetails = (opt.billing_details || '').trim().toLowerCase();

                    const itemGroup = (item.billing_group_name || '').trim().toLowerCase();
                    const itemSubgroup = (item.billing_subgroup_name || '').trim().toLowerCase();
                    const itemDetails = (item.billing_details || '').trim().toLowerCase();

                    return optGroup === itemGroup && optSubgroup === itemSubgroup && optDetails === itemDetails;
                });

                const fee = existingItem?.collected_fees ?? existingItem?.collectedFees ?? opt.default_fees ?? 0;

                // Build string
                const group = (opt.billing_group_name || '').toString().trim();
                const subgroup = (opt.billing_subgroup_name || '').toString().trim();
                const amountText = fee > 0 ? `Rs.${Number(fee).toFixed(2)}` : '';

                const labelParts: string[] = [];
                if (group) labelParts.push(group);
                if (subgroup) labelParts.push(subgroup);
                if (amountText) labelParts.push(amountText);

                return labelParts.join(' - ');
            })
            .filter(Boolean);

        return parts.join(', ');
    }, [selectedBillingDetailIds, billingDetailsOptions]);

    const buildReceiptPayload = React.useCallback((detailsOverride?: string): SaveReceiptPayload | null => {
        if (!treatmentData?.patientId || !treatmentData?.visitNumber) {
            console.warn('Cannot build receipt payload - missing patient data', { treatmentData });
            return null;
        }

        const clinicId = treatmentData.clinicId || sessionData?.clinicId;
        const doctorId = treatmentData.doctorId || sessionData?.doctorId;
        const userId = sessionData?.userId;

        if (!clinicId || !doctorId || !userId) {
            return null;
        }

        const patientVisitNo = Number(treatmentData.visitNumber);
        if (!Number.isFinite(patientVisitNo) || patientVisitNo <= 0) {
            console.warn('Cannot build receipt payload - invalid patient visit number', { patientVisitNo });
            return null;
        }

        const billedAmount = parseFloat(billingData.billed) || 0;
        const discountAmount = parseFloat(billingData.discount) || 0;
        const collectedAmount = parseFloat(billingData.feesCollected) || 0;
        const receiptAmountRaw = collectedAmount > 0 ? collectedAmount : billedAmount - discountAmount;
        const receiptAmount = Math.max(0, receiptAmountRaw);

        if (receiptAmount <= 0) {
            return null;
        }

        const shiftIdRaw = Number((sessionData as any)?.shiftId ?? 1);
        const shiftId = Number.isFinite(shiftIdRaw) ? shiftIdRaw : 1;
        const todayIsoDate = new Date().toISOString().slice(0, 10);
        const parsedPaymentById = billingData.paymentBy ? parseInt(billingData.paymentBy, 10) : undefined;
        const paymentById = parsedPaymentById !== undefined && !Number.isNaN(parsedPaymentById)
            ? parsedPaymentById
            : undefined;

        const treatmentDetailsValue = detailsOverride !== undefined ? detailsOverride : receiptDetailsText;

        const payload: SaveReceiptPayload = {
            patientId: String(treatmentData.patientId),
            clinicId: String(clinicId),
            doctorId: String(doctorId),
            shiftId,
            visitDate: todayIsoDate,
            patientVisitNo,
            receiptAmount: Number(receiptAmount.toFixed(2)),
            treatmentDetails: treatmentDetailsValue || undefined,
            visitType: 'V',
            paymentById,
            paymentRemark: billingData.paymentRemark || undefined,
            userId: String(userId),
            userName: sessionData?.firstName || sessionData?.loginId,
            discount: discountAmount > 0 ? Number(discountAmount.toFixed(2)) : undefined,
            feesCollected: collectedAmount > 0 ? Number(collectedAmount.toFixed(2)) : undefined
        };

        return payload;
    }, [treatmentData, sessionData, billingData, receiptDetailsText]);

    const handleBackToAppointments = () => {
        navigate('/appointment');
    };

    const handlePrintReceiptClick = () => {
        if (!isFormDisabled) return;
        setShowPrintReceiptPopup(true);
    };

    // Memoized callback to handle total fees changes from AddBillingPopup
    // Memoized callback to handle total fees changes from AddBillingPopup
    const handleTotalFeesChange = useCallback((totalFees: number) => {
        // Update Billed input based on currently selected checkboxes
        // This updates dynamically as user checks/unchecks items
        const totalFeesFixed = totalFees.toFixed(2);
        // setTotalSelectedFees(totalFees); // Removed

        // Update billed field with current selection total (not cumulative)
        setBillingData(prev => {
            const discountNum = parseFloat(prev.discount) || 0;

            // Validate discount against new billed amount
            if (discountNum > totalFees) {
                setDiscountError('Discount cannot be greater than billed amount');
            } else {
                setDiscountError(null);
            }

            const acBal = Math.max(0, totalFees - discountNum);
            return {
                ...prev,
                billed: totalFeesFixed,
                dues: acBal.toFixed(2)
            };
        });
    }, []);

    const handlePrintReceiptSubmit = (values: PrintReceiptFormValues) => {
        setBillingData(prev => ({
            ...prev,
            receiptNo: values.receiptNo || prev.receiptNo,
            receiptDate: values.receiptDate || prev.receiptDate,
        }));
        setShowPrintReceiptPopup(false);
    };

    // Fetch previous visits for the current patient
    const fetchPreviousVisits = async () => {
        if (!treatmentData?.patientId || !sessionData?.doctorId || !sessionData?.clinicId) {
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

                    // Determine visit type from PLR field only
                    const getVisitType = (visit: any): string => {
                        // Check PLR field (PLR = Prescription/Lab/Radiology indicators)
                        const plr = String(visit.PLR || visit.plr || visit.plr_indicators || '').toUpperCase();

                        if (plr) {
                            // If PLR contains 'L', it's a Lab visit
                            if (plr.includes('L')) {
                                return 'L';
                            }
                            // If PLR contains 'P' but not 'L', it's a Prescription/Physical visit
                            if (plr.includes('P')) {
                                return 'P';
                            }
                            // If PLR contains 'R' (Radiology), treat as Lab for now
                            if (plr.includes('R')) {
                                return 'L';
                            }
                        }

                        // Default to 'P' if PLR is empty or not found
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

    // Auto-set Follow-up checkbox based on previous visits with statusId 5
    useEffect(() => {
        if (!allVisits || allVisits.length === 0) {
            // No previous visits, so this is not a follow-up
            setFormData(prev => {
                if (prev.visitType.followUp !== false) {
                    return {
                        ...prev,
                        visitType: {
                            ...prev.visitType,
                            followUp: false
                        }
                    };
                }
                return prev;
            });
            return;
        }

        // Check if there's any previous visit with statusId === 5 (Complete)
        const hasCompletedVisit = allVisits.some((visit: any) => {
            const statusId = visit?.statusId ?? visit?.status_id ?? visit?.Status_Id;
            return Number(statusId) === 5;
        });

        setFormData(prev => {
            if (prev.visitType.followUp !== hasCompletedVisit) {
                return {
                    ...prev,
                    visitType: {
                        ...prev.visitType,
                        followUp: hasCompletedVisit
                    }
                };
            }
            return prev;
        });
    }, [allVisits]);


    // Load patient folder amount for billing
    useEffect(() => {
        let cancelled = false;
        // Reset the ref when patient changes
        folderAmountSetRef.current = false;

        async function loadPatientFolderAmount() {
            if (!treatmentData?.patientId || !sessionData?.clinicId) {
                return;
            }

            try {
                const clinicId = String(sessionData.clinicId);
                const doctorId = treatmentData?.doctorId || sessionData?.doctorId;
                const patientId = String(treatmentData.patientId);

                if (!doctorId) {
                    console.error('Doctor ID is required but not found in treatment or session data');
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
                    // Update A/C Balance with totalAcBalance
                    if (data.totalAcBalance !== undefined && data.totalAcBalance !== null) {
                        folderAmountSetRef.current = true; // Mark that folder-amount has set the value
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

    // Helper function to format date as dd-mmm-yy (generic)
    const formatDateDdMmmYy = (dateString: string | null | undefined): string => {
        if (!dateString) return '-';
        try {
            // First, try to parse dd/mm/yyyy format (common format from master-lists)
            const ddMmYyyyMatch = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
            if (ddMmYyyyMatch) {
                const day = parseInt(ddMmYyyyMatch[1], 10);
                const month = parseInt(ddMmYyyyMatch[2], 10) - 1; // month is 0-indexed
                const year = parseInt(ddMmYyyyMatch[3], 10);
                if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year >= 1900 && year <= 2100) {
                    const dayStr = String(day).padStart(2, '0');
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const monthStr = monthNames[month];
                    const yearStr = String(year).slice(-2);
                    return `${dayStr}-${monthStr}-${yearStr}`;
                }
            }

            // Try to parse dd-MM-yyyy format
            const ddMmYyyyDashMatch = dateString.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
            if (ddMmYyyyDashMatch) {
                const day = parseInt(ddMmYyyyDashMatch[1], 10);
                const month = parseInt(ddMmYyyyDashMatch[2], 10) - 1;
                const year = parseInt(ddMmYyyyDashMatch[3], 10);
                if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year >= 1900 && year <= 2100) {
                    const dayStr = String(day).padStart(2, '0');
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const monthStr = monthNames[month];
                    const yearStr = String(year).slice(-2);
                    return `${dayStr}-${monthStr}-${yearStr}`;
                }
            }

            // Try standard Date parsing for ISO format or other formats
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                const day = String(date.getDate()).padStart(2, '0');
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const month = monthNames[date.getMonth()];
                const year = String(date.getFullYear()).slice(-2);
                return `${day}-${month}-${year}`;
            }

            return dateString;
        } catch (error) {
            return dateString;
        }
    };

    // Handler for clicking on a past service date
    const handlePastServiceDateClick = (dateStr: string) => {
        setSelectedPastServiceDate(dateStr);
        setShowPastServicesPopup(true);
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
            // Patch medicines field: combine existing + visit_medicine (short_description) + medicine_names (from prescriptions)
            medicines: (() => {
                const existingMedicines = toStr(get(visit, 'medicines', 'Current_Medicines', 'current_medicines', 'currentMedicines', 'medications'));

                // Get medicines from visit_medicine table (short_description) - comma-separated string from backend
                const visitMedicinesStr = toStr(get(visit, 'visit_medicines_short_description', 'visitMedicinesShortDescription', 'Visit_Medicines_Short_Description'));

                // Get medicine_names from visit_prescription_overwrite table (medicine_name) - comma-separated string from backend
                const medicineNamesStr = toStr(get(visit, 'medicine_names', 'medicineNames', 'Medicine_Names', 'Medicine_Name'));

                // Parse comma-separated strings into arrays
                const existingList = existingMedicines
                    ? existingMedicines.split(',').map((m: string) => m.trim()).filter((m: string) => m !== '')
                    : [];

                const visitMedicinesList = visitMedicinesStr
                    ? visitMedicinesStr.split(',').map((m: string) => m.trim()).filter((m: string) => m !== '')
                    : [];

                const medicineNamesList = medicineNamesStr
                    ? medicineNamesStr.split(',').map((m: string) => m.trim()).filter((m: string) => m !== '')
                    : [];

                // Fallback: If backend strings not available, try array format
                let fallbackMedicinesList: string[] = [];
                if (visitMedicinesList.length === 0 && medicineNamesList.length === 0) {
                    const visitMedicines = visit?.medicines || visit?.Medicines || visit?.associatedData?.medicines || [];
                    if (Array.isArray(visitMedicines) && visitMedicines.length > 0) {
                        fallbackMedicinesList = visitMedicines
                            .map((m: any) => {
                                const shortDesc = m?.short_description || m?.shortDescription || m?.Short_Description || '';
                                return shortDesc;
                            })
                            .filter((desc: string) => desc && desc.trim() !== '');
                    }
                }

                // Combine all medicine sources: existing + visit_medicine (short_description) + medicine_names (prescriptions) + fallback
                const allMedicines = [...existingList, ...visitMedicinesList, ...medicineNamesList, ...fallbackMedicinesList];

                // Remove duplicates and empty values
                const uniqueMedicines = Array.from(new Set(allMedicines.filter((m: string) => m !== '')));

                return uniqueMedicines.length > 0 ? uniqueMedicines.join(', ') : existingMedicines;
            })(),
            detailedHistory: toStr(get(visit, 'detailed_history', 'Detailed_History', 'Additional_Comments', 'detailedHistory', 'additional_comments', 'history')),
            examinationFindings: toStr(get(visit, 'examination_findings', 'Important_Findings', 'examinationFindings', 'findings', 'Findings', 'clinical_findings')),
            // Patch detailedHistory value into examinationComments field
            examinationComments: (() => {
                const detailedHist = toStr(get(visit, 'detailed_history', 'Detailed_History', 'Additional_Comments', 'detailedHistory', 'additional_comments', 'history'));
                if (detailedHist) {
                    return detailedHist;
                }
                return toStr(get(visit, 'examination_comments', 'Examination_Comments', 'examinationComments', 'exam_comments', 'Exam_Comments'));
            })(),
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
            // Patch patient_visit.follow_up into followUp field
            followUp: (() => {
                const followUpFromVisit = toStr(get(visit, 'follow_up', 'followUp', 'Follow_Up', 'followup'));
                if (followUpFromVisit) {
                    return followUpFromVisit;
                }
                return toStr(get(visit, 'followup_label', 'Follow_Up', 'followUp', 'next_visit'));
            })(),
            followUpDate: toStr(get(visit, 'followup_date', 'Follow_Up_Date', 'followUpDate', 'follow_up_date', 'Follow_Up_Date', 'next_visit_date')),
            // Patch patient_visit.additional_instructions into remark field
            remark: (() => {
                const additionalInstructions = toStr(get(visit, 'additional_instructions', 'additionalInstructions', 'Additional_Instructions', 'Additional_Instructions'));
                if (additionalInstructions) {
                    return additionalInstructions;
                }
                return toStr(get(visit, 'remark', 'Remark', 'remarks', 'Remarks', 'notes', 'Notes', 'comments', 'Comments'));
            })(),
            // Include the full raw visit payload for access to all fields
            rawVisit: visit
        };

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

    const handleVisitTypeChange = (field: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            visitType: {
                ...prev.visitType,
                [field]: checked
            }
        }));
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

            // Map form data to API request format
            // Status 5 = Complete, 9 = Draft/Saved
            const statusForRequest = isSubmit ? 5 : 9;
            const visitData: ComprehensiveVisitDataRequest = {
                // Required fields - using validated values
                patientId: treatmentData?.patientId?.toString() || '',
                doctorId: String(doctorId),
                clinicId: String(clinicId),
                shiftId: String(parseInt(String(shiftId || clinicId)) || 1), // Use shiftId or fallback to clinicId, default to 1
                visitDate: toYyyyMmDd(new Date()) + 'T' + new Date().toTimeString().slice(0, 8),
                patientVisitNo: String(parseInt(String(patientVisitNo)) || 0),

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
                habitDetails: formData.medicalHistoryText || '',
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

            // Route to appropriate API based on action
            let result: any;
            if (isSubmit) {
                const overwriteRequest: SaveMedicineOverwriteRequest = {
                    visitDate: visitData.visitDate,
                    patientVisitNo: Number(visitData.patientVisitNo) || 0,
                    shiftId: Number(visitData.shiftId) || 1,
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
                    discount: visitData.discount,
                    reason: billingData.reason || undefined,
                    inPerson: true
                };
                result = await patientService.saveMedicineOverwrite(overwriteRequest);
            } else {
                result = await visitService.saveComprehensiveVisitData(visitData);
            }

            if (result.success) {
                const successMessage = `Treatment ${isSubmit ? 'submitted' : 'saved'} successfully!`;
                setSnackbarMessage(successMessage);
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
            setSnackbarMessage(err.message || `An error occurred while ${isSubmit ? 'submitting' : 'saving'} treatment`);
            setSnackbarOpen(true);
        } finally {
            console.log('=== FINALLY BLOCK ===');
            console.log('Setting submitting to false');
            setIsSubmitting(false);
            console.log('Submitting state updated');
        }
    };

    const handleTreatmentSubmit = async () => {
        const collectedAmount = parseFloat(billingData.feesCollected) || 0;
        const duesAmount = parseFloat(billingData.dues) || 0;

        if (collectedAmount > duesAmount) {
            const shouldProceed = window.confirm('Collected amount is more than dues. Do you want to continue?');
            if (!shouldProceed) {
                return;
            }
        }

        await handleTreatmentAction(true); // true = submit
    };

    const handleBillingChange = (field: string, value: string) => {
        // Strict blocking for numeric fields
        if ((field === 'discount' || field === 'billed' || field === 'feesCollected') && value && !/^\d*\.?\d*$/.test(value)) {
            return; // Block non-numeric input
        }

        const sanitizedValue = value;

        setBillingData(prev => {
            const updated = {
                ...prev,
                [field]: sanitizedValue
            };

            // Validation logic
            if (field === 'reason') {
                if (value.length > 200) {
                    setReasonError('Reason cannot exceed 200 characters');
                } else {
                    setReasonError(null);
                }
            }

            if (field === 'paymentRemark') {
                if (value.length > 200) {
                    setPaymentRemarkError('Payment Remark cannot exceed 200 characters');
                } else {
                    setPaymentRemarkError(null);
                }
            }

            if (field === 'paymentBy') {
                if (!value || value === '') {
                    setPaymentByError('Payment By is required');
                } else {
                    setPaymentByError(null);
                }
            }

            if (field === 'feesCollected') {
                if (value.length > 10) {
                    setCollectedError('Collected (Rs) cannot exceed 10 characters');
                } else if (value && isNaN(Number(value))) {
                    setCollectedError('Collected amount must be a valid number');
                } else if (Number(value) < 0) {
                    setCollectedError('Collected amount cannot be negative');
                } else {
                    setCollectedError(null);
                }
            }

            // Linkage: Recalculate Dues when Billed or Discount changes
            if (field === 'billed' || field === 'discount') {
                const billedNum = parseFloat(updated.billed) || 0;
                const discountNum = parseFloat(updated.discount); // Keep as is for validation (can be NaN if empty)

                let newError: string | null = null;
                if (field === 'discount') {
                    if (value.length > 3) {
                        newError = 'Discount (Rs) cannot exceed 3 characters';
                    } else if (value && isNaN(Number(value))) {
                        newError = 'Discount must be a valid number';
                    } else if (!isNaN(discountNum) && discountNum < 0) {
                        newError = 'Discount cannot be negative';
                    } else if ((!isNaN(discountNum) ? discountNum : 0) > billedNum && billedNum > 0) {
                        newError = 'Discount cannot be greater than billed amount';
                    }
                }
                // If billed changes, we should also re-validate if discount is now invalid?
                if (field === 'billed') {
                    const validDisc = parseFloat(prev.discount) || 0;
                    if (validDisc > billedNum && billedNum > 0) {
                        newError = 'Discount cannot be greater than billed amount';
                    }
                }

                setDiscountError(newError);

                const validDiscount = isNaN(discountNum) ? 0 : discountNum;
                const acBal = Math.max(0, billedNum - validDiscount);
                updated.dues = acBal.toFixed(2);
            }

            return updated;
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
        <div className="page billing-root">
            <style dangerouslySetInnerHTML={{ __html: durationCommentStyles }} />
            <div>
                {/* Header */}
                <div className="dashboard-header" style={{ background: 'transparent', display: 'flex', alignItems: 'center', padding: '5px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h1 className="dashboard-title" style={{ color: '#000', fontSize: 20, }}>Collections</h1>
                    </div>
                </div>

                {/* Main Content - Two Column Layout */}
                <div style={{ display: 'flex' }}>
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
                        <div style={{ flex: 1, paddingBottom: '20px' }}>
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
                                                style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
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
                                <div className="row">
                                    {[
                                        { key: 'allergy', label: 'Allergy' },
                                        { key: 'medicalHistoryText', label: 'Medical History' },
                                        { key: 'surgicalHistory', label: 'Surgical History' },
                                        { key: 'medicines', label: 'Medicines' },
                                        { key: 'visitComments', label: 'Visit Comments' }
                                    ].map(({ key, label }) => (
                                        <div key={key} style={{ width: '20%', paddingLeft: '12px', paddingRight: '12px', marginBottom: '12px' }}>
                                            <Box>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        color: '#333',
                                                        fontSize: '13px',
                                                        marginBottom: '4px'
                                                    }}
                                                >
                                                    {label}
                                                </Typography>
                                                <ClearableTextField
                                                    fullWidth
                                                    size="small"
                                                    value={display(formData[key as keyof typeof formData] as string)}
                                                    onChange={(val) => handleInputChange(key, val)}
                                                    disabled
                                                    sx={{
                                                        '& .MuiInputBase-root': {
                                                            fontSize: '13px',
                                                            backgroundColor: '#D5D5D8'
                                                        }
                                                    }}
                                                />
                                            </Box>
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
                                            <ClearableTextField
                                                size="small"
                                                disabled
                                                value={display(formData.height)}
                                                onChange={() => { }}
                                                sx={{
                                                    width: 90,
                                                    '& .MuiInputBase-root': {
                                                        fontSize: '12px',
                                                        backgroundColor: '#D5D5D8',
                                                        padding: '4px 0'
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        padding: '4px 6px'
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <label style={{ fontSize: '12px', color: '#555', whiteSpace: 'nowrap' }}>Weight (Kg)</label>
                                            <ClearableTextField
                                                size="small"
                                                disabled
                                                value={display(formData.weight)}
                                                onChange={() => { }}
                                                sx={{
                                                    width: 90,
                                                    '& .MuiInputBase-root': {
                                                        fontSize: '12px',
                                                        backgroundColor: '#D5D5D8',
                                                        padding: '4px 0'
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        padding: '4px 6px'
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <label style={{ fontSize: '12px', color: '#555', whiteSpace: 'nowrap' }}>BMI</label>
                                            <ClearableTextField
                                                size="small"
                                                disabled
                                                value={display(formData.bmi)}
                                                onChange={() => { }}
                                                sx={{
                                                    width: 90,
                                                    '& .MuiInputBase-root': {
                                                        fontSize: '12px',
                                                        backgroundColor: '#D5D5D8',
                                                        padding: '4px 0'
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        padding: '4px 6px'
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <label style={{ fontSize: '12px', color: '#555', whiteSpace: 'nowrap' }}>Pulse (min)</label>
                                            <ClearableTextField
                                                size="small"
                                                disabled
                                                value={display(formData.pulse)}
                                                onChange={() => { }}
                                                sx={{
                                                    width: 90,
                                                    '& .MuiInputBase-root': {
                                                        fontSize: '12px',
                                                        backgroundColor: '#D5D5D8',
                                                        padding: '4px 0'
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        padding: '4px 6px'
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <label style={{ fontSize: '12px', color: '#555', whiteSpace: 'nowrap' }}>BP</label>
                                            <ClearableTextField
                                                size="small"
                                                disabled
                                                value={display(formData.bp)}
                                                onChange={() => { }}
                                                sx={{
                                                    width: 90,
                                                    '& .MuiInputBase-root': {
                                                        fontSize: '12px',
                                                        backgroundColor: '#D5D5D8',
                                                        padding: '4px 0'
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        padding: '4px 6px'
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <label style={{ fontSize: '12px', color: '#555', whiteSpace: 'nowrap' }}>Sugar</label>
                                            <ClearableTextField
                                                size="small"
                                                disabled
                                                value={display(formData.sugar)}
                                                onChange={() => { }}
                                                sx={{
                                                    width: 90,
                                                    '& .MuiInputBase-root': {
                                                        fontSize: '12px',
                                                        backgroundColor: '#D5D5D8',
                                                        padding: '4px 0'
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        padding: '4px 6px'
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <label style={{ fontSize: '12px', color: '#555', whiteSpace: 'nowrap' }}>TFT</label>
                                            <ClearableTextField
                                                size="small"
                                                disabled
                                                value={display(formData.tft)}
                                                onChange={() => { }}
                                                sx={{
                                                    width: 90,
                                                    '& .MuiInputBase-root': {
                                                        fontSize: '12px',
                                                        backgroundColor: '#D5D5D8',
                                                        padding: '4px 0'
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        padding: '4px 6px'
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <label style={{ fontSize: '12px', color: '#555', whiteSpace: 'nowrap' }}>Pallor/HB</label>
                                            <ClearableTextField
                                                size="small"
                                                disabled
                                                value={display(formData.pallorHb)}
                                                onChange={() => { }}
                                                sx={{
                                                    width: 90,
                                                    '& .MuiInputBase-root': {
                                                        fontSize: '12px',
                                                        backgroundColor: '#D5D5D8',
                                                        padding: '4px 0'
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        padding: '4px 6px'
                                                    }
                                                }}
                                            />
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
                                                {['Sr.', 'Complaint Description', 'Duration / Comment'].map(h => (
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
                                                    <td style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12 }}>{idx + 1}</td>
                                                    <td style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12 }}>{c.label}</td>
                                                    <td style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12 }}>{c.comment}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, padding: 12 }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            <label>Detailed History</label>
                                            <textarea value={display(formData.detailedHistory)} placeholder="Detailed History" disabled style={{ height: 64, width: '100%', border: '1px solid #ddd', padding: 8, fontSize: 12, background: '#D5D5D8' }} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            <label>Examination Findings</label>
                                            <textarea value={display(formData.examinationFindings)} placeholder="Examination Findings" disabled style={{ height: 64, width: '100%', border: '1px solid #ddd', padding: 8, fontSize: 12, background: '#D5D5D8' }} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            <label>Additional Comments</label>
                                            <textarea value={display(formData.additionalComments)} placeholder="Additional Comments" disabled style={{ height: 64, width: '100%', border: '1px solid #ddd', padding: 8, fontSize: 12, background: '#D5D5D8' }} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 160px', gap: 12, padding: 12, alignItems: 'end' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            <label>Procedure Performed</label>
                                            <textarea value={display(formData.procedurePerformed)} placeholder="Procedure Performed" disabled style={{ height: 64, width: '100%', border: '1px solid #ddd', padding: 8, fontSize: 12, background: '#D5D5D8' }} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            <label>Dressing (body parts)</label>
                                            <textarea value={display(formData.dressingBodyParts)} placeholder="Dressing (body parts)" disabled style={{ height: 64, width: '100%', border: '1px solid #ddd', padding: 8, fontSize: 12, background: '#D5D5D8' }} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isDetailsOpen && (
                                <div style={{ border: '1px solid #e0e0e0', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
                                    {/* <div style={{ background: '#1976d2', color: '#fff', padding: '8px 10px', fontWeight: 600, fontSize: 13 }}>Provisional Diagnosis</div> */}
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ background: '#1976d2' }}>
                                                {['Sr.', 'Provisional Diagnosis'].map(h => (
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
                                                    <td style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12 }}>{idx + 1}</td>
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
                                            {['Sr.', 'Medicines', 'B', 'L', 'D', 'Days', 'Instruction'].map(h => (
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
                                                <td style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12 }}>{idx + 1}</td>
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
                                            {['Sr.', 'Prescriptions', 'B', 'L', 'D', 'Days', 'Instruction'].map(h => (
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
                                                <td style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12 }}>{idx + 1}</td>
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

                            {/* Instructions Section */}
                            {mlInstructionsTable.length > 0 && (
                                <div style={{ marginBottom: 12 }}>
                                    {/* <div style={{
                                    backgroundColor: '#1976d2',
                                    color: 'white',
                                    padding: '12px 16px',
                                    borderRadius: '4px 4px 0 0',
                                    fontWeight: '600',
                                    fontSize: '16px'
                                }}>
                                    Instructions
                                </div> */}

                                    {/* First Table: Instructions Summary with B/L/D/Days */}
                                    {/* <div style={{
                                    border: '1px solid #ddd',
                                    borderTop: 'none',
                                    borderRadius: '0',
                                    overflow: 'hidden'
                                }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#f5f5f5' }}>
                                                <th style={{
                                                    padding: '12px',
                                                    textAlign: 'left',
                                                    borderBottom: '1px solid #ddd',
                                                    fontWeight: '600',
                                                    color: '#333',
                                                    width: '60px'
                                                }}>
                                                    Sr.
                                                </th>
                                                <th style={{
                                                    padding: '12px',
                                                    textAlign: 'left',
                                                    borderBottom: '1px solid #ddd',
                                                    fontWeight: '600',
                                                    color: '#333'
                                                }}>
                                                    Group
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {mlInstructionsTable.map((row, idx) => (
                                                <tr key={row.id}>
                                                    <td style={{
                                                        padding: '12px',
                                                        borderBottom: '1px solid #eee',
                                                        color: '#666',
                                                        height: '38px',
                                                        fontSize: '14px'
                                                    }}>
                                                        {idx + 1}
                                                    </td>
                                                    <td style={{
                                                        padding: '12px',
                                                        borderBottom: '1px solid #eee',
                                                        color: '#666',
                                                        height: '38px',
                                                        fontSize: '14px'
                                                    }}>
                                                        {row.prescription}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div> */}

                                    {/* Second Table: Detailed Instructions */}
                                    <div style={{
                                        border: '1px solid #ddd',
                                        borderTop: 'none',
                                        borderRadius: '0 0 4px 4px',
                                        overflow: 'hidden',
                                        backgroundColor: '#1976d2',
                                        color: 'white'
                                    }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#1976d2' }}>
                                                    <th style={{
                                                        padding: '12px',
                                                        textAlign: 'left',
                                                        borderBottom: '1px solid #ddd',
                                                        fontWeight: '600',
                                                        color: 'white',
                                                        width: '60px'
                                                    }}>
                                                        Sr.
                                                    </th>
                                                    <th style={{
                                                        padding: '12px',
                                                        textAlign: 'left',
                                                        borderBottom: '1px solid #ddd',
                                                        fontWeight: '600',
                                                        color: 'white',
                                                        width: '200px'
                                                    }}>
                                                        Group
                                                    </th>
                                                    <th style={{
                                                        padding: '12px',
                                                        textAlign: 'left',
                                                        borderBottom: '1px solid #ddd',
                                                        fontWeight: '600',
                                                        color: 'white'
                                                    }}>
                                                        Instruction
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {mlInstructionsTable.map((row, idx) => (
                                                    <tr key={row.id}>
                                                        <td style={{
                                                            padding: '12px',
                                                            borderBottom: '1px solid #eee',
                                                            color: '#666',
                                                            height: '38px',
                                                            fontSize: '14px'
                                                        }}>
                                                            {idx + 1}
                                                        </td>
                                                        <td style={{
                                                            padding: '12px',
                                                            borderBottom: '1px solid #eee',
                                                            color: '#666',
                                                            height: '38px',
                                                            fontSize: '14px'
                                                        }}>
                                                            {row.prescription}
                                                        </td>
                                                        <td style={{
                                                            padding: '12px',
                                                            borderBottom: '1px solid #eee',
                                                            color: '#666',
                                                            height: '38px',
                                                            fontSize: '14px'
                                                        }}>
                                                            {row.instruction}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            <div style={{ border: '1px solid #e0e0e0', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
                                {/* <div style={{ background: '#1976d2', color: '#fff', padding: '8px 10px', fontWeight: 600, fontSize: 13 }}>Suggested Tests</div> */}
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#1976d2' }}>
                                            {['Sr.', 'Suggested Tests'].map(h => (
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
                                                <td style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 12 }}>{idx + 1}</td>
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
                                        {followUpTypesOptions.map(opt => (
                                            <option key={opt.id} value={opt.id}>
                                                {opt.followUpDescription}
                                            </option>
                                        ))}
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
                                        value={formatDateDdMmmYy(followUpData.followUpDate) || '-'}
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
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                        Billed (Rs) <span style={{ color: 'red' }}>*</span>
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <ClearableTextField
                                            fullWidth
                                            size="small"
                                            value={billingData.billed}
                                            onChange={(val) => handleBillingChange('billed', val)}
                                            disabled
                                            placeholder="Billed Amount"
                                            onClear={() => handleBillingChange('billed', '')}
                                            sx={{
                                                marginBottom: 0,
                                                '& .MuiInputBase-root': {
                                                    fontSize: '13px',
                                                    backgroundColor: '#f5f5f5',
                                                    color: '#666',
                                                    paddingRight: '34px !important'
                                                },
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: billingError ? 'red !important' : '#ccc'
                                                }
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
                                                backgroundColor: isFormDisabled ? '#D5D5D8' : '#1976d2',
                                                color: isFormDisabled ? '#666' : '#fff',
                                                fontWeight: 700,
                                                lineHeight: '22px',
                                                cursor: isFormDisabled ? 'not-allowed' : 'pointer',
                                                padding: 0,
                                                boxSizing: 'border-box',
                                                outline: 'none',
                                                boxShadow: 'none',
                                                transition: 'none',
                                                opacity: isFormDisabled ? 0.7 : 1,
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
                                {/* Discount (enabled/disabled based on status) */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>Discount (Rs)</label>
                                    <ClearableTextField
                                        fullWidth
                                        size="small"
                                        value={billingData.discount}
                                        onChange={(val) => handleBillingChange('discount', val)}
                                        disabled={isFormDisabled}
                                        onClear={() => handleBillingChange('discount', '')}
                                        error={!!discountError}
                                        helperText={discountError}
                                        inputProps={{ maxLength: 4 }}
                                        sx={{
                                            '& .MuiInputBase-root': {
                                                fontSize: '12px',
                                                background: isFormDisabled ? 'white' : 'white',
                                                cursor: isFormDisabled ? 'not-allowed' : 'text',
                                                color: isFormDisabled ? '#666' : '#333'
                                            }
                                        }}
                                    />
                                </div>
                                {/* Dues (disabled) */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>Dues (Rs)</label>
                                    <ClearableTextField
                                        fullWidth
                                        size="small"
                                        disabled
                                        value={display(billingData.dues)}
                                        onChange={(val) => handleBillingChange('dues', val)}
                                        onClear={() => handleBillingChange('dues', '')}
                                        sx={{
                                            '& .MuiInputBase-root': {
                                                fontSize: '12px',
                                                background: '#D5D5D8'
                                            }
                                        }}
                                    />
                                </div>
                                {/* A/C Balance (disabled) */}
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
                                            disabled
                                            placeholder="0.00"
                                            onChange={() => { }}
                                            sx={{
                                                '& .MuiInputBase-root': {
                                                    fontSize: '13px',
                                                    backgroundColor: '#f5f5f5',
                                                    color: folderAmountData?.totalAcBalance !== undefined &&
                                                        folderAmountData?.totalAcBalance !== null &&
                                                        folderAmountData?.rows &&
                                                        folderAmountData.rows.length > 0
                                                        ? (folderAmountData.totalAcBalance < 0 ? '#d32f2f' : '#2e7d32')
                                                        : '#666',
                                                    paddingRight: folderAmountData?.totalAcBalance !== undefined &&
                                                        folderAmountData?.totalAcBalance !== null &&
                                                        folderAmountData?.rows &&
                                                        folderAmountData.rows.length > 0 ? '120px' : '10px',
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
                                {/* Receipt No (disabled) */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>Receipt No</label>
                                    <ClearableTextField
                                        fullWidth
                                        size="small"
                                        disabled
                                        value={display(billingData.receiptNo)}
                                        onChange={() => { }}
                                        sx={{
                                            '& .MuiInputBase-root': {
                                                fontSize: '12px',
                                                background: '#D5D5D8'
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 16 }}>
                                {/* Collected (enabled/disabled based on status) */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>Collected (Rs)</label>
                                    <ClearableTextField
                                        fullWidth
                                        size="small"
                                        value={billingData.feesCollected}
                                        onChange={(val) => handleBillingChange('feesCollected', val)}
                                        disabled={isFormDisabled}
                                        onClear={() => handleBillingChange('feesCollected', '')}
                                        error={!!collectedError}
                                        helperText={collectedError}
                                        inputProps={{ maxLength: 11 }}
                                        sx={{
                                            '& .MuiInputBase-root': {
                                                fontSize: '12px',
                                                background: isFormDisabled ? '#D5D5D8' : 'white',
                                                cursor: isFormDisabled ? 'not-allowed' : 'text',
                                                color: isFormDisabled ? '#666' : '#333'
                                            }
                                        }}
                                    />
                                </div>
                                {/* Reason (enabled/disabled based on status) */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>Reason</label>
                                    <ClearableTextField
                                        fullWidth
                                        size="small"
                                        value={billingData.reason}
                                        onChange={(val) => handleBillingChange('reason', val)}
                                        disabled={isFormDisabled}
                                        onClear={() => handleBillingChange('reason', '')}
                                        error={!!reasonError}
                                        helperText={reasonError}
                                        inputProps={{ maxLength: 201 }}
                                        sx={{
                                            '& .MuiInputBase-root': {
                                                fontSize: '12px',
                                                background: isFormDisabled ? '#D5D5D8' : 'white',
                                                cursor: isFormDisabled ? 'not-allowed' : 'text',
                                                color: isFormDisabled ? '#666' : '#333'
                                            }
                                        }}
                                    />
                                </div>
                                {/* Payment By (enabled/disabled based on status) */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>Payment By</label>
                                    <ClearableTextField
                                        fullWidth
                                        select
                                        size="small"
                                        value={billingData.paymentBy}
                                        onChange={(val) => handleBillingChange('paymentBy', val)}
                                        disabled={isFormDisabled}
                                        error={!!paymentByError}
                                        helperText={paymentByError}
                                        sx={{
                                            '& .MuiInputBase-root': {
                                                fontSize: '12px',
                                                background: 'white',
                                                cursor: isFormDisabled ? 'not-allowed' : 'pointer',
                                                color: isFormDisabled ? '#666' : '#333'
                                            }
                                        }}
                                        SelectProps={{
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
                                        {paymentByOptions.length === 0 ? (
                                            <MenuItem value="">—</MenuItem>
                                        ) : (
                                            paymentByOptions.map(opt => (
                                                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                            ))
                                        )}
                                    </ClearableTextField>
                                </div>
                                {/* Payment Remark (enabled/disabled based on status) */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>Payment Remark</label>
                                    <ClearableTextField
                                        fullWidth
                                        size="small"
                                        value={billingData.paymentRemark}
                                        onChange={(val) => handleBillingChange('paymentRemark', val)}
                                        disabled={isFormDisabled}
                                        onClear={() => handleBillingChange('paymentRemark', '')}
                                        error={!!paymentRemarkError}
                                        helperText={paymentRemarkError}
                                        inputProps={{ maxLength: 201 }}
                                        sx={{
                                            '& .MuiInputBase-root': {
                                                fontSize: '12px',
                                                background: 'white',
                                                cursor: isFormDisabled ? 'not-allowed' : 'text',
                                                color: isFormDisabled ? '#666' : '#333'
                                            }
                                        }}
                                    />
                                </div>
                                {/* Receipt Date (disabled) */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>Receipt Date</label>
                                    <ClearableTextField
                                        fullWidth
                                        size="small"
                                        disabled
                                        value={formatDateDdMmmYy(billingData.receiptDate)}
                                        onChange={() => { }}
                                        sx={{
                                            '& .MuiInputBase-root': {
                                                fontSize: '12px',
                                                background: '#D5D5D8'
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    disabled={!isFormDisabled}
                                    style={{
                                        backgroundColor: !isFormDisabled ? '#D5D5D8' : '#1976d2',
                                        color: !isFormDisabled ? '#666' : 'white',
                                        border: 'none',
                                        padding: '8px 12px',
                                        borderRadius: '4px',
                                        cursor: !isFormDisabled ? 'not-allowed' : 'pointer',
                                        fontSize: '12px',
                                        opacity: !isFormDisabled ? 0.7 : 1
                                    }}
                                    onClick={handlePrintReceiptClick}>
                                    Print Receipt
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
                                    style={{
                                        backgroundColor: '#1976d2',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 12px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        opacity: 1
                                    }}
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    onClick={handleTreatmentSubmit}
                                    disabled={isSubmitting || hasSubmittedSuccessfully || isFormDisabled}
                                    style={{
                                        backgroundColor: (isSubmitting || hasSubmittedSuccessfully || isFormDisabled) ? '#D5D5D8' : '#1976d2',
                                        color: (isSubmitting || hasSubmittedSuccessfully || isFormDisabled) ? '#666' : 'white',
                                        border: 'none',
                                        padding: '8px 12px',
                                        borderRadius: '4px',
                                        cursor: (isSubmitting || hasSubmittedSuccessfully || isFormDisabled) ? 'not-allowed' : 'pointer',
                                        fontSize: '12px',
                                        opacity: (isSubmitting || hasSubmittedSuccessfully || isFormDisabled) ? 0.7 : 1
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
                    return pid ? String(pid) : undefined;
                })()}
                patientName={selectedPatientForForm?.name || treatmentData?.patientName}
            />
            <AddBillingPopup
                open={showBillingPopup}
                onClose={() => setShowBillingPopup(false)}
                isFormDisabled={isFormDisabled}
                onSubmit={(totalAmount) => {
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
                onTotalFeesChange={handleTotalFeesChange}
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
                disableAutoSelect={true}
            />

            <PrintReceiptPopup
                open={showPrintReceiptPopup}
                onClose={() => setShowPrintReceiptPopup(false)}
                onSubmit={handlePrintReceiptSubmit}
                patientName={treatmentData?.patientName}
                patientAge={treatmentData?.age}
                patientGender={treatmentData?.gender}
                billingData={billingData}
                paymentByLabel={paymentByLabel}
                detailsText={receiptDetailsText}
                buildReceiptPayload={buildReceiptPayload}
            />

            {/* Quick Registration Modal - appears on top of Collections screen */}
            {showQuickRegistration && treatmentData?.patientId && (
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
            )}

        </div>
    );
}
