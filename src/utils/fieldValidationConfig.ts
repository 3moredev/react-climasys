/**
 * Field validation configuration matching backend database column constraints.
 * This ensures frontend validation stays in sync with backend limits.
 */

export interface FieldConfig {
    maxLength?: number;
    fieldName: string;
    type?: 'text' | 'email' | 'number' | 'textarea';
    pattern?: RegExp;
    min?: number;
    max?: number;
}

/**
 * Patient Master Table Fields
 */
export const PATIENT_FIELDS = {
    // Names
    firstName: { maxLength: 100, fieldName: 'First name', type: 'text' as const },
    middleName: { maxLength: 100, fieldName: 'Middle name', type: 'text' as const },
    lastName: { maxLength: 100, fieldName: 'Last name', type: 'text' as const },

    // Contact
    mobile1: { maxLength: 20, fieldName: 'Mobile number', type: 'number' as const },
    mobileNumber: { maxLength: 10, fieldName: 'Mobile number', type: 'number' as const }, // Frontend alias with 10 digit limit
    mobile2: { maxLength: 20, fieldName: 'Mobile number 2', type: 'number' as const },
    residentialNo: { maxLength: 30, fieldName: 'Residential number', type: 'text' as const },
    emergencyNumber: { maxLength: 30, fieldName: 'Emergency number', type: 'text' as const },
    emergencyName: { maxLength: 60, fieldName: 'Emergency contact name', type: 'text' as const },
    emailId: { maxLength: 60, fieldName: 'Email', type: 'email' as const },
    email: { maxLength: 60, fieldName: 'Email', type: 'email' as const }, // Frontend alias
    patientEmail: { maxLength: 60, fieldName: 'Email', type: 'email' as const }, // Frontend alias used in Registration.tsx

    // Address
    address1: { maxLength: 150, fieldName: 'Address', type: 'text' as const },
    address: { maxLength: 150, fieldName: 'Address', type: 'text' as const }, // Frontend alias
    address2: { maxLength: 150, fieldName: 'Address line 2', type: 'text' as const },
    pincode: { maxLength: 20, fieldName: 'Pincode', type: 'text' as const },

    // Referral Doctor
    referDoctorDetails: { maxLength: 200, fieldName: 'Referral doctor name', type: 'text' as const },
    referralName: { maxLength: 200, fieldName: 'Referral doctor name', type: 'text' as const }, // Frontend alias
    doctorAddress: { maxLength: 150, fieldName: 'Doctor address', type: 'text' as const },
    referralAddress: { maxLength: 150, fieldName: 'Referral address', type: 'text' as const }, // Frontend alias
    doctorMobile: { maxLength: 10, fieldName: 'Doctor mobile', type: 'number' as const },
    referralContact: { maxLength: 10, fieldName: 'Referral contact', type: 'number' as const }, // Frontend alias
    doctorEmail: { maxLength: 60, fieldName: 'Doctor email', type: 'email' as const },
    doctorMail: { maxLength: 60, fieldName: 'Doctor email', type: 'email' as const }, // Frontend alias
    referralEmail: { maxLength: 60, fieldName: 'Referral email', type: 'email' as const }, // Frontend alias

    // System fields
    folderNo: { maxLength: 30, fieldName: 'Folder number', type: 'text' as const },
    folderPath: { maxLength: 100, fieldName: 'Folder path', type: 'text' as const },
} as const;

/**
 * Patient Visit Table Fields
 */
