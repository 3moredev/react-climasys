import React, { useState } from 'react';
import { Close, Delete } from '@mui/icons-material';
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
    IconButton
} from '@mui/material';
import procedureService, { ProcedureMaster, ProcedureFindings } from '../services/procedureService';
import { sessionService } from '../services/sessionService';
import { validateField } from '../utils/validationUtils';

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

    // Validation state
    const [errors, setErrors] = useState<Record<string, string>>({});

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
                setFindings([]);
                setErrors({ procedureDescription: '', priority: '' });
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
        let newErrors = { procedureDescription: '', priority: '' };
        let hasError = false;

        if (!procedureDescription.trim()) {
            newErrors.procedureDescription = 'Procedure Description is required';
            hasError = true;
        }

        if (!priority.trim()) {
            newErrors.priority = 'Priority is required';
            hasError = true;
        }

        setErrors(newErrors);

        if (hasError) {
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
            setErrors({});

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
        setErrors({ procedureDescription: '', priority: '' });
        onClose();
    };

    const handleReset = () => {
        setProcedureDescription('');
        setPriority('');
        setFindingsDescription('');
        setFindings([]);
        setErrors({});
    };

    if (!open) return null;

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="sm" // Keeping small to match other popups, findings table might need scrolling if very wide
                fullWidth
                PaperProps={{
                    style: { borderRadius: '8px', maxWidth: '600px' } // Slightly wider for table
                }}
            >
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" component="div" style={{ fontWeight: 'bold' }} className="mb-0">
                        {editData ? 'Edit Procedure' : 'Add Procedure'}
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
                        <Grid item xs={12}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} className='mb-0'>
                                    Procedure Description <span style={{ color: 'red' }}>*</span>
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Procedure Description"
                                    variant="outlined"
                                    size="small"
                                    value={procedureDescription}
                                    onChange={(e) => {
                                        const val = e.target.value.toUpperCase();
                                        const { allowed, error } = validateField('procedureDescription', val, undefined, undefined, 'procedure');
                                        if (allowed) {
                                            setProcedureDescription(val);
                                            setErrors(prev => ({ ...prev, procedureDescription: error }));
                                        }
                                    }}
                                    disabled={loading}
                                    error={!!errors.procedureDescription}
                                    helperText={errors.procedureDescription || (procedureDescription.length === 100 ? 'Procedure Description cannot exceed 100 characters' : '')}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }} className='mb-0'>
                                    Procedure Priority <span style={{ color: 'red' }}>*</span>
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Priority"
                                    variant="outlined"
                                    size="small"
                                    value={priority}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        const { allowed, error } = validateField('priority', val, undefined, undefined, 'procedure');
                                        if (allowed) {
                                            setPriority(val);
                                            setErrors(prev => ({ ...prev, priority: error }));
                                        }
                                    }}
                                    disabled={loading}
                                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                                    error={!!errors.priority}
                                    helperText={errors.priority || (priority.length === 10 ? 'Priority cannot exceed 10 characters' : '')}
                                />
                            </Box>
                        </Grid>

                        {/* Findings Section */}
                        <Grid item xs={12}>
                            <Box sx={{ mb: 2 }}>
                                <Grid container spacing={1} alignItems="flex-end" className='mb-0'>
                                    <Grid item xs>
                                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }} className='mb-0'>
                                            Findings Description
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            placeholder="Findings Description"
                                            variant="outlined"
                                            size="small"
                                            value={findingsDescription}
                                            onChange={(e) => {
                                                const val = e.target.value.toUpperCase();
                                                const { allowed, error } = validateField('findingsDescription', val, undefined, undefined, 'procedure');
                                                if (allowed) {
                                                    setFindingsDescription(val);
                                                }
                                            }}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleAddFinding();
                                                }
                                            }}
                                            disabled={loading}
                                            helperText={validateField('findingsDescription', findingsDescription, undefined, undefined, 'procedure').error}
                                        />
                                    </Grid>
                                    <Grid item>
                                        <Button
                                            onClick={handleAddFinding}
                                            variant="contained"
                                            sx={{
                                                backgroundColor: '#1976d2',
                                                textTransform: 'none',
                                                height: '38px',
                                                '&:hover': {
                                                    backgroundColor: '#1565c0',
                                                }
                                            }}
                                            disabled={loading}
                                        >
                                            Add Findings
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>

                        <Grid item xs={12}>
                            {/* Original HTML Table Preserved */}
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
                                            fontSize: '14px',
                                            fontFamily: "'Roboto', sans-serif",
                                            border: '1px solid #dee2e6'
                                        }}>Sr.</th>
                                        <th style={{
                                            backgroundColor: '#1976d2',
                                            color: '#ffffff',
                                            padding: '8px 12px',
                                            textAlign: 'left',
                                            fontWeight: 'bold',
                                            fontSize: '14px',
                                            fontFamily: "'Roboto', sans-serif",
                                            border: '1px solid #dee2e6'
                                        }}>Findings Description</th>
                                        <th style={{
                                            backgroundColor: '#1976d2',
                                            color: '#ffffff',
                                            padding: '8px 12px',
                                            textAlign: 'left',
                                            fontWeight: 'bold',
                                            fontSize: '14px',
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
                        onClick={handleReset}
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
