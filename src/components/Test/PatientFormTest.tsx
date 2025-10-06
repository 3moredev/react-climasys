import React, { useState } from 'react';

const PatientFormTest = () => {
    const [formData, setFormData] = useState({
        // Patient Information
        firstName: 'John',
        lastName: 'Doe',
        age: '35',
        gender: 'M',
        contact: '9876543210',
        email: 'john.doe@email.com',
        
        // Medical History
        height: '172.00',
        weight: '77.00',
        pulse: '77',
        bp: '110-70',
        temperature: '98.6',
        
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
        inPerson: true,
        
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
        complaints: 'FEVER WITH RIGORS, FLATULENCE',
        provisionalDiagnosis: 'ENDOMETRIAL KOCHS, ENTERIC FEVER',
        plan: 'BSLR',
        addendum: '',
        
        // Prescriptions
        prescriptions: [
            { medicine: 'ATOCOR CV 10', dosage: '1-0-1 5 Days', instructions: 'खाण्यानंतर / AFTER MEAL' },
            { medicine: 'BONACTIVE D3', dosage: '1-0-1 5 Days', instructions: 'खाण्यानंतर / AFTER MEAL' },
            { medicine: 'ERYTOP', dosage: '1-0-1 5 Days', instructions: '' },
            { medicine: 'HUMINSULIN 30/70', dosage: '1-1-1 5 Days', instructions: '' },
            { medicine: 'RYTVIT 3 G', dosage: '0-0-3 5 Days', instructions: '' }
        ],
        
        // Billing
        billed: '600.00',
        discount: '0.00',
        dues: '600.00',
        collected: '600.00',
        receiptAmount: '600.00',
        receiptNo: '2020-00166',
        receiptDate: '26-Sep-2019',
        followUpType: 'Follow-up',
        followUp: '2 week',
        followUpDate: '',
        remark: ''
    });

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

    const updatePrescription = (index: number, field: string, value: string) => {
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
            minHeight: '100vh', 
            padding: '20px' 
        }}>
            <div style={{ 
                maxWidth: '1200px', 
                margin: '0 auto', 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                padding: '30px'
            }}>
                {/* Header */}
                <div style={{ 
                    borderBottom: '2px solid #e0e0e0', 
                    paddingBottom: '20px', 
                    marginBottom: '30px' 
                }}>
                    <h2 style={{ 
                        color: '#1E88E5', 
                        fontSize: '1.5rem', 
                        fontWeight: '600', 
                        margin: '0 0 10px 0',
                        fontFamily: "'Roboto', sans-serif"
                    }}>
                        Patient Medical Form
                    </h2>
                    <div style={{ 
                        color: '#2E7D32', 
                        fontSize: '1.1rem', 
                        fontWeight: '600',
                        fontFamily: "'Roboto', sans-serif"
                    }}>
                        {formData.firstName} {formData.lastName} / {formData.gender} / {formData.age} Y
                    </div>
                    <div style={{ 
                        color: '#d32f2f', 
                        fontSize: '0.95rem', 
                        fontWeight: '600',
                        marginTop: '5px',
                        fontFamily: "'Roboto', sans-serif"
                    }}>
                        P Dr. Tongaonkar - Medicine
                    </div>
                </div>

                {/* Patient Vitals & History Section */}
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
                        Patient Vitals & History
                    </h3>
                    
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(2, 1fr)', 
                        gap: '20px',
                        marginBottom: '20px'
                    }}>
                        {/* First Column */}
                        <div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ 
                                    display: 'block', 
                                    color: '#212121', 
                                    fontSize: '0.9rem', 
                                    fontWeight: '500',
                                    marginBottom: '5px',
                                    fontFamily: "'Roboto', sans-serif"
                                }}>
                                    Height (Cm):
                                </label>
                                <input
                                    type="text"
                                    value={formData.height}
                                    onChange={(e) => handleInputChange('height', e.target.value)}
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
                            
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ 
                                    display: 'block', 
                                    color: '#212121', 
                                    fontSize: '0.9rem', 
                                    fontWeight: '500',
                                    marginBottom: '5px',
                                    fontFamily: "'Roboto', sans-serif"
                                }}>
                                    Weight (Kg):
                                </label>
                                <input
                                    type="text"
                                    value={formData.weight}
                                    onChange={(e) => handleInputChange('weight', e.target.value)}
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
                            
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ 
                                    display: 'block', 
                                    color: '#212121', 
                                    fontSize: '0.9rem', 
                                    fontWeight: '500',
                                    marginBottom: '5px',
                                    fontFamily: "'Roboto', sans-serif"
                                }}>
                                    Pulse (/min):
                                </label>
                                <input
                                    type="text"
                                    value={formData.pulse}
                                    onChange={(e) => handleInputChange('pulse', e.target.value)}
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
                            
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ 
                                    display: 'block', 
                                    color: '#212121', 
                                    fontSize: '0.9rem', 
                                    fontWeight: '500',
                                    marginBottom: '5px',
                                    fontFamily: "'Roboto', sans-serif"
                                }}>
                                    BP:
                                </label>
                                <input
                                    type="text"
                                    value={formData.bp}
                                    onChange={(e) => handleInputChange('bp', e.target.value)}
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

                        {/* Second Column */}
                        <div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ 
                                    display: 'block', 
                                    color: '#212121', 
                                    fontSize: '0.9rem', 
                                    fontWeight: '500',
                                    marginBottom: '5px',
                                    fontFamily: "'Roboto', sans-serif"
                                }}>
                                    Temperature:
                                </label>
                                <input
                                    type="text"
                                    value={formData.temperature}
                                    onChange={(e) => handleInputChange('temperature', e.target.value)}
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
                            
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ 
                                    display: 'block', 
                                    color: '#212121', 
                                    fontSize: '0.9rem', 
                                    fontWeight: '500',
                                    marginBottom: '5px',
                                    fontFamily: "'Roboto', sans-serif"
                                }}>
                                    Contact:
                                </label>
                                <input
                                    type="text"
                                    value={formData.contact}
                                    onChange={(e) => handleInputChange('contact', e.target.value)}
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
                            
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ 
                                    display: 'block', 
                                    color: '#212121', 
                                    fontSize: '0.9rem', 
                                    fontWeight: '500',
                                    marginBottom: '5px',
                                    fontFamily: "'Roboto', sans-serif"
                                }}>
                                    Email:
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
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

                    {/* Checkboxes */}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(3, 1fr)', 
                        gap: '15px',
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

                    {/* Full-width fields */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {[
                            { key: 'allergy', label: 'Allergy:' },
                            { key: 'medicalHistory', label: 'Medical History:' },
                            { key: 'surgicalHistory', label: 'Surgical History:' },
                            { key: 'visitComments', label: 'Visit Comments:' },
                            { key: 'medicines', label: 'Medicines:' },
                            { key: 'detailedHistory', label: 'Detailed History/Additional Comments:' },
                            { key: 'examinationFindings', label: 'Important/Examination Findings:' },
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
                                <input
                                    type="text"
                                    value={formData[key as keyof typeof formData] as string}
                                    onChange={(e) => handleInputChange(key, e.target.value)}
                                    placeholder={formData[key as keyof typeof formData] ? '' : '-'}
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
                        ))}
                    </div>
                </div>

                {/* Current Visit Details */}
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
                        Current Visit Details
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ 
                                display: 'block', 
                                color: '#212121', 
                                fontSize: '0.9rem', 
                                fontWeight: '600',
                                marginBottom: '5px',
                                fontFamily: "'Roboto', sans-serif"
                            }}>
                                Complaints:
                            </label>
                            <input
                                type="text"
                                value={formData.complaints}
                                onChange={(e) => handleInputChange('complaints', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem',
                                    fontFamily: "'Roboto', sans-serif",
                                    backgroundColor: '#fff',
                                    color: '#1E88E5',
                                    fontWeight: '600'
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
                                Provisional Diagnosis:
                            </label>
                            <input
                                type="text"
                                value={formData.provisionalDiagnosis}
                                onChange={(e) => handleInputChange('provisionalDiagnosis', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem',
                                    fontFamily: "'Roboto', sans-serif",
                                    backgroundColor: '#fff',
                                    color: '#1E88E5',
                                    fontWeight: '600'
                                }}
                            />
                        </div>
                        
                        <div>
                            <label style={{ 
                                display: 'block', 
                                color: '#212121', 
                                fontSize: '0.9rem', 
                                fontWeight: '500',
                                marginBottom: '5px',
                                fontFamily: "'Roboto', sans-serif"
                            }}>
                                Plan:
                            </label>
                            <input
                                type="text"
                                value={formData.plan}
                                onChange={(e) => handleInputChange('plan', e.target.value)}
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
                                fontWeight: '500',
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

                {/* Prescriptions */}
                <div style={{ marginBottom: '30px' }}>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '20px'
                    }}>
                        <h3 style={{ 
                            color: '#212121', 
                            fontSize: '1.2rem', 
                            fontWeight: '600',
                            fontFamily: "'Roboto', sans-serif",
                            borderBottom: '1px solid #e0e0e0',
                            paddingBottom: '10px',
                            margin: 0
                        }}>
                            Prescriptions:
                        </h3>
                        <button
                            onClick={addPrescription}
                            style={{
                                backgroundColor: '#1E88E5',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '4px',
                                fontSize: '0.9rem',
                                fontFamily: "'Roboto', sans-serif",
                                cursor: 'pointer'
                            }}
                        >
                            Add Prescription
                        </button>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {formData.prescriptions.map((prescription, index) => (
                            <div key={index} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px',
                                padding: '10px',
                                border: '1px solid #e0e0e0',
                                borderRadius: '4px',
                                backgroundColor: '#fafafa'
                            }}>
                                <input
                                    type="text"
                                    value={prescription.medicine}
                                    onChange={(e) => updatePrescription(index, 'medicine', e.target.value)}
                                    placeholder="Medicine name"
                                    style={{
                                        flex: 1,
                                        padding: '6px 10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '0.9rem',
                                        fontFamily: "'Roboto', sans-serif",
                                        backgroundColor: '#fff',
                                        color: '#1E88E5',
                                        fontWeight: '600'
                                    }}
                                />
                                <input
                                    type="text"
                                    value={prescription.dosage}
                                    onChange={(e) => updatePrescription(index, 'dosage', e.target.value)}
                                    placeholder="Dosage"
                                    style={{
                                        flex: 1,
                                        padding: '6px 10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '0.9rem',
                                        fontFamily: "'Roboto', sans-serif",
                                        backgroundColor: '#fff'
                                    }}
                                />
                                <input
                                    type="text"
                                    value={prescription.instructions}
                                    onChange={(e) => updatePrescription(index, 'instructions', e.target.value)}
                                    placeholder="Instructions"
                                    style={{
                                        flex: 1,
                                        padding: '6px 10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '0.9rem',
                                        fontFamily: "'Roboto', sans-serif",
                                        backgroundColor: '#fff'
                                    }}
                                />
                                <button
                                    onClick={() => removePrescription(index)}
                                    style={{
                                        backgroundColor: '#d32f2f',
                                        color: 'white',
                                        border: 'none',
                                        padding: '6px 12px',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem',
                                        fontFamily: "'Roboto', sans-serif",
                                        cursor: 'pointer'
                                    }}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Billing Details */}
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
                        gridTemplateColumns: 'repeat(3, 1fr)', 
                        gap: '20px'
                    }}>
                        <div>
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
                                Discount (Rs):
                            </label>
                            <input
                                type="text"
                                value={formData.discount}
                                onChange={(e) => handleInputChange('discount', e.target.value)}
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
                                Dues (Rs):
                            </label>
                            <input
                                type="text"
                                value={formData.dues}
                                onChange={(e) => handleInputChange('dues', e.target.value)}
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
                                Collected (Rs):
                            </label>
                            <input
                                type="text"
                                value={formData.collected}
                                onChange={(e) => handleInputChange('collected', e.target.value)}
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
                                Receipt Amount (Rs):
                            </label>
                            <input
                                type="text"
                                value={formData.receiptAmount}
                                onChange={(e) => handleInputChange('receiptAmount', e.target.value)}
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
                                Receipt No:
                            </label>
                            <input
                                type="text"
                                value={formData.receiptNo}
                                onChange={(e) => handleInputChange('receiptNo', e.target.value)}
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
                                Receipt Date:
                            </label>
                            <input
                                type="text"
                                value={formData.receiptDate}
                                onChange={(e) => handleInputChange('receiptDate', e.target.value)}
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
                                Follow Up Type:
                            </label>
                            <input
                                type="text"
                                value={formData.followUpType}
                                onChange={(e) => handleInputChange('followUpType', e.target.value)}
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
                                Follow Up:
                            </label>
                            <input
                                type="text"
                                value={formData.followUp}
                                onChange={(e) => handleInputChange('followUp', e.target.value)}
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
                                Follow-up Date:
                            </label>
                            <input
                                type="text"
                                value={formData.followUpDate}
                                onChange={(e) => handleInputChange('followUpDate', e.target.value)}
                                placeholder="-"
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
                            backgroundColor: '#1E88E5',
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
                    >
                        Save
                    </button>
                    <button
                        style={{
                            backgroundColor: '#6c757d',
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
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PatientFormTest;
