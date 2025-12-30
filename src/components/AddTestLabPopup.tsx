import React, { useState, useEffect } from 'react';
import { Close, Delete } from '@mui/icons-material';
import { labService } from '../services/labService';
import { labParameterService, LabTestAndParameterRequest } from '../services/labParameterService';
import { useSession } from '../store/hooks/useSession';
import GlobalSnackbar from './GlobalSnackbar';

interface AddTestLabPopupProps {
    open: boolean;
    onClose: () => void;
    onSave: (testLabData: TestLabData) => void;
    onError?: (message: string) => void;
    editData?: {
        labTestName: string;
        priority: number | string;
        parameters?: LabTestRow[];
    } | null;
    clinicId?: string;
    doctorId?: string;
}

interface TestLabData {
    labTestName: string;
    priority: string;
    parameterName: string;
    labTestRows: LabTestRow[];
}

interface LabTestRow {
    id: string;
    parameterName: string;
    comment: string;
}

const AddTestLabPopup: React.FC<AddTestLabPopupProps> = ({ open, onClose, onSave, onError, editData, clinicId, doctorId }) => {
    const [testLabData, setTestLabData] = useState<TestLabData>({
        labTestName: '',
        priority: '',
        parameterName: '',
        labTestRows: []
    });
    
    // Snackbar state management
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    
    // Get session data if not provided
    const session = useSession();
    const finalClinicId = clinicId || session.clinicId;
    const finalDoctorId = doctorId || session.doctorId;

    // Load edit data when popup opens or editData changes
    useEffect(() => {
        if (open && editData) {
            setTestLabData({
                labTestName: editData.labTestName || '',
                priority: String(editData.priority || ''),
                parameterName: '',
                labTestRows: editData.parameters ? editData.parameters.map(param => ({
                    id: param.id || `param_${Date.now()}_${Math.random()}`,
                    parameterName: param.parameterName || '',
                    comment: param.comment || ''
                })) : []
            });
        } else if (open && !editData) {
            // Reset form when opening for new entry
            setTestLabData({
                labTestName: '',
                priority: '',
                parameterName: '',
                labTestRows: []
            });
        }
    }, [open, editData]);

    const handleInputChange = (field: keyof TestLabData, value: string) => {
        setTestLabData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAddParameter = () => {
        if (!testLabData.parameterName.trim()) {
            setSnackbarMessage('Please enter a parameter name');
            setSnackbarOpen(true);
            return;
        }
        
        // Check if parameter already exists
        const exists = testLabData.labTestRows.some(
            row => row.parameterName.toLowerCase() === testLabData.parameterName.toLowerCase().trim()
        );
        
        if (exists) {
            setSnackbarMessage('This parameter already exists');
            setSnackbarOpen(true);
            return;
        }
        
        const newParameter: LabTestRow = {
            id: `param_${Date.now()}`,
            parameterName: testLabData.parameterName.trim(),
            comment: ''
        };
        
        setTestLabData(prev => ({
            ...prev,
            labTestRows: [...prev.labTestRows, newParameter],
            parameterName: ''
        }));
    };

    const handleLabTestCommentChange = (rowId: string, text: string) => {
        setTestLabData(prev => ({
            ...prev,
            labTestRows: prev.labTestRows.map(row => 
                row.id === rowId ? { ...row, comment: text } : row
            )
        }));
    };

    const handleRemoveLabTest = (rowId: string) => {
        setTestLabData(prev => ({
            ...prev,
            labTestRows: prev.labTestRows.filter(row => row.id !== rowId)
        }));
    };

    const handleSave = async () => {
        // Validate required fields
        if (!testLabData.labTestName.trim()) {
            setSnackbarMessage('Lab Test Name is required');
            setSnackbarOpen(true);
            return;
        }
        if (!finalClinicId) {
            setSnackbarMessage('Clinic ID is required');
            setSnackbarOpen(true);
            return;
        }
        
        if (!finalDoctorId) {
            setSnackbarMessage('Doctor ID is required');
            setSnackbarOpen(true);
            return;
        }
        
        setIsSaving(true);
        
        try {
            // If editing, use the parent handler
            if (editData) {
                onSave(testLabData);
                // Close popup immediately - success message will be shown in parent component
                onClose();
                return;
            }
            
            // Use insertLabTestAndParameters to create/update lab test and parameters in one call
            console.log('Inserting/updating lab test and parameters...');
            
            // Prepare parameters array from labTestRows
            // IMPORTANT: Do not include 'id' field - it's auto-generated by the database
            const parameters = testLabData.labTestRows.map(row => ({
                parameterName: row.parameterName,
                parameter_name: row.parameterName
                // Explicitly exclude 'id' field - database will auto-generate it
            }));
            
            // Determine priority (optional field, default to 9 if not provided)
            const priorityNumber = testLabData.priority.trim()
                ? parseInt(testLabData.priority.trim(), 10)
                : 9;

            // Build the request object
            const request: LabTestAndParameterRequest = {
                doctorId: finalDoctorId,
                doctor_id: finalDoctorId,
                clinicId: finalClinicId,
                clinic_id: finalClinicId,
                // For MERGE operation: oldDescription is used to find existing lab test
                // If it exists with old description, it will be updated with new description
                // For new lab test, we can set oldDescription same as newDescription to allow update if exists
                oldDescription: testLabData.labTestName.trim(),
                old_description: testLabData.labTestName.trim(),
                Old_Description: testLabData.labTestName.trim(),
                // New description to set (same as old for new, or different for update)
                newDescription: testLabData.labTestName.trim(),
                new_description: testLabData.labTestName.trim(),
                New_Description: testLabData.labTestName.trim(),
                description: testLabData.labTestName.trim(),
                Description: testLabData.labTestName.trim(),
                priority: priorityNumber,
                Priority: priorityNumber,
                Priority_Value: priorityNumber,
                priorityValue: priorityNumber,
                // Parameters array - will be inserted for the lab test
                parameters: parameters.length > 0 ? parameters : undefined
            };
            
            console.log('Calling insertLabTestAndParameters with request:', request);
            
            // Call the service method
            const response = await labParameterService.insertLabTestAndParameters(request);
            console.log('Insert lab test and parameters response:', response);
            
            if (!response.success) {
                throw new Error(response.error || response.message || 'Failed to insert/update lab test and parameters');
            }
            
            // Call the parent onSave callback for any additional handling
            onSave(testLabData);
            
            // Reset form
            setTestLabData({
                labTestName: '',
                priority: '',
                parameterName: '',
                labTestRows: []
            });
            
            // Close popup immediately - success message will be shown in parent component
            onClose();
        } catch (error: any) {
            console.error('Error saving lab test:', error);
            
            // Check if error is about duplicate investigation
            const errorMessage = error?.message || error?.toString() || 'Failed to create lab test';
            const isDuplicateError = errorMessage.toLowerCase().includes('already exists') || 
                                     errorMessage.toLowerCase().includes('already exist');
            
            let userFriendlyMessage = '';
            if (isDuplicateError) {
                // Extract investigation name from error message if possible
                const match = errorMessage.match(/lab test ['"]([^'"]+)['"]/i) || 
                             errorMessage.match(/investigation ['"]([^'"]+)['"]/i) ||
                             errorMessage.match(/description ['"]([^'"]+)['"]/i);
                const investigationName = match ? match[1] : testLabData.labTestName.trim();
                userFriendlyMessage = `Investigation "${investigationName}" is already added.`;
            } else {
                userFriendlyMessage = errorMessage;
            }
            
            // Close popup and show error in parent component snackbar (like diagnosis/medicine)
            onClose();
            if (onError) {
                setTimeout(() => {
                    onError(userFriendlyMessage);
                }, 100); // Small delay to ensure popup is closed
            } else {
                // Fallback to popup snackbar if onError not provided
                setSnackbarMessage(userFriendlyMessage);
                setSnackbarOpen(true);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        setTestLabData({
            labTestName: '',
            priority: '',
            parameterName: '',
            labTestRows: []
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
                            Add Lab Test
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
                    {/* Lab Test Name - Full Width */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                            Lab Test Name <span style={{ color: '#d32f2f' }}>*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Lab test name"
                            value={testLabData.labTestName}
                            onChange={(e) => handleInputChange('labTestName', e.target.value)}
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

                    {/* Priority - Full Width */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                            Priority <span style={{ color: '#d32f2f' }}>*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Priority"
                            value={testLabData.priority}
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

                    {/* Parameter Name Selection */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                            Parameter Name *
                        </label>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                            <input
                                type="text"
                                placeholder="Parameter Name"
                                value={testLabData.parameterName}
                                onChange={(e) => handleInputChange('parameterName', e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddParameter();
                                    }
                                }}
                                style={{
                                    flex: 1,
                                    padding: '6px 10px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '13px',
                                    backgroundColor: 'white',
                                    outline: 'none'
                                }}
                            />
                            <button
                                type="button"
                                onClick={handleAddParameter}
                                style={{
                                    backgroundColor: '#1976d2',
                                    color: 'white',
                                    border: 'none',
                                    padding: '6px 12px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    whiteSpace: 'nowrap',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#1565c0';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#1976d2';
                                }}
                            >
                                Add Parameter
                            </button>
                        </div>
                    </div>

                    {/* Parameters Table - Always visible */}
                    <div style={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden', marginBottom: '15px' }}>
                        {/* Table Header */}
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '60px 1fr 80px' as const, 
                            backgroundColor: '#1976d2', 
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '12px'
                        }}>
                            <div style={{ padding: '8px', borderRight: '1px solid rgba(255,255,255,0.2)', textAlign: 'center' }}>Sr.</div>
                            <div style={{ padding: '8px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Parameter Name</div>
                            <div style={{ padding: '8px', textAlign: 'center' }}>Action</div>
                        </div>
                        
                        {/* Table Body */}
                        {testLabData.labTestRows.length > 0 ? (
                            testLabData.labTestRows.map((row, index) => (
                                <div key={row.id} style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: '60px 1fr 80px' as const,
                                    backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                                    borderBottom: index < testLabData.labTestRows.length - 1 ? '1px solid #e0e0e0' : 'none'
                                }}>
                                    <div style={{ padding: '8px', borderRight: '1px solid #e0e0e0', fontSize: '12px', textAlign: 'center' }}>{index + 1}</div>
                                    <div style={{ padding: '8px', borderRight: '1px solid #e0e0e0', fontSize: '12px' }}>{row.parameterName}</div>
                                    <div style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <div
                                            onClick={() => handleRemoveLabTest(row.id)}
                                            title="Remove"
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '24px',
                                                height: '24px',
                                                cursor: 'pointer',
                                                color: '#666',
                                                transition: 'color 0.2s',
                                                borderRadius: '4px'
                                            }}
                                            onMouseEnter={(e) => { 
                                                (e.currentTarget as HTMLDivElement).style.color = '#EF5350';
                                                (e.currentTarget as HTMLDivElement).style.backgroundColor = '#ffebee';
                                            }}
                                            onMouseLeave={(e) => { 
                                                (e.currentTarget as HTMLDivElement).style.color = '#666';
                                                (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                                            }}
                                        >
                                            <Delete fontSize="small" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ 
                                padding: '20px', 
                                textAlign: 'center', 
                                color: '#999', 
                                fontSize: '12px',
                                backgroundColor: 'white'
                            }}>
                                No parameters added yet
                            </div>
                        )}
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
                            backgroundColor: 'rgb(0, 100, 200)',
                            color: '#1976d2',
                            border: '1px solid #1976d2',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s'
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
                        onClick={handleClose}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: 'rgb(0, 100, 200)',
                            color: '#1976d2',
                            border: '1px solid #1976d2',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s'
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
        <GlobalSnackbar
            show={snackbarOpen}
            message={snackbarMessage}
            onClose={() => setSnackbarOpen(false)}
            autoHideDuration={5000}
        />
        </>
    );
};

export default AddTestLabPopup;
export type { TestLabData, LabTestRow };
