import React, { useState, useEffect } from 'react';
import { Close } from '@mui/icons-material';
import { patientService } from '../services/patientService';
import { sessionService } from '../services/sessionService';

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
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log('=== AccountsPopup useEffect ===');
        console.log('open:', open);
        console.log('patientId prop:', patientId);
        console.log('patientId type:', typeof patientId);
        console.log('patientId truthy:', !!patientId);
        console.log('patientId trimmed:', patientId ? String(patientId).trim() : 'N/A');
        
        // Check if patientId is valid (not null, undefined, or empty string)
        const isValidPatientId = patientId && String(patientId).trim() !== '';
        
        if (open && isValidPatientId) {
            console.log('✅ Conditions met, calling fetchAccountsData');
            fetchAccountsData();
        } else {
            console.log('❌ Skipping fetchAccountsData - open:', open, 'isValidPatientId:', isValidPatientId, 'patientId:', patientId);
        }
    }, [open, patientId]);

    const fetchAccountsData = async () => {
        console.log('=== fetchAccountsData START ===');
        console.log('patientId received:', patientId);
        console.log('patientId type:', typeof patientId);
        console.log('patientId value:', JSON.stringify(patientId));
        
        // Validate patientId - must be non-empty string
        const patientIdStr = patientId ? String(patientId).trim() : '';
        if (!patientIdStr) {
            console.error('❌ No valid patientId provided, aborting fetch. patientId:', patientId);
            setError('Patient ID is required');
            setLoading(false);
            return;
        }
        
        console.log('✅ Valid patientId:', patientIdStr);
        
        setLoading(true);
        setError(null);
        try {
            // Get session data for clinicId and doctorId
            const sessionResult = await sessionService.getSessionInfo();
            const clinicId = sessionResult?.data?.clinicId;
            const doctorId = sessionResult?.data?.doctorId;

            console.log('Session data:', {
                clinicId,
                doctorId,
                fullSession: sessionResult?.data
            });

            if (!clinicId) {
                throw new Error('Clinic ID not found in session');
            }

            // For accounts/payment history, we want ALL records for the patient, not filtered by doctor
            // So we pass undefined for doctorId to get all doctors' data for this patient
            const apiParams = {
                patientId: patientIdStr, // Use validated string
                doctorId: undefined, // Don't filter by doctor - show all payment history
                clinicId
            };

            console.log('=== API CALL PARAMETERS ===');
            console.log('Consolidated Family Fees params:', apiParams);
            console.log('Fees Details params:', apiParams);
            console.log('Note: doctorId is undefined to show ALL payment history for patient');

            // Fetch consolidated family fees (for FY-wise table)
            const consolidatedFeesPromise = patientService.getConsolidatedFamilyFees(apiParams);

            // Fetch fees details (for visit-wise table)
            const feesDetailsPromise = patientService.getFeesDetails(apiParams);

            const [consolidatedFeesResp, feesDetailsResp] = await Promise.all([
                consolidatedFeesPromise,
                feesDetailsPromise
            ]);

            // Validate responses
            if (!consolidatedFeesResp) {
                console.warn('Consolidated family fees response is null/undefined');
            }
            if (!feesDetailsResp) {
                console.warn('Fees details response is null/undefined');
            }

            console.log('=== Consolidated family fees response (full):', JSON.stringify(consolidatedFeesResp, null, 2));
            console.log('=== Fees details response (full):', JSON.stringify(feesDetailsResp, null, 2));
            console.log('=== Consolidated fees type:', typeof consolidatedFeesResp, consolidatedFeesResp instanceof Array ? '(Array)' : '(Object)');
            console.log('=== Fees details type:', typeof feesDetailsResp, feesDetailsResp instanceof Array ? '(Array)' : '(Object)');
            console.log('=== Consolidated fees keys:', consolidatedFeesResp ? Object.keys(consolidatedFeesResp) : 'null/undefined');
            console.log('=== Fees details keys:', feesDetailsResp ? Object.keys(feesDetailsResp) : 'null/undefined');

            // Map fees details to visit-wise data (Fees Collection table)
            // Fees details response has rows array with visit data
            const visitWiseArray: any[] = Array.isArray(feesDetailsResp?.rows) 
                ? feesDetailsResp.rows 
                : [];

            console.log('Found visit-wise data from feesDetailsResp.rows:', visitWiseArray.length, 'rows');

            const mappedVisitWise: VisitWiseData[] = visitWiseArray.map((visit: any, idx: number) => {
                console.log(`Visit ${idx}:`, visit);
                const toStr = (v: any) => (v === undefined || v === null ? '' : String(v));
                const toNum = (v: any) => {
                    const num = parseFloat(v);
                    return isNaN(num) ? '0.00' : num.toFixed(2);
                };

                // Format visit date - use LAST_VISIT_DATE if available, otherwise format Visit_Date
                let formattedDate = '';
                if (visit?.LAST_VISIT_DATE) {
                    formattedDate = visit.LAST_VISIT_DATE;
                } else if (visit?.Visit_Date) {
                    // Format ISO date string to readable format
                    try {
                        const date = new Date(visit.Visit_Date);
                        formattedDate = date.toLocaleString('en-GB', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        });
                    } catch (e) {
                        formattedDate = String(visit.Visit_Date);
                    }
                }

                return {
                    patientName: toStr(visit?.Full_Name ?? visit?.patientName ?? visit?.patient_name ?? patientName ?? ''),
                    receiptNo: toStr(visit?.Receipt_Number ?? visit?.receiptNo ?? visit?.receipt_no ?? visit?.receipt_number ?? ''),
                    provider: toStr(visit?.DoctorName ?? visit?.provider ?? visit?.doctorName ?? visit?.doctor_name ?? ''),
                    visitDate: formattedDate || toStr(visit?.Visit_Date ?? visit?.visitDate ?? visit?.visit_date ?? ''),
                    status: toStr(visit?.Status_Description ?? visit?.status ?? visit?.status_description ?? ''),
                    adhoc: toStr(visit?.ISadhoc ?? visit?.adhoc ?? visit?.is_adhoc ?? ''),
                    billed: toNum(visit?.Bill ?? visit?.billed ?? visit?.billed_amount ?? visit?.fees_to_collect ?? 0),
                    discount: toNum(visit?.Discount ?? visit?.discount ?? visit?.discount_amount ?? 0),
                    dues: toNum(visit?.Dues ?? visit?.dues ?? visit?.dues_amount ?? 0),
                    collected: toNum(visit?.Collected ?? visit?.collected ?? visit?.fees_collected ?? visit?.collected_amount ?? 0),
                    balance: toNum(visit?.Balance ?? visit?.balance ?? visit?.balance_amount ?? 0)
                };
            });

            console.log('Mapped visit-wise data:', mappedVisitWise.length, 'rows');
            setVisitWiseData(mappedVisitWise);

            // Map consolidated family fees to FY-wise data (Fees Collection FY wise table)
            // Consolidated family fees response has rows array with financial year data
            const fyWiseArray: any[] = Array.isArray(consolidatedFeesResp?.rows) 
                ? consolidatedFeesResp.rows 
                : [];

            console.log('Found FY-wise data from consolidatedFeesResp.rows:', fyWiseArray.length, 'rows');

            const mappedFyWise: FYWiseData[] = fyWiseArray.map((fy: any, idx: number) => {
                console.log(`FY ${idx}:`, fy);
                const toNum = (v: any) => {
                    const num = parseFloat(v);
                    return isNaN(num) ? '0.00' : num.toFixed(2);
                };

                return {
                    financialYear: String(fy?.Financial_Year ?? fy?.financialYear ?? fy?.financial_year ?? fy?.fy ?? fy?.year ?? ''),
                    billed: toNum(fy?.Billed ?? fy?.billed ?? fy?.billed_amount ?? 0),
                    discount: toNum(fy?.Discount ?? fy?.discount ?? fy?.discount_amount ?? 0),
                    dues: toNum(fy?.Dues ?? fy?.dues ?? fy?.dues_amount ?? 0),
                    collected: toNum(fy?.Collected ?? fy?.collected ?? fy?.fees_collected ?? fy?.collected_amount ?? 0),
                    balance: toNum(fy?.Balance ?? fy?.balance ?? fy?.balance_amount ?? 0)
                };
            });

            console.log('Mapped FY-wise data:', mappedFyWise.length, 'rows');
            setFyWiseData(mappedFyWise);
        } catch (error: any) {
            console.error('Error fetching accounts data:', error);
            setError(error?.message || 'Failed to load accounts data');
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
                    ) : error ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#d32f2f' }}>
                            {error}
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
                                            {visitWiseData.length === 0 ? (
                                                <tr>
                                                    <td colSpan={11} style={{ padding: '20px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
                                                        No visit data available
                                                    </td>
                                                </tr>
                                            ) : (
                                                <>
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
                                                </>
                                            )}
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
                                            {fyWiseData.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
                                                        No financial year data available
                                                    </td>
                                                </tr>
                                            ) : (
                                                fyWiseData.map((row, index) => (
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
                                                ))
                                            )}
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