export const VISIT_FIELDS = {
    // Referral
    referDoctorDetails: { maxLength: 200, fieldName: 'Referral doctor name', type: 'text' as const },
    doctorAddress: { maxLength: 150, fieldName: 'Referral address', type: 'text' as const },
    doctorMobile: { maxLength: 10, fieldName: 'Referral mobile', type: 'number' as const },
    doctorEmail: { maxLength: 60, fieldName: 'Referral email', type: 'email' as const },

    // Vitals
    pulse: { maxLength: 3, fieldName: 'Pulse', type: 'number' as const, min: 30, max: 220 },
    height: { maxLength: 3, fieldName: 'Height', type: 'number' as const, pattern: /^\d*\.?\d*$/, min: 30, max: 250 },
    weight: { maxLength: 5, fieldName: 'Weight', type: 'number' as const, pattern: /^\d*\.?\d*$/, min: 1, max: 250 },
    bloodPressure: { maxLength: 10, fieldName: 'Blood pressure', type: 'text' as const },
    bp: { maxLength: 10, fieldName: 'Blood pressure', type: 'text' as const }, // Frontend alias
    sugar: { maxLength: 25, fieldName: 'Sugar', type: 'text' as const },
    tft: { maxLength: 25, fieldName: 'TFT', type: 'text' as const },
    tpr: { maxLength: 10, fieldName: 'TPR', type: 'text' as const },
    pallor: { maxLength: 10, fieldName: 'Pallor', type: 'text' as const },
    pallorHb: { maxLength: 25, fieldName: 'Pallor/HB', type: 'text' as const }, // Frontend alias
    systemic: { maxLength: 30, fieldName: 'Systemic', type: 'text' as const },
    odeama: { maxLength: 10, fieldName: 'Odeama', type: 'text' as const },
    gc: { maxLength: 20, fieldName: 'GC', type: 'text' as const },

    // Comments/Notes (500 chars)
    allergyDtls: { maxLength: 500, fieldName: 'Allergy details', type: 'textarea' as const },
    allergyDetails: { maxLength: 500, fieldName: 'Allergy details', type: 'textarea' as const }, // Frontend alias
    allergy: { maxLength: 500, fieldName: 'Allergy', type: 'textarea' as const }, // Frontend alias
    comment: { maxLength: 500, fieldName: 'Comment', type: 'textarea' as const },
    comments: { maxLength: 500, fieldName: 'Comment', type: 'textarea' as const }, // Frontend alias

    // Comments/Notes (1000 chars)
    habitsComments: { maxLength: 1000, fieldName: 'Habits comments', type: 'textarea' as const },
    instructions: { maxLength: 1000, fieldName: 'Instructions', type: 'textarea' as const },
    observation: { maxLength: 1000, fieldName: 'Observation', type: 'textarea' as const },
    symptomComment: { maxLength: 1000, fieldName: 'Symptom comment', type: 'textarea' as const },
    symptomComments: { maxLength: 1000, fieldName: 'Symptom comment', type: 'textarea' as const }, // Frontend alias
    impression: { maxLength: 1000, fieldName: 'Impression', type: 'textarea' as const },
    visitComments: { maxLength: 1000, fieldName: 'Visit comments', type: 'textarea' as const },
    currentComplaints: { maxLength: 1000, fieldName: 'Current complaints', type: 'textarea' as const },
    currentMedicines: { maxLength: 1000, fieldName: 'Current medicines', type: 'textarea' as const },
    medicines: { maxLength: 1000, fieldName: 'Medicines', type: 'textarea' as const }, // Frontend alias
    treatmentPlan: { maxLength: 1000, fieldName: 'Treatment plan', type: 'textarea' as const },
    plan: { maxLength: 1000, fieldName: 'Plan', type: 'textarea' as const },
    planAdv: { maxLength: 1000, fieldName: 'Plan / Adv', type: 'textarea' as const }, // Frontend alias
    notes: { maxLength: 1000, fieldName: 'Notes', type: 'textarea' as const },

    thtext: { maxLength: 1000, fieldName: 'Medical History', type: 'textarea' as const },
    medicalHistory: { maxLength: 1000, fieldName: 'Medical History', type: 'textarea' as const }, // Frontend alias
    medicalHistoryText: { maxLength: 1000, fieldName: 'Medical History', type: 'textarea' as const }, // Frontend alias
    surgicalHistory: { maxLength: 1000, fieldName: 'Surgical History', type: 'textarea' as const },
    surgicalHistoryPastHistory: { maxLength: 1000, fieldName: 'Surgical History', type: 'textarea' as const }, // Backend field name
    detailedHistory: { maxLength: 1000, fieldName: 'Detailed History', type: 'textarea' as const },
    examinationFindings: { maxLength: 1000, fieldName: 'Examination Findings', type: 'textarea' as const },
    importantFindings: { maxLength: 1000, fieldName: 'Important Findings', type: 'textarea' as const },
    additionalComments: { maxLength: 1000, fieldName: 'Additional Comments', type: 'textarea' as const },
    procedurePerformed: { maxLength: 1000, fieldName: 'Procedure Performed', type: 'textarea' as const },
    dressingBodyParts: { maxLength: 1000, fieldName: 'Dressing (body parts)', type: 'textarea' as const },
    pc: { maxLength: 1000, fieldName: 'PC', type: 'textarea' as const },
    addendum: { maxLength: 1000, fieldName: 'Addendum', type: 'textarea' as const },
    fmp: { maxLength: 1000, fieldName: 'FMP', type: 'textarea' as const },
    prmc: { maxLength: 1000, fieldName: 'PRMC', type: 'textarea' as const },
    pamc: { maxLength: 1000, fieldName: 'PAMC', type: 'textarea' as const },
    lmp: { maxLength: 1000, fieldName: 'LMP', type: 'textarea' as const },
    obstetricsHistory: { maxLength: 1000, fieldName: 'Obstetrics History', type: 'textarea' as const },
    gynecAdditionalComments: { maxLength: 1000, fieldName: 'Gynec Additional Comments', type: 'textarea' as const },
    offlineReason: { maxLength: 500, fieldName: 'Offline reason', type: 'textarea' as const },
    paymentRemark: { maxLength: 1000, fieldName: 'Payment remark', type: 'textarea' as const },
    followUp: { maxLength: 100, fieldName: 'Follow up', type: 'text' as const },
    followUpComment: { maxLength: 1000, fieldName: 'Follow up comment', type: 'textarea' as const },
    treatmentComment: { maxLength: 1000, fieldName: 'Treatment comment', type: 'textarea' as const },
    doctorNotes: { maxLength: 100, fieldName: 'Doctor notes', type: 'text' as const },
    docNotes: { maxLength: 100, fieldName: 'Doctor notes', type: 'text' as const }, // Frontend alias
    additionalInstructions: { maxLength: 1000, fieldName: 'Additional instructions', type: 'textarea' as const },
    impressionFinding: { maxLength: 1000, fieldName: 'Impression finding', type: 'textarea' as const },
    complaintsByPatientPerVisit: { maxLength: 400, fieldName: 'Chief complaint', type: 'text' as const },
    chiefComplaint: { maxLength: 400, fieldName: 'Chief complaint', type: 'text' as const }, // Frontend alias
    referralName: { maxLength: 200, fieldName: 'Referral doctor name', type: 'text' as const },
    referralContact: { maxLength: 10, fieldName: 'Referral mobile', type: 'number' as const },
    referralEmail: { maxLength: 60, fieldName: 'Referral email', type: 'email' as const },
    referralAddress: { maxLength: 150, fieldName: 'Referral address', type: 'text' as const },
    pastSurgicalHistory: { maxLength: 1000, fieldName: 'Past surgical history', type: 'textarea' as const },
    complaintComment: { maxLength: 500, fieldName: 'Duration/Comment', type: 'text' as const },
    complaintSearch: { maxLength: 100, fieldName: 'Complaint Search', type: 'text' as const },
} as const;

