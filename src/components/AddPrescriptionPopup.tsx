import React, { useEffect, useMemo, useState } from 'react';
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
    IconButton,
    Alert,
    Checkbox,
    FormControlLabel,
    MenuItem
} from '@mui/material';
import prescriptionCategoryService, {
    PrescriptionCategory as PrescriptionCategoryApiModel,
} from '../services/prescriptionCategoryService';
import prescriptionSubCategoryService, {
    PrescriptionSubCategory as PrescriptionSubCategoryApiModel,
} from '../services/prescriptionSubCategoryService';
import { validateField } from '../utils/validationUtils';
import { getFieldConfig } from '../utils/fieldValidationConfig';
import ClearableTextField from '../components/ClearableTextField';
import { filterNumericInput } from '../utils/validationUtils';

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
    const [prescriptionData, setPrescriptionData] = useState<PrescriptionData>(() => {
        if (initialData) {
            return {
                ...initialData,
                addToActiveList: initialData.addToActiveList ?? true
            };
        }
        return createDefaultPrescription();
    });

    // Validation state
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Snackbar state management
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

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
        if (!open) {
            // Cleanup on close
            setErrors({});
        }
    }, [open]);

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
        if (typeof value === 'string') {
            const val = value.toUpperCase();

            if (field === 'brandName') {
                const { allowed, error } = validateField('brandName', val, undefined, undefined, 'prescriptionDetails');
                if (allowed) {
                    setPrescriptionData(prev => ({ ...prev, [field]: val }));
                    setErrors(prev => ({ ...prev, brandName: error }));
                }
                return;
            }

            if (field === 'genericName') {
                const { allowed, error } = validateField('genericName', val, undefined, undefined, 'prescriptionDetails');
                if (allowed) {
                    setPrescriptionData(prev => ({ ...prev, [field]: val }));
                    setErrors(prev => ({ ...prev, genericName: error }));
                }
                return;
            }

            if (field === 'instruction') {
                const { allowed, error } = validateField('instruction', val, undefined, undefined, 'prescriptionDetails');
                if (allowed) {
                    setPrescriptionData(prev => ({ ...prev, [field]: val }));
                }
                return;
            }

            if (field === 'marketedBy') {
                const { allowed, error } = validateField('marketedBy', val, undefined, undefined, 'prescriptionDetails');
                if (allowed) {
                    setPrescriptionData(prev => ({ ...prev, [field]: val }));
                }
                setErrors(prev => ({ ...prev, [field]: error }));
                return;
            }

            if (field === 'priority') {
                const { allowed, error } = validateField('priority', val, undefined, undefined, 'prescriptionDetails');
                if (allowed) {
                    setPrescriptionData(prev => ({ ...prev, [field]: val }));
                    setErrors(prev => ({ ...prev, priority: error }));
                }
                return;
            }

            if (field === 'breakfast' || field === 'lunch' || field === 'dinner' || field === 'days') {
                const { allowed, error } = validateField(field, val, undefined, undefined, 'medicine');
                if (allowed) {
                    setPrescriptionData(prev => ({ ...prev, [field]: val }));
                    setErrors(prev => ({ ...prev, [field]: error }));
                }
                return;
            }
        }

        setPrescriptionData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear errors
        if (field === 'categoryName' && errors.categoryName) setErrors(prev => ({ ...prev, categoryName: '' }));
        if (field === 'subCategoryName' && errors.subCategoryName) setErrors(prev => ({ ...prev, subCategoryName: '' }));
    };

    // Restrict certain fields to numeric input only
    const handleNumericChange = (field: keyof PrescriptionData, rawValue: string) => {
        const allowDecimal = field === 'breakfast' || field === 'lunch' || field === 'dinner';
        const cleaned = filterNumericInput(rawValue, allowDecimal);
        handleInputChange(field, cleaned);
    };

    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        let hasError = false;
        const newErrors: Record<string, string> = {
            categoryName: '',
            subCategoryName: '',
            genericName: '',
            brandName: '',
            priority: '',
            breakfast: '',
            lunch: '',
            dinner: '',
            days: '',
            marketedBy: '',
            instruction: ''
        };

        // Validate required fields
        if (!prescriptionData.categoryName.trim()) {
            newErrors.categoryName = 'Category Name is required';
            hasError = true;
        }
        if (!prescriptionData.subCategoryName.trim()) {
            newErrors.subCategoryName = 'SubCategory Name is required';
            hasError = true;
        }
        if (!prescriptionData.genericName.trim()) {
            newErrors.genericName = 'Medicine Name is required';
            hasError = true;
        }
        if (!prescriptionData.brandName.trim()) {
            newErrors.brandName = 'Brand Name is required';
            hasError = true;
        }
        if (!prescriptionData.priority.trim()) {
            newErrors.priority = 'Priority is required';
            hasError = true;
        }

        setErrors(newErrors);

        if (hasError) {
            return;
        }

        try {
            setLoading(true);
            // Call the parent onSave callback with the prescription data and await it
            await onSave({
                ...prescriptionData,
                clinicId: clinicId ?? prescriptionData.clinicId,
            });

            // Show success snackbar
            setSnackbar({
                open: true,
                message: isEditing ? 'Prescription updated successfully!' : 'Prescription added successfully!',
                severity: 'success'
            });

            // Close popup after showing success message
            setTimeout(() => {
                handleClose();
            }, 1000);
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err.message || 'Failed to save prescription',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setPrescriptionData(createDefaultPrescription());
        setErrors({
            categoryName: '',
            subCategoryName: '',
            genericName: '',
            brandName: '',
            priority: '',
            breakfast: '',
            lunch: '',
            dinner: '',
            days: '',
            marketedBy: '',
            instruction: ''
        });
        onClose();
    };

    const handleReset = () => {
        setPrescriptionData(createDefaultPrescription());
        setErrors({
            categoryName: '',
            subCategoryName: '',
            genericName: '',
            brandName: '',
            priority: '',
            breakfast: '',
            lunch: '',
            dinner: '',
            days: '',
            marketedBy: '',
            instruction: ''
        });
        setSubCategoryOptions([]);
    };

    if (!open) return null;

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    style: { borderRadius: '8px', maxWidth: '800px' }
                }}
            >
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" component="div" style={{ fontWeight: 'bold' }} className="mb-0">
                        {title ?? (isEditing ? 'Edit Prescription' : 'Add Prescription')}
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
                        {/* Left Column */}
                        <Grid item xs={12} sm={6}>
                            {/* Category Name */}
                            <Box sx={{ mb: 2 }} className='mb-4'>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                    Category Name <span style={{ color: 'red' }}>*</span>
                                </Typography>
                                <ClearableTextField
                                    disableClearable
                                    select
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    value={prescriptionData.categoryName}
                                    onChange={(val) => {
                                        setPrescriptionData(prev => ({
                                            ...prev,
                                            categoryName: val,
                                            // Reset subcategory when category changes
                                            subCategoryName: isEditing ? prev.subCategoryName : '',
                                        }));
                                        if (errors.categoryName) setErrors(prev => ({ ...prev, categoryName: '' }));
                                    }}
                                    disabled={isEditing}
                                    error={!!errors.categoryName && !errors.categoryName.toLowerCase().includes('exceed')}
                                    helperText={errors.categoryName}
                                    SelectProps={{
                                        displayEmpty: true,
                                        renderValue: (selected: any) => {
                                            if (!selected || selected.length === 0) {
                                                return <em style={{ color: "gray", fontStyle: "normal" }}>Select Category</em>;
                                            }
                                            return selected;
                                        },
                                        MenuProps: { PaperProps: { style: { maxHeight: 300 } } }
                                    }}
                                >
                                    {categoryOptions.map((option) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </ClearableTextField>
                            </Box>

                            {/* SubCategory Name */}
                            <Box sx={{ mb: 2 }} className='mb-4'>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                    SubCategory Name <span style={{ color: 'red' }}>*</span>
                                </Typography>
                                <ClearableTextField
                                    disableClearable
                                    select
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    value={prescriptionData.subCategoryName}
                                    onChange={(val) => handleInputChange('subCategoryName', val)}
                                    disabled={isEditing}
                                    error={!!errors.subCategoryName && !errors.subCategoryName.toLowerCase().includes('exceed')}
                                    helperText={errors.subCategoryName}
                                    SelectProps={{
                                        displayEmpty: true,
                                        renderValue: (selected: any) => {
                                            if (!selected || selected.length === 0) {
                                                return <em style={{ color: "gray", fontStyle: "normal" }}>Select SubCategory</em>;
                                            }
                                            return selected;
                                        },
                                        MenuProps: { PaperProps: { style: { maxHeight: 300 } } }
                                    }}
                                >
                                    {subCategoryOptions.map((option) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </ClearableTextField>
                            </Box>

                            {/* Brand Name */}
                            <Box sx={{ mb: 2 }} className='mb-4'>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                    Brand Name <span style={{ color: 'red' }}>*</span>
                                </Typography>
                                <ClearableTextField
                                    fullWidth
                                    placeholder="Brand Name"
                                    variant="outlined"
                                    size="small"
                                    value={prescriptionData.brandName}
                                    onChange={(val) => handleInputChange('brandName', val)}
                                    disabled={isEditing}
                                    error={!!errors.brandName && !errors.brandName.toLowerCase().includes('exceed')}
                                    helperText={errors.brandName}
                                />
                            </Box>

                            {/* Medicine Name */}
                            <Box sx={{ mb: 2 }} className='mb-4'>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                    Medicine Name <span style={{ color: 'red' }}>*</span>
                                </Typography>
                                <ClearableTextField
                                    fullWidth
                                    placeholder="Medicine Name"
                                    variant="outlined"
                                    size="small"
                                    value={prescriptionData.genericName}
                                    onChange={(val) => handleInputChange('genericName', val)}
                                    disabled={isEditing}
                                    error={!!errors.genericName && !errors.genericName.toLowerCase().includes('exceed')}
                                    helperText={errors.genericName}
                                />
                            </Box>

                            {/* Marketed By */}
                            <Box sx={{ mb: 2 }} className='mb-4'>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                    Marketed By
                                </Typography>
                                <ClearableTextField
                                    fullWidth
                                    placeholder="Marketed By"
                                    variant="outlined"
                                    size="small"
                                    value={prescriptionData.marketedBy}
                                    onChange={(val) => handleInputChange('marketedBy', val)}
                                    error={!!errors.marketedBy && !errors.marketedBy.toLowerCase().includes('exceed')}
                                    helperText={errors.marketedBy}
                                />
                            </Box>

                            {/* Instruction */}
                            <Box sx={{ mb: 2 }} className='mb-4'>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                    Instruction
                                </Typography>
                                <ClearableTextField
                                    fullWidth
                                    placeholder="Instruction"
                                    variant="outlined"
                                    size="small"
                                    value={prescriptionData.instruction}
                                    onChange={(val) => handleInputChange('instruction', val)}
                                    error={!!errors.instruction && !errors.instruction.toLowerCase().includes('exceed')}
                                    helperText={errors.instruction}
                                />
                                <Typography variant="caption" sx={{ color: '#666', fontStyle: 'italic', display: 'block', mt: 0.5 }}>
                                    भोजनानंतर / AFTER MEAL, भोजनापूर्वी / BEFORE MEAL
                                </Typography>
                            </Box>
                        </Grid>

                        {/* Right Column */}
                        <Grid item xs={12} sm={6}>
                            {/* Breakfast */}
                            <Box sx={{ mb: 2 }} className='mb-4'>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                    Breakfast
                                </Typography>
                                <ClearableTextField
                                    fullWidth
                                    placeholder="Breakfast"
                                    variant="outlined"
                                    size="small"
                                    value={prescriptionData.breakfast}
                                    onChange={(val) => handleNumericChange('breakfast', val)}
                                    error={!!errors.breakfast && !errors.breakfast.toLowerCase().includes('exceed')}
                                    helperText={errors.breakfast}
                                />
                            </Box>

                            {/* Lunch */}
                            <Box sx={{ mb: 2 }} className='mb-4'>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                    Lunch
                                </Typography>
                                <ClearableTextField
                                    fullWidth
                                    placeholder="Lunch"
                                    variant="outlined"
                                    size="small"
                                    value={prescriptionData.lunch}
                                    onChange={(val) => handleNumericChange('lunch', val)}
                                    error={!!errors.lunch && !errors.lunch.toLowerCase().includes('exceed')}
                                    helperText={errors.lunch}
                                />
                            </Box>

                            {/* Dinner */}
                            <Box sx={{ mb: 2 }} className='mb-4'>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                    Dinner
                                </Typography>
                                <ClearableTextField
                                    fullWidth
                                    placeholder="Dinner"
                                    variant="outlined"
                                    size="small"
                                    value={prescriptionData.dinner}
                                    onChange={(val) => handleNumericChange('dinner', val)}
                                    error={!!errors.dinner && !errors.dinner.toLowerCase().includes('exceed')}
                                    helperText={errors.dinner}
                                />
                            </Box>

                            {/* Days */}
                            <Box sx={{ mb: 2 }} className='mb-4'>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                    Days
                                </Typography>
                                <ClearableTextField
                                    fullWidth
                                    placeholder="Days"
                                    variant="outlined"
                                    size="small"
                                    value={prescriptionData.days}
                                    onChange={(val) => handleNumericChange('days', val)}
                                    error={!!errors.days && !errors.days.toLowerCase().includes('exceed')}
                                    helperText={errors.days}
                                />
                            </Box>

                            {/* Priority */}
                            <Box sx={{ mb: 2 }} className='mb-4'>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                    <span>Priority <span style={{ color: 'red' }}>*</span></span>
                                </Typography>
                                <ClearableTextField
                                    fullWidth
                                    placeholder="Priority"
                                    variant="outlined"
                                    size="small"
                                    value={prescriptionData.priority}
                                    onChange={(val) => handleNumericChange('priority', val)}
                                    error={!!errors.priority && !errors.priority.toLowerCase().includes('exceed')}
                                    helperText={errors.priority}
                                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                                />
                            </Box>

                            {/* Add to active list checkbox */}
                            <Box sx={{ mt: 3 }}>
                                <FormControlLabel
                                    className='pt-3'
                                    control={
                                        <Checkbox
                                            checked={prescriptionData.addToActiveList !== undefined ? prescriptionData.addToActiveList : true}
                                            onChange={(e) => handleInputChange('addToActiveList', e.target.checked)}
                                            size="small"
                                        />
                                    }
                                    label={<Typography variant="body2" sx={{ fontWeight: 'bold', color: '#333' }}>Add to active list of medicine</Typography>}
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
                            backgroundColor: '#1976d2',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: '#1565c0',
                            }
                        }}
                    >
                        Close
                    </Button>
                    <Button
                        onClick={handleReset}
                        variant="contained"
                        sx={{
                            backgroundColor: '#1976d2',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: '#1565c0',
                            }
                        }}
                    >
                        Reset
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={loading}
                        sx={{
                            backgroundColor: '#1976d2',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: '#1565c0',
                            }
                        }}
                    >
                        {loading ? 'Saving...' : 'Submit'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Success/Error Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={2000}
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

export default AddPrescriptionPopup;
export type { PrescriptionData };

