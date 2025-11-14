import React, { useState, useEffect, useRef } from "react";
import { Close } from "@mui/icons-material";
import { Snackbar } from "@mui/material";
import { Calendar } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import AddPatientPage from "../pages/AddPatientPage";
import { sessionService } from "../services/sessionService";
import { advanceCollectionService, AdvanceCollectionRequest, AdvanceCollectionDetailsRequest, AdvanceCollectionDTO } from "../services/advanceCollectionService";
import { patientService, Patient } from "../services/patientService";
import { SessionInfo } from "../services/sessionService";

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
    paymentBy: "Cash",
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
    
    return dateString;
  };

  // Format date to DD-MMM-YYYY format for display
  const formatDateToDDMMMYYYY = (dateString: string): string => {
    if (!dateString) return "";
    
    // If it's already in yyyy-mm-dd format, convert it
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, '0');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = months[date.getMonth()];
        const year = String(date.getFullYear());
        return `${day}-${month}-${year}`;
      }
    }
    
    return dateString;
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

    if (open) {
      loadSessionData();
      loadPatientDetails();
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
        paymentBy: "Cash",
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

  // Payment methods
  const paymentMethods = ["Cash", "Card", "UPI", "Cheque", "Online Transfer", "Other"];

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
      age: patientData.age
    } : (patientDetails ? {
      name: `${patientDetails.first_name} ${patientDetails.middle_name || ''} ${patientDetails.last_name}`.trim(),
      id: String(patientDetails.id),
      gender:patientDetails.gender_id.toString(),
      age: patientDetails.age_given
    } : null);

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

    try {
      // Map form data to API request format
      const request: AdvanceCollectionRequest = {
        patientId: String(displayPatientData.id || ''),
        doctorId: sessionData.doctorId,
        clinicId: sessionData.clinicId,
        ipdRefNo: admissionData?.admissionIpdNo || '',
        dateOfAdvance: advanceDateYYYYMMDD || '',
        receiptNo: formData.receiptNo || '',
        advance: parseFloat(formData.receivedRs),
      };

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
          paymentBy: "Cash",
          receiptNo: "",
          receiptDate: todayFormatted,
        });
      } else {
        setSnackbarMessage(response.error || "Failed to save advance collection");
        setSnackbarOpen(true);
      }
    } catch (error: any) {
      console.error("Error saving advance collection:", error);
      setSnackbarMessage(error.message || "An error occurred while saving advance collection");
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
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
          <h4 className="mb-0 fw-bold" style={{ color: "#007bff" }}>Advance Collection</h4>
          <button
            onClick={onClose}
            style={{ border: "none", background: "none", cursor: "pointer" }}
          >
            <Close />
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
              fontWeight: 500
            }}
            title={displayPatientData.id ? 'Click to view patient details' : ''}
          >
            {displayPatientData.name || 'N/A'} / Id: ({displayPatientData.id || 'N/A'}) /{" "}
            {displayPatientData.gender || 'N/A'} / {displayPatientData.age ? `${displayPatientData.age} Yr` : 'N/A'}
          </div>
        ) : (
          <div className="text-muted mb-3" style={{ fontSize: "14px", fontStyle: "italic" }}>
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
                value={admissionData?.dischargeDate ? formatDateToDDMMMYYYY(admissionData.dischargeDate) : 'DD-MMM-YYYY'}
                disabled={true}
                onChange={() => {}}
                isDate
                dateFormat="DD-MMM-YYYY"
              />
              <HorizontalField
                label="Insurance"
                value={admissionData?.insurance || 'No'}
                disabled={true}
                onChange={() => {}}
              />
              <HorizontalField
                label="Hospital bill Date"
                value={admissionData?.hospitalBillDate ? formatDateToDDMMMYYYY(admissionData.hospitalBillDate) : '--'}
                disabled={true}
                onChange={() => {}}
                isDate
                dateFormat="DD-MMM-YYYY"
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
                value={admissionData?.company || '--'}
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
                value={admissionData?.admissionDate ? formatDateToDDMMMYYYY(admissionData.admissionDate) : '--'}
                disabled={true}
                onChange={() => {}}
                isDate
                dateFormat="DD-MMM-YYYY"
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
          <h6 className="mb-3 fw-bold" style={{ color: "#007bff" }}>New Advance Collection</h6>
          <div className="row">
            {/* LEFT COLUMN - Advance Details */}
            <div className="col-md-6">
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
              <HorizontalField
                label="Payment Remark"
                value={formData.paymentRemark}
                onChange={(v) => handleInputChange("paymentRemark", v)}
              />
               <HorizontalField
                label="Receipt No"
                value={formData.receiptNo}
                onChange={(v) => handleInputChange("receiptNo", v)}
              />
            </div>

            {/* RIGHT COLUMN - Receipt Details */}
            <div className="col-md-6">
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
              <HorizontalField
                label="Payment By"
                isSelect
                options={paymentMethods}
                value={formData.paymentBy}
                onChange={(v) => handleInputChange("paymentBy", v)}
              />
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
                      <td>{admissionData?.admissionDate ? formatDateToDDMMMYYYY(admissionData.admissionDate) : '--'}</td>
                      <td>{admissionData?.dischargeDate ? formatDateToDDMMMYYYY(admissionData.dischargeDate) : '--'}</td>
                      <td>{admissionData?.reasonOfAdmission || '--'}</td>
                      <td>{admissionData?.insurance || '--'}</td>
                      <td>{record.dateOfAdvance ? formatDateToDDMMMYYYY(record.dateOfAdvance) : '--'}</td>
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
            style={{ backgroundColor: "#6c757d", color: "#ffffff" }}
          >
            Close
          </button>
          <button 
            className="btn" 
            onClick={handlePrintReceipt}
            disabled={isSubmitting || previousAdvanceRecords.length === 0}
            style={{ backgroundColor: "#17a2b8", color: "#ffffff" }}
          >
            Print Receipt
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSubmit}
            disabled={isSubmitting}
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
            />
          ) : isSelect ? (
            <select
              className="form-select"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
            >
              {options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
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
            />
          )}
        </div>
      </div>
    );
}

