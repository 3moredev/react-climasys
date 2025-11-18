import React, { useState, useEffect } from 'react';
import { Close } from '@mui/icons-material';
import trendsService, { PatientTrendItem } from '../services/trendsService';
import { sessionService } from '../services/sessionService';

interface TrendRow {
    date: string;
    height: string;
    weight: string;
    pulse: string;
    bp: string;
    sugar: string;
    tft: string;
    pallorHb: string;
    findings: string;
    history: string;
}

interface VitalsTrendPopupProps {
    open: boolean;
    onClose: () => void;
    patientId?: string;
    clinicId?: string;
    doctorId?: string;
    visitNumber?: number;
}

const VitalsTrendPopup: React.FC<VitalsTrendPopupProps> = ({ 
    open, 
    onClose, 
    patientId, 
    clinicId, 
    doctorId,
    visitNumber 
}) => {
    const [trendRows, setTrendRows] = useState<TrendRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && patientId && clinicId) {
            fetchTrends();
        }
    }, [open, patientId, clinicId]);

    const fetchTrends = async () => {
        if (!patientId || !clinicId) {
            setError('Missing patient or clinic to load trends');
            return;
        }

        try {
            setError(null);
            setLoading(true);
            
            const shiftId = 1; // fallback if no shift available in session
            const visitDate = new Date().toISOString().slice(0, 10);
            const patientVisitNo = visitNumber ?? 0;

            const data: PatientTrendItem[] = await trendsService.getPatientTrends({
                patientId,
                doctorId: doctorId ?? null,
                clinicId,
                shiftId,
                visitDate,
                patientVisitNo,
            });

            const mapped = (data || []).map((item) => {
                const datePart = item.preDates ?? (item.visitDate ?? '--');
                const shiftPart = item.shiftDescription ? ` ${item.shiftDescription}` : '';
                let date = `${datePart}${shiftPart}`.trim();
                
                // Format date: "11-Nov-2025 : M : 11:08 M" -> "11-Nov-25  11:08"
                if (date && date !== '--') {
                    // Convert 4-digit year to 2-digit (e.g., 2025 -> 25) - case insensitive
                    date = date.replace(/(\d{1,2}-[A-Za-z]{3}-)(\d{4})/gi, (match, prefix, year) => {
                        return prefix + year.slice(-2);
                    });
                    // Remove " : M : " or " : m : " pattern (case insensitive) and replace with double space
                    date = date.replace(/\s*:\s*[Mm]\s*:\s*/gi, '  ');
                    // Remove trailing " M" or " m" pattern (case insensitive)
                    date = date.replace(/\s+[Mm]\s*$/gi, '');
                    // Ensure double space between date and time if single space exists
                    date = date.replace(/(\d{1,2}-[A-Za-z]{3}-\d{2})\s+(\d{2}:\d{2})/gi, '$1  $2');
                    // Clean up any remaining extra spaces
                    date = date.trim();
                }

                const height = (item.heightInCms?.toFixed?.(2) ?? item.preHeightInCms ?? '--').toString();
                const weight = (item.weightInKgs?.toFixed?.(2) ?? item.preWeight ?? '--').toString();
                const pulse = ((item.pulse as unknown as string) ?? item.prePulse ?? '--').toString();
                const bp = (item.bloodPressure ?? item.preBp ?? '--').toString();
                const sugar = (item.sugar ?? item.preSugar ?? '--').toString();
                const tft = (item.thtext ?? item.preThtext ?? '--').toString();
                const pallorHb = (item.pallor ?? item.prePallor ?? '--').toString();
                const findings = (item.importantFindings ?? item.preImportantFindings ?? '--').toString();
                const history = (item.additionalComments ?? item.preAdditionalComments ?? '--').toString();
                return { date, height, weight, pulse, bp, sugar, tft, pallorHb, findings, history };
            });

            setTrendRows(mapped);
        } catch (err: any) {
            setError(err?.message || 'Failed to load patient trends');
            setTrendRows([]);
        } finally {
            setLoading(false);
        }
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
                        Vitals Trend
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
                        <div style={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'minmax(130px, auto) 80px 80px 80px 100px 80px 80px 100px 120px 120px' as const, 
                                backgroundColor: '#1976d2', 
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '11px',
                                position: 'sticky',
                                top: 0,
                                zIndex: 10
                            }}>
                                <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Date</div>
                                <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Height</div>
                                <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Weight</div>
                                <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Pulse</div>
                                <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>BP</div>
                                <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Sugar</div>
                                <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>TFT</div>
                                <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Pallor/HB</div>
                                <div style={{ padding: '6px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Important Findings</div>
                                <div style={{ padding: '6px' }}>Detailed History</div>
                            </div>
                            {!loading && !error && trendRows.length === 0 && (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
                                    No trends available.
                                </div>
                            )}
                            <div style={{
                                maxHeight: trendRows.length > 5 ? '400px' : 'auto',
                                overflowY: trendRows.length > 5 ? 'auto' : 'visible'
                            }}>
                                {trendRows.map((row, index) => (
                                    <div key={index} style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: 'minmax(130px, auto) 80px 80px 80px 100px 80px 80px 100px 120px 120px' as const,
                                        backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                                        borderBottom: '1px solid #e0e0e0'
                                    }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f5f5f5'; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = index % 2 === 0 ? '#f8f9fa' : 'white'; }}
                                    >
                                        <div style={{ padding: '6px', borderRight: '1px solid #e0e0e0', fontSize: '12px', wordBreak: 'break-word', color: '#333' }}>{row.date}</div>
                                        <div style={{ padding: '6px', borderRight: '1px solid #e0e0e0', fontSize: '12px', color: '#333' }}>{row.height}</div>
                                        <div style={{ padding: '6px', borderRight: '1px solid #e0e0e0', fontSize: '12px', color: '#333' }}>{row.weight}</div>
                                        <div style={{ padding: '6px', borderRight: '1px solid #e0e0e0', fontSize: '12px', color: '#333' }}>{row.pulse}</div>
                                        <div style={{ padding: '6px', borderRight: '1px solid #e0e0e0', fontSize: '12px', color: '#333' }}>{row.bp}</div>
                                        <div style={{ padding: '6px', borderRight: '1px solid #e0e0e0', fontSize: '12px', color: '#333' }}>{row.sugar}</div>
                                        <div style={{ padding: '6px', borderRight: '1px solid #e0e0e0', fontSize: '12px', color: '#333' }}>{row.tft}</div>
                                        <div style={{ padding: '6px', borderRight: '1px solid #e0e0e0', fontSize: '12px', color: '#333' }}>{row.pallorHb}</div>
                                        <div style={{ padding: '6px', borderRight: '1px solid #e0e0e0', fontSize: '12px', color: '#333' }}>{row.findings}</div>
                                        <div style={{ padding: '6px', fontSize: '12px', color: '#333' }}>{row.history}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VitalsTrendPopup;

