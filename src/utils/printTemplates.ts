type PatientInfo = {
    name: string;
    gender: string;
    age: string;
    patientId: string;
    visitDate: string;
    contact: string;
    weight: string;
    height: string;
    bmi: string;
};

type MedicalDetails = {
    complaints: string;
    examinationFindings: string;
    diagnosis: string;
    pulse: string;
    bp: string;
    sugar: string;
};

type PrescriptionPrintOptions = {
    headerImageUrl: string;
    title?: string;
    patientInfo: PatientInfo;
    medicalDetails: MedicalDetails;
    prescriptionTableHTML: string;
    adviceContent?: string;
    instructionsHTML?: string;
};

type LabTestsPrintOptions = {
    headerImageUrl: string;
    title?: string;
    patientInfo: PatientInfo;
    labTestListHTML: string;
};

type ReceiptPrintOptions = {
    headerImageUrl: string;
    receiptNo: string;
    receiptDate: string;
    patientName: string;
    patientGender?: string;
    patientAge?: string;
    paymentBy: string;
    amount: string;
    amountInWords: string;
    durationText: string;
    details: string;
};

export const getHeaderImageUrl = () => {
    if (typeof window === 'undefined') {
        return '/images/DrTongaonkar.png';
    }
    return `${window.location.origin}/images/DrTongaonkar.png`;
};

export const buildPrescriptionPrintHTML = ({
    headerImageUrl,
    title = 'Prescription',
    patientInfo,
    medicalDetails,
    prescriptionTableHTML,
    adviceContent,
    instructionsHTML
}: PrescriptionPrintOptions) => `
    <!DOCTYPE html>
    <html>
    <head>
        <title>${title}</title>
        <style>
            @media print {
                @page {
                    margin: 20mm;
                }
                body {
                    margin: 0;
                    padding: 0;
                }
            }
            body {
                font-family: Arial, sans-serif;
                padding: 20px;
                max-width: 800px;
                margin: 0 auto;
            }
            .horizontal-line {
                border-top: 2px solid #000;
                margin: 10px 0;
            }
            .patient-info-line1 {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 2px;
                line-height: 1.8;
            }
            .patient-info-line2 {
                font-size: 14px;
                margin: 10px 0;
                line-height: 1.8;
                font-family:'Times New Roman', serif;
            }
            .medical-details {
                font-size: 16px;
                font-weight: bold;
                margin: 10px 0;
                line-height: 1.8;
            }
            .prescription-section {
                margin-top: 15px;
            }
            .prescription-section strong {
                font-size: 16px;
                font-weight: bold;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
                font-size: 12px;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 8px;
            }
            th {
                background-color: #f5f5f5;
                font-weight: bold;
                text-align: left;
            }
            td {
                text-align: left;
            }
            .advice-section {
                margin-top: 20px;
                position: relative;
            }
            .advice-line-top {
                border-top: 2px solid #000;
                margin-bottom: 5px;
            }
            .advice-line-bottom {
                border-top: 2px solid #000;
                margin-top: 5px;
            }
            .advice-text {
                font-size: 14px;
                font-weight: bold;
                text-align: left;
                margin: 5px 0;
            }
            .advice-content {
                margin-top: 5px;
                white-space: pre-wrap;
                font-size: 12px;
            }
            .instructions-section {
                margin-top: 20px;
                position: relative;
            }
            .instructions-line-top {
                border-top: 2px solid #000;
                margin-bottom: 5px;
            }
            .instructions-line-bottom {
                border-top: 2px solid #000;
                margin-top: 5px;
            }
            .instructions-text {
                font-size: 14px;
                font-weight: bold;
                text-align: left;
                
            }
            .instructions-content {
                font-size: 12px;
                line-height: 1.6;
            }
             .patient-header{
    margin-bottom:2px;
    display:flex;
    justify-content:space-between;
    align-items:center;
    font-family:'Times New Roman', serif;
    font-size:14px;
}
.patient-left span{
    margin-right:4px;
}
.patient-name{
    font-weight:bold;
}

.patient-id{
    font-weight:bold;
}
.patient-gap{
    margin-left:20px;
}


.patient-date{
    white-space:nowrap;
}

.medical-section{
    font-family: "Times New Roman", serif;
    font-size: 18px;
    line-height: 1.3;
}

.medical-details{
    font-weight: bold;
}
        </style>
    </head>
    <body>
        <div style="text-align: center; margin-bottom: 10px;">
            <img src="${headerImageUrl}" alt="Clinic Header" style="max-width: 100%; height: auto;" />
        </div>
        
        <div class="horizontal-line"></div>
        
<div class="patient-header">
    
    <div class="patient-left">
        <span>Name:</span>
        <span class="patient-name">${patientInfo.name}</span>

        <span class="patient-gap">${patientInfo.gender} / ${patientInfo.age}</span>

        <span class="patient-gap">Id:</span>
        <span class="patient-id">${patientInfo.patientId}</span>
    </div>

    <div class="patient-date">
        Date: ${patientInfo.visitDate}
    </div>

</div>

<div class="patient-info-line2">
    Contact Number: ${patientInfo.contact}, 
    Weight (Kg): ${patientInfo.weight}, 
    Height (Cm): ${patientInfo.height}, 
    BMI: ${patientInfo.bmi}
</div>
        <div class="horizontal-line"></div>

       <div class="medical-section">

<span class="medical-details">Complaint:</span> <span>${medicalDetails.complaints}</span><br/>

<span class="medical-details">Examination Finding:</span> <span>${medicalDetails.examinationFindings}</span><br/>

<span class="medical-details">Diagnosis:</span> <span>${medicalDetails.diagnosis}</span><br/>

<span class="medical-details">Pulse:</span> <span>${medicalDetails.pulse}</span><br/>

<span class="medical-details">BP:</span> <span>${medicalDetails.bp}</span><br/>

<span class="medical-details">Sugar:</span> <span>${medicalDetails.sugar}</span>

</div>
        <div class="prescription-section">
            <strong>Rx:</strong>
            ${prescriptionTableHTML}
        </div>

        <div class="advice-section">
            <div class="advice-line-top"></div>
            <div class="advice-text">Adv:</div>
            ${adviceContent ? `<div class="advice-content">${adviceContent}</div>` : ''}
            <div class="advice-line-bottom"></div>
        </div>

        ${instructionsHTML ? `
        <div class="instructions-section">
            <div class="instructions-text">Instructions for Patient:</div>
            <div class="instructions-content">${instructionsHTML}</div>
            <div class="instructions-line-bottom"></div>
        </div>
        ` : ''}
    </body>
    </html>
`;

