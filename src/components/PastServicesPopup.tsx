import React, { useState } from 'react';
import { Close } from '@mui/icons-material';
import { SessionInfo } from '../services/sessionService';

interface PastServiceItem {
    sr: number;
    group: string;
    subGroup: string;
    details: string;
    selected: boolean;
    totalFees: number;
}

interface PatientData {
    patientName?: string;
    gender?: string;
    age?: number;
    patientId?: string;
}

interface PastServicesPopupProps {
    open: boolean;
    onClose: () => void;
    date: string | null;
    patientData?: PatientData | null;
    sessionData?: SessionInfo | null;
}

const PastServicesPopup: React.FC<PastServicesPopupProps> = ({ open, onClose, date, patientData, sessionData }) => {
    const [services, setServices] = useState<PastServiceItem[]>([
        { sr: 1, group: 'Group 1', subGroup: 'Sub-group A', details: 'Service Details 1', selected: false, totalFees: 500 },
        { sr: 2, group: 'Group 2', subGroup: 'Sub-group B', details: 'Service Details 2', selected: false, totalFees: 750 },
        { sr: 3, group: 'Group 1', subGroup: 'Sub-group C', details: 'Service Details 3', selected: false, totalFees: 300 },
    ]);

    const handleSelectChange = (index: number) => {
        const updatedServices = [...services];
        updatedServices[index].selected = !updatedServices[index].selected;
        setServices(updatedServices);
    };

    if (!open) return null;

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
                zIndex: 10001,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    maxWidth: '1200px',
                    width: '95%',
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
                    padding: '12px 20px 8px 20px',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000
                }}>
                    {/* Top row with close button */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        marginBottom: '8px'
                    }}>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'rgb(25, 118, 210)',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '2px',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#666',
                                fontSize: '18px',
                                width: '36px',
                                height: '36px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgb(25, 118, 210)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgb(25, 118, 210)';
                            }}
                        >
                            <Close style={{ color: '#fff' }} />
                        </button>
                    </div>
                    
                    {/* Patient and Doctor info line */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{
                            color: '#4caf50',
                            fontSize: '16px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span>{patientData?.patientName || 'Patient'}</span>
                            <span>/</span>
                            <span>{patientData?.gender || 'N/A'}</span>
                            <span>/</span>
                            <span>{patientData?.age || 0} Y</span>
                        </div>
                        <div style={{
                            color: '#666',
                            fontSize: '14px',
                            textAlign: 'right'
                        }}>
                            <div>Dr. {sessionData?.doctorName || 'Doctor'}</div>
                        </div>
                    </div>
                </div>

                {/* Popup Content */}
                <div style={{
                    display: 'flex',
                    flex: 1,
                    minHeight: '500px',
                    overflow: 'hidden'
                }}>
                    {/* Left Side - Past Services Box */}
                    <div style={{
                        width: '300px',
                        padding: '20px 20px 20px 20px',
                        overflowY: 'auto',
                        backgroundColor: 'white',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ marginTop: '0' }}>
                            <div style={{ 
                                backgroundColor: '#1976d2', 
                                color: 'white', 
                                padding: '12px 15px', 
                                fontWeight: 'bold',
                                fontSize: '14px'
                            }}>
                                Past Services
                            </div>
                            <div style={{ padding: '0' }}>
                                <div style={{
                                    padding: '10px 15px',
                                    borderBottom: '1px solid #e0e0e0',
                                    backgroundColor: 'white',
                                    fontSize: '13px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    minHeight: '40px'
                                }}>
                                    <div style={{ fontWeight: '500', color: '#333' }}>
                                        {date || '03-May-19'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Table */}
                    <div style={{
                        flex: 1,
                        padding: '20px',
                        overflowY: 'auto',
                        backgroundColor: 'white'
                    }}>
                        <div style={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse'
                            }}>
                                <thead>
                                    <tr style={{
                                        backgroundColor: '#1976d2',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '11px'
                                    }}>
                                        <th style={{
                                            padding: '6px',
                                            textAlign: 'left',
                                            fontWeight: 'bold',
                                            backgroundColor: '#1976d2',
                                            color: 'white',
                                            borderRight: '1px solid rgba(255,255,255,0.2)'
                                        }}>
                                            Sr.
                                        </th>
                                        <th style={{
                                            padding: '6px',
                                            textAlign: 'left',
                                            fontWeight: 'bold',
                                            backgroundColor: '#1976d2',
                                            color: 'white',
                                            borderRight: '1px solid rgba(255,255,255,0.2)'
                                        }}>
                                            Group
                                        </th>
                                        <th style={{
                                            padding: '6px',
                                            textAlign: 'left',
                                            fontWeight: 'bold',
                                            backgroundColor: '#1976d2',
                                            color: 'white',
                                            borderRight: '1px solid rgba(255,255,255,0.2)'
                                        }}>
                                            Sub-groups
                                        </th>
                                        <th style={{
                                            padding: '6px',
                                            textAlign: 'left',
                                            fontWeight: 'bold',
                                            backgroundColor: '#1976d2',
                                            color: 'white',
                                            borderRight: '1px solid rgba(255,255,255,0.2)'
                                        }}>
                                            Details
                                        </th>
                                        <th style={{
                                            padding: '6px',
                                            textAlign: 'center',
                                            fontWeight: 'bold',
                                            backgroundColor: '#1976d2',
                                            color: 'white',
                                            borderRight: '1px solid rgba(255,255,255,0.2)'
                                        }}>
                                            Select
                                        </th>
                                        <th style={{
                                            padding: '6px',
                                            textAlign: 'right',
                                            fontWeight: 'bold',
                                            backgroundColor: '#1976d2',
                                            color: 'white'
                                        }}>
                                            Total Fees
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {services.map((service, index) => (
                                        <tr key={index} style={{
                                            borderBottom: '1px solid #e0e0e0',
                                            backgroundColor: service.selected 
                                                ? '#e3f2fd' 
                                                : (index % 2 === 0 ? '#f8f9fa' : 'white')
                                        }}>
                                            <td style={{
                                                padding: '6px',
                                                color: '#333',
                                                fontSize: '12px',
                                                borderRight: '1px solid #e0e0e0'
                                            }}>
                                                {service.sr}
                                            </td>
                                            <td style={{
                                                padding: '6px',
                                                color: '#333',
                                                fontSize: '12px',
                                                borderRight: '1px solid #e0e0e0'
                                            }}>
                                                {service.group}
                                            </td>
                                            <td style={{
                                                padding: '6px',
                                                color: '#333',
                                                fontSize: '12px',
                                                borderRight: '1px solid #e0e0e0'
                                            }}>
                                                {service.subGroup}
                                            </td>
                                            <td style={{
                                                padding: '6px',
                                                color: '#333',
                                                fontSize: '12px',
                                                borderRight: '1px solid #e0e0e0'
                                            }}>
                                                {service.details}
                                            </td>
                                            <td style={{
                                                padding: '6px',
                                                textAlign: 'center',
                                                borderRight: '1px solid #e0e0e0'
                                            }}>
                                                <input
                                                    type="checkbox"
                                                    checked={service.selected}
                                                    onChange={() => handleSelectChange(index)}
                                                    style={{
                                                        cursor: 'pointer',
                                                        width: '18px',
                                                        height: '18px'
                                                    }}
                                                />
                                            </td>
                                            <td style={{
                                                padding: '6px',
                                                textAlign: 'right',
                                                color: '#333',
                                                fontWeight: '500',
                                                fontSize: '12px'
                                            }}>
                                                ₹{service.totalFees.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Fields Section - 12 fields in 4 rows (3 fields per row) */}
                        <div style={{
                            marginTop: '20px',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '15px'
                        }}>
                            {/* Row 1 */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <label style={{
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    color: '#333',
                                    marginBottom: '5px'
                                }}>
                                    Billed (Rs)
                                </label>
                                <input
                                    type="text"
                                    style={{
                                        padding: '8px 10px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '13px'
                                    }}
                                />
                            </div>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <label style={{
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    color: '#333',
                                    marginBottom: '5px'
                                }}>
                                    Discount (Rs)
                                </label>
                                <input
                                    type="text"
                                    style={{
                                        padding: '8px 10px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '13px'
                                    }}
                                />
                            </div>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <label style={{
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    color: '#333',
                                    marginBottom: '5px'
                                }}>
                                    A/C Balance (Rs)
                                </label>
                                <input
                                    type="text"
                                    style={{
                                        padding: '8px 10px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '13px'
                                    }}
                                />
                            </div>
                            
                            {/* Row 2 */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <label style={{
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    color: '#333',
                                    marginBottom: '5px'
                                }}>
                                    Dues (Rs)
                                </label>
                                <input
                                    type="text"
                                    style={{
                                        padding: '8px 10px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '13px'
                                    }}
                                />
                            </div>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <label style={{
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    color: '#333',
                                    marginBottom: '5px'
                                }}>
                                    Collected
                                </label>
                                <input
                                    type="text"
                                    style={{
                                        padding: '8px 10px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '13px'
                                    }}
                                />
                            </div>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <label style={{
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    color: '#333',
                                    marginBottom: '5px'
                                }}>
                                    Reason
                                </label>
                                <input
                                    type="text"
                                    style={{
                                        padding: '8px 10px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '13px'
                                    }}
                                />
                            </div>
                            
                            {/* Row 3 */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <label style={{
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    color: '#333',
                                    marginBottom: '5px'
                                }}>
                                    Payment By
                                </label>
                                <input
                                    type="text"
                                    style={{
                                        padding: '8px 10px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '13px'
                                    }}
                                />
                            </div>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <label style={{
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    color: '#333',
                                    marginBottom: '5px'
                                }}>
                                    Payment Remark
                                </label>
                                <input
                                    type="text"
                                    style={{
                                        padding: '8px 10px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '13px'
                                    }}
                                />
                            </div>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <label style={{
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    color: '#333',
                                    marginBottom: '5px'
                                }}>
                                    Referred by
                                </label>
                                <input
                                    type="text"
                                    style={{
                                        padding: '8px 10px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '13px'
                                    }}
                                />
                            </div>
                            
                            {/* Row 4 */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <label style={{
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    color: '#333',
                                    marginBottom: '5px'
                                }}>
                                    Receipt no
                                </label>
                                <input
                                    type="text"
                                    style={{
                                        padding: '8px 10px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '13px'
                                    }}
                                />
                            </div>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <label style={{
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    color: '#333',
                                    marginBottom: '5px'
                                }}>
                                    Receipt Date
                                </label>
                                <input
                                    type="text"
                                    style={{
                                        padding: '8px 10px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '13px'
                                    }}
                                />
                            </div>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <label style={{
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    color: '#333',
                                    marginBottom: '5px'
                                }}>
                                    Receipt Amount
                                </label>
                                <input
                                    type="text"
                                    style={{
                                        padding: '8px 10px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '13px'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PastServicesPopup;

