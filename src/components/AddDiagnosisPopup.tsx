import React, { useState, useEffect } from 'react';
import { Close } from '@mui/icons-material';
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
    IconButton
} from '@mui/material';
import { useSession } from '../store/hooks/useSession';
import { validateField } from '../utils/validationUtils';

interface AddDiagnosisPopupProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: {
        shortDescription: string;
        diagnosisDescription: string;
        priority: string;
        clinicId?: string;
    }) => boolean | void | Promise<boolean | void>;
    editData?: {
        shortDescription: string;
        diagnosisDescription: string;
        priority: number;
    } | null;
}

const AddDiagnosisPopup: React.FC<AddDiagnosisPopupProps> = ({ open, onClose, onSave, editData }) => {
    const session = useSession();
    const [shortDescription, setShortDescription] = useState('');
    const [diagnosisDescription, setDiagnosisDescription] = useState('');
    const [priority, setPriority] = useState('');

    // Validation state
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Snackbar state management
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // Populate form when editData changes
    useEffect(() => {
        if (editData) {
            setShortDescription(editData.shortDescription || '');
            setDiagnosisDescription(editData.diagnosisDescription || '');
            setPriority(editData.priority?.toString() || '');
            setErrors({ shortDescription: '', diagnosisDescription: '', priority: '' });
        } else {
            // Reset form when not in edit mode
            setShortDescription('');
            setDiagnosisDescription('');
            setPriority('');
            setErrors({});
        }
    }, [editData, open]);

    const handleSubmit = async () => {
        let newErrors = { shortDescription: '', diagnosisDescription: '', priority: '' };
        let hasError = false;

        if (!shortDescription.trim()) {
            newErrors.shortDescription = 'Short Description is required';
            hasError = true;
        }

        if (!diagnosisDescription.trim()) {
            newErrors.diagnosisDescription = 'Diagnosis Description is required';
            hasError = true;
        }

        if (!priority.trim()) {
            newErrors.priority = 'Priority is required';
            hasError = true;
        }

        if (!priority.trim()) {
            newErrors.priority = 'Priority is required';
            hasError = true;
        }

        setErrors(newErrors);

        if (hasError) {
            return;
        }

        // Validate clinicId from session
        if (!session.clinicId) {
            setSnackbarMessage('Clinic ID is required. Please ensure you are logged in.');
            setSnackbarOpen(true);
            return;
        }

        // Normalize text fields to uppercase before saving
        const shortDescUpper = shortDescription.trim().toUpperCase();
        const diagnosisDescUpper = diagnosisDescription.trim().toUpperCase();

        // Determine priority (required)
        const priorityValue = priority.trim();

        // Call the parent onSave callback with all form data
        const result = await onSave({
            shortDescription: shortDescUpper,
            diagnosisDescription: diagnosisDescUpper,
            priority: priorityValue,
            clinicId: session.clinicId
        });

        // If parent returns false, it means validation/duplicate error: keep popup open
        if (result === false) {
            return;
        }

        // Reset form
        setShortDescription('');
        setDiagnosisDescription('');
        setPriority('');
        setErrors({ shortDescription: '', diagnosisDescription: '', priority: '' });

        // Close popup - success message will be shown in parent component
        onClose();
    };

    const handleClose = () => {
        setShortDescription('');
        setDiagnosisDescription('');
        setPriority('');
        setErrors({ shortDescription: '', diagnosisDescription: '', priority: '' });
        onClose();
    };

    const handleReset = () => {
        setShortDescription('');
        setDiagnosisDescription('');
        setPriority('');
        setErrors({});
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    style: { borderRadius: '8px' }
                }}
            >
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" component="div" style={{ fontWeight: 'bold' }} className="mb-0">
                        {editData ? 'Edit Diagnosis' : 'Add Diagnosis'}
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
                                    Short Description <span style={{ color: 'red' }}>*</span> <span className="text-muted">(Displayed on UI)</span>
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Diagnosis Short Description"
                                    variant="outlined"
                                    size="small"
                                    value={shortDescription}
                                    onChange={(e) => {
                                        const val = e.target.value.toUpperCase();
                                        const { allowed, error } = validateField('shortDescription', val, undefined, undefined, 'diagnosis');
                                        if (allowed) {
                                            setShortDescription(val);
                                            setErrors(prev => ({ ...prev, shortDescription: error }));
                                        }
                                    }}
                                    disabled={!!editData}
                                    error={!!errors.shortDescription}
                                    helperText={errors.shortDescription}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className="mb-0">
                                    Diagnosis Description <span style={{ color: 'red' }}>*</span>
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Diagnosis Description"
                                    variant="outlined"
                                    size="small"
                                    value={diagnosisDescription}
                                    onChange={(e) => {
                                        const val = e.target.value.toUpperCase();
                                        const { allowed, error } = validateField('diagnosisDescription', val, undefined, undefined, 'diagnosis');
                                        if (allowed) {
                                            setDiagnosisDescription(val);
                                            setErrors(prev => ({ ...prev, diagnosisDescription: error }));
                                        }
                                    }}
                                    error={!!errors.diagnosisDescription}
                                    helperText={errors.diagnosisDescription}
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
                                    value={priority}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        const { allowed, error } = validateField('priority', val, undefined, undefined, 'diagnosis');
                                        if (allowed) {
                                            setPriority(val);
                                            setErrors(prev => ({ ...prev, priority: error }));
                                        }
                                    }}
                                    helperText={errors.priority}
                                />
                            </Box>
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
                        onClick={handleSubmit}
                        variant="contained"
                        sx={{
                            backgroundColor: 'rgb(0, 123, 255)',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: 'rgb(0, 100, 200)',
                            }
                        }}
                    >
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Success/Error Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={2000}
                onClose={() => {
                    setSnackbarOpen(false);
                }}
                message={snackbarMessage}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                sx={{
                    zIndex: 99999, // Ensure snackbar appears above everything
                    '& .MuiSnackbarContent-root': {
                        backgroundColor: snackbarMessage.includes('successfully') ? '#4caf50' : '#f44336',
                        color: 'white',
                        fontWeight: 'bold'
                    }
                }}
            />
        </>
    );
};

export default AddDiagnosisPopup;
