import React from "react";

export interface BillingDetailOption {
    id: string;
    billing_group_name?: string;
    billing_subgroup_name?: string;
    billing_details?: string;
    default_fees?: number | string;
}

interface AddBillingPopupProps {
    open: boolean;
    onClose: () => void;
    isFormDisabled: boolean;
    onSubmit?: (totalAmount: number, selectedIds: string[]) => void;
    // Optional external control
    billingSearch?: string;
    setBillingSearch?: (v: string) => void;
    filteredBillingDetails?: BillingDetailOption[];
    selectedBillingDetailIds?: string[];
    setSelectedBillingDetailIds?: (updater: (prev: string[]) => string[]) => void;
    // Optional inputs to fetch internally (when filteredBillingDetails not provided)
    doctorId?: string;
    clinicId?: string;
    // Required context for submit to backend
    userId?: string;
    patientId?: string;
    visitDate?: string; // yyyy-MM-dd or yyyy-MM-ddTHH:mm:ss
    patientVisitNo?: number;
    shiftId?: number; // or short
    useOverwrite?: boolean;
    followUp?: boolean; // Follow-up visit type flag
}

export default function AddBillingPopup({
    open,
    onClose,
    isFormDisabled,
    onSubmit,
    billingSearch,
    setBillingSearch,
    filteredBillingDetails,
    selectedBillingDetailIds,
    setSelectedBillingDetailIds,
    doctorId,
    clinicId,
    userId,
    patientId,
    visitDate,
    patientVisitNo,
    shiftId,
    useOverwrite,
    followUp,
}: AddBillingPopupProps) {
    // Local state fallbacks when parent does not control
    const [localSearch, setLocalSearch] = React.useState<string>('');
    const [options, setOptions] = React.useState<BillingDetailOption[]>([]);
    const [localSelectedIds, setLocalSelectedIds] = React.useState<string[]>([]);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    // Preserve original order of options to ensure rows never jump when selected
    const initialOrderRef = React.useRef<Map<string, number>>(new Map());

    // Load via API if parent did not provide options
    React.useEffect(() => {
        let cancelled = false;
        async function loadBillingDetails() {
            if (filteredBillingDetails && filteredBillingDetails.length > 0) return;
            // Require basic context to call the visit master-lists API
            if (!doctorId || !clinicId) return;

            // Prefer visits master-lists to also hydrate preselected values for patch flows
            const params = new URLSearchParams();
            if (patientId) params.set('patientId', String(patientId));
            if (shiftId != null) params.set('shiftId', String(shiftId));
            if (clinicId) params.set('clinicId', String(clinicId));
            if (doctorId) params.set('doctorId', String(doctorId));
            if (visitDate) params.set('visitDate', String(visitDate));
            if (patientVisitNo != null) params.set('patientVisitNo', String(patientVisitNo));

            const canUseVisitApi = params.has('patientId') && params.has('shiftId') && params.has('clinicId') && params.has('doctorId') && params.has('visitDate') && params.has('patientVisitNo');

            try {
                let data: any = null;
                if (canUseVisitApi) {
                    const resp = await fetch(`/api/visits/master-lists?${params.toString()}`);
                    if (!resp.ok) throw new Error(`Failed to load visit master-lists (${resp.status})`);
                    data = await resp.json();
                } else {
                    // Fallback to legacy refdata endpoint when not enough context for visit API
                    const resp = await fetch(`/api/refdata/symptom-data?doctorId=${encodeURIComponent(doctorId)}&clinicId=${encodeURIComponent(clinicId)}`);
                    if (!resp.ok) throw new Error(`Failed to load billing details (${resp.status})`);
                    data = await resp.json();
                }

                const items = Array.isArray(data?.billingDetails)
                    ? data.billingDetails
                    : Array.isArray(data)
                        ? data
                        : Array.isArray(data?.data?.billingDetails)
                            ? data.data.billingDetails
                            : [];

                const mapped: BillingDetailOption[] = items.map((item: any, idx: number) => ({
                    id: String(item.id ?? item._id ?? idx),
                    billing_group_name: item.billing_group_name ?? item.group_name ?? item.group,
                    billing_subgroup_name: item.billing_subgroup_name ?? item.sub_group_name ?? item.subgroup,
                    billing_details: item.billing_details ?? item.details ?? item.name,
                    default_fees: typeof item.default_fees === 'number' ? item.default_fees : Number(item.default_fees ?? item.fee ?? 0)
                }));
                if (!cancelled) setOptions(mapped);

                // Attempt to hydrate pre-selected IDs when provided by visit API
                const preIds: string[] = (() => {
                    const fromA = data?.selectedBillingDetailIds;
                    if (Array.isArray(fromA)) return fromA.map((v: any) => String(v));
                    const fromB = data?.preSelectedBillingIds;
                    if (Array.isArray(fromB)) return fromB.map((v: any) => String(v));
                    const fromC = data?.data?.selectedBillingDetailIds;
                    if (Array.isArray(fromC)) return fromC.map((v: any) => String(v));
                    return [];
                })();

                if (!cancelled && preIds.length > 0) {
                    // Initialize selections only if not already set by parent/local
                    setEffectiveSelectedIds(prev => (prev && prev.length > 0 ? prev : [...preIds]));
                }
            } catch (e) {
                console.error('Error loading billing details:', e);
                if (!cancelled) setOptions([]);
            }
        }
        loadBillingDetails();
        return () => { cancelled = true; };
    }, [doctorId, clinicId, patientId, visitDate, patientVisitNo, shiftId, filteredBillingDetails]);

    const effectiveOptions = filteredBillingDetails ?? options;

    // Capture initial order only once per id to keep row positions stable
    React.useEffect(() => {
        const order = initialOrderRef.current;
        if (!Array.isArray(effectiveOptions)) return;
        for (let i = 0; i < effectiveOptions.length; i++) {
            const id = effectiveOptions[i]?.id;
            if (id != null && !order.has(id)) {
                order.set(id, order.size);
            }
        }
    }, [effectiveOptions]);
    const effectiveSearch = billingSearch !== undefined ? billingSearch : localSearch;
    const effectiveSelectedIds = selectedBillingDetailIds ?? localSelectedIds;
    const setEffectiveSearch = setBillingSearch ?? setLocalSearch;
    const setEffectiveSelectedIds = (setSelectedBillingDetailIds ?? setLocalSelectedIds);

    const computedFiltered = React.useMemo(() => {
        const term = effectiveSearch.trim().toLowerCase();
        if (!term) {
            // Return in stable initial order
            return [...effectiveOptions].sort((a, b) => {
                const order = initialOrderRef.current;
                const ai = order.get(a.id) ?? Number.POSITIVE_INFINITY;
                const bi = order.get(b.id) ?? Number.POSITIVE_INFINITY;
                return ai - bi;
            });
        }
        const matches = (opt: BillingDetailOption) =>
            (opt.billing_group_name || '').toLowerCase().includes(term) ||
            (opt.billing_details || '').toLowerCase().includes(term) ||
            (opt.billing_subgroup_name || '').toLowerCase().includes(term);

        // Filter while preserving the original stable order
        return effectiveOptions
            .filter(matches)
            .sort((a, b) => {
                const order = initialOrderRef.current;
                const ai = order.get(a.id) ?? Number.POSITIVE_INFINITY;
                const bi = order.get(b.id) ?? Number.POSITIVE_INFINITY;
                return ai - bi;
            });
    }, [effectiveOptions, effectiveSearch]);

    const totalSelectedFees = React.useMemo(() => {
        const idSet = new Set(effectiveSelectedIds);
        let total = 0;
        // Always compute over all available options so total does not change when filtered
        for (const item of effectiveOptions) {
            if (idSet.has(item.id)) {
                const fee = typeof item.default_fees === 'number' ? item.default_fees : Number(item.default_fees);
                if (!isNaN(fee)) total += fee;
            }
        }
        return total;
    }, [effectiveOptions, effectiveSelectedIds]);

    // Auto-select Professional Fees based on followUp status
    React.useEffect(() => {
        if (effectiveOptions.length === 0) return;
        if (followUp === undefined) return; // Only act when followUp is explicitly provided

        // Find Professional Fees items
        const professionalFeesItems = effectiveOptions.filter(opt => {
            const groupName = (opt.billing_group_name || '').trim();
            const details = (opt.billing_details || '').trim();
            return groupName === 'Professional Fees' && details === 'Professional Fees';
        });

        if (professionalFeesItems.length === 0) return;

        // Determine which subgroup to select
        const targetSubgroup = followUp ? 'Follow-up' : 'New';
        
        // Find the matching item
        const targetItem = professionalFeesItems.find(opt => {
            const subgroupName = (opt.billing_subgroup_name || '').trim();
            return subgroupName === targetSubgroup;
        });

        if (!targetItem) return;

        // Check if we need to update selections
        const currentSelectedIds = effectiveSelectedIds;
        const hasTargetItem = currentSelectedIds.includes(targetItem.id);
        
        // Check if any other Professional Fees items are selected
        const hasOtherProfessionalFees = currentSelectedIds.some(id => {
            const opt = effectiveOptions.find(o => o.id === id);
            if (!opt) return false;
            const groupName = (opt.billing_group_name || '').trim();
            return groupName === 'Professional Fees' && opt.id !== targetItem.id;
        });

        // Only update if selection doesn't match what we want
        if (!hasTargetItem || hasOtherProfessionalFees) {
            setEffectiveSelectedIds(prev => {
                // Remove all Professional Fees items first
                const withoutProfessionalFees = prev.filter(id => {
                    const opt = effectiveOptions.find(o => o.id === id);
                    if (!opt) return true;
                    const groupName = (opt.billing_group_name || '').trim();
                    return groupName !== 'Professional Fees';
                });

                // Add the target item if not already present
                if (!withoutProfessionalFees.includes(targetItem.id)) {
                    return [...withoutProfessionalFees, targetItem.id];
                }
                return withoutProfessionalFees;
            });
        }
    }, [followUp, effectiveOptions, effectiveSelectedIds]);

    // Clear error message when popup closes
    React.useEffect(() => {
        if (!open) {
            setErrorMessage(null);
        }
    }, [open]);

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
                    width: '98%',
                    maxWidth: 1200,
                    maxHeight: '90vh',
                    overflow: 'hidden',
                    background: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    fontFamily: "'Roboto', sans-serif",
                    position: 'relative'
                }}
                className="no-focus-outline"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Scoped styles to remove focus outline around checkboxes inside this modal only */}
                <style>
                    {`
                    .no-focus-outline input[type="checkbox"] {
                        outline: none;
                        box-shadow: none;
                        -webkit-tap-highlight-color: transparent;
                    }
                    .no-focus-outline input[type="checkbox"]:focus,
                    .no-focus-outline input[type="checkbox"]:focus-visible {
                        outline: none !important;
                        box-shadow: none !important;
                    }
                    `}
                </style>
                <div style={{
                    background: 'white',
                    padding: '12px 20px 8px 20px',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ color: '#000000', fontWeight: 700, fontSize: '18px', fontFamily: "'Roboto', sans-serif" }}>Billed Charges</div>
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
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgb(25, 118, 210)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgb(25, 118, 210)'; }}
                    >
                        ×
                    </button>
                </div>

                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    
                    {/* Error message display */}
                    {errorMessage && (
                        <div style={{
                            padding: '12px 16px',
                            backgroundColor: '#ffebee',
                            border: '1px solid #f44336',
                            borderRadius: '4px',
                            color: '#c62828',
                            fontSize: '14px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span style={{ fontSize: '18px' }}>⚠</span>
                            <span>{errorMessage}</span>
                        </div>
                    )}
                    
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: 6,
                            background: 'transparent',
                            padding: '0 8px',
                            marginBottom: '8px'
                        }}
                    >
                        <div style={{ fontWeight: 600, color: '#333', fontSize: '13px' }}>Total:</div>
                        <div style={{
                            textAlign: 'right',
                            color: '#333',
                            fontWeight: 700,
                            fontSize: '13px'
                        }}>
                            ₹{totalSelectedFees.toFixed(2)}
                        </div>
                    </div>

                    <div style={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
                        <div>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold', fontSize: '11px' }}>
                                        <th style={{ padding: '6px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#1976d2', color: 'white', borderRight: '1px solid rgba(255,255,255,0.2)', width: 40 }}>Sr.</th>
                                        <th style={{ padding: '6px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#1976d2', color: 'white', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Group</th>
                                        <th style={{ padding: '6px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#1976d2', color: 'white', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Sub-Group</th>
                                        <th style={{ padding: '6px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#1976d2', color: 'white', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Details</th>
                                        <th style={{ padding: '6px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#1976d2', color: 'white', borderRight: '1px solid rgba(255,255,255,0.2)', width: 80 }}>Select</th>
                                        <th style={{ padding: '6px', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#1976d2', color: 'white', whiteSpace: 'nowrap', width: 140 }}>Total Fees(Rs)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {computedFiltered.length === 0 && (
                                        <tr>
                                            <td colSpan={6} style={{ padding: '12px', color: '#777', fontSize: '12px' }}>No charges found</td>
                                        </tr>
                                    )}
                                    {computedFiltered.map((opt, idx) => {
                                        const checked = effectiveSelectedIds.includes(opt.id);
                                        const toggle = (next: boolean) => {
                                            setEffectiveSelectedIds(prev => {
                                                if (next) {
                                                    if (prev.includes(opt.id)) return prev;
                                                    return [...prev, opt.id];
                                                } else {
                                                    return prev.filter(v => v !== opt.id);
                                                }
                                            });
                                        };
                                        const fee = typeof opt.default_fees === 'number' ? opt.default_fees : Number(opt.default_fees);
                                        return (
                                            <tr
                                                key={opt.id}
                                                style={{
                                                    borderBottom: '1px solid #e0e0e0',
                                                    backgroundColor: idx % 2 === 0 ? '#f8f9fa' : 'white'
                                                }}
                                                onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#f5f5f5'; }}
                                                onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = idx % 2 === 0 ? '#f8f9fa' : 'white'; }}
                                            >
                                                <td style={{ padding: '6px', color: '#333', fontSize: '12px', borderRight: '1px solid #e0e0e0' }}>{idx + 1}</td>
                                                <td style={{ padding: '6px', color: '#333', fontSize: '12px', borderRight: '1px solid #e0e0e0' }}>{opt.billing_group_name || ''}</td>
                                                <td style={{ padding: '6px', color: '#333', fontSize: '12px', borderRight: '1px solid #e0e0e0' }}>{opt.billing_subgroup_name || ''}</td>
                                                <td style={{ padding: '6px', color: '#333', fontSize: '12px', borderRight: '1px solid #e0e0e0' }}>{opt.billing_details || ''}</td>
                                                <td style={{ padding: '6px', textAlign: 'center', borderRight: '1px solid #e0e0e0' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={(e) => toggle(e.target.checked)}
                                                        disabled={isFormDisabled}
                                                        style={{
                                                            cursor: isFormDisabled ? 'not-allowed' : 'pointer',
                                                            width: '18px',
                                                            height: '18px'
                                                        }}
                                                    />
                                                </td>
                                                <td style={{ padding: '6px', textAlign: 'right', color: '#333', fontWeight: '500', fontSize: '12px' }}>
                                                    {isNaN(fee) ? '-' : `₹${fee.toFixed(2)}`}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 6, justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            style={{ 
                                backgroundColor: '#1976d2', 
                                color: '#fff', 
                                border: 'none', 
                                padding: '8px 16px', 
                                borderRadius: '4px', 
                                cursor: 'pointer', 
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1565c0'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1976d2'; }}
                            disabled={isFormDisabled}
                            onClick={() => {
                                if (isFormDisabled) return;
                                
                                // Validate that at least one item is selected
                                if (effectiveSelectedIds.length === 0) {
                                    setErrorMessage('Please select at least one billing item.');
                                    return;
                                }
                                
                                // Call onSubmit callback with selected data
                                if (typeof onSubmit === 'function') {
                                    onSubmit(Number(totalSelectedFees.toFixed(2)), [...effectiveSelectedIds]);
                                }
                                
                                // Close popup
                                onClose();
                            }}
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


