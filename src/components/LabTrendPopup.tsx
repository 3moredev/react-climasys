import React, { useState, useEffect } from 'react';
import { Close } from '@mui/icons-material';

export interface LabTrendItem {
    visitDate: string;
    patientVisitNo: number;
    labTestDescription: string;
    parameterName: string;
    parameterValue: string;
    doctorName?: string;
    labName?: string;
    reportDate?: string;
    comment?: string;
}

interface LabTrendPopupProps {
    open: boolean;
    onClose: () => void;
    patientId: string;
    patientName: string;
    gender: string;
    age: number | string;
    doctorId?: string;
    clinicId?: string;
    visitDate?: string;
    shiftId?: number;
    patientVisitNo?: number;
}

export default function LabTrendPopup({
    open,
    onClose,
    patientId,
    patientName,
    gender,
    age,
    doctorId,
    clinicId,
    visitDate,
    shiftId,
    patientVisitNo,
}: LabTrendPopupProps) {
    const [labTrends, setLabTrends] = useState<LabTrendItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && patientId && doctorId && clinicId && visitDate && shiftId && patientVisitNo) {
            fetchLabTrends();
        } else if (open) {
            setLabTrends([]);
            setError('Missing required parameters to fetch lab trends');
        }
    }, [open, patientId, doctorId, clinicId, visitDate, shiftId, patientVisitNo]);

    const fetchLabTrends = async () => {
        setLoading(true);
        setError(null);
        try {
            const queryParams = new URLSearchParams({
                doctorId: doctorId || '',
                clinicId: clinicId || '',
                visitDate: visitDate || '',
                shiftId: (shiftId || 0).toString(),
                patientVisitNo: (patientVisitNo || 0).toString(),
            });

            const response = await fetch(`/api/trends/lab/patients/${encodeURIComponent(patientId)}/results?${queryParams.toString()}`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch lab trends: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success && Array.isArray(data.data)) {
                const trends: LabTrendItem[] = data.data.map((item: any) => ({
                    visitDate: item.visitDate || '',
                    patientVisitNo: item.patientVisitNo || 0,
                    labTestDescription: item.labTestDescription || '',
                    parameterName: item.parameterName || '',
                    parameterValue: item.parameterValue || '',
                    doctorName: item.doctorName,
                    labName: item.labName,
                    reportDate: item.reportDate,
                    comment: item.comment,
                }));
                setLabTrends(trends);
            } else {
                setLabTrends([]);
            }
        } catch (err: any) {
            console.error('Error fetching lab trends:', err);
            setError(err.message || 'Failed to fetch lab trends');
            setLabTrends([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            const day = date.getDate().toString().padStart(2, '0');
            const month = date.toLocaleDateString('en-US', { month: 'short' });
            const year = date.getFullYear();
            return `${day} ${month} ${year}`;
        } catch {
            return dateStr;
        }
    };

    if (!open) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100000
            }}
            onClick={onClose}
        >
            <div
                style={{
                    width: '95%',
                    maxWidth: 1200,
                    maxHeight: '90vh',
                    overflow: 'hidden',
                    background: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    fontFamily: "'Roboto', sans-serif",
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column'
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
                    alignItems: 'center'
                }}>
                    <div style={{ color: '#000000', fontWeight: 700, fontSize: '18px', fontFamily: "'Roboto', sans-serif" }}>Lab Trend</div>
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
                <div style={{ 
                    padding: '20px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 12,
                    overflow: 'auto',
                    flex: 1
                }}>
                    {loading && (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                            Loading lab trends...
                        </div>
                    )}

                    {error && (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '20px', 
                            color: '#d32f2f',
                            backgroundColor: '#ffebee',
                            borderRadius: '4px'
                        }}>
                            {error}
                        </div>
                    )}

                    {!loading && !error && labTrends.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                            No lab trend data available
                        </div>
                    )}

                    {!loading && !error && labTrends.length > 0 && (
                        <div style={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                                maxHeight: labTrends.length > 5 ? '280px' : 'none',
                                overflowY: labTrends.length > 5 ? 'auto' : 'visible',
                                overflowX: 'auto'
                            }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                                        <tr style={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold', fontSize: '11px' }}>
                                            <th style={{ padding: '6px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#1976d2', color: 'white', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Visit Date</th>
                                            <th style={{ padding: '6px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#1976d2', color: 'white', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Patient Visit No</th>
                                            <th style={{ padding: '6px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#1976d2', color: 'white', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Lab Suggest</th>
                                            <th style={{ padding: '6px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#1976d2', color: 'white', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Parameter Name</th>
                                            <th style={{ padding: '6px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#1976d2', color: 'white' }}>Parameter Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {labTrends.map((item, idx) => (
                                            <tr
                                                key={idx}
                                                style={{
                                                    borderBottom: '1px solid #e0e0e0',
                                                    backgroundColor: idx % 2 === 0 ? '#f8f9fa' : 'white'
                                                }}
                                                onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#f5f5f5'; }}
                                                onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = idx % 2 === 0 ? '#f8f9fa' : 'white'; }}
                                            >
                                                <td style={{ padding: '6px', color: '#333', fontSize: '12px', borderRight: '1px solid #e0e0e0' }}>
                                                    {formatDate(item.visitDate)}
                                                </td>
                                                <td style={{ padding: '6px', color: '#333', fontSize: '12px', borderRight: '1px solid #e0e0e0' }}>
                                                    {item.patientVisitNo}
                                                </td>
                                                <td style={{ padding: '6px', color: '#333', fontSize: '12px', borderRight: '1px solid #e0e0e0' }}>
                                                    {item.labTestDescription || '-'}
                                                </td>
                                                <td style={{ padding: '6px', color: '#333', fontSize: '12px', borderRight: '1px solid #e0e0e0' }}>
                                                    {item.parameterName || '-'}
                                                </td>
                                                <td style={{ padding: '6px', color: '#333', fontSize: '12px' }}>
                                                    {item.parameterValue || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

