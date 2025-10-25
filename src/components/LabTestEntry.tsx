import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Close, Add, Delete } from '@mui/icons-material';
import { Snackbar } from '@mui/material';
import { Calendar } from 'lucide-react';
import { patientService } from '../services/patientService';
import { SessionInfo } from '../services/sessionService';

interface AppointmentRow {
    reports_received: any;
    appointmentId?: string;
    sr: number;
    patient: string;
    patientId: string;
    visitDate?: string;
    age: number;
    gender: string;
    contact: string;
    time: string;
    provider: string;
    online: string;
    statusColor: string;
    status: string;
    lastOpd: string;
    labs: string;
    doctorId?: string;
    visitNumber?: number;
    shiftId?: number;
    clinicId?: string;
    actions: boolean;
    gender_description?: string;
}

interface LabTestEntryProps {
    open: boolean;
    onClose: () => void;
    patientData: AppointmentRow | null;
    // Newly added optional props to receive context
    appointment?: AppointmentRow | null;
    sessionData?: SessionInfo | null;
}

interface LabTestResult {
    id: string;
    labTestName: string;
    parameterName: string;
    value: string;
}

const LabTestEntry: React.FC<LabTestEntryProps> = ({ open, onClose, patientData, appointment, sessionData }) => {
    const [formData, setFormData] = useState({
        labName: '',
        labDoctorName: '',
        reportDate: '',
        comment: '',
        selectedLabTest: ''
    });

    const [labTestResults, setLabTestResults] = useState<LabTestResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // Dynamic Lab Test selector states (options now include parameters for each test)
    type LabTestParameter = { id: string; name: string };
    type LabTestOption = { value: string; label: string; parameters: LabTestParameter[] };
    const [isLabTestsOpen, setIsLabTestsOpen] = useState(false);
    const [labTestSearch, setLabTestSearch] = useState('');
    const [labTestsOptions, setLabTestsOptions] = useState<LabTestOption[]>([]);
    const [labTestsLoading, setLabTestsLoading] = useState(false);
    const [labTestsError, setLabTestsError] = useState<string | null>(null);
    const [selectedLabTests, setSelectedLabTests] = useState<string[]>([]);
    const [labTestsRows, setLabTestsRows] = useState<Array<{ value: string; label: string }>>([]);
    const labTestsRef = useRef<HTMLDivElement | null>(null);
    const [showSelectedTable, setShowSelectedTable] = useState(false);

    // Resolve provider/doctor name for display (fallbacks in priority order)
    const formatProviderLabel = (name?: string): string => {
        const raw = String(name || '').trim();
        if (!raw) return '';
        const cleaned = raw.replace(/\s+/g, ' ').trim();
        const lower = cleaned.toLowerCase();
        if (lower.startsWith('dr.') || lower.startsWith('dr ')) return cleaned;
        return `Dr. ${cleaned}`;
    };

    const doctorDisplayName = useMemo(() => {
        const providerFromData = (patientData as any)?.provider || (appointment as any)?.provider;
        if (providerFromData && String(providerFromData).trim()) {
            return formatProviderLabel(String(providerFromData));
        }
        const id = (patientData as any)?.doctorId || (appointment as any)?.doctorId || (sessionData as any)?.doctorId;
        if (id) {
            const raw = String(id);
            if (raw.startsWith('DR-')) return `Dr. ${raw.slice(3)}`;
            return formatProviderLabel(raw);
        }
        return 'Doctor';
    }, [patientData, appointment, sessionData]);

    // Debug: log incoming context for this modal
    useEffect(() => {
        if (!open) return;
        // Keep logs concise but structured
        console.log('=== LabTestEntry Context ===');
        console.log('Session Data:', sessionData);
        console.log('Appointment Row:', appointment);
        console.log('Patient Data:', patientData);
        console.log('============================');
    }, [open, sessionData, appointment, patientData]);

    // Helper to normalize backend response from getAllLabTestsWithParameters into options with parameters
    const extractLabTests = (res: any): LabTestOption[] => {
        try {
            // Accept JSON string or object
            let payload: any = res;
            if (typeof payload === 'string') {
                try { payload = JSON.parse(payload); } catch { /* ignore invalid JSON */ }
            }

            // Unwrap common envelope shapes
            payload = payload?.data ?? payload?.result ?? payload?.payload ?? payload;

            // Expected structure:
            // { doctorId, totalLabTests, totalParameters, success, labTestsWithParameters: [ { ID, Lab_Test_Description, Parameters: [ { ID, Parameter_Name } ] } ] }
            const list = Array.isArray(payload?.labTestsWithParameters)
                ? payload.labTestsWithParameters
                : Array.isArray(payload) ? payload : [];

            const toStr = (v: any) => v == null ? '' : String(v);
            const options: LabTestOption[] = list.map((t: any) => {
                if (!t || typeof t !== 'object') return { value: '', label: '', parameters: [] };
                const testId = toStr(t.ID ?? t.Id ?? t.id ?? t.Lab_Test_ID ?? t.lab_test_id ?? t.code);
                const testName = toStr(
                    t.Lab_Test_Description ?? t.lab_test_description ?? t.Description ?? t.name ?? t.displayName ?? t.testName
                );
                const paramsSrc = Array.isArray(t.Parameters) ? t.Parameters : Array.isArray(t.parameters) ? t.parameters : [];
                const parameters: LabTestParameter[] = (paramsSrc as any[]).map((p: any) => ({
                    id: toStr(p.ID ?? p.Id ?? p.id ?? p.Parameter_ID ?? p.parameterId ?? `${t.ID ?? t.id}-${p.Parameter_Name ?? p.name}`),
                    name: toStr(p.Parameter_Name ?? p.parameter_name ?? p.name ?? p.description ?? '')
                })).filter((p: LabTestParameter) => Boolean(p.name));

                return { value: testId, label: testName, parameters };
            }).filter((o: LabTestOption) => Boolean(o.value && o.label));

            return options;
        } catch {
            return [];
        }
    };

    // Fetch lab tests with parameters when modal opens or doctor changes
    useEffect(() => {
        if (!open) return;
        const doctorId = patientData?.doctorId || (patientData?.provider ?? '').toString();
        const clinicId = patientData?.clinicId || sessionData?.clinicId || 'DEFAULT_CLINIC';
        if (!doctorId) return;
        setLabTestsLoading(true);
        setLabTestsError(null);
        // Primary fetch: getAllLabTestsWithParameters provides tests and their parameters
        patientService.getAllLabTestsWithParameters(doctorId, clinicId)
            .then((res1: any) => {
                const mapped = extractLabTests(res1);
                console.log('Parsed lab tests (with parameters) count:', mapped.length);
                if (mapped.length === 0) {
                    console.warn('Lab tests response could not be parsed. Raw response:', res1);
                }
                setLabTestsOptions(mapped);
            })
            .catch((e: any) => {
                setLabTestsError(e?.message || 'Failed to load lab tests');
            })
            .finally(() => setLabTestsLoading(false));
    }, [open, patientData?.doctorId, patientData?.provider, patientData?.clinicId, sessionData?.clinicId]);

    // Filtered options by search
    const filteredLabTests = useMemo(() => {
        const term = labTestSearch.trim().toLowerCase();
        if (!term) return labTestsOptions;
        return labTestsOptions.filter(o => o.label.toLowerCase().includes(term));
    }, [labTestSearch, labTestsOptions]);

    // Selected options for chip-like preview inside dropdown
    const selectedOptions = useMemo<LabTestOption[]>(() => {
        return labTestsOptions.filter((o: LabTestOption) => selectedLabTests.includes(o.value));
    }, [labTestsOptions, selectedLabTests]);

    // Close dropdown on outside click
    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (!isLabTestsOpen) return;
            if (labTestsRef.current && !labTestsRef.current.contains(e.target as Node)) {
                setIsLabTestsOpen(false);
            }
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, [isLabTestsOpen]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDateChange = (dateValue: string) => {
        if (dateValue) {
            const date = new Date(dateValue);
            if (!isNaN(date.getTime())) {
                const formattedDate = date.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "2-digit",
                }).replace(/ /g, "-");
                setFormData(prev => ({
                    ...prev,
                    reportDate: formattedDate
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                reportDate: ''
            }));
        }
    };

    // Normalize a variety of input date formats to ISO yyyy-MM-dd for backend
    const toYyyyMmDd = (input?: string): string => {
        try {
            if (!input) return new Date().toISOString().slice(0, 10);
            // Try native parsing first
            const direct = new Date(input);
            if (!isNaN(direct.getTime())) return direct.toISOString().slice(0, 10);
            // Match common patterns: dd-MM-yyyy, dd-MMM-yy, dd-MMM-yyyy
            const m = input.match(/^(\d{1,2})-(\d{1,2}|[A-Za-z]{3})-(\d{2,4})$/);
            if (m) {
                const day = parseInt(m[1], 10);
                const monToken = m[2];
                let year = parseInt(m[3], 10);
                if (year < 100) year = 2000 + year; // two-digit year → 20xx
                const month = /^(\d{1,2})$/.test(monToken)
                    ? Math.max(0, Math.min(11, parseInt(monToken, 10) - 1))
                    : ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].indexOf(monToken.toLowerCase());
                if (month >= 0) {
                    const dt = new Date(Date.UTC(year, month, day));
                    return dt.toISOString().slice(0, 10);
                }
            }
        } catch {}
        return new Date().toISOString().slice(0, 10);
    };

    const handleAddResult = () => {
        if (selectedLabTests.length === 0) {
            setSnackbarMessage('Please select at least one lab test');
            setSnackbarOpen(true);
            return;
        }
        // Derive from selected checkbox values; each option may include parameters
        const selectedRows = labTestsOptions.filter((o: LabTestOption) => selectedLabTests.includes(o.value));
        const timestamp = Date.now();

        const resultsToAdd: LabTestResult[] = [];
        selectedRows.forEach((test, idxTest) => {
            const params = Array.isArray(test.parameters) ? test.parameters : [];
            if (params.length > 0) {
                params.forEach((param, idxParam) => {
                    const alreadyExists = labTestResults.some(x => x.labTestName === test.label && x.parameterName === param.name);
                    if (!alreadyExists) {
                        resultsToAdd.push({
                            id: `${test.value}-${param.id}-${timestamp}-${idxTest}-${idxParam}`,
                            labTestName: test.label,
                            parameterName: param.name,
                            value: ''
                        });
                    }
                });
            } else {
                // If no parameters, add a single row with a default parameter name
                const alreadyHasAnyRowForTest = labTestResults.some(x => x.labTestName === test.label);
                if (!alreadyHasAnyRowForTest) {
                    resultsToAdd.push({
                        id: `${test.value}-no-param-${timestamp}-${idxTest}`,
                        labTestName: test.label,
                        parameterName: 'Result', // Default parameter name for tests without specific parameters
                        value: ''
                    });
                }
            }
        });

        if (resultsToAdd.length === 0) {
            setSnackbarMessage('Selected lab tests are already added');
            setSnackbarOpen(true);
            return;
        }

        setLabTestResults(prev => [...prev, ...resultsToAdd]);
        setSelectedLabTests([]);
        setLabTestsRows([]);
        setIsLabTestsOpen(false);
    };

    const handleResultChange = (id: string, field: keyof LabTestResult, value: string) => {
        setLabTestResults(prev =>
            prev.map(result =>
                result.id === id ? { ...result, [field]: value } : result
            )
        );
    };

    const handleRemoveResult = (id: string) => {
        setLabTestResults(prev => prev.filter(result => result.id !== id));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Validate required fields
            if (!formData.labName || !formData.labDoctorName || !formData.reportDate) {
                throw new Error('Please fill in all required fields');
            }

            if (labTestResults.length === 0) {
                throw new Error('Please add at least one lab test result');
            }

            // Validate lab test result values only (parameter name is read-only and may be blank for some tests)
            const missingValues = labTestResults.some(result => !result.value);
            if (missingValues) {
                throw new Error('Please provide a value for each result');
            }

            // Build request payload for submitLabTestResults (new required shape)
            const doctorId = (sessionData as any)?.doctorId || (patientData as any)?.doctorId || '';
            const clinicId = (patientData as any)?.clinicId || '';
            const shiftId = (patientData as any)?.shiftId || 0;
            const patientVisitNo = (patientData as any)?.patient_visit_no || (patientData as any)?.visitNumber || 0;
            const userId = (sessionData as any)?.userId || '';
            const doctorName = (sessionData as any)?.doctorName || '';
            const patientId = String((patientData as any)?.patientId || '');

            const visitDateString = (patientData as any)?.visitDate || new Date().toISOString().slice(0, 10);
            const visitDateYMD = toYyyyMmDd(String(visitDateString));
            const reportDateYMD = toYyyyMmDd(String(formData.reportDate));

            const requestPayload: import('../services/patientService').LabTestResultRequest = {
                patientId,
                patientVisitNo: Number(patientVisitNo || 0),
                doctorId: String(doctorId || ''),
                clinicId: String(clinicId || ''),
                shiftId: Number(shiftId || 0),
                userId: String(userId || ''),
                doctorName: String(doctorName || ''),
                labName: formData.labName,
                reportDate: reportDateYMD,
                comment: formData.comment,
                testReportData: labTestResults.map(r => ({
                    visitDate: String(visitDateYMD || ''),
                    patientVisitNo: Number(patientVisitNo || 0),
                    shiftId: Number(shiftId || 0),
                    clinicId: String(clinicId || ''),
                    doctorId: String(doctorId || ''),
                    patientId: patientId,
                    labTestDescription: r.labTestName,
                    parameterName: r.parameterName || 'Result', // Ensure parameter name is never empty
                    testParameterValue: r.value
                }))
            };

            // Submit to backend
            const submitResponse = await patientService.submitLabTestResults(requestPayload as any);

            if (!submitResponse?.success) {
                const msg = submitResponse?.message || 'Submission failed';
                throw new Error(msg);
            }

            setSuccess(submitResponse?.message || 'Lab test entry submitted successfully!');
            setSnackbarMessage(submitResponse?.message || 'Lab test entry submitted successfully!');
            setSnackbarOpen(true);

            // Reset form after successful submission
            handleReset();

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            setSnackbarMessage(errorMessage);
            setSnackbarOpen(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            labName: '',
            labDoctorName: '',
            reportDate: '',
            comment: '',
            selectedLabTest: ''
        });
        setLabTestResults([]);
        setError(null);
        setSuccess(null);
        setSelectedLabTests([]);
        setLabTestsRows([]);
        setLabTestSearch('');
        setIsLabTestsOpen(false);
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = date.toLocaleString('default', { month: 'short' });
        const year = String(date.getFullYear()).slice(-2);
        return `${day}-${month}-${year}`;
    };

    if (!open || !patientData) return null;

    return (
        <>
            {open && (
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
                        zIndex: 10000,
                    }}
                    onClick={onClose}
                >
                    <div
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            maxWidth: '1400px',
                            width: '55%',
                            height: '70vh',
                            maxHeight: '70vh',
                            overflow: 'auto',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                            display: 'flex',
                                    flexDirection: 'column',
                                    fontFamily: 'Roboto, sans-serif',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Section */}
                        <div style={{
                            background: 'white',
                            padding: '15px 20px',
                            borderBottom: '1px solid #e0e0e0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            position: 'sticky',
                            top: 0,
                            zIndex: 1000
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{
                                    color: '#4caf50',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <span>{patientData.patient}</span>
                                    <span>/</span>
                                    <span>{patientData.gender}</span>
                                    <span>/</span>
                                    <span>{patientData.age} Y</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{
                                    color: '#666',
                                    fontSize: '14px',
                                    textAlign: 'right'
                                }}>
                                    <div>Dr.{sessionData?.doctorName}</div>
                                </div>
                                <button
                                    onClick={onClose}
                                    style={{
                                        background: 'rgb(25, 118, 210)',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '2px',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#666',
                                        fontSize: '18px',
                                        width: '36px',
                                        height: '36px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgb(25, 118, 210)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgb(25, 118, 210)';
                                    }}
                                >
                                    <Close />
                                </button>
                            </div>
                        </div>

                        {/* Form Content */}
                        <div style={{ padding: '20px', flex: 1, overflow: 'auto' }}>
                            {/* Lab Report Information Section */}
                            <div style={{ marginBottom: '30px' }}>
                                {/* <h3 style={{ 
                                    color: '#1976d2', 
                                    marginBottom: '20px', 
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    borderBottom: '2px solid #1976d2',
                                    paddingBottom: '8px'
                                }}>
                                    Lab Report Information
                                </h3> */}

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                    gap: '20px',
                                    marginBottom: '20px'
                                }}>
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: 'bold',
                                            color: '#333'
                                        }}>
                                            Lab Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.labName}
                                            onChange={(e) => handleInputChange('labName', e.target.value)}
                                            placeholder="Lab Name"
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                fontSize: '14px',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: 'bold',
                                            color: '#333'
                                        }}>
                                            Lab Doctor Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.labDoctorName}
                                            onChange={(e) => handleInputChange('labDoctorName', e.target.value)}
                                            placeholder="Doctor Name"
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                fontSize: '14px',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>

                                    <div style={{ width: '95%', position: 'relative' }}>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: 'bold',
                                            color: '#333'
                                        }}>
                                            Report Date *
                                        </label>

                                        {/* Text Input (formatted date) */}
                                        <input
                                            type="text"
                                            value={formData.reportDate}
                                            onChange={(e) => handleInputChange('reportDate', e.target.value)}
                                            placeholder="dd-mmm-yy"
                                            style={{
                                                width: '100%',
                                                padding: '12px 40px 12px 12px',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                fontSize: '14px',
                                                boxSizing: 'border-box'
                                            }}
                                        />

                                        {/* Calendar Icon */}
                                        <Calendar
                                            size={20}
                                            color="#666"
                                            style={{
                                                position: 'absolute',
                                                right: '10px',
                                                top: '45px',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => {
                                                const hiddenInput = document.getElementById('hiddenDateInput') as HTMLInputElement;
                                                hiddenInput?.showPicker?.();
                                            }}
                                        />

                                        {/* Hidden native date picker */}
                                        <input
                                            id="hiddenDateInput"
                                            type="date"
                                            onChange={(e) => handleDateChange(e.target.value)}
                                            style={{
                                                position: 'absolute',
                                                opacity: 0,
                                                pointerEvents: 'none',
                                                width: 0,
                                                height: 0
                                            }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: 'bold',
                                        color: '#333'
                                    }}>
                                        Comment
                                    </label>
                                    <textarea
                                        value={formData.comment}
                                        onChange={(e) => handleInputChange('comment', e.target.value)}
                                        placeholder="Comment"
                                        rows={3}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px',
                                            boxSizing: 'border-box',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: 'bold',
                                    color: '#333'
                                }}>
                                    Lab Tests
                                </label>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'end' }}>
                                    <div ref={labTestsRef} style={{ position: 'relative', flex: 1 }}>
                                        <div
                                            onClick={() => setIsLabTestsOpen(prev => !prev)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                height: '40px',
                                                padding: '8px 12px',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                fontSize: '14px',
                                                backgroundColor: 'white',
                                                cursor: 'pointer',
                                                userSelect: 'none'
                                            }}
                                        >
                                            <span style={{ color: selectedLabTests.length ? '#000' : '#9e9e9e' }}>
                                                {selectedLabTests.length === 0 && 'Select Lab Tests'}
                                                {selectedLabTests.length === 1 && '1 selected'}
                                                {selectedLabTests.length > 1 && `${selectedLabTests.length} selected`}
                                            </span>
                                            <span style={{ marginLeft: '8px', color: '#666' }}>▾</span>
                                        </div>

                                        {isLabTestsOpen && (
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
                                                    <input
                                                        type="text"
                                                        value={labTestSearch}
                                                        onChange={(e) => setLabTestSearch(e.target.value)}
                                                        placeholder="Search lab tests"
                                                        style={{
                                                            width: '100%',
                                                            height: '32px',
                                                            padding: '6px 8px',
                                                            border: '1px solid #B7B7B7',
                                                            borderRadius: '4px',
                                                            fontSize: '12px',
                                                            outline: 'none'
                                                        }}
                                                    />
                                                </div>
                                                {/* Selected tests chips (preview) */}
                                                {selectedOptions.length > 0 && (
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '6px', paddingTop: 0 }}>
                                                        {selectedOptions.map((opt: LabTestOption) => (
                                                            <label key={`chip-${opt.value}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 10px', backgroundColor: '#e3f2fd', borderRadius: '6px', fontSize: '12px', border: '1px solid #bbdefb' }}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked
                                                                    onChange={() => {
                                                                        setSelectedLabTests(prev => {
                                                                            const next = prev.filter(v => v !== opt.value);
                                                                            const picked = labTestsOptions.filter((o: LabTestOption) => next.includes(o.value));
                                                                            setLabTestsRows(picked);
                                                                            return next;
                                                                        });
                                                                    }}
                                                                    style={{ margin: 0, maxWidth: 16 }}
                                                                />
                                                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>{opt.label}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                                <div style={{ maxHeight: '240px', overflowY: 'auto', padding: '4px 6px', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', columnGap: '8px', rowGap: '6px' }}>
                                                    {labTestsLoading && (
                                                        <div style={{ padding: '6px', fontSize: '12px', color: '#777', gridColumn: '1 / -1', textAlign: 'center' }}>Loading lab tests...</div>
                                                    )}
                                                    {labTestsError && (
                                                        <div style={{ padding: '6px', fontSize: '12px', color: '#d32f2f', gridColumn: '1 / -1', textAlign: 'center' }}>
                                                            {labTestsError}
                                                            <button
                                                                onClick={() => {
                                                                    setLabTestsError(null);
                                                                    const doctorId = patientData?.doctorId || (patientData?.provider ?? '').toString();
                                                                    if (!doctorId) return;
                                                                    setLabTestsLoading(true);
                                                                    const clinicId = patientData?.clinicId || sessionData?.clinicId || 'DEFAULT_CLINIC';
                                                                    patientService.getAllLabTestsWithParameters(doctorId, clinicId)
                                                                        .then((res: any) => {
                                                                            const mapped = extractLabTests(res);
                                                                            console.log('Parsed lab tests count (retry):', mapped.length);
                                                                            if (mapped.length === 0) {
                                                                                console.warn('Lab tests response could not be parsed. Raw response:', res);
                                                                            }
                                                                            setLabTestsOptions(mapped);
                                                                        })
                                                                        .catch((e: any) => setLabTestsError(e?.message || 'Failed to load lab tests'))
                                                                        .finally(() => setLabTestsLoading(false));
                                                                }}
                                                                style={{ marginLeft: '8px', padding: '2px 6px', fontSize: '10px', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                                                            >
                                                                Retry
                                                            </button>
                                                        </div>
                                                    )}
                                                    {!labTestsLoading && !labTestsError && filteredLabTests.length === 0 && (
                                                        <div style={{ padding: '6px', fontSize: '12px', color: '#777', gridColumn: '1 / -1' }}>No lab tests found</div>
                                                    )}
                                                    {!labTestsLoading && !labTestsError && filteredLabTests.map((opt) => (
                                                        <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 2px', cursor: 'pointer', fontSize: '12px', border: 'none' }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedLabTests.includes(opt.value)}
                                                                onChange={(e) => {
                                                                    setSelectedLabTests(prev => {
                                                                        if (e.target.checked) {
                                                                            if (prev.includes(opt.value)) return prev;
                                                                            const next = [...prev, opt.value];
                                                                            const picked = labTestsOptions.filter((o: LabTestOption) => next.includes(o.value));
                                                                            setLabTestsRows(picked);
                                                                            return next;
                                                                        } else {
                                                                            const next = prev.filter(v => v !== opt.value);
                                                                            const picked = labTestsOptions.filter((o: LabTestOption) => next.includes(o.value));
                                                                            setLabTestsRows(picked);
                                                                            return next;
                                                                        }
                                                                    });
                                                                }}
                                                                style={{ margin: 0, maxWidth: 16}}
                                                            />
                                                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{opt.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleAddResult}
                                        style={{
                                            backgroundColor: '#1976d2',
                                            color: 'white',
        										border: 'none',
                                            padding: '12px 20px',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#1565c0';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#1976d2';
                                        }}
                                    >
                                        <Add style={{ fontSize: '16px' }} />
                                        Add Tests
                                    </button>
                                </div>

                                {/* Selected lab tests table overlay (hidden by default) */}
                                {showSelectedTable && labTestsRows.length > 0 && (
                                    <div
                                        style={{
                                            position: 'relative',
                                            marginTop: '10px',
                                            border: '1px solid #B7B7B7',
                                            borderRadius: '6px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                        }}
                                    >
                                        <div style={{ width: '100%', overflow: 'hidden' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '60px 1.5fr 80px', background: '#1565c0', color: 'white', fontWeight: 600, fontSize: '12px' }}>
                                                <div style={{ padding: '8px 10px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Sr.</div>
                                                <div style={{ padding: '8px 10px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Lab Test</div>
                                                <div style={{ padding: '8px 10px' }}>Action</div>
                                            </div>
                                            {labTestsRows.map((row, idx) => (
                                                <div key={row.value} style={{ display: 'grid', gridTemplateColumns: '60px 1.5fr 80px', background: idx % 2 === 0 ? '#f7fbff' : 'white', fontSize: '12px', alignItems: 'center' }}>
                                                    <div style={{ padding: '8px 10px', borderTop: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0' }}>{idx + 1}</div>
                                                    <div style={{ padding: '8px 10px', borderTop: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0' }}>{row.label}</div>
                                                    <div style={{ padding: '8px 10px', borderTop: '1px solid #e0e0e0' }}>
                                                        <div
                                                            onClick={() => {
                                                                setSelectedLabTests(prev => prev.filter(v => v !== row.value));
                                                                setLabTestsRows(prev => prev.filter(r => r.value !== row.value));
                                                            }}
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
                                    </div>
                                )}
                            </div>
                            {/* Enter Results Section */}
                            {labTestResults.length > 0 && (
                                <div style={{ marginTop: '10px' }}>
                                    <div style={{
                                        backgroundColor: '#1976d2',
                                        color: 'white',
                                        padding: '12px 16px',
                                        borderRadius: '4px 4px 0 0',
                                        fontWeight: '600',
                                        fontSize: '16px'
                                    }}>
                                        Enter Results
                                    </div>

                                    <div style={{
                                        border: '1px solid #ddd',
                                        borderTop: 'none',
                                        borderRadius: '0 0 4px 4px',
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
                                                        width: '35%'
                                                    }}>
                                                        Lab Test Name
                                                    </th>
                                                    <th style={{
                                                        padding: '12px',
                                                        textAlign: 'left',
                                                        borderBottom: '1px solid #ddd',
                                                        fontWeight: '600',
                                                        color: '#333',
                                                        width: '190px'
                                                    }}>
                                                        Parameter Name
                                                    </th>
                                                    <th style={{
                                                        padding: '12px',
                                                        textAlign: 'left',
                                                        borderBottom: '1px solid #ddd',
                                                        fontWeight: '600',
                                                        color: '#333',
                                                        width: '120px'
                                                    }}>
                                                        Value / Results
                                                    </th>
                                                    <th style={{
                                                        padding: '12px',
                                                        textAlign: 'center',
                                                        borderBottom: '1px solid #ddd',
                                                        fontWeight: '600',
                                                        color: '#333',
                                                        width: '80px'
                                                    }}>
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {labTestResults.map((result) => (
                                                    <tr key={result.id}>
                                                        <td style={{
                                                            padding: '12px',
                                                            borderBottom: '1px solid #eee',
                                                            color: '#666',
                                                            height: '38px',
                                                            fontSize: '14px'
                                                        }}>
                                                            {result.labTestName}
                                                        </td>
                                                        <td style={{
                                                            padding: '12px',
                                                            borderBottom: '1px solid #eee',
                                                            color: '#666',
                                                            height: '38px',
                                                            fontSize: '14px'
                                                        }}>
                                                            {result.parameterName}
                                                        </td>
                                                        {/* <td style={{ padding: '12px', borderBottom: '1px solid #eee', height: '38px' }}>
                                                            <input
                                                                type="text"
                                                                value={result.parameterName}
                                                                placeholder="Parameter Name"
                                                                readOnly
                                                                disabled
                                                                style={{
                                                                    width: '100%',
                                                                    height: '38px',
                                                                    padding: '4px 8px',
                                                                    border: '1px solid #ddd',
                                                                    borderRadius: '4px',
                                                                    fontSize: '14px',
                                                                    boxSizing: 'border-box',
                                                                    backgroundColor: '#f9f9f9',
                                                                    color: '#666'
                                                                }}
                                                            />
                                                        </td> */}
                                                        <td style={{ padding: '12px', borderBottom: '1px solid #eee', height: '38px' }}>
                                                            <input
                                                                type="text"
                                                                value={result.value}
                                                                onChange={(e) => handleResultChange(result.id, 'value', e.target.value)}
                                                                placeholder="Value / Results"
                                                                style={{
                                                                    width: '100%',
                                                                    height: '38px',
                                                                    padding: '4px 8px',
                                                                    border: '1px solid #ddd',
                                                                    borderRadius: '4px',
                                                                    fontSize: '14px',
                                                                    boxSizing: 'border-box'
                                                                }}
                                                            />
                                                        </td>
                                                        <td style={{
                                                            padding: '12px',
                                                            borderBottom: '1px solid #eee',
                                                            textAlign: 'center',
                                                            height: '38px'
                                                        }}>
                                                            <button
                                                                onClick={() => handleRemoveResult(result.id)}
                                                                style={{
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    color: '#f44336',
                                                                    padding: '6px',
                                                                    borderRadius: '4px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.backgroundColor = '#ffebee';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                                }}
                                                            >
                                                                <Delete fontSize="small" style={{ color: 'black' }} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer with Action Buttons */}
                        <div style={{
                            padding: '20px',
                            borderTop: '1px solid #e0e0e0',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px',
                            backgroundColor: '#fafafa'
                        }}>
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                style={{
                                    backgroundColor: isLoading ? '#ccc' : '#1976d2',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 24px',
                                    borderRadius: '4px',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}
                            >
                                {isLoading ? 'Submitting...' : 'Submit'}
                            </button>
                            <button
                                onClick={handleReset}
                                style={{
                                    backgroundColor: 'rgb(25, 118, 210)',
                                    color: '#333',
                                    border: '1px solid #ddd',
                                    padding: '12px 24px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}
                            >
                                Reset
                            </button>
                            <button
                                onClick={handleClose}
                                style={{
                                    backgroundColor: 'rgb(25, 118, 210)',
                                    color: '#333',
                                    border: '1px solid #ddd',
                                    padding: '12px 24px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            />
        </>
    );
};

export default LabTestEntry;
