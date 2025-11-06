import React, { useState, useEffect } from 'react';
import { Close } from '@mui/icons-material';

interface VisitWiseData {
    patientName: string;
    receiptNo: string;
    provider: string;
    visitDate: string;
    status: string;
    adhoc: string;
    billed: string;
    discount: string;
    dues: string;
    collected: string;
    balance: string;
}

interface FYWiseData {
    financialYear: string;
    billed: string;
    discount: string;
    dues: string;
    collected: string;
    balance: string;
}

interface AccountsPopupProps {
    open: boolean;
    onClose: () => void;
    patientId?: string;
    patientName?: string;
}

const AccountsPopup: React.FC<AccountsPopupProps> = ({ open, onClose, patientId, patientName }) => {
    const [visitWiseData, setVisitWiseData] = useState<VisitWiseData[]>([]);
    const [fyWiseData, setFyWiseData] = useState<FYWiseData[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && patientId) {
            fetchAccountsData();
        }
    }, [open, patientId]);

    const fetchAccountsData = async () => {
        setLoading(true);
        try {
            // TODO: Replace with actual API endpoint
            // const response = await fetch(`/api/accounts?patientId=${patientId}`);
            // const data = await response.json();
            
            // Mock data structure matching the image
            // Replace this with actual API call
            const mockVisitWiseData: VisitWiseData[] = [
                {
                    patientName: patientName || 'Patient Name',
                    receiptNo: '',
                    provider: 'Dr. Tongaonkar',
                    visitDate: '07-Sep-2021 - 7:11 PM - M',
                    status: 'Complete',
                    adhoc: '',
                    billed: '400.00',
                    discount: '0.00',
                    dues: '400.00',
                    collected: '400.00',
                    balance: '0.00'
                },
                {
                    patientName: patientName || 'Patient Name',
                    receiptNo: '',
                    provider: 'Dr. Tongaonkar',
                    visitDate: '16-Jul-2021 - 6:46 PM - M',
                    status: 'Complete',
                    adhoc: '',
                    billed: '400.00',
                    discount: '0.00',
                    dues: '400.00',
                    collected: '400.00',
                    balance: '0.00'
                },
                {
                    patientName: patientName || 'Patient Name',
                    receiptNo: '',
                    provider: 'Dr. Tongaonkar',
                    visitDate: '01-Jul-2021 - 7:08 PM - M',
                    status: 'Complete',
                    adhoc: '',
                    billed: '400.00',
                    discount: '0.00',
                    dues: '400.00',
                    collected: '400.00',
                    balance: '0.00'
                },
                {
                    patientName: patientName || 'Patient Name',
                    receiptNo: '',
                    provider: 'Dr. Tongaonkar',
                    visitDate: '15-Mar-2021 - 6:20 PM - M',
                    status: 'Complete',
                    adhoc: '',
                    billed: '600.00',
                    discount: '0.00',
                    dues: '600.00',
                    collected: '600.00',
                    balance: '0.00'
                },
                {
                    patientName: patientName || 'Patient Name',
                    receiptNo: '',
                    provider: 'Dr. Tongaonkar',
                    visitDate: '02-Sep-2019 - 6:34 PM - M',
                    status: 'Complete',
                    adhoc: '',
                    billed: '350.00',
                    discount: '0.00',
                    dues: '350.00',
                    collected: '350.00',
                    balance: '0.00'
                }
            ];

            const mockFyWiseData: FYWiseData[] = [
                {
                    financialYear: '2022',
                    billed: '1200.00',
                    discount: '0.00',
                    dues: '1200.00',
                    collected: '1200.00',
                    balance: '0.00'
                },
                {
                    financialYear: '2021',
                    billed: '600.00',
                    discount: '0.00',
                    dues: '600.00',
                    collected: '600.00',
                    balance: '0.00'
                },
                {
                    financialYear: '2020',
                    billed: '350.00',
                    discount: '0.00',
                    dues: '350.00',
                    collected: '350.00',
                    balance: '0.00'
                }
            ];

            setVisitWiseData(mockVisitWiseData);
            setFyWiseData(mockFyWiseData);
        } catch (error) {
            console.error('Error fetching accounts data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotals = (data: VisitWiseData[]) => {
        return data.reduce((acc, row) => {
            acc.billed += parseFloat(row.billed) || 0;
            acc.discount += parseFloat(row.discount) || 0;
            acc.dues += parseFloat(row.dues) || 0;
            acc.collected += parseFloat(row.collected) || 0;
            acc.balance += parseFloat(row.balance) || 0;
            return acc;
        }, { billed: 0, discount: 0, dues: 0, collected: 0, balance: 0 });
    };

    const totals = calculateTotals(visitWiseData);

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
                zIndex: 100000,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    maxWidth: '95%',
                    width: '1200px',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    background: 'white',
                    padding: '12px 20px 8px 20px',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontFamily: "'Roboto', sans-serif"
                }}>
                    <div style={{ 
                        color: '#000000', 
                        fontWeight: 700, 
                        fontSize: '18px', 
                        fontFamily: "'Roboto', sans-serif" 
                    }}>
                        Accounts
                    </div>
                    <button
                        type="button"
                        aria-label="Close"
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
                            color: '#fff',
                            fontSize: '18px',
                            width: '36px',
                            height: '36px',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgb(21, 101, 192)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgb(25, 118, 210)'; }}
                    >
                        <Close fontSize="small" />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '20px', flex: 1 }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            Loading...
                        </div>
                    ) : (
                        <>
                            {/* Fees Collection Table */}
                            <div style={{ marginBottom: '30px' }}>
                                <h3 style={{
                                    marginBottom: '15px',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    color: '#333',
                                    fontFamily: "'Roboto', sans-serif"
                                }}>
                                    Fees Collection
                                </h3>
                                <div style={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold', fontSize: '11px' }}>
                                                <th style={{ padding: '6px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#1976d2', color: 'white', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Patient Name</th>
                                                <th style={{ padding: '6px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#1976d2', color: 'white', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Receipt No</th>
                                                <th style={{ padding: '6px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#1976d2', color: 'white', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Provider</th>
                                                <th style={{ padding: '6px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#1976d2', color: 'white', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Visit Date</th>
                                                <th style={{ padding: '6px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#1976d2', color: 'white', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Status</th>
                                                <th style={{ padding: '6px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#1976d2', color: 'white', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Adhoc (Y?)</th>
                                                <th style={{ padding: '6px', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#1976d2', color: 'white', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Billed</th>
                                                <th style={{ padding: '6px', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#1976d2', color: 'white', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Discount</th>
                                                <th style={{ padding: '6px', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#1976d2', color: 'white', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Dues</th>
                                                <th style={{ padding: '6px', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#1976d2', color: 'white', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Collected</th>
                                                <th style={{ padding: '6px', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#1976d2', color: 'white' }}>Balance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {visitWiseData.map((row, index) => (
                                                <tr
                                                    key={index}
                                                    style={{
                                                        borderBottom: '1px solid #e0e0e0',
                                                        backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white'
                                                    }}
                                                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#f5f5f5'; }}
                                                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = index % 2 === 0 ? '#f8f9fa' : 'white'; }}
                                                >
                                                    <td style={{ padding: '6px', color: '#333', fontSize: '12px', borderRight: '1px solid #e0e0e0' }}>{row.patientName}</td>
                                                    <td style={{ padding: '6px', color: '#333', fontSize: '12px', borderRight: '1px solid #e0e0e0' }}>{row.receiptNo}</td>
                                                    <td style={{ padding: '6px', color: '#333', fontSize: '12px', borderRight: '1px solid #e0e0e0' }}>{row.provider}</td>
                                                    <td style={{ padding: '6px', color: '#333', fontSize: '12px', borderRight: '1px solid #e0e0e0' }}>{row.visitDate}</td>
                                                    <td style={{ padding: '6px', color: '#333', fontSize: '12px', borderRight: '1px solid #e0e0e0' }}>{row.status}</td>
                                                    <td style={{ padding: '6px', color: '#333', fontSize: '12px', borderRight: '1px solid #e0e0e0' }}>{row.adhoc}</td>
                                                    <td style={{ padding: '6px', textAlign: 'right', color: '#333', fontSize: '12px', borderRight: '1px solid #e0e0e0' }}>{row.billed}</td>
                                                    <td style={{ padding: '6px', textAlign: 'right', color: '#333', fontSize: '12px', borderRight: '1px solid #e0e0e0' }}>{row.discount}</td>
                                                    <td style={{ padding: '6px', textAlign: 'right', color: '#333', fontSize: '12px', borderRight: '1px solid #e0e0e0' }}>{row.dues}</td>
                                                    <td style={{ padding: '6px', textAlign: 'right', color: '#333', fontSize: '12px', borderRight: '1px solid #e0e0e0' }}>{row.collected}</td>
                                                    <td style={{ padding: '6px', textAlign: 'right', color: '#333', fontSize: '12px' }}>{row.balance}</td>
                                                </tr>
                                            ))}
                                            {/* Total Row */}
                                            <tr style={{
                                                backgroundColor: '#e8e8e8',
                                                fontWeight: 'bold',
                                                borderTop: '2px solid #ccc'
                                            }}>
                                                <td colSpan={6} style={{ padding: '6px', color: '#333', fontSize: '12px', borderRight: '1px solid #e0e0e0' }}>Total</td>
                                                <td style={{ padding: '6px', textAlign: 'right', color: '#333', fontSize: '12px', borderRight: '1px solid #e0e0e0' }}>
                                                    {totals.billed.toFixed(2)}
                                                </td>
                                                <td style={{ padding: '6px', textAlign: 'right', color: '#333', fontSize: '12px', borderRight: '1px solid #e0e0e0' }}>
                                                    {totals.discount.toFixed(2)}
                                                </td>
                                                <td style={{ padding: '6px', textAlign: 'right', color: '#333', fontSize: '12px', borderRight: '1px solid #e0e0e0' }}>
                                                    {totals.dues.toFixed(2)}
                                                </td>
                                                <td style={{ padding: '6px', textAlign: 'right', color: '#333', fontSize: '12px', borderRight: '1px solid #e0e0e0' }}>
                                                    {totals.collected.toFixed(2)}
                                                </td>
                                                <td style={{ padding: '6px', textAlign: 'right', color: '#333', fontSize: '12px' }}>
                                                    {totals.balance.toFixed(2)}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Fees Collection (FY wise) Table */}
                            <div>
                                <h3 style={{
                                    marginBottom: '15px',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    color: '#333',
                                    fontFamily: "'Roboto', sans-serif"
                                }}>
                                    Fees Collection (FY wise)
                                </h3>
                                <div style={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold', fontSize: '11px' }}>
                                                <th style={{ padding: '6px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#1976d2', color: 'white', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Financial Year</th>
                                                <th style={{ padding: '6px', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#1976d2', color: 'white', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Billed</th>
                                                <th style={{ padding: '6px', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#1976d2', color: 'white', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Discount</th>
                                                <th style={{ padding: '6px', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#1976d2', color: 'white', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Dues</th>
                                                <th style={{ padding: '6px', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#1976d2', color: 'white', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Collected</th>
                                                <th style={{ padding: '6px', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#1976d2', color: 'white' }}>Balance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {fyWiseData.map((row, index) => (
                                                <tr
                                                    key={index}
                                                    style={{
                                                        borderBottom: '1px solid #e0e0e0',
                                                        backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white'
                                                    }}
                                                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#f5f5f5'; }}
                                                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = index % 2 === 0 ? '#f8f9fa' : 'white'; }}
                                                >
                                                    <td style={{ padding: '6px', color: '#333', fontSize: '12px', borderRight: '1px solid #e0e0e0' }}>{row.financialYear}</td>
                                                    <td style={{ padding: '6px', textAlign: 'right', color: '#333', fontSize: '12px', borderRight: '1px solid #e0e0e0' }}>{row.billed}</td>
                                                    <td style={{ padding: '6px', textAlign: 'right', color: '#333', fontSize: '12px', borderRight: '1px solid #e0e0e0' }}>{row.discount}</td>
                                                    <td style={{ padding: '6px', textAlign: 'right', color: '#333', fontSize: '12px', borderRight: '1px solid #e0e0e0' }}>{row.dues}</td>
                                                    <td style={{ padding: '6px', textAlign: 'right', color: '#333', fontSize: '12px', borderRight: '1px solid #e0e0e0' }}>{row.collected}</td>
                                                    <td style={{ padding: '6px', textAlign: 'right', color: '#333', fontSize: '12px' }}>{row.balance}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
};

export default AccountsPopup;

