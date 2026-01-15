import React, { useEffect, useMemo, useRef, useState } from 'react';
import PatientNameDisplay from './PatientNameDisplay';
import { Close, Add, Delete } from '@mui/icons-material';
import { TextField, InputAdornment, Grid, Box, Typography, DialogContent } from '@mui/material';
import dayjs from 'dayjs';
import { patientService } from '../services/patientService';
import { SessionInfo } from '../services/sessionService';
import { doctorService, Doctor } from '../services/doctorService';
import AddPatientPage from '../pages/AddPatientPage';
import GlobalSnackbar from './GlobalSnackbar';

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
    dob?: string;
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
    // Callback to pass lab test results data back to parent
    onLabTestResultsFetched?: (results: any[] | null) => void;
    onSubmissionSuccess?: () => void;
}

interface LabTestResult {
    id: string;
    labTestName: string;
    parameterName: string;
    value: string;
}

const LabTestEntry: React.FC<LabTestEntryProps> = ({ open, onClose, patientData, appointment, sessionData, onLabTestResultsFetched, onSubmissionSuccess }) => {
    const [formData, setFormData] = useState({
        labName: '',
        labDoctorName: '',
        reportDate: '',
        comment: '',
        selectedLabTest: ''
    });
    // const [patientName, setPatientName] = useState('');
    const [labTestResults, setLabTestResults] = useState<LabTestResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [success, setSuccess] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [resultErrors, setResultErrors] = useState<Set<string>>(new Set());

    // Dynamic Lab Test selector states (options now include parameters for each test)
    type LabTestParameter = { id: string; name: string };
    type LabTestOption = { value: string; label: string; parameters: LabTestParameter[] };
    const [isLabTestsOpen, setIsLabTestsOpen] = useState(false);
    const [labTestSearch, setLabTestSearch] = useState('');
    const [labTestsOptions, setLabTestsOptions] = useState<LabTestOption[]>([]);
    const [labTestsLoading, setLabTestsLoading] = useState(false);
    const [labTestsError, setLabTestsError] = useState<string | null>(null);
    const [selectedLabTests, setSelectedLabTests] = useState<string[]>([]);
    const labTestsRef = useRef<HTMLDivElement | null>(null);
    const [showQuickRegistration, setShowQuickRegistration] = useState(false);
    const lastFetchParamsRef = useRef<string | null>(null);
    const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);

    // Resolve provider/doctor name for display (fallbacks in priority order)
    const formatProviderLabel = (name?: string): string => {
        const raw = String(name || '').trim();
        if (!raw) return '';
        const cleaned = raw.replace(/\s+/g, ' ').trim();
        const lower = cleaned.toLowerCase();
        if (lower.startsWith('dr.') || lower.startsWith('dr ')) return cleaned;
        return `Dr. ${cleaned}`;
    };

    // Fetch all doctors when modal opens
    useEffect(() => {
        if (!open) return;
        let cancelled = false;
        async function fetchDoctors() {
            try {
                const doctors = await doctorService.getAllDoctors();
                if (!cancelled) {
                    setAllDoctors(doctors);
                }
            } catch (error) {
                console.error('Error fetching doctors:', error);
                if (!cancelled) {
                    setAllDoctors([]);
                }
            }
        }
        fetchDoctors();
        return () => { cancelled = true; };
    }, [open]);

    const doctorDisplayName = useMemo(() => {
        // If no provider name, try to get doctor name from allDoctors using doctorId
        const id = (patientData as any)?.doctorId || (appointment as any)?.doctorId || (sessionData as any)?.doctorId;
        console.log('checking id:', id);
        if (id && allDoctors.length > 0) {
            // First try to find by ID
            let doctor = allDoctors.find(d => d.id === id);

            // If not found by ID, try to find by doctor_name (in case doctorId is actually a name)
            if (!doctor) {
                const idStr = String(id).trim();
                doctor = allDoctors.find(d => {
                    const doctorName = (d as any).doctor_name || d.name || '';
                    return doctorName && String(doctorName).trim().toLowerCase() === idStr.toLowerCase();
                });
            }

            if (doctor) {
                console.log('checking doctor:', doctor);
                // Check for doctor name in multiple possible fields (raw API field or transformed field)
                const doctorName = (doctor as any).doctor_name ||
                    doctor.name ||
                    (doctor.firstName && doctor.lastName ? `${doctor.firstName} ${doctor.lastName}`.trim() :
                        doctor.firstName || doctor.lastName || '');
                if (doctorName) {
                    return formatProviderLabel(doctorName);
                }
            }
        }

        // Fallback: if we have an ID but no doctor found, format the ID itself
        if (id) {
            console.log('checking id 2:', id);
            const raw = String(id);
            if (raw.startsWith('DR-')) return `Dr. ${raw.slice(3)}`;
            return formatProviderLabel(raw);
        }

        return 'Doctor';
    }, [patientData, appointment, sessionData, allDoctors]);

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

    useEffect(() => {
        if (!open) {
            lastFetchParamsRef.current = null;
        }
    }, [open]);

    // Fetch lab tests with parameters when modal opens or doctor changes
    useEffect(() => {
        if (!open) return;
        console.log(patientData, '------------------------')
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

    // Fetch existing lab test results when modal opens
    useEffect(() => {
        if (!open) return;

        // Get required parameters from patientData/appointment
        const patientId = String((patientData as any)?.patientId || '');
        const patientVisitNo = Number((patientData as any)?.patient_visit_no || (patientData as any)?.visitNumber || 0);
        const doctorId = String((patientData as any)?.doctorId || (patientData as any)?.provider || (sessionData as any)?.doctorId || '');
        const clinicId = String((patientData as any)?.clinicId || (sessionData as any)?.clinicId || '');
        const shiftId = Number((patientData as any)?.shiftId || (sessionData as any)?.shiftId || 1);


        const visitDateString =
            (patientData as any)?.visitDate ||
            (patientData as any)?.visit_date ||
            new Date().toISOString().slice(0, 10);

        console.log('=== Visit Date Processing ===');
        console.log('Original visitDateString:', visitDateString);

        let visitDate: string;

        try {
            // Case 1: dd-MM-yyyy (25-12-2025)
            const ddMMyyyyRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
            const match = visitDateString.match(ddMMyyyyRegex);

            if (match) {
                const [, day, month, year] = match;
                visitDate = `${year}-${month}-${day}T00:00:00`;
                console.log('Parsed dd-MM-yyyy → ISO:', visitDate);
            }
            // Case 2: Already ISO or parsable
            else {
                const date = new Date(visitDateString);

                if (!isNaN(date.getTime())) {
                    visitDate = date.toISOString().slice(0, 19);
                    console.log('Parsed via Date constructor:', visitDate);
                } else if (visitDateString.includes(' ')) {
                    visitDate = visitDateString.replace(' ', 'T');
                    console.log('Parsed space-separated:', visitDate);
                } else {
                    visitDate = `${visitDateString}T00:00:00`;
                    console.log('Parsed as date-only:', visitDate);
                }
            }
        } catch (error) {
            console.error('Date parsing error:', error);
            visitDate = new Date().toISOString().slice(0, 19);
        }

        console.log('Final visitDate:', visitDate);
        console.log('============================');

        if (!patientId || !patientVisitNo || !doctorId || !clinicId) {
            console.log('Missing required parameters for fetching lab test results:', { patientId, patientVisitNo, doctorId, clinicId });
            return;
        }

        console.log('Fetching existing lab test results for visit:', { patientId, patientVisitNo, doctorId, clinicId, shiftId, visitDate });

        const fetchKey = JSON.stringify({ patientId, patientVisitNo, doctorId, clinicId, shiftId, visitDate });
        if (lastFetchParamsRef.current === fetchKey) {
            console.log('Skipping lab test results fetch; parameters unchanged.');
            return;
        }
        lastFetchParamsRef.current = fetchKey;

        // Fetch existing lab test results
        patientService.getLabTestResultsForVisit({
            patientId,
            patientVisitNo,
            shiftId,
            clinicId,
            doctorId,
            visitDate
        })
            .then((results: any[]) => {
                console.log('Fetched lab test results:', results);

                if (results && results.length > 0) {
                    // Map backend results to frontend format
                    const mappedResults: LabTestResult[] = results.map((result: any, index: number) => ({
                        id: `existing-${index}`,
                        labTestName: result.labTestDescription || result.lab_test_description || '',
                        parameterName: result.parameterName || result.parameter_name || 'Result',
                        value: result.testParameterValue || result.test_parameter_value || ''
                    }));

                    setLabTestResults(mappedResults);

                    // Populate form fields from first result (assuming all results share same metadata)
                    // Also check if metadata is at response root level (for array responses with metadata)
                    const firstResult = results[0];
                    const responseMetadata = (results as any).metadata || (results as any).meta || {};

                    if (firstResult || responseMetadata) {
                        // Try multiple field name variations for lab doctor name
                        // Check all possible field names from both firstResult and responseMetadata
                        const labDoctorName =
                            firstResult?.labDoctorName ??
                            firstResult?.lab_doctor_name ??
                            firstResult?.doctorName ??
                            firstResult?.doctor_name ??
                            firstResult?.labDoctor ??
                            firstResult?.lab_doctor ??
                            responseMetadata?.labDoctorName ??
                            responseMetadata?.lab_doctor_name ??
                            responseMetadata?.doctorName ??
                            responseMetadata?.doctor_name ??
                            undefined;

                        const labName =
                            firstResult?.labName ??
                            firstResult?.lab_name ??
                            responseMetadata?.labName ??
                            responseMetadata?.lab_name ??
                            undefined;

                        const reportDate =
                            firstResult?.reportDate ??
                            firstResult?.report_date ??
                            responseMetadata?.reportDate ??
                            responseMetadata?.report_date ??
                            undefined;

                        const comment =
                            firstResult?.comment ??
                            responseMetadata?.comment ??
                            undefined;

                        setFormData(prev => ({
                            ...prev,
                            // Update only if field was found in response (using nullish coalescing to preserve empty strings)
                            labName: labName !== undefined ? String(labName) : prev.labName,
                            labDoctorName: labDoctorName !== undefined ? String(labDoctorName) : prev.labDoctorName,
                            reportDate: reportDate !== undefined ? String(reportDate) : prev.reportDate,
                            comment: comment !== undefined ? String(comment) : prev.comment
                        }));
                    }

                    console.log('Loaded', mappedResults.length, 'existing lab test results');

                    // Pass data to parent component if callback exists
                    if (onLabTestResultsFetched) {
                        onLabTestResultsFetched(results);
                    }
                } else {
                    console.log('No existing lab test results found for this visit');
                    // Reset form when no results found
                    setLabTestResults([]);

                    // Don't pass anything to parent if results are empty
                    if (onLabTestResultsFetched) {
                        onLabTestResultsFetched(null);
                    }
                }
            })
            .catch((e: any) => {
                console.error('Failed to fetch lab test results:', e);
                // Don't show error to user, just log it - it's okay if no results exist
                setLabTestResults([]);
                lastFetchParamsRef.current = null;

                // Don't pass anything to parent on error
                if (onLabTestResultsFetched) {
                    onLabTestResultsFetched(null);
                }
            });
    }, [open, patientData, sessionData, onLabTestResultsFetched]);

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

    // Sync selectedLabTests with loaded labTestResults
    useEffect(() => {
        if (labTestResults.length === 0 || labTestsOptions.length === 0) return;

        const existingValues = new Set(selectedLabTests);
        let changed = false;

        labTestResults.forEach(result => {
            // Find matching option by label since results don't have ID
            const option = labTestsOptions.find(o => o.label === result.labTestName);
            if (option && !existingValues.has(option.value)) {
                existingValues.add(option.value);
                changed = true;
            }
        });

        if (changed) {
            setSelectedLabTests(Array.from(existingValues));
        }
    }, [labTestResults, labTestsOptions]);

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

    // Normalize a variety of input date formats to ISO yyyy-MM-dd for backend
    const toYyyyMmDd = (input?: string): string => {
        try {
            if (!input) return new Date().toISOString().slice(0, 10);

            // Remove time component if present (e.g., "24-12-2025T00:00:00" -> "24-12-2025")
            const dateOnly = input.split('T')[0].split(' ')[0];

            // First, try to parse dd-MM-yyyy format explicitly (most common issue)
            const ddMmYyyyMatch = dateOnly.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
            if (ddMmYyyyMatch) {
                const day = parseInt(ddMmYyyyMatch[1], 10);
                const month = parseInt(ddMmYyyyMatch[2], 10) - 1; // month is 0-indexed
                const year = parseInt(ddMmYyyyMatch[3], 10);
                if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year >= 1900 && year <= 2100) {
                    const dt = new Date(Date.UTC(year, month, day));
                    const yyyy = String(dt.getUTCFullYear());
                    const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
                    const dd = String(dt.getUTCDate()).padStart(2, '0');
                    return `${yyyy}-${mm}-${dd}`;
                }
            }

            // Try to parse yyyy-MM-dd format (already correct)
            const yyyyMmDdMatch = dateOnly.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
            if (yyyyMmDdMatch) {
                const year = parseInt(yyyyMmDdMatch[1], 10);
                const month = parseInt(yyyyMmDdMatch[2], 10) - 1;
                const day = parseInt(yyyyMmDdMatch[3], 10);
                if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year >= 1900 && year <= 2100) {
                    const yyyy = String(year);
                    const mm = String(month + 1).padStart(2, '0');
                    const dd = String(day).padStart(2, '0');
                    return `${yyyy}-${mm}-${dd}`;
                }
            }

            // Try native parsing for ISO format or other standard formats
            const direct = new Date(dateOnly);
            if (!isNaN(direct.getTime())) {
                const year = direct.getFullYear();
                const month = String(direct.getMonth() + 1).padStart(2, '0');
                const day = String(direct.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            }

            // Match common patterns: dd-MMM-yy, dd-MMM-yyyy
            const m = dateOnly.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2,4})$/);
            if (m) {
                const day = parseInt(m[1], 10);
                const monToken = m[2];
                let year = parseInt(m[3], 10);
                if (year < 100) year = 2000 + year; // two-digit year → 20xx
                const month = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].indexOf(monToken.toLowerCase());
                if (month >= 0) {
                    const dt = new Date(Date.UTC(year, month, day));
                    const yyyy = String(dt.getUTCFullYear());
                    const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
                    const dd = String(dt.getUTCDate()).padStart(2, '0');
                    return `${yyyy}-${mm}-${dd}`;
                }
            }
        } catch { }
        return new Date().toISOString().slice(0, 10);
    };

    // Format date as dd-MM-yyyy 00:00:00 for visit_date payload
    const toDdMmYyyyMidnight = (input?: string): string => {
        try {
            let d: Date | null = null;
            if (input) {
                const direct = new Date(input);
                if (!isNaN(direct.getTime())) d = direct;
            }
            if (!d && input) {
                const m = input.match(/^(\d{1,2})-(\d{1,2}|[A-Za-z]{3})-(\d{2,4})$/);
                if (m) {
                    const day = parseInt(m[1], 10);
                    const monToken = m[2];
                    let year = parseInt(m[3], 10);
                    if (year < 100) year = 2000 + year;
                    const month = /^(\d{1,2})$/.test(monToken)
                        ? Math.max(0, Math.min(11, parseInt(monToken, 10) - 1))
                        : ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].indexOf(monToken.toLowerCase());
                    if (month >= 0) d = new Date(year, month, day);
                }
            }
            if (!d) d = new Date();
            const dd = String(d.getDate()).padStart(2, '0');
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const yyyy = String(d.getFullYear());
            return `${yyyy}-${mm}-${dd} 00:00:00`;
        } catch {
            const now = new Date();
            const dd = String(now.getDate()).padStart(2, '0');
            const mm = String(now.getMonth() + 1).padStart(2, '0');
            const yyyy = String(now.getFullYear());
            return `${yyyy}-${mm}-${dd} 00:00:00`;
        }
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
        setIsLabTestsOpen(false);
    };

    const handleResultChange = (id: string, field: keyof LabTestResult, value: string) => {
        setLabTestResults(prev =>
            prev.map(result =>
                result.id === id ? { ...result, [field]: value } : result
            )
        );

        // Clear error for this field if it has a value
        if (field === 'value' && value.trim()) {
            setResultErrors(prev => {
                if (!prev.has(id)) return prev; // No change needed
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    const handleRemoveResult = (id: string) => {
        const resultToRemove = labTestResults.find(r => r.id === id);
        const nextResults = labTestResults.filter(result => result.id !== id);

        setLabTestResults(nextResults);

        // Also remove any error for this ID since it's being removed
        setResultErrors(prev => {
            if (!prev.has(id)) return prev;
            const next = new Set(prev);
            next.delete(id);
            return next;
        });

        // If no parameters remain for this test name, unselect it from the dropdown
        if (resultToRemove) {
            const remainingForThisTest = nextResults.some(r => r.labTestName === resultToRemove.labTestName);
            if (!remainingForThisTest) {
                const option = labTestsOptions.find(o => o.label === resultToRemove.labTestName);
                if (option) {
                    setSelectedLabTests(prev => prev.filter(val => val !== option.value));
                }
            }
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Validate required fields
            const newErrors: { [key: string]: string } = {};
            if (!formData.labName) newErrors.labName = 'Lab Name is required';
            if (!formData.labDoctorName) newErrors.labDoctorName = 'Doctor Name is required';
            if (!formData.reportDate) {
                newErrors.reportDate = 'Report Date is required';
            } else if (dayjs(formData.reportDate).isAfter(dayjs(), 'day')) {
                newErrors.reportDate = 'Future dates are not allowed';
            }

            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                setIsLoading(false); // Ensure loading state is reset
                return;
            }

            if (labTestResults.length === 0) {
                throw new Error('Please add at least one lab test result');
            }

            // Validate lab test result values only
            const missingIds = new Set<string>();
            labTestResults.forEach(r => {
                if (!r.value || !r.value.trim()) {
                    missingIds.add(r.id);
                }
            });

            if (missingIds.size > 0) {
                setResultErrors(missingIds);
                throw new Error('Please provide a value for each result');
            }

            // Build request payload
            // Prefer doctor/provider coming from the Appointment screen/patient row,
            // and only fall back to the session doctor id if nothing else is available.
            const resolvedDoctorId =
                (appointment as any)?.doctorId ||
                (patientData as any)?.doctorId ||
                // In some flows provider may actually carry the doctor id/code
                (patientData as any)?.provider ||
                (sessionData as any)?.doctorId ||
                '';
            const clinicId = (patientData as any)?.clinicId || '';
            const shiftId = (patientData as any)?.shiftId || 0;
            const patientVisitNo = (patientData as any)?.patient_visit_no || (patientData as any)?.visitNumber || 0;
            const userId = (sessionData as any)?.userId || '';
            // const doctorName = (sessionData as any)?.doctorName || '';
            const patientId = String((patientData as any)?.patientId || '');

            const visitDateString = (patientData as any)?.visitDate || new Date().toISOString().slice(0, 10);
            const visitDateYMD = toYyyyMmDd(String(visitDateString));
            // Format as yyyy-MM-ddTHH:mm:ss (ISO format with T separator) for backend
            const visitDateYMDMidnight = `${visitDateYMD}T00:00:00`;
            const reportDateYMD = toYyyyMmDd(String(formData.reportDate));

            // Debug: log date transformation
            console.log('Date transformation:', {
                original: visitDateString,
                converted: visitDateYMD,
                final: visitDateYMDMidnight
            });

            const requestPayload: import('../services/patientService').LabTestResultRequest = {
                patientId,
                patientVisitNo: Number(patientVisitNo || 0),
                doctorId: String(resolvedDoctorId || ''),
                clinicId: String(clinicId || ''),
                shiftId: Number(shiftId || 0),
                userId: String(userId || ''),
                doctorName: formData.labDoctorName,
                labName: formData.labName,
                reportDate: reportDateYMD,
                comment: formData.comment,
                testReportData: labTestResults.map(r => ({
                    visitDate: String(visitDateYMDMidnight || ''),
                    patientVisitNo: Number(patientVisitNo || 0),
                    shiftId: Number(shiftId || 0),
                    clinicId: String(clinicId || ''),
                    doctorId: String(resolvedDoctorId || ''),
                    patientId: patientId,
                    labTestDescription: r.labTestName,
                    parameterName: r.parameterName || 'Result',
                    testParameterValue: r.value
                }))
            };

            // Submit to backend
            const submitResponse = await patientService.submitLabTestResults(requestPayload as any);

            if (!submitResponse?.success) {
                const msg = submitResponse?.message || 'Submission failed';
                throw new Error(msg);
            }

            // Success: reset, show snackbar, then close dialog shortly after
            handleReset();
            const successMsg = submitResponse?.message || 'Lab test entry submitted successfully!';
            setSuccess(successMsg);
            setSnackbarMessage('Lab added successfully');
            setSnackbarOpen(true);

            // Notify parent of success
            if (onSubmissionSuccess) {
                onSubmissionSuccess();
            }

            // Allow a brief moment for snackbar to be visible before closing
            setTimeout(() => {
                onClose();
            }, 800);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);

            // Show snackbar immediately for errors
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
        setLabTestSearch('');
        setIsLabTestsOpen(false);
        lastFetchParamsRef.current = null;
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
                            width: '80%',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Section */}
                        <div style={{
                            background: 'white',
                            padding: '15px 20px',
                            borderTopLeftRadius: '8px',
                            borderTopRightRadius: '8px',
                            fontSize: '0.9rem'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '10px'
                            }}>
                                <h3 style={{ margin: '0px !important', color: '#000000', fontSize: '20px', fontWeight: 'bold' }} className='mb-0'>
                                    Lab Details
                                </h3>
                                {onClose && (
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
                                    >
                                        <Close />
                                    </button>
                                )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                <PatientNameDisplay
                                    patientData={patientData}
                                    onClick={() => {
                                        if (patientData?.patientId) {
                                            setShowQuickRegistration(true);
                                        }
                                    }}
                                    style={{
                                        color: '#4caf50',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: patientData?.patientId ? 'pointer' : 'default',
                                        textDecoration: patientData?.patientId ? 'underline' : 'none'
                                    }}
                                    title={patientData?.patientId ? 'Click to view patient details' : ''}
                                />
                                <div style={{
                                    color: '#666',
                                    fontSize: '14px',
                                    textAlign: 'right'
                                }}>
                                    <div>{doctorDisplayName}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>


                            </div>
                        </div>
                        <DialogContent sx={{
                            overflow: 'visible',
                            p: '4px 20px 8px',
                            '& .MuiTextField-root, & .MuiFormControl-root': { width: '100%' },
                            // Remove right padding on last column so fields align with actions
                            '& .MuiGrid-container > .MuiGrid-item:last-child': { paddingRight: 0 },
                            // Match Appointment page input/select height (38px)
                            '& .MuiTextField-root .MuiOutlinedInput-root, & .MuiFormControl-root .MuiOutlinedInput-root': { height: 38 },
                            // Typography and padding to match Appointment inputs
                            '& .MuiInputBase-input, & .MuiSelect-select': {
                                fontFamily: "'Roboto', sans-serif",
                                fontWeight: 500,
                                padding: '6px 12px',
                                lineHeight: 1.5
                            },
                            // Outline thickness and colors (normal and focused)
                            '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
                                borderWidth: '2px',
                                borderColor: '#B7B7B7',
                                borderRadius: '8px'
                            },
                            '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#999',
                                borderRadius: '8px'
                            },
                            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderWidth: '2px',
                                borderColor: '#1E88E5',
                                borderRadius: '8px'
                            },
                            // Add border radius to all input elements
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                boxShadow: 'none'
                            },
                            '& .MuiOutlinedInput-root.Mui-focused': { boxShadow: 'none !important' },
                            // Disabled look similar to Appointment header select
                            '& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-input, & .MuiOutlinedInput-root.Mui-disabled .MuiSelect-select': {
                                backgroundColor: '#ECEFF1',
                                WebkitTextFillColor: 'inherit'
                            },
                            // Autocomplete styling to match other inputs and remove inner borders
                            '& .MuiAutocomplete-root .MuiAutocomplete-input': {
                                opacity: 1,
                                border: 'none !important',
                                outline: 'none !important'
                            },
                            '& .MuiAutocomplete-root .MuiOutlinedInput-root': {
                                height: 38,
                                borderRadius: '8px',
                                boxShadow: 'none',
                                padding: '0 !important'
                            },
                            '& .MuiAutocomplete-root .MuiOutlinedInput-root .MuiOutlinedInput-input': {
                                border: 'none !important',
                                outline: 'none !important',
                                padding: '6px 12px !important'
                            },
                            '& .MuiAutocomplete-root .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
                                borderWidth: '2px',
                                borderColor: '#B7B7B7',
                                borderRadius: '8px'
                            },
                            '& .MuiAutocomplete-root .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#999',
                                borderRadius: '8px'
                            },
                            '& .MuiAutocomplete-root .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderWidth: '2px',
                                borderColor: '#1E88E5',
                                borderRadius: '8px'
                            },
                            '& .MuiAutocomplete-root .MuiOutlinedInput-root.Mui-focused': {
                                boxShadow: 'none !important'
                            },
                            '& .MuiAutocomplete-root .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-input': {
                                border: 'none !important',
                                outline: 'none !important'
                            },
                            // Ensure no double borders on Autocomplete input elements
                            '& .MuiAutocomplete-root input': {
                                border: 'none !important',
                                outline: 'none !important',
                                boxShadow: 'none !important'
                            },
                            '& .MuiAutocomplete-root .MuiTextField-root': {
                                '& .MuiOutlinedInput-root .MuiOutlinedInput-input': {
                                    border: 'none !important',
                                    outline: 'none !important'
                                }
                            },
                            // Hide loading indicator (rotating spinner) in Autocomplete
                            '& .MuiAutocomplete-root .MuiCircularProgress-root': {
                                display: 'none !important'
                            },
                            // Remove global input borders on this page only
                            '& input, & textarea, & select, & .MuiTextField-root input, & .MuiFormControl-root input': {
                                border: 'none !important'
                            },
                            '& .MuiBox-root': { mb: 0 },
                            '& .MuiTypography-root': { mb: 0.25 },
                            // Local override for headings inside this dialog only
                            '& h1, & h2, & h3, & h4, & h5, & h6, & .MuiTypography-h1, & .MuiTypography-h2, & .MuiTypography-h3, & .MuiTypography-h4, & .MuiTypography-h5, & .MuiTypography-h6': {
                                margin: '0 0 2px 0 !important'
                            },
                            // Consistent error message styling
                            '& .MuiFormHelperText-root': {
                                fontSize: '0.75rem',
                                lineHeight: 1.66,
                                fontFamily: "'Roboto', sans-serif",
                                margin: '3px 14px 0',
                                minHeight: '1.25rem'
                            },
                            position: 'relative'
                        }}>
                            {/* Form Content */}
                            <div style={{ padding: '0px', flex: 1 }}>
                                {/* Lab Report Information Section */}
                                <div style={{ marginBottom: '30px' }}>

                                    <div style={{ marginBottom: '20px' }}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={4}>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                                        Lab Name <span style={{ color: 'red' }}>*</span>
                                                    </Typography>
                                                    <TextField
                                                        fullWidth
                                                        placeholder="Lab Name"
                                                        value={formData.labName}
                                                        onChange={(e) => {
                                                            handleInputChange('labName', e.target.value);
                                                            if (e.target.value) {
                                                                setErrors(prev => ({ ...prev, labName: '' }));
                                                            }
                                                        }}
                                                        error={!!errors.labName}
                                                        helperText={errors.labName}
                                                        required
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                                                    />
                                                </Box>
                                            </Grid>

                                            <Grid item xs={12} md={4}>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                                        Lab Doctor Name <span style={{ color: 'red' }}>*</span>
                                                    </Typography>
                                                    <TextField
                                                        fullWidth
                                                        placeholder="Doctor Name"
                                                        value={formData.labDoctorName}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            // Allow only alphabets and spaces
                                                            if (/^[a-zA-Z\s]*$/.test(val)) {
                                                                handleInputChange('labDoctorName', val);
                                                                if (val) {
                                                                    setErrors(prev => ({ ...prev, labDoctorName: '' }));
                                                                }
                                                            }
                                                        }}
                                                        error={!!errors.labDoctorName}
                                                        helperText={errors.labDoctorName}
                                                        required
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                                                    />
                                                </Box>
                                            </Grid>

                                            <Grid item xs={12} md={4}>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                                        Report Date <span style={{ color: 'red' }}>*</span>
                                                    </Typography>
                                                    <TextField
                                                        fullWidth
                                                        type="date"
                                                        required
                                                        value={formData.reportDate}
                                                        onChange={(e) => {
                                                            const newValue = e.target.value;
                                                            handleInputChange('reportDate', newValue);
                                                            if (newValue && dayjs(newValue).isAfter(dayjs(), 'day')) {
                                                                setErrors(prev => ({ ...prev, reportDate: 'Future dates are not allowed' }));
                                                            } else if (newValue) {
                                                                setErrors(prev => ({ ...prev, reportDate: '' }));
                                                            }
                                                        }}
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                                                            '& input[type="date"]': {
                                                                color: formData.reportDate ? 'inherit' : 'rgba(0, 0, 0, 0.42)'
                                                            }
                                                        }}
                                                        error={!!errors.reportDate}
                                                        helperText={errors.reportDate}
                                                        inputProps={{
                                                            max: dayjs().format('YYYY-MM-DD')
                                                        }}
                                                    />
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </div>

                                    <div>
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                                Comment
                                            </Typography>
                                            <textarea
                                                value={formData.comment}
                                                onChange={(e) => handleInputChange('comment', e.target.value)}
                                                placeholder="Comment"
                                                rows={3}
                                                id='textarea-autosize'
                                                style={{
                                                    border: '1px solid #b7b7b7',
                                                    borderRadius: '8px',
                                                    padding: '8px',
                                                    resize: 'vertical'
                                                }}
                                            />
                                        </Box>
                                    </div>
                                </div>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '5px',
                                        fontSize: '0.9rem',
                                        fontWeight: 700,
                                        color: '#333'
                                    }}>
                                        Lab Tests <span style={{ color: 'red' }}>*</span>
                                    </label>
                                    <div ref={labTestsRef} style={{ display: 'flex', gap: '10px', alignItems: 'end' }}>
                                        <div style={{ position: 'relative', flex: 1 }}>
                                            <div
                                                onClick={() => setIsLabTestsOpen(prev => !prev)}
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
                                                    userSelect: 'none',
                                                    outline: 'none',
                                                    transition: 'border-color 0.2s',
                                                    position: 'relative'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = '#1E88E5';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = '#B7B7B7';
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
                                                    zIndex: 10001,
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
                                                                height: '28px',
                                                                padding: '4px 8px',
                                                                border: '1px solid #B7B7B7',
                                                                borderRadius: '4px',
                                                                fontSize: '12px',
                                                                outline: 'none'
                                                            }}
                                                            onFocus={(e) => {
                                                                e.target.style.borderColor = '#1E88E5';
                                                            }}
                                                            onBlur={(e) => {
                                                                e.target.style.borderColor = '#B7B7B7';
                                                            }}
                                                        />
                                                    </div>
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
                                                        {!labTestsLoading && !labTestsError && filteredLabTests.map((opt) => {
                                                            const isAdded = labTestResults.some(r => r.labTestName === opt.label);
                                                            const isChecked = selectedLabTests.includes(opt.value) || isAdded;
                                                            return (
                                                                <label
                                                                    key={opt.value}
                                                                    style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '4px',
                                                                        padding: '4px 2px',
                                                                        cursor: isAdded ? 'default' : 'pointer',
                                                                        fontSize: '12px',
                                                                        border: 'none',
                                                                        backgroundColor: isChecked && !isAdded ? '#e3f2fd' : 'transparent',
                                                                        borderRadius: '3px',
                                                                        fontWeight: isChecked ? '600' : '400',
                                                                        opacity: isAdded ? 0.6 : 1
                                                                    }}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isChecked}
                                                                        disabled={isAdded}
                                                                        onChange={(e) => {
                                                                            if (isAdded) return;
                                                                            setSelectedLabTests(prev => {
                                                                                if (e.target.checked) {
                                                                                    if (prev.includes(opt.value)) return prev;
                                                                                    const next = [...prev, opt.value];
                                                                                    return next;
                                                                                } else {
                                                                                    const next = prev.filter(v => v !== opt.value);
                                                                                    return next;
                                                                                }
                                                                            });
                                                                        }}
                                                                        style={{ margin: 0, maxWidth: 16 }}
                                                                    />
                                                                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{opt.label}</span>
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAddResult();
                                            }}
                                            style={{
                                                padding: '0 10px',
                                                height: '32px',
                                                backgroundColor: '#1976d2',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#1565c0';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = '#1976d2';
                                            }}
                                        >
                                            <Add style={{ fontSize: '16px' }} />
                                            Add
                                        </button>
                                    </div>
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
                                                            fontWeight: '400',
                                                            color: 'black',
                                                            width: '35%'
                                                        }}>
                                                            Lab Test Name
                                                        </th>
                                                        <th style={{
                                                            padding: '12px',
                                                            textAlign: 'left',
                                                            borderBottom: '1px solid #ddd',
                                                            fontWeight: '400',
                                                            color: 'black',
                                                            width: '190px'
                                                        }}>
                                                            Parameter Name
                                                        </th>
                                                        <th style={{
                                                            padding: '12px',
                                                            textAlign: 'left',
                                                            borderBottom: '1px solid #ddd',
                                                            fontWeight: '400',
                                                            color: 'black',
                                                            width: '120px'
                                                        }}>
                                                            Value / Results *
                                                        </th>
                                                        <th style={{
                                                            padding: '12px',
                                                            textAlign: 'center',
                                                            borderBottom: '1px solid #ddd',
                                                            fontWeight: '400',
                                                            color: 'black',
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
                                                                color: 'black',
                                                                height: '38px',
                                                                fontSize: '14px'
                                                            }}>
                                                                {result.labTestName}
                                                            </td>
                                                            <td style={{
                                                                padding: '12px',
                                                                borderBottom: '1px solid #eee',
                                                                color: 'black',
                                                                height: '38px',
                                                                fontSize: '14px'
                                                            }}>
                                                                {result.parameterName}
                                                            </td>
                                                            <td style={{ padding: '12px', borderBottom: '1px solid #eee', height: '38px' }}>
                                                                <TextField
                                                                    fullWidth
                                                                    placeholder="Value / Results"
                                                                    value={result.value}
                                                                    onChange={(e) => handleResultChange(result.id, 'value', e.target.value)}
                                                                    required
                                                                    error={resultErrors.has(result.id)}
                                                                    variant="outlined"
                                                                    size="small"
                                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
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
                        </DialogContent>

                        {/* Footer with Action Buttons */}
                        <div style={{
                            padding: '20px',
                            // borderTop: '1px solid #e0e0e0',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px',
                            backgroundColor: '#fafafa'
                        }}>
                            <button
                                onClick={onClose}
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
                                type="submit"
                                onClick={handleSubmit}
                                disabled={isLoading}
                                style={{
                                    backgroundColor: '#1976D2',
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
                            {/* <button
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
                            </button> */}
                        </div>
                    </div>
                </div>
            )}

            {/* Snackbar for notifications */}
            <GlobalSnackbar
                show={snackbarOpen}
                message={snackbarMessage}
                onClose={() => setSnackbarOpen(false)}
                autoHideDuration={5000}
            />

            {/* Quick Registration Modal - appears on top of Lab Test Entry window */}
            {showQuickRegistration && patientData?.patientId && (
                <AddPatientPage
                    open={showQuickRegistration}
                    onClose={() => {
                        setShowQuickRegistration(false);
                    }}
                    patientId={patientData.patientId}
                    readOnly={true}
                    doctorId={patientData?.doctorId || sessionData?.doctorId}
                    clinicId={patientData?.clinicId || sessionData?.clinicId}
                />
            )}
        </>
    );
};

export default LabTestEntry;
