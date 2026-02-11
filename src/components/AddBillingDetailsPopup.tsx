import React, { useState, useEffect } from 'react';
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
import { billingService } from '../services/billingService';
import { useSession } from '../store/hooks/useSession';
import { validateField } from '../utils/validationUtils';

export interface BillingDetailData {
  group: string;
  subGroup: string;
  details: string;
  defaultFee: string;
  sequenceNo: string;
  visitType: string;
  isDefault: boolean;
  lunch: string;
  clinicId?: string;
}

interface AddBillingDetailsPopupProps {
  open: boolean;
  onClose: () => void;
  onSave: (billingData: BillingDetailData) => Promise<void>;
  editData?: BillingDetailData | null;
  doctorId?: string;
}

const GROUP_OPTIONS = [
  { value: 'Professional Fees', label: 'Professional Fees' },
  { value: 'Services', label: 'Services' },
];

const VISIT_TYPE_OPTIONS = [
  { value: 'New', label: 'New' },
  { value: 'Followup', label: 'Followup' },
];

const AddBillingDetailsPopup: React.FC<AddBillingDetailsPopupProps> = ({
  open,
  onClose,
  onSave,
  editData,
  doctorId
}) => {
  const session = useSession();
  const finalDoctorId = doctorId || session.doctorId;

  const [billingData, setBillingData] = useState<BillingDetailData>({
    group: '',
    subGroup: '',
    details: '',
    defaultFee: '',
    sequenceNo: '',
    visitType: '',
    isDefault: false,
    lunch: '',
    clinicId: ''
  });

  // Validation state
  const [errors, setErrors] = useState<{
    group: string;
    defaultFee: string;
    sequenceNo: string;
    visitType: string;
    details: string;
  }>({
    group: '',
    defaultFee: '',
    sequenceNo: '',
    visitType: '',
    details: ''
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [isSaving, setIsSaving] = useState(false);
  const [subCategories, setSubCategories] = useState<Record<string, any>[]>([]);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);

  // Load edit data when popup opens or editData changes
  useEffect(() => {
    if (open && editData) {
      setBillingData({
        group: editData.group || '',
        subGroup: editData.subGroup || '',
        details: editData.details || '',
        defaultFee: editData.defaultFee || '',
        sequenceNo: editData.sequenceNo || '',
        visitType: editData.visitType || '',
        isDefault: editData.isDefault || false,
        lunch: editData.lunch || ''
      });
    } else if (open && !editData) {
      // Reset form when opening for new entry
      setBillingData({
        group: '',
        subGroup: '',
        details: '',
        defaultFee: '',
        sequenceNo: '',
        visitType: '',
        isDefault: false,
        lunch: '',
        clinicId: ''
      });
      setSubCategories([]);
    }
    // Reset errors
    setErrors({
      group: '',
      defaultFee: '',
      sequenceNo: '',
      visitType: '',
      details: ''
    });
  }, [open, editData]);

  // Fetch sub-categories when group is set in edit mode
  useEffect(() => {
    const fetchSubCategoriesForEdit = async () => {
      if (open && editData && editData.group && finalDoctorId) {
        setLoadingSubCategories(true);
        try {
          const subCats = await billingService.getBillingSubCategories(editData.group, finalDoctorId);
          // Ensure we're using billing_subgroup_name from the response
          const mappedSubCats = subCats.map((cat: Record<string, any>) => ({
            ...cat,
            billing_subgroup_name: cat.billing_subgroup_name || cat.billingSubgroupName || cat.subGroup || cat.Sub_Group || cat.sub_group || ''
          }));
          setSubCategories(mappedSubCats);
        } catch (error: any) {
          console.error('Error fetching sub-categories for edit:', error);
          setSubCategories([]);
        } finally {
          setLoadingSubCategories(false);
        }
      }
    };

    fetchSubCategoriesForEdit();
  }, [open, editData?.group, finalDoctorId]);

  const handleInputChange = async (field: keyof BillingDetailData, value: string | boolean) => {
    // Validation using validateField
    if (field === 'defaultFee' && typeof value === 'string') {
      const { allowed, error } = validateField('defaultFee', value, undefined, undefined, 'billing');
      if (!allowed) return;
      setBillingData(prev => ({ ...prev, [field]: value }));
      setErrors(prev => ({ ...prev, defaultFee: error }));
      return;
    }

    if (field === 'sequenceNo' && typeof value === 'string') {
      const { allowed, error } = validateField('sequenceNo', value, undefined, undefined, 'billing');
      if (!allowed) return;
      setBillingData(prev => ({ ...prev, [field]: value }));
      setErrors(prev => ({ ...prev, sequenceNo: error }));
      return;
    }

    if (field === 'details' && typeof value === 'string') {
      const { allowed, error } = validateField('details', value, undefined, undefined, 'billing');
      if (allowed) {
        setBillingData(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, details: error }));
      }
      return;
    }

    // When group changes, fetch sub-categories and reset subGroup
    if (field === 'group' && typeof value === 'string' && value.trim() && finalDoctorId) {
      setLoadingSubCategories(true);
      setSubCategories([]);

      // Update group and reset subGroup
      setBillingData(prev => ({
        ...prev,
        [field]: value,
        subGroup: ''
      }));

      try {
        const subCats = await billingService.getBillingSubCategories(value, finalDoctorId);
        // Ensure we're using billing_subgroup_name from the response
        const mappedSubCats = subCats.map((cat: Record<string, any>) => ({
          ...cat,
          billing_subgroup_name: cat.billing_subgroup_name || cat.billingSubgroupName || cat.subGroup || cat.Sub_Group || cat.sub_group || ''
        }));
        setSubCategories(mappedSubCats);
      } catch (error: any) {
        console.error('Error fetching sub-categories:', error);
        setSnackbar({ open: true, message: 'Failed to load sub-categories', severity: 'error' });
        setSubCategories([]);
      } finally {
        setLoadingSubCategories(false);
      }
    } else {
      // For other fields, just update the value
      setBillingData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Clear errors
    if (field === 'group' && errors.group) setErrors(prev => ({ ...prev, group: '' }));
    if (field === 'visitType' && errors.visitType) setErrors(prev => ({ ...prev, visitType: '' }));
  };

  const handleSave = async () => {
    let hasError = false;
    const newErrors = {
      group: '',
      defaultFee: '',
      sequenceNo: '',
      visitType: '',
      details: ''
    };

    // Validate required fields
    if (!billingData.group.trim()) {
      newErrors.group = 'Group is required';
      hasError = true;
    }
    if (!billingData.details.trim()) {
      newErrors.details = 'Details is required';
      hasError = true;
    }
    if (!billingData.defaultFee.toString().trim()) {
      newErrors.defaultFee = 'Default Fee is required';
      hasError = true;
    }
    if (!billingData.sequenceNo.toString().trim()) {
      newErrors.sequenceNo = 'Sequence No is required';
      hasError = true;
    }
    if (!billingData.visitType.trim()) {
      newErrors.visitType = 'Visit Type is required';
      hasError = true;
    }

    // Validate numeric fields
    if (billingData.defaultFee && (isNaN(Number(billingData.defaultFee)) || Number(billingData.defaultFee) < 0)) {
      newErrors.defaultFee = 'Default Fee must be a valid number';
      hasError = true;
    }
    if (billingData.sequenceNo && (isNaN(Number(billingData.sequenceNo)) || Number(billingData.sequenceNo) < 0)) {
      newErrors.sequenceNo = 'Sequence No must be a valid number';
      hasError = true;
    }

    // Validate clinicId from session
    if (!session.clinicId) {
      setSnackbar({ open: true, message: 'Clinic ID is required. Please ensure you are logged in.', severity: 'error' });
      return;
    }

    setErrors(newErrors);

    if (hasError) {
      return;
    }

    setIsSaving(true);

    try {
      // Include clinicId from session in the billing data
      const billingDataWithClinic = {
        ...billingData,
        clinicId: session.clinicId
      };

      await onSave(billingDataWithClinic);
      setSnackbar({
        open: true,
        message: editData ? 'Billing detail updated successfully!' : 'Billing detail created successfully!',
        severity: 'success'
      });
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error: any) {
      console.error('Error saving billing detail:', error);
      setSnackbar({ open: true, message: error.message || 'Failed to save billing detail', severity: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setBillingData({
      group: '',
      subGroup: '',
      details: '',
      defaultFee: '',
      sequenceNo: '',
      visitType: '',
      isDefault: false,
      lunch: '',
      clinicId: ''
    });
    setSubCategories([]);
    setErrors({
      group: '',
      defaultFee: '',
      sequenceNo: '',
      visitType: '',
      details: ''
    });
    onClose();
  };

  const handleReset = () => {
    setBillingData({
      group: '',
      subGroup: '',
      details: '',
      defaultFee: '',
      sequenceNo: '',
      visitType: '',
      isDefault: false,
      lunch: '',
      clinicId: ''
    });
    setSubCategories([]);
    setErrors({
      group: '',
      defaultFee: '',
      sequenceNo: '',
      visitType: '',
      details: ''
    });
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
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div" style={{ fontWeight: 'bold' }} className="mb-0">
            Add Billing Details
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
              {/* Group */}
              <Box sx={{ mb: 2 }} className='mb-4'>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                  Group <span style={{ color: 'red' }}>*</span>
                </Typography>
                <TextField
                  select
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={billingData.group}
                  onChange={(e) => handleInputChange('group', e.target.value)}
                  error={!!errors.group}
                  helperText={errors.group}
                  sx={{ position: 'relative' }}
                  FormHelperTextProps={{
                    sx: { position: 'absolute', bottom: '-18px', left: 0 }
                  }}
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: (selected: any) => {
                      if (!selected || selected.length === 0) {
                        return <em style={{ color: "gray", fontStyle: "normal" }}>Select Group</em>;
                      }
                      return selected;
                    },
                    MenuProps: { PaperProps: { style: { maxHeight: 300 } } }
                  }}
                >
                  {GROUP_OPTIONS.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              {/* Details */}
              <Box sx={{ mb: 2 }} className='mb-4'>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                  Details <span style={{ color: 'red' }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Details"
                  variant="outlined"
                  size="small"
                  value={billingData.details}
                  onChange={(e) => {
                    handleInputChange('details', e.target.value);
                  }}
                  error={!!errors.details && !errors.details.includes('cannot exceed')}
                  helperText={errors.details}
                  FormHelperTextProps={{
                    sx: {
                      color: errors.details?.includes('cannot exceed') ? 'gray !important' : '#d32f2f',
                      position: 'absolute',
                      bottom: '-18px',
                      left: 0
                    }
                  }}
                />
              </Box>

              {/* Visit Type */}
              <Box sx={{ mb: 2 }} className='mb-4'>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                  Visit Type <span style={{ color: 'red' }}>*</span>
                </Typography>
                <TextField
                  select
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={billingData.visitType}
                  onChange={(e) => handleInputChange('visitType', e.target.value)}
                  error={!!errors.visitType}
                  helperText={errors.visitType}
                  sx={{ position: 'relative' }}
                  FormHelperTextProps={{
                    sx: { position: 'absolute', bottom: '-18px', left: 0 }
                  }}
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: (selected: any) => {
                      if (!selected || selected.length === 0) {
                        return <em style={{ color: "gray", fontStyle: "normal" }}>Select Visit Type</em>;
                      }
                      return selected;
                    },
                    MenuProps: { PaperProps: { style: { maxHeight: 300 } } }
                  }}
                >
                  {VISIT_TYPE_OPTIONS.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              {/* Is Default Checkbox */}
              <Box sx={{ mt: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={billingData.isDefault}
                      onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                      size="small"
                    />
                  }
                  label={<Typography variant="body2" sx={{ fontWeight: 'bold', color: '#333' }}>Is Default</Typography>}
                />
              </Box>
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} sm={6}>
              {/* Sub-Group */}
              <Box sx={{ mb: 2 }} className='mb-4'>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                  Sub-Group
                </Typography>
                <TextField
                  select
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={billingData.subGroup}
                  onChange={(e) => handleInputChange('subGroup', e.target.value)}
                  disabled={!billingData.group || loadingSubCategories}
                  sx={{ position: 'relative' }}
                  FormHelperTextProps={{
                    sx: { position: 'absolute', bottom: '-18px', left: 0 }
                  }}
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: (selected: any) => {
                      if (loadingSubCategories) return <em style={{ color: "gray", fontStyle: "normal" }}>Loading sub-categories...</em>;
                      if (!billingData.group) return <em style={{ color: "gray", fontStyle: "normal" }}>Select Group first</em>;
                      if (!selected || selected.length === 0) {
                        return <em style={{ color: "gray", fontStyle: "normal" }}>Select Sub-Group</em>;
                      }
                      return selected;
                    },
                    MenuProps: { PaperProps: { style: { maxHeight: 300 } } }
                  }}
                >
                  {subCategories.map((subCat: Record<string, any>, index: number) => {
                    // Prioritize billing_subgroup_name as the primary field from API response
                    const subGroupName = subCat.billing_subgroup_name;

                    // Skip if billing_subgroup_name is not available or invalid
                    if (!subGroupName || subGroupName === 'undefined' || subGroupName === 'null' || subGroupName === '') {
                      return null;
                    }

                    return (
                      <MenuItem key={`subcat-${index}-${subGroupName}`} value={subGroupName}>
                        {subGroupName}
                      </MenuItem>
                    );
                  }).filter(Boolean)}
                </TextField>
              </Box>

              {/* Default Fee */}
              <Box sx={{ mb: 2 }} className='mb-4'>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                  Default Fee (Rs) <span style={{ color: 'red' }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Default Fee"
                  variant="outlined"
                  size="small"
                  value={billingData.defaultFee}
                  onChange={(e) => handleInputChange('defaultFee', e.target.value)}
                  error={!!errors.defaultFee && !errors.defaultFee.includes('cannot exceed')}
                  helperText={errors.defaultFee}
                  inputProps={{ inputMode: 'numeric' }}
                  sx={{ position: 'relative' }}
                  FormHelperTextProps={{
                    sx: {
                      color: errors.defaultFee?.includes('cannot exceed') ? 'gray !important' : '#d32f2f',
                      position: 'absolute',
                      bottom: '-18px',
                      left: 0
                    }
                  }}
                />
              </Box>

              {/* Sequence No */}
              <Box sx={{ mb: 2 }} className='mb-4'>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                  Sequence No <span style={{ color: 'red' }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Sequence No"
                  variant="outlined"
                  size="small"
                  value={billingData.sequenceNo}
                  onChange={(e) => handleInputChange('sequenceNo', e.target.value)}
                  error={!!errors.sequenceNo && !errors.sequenceNo.includes('cannot exceed')}
                  helperText={errors.sequenceNo}
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  sx={{ position: 'relative' }}
                  FormHelperTextProps={{
                    sx: {
                      color: errors.sequenceNo?.includes('cannot exceed') ? 'gray !important' : '#d32f2f',
                      position: 'absolute',
                      bottom: '-18px',
                      left: 0
                    }
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        {/* Popup Footer */}
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
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          zIndex: 99999,
          '& .MuiSnackbarContent-root': {
            backgroundColor: snackbar.message.includes('successfully') ? '#4caf50' : '#f44336',
            color: 'white',
            fontWeight: 'bold'
          }
        }}
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

export default AddBillingDetailsPopup;

