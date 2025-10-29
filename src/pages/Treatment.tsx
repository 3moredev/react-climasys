import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useLocation } from "react-router-dom";
import { sessionService, SessionInfo } from "../services/sessionService";
import { Delete, Edit, Add, Info } from '@mui/icons-material';
import { complaintService, ComplaintOption } from "../services/complaintService";
import { medicineService, MedicineOption } from "../services/medicineService";
import { diagnosisService, DiagnosisOption } from "../services/diagnosisService";
import { investigationService, InvestigationOption } from "../services/investigationService";
import { appointmentService } from "../services/appointmentService";
import PatientFormTest from "../components/Test/PatientFormTest";
import AddComplaintPopup from "../components/AddComplaintPopup";
import AddDiagnosisPopup from "../components/AddDiagnosisPopup";
import AddMedicinePopup, { MedicineData } from "../components/AddMedicinePopup";
import AddPrescriptionPopup, { PrescriptionData } from "../components/AddPrescriptionPopup";
import AddTestLabPopup, { TestLabData } from "../components/AddTestLabPopup";

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
                        d: '',
                        days: '',
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
                                        onClick={handleAddCustomTestLab}
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
                                                                    backgroundColor: checked ? '#e3f2fd' : 'transparent',
                                                                    borderRadius: '3px',
                                                                    fontWeight: checked ? '600' : '400'
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
                                                                    backgroundColor: checked ? '#e3f2fd' : 'transparent',
                                                                    borderRadius: '3px',
                                                                    fontWeight: checked ? '600' : '400'
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
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>Prescriptions suggested in previous visit:</label>
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
                                                                    backgroundColor: checked ? '#e3f2fd' : 'transparent',
                                                                    borderRadius: '3px',
                                                                    fontWeight: checked ? '600' : '400'
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

            {/* Add Test Lab Popup */}
            <AddTestLabPopup
                open={showTestLabPopup}
                onClose={() => setShowTestLabPopup(false)}
                onSave={handleSaveTestLab}
            />

        </div>
    );
}