/**
 * Referral Doctor Table Fields
 */
export const REFERRAL_DOCTOR_FIELDS = {
    doctorName: { maxLength: 50, fieldName: 'Doctor name', type: 'text' as const },
    doctorAddress: { maxLength: 150, fieldName: 'Doctor address', type: 'text' as const },
    doctorMob: { maxLength: 10, fieldName: 'Doctor mobile', type: 'number' as const },
    doctorMail: { maxLength: 60, fieldName: 'Doctor email', type: 'email' as const },
    remarks: { maxLength: 500, fieldName: 'Remarks', type: 'textarea' as const },
} as const;

/**
 * Lab Details Fields
 */
export const LAB_FIELDS = {
    labName: { maxLength: 200, fieldName: 'Lab Name', type: 'text' as const },
    labDoctorName: { maxLength: 200, fieldName: 'Doctor Name', type: 'text' as const },
    comment: { maxLength: 1000, fieldName: 'Comment', type: 'textarea' as const },
} as const;

/**
 * Complaint Master Fields
 */
export const COMPLAINT_FIELDS = {
    shortDescription: { maxLength: 40, fieldName: 'Short Description', type: 'text' as const },
    complaintDescription: { maxLength: 1000, fieldName: 'Complaint Description', type: 'text' as const },
    priority: { maxLength: 10, fieldName: 'Priority', type: 'number' as const },
} as const;

