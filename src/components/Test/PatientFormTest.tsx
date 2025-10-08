import React, { useEffect, useState } from 'react';

type PatientFormTestProps = {
    onClose?: () => void;
    initialData?: Partial<PatientFormData>;
    visitDates?: string[];
    currentVisitIndex?: number;
    onVisitDateChange?: (index: number) => void;
};
// Default form data extracted so it can be merged with initialData
type Prescription = {
    medicine: string;
    dosage: string;
    instructions: string;
};

type PatientFormData = {
    // Patient Information
    firstName: string;
    lastName: string;
    age: string;
    gender: string;
    contact: string;
    email: string;
    provider: string;

    // Medical History
    height: string;
    weight: string;
    pulse: string;
    bp: string;
    temperature: string;
    sugar: string;
    tft: string;
    pallorHb: string;
    referredBy: string;

    // Checkboxes
    hypertension: boolean;
    diabetes: boolean;
    cholesterol: boolean;
    ihd: boolean;
    asthma: boolean;
    th: boolean;
    smoking: boolean;
    tobacco: boolean;
    alcohol: boolean;
    inPerson: boolean;

    // Medical Details
    allergy: string;
    medicalHistory: string;
    surgicalHistory: string;
    visitComments: string;
    medicines: string;
    detailedHistory: string;
    examinationFindings: string;
    examinationComments: string;
    procedurePerformed: string;

    // Current Visit
    complaints: string;
    provisionalDiagnosis: string;
    plan: string;
    addendum: string;

    // New current visit fields
    labSuggested: string;
    dressing: string;
    procedure: string;

    // Prescriptions
    prescriptions: Prescription[];

    // Billing
    billed: string;
    discount: string;
    dues: string;
    collected: string;
    receiptAmount: string;
    receiptNo: string;
    receiptDate: string;
    followUpType: string;
    followUp: string;
    followUpDate: string;
    remark: string;
};

const defaultFormData: PatientFormData = {
    // Patient Information
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    contact: '',
    email: '',
    provider: '',
    
    // Medical History
    height: '',
    weight: '',
    pulse: '',
    bp: '',
    temperature: '',
    sugar: '',
    tft: '',
    pallorHb: '',
    referredBy: '',
    
    // Checkboxes
    hypertension: false,
    diabetes: false,
    cholesterol: false,
    ihd: false,
    asthma: false,
    th: false,
    smoking: false,
    tobacco: false,
    alcohol: false,
    inPerson: false,
    
    // Medical Details
    allergy: '',
    medicalHistory: '',
    surgicalHistory: '',
    visitComments: '',
    medicines: '',
    detailedHistory: '',
    examinationFindings: '',
    examinationComments: '',
    procedurePerformed: '',
    
    // Current Visit
    complaints: '',
    provisionalDiagnosis: '',
    plan: '',
    addendum: '',

    // New current visit fields
    labSuggested: '',
    dressing: '',
    procedure: '',
    
    // Prescriptions
    prescriptions: [],
    
    // Billing
    billed: '',
    discount: '',
    dues: '',
    collected: '',
    receiptAmount: '',
    receiptNo: '',
    receiptDate: '',
    followUpType: '',
    followUp: '',
    followUpDate: '',
    remark: ''
};

