import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Close } from '@mui/icons-material';
import { Snackbar, Dialog, DialogTitle, DialogContent, Grid, Box, Typography, TextField, Button, IconButton } from '@mui/material';
import api from '../services/api';

interface AddReferralPopupProps {
    open: boolean;
    onClose: () => void;
    onSave: (referralData: ReferralData) => void;
    clinicId?: string; // Required for saving referral doctor
}

interface ReferralData {
    rdId: number;
    doctorName: string;
    doctorAddress: string;
    doctorMob: string;
    doctorMail: string;
    referId: string;
    languageId: number;
    remarks: string;
    deleteFlag: boolean;
}

const AddReferralPopup: React.FC<AddReferralPopupProps> = ({ open, onClose, onSave, clinicId }) => {
    const [formData, setFormData] = useState<ReferralData>({
        rdId: 0,
        doctorName: '',
        doctorAddress: '',
        doctorMob: '',
        doctorMail: '',
        referId: 'D',
        languageId: 1,
        remarks: '',
        deleteFlag: false
    });

    // Snackbar state management
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
    const [isSaving, setIsSaving] = useState(false);

    // Error state for contact number validation
    const [contactError, setContactError] = useState('');

    // Error state for email validation
    const [emailError, setEmailError] = useState('');

    // Error state for Doctor Name
    const [doctorNameError, setDoctorNameError] = useState('');

    const handleInputChange = (field: keyof ReferralData, value: string | number | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDoctorNameChange = (value: string) => {
        // Only allow alphabets and spaces
        const alphabeticValue = value.replace(/[^a-zA-Z\s]/g, '');

        handleInputChange('doctorName', alphabeticValue);

        if (alphabeticValue.trim()) {
            setDoctorNameError('');
        }
    };

    const handleContactNumberChange = (value: string) => {
        // Only allow numbers
        const numericValue = value.replace(/\D/g, '');

        // Limit to 10 digits
        const limitedValue = numericValue.slice(0, 10);

        handleInputChange('doctorMob', limitedValue);

        // Clear error when user starts typing
        if (contactError) {
            setContactError('');
        }
    };

    const validateContactNumber = (): boolean => {
        if (formData.doctorMob.trim() === '') {
            return true; // Contact number is optional, so empty is valid
        }

        if (!/^\d{10}$/.test(formData.doctorMob)) {
            setContactError('Contact number must be exactly 10 digits');
            return false;
        }

        setContactError('');
        return true;
    };

    const handleEmailChange = (value: string) => {
        handleInputChange('doctorMail', value);

        // Clear error when user starts typing
        if (emailError) {
            setEmailError('');
        }
    };

    const validateEmail = (): boolean => {
        if (formData.doctorMail.trim() === '') {
            return true; // Email is optional, so empty is valid
        }

        // Email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(formData.doctorMail)) {
            // setEmailError('Please enter a valid email address');
            return false;
        }

        setEmailError('');
        return true;
    };

    const handleSave = async () => {
        if (isSaving) return;

        if (!formData.doctorName.trim()) {
            setDoctorNameError('Doctor Name is required');
            return;
        }

        // Validate contact number
        if (!validateContactNumber()) {
            setSnackbarSeverity('error');
            setSnackbarMessage('Please enter a valid 10-digit contact number');
            setSnackbarOpen(true);
            return;
        }

        // Validate email
        if (!validateEmail()) {
            setSnackbarSeverity('error');
            setSnackbarMessage('Please enter a valid email address');
            setSnackbarOpen(true);
            return;
        }

        if (!clinicId || clinicId.trim() === '') {
            setSnackbarSeverity('error');
            setSnackbarMessage('Clinic ID is required. Please ensure you are logged in with a valid clinic.');
            setSnackbarOpen(true);
            return;
        }

        setIsSaving(true);
        try {
            // Include clinicId in the payload
            const payload = {
                ...formData,
                clinicId: clinicId
            };

            // Call the API to save the referral doctor
            const response = await api.post('/referrals', payload);
            console.log('Referral doctor saved successfully:', response.data);

            // Show success snackbar
            setSnackbarSeverity('success');
            setSnackbarMessage('Referral doctor added successfully!');
            setSnackbarOpen(true);

            // Call the parent onSave callback with the saved data
            onSave(response.data);

            // Reset form
            setFormData({
                rdId: 0,
                doctorName: '',
                doctorAddress: '',
                doctorMob: '',
                doctorMail: '',
                referId: 'D',
                languageId: 1,
                remarks: '',
                deleteFlag: false
            });
            setContactError('');
            setEmailError('');
            setDoctorNameError('');

            // Close popup after showing success message
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error: any) {
            console.error('Error saving referral doctor:', error);
            // Extract error message from API response
            const errorMessage = error?.response?.data?.error ||
                error?.response?.data?.ErrorMessage ||
                error?.message ||
                'Failed to save referral doctor. Please try again.';

            setSnackbarSeverity('error');
            setSnackbarMessage(errorMessage);
            setSnackbarOpen(true);
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        setFormData({
            rdId: 0,
            doctorName: '',
            doctorAddress: '',
            doctorMob: '',
            doctorMail: '',
            referId: 'D',
            languageId: 1,
            remarks: '',
            deleteFlag: false
        });
        setContactError('');
        setEmailError('');
        setDoctorNameError('');
        onClose();
    };

    if (!open) return null;

    const popupContent = (
        <>
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
                    zIndex: 13000,
                    pointerEvents: 'auto',
                }}
                onClick={handleClose}
            >
                <div
                    style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        maxWidth: '800px',
                        width: '90%',
                        maxHeight: '80vh',
                        display: 'flex',
                        flexDirection: 'column',
                        pointerEvents: 'auto',
                        position: 'relative',
                        zIndex: 13001,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <DialogTitle sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 20px',
                        borderBottom: '1px solid #eee'
                    }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            Add New Referral Doctor
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

                    {/* Content */}
                    <DialogContent sx={{
                        p: '20px',
                        '& .MuiTextField-root, & .MuiFormControl-root': { width: '100%' },
                        '& .MuiTextField-root .MuiOutlinedInput-root, & .MuiFormControl-root .MuiOutlinedInput-root': { height: 38 },
                        '& .MuiInputBase-input, & .MuiSelect-select': {
                            fontFamily: "'Roboto', sans-serif",
                            fontWeight: 500,
                            padding: '6px 12px',
                            lineHeight: 1.5
                        },
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
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            boxShadow: 'none'
                        },
                        '& .MuiOutlinedInput-root.Mui-focused': { boxShadow: 'none !important' },
                        '& .MuiFormHelperText-root': {
                            fontSize: '0.75rem',
                            lineHeight: 1.66,
                            fontFamily: "'Roboto', sans-serif",
                            margin: '3px 0 0 0 !important',
                            padding: '0 !important',
                            minHeight: '1.25rem',
                            textAlign: 'left !important'
                        },
                        '& h1, & h2, & h3, & h4, & h5, & h6, & .MuiTypography-h1, & .MuiTypography-h2, & .MuiTypography-h3, & .MuiTypography-h4, & .MuiTypography-h5, & .MuiTypography-h6': {
                            margin: '0 0 2px 0 !important'
                        },
                    }}>
                        <Grid container spacing={3} sx={{ mt: 0 }}>
                            <Grid item xs={12} md={6}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                        Doctor Name <span style={{ color: '#f44336' }}>*</span>
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="Enter Doctor Name"
                                        value={formData.doctorName}
                                        onChange={(e) => handleDoctorNameChange(e.target.value)}
                                        error={!!doctorNameError}
                                        helperText={doctorNameError}
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                        Doctor Number
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="Enter Doctor Number"
                                        value={formData.doctorMob}
                                        onChange={(e) => handleContactNumberChange(e.target.value)}
                                        onBlur={validateContactNumber}
                                        error={!!contactError}
                                        helperText={contactError}
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                        Doctor Email
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="Enter Doctor Email"
                                        value={formData.doctorMail}
                                        onChange={(e) => handleEmailChange(e.target.value)}
                                        onBlur={validateEmail}
                                        error={!!emailError}
                                        helperText={emailError}
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                        Remark
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="Enter Remark"
                                        value={formData.remarks}
                                        onChange={(e) => handleInputChange('remarks', e.target.value)}
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={12}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                        Doctor Address
                                    </Typography>
                                    <textarea
                                        id='textarea-autosize'
                                        rows={2}
                                        placeholder="Enter Doctor Address"
                                        value={formData.doctorAddress}
                                        onChange={(e) => handleInputChange('doctorAddress', e.target.value)}
                                        style={{
                                            border: '1px solid #b7b7b7',
                                            borderRadius: '8px',
                                            padding: '8px',
                                            resize: 'vertical'
                                        }}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </DialogContent>

                    {/* Footer */}
                    <Box sx={{
                        p: 2,
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 2,
                        borderTop: '1px solid #eee'
                    }}>
                        <Button
                            variant="contained"
                            onClick={handleClose}
                            sx={{ borderRadius: '8px' }}
                        >
                            Close
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => {
                                setFormData({
                                    rdId: 0,
                                    doctorName: '',
                                    doctorAddress: '',
                                    doctorMob: '',
                                    doctorMail: '',
                                    referId: 'D',
                                    languageId: 1,
                                    remarks: '',
                                    deleteFlag: false
                                });
                                setDoctorNameError('');
                                setContactError('');
                                setEmailError('');
                            }}
                            sx={{ borderRadius: '8px' }}
                        >
                            Reset
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSave}
                            disabled={isSaving}
                            sx={{ borderRadius: '8px' }}
                        >
                            {isSaving ? 'Submitting...' : 'Submit'}
                        </Button>
                    </Box>
                </div>
            </div>

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
                    zIndex: 13002, // Higher than popup
                    '& .MuiSnackbarContent-root': {
                        backgroundColor: snackbarSeverity === 'success' ? '#4caf50' : '#f44336',
                        color: 'white',
                        fontWeight: 'bold'
                    }
                }}
            />
        </>
    );

    // Use Portal to render outside Dialog's DOM hierarchy
    return createPortal(popupContent, document.body);
};

export default AddReferralPopup;
export type { ReferralData };
