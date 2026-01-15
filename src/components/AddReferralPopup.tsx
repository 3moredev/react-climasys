import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Close } from '@mui/icons-material';
import { Snackbar } from '@mui/material';
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

    // Error state for contact number validation
    const [contactError, setContactError] = useState('');

    // Error state for email validation
    const [emailError, setEmailError] = useState('');

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
        if (!formData.doctorName.trim()) {
            setSnackbarMessage('Doctor Name is required');
            setSnackbarOpen(true);
            return;
        }

        // Validate contact number
        if (!validateContactNumber()) {
            setSnackbarMessage('Please enter a valid 10-digit contact number');
            setSnackbarOpen(true);
            return;
        }

        // Validate email
        if (!validateEmail()) {
            setSnackbarMessage('Please enter a valid email address');
            setSnackbarOpen(true);
            return;
        }

        if (!clinicId || clinicId.trim() === '') {
            setSnackbarMessage('Clinic ID is required. Please ensure you are logged in with a valid clinic.');
            setSnackbarOpen(true);
            return;
        }

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

            // Close popup after showing success message
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error: any) {
            console.error('Error saving referral doctor:', error);
            // Extract error message from API response
            const errorMessage = error?.response?.data?.error ||
                error?.message ||
                'Failed to save referral doctor. Please try again.';
            setSnackbarMessage(errorMessage);
            setSnackbarOpen(true);
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
                    zIndex: 13000, // Much higher than patient form dialog (11000)
                    pointerEvents: 'auto', // Ensure clicks work
                }}
                onClick={handleClose}
            >
                <div
                    style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        maxWidth: '500px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'auto',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        pointerEvents: 'auto', // Ensure all interactions work
                        position: 'relative', // Ensure proper stacking
                        zIndex: 13001, // Higher than backdrop
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Popup Header */}
                    <div style={{
                        background: 'white',
                        padding: '15px 20px',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                        fontFamily: "'Roboto', sans-serif",
                        color: '#212121',
                        fontSize: '0.9rem'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h3 style={{ margin: 0, color: '#000000', fontSize: '18px', fontWeight: 'bold' }}>
                                Add New Referral Doctor
                            </h3>
                            <button
                                onClick={handleClose}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '5px',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    backgroundColor: '#1976d2',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#1565c0';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#1976d2';
                                }}
                            >
                                <Close fontSize="small" />
                            </button>
                        </div>
                    </div>

                    {/* Popup Content */}
                    <div style={{ padding: '20px', flex: 1 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                    Doctor Name <span style={{ color: '#f44336' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter Doctor Name"
                                    value={formData.doctorName}
                                    onChange={(e) => handleDoctorNameChange(e.target.value)}
                                    style={{
                                        width: '100%',
                                        height: '32px',
                                        padding: '4px 8px',
                                        border: '2px solid #B7B7B7',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        fontFamily: "'Roboto', sans-serif",
                                        fontWeight: '500',
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        transition: 'border-color 0.2s',
                                        pointerEvents: 'auto',
                                        zIndex: 13001,
                                        position: 'relative'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1E88E5';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#B7B7B7';
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                    Doctor Number
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter Doctor Number"
                                    value={formData.doctorMob}
                                    onChange={(e) => handleContactNumberChange(e.target.value)}
                                    style={{
                                        width: '100%',
                                        height: '32px',
                                        padding: '4px 8px',
                                        border: contactError ? '2px solid #f44336' : '2px solid #B7B7B7',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        fontFamily: "'Roboto', sans-serif",
                                        fontWeight: '500',
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        transition: 'border-color 0.2s',
                                        pointerEvents: 'auto',
                                        zIndex: 13001,
                                        position: 'relative'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1E88E5';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    onBlur={(e) => {
                                        validateContactNumber();
                                        if (!contactError) {
                                            e.target.style.borderColor = '#B7B7B7';
                                        } else {
                                            e.target.style.borderColor = '#f44336';
                                        }
                                    }}
                                />
                                {contactError && (
                                    <div style={{
                                        color: '#f44336',
                                        fontSize: '0.75rem',
                                        marginTop: '4px',
                                        fontFamily: "'Roboto', sans-serif"
                                    }}>
                                        {contactError}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                    Doctor Email
                                </label>
                                <input
                                    type="email"
                                    placeholder="Enter Doctor Email"
                                    value={formData.doctorMail}
                                    onChange={(e) => handleEmailChange(e.target.value)}
                                    style={{
                                        width: '100%',
                                        height: '32px',
                                        padding: '4px 8px',
                                        border: emailError ? '2px solid #f44336' : '2px solid #B7B7B7',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        fontFamily: "'Roboto', sans-serif",
                                        fontWeight: '500',
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        transition: 'border-color 0.2s',
                                        pointerEvents: 'auto',
                                        zIndex: 13001,
                                        position: 'relative'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1E88E5';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    onBlur={(e) => {
                                        validateEmail();
                                        if (!emailError) {
                                            e.target.style.borderColor = '#B7B7B7';
                                        } else {
                                            e.target.style.borderColor = '#f44336';
                                        }
                                    }}
                                />
                                {emailError && (
                                    <div style={{
                                        color: '#f44336',
                                        fontSize: '0.75rem',
                                        marginTop: '4px',
                                        fontFamily: "'Roboto', sans-serif"
                                    }}>
                                        {emailError}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                    Remark
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter Remark"
                                    value={formData.remarks}
                                    onChange={(e) => handleInputChange('remarks', e.target.value)}
                                    style={{
                                        width: '100%',
                                        height: '32px',
                                        padding: '4px 8px',
                                        border: '2px solid #B7B7B7',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        fontFamily: "'Roboto', sans-serif",
                                        fontWeight: '500',
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        transition: 'border-color 0.2s',
                                        pointerEvents: 'auto',
                                        zIndex: 13001,
                                        position: 'relative'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1E88E5';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#B7B7B7';
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                Doctor Address
                            </label>
                            <textarea
                                placeholder="Enter Doctor Address"
                                rows={2}
                                maxLength={150}
                                value={formData.doctorAddress}
                                onChange={(e) => handleInputChange('doctorAddress', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '4px 8px',
                                    border: '2px solid #B7B7B7',
                                    borderRadius: '6px',
                                    fontSize: '0.9rem',
                                    fontFamily: "'Roboto', sans-serif",
                                    fontWeight: '500',
                                    backgroundColor: 'white',
                                    outline: 'none',
                                    resize: 'vertical',
                                    transition: 'border-color 0.2s',
                                    pointerEvents: 'auto',
                                    zIndex: 13001,
                                    position: 'relative'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#1E88E5';
                                    e.target.style.boxShadow = 'none';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#B7B7B7';
                                }}
                            />
                        </div>
                    </div>

                    {/* Popup Footer */}
                    <div style={{
                        background: 'transparent',
                        padding: '0 20px 14px',
                        borderBottomLeftRadius: '8px',
                        borderBottomRightRadius: '8px',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '8px'
                    }}>
                        <button
                            onClick={handleClose}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#1976d2',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#1976d2';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#1976d2';
                            }}
                        >
                            Close
                        </button>
                        <button
                            onClick={()=>{
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
                            }}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#1976d2',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#1976d2';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#1976d2';
                            }}
                        >
                            Reset
                        </button>
                        <button
                            onClick={handleSave}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#1976d2',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#1565c0';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#1976d2';
                            }}
                        >
                            Submit
                        </button>
                    </div>
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
                    zIndex: 13001, // Ensure snackbar appears above referral popup (13000)
                    '& .MuiSnackbarContent-root': {
                        backgroundColor: snackbarMessage.includes('successfully') ? '#4caf50' : '#f44336',
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