const PatientFormTest: React.FC<PatientFormTestProps> = ({ 
    onClose, 
    initialData, 
    visitDates = [], 
    currentVisitIndex = 0, 
    onVisitDateChange 
}) => {
    const [formData, setFormData] = useState<PatientFormData>({
        ...defaultFormData,
        ...(initialData || {})
    });

    // Debug logging to see what data is being passed
    useEffect(() => {
        console.log('PatientFormTest initialData:', initialData);
        console.log('PatientFormTest formData:', formData);
        console.log('Provider field:', formData.provider);
        console.log('Visit dates:', visitDates);
        console.log('Current visit index:', currentVisitIndex);
    }, [initialData, formData, visitDates, currentVisitIndex]);

    // Sync form data when a new visit (initialData) is provided by parent
    useEffect(() => {
        if (initialData) {
            setFormData({
                ...defaultFormData,
                ...initialData
            });
        }
    }, [initialData]);

    const isReadOnly = true;

    // Prescriptions: seed dummy data when none provided
    useEffect(() => {
        const noIncoming = !initialData || !Array.isArray(initialData.prescriptions) || initialData.prescriptions.length === 0;
        if (noIncoming && formData.prescriptions.length === 0) {
            const dummy = [
                { medicine: 'BIO D3 PLUS', dosage: '0-0-1 (10 Days)', instructions: 'खाण्यानंतर / AFTER MEAL' },
                { medicine: 'DYTOR 5', dosage: '1-0-0 (10 Days)', instructions: 'खाण्यानंतर / AFTER MEAL' },
                { medicine: 'EZACT 90', dosage: '0-1-0 (5 Days)', instructions: 'खाण्यानंतर / AFTER MEAL' },
                { medicine: 'RABIPLUS D', dosage: '1-0-0 (10 Days)', instructions: 'खाण्यापूर्वी / BEFORE MEAL' },
                { medicine: 'VALAMIN FORTE', dosage: '1-0-0 (10 Days)', instructions: 'खाण्यानंतर / AFTER MEAL' }
            ];
            setFormData(prev => ({ ...prev, prescriptions: dummy }));
        }
    // We only want to seed once, when there are no prescriptions
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Ensure prescriptions update with visit navigation regardless of other data
    useEffect(() => {
        const incoming = (initialData && Array.isArray(initialData.prescriptions)) ? (initialData.prescriptions as any[]) : [];
        const dummy = [
            { medicine: 'BIO D3 PLUS', dosage: '0-0-1 (10 Days)', instructions: 'खाण्यानंतर / AFTER MEAL' },
            { medicine: 'DYTOR 5', dosage: '1-0-0 (10 Days)', instructions: 'खाण्यानंतर / AFTER MEAL' },
            { medicine: 'EZACT 90', dosage: '0-1-0 (5 Days)', instructions: 'खाण्यानंतर / AFTER MEAL' },
            { medicine: 'RABIPLUS D', dosage: '1-0-0 (10 Days)', instructions: 'खाण्यापूर्वी / BEFORE MEAL' },
            { medicine: 'VALAMIN FORTE', dosage: '1-0-0 (10 Days)', instructions: 'खाण्यानंतर / AFTER MEAL' }
        ];
        setFormData(prev => ({
            ...prev,
            prescriptions: incoming.length > 0 ? incoming : dummy
        }));
    }, [initialData?.prescriptions, currentVisitIndex]);

    const formatDate = (d: Date): string => {
        const dd = String(d.getDate()).padStart(2, '0');
        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const mmm = monthNames[d.getMonth()];
        const yy = String(d.getFullYear()).slice(-2);
        return `${dd} - ${mmm} - ${yy}`;
    };

    const formatVisitDate = (dateString: string): string => {
        if (!dateString) return '';
        try {
            // Handle different date formats
            let date: Date;
            if (dateString.includes('-')) {
                // Handle formats like "28-Jun-2025" or "2025-06-28"
                if (dateString.includes('Jun') || dateString.includes('Jan') || dateString.includes('Feb') || 
                    dateString.includes('Mar') || dateString.includes('Apr') || dateString.includes('May') ||
                    dateString.includes('Jul') || dateString.includes('Aug') || dateString.includes('Sep') ||
                    dateString.includes('Oct') || dateString.includes('Nov') || dateString.includes('Dec')) {
                    // Format: "28-Jun-2025"
                    date = new Date(dateString);
                } else {
                    // Format: "2025-06-28"
                    date = new Date(dateString);
                }
            } else {
                date = new Date(dateString);
            }
            
            if (isNaN(date.getTime())) {
                return dateString; // Return original if parsing fails
            }
            
            return formatDate(date);
        } catch (error) {
            console.error('Error formatting visit date:', error, dateString);
            return dateString;
        }
    };

    const navigateVisitDate = (direction: 'prev' | 'next') => {
        if (!onVisitDateChange || visitDates.length === 0) return;
        
        let newIndex = currentVisitIndex;
        if (direction === 'prev' && currentVisitIndex > 0) {
            newIndex = currentVisitIndex - 1;
        } else if (direction === 'next' && currentVisitIndex < visitDates.length - 1) {
            newIndex = currentVisitIndex + 1;
        }
        
        if (newIndex !== currentVisitIndex) {
            onVisitDateChange(newIndex);
        }
    };

    const getCurrentVisitDate = (): string => {
        if (visitDates.length === 0 || currentVisitIndex >= visitDates.length) {
            return formatDate(new Date());
        }
        return formatVisitDate(visitDates[currentVisitIndex]);
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCheckboxChange = (field: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: !prev[field as keyof typeof prev]
        }));
    };

    // Auto-resize any textarea marked with data-autosize="true"
    useEffect(() => {
        const resizeAll = () => {
            const areas = document.querySelectorAll<HTMLTextAreaElement>('textarea[data-autosize="true"]');
            areas.forEach((ta) => {
                ta.style.height = 'auto';
                ta.style.height = `${ta.scrollHeight}px`;
            });
        };
        // resize after mount and on window resize
        resizeAll();
        window.addEventListener('resize', resizeAll);
        return () => window.removeEventListener('resize', resizeAll);
    }, []);

    const handleAutoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
    };

    const addPrescription = () => {
        setFormData(prev => ({
            ...prev,
            prescriptions: [...prev.prescriptions, { medicine: '', dosage: '', instructions: '' }]
        }));
    };

    const removePrescription = (index: number) => {
        setFormData(prev => ({
            ...prev,
            prescriptions: prev.prescriptions.filter((_, i) => i !== index)
        }));
    };

    const updatePrescription = (index: number, field: keyof Prescription, value: string) => {
        setFormData(prev => ({
            ...prev,
            prescriptions: prev.prescriptions.map((prescription, i) => 
                i === index ? { ...prescription, [field]: value } : prescription
            )
        }));
    };

    return (
        <div style={{ 
            fontFamily: "'Roboto', sans-serif", 
            backgroundColor: '#f5f5f5', 
            minHeight: '100%', 
            // padding: '12px' 
        }}>
            <div style={{ 
                maxWidth: '100%', 
                width: '100%',
                margin: '0 auto', 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                padding: '15px'
            }}>
                {/* Header */}
                <div style={{ 
                    borderBottom: '2px solid #e0e0e0', 
                    paddingBottom: '10px', 
                    marginBottom: '10px',
                    marginLeft: 0,
                    marginRight: 0
                }}>
                    <h2 style={{ 
                        color: '#000000', 
                        fontSize: '1.4rem', 
                        fontWeight: 'bold', 
                        margin: '0 0 10px 0',   
                        fontFamily: "'Roboto', sans-serif"
                    }}>
                        Previous Visits
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                        <div style={{ 
                            color: '#2E7D32', 
                            fontSize: '1rem', 
                            fontWeight: '100',
                            fontFamily: "'Roboto', sans-serif"
                        }}>
                            {formData.firstName} {formData.lastName} / {formData.gender} / {formData.age} Y / {formData.contact}
                        </div>
                        {/* Visit Date Navigator */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                                onClick={() => navigateVisitDate('prev')}
                                disabled={currentVisitIndex <= 0}
                                style={{
                                    backgroundColor: currentVisitIndex <= 0 ? 'rgb(221, 221, 221)' : '#000000',
                                    border: '1px solid #90CAF9',
                                    color: '#000',
                                    padding: '6px 10px',
                                    borderRadius: '4px',
                                    cursor: currentVisitIndex <= 0 ? 'not-allowed' : 'pointer',
                                    fontFamily: "'Roboto', sans-serif",
                                    fontWeight: 600,
                                    opacity: currentVisitIndex <= 0 ? 0.5 : 1
                                }}
                                aria-label="Previous visit"
                                title="Previous visit"
                            >
                                ◀
                            </button>
                            <div style={{
                                minWidth: '180px',
                                textAlign: 'center',
                                padding: '6px 8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                backgroundColor: '#fafafa',
                                color: '#212121',
                                fontWeight: 600,
                                fontFamily: "'Roboto', sans-serif"
                            }}>
                                {getCurrentVisitDate()}
                                {visitDates.length > 0 && (
                                    <div style={{ 
                                        fontSize: '1rem', 
                                        color: '#666', 
                                        marginTop: '2px' 
                                    }}>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => navigateVisitDate('next')}
                                disabled={currentVisitIndex >= visitDates.length - 1}
                                style={{
                                    backgroundColor: currentVisitIndex >= visitDates.length - 1 ? 'rgb(221, 221, 221)' : '#000000',
                                    border: '1px solid #90CAF9',
                                    color: '#000',
                                    padding: '6px 10px',
                                    borderRadius: '4px',
                                    cursor: currentVisitIndex >= visitDates.length - 1 ? 'not-allowed' : 'pointer',
                                    fontFamily: "'Roboto', sans-serif",
                                    fontWeight: 600,
                                    opacity: currentVisitIndex >= visitDates.length - 1 ? 0.5 : 1
                                }}
                                aria-label="Next visit"
                                title="Next visit"
                            >
                                ▶
                            </button>
                        </div>
                        <div style={{ 
                            color: 'rgb(21, 101, 192)', 
                            fontSize: '0.95rem', 
                            fontWeight: '100',
                            // marginTop: '0px',
                            fontFamily: "'Roboto', sans-serif",
                            whiteSpace: 'nowrap'
                        }}>
                            {/* {formData.provider || 'Dr. Tongaonkar'} */}
                            Dr. Tongaonkar
                        </div>
                    </div>
                </div>

                {/* Patient Vitals & History Section (single column) */}
                <div style={{ marginBottom: '20px' }}>
                    {/* <h3 style={{ 
                        color: '#212121', 
                        fontSize: '1.05rem', 
                        fontWeight: '600', 
                        marginBottom: '12px',
                        fontFamily: "'Roboto', sans-serif",
                        borderBottom: '1px solid #e0e0e0',
                        paddingBottom: '8px'
                    }}>
                        Patient Vitals & History
                    </h3> */}
                    
                    <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '12px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <label style={{ color: '#212121', fontSize: '0.9rem', fontWeight: '500', fontFamily: "'Roboto', sans-serif" }}>Referred By:</label>
                            <input
                                type="text"
                                value={formData.referredBy}
                                onChange={(e) => handleInputChange('referredBy', e.target.value)}
                                disabled={isReadOnly}
                                style={{
                                    width: '180px',
                                    padding: '4px 6px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem',
                                    fontFamily: "'Roboto', sans-serif",
                                    backgroundColor: '#fff'
                                }}
                            />
                        </div>
                        {/* Inline groups: will wrap to 2 lines if needed */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <label style={{ color: '#212121', fontSize: '0.9rem', fontWeight: '500', fontFamily: "'Roboto', sans-serif" }}>Height (Cm):</label>
                            <input
                                type="text"
                                value={formData.height}
                                onChange={(e) => handleInputChange('height', e.target.value)}
                                disabled={isReadOnly}
                                style={{
                                    width: '70px',
                                    padding: '4px 6px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem',
                                    fontFamily: "'Roboto', sans-serif",
                                    backgroundColor: '#fff'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <label style={{ color: '#212121', fontSize: '0.9rem', fontWeight: '500', fontFamily: "'Roboto', sans-serif" }}>Weight (Kg):</label>
                            <input
                                type="text"
                                value={formData.weight}
                                onChange={(e) => handleInputChange('weight', e.target.value)}
                                disabled={isReadOnly}
                                style={{
                                    width: '60px',
                                    padding: '4px 6px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem',
                                    fontFamily: "'Roboto', sans-serif",
                                    backgroundColor: '#fff'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <label style={{ color: '#212121', fontSize: '0.9rem', fontWeight: '500', fontFamily: "'Roboto', sans-serif" }}>Pulse (/min):</label>
                            <input
                                type="text"
                                value={formData.pulse}
                                onChange={(e) => handleInputChange('pulse', e.target.value)}
                                disabled={isReadOnly}
                                style={{
                                    width: '60px',
                                    padding: '4px 6px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem',
                                    fontFamily: "'Roboto', sans-serif",
                                    backgroundColor: '#fff'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <label style={{ color: '#212121', fontSize: '0.9rem', fontWeight: '500', fontFamily: "'Roboto', sans-serif" }}>BP:</label>
                            <input
                                type="text"
                                value={formData.bp}
                                onChange={(e) => handleInputChange('bp', e.target.value)}
                                disabled={isReadOnly}
                                style={{
                                    width: '70px',
                                    padding: '4px 6px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem',
                                    fontFamily: "'Roboto', sans-serif",
                                    backgroundColor: '#fff'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <label style={{ color: '#212121', fontSize: '0.9rem', fontWeight: '500', fontFamily: "'Roboto', sans-serif" }}>Temperature:</label>
                            <input
                                type="text"
                                value={formData.temperature}
                                onChange={(e) => handleInputChange('temperature', e.target.value)}
                                disabled={isReadOnly}
                                style={{
                                    width: '50px',
                                    padding: '4px 6px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem',
                                    fontFamily: "'Roboto', sans-serif",
                                    backgroundColor: '#fff'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <label style={{ color: '#212121', fontSize: '0.9rem', fontWeight: '500', fontFamily: "'Roboto', sans-serif" }}>Sugar:</label>
                            <input
                                type="text"
                                value={formData.sugar}
                                onChange={(e) => handleInputChange('sugar', e.target.value)}
                                disabled={isReadOnly}
                                style={{
                                    width: '60px',
                                    padding: '4px 6px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem',
                                    fontFamily: "'Roboto', sans-serif",
                                    backgroundColor: '#fff'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <label style={{ color: '#212121', fontSize: '0.9rem', fontWeight: '500', fontFamily: "'Roboto', sans-serif" }}>TFT:</label>
                            <input
                                type="text"
                                value={formData.tft}
                                onChange={(e) => handleInputChange('tft', e.target.value)}
                                disabled={isReadOnly}
                                style={{
                                    width: '60px',
                                    padding: '4px 6px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem',
                                    fontFamily: "'Roboto', sans-serif",
                                    backgroundColor: '#fff'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <label style={{ color: '#212121', fontSize: '0.9rem', fontWeight: '500', fontFamily: "'Roboto', sans-serif" }}>Pallor/HB:</label>
                            <input
                                type="text"
                                value={formData.pallorHb}
                                onChange={(e) => handleInputChange('pallorHb', e.target.value)}
                                disabled={isReadOnly}
                                style={{
                                    width: '90px',
                                    padding: '4px 6px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem',
                                    fontFamily: "'Roboto', sans-serif",
                                    backgroundColor: '#fff'
                                }}
                            />
                        </div>
                        {/* <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <label style={{ color: '#212121', fontSize: '0.9rem', fontWeight: '500', fontFamily: "'Roboto', sans-serif" }}>Contact:</label>
                                <input
                                    type="text"
                                    value={formData.contact}
                                    onChange={(e) => handleInputChange('contact', e.target.value)}
                                    disabled={isReadOnly}
                                    style={{
                                        width: '160px',
                                        padding: '4px 6px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '0.9rem',
                                        fontFamily: "'Roboto', sans-serif",
                                        backgroundColor: '#fff'
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <label style={{ color: '#212121', fontSize: '0.9rem', fontWeight: '500', fontFamily: "'Roboto', sans-serif" }}>Email:</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    disabled={isReadOnly}
                                    style={{
                                        width: '240px',
                                        padding: '4px 6px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '0.9rem',
                                        fontFamily: "'Roboto', sans-serif",
                                        backgroundColor: '#fff'
                                    }}
                                />
                            </div>
                        </div> */}
                    </div>

                    {/* Conditions (5 per row) */}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(10, 1fr)', 
                        gap: '10px',
                        marginBottom: '20px'
                    }}>
                        {[
                            { key: 'inPerson', label: 'In Person:' },
                            { key: 'hypertension', label: 'Hypertension:' },
                            { key: 'diabetes', label: 'Diabetes:' },
                            { key: 'cholesterol', label: 'Cholesterol:' },
                            { key: 'ihd', label: 'IHD:' },
                            { key: 'asthma', label: 'Asthma:' },
                            { key: 'th', label: 'TH:' },
                            { key: 'smoking', label: 'Smoking:' },
                            { key: 'tobacco', label: 'Tobacco:' },
                            { key: 'alcohol', label: 'Alcohol:' }
                        ].map(({ key, label }) => (
                            <div key={key} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px' 
                            }}>
                                <input
                                    type="checkbox"
                                    checked={formData[key as keyof typeof formData] as boolean}
                                    onChange={() => handleCheckboxChange(key)}
                                    disabled={isReadOnly}
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                        accentColor: '#1E88E5'
                                    }}
                                />
                                <label style={{ 
                                    color: '#212121', 
                                    fontSize: '0.9rem', 
                                    fontWeight: '500',
                                    fontFamily: "'Roboto', sans-serif",
                                    margin: 0
                                }}>
                                    {label}
                                </label>
                            </div>
                        ))}
                    </div>

                    {/* Narrative fields (5 per row, auto-height) */}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(5, 1fr)', 
                        gap: '15px' 
                    }}>
                        {[
                            { key: 'allergy', label: 'Allergy:' },
                            { key: 'medicalHistory', label: 'Medical History:' },
                            { key: 'surgicalHistory', label: 'Surgical History:' },
                            { key: 'visitComments', label: 'Visit Comments:' },
                            { key: 'medicines', label: 'Medicines:' },
                            { key: 'detailedHistory', label: 'Detailed History/Additional Comments:' },
                            { key: 'examinationFindings', label: 'Important/Examination Findings:' },
                            { key: 'examinationComments', label: 'Examination Comments/Detailed History:' },
                            { key: 'procedurePerformed', label: 'Procedure Performed/Notes:' },
                             { key: 'complaints', label: 'Complaints:' },
                             { key: 'provisionalDiagnosis', label: 'Provisional Diagnosis:' },
                             { key: 'plan', label: 'Plan:' },
                             { key: 'addendum', label: 'Addendum:' },
                            { key: 'labSuggested', label: 'Lab Suggested:' },
                            { key: 'dressing', label: 'Dressing:' },
                            { key: 'procedure', label: 'Procedure:' }
                        ].map(({ key, label }) => (
                            <div key={key}>
                                <label style={{ 
                                    display: 'block', 
                                    color: '#212121', 
                                    fontSize: '0.9rem', 
                                    fontWeight: '500',
                                    marginBottom: '5px',
                                    fontFamily: "'Roboto', sans-serif"
                                }}>
                                    {label}
                                </label>
                                <textarea
                                    value={formData[key as keyof typeof formData] as string}
                                    onChange={(e) => { handleInputChange(key, e.target.value); handleAutoResize(e); }}
                                    placeholder={formData[key as keyof typeof formData] ? '' : '-'}
                                    data-autosize="true"
                                    rows={1}
                                    disabled={isReadOnly}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '0.9rem',
                                        fontFamily: "'Roboto', sans-serif",
                                        backgroundColor: '#fff',
                                        overflow: 'hidden',
                                        resize: 'none'
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                {/* <div style={{ borderTop: '2px solid #e0e0e0', margin: '20px 0' }} /> */}

                {/* Current Visit Details (3 per row, auto-height) */}
                <div style={{ marginBottom: '20px' }}>
                    {/* <h3 style={{ 
                        color: '#666', 
                        fontSize: '1.05rem', 
                        fontWeight: '600', 
                        marginBottom: '12px',
                        fontFamily: "'Roboto', sans-serif",
                        borderBottom: '1px solid #e0e0e0',
                        paddingBottom: '8px'
                    }}>
                        Current Visit Details
                    </h3> */}
                    
                    <div style={{ display: 'none' }} />
                </div>

                {/* Prescriptions - compact table with reduced row height */}
                <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ 
                        color: '#212121', 
                        fontSize: '1.2rem', 
                        fontWeight: '600',
                        fontFamily: "'Roboto', sans-serif",
                        borderBottom: '1px solid #e0e0e0',
                        paddingBottom: '10px',
                        marginBottom: '15px'
                    }}>
                        Prescriptions
                    </h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e0e0e0', tableLayout: 'auto' }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '6px', borderBottom: '1px solid #cfcfcf', borderRight: '1px solid #e0e0e0', color: '#666', fontWeight: 600, backgroundColor: '#f5f5f5' }}>Medicine</th>
                                    <th style={{ textAlign: 'left', padding: '6px', borderBottom: '1px solid #cfcfcf', borderRight: '1px solid #e0e0e0', color: '#666', fontWeight: 600, backgroundColor: '#f5f5f5' }}>Dosage</th>
                                    <th style={{ textAlign: 'left', padding: '6px', borderBottom: '1px solid #cfcfcf', color: '#666', fontWeight: 600, backgroundColor: '#f5f5f5' }}>Instructions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formData.prescriptions.map((prescription, index) => (
                                    <tr key={index}>
                                        <td style={{ padding: '4px', borderBottom: '1px solid #eaeaea', borderRight: '1px solid #e0e0e0', verticalAlign: 'top' }}>
                                            <textarea
                                                value={prescription.medicine}
                                                onChange={(e) => { updatePrescription(index, 'medicine', e.target.value); handleAutoResize(e as any); }}
                                                placeholder="Medicine name"
                                                disabled={isReadOnly}
                                                data-autosize="true"
                                                rows={1}
                                                style={{
                                                    width: '100%',
                                                    padding: '6px 8px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '4px',
                                                    fontSize: '0.9rem',
                                                    fontFamily: "'Roboto', sans-serif",
                                                    backgroundColor: '#fff',
                                                    color: '#666',
                                                    overflow: 'hidden',
                                                    resize: 'none'
                                                }}
                                            />
                                        </td>
                                        <td style={{ padding: '4px', borderBottom: '1px solid #eaeaea', borderRight: '1px solid #e0e0e0', verticalAlign: 'top' }}>
                                            <textarea
                                                value={prescription.dosage}
                                                onChange={(e) => { updatePrescription(index, 'dosage', e.target.value); handleAutoResize(e as any); }}
                                                placeholder="Dosage"
                                                disabled={isReadOnly}
                                                data-autosize="true"
                                                rows={1}
                                                style={{
                                                    width: '100%',
                                                    padding: '6px 8px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '4px',
                                                    fontSize: '0.9rem',
                                                    fontFamily: "'Roboto', sans-serif",
                                                    backgroundColor: '#fff',
                                                    color: '#666',
                                                    overflow: 'hidden',
                                                    resize: 'none'
                                                }}
                                            />
                                        </td>
                                        <td style={{ padding: '4px', borderBottom: '1px solid #eaeaea', verticalAlign: 'top' }}>
                                            <textarea
                                                value={prescription.instructions}
                                                onChange={(e) => { updatePrescription(index, 'instructions', e.target.value); handleAutoResize(e as any); }}
                                                placeholder="Instructions"
                                                disabled={isReadOnly}
                                                data-autosize="true"
                                                rows={1}
                                                style={{
                                                    width: '100%',
                                                    padding: '6px 8px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '4px',
                                                    fontSize: '0.9rem',
                                                    fontFamily: "'Roboto', sans-serif",
                                                    backgroundColor: '#fff',
                                                    color: '#666',
                                                    overflow: 'hidden',
                                                    resize: 'none'
                                                }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Billing Details (at the end of the 3-column grid) */}
                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ 
                        color: '#212121', 
                        fontSize: '1.2rem', 
                        fontWeight: '600', 
                        marginBottom: '20px',
                        fontFamily: "'Roboto', sans-serif",
                        borderBottom: '1px solid #e0e0e0',
                        paddingBottom: '10px'
                    }}>
                        Billing & Follow-up Details
                    </h3>
                    
                    <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: '15px'
                    }}>
                        <div style={{ minWidth: 0 }}>
                            <label style={{ 
                                display: 'block', 
                                color: '#212121', 
                                fontSize: '0.9rem', 
                                fontWeight: '600',
                                marginBottom: '5px',
                                fontFamily: "'Roboto', sans-serif"
                            }}>
                                Billed (Rs):
                            </label>
                            <input
                                type="text"
                                value={formData.billed}
                                onChange={(e) => handleInputChange('billed', e.target.value)}
                                disabled={isReadOnly}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem',
                                    fontFamily: "'Roboto', sans-serif",
                                    backgroundColor: '#fff'
                                }}
                            />
                        </div>
                        
                        <div style={{ minWidth: 0 }}>
                            <label style={{ 
                                display: 'block', 
                                color: '#212121', 
                                fontSize: '0.9rem', 
                                fontWeight: '600',
                                marginBottom: '5px',
                                fontFamily: "'Roboto', sans-serif"
                            }}>
                                Discount (Rs):
                            </label>
                            <input
                                type="text"
                                value={formData.discount}
                                onChange={(e) => handleInputChange('discount', e.target.value)}
                                disabled={isReadOnly}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem',
                                    fontFamily: "'Roboto', sans-serif",
                                    backgroundColor: '#fff'
                                }}
                            />
                        </div>
                        
                        <div style={{ minWidth: 0 }}>
                            <label style={{ 
                                display: 'block', 
                                color: '#212121', 
                                fontSize: '0.9rem', 
                                fontWeight: '600',
                                marginBottom: '5px',
                                fontFamily: "'Roboto', sans-serif"
                            }}>
                                Dues (Rs):
                            </label>
                            <input
                                type="text"
                                value={formData.dues}
                                onChange={(e) => handleInputChange('dues', e.target.value)}
                                disabled={isReadOnly}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem',
                                    fontFamily: "'Roboto', sans-serif",
                                    backgroundColor: '#fff'
                                }}
                            />
                        </div>
                        
                        <div style={{ minWidth: 0 }}>
                            <label style={{ 
                                display: 'block', 
                                color: '#212121', 
                                fontSize: '0.9rem', 
                                fontWeight: '600',
                                marginBottom: '5px',
                                fontFamily: "'Roboto', sans-serif"
                            }}>
                                Collected (Rs):
                            </label>
                            <input
                                type="text"
                                value={formData.collected}
                                onChange={(e) => handleInputChange('collected', e.target.value)}
                                disabled={isReadOnly}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem',
                                    fontFamily: "'Roboto', sans-serif",
                                    backgroundColor: '#fff'
                                }}
                            />
                        </div>
                        
                        <div style={{ minWidth: 0 }}>
                            <label style={{ 
                                display: 'block', 
                                color: '#212121', 
                                fontSize: '0.9rem', 
                                fontWeight: '600',
                                marginBottom: '5px',
                                fontFamily: "'Roboto', sans-serif"
                            }}>
                                Receipt Amount (Rs):
                            </label>
                            <input
                                type="text"
                                value={formData.receiptAmount}
                                onChange={(e) => handleInputChange('receiptAmount', e.target.value)}
                                disabled={isReadOnly}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem',
                                    fontFamily: "'Roboto', sans-serif",
                                    backgroundColor: '#fff'
                                }}
                            />
                        </div>
                        
                        <div style={{ minWidth: 0 }}>
                            <label style={{ 
                                display: 'block', 
                                color: '#212121', 
                                fontSize: '0.9rem', 
                                fontWeight: '600',
                                marginBottom: '5px',
                                fontFamily: "'Roboto', sans-serif"
                            }}>
                                Receipt No:
                            </label>
                            <input
                                type="text"
                                value={formData.receiptNo}
                                onChange={(e) => handleInputChange('receiptNo', e.target.value)}
                                disabled={isReadOnly}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem',
                                    fontFamily: "'Roboto', sans-serif",
                                    backgroundColor: '#fff'
                                }}
                            />
                        </div>
                        
                        <div style={{ minWidth: 220 }}>
                            <label style={{ 
                                display: 'block', 
                                color: '#212121', 
                                fontSize: '0.9rem', 
                                fontWeight: '600',
                                marginBottom: '5px',
                                fontFamily: "'Roboto', sans-serif"
                            }}>
                                Receipt Date:
                            </label>
                            <input
                                type="text"
                                value={formData.receiptDate}
                                onChange={(e) => handleInputChange('receiptDate', e.target.value)}
                                disabled={isReadOnly}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem',
                                    fontFamily: "'Roboto', sans-serif",
                                    backgroundColor: '#fff'
                                }}
                            />
                        </div>
                        
                        <div style={{ minWidth: 220 }}>
                            <label style={{ 
                                display: 'block', 
                                color: '#212121', 
                                fontSize: '0.9rem', 
                                fontWeight: '600',
                                marginBottom: '5px',
                                fontFamily: "'Roboto', sans-serif"
                            }}>
                                Follow Up Type:
                            </label>
                            <input
                                type="text"
                                value={formData.followUpType}
                                onChange={(e) => handleInputChange('followUpType', e.target.value)}
                                disabled={isReadOnly}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem',
                                    fontFamily: "'Roboto', sans-serif",
                                    backgroundColor: '#fff'
                                }}
                            />
                        </div>
                        
                        <div style={{ minWidth: 0 }}>
                            <label style={{ 
                                display: 'block', 
                                color: '#212121', 
                                fontSize: '0.9rem', 
                                fontWeight: '600',
                                marginBottom: '5px',
                                fontFamily: "'Roboto', sans-serif"
                            }}>
                                Follow Up:
                            </label>
                            <input
                                type="text"
                                value={formData.followUp}
                                onChange={(e) => handleInputChange('followUp', e.target.value)}
                                disabled={isReadOnly}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem',
                                    fontFamily: "'Roboto', sans-serif",
                                    backgroundColor: '#fff'
                                }}
                            />
                        </div>
                        
                        <div style={{ minWidth: 0 }}>
                            <label style={{ 
                                display: 'block', 
                                color: '#212121', 
                                fontSize: '0.9rem', 
                                fontWeight: '600',
                                marginBottom: '5px',
                                fontFamily: "'Roboto', sans-serif"
                            }}>
                                Follow-up Date:
                            </label>
                            <input
                                type="text"
                                value={formData.followUpDate}
                                onChange={(e) => handleInputChange('followUpDate', e.target.value)}
                                placeholder="-"
                                disabled={isReadOnly}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem',
                                    fontFamily: "'Roboto', sans-serif",
                                    backgroundColor: '#fff'
                                }}
                            />
                        </div>
                        
                        <div>
                            <label style={{ 
                                display: 'block', 
                                color: '#212121', 
                                fontSize: '0.9rem', 
                                fontWeight: '600',
                                marginBottom: '5px',
                                fontFamily: "'Roboto', sans-serif"
                            }}>
                                Remark:
                            </label>
                            <input
                                type="text"
                                value={formData.remark}
                                onChange={(e) => handleInputChange('remark', e.target.value)}
                                placeholder="-"
                                disabled={isReadOnly}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem',
                                    fontFamily: "'Roboto', sans-serif",
                                    backgroundColor: '#fff'
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: '20px',
                    paddingTop: '20px',
                    borderTop: '1px solid #e0e0e0'
                }}>
                    <button
                        style={{
                            backgroundColor: 'rgb(21, 101, 192)',
                            color: 'white',
                            border: 'none',
                            padding: '12px 30px',
                            borderRadius: '6px',
                            fontSize: '1rem',
                            fontFamily: "'Roboto', sans-serif",
                            fontWeight: '500',
                            cursor: 'pointer',
                            minWidth: '120px'
                        }}
                        onClick={() => onClose && onClose()}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PatientFormTest;
