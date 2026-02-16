import React, { useState, useEffect, useRef } from "react";
import { Close } from "@mui/icons-material";
import { Snackbar } from "@mui/material";
import { Calendar } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import AddPatientPage from "../pages/AddPatientPage";
import { sessionService } from "../services/sessionService";
import { admissionService, AdmissionCardRequest, Department, InsuranceCompany } from "../services/admissionService";

interface AdmissionCardDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => void;
  patientData?: {
    name?: string;
    id?: string;
    gender?: string;
    age?: number;
  };
  disabled?: boolean;
  admissionData?: any;
}

export default function AdmissionCardDialog({
  open,
  onClose,
  onSubmit,
  patientData,
  disabled = false,
  admissionData,
}: AdmissionCardDialogProps) {
  const [formData, setFormData] = useState({
    admissionIpdNo: admissionData?.admissionIpdNo || "",
    ipdFileNo: admissionData?.ipdFileNo || "",
    relativeName: admissionData?.relativeName || "",
    relationWithPatient: admissionData?.relationWithPatient || "",
    relativeContactNo: admissionData?.relativeContactNo || "",
    department: admissionData?.department || "Medicine",
    dateOfAdmission: admissionData?.dateOfAdmission || "",
    timeOfAdmissionHH: admissionData?.timeOfAdmissionHH || "",
    timeOfAdmissionMM: admissionData?.timeOfAdmissionMM || "",
    timeOfAdmissionAMPM: admissionData?.timeOfAdmissionAMPM || "AM",
    room: admissionData?.room || "",
    bed: admissionData?.bed || "",
    reasonForAdmission: admissionData?.reasonForAdmission || "",
    treatingDrSurgeon: admissionData?.treatingDrSurgeon || "",
    consultingDoctor: admissionData?.consultingDoctor || "",
    referredBy: admissionData?.referredBy || "",
    packageRemarks: admissionData?.packageRemarks || "",
    insurance: (() => {
      if (admissionData?.insurance) return admissionData.insurance;
      if (admissionData?.isinsurance === true || admissionData?.isinsurance === "true") return "Yes";
      if (admissionData?.isinsurance === false || admissionData?.isinsurance === "false") return "No";
      return "Yes"; // default
    })(),
    company: admissionData?.insurance_company_id || "",
    commentsNotes: admissionData?.commentsNotes || "",
    firstAdvance: admissionData?.firstAdvance || "",
    lastAdvanceDate: admissionData?.lastAdvanceDate || "",
    dateOfDischarge: admissionData?.dateOfDischarge || "",
  });
  const [showQuickRegistration, setShowQuickRegistration] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [dateOfAdmissionYYYYMMDD, setDateOfAdmissionYYYYMMDD] = useState<string>("");
  const datePickerRef = useRef<HTMLInputElement>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState<boolean>(false);
  const [insuranceCompanies, setInsuranceCompanies] = useState<InsuranceCompany[]>([]);
  const [loadingInsuranceCompanies, setLoadingInsuranceCompanies] = useState<boolean>(false);

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

  useEffect(() => {
    if (admissionData) {
      const dateOfAdmission = admissionData.dateOfAdmission || "";
      // If date is in dd-mmm-yy format, try to convert to yyyy-mm-dd for storage
      let yyyyMMDD = "";
      if (dateOfAdmission && /^\d{2}-[A-Za-z]{3}-\d{2}$/.test(dateOfAdmission)) {
        const parts = dateOfAdmission.split('-');
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
          yyyyMMDD = `${fullYear}-${month}-${day}`;
        }
      } else if (dateOfAdmission && /^\d{4}-\d{2}-\d{2}$/.test(dateOfAdmission)) {
        yyyyMMDD = dateOfAdmission;
      }

      setDateOfAdmissionYYYYMMDD(yyyyMMDD);
      setFormData({
        admissionIpdNo: admissionData.admissionIpdNo || "",
        ipdFileNo: admissionData.ipdFileNo || "",
        relativeName: admissionData.relativeName || "",
        relationWithPatient: admissionData.relationWithPatient || "",
        relativeContactNo: admissionData.relativeContactNo || "",
        department: admissionData.department || "Medicine",
        dateOfAdmission: formatDateToDDMMMYY(dateOfAdmission || yyyyMMDD),
        timeOfAdmissionHH: admissionData.timeOfAdmissionHH || "",
        timeOfAdmissionMM: admissionData.timeOfAdmissionMM || "",
        timeOfAdmissionAMPM: admissionData.timeOfAdmissionAMPM || "AM",
        room: admissionData.room || "",
        bed: admissionData.bed || "",
        reasonForAdmission: admissionData.reasonForAdmission || "",
        treatingDrSurgeon: admissionData.treatingDrSurgeon || "",
        consultingDoctor: admissionData.consultingDoctor || "",
        referredBy: admissionData.referredBy || "",
        packageRemarks: admissionData.packageRemarks || "",
        insurance: (() => {
          if (admissionData.insurance) return admissionData.insurance;
          if (admissionData.isinsurance === true || admissionData.isinsurance === "true") return "Yes";
          if (admissionData.isinsurance === false || admissionData.isinsurance === "false") return "No";
          return "Yes"; // default
        })(),
        company: admissionData.company || "",
        commentsNotes: admissionData.commentsNotes || "",
        firstAdvance: admissionData.firstAdvance || "",
        lastAdvanceDate: admissionData.lastAdvanceDate || "",
        dateOfDischarge: admissionData.dateOfDischarge || "",
      });
    } else {
      // Reset form when admissionData is undefined (new admission)
      setDateOfAdmissionYYYYMMDD("");
      setFormData({
        admissionIpdNo: "",
        ipdFileNo: "",
        relativeName: "",
        relationWithPatient: "",
        relativeContactNo: "",
        department: "Medicine",
        dateOfAdmission: "",
        timeOfAdmissionHH: "",
        timeOfAdmissionMM: "",
        timeOfAdmissionAMPM: "AM",
        room: "",
        bed: "",
        reasonForAdmission: "",
        treatingDrSurgeon: "",
        consultingDoctor: "",
        referredBy: "",
        packageRemarks: "",
        insurance: "",
        company: "",
        commentsNotes: "",
        firstAdvance: "",
        lastAdvanceDate: "",
        dateOfDischarge: "",
      });
    }
  }, [admissionData]);

  // Normalize company field when insurance companies are loaded from API response
  // If company is a name, find and convert to ID
  // This ensures the dropdown displays correctly and stores IDs for submission
  useEffect(() => {
    if (insuranceCompanies.length > 0 && formData.company) {
      // Check if company is already an ID (exists in insuranceCompanies from API response)
      const isId = insuranceCompanies.some(ic => ic.id === formData.company);

      if (!isId) {
        // Try to find by name in the fetched insurance companies
        const foundCompany = insuranceCompanies.find(
          ic => ic.name.toLowerCase() === formData.company.toLowerCase()
        );

        if (foundCompany && foundCompany.id !== formData.company) {
          // Update to use ID from API response instead of name
          console.log(`Converting company name "${formData.company}" to ID "${foundCompany.id}"`);
          setFormData(prev => ({ ...prev, company: foundCompany.id }));
        } else if (!foundCompany) {
          // Company name not found in fetched list, clear it
          console.warn(`Company "${formData.company}" not found in insurance companies list`);
        }
      } else {
        // Company is already an ID and exists in the fetched list - dropdown will display correctly
        console.log(`Company ID "${formData.company}" found in insurance companies list`);
      }
    }
  }, [insuranceCompanies]); // Run when insurance companies are loaded from API

  // Reset form when dialog opens for new admission (no admissionData)
  useEffect(() => {
    if (open && !admissionData) {
      setDateOfAdmissionYYYYMMDD("");
      setFormData({
        admissionIpdNo: "",
        ipdFileNo: "",
        relativeName: "",
        relationWithPatient: "",
        relativeContactNo: "",
        department: "Medicine",
        dateOfAdmission: "",
        timeOfAdmissionHH: "",
        timeOfAdmissionMM: "",
        timeOfAdmissionAMPM: "AM",
        room: "",
        bed: "",
        reasonForAdmission: "",
        treatingDrSurgeon: "",
        consultingDoctor: "",
        referredBy: "",
        packageRemarks: "",
        insurance: "Yes",
        company: "",
        commentsNotes: "",
        firstAdvance: "",
        lastAdvanceDate: "",
        dateOfDischarge: "",
      });
    }
  }, [open, admissionData]);

  // Load session data and departments on component mount
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

    const loadDepartments = async () => {
      try {
        setLoadingDepartments(true);
        const response = await admissionService.getAllDepartments();
        if (response.success && response.data && response.data.length > 0) {
          setDepartments(response.data);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
      } finally {
        setLoadingDepartments(false);
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

    if (open) {
      loadSessionData();
      loadDepartments();
      loadInsuranceCompanies();
    }
  }, [open]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle relative contact number - only allow 10 digits
  const handleRelativeContactChange = (value: string) => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');
    // Limit to 10 digits
    if (digitsOnly.length <= 10) {
      handleInputChange("relativeContactNo", digitsOnly);
    }
  };

  // Handle date picker change - receives yyyy-mm-dd format
  const handleDatePickerChange = (dateValue: string) => {
    if (dateValue) {
      // Store the yyyy-mm-dd format for submission
      setDateOfAdmissionYYYYMMDD(dateValue);
      // Convert to dd-mmm-yy for display
      const formattedDate = formatDateToDDMMMYY(dateValue);
      handleInputChange("dateOfAdmission", formattedDate);
    } else {
      setDateOfAdmissionYYYYMMDD("");
      handleInputChange("dateOfAdmission", "");
    }
  };

  // Handle manual date input change (when user types in dd-mmm-yy format)
  const handleDateOfAdmissionChange = (value: string) => {
    handleInputChange("dateOfAdmission", value);
    // Try to parse if it's in dd-mmm-yy format and convert to yyyy-mm-dd
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
        // Assume 20xx for years < 50, 19xx for years >= 50
        const fullYear = parseInt(yearStr) < 50 ? `20${yearStr}` : `19${yearStr}`;
        const yyyyMMDD = `${fullYear}-${month}-${day}`;
        setDateOfAdmissionYYYYMMDD(yyyyMMDD);
      }
    }
  };


  const displayPatientData = patientData;

  const handleSubmit = async () => {
    console.log('Patient Data', patientData);
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

    // Validate Date of Admission (required)
    if (!formData.dateOfAdmission || !dateOfAdmissionYYYYMMDD) {
      setSnackbarMessage("Date of Admission is required.");
      setSnackbarOpen(true);
      return;
    }

    // Validate Time of Admission (required)
    if (!formData.timeOfAdmissionHH || !formData.timeOfAdmissionMM) {
      setSnackbarMessage("Time of Admission is required.");
      setSnackbarOpen(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine time fields into admissionTime format (HH:MM AM/PM)
      let admissionTime = "";
      if (formData.timeOfAdmissionHH && formData.timeOfAdmissionMM) {
        // admissionTime = `${formData.timeOfAdmissionHH}:${formData.timeOfAdmissionMM} ${formData.timeOfAdmissionAMPM}`;
        admissionTime = `${formData.timeOfAdmissionHH}:${formData.timeOfAdmissionMM}:00`;
      }

      // Map form data to API request format
      const request: AdmissionCardRequest = {
        patientId: displayPatientData.id!,
        doctorId: sessionData.doctorId,
        clinicId: sessionData.clinicId,
        ipdRefNo: formData.admissionIpdNo || undefined,
        relativeName: formData.relativeName || undefined,
        relation: formData.relationWithPatient || undefined,
        contactNo: formData.relativeContactNo || undefined,
        admissionDate: dateOfAdmissionYYYYMMDD || formData.dateOfAdmission || undefined,
        admissionTime: admissionTime || undefined,
        reasonOfAdmission: formData.reasonForAdmission || undefined,
        department: formData.department || undefined,
        isInsurance: formData.insurance === "Yes" ? true : formData.insurance === "No" ? false : undefined,
        insuranceDetails: formData.company || undefined,
        treatingDoctor: formData.treatingDrSurgeon || undefined,
        consultingDoctor: formData.consultingDoctor || undefined,
        ipdFileNo: formData.ipdFileNo || undefined,
        roomNo: formData.room || undefined,
        bedNo: formData.bed || undefined,
        packageRemarks: formData.packageRemarks || undefined,
        referredDoctor: formData.referredBy || undefined,
        commentsNote: formData.commentsNotes || undefined,
        insuranceCompanyId: formData.company || undefined,
        shiftId: '1',
        loginId: '',
      };

      const response = await admissionService.saveAdmissionCard(request);

      if (response.success) {
        setSnackbarMessage(response.message || "Admission card saved successfully");
        setSnackbarOpen(true);

        // Call the onSubmit callback if provided (for parent component to refresh data)
        onSubmit?.(formData);

        // Close dialog after a short delay to show success message
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setSnackbarMessage(response.error || "Failed to save admission card");
        setSnackbarOpen(true);
      }
    } catch (error: any) {
      console.error("Error saving admission card:", error);
      setSnackbarMessage(error.message || "An error occurred while saving admission card");
      setSnackbarOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking directly on the backdrop, not on any child elements
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
          maxWidth: "1200px",
          maxHeight: "95vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
          <h4 className="mb-0 fw-bold">Admission Card</h4>
          <button
            onClick={onClose}
            style={{ border: "none", background: "none", cursor: "pointer" }}
          >
            <Close />
          </button>
        </div>
        {displayPatientData ? (
          <div
            onClick={() => {
              if (displayPatientData.id) {
                setShowQuickRegistration(true);
              }
            }}
            className="text-primary mb-3"
            style={{
              fontSize: "14px",
              cursor: displayPatientData.id ? 'pointer' : 'default',
              textDecoration: displayPatientData.id ? 'underline' : 'none'
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

        {/* Form */}
        <div className="container-fluid">
          <div className="row">
            {/* LEFT COLUMN */}
            <div className="col-md-6">
              <HorizontalField
                label="Admission / IPD No"
                value={formData.admissionIpdNo}
                disabled={true}
                onChange={(v) => handleInputChange("admissionIpdNo", v)}
              />
              <HorizontalField
                label="Relative Name"
                value={formData.relativeName}
                onChange={(v) => handleInputChange("relativeName", v)}
              />
              <HorizontalField
                label="Relative Contact No"
                value={formData.relativeContactNo}
                onChange={handleRelativeContactChange}
                maxLength={10}
              />
              <HorizontalField
                label="Date of Admission"
                required
                value={formData.dateOfAdmission}
                onChange={handleDateOfAdmissionChange}
                onDatePickerChange={handleDatePickerChange}
                datePickerValue={dateOfAdmissionYYYYMMDD}
                datePickerRef={datePickerRef}
                isDate
                dateFormat="dd-mmm-yy"
              />
              <HorizontalField
                label="Reason for Admission"
                value={formData.reasonForAdmission}
                onChange={(v) => handleInputChange("reasonForAdmission", v)}
              />
              <HorizontalField
                label="Treating Dr. / Surgeon"
                value={formData.treatingDrSurgeon}
                onChange={(v) => handleInputChange("treatingDrSurgeon", v)}
              />
              <HorizontalField
                label="Referred By"
                value={formData.referredBy}
                onChange={(v) => handleInputChange("referredBy", v)}
              />
              <HorizontalField
                label="Insurance"
                isRadio
                options={["Yes", "No"]}
                value={formData.insurance}
                onChange={(v) => {
                  handleInputChange("insurance", v);
                  // Clear company when insurance is "No"
                  if (v === "No") {
                    handleInputChange("company", "");
                  }
                }}
              />
              <HorizontalField
                label="Comments / Notes"
                value={formData.commentsNotes}
                onChange={(v) => handleInputChange("commentsNotes", v)}
              />
              <HorizontalField
                label="Date of Discharge"
                value={formData.dateOfDischarge}
                disabled={true}
                onChange={(v) => handleInputChange("dateOfDischarge", v)}
              />
            </div>

            {/* RIGHT COLUMN */}
            <div className="col-md-6">
              <HorizontalField
                label="IPD File No"
                value={formData.ipdFileNo}
                onChange={(v) => handleInputChange("ipdFileNo", v)}
              />
              <HorizontalField
                label="Relation with patient"
                value={formData.relationWithPatient}
                onChange={(v) => handleInputChange("relationWithPatient", v)}
              />
              <HorizontalField
                label="Department"
                isSelect
                options={departments.map(dept => dept.name)}
                value={formData.department}
                onChange={(v) => handleInputChange("department", v)}
                disabled={loadingDepartments}
              />
              <HorizontalField
                label="Time of Admission"
                required
                isTime
                value={{
                  hh: formData.timeOfAdmissionHH,
                  mm: formData.timeOfAdmissionMM,
                  ampm: formData.timeOfAdmissionAMPM,
                }}
                onChange={(val: any) => {
                  handleInputChange("timeOfAdmissionHH", val.hh);
                  handleInputChange("timeOfAdmissionMM", val.mm);
                  handleInputChange("timeOfAdmissionAMPM", val.ampm);
                }}
              />
              <div className="row align-items-center mb-3">
                <label className="col-4 col-form-label fw-medium">Room</label>
                <div className="col-8">
                  <div className="d-flex gap-2 align-items-center">
                    <input
                      type="text"
                      className="form-control"
                      value={formData.room}
                      onChange={(e) => handleInputChange("room", e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <label className="mb-0 fw-medium" style={{ fontSize: "14px", minWidth: "40px" }}>Bed</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.bed}
                      onChange={(e) => handleInputChange("bed", e.target.value)}
                      style={{ width: "100px" }}
                    />
                  </div>
                </div>
              </div>
              <HorizontalField
                label="Consulting Doctor"
                value={formData.consultingDoctor}
                onChange={(v) => handleInputChange("consultingDoctor", v)}
              />
              <HorizontalField
                label="Package Remarks"
                value={formData.packageRemarks}
                onChange={(v) => handleInputChange("packageRemarks", v)}
              />
              <HorizontalField
                label="Company"
                value={formData.company}
                onChange={(v) => handleInputChange("company", v)}
                isSelect={formData.insurance === "Yes"}
                options={insuranceCompanies.map(ic => ic.name)}
                optionValues={insuranceCompanies.map(ic => ic.id)}
                disabled={formData.insurance !== "Yes" || loadingInsuranceCompanies}
              />
              <HorizontalField
                label="First Advance"
                value={formData.firstAdvance}
                disabled={true}
                onChange={(v) => handleInputChange("firstAdvance", v)}
              />
              <HorizontalField
                label="Last Advance Date"
                value={formData.lastAdvanceDate}
                disabled={true}
                onChange={(v) => handleInputChange("lastAdvanceDate", v)}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="d-flex justify-content-end border-top pt-3 mt-3 gap-2">
          <button className="btn btn-primary" onClick={onClose} disabled={isSubmitting}>
            Close
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

      {/* Quick Registration Modal - appears on top of Admission Card window */}
      {showQuickRegistration && displayPatientData?.id && (
        <AddPatientPage
          open={showQuickRegistration}
          onClose={() => {
            setShowQuickRegistration(false);
          }}
          patientId={displayPatientData.id}
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

/* ✅ Reusable Horizontal Field Component */
function HorizontalField({
  label,
  value,
  onChange,
  isTextarea,
  isSelect,
  options,
  optionValues,
  isRadio,
  isTime,
  isDate,
  dateFormat,
  onDatePickerChange,
  datePickerValue,
  datePickerRef,
  dual, // ✅ NEW: for two inputs like Room/Bed
  disabled = false,
  maxLength,
  required = false,
  error = false,
  helperText = "",
}: {
  label: string;
  value?: any;
  onChange: (v: any) => void;
  isTextarea?: boolean;
  isSelect?: boolean;
  options?: string[];
  optionValues?: string[]; // Values to use when options are displayed names
  isRadio?: boolean;
  isTime?: boolean;
  isDate?: boolean;
  dateFormat?: string;
  onDatePickerChange?: (v: string) => void;
  datePickerValue?: string;
  datePickerRef?: React.RefObject<HTMLInputElement>;
  dual?: {
    label2: string;
    value2: string;
    onChange2: (v: string) => void;
  };
  disabled?: boolean;
  maxLength?: number;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}) {
  return (
    <div className="row align-items-center mb-0" style={{ marginBottom: "18px" }}>
      <label className="col-4 col-form-label fw-medium">
        {label}
        {required && <span style={{ color: '#f44336', marginLeft: '4px' }}>*</span>}
      </label>
      <div className="col-8" style={{ position: 'relative' }}>
        {dual ? (
          // ✅ Two inputs (Room + Bed)
          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              placeholder={label}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
            />
            <input
              type="text"
              className="form-control"
              placeholder={dual.label2}
              value={dual.value2}
              onChange={(e) => dual.onChange2(e.target.value)}
              disabled={disabled}
            />
          </div>
        ) : isTextarea ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2px' }}>
              <span style={{ fontSize: '11px', color: '#666' }}>
                {(value || '').length}/{maxLength || 1000}
              </span>
            </div>
            <textarea
              className="form-control"
              rows={2}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              maxLength={maxLength || 1000}
              style={{ width: "100%" }}
            />
          </div>
        ) : isSelect ? (
          <select
            className="form-select"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          >
            <option value="">Select...</option>
            {options?.map((opt, index) => {
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
            })}
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
        ) : isTime ? (
          <div className="d-flex gap-2">
            <select
              className="form-select"
              style={{ width: "80px" }}
              value={value.hh}
              onChange={(e) => onChange({ ...value, hh: e.target.value })}
              disabled={disabled}
            >
              <option value="">HH</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={String(n).padStart(2, "0")}>
                  {String(n).padStart(2, "0")}
                </option>
              ))}
            </select>
            <select
              className="form-select"
              style={{ width: "80px" }}
              value={value.mm}
              onChange={(e) => onChange({ ...value, mm: e.target.value })}
              disabled={disabled}
            >
              <option value="">MM</option>
              {Array.from({ length: 60 }, (_, i) => i).map((n) => (
                <option key={n} value={String(n).padStart(2, "0")}>
                  {String(n).padStart(2, "0")}
                </option>
              ))}
            </select>
            <select
              className="form-select"
              style={{ width: "80px" }}
              value={value.ampm}
              onChange={(e) => onChange({ ...value, ampm: e.target.value })}
              disabled={disabled}
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
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
        {error && helperText && (
          <div style={{
            color: '#d32f2f',
            fontSize: '11px',
            position: 'absolute',
            top: '100%',
            left: '12px',
            marginTop: '1px',
            zIndex: 10
          }}>
            {helperText}
          </div>
        )}
      </div>
    </div>
  );
}