export const buildLabTestsPrintHTML = ({
    headerImageUrl,
    title = 'Lab Tests Asked',
    patientInfo,
    labTestListHTML
}: LabTestsPrintOptions) => `
    <!DOCTYPE html>
    <html>
    <head>
        <title>${title}</title>
        <style>
            @media print {
                @page {
                    margin: 20mm;
                }
                body {
                    margin: 0;
                    padding: 0;
                }
            }
            body {
                font-family: Arial, sans-serif;
                padding: 20px;
                max-width: 800px;
                margin: 0 auto;
            }
            .horizontal-line {
                border-top: 2px solid #000;
                margin: 10px 0;
            }
            .patient-info-line1 {
                font-size: 16px;
                font-weight: bold;
               margin-bottom: 2px;
                line-height: 1.8;
            }
            .patient-info-line2 {
                font-size: 14px;
                margin: 10px 0;
                font-family:'Times New Roman', serif;
                line-height: 1.8;
            }
        </style>
    </head>
    <body>
        <div style="text-align: center; margin-bottom: 10px;">
            <img src="${headerImageUrl}" alt="Clinic Header" style="max-width: 100%; height: auto;" />
        </div>
        
        <div class="horizontal-line"></div>
        
        <div class="patient-info-line1">
            Names: ${patientInfo.name} ${patientInfo.gender} / ${patientInfo.age} Y Id: ${patientInfo.patientId} Date: ${patientInfo.visitDate}
        </div>
        
        <div class="patient-info-line2">
            Contact Number: ${patientInfo.contact}, Weight (Kg): ${patientInfo.weight} Height (Cm): ${patientInfo.height} BMI: ${patientInfo.bmi}
        </div>

        <div class="horizontal-line"></div>

        <div style="margin-top: 15px;">
            <strong style="font-size: 16px; font-weight: bold;">Lab Tests Asked:</strong>
            ${labTestListHTML}
        </div>
    </body>
    </html>
`;

export const buildReceiptPrintHTML = ({
    headerImageUrl,
    receiptNo,
    receiptDate,
    patientName,
    patientGender = '',
    patientAge = '',
    paymentBy,
    amount,
    amountInWords,
    durationText,
    details
}: ReceiptPrintOptions) => `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Receipt</title>
        <style>
            @media print {
                @page {
                    margin: 15mm;
                }
                body {
                    margin: 0;
                    padding: 0;
                }
            }
            body {
                font-family: "Times New Roman", serif;
                padding: 25px;
                max-width: 950px;
                margin: 0 auto;
                color: #111;
                font-size: 14px;
                line-height: 1.6;
            }
            .horizontal-line {
                border-top: 2px solid #000;
                margin: 14px 0;
            }
            .receipt-title {
                text-align: center;
                font-weight: bold;
                letter-spacing: 2px;
                font-size: 16px;
                margin: 12px 0;
            }
            .row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
            }
            .label {
                font-weight: bold;
            }
            .section {
                margin-top: 18px;
            }
        </style>
    </head>
    <body>
        <div style="text-align: center; margin-bottom: 10px;">
            <img src="${headerImageUrl}" alt="Clinic Header" style="max-width: 100%; height: auto;" />
        </div>

        <div class="horizontal-line"></div>
        <div class="receipt-title">RECEIPT</div>
        <div class="horizontal-line"></div>

        <div class="row">
            <div><span class="label">Receipt No:</span> ${receiptNo || '-'}</div>
            <div><span class="label">Receipt Date:</span> ${receiptDate || '-'}</div>
        </div>

        <div class="section">
            <div><span class="label">Received with thanks from</span> ${patientName || '-'} ${patientGender ? `/ ${patientGender}` : ''} ${patientAge ? `/ ${patientAge}` : ''}</div>
        </div>

        <div class="section">
            <div>
                <span class="label">Rs. ${amount}</span> ( ${amountInWords} ) By ${paymentBy || '-'}
            </div>
        </div>

        <div class="section">
            <div><span class="label">Duration -</span> ${durationText}</div>
        </div>

        <div class="section">
            <div><span class="label">Details -</span> ${details || '-'}</div>
        </div>
    </body>
    </html>
`;