/**
 * Diagnosis Master Fields
 */
export const DIAGNOSIS_FIELDS = {
    shortDescription: { maxLength: 40, fieldName: 'Short Description', type: 'text' as const },
    diagnosisDescription: { maxLength: 1000, fieldName: 'Diagnosis Description', type: 'text' as const },
    priority: { maxLength: 10, fieldName: 'Priority', type: 'number' as const },
} as const;

/**
 * Medicine Master Fields
 */
export const MEDICINE_FIELDS = {
    shortDescription: { maxLength: 40, fieldName: 'Short Description', type: 'text' as const },
    medicineName: { maxLength: 1000, fieldName: 'Medicine Name', type: 'text' as const },
    priority: { maxLength: 10, fieldName: 'Priority', type: 'number' as const },
    instruction: { maxLength: 4000, fieldName: 'Instruction', type: 'text' as const },
    breakfast: { maxLength: 10, fieldName: 'Breakfast', type: 'number' as const, pattern: /^\d*\.?\d*$/ },
    lunch: { maxLength: 10, fieldName: 'Lunch', type: 'number' as const, pattern: /^\d*\.?\d*$/ },
    dinner: { maxLength: 10, fieldName: 'Dinner', type: 'number' as const, pattern: /^\d*\.?\d*$/ },
    days: { maxLength: 10, fieldName: 'Days', type: 'number' as const, pattern: /^\d*\.?\d*$/ },
} as const;

/**
 * Procedure Master Fields
 */
export const PROCEDURE_FIELDS = {
    procedureDescription: { maxLength: 100, fieldName: 'Procedure Description', type: 'text' as const },
    findingsDescription: { maxLength: 200, fieldName: 'Findings Description', type: 'text' as const },
    priority: { maxLength: 10, fieldName: 'Priority', type: 'number' as const },
} as const;

/**
 * Group Instruction Master Fields
 */
export const GROUP_INSTRUCTION_FIELDS = {
    groupDescription: { maxLength: 200, fieldName: 'Group Description', type: 'text' as const },
    priority: { maxLength: 10, fieldName: 'Priority', type: 'number' as const },
} as const;

/**
 * Lab Master Fields (Popup)
 */
export const LAB_MASTER_FIELDS = {
    labTestName: {
        maxLength: 80,
        fieldName: 'Lab Test Name',
        type: 'text' as const,
        pattern: /^[a-zA-Z0-9\s.\-\(\)]*$/
    },
    parameterName: {
        maxLength: 100,
        fieldName: 'Parameter Name',
        type: 'text' as const,
        pattern: /^[a-zA-Z0-9\s.\-\(\)\/]*$/
    },
    priority: { maxLength: 10, fieldName: 'Priority', type: 'number' as const },
} as const;

/**
 * Billing Details Fields
 */
export const BILLING_DETAILS_FIELDS = {
    details: { maxLength: 150, fieldName: 'Details', type: 'text' as const },
    defaultFee: {
        maxLength: 10,
        fieldName: 'Default Fee',
        type: 'number' as const,
        pattern: /^\d*\.?\d*$/
    },
    sequenceNo: {
        maxLength: 5,
        fieldName: 'Sequence No',
        type: 'number' as const,
        pattern: /^\d*$/
    },
} as const;

/**
 * Prescription Master Fields
 */
