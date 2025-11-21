import React, { useState, useEffect } from 'react';
import { Close } from '@mui/icons-material';
import { Snackbar } from '@mui/material';

interface AddLabTestPopupProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: {
        labTestName: string;
        priority: string;
    }) => void;
    editData?: {
        labTestName: string;
        priority: number;
    } | null;
}

const AddLabTestPopup: React.FC<AddLabTestPopupProps> = ({ open, onClose, onSave, editData }) => {
    const [labTestName, setLabTestName] = useState('');
    const [priority, setPriority] = useState('');
    
    // Snackbar state management
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // Populate form when editData changes
    useEffect(() => {
        if (editData) {
            setLabTestName(editData.labTestName || '');
            setPriority(editData.priority?.toString() || '');
        } else {
            // Reset form when not in edit mode
            setLabTestName('');
            setPriority('');
        }
    }, [editData, open]);

    const handleSubmit = () => {
        if (!labTestName.trim()) {
            setSnackbarMessage('Lab Test Name is required');
            setSnackbarOpen(true);
            return;
        }
        
        // Call the parent onSave callback with all form data
        onSave({
            labTestName: labTestName.trim(),
            priority: priority.trim(),
        });
        
        // Show success snackbar
        setSnackbarMessage(editData ? 'Lab test updated successfully!' : 'Lab test added successfully!');
        setSnackbarOpen(true);
        
        // Reset form
        setLabTestName('');
        setPriority('');
        
        // Close popup after showing success message
        setTimeout(() => {
            onClose();
        }, 1500);
    };

    const handleClose = () => {
        setLabTestName('');
        setPriority('');
        onClose();
    };

    const handleBack = () => {
        handleClose();
    };

    const handleCancel = () => {
        handleClose();
    };

    if (!open) return null;

    return (
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
                zIndex: 10001,
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
                            {editData ? 'Edit Lab Test' : 'Add Lab Test'}
                        </h3>
                        <button
                            onClick={handleClose}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '5px',
                                borderRadius: '50%',
                                color: '#fff',
                                backgroundColor: 'rgb(0, 123, 255)',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgb(0, 100, 200)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgb(0, 123, 255)';
                            }}
                        >
                            <Close fontSize="small" />
                        </button>
                    </div>
                </div>

                {/* Popup Content */}
                <div style={{ padding: '20px', flex: 1 }}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                            Lab Test Name *
                        </label>
                        <input
                            type="text"
                            placeholder="Lab Test Name"
                            value={labTestName}
                            onChange={(e) => setLabTestName(e.target.value)}
                            disabled={!!editData}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #ced4da',
                                borderRadius: '4px',
                                fontSize: '0.9rem',
                                backgroundColor: editData ? '#e9ecef' : 'white',
                                outline: 'none',
                                boxSizing: 'border-box',
                                cursor: editData ? 'not-allowed' : 'text'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                            Priority
                        </label>
                        <input
                            type="text"
                            placeholder="Priority"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #ced4da',
                                borderRadius: '4px',
                                fontSize: '0.9rem',
                                backgroundColor: 'white',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                </div>

                {/* Popup Footer */}
                <div style={{
                    background: 'transparent',
                    padding: '0 20px 20px',
                    borderBottomLeftRadius: '8px',
                    borderBottomRightRadius: '8px',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '8px'
                }}>
                    <button
                        onClick={handleSubmit}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: 'rgb(0, 123, 255)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            transition: 'background-color 0.2s',
                            whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgb(0, 100, 200)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgb(0, 123, 255)';
                        }}
                    >
                        Submit
                    </button>
                    <button
                        onClick={handleCancel}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: 'rgb(0, 123, 255)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            transition: 'background-color 0.2s',
                            whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgb(0, 100, 200)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgb(0, 123, 255)';
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleBack}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: 'rgb(0, 123, 255)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            transition: 'background-color 0.2s',
                            whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgb(0, 100, 200)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgb(0, 123, 255)';
                        }}
                    >
                        Back
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

export default AddLabTestPopup;

