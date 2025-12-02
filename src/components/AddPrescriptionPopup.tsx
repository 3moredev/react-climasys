import React, { useEffect, useMemo, useState } from 'react';
import { Close } from '@mui/icons-material';
import { Snackbar } from '@mui/material';
import prescriptionCategoryService, {
    PrescriptionCategory as PrescriptionCategoryApiModel,
} from '../services/prescriptionCategoryService';
import prescriptionSubCategoryService, {
    PrescriptionSubCategory as PrescriptionSubCategoryApiModel,
} from '../services/prescriptionSubCategoryService';

interface AddPrescriptionPopupProps {
    open: boolean;
    onClose: () => void;
    onSave: (prescriptionData: PrescriptionData) => void;
    initialData?: PrescriptionData | null;
    title?: string;
    primaryActionLabel?: string;
    doctorId?: string;
    clinicId?: string;
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
    addToActiveList?: boolean;
    clinicId?: string;
}

const createDefaultPrescription = (): PrescriptionData => ({
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
    priority: '',
    addToActiveList: true
});

const AddPrescriptionPopup: React.FC<AddPrescriptionPopupProps> = ({
    open,
    onClose,
    onSave,
    initialData = null,
    title,
    primaryActionLabel,
    doctorId,
    clinicId,
}) => {
    const [prescriptionData, setPrescriptionData] = useState<PrescriptionData>(createDefaultPrescription());
    
    // Snackbar state management
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [categoryOptions, setCategoryOptions] = useState<string[]>([
        'ALLERGY',
        'ANAESTHETICS',
        'ANTIBIOTICS',
        'ANTIBODIES',
        'CNS',
        'CVS & HA',
        'DERMATOLOGY',
    ]);
    const [subCategoryOptions, setSubCategoryOptions] = useState<string[]>([]);

    const isEditing = useMemo(() => Boolean(initialData), [initialData]);

    useEffect(() => {
        if (open) {
            setPrescriptionData(initialData ? initialData : createDefaultPrescription());
        }
    }, [open, initialData]);

    // Load categories for the selected doctor (for dropdown)
    useEffect(() => {
        const loadCategories = async () => {
            if (!open || !doctorId) return;
            try {
                const apiCategories = await prescriptionCategoryService.getAllCategoriesForDoctor(doctorId);
                if (apiCategories && apiCategories.length > 0) {
                    const opts = apiCategories
                        .map((c: PrescriptionCategoryApiModel) => c.catShortName)
                        .filter((v, idx, arr) => !!v && arr.indexOf(v) === idx);
                    if (opts.length > 0) {
                        setCategoryOptions(opts);
                    }
                }
            } catch (err) {
                // On error, keep existing static options so the UI still works
                console.error('Failed to load prescription categories for popup:', err);
            }
        };
        loadCategories();
    }, [open, doctorId]);

    // Load subcategories for the selected doctor & category (for dropdown)
    useEffect(() => {
        const loadSubCategories = async () => {
            if (!open || !doctorId || !prescriptionData.categoryName.trim()) {
                setSubCategoryOptions([]);
                return;
            }
            try {
                const apiSubCategories = await prescriptionSubCategoryService.getAllSubCategoriesForDoctor(doctorId);
                if (apiSubCategories && apiSubCategories.length > 0) {
                    const options = apiSubCategories
                        .filter(
                            (s: PrescriptionSubCategoryApiModel) =>
                                s.catShortName === prescriptionData.categoryName.trim()
                        )
                        .map((s: PrescriptionSubCategoryApiModel) => s.catsubDescription)
                        .filter((v, idx, arr) => !!v && arr.indexOf(v) === idx);
                    setSubCategoryOptions(options);
                } else {
                    setSubCategoryOptions([]);
                }
            } catch (err) {
                console.error('Failed to load prescription subcategories for popup:', err);
                setSubCategoryOptions([]);
            }
        };
        loadSubCategories();
    }, [open, doctorId, prescriptionData.categoryName]);

    const handleInputChange = (field: keyof PrescriptionData, value: string | boolean) => {
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
            setSnackbarMessage('Medicine Name is required');
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
        
        // Call the parent onSave callback with the prescription data, including clinicId if provided
        onSave({
            ...prescriptionData,
            clinicId: clinicId ?? prescriptionData.clinicId,
        });
        
        // Show success snackbar
        setSnackbarMessage(isEditing ? 'Prescription updated successfully!' : 'Prescription added successfully!');
        setSnackbarOpen(true);
        
        // Reset form
        setPrescriptionData(createDefaultPrescription());
        
        // Close popup after showing success message
        setTimeout(() => {
            onClose();
        }, 1500);
    };

    const handleClose = () => {
        setPrescriptionData(createDefaultPrescription());
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
                    maxWidth: '800px',
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
                            {title ?? (isEditing ? 'Edit Prescription' : 'Add Prescription')}
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        {/* Left Column */}
                        <div>
                            {/* Category Name */}
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                    Category Name<span style={{ color: 'red' }}> *</span>
                                </label>
                                <select
                                    value={prescriptionData.categoryName}
                                    onChange={(e) =>
                                        setPrescriptionData(prev => ({
                                            ...prev,
                                            categoryName: e.target.value,
                                            // Reset subcategory when category changes
                                            subCategoryName: isEditing ? prev.subCategoryName : '',
                                        }))
                                    }
                                    disabled={isEditing}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '13px',
                                        backgroundColor: isEditing ? '#f5f5f5' : 'white',
                                        color: isEditing ? '#777777' : '#333333',
                                        cursor: isEditing ? 'not-allowed' : 'pointer',
                                        outline: 'none',
                                        fontFamily: "'Roboto', sans-serif",
                                    }}
                                >
                                    <option value="">Select Category</option>
                                    {categoryOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* SubCategory Name */}
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                    SubCategory Name<span style={{ color: 'red' }}> *</span>
                                </label>
                                <select
                                    value={prescriptionData.subCategoryName}
                                    onChange={(e) => handleInputChange('subCategoryName', e.target.value)}
                                    disabled={isEditing}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '13px',
                                        backgroundColor: isEditing ? '#f5f5f5' : 'white',
                                        color: isEditing ? '#777777' : '#333333',
                                        cursor: isEditing ? 'not-allowed' : 'pointer',
                                        outline: 'none',
                                        fontFamily: "'Roboto', sans-serif",
                                    }}
                                >
                                    <option value="">Select SubCategory</option>
                                    {subCategoryOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Brand Name */}
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                    Brand Name<span style={{ color: 'red' }}> *</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Brand Name"
                                    value={prescriptionData.brandName}
                                    onChange={(e) => handleInputChange('brandName', e.target.value)}
                                    disabled={isEditing}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '13px',
                                        backgroundColor: isEditing ? '#f5f5f5' : 'white',
                                        color: isEditing ? '#777777' : '#333333',
                                        cursor: isEditing ? 'not-allowed' : 'text',
                                        outline: 'none',
                                        fontFamily: "'Roboto', sans-serif",
                                    }}
                                />
                            </div>

                            {/* Medicine Name */}
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                    Medicine Name<span style={{ color: 'red' }}> *</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Medicine Name"
                                    value={prescriptionData.genericName}
                                    onChange={(e) => handleInputChange('genericName', e.target.value)}
                                    disabled={isEditing}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '13px',
                                        backgroundColor: isEditing ? '#f5f5f5' : 'white',
                                        color: isEditing ? '#777777' : '#333333',
                                        cursor: isEditing ? 'not-allowed' : 'text',
                                        outline: 'none',
                                        fontFamily: "'Roboto', sans-serif",
                                    }}
                                />
                            </div>

                            {/* Marketed By */}
                            <div style={{ marginBottom: '15px' }}>
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
                                        padding: '8px 12px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '13px',
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        fontFamily: "'Roboto', sans-serif"
                                    }}
                                />
                            </div>

                            {/* Instruction */}
                            <div style={{ marginBottom: '15px' }}>
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
                                        padding: '8px 12px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '13px',
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        fontFamily: "'Roboto', sans-serif"
                                    }}
                                />
                                <div style={{ 
                                    marginTop: '6px', 
                                    fontSize: '11px',
                                    color: '#666',
                                    fontStyle: 'italic'
                                }}>
                                    भोजनानंतर / AFTER MEAL, भोजनापूर्वी / BEFORE MEAL
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div>
                            {/* Breakfast */}
                            <div style={{ marginBottom: '15px' }}>
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
                                        padding: '8px 12px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '13px',
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        fontFamily: "'Roboto', sans-serif"
                                    }}
                                />
                            </div>

                            {/* Lunch */}
                            <div style={{ marginBottom: '15px' }}>
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
                                        padding: '8px 12px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '13px',
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        fontFamily: "'Roboto', sans-serif"
                                    }}
                                />
                            </div>

                            {/* Dinner */}
                            <div style={{ marginBottom: '15px' }}>
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
                                        padding: '8px 12px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '13px',
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        fontFamily: "'Roboto', sans-serif"
                                    }}
                                />
                            </div>

                            {/* Days */}
                            <div style={{ marginBottom: '15px' }}>
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
                                        padding: '8px 12px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '13px',
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        fontFamily: "'Roboto', sans-serif"
                                    }}
                                />
                            </div>

                            {/* Priority */}
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                    Priority<span style={{ color: 'red' }}> *</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Priority"
                                    value={prescriptionData.priority}
                                    onChange={(e) => handleInputChange('priority', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '13px',
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        fontFamily: "'Roboto', sans-serif"
                                    }}
                                />
                            </div>

                            {/* Add to active list checkbox */}
                            <div
                                style={{
                                    marginTop: '35px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    height: '40px',
                                }}
                            >
                                <label style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    color: '#333'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={prescriptionData.addToActiveList ?? true}
                                        onChange={(e) => handleInputChange('addToActiveList', e.target.checked)}
                                        style={{
                                            marginRight: '8px',
                                            width: '16px',
                                            height: '16px',
                                            cursor: 'pointer'
                                        }}
                                    />
                                    <span>Add to active list of medicine</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Popup Footer - single Submit button aligned to bottom right */}
                <div
                    style={{
                        background: 'transparent',
                        padding: '0 20px 20px',
                        borderBottomLeftRadius: '8px',
                        borderBottomRightRadius: '8px',
                        display: 'flex',
                        justifyContent: 'flex-end',
                    }}
                >
                    <button
                        onClick={handleSave}
                        style={{
                            padding: '8px 24px',
                            backgroundColor: '#1976d2',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'background-color 0.2s',
                            fontFamily: "'Roboto', sans-serif",
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