export const PRESCRIPTION_CATEGORY_FIELDS = {
    categoryName: {
        maxLength: 60,
        fieldName: 'Category Name',
        type: 'text' as const,
        pattern: /^[a-zA-Z\s\-\'.]*$/
    },
    description: { maxLength: 200, fieldName: 'Category Description', type: 'text' as const },
} as const;

export const PRESCRIPTION_SUB_CATEGORY_FIELDS = {
    subCategoryName: { maxLength: 200, fieldName: 'SubCategory Name', type: 'text' as const },
} as const;

export const PRESCRIPTION_DETAILS_FIELDS = {
    brandName: { maxLength: 200, fieldName: 'Brand Name', type: 'text' as const },
    genericName: { maxLength: 200, fieldName: 'Medicine Name', type: 'text' as const },
    marketedBy: { maxLength: 200, fieldName: 'Marketed By', type: 'text' as const },
    instruction: { maxLength: 4000, fieldName: 'Instruction', type: 'text' as const },
    priority: { maxLength: 10, fieldName: 'Priority', type: 'number' as const },
} as const;

/**
 * Combined field configuration for easy lookup
 */
export const FIELD_CONFIG = {
    patient: PATIENT_FIELDS,
    visit: VISIT_FIELDS,
    referralDoctor: REFERRAL_DOCTOR_FIELDS,
    lab: LAB_FIELDS,
    complaint: COMPLAINT_FIELDS,
    diagnosis: DIAGNOSIS_FIELDS,
    medicine: MEDICINE_FIELDS,
    procedure: PROCEDURE_FIELDS,
    labMaster: LAB_MASTER_FIELDS,
    billing: BILLING_DETAILS_FIELDS,
    prescriptionCategory: PRESCRIPTION_CATEGORY_FIELDS,
    prescriptionSubCategory: PRESCRIPTION_SUB_CATEGORY_FIELDS,
    prescriptionDetails: PRESCRIPTION_DETAILS_FIELDS,
    instructionGroup: GROUP_INSTRUCTION_FIELDS,
} as const;

/**
 * Helper to get field config by field name, optionally scoped by entity
 */
export function getFieldConfig(fieldName: string, entity?: keyof typeof FIELD_CONFIG): FieldConfig | undefined {
    // If entity is provided, search only in that entity's fields
    if (entity && entity in FIELD_CONFIG) {
        const entityFields = FIELD_CONFIG[entity] as Record<string, FieldConfig>;
        if (fieldName in entityFields) {
            return entityFields[fieldName];
        }
        return undefined;
    }

    // Default search across all entities (backward fallback)
    if (fieldName in PATIENT_FIELDS) return PATIENT_FIELDS[fieldName as keyof typeof PATIENT_FIELDS];
    if (fieldName in VISIT_FIELDS) return VISIT_FIELDS[fieldName as keyof typeof VISIT_FIELDS];
    if (fieldName in REFERRAL_DOCTOR_FIELDS) return REFERRAL_DOCTOR_FIELDS[fieldName as keyof typeof REFERRAL_DOCTOR_FIELDS];
    if (fieldName in LAB_FIELDS) return LAB_FIELDS[fieldName as keyof typeof LAB_FIELDS];
    if (fieldName in COMPLAINT_FIELDS) return COMPLAINT_FIELDS[fieldName as keyof typeof COMPLAINT_FIELDS];
    if (fieldName in DIAGNOSIS_FIELDS) return DIAGNOSIS_FIELDS[fieldName as keyof typeof DIAGNOSIS_FIELDS];
    if (fieldName in MEDICINE_FIELDS) return MEDICINE_FIELDS[fieldName as keyof typeof MEDICINE_FIELDS];
    if (fieldName in PROCEDURE_FIELDS) return PROCEDURE_FIELDS[fieldName as keyof typeof PROCEDURE_FIELDS];
    if (fieldName in LAB_MASTER_FIELDS) return LAB_MASTER_FIELDS[fieldName as keyof typeof LAB_MASTER_FIELDS];
    if (fieldName in BILLING_DETAILS_FIELDS) return BILLING_DETAILS_FIELDS[fieldName as keyof typeof BILLING_DETAILS_FIELDS];
    if (fieldName in PRESCRIPTION_CATEGORY_FIELDS) return PRESCRIPTION_CATEGORY_FIELDS[fieldName as keyof typeof PRESCRIPTION_CATEGORY_FIELDS];
    if (fieldName in PRESCRIPTION_SUB_CATEGORY_FIELDS) return PRESCRIPTION_SUB_CATEGORY_FIELDS[fieldName as keyof typeof PRESCRIPTION_SUB_CATEGORY_FIELDS];
    if (fieldName in PRESCRIPTION_DETAILS_FIELDS) return PRESCRIPTION_DETAILS_FIELDS[fieldName as keyof typeof PRESCRIPTION_DETAILS_FIELDS];

    return undefined;
}
