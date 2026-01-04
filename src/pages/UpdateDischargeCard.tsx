import React, { useState, useRef, useEffect } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
    ClassicEditor,
    Essentials,
    Paragraph,
    // ... (keep existing imports)
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Code,
    Font,
    List,
    Link,
    Image,
    ImageToolbar,
    ImageCaption,
    ImageStyle,
    ImageResize,
    ImageUpload,
    SourceEditing,
    BlockQuote,
    HorizontalLine,
    RemoveFormat,
    Heading
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';
import './UpdateDischargeCard.css';
import "bootstrap/dist/css/bootstrap.min.css";

import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { getKeywords } from '../services/referenceService';
import dischargeService from '../services/dischargeService';

const UpdateDischargeCard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { patientId, ipdRefNo, doctorId, clinicId } = location.state || {}; // Extract ipdRefNo as well
    const { user } = useSelector((state: RootState) => state.auth);

    // Mock Patient Data (Replace with prop or context later, or update from API response)
    const [patientInfo, setPatientInfo] = useState({
        name: "XYZ",
        id: patientId || "XX-XX-XXXX-XXXX",
        gender: "Unknown",
        age: "0 Yr"
    });

    const [loading, setLoading] = useState(false);

    // Form State (add missing fields)
    const [formData, setFormData] = useState({
        address: "Nashik, Nashik",
        contactNo: "1234567890",
        ipdNo: "IPD-2020-00-0174",
        ipdFileNo: "149",
        admissionDate: "",
        admissionTime: "",
        dischargeDate: "",
        dischargeTime: "",
        admittedDays: "",
        operationStartDate: "",
        operationStartTime: "",
        operationEndDate: "",
        operationEndTime: "",
        otHours: "",
        treatingDoctor: "DR ANIRUDDHA TONGA",
        consultingDoctor: "DR AMITKUMAR PANDE",
        anesthetist: "",
        weight: "",
        room: "",
        bedNo: "",
        totalAdvance: "0.0",
        keyword: "",
        referredBy: "",
        company: "",
        department: "",
        lastAdvanceDate: "",
        conditionOnDischarge: "",
        reasonForDischarge: "",
        remark: "",
        followUpComments: "",
        followUpDate: ""
    });

    // State for Rich Text Editors - storing HTML strings
    const [editorData, setEditorData] = useState({
        complaint: '',
        history: '',
        investigations: '',
        onExamination: '',
        systemic: '',
        procedure: '',
        treatment: '',
        postDischargeMedicines: '',
        postDischargeInstructions: '',
        operativeNotes: '', // The one after Post Discharge
        operativeNotes2: '', // The last one
        footer: '',
        postOpDiagnosis: ''
    });

    const [fileName, setFileName] = useState<string>('');
    const [keywords, setKeywords] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchKeywords = async () => {
            try {
                const data = await getKeywords();
                setKeywords(data);
            } catch (error) {
                console.error("Error fetching keywords:", error);
            }
        };

        fetchKeywords();
    }, []);

    useEffect(() => {
        const fetchDischargeDetails = async () => {
            console.log("UpdateDischargeCard: Checking dependencies for fetch", {
                clinicId,
                doctorId,
                patientId,
                ipdRefNo
            });

            if (clinicId && doctorId && patientId && ipdRefNo) {
                setLoading(true);
                try {
                    console.log("UpdateDischargeCard: Calling getDischargeDetails API");
                    const response = await dischargeService.getDischargeDetails({
                        patientId,
                        clinicId,
                        doctorId,
                        ipdRefNo
                    });
                    console.log("UpdateDischargeCard: API Response received", response);

                    if (response.success && response.data) {
                        const rootData = response.data;
                        const mainData = rootData.mainData || {};

                        // Populate Form Data
                        setFormData(prev => ({
                            ...prev,
                            address: mainData.address || prev.address,
                            contactNo: mainData.contactNo || prev.contactNo,
                            ipdNo: mainData.ipdRefNo || prev.ipdNo,
                            ipdFileNo: mainData.ipdNo || prev.ipdFileNo,
                            admissionDate: mainData.admissionDate || prev.admissionDate,
                            admissionTime: mainData.admissionTime || prev.admissionTime,
                            dischargeDate: mainData.dischargeDate || prev.dischargeDate,
                            dischargeTime: mainData.dischargeTime || prev.dischargeTime,
                            admittedDays: mainData.admittedDays || prev.admittedDays,
                            operationStartDate: mainData.operationStartDate || prev.operationStartDate,
                            operationStartTime: mainData.operationStartTime || prev.operationStartTime,
                            operationEndDate: mainData.operationEndDate || prev.operationEndDate,
                            operationEndTime: mainData.operationEndTime || prev.operationEndTime,
                            otHours: mainData.otHours || prev.otHours,
                            treatingDoctor: mainData.treatingDoctor || prev.treatingDoctor,
                            consultingDoctor: mainData.consultingDoctor || prev.consultingDoctor,
                            anesthetist: mainData.anesthesia || prev.anesthetist,
                            weight: mainData.weight || prev.weight,
                            room: mainData.room || prev.room,
                            bedNo: mainData.bedNo || prev.bedNo,
                            totalAdvance: rootData.totalAdvance || prev.totalAdvance,
                            keyword: mainData.keyword || prev.keyword,
                            referredBy: mainData.referredDoctor || prev.referredBy,
                            company: mainData.company || prev.company,
                            department: mainData.department || prev.department,
                            lastAdvanceDate: rootData.lastAdvanceDate || prev.lastAdvanceDate,
                            conditionOnDischarge: mainData.conditionDischarge || prev.conditionOnDischarge,
                            reasonForDischarge: mainData.reasonForDischarge || prev.reasonForDischarge,
                            remark: mainData.remark || prev.remark,
                            followUpComments: mainData.followUpComments || prev.followUpComments,
                            followUpDate: mainData.followUpDate || prev.followUpDate
                        }));

                        // Populate Editors
                        setEditorData(prev => ({
                            ...prev,
                            complaint: mainData.complaints || prev.complaint,
                            history: mainData.history || prev.history,
                            investigations: mainData.investigations || prev.investigations,
                            onExamination: mainData.oe || prev.onExamination,
                            systemic: mainData.se || prev.systemic,
                            procedure: mainData.procedure || prev.procedure,
                            treatment: mainData.treatment || prev.treatment,
                            postDischargeMedicines: mainData.discharge || prev.postDischargeMedicines, // Assuming 'discharge' in JSON maps here
                            postDischargeInstructions: mainData.instructions || prev.postDischargeInstructions,
                            operativeNotes: mainData.operativeNotes || prev.operativeNotes,
                            postOpDiagnosis: mainData.diagnosis || prev.postOpDiagnosis,
                            footer: mainData.footer || prev.footer
                        }));

                        // Update Patient Info Banner
                        setPatientInfo(prev => ({
                            ...prev,
                            name: mainData.patientName || prev.name,
                            id: mainData.patientId || prev.id,
                            gender: mainData.gender || prev.gender,
                            age: mainData.age !== undefined ? `${mainData.age} Yr` : prev.age
                        }));
                    }
                } catch (error) {
                    console.error("Error fetching discharge details:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchDischargeDetails();
    }, [user, patientId, ipdRefNo]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
        } else {
            setFileName('');
        }
    };

    const handleEditorChange = (editorName: string, data: string) => {
        setEditorData(prev => ({ ...prev, [editorName]: data }));
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user?.clinicId || !user?.doctorId || !patientId || !ipdRefNo) {
            alert("Missing required data (Clinic ID, Doctor ID, Patient ID, or IPD Ref No)");
            return;
        }

        setLoading(true);
        try {
            // Construct payload matching UpdateDischargeCardRequest
            const payload: any = {
                doctorId,
                clinicId,
                patientId,
                ipdRefNo,
                admissionDate: formData.admissionDate || '',
                admissionTime: formData.admissionTime || '00:00:00',
                treatingDoctor: formData.treatingDoctor || '',
                consultingDoctor: formData.consultingDoctor || '',
                dischargeDate: formData.dischargeDate || '',
                dischargeTime: formData.dischargeTime || '00:00:00',
                weight: formData.weight ? parseFloat(formData.weight) : 0,
                ipdNo: formData.ipdNo || '',
                userId: user.loginId, // Mapped from loginId as userId is not on User type
                keywordAttachments: [],
                keyword: formData.keyword || '',
                visitDate: formData.dischargeDate || '',
                operationStartDate: formData.operationStartDate || null,
                operationEndDate: formData.operationEndDate || null,
                operationStartTime: formData.operationStartTime || null,
                operationEndTime: formData.operationEndTime || null,
                operativeNotes: editorData.operativeNotes || '', // Use editorData
                remark: formData.remark || '',
                followUpComments: formData.followUpComments || '',
                anesthesia: formData.anesthetist || '', // Mapped from anesthetist
                reasonForDischarge: formData.reasonForDischarge || '',
                referredDoctor: formData.referredBy || '', // Mapped from referredBy
                conditionOnDischarge: formData.conditionOnDischarge || '', // Mapped from conditionOnDischarge
                footer: editorData.footer || '', // Use editorData
                defaultDate: formData.dischargeDate || '',
                ward: '',
                room: formData.room || '',
                admittedDays: formData.admittedDays || '',
                otHours: formData.otHours || '',
                company: formData.company || '',
                followUpDate: formData.followUpDate || null,

                dischargeDetails: [{
                    // Include required context fields for the detail DTO if backend requires them
                    doctorId,
                    clinicId,
                    shiftId: 1, // Defaulting to 1 as shiftId is not available in frontend user context
                    patientId,
                    ipdRefNo,
                    diagnosis: editorData.postOpDiagnosis || '',
                    complaints: editorData.complaint || '',
                    history: editorData.history || '',
                    investigation: editorData.investigations || '',
                    oe: editorData.onExamination || '',
                    se: editorData.systemic || '',
                    procedure: editorData.procedure || '',
                    treatment: editorData.treatment || '',
                    discharge: editorData.postDischargeMedicines || '',
                    instruction: editorData.postDischargeInstructions || ''
                }]
            };

            const response = await dischargeService.saveDischargeDetails(payload);

            if (response.success ) {
                alert(response.message || "Discharge card saved successfully!");
                navigate('/manage-discharge-card');
            } else {
                alert("Failed to save: " + (response.error || response.message || "Unknown error"));
            }

        } catch (error: any) {
            console.error("Save error:", error);
            alert("Error saving discharge card: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            {/* Header */}
            <div className="bg-white border-bottom py-3 mb-4">
                <div className="container special-container">
                    <h5 className="mb-0 fw-bold">Update Discharge Card</h5>
                </div>
            </div>

            <div className="container special-container pb-5 px-0">
                <div className="card shadow-sm border-0">
                    <div className="card-body p-4">
                        {/* Patient Info Banner */}
                        <div className="mb-4">
                            <h5 className="text-primary fw-bold">
                                {patientInfo.name} <span className="text-dark fw-bold">/ Id: ({patientInfo.id}) / {patientInfo.gender} / {patientInfo.age}</span>
                            </h5>
                        </div>

                        {/* Form Grid */}
                        <div className="row row-cols-5 g-3 mb-4">
                            {/* Row 1 */}
                            <div className="col-md-4" style={{ flex: '0 0 40%', maxWidth: '40%' }}>
                                <LabelInput label="Address" value={formData.address} disabled />
                            </div>
                            <div className="col">
                                <LabelInput label="Contact No" value={formData.contactNo} disabled />
                            </div>
                            <div className="col">
                                <LabelInput label="IPD No" value={formData.ipdNo} disabled />
                            </div>
                            <div className="col">
                                <LabelInput label="IPD / File Ref No" value={formData.ipdFileNo} required onChange={(e) => handleInputChange('ipdFileNo', e.target.value)} />
                            </div>

                            {/* Row 2 */}
                            <div className="col">
                                <DateInput label="Date of Admission" required disabled value={formData.admissionDate} />
                            </div>
                            <div className="col">
                                <TimeInput label="Time of Admission" required disabled value={formData.admissionTime} />
                            </div>
                            <div className="col">
                                <DateInput label="Date of Discharge" value={formData.dischargeDate} onChange={(e) => handleInputChange('dischargeDate', e.target.value)} />
                            </div>
                            <div className="col">
                                <TimeInput label="Time of Discharge" required simpleLabel value={formData.dischargeTime} onChange={(val) => handleInputChange('dischargeTime', val)} />
                            </div>
                            <div className="col">
                                <LabelInput label="Admitted Days" value={formData.admittedDays} onChange={(e) => handleInputChange('admittedDays', e.target.value)} />
                            </div>


                            {/* Row 3 */}
                            <div className="col">
                                <DateInput label="Operation Start Date" value={formData.operationStartDate} onChange={(e) => handleInputChange('operationStartDate', e.target.value)} />
                            </div>
                            <div className="col">
                                <TimeInput label="Operation Start Time" value={formData.operationStartTime} onChange={(val) => handleInputChange('operationStartTime', val)} />
                            </div>
                            <div className="col">
                                <DateInput label="Operation End Date" value={formData.operationEndDate} onChange={(e) => handleInputChange('operationEndDate', e.target.value)} />
                            </div>
                            <div className="col">
                                <TimeInput label="Operation End Time" simpleLabel value={formData.operationEndTime} onChange={(val) => handleInputChange('operationEndTime', val)} />
                            </div>
                            <div className="col">
                                <LabelInput label="OT Hours" value={formData.otHours} onChange={(e) => handleInputChange('otHours', e.target.value)} />
                            </div>

                            {/* Row 4 */}
                            <div className="col">
                                <LabelInput label="Treating Dr. / Surgeon" value={formData.treatingDoctor} onChange={(e) => handleInputChange('treatingDoctor', e.target.value)} />
                            </div>
                            <div className="col">
                                <LabelInput label="Consulting Doctor" value={formData.consultingDoctor} onChange={(e) => handleInputChange('consultingDoctor', e.target.value)} />
                            </div>
                            <div className="col">
                                <LabelInput label="Anesthetist" value={formData.anesthetist} onChange={(e) => handleInputChange('anesthetist', e.target.value)} />
                            </div>
                            <div className="col">
                                <div className="row">
                                    <div className="col-4 pe-1">
                                        <LabelInput label="Weight (Kg)" value={formData.weight} onChange={(e) => handleInputChange('weight', e.target.value)} />
                                    </div>
                                    <div className="col-4 px-1">
                                        <LabelInput label="Room" value={formData.room} onChange={(e) => handleInputChange('room', e.target.value)} />
                                    </div>
                                    <div className="col-4 ps-1">
                                        <LabelInput label="Bed No" value={formData.bedNo} onChange={(e) => handleInputChange('bedNo', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <LabelInput label="Total Advance (Rs)" value={formData.totalAdvance} disabled />
                            </div>

                            {/* Row 5 */}
                            <div className="col">
                                <label className="form-label small fw-bold text-muted mb-1">Keyword (Operation)</label>
                                <select
                                    className="form-select form-select-sm text-muted"
                                    value={formData.keyword}
                                    onChange={(e) => handleInputChange('keyword', e.target.value)}
                                >
                                    <option>--Select--</option>
                                    {keywords.map((keyword, index) => (
                                        <option key={keyword} value={keyword}>{keyword}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col">
                                <LabelInput label="Referred By" value={formData.referredBy} onChange={(e) => handleInputChange('referredBy', e.target.value)} />
                            </div>
                            <div className="col">
                                <LabelInput label="Company" value={formData.company} disabled />
                            </div>
                            <div className="col">
                                <LabelInput label="Department" value={formData.department} disabled />
                            </div>
                            <div className="col">
                                <LabelInput label="Last Advance Date" value={formData.lastAdvanceDate} disabled />
                            </div>
                        </div>


                        {/* Editors Grid */}
                        <div className="row g-4">
                            <div className="col-md-6">
                                <EditorField
                                    label="Complaint / Pre-OP Diagnosis"
                                    data={editorData.complaint}
                                    onChange={(data) => handleEditorChange('complaint', data)}
                                />
                            </div>
                            <div className="col-md-6">
                                <EditorField
                                    label="Post-OP Diagnosis"
                                    data={editorData.postOpDiagnosis}
                                    onChange={(data) => handleEditorChange('postOpDiagnosis', data)}
                                />
                            </div>
                            <div className="col-md-6">
                                <EditorField
                                    label="History"
                                    data={editorData.history}
                                    onChange={(data) => handleEditorChange('history', data)}
                                />
                            </div>
                            <div className="col-md-6">
                                <EditorField
                                    label="Investigations"
                                    data={editorData.investigations}
                                    onChange={(data) => handleEditorChange('investigations', data)}
                                />
                            </div>
                            <div className="col-md-6">
                                <EditorField
                                    label="On Examination"
                                    data={editorData.onExamination}
                                    onChange={(data) => handleEditorChange('onExamination', data)}
                                />
                            </div>
                            <div className="col-md-6">
                                <EditorField
                                    label="Systemic"
                                    data={editorData.systemic}
                                    onChange={(data) => handleEditorChange('systemic', data)}
                                />
                            </div>
                            <div className="col-md-6">
                                <EditorField
                                    label="Procedure / Operations"
                                    data={editorData.procedure}
                                    onChange={(data) => handleEditorChange('procedure', data)}
                                />
                            </div>
                            <div className="col-md-6 position-relative">
                                <div className="position-absolute end-0 top-0 text-primary" style={{ zIndex: 5 }}>
                                    <i className="bi bi-info-circle"></i>
                                </div>
                                <EditorField
                                    label="Treatment During Admission"
                                    data={editorData.treatment}
                                    onChange={(data) => handleEditorChange('treatment', data)}
                                />
                            </div>
                            <div className="col-md-6">
                                <EditorField
                                    label="Post Discharge Medicines"
                                    data={editorData.postDischargeMedicines}
                                    onChange={(data) => handleEditorChange('postDischargeMedicines', data)}
                                />
                            </div>
                            <div className="col-md-6">
                                <EditorField
                                    label="Post Discharge Instructions"
                                    data={editorData.postDischargeInstructions}
                                    onChange={(data) => handleEditorChange('postDischargeInstructions', data)}
                                />
                            </div>
                            <div className="col-md-6">
                                <EditorField
                                    label="Operative Notes"
                                    data={editorData.operativeNotes}
                                    onChange={(data) => handleEditorChange('operativeNotes', data)}
                                    className="h-100-editor"
                                />
                            </div>
                            <div className="col-md-6">
                                <LabelInput label="Remark" value="" isTextarea rows={3} />
                                <div className="mt-2">
                                    <LabelInput label="Follow-up Comments" value="" />
                                </div>
                                <div className="mt-2">
                                    <DateInput label="Follow-up Date" />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <LabelInput label="Condition on Discharge (Max. 1000 Chars)" value="" isTextarea rows={8} />
                            </div>
                            <div className="col-md-6">
                                <LabelInput label="Reason for Discharge" value="" isTextarea rows={4} />
                                <div className="mt-2">
                                    <label className="form-label small fw-bold mb-1">Attachment</label>
                                    <div className="input-group input-group-sm">
                                        <input
                                            type="text"
                                            className="form-control bg-white"
                                            placeholder="No file chosen"
                                            value={fileName}
                                            readOnly
                                            onClick={() => fileInputRef.current?.click()}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <button
                                            className="btn btn-primary"
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            Choose Files
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="d-none"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-12">
                                <div className="d-flex align-items-center gap-2 mb-1">
                                    <label className="form-label small fw-bold mb-0">Footer</label>
                                    <button className="btn btn-primary btn-sm py-0" style={{ fontSize: '0.75rem' }}>+ Get Default Value</button>
                                    <a href="#" className="small text-decoration-underline" style={{ fontSize: '0.75rem' }}>*On Click, you get the 'Default Footer Content'</a>
                                </div>
                                <CKEditor
                                    editor={ClassicEditor}
                                    config={{
                                        licenseKey: 'GPL', // Or '<YOUR_LICENSE_KEY>'
                                        plugins: [
                                            Essentials, Paragraph, Bold, Italic, Underline, Strikethrough, Code, Font, List, Link,
                                            Image, ImageToolbar, ImageCaption, ImageStyle, ImageResize, ImageUpload,
                                            SourceEditing, BlockQuote, HorizontalLine, RemoveFormat, Heading
                                        ],
                                        toolbar: [
                                            'heading', '|', 'fontColor', '|', 'bold', 'italic', 'underline', 'strikethrough', 'code', 'removeFormat', '|',
                                            'bulletedList', 'numberedList', '|', 'link', 'insertImage', 'sourceEditing', 'blockQuote', 'horizontalLine'
                                        ],
                                    }}
                                    data={editorData.footer}
                                    onChange={(event: any, editor: any) => {
                                        const content = editor.getData();
                                        handleEditorChange('footer', content);
                                    }}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                            <button className="btn btn-primary px-4" onClick={handleSave} disabled={loading}>
                                {loading ? 'Saving...' : 'Submit'}
                            </button>
                            <button className="btn btn-primary px-4">Clear</button>
                            <button className="btn btn-primary px-4">Close</button>
                            <button className="btn btn-secondary px-3" style={{ opacity: 0.7 }}>PrintDC</button>
                            <button className="btn btn-secondary px-3" style={{ opacity: 0.7 }}>PrintDN</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Components
interface LabelInputProps {
    label: string;
    value?: string | number;
    disabled?: boolean;
    required?: boolean;
    isTextarea?: boolean;
    rows?: number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const LabelInput: React.FC<LabelInputProps> = ({ label, value, disabled, required, isTextarea, rows, onChange }) => (
    <div className="mb-1">
        <label className="form-label small fw-bold text-muted mb-1">
            {label} {required && <span className="text-danger">*</span>}
        </label>
        {isTextarea ? (
            <textarea
                className="form-control form-control-sm"
                rows={rows}
                value={value}
                onChange={onChange}
                disabled={disabled}
            />
        ) : (
            <input
                type="text"
                className="form-control form-control-sm"
                value={value}
                onChange={onChange}
                disabled={disabled}
            />
        )}
    </div>
);

interface DateInputProps {
    label: string;
    required?: boolean;
    disabled?: boolean;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DateInput: React.FC<DateInputProps> = ({ label, required, disabled, value, onChange }) => (
    <div className="mb-1">
        <label className="form-label small fw-bold text-muted mb-1">
            {label} {required && <span className="text-danger">*</span>}
        </label>
        <div className="input-group input-group-sm">
            <input
                type="date"
                className="form-control"
                disabled={disabled}
                value={value || ''}
                onChange={onChange}
            />
        </div>
    </div>
);


interface CustomSelectProps {
    value?: string;
    onChange?: any;
    options: string[];
    placeholder: string;
    style?: React.CSSProperties;
    disabled?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, placeholder, style, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);



    return (
        <div className="position-relative flex-fill" style={style} ref={containerRef}>
            <div
                className={`form-select form-select-sm text-truncate ${disabled ? 'bg-secondary-subtle' : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                style={{ cursor: disabled ? 'not-allowed' : 'pointer', paddingRight: '20px', opacity: disabled ? 0.65 : 1 }}
            >
                {value || placeholder}
            </div>
            {isOpen && (
                <div
                    className="position-absolute w-100 bg-white border rounded shadow-sm"
                    style={{
                        top: '100%',
                        left: 0,
                        zIndex: 1050,
                        maxHeight: '200px',
                        overflowY: 'auto'
                    }}
                >
                    <div
                        className="px-2 py-1"
                        style={{ cursor: 'pointer', backgroundColor: value === placeholder ? '#e9ecef' : 'transparent' }}
                        onClick={() => onChange('')}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                        {placeholder}
                    </div>
                    {options.map((option) => (
                        <div
                            key={option}
                            className="px-2 py-1"
                            style={{ cursor: 'pointer', backgroundColor: value === option ? '#e9ecef' : 'transparent' }}
                            onClick={() => onChange(option)}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = value === option ? '#e9ecef' : 'transparent')}
                        >
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

interface TimeInputProps {
    label: string;
    required?: boolean;
    simpleLabel?: boolean;
    disabled?: boolean;
    value?: string;
    onChange?: (value: string) => void;
}

const TimeInput: React.FC<TimeInputProps> = ({ label, required, simpleLabel, disabled, value, onChange }) => {
    // Generate Hours 1-12
    const hours = [];
    for (let i = 1; i <= 12; i++) {
        hours.push((i < 10 ? '0' : '') + i);
    }

    // Generate Minutes 0-59
    const minutes = [];
    for (let i = 0; i < 60; i++) {
        minutes.push((i < 10 ? '0' : '') + i);
    }

    // Parse current value
    let currentHour = '';
    let currentMinute = '';
    let currentPeriod = '';

    if (value) {
        // Expected format "HH:MM AM/PM" or "HH:MM"
        const parts = value.split(' ');
        if (parts.length > 0) {
            const timeParts = parts[0].split(':');
            if (timeParts.length >= 2) {
                currentHour = timeParts[0];
                currentMinute = timeParts[1];
            }
        }
        if (parts.length > 1) {
            currentPeriod = parts[1];
        }
    }

    const handleTimeChange = (type: 'hour' | 'minute' | 'period', newVal: string) => {
        let newHour = type === 'hour' ? newVal : currentHour;
        let newMinute = type === 'minute' ? newVal : currentMinute;
        let newPeriod = type === 'period' ? newVal : currentPeriod;

        if (newHour && newMinute && newPeriod) {
            if (onChange) {
                onChange(`${newHour}:${newMinute} ${newPeriod}`);
            }
        } else if (newHour && newMinute) {
            // partial update if period is missing but maybe we want to allow it
            if (onChange) {
                onChange(`${newHour}:${newMinute} ${newPeriod}`);
            }
        }
    };

    return (
        <div className="mb-1">
            {!simpleLabel && <label className="form-label small fw-bold text-muted mb-1">
                {label} {required && <span className="text-danger">*</span>}
            </label>}
            {simpleLabel && <label className="form-label small fw-bold text-muted mb-1 d-block text-truncate" title={label}>
                {label} {required && <span className="text-danger">*</span>}
            </label>}
            <div className="d-flex gap-1 w-100">
                <CustomSelect
                    options={hours}
                    placeholder="HH"
                    style={{ minWidth: '60px' }}
                    disabled={disabled}
                    value={currentHour}
                    onChange={(val:any) => handleTimeChange('hour', val)}
                />
                <CustomSelect
                    options={minutes}
                    placeholder="MM"
                    style={{ minWidth: '60px' }}
                    disabled={disabled}
                    value={currentMinute}
                    onChange={(val:any) => handleTimeChange('minute', val)}
                />
                <CustomSelect
                    options={['AM', 'PM']}
                    placeholder="AM"
                    style={{ minWidth: '60px' }}
                    disabled={disabled}
                    value={currentPeriod}
                    onChange={(val:any) => handleTimeChange('period', val)}
                />
            </div>
        </div>
    );
};

interface EditorFieldProps {
    label: string;
    data: string;
    onChange: (data: string) => void;
    className?: string;
}

const EditorField: React.FC<EditorFieldProps> = ({ label, data, onChange, className }) => (
    <div className={`mb-2 ${className || ''}`}>
        <label className="form-label small fw-bold text-muted mb-1">{label}</label>
        <CKEditor
            editor={ClassicEditor}
            config={{
                licenseKey: 'GPL',
                plugins: [
                    Essentials, Paragraph, Bold, Italic, Underline, Strikethrough, Code, Font, List, Link,
                    Image, ImageToolbar, ImageCaption, ImageStyle, ImageResize, ImageUpload,
                    SourceEditing, BlockQuote, HorizontalLine, RemoveFormat, Heading
                ],
                toolbar: [
                    'heading', '|', 'fontColor', '|', 'bold', 'italic', 'underline', 'strikethrough', 'code', 'removeFormat', '|',
                    'bulletedList', 'numberedList', '|', 'link', 'insertImage', 'sourceEditing', 'blockQuote', 'horizontalLine'
                ],
            }}
            data={data || ''}
            onChange={(event: any, editor: any) => {
                const data = editor.getData();
                onChange(data);
            }}
        />
    </div>
);


export default UpdateDischargeCard;
