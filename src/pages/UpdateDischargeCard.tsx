import React, { useState, useRef, useEffect } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
    ClassicEditor,
    Essentials,
    Paragraph,
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

import { useLocation } from 'react-router-dom';
import { getKeywords } from '../services/referenceService';

const UpdateDischargeCard = () => {
    const location = useLocation();
    const { patientId } = location.state || {};

    // Mock Patient Data (Replace with prop or context later)
    const patientInfo = {
        name: "IRAWATI GIRISH KAMAT",
        id: patientId || "28-05-2019-021082",
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
                // Fallback or retry logic could go here
            }
        };

        fetchKeywords();
    }, []);

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
                                <LabelInput label="Address" value="Nashik, Nashik" disabled />
                            </div>
                            <div className="col">
                                <LabelInput label="Contact No" value="1234567890" disabled />
                            </div>
                            <div className="col">
                                <LabelInput label="IPD No" value="IPD-2020-00-0174" disabled />
                            </div>
                            <div className="col">
                                <LabelInput label="IPD / File Ref No" value="149" required />
                            </div>

                            {/* Row 2 */}
                            <div className="col">
                                <DateInput label="Date of Admission" required />
                            </div>
                            <div className="col">
                                <TimeInput label="Time of Admission" required />
                            </div>
                            <div className="col">
                                <DateInput label="Date of Discharge" />
                            </div>
                            <div className="col">
                                <TimeInput label="Time of Discharge" required simpleLabel />
                            </div>
                            <div className="col">
                                <LabelInput label="Admitted Days" value="" />
                            </div>


                            {/* Row 3 */}
                            <div className="col">
                                <DateInput label="Operation Start Date" />
                            </div>
                            <div className="col">
                                <TimeInput label="Operation Start Time" />
                            </div>
                            <div className="col">
                                <DateInput label="Operation End Date" />
                            </div>
                            <div className="col">
                                <TimeInput label="Operation End Time" simpleLabel />
                            </div>
                            <div className="col">
                                <LabelInput label="OT Hours" value="" />
                            </div>

                            {/* Row 4 */}
                            <div className="col">
                                <LabelInput label="Treating Dr. / Surgeon" value="DR ANIRUDDHA TONGA" />
                            </div>
                            <div className="col">
                                <LabelInput label="Consulting Doctor" value="DR AMITKUMAR PANDE" />
                            </div>
                            <div className="col">
                                <LabelInput label="Anesthetist" value="" />
                            </div>
                            <div className="col">
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
                            <div className="col">
                                <LabelInput label="Total Advance (Rs)" value="0.0" disabled />
                            </div>

                            {/* Row 5 */}
                            <div className="col">
                                <label className="form-label small fw-bold text-muted mb-1">Keyword (Operation)</label>
                                <select className="form-select form-select-sm text-muted">
                                    <option>--Select--</option>
                                    {keywords.map((keyword, index) => (
                                        <option key={keyword} value={keyword}>{keyword}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col">
                                <LabelInput label="Referred By" value="" />
                            </div>
                            <div className="col">
                                <LabelInput label="Company" value="" />
                            </div>
                            <div className="col">
                                <LabelInput label="Department" value="" />
                            </div>
                            <div className="col">
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
                            <button className="btn btn-primary px-4">Reset</button>
                            <button className="btn btn-primary px-4">Submit</button>
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
            <input type="date" className="form-control" />
        </div>
    </div>
);


interface CustomSelectProps {
    value?: string;
    onChange?: (value: string) => void;
    options: string[];
    placeholder: string;
    style?: React.CSSProperties;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, placeholder, style }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [internalValue, setInternalValue] = useState(value);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setInternalValue(value);
    }, [value]);

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

    const handleSelect = (option: string) => {
        setInternalValue(option);
        if (onChange) {
            onChange(option);
        }
        setIsOpen(false);
    };

    return (
        <div className="position-relative flex-fill" style={style} ref={containerRef}>
            <div
                className="form-select form-select-sm text-truncate"
                onClick={() => setIsOpen(!isOpen)}
                style={{ cursor: 'pointer', paddingRight: '20px' }} // Default padding might cover text
            >
                {internalValue || placeholder}
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
                    {/* Placeholder option to clear or show default */}
                    <div
                        className="px-2 py-1"
                        style={{ cursor: 'pointer', backgroundColor: internalValue === placeholder ? '#e9ecef' : 'transparent' }}
                        onClick={() => handleSelect('')}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                        {placeholder}
                    </div>
                    {options.map((option) => (
                        <div
                            key={option}
                            className="px-2 py-1"
                            style={{ cursor: 'pointer', backgroundColor: internalValue === option ? '#e9ecef' : 'transparent' }}
                            onClick={() => handleSelect(option)}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = internalValue === option ? '#e9ecef' : 'transparent')}
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
}

const TimeInput: React.FC<TimeInputProps> = ({ label, required, simpleLabel }) => {
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

    return (
        <div className="mb-1">
            {!simpleLabel && <label className="form-label small fw-bold text-muted mb-1">
                {label} {required && <span className="text-danger">*</span>}
            </label>}
            {simpleLabel && <label className="form-label small fw-bold text-muted mb-1 d-block text-truncate" title={label}>
                {label} {required && <span className="text-danger">*</span>}
            </label>}
            <div className="d-flex gap-1 w-100">
                <CustomSelect options={hours} placeholder="HH" style={{ minWidth: '60px' }} />
                <CustomSelect options={minutes} placeholder="MM" style={{ minWidth: '60px' }} />
                <CustomSelect options={['AM', 'PM']} placeholder="AM" style={{ minWidth: '60px' }} />
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
