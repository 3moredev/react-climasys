import React, { useEffect, useState } from 'react';
import { Close } from '@mui/icons-material';
import { SessionInfo } from '../services/sessionService';
import { patientService, MasterListsRequest } from '../services/patientService';

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
    const [services, setServices] = useState<PastServiceItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [billing, setBilling] = useState({
        billed: '',
        discount: '',
        acBalance: '',
        dues: '',
        feesCollected: '',
        paymentBy: '',
        paymentRemark: '',
        receiptNo: '',
        receiptDate: '',
        receiptAmount: ''
    });
    const [uiFieldsData, setUiFieldsData] = useState<any>(null);
    const [paymentByOptions, setPaymentByOptions] = useState<Array<{ value: string; label: string }>>([]);

    // Load Payment By reference data
    useEffect(() => {
        let cancelled = false;
        async function loadPaymentByOptions() {
            try {
                const ref = await patientService.getAllReferenceData();
                if (cancelled) return;
                const preferKeys = ['paymentMethods', 'paymentBy', 'paymentTypes', 'paymentModes', 'payments', 'paymentByList'];
                let raw: any[] = [];
                for (const key of preferKeys) {
                    if (Array.isArray((ref as any)?.[key])) { raw = (ref as any)[key]; break; }
                }
                if (raw.length === 0) {
                    const firstArrayKey = Object.keys(ref || {}).find(k => Array.isArray((ref as any)[k]) && ((ref as any)[k][0] && (('description' in (ref as any)[k][0]) || ('label' in (ref as any)[k][0]) || ('name' in (ref as any)[k][0]))));
                    if (firstArrayKey) raw = (ref as any)[firstArrayKey];
                }
                const toStr = (v: any) => (v === undefined || v === null ? '' : String(v));
                const options: { value: string; label: string }[] = Array.isArray(raw)
                    ? raw.map((r: any) => ({
                        value: toStr(r?.id ?? r?.value ?? r?.code ?? r?.paymentById ?? r?.key ?? r),
                        label: toStr(r?.paymentDescription ?? r?.description ?? r?.label ?? r?.name ?? r?.paymentBy ?? r)
                    })).filter(o => o.label)
                    : [];
                setPaymentByOptions(options);
                // If no selection yet, initialize to first
                setBilling(prev => ({ ...prev, paymentBy: prev.paymentBy || (options[0]?.value || '') }));
            } catch (_) {
                // ignore
            }
        }
        loadPaymentByOptions();
        return () => { cancelled = true; };
    }, []);

    const handleSelectChange = (index: number) => {
        const updatedServices = [...services];
        updatedServices[index].selected = !updatedServices[index].selected;
        setServices(updatedServices);
    };

    // Fetch previous visit items for the selected date
    useEffect(() => {
        async function fetchItems() {
            try {
                setError(null);
                setLoading(true);
                setServices([]);
                if (!open) return;
                if (!date) return;
                const patientId = patientData?.patientId;
                const doctorId = sessionData?.doctorId as unknown as string | undefined;
                const clinicId = sessionData?.clinicId as unknown as string | undefined;
                const shiftFromSession = (sessionData as any)?.shiftId;
                if (!patientId || !doctorId || !clinicId) return;

                // First, find the visitNo and shiftId for the given date
                // Primary: fetch detailed visits
                let visitNo: number | undefined;
                let shiftId: number | undefined;

                const normalize = (d: any): string => {
                    if (!d) return '';
                    const s = String(d);
                    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s; // YYYY-MM-DD
                    const parts = s.split(' ');
                    return parts[0]; // take date portion
                };
                const targetDate = normalize(date);

                try {
                    const visitsResp: any = await patientService.getPatientPreviousVisitsWithDetails(patientId, targetDate);
                    const visits: any[] = Array.isArray(visitsResp?.visits) ? visitsResp.visits : [];
                    const match = visits.find(v => normalize(v.visit_date) === targetDate);
                    visitNo = match?.patient_visit_no ?? match?.visit_number;
                    shiftId = match?.shift_id as number | undefined;
                } catch (e: any) {
                    // Fallback on 404: use previous-visit-dates endpoint
                    const datesResp: any = await patientService.getPreviousServiceVisitDates({
                        patientId: String(patientId),
                        clinicId: String(clinicId),
                        todaysVisitDate: targetDate
                    });
                    const arrs: any[] = [];
                    if (Array.isArray(datesResp?.visits)) arrs.push(datesResp.visits);
                    if (Array.isArray(datesResp?.resultSet1)) arrs.push(datesResp.resultSet1);
                    if (Array.isArray(datesResp)) arrs.push(datesResp);
                    const first = arrs.find(a => Array.isArray(a)) || [];
                    const match = first.find((v: any) => normalize(v.visitDate || v.visit_date || v.Visit_Date) === targetDate);
                    visitNo = match?.patientVisitNo || match?.patient_visit_no || match?.visit_number;
                    // shiftId may be missing; use session fallback
                    shiftId = match?.shiftId || match?.shift_id || (typeof shiftFromSession === 'number' ? shiftFromSession : parseInt(String(shiftFromSession || 1), 10));
                }

                if (!shiftId) {
                    shiftId = (typeof shiftFromSession === 'number' ? shiftFromSession : parseInt(String(shiftFromSession || 1), 10));
                }
                if (!visitNo) {
                    setError('No matching visit found for selected date.');
                    return;
                }

                // Call items API
                const itemsResp: any = await patientService.getPreviousServiceVisitItems({
                    patientId: String(patientId),
                    doctorId: String(doctorId),
                    clinicId: String(clinicId),
                    shiftId: Number(shiftId),
                    visitNo: Number(visitNo),
                    visitDate: targetDate
                });

                const items: any[] = Array.isArray(itemsResp?.items) ? itemsResp.items : (Array.isArray(itemsResp) ? itemsResp : []);

                const mapped: PastServiceItem[] = items.map((it, idx) => ({
                    sr: idx + 1,
                    group: String(it.group || it.group_description || it.category || it.Group || '—'),
                    subGroup: String(it.subGroup || it.sub_group || it.sub_category || it.SubGroup || '—'),
                    details: String(it.details || it.description || it.service_description || it.item || '—'),
                    selected: false,
                    totalFees: Number(it.totalFees ?? it.total_fee ?? it.fees ?? it.amount ?? it.rate ?? 0)
                }));

                setServices(mapped);

                // Fetch master lists to patch payment details for this specific visit
                try {
                    const params: MasterListsRequest = {
                        patientId: String(patientId),
                        shiftId: Number(shiftId || 1),
                        clinicId: String(clinicId),
                        doctorId: String(doctorId),
                        visitDate: targetDate, // YYYY-MM-DD
                        patientVisitNo: Number(visitNo || 0)
                    } as MasterListsRequest;

                    const mlResp: any = await patientService.getMasterLists(params);
                    const dataRootMl = (mlResp as any)?.data || {};
                    const uiFields = (dataRootMl as any)?.uiFields || (mlResp as any)?.uiFields || {};
                    const toStr = (v: any) => (v === undefined || v === null ? '' : String(v));

                    // Store full uiFields payload (normalized) for reference
                    setUiFieldsData({
                        bloodPressure: toStr(uiFields?.bloodPressure),
                        instructions: toStr(uiFields?.instructions),
                        oedema: toStr(uiFields?.oedema),
                        billedRs: toStr(uiFields?.billedRs),
                        inPerson: Boolean(uiFields?.inPerson),
                        cholestrol: Boolean(uiFields?.cholestrol),
                        followUp: toStr(uiFields?.followUp),
                        acBalanceRs: toStr(uiFields?.acBalanceRs),
                        followUpType: toStr(uiFields?.followUpType),
                        collectedRs: toStr(uiFields?.collectedRs),
                        smoking: Boolean(uiFields?.smoking),
                        tobacco: Boolean(uiFields?.tobacco),
                        allergyDetails: toStr(uiFields?.allergyDetails),
                        alcohol: Boolean(uiFields?.alcohol),
                        discountRs: toStr(uiFields?.discountRs),
                        ihd: Boolean(uiFields?.ihd),
                        duesRs: toStr(uiFields?.duesRs),
                        paymentRemark: toStr(uiFields?.paymentRemark),
                        heightCm: toStr(uiFields?.heightCm),
                        asthma: Boolean(uiFields?.asthma),
                        paymentBy: toStr(uiFields?.paymentBy ?? uiFields?.paymentById),
                        pulsePerMin: toStr(uiFields?.pulsePerMin),
                        followUpDate: toStr(uiFields?.followUpDate),
                        th: Boolean(uiFields?.th),
                        habitDetails: toStr(uiFields?.habitDetails),
                        tpr: toStr(uiFields?.tpr),
                        receiptNo: toStr(uiFields?.receiptNo),
                        pallor: toStr(uiFields?.pallor),
                        sugar: toStr(uiFields?.sugar),
                        hypertension: Boolean(uiFields?.hypertension),
                        diabetes: Boolean(uiFields?.diabetes),
                        weightKg: toStr(uiFields?.weightKg)
                    });

                    // Try to read paymentBy and remark from vitals as priority
                    const vitals0 = Array.isArray((dataRootMl as any)?.vitals) ? (dataRootMl as any).vitals[0] : undefined;
                    const paymentByFromVitals = vitals0?.payment_by_id;
                    const paymentRemarkFromVitals = vitals0?.payment_remark;

                    setBilling(prev => ({
                        ...prev,
                        billed: toStr(uiFields?.billedRs ?? uiFields?.BilledRs ?? uiFields?.billed_amount ?? uiFields?.Billed_Amount ?? ''),
                        discount: toStr(uiFields?.discountRs ?? uiFields?.DiscountRs ?? uiFields?.discount ?? uiFields?.Discount ?? ''),
                        dues: toStr(uiFields?.duesRs ?? uiFields?.DuesRs ?? uiFields?.dues ?? uiFields?.Dues ?? ''),
                        acBalance: toStr(uiFields?.acBalanceRs ?? uiFields?.AcBalanceRs ?? uiFields?.ac_balance ?? uiFields?.Ac_Balance ?? ''),
                        receiptNo: toStr(uiFields?.receiptNo ?? uiFields?.ReceiptNo ?? ''),
                        feesCollected: toStr(uiFields?.collectedRs ?? uiFields?.feesCollected ?? uiFields?.FeesCollected ?? uiFields?.collected ?? uiFields?.Collected ?? ''),
                        paymentRemark: toStr(paymentRemarkFromVitals ?? uiFields?.paymentRemark ?? uiFields?.PaymentRemark ?? ''),
                        paymentBy: toStr(paymentByFromVitals ?? uiFields?.paymentBy ?? uiFields?.paymentById ?? uiFields?.PaymentById ?? ''),
                        receiptDate: toStr(uiFields?.receiptDate ?? uiFields?.ReceiptDate ?? ''),
                        receiptAmount: toStr(uiFields?.receiptAmount ?? uiFields?.ReceiptAmount ?? '')
                    }));
                } catch (_) {
                    // Ignore master lists errors in popup; keep items rendered
                }
            } catch (e: any) {
                setError(e?.message || 'Failed to load past service items');
            } finally {
                setLoading(false);
            }
        }

        fetchItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, date, patientData?.patientId, sessionData?.doctorId, sessionData?.clinicId]);

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
                        {/* Loading/Error banners */}
                        {loading && (
                            <div style={{
                                marginBottom: '10px',
                                padding: '10px 12px',
                                backgroundColor: '#E3F2FD',
                                border: '1px solid #BBDEFB',
                                color: '#0D47A1',
                                fontSize: '12px',
                                borderRadius: 4
                            }}>
                                Loading past service items...
                            </div>
                        )}
                        {!!error && (
                            <div style={{
                                marginBottom: '10px',
                                padding: '10px 12px',
                                backgroundColor: '#FFEBEE',
                                border: '1px solid #FFCDD2',
                                color: '#C62828',
                                fontSize: '12px',
                                borderRadius: 4
                            }}>
                                {error}
                            </div>
                        )}
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
                                    value={billing.billed}
                                    onChange={(e) => setBilling(b => ({ ...b, billed: e.target.value }))}
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
                                    value={billing.discount}
                                    onChange={(e) => setBilling(b => ({ ...b, discount: e.target.value }))}
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
                                    value={billing.acBalance}
                                    onChange={(e) => setBilling(b => ({ ...b, acBalance: e.target.value }))}
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
                                    value={billing.dues}
                                    onChange={(e) => setBilling(b => ({ ...b, dues: e.target.value }))}
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
                                    value={billing.feesCollected}
                                    onChange={(e) => setBilling(b => ({ ...b, feesCollected: e.target.value }))}
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
                                    // value={billing.reason}
                                    // onChange={(e) => setBilling(b => ({ ...b, reason: e.target.value }))}
                                    // style={{
                                    //     padding: '8px 10px',
                                    //     border: '1px solid #ccc',
                                    //     borderRadius: '4px',
                                    //     fontSize: '13px'
                                    // }}
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
                                <select
                                    disabled
                                    value={billing.paymentBy}
                                    onChange={(e) => setBilling(b => ({ ...b, paymentBy: e.target.value }))}
                                    style={{
                                        padding: '8px 10px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '13px',
                                        background: '#D5D5D8',
                                        color: '#333'
                                    }}
                                >
                                    {paymentByOptions.length === 0 ? (
                                        <option value="">—</option>
                                    ) : (
                                        paymentByOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))
                                    )}
                                </select>
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
                                    value={billing.paymentRemark}
                                    onChange={(e) => setBilling(b => ({ ...b, paymentRemark: e.target.value }))}                                
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
                                    value={billing.receiptDate}
                                    onChange={(e) => setBilling(b => ({ ...b, receiptDate: e.target.value }))}
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
                                    value={billing.receiptNo}
                                    onChange={(e) => setBilling(b => ({ ...b, receiptNo: e.target.value }))}
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

