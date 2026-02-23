import React, { useState } from 'react';
import { Close } from '@mui/icons-material';
import {
    Snackbar,
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
    FormControlLabel
} from '@mui/material';
import medicineService, { MedicineMaster } from '../services/medicineService';
import { sessionService } from '../services/sessionService';
import ClearableTextField from '../components/ClearableTextField';
import { filterNumericInput, validateField } from '../utils/validationUtils';

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
    onError?: (message: string) => void;
    editData?: MedicineData;
    doctorId?: string;
    clinicId?: string;
}

const AddMedicinePopup: React.FC<AddMedicinePopupProps> = ({ open, onClose, onSave, onError, editData, doctorId, clinicId }) => {
    const [shortDescription, setShortDescription] = useState('');
    const [medicineName, setMedicineName] = useState('');
    const [priority, setPriority] = useState('');
    const [breakfast, setBreakfast] = useState('');
    const [lunch, setLunch] = useState('');
    const [dinner, setDinner] = useState('');
    const [days, setDays] = useState('');
    const [instruction, setInstruction] = useState('');
    const [addToActiveList, setAddToActiveList] = useState(true);

    // Validation state
    // Validation state
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Snackbar state management
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
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
        setErrors({});
    }, [open, editData]);

    const handleInputChange = (setter: (v: string) => void, field: string, value: string) => {
        const { allowed, error } = validateField(field, value, undefined, undefined, 'medicine');
        if (allowed) {
            setter(value);
        }
        setErrors(prev => ({ ...prev, [field]: error }));
    };

    // Numeric-only helper for dose/priority inputs
    const handleNumericChange = (setter: (v: string) => void, field: string, rawValue: string) => {
        const cleaned = filterNumericInput(rawValue, true); // Allow decimal for doses
        const { allowed, error } = validateField(field, cleaned, undefined, undefined, 'medicine');
        if (allowed) {
            setter(cleaned);
        }
        setErrors(prev => ({ ...prev, [field]: error }));
    };


    const showSnackbar = (message: string, severity: 'success' | 'error' = 'error') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleSubmit = async () => {
        const newErrors = { shortDescription: '', medicineName: '', priority: '' };
        let hasError = false;

        if (!shortDescription.trim()) {
            newErrors.shortDescription = 'Short Description is required';
            hasError = true;
        }

        if (!medicineName.trim()) {
            newErrors.medicineName = 'Medicine Name is required';
            hasError = true;
        }

        if (!priority.trim()) {
            newErrors.priority = 'Priority is required';
            hasError = true;
        }

        setErrors(newErrors);

        if (hasError) return;

        try {
            setLoading(true);

            // Get doctorId and clinicId from props or session
            let finalDoctorId = doctorId;
            let finalClinicId = clinicId;
            let userName = "System";

            try {
                const sessionResult = await sessionService.getSessionInfo();
                if (sessionResult.success && sessionResult.data) {
                    // Use session data if props are not provided
                    if (!finalDoctorId) {
                        finalDoctorId = sessionResult.data.doctorId;
                    }
                    if (!finalClinicId) {
                        finalClinicId = sessionResult.data.clinicId;
                    }
                    userName = sessionResult.data.firstName || sessionResult.data.loginId || "System";
                }
            } catch (err) {
                console.warn('Could not get session info:', err);
            }

            // Validate that we have required IDs
            if (!finalDoctorId || !finalClinicId) {
                showSnackbar('Doctor ID and Clinic ID are required. Please ensure you are logged in.', 'error');
                setLoading(false);
                return;
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
                doctorId: finalDoctorId,
                clinicId: finalClinicId,
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
                        await medicineService.deleteMedicine(finalDoctorId, finalClinicId, originalShortDescription);
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

            showSnackbar(isEditMode ? 'Medicine updated successfully!' : 'Medicine added successfully!', 'success');

            setTimeout(() => {
                handleClose();
            }, 1000);

        } catch (error: any) {
            console.error('Error saving medicine:', error);

            // Check if error is about duplicate medicine
            const errorMessage = error?.message || error?.toString() || 'Failed to save medicine';
            const isDuplicateError = errorMessage.toLowerCase().includes('already exists') ||
                errorMessage.toLowerCase().includes('already exist');

            let userFriendlyMessage = '';
            if (isDuplicateError) {
                // Extract short description from error message if possible
                const match = errorMessage.match(/short description ['"]([^'"]+)['"]/i);
                const shortDesc = match ? match[1] : shortDescription.trim().toUpperCase();
                userFriendlyMessage = `Medicine "${shortDesc}" is already added.`;
                setErrors(prev => ({ ...prev, shortDescription: userFriendlyMessage }));

                if (onError) {
                    onError(userFriendlyMessage);
                } else {
                    showSnackbar(userFriendlyMessage, 'error');
                }
            } else {
                userFriendlyMessage = errorMessage;

                // Show error in snackbar and keep popup open
                if (onError) {
                    onError(userFriendlyMessage);
                } else {
                    showSnackbar(userFriendlyMessage, 'error');
                }
            }
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
        setErrors({ shortDescription: '', medicineName: '' });
        onClose();
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
                    style: { borderRadius: '8px', maxWidth: '700px' }
                }}
            >
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" component="div" style={{ fontWeight: 'bold' }} className="mb-0">
                        {editData ? 'Edit Medicine' : 'Add Medicine'}
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
                        <Grid item xs={12} sm={6} spacing={2}>
                            <Box sx={{ mb: 2 }} className='mb-4'>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                    Short Description <span style={{ color: 'red' }}>*</span> <span className="text-muted">(Displayed on UI)</span>
                                </Typography>
                                <ClearableTextField
                                    fullWidth
                                    placeholder="Short Description"
                                    variant="outlined"
                                    size="small"
                                    value={shortDescription}
                                    onChange={(val) => handleInputChange(setShortDescription, 'shortDescription', val.toUpperCase())}
                                    disabled={!!editData}
                                    error={!!errors.shortDescription}
                                    helperText={errors.shortDescription}
                                />
                            </Box>

                            <Box sx={{ mb: 2 }} className='mb-4'>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                    Medicine Name <span style={{ color: 'red' }}>*</span>
                                </Typography>
                                <ClearableTextField
                                    fullWidth
                                    placeholder="Medicine Name"
                                    variant="outlined"
                                    size="small"
                                    value={medicineName}
                                    onChange={(val) => handleInputChange(setMedicineName, 'medicineName', val.toUpperCase())}
                                    error={!!errors.medicineName}
                                    helperText={errors.medicineName}
                                />
                            </Box>

                            <Box sx={{ mb: 2 }} className='mb-4'>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                    Priority <span style={{ color: 'red' }}>*</span>
                                </Typography>
                                <ClearableTextField
                                    fullWidth
                                    placeholder="Priority"
                                    variant="outlined"
                                    size="small"
                                    value={priority}
                                    onChange={(val) => {
                                        const filtered = filterNumericInput(val, false);
                                        handleInputChange(setPriority, 'priority', filtered);
                                    }}
                                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                                    error={!!errors.priority}
                                    helperText={errors.priority}
                                />
                            </Box>

                            <Box sx={{ mb: 2 }} className='mb-4'>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                    Breakfast
                                </Typography>
                                <ClearableTextField
                                    fullWidth
                                    placeholder="Breakfast"
                                    variant="outlined"
                                    size="small"
                                    value={breakfast}
                                    onChange={(val) => handleNumericChange(setBreakfast, 'breakfast', val)}
                                    error={!!errors.breakfast}
                                    helperText={errors.breakfast}
                                />
                            </Box>

                            <Box sx={{ mb: 2 }} className='mb-4'>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={addToActiveList}
                                            onChange={(e) => setAddToActiveList(e.target.checked)}
                                            size="small"
                                        />
                                    }
                                    label={<Typography variant="body2" sx={{ fontWeight: 'bold', color: 'black' }}>Add to active list of medicine</Typography>}
                                />
                            </Box>
                        </Grid>

                        {/* Right Column */}
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ mb: 2 }} className='mb-4'>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                    Lunch
                                </Typography>
                                <ClearableTextField
                                    fullWidth
                                    placeholder="Lunch"
                                    variant="outlined"
                                    size="small"
                                    value={lunch}
                                    onChange={(val) => handleNumericChange(setLunch, 'lunch', val)}
                                    error={!!errors.lunch}
                                    helperText={errors.lunch}
                                />
                            </Box>

                            <Box sx={{ mb: 2 }} className='mb-4'>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                    Dinner
                                </Typography>
                                <ClearableTextField
                                    fullWidth
                                    placeholder="Dinner"
                                    variant="outlined"
                                    size="small"
                                    value={dinner}
                                    onChange={(val) => handleNumericChange(setDinner, 'dinner', val)}
                                    error={!!errors.dinner}
                                    helperText={errors.dinner}
                                />
                            </Box>

                            <Box sx={{ mb: 2 }} className='mb-4'>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                    Days
                                </Typography>
                                <ClearableTextField
                                    fullWidth
                                    placeholder="Days"
                                    variant="outlined"
                                    size="small"
                                    value={days}
                                    onChange={(val) => handleNumericChange(setDays, 'days', val)}
                                    error={!!errors.days}
                                    helperText={errors.days}
                                />
                            </Box>

                            <Box sx={{ mb: 2 }} className='mb-4'>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                    Instruction
                                </Typography>
                                <ClearableTextField
                                    fullWidth
                                    placeholder="Instruction"
                                    variant="outlined"
                                    size="small"
                                    value={instruction}
                                    onChange={(val) => handleInputChange(setInstruction, 'instruction', val.toUpperCase())}
                                    error={!!errors.instruction}
                                    helperText={errors.instruction}
                                />
                            </Box>

                            <Box sx={{ mt: 2, mb: 2 }} className='mb-4'>
                                <Typography variant="caption" sx={{ color: 'black', fontSize: '12px' }}>
                                    भोजनानंतर / AFTER MEAL, भोजनापूर्वी / BEFORE MEAL
                                </Typography>
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
                        onClick={() => {
                            setShortDescription('');
                            setMedicineName('');
                            setPriority('');
                            setBreakfast('');
                            setLunch('');
                            setDinner('');
                            setDays('');
                            setInstruction('');
                            setAddToActiveList(true);
                            setErrors({});
                        }}
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
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Submit'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
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

export default AddMedicinePopup;
