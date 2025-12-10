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
    inPerson:true,
    
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
    // This matches the behavior in Treatment.tsx and Billing.tsx
    useEffect(() => {
        if (initialData) {
            setFormData(prev => {
                // Start with defaults, then always overwrite with values from initialData
                const patched: any = { ...defaultFormData };
                
                // Helper function to always set value if it's present in initialData (including empty strings)
                const alwaysSet = (key: keyof PatientFormData, value: any) => {
                    // Only skip if value is explicitly undefined or null (empty strings should overwrite)
                    if (value === undefined || value === null) return;
                    
                    // Preserve type: convert to string for string fields, boolean for boolean fields, etc.
                    const defaultValue = defaultFormData[key];
                    if (typeof defaultValue === 'boolean') {
                        patched[key] = Boolean(value);
                    } else if (typeof defaultValue === 'string') {
                        // Always set string values, even if empty (to clear previous visit data)
                        patched[key] = String(value);
                    } else if (Array.isArray(defaultValue)) {
                        // For arrays (like prescriptions), always set the array value, even if empty
                        patched[key] = Array.isArray(value) ? value : [];
                    } else if (typeof defaultValue === 'object' && defaultValue !== null) {
                        // For objects (like rawVisit), use the value directly
                        patched[key] = value;
                    } else {
                        patched[key] = value;
                    }
                };
                
                // Always overwrite with values from initialData when they are present
                // This ensures that when navigating between visits, all fields update correctly
                (Object.keys(initialData) as Array<keyof PatientFormData>).forEach((key) => {
                    const value = (initialData as any)[key];
                    alwaysSet(key, value);
                });
                
                // Ensure rawVisit is set first so we can use it for prescription mapping
                if ('rawVisit' in initialData && initialData.rawVisit !== undefined) {
                    patched.rawVisit = initialData.rawVisit;
                }
                
                // Map prescriptions from API format to component format
                // Handle prescriptions from initialData or rawVisit.Prescriptions
                const mapPrescriptionFromApi = (p: any, index?: number): Prescription => {
                    // Helper to get value with fallbacks
                    const get = (obj: any, ...keys: string[]) => {
                        for (const k of keys) {
                            if (obj && obj[k] !== undefined && obj[k] !== null && obj[k] !== '') return obj[k];
                        }
                        return '';
                    };
                    const toStr = (v: any) => (v === undefined || v === null ? '' : String(v));
                    
                    // Prioritize brandName as it's the primary field in the API response
                    // Check brandName first, then fallback to other medicine name fields
                    let med = '';
                    if (p.brandName !== undefined && p.brandName !== null && String(p.brandName).trim() !== '') {
                        med = String(p.brandName).trim();
                        console.log(`Prescription[${index ?? '?'}]: Using brandName: "${med}"`);
                    } else {
                        med = toStr(get(p, 'medicineName', 'Medicine_Name', 'medicine', 'drug_name', 'item', 'Medicine', 'Drug', 'med_name', 'medication', 'MedName'));
                        if (med) {
                            console.log(`Prescription[${index ?? '?'}]: Using fallback medicine name: "${med}"`);
                        }
                    }
                    
                    // Try multiple field name variations for dosage
                    const m = toStr(get(p, 'Morning', 'morningDose', 'morning', 'M', 'morn', 'AM')) || '0';
                    const a = toStr(get(p, 'Afternoon', 'afternoonDose', 'afternoon', 'A', 'aft', 'PM')) || '0';
                    const n = toStr(get(p, 'Night', 'nightDose', 'night', 'N', 'eve', 'Evening')) || '0';
                    
                    // Get number of days
                    const noOfdays = toStr(get(p, 'noOfDays', 'no_of_days', 'NoOfDays'));
                    
                    // If we have individual dosage components, combine them
                    let doseCombined = '';
                    if (m !== '0' || a !== '0' || n !== '0') {
                        doseCombined = `${m}-${a}-${n}`;
                        // Add number of days if available
                        if (noOfdays) {
                            doseCombined += ` (${noOfdays} Days)`;
                        }
                    } else {
                        // Try to get pre-formatted dosage (including doseSummary from API)
                        doseCombined = toStr(get(p, 'doseSummary', 'Dosage', 'dosage', 'dose', 'Dose', 'dosage_formatted', 'frequency', 'Frequency'));
                        // Add number of days if available and not already included
                        if (noOfdays && !doseCombined.toLowerCase().includes('day')) {
                            doseCombined += ` (${noOfdays} Days)`;
                        }
                    }
                    
                    // Try multiple field name variations for instructions
                    // Skip if instruction is just "0" (which is a placeholder)
                    let instr = toStr(get(p, 'Instruction', 'Instructions', 'instruction', 'instructions', 'Instruction_Text', 'directions', 'how_to_take', 'Directions'));
                    if (instr === '0' || instr === '') {
                        instr = ''; // Clear placeholder values
                    }
                    
                    const mapped = {
                        medicine: med,
                        dosage: doseCombined,
                        instructions: instr
                    };
                    
                    console.log(`Prescription[${index ?? '?'}]: Mapped result:`, mapped);
                    return mapped;
                };
                
                // Explicitly handle prescriptions if present in initialData (even if empty array)
                // This ensures prescriptions are always updated when initialData changes
                // This is critical for visit navigation to show correct prescriptions for each visit
                if ('prescriptions' in initialData) {
                    const prescriptionsValue = (initialData as any).prescriptions;
                    if (Array.isArray(prescriptionsValue)) {
                        // Check if prescriptions are in API format (have brandName, morningDose, etc.) or already mapped
                        // Always prefer brandName if available, even if medicine field exists
                        const isApiFormat = prescriptionsValue.length > 0 && prescriptionsValue[0] && 
                            ('brandName' in prescriptionsValue[0] || 'morningDose' in prescriptionsValue[0] || 'afternoonDose' in prescriptionsValue[0]);
                        
                        if (!isApiFormat && prescriptionsValue.length > 0 && prescriptionsValue[0] && 'medicine' in prescriptionsValue[0]) {
                            // Already in correct format, but check if medicine is empty and brandName exists in rawVisit
                            patched.prescriptions = prescriptionsValue
                                .filter((p: any, idx: number) => {
                                    const hasMedicine = p.medicine && String(p.medicine).trim() !== '';
                                    // Also check rawVisit for brandName if medicine is empty
                                    let hasBrandName = false;
                                    if (!hasMedicine && patched.rawVisit?.Prescriptions?.[idx]) {
                                        const rawPrescription = patched.rawVisit.Prescriptions[idx];
                                        hasBrandName = rawPrescription?.brandName && String(rawPrescription.brandName).trim() !== '';
                                    }
                                    const hasDosage = p.dosage && String(p.dosage).trim() !== '';
                                    return hasMedicine || hasBrandName || hasDosage;
                                })
                                .map((p: any, idx: number) => {
                                    // If medicine is empty but brandName exists in rawVisit, use brandName
                                    let medicineValue = String(p.medicine || '').trim();
                                    if (!medicineValue && patched.rawVisit?.Prescriptions?.[idx]) {
                                        const rawPrescription = patched.rawVisit.Prescriptions[idx];
                                        if (rawPrescription?.brandName) {
                                            medicineValue = String(rawPrescription.brandName).trim();
                                            console.log(`PatientFormTest: Using brandName from rawVisit for prescription[${idx}]:`, medicineValue);
                                        }
                                    }
                                    return {
                                        medicine: medicineValue,
                                        dosage: String(p.dosage || '').trim(),
                                        instructions: (p.instructions === '0' || p.instructions === '' ? '' : String(p.instructions || '').trim())
                                    };
                                });
                        } else {
                            // Need to map from API format - ensure brandName is used
                            console.log('PatientFormTest: Mapping prescriptions from API format, raw data:', prescriptionsValue);
                            patched.prescriptions = prescriptionsValue
                                .map((p: any, idx: number) => {
                                    console.log(`PatientFormTest: Mapping prescription[${idx}]:`, p);
                                    return mapPrescriptionFromApi(p, idx);
                                })
                                .filter((p: Prescription, idx: number) => {
                                    // Filter out empty prescriptions
                                    const hasMedicine = p.medicine && p.medicine.trim() !== '';
                                    const hasDosage = p.dosage && p.dosage.trim() !== '';
                                    const isValid = hasMedicine || hasDosage;
                                    if (!isValid) {
                                        console.log(`PatientFormTest: Filtering out empty prescription[${idx}]:`, p);
                                    }
                                    return isValid;
                                });
                        }
                        console.log('PatientFormTest: Patched prescriptions from initialData:', patched.prescriptions.length, 'items', patched.prescriptions);
                    } else if (prescriptionsValue === undefined || prescriptionsValue === null) {
                        // If explicitly set to null/undefined, reset to empty array
                        patched.prescriptions = [];
                        console.log('PatientFormTest: Reset prescriptions to empty array (null/undefined)');
                    }
                } else if (patched.rawVisit && patched.rawVisit.Prescriptions && Array.isArray(patched.rawVisit.Prescriptions)) {
                    // If prescriptions are not in initialData but are in rawVisit, map them
                    console.log('PatientFormTest: Mapping prescriptions from rawVisit.Prescriptions, raw data:', patched.rawVisit.Prescriptions);
                    patched.prescriptions = patched.rawVisit.Prescriptions
                        .map((p: any, idx: number) => {
                            console.log(`PatientFormTest: Mapping rawVisit prescription[${idx}]:`, p);
                            return mapPrescriptionFromApi(p, idx);
                        })
                        .filter((p: Prescription, idx: number) => {
                            // Filter out empty prescriptions
                            const hasMedicine = p.medicine && p.medicine.trim() !== '';
                            const hasDosage = p.dosage && p.dosage.trim() !== '';
                            const isValid = hasMedicine || hasDosage;
                            if (!isValid) {
                                console.log(`PatientFormTest: Filtering out empty rawVisit prescription[${idx}]:`, p);
                            }
                            return isValid;
                        });
                    console.log('PatientFormTest: Mapped prescriptions from rawVisit:', patched.prescriptions.length, 'items', patched.prescriptions);
                }
                // Note: If prescriptions is not in initialData or rawVisit, it will remain as defaultFormData.prescriptions (empty array)
                
                // Patch Allergy from rawVisit if not already set
                if ((!patched.allergy || patched.allergy === '') && patched.rawVisit && patched.rawVisit.Allergy !== undefined && patched.rawVisit.Allergy !== null) {
                    patched.allergy = String(patched.rawVisit.Allergy);
                    console.log('PatientFormTest: Patched allergy from rawVisit.Allergy:', patched.allergy);
                }
                
                // Examination Comments/Detailed History: patch from detailedHistory field value (not from Additional_Comments directly)
                if ((!patched.examinationComments || patched.examinationComments === '') && patched.detailedHistory && patched.detailedHistory.trim() !== '') {
                    patched.examinationComments = patched.detailedHistory;
                    console.log('PatientFormTest: Patched examinationComments from detailedHistory:', patched.examinationComments);
                }

                // Procedure Performed/Notes: patch from raw visit Observation if present
                if ((!patched.procedurePerformed || patched.procedurePerformed === '') && patched.rawVisit && patched.rawVisit.Observation) {
                    patched.procedurePerformed = String(patched.rawVisit.Observation);
                    console.log('PatientFormTest: Patched procedurePerformed from Observation:', patched.procedurePerformed);
                }
                
                // Dressing: patch from raw visit Dressing if present
                if ((!patched.dressing || patched.dressing === '') && patched.rawVisit && patched.rawVisit.Dressing !== undefined && patched.rawVisit.Dressing !== null) {
                    patched.dressing = String(patched.rawVisit.Dressing);
                    console.log('PatientFormTest: Patched dressing from rawVisit.Dressing:', patched.dressing);
                }

                // Receipt fields: Receipt No / Receipt Date / Remark
                if ((!patched.receiptNo || patched.receiptNo === '') && patched.rawVisit && patched.rawVisit.Receipt_No) {
                    patched.receiptNo = String(patched.rawVisit.Receipt_No);
                }
                if ((!patched.receiptDate || patched.receiptDate === '') && patched.rawVisit && patched.rawVisit.Receipt_Date) {
                    patched.receiptDate = String(patched.rawVisit.Receipt_Date);
                }
                // Remark: patch from comment field only, exclude Instructions and Plan
                if ((!patched.remark || patched.remark === '') && patched.rawVisit) {
                    // Only use Remark or comment field, explicitly exclude Instructions and Plan
                    const instructionsValue = patched.rawVisit.Instructions;
                    const planValue = patched.rawVisit.Plan;
                    const remarkValue = patched.rawVisit.Remark ?? patched.rawVisit.remarks ?? patched.rawVisit.Remarks;
                    const commentValue = patched.rawVisit.comment ?? patched.rawVisit.Comment;
                    const isPlanAdv = (val: any) => {
                        if (val === undefined || val === null) return false;
                        const s = String(val).trim().toLowerCase();
                        return s === 'plan / adv' || s === 'plan/adv';
                    };
                    
                    // Check if Remark or comment exists and is not the same as Instructions or Plan
                    if (remarkValue !== undefined && remarkValue !== null && String(remarkValue).trim() !== '') {
                        const remarkStr = String(remarkValue).trim();
                        // Only set if it's not the same as Instructions or Plan
                        if (!isPlanAdv(remarkStr) && remarkStr !== String(instructionsValue || '').trim() && remarkStr !== String(planValue || '').trim()) {
                            patched.remark = remarkStr;
                            console.log('PatientFormTest: Patched remark from rawVisit.Remark:', patched.remark);
                        }
                    } else if (commentValue !== undefined && commentValue !== null && String(commentValue).trim() !== '') {
                        const commentStr = String(commentValue).trim();
                        // Only set if it's not the same as Instructions or Plan
                        if (!isPlanAdv(commentStr) && commentStr !== String(instructionsValue || '').trim() && commentStr !== String(planValue || '').trim()) {
                            patched.remark = commentStr;
                            console.log('PatientFormTest: Patched remark from rawVisit.comment:', patched.remark);
                        }
                    }

                    // If remark still matches Instructions/Plan, clear it
                    if (patched.remark && (
                        isPlanAdv(patched.remark) ||
                        patched.remark === String(instructionsValue || '').trim() ||
                        patched.remark === String(planValue || '').trim()
                    )) {
                        patched.remark = '';
                    }
                }
                
                console.log('PatientFormTest: Final patched prescriptions:', patched.prescriptions.length, 'items');
                console.log('PatientFormTest: Final patched prescriptions details:', patched.prescriptions);
                return patched as PatientFormData;
            });
        }
    }, [initialData]);

    const isReadOnly = true;

    const formatDate = (d: Date): string => {
        const dd = String(d.getDate()).padStart(2, '0');
        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const mmm = monthNames[d.getMonth()];
        const yy = String(d.getFullYear()).slice(-2);
        return `${dd} - ${mmm} - ${yy}`;
    };

    // Utility function to truncate text with ellipsis when it exceeds 100 characters
    const truncateText = (text: string, maxLength: number = 35): string => {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
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

    // Complaints: prefer rawVisit.Current_Complaints if present, else form field
    const getComplaintsValue = (): string => {
        const rv = formData?.rawVisit || {};
        const source = rv.Current_Complaints;
        if (source === undefined || source === null || source === '') {
            return formData.complaints || '';
        }
        if (typeof source === 'string') {
            // Some backends send JSON-encoded strings
            try {
                const parsed = JSON.parse(source);
                return typeof parsed === 'string' ? parsed : String(source);
            } catch {
                return source;
            }
        }
        try {
            return JSON.stringify(source);
        } catch {
            return String(source);
        }
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
                                    backgroundColor: currentVisitIndex <= 0 ? 'rgba(0, 0, 0, 0.35)' : 'rgb(25, 118, 210)',
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
                                    backgroundColor: currentVisitIndex >= visitDates.length - 1 ? 'rgba(0, 0, 0, 0.35)' : 'rgb(25, 118, 210)',
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
                            <label style={{ color: '#212121', fontSize: '0.9rem', fontWeight: 'bold', fontFamily: "'Roboto', sans-serif" }}>Referred By</label>
                            <input
                                type="text"
                                value={isReadOnly ? truncateText(formData.referredBy) : formData.referredBy}
                                onChange={(e) => handleInputChange('referredBy', e.target.value)}
                                disabled={isReadOnly}
                                style={{
                                    width: '180px',
                                    padding: '4px 6px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem',
                                    fontFamily: "'Roboto', sans-serif",
                                    backgroundColor: '#fff',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <label style={{ color: '#212121', fontSize: '0.9rem', fontWeight: 'bold', fontFamily: "'Roboto', sans-serif" }}>In Person</label>
                            <input
                                type="checkbox"
                                checked={true}
                                onChange={() => handleCheckboxChange('inPerson')}
                                disabled={isReadOnly}
                                style={{
                                    width: '16px',
                                    height: '16px',
                                    accentColor: '#1E88E5'
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
                            { key: 'hypertension', label: 'Hypertension' },
                            { key: 'diabetes', label: 'Diabetes' },
                            { key: 'cholesterol', label: 'Cholesterol' },
                            { key: 'ihd', label: 'IHD' },
                            { key: 'asthma', label: 'Asthma' },
                            { key: 'th', label: 'TH' }, 
                            { key: 'smoking', label: 'Smoking' },
                            { key: 'tobacco', label: 'Tobacco' },
                            { key: 'alcohol', label: 'Alcohol' }
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
                                    fontWeight: 'bold',
                                    fontFamily: "'Roboto', sans-serif",
                                    margin: 0
                                }}>
                                    {label}
                                </label>
                            </div>
                        ))}
                    </div>

                      {/* Inline groups: will wrap to 2 lines if needed */}
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '12px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <label style={{ color: '#212121', fontSize: '0.9rem', fontWeight: 'bold', fontFamily: "'Roboto', sans-serif" }}>Height (Cm):</label>
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
                                    backgroundColor: '#fff',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <label style={{ color: '#212121', fontSize: '0.9rem', fontWeight: 'bold', fontFamily: "'Roboto', sans-serif" }}>Weight (Kg):</label>
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
                                    backgroundColor: '#fff',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <label style={{ color: '#212121', fontSize: '0.9rem', fontWeight: 'bold', fontFamily: "'Roboto', sans-serif" }}>Pulse (/min):</label>
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
                                    backgroundColor: '#fff',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <label style={{ color: '#212121', fontSize: '0.9rem', fontWeight: 'bold', fontFamily: "'Roboto', sans-serif" }}>BP:</label>
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
                                    backgroundColor: '#fff',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <label style={{ color: '#212121', fontSize: '0.9rem', fontWeight: 'bold', fontFamily: "'Roboto', sans-serif" }}>Sugar:</label>
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
                                    backgroundColor: '#fff',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <label style={{ color: '#212121', fontSize: '0.9rem', fontWeight: 'bold', fontFamily: "'Roboto', sans-serif" }}>TFT:</label>
                            <input
                                type="text"
                                value={formData.rawVisit?.ThText ?? ''}
                                onChange={(e) => handleInputChange('tft', e.target.value)}
                                disabled={isReadOnly}
                                style={{
                                    width: '60px',
                                    padding: '4px 6px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem',
                                    fontFamily: "'Roboto', sans-serif",
                                    backgroundColor: '#fff',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <label style={{ color: '#212121', fontSize: '0.9rem', fontWeight: 'bold', fontFamily: "'Roboto', sans-serif" }}>Pallor/HB:</label>
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
                                    backgroundColor: '#fff',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden'
                                }}
                            />
                        </div>
                    </div>

                    {/* Narrative fields (5 per row, auto-height) */}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(4, 1fr)', 
                        gap: '15px', 
                        marginBottom: '20px'
                    }}>
                        {[
                            { key: 'allergy', label: 'Allergy' },
                            // { key: 'medicalHistory', label: 'Medical History:' },
                            { key: 'surgicalHistory', label: 'Surgical History' },
                            { key: 'visitComments', label: 'Visit Comments' },
                            { key: 'medicines', label: 'Exisiting Medicines' },
                            { key: 'detailedHistory', label: 'Detailed History/Additional Comments' },
                            { key: 'examinationFindings', label: 'Important/Examination Findings' },
                            { key: 'complaints', label: 'Complaints' },
                            { key: 'provisionalDiagnosis', label: 'Provisional Diagnosis' },
                            // { key: 'examinationComments', label: 'Examination Comments/Detailed History:' },
                            // { key: 'procedurePerformed', label: 'Procedure Performed/Notes:' }
                        ].map(({ key, label }) => (
                            <div key={key}>
                                <label style={{ 
                                    display: 'block', 
                                    color: '#212121', 
                                    fontSize: '0.9rem', 
                                    fontWeight: 'bold',
                                    marginBottom: '5px',
                                    fontFamily: "'Roboto', sans-serif"
                                }}>
                                    {label}
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <textarea
                                        value={
                                            isReadOnly
                                                ? truncateText(
                                                    key === 'labSuggested'
                                                        ? getLabSuggestedValue()
                                                        : key === 'complaints'
                                                            ? getComplaintsValue()
                                                            : (formData[key as keyof typeof formData] as string)
                                                  )
                                                : (
                                                    key === 'labSuggested'
                                                        ? getLabSuggestedValue()
                                                        : key === 'complaints'
                                                            ? getComplaintsValue()
                                                            : (formData[key as keyof typeof formData] as string)
                                                  )
                                        }
                                        onChange={(e) => { handleInputChange(key, e.target.value); }}
                                        placeholder={formData[key as keyof typeof formData] ? '' : '-'}
                                        disabled={isReadOnly}
                                        style={{
                                            width: '100%',
                                            height: '40px',
                                            padding: '8px 12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '0.9rem',
                                            fontFamily: "'Roboto', sans-serif",
                                            backgroundColor: '#fff',
                                            overflow: 'hidden',
                                            resize: 'none',
                                            lineHeight: '1.4',
                                            boxSizing: 'border-box',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}
                                        title={
                                            key === 'labSuggested'
                                                ? getLabSuggestedValue()
                                                : key === 'complaints'
                                                    ? getComplaintsValue()
                                                    : (formData[key as keyof typeof formData] as string)
                                        }
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(4, 1fr)', 
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
                            // { key: 'examinationFindings', label: 'Important/Examination Findings:' },
                            // { key: 'complaints', label: 'Complaints:' },
                            // { key: 'provisionalDiagnosis', label: 'Provisional Diagnosis:' },
                            { key: 'examinationComments', label: 'Examination Comments/Detailed History:' },
                            { key: 'procedurePerformed', label: 'Procedure Performed/Notes:' },
                            { key: 'labSuggested', label: 'Lab Suggested:' }
                        ].map(({ key, label }) => (
                            <div key={key}>
                                <label style={{ 
                                    display: 'block', 
                                    color: '#212121', 
                                    fontSize: '0.9rem', 
                                    fontWeight: '700',
                                    marginBottom: '5px',
                                    fontFamily: "'Roboto', sans-serif"
                                }}>
                                    {label}
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <textarea
                                        value={isReadOnly ? truncateText(key === 'labSuggested' ? getLabSuggestedValue() : (formData[key as keyof typeof formData] as string)) : (key === 'labSuggested' ? getLabSuggestedValue() : (formData[key as keyof typeof formData] as string))}
                                        onChange={(e) => { handleInputChange(key, e.target.value); }}
                                        placeholder={formData[key as keyof typeof formData] ? '' : '-'}
                                        disabled={isReadOnly}
                                        style={{
                                            width: '100%',
                                            height: '40px',
                                            padding: '8px 12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '0.9rem',
                                            fontFamily: "'Roboto', sans-serif",
                                            backgroundColor: '#fff',
                                            overflow: 'hidden',
                                            resize: 'none',
                                            lineHeight: '1.4',
                                            boxSizing: 'border-box',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}
                                        title={key === 'labSuggested' ? getLabSuggestedValue() : (formData[key as keyof typeof formData] as string)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Prescriptions - moved here after Procedure Performed/Notes */}
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ 
                            color: '#212121', 
                            fontSize: '1rem', 
                            fontWeight: '600',
                            fontFamily: "'Roboto', sans-serif",
                            // borderBottom: '1px solid #e0e0e0',
                            // paddingBottom: '10px',
                            marginBottom: '10px !important'
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
                                        formData.prescriptions.map((prescription, index) => {
                                            // Fallback: if medicine is empty, try to get brandName from rawVisit
                                            let medicineDisplay = prescription.medicine || '';
                                            if (!medicineDisplay && formData.rawVisit?.Prescriptions?.[index]) {
                                                const rawPrescription = formData.rawVisit.Prescriptions[index];
                                                medicineDisplay = rawPrescription?.brandName || rawPrescription?.medicineName || rawPrescription?.Medicine_Name || '';
                                            }
                                            
                                            return (
                                            <tr key={index}>
                                                <td style={{ height: '40px', padding: '10px', lineHeight: '20px', borderBottom: '1px solid #eaeaea', borderRight: '1px solid #e0e0e0', verticalAlign: 'middle', whiteSpace: 'normal', wordBreak: 'break-word', overflow: 'hidden' }}>
                                                        {medicineDisplay || '-'}
                                                </td>
                                                <td style={{ height: '40px', padding: '10px', lineHeight: '20px', borderBottom: '1px solid #eaeaea', borderRight: '1px solid #e0e0e0', verticalAlign: 'middle', whiteSpace: 'normal', wordBreak: 'break-word', overflow: 'hidden' }}>
                                                    {prescription.dosage || '-'}
                                                </td>
                                                <td style={{ height: '40px', padding: '10px', lineHeight: '20px', borderBottom: '1px solid #eaeaea', verticalAlign: 'middle', whiteSpace: 'normal', wordBreak: 'break-word', overflow: 'hidden' }}>
                                                    {prescription.instructions || '-'}
                                                </td>
                                            </tr>
                                            );
                                        })
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
                        gridTemplateColumns: 'repeat(4, 1fr)', 
                        gap: '15px' 
                    }}>
                        {[
                            // { key: 'labSuggested', label: 'Lab Suggested:' },
                            { key: 'medicines', label: 'Medicines' },
                            { key: 'dressing', label: 'Dressing' },
                            { key: 'procedure', label: 'Procedure' },
                            { key: 'plan', label: 'Plan' }
                        ].map(({ key, label }) => (
                            <div key={key}>
                                <label style={{ 
                                    display: 'block', 
                                    color: '#212121', 
                                    fontSize: '0.9rem', 
                                    fontWeight: 'bold',
                                    marginBottom: '5px',
                                    fontFamily: "'Roboto', sans-serif"
                                }}>
                                    {label}
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <textarea
                                        value={isReadOnly ? truncateText(key === 'labSuggested' ? getLabSuggestedValue() : (formData[key as keyof typeof formData] as string)) : (key === 'labSuggested' ? getLabSuggestedValue() : (formData[key as keyof typeof formData] as string))}
                                        onChange={(e) => { handleInputChange(key, e.target.value); }}
                                        placeholder={formData[key as keyof typeof formData] ? '' : '-'}
                                        disabled={isReadOnly}
                                        style={{
                                            width: '100%',
                                            height: '40px',
                                            padding: '8px 12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '0.9rem',
                                            fontFamily: "'Roboto', sans-serif",
                                            backgroundColor: '#fff',
                                            overflow: 'hidden',
                                            resize: 'none',
                                            lineHeight: '1.4',
                                            boxSizing: 'border-box',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}
                                        title={key === 'labSuggested' ? getLabSuggestedValue() : (formData[key as keyof typeof formData] as string)}
                                    />
                                </div>
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
                    <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '15px'
                    }}>
                        <div style={{ minWidth: 0 }}>
                            <label style={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                color: '#212121', 
                                fontSize: '0.9rem', 
                                fontWeight: 'bold',
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
                                        color: "#1E88E5",
                                        fontSize: '0.9rem',
                                        // fontStyle: '',
                                        fontWeight: '100'
                                    }}>
                                        Breakup
                                    </span>
                                    {showBillingTooltip && (() => {
                                        const billingData = formData.rawVisit?.Billing || [];
                                        const hasBillingData = Array.isArray(billingData) && billingData.length > 0;
                                        
                                        return (
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
                                                marginBottom: '5px',
                                                minWidth: '150px'
                                            }}>
                                                {hasBillingData ? (
                                                    billingData.map((item: any, index: number) => {
                                                        const billingDetails = item.billing_details || item.billingDetails || '';
                                                        const fees = item.collected_fees || item.collectedFees || item.default_fees || item.defaultFees || 0;
                                                        const displayName = billingDetails || `${item.billing_group_name || ''} - ${item.billing_subgroup_name || ''}`.replace(/^ - | - $/g, '');
                                                        return (
                                                            <div key={index}>
                                                                {displayName}: ₹{typeof fees === 'number' ? fees.toFixed(2) : fees}
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div>No billing details available</div>
                                                )}
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
                                        );
                                    })()}
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
                                    backgroundColor: '#fff',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden'
                                }}
                            />
                        </div>
                        
                        <div style={{ minWidth: 0 }}>
                            <label style={{ 
                                display: 'block', 
                                color: '#212121', 
                                fontSize: '0.9rem', 
                                fontWeight: 'bold',
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
                                    backgroundColor: '#fff',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden'
                                }}
                            />
                        </div>
                        
                        <div style={{ minWidth: 0 }}>
                            <label style={{ 
                                display: 'block', 
                                color: '#212121', 
                                fontSize: '0.9rem', 
                                fontWeight: 'bold',
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
                                    backgroundColor: '#fff',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden'
                                }}
                            />
                        </div>
                        
                        <div style={{ minWidth: 0 }}>
                            <label style={{ 
                                display: 'block', 
                                color: '#212121', 
                                fontSize: '0.9rem', 
                                fontWeight: 'bold',
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
                                    backgroundColor: '#fff',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden'
                                }}
                            />
                        </div>
                        
                        <div style={{ minWidth: 0 }}>
                            <label style={{ 
                                display: 'block', 
                                color: '#212121', 
                                fontSize: '0.9rem', 
                                fontWeight: 'bold',
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
                                    backgroundColor: '#fff',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden'
                                }}
                            />
                        </div>
                        
                        <div style={{ minWidth: 0 }}>
                            <label style={{ 
                                display: 'block', 
                                color: '#212121', 
                                fontSize: '0.9rem', 
                                fontWeight: 'bold',
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
                                    backgroundColor: '#fff',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden'
                                }}
                            />
                        </div>
                        
                        <div style={{ minWidth: 220 }}>
                            <label style={{ 
                                display: 'block', 
                                color: '#212121', 
                                fontSize: '0.9rem', 
                                fontWeight: 'bold',
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
                                    backgroundColor: '#fff',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden'
                                }}
                            />
                        </div>
                        
                        <div style={{ minWidth: 220 }}>
                            <label style={{ 
                                display: 'block', 
                                color: '#212121', 
                                fontSize: '0.9rem', 
                                fontWeight: 'bold',
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
                                    backgroundColor: '#fff',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden'
                                }}
                            />
                        </div>
                        <div style={{ minWidth: 220 }}>
                            <label style={{ 
                                display: 'block', 
                                color: '#212121', 
                                fontSize: '0.9rem', 
                                fontWeight: 'bold',
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
                                    backgroundColor: '#fff',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden'
                                }}
                            />
                        </div>
                        
                        <div style={{ minWidth: 0 }}>
                            <label style={{ 
                                display: 'block', 
                                color: '#212121', 
                                fontSize: '0.9rem', 
                                fontWeight: 'bold',
                                marginBottom: '5px',
                                fontFamily: "'Roboto', sans-serif"
                            }}>
                                Follow Up:
                            </label>
                            <input
                                type="text"
                                value={isReadOnly ? truncateText(formData.followUp) : formData.followUp}
                                onChange={(e) => handleInputChange('followUp', e.target.value)}
                                disabled={isReadOnly}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem',
                                    fontFamily: "'Roboto', sans-serif",
                                    backgroundColor: '#fff',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden'
                                }}
                            />
                        </div>
                        
                        <div style={{ minWidth: 0 }}>
                            <label style={{ 
                                display: 'block', 
                                color: '#212121', 
                                fontSize: '0.9rem', 
                                fontWeight: 'bold',
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
                                    backgroundColor: '#fff',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden'
                                }}
                            />
                        </div>
                        
                        <div>
                            <label style={{ 
                                display: 'block', 
                                color: '#212121', 
                                fontSize: '0.9rem', 
                                fontWeight: 'bold',
                                marginBottom: '5px',
                                fontFamily: "'Roboto', sans-serif"
                            }}>
                                Remark:
                            </label>
                            <input
                                type="text"
                                value={isReadOnly ? truncateText(formData.remark) : formData.remark}
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
                                    backgroundColor: '#fff',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ 
                                display: 'block', 
                                color: '#212121', 
                                fontSize: '0.9rem', 
                                fontWeight: 'bold',
                                marginBottom: '5px',
                                fontFamily: "'Roboto', sans-serif"
                            }}>
                                Addendum:
                            </label>
                            <input
                                type="text"
                                value={isReadOnly ? truncateText(formData.addendum) : formData.addendum}
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
                                    backgroundColor: '#fff',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden'
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
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
