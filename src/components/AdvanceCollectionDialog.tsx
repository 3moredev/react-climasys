import React, { useState, useEffect, useRef } from "react";
import { Close } from "@mui/icons-material";
import { Snackbar } from "@mui/material";
import { Calendar } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import AddPatientPage from "../pages/AddPatientPage";
import { sessionService } from "../services/sessionService";
import { advanceCollectionService, AdvanceCollectionRequest, AdvanceCollectionDetailsRequest, AdvanceCollectionDTO, ReceiptDetailsRequest } from "../services/advanceCollectionService";
import { patientService, Patient } from "../services/patientService";
import { SessionInfo } from "../services/sessionService";
import { admissionService, InsuranceCompany } from "../services/admissionService";

interface AdvanceCollectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => void;
  patientData?: {
    name?: string;
    id?: string;
    gender?: string;
    age?: number;
  };
  admissionData?: {
    admissionIpdNo?: string;
    ipdFileNo?: string;
    admissionDate?: string;
    dischargeDate?: string;
    insurance?: string;
    company?: string;
    advanceRs?: number;
    reasonOfAdmission?: string;
    department?: string;
    room?: string;
    bed?: string;
    packageRemarks?: string;
    hospitalBillNo?: string;
    hospitalBillDate?: string;
  };
  disabled?: boolean;
}

