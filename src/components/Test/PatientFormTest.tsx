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

    // Raw visit data
    rawVisit?: any;
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
    remark: '',

    // Raw visit data
    rawVisit: undefined
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

    const [showBillingTooltip, setShowBillingTooltip] = useState(false);

    // Debug logging to see what data is being passed
    useEffect(() => {
        console.log('PatientFormTest initialData:', initialData);
        console.log('PatientFormTest formData:', formData);
        console.log('Provider field:', formData.provider);
        console.log('Visit dates:', visitDates);
        console.log('Current visit index:', currentVisitIndex);
        
        // Log raw visit data if available
        if (formData.rawVisit) {
            console.log('=== RAW VISIT DATA ===');
            console.log('Raw visit object:', formData.rawVisit);
            console.log('Raw visit object 123:',JSON.stringify(formData.rawVisit.FollowUp_Description, null, 2));
            console.log('Raw visit keys:', Object.keys(formData.rawVisit));
            console.log('Raw visit JSON:', JSON.stringify(formData.rawVisit, null, 2));
            
            // Specifically log prescription-related data
            if (formData.rawVisit.Prescriptions) {
                console.log('=== RAW PRESCRIPTIONS DATA ===');
                console.log('Raw Prescriptions:', formData.rawVisit.Prescriptions);
                console.log('Raw Prescriptions type:', typeof formData.rawVisit.Prescriptions);
                console.log('Raw Prescriptions is array:', Array.isArray(formData.rawVisit.Prescriptions));
                if (Array.isArray(formData.rawVisit.Prescriptions)) {
                    console.log('Raw Prescriptions length:', formData.rawVisit.Prescriptions.length);
                    formData.rawVisit.Prescriptions.forEach((item: any, index: number) => {
                        console.log(`Raw Prescriptions[${index}]:`, item);
                    });
                }
                console.log('=== END RAW PRESCRIPTIONS DATA ===');
            }
            
            console.log('=== END RAW VISIT DATA ===');
        } else {
            console.log('No raw visit data available');
        }
        
        // Log current prescriptions in form data
        console.log('=== CURRENT PRESCRIPTIONS IN FORM ===');
        console.log('Form prescriptions:', formData.prescriptions);
        console.log('Form prescriptions length:', formData.prescriptions.length);
        formData.prescriptions.forEach((prescription, index) => {
            console.log(`Form prescription[${index}]:`, prescription);
        });
        console.log('=== END CURRENT PRESCRIPTIONS ===');
        
        // Log provider information
        console.log('=== PROVIDER INFORMATION ===');
        console.log('Form provider field:', formData);
        console.log('Provider type:', typeof formData.provider);
        console.log('Provider length:', formData.provider?.length);
        if (formData.rawVisit && formData.rawVisit.DoctorName) {
            console.log('Raw visit DoctorName:', formData.rawVisit.DoctorName);
        }
        if (formData.rawVisit && formData.rawVisit.PLR) {
            console.log('Raw visit PLR:', formData.rawVisit.PLR);
        }
        console.log('=== END PROVIDER INFORMATION ===');
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

    // Prescriptions: only use real data from rawVisit.Prescriptions

    // Ensure prescriptions update with visit navigation - only use real data
    useEffect(() => {
        const incoming = (initialData && Array.isArray(initialData.prescriptions)) ? (initialData.prescriptions as any[]) : [];
        setFormData(prev => ({
            ...prev,
            prescriptions: incoming
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
                // Reset height to auto to get the natural height
                ta.style.height = 'auto';
                
                // Calculate the new height based on content
                const newHeight = ta.scrollHeight;
                
                // Set constraints
                const minHeight = 40; // Minimum height for single line
                const maxHeight = 200; // Maximum height before scrolling
                
                // Apply height constraints
                let finalHeight = newHeight;
                if (finalHeight < minHeight) {
                    finalHeight = minHeight;
                } else if (finalHeight > maxHeight) {
                    finalHeight = maxHeight;
                }
                
                // Set the final height
                ta.style.height = `${finalHeight}px`;
                
                // Handle overflow for very long content
                if (newHeight > maxHeight) {
                    ta.style.overflowY = 'auto';
                } else {
                    ta.style.overflowY = 'hidden';
                }
            });
        };
        // resize after mount and on window resize
        resizeAll();
        window.addEventListener('resize', resizeAll);
        return () => window.removeEventListener('resize', resizeAll);
    }, []);

    // Resize all textareas when form data changes (e.g., when loading new visit data)
    useEffect(() => {
        // Use a small delay to ensure DOM is updated
        const timer = setTimeout(() => {
            resizeAllTextareas();
        }, 10);
        
        return () => clearTimeout(timer);
    }, [formData]);

    // Improved auto-resize function that handles both expansion and contraction
    const handleAutoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const textarea = e.target;
        
        // Store the current scroll position
        const scrollTop = textarea.scrollTop;
        
        // Reset height to auto to get the natural height
        textarea.style.height = 'auto';
        
        // Calculate the new height based on content
        const newHeight = textarea.scrollHeight;
        
        // Set constraints
        const minHeight = 40; // Minimum height for single line
        const maxHeight = 200; // Maximum height before scrolling
        
        // Apply height constraints
        let finalHeight = newHeight;
        if (finalHeight < minHeight) {
            finalHeight = minHeight;
        } else if (finalHeight > maxHeight) {
            finalHeight = maxHeight;
        }
        
        // Set the final height
        textarea.style.height = `${finalHeight}px`;
        
        // Handle overflow for very long content
        if (newHeight > maxHeight) {
            textarea.style.overflowY = 'auto';
        } else {
            textarea.style.overflowY = 'hidden';
        }
        
        // Restore scroll position if needed
        textarea.scrollTop = scrollTop;
    };

    // Function to resize all textareas when form data changes
    const resizeAllTextareas = () => {
        const areas = document.querySelectorAll<HTMLTextAreaElement>('textarea[data-autosize="true"]');
        areas.forEach((ta) => {
            // Reset height to auto to get the natural height
            ta.style.height = 'auto';
            
            // Calculate the new height based on content
            const newHeight = ta.scrollHeight;
            
            // Set constraints
            const minHeight = 40; // Minimum height for single line
            const maxHeight = 200; // Maximum height before scrolling
            
            // Apply height constraints
            let finalHeight = newHeight;
            if (finalHeight < minHeight) {
                finalHeight = minHeight;
            } else if (finalHeight > maxHeight) {
                finalHeight = maxHeight;
            }
            
            // Set the final height
            ta.style.height = `${finalHeight}px`;
            
            // Handle overflow for very long content
            if (newHeight > maxHeight) {
                ta.style.overflowY = 'auto';
            } else {
                ta.style.overflowY = 'hidden';
            }
        });
    };

    // Format date to dd-MMM-yy (e.g., 05-Jul-25)
    const formatToDdMmmYy = (dateInput: any): string => {
        if (!dateInput) return '';
        try {
            const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            const d = new Date(dateInput);
            if (isNaN(d.getTime())) {
                // Try when input is already like dd-MMM-yy or dd-MMM-yyyy
                const m = String(dateInput).trim();
                // If already dd-MMM-yy, return as-is
                if (/^\d{2}-[A-Za-z]{3}-\d{2}$/.test(m)) return m;
                // Convert dd-MMM-yyyy to dd-MMM-yy
                const m4 = m.match(/^(\d{2}-[A-Za-z]{3}-(\d{4}))$/);
                if (m4) {
                    const yy = m4[2].slice(-2);
                    return m4[1].slice(0, 7) + '-' + yy;
                }
                return m; // fallback
            }
            const dd = String(d.getDate()).padStart(2, '0');
            const mmm = monthNames[d.getMonth()];
            const yy = String(d.getFullYear()).slice(-2);
            return `${dd}-${mmm}-${yy}`;
        } catch {
            return String(dateInput);
        }
    };

    // Derive Lab Suggested from raw visit, pretty-printing arrays/objects,
    // and removing quotes if backend sent JSON-encoded string
    const getLabSuggestedValue = (): string => {
        const rv = formData?.rawVisit || {};
        const source = rv.Lab_Test_Descriptions ?? rv.lab_test_descriptions ?? rv.Lab_Tests ?? rv.lab_tests;
        if (source === undefined || source === null) {
            return formData.labSuggested || '';
        }
        if (typeof source === 'string') {
            // Try parse in case it's a JSON-encoded string
            try {
                const parsed = JSON.parse(source);
                if (typeof parsed === 'string') return parsed; // remove enclosing quotes
                // If parsed to an object/array, pretty print
                return JSON.stringify(parsed, null, 2);
            } catch {
                return source; // plain string
            }
        }
        // Objects/arrays -> pretty string
        try {
            return JSON.stringify(source, null, 2);
        } catch {
            return String(source);
        }
    };

    // Build PLR display exactly in the order P L R if present, or fallback to raw PLR string
    const getPLRText = (): string => {
        const rv = formData?.rawVisit || {};
        const raw = rv.PLR ?? rv.plr ?? '';
        const p = rv.P ?? rv.p;
        const l = rv.L ?? rv.l;
        const r = rv.R ?? rv.r;
    
        const parts: string[] = [];
    
        if (p !== undefined && p !== null && String(p).trim() !== '') parts.push(String(p).trim());
        if (l !== undefined && l !== null && String(l).trim() !== '') parts.push(String(l).trim());
        if (r !== undefined && r !== null && String(r).trim() !== '') parts.push(String(r).trim());
    
        if (parts.length > 0) {
            // join with spaces if P/L/R exist
            return parts.join(' ');
        }
    
        // if PLR is a string, insert spaces between each character/word
        if (typeof raw === 'string') {
            return raw.trim().split('').join(' ');
        }
    
        return String(raw || '');
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
                            fontSize: '0.9rem',
                            padding: '10px 20px',
                            // fontWeight: '100',
                            // // marginTop: '0px',
                            fontFamily: "'Roboto', sans-serif",
                            // whiteSpace: 'nowrap'
                        }}>{getPLRText()}
                        </div>
                        <div style={{ 
                            color: 'rgb(21, 101, 192)', 
                            fontSize: '0.95rem', 
                            fontWeight: '100',
                            // marginTop: '0px',
                            fontFamily: "'Roboto', sans-serif",
                            whiteSpace: 'nowrap'
                        }}>
                            {formData.provider || 'Dr. Tongaonkar'}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <label style={{ color: '#212121', fontSize: '0.9rem', fontWeight: '500', fontFamily: "'Roboto', sans-serif" }}>In Person:</label>
                            <input
                                type="checkbox"
                                checked={formData.inPerson}
                                onChange={() => handleCheckboxChange('inPerson')}
                                disabled={isReadOnly}
                                style={{
                                    width: '16px',
                                    height: '16px',
                                    accentColor: '#1E88E5'
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
                        gap: '15px', 
                        marginBottom: '20px'
                    }}>
                        {[
                            { key: 'allergy', label: 'Allergy:' },
                            { key: 'medicalHistory', label: 'Medical History:' },
                            { key: 'surgicalHistory', label: 'Surgical History:' },
                            { key: 'visitComments', label: 'Visit Comments:' },
                            { key: 'medicines', label: 'Exisiting Medicines:' },
                            { key: 'detailedHistory', label: 'Detailed History/Additional Comments:' }
                            // { key: 'examinationFindings', label: 'Important/Examination Findings:' },
                            // { key: 'complaints', label: 'Complaints:' },
                            // { key: 'provisionalDiagnosis', label: 'Provisional Diagnosis:' },
                            // { key: 'examinationComments', label: 'Examination Comments/Detailed History:' },
                            // { key: 'procedurePerformed', label: 'Procedure Performed/Notes:' }
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
                                    value={key === 'labSuggested' ? getLabSuggestedValue() : (formData[key as keyof typeof formData] as string)}
                                    onChange={(e) => { handleInputChange(key, e.target.value); handleAutoResize(e); }}
                                    placeholder={formData[key as keyof typeof formData] ? '' : '-'}
                                    data-autosize="true"
                                    rows={1}
                                    disabled={isReadOnly}
                                    style={{
                                        width: '100%',
                                        minHeight: '40px',
                                        maxHeight: '200px',
                                        padding: '8px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '0.9rem',
                                        fontFamily: "'Roboto', sans-serif",
                                        backgroundColor: '#fff',
                                        overflow: 'hidden',
                                        resize: 'none',
                                        lineHeight: '1.4',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(5, 1fr)', 
                        gap: '15px', 
                        marginBottom: '20px'
                    }}>
                        {[
                            // { key: 'allergy', label: 'Allergy:' },
                            // { key: 'medicalHistory', label: 'Medical History:' },
                            // { key: 'surgicalHistory', label: 'Surgical History:' },
                            // { key: 'visitComments', label: 'Visit Comments:' },
                            // { key: 'medicines', label: 'Exisiting Medicines:' },
                            // { key: 'detailedHistory', label: 'Detailed History/Additional Comments:' },
                            { key: 'examinationFindings', label: 'Important/Examination Findings:' },
                            { key: 'complaints', label: 'Complaints:' },
                            { key: 'provisionalDiagnosis', label: 'Provisional Diagnosis:' },
                            { key: 'examinationComments', label: 'Examination Comments/Detailed History:' },
                            { key: 'procedurePerformed', label: 'Procedure Performed/Notes:' }
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
                                    value={key === 'labSuggested' ? getLabSuggestedValue() : (formData[key as keyof typeof formData] as string)}
                                    onChange={(e) => { handleInputChange(key, e.target.value); handleAutoResize(e); }}
                                    placeholder={formData[key as keyof typeof formData] ? '' : '-'}
                                    data-autosize="true"
                                    rows={1}
                                    disabled={isReadOnly}
                                    style={{
                                        width: '100%',
                                        minHeight: '40px',
                                        maxHeight: '200px',
                                        padding: '8px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '0.9rem',
                                        fontFamily: "'Roboto', sans-serif",
                                        backgroundColor: '#fff',
                                        overflow: 'hidden',
                                        resize: 'none',
                                        lineHeight: '1.4',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Prescriptions - moved here after Procedure Performed/Notes */}
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ 
                            color: '#212121', 
                            fontSize: '1.2rem', 
                            fontWeight: '600',
                            fontFamily: "'Roboto', sans-serif",
                            // borderBottom: '1px solid #e0e0e0',
                            paddingBottom: '10px',
                            marginBottom: '15px'
                        }}>
                            Prescriptions
                        </h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e0e0e0', tableLayout: 'fixed' }}>
                                <colgroup>
                                    <col style={{ width: '33.33%' }} />
                                    <col style={{ width: '33.33%' }} />
                                    <col style={{ width: '33.34%' }} />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #cfcfcf', borderRight: '1px solid #e0e0e0', color: '#666', fontWeight: 600, backgroundColor: '#f5f5f5' }}>Medicine</th>
                                        <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #cfcfcf', borderRight: '1px solid #e0e0e0', color: '#666', fontWeight: 600, backgroundColor: '#f5f5f5' }}>Dosage</th>
                                        <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #cfcfcf', color: '#666', fontWeight: 600, backgroundColor: '#f5f5f5' }}>Instructions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.prescriptions.length > 0 ? (
                                        formData.prescriptions.map((prescription, index) => (
                                            <tr key={index}>
                                                <td style={{ height: '40px', padding: '10px', lineHeight: '20px', borderBottom: '1px solid #eaeaea', borderRight: '1px solid #e0e0e0', verticalAlign: 'middle', whiteSpace: 'normal', wordBreak: 'break-word', overflow: 'hidden' }}>
                                                    {prescription.medicine || '-'}
                                                </td>
                                                <td style={{ height: '40px', padding: '10px', lineHeight: '20px', borderBottom: '1px solid #eaeaea', borderRight: '1px solid #e0e0e0', verticalAlign: 'middle', whiteSpace: 'normal', wordBreak: 'break-word', overflow: 'hidden' }}>
                                                    {prescription.dosage || '-'}
                                                </td>
                                                <td style={{ height: '40px', padding: '10px', lineHeight: '20px', borderBottom: '1px solid #eaeaea', verticalAlign: 'middle', whiteSpace: 'normal', wordBreak: 'break-word', overflow: 'hidden' }}>
                                                    {prescription.instructions || '-'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} style={{ 
                                                padding: '20px', 
                                                textAlign: 'center', 
                                                color: '#666', 
                                                fontStyle: 'italic',
                                                borderBottom: '1px solid #eaeaea'
                                            }}>
                                                No prescriptions found for this visit
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Follow-up fields in requested order */}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(5, 1fr)', 
                        gap: '15px' 
                    }}>
                        {[
                            { key: 'labSuggested', label: 'Lab Suggested:' },
                            { key: 'medicines', label: 'Medicines:' },
                            { key: 'dressing', label: 'Dressing:' },
                            { key: 'procedure', label: 'Procedure:' },
                            { key: 'plan', label: 'Plan:' }
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
                                    value={key === 'labSuggested' ? getLabSuggestedValue() : (formData[key as keyof typeof formData] as string)}
                                    onChange={(e) => { handleInputChange(key, e.target.value); handleAutoResize(e); }}
                                    placeholder={formData[key as keyof typeof formData] ? '' : '-'}
                                    data-autosize="true"
                                    rows={1}
                                    disabled={isReadOnly}
                                    style={{
                                        width: '100%',
                                        minHeight: '40px',
                                        maxHeight: '200px',
                                        padding: '8px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '0.9rem',
                                        fontFamily: "'Roboto', sans-serif",
                                        backgroundColor: '#fff',
                                        overflow: 'hidden',
                                        resize: 'none',
                                        lineHeight: '1.4',
                                        boxSizing: 'border-box'
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
                {/* <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ 
                        color: '#212121', 
                        fontSize: '1.2rem', 
                        fontWeight: '600',
                        fontFamily: "'Roboto', sans-serif",
                        // borderBottom: '1px solid #e0e0e0',
                        paddingBottom: '10px',
                        marginBottom: '15px'
                    }}>
                        Prescriptions
                    </h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e0e0e0', tableLayout: 'fixed' }}>
                            <colgroup>
                                <col style={{ width: '33.33%' }} />
                                <col style={{ width: '33.33%' }} />
                                <col style={{ width: '33.34%' }} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #cfcfcf', borderRight: '1px solid #e0e0e0', color: '#666', fontWeight: 600, backgroundColor: '#f5f5f5' }}>Medicine</th>
                                    <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #cfcfcf', borderRight: '1px solid #e0e0e0', color: '#666', fontWeight: 600, backgroundColor: '#f5f5f5' }}>Dosage</th>
                                    <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #cfcfcf', color: '#666', fontWeight: 600, backgroundColor: '#f5f5f5' }}>Instructions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formData.prescriptions.length > 0 ? (
                                    formData.prescriptions.map((prescription, index) => (
                                        <tr key={index}>
                                            <td style={{ height: '40px', padding: '10px', lineHeight: '20px', borderBottom: '1px solid #eaeaea', borderRight: '1px solid #e0e0e0', verticalAlign: 'middle', whiteSpace: 'normal', wordBreak: 'break-word', overflow: 'hidden' }}>
                                                {prescription.medicine || '-'}
                                            </td>
                                            <td style={{ height: '40px', padding: '10px', lineHeight: '20px', borderBottom: '1px solid #eaeaea', borderRight: '1px solid #e0e0e0', verticalAlign: 'middle', whiteSpace: 'normal', wordBreak: 'break-word', overflow: 'hidden' }}>
                                                {prescription.dosage || '-'}
                                            </td>
                                            <td style={{ height: '40px', padding: '10px', lineHeight: '20px', borderBottom: '1px solid #eaeaea', verticalAlign: 'middle', whiteSpace: 'normal', wordBreak: 'break-word', overflow: 'hidden' }}>
                                                {prescription.instructions || '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} style={{ 
                                            padding: '20px', 
                                            textAlign: 'center', 
                                            color: '#666', 
                                            fontStyle: 'italic',
                                            borderBottom: '1px solid #eaeaea'
                                        }}>
                                            No prescriptions found for this visit
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div> */}

                {/* Billing Details (at the end of the 3-column grid) */}
                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ 
                        color: '#212121', 
                        fontSize: '1.2rem', 
                        fontWeight: '600', 
                        marginBottom: '20px',
                        fontFamily: "'Roboto', sans-serif",
                        // borderBottom: '1px solid #e0e0e0',
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
                                display: 'flex', 
                                alignItems: 'center',
                                color: '#212121', 
                                fontSize: '0.9rem', 
                                fontWeight: '600',
                                marginBottom: '5px',
                                fontFamily: "'Roboto', sans-serif"
                            }}>
                                Billed (Rs):
                                <div 
                                    style={{
                                        position: 'relative',
                                        display: 'inline-block',
                                        marginLeft: 'auto',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={() => setShowBillingTooltip(true)}
                                    onMouseLeave={() => setShowBillingTooltip(false)}
                                >
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '55px',
                                        color: 'rgb(20, 20, 19)',
                                        fontSize: '0.5rem',
                                        fontStyle: 'italic',
                                        fontWeight: 'lighter'
                                    }}>
                                        Breakup
                                    </span>
                                    {showBillingTooltip && (
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '100%',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            backgroundColor: '#333',
                                            color: 'white',
                                            padding: '8px 12px',
                                            borderRadius: '4px',
                                            fontSize: '0.8rem',
                                            whiteSpace: 'nowrap',
                                            zIndex: 1000,
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                            marginBottom: '5px'
                                        }}>
                                            <div>Follow-up: ₹300</div>
                                            <div>CBC: ₹300</div>
                                            <div style={{
                                                position: 'absolute',
                                                top: '100%',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                width: 0,
                                                height: 0,
                                                borderLeft: '5px solid transparent',
                                                borderRight: '5px solid transparent',
                                                borderTop: '5px solid #333'
                                            }}></div>
                                        </div>
                                    )}
                                </div>
                            </label>
                            <input
                                type="text"
                                value={formData.dues}
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
                                value={formData.collected}
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
                                value={formatToDdMmmYy(formData.receiptDate)}
                                onChange={(e) => handleInputChange('receiptDate', formatToDdMmmYy(e.target.value))}
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
                                value={(() => {
                                    const v = formData?.rawVisit?.FollowUp_Description;
                                    if (v === undefined || v === null) return '';
                                    if (typeof v === 'string') {
                                        // If backend sent JSON-encoded string like '"text"', parse once
                                        try {
                                            const parsed = JSON.parse(v);
                                            return typeof parsed === 'string' ? parsed : String(v);
                                        } catch {
                                            return v;
                                        }
                                    }
                                    return String(v);
                                })()}
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
                        <div style={{ minWidth: 220 }}>
                            <label style={{ 
                                display: 'block', 
                                color: '#212121', 
                                fontSize: '0.9rem', 
                                fontWeight: '600',
                                marginBottom: '5px',
                                fontFamily: "'Roboto', sans-serif"
                            }}>
                                Follow Up After:
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
                                value={formatToDdMmmYy(formData.followUpDate)}
                                onChange={(e) => handleInputChange('followUpDate', formatToDdMmmYy(e.target.value))}
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
                        <div>
                            <label style={{ 
                                display: 'block', 
                                color: '#212121', 
                                fontSize: '0.9rem', 
                                fontWeight: '600',
                                marginBottom: '5px',
                                fontFamily: "'Roboto', sans-serif"
                            }}>
                                Addendum:
                            </label>
                            <input
                                type="text"
                                value={formData.addendum}
                                onChange={(e) => handleInputChange('addendum', e.target.value)}
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
