import React, { useState, useEffect } from 'react';
import { Close } from '@mui/icons-material';
import { Snackbar, CircularProgress } from '@mui/material';
import { billingService } from '../services/billingService';
import { useSession } from '../store/hooks/useSession';

export interface BillingDetailData {
  group: string;
  subGroup: string;
  details: string;
  defaultFee: string;
  sequenceNo: string;
  visitType: string;
  isDefault: boolean;
  lunch: string;
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
    lunch: ''
  });
  
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [billingCategories, setBillingCategories] = useState<Record<string, any>[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [subCategories, setSubCategories] = useState<Record<string, any>[]>([]);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);

  // Fetch billing categories when popup opens
  useEffect(() => {
    const fetchBillingCategories = async () => {
      if (open && finalDoctorId) {
        setLoadingCategories(true);
        try {
          const categories = await billingService.getBillingCategories(finalDoctorId);
          setBillingCategories(categories);
        } catch (error: any) {
          console.error('Error fetching billing categories:', error);
          setSnackbarMessage('Failed to load billing categories: ' + (error.message || 'Unknown error'));
          setSnackbarOpen(true);
          setBillingCategories([]);
        } finally {
          setLoadingCategories(false);
        }
      }
    };

    fetchBillingCategories();
  }, [open, finalDoctorId]);

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
        lunch: ''
      });
      setSubCategories([]);
    }
  }, [open, editData]);

  // Fetch sub-categories when group is set in edit mode
  useEffect(() => {
    const fetchSubCategoriesForEdit = async () => {
      if (open && editData && editData.group && finalDoctorId) {
        setLoadingSubCategories(true);
        try {
          const subCats = await billingService.getBillingSubCategories(editData.group, finalDoctorId);
          console.log('Fetched sub-categories for edit:', subCats);
          // Ensure we're using billing_subgroup_name from the response
          const mappedSubCats = subCats.map((cat: Record<string, any>) => ({
            ...cat,
            billing_subgroup_name: cat.billing_subgroup_name || cat.billingSubgroupName || cat.subGroup || cat.Sub_Group || cat.sub_group || ''
          }));
          console.log('Mapped sub-categories for edit with billing_subgroup_name:', mappedSubCats);
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
        console.log('Fetched sub-categories:', subCats);
        // Ensure we're using billing_subgroup_name from the response
        const mappedSubCats = subCats.map((cat: Record<string, any>) => ({
          ...cat,
          billing_subgroup_name: cat.billing_subgroup_name || cat.billingSubgroupName || cat.subGroup || cat.Sub_Group || cat.sub_group || ''
        }));
        console.log('Mapped sub-categories with billing_subgroup_name:', mappedSubCats);
        setSubCategories(mappedSubCats);
      } catch (error: any) {
        console.error('Error fetching sub-categories:', error);
        setSnackbarMessage('Failed to load sub-categories: ' + (error.message || 'Unknown error'));
        setSnackbarOpen(true);
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
  };

  const handleSave = async () => {
    // Validate required fields
    if (!billingData.group.trim()) {
      setSnackbarMessage('Group is required');
      setSnackbarOpen(true);
      return;
    }
    if (!billingData.defaultFee.trim()) {
      setSnackbarMessage('Default Fee is required');
      setSnackbarOpen(true);
      return;
    }
    if (!billingData.sequenceNo.trim()) {
      setSnackbarMessage('Sequence No is required');
      setSnackbarOpen(true);
      return;
    }
    if (!billingData.visitType.trim()) {
      setSnackbarMessage('Visit Type is required');
      setSnackbarOpen(true);
      return;
    }

    // Validate numeric fields
    if (isNaN(Number(billingData.defaultFee)) || Number(billingData.defaultFee) < 0) {
      setSnackbarMessage('Default Fee must be a valid number');
      setSnackbarOpen(true);
      return;
    }
    if (isNaN(Number(billingData.sequenceNo)) || Number(billingData.sequenceNo) < 0) {
      setSnackbarMessage('Sequence No must be a valid number');
      setSnackbarOpen(true);
      return;
    }

    setIsSaving(true);
    
    try {
      await onSave(billingData);
      setSnackbarMessage(editData ? 'Billing detail updated successfully!' : 'Billing detail created successfully!');
      setSnackbarOpen(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error('Error saving billing detail:', error);
      setSnackbarMessage(error.message || 'Failed to save billing detail');
      setSnackbarOpen(true);
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
      lunch: ''
    });
    setSubCategories([]);
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
            maxWidth: '1200px',
            width: '95%',
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
                Add Billing Details
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
                {/* Group */}
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                    Group*
                  </label>
                  <select
                    value={billingData.group}
                    onChange={(e) => handleInputChange('group', e.target.value)}
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
                    <option value="">Select Group</option>
                    {GROUP_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Details */}
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                    Details
                  </label>
                  <input
                    type="text"
                    placeholder="Details"
                    value={billingData.details}
                    onChange={(e) => handleInputChange('details', e.target.value)}
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

                {/* Visit Type */}
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                    Visit Type*
                  </label>
                  <select
                    value={billingData.visitType}
                    onChange={(e) => handleInputChange('visitType', e.target.value)}
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
                    <option value="">Select Visit Type</option>
                    {VISIT_TYPE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Is Default Checkbox */}
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={billingData.isDefault}
                      onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ fontSize: '13px', color: '#333' }}>Is Default</span>
                  </label>
                </div>
              </div>

              {/* Right Column */}
              <div>
                {/* Sub-Group */}
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                    Sub-Group
                  </label>
                  <select
                    value={billingData.subGroup}
                    onChange={(e) => handleInputChange('subGroup', e.target.value)}
                    disabled={!billingData.group || loadingSubCategories}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '13px',
                      backgroundColor: billingData.group && !loadingSubCategories ? 'white' : '#f5f5f5',
                      outline: 'none',
                      cursor: billingData.group && !loadingSubCategories ? 'pointer' : 'not-allowed',
                      opacity: billingData.group && !loadingSubCategories ? 1 : 0.6
                    }}
                  >
                    <option value="">
                      {loadingSubCategories 
                        ? 'Loading sub-categories...' 
                        : !billingData.group 
                          ? 'Select Group first' 
                          : 'Select Sub-Group'}
                    </option>
                    {subCategories.map((subCat: Record<string, any>, index: number) => {
                      // Prioritize billing_subgroup_name as the primary field from API response
                      const subGroupName = subCat.billing_subgroup_name;
                      
                      // Skip if billing_subgroup_name is not available or invalid
                      if (!subGroupName || subGroupName === 'undefined' || subGroupName === 'null' || subGroupName === '') {
                        return null;
                      }
                      
                      return (
                        <option key={`subcat-${index}-${subGroupName}`} value={subGroupName}>
                          {subGroupName}
                        </option>
                      );
                    }).filter(Boolean)}
                  </select>
                </div>
                  
                  
                {/* Default Fee */}
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                    Default Fee (Rs)*
                  </label>
                  <input
                    type="text"
                    placeholder="Default Fee"
                    value={billingData.defaultFee}
                    onChange={(e) => handleInputChange('defaultFee', e.target.value)}
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
                
                {/* Sequence No */}
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                    Sequence No*
                  </label>
                  <input
                    type="text"
                    placeholder="Sequence No"
                    value={billingData.sequenceNo}
                    onChange={(e) => handleInputChange('sequenceNo', e.target.value)}
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
              disabled={isSaving}
              style={{
                padding: '8px 16px',
                backgroundColor: isSaving ? '#ccc' : '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'background-color 0.2s',
                opacity: isSaving ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.backgroundColor = '#1565c0';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.backgroundColor = '#1976d2';
                }
              }}
            >
              {isSaving ? 'Saving...' : 'Submit'}
            </button>
            <button
              onClick={handleClose}
              style={{
                padding: '8px 16px',
                backgroundColor: 'white',
                color: '#1976d2',
                border: '1px solid #1976d2',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleClose}
              style={{
                padding: '8px 16px',
                backgroundColor: 'white',
                color: '#1976d2',
                border: '1px solid #1976d2',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
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
          zIndex: 99999,
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

export default AddBillingDetailsPopup;