export default function AdvanceCollectionDialog({
  open,
  onClose,
  onSubmit,
  patientData,
  admissionData,
  disabled = false,
}: AdvanceCollectionDialogProps) {
  const [formData, setFormData] = useState({
    advanceDate: "",
    paymentRemark: "",
    receivedRs: "",
    paymentBy: 0, // Will be set to first option ID (number) when payment options load
    receiptNo: "",
    receiptDate: "",
  });
  const [showQuickRegistration, setShowQuickRegistration] = useState(false);
  const [sessionData, setSessionData] = useState<SessionInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [advanceDateYYYYMMDD, setAdvanceDateYYYYMMDD] = useState<string>("");
  const [receiptDateYYYYMMDD, setReceiptDateYYYYMMDD] = useState<string>("");
  const advanceDatePickerRef = useRef<HTMLInputElement>(null);
  const receiptDatePickerRef = useRef<HTMLInputElement>(null);
  const [previousAdvanceRecords, setPreviousAdvanceRecords] = useState<AdvanceCollectionDTO[]>([]);
  const [loadingPreviousRecords, setLoadingPreviousRecords] = useState<boolean>(false);
  const [patientDetails, setPatientDetails] = useState<Patient | null>(null);
  const [insuranceCompanies, setInsuranceCompanies] = useState<InsuranceCompany[]>([]);
  const [loadingInsuranceCompanies, setLoadingInsuranceCompanies] = useState<boolean>(false);
  const [paymentByOptions, setPaymentByOptions] = useState<{ value: number; label: string }[]>([]);

  // Format date to dd-mmm-yy format for display
  const formatDateToDDMMMYY = (dateString: string): string => {
    if (!dateString) return "";
    
    // If it's already in yyyy-mm-dd format, convert it
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, '0');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = months[date.getMonth()];
        const year = String(date.getFullYear()).slice(-2);
        return `${day}-${month}-${year}`;
      }
    }
    
    // If already in dd-mmm-yy format, return as is
    if (/^\d{2}-[A-Za-z]{3}-\d{2}$/.test(dateString)) {
      return dateString.toUpperCase();
    }
    
    // Handle ISO string yyyy-mm-ddTHH:mm:ss.sssZ
    const isoDate = new Date(dateString);
    if (!isNaN(isoDate.getTime())) {
      const day = String(isoDate.getDate()).padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[isoDate.getMonth()];
      const year = String(isoDate.getFullYear()).slice(-2);
      return `${day}-${month}-${year}`;
    }
    
    return dateString;
  };

  // Get company name from company ID
  const getCompanyName = (companyId: string | undefined): string => {
    if (!companyId) return '--';
    
    const company = insuranceCompanies.find(ic => ic.id === companyId);
    return company ? company.name : companyId; // Return ID if name not found
  };

  // Load session data and patient details on component mount
  useEffect(() => {
    const loadSessionData = async () => {
      try {
        const sessionResult = await sessionService.getSessionInfo();
        if (sessionResult.success && sessionResult.data) {
          setSessionData(sessionResult.data);
        }
      } catch (error) {
        console.error('Error getting session data:', error);
      }
    };

    const loadPatientDetails = async () => {
      if (patientData?.id) {
        try {
          const patient = await patientService.getPatient(patientData.id);
          setPatientDetails(patient);
        } catch (error) {
          console.error('Error fetching patient details:', error);
        }
      }
    };

    const loadInsuranceCompanies = async () => {
      try {
        setLoadingInsuranceCompanies(true);
        const response = await admissionService.getAllActiveInsuranceCompanies();
        console.log('Insurance Companies API Response:', response);
        
        if (response.success && response.data && response.data.length > 0) {
          // Ensure data structure is correct (id and name)
          const validCompanies = response.data.filter(
            (ic: any) => ic.id && ic.name
          );
          
          if (validCompanies.length > 0) {
            setInsuranceCompanies(validCompanies);
            console.log(`Loaded ${validCompanies.length} insurance companies:`, validCompanies);
          } else {
            console.warn('No valid insurance companies found in response');
            setInsuranceCompanies([]);
          }
        } else {
          console.warn('Insurance companies response was empty or unsuccessful:', response);
          setInsuranceCompanies([]);
        }
      } catch (error) {
        console.error('Error fetching insurance companies:', error);
        setInsuranceCompanies([]);
      } finally {
        setLoadingInsuranceCompanies(false);
      }
    };

    const loadPaymentByOptions = async () => {
      try {
        const ref = await patientService.getAllReferenceData();
        const preferKeys = ['paymentMethods', 'paymentBy', 'paymentTypes', 'paymentModes', 'payments', 'paymentByList'];
        let raw: any[] = [];
        for (const key of preferKeys) {
          if (Array.isArray((ref as any)?.[key])) { 
            raw = (ref as any)[key]; 
            break; 
          }
        }
        if (raw.length === 0) {
          const firstArrayKey = Object.keys(ref || {}).find(k => 
            Array.isArray((ref as any)[k]) && 
            ((ref as any)[k][0] && 
              (('description' in (ref as any)[k][0]) || 
               ('label' in (ref as any)[k][0]) || 
               ('name' in (ref as any)[k][0])))
          );
          if (firstArrayKey) raw = (ref as any)[firstArrayKey];
        }
        const toStr = (v: any) => (v === undefined || v === null ? '' : String(v));
        const toNum = (v: any): number => {
          if (v === undefined || v === null) return 0;
          const num = typeof v === 'number' ? v : parseInt(String(v), 10);
          return isNaN(num) ? 0 : num;
        };
        const options: { value: number; label: string }[] = Array.isArray(raw)
          ? raw.map((r: any) => ({
              value: toNum(r?.id ?? r?.value ?? r?.code ?? r?.paymentById ?? r?.key ?? r),
              label: toStr(r?.paymentDescription ?? r?.description ?? r?.label ?? r?.name ?? r?.paymentBy ?? r)
            })).filter(o => o.label && o.value > 0) // Filter out invalid options
          : [];
        setPaymentByOptions(options);
        // If no selection yet, initialize to first option
        setFormData(prev => ({ 
          ...prev, 
          paymentBy: prev.paymentBy || (options[0]?.value || 0) 
        }));
        console.log('Loaded payment by options:', options);
      } catch (error) {
        console.error('Error loading payment by options:', error);
        // Fallback to default options if API fails (using numeric IDs)
        setPaymentByOptions([
          { value: 1, label: 'Cash' },
          { value: 2, label: 'Card' },
          { value: 3, label: 'UPI' },
          { value: 4, label: 'Cheque' },
          { value: 5, label: 'Online Transfer' },
          { value: 6, label: 'Other' }
        ]);
      }
    };

    if (open) {
      loadSessionData();
      loadPatientDetails();
      loadInsuranceCompanies();
      loadPaymentByOptions();
    }
  }, [open, patientData?.id]);

  // Load previous advance collection records
  useEffect(() => {
    const loadPreviousAdvanceRecords = async () => {
      if (!patientData?.id || !sessionData?.clinicId || !admissionData?.admissionIpdNo) {
        return;
      }

      try {
        setLoadingPreviousRecords(true);
        const params: AdvanceCollectionDetailsRequest = {
          patientId: patientData.id,
          clinicId: sessionData.clinicId,
          ipdRefNo: admissionData.admissionIpdNo
        };

        const response = await advanceCollectionService.getAdvanceDetails(params);
        
        if (response.success && response.data) {
          setPreviousAdvanceRecords(response.data);
        } else {
          setPreviousAdvanceRecords([]);
        }
      } catch (error) {
        console.error('Error fetching previous advance records:', error);
        setPreviousAdvanceRecords([]);
      } finally {
        setLoadingPreviousRecords(false);
      }
    };

    if (open && patientData?.id && sessionData?.clinicId && admissionData?.admissionIpdNo) {
      loadPreviousAdvanceRecords();
    }
  }, [open, patientData?.id, sessionData?.clinicId, admissionData?.admissionIpdNo]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      // Set today's date as default for advance date and receipt date
      const today = new Date();
      const todayYYYYMMDD = today.toISOString().split('T')[0];
      const todayFormatted = formatDateToDDMMMYY(todayYYYYMMDD);
      
      setAdvanceDateYYYYMMDD(todayYYYYMMDD);
      setReceiptDateYYYYMMDD(todayYYYYMMDD);
      setFormData({
        advanceDate: todayFormatted,
        paymentRemark: "",
        receivedRs: "",
        paymentBy: 0, // Will be set when payment options load
        receiptNo: "",
        receiptDate: todayFormatted,
      });
    }
  }, [open]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle date picker change for advance date
  const handleAdvanceDatePickerChange = (dateValue: string) => {
    if (dateValue) {
      setAdvanceDateYYYYMMDD(dateValue);
      const formattedDate = formatDateToDDMMMYY(dateValue);
      handleInputChange("advanceDate", formattedDate);
    } else {
      setAdvanceDateYYYYMMDD("");
      handleInputChange("advanceDate", "");
    }
  };

  // Handle date picker change for receipt date
  const handleReceiptDatePickerChange = (dateValue: string) => {
    if (dateValue) {
      setReceiptDateYYYYMMDD(dateValue);
      const formattedDate = formatDateToDDMMMYY(dateValue);
      handleInputChange("receiptDate", formattedDate);
    } else {
      setReceiptDateYYYYMMDD("");
      handleInputChange("receiptDate", "");
    }
  };

  // Handle manual date input change
  const handleAdvanceDateChange = (value: string) => {
    handleInputChange("advanceDate", value);
    if (value && /^\d{2}-[A-Za-z]{3}-\d{2}$/.test(value)) {
      const parts = value.split('-');
      const day = parts[0];
      const monthStr = parts[1];
      const yearStr = parts[2];
      
      const months: { [key: string]: string } = {
        'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
        'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
        'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
      };
      
      const month = months[monthStr.toLowerCase()];
      if (month) {
        const fullYear = parseInt(yearStr) < 50 ? `20${yearStr}` : `19${yearStr}`;
        const yyyyMMDD = `${fullYear}-${month}-${day}`;
        setAdvanceDateYYYYMMDD(yyyyMMDD);
      }
    }
  };

  const handleReceiptDateChange = (value: string) => {
    handleInputChange("receiptDate", value);
    if (value && /^\d{2}-[A-Za-z]{3}-\d{2}$/.test(value)) {
      const parts = value.split('-');
      const day = parts[0];
      const monthStr = parts[1];
      const yearStr = parts[2];
      
      const months: { [key: string]: string } = {
        'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
        'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
        'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
      };
      
      const month = months[monthStr.toLowerCase()];
      if (month) {
        const fullYear = parseInt(yearStr) < 50 ? `20${yearStr}` : `19${yearStr}`;
        const yyyyMMDD = `${fullYear}-${month}-${day}`;
        setReceiptDateYYYYMMDD(yyyyMMDD);
      }
    }
  };


  // Helper function to get gender from gender_id
