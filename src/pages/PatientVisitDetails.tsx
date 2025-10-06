import React, { useState } from 'react';
import { Close } from '@mui/icons-material';

interface AppointmentRow {
    reports_received: any;
    appointmentId?: string;
    sr: number;
    patient: string;
    patientId: number;
    age: number;
    contact: string;
    time: string;
    provider: string;
    online: string;
    statusColor: string;
    status: string;
    lastOpd: string;
    labs: string;
    actions: boolean;
    gender_description?: string;
}

interface PatientVisitDetailsProps {
    open: boolean;
    onClose: () => void;
    patientData: AppointmentRow | null;
}

const PatientVisitDetails: React.FC<PatientVisitDetailsProps> = ({ open, onClose, patientData }) => {
    const [formData, setFormData] = useState({
        referralBy: 'Self',
        referralName: '',
        referralContact: '',
        referralEmail: '',
        referralAddress: '',
        pulse: '',
        height: '',
        weight: '',
        bmi: '',
        bp: '',
        sugar: '',
        tft: '',
        pastSurgicalHistory: '',
        previousVisitPlan: '',
        chiefComplaint: '',
        visitComments: '',
        currentMedicines: '',
        selectedComplaint: '',
        attachments: [] as File[]
    });

    const [visitType, setVisitType] = useState({
        inPerson: true,
        followUp: true,
        followUpType: ''
    });

    if (!open || !patientData) return null;

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setFormData(prev => ({ ...prev, attachments: files.slice(0, 3) }));
    };

    const handleSubmit = () => {
        console.log('Form submitted:', { formData, visitType });
        if (onClose) onClose();
    };

    const handleReset = () => {
        setFormData({
            referralBy: 'Self',
            referralName: '',
            referralContact: '',
            referralEmail: '',
            referralAddress: '',
            pulse: '',
            height: '',
            weight: '',
            bmi: '',
            bp: '',
            sugar: '',
            tft: '',
            pastSurgicalHistory: '',
            previousVisitPlan: '',
            chiefComplaint: '',
            visitComments: '',
            currentMedicines: '',
            selectedComplaint: '',
            attachments: []
        });
        setVisitType({
            inPerson: true,
            followUp: true,
            followUpType: ''
        });
    };

    return (
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
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                    fontFamily: "'Roboto', sans-serif",
                    color: '#212121',
                    fontSize: '0.9rem'
                }}>
                    {/* Title and Close Button Row */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '10px'
                    }}>
                <h3 style={{ margin: 0, color: '#000000', fontSize: '20px', fontWeight: 'bold' }}>
                    Patient Visit Details
                </h3>
                        {onClose && (
                        <button
                            onClick={onClose}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '5px',
                                borderRadius: '8px',
                                color: '#fff',
                                backgroundColor: '#1976d2',
                                width: '36px',
                                height: '36px',
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
                        )}
                    </div>
                    
                    {/* Patient Info, Doctor Info and Visit Type Row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                        <div style={{ color: '#2e7d32', fontSize: '14px', fontWeight: '500' }}>
                            {patientData.patient} / {(patientData as any).gender_description || 'N/A'} / {patientData.age === 0 ? 'Unknown' : patientData.age} Y / {patientData.contact || 'N/A'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                            <div style={{ color: '#1565c0', fontSize: '14px' }}>
                                Dr. Tongaonkar - Medicine
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', whiteSpace: 'nowrap' }}>
                                    <span>In-Person:</span>
                                    <input
                                        type="checkbox"
                                        checked={visitType.inPerson}
                                        onChange={(e) => setVisitType(prev => ({ ...prev, inPerson: e.target.checked }))}
                                    />
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', whiteSpace: 'nowrap' }}>
                                    <span>Follow-up:</span>
                                    <input
                                        type="checkbox"
                                        checked={visitType.followUp}
                                        onChange={(e) => setVisitType(prev => ({ ...prev, followUp: e.target.checked }))}
                                    />
                                </label>
                                <span style={{ fontSize: '12px' }}>
                                    Follow-Up Type:
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Main Content */}
                <div style={{ padding: '20px', flex: 1, overflow: 'auto', fontFamily: "'Roboto', sans-serif", color: '#212121', fontSize: '0.9rem' }}>
                    {/* Referral Information */}
                    <div style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', gap: '10px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                    Referred By
                                </label>
                                <select
                                    value={formData.referralBy}
                                    onChange={(e) => handleInputChange('referralBy', e.target.value)}
                                    style={{
                                        width: '100%',
                                        height: '32px',
                                        padding: '4px 8px',
                                        border: '2px solid #B7B7B7',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        fontFamily: "'Roboto', sans-serif",
                                        fontWeight: '500',
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1E88E5';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#B7B7B7';
                                    }}
                                >
                                    <option value="Self">Self</option>
                                    <option value="Doctor">Doctor</option>
                                    <option value="Hospital">Hospital</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                    Referral Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Doctor Name"
                                    value={formData.referralName}
                                    onChange={(e) => handleInputChange('referralName', e.target.value)}
                                    style={{
                                        width: '100%',
                                        height: '32px',
                                        padding: '4px 8px',
                                        border: '2px solid #B7B7B7',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        fontFamily: "'Roboto', sans-serif",
                                        fontWeight: '500',
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1E88E5';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#B7B7B7';
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                    Referral Contact
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contact"
                                    value={formData.referralContact}
                                    onChange={(e) => handleInputChange('referralContact', e.target.value)}
                                    style={{
                                        width: '100%',
                                        height: '32px',
                                        padding: '4px 8px',
                                        border: '2px solid #B7B7B7',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        fontFamily: "'Roboto', sans-serif",
                                        fontWeight: '500',
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1E88E5';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#B7B7B7';
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                    Referral Email
                                </label>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={formData.referralEmail}
                                    onChange={(e) => handleInputChange('referralEmail', e.target.value)}
                                    style={{
                                        width: '100%',
                                        height: '32px',
                                        padding: '4px 8px',
                                        border: '2px solid #B7B7B7',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        fontFamily: "'Roboto', sans-serif",
                                        fontWeight: '500',
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1E88E5';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#B7B7B7';
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                    Referral Address
                                </label>
                                <input
                                    type="text"
                                    placeholder="Address"
                                    value={formData.referralAddress}
                                    onChange={(e) => handleInputChange('referralAddress', e.target.value)}
                                    style={{
                                        width: '100%',
                                        height: '32px',
                                        padding: '4px 8px',
                                        border: '2px solid #B7B7B7',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        fontFamily: "'Roboto', sans-serif",
                                        fontWeight: '500',
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1E88E5';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#B7B7B7';
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                    Pulse (/min)
                                </label>
                                <input
                                    type="number"
                                    placeholder="Pulse"
                                    value={formData.pulse}
                                    onChange={(e) => handleInputChange('pulse', e.target.value)}
                                    style={{
                                        width: '100%',
                                        height: '32px',
                                        padding: '4px 8px',
                                        border: '2px solid #B7B7B7',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        fontFamily: "'Roboto', sans-serif",
                                        fontWeight: '500',
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1E88E5';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#B7B7B7';
                                    }}
                                />
                            </div>
                            
                        </div>
                    </div>
                    
                    {/* Vital Signs */}
                    <div style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', gap: '10px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                    Height (Cm)
                                </label>
                                <input
                                    type="number"
                                    placeholder="Height"
                                    value={formData.height}
                                    onChange={(e) => handleInputChange('height', e.target.value)}
                                    style={{
                                        width: '100%',
                                        height: '32px',
                                        padding: '4px 8px',
                                        border: '2px solid #B7B7B7',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        fontFamily: "'Roboto', sans-serif",
                                        fontWeight: '500',
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1E88E5';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#B7B7B7';
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                    Weight (Kg)
                                </label>
                                <input
                                    type="number"
                                    placeholder="Weight"
                                    value={formData.weight}
                                    onChange={(e) => handleInputChange('weight', e.target.value)}
                                    style={{
                                        width: '100%',
                                        height: '32px',
                                        padding: '4px 8px',
                                        border: '2px solid #B7B7B7',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        fontFamily: "'Roboto', sans-serif",
                                        fontWeight: '500',
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1E88E5';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#B7B7B7';
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                    BMI
                                </label>
                                <input
                                    type="number"
                                    placeholder="BMI"
                                    value={formData.bmi}
                                    onChange={(e) => handleInputChange('bmi', e.target.value)}
                                    style={{
                                        width: '100%',
                                        height: '32px',
                                        padding: '4px 8px',
                                        border: '2px solid #B7B7B7',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        fontFamily: "'Roboto', sans-serif",
                                        fontWeight: '500',
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1E88E5';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#B7B7B7';
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                    BP
                                </label>
                                <input
                                    type="text"
                                    placeholder="BP"
                                    value={formData.bp}
                                    onChange={(e) => handleInputChange('bp', e.target.value)}
                                    style={{
                                        width: '100%',
                                        height: '32px',
                                        padding: '4px 8px',
                                        border: '2px solid #B7B7B7',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        fontFamily: "'Roboto', sans-serif",
                                        fontWeight: '500',
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1E88E5';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#B7B7B7';
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                    Sugar
                                </label>
                                <input
                                    type="number"
                                    placeholder="Sugar"
                                    value={formData.sugar}
                                    onChange={(e) => handleInputChange('sugar', e.target.value)}
                                    style={{
                                        width: '100%',
                                        height: '32px',
                                        padding: '4px 8px',
                                        border: '2px solid #B7B7B7',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        fontFamily: "'Roboto', sans-serif",
                                        fontWeight: '500',
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1E88E5';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#B7B7B7';
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                    TFT
                                </label>
                                <input
                                    type="text"
                                    placeholder="TFT"
                                    value={formData.tft}
                                    onChange={(e) => handleInputChange('tft', e.target.value)}
                                    style={{
                                        width: '100%',
                                        height: '32px',
                                        padding: '4px 8px',
                                        border: '2px solid #B7B7B7',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        fontFamily: "'Roboto', sans-serif",
                                        fontWeight: '500',
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1E88E5';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#B7B7B7';
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* History and Plans */}
                    <div style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                    Past Surgical History
                                </label>
                                <textarea
                                    value={formData.pastSurgicalHistory}
                                    onChange={(e) => handleInputChange('pastSurgicalHistory', e.target.value)}
                                    rows={2}
                                    style={{
                                        width: '100%',
                                        padding: '4px 8px',
                                        border: '2px solid #B7B7B7',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        fontFamily: "'Roboto', sans-serif",
                                        fontWeight: '500',
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        resize: 'vertical',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1E88E5';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#B7B7B7';
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                    Previous Visit Plan
                            </label>
                                <textarea
                                    value={formData.previousVisitPlan}
                                    onChange={(e) => handleInputChange('previousVisitPlan', e.target.value)}
                                    rows={2}
                                    style={{
                                        width: '100%',
                                        padding: '4px 8px',
                                        border: '2px solid #B7B7B7',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        fontFamily: "'Roboto', sans-serif",
                                        fontWeight: '500',
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        resize: 'vertical',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1E88E5';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#B7B7B7';
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                    Chief complaint entered by patient
                                </label>
                                <textarea
                                    value={formData.chiefComplaint}
                                    onChange={(e) => handleInputChange('chiefComplaint', e.target.value)}
                                    rows={2}
                                    style={{
                                        width: '100%',
                                        padding: '4px 8px',
                                        border: '2px solid #B7B7B7',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        fontFamily: "'Roboto', sans-serif",
                                        fontWeight: '500',
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        resize: 'vertical',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1E88E5';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#B7B7B7';
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '10px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                    Visit Comments
                                </label>
                                <textarea
                                    value={formData.visitComments}
                                    onChange={(e) => handleInputChange('visitComments', e.target.value)}
                                    rows={2}
                                    style={{
                                        width: '100%',
                                        padding: '4px 8px',
                                        border: '2px solid #B7B7B7',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        fontFamily: "'Roboto', sans-serif",
                                        fontWeight: '500',
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        resize: 'vertical',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1E88E5';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#B7B7B7';
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                    Current Medicines
                                </label>
                                <textarea
                                    value={formData.currentMedicines}
                                    onChange={(e) => handleInputChange('currentMedicines', e.target.value)}
                                    rows={2}
                                    style={{
                                        width: '100%',
                                        padding: '4px 8px',
                                        border: '2px solid #B7B7B7',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        fontFamily: "'Roboto', sans-serif",
                                        fontWeight: '500',
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        resize: 'vertical',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1E88E5';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#B7B7B7';
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 700, color: '#333' }}>
                                    Select Complaints
                                </label>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'end' }}>
                                    <select
                                        value={formData.selectedComplaint}
                                        onChange={(e) => handleInputChange('selectedComplaint', e.target.value)}
                                        style={{
                                            flex: 1,
                                            height: '32px',
                                            padding: '4px 8px',
                                            border: '2px solid #B7B7B7',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            fontFamily: "'Roboto', sans-serif",
                                            fontWeight: '500',
                                            backgroundColor: 'white',
                                            outline: 'none',
                                            transition: 'border-color 0.2s'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#1E88E5';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#B7B7B7';
                                        }}
                                    >
                                        <option value="">Select Complaint</option>
                                        <option value="fever">Fever</option>
                                        <option value="cough">Cough</option>
                                        <option value="headache">Headache</option>
                                        <option value="chest-pain">Chest Pain</option>
                                    </select>
                                    <button
                                        style={{
                                            padding: '0 10px',
                                            backgroundColor: '#1976d2',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            height: '32px',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#1565c0';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#1976d2';
                                        }}
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Attachments */}
                    <div style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold', color: '#333' }}>
                                    Attachments (Max 3):
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    style={{
                                        width: '100%',
                                        height: '32px',
                                        padding: '4px 8px',
                                        border: '2px solid #B7B7B7',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontFamily: "'Roboto', sans-serif",
                                        fontWeight: '500',
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1E88E5';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#B7B7B7';
                                    }}
                                />
                                <div style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
                                    {formData.attachments.length > 0 
                                        ? `${formData.attachments.length} file(s) selected`
                                        : 'No file chosen'
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Footer */}
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
                        onClick={handleReset}
                        style={{
                            padding: '10px 20px',
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
                        Reset
                    </button>
                    <button
                        onClick={handleSubmit}
                        style={{
                            padding: '10px 20px',
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
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PatientVisitDetails;

// Page wrapper to render via route and accept patientData through location.state
// (Standalone page wrapper removed as per revert request)
