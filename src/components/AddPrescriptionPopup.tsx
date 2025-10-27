import React, { useState } from 'react';
import { Close } from '@mui/icons-material';
import { Snackbar } from '@mui/material';

interface AddPrescriptionPopupProps {
    open: boolean;
    onClose: () => void;
    onSave: (prescriptionData: PrescriptionData) => void;
}

interface PrescriptionData {
    categoryName: string;
    subCategoryName: string;
    genericName: string;
    brandName: string;
    marketedBy: string;
    instruction: string;
    breakfast: string;
    lunch: string;
    dinner: string;
    days: string;
    priority: string;
}

const AddPrescriptionPopup: React.FC<AddPrescriptionPopupProps> = ({ open, onClose, onSave }) => {
    const [prescriptionData, setPrescriptionData] = useState<PrescriptionData>({
        categoryName: '',
        subCategoryName: '',
        genericName: '',
        brandName: '',
        marketedBy: '',
        instruction: '',
        breakfast: '',
        lunch: '',
        dinner: '',
        days: '',
        priority: ''
    });
    
    // Snackbar state management
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const handleInputChange = (field: keyof PrescriptionData, value: string) => {
        setPrescriptionData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = () => {
        // Validate required fields
        if (!prescriptionData.categoryName.trim()) {
            setSnackbarMessage('Category Name is required');
            setSnackbarOpen(true);
            return;
        }
        if (!prescriptionData.subCategoryName.trim()) {
            setSnackbarMessage('SubCategory Name is required');
            setSnackbarOpen(true);
            return;
        }
        if (!prescriptionData.genericName.trim()) {
            setSnackbarMessage('Generic Name is required');
            setSnackbarOpen(true);
            return;
        }
        if (!prescriptionData.brandName.trim()) {
            setSnackbarMessage('Brand Name is required');
            setSnackbarOpen(true);
            return;
        }
        if (!prescriptionData.priority.trim()) {
            setSnackbarMessage('Priority is required');
            setSnackbarOpen(true);
            return;
        }
        
        // Call the parent onSave callback with the prescription data
        onSave(prescriptionData);
        
        // Show success snackbar
        setSnackbarMessage('Prescription added successfully!');
        setSnackbarOpen(true);
        
        // Reset form
        setPrescriptionData({
            categoryName: '',
            subCategoryName: '',
            genericName: '',
            brandName: '',
            marketedBy: '',
            instruction: '',
            breakfast: '',
            lunch: '',
            dinner: '',
            days: '',
            priority: ''
        });
        
        // Close popup after showing success message
        setTimeout(() => {
            onClose();
        }, 1500);
    };

    const handleClose = () => {
        setPrescriptionData({
            categoryName: '',
            subCategoryName: '',
            genericName: '',
            brandName: '',
            marketedBy: '',
            instruction: '',
            breakfast: '',
            lunch: '',
            dinner: '',
            days: '',
            priority: ''
        });
        onClose();
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
                    maxWidth: '600px',
                    width: '90%',
                    maxHeight: '90vh',
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
                            Add Prescription
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
                    {/* Category Name and SubCategory Name - Two fields in one row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                Category Name *
                            </label>
                            <select
                                value={prescriptionData.categoryName}
                                onChange={(e) => handleInputChange('categoryName', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '6px 10px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '13px',
                                    backgroundColor: 'white',
                                    outline: 'none'
                                }}
                            >
                                <option value="">--Select Category--</option>
                                <option value="Antibiotics">Antibiotics</option>
                                <option value="Pain Relief">Pain Relief</option>
                                <option value="Cardiovascular">Cardiovascular</option>
                                <option value="Diabetes">Diabetes</option>
                                <option value="Respiratory">Respiratory</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                SubCategory Name *
                            </label>
                            <input
                                type="text"
                                placeholder="SubCategory Name"
                                value={prescriptionData.subCategoryName}
                                onChange={(e) => handleInputChange('subCategoryName', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '6px 10px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '13px',
                                    backgroundColor: 'white',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    {/* Generic Name and Brand Name - Two fields in one row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                Generic Name *
                            </label>
                            <input
                                type="text"
                                placeholder="Generic Name"
                                value={prescriptionData.genericName}
                                onChange={(e) => handleInputChange('genericName', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '6px 10px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '13px',
                                    backgroundColor: 'white',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                Brand Name *
                            </label>
                            <input
                                type="text"
                                placeholder="Brand Name"
                                value={prescriptionData.brandName}
                                onChange={(e) => handleInputChange('brandName', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '6px 10px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '13px',
                                    backgroundColor: 'white',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    {/* Marketed By and Priority - Two fields in one row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                Marketed By
                            </label>
                            <input
                                type="text"
                                placeholder="Marketed By"
                                value={prescriptionData.marketedBy}
                                onChange={(e) => handleInputChange('marketedBy', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '6px 10px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '13px',
                                    backgroundColor: 'white',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                Priority *
                            </label>
                            <input
                                type="text"
                                placeholder="Priority"
                                value={prescriptionData.priority}
                                onChange={(e) => handleInputChange('priority', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '6px 10px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '13px',
                                    backgroundColor: 'white',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    {/* Instruction and Days - Two fields in one row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                Instruction
                            </label>
                            <input
                                type="text"
                                placeholder="Instruction"
                                value={prescriptionData.instruction}
                                onChange={(e) => handleInputChange('instruction', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '6px 10px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '13px',
                                    backgroundColor: 'white',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                Days
                            </label>
                            <input
                                type="text"
                                placeholder="Days"
                                value={prescriptionData.days}
                                onChange={(e) => handleInputChange('days', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '6px 10px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '13px',
                                    backgroundColor: 'white',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    {/* Meal Times - Three fields in one row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                Breakfast
                            </label>
                            <input
                                type="text"
                                placeholder="Breakfast"
                                value={prescriptionData.breakfast}
                                onChange={(e) => handleInputChange('breakfast', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '6px 10px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '13px',
                                    backgroundColor: 'white',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                Lunch
                            </label>
                            <input
                                type="text"
                                placeholder="Lunch"
                                value={prescriptionData.lunch}
                                onChange={(e) => handleInputChange('lunch', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '6px 10px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '13px',
                                    backgroundColor: 'white',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                Dinner
                            </label>
                            <input
                                type="text"
                                placeholder="Dinner"
                                value={prescriptionData.dinner}
                                onChange={(e) => handleInputChange('dinner', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '6px 10px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '13px',
                                    backgroundColor: 'white',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    {/* Instruction Text */}
                    <div style={{ 
                        marginBottom: '15px', 
                        padding: '10px', 
                        backgroundColor: '#f5f5f5', 
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: '#666',
                        textAlign: 'center'
                    }}>
                        खाण्यानंतर / AFTER MEAL, खाण्यापूर्वी / BEFORE MEAL
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

export default AddPrescriptionPopup;
export type { PrescriptionData };
