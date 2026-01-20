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

    // Validation state
    const [errors, setErrors] = useState<{
        categoryName: string;
        subCategoryName: string;
        genericName: string;
        brandName: string;
        priority: string;
    }>({
        categoryName: '',
        subCategoryName: '',
        genericName: '',
        brandName: '',
        priority: ''
    });

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
        if (open) {
            if (initialData) {
                // Ensure addToActiveList is properly set (default to true if undefined)
                setPrescriptionData({
                    ...initialData,
                    addToActiveList: initialData.addToActiveList ?? true
                });
            } else {
                setPrescriptionData(createDefaultPrescription());
            }
            // Reset errors on open
            setErrors({
                categoryName: '',
                subCategoryName: '',
                genericName: '',
                brandName: '',
                priority: ''
            });
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

        // Clear errors
        if (field === 'categoryName' && errors.categoryName) setErrors(prev => ({ ...prev, categoryName: '' }));
        if (field === 'subCategoryName' && errors.subCategoryName) setErrors(prev => ({ ...prev, subCategoryName: '' }));
        if (field === 'genericName' && errors.genericName) setErrors(prev => ({ ...prev, genericName: '' }));
        if (field === 'brandName' && errors.brandName) setErrors(prev => ({ ...prev, brandName: '' }));
        if (field === 'priority' && errors.priority) setErrors(prev => ({ ...prev, priority: '' }));
    };

    // Restrict certain fields to numeric input only
    const handleNumericChange = (field: keyof PrescriptionData, rawValue: string) => {
        const cleaned = rawValue.replace(/\D/g, '');
        handleInputChange(field, cleaned);
    };

    const handleSave = () => {
        let hasError = false;
        const newErrors = {
            categoryName: '',
            subCategoryName: '',
            genericName: '',
            brandName: '',
            priority: ''
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

        // Call the parent onSave callback with the prescription data
        onSave({
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
        }, 1500);
    };

    const handleClose = () => {
        setPrescriptionData(createDefaultPrescription());
        setErrors({
            categoryName: '',
            subCategoryName: '',
            genericName: '',
            brandName: '',
            priority: ''
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
            priority: ''
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
                                <TextField
                                    select
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    value={prescriptionData.categoryName}
                                    onChange={(e) => {
                                        setPrescriptionData(prev => ({
                                            ...prev,
                                            categoryName: e.target.value,
                                            // Reset subcategory when category changes
                                            subCategoryName: isEditing ? prev.subCategoryName : '',
                                        }));
                                        if (errors.categoryName) setErrors(prev => ({ ...prev, categoryName: '' }));
                                    }}
                                    disabled={isEditing}
                                    error={!!errors.categoryName}
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
                                </TextField>
                            </Box>

                            {/* SubCategory Name */}
                            <Box sx={{ mb: 2 }} className='mb-4'>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                    SubCategory Name <span style={{ color: 'red' }}>*</span>
                                </Typography>
                                <TextField
                                    select
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    value={prescriptionData.subCategoryName}
                                    onChange={(e) => handleInputChange('subCategoryName', e.target.value)}
                                    disabled={isEditing}
                                    error={!!errors.subCategoryName}
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
                                </TextField>
                            </Box>

                            {/* Brand Name */}
                            <Box sx={{ mb: 2 }} className='mb-4'>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                    Brand Name <span style={{ color: 'red' }}>*</span>
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Brand Name"
                                    variant="outlined"
                                    size="small"
                                    value={prescriptionData.brandName}
                                    onChange={(e) => handleInputChange('brandName', e.target.value)}
                                    disabled={isEditing}
                                    error={!!errors.brandName}
                                    helperText={errors.brandName}
                                />
                            </Box>

                            {/* Medicine Name */}
                            <Box sx={{ mb: 2 }} className='mb-4'>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                    Medicine Name <span style={{ color: 'red' }}>*</span>
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Medicine Name"
                                    variant="outlined"
                                    size="small"
                                    value={prescriptionData.genericName}
                                    onChange={(e) => handleInputChange('genericName', e.target.value)}
                                    disabled={isEditing}
                                    error={!!errors.genericName}
                                    helperText={errors.genericName}
                                />
                            </Box>

                            {/* Marketed By */}
                            <Box sx={{ mb: 2 }} className='mb-4'>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                    Marketed By
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Marketed By"
                                    variant="outlined"
                                    size="small"
                                    value={prescriptionData.marketedBy}
                                    onChange={(e) => handleInputChange('marketedBy', e.target.value)}
                                />
                            </Box>

                            {/* Instruction */}
                            <Box sx={{ mb: 2 }} className='mb-4'>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                    Instruction
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Instruction"
                                    variant="outlined"
                                    size="small"
                                    value={prescriptionData.instruction}
                                    onChange={(e) => handleInputChange('instruction', e.target.value)}
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
                                <TextField
                                    fullWidth
                                    placeholder="Breakfast"
                                    variant="outlined"
                                    size="small"
                                    value={prescriptionData.breakfast}
                                    onChange={(e) => handleNumericChange('breakfast', e.target.value)}
                                />
                            </Box>

                            {/* Lunch */}
                            <Box sx={{ mb: 2 }} className='mb-4'>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                    Lunch
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Lunch"
                                    variant="outlined"
                                    size="small"
                                    value={prescriptionData.lunch}
                                    onChange={(e) => handleNumericChange('lunch', e.target.value)}
                                />
                            </Box>

                            {/* Dinner */}
                            <Box sx={{ mb: 2 }} className='mb-4'>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                    Dinner
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Dinner"
                                    variant="outlined"
                                    size="small"
                                    value={prescriptionData.dinner}
                                    onChange={(e) => handleNumericChange('dinner', e.target.value)}
                                />
                            </Box>

                            {/* Days */}
                            <Box sx={{ mb: 2 }} className='mb-4'>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                    Days
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Days"
                                    variant="outlined"
                                    size="small"
                                    value={prescriptionData.days}
                                    onChange={(e) => handleNumericChange('days', e.target.value)}
                                />
                            </Box>

                            {/* Priority */}
                            <Box sx={{ mb: 2 }} className='mb-4'>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                    Priority <span style={{ color: 'red' }}>*</span>
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Priority"
                                    variant="outlined"
                                    size="small"
                                    value={prescriptionData.priority}
                                    onChange={(e) => handleNumericChange('priority', e.target.value)}
                                    error={!!errors.priority}
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
                        sx={{
                            backgroundColor: '#1976d2',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: '#1565c0',
                            }
                        }}
                    >
                        Submit
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

