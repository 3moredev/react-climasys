import React, { useState } from 'react';
import { Close, Add, Delete } from '@mui/icons-material';
import { Snackbar } from '@mui/material';

interface AppointmentRow {
    reports_received: any;
    appointmentId?: string;
    sr: number;
    patient: string;
    patientId: string;
    visitDate?: string;
    age: number;
    gender: string;
    contact: string;
    time: string;
    provider: string;
    online: string;
    statusColor: string;
    status: string;
    lastOpd: string;
    labs: string;
    doctorId?: string;
    visitNumber?: number;
    shiftId?: number;
    clinicId?: string;
    actions: boolean;
    gender_description?: string;
}

interface LabTestEntryProps {
    open: boolean;
    onClose: () => void;
    patientData: AppointmentRow | null;
}

interface LabTestResult {
    id: string;
    labTestName: string;
    parameterName: string;
    value: string;
}

const LabTestEntry: React.FC<LabTestEntryProps> = ({ open, onClose, patientData }) => {
    const [formData, setFormData] = useState({
        labName: '',
        labDoctorName: '',
        reportDate: '',
        comment: '',
        selectedLabTest: ''
    });

    const [labTestResults, setLabTestResults] = useState<LabTestResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // Lab test options
    const labTestOptions = [
        'Blood Test',
        'Urine Test',
        'X-Ray',
        'CT Scan',
        'MRI',
        'ECG',
        'Ultrasound',
        'Biopsy',
        'Culture Test',
        'Thyroid Test',
        'Diabetes Test',
        'Liver Function Test',
        'Kidney Function Test',
        'Lipid Profile',
        'Complete Blood Count'
    ];

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAddResult = () => {
        if (!formData.selectedLabTest) {
            setSnackbarMessage('Please select a lab test first');
            setSnackbarOpen(true);
            return;
        }

        const newResult: LabTestResult = {
            id: Date.now().toString(),
            labTestName: formData.selectedLabTest,
            parameterName: '',
            value: ''
        };

        setLabTestResults(prev => [...prev, newResult]);
        setFormData(prev => ({ ...prev, selectedLabTest: '' }));
    };

    const handleResultChange = (id: string, field: keyof LabTestResult, value: string) => {
        setLabTestResults(prev => 
            prev.map(result => 
                result.id === id ? { ...result, [field]: value } : result
            )
        );
    };

    const handleRemoveResult = (id: string) => {
        setLabTestResults(prev => prev.filter(result => result.id !== id));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Validate required fields
            if (!formData.labName || !formData.labDoctorName || !formData.reportDate) {
                throw new Error('Please fill in all required fields');
            }

            if (labTestResults.length === 0) {
                throw new Error('Please add at least one lab test result');
            }

            // Validate lab test results
            const incompleteResults = labTestResults.some(result => 
                !result.parameterName || !result.value
            );

            if (incompleteResults) {
                throw new Error('Please fill in all parameter names and values');
            }

            // Here you would typically make an API call to save the lab test data
            console.log('Lab Test Data to Submit:', {
                patientData,
                formData,
                labTestResults
            });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            setSuccess('Lab test entry submitted successfully!');
            setSnackbarMessage('Lab test entry submitted successfully!');
            setSnackbarOpen(true);
            
            // Reset form after successful submission
            handleReset();
            
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            setSnackbarMessage(errorMessage);
            setSnackbarOpen(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            labName: '',
            labDoctorName: '',
            reportDate: '',
            comment: '',
            selectedLabTest: ''
        });
        setLabTestResults([]);
        setError(null);
        setSuccess(null);
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = date.toLocaleString('default', { month: 'short' });
        const year = String(date.getFullYear()).slice(-2);
        return `${day}-${month}-${year}`;
    };

    if (!open || !patientData) return null;

    return (
        <>
            {open && (
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
                        zIndex: 10000,
                    }}
                    onClick={onClose}
                >
                    <div
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            maxWidth: '1400px',
                            width: '98%',
                            maxHeight: '95vh',
                            overflow: 'auto',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Section */}
                        <div style={{
                            background: 'white',
                            padding: '15px 20px',
                            borderBottom: '1px solid #e0e0e0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            position: 'sticky',
                            top: 0,
                            zIndex: 1000
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ 
                                    color: '#4caf50', 
                                    fontSize: '16px', 
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <span>{patientData.patient}</span>
                                    <span>/</span>
                                    <span>{patientData.gender}</span>
                                    <span>/</span>
                                    <span>{patientData.age} Y</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ 
                                    color: '#666', 
                                    fontSize: '14px',
                                    textAlign: 'right'
                                }}>
                                    <div>Dr.Tangaonkar</div>
                                </div>
                                <button
                                    onClick={onClose}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '8px',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#666',
                                        fontSize: '18px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    <Close />
                                </button>
                            </div>
                        </div>

                        {/* Form Content */}
                        <div style={{ padding: '20px', flex: 1, overflow: 'auto' }}>
                            {/* Lab Report Information Section */}
                            <div style={{ marginBottom: '30px' }}>
                                {/* <h3 style={{ 
                                    color: '#1976d2', 
                                    marginBottom: '20px', 
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    borderBottom: '2px solid #1976d2',
                                    paddingBottom: '8px'
                                }}>
                                    Lab Report Information
                                </h3> */}
                                
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                                    gap: '20px',
                                    marginBottom: '20px'
                                }}>
                                    <div>
                                        <label style={{ 
                                            display: 'block', 
                                            marginBottom: '8px', 
                                            fontWeight: '500',
                                            color: '#333'
                                        }}>
                                            Lab Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.labName}
                                            onChange={(e) => handleInputChange('labName', e.target.value)}
                                            placeholder="Lab Name"
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                fontSize: '14px',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ 
                                            display: 'block', 
                                            marginBottom: '8px', 
                                            fontWeight: '500',
                                            color: '#333'
                                        }}>
                                            Lab Doctor Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.labDoctorName}
                                            onChange={(e) => handleInputChange('labDoctorName', e.target.value)}
                                            placeholder="Doctor Name"
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                fontSize: '14px',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ 
                                            display: 'block', 
                                            marginBottom: '8px', 
                                            fontWeight: '500',
                                            color: '#333'
                                        }}>
                                            Report Date *
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.reportDate}
                                            onChange={(e) => handleInputChange('reportDate', e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                fontSize: '14px',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ 
                                            display: 'block', 
                                            marginBottom: '8px', 
                                            fontWeight: '500',
                                            color: '#333'
                                        }}>
                                            Lab Test
                                        </label>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <select
                                                value={formData.selectedLabTest}
                                                onChange={(e) => handleInputChange('selectedLabTest', e.target.value)}
                                                style={{
                                                    flex: 1,
                                                    padding: '12px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '4px',
                                                    fontSize: '14px',
                                                    boxSizing: 'border-box'
                                                }}
                                            >
                                                <option value="">Select lab Test</option>
                                                {labTestOptions.map(option => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={handleAddResult}
                                                style={{
                                                    backgroundColor: '#1976d2',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '12px 20px',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    fontWeight: '500',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#1565c0';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#1976d2';
                                                }}
                                            >
                                                <Add style={{ fontSize: '16px' }} />
                                                Add Results
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ 
                                        display: 'block', 
                                        marginBottom: '8px', 
                                        fontWeight: '500',
                                        color: '#333'
                                    }}>
                                        Comment
                                    </label>
                                    <textarea
                                        value={formData.comment}
                                        onChange={(e) => handleInputChange('comment', e.target.value)}
                                        placeholder="Comment"
                                        rows={3}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px',
                                            boxSizing: 'border-box',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Enter Results Section */}
                            {labTestResults.length > 0 && (
                                <div>
                                    <div style={{
                                        backgroundColor: '#1976d2',
                                        color: 'white',
                                        padding: '12px 16px',
                                        borderRadius: '4px 4px 0 0',
                                        fontWeight: '600',
                                        fontSize: '16px'
                                    }}>
                                        Enter Results
                                    </div>
                                    
                                    <div style={{
                                        border: '1px solid #ddd',
                                        borderTop: 'none',
                                        borderRadius: '0 0 4px 4px',
                                        overflow: 'hidden'
                                    }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#f5f5f5' }}>
                                                    <th style={{ 
                                                        padding: '12px', 
                                                        textAlign: 'left', 
                                                        borderBottom: '1px solid #ddd',
                                                        fontWeight: '600',
                                                        color: '#333'
                                                    }}>
                                                        Lab Test Name
                                                    </th>
                                                    <th style={{ 
                                                        padding: '12px', 
                                                        textAlign: 'left', 
                                                        borderBottom: '1px solid #ddd',
                                                        fontWeight: '600',
                                                        color: '#333'
                                                    }}>
                                                        Parameter Name
                                                    </th>
                                                    <th style={{ 
                                                        padding: '12px', 
                                                        textAlign: 'left', 
                                                        borderBottom: '1px solid #ddd',
                                                        fontWeight: '600',
                                                        color: '#333'
                                                    }}>
                                                        Value / Results
                                                    </th>
                                                    <th style={{ 
                                                        padding: '12px', 
                                                        textAlign: 'center', 
                                                        borderBottom: '1px solid #ddd',
                                                        fontWeight: '600',
                                                        color: '#333'
                                                    }}>
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {labTestResults.map((result) => (
                                                    <tr key={result.id}>
                                                        <td style={{ 
                                                            padding: '12px', 
                                                            borderBottom: '1px solid #eee',
                                                            color: '#666'
                                                        }}>
                                                            {result.labTestName}
                                                        </td>
                                                        <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                                                            <input
                                                                type="text"
                                                                value={result.parameterName}
                                                                onChange={(e) => handleResultChange(result.id, 'parameterName', e.target.value)}
                                                                placeholder="Parameter Name"
                                                                style={{
                                                                    width: '100%',
                                                                    padding: '8px',
                                                                    border: '1px solid #ddd',
                                                                    borderRadius: '4px',
                                                                    fontSize: '14px',
                                                                    boxSizing: 'border-box'
                                                                }}
                                                            />
                                                        </td>
                                                        <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                                                            <input
                                                                type="text"
                                                                value={result.value}
                                                                onChange={(e) => handleResultChange(result.id, 'value', e.target.value)}
                                                                placeholder="Value / Results"
                                                                style={{
                                                                    width: '100%',
                                                                    padding: '8px',
                                                                    border: '1px solid #ddd',
                                                                    borderRadius: '4px',
                                                                    fontSize: '14px',
                                                                    boxSizing: 'border-box'
                                                                }}
                                                            />
                                                        </td>
                                                        <td style={{ 
                                                            padding: '12px', 
                                                            borderBottom: '1px solid #eee',
                                                            textAlign: 'center'
                                                        }}>
                                                            <button
                                                                onClick={() => handleRemoveResult(result.id)}
                                                                style={{
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    color: '#f44336',
                                                                    padding: '8px',
                                                                    borderRadius: '4px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.backgroundColor = '#ffebee';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                                }}
                                                            >
                                                                <Delete style={{ fontSize: '18px' }} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer with Action Buttons */}
                        <div style={{
                            padding: '20px',
                            borderTop: '1px solid #e0e0e0',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px',
                            backgroundColor: '#fafafa'
                        }}>
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                style={{
                                    backgroundColor: isLoading ? '#ccc' : '#1976d2',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 24px',
                                    borderRadius: '4px',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}
                            >
                                {isLoading ? 'Submitting...' : 'Submit'}
                            </button>
                            <button
                                onClick={handleReset}
                                style={{
                                    backgroundColor: '#f5f5f5',
                                    color: '#333',
                                    border: '1px solid #ddd',
                                    padding: '12px 24px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}
                            >
                                Reset
                            </button>
                            <button
                                onClick={handleClose}
                                style={{
                                    backgroundColor: '#f5f5f5',
                                    color: '#333',
                                    border: '1px solid #ddd',
                                    padding: '12px 24px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            />
        </>
    );
};

export default LabTestEntry;
