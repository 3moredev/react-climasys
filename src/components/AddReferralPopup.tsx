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

    const handleInputChange = (field: keyof ReferralData, value: string | number | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        if (!formData.doctorName.trim()) {
            setSnackbarMessage('Doctor Name is required');
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
                            Add New Referral
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
                                Doctor Name *
                            </label>
                            <input
                                type="text"
                                placeholder="Enter doctor name"
                                value={formData.doctorName}
                                onChange={(e) => handleInputChange('doctorName', e.target.value)}
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
                                placeholder="Enter contact number"
                                value={formData.doctorMob}
                                onChange={(e) => handleInputChange('doctorMob', e.target.value)}
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                Doctor Email
                            </label>
                            <input
                                type="email"
                                placeholder="Enter doctor email"
                                value={formData.doctorMail}
                                onChange={(e) => handleInputChange('doctorMail', e.target.value)}
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
                                Remark
                            </label>
                            <input
                                type="text"
                                placeholder="Enter remark"
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
                            placeholder="Enter doctor address"
                            rows={2}
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
                            backgroundColor: '#9e9e9e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#757575';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#9e9e9e';
                        }}
                    >
                        Cancel
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
                        Save
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
