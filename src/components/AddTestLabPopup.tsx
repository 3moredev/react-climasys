import React, { useState, useEffect } from 'react';
import { Close, Delete } from '@mui/icons-material';
import { useSession } from '../store/hooks/useSession';
import GlobalSnackbar from './GlobalSnackbar';
// Services are now handled by parent component

export interface LabTestRow {
    id: string;
    parameterName: string;
    comment: string;
    parameterId?: string | number;
}

export interface TestLabData {
    labTestName: string;
    priority: string;
    parameterName: string;
    labTestRows: LabTestRow[];
}

interface AddTestLabPopupProps {
    open: boolean;
    onClose: () => void;
    onSave: (testLabData: TestLabData) => boolean | void | Promise<boolean | void>;
    onError?: (message: string) => void;
    editData?: {
        labTestName: string;
        priority: number | string;
        parameters?: LabTestRow[];
    } | null;
    clinicId?: string;
    doctorId?: string;
}

const inputStyle = {
    width: '100%',
    padding: '6px 10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '13px',
    backgroundColor: 'white',
    outline: 'none'
};

const btnStyle = (bg = '#1E88E5') => ({
    padding: '8px 16px',
    backgroundColor: bg,
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s'
});

const AddTestLabPopup: React.FC<AddTestLabPopupProps> = ({ open, onClose, onSave, editData, clinicId, doctorId }) => {
    const session = useSession();
    const [testLabData, setTestLabData] = useState<TestLabData>({
        labTestName: '',
        priority: '',
        parameterName: '',
        labTestRows: []
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!open) return;
        setTestLabData({
            labTestName: editData?.labTestName || '',
            priority: String(editData?.priority || ''),
            parameterName: '',
            labTestRows: editData?.parameters?.map(param => ({
                id: param.id || `param_${Date.now()}_${Math.random()}`,
                parameterName: param.parameterName || '',
                comment: param.comment || '',
                parameterId: (param as any).parameterId
            })) || []
        });
    }, [open, editData]);

    const handleInputChange = (field: keyof TestLabData, value: string) => {
        setTestLabData(prev => ({ ...prev, [field]: value }));
    };

    const showSnackbar = (message: string) => setSnackbar({ open: true, message });

    const handleAddParameter = () => {
        const name = testLabData.parameterName.trim();
        if (!name) return showSnackbar('Please enter a parameter name');

        if (testLabData.labTestRows.some(row => row.parameterName.trim().toLowerCase() === name.toLowerCase())) {
            return showSnackbar('This parameter already exists in the list');
        }

        setTestLabData(prev => ({
            ...prev,
            labTestRows: [...prev.labTestRows, { id: `param_${Date.now()}`, parameterName: name, comment: '' }],
            parameterName: ''
        }));
    };

    const isValidId = (id: any) => id !== undefined && id !== null && String(id) !== 'undefined' && String(id) !== 'null' && String(id).trim() !== '';

    const handleRemoveParameter = (id: string) => {
        setTestLabData(prev => ({ ...prev, labTestRows: prev.labTestRows.filter(row => row.id !== id) }));
    };

    const handleSave = async () => {
        if (!testLabData.labTestName.trim()) return showSnackbar('Lab Test Name is required');
        if (!(clinicId || session.clinicId) || !(doctorId || session.doctorId)) {
            return showSnackbar('Clinic ID and Doctor ID are required');
        }

        setIsSaving(true);
        try {
            // All CRUD operations (Create, Update, Delete) are handled by the parent component
            // in the onSave callback. This mimics the "all changes in session" behavior
            // where database commits happen only on final submit.
            const result = await onSave(testLabData);
            if (result !== false) onClose();
        } catch (error: any) {
            console.error('Error saving lab test:', error);
            showSnackbar(error.message || 'Failed to save lab test');
        } finally {
            setIsSaving(false);
        }
    };

    if (!open) return null;

    return (
        <>
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }} onClick={onClose}>
                <div style={{ backgroundColor: 'white', borderRadius: '8px', maxWidth: '800px', width: '90%', maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                    {/* Header */}
                    <div style={{ padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
                        <h3 style={{ margin: 0, color: '#000', fontSize: '18px', fontWeight: 'bold' }}>{editData ? 'Edit Lab Test' : 'Add Lab Test'}</h3>
                        <button onClick={onClose} style={{ ...btnStyle(), width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Close fontSize="small" />
                        </button>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '13px', color: '#333' }}>Lab Test Name <span style={{ color: '#d32f2f' }}>*</span></label>
                            <input type="text" value={testLabData.labTestName} onChange={e => handleInputChange('labTestName', e.target.value)} style={inputStyle} placeholder="Lab test name" />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '13px', color: '#333' }}>Priority <span style={{ color: '#d32f2f' }}>*</span></label>
                            <input type="text" value={testLabData.priority} onChange={e => handleInputChange('priority', e.target.value)} style={inputStyle} placeholder="Priority" />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '13px', color: '#333' }}>Parameter Name *</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    value={testLabData.parameterName}
                                    onChange={e => handleInputChange('parameterName', e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddParameter())}
                                    style={{ ...inputStyle, flex: 1 }}
                                    placeholder="Parameter Name"
                                />
                                <button type="button" onClick={handleAddParameter} style={btnStyle()}>Add Parameter</button>
                            </div>
                        </div>

                        {/* Table */}
                        <div style={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 80px', backgroundColor: '#1E88E5', color: 'white', fontWeight: 'bold', fontSize: '12px' }}>
                                <div style={{ padding: '8px', borderRight: '1px solid rgba(255,255,255,0.2)', textAlign: 'center' }}>Sr.</div>
                                <div style={{ padding: '8px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Parameter Name</div>
                                <div style={{ padding: '8px', textAlign: 'center' }}>Action</div>
                            </div>
                            {testLabData.labTestRows.length > 0 ? testLabData.labTestRows.map((row, index) => (
                                <div key={row.id} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 80px', backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white', borderBottom: '1px solid #e0e0e0' }}>
                                    <div style={{ padding: '8px', borderRight: '1px solid #e0e0e0', fontSize: '12px', textAlign: 'center' }}>{index + 1}</div>
                                    <div style={{ padding: '8px', borderRight: '1px solid #e0e0e0', fontSize: '12px' }}>{row.parameterName}</div>
                                    <div style={{ padding: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <div
                                            onClick={() => handleRemoveParameter(row.id)}
                                            style={{ cursor: 'pointer', color: '#666', borderRadius: '4px', padding: '2px', display: 'flex' }}
                                            onMouseEnter={e => { e.currentTarget.style.color = '#EF5350'; e.currentTarget.style.backgroundColor = '#ffebee'; }}
                                            onMouseLeave={e => { e.currentTarget.style.color = '#666'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                                        >
                                            <Delete fontSize="small" />
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '12px' }}>No parameters added yet</div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{ padding: '0 20px 14px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button onClick={onClose} style={btnStyle()}>Cancel</button>
                        <button onClick={()=>{
                            setTestLabData({
                                labTestName: '',
                                priority: '',
                                parameterName: '',
                                labTestRows: []
                            });
                        }} style={btnStyle()}>Reset</button>
                        <button onClick={handleSave} disabled={isSaving} style={{ ...btnStyle(isSaving ? '#ccc' : '#1E88E5'), cursor: isSaving ? 'not-allowed' : 'pointer' }}>
                            {isSaving ? 'Saving...' : 'Submit'}
                        </button>

                    </div>
                </div>
            </div>
            <GlobalSnackbar show={snackbar.open} message={snackbar.message} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} autoHideDuration={5000} />
        </>
    );
};

export default AddTestLabPopup;
