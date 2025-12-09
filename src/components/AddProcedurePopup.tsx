import React, { useState } from 'react';
import { Close, Delete } from '@mui/icons-material';
import { Snackbar } from '@mui/material';
import procedureService, { ProcedureMaster, ProcedureFindings } from '../services/procedureService';
import { sessionService } from '../services/sessionService';

interface Finding {
    id: string;
    description: string;
}

interface AddProcedurePopupProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: {
        procedureDescription: string;
        priority: string;
        findings: Finding[];
    }) => void;
    editData?: {
        procedureDescription: string;
        priority: string;
        findings: Finding[];
    };
}

const AddProcedurePopup: React.FC<AddProcedurePopupProps> = ({ open, onClose, onSave, editData }) => {
    const isEditMode = !!editData;
    const [procedureDescription, setProcedureDescription] = useState('');
    const [priority, setPriority] = useState('');
    const [findingsDescription, setFindingsDescription] = useState('');
    const [findings, setFindings] = useState<Finding[]>([]);
    const [findingsLoading, setFindingsLoading] = useState(false);

    // Helper to load findings from API for edit mode
    const loadFindingsForProcedure = async (procDescription: string) => {
        try {
            setFindingsLoading(true);
            const doctorId = "DR-00010";
            const apiFindings = await procedureService.getFindingsForProcedure(doctorId, procDescription);
            const formattedFindings: Finding[] = (apiFindings || []).map((finding) => ({
                id: finding.findingsDescription,
                description: finding.findingsDescription
            }));
            setFindings(formattedFindings);
        } catch (error: any) {
            console.error('Error loading findings:', error);
            setSnackbarMessage(error.message || 'Failed to load findings');
            setSnackbarOpen(true);
            setFindings([]);
        } finally {
            setFindingsLoading(false);
        }
    };

    // Populate form when editData changes or popup opens
    React.useEffect(() => {
        const initializeForm = async () => {
            if (open && editData) {
                setProcedureDescription(editData.procedureDescription || '');
                setPriority(editData.priority || '');
                if (editData.procedureDescription) {
                    await loadFindingsForProcedure(editData.procedureDescription);
                } else {
                    setFindings(editData.findings || []);
                }
            } else if (open && !editData) {
                // Reset form for new procedure
                setProcedureDescription('');
                setPriority('');
                setFindingsDescription('');
                setFindings([]);
            }
        };

        if (open) {
            initializeForm();
        } else {
            setFindingsLoading(false);
        }
    }, [open, editData]);
    
    // Snackbar state management
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddFinding = () => {
        if (!findingsDescription.trim()) {
            setSnackbarMessage('Findings Description is required');
            setSnackbarOpen(true);
            return;
        }
        
        const newFinding: Finding = {
            id: Date.now().toString(),
            description: findingsDescription.trim().toUpperCase()
        };
        
        setFindings([...findings, newFinding]);
        setFindingsDescription('');
    };

    const handleRemoveFinding = (id: string) => {
        setFindings(findings.filter(f => f.id !== id));
    };

    const handleSubmit = async () => {
        if (!procedureDescription.trim()) {
            setSnackbarMessage('Procedure Description is required');
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
            const originalProcedureDescription = editData?.procedureDescription || '';
            
            // Normalize text fields to uppercase before saving
            const newProcedureDescription = procedureDescription.trim().toUpperCase();
            
            // Determine priority (optional; default to "9" if not provided)
            const priorityValue = priority.trim() || '9';

            // Create/Update procedure data
            const procedureData: ProcedureMaster = {
                procedureDescription: newProcedureDescription,
                doctorId: doctorId,
                clinicId: clinicId,
                priorityValue: parseInt(priorityValue),
                modifiedByName: userName
            };

            if (isEditMode) {
                const procedureDescriptionChanged = originalProcedureDescription !== newProcedureDescription;
                
                if (procedureDescriptionChanged) {
                    // If procedure description changed, we need to delete old and create new
                    // because procedure description is part of the composite key
                    try {
                        // Delete old procedure (this will also delete old findings via cascade or service)
                        await procedureService.deleteProcedure(doctorId, clinicId, originalProcedureDescription);
                    } catch (err) {
                        console.warn('Error deleting old procedure (may not exist):', err);
                    }
                    
                    // Create new procedure with new description
                    procedureData.createdByName = userName;
                    await procedureService.createProcedure(procedureData);
                } else {
                    // Update existing procedure (description didn't change)
                    await procedureService.updateProcedure(procedureData);
                    
                    // Delete all old findings
                    let existingFindings: ProcedureFindings[] = [];
                    try {
                        existingFindings = await procedureService.getFindingsForProcedure(doctorId, originalProcedureDescription);
                    } catch (err) {
                        console.warn('Could not fetch existing findings:', err);
                    }
                    
                    // Delete all old findings
                    for (const existingFinding of existingFindings) {
                        try {
                            await procedureService.deleteFinding(doctorId, originalProcedureDescription, existingFinding.findingsDescription);
                        } catch (err) {
                            console.error('Error deleting old finding:', err);
                            // Continue even if deletion fails
                        }
                    }
                }
                
                // Add all new findings (for both changed and unchanged description cases)
                for (const finding of findings) {
                    try {
                        await procedureService.addFinding({
                            doctorId: doctorId,
                            procedureDescription: newProcedureDescription,
                            findingsDescription: finding.description.trim().toUpperCase(),
                            priorityValue: parseInt(priorityValue),
                            createdByName: userName,
                            modifiedByName: userName
                        });
                    } catch (findingError: any) {
                        console.error('Error adding finding:', findingError);
                        // Continue with other findings even if one fails
                    }
                }
            } else {
                // Create new procedure
                procedureData.createdByName = userName;
                await procedureService.createProcedure(procedureData);
                
                // Create findings if any
                if (findings.length > 0) {
                    for (const finding of findings) {
                        try {
                            await procedureService.addFinding({
                                doctorId: doctorId,
                                procedureDescription: newProcedureDescription,
                                findingsDescription: finding.description.trim(),
                                priorityValue: priority.trim() ? parseInt(priority.trim()) : null,
                                createdByName: userName,
                                modifiedByName: userName
                            });
                        } catch (findingError: any) {
                            console.error('Error adding finding:', findingError);
                            // Continue with other findings even if one fails
                        }
                    }
                }
            }

            // Show success snackbar
            setSnackbarMessage(isEditMode ? 'Procedure updated successfully!' : 'Procedure created successfully!');
            setSnackbarOpen(true);
            
            // Call parent onSave callback for UI update
            onSave({
                procedureDescription: newProcedureDescription,
                priority: priorityValue,
                findings: findings
            });
            
            // Reset form
            setProcedureDescription('');
            setPriority('');
            setFindingsDescription('');
            setFindings([]);
            
            // Close popup after showing success message
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error: any) {
            console.error('Error saving procedure:', error);
            setSnackbarMessage(error.message || 'Failed to save procedure');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setProcedureDescription('');
        setPriority('');
        setFindingsDescription('');
        setFindings([]);
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
                    maxWidth: '600px',
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
                    fontFamily: "'Roboto', sans-serif"
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h3 style={{ margin: 0, color: '#000000', fontSize: '18px', fontWeight: 'bold' }}>
                            {editData ? 'Edit Procedure' : 'Add Procedure'}
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
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                         Procedure Description <span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Procedure Description"
                            value={procedureDescription}
                            onChange={(e) => setProcedureDescription(e.target.value)}
                            disabled={isEditMode}
                            readOnly={isEditMode}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #B7B7B7',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontFamily: "'Roboto', sans-serif",
                                backgroundColor: isEditMode ? '#f5f5f5' : 'white',
                                cursor: isEditMode ? 'not-allowed' : 'text',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                            Procedure Priority
                        </label>
                        <input
                            type="text"
                            placeholder="Priority"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
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
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                                    Findings Description
                                </label>
                                <input
                                    type="text"
                                    placeholder="Findings Description"
                                    value={findingsDescription}
                                    onChange={(e) => setFindingsDescription(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleAddFinding();
                                        }
                                    }}
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
                            <button
                                onClick={handleAddFinding}
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
                                    whiteSpace: 'nowrap',
                                    height: '38px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#1565c0';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#1976d2';
                                }}
                            >
                                Add Findings
                            </button>
                        </div>
                    </div>

                    {/* Findings Table */}
                    <div style={{ marginBottom: '15px' }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            border: '1px solid #dee2e6'
                        }}>
                            <thead>
                                <tr>
                                    <th style={{
                                        backgroundColor: '#1976d2',
                                        color: '#ffffff',
                                        padding: '8px 12px',
                                        textAlign: 'left',
                                        fontWeight: 'bold',
                                        fontSize: '11px',
                                        fontFamily: "'Roboto', sans-serif",
                                        border: '1px solid #dee2e6'
                                    }}>Sr.</th>
                                    <th style={{
                                        backgroundColor: '#1976d2',
                                        color: '#ffffff',
                                        padding: '8px 12px',
                                        textAlign: 'left',
                                        fontWeight: 'bold',
                                        fontSize: '11px',
                                        fontFamily: "'Roboto', sans-serif",
                                        border: '1px solid #dee2e6'
                                    }}>Findings Description</th>
                                    <th style={{
                                        backgroundColor: '#1976d2',
                                        color: '#ffffff',
                                        padding: '8px 12px',
                                        textAlign: 'left',
                                        fontWeight: 'bold',
                                        fontSize: '11px',
                                        fontFamily: "'Roboto', sans-serif",
                                        border: '1px solid #dee2e6'
                                    }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {findingsLoading ? (
                                    <tr>
                                        <td colSpan={3} style={{
                                            padding: '8px 12px',
                                            border: '1px solid #dee2e6',
                                            fontSize: '12px',
                                            fontFamily: "'Roboto', sans-serif",
                                            textAlign: 'center',
                                            color: '#666'
                                        }}>
                                            Loading findings...
                                        </td>
                                    </tr>
                                ) : findings.length > 0 ? (
                                    findings.map((finding, index) => (
                                        <tr key={finding.id}>
                                            <td style={{
                                                padding: '8px 12px',
                                                border: '1px solid #dee2e6',
                                                fontSize: '12px',
                                                fontFamily: "'Roboto', sans-serif",
                                                backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#ffffff'
                                            }}>{index + 1}</td>
                                            <td style={{
                                                padding: '8px 12px',
                                                border: '1px solid #dee2e6',
                                                fontSize: '12px',
                                                fontFamily: "'Roboto', sans-serif",
                                                backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#ffffff'
                                            }}>{finding.description}</td>
                                            <td style={{
                                                padding: '8px 12px',
                                                border: '1px solid #dee2e6',
                                                fontSize: '12px',
                                                fontFamily: "'Roboto', sans-serif",
                                                backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#ffffff'
                                            }}>
                                                <div
                                                    onClick={() => handleRemoveFinding(finding.id)}
                                                    title="Delete"
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        color: '#666',
                                                        transition: 'color 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.color = '#d32f2f';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.color = '#666';
                                                    }}
                                                >
                                                    <Delete style={{ fontSize: '18px' }} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td style={{
                                            padding: '8px 12px',
                                            border: '1px solid #dee2e6',
                                            fontSize: '12px',
                                            fontFamily: "'Roboto', sans-serif",
                                            textAlign: 'center',
                                            color: '#666'
                                        }} colSpan={3}>---</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Popup Footer - Submit / Cancel / Back (match other popups) */}
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
                            backgroundColor: '#1976d2',
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

export default AddProcedurePopup;

