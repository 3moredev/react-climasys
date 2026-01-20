import React, { useState, useEffect } from 'react';
import { Close } from '@mui/icons-material';
import {
    Snackbar,
    TextField,
    FormControlLabel,
    Checkbox,
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

interface AddComplaintPopupProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: {
        shortDescription: string;
        complaintDescription: string;
        priority: string;
        displayToOperator: boolean;
        clinicId?: string;
    }) => boolean | void | Promise<boolean | void>;
    editData?: {
        shortDescription: string;
        complaintDescription: string;
        priority: number;
        displayToOperator: boolean;
    } | null;
}

const AddComplaintPopup: React.FC<AddComplaintPopupProps> = ({ open, onClose, onSave, editData }) => {
    const session = useSession();
    const [shortDescription, setShortDescription] = useState('');
    const [complaintDescription, setComplaintDescription] = useState('');
    const [priority, setPriority] = useState('');
    const [displayToOperator, setDisplayToOperator] = useState(false);

    // Validation state
    const [errors, setErrors] = useState({
        shortDescription: '',
        complaintDescription: ''
    });

    // Snackbar state management
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // Populate form when editData changes
    useEffect(() => {
        if (editData) {
            setShortDescription(editData.shortDescription || '');
            setComplaintDescription(editData.complaintDescription || '');
            setPriority(editData.priority?.toString() || '');
            setDisplayToOperator(editData.displayToOperator || false);
            setErrors({ shortDescription: '', complaintDescription: '' });
        } else {
            // Reset form when not in edit mode
            setShortDescription('');
            setComplaintDescription('');
            setPriority('');
            setDisplayToOperator(false);
            setErrors({ shortDescription: '', complaintDescription: '' });
        }
    }, [editData, open]);

    const handleSubmit = async () => {
        let newErrors = { shortDescription: '', complaintDescription: '' };
        let hasError = false;

        if (!shortDescription.trim()) {
            newErrors.shortDescription = 'Short Description is required';
            hasError = true;
        }

        if (!complaintDescription.trim()) {
            newErrors.complaintDescription = 'Complaint Description is required';
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
        const complaintDescUpper = complaintDescription.trim().toUpperCase();

        // Determine priority (optional; default to "9" if not provided)
        const priorityValue = priority.trim() || '9';

        // Call the parent onSave callback with all form data
        const result = await onSave({
            shortDescription: shortDescUpper,
            complaintDescription: complaintDescUpper,
            priority: priorityValue,
            displayToOperator,
            clinicId: session.clinicId
        });

        // If parent returns false, it means validation/duplicate error: keep popup open
        if (result === false) {
            return;
        }

        // Reset form
        setShortDescription('');
        setComplaintDescription('');
        setPriority('');
        setDisplayToOperator(false);
        setErrors({ shortDescription: '', complaintDescription: '' });

        // Close popup - success message will be shown in parent component
        onClose();
    };

    const handleClose = () => {
        setShortDescription('');
        setComplaintDescription('');
        setPriority('');
        setDisplayToOperator(false);
        setErrors({ shortDescription: '', complaintDescription: '' });
        onClose();
    };

    const handleReset = () => {
        setShortDescription('');
        setComplaintDescription('');
        setPriority('');
        setDisplayToOperator(false);
        setErrors({ shortDescription: '', complaintDescription: '' });
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
                        {editData ? 'Edit Complaint' : 'Add Complaint'}
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
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                    Short Description <span style={{ color: 'red' }}>*</span> <span className="text-muted">(Displayed on UI)</span>
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Complaint Short Description"
                                    variant="outlined"
                                    size="small"
                                    value={shortDescription}
                                    onChange={(e) => {
                                        setShortDescription(e.target.value);
                                        if (errors.shortDescription) {
                                            setErrors(prev => ({ ...prev, shortDescription: '' }));
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
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                    Complaint Description <span style={{ color: 'red' }}>*</span>
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Complaint Description"
                                    variant="outlined"
                                    size="small"
                                    value={complaintDescription}
                                    onChange={(e) => {
                                        setComplaintDescription(e.target.value);
                                        if (errors.complaintDescription) {
                                            setErrors(prev => ({ ...prev, complaintDescription: '' }));
                                        }
                                    }}
                                    error={!!errors.complaintDescription}
                                    helperText={errors.complaintDescription}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                    Priority
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Priority"
                                    variant="outlined"
                                    size="small"
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} className='my-0 py-0'>
                            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', height: '100%' }} className='my-0'>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={displayToOperator}
                                            onChange={(e) => setDisplayToOperator(e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label={<Typography variant="subtitle2" className='my-0' sx={{ fontWeight: 'bold' }}>Display to Operator</Typography>}
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

export default AddComplaintPopup;
