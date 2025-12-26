import React, { useState, useEffect } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { ClassicEditor, Essentials, Paragraph, Bold, Italic } from 'ckeditor5';
import { FormatPainter } from 'ckeditor5-premium-features';

import 'ckeditor5/ckeditor5.css';
import 'ckeditor5-premium-features/ckeditor5-premium-features.css';
import { Calendar } from 'lucide-react';
import "bootstrap/dist/css/bootstrap.min.css";
import { useLocation } from 'react-router-dom';

const UpdateDischargeCard = () => {
    // Mock Patient Data (Replace with prop or context later)
    const patientInfo = {
        name: "IRAWATI GIRISH KAMAT",
        id: "28-05-2019-021082",
        gender: "Male",
        age: "24 Yr"
    };

    // State for Rich Text Editors
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

    const handleEditorChange = (editorName: string, data: string) => {
        setEditorData(prev => ({ ...prev, [editorName]: data }));
    };

    return (
        <div className="container-fluid p-0">
            {/* Header */}
            <div className="bg-white p-2 border-bottom shadow-sm">
                <h5 className="mb-0 ps-3">Update Discharge Card</h5>
            </div>

            <div className="p-3 bg-light min-vh-100">
                <div className="card shadow-sm border-0">
                    <div className="card-body">
                        {/* Patient Info Banner */}
                        <div className="mb-4">
                            <h5 className="text-primary fw-bold">
                                {patientInfo.name} <span className="text-dark fw-normal">/ Id: ({patientInfo.id}) / {patientInfo.gender} / {patientInfo.age}</span>
                            </h5>
                        </div>

                        {/* Form Grid */}
                        <div className="row g-3 mb-4">
                            {/* Row 1 */}
                            <div className="col-md-3">
                                <LabelInput label="Address" value="Nashik, Nashik" disabled />
                            </div>
                            <div className="col-md-3">
                                <LabelInput label="Contact No" value="1234567890" disabled />
                            </div>
                            <div className="col-md-3">
                                <LabelInput label="IPD No" value="IPD-2020-00-0174" disabled />
                            </div>
                            <div className="col-md-3">
                                <LabelInput label="IPD / File Ref No" value="149" required />
                            </div>

                            {/* Row 2 */}
                            <div className="col-md-3">
                                <DateInput label="Date of Admission" required />
                            </div>
                            <div className="col-md-3">
                                <TimeInput label="Time of Admission" required />
                            </div>
                            <div className="col-md-3">
                                <DateInput label="Date of Discharge" />
                            </div>
                            <div className="col-md-3">
                                <div className="row">
                                    <div className="col-6 pe-1">
                                        <TimeInput label="Time of Discharge" required simpleLabel />
                                    </div>
                                    <div className="col-6 ps-1">
                                        <LabelInput label="Admitted Days" value="" />
                                    </div>
                                </div>
                            </div>


                            {/* Row 3 */}
                            <div className="col-md-3">
                                <DateInput label="Operation Start Date" />
                            </div>
                            <div className="col-md-3">
                                <TimeInput label="Operation Start Time" />
                            </div>
                            <div className="col-md-3">
                                <DateInput label="Operation End Date" />
                            </div>
                            <div className="col-md-3">
                                <div className="row">
                                    <div className="col-6 pe-1">
                                        <TimeInput label="Operation End Time" simpleLabel />
                                    </div>
                                    <div className="col-6 ps-1">
                                        <LabelInput label="OT Hours" value="" />
                                    </div>
                                </div>
                            </div>

                            {/* Row 4 */}
                            <div className="col-md-3">
                                <LabelInput label="Treating Dr. / Surgeon" value="DR ANIRUDDHA TONGA" />
                            </div>
                            <div className="col-md-3">
                                <LabelInput label="Consulting Doctor" value="DR AMITKUMAR PANDE" />
                            </div>
                            <div className="col-md-3">
                                <LabelInput label="Anesthetist" value="" />
                            </div>
                            <div className="col-md-3">
                                <div className="row">
                                    <div className="col-4 pe-1">
                                        <LabelInput label="Weight (Kg)" value="" />
                                    </div>
                                    <div className="col-4 px-1">
                                        <LabelInput label="Room" value="" />
                                    </div>
                                    <div className="col-4 ps-1">
                                        <LabelInput label="Bed No" value="" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <LabelInput label="Total Advance (Rs)" value="0.0" disabled />
                            </div>

                            {/* Row 5 */}
                            <div className="col-md-3">
                                <label className="form-label small fw-bold text-muted mb-1">Keyword (Operation)</label>
                                <select className="form-select form-select-sm text-muted">
                                    <option>--Select--</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <LabelInput label="Referred By" value="" />
                            </div>
                            <div className="col-md-3">
                                <LabelInput label="Company" value="" />
                            </div>
                            <div className="col-md-3">
                                <LabelInput label="Department" value="" />
                            </div>
                            <div className="col-md-3">
                                <LabelInput label="Last Advance Date" value="" disabled />
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
                            <div className="col-md-12">
                                <EditorField
                                    label="History"
                                    data={editorData.history}
                                    onChange={(data) => handleEditorChange('history', data)}
                                />
                            </div>
                            <div className="col-md-12">
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
                                />
                            </div>
                            <div className="col-md-6">
                                <LabelInput label="Remark" value="" />
                                <div className="mt-2">
                                    <LabelInput label="Follow-up Comments" value="" />
                                </div>
                                <div className="mt-2">
                                    <DateInput label="Follow-up Date" />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <EditorField
                                    label="Operative Notes"
                                    data={editorData.operativeNotes2}
                                    onChange={(data) => handleEditorChange('operativeNotes2', data)}
                                />
                            </div>
                            <div className="col-md-6">
                                <LabelInput label="Reason for Discharge" value="" isTextarea rows={5} />
                            </div>

                            <div className="col-md-12">
                                <div className="row align-items-center">
                                    <div className="col-md-1">
                                        <label className="form-label small fw-bold mb-0">Attachment</label>
                                    </div>
                                    <div className="col-md-11">
                                        <div className="input-group input-group-sm">
                                            <input type="file" className="form-control" id="inputGroupFile01" />
                                            <button className="btn btn-primary" type="button">Choose Files</button>
                                        </div>
                                        <div className="form-text text-muted small">No file chosen</div>
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
                                        plugins: [Essentials, Paragraph, Bold, Italic, FormatPainter],
                                        toolbar: ['undo', 'redo', '|', 'bold', 'italic', '|', 'formatPainter'],
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
                            <button className="btn btn-primary px-4">Submit</button>
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
// Helper Components
interface LabelInputProps {
    label: string;
    value?: string | number;
    disabled?: boolean;
    required?: boolean;
    isTextarea?: boolean;
    rows?: number;
}

const LabelInput: React.FC<LabelInputProps> = ({ label, value, disabled, required, isTextarea, rows }) => (
    <div className="mb-1">
        <label className="form-label small fw-bold text-muted mb-1">
            {label} {required && <span className="text-danger">*</span>}
        </label>
        {isTextarea ? (
            <textarea className="form-control form-control-sm" rows={rows} defaultValue={value} />
        ) : (
            <input type="text" className="form-control form-control-sm" defaultValue={value} disabled={disabled} />
        )}
    </div>
);

interface DateInputProps {
    label: string;
    required?: boolean;
}

const DateInput: React.FC<DateInputProps> = ({ label, required }) => (
    <div className="mb-1">
        <label className="form-label small fw-bold text-muted mb-1">
            {label} {required && <span className="text-danger">*</span>}
        </label>
        <div className="input-group input-group-sm">
            <input type="text" className="form-control" placeholder="DD-MMM-YYYY" />
            <span className="input-group-text bg-white">
                <Calendar size={14} />
            </span>
        </div>
    </div>
);

interface TimeInputProps {
    label: string;
    required?: boolean;
    simpleLabel?: boolean;
}

const TimeInput: React.FC<TimeInputProps> = ({ label, required, simpleLabel }) => (
    <div className="mb-1">
        {!simpleLabel && <label className="form-label small fw-bold text-muted mb-1">
            {label} {required && <span className="text-danger">*</span>}
        </label>}
        {simpleLabel && <label className="form-label small fw-bold text-muted mb-1 d-block text-truncate" title={label}>
            {label} {required && <span className="text-danger">*</span>}
        </label>}
        <div className="d-flex gap-1">
            <select className="form-select form-select-sm" style={{ width: '60px' }}>
                <option>HH</option>
            </select>
            <select className="form-select form-select-sm" style={{ width: '60px' }}>
                <option>MM</option>
            </select>
            <select className="form-select form-select-sm" style={{ width: '60px' }}>
                <option>AM</option>
                <option>PM</option>
            </select>
        </div>
    </div>
);

interface EditorFieldProps {
    label: string;
    data: string;
    onChange: (data: string) => void;
}

const EditorField: React.FC<EditorFieldProps> = ({ label, data, onChange }) => (
    <div className="mb-2">
        <label className="form-label small fw-bold text-muted mb-1">{label}</label>
        <CKEditor
            editor={ClassicEditor}
            config={{
                licenseKey: 'GPL', // Or '<YOUR_LICENSE_KEY>'
                plugins: [Essentials, Paragraph, Bold, Italic, FormatPainter],
                toolbar: ['undo', 'redo', '|', 'bold', 'italic', '|', 'formatPainter'],
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
