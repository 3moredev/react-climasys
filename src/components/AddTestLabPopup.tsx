import React, { useState } from 'react';
import { Close, Delete } from '@mui/icons-material';
import { Snackbar } from '@mui/material';

interface AddTestLabPopupProps {
    open: boolean;
    onClose: () => void;
    onSave: (testLabData: TestLabData) => void;
}

interface TestLabData {
    labTestName: string;
    priority: string;
    selectedDiagnosis: string;
    labTestRows: LabTestRow[];
}

interface LabTestRow {
    id: string;
    labTest: string;
    comment: string;
}

const AddTestLabPopup: React.FC<AddTestLabPopupProps> = ({ open, onClose, onSave }) => {
    const [testLabData, setTestLabData] = useState<TestLabData>({
        labTestName: '',
        priority: '',
        selectedDiagnosis: '',
        labTestRows: []
    });
    
    // Snackbar state management
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const handleInputChange = (field: keyof TestLabData, value: string) => {
        setTestLabData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAddLabTest = () => {
        if (!testLabData.selectedDiagnosis.trim()) return;
        
        const newLabTest: LabTestRow = {
            id: `lab_${Date.now()}`,
            labTest: testLabData.selectedDiagnosis,
            comment: ''
        };
        
        setTestLabData(prev => ({
            ...prev,
            labTestRows: [...prev.labTestRows, newLabTest],
            selectedDiagnosis: ''
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

    const handleSave = () => {
        // Validate required fields
        if (!testLabData.labTestName.trim()) {
            setSnackbarMessage('Lab Test Name is required');
            setSnackbarOpen(true);
            return;
        }
        if (!testLabData.priority.trim()) {
            setSnackbarMessage('Priority is required');
            setSnackbarOpen(true);
            return;
        }
        
        // Call the parent onSave callback with the test lab data
        onSave(testLabData);
        
        // Show success snackbar
        setSnackbarMessage('Test Lab added successfully!');
        setSnackbarOpen(true);
        
        // Reset form
        setTestLabData({
            labTestName: '',
            priority: '',
            selectedDiagnosis: '',
            labTestRows: []
        });
        
        // Close popup after showing success message
        setTimeout(() => {
            onClose();
        }, 1500);
    };

    const handleClose = () => {
        setTestLabData({
            labTestName: '',
            priority: '',
            selectedDiagnosis: '',
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
                            Add Test Lab
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
                            Lab Test name *
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
                            Priority *
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

                    {/* Lab Test Selection */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
                            Lab Test
                        </label>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                            <select
                                value={testLabData.selectedDiagnosis}
                                onChange={(e) => handleInputChange('selectedDiagnosis', e.target.value)}
                                style={{
                                    flex: 1,
                                    padding: '6px 10px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '13px'
                                }}
                            >
                                <option value="">Select Lab Test</option>
                                <option value="HT">HT</option>
                                <option value="DM">DM</option>
                                <option value="Common Cold">Common Cold</option>
                                <option value="Fever">Fever</option>
                            </select>
                            <button
                                type="button"
                                onClick={handleAddLabTest}
                                style={{
                                    backgroundColor: '#1976d2',
                                    color: 'white',
                                    border: 'none',
                                    padding: '6px 12px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                ADD
                            </button>
                        </div>
                    </div>

                    {/* Lab Test Table */}
                    {testLabData.labTestRows.length > 0 && (
                        <div style={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden', marginBottom: '15px' }}>
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: '60px 1fr 80px' as const, 
                                backgroundColor: '#1976d2', 
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '11px'
                            }}>
                                <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Sr.</div>
                                <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Parameter Name</div>
                                <div style={{ padding: '6px' }}>Action</div>
                            </div>
                            {testLabData.labTestRows.map((row, index) => (
                                <div key={row.id} style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: '60px 1fr 80px' as const,
                                    backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                                    borderBottom: '1px solid #e0e0e0'
                                }}>
                                    <div style={{ padding: '6px', borderRight: '1px solid #e0e0e0', fontSize: '12px' }}>{index + 1}</div>
                                    <div style={{ padding: '6px', borderRight: '1px solid #e0e0e0', fontSize: '12px' }}>{row.labTest}</div>
                                    <div style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                                                color: '#000000',
                                                transition: 'color 0.2s'
                                            }}
                                            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.color = '#EF5350'; }}
                                            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.color = '#000000'; }}
                                        >
                                            <Delete fontSize="small" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#1976d2',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#1565c0';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#1976d2';
                        }}
                    >
                        Save
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

export default AddTestLabPopup;
export type { TestLabData, LabTestRow };