//   const getGenderFromId = (genderId: number): string => {
//     switch (genderId) {
//       case 1: return 'Male';
//       case 2: return 'Female';
//       default: return 'N/A';
//     }
//   };

  const displayPatientData: { name?: string; id?: string; gender?: string; age?: number } | null = 
    patientData ? {
      name: patientData.name,
      id: patientData.id ? String(patientData.id) : undefined,
      gender: patientData.gender,
      age: typeof patientData.age === 'number' ? patientData.age : (patientData.age ? parseInt(String(patientData.age), 10) : undefined)
    } : (patientDetails ? {
      name: `${patientDetails.first_name} ${patientDetails.middle_name || ''} ${patientDetails.last_name}`.trim(),
      id: String(patientDetails.id),
      gender: patientDetails.gender_id.toString(),
      age: typeof patientDetails.age_given === 'number' ? patientDetails.age_given : (patientDetails.age_given ? parseInt(String(patientDetails.age_given), 10) : undefined)
    } : null);

  // Helper function to convert date string to date-only format (yyyy-mm-dd)
  const convertToDateOnly = (dateString: string): string => {
    if (!dateString) return '';
    
    // If already in yyyy-mm-dd format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Try to parse the date string and extract only the date part
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    return '';
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!displayPatientData?.id) {
      setSnackbarMessage("Patient ID is required. Please select a patient.");
      setSnackbarOpen(true);
      return;
    }

    if (!sessionData?.doctorId || !sessionData?.clinicId) {
      setSnackbarMessage("Session data is missing. Please refresh the page.");
      setSnackbarOpen(true);
      return;
    }

    if (!admissionData?.admissionIpdNo) {
      setSnackbarMessage("Admission IPD No is required.");
      setSnackbarOpen(true);
      return;
    }

    // Validate Advance Date (required)
    if (!formData.advanceDate || !advanceDateYYYYMMDD) {
      setSnackbarMessage("Advance Date is required.");
      setSnackbarOpen(true);
      return;
    }

    // Validate Received Amount (required)
    if (!formData.receivedRs || parseFloat(formData.receivedRs) <= 0) {
      setSnackbarMessage("Received Amount is required and must be greater than 0.");
      setSnackbarOpen(true);
      return;
    }

    setIsSubmitting(true);

    // Convert dates to date-only format (yyyy-mm-dd)
    const dateISO = advanceDateYYYYMMDD 
      ? convertToDateOnly(advanceDateYYYYMMDD) // Date only format
      : '';
    const dateOfAdvanceISO = advanceDateYYYYMMDD 
      ? convertToDateOnly(advanceDateYYYYMMDD) // Date only format
      : undefined;
    const receiptDateISO = receiptDateYYYYMMDD 
      ? convertToDateOnly(receiptDateYYYYMMDD) // Date only format
      : undefined;

    // Declare request variable outside try block for error handling
    let request: AdvanceCollectionRequest | null = null;

    try {
      // First, call saveAdvanceReceiptDetails to generate receipt number
      let generatedReceiptNo = formData.receiptNo?.trim() || '';
      
      try {
        const receiptRequest: ReceiptDetailsRequest = {
          patientId: String(displayPatientData.id || ''),
          clinicId: sessionData.clinicId,
          doctorId: sessionData.doctorId,
          ipdRefNo: admissionData?.admissionIpdNo,
          receiptNo: generatedReceiptNo || '', // Use provided receiptNo or empty to generate
          amount: parseFloat(formData.receivedRs),
          paymentById: formData.paymentBy > 0 ? formData.paymentBy : undefined,
          paymentRemark: formData.paymentRemark?.trim() || undefined,
          shiftId: 1,
          loginId: '',
          date: receiptDateISO
        };
        
        console.log('Generating receipt number via saveAdvanceReceiptDetails:', receiptRequest);
        const receiptResponse = await advanceCollectionService.saveAdvanceReceiptDetails(receiptRequest);
        
        if (receiptResponse.success) {
          // Extract generated receipt number from response
          // Check if receiptNo is in data object or response directly
          if (receiptResponse.data?.receiptNo) {
            generatedReceiptNo = receiptResponse.data.receiptNo;
            console.log('Generated receipt number:', generatedReceiptNo);
          } else if (receiptResponse.data && typeof receiptResponse.data === 'string') {
            // If data is a string, it might be the receipt number
            generatedReceiptNo = receiptResponse.data;
            console.log('Generated receipt number (from data string):', generatedReceiptNo);
          } else if (receiptResponse.message) {
            // Sometimes receipt number might be in message
            const receiptMatch = receiptResponse.message.match(/receipt[:\s]+([^\s,]+)/i);
            if (receiptMatch) {
              generatedReceiptNo = receiptMatch[1];
              console.log('Generated receipt number (from message):', generatedReceiptNo);
            }
          }
          
          if (!generatedReceiptNo) {
            console.warn('Receipt number not found in response, using provided receiptNo or empty');
          }
        } else {
          console.warn('Receipt generation warning:', receiptResponse.error || receiptResponse.message);
          // Continue with provided receiptNo or empty
        }
      } catch (receiptError: any) {
        console.error('Error generating receipt number:', receiptError);
        // Continue with provided receiptNo or empty - don't fail the whole operation
      }

      // Map form data to API request format with generated receipt number
      // formData.paymentBy contains the numeric ID
      request = {
        patientId: String(displayPatientData.id || ''),
        doctorId: sessionData.doctorId,
        clinicId: sessionData.clinicId,
        ipdRefNo: admissionData?.admissionIpdNo || '',
        date: dateISO, // Backend requires 'date' field in date-only format (yyyy-mm-dd) (NOT NULL constraint)
        advanceDate: dateOfAdvanceISO, // Also send as dateOfAdvance in date-only format (yyyy-mm-dd)
        receiptNo: generatedReceiptNo, // Use generated receipt number
        amountReceived: parseFloat(formData.receivedRs),
        paymentRemark: formData.paymentRemark?.trim() || undefined, // Use undefined instead of empty string
        paymentById: formData.paymentBy > 0 ? formData.paymentBy : undefined, // Payment method ID as number
        shiftId: 1,
        loginId: '',
        receiptDate: receiptDateISO, // Send receipt date in date-only format (yyyy-mm-dd)
      };
      
      console.log('Submitting advance collection request:', request);
      console.log('Payment By ID:', formData.paymentBy);
      console.log('Using receipt number:', generatedReceiptNo);

      const response = await advanceCollectionService.saveAdvanceCollection(request);

      if (response.success) {
        
        setSnackbarMessage(response.message || "Advance collection saved successfully");
        setSnackbarOpen(true);
        
        // Reload previous advance records
        if (patientData?.id && sessionData?.clinicId && admissionData?.admissionIpdNo) {
          const params: AdvanceCollectionDetailsRequest = {
            patientId: patientData.id,
            clinicId: sessionData.clinicId,
            ipdRefNo: admissionData.admissionIpdNo
          };
          const recordsResponse = await advanceCollectionService.getAdvanceDetails(params);
          if (recordsResponse.success && recordsResponse.data) {
            setPreviousAdvanceRecords(recordsResponse.data);
          }
        }
        
        // Call the onSubmit callback if provided
        onSubmit?.(formData);
        
        // Reset form
        const today = new Date();
        const todayYYYYMMDD = today.toISOString().split('T')[0];
        const todayFormatted = formatDateToDDMMMYY(todayYYYYMMDD);
        setAdvanceDateYYYYMMDD(todayYYYYMMDD);
        setReceiptDateYYYYMMDD(todayYYYYMMDD);
        setFormData({
          advanceDate: todayFormatted,
          paymentRemark: "",
          receivedRs: "",
          paymentBy: (paymentByOptions[0]?.value ?? 0) as number, // Reset to first option ID (number)
          receiptNo: "",
          receiptDate: todayFormatted,
        });
      } else {
        setSnackbarMessage(response.error || "Failed to save advance collection");
        setSnackbarOpen(true);
      }
    } catch (error: any) {
      console.error("Error saving advance collection:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        fullError: error.response
      });
      if (request) {
        console.error("Request that failed:", JSON.stringify(request, null, 2));
      }
      
      // Extract detailed error message
      let errorMessage = "An error occurred while saving advance collection";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSnackbarMessage(errorMessage);
      setSnackbarOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintReceipt = () => {
    // TODO: Implement print receipt functionality
    console.log("Print receipt");
  };

  if (!open) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !showQuickRegistration) {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10000,
      }}
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white p-4 rounded shadow-lg"
        style={{
          width: "95%",
          maxWidth: "1400px",
          maxHeight: "95vh",
          overflowY: "auto",
          backgroundColor: "#ffffff",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3" style={{ borderBottom: "2px solid #e0e0e0" }}>
          <h4 className="mb-0 fw-bold" style={{ color: "#007bff", fontSize: "1.5rem" }}>Advance Collection</h4>
          <button
            onClick={onClose}
            style={{ 
              border: "none", 
              background: "none", 
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Close style={{ color: "#666" }} />
          </button>
        </div>

        {/* Patient Information */}
        {displayPatientData ? (
          <div 
            onClick={() => {
              if (displayPatientData.id) {
                setShowQuickRegistration(true);
              }
            }}
            className="mb-3" 
            style={{ 
              fontSize: "14px",
              cursor: displayPatientData.id ? 'pointer' : 'default',
              textDecoration: displayPatientData.id ? 'underline' : 'none',
              color: "#28a745",
              fontWeight: 500,
              padding: "8px 0"
            }}
            title={displayPatientData.id ? 'Click to view patient details' : ''}
          >
            {displayPatientData.name || 'N/A'} / Id: ({displayPatientData.id || 'N/A'}) /{" "}
            {displayPatientData.gender || 'N/A'} / {displayPatientData.age ? `${displayPatientData.age} Yr` : 'N/A'}
          </div>
        ) : (
          <div className="text-muted mb-3" style={{ fontSize: "14px", fontStyle: "italic", padding: "8px 0" }}>
            No patient selected
          </div>
        )}

        {/* Admission Details Section */}
        <div className="container-fluid mb-4">
          <div className="row">
            {/* LEFT COLUMN - Admission Details */}
            <div className="col-md-4">
              <HorizontalField
                label="Admission No"
                value={admissionData?.admissionIpdNo || '--'}
                disabled={true}
                onChange={() => {}}
              />
              <HorizontalField
                label="Discharge Date"
                value={admissionData?.dischargeDate ? formatDateToDDMMMYY(admissionData.dischargeDate) : '--'}
                disabled={true}
                onChange={() => {}}
                isDate
                dateFormat="dd-mmm-yy"
              />
              <HorizontalField
                label="Insurance"
                value={admissionData?.insurance || 'No'}
                disabled={true}
                onChange={() => {}}
              />
              <HorizontalField
                label="Hospital bill Date"
                value={admissionData?.hospitalBillDate ? formatDateToDDMMMYY(admissionData.hospitalBillDate) : '--'}
                disabled={true}
                onChange={() => {}}
                isDate
                dateFormat="dd-mmm-yy"
              />
            </div>

            {/* MIDDLE COLUMN - IPD and Room Details */}
            <div className="col-md-4">
              <HorizontalField
                label="IPD File No"
                value={admissionData?.ipdFileNo || '--'}
                disabled={true}
                onChange={() => {}}
              />
              <div className="row align-items-center mb-3">
                <label className="col-4 col-form-label fw-medium">Room - Bed</label>
                <div className="col-8">
                  <input
                    type="text"
                    className="form-control"
                    value={admissionData?.room && admissionData?.bed ? `${admissionData.room} - ${admissionData.bed}` : '--'}
                    disabled={true}
                  />
                </div>
              </div>
              <HorizontalField
                label="Company"
                value={getCompanyName(admissionData?.company)}
                disabled={true}
                onChange={() => {}}
              />
              <HorizontalField
                label="Package remarks"
                value={admissionData?.packageRemarks || '--'}
                disabled={true}
                onChange={() => {}}
              />
            </div>

            {/* RIGHT COLUMN - Admission and Billing Details */}
            <div className="col-md-4">
              <HorizontalField
                label="Admission Date"
                value={admissionData?.admissionDate ? formatDateToDDMMMYY(admissionData.admissionDate) : '--'}
                disabled={true}
                onChange={() => {}}
                isDate
                dateFormat="dd-mmm-yy"
              />
              <HorizontalField
                label="Department"
                value={admissionData?.department || '--'}
                disabled={true}
                onChange={() => {}}
              />
              <HorizontalField
                label="Hospital bill No"
                value={admissionData?.hospitalBillNo || '--'}
                disabled={true}
                onChange={() => {}}
              />
              <HorizontalField
                label="Total Advance(Rs)"
                value={admissionData?.advanceRs ? admissionData.advanceRs.toFixed(2) : '0.00'}
                disabled={true}
                onChange={() => {}}
              />
            </div>
          </div>
        </div>

        {/* New Advance Collection Input Section */}
        <div className="container-fluid mb-4">
          <h6 className="mb-3 fw-bold" style={{ color: "#007bff", fontSize: "1.1rem", marginTop: "20px" }}>New Advance Collection</h6>
          {/* FIRST ROW - 3 fields */}
          <div className="row">
            <div className="col-md-4">
              <HorizontalField
                label="Advance Date"
                value={formData.advanceDate}
                onChange={handleAdvanceDateChange}
                onDatePickerChange={handleAdvanceDatePickerChange}
                datePickerValue={advanceDateYYYYMMDD}
                datePickerRef={advanceDatePickerRef}
                isDate
                dateFormat="dd-mmm-yy"
                required
              />
            </div>
            <div className="col-md-4">
              <HorizontalField
                label="Received (Rs)"
                value={formData.receivedRs}
                onChange={(v) => {
                  // Only allow numbers and decimal point
                  const numericValue = v.replace(/[^0-9.]/g, '');
                  handleInputChange("receivedRs", numericValue);
                }}
                required
              />
              
            </div>
            <div className="col-md-4">
            <HorizontalField
                label="Payment By"
                isSelect
                options={paymentByOptions.map(opt => opt.label)}
                optionValues={paymentByOptions.map(opt => String(opt.value)) as string[]}
                value={String(formData.paymentBy)}
                onChange={(v) => handleInputChange("paymentBy", parseInt(v, 10) || 0)}
              />
            </div>
          </div>
          
          {/* SECOND ROW - 3 fields */}
          <div className="row">
          <div className="col-md-4">
            <HorizontalField
                label="Payment Remark"
                value={formData.paymentRemark}
                onChange={(v) => handleInputChange("paymentRemark", v)}
              />
            </div>
            <div className="col-md-4">
              <HorizontalField
                label="Receipt No"
                value={formData.receiptNo}
                onChange={(v) => handleInputChange("receiptNo", v)}
              />
            </div>
            <div className="col-md-4">
              <HorizontalField
                label="Receipt Date"
                value={formData.receiptDate}
                onChange={handleReceiptDateChange}
                onDatePickerChange={handleReceiptDatePickerChange}
                datePickerValue={receiptDateYYYYMMDD}
                datePickerRef={receiptDatePickerRef}
                isDate
                dateFormat="dd-mmm-yy"
              />
            </div>
          </div>
        </div>

        {/* Previous Advance Collection Records Table */}
        <div className="mb-4">
          <h6 className="mb-3 fw-bold" style={{ color: "#007bff" }}>Previous Advance Collection Records:</h6>
          <div className="table-responsive">
            <table className="table table-bordered" style={{ fontSize: "0.9rem" }}>
              <thead style={{ backgroundColor: "#007bff", color: "#ffffff" }}>
                <tr>
                  <th style={{ width: "5%" }}>Sr.</th>
                  <th style={{ width: "15%" }}>Admission / IPD No</th>
                  <th style={{ width: "12%" }}>Admission Date</th>
                  <th style={{ width: "12%" }}>Discharge Date</th>
                  <th style={{ width: "15%" }}>Reason of Admission</th>
                  <th style={{ width: "10%" }}>Insurance</th>
                  <th style={{ width: "12%" }}>Advance Date</th>
                  <th style={{ width: "10%" }}>Receipt No</th>
                  <th style={{ width: "9%" }}>Amount (Rs)</th>
                </tr>
              </thead>
              <tbody>
                {loadingPreviousRecords ? (
                  <tr>
                    <td colSpan={9} className="text-center p-4">
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <span className="ms-2">Loading previous records...</span>
                    </td>
                  </tr>
                ) : previousAdvanceRecords.length > 0 ? (
                  previousAdvanceRecords.map((record, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{admissionData?.admissionIpdNo || '--'}</td>
                      <td>{admissionData?.admissionDate ? formatDateToDDMMMYY(admissionData.admissionDate) : '--'}</td>
                      <td>{admissionData?.dischargeDate ? formatDateToDDMMMYY(admissionData.dischargeDate) : '--'}</td>
                      <td>{admissionData?.reasonOfAdmission || '--'}</td>
                      <td>{admissionData?.insurance || '--'}</td>
                      <td>{record.dateOfAdvance ? formatDateToDDMMMYY(record.dateOfAdvance) : '--'}</td>
                      <td>{record.receiptNo || '--'}</td>
                      <td>{record.advance ? record.advance.toFixed(2) : '0.00'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center p-4 text-muted">
                      No previous advance collection records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="d-flex justify-content-end border-top pt-3 mt-3 gap-2">
          <button 
            className="btn" 
            onClick={onClose} 
            disabled={isSubmitting}
            style={{ 
              backgroundColor: "rgb(0, 123, 255)", 
              color: "#ffffff",
              border: "none",
              padding: "8px 20px",
              borderRadius: "4px",
              fontWeight: 500,
              cursor: isSubmitting ? "not-allowed" : "pointer"
            }}
          >
            Close
          </button>
          <button 
            className="btn"
            onClick={handlePrintReceipt}
            disabled={true}
            style={{
              backgroundColor: "rgb(0, 123, 255)",
              color: "#ffffff",
              border: "none",
              padding: "8px 20px",
              borderRadius: "4px",
              fontWeight: 500,
              cursor: "not-allowed",
              opacity: 0.6
            }}
          >
            Print Receipt
          </button>
          <button 
            className="btn" 
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{ 
              backgroundColor: "#007bff", 
              color: "#ffffff",
              border: "none",
              padding: "8px 20px",
              borderRadius: "4px",
              fontWeight: 500,
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.6 : 1
            }}
          >
            {isSubmitting ? "Saving..." : "Submit"}
          </button>
        </div>
      </div>

      {/* Quick Registration Modal */}
      {showQuickRegistration && displayPatientData?.id && (
        <AddPatientPage
          open={showQuickRegistration}
          onClose={() => {
            setShowQuickRegistration(false);
          }}
          patientId={String(displayPatientData.id)}
          readOnly={true}
          doctorId={sessionData?.doctorId}
          clinicId={sessionData?.clinicId}
        />
      )}

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => {
          setSnackbarOpen(false);
          setSnackbarMessage("");
        }}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          zIndex: 99999,
          '& .MuiSnackbarContent-root': {
            backgroundColor: snackbarMessage.toLowerCase().includes('error') || 
                           snackbarMessage.toLowerCase().includes('failed') || 
                           snackbarMessage.toLowerCase().includes('missing') ? '#f44336' : '#4caf50',
            color: 'white',
            fontWeight: 'bold'
          }
        }}
      />
    </div>
  );
}

/* Reusable Horizontal Field Component */
function HorizontalField({
    label,
    value,
    onChange,
    isTextarea,
    isSelect,
    options,
    optionValues,
    isRadio,
    isDate,
    dateFormat,
    onDatePickerChange,
    datePickerValue,
    datePickerRef,
    disabled = false,
    maxLength,
    required = false,
  }: {
    label: string;
    value?: any;
    onChange: (v: any) => void;
    isTextarea?: boolean;
    isSelect?: boolean;
    options?: string[];
    optionValues?: string[]; // Values to use when options are displayed names
    isRadio?: boolean;
    isDate?: boolean;
    dateFormat?: string;
    onDatePickerChange?: (v: string) => void;
    datePickerValue?: string;
    datePickerRef?: React.RefObject<HTMLInputElement>;
    disabled?: boolean;
    maxLength?: number;
    required?: boolean;
  }) {
    return (
      <div className="row align-items-center mb-3">
        <label className="col-4 col-form-label fw-medium">
          {label}
          {required && <span style={{ color: '#f44336', marginLeft: '4px' }}>*</span>}
        </label>
        <div className="col-8">
          {isTextarea ? (
              <textarea
                className="form-control"
                rows={2}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                style={{
                  border: "1px solid #ced4da",
                  borderRadius: "4px",
                  padding: "6px 12px",
                  fontSize: "14px"
                }}
              />
          ) : isSelect ? (
            <select
              className="form-select"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              style={{
                border: "1px solid #ced4da",
                borderRadius: "4px",
                padding: "6px 12px",
                fontSize: "14px"
              }}
            >
              {options && options.length > 0 ? (
                options.map((opt, index) => {
                  // If optionValues is provided, use it for the value, otherwise use the option text
                  const optionValue = (optionValues && optionValues[index] !== undefined) 
                    ? optionValues[index] 
                    : opt;
                  // Use a combination of index and optionValue for unique key
                  const uniqueKey = optionValue ? `${optionValue}-${index}` : `option-${index}`;
                  return (
                    <option key={uniqueKey} value={optionValue}>
                      {opt}
                    </option>
                  );
                })
              ) : (
                <option value="">Select...</option>
              )}
            </select>
          ) : isRadio ? (
            <div className="d-flex gap-3">
              {options?.map((opt) => (
                <label key={opt}>
                  <input
                    type="radio"
                    name={label}
                    value={opt}
                    checked={value === opt}
                    onChange={(e) => onChange(e.target.value)}
                    className="me-1"
                    disabled={disabled}
                  />
                  {opt}
                </label>
              ))}
            </div>
          ) : isDate ? (
            <div style={{ position: "relative" }}>
              <input
                type="text"
                className="form-control"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                placeholder={dateFormat || "dd-mmm-yy"}
                style={{ textTransform: "uppercase", paddingRight: "40px" }}
              />
              <Calendar
                size={20}
                color="#666"
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: disabled ? "not-allowed" : "pointer",
                  pointerEvents: disabled ? "none" : "auto"
                }}
                onClick={() => {
                  if (!disabled && datePickerRef?.current) {
                    datePickerRef.current.showPicker?.();
                  }
                }}
              />
              {/* Hidden native date picker */}
              <input
                ref={datePickerRef}
                type="date"
                value={datePickerValue || ""}
                onChange={(e) => onDatePickerChange?.(e.target.value)}
                style={{
                  position: "absolute",
                  opacity: 0,
                  pointerEvents: "none",
                  width: 0,
                  height: 0
                }}
              />
            </div>
          ) : (
            <input
              type="text"
              className="form-control"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              maxLength={maxLength}
              style={{
                border: "1px solid #ced4da",
                borderRadius: "4px",
                padding: "6px 12px",
                fontSize: "14px"
              }}
            />
          )}
        </div>
      </div>
    );
}

