import React, { useState, useEffect } from 'react';
import { Close, Delete } from '@mui/icons-material';
import { useSession } from '../store/hooks/useSession';
import {
    Snackbar,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Box,
    Typography,
    IconButton,
    Alert
} from '@mui/material';
import { validateField } from '../utils/validationUtils';

export interface LabTestRow {
    id: string;
    parameterName: string;
    comment: string;
    parameterId?: string | number;
}

export interface TestLabData {
    labTestName: string;
    priority: string;
    parameterName: string;
    labTestRows: LabTestRow[];
}

interface AddTestLabPopupProps {
    open: boolean;
    onClose: () => void;
    onSave: (testLabData: TestLabData) => boolean | void | Promise<boolean | void>;
    onError?: (message: string) => void;
    editData?: {
        labTestName: string;
        priority: number | string;
        parameters?: LabTestRow[];
    } | null;
    clinicId?: string;
    doctorId?: string;
}

const AddTestLabPopup: React.FC<AddTestLabPopupProps> = ({ open, onClose, onSave, editData, clinicId, doctorId }) => {
    const session = useSession();
    const [testLabData, setTestLabData] = useState<TestLabData>({
        labTestName: '',
        priority: '',
        parameterName: '',
        labTestRows: []
    });

    // Validation state
    const [errors, setErrors] = useState<{
        labTestName: string;
        priority: string;
        parameterName: string;
        parameters: string;
    }>({
        labTestName: '',
        priority: '',
        parameterName: '',
        parameters: ''
    });

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!open) return;

        setTestLabData({
            labTestName: editData?.labTestName || '',
            priority: String(editData?.priority || ''),
            parameterName: '',
            labTestRows: editData?.parameters?.map(param => ({
                id: param.id || `param_${Date.now()}_${Math.random()}`,
                parameterName: param.parameterName || '',
                comment: param.comment || '',
                parameterId: (param as any).parameterId
            })) || []
        });
        setErrors({ labTestName: '', priority: '', parameterName: '', parameters: '' });
    }, [open, editData]);

    const handleInputChange = (field: keyof TestLabData, value: string) => {
        // Validation for Lab Test Name
        if (field === 'labTestName') {
            const { allowed, error } = validateField('labTestName', value, undefined, undefined, 'labMaster');
            if (!allowed && value !== '') return; // Prevent invalid input (except empty string which is always allowed type-wise but might fail regex if regex enforces min length, but here pattern is * so empty is allowed)
            // Wait, validateField checks regex. If pattern is /^...*$/, empty string matches.
            // If pattern requires chars, then empty string might fail.
            // But usually we allow clearing input.

            if (allowed) {
                setTestLabData(prev => ({ ...prev, [field]: value }));
                setErrors(prev => ({ ...prev, labTestName: error }));
            }
            return;
        }

        if (field === 'parameterName') {
            const { allowed, error } = validateField('parameterName', value, undefined, undefined, 'labMaster');
            if (allowed) {
                setTestLabData(prev => ({ ...prev, [field]: value }));
                // Clear errors if valid (validateField might return error string if length exceeded but still allowed? No, allowed=false if max length exceeded)
                // Actually validateField returns error if regex mismatch or length check logic?
                // If allowed=true, it means it passed "can type" checks.
                // But error message might be empty.
                setErrors(prev => ({ ...prev, parameterName: error, parameters: '' }));
            }
            return;
        }
        if (field === 'priority') {
            const { allowed, error } = validateField('priority', value, undefined, undefined, 'labMaster');
            if (allowed) {
                setTestLabData(prev => ({ ...prev, [field]: value }));
                setErrors(prev => ({ ...prev, priority: error }));
            }
            return;
        }

        // Default update for any other fields
        setTestLabData(prev => ({ ...prev, [field]: value }));
    };

    const showSnackbar = (message: string, severity: 'success' | 'error' = 'error') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleAddParameter = () => {
        const name = testLabData.parameterName.trim();

        if (!name) {
            setErrors(prev => ({ ...prev, parameterName: 'Please enter a parameter name' }));
            return;
        }

        if (testLabData.labTestRows.some(row => row.parameterName.trim().toLowerCase() === name.toLowerCase())) {
            setErrors(prev => ({ ...prev, parameterName: 'This parameter already exists in the list' }));
            return;
        }

        setTestLabData(prev => ({
            ...prev,
            labTestRows: [...prev.labTestRows, { id: `param_${Date.now()}`, parameterName: name, comment: '' }],
            parameterName: ''
        }));
        // Clear parameter error after successful add
        setErrors(prev => ({ ...prev, parameterName: '', parameters: '' }));
    };

    const handleRemoveParameter = (id: string) => {
        setTestLabData(prev => ({ ...prev, labTestRows: prev.labTestRows.filter(row => row.id !== id) }));
    };

    const handleSave = async () => {
        let hasError = false;
        const newErrors: any = { labTestName: '', priority: '', parameterName: '', parameters: '' };

        if (!testLabData.labTestName.trim()) {
            newErrors.labTestName = 'Lab Test Name is required';
            hasError = true;
        }

        if (!testLabData.priority.trim()) {
            newErrors.priority = 'Priority is required';
            hasError = true;
        }

        if (testLabData.labTestRows.length === 0) {
            newErrors.parameters = 'Please add at least one parameter';
            hasError = true;
        }

        if (!(clinicId || session.clinicId) || !(doctorId || session.doctorId)) {
            showSnackbar('Clinic ID and Doctor ID are required', 'error');
            return;
        }

        setErrors(newErrors);

        if (hasError) return;

        setIsSaving(true);
        try {
            // All CRUD operations (Create, Update, Delete) are handled by the parent component
            const result = await onSave(testLabData);
            if (result !== false) {
                showSnackbar(editData ? 'Lab test updated successfully!' : 'Lab test added successfully!', 'success');
                setTimeout(() => {
                    onClose();
                }, 1000);
            }
        } catch (error: any) {
            console.error('Error saving lab test:', error);
            showSnackbar(error.message || 'Failed to save lab test', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        setErrors({ labTestName: '', priority: '', parameterName: '', parameters: '' });
        onClose();
    };

    const handleReset = () => {
        setTestLabData({
            labTestName: '',
            priority: '',
            parameterName: '',
            labTestRows: []
        });
        setErrors({ labTestName: '', priority: '', parameterName: '', parameters: '' });
    };

    if (!open) return null;

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    style: { borderRadius: '8px', maxWidth: '600px' }
                }}
            >
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" component="div" style={{ fontWeight: 'bold' }} className="mb-0">
                        {editData ? 'Edit Lab Test' : 'Add Lab Test'}
                    </Typography>
                    <IconButton
                        onClick={handleClose}
                        disableRipple
                        sx={{
                            color: '#fff',
                            backgroundColor: '#1976d2',
                            '&:hover': { backgroundColor: '#1565c0' },
                            width: 36,
                            height: 36,
                            borderRadius: '8px'
                        }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className="mb-0">
                                    Lab Test Name <span style={{ color: 'red' }}>*</span>
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Lab Test Name"
                                    variant="outlined"
                                    size="small"
                                    value={testLabData.labTestName}
                                    onChange={(e) => handleInputChange('labTestName', e.target.value)}
                                    error={!!errors.labTestName}
                                    helperText={errors.labTestName || (testLabData.labTestName.length === 80 ? 'Lab Test Name cannot exceed 80 characters' : '')}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className="mb-0">
                                    Priority <span style={{ color: 'red' }}>*</span>
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Priority"
                                    variant="outlined"
                                    size="small"
                                    value={testLabData.priority}
                                    onChange={(e) => handleInputChange('priority', e.target.value)}
                                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                                    error={!!errors.priority}
                                    helperText={errors.priority || (testLabData.priority.length === 10 ? 'Priority cannot exceed 10 characters' : '')}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ mb: 2 }}>
                                <Grid container spacing={1} alignItems="flex-end">
                                    <Grid item xs>
                                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }} className="mb-0">
                                            Parameter Name <span style={{ color: 'red' }}>*</span>
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            placeholder="Parameter Name"
                                            variant="outlined"
                                            size="small"
                                            value={testLabData.parameterName}
                                            inputProps={{ maxLength: getMaxLength('parameterName') }}
                                            onChange={(e) => {
                                                const { allowed, error } = validateField('parameterName', e.target.value, undefined, undefined, 'labMaster');
                                                if (allowed) {
                                                    handleInputChange('parameterName', e.target.value);
                                                    setErrors(prev => ({ ...prev, parameterName: error }));
                                                }
                                            }}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleAddParameter();
                                                }
                                            }}
                                            error={!!errors.parameterName || !!errors.parameters}
                                            helperText={errors.parameterName || errors.parameters}
                                        />
                                    </Grid>
                                    <Grid item>
                                        <Button
                                            onClick={handleAddParameter}
                                            variant="contained"
                                            sx={{
                                                backgroundColor: '#1976d2',
                                                textTransform: 'none',
                                                height: '38px',
                                                '&:hover': {
                                                    backgroundColor: '#1565c0',
                                                }
                                            }}
                                        >
                                            Add Parameter
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>

                        <Grid item xs={12}>
                            {/* Table */}
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                border: '1px solid #dee2e6'
                            }}>
                                <thead>
                                    <tr>
                                        <th style={{
                                            backgroundColor: '#1976d2',
                                            color: '#ffffff',
                                            padding: '8px 12px',
                                            textAlign: 'left',
                                            fontWeight: 'bold',
                                            fontSize: '14px',
                                            border: '1px solid #dee2e6'
                                        }}>Sr.</th>
                                        <th style={{
                                            backgroundColor: '#1976d2',
                                            color: '#ffffff',
                                            padding: '8px 12px',
                                            textAlign: 'left',
                                            fontWeight: 'bold',
                                            fontSize: '14px',
                                            border: '1px solid #dee2e6'
                                        }}>Parameter Name</th>
                                        <th style={{
                                            backgroundColor: '#1976d2',
                                            color: '#ffffff',
                                            padding: '8px 12px',
                                            textAlign: 'center',
                                            fontWeight: 'bold',
                                            fontSize: '14px',
                                            border: '1px solid #dee2e6'
                                        }} className='text-center'>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {testLabData.labTestRows.length > 0 ? (
                                        testLabData.labTestRows.map((row, index) => (
                                            <tr key={row.id}>
                                                <td style={{
                                                    padding: '8px 12px',
                                                    border: '1px solid #dee2e6',
                                                    fontSize: '13px',
                                                    backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#ffffff'
                                                }}>{index + 1}</td>
                                                <td style={{
                                                    padding: '8px 12px',
                                                    border: '1px solid #dee2e6',
                                                    fontSize: '13px',
                                                    backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#ffffff'
                                                }}>{row.parameterName}</td>
                                                <td style={{
                                                    padding: '8px 12px',
                                                    border: '1px solid #dee2e6',
                                                    fontSize: '13px',
                                                    backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#ffffff',
                                                    textAlign: 'center'
                                                }}>
                                                    <div
                                                        onClick={() => handleRemoveParameter(row.id)}
                                                        title="Delete"
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                            color: '#666',
                                                            transition: 'color 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.color = '#d32f2f';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.color = '#666';
                                                        }}
                                                    >
                                                        <Delete style={{ fontSize: '18px' }} />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} style={{
                                                padding: '12px',
                                                border: '1px solid #dee2e6',
                                                fontSize: '13px',
                                                fontFamily: "'Roboto', sans-serif",
                                                textAlign: 'center',
                                                color: '#666'
                                            }}>
                                                No parameters added yet
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={handleClose}
                        variant="contained"
                        sx={{
                            backgroundColor: 'rgb(0, 123, 255)',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: 'rgb(0, 100, 200)',
                            }
                        }}
                    >
                        Close
                    </Button>
                    <Button
                        onClick={handleReset}
                        variant="contained"
                        sx={{
                            backgroundColor: 'rgb(0, 123, 255)',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: 'rgb(0, 100, 200)',
                            }
                        }}
                    >
                        Reset
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        sx={{
                            backgroundColor: 'rgb(0, 123, 255)',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: 'rgb(0, 100, 200)',
                            }
                        }}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Submit'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                sx={{ zIndex: 99999 }}
            >
                <Alert
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: '100%', fontWeight: 'bold' }}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default AddTestLabPopup;
