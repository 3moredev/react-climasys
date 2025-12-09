import React, { useState } from 'react';
import { Close } from '@mui/icons-material';
import { Snackbar } from '@mui/material';
import medicineService, { MedicineMaster } from '../services/medicineService';
import { sessionService } from '../services/sessionService';

export interface MedicineData {
    shortDescription: string;
    medicineName: string;
    priority: string;    
    breakfast: string;
    lunch: string;
    dinner: string;
    days: string;
    instruction: string;
    addToActiveList: boolean;
}

interface AddMedicinePopupProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: MedicineData) => void;
    editData?: MedicineData;
}

const AddMedicinePopup: React.FC<AddMedicinePopupProps> = ({ open, onClose, onSave, editData }) => {
    const [shortDescription, setShortDescription] = useState('');
    const [medicineName, setMedicineName] = useState('');
    const [priority, setPriority] = useState('');
    const [breakfast, setBreakfast] = useState('');
    const [lunch, setLunch] = useState('');
    const [dinner, setDinner] = useState('');
    const [days, setDays] = useState('');
    const [instruction, setInstruction] = useState('');
    const [addToActiveList, setAddToActiveList] = useState(true);
    
    // Snackbar state management
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Populate form when editData changes or popup opens
    React.useEffect(() => {
        if (open && editData) {
            setShortDescription(editData.shortDescription || '');
            setMedicineName(editData.medicineName || '');
            setPriority(editData.priority || '');
            setBreakfast(editData.breakfast || '');
            setLunch(editData.lunch || '');
            setDinner(editData.dinner || '');
            setDays(editData.days || '');
            setInstruction(editData.instruction || '');
            setAddToActiveList(editData.addToActiveList !== undefined ? editData.addToActiveList : true);
        } else if (open && !editData) {
            // Reset form for new medicine
            setShortDescription('');
            setMedicineName('');
            setPriority('');
            setBreakfast('');
            setLunch('');
            setDinner('');
            setDays('');
            setInstruction('');
            setAddToActiveList(true);
        }
    }, [open, editData]);

    const handleSubmit = async () => {
        if (!shortDescription.trim()) {
            setSnackbarMessage('Short Description is required');
            setSnackbarOpen(true);
            return;
        }
        
        if (!medicineName.trim()) {
            setSnackbarMessage('Medicine Name is required');
            setSnackbarOpen(true);
            return;
        }

        try {
            setLoading(true);
            
            // Hardcoded values as requested
            const doctorId = "DR-00010";
            const clinicId = "CL-00001";
            
            // Get user name from session for createdByName/modifiedByName
            let userName = "System";
            try {
                const sessionResult = await sessionService.getSessionInfo();
                if (sessionResult.success && sessionResult.data) {
                    userName = sessionResult.data.firstName || sessionResult.data.loginId || "System";
                }
            } catch (err) {
                console.warn('Could not get session info for user name:', err);
            }

            const isEditMode = !!editData;
            const originalShortDescription = editData?.shortDescription || '';
            
            // Normalize text fields to uppercase before saving
            const newShortDescription = shortDescription.trim().toUpperCase();
            const newMedicineName = medicineName.trim().toUpperCase();
            
            // Determine priority (optional; default to "9" if not provided)
            const priorityValue = priority.trim() || '9';

            // Create/Update medicine data
            const medicineData: MedicineMaster = {
                shortDescription: newShortDescription,
                medicineDescription: newMedicineName,
                doctorId: doctorId,
                clinicId: clinicId,
                priorityValue: parseInt(priorityValue),
                morning: breakfast.trim() ? parseFloat(breakfast.trim()) : null,
                afternoon: lunch.trim() ? parseFloat(lunch.trim()) : null,
                night: dinner.trim() ? parseFloat(dinner.trim()) : null,
                noOfDays: days.trim() ? parseInt(days.trim()) : null,
                instruction: instruction.trim().toUpperCase() || null,
                active: addToActiveList,
                modifiedByName: userName
            };

            if (isEditMode) {
                const shortDescriptionChanged = originalShortDescription !== newShortDescription;
                
                if (shortDescriptionChanged) {
                    // If short description changed, we need to delete old and create new
                    // because short description is part of the composite key
                    try {
                        // Delete old medicine
                        await medicineService.deleteMedicine(doctorId, clinicId, originalShortDescription);
                    } catch (err) {
                        console.warn('Error deleting old medicine (may not exist):', err);
                    }
                    
                    // Create new medicine with new short description
                    medicineData.createdByName = userName;
                    await medicineService.createMedicine(medicineData);
                } else {
                    // Update existing medicine (short description didn't change)
                    await medicineService.updateMedicine(medicineData);
                }
            } else {
                // Create new medicine
                medicineData.createdByName = userName;
                await medicineService.createMedicine(medicineData);
            }

            // Show success snackbar
            setSnackbarMessage(isEditMode ? 'Medicine updated successfully!' : 'Medicine created successfully!');
            setSnackbarOpen(true);
            
            // Call parent onSave callback for UI update
            onSave({
                shortDescription: newShortDescription,
                medicineName: newMedicineName,
                priority: priorityValue,
                breakfast: breakfast.trim(),
                lunch: lunch.trim(),
                dinner: dinner.trim(),
                days: days.trim(),
                instruction: instruction.trim().toUpperCase(),
                addToActiveList
            });
            
            // Reset form
            setShortDescription('');
            setMedicineName('');
            setPriority('');
            setBreakfast('');
            setLunch('');
            setDinner('');
            setDays('');
            setInstruction('');
            setAddToActiveList(true);
            
            // Close popup after showing success message
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error: any) {
            console.error('Error saving medicine:', error);
            setSnackbarMessage(error.message || 'Failed to save medicine');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setShortDescription('');
        setMedicineName('');
        setPriority('');
        setBreakfast('');
        setLunch('');
        setDinner('');
        setDays('');
        setInstruction('');
        setAddToActiveList(true);
        onClose();
    };

    const handleCancel = () => {
        handleClose();
    };

    const handleBack = () => {
        handleClose();
    };

    // Numeric-only helper for dose/priority inputs
    const handleNumericChange = (setter: (v: string) => void, rawValue: string) => {
        const cleaned = rawValue.replace(/\D/g, '');
        setter(cleaned);
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
                    maxWidth: '700px',
                    width: '90%',
                    maxHeight: '85vh',
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
                    fontFamily: "'Roboto', sans-serif"
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h3 style={{ margin: 0, color: '#000000', fontSize: '18px', fontWeight: 'bold' }}>
                            {editData ? 'Edit Medicine' : 'Add Medicine'}
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
                            <Close fontSize="small" style={{ color: '#fff' }} />
                        </button>
                    </div>
                </div>

                {/* Popup Content */}
                <div style={{ padding: '20px', flex: 1 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        {/* Left Column */}
                        <div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                    Short Description <span style={{ color: '#d32f2f' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Medicine Short Description"
                                    value={shortDescription}
                                    onChange={(e) => setShortDescription(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #B7B7B7',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontFamily: "'Roboto', sans-serif",
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                    Medicine Name <span style={{ color: '#d32f2f' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Medicine Name"
                                    value={medicineName}
                                    onChange={(e) => setMedicineName(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #B7B7B7',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontFamily: "'Roboto', sans-serif",
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        boxSizing: 'border-box'
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
                                    onChange={(e) => handleNumericChange(setPriority, e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #B7B7B7',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontFamily: "'Roboto', sans-serif",
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                    Breakfast
                                </label>
                                <input
                                    type="text"
                                    placeholder="Breakfast"
                                    value={breakfast}
                                    onChange={(e) => handleNumericChange(setBreakfast, e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #B7B7B7',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontFamily: "'Roboto', sans-serif",
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={addToActiveList}
                                        onChange={(e) => setAddToActiveList(e.target.checked)}
                                        style={{
                                            width: '18px',
                                            height: '18px',
                                            cursor: 'pointer'
                                        }}
                                    />
                                    <span style={{ fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                        Add to active list of medicine
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                    Lunch
                                </label>
                                <input
                                    type="text"
                                    placeholder="Lunch"
                                    value={lunch}
                                    onChange={(e) => handleNumericChange(setLunch, e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #B7B7B7',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontFamily: "'Roboto', sans-serif",
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                    Dinner
                                </label>
                                <input
                                    type="text"
                                    placeholder="Dinner"
                                    value={dinner}
                                    onChange={(e) => handleNumericChange(setDinner, e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #B7B7B7',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontFamily: "'Roboto', sans-serif",
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                    Days
                                </label>
                                <input
                                    type="text"
                                    placeholder="Days"
                                    value={days}
                                    onChange={(e) => handleNumericChange(setDays, e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #B7B7B7',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontFamily: "'Roboto', sans-serif",
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                    Instruction
                                </label>
                                <input
                                    type="text"
                                    placeholder="Instruction"
                                    value={instruction}
                                    onChange={(e) => setInstruction(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #B7B7B7',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontFamily: "'Roboto', sans-serif",
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                                <div style={{ fontSize: '12px', color: '#666', fontFamily: "'Roboto', sans-serif" }}>
                                    भोजनानंतर / AFTER MEAL, भोजनापूर्वी / BEFORE MEAL
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Popup Footer - Submit / Cancel / Back */}
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
                        disabled={loading}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: loading ? '#ccc' : '#1976d2',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '12px',
                            fontFamily: "'Roboto', sans-serif",
                            fontWeight: '500',
                            transition: 'background-color 0.2s',
                            whiteSpace: 'nowrap',
                            opacity: loading ? 0.6 : 1
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.currentTarget.style.backgroundColor = '#1565c0';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!loading) {
                                e.currentTarget.style.backgroundColor = '#1976d2';
                            }
                        }}
                    >
                        {loading ? 'Saving...' : 'Submit'}
                    </button>
                    <button
                        onClick={handleCancel}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#1976d2',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontFamily: "'Roboto', sans-serif",
                            fontWeight: '500',
                            transition: 'background-color 0.2s',
                            whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#1565c0';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#1976d2';
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleBack}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#1976d2',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontFamily: "'Roboto', sans-serif",
                            fontWeight: '500',
                            transition: 'background-color 0.2s',
                            whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#1565c0';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#1976d2';
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

export default AddMedicinePopup;
