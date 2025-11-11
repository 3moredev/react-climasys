import React, { useState, useEffect } from "react";
import { Close } from "@mui/icons-material";
import "bootstrap/dist/css/bootstrap.min.css";

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
    insurance: admissionData?.insurance || "Yes",
    company: admissionData?.company || "",
    commentsNotes: admissionData?.commentsNotes || "",
    firstAdvance: admissionData?.firstAdvance || "",
    lastAdvanceDate: admissionData?.lastAdvanceDate || "",
    dateOfDischarge: admissionData?.dateOfDischarge || "",
  });

  useEffect(() => {
    if (admissionData) {
      setFormData({
        admissionIpdNo: admissionData.admissionIpdNo || "",
        ipdFileNo: admissionData.ipdFileNo || "",
        relativeName: admissionData.relativeName || "",
        relationWithPatient: admissionData.relationWithPatient || "",
        relativeContactNo: admissionData.relativeContactNo || "",
        department: admissionData.department || "Medicine",
        dateOfAdmission: admissionData.dateOfAdmission || "",
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
        insurance: admissionData.insurance || "Yes",
        company: admissionData.company || "",
        commentsNotes: admissionData.commentsNotes || "",
        firstAdvance: admissionData.firstAdvance || "",
        lastAdvanceDate: admissionData.lastAdvanceDate || "",
        dateOfDischarge: admissionData.dateOfDischarge || "",
      });
    }
  }, [admissionData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSubmit?.(formData);
    onClose();
  };

  const displayPatientData = patientData || {
    name: "IRAWATI GIRISH KAMAT",
    id: "01-06-2019-021099",
    gender: "Female",
    age: 31,
  };

  if (!open) return null;

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
      onClick={onClose}
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
        <div className="text-primary mb-3" style={{ fontSize: "14px" }}>
          {displayPatientData.name} / Id: ({displayPatientData.id}) /{" "}
          {displayPatientData.gender} / {displayPatientData.age} Yr
        </div>

        {/* Form */}
        <div className="container-fluid">
          <div className="row">
            {/* LEFT COLUMN */}
            <div className="col-md-6">
              <HorizontalField
                label="Admission / IPD No"
                value={formData.admissionIpdNo}
                disabled={disabled}
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
                onChange={(v) => handleInputChange("relativeContactNo", v)}
              />
              <HorizontalField
                label="Date of Admission"
                value={formData.dateOfAdmission}
                onChange={(v) => handleInputChange("dateOfAdmission", v)}
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
                onChange={(v) => handleInputChange("insurance", v)}
              />
              <HorizontalField
                label="Comments / Notes"
                value={formData.commentsNotes}
                onChange={(v) => handleInputChange("commentsNotes", v)}
              />
               <HorizontalField
                label="Date of Discharge"
                value={formData.dateOfDischarge}
                disabled={disabled}
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
                options={[
                  "Medicine",
                  "Surgery",
                  "Pediatrics",
                  "Orthopedics",
                  "Cardiology",
                ]}
                value={formData.department}
                onChange={(v) => handleInputChange("department", v)}
              />
              <HorizontalField
                label="Time of Admission"
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
              />
                <HorizontalField
                label="First Advance"
                value={formData.firstAdvance}
                disabled={disabled}
                onChange={(v) => handleInputChange("firstAdvance", v)}
              />
              <HorizontalField
                label="Last Advance Date"
                value={formData.lastAdvanceDate}
                disabled={disabled}
                onChange={(v) => handleInputChange("lastAdvanceDate", v)}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="d-flex justify-content-end border-top pt-3 mt-3 gap-2">
          <button className="btn btn-primary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </div>
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
    isRadio,
    isTime,
    dual, // ✅ NEW: for two inputs like Room/Bed
    disabled = false,
  }: {
    label: string;
    value?: any;
    onChange: (v: any) => void;
    isTextarea?: boolean;
    isSelect?: boolean;
    options?: string[];
    isRadio?: boolean;
    isTime?: boolean;
    dual?: { 
      label2: string; 
      value2: string; 
      onChange2: (v: string) => void; 
    };
    disabled?: boolean;
  }) {
    return (
      <div className="row align-items-center mb-3">
        <label className="col-4 col-form-label fw-medium">{label}</label>
        <div className="col-8">
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
          ) : isTime ? (
            <div className="d-flex gap-2">
              <select
                className="form-select"
                style={{ width: "70px" }}
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
                style={{ width: "70px" }}
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
          ) : (
            <input
              type="text"
              className="form-control"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
            />
          )}
        </div>
      </div>
    );
}
