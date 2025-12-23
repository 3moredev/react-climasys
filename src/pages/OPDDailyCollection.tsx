import React, { useState, useEffect, useMemo } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { alpha } from '@mui/material/styles';
import { isSameDay, isWithinInterval, startOfDay, endOfDay, format } from 'date-fns';
import {
    getOPDDailyCollection,
    getOPDDailyCollectionToday,
    exportToCSV,
} from '../services/opdDailyCollectionService';
import api from '../services/api';
import {
    OPDDailyCollectionRecord,
    OPDDailyCollectionTotals,
} from '../types/opdDailyCollection';
import { useAppSelector } from '../store/hooks';
import { useSession } from '../store/hooks/useSession';
import { getHeaderImageUrl } from '../utils/printTemplates';
import '../global.css';

function CustomPickersDay(props: PickersDayProps<Date> & { fromDate?: Date; toDate?: Date }) {
    const { fromDate, toDate, day, selected, ...other } = props;

    if (!fromDate || !toDate) {
        return <PickersDay day={day} selected={selected} {...other} sx={{ color: 'black' }} />;
    }

    const start = startOfDay(fromDate);
    const end = endOfDay(toDate);
    const dayDate = startOfDay(day);

    const isFirstDay = isSameDay(dayDate, start);
    const isLastDay = isSameDay(dayDate, end);
    const isBetween = isWithinInterval(dayDate, { start, end });

    return (
        <PickersDay
            day={day}
            selected={selected}
            {...other}
            sx={{
                color: 'black',
                ...(isBetween && !isFirstDay && !isLastDay && {
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    color: (theme) => theme.palette.text.primary,
                    '&:hover': {
                        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                    },
                    borderRadius: 0,
                }),
                ...(isFirstDay && {
                    borderTopLeftRadius: '50%',
                    borderBottomLeftRadius: '50%',
                    backgroundColor: (theme) => theme.palette.primary.main,
                    color: 'black',
                    '&:hover': { backgroundColor: (theme) => theme.palette.primary.dark },
                }),
                ...(isLastDay && {
                    borderTopRightRadius: '50%',
                    borderBottomRightRadius: '50%',
                    backgroundColor: (theme) => theme.palette.primary.main,
                    color: 'black',
                    '&:hover': { backgroundColor: (theme) => theme.palette.primary.dark },
                }),
            }}
        />
    );
}

const OPDDailyCollection: React.FC = () => {
    // Get user role from auth state
    const authState = useAppSelector((state) => state.auth);
    const isReceptionist = authState.user?.roleName?.toLowerCase() === 'receptionist';
    const roleId = authState.user?.roleId || 3;
    const languageId = authState.user?.languageId || 1;

    // Get session data (doctorId used to control provider filter visibility)
    const { clinicId: sessionClinicId, doctorId: sessionDoctorId } = useSession();
    const canFilterProviders = sessionDoctorId === 'DR-00010';
    const clinicId = sessionClinicId || 'CL-00001';

    // State management
    const [doctorId, setDoctorId] = useState<string>('All');
    const [doctors, setDoctors] = useState<Array<{ doctorId: string; doctorName: string }>>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingDoctors, setLoadingDoctors] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<OPDDailyCollectionRecord[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [fromDate, setFromDate] = useState<Date>(new Date());
    const [toDate, setToDate] = useState<Date>(new Date());

    const [calendarAnchor, setCalendarAnchor] = useState<HTMLButtonElement | null>(null);
    const [selectionMode, setSelectionMode] = useState<'from' | 'to'>('from');

    // Fetch doctors list on mount (only for users allowed to filter providers)
    useEffect(() => {
        if (canFilterProviders) {
            fetchDoctors();
        }
    }, [clinicId, canFilterProviders]);

    // Fetch doctors from API
    const fetchDoctors = async () => {
        if (!clinicId) return;

        setLoadingDoctors(true);
        try {
            const response = await api.get('/doctors/all', {
                params: {
                    languageId,
                    clinicId
                }
            });
            
            const result = response.data;
            if (Array.isArray(result)) {
                // Map backend field names to frontend structure
                const mappedDoctors = result.map((doc: any) => ({
                    doctorId: doc.doctor_id || doc.id || doc.doctorId,
                    doctorName: doc.doctor_name || doc.name || `${doc.prefix || ''} ${doc.first_name || ''}`.trim()
                }));
                setDoctors(mappedDoctors);
            }
        } catch (err) {
            console.error('Error fetching doctors:', err);
        } finally {
            setLoadingDoctors(false);
        }
    };

    // No client-side filtering needed - API handles all filtering
    // When DR-00010 selects "All", API returns all doctors including DR-00010
    // When DR-00010 selects a specific doctor, API returns only that doctor's records
    // For other doctors, API always returns only their own records
    const filteredData = data;

    // Pagination calculations (based on filtered data)
    const totalPages = Math.ceil(filteredData.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentData = filteredData.slice(startIndex, endIndex);

    // Calculate totals (from filtered data, not just current page)
    const totals = useMemo<OPDDailyCollectionTotals>(() => {
        return filteredData.reduce(
            (acc, record) => ({
                totalOriginalBilledAmount: acc.totalOriginalBilledAmount + (record.originalBilledAmount || 0),
                totalFeesToCollect: acc.totalFeesToCollect + (record.feesToCollect || 0),
                totalDifference: acc.totalDifference + (record.difference || 0),
                totalOriginalDiscount: acc.totalOriginalDiscount + (record.originalDiscount || 0),
                totalDiscount: acc.totalDiscount + (record.discount || 0),
                totalNet: acc.totalNet + (record.net || 0),
                totalFeesCollected: acc.totalFeesCollected + (record.feesCollected || 0),
                totalDues: acc.totalDues + (record.dues || 0),
                totalAdhocFees: acc.totalAdhocFees + (record.adhocFees || 0),
                totalCollection: acc.totalCollection + (record.feesCollected || 0) + (record.adhocFees || 0),
            }),
            {
                totalOriginalBilledAmount: 0,
                totalFeesToCollect: 0,
                totalDifference: 0,
                totalOriginalDiscount: 0,
                totalDiscount: 0,
                totalNet: 0,
                totalFeesCollected: 0,
                totalDues: 0,
                totalAdhocFees: 0,
                totalCollection: 0,
            }
        );
    }, [filteredData]);

    // Fetch data on component mount
    useEffect(() => {
        handleSearch();
    }, []);

    // Handle search with API
    const handleSearch = async (overrideDoctorId?: string) => {
        if (!clinicId) {
            setError('Clinic ID is required');
            return;
        }

        setLoading(true);
        setError(null);
        setCurrentPage(1); // Reset to first page on search

        try {
            // Use the latest doctorId if override is provided (e.g. from dropdown change)
            const currentDoctorId = overrideDoctorId ?? doctorId;

            // Decide which doctorId to send to API
            // - If DR-00010 (canFilterProviders) → use selected doctor from dropdown (All = all doctors)
            // - Else if logged-in doctor exists       → always that doctor's collection
            // - Else if receptionist                  → use selected (or All) if we ever enable provider filter
            // - Else                                  → All providers
            let doctorIdForApi: string;

            if (canFilterProviders) {
                doctorIdForApi = currentDoctorId === 'All' ? 'All' : currentDoctorId;
            } else if (sessionDoctorId) {
                doctorIdForApi = sessionDoctorId;
            } else if (isReceptionist) {
                doctorIdForApi = currentDoctorId === 'All' ? 'All' : currentDoctorId;
            } else {
                doctorIdForApi = 'All';
            }

            // Use date range API when dates are selected, otherwise use today endpoint
            const isToday = fromDate.toDateString() === new Date().toDateString() &&
                toDate.toDateString() === new Date().toDateString();

            let response;
            if (isToday) {
                // Use today endpoint for today's date
                response = await getOPDDailyCollectionToday(
                    clinicId,
                    doctorIdForApi,
                    roleId,
                    languageId
                );
                console.log('=== OPD Daily Collection Search (API - Today) ===');
            } else {
                // Use date range API for selected dates
                response = await getOPDDailyCollection({
                    fromDate,
                    toDate,
                    clinicId,
                    doctorId: doctorIdForApi,
                    roleId,
                    languageId,
                });
                console.log('=== OPD Daily Collection Search (API - Date Range) ===');
            }

            console.log('=== OPD Daily Collection Search Debug ===');
            console.log('Selected Doctor ID (dropdown):', currentDoctorId);
            console.log('Session Doctor ID (logged in):', sessionDoctorId);
            console.log('Can Filter Providers:', canFilterProviders);
            console.log('Doctor ID sent to API:', doctorIdForApi);
            console.log('From Date:', fromDate);
            console.log('To Date:', toDate);
            console.log('Clinic ID:', clinicId);
            console.log('API Response:', response);
            console.log('Records returned:', response.data?.length || 0);

            if (response.success) {
                console.log('Setting data:', response.data);
                setData(response.data || []);
            } else {
                console.error('API returned success=false');
                setError('Failed to fetch data');
                setData([]);
            }
        } catch (err: any) {
            console.error('Error in handleSearch:', err);
            setError(err.message || 'An error occurred while fetching data');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Handle page size change
    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setCurrentPage(1); // Reset to first page when page size changes
    };

    // Handle export to Excel/CSV (export filtered data)
    const handleExport = () => {
        exportToCSV(filteredData, `opd-daily-collection-${new Date().toISOString().split('T')[0]}.csv`);
    };

    // Handle print
    const handlePrint = () => {
        if (typeof window === 'undefined' || data.length === 0) return;

        const headerImageUrl = getHeaderImageUrl();
        const fromLabel = fromDate ? format(fromDate, 'dd MMM yyyy') : '';
        const toLabel = toDate ? format(toDate, 'dd MMM yyyy') : '';

        // Build table body from filtered data (not just current page)
        const tableRowsHtml = filteredData
            .map((row, index) => {
                const srNo = index + 1;
                const duesFormatted = formatDues(row.dues);
                return `
                    <tr>
                        <td>${srNo}</td>
                        <td>${row.visitDate || ''}</td>
                        <td>${row.name || ''}</td>
                        <td>${row.isFollowUp || ''}</td>
                        <td>${row.attendedBy || ''}</td>
                        <td style="text-align:right;">${formatCurrency(row.originalBilledAmount)}</td>
                        <td style="text-align:right;">${formatCurrency(row.feesToCollect)}</td>
                        <td style="text-align:right;">${formatCurrency(row.difference)}</td>
                        <td style="text-align:right;">${formatCurrency(row.originalDiscount)}</td>
                        <td style="text-align:right;">${formatCurrency(row.discount)}</td>
                        <td style="text-align:right;">${formatCurrency(row.net)}</td>
                        <td style="text-align:right;">${formatCurrency(row.feesCollected)}</td>
                        <td style="text-align:right;color:${duesFormatted.isNegative ? 'red' : 'black'};">${duesFormatted.value}</td>
                        <td style="text-align:right;">${formatCurrency(row.adhocFees)}</td>
                        <td>${row.comment || '–'}</td>
                        <td>${row.paymentDescription || '–'}</td>
                    </tr>
                `;
            })
            .join('');

        const totalDuesFormatted = formatDues(totals.totalDues);
        const totalsRowHtml = `
            <tr>
                <td colspan="5" style="font-weight:bold;">Total</td>
                <td style="text-align:right;font-weight:bold;">${formatCurrency(totals.totalOriginalBilledAmount)}</td>
                <td style="text-align:right;font-weight:bold;">${formatCurrency(totals.totalFeesToCollect)}</td>
                <td style="text-align:right;font-weight:bold;">${formatCurrency(totals.totalDifference)}</td>
                <td style="text-align:right;font-weight:bold;">${formatCurrency(totals.totalOriginalDiscount)}</td>
                <td style="text-align:right;font-weight:bold;">${formatCurrency(totals.totalDiscount)}</td>
                <td style="text-align:right;font-weight:bold;">${formatCurrency(totals.totalNet)}</td>
                <td style="text-align:right;font-weight:bold;">${formatCurrency(totals.totalFeesCollected)}</td>
                <td style="text-align:right;font-weight:bold;color:${totalDuesFormatted.isNegative ? 'red' : 'black'};">${totalDuesFormatted.value}</td>
                <td style="text-align:right;font-weight:bold;">${formatCurrency(totals.totalAdhocFees)}</td>
                <td colspan="2"></td>
            </tr>
        `;

        const printHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>OPD - Daily Collection</title>
                <style>
                    @page {
                        size: landscape;
                        margin: 10mm;
                    }
                    body {
                        font-family: Arial, sans-serif;
                        padding: 10px;
                        color: #000;
                        margin: 0;
                    }
                    .header-image {
                        text-align: center;
                        margin-bottom: 5px;
                        width: 100%;
                    }
                    .header-image img {
                        width: 100%;
                        height: auto;
                        max-height: 80px;
                        object-fit: contain;
                    }
                    .title {
                        font-size: 16px;
                        font-weight: bold;
                        text-align: center;
                        margin: 5px 0;
                    }
                    .date-range {
                        text-align: center;
                        margin-bottom: 5px;
                        font-size: 12px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 9px;
                        table-layout: fixed;
                    }
                    th, td {
                        border: 1px solid #000;
                        padding: 3px 4px;
                        word-wrap: break-word;
                        overflow: hidden;
                    }
                    th {
                        background-color: rgb(0, 123, 255);
                        color: #ffffff;
                        font-weight: 600;
                        font-size: 9px;
                        white-space: nowrap;
                    }
                    td {
                        font-size: 9px;
                    }
                    tbody tr:nth-child(even) {
                        background-color: #f8f9fa;
                    }
                    /* Column width adjustments for print */
                    table th:nth-child(1), table td:nth-child(1) { width: 2.5%; }
                    table th:nth-child(2), table td:nth-child(2) { width: 5%; }
                    table th:nth-child(3), table td:nth-child(3) { width: 8%; }
                    table th:nth-child(4), table td:nth-child(4) { width: 4%; }
                    table th:nth-child(5), table td:nth-child(5) { width: 6%; }
                    table th:nth-child(6), table td:nth-child(6) { width: 5.5%; }
                    table th:nth-child(7), table td:nth-child(7) { width: 5.5%; }
                    table th:nth-child(8), table td:nth-child(8) { width: 5.5%; }
                    table th:nth-child(9), table td:nth-child(9) { width: 5.5%; }
                    table th:nth-child(10), table td:nth-child(10) { width: 5.5%; }
                    table th:nth-child(11), table td:nth-child(11) { width: 5.5%; }
                    table th:nth-child(12), table td:nth-child(12) { width: 5.5%; }
                    table th:nth-child(13), table td:nth-child(13) { width: 5.5%; }
                    table th:nth-child(14), table td:nth-child(14) { width: 5.5%; }
                    table th:nth-child(15), table td:nth-child(15) { width: 7%; }
                    table th:nth-child(16), table td:nth-child(16) { width: 6.5%; }
                </style>
            </head>
            <body>
                <div class="header-image">
                    <img src="${headerImageUrl}" alt="Clinic Header" />
                </div>
                <div class="title">OPD - Daily Collection</div>
                <div class="date-range">
                    ${fromLabel && toLabel ? `From ${fromLabel} To ${toLabel}` : ''}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Sr.</th>
                            <th>Visit Time</th>
                            <th>Patient Name</th>
                            <th>New/Follow up</th>
                            <th>Provider</th>
                            <th>Original (O)</th>
                            <th>Billed (B)</th>
                            <th>Diff (O-B)</th>
                            <th>Orig Disc (OD)</th>
                            <th>Discount (D)</th>
                            <th>Net (B-D)</th>
                            <th>Collected (C)</th>
                            <th>Dues (B-D-C)</th>
                            <th>Adhoc (A)</th>
                            <th>Reason</th>
                            <th>Pay Method</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRowsHtml || `
                            <tr>
                                <td colspan="16" style="text-align:center;padding:20px;">No collection Available for today</td>
                            </tr>
                        `}
                        ${filteredData.length > 0 ? totalsRowHtml : ''}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        iframe.srcdoc = printHtml;
        document.body.appendChild(iframe);

        iframe.onload = () => {
            try {
                const win = iframe.contentWindow;
                if (win) {
                    win.focus();
                    win.print();
                }
            } finally {
                setTimeout(() => {
                    if (iframe.parentNode) {
                        iframe.parentNode.removeChild(iframe);
                    }
                }, 1000);
            }
        };
    };

    // Format currency
    const formatCurrency = (value: number | null | undefined): string => {
        if (value === null || value === undefined) return '0.00';
        return value.toFixed(2);
    };

    // Format dues - show in red if negative, without minus sign
    const formatDues = (value: number | null | undefined): { value: string; isNegative: boolean } => {
        if (value === null || value === undefined) return { value: '0.00', isNegative: false };
        const isNegative = value < 0;
        return { value: Math.abs(value).toFixed(2), isNegative };
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div className="container-fluid" style={{ fontFamily: "'Roboto', sans-serif", padding: "20px" }}>
                <style>{`
                    .table-wrapper {
                        width: 100%;
                        overflow-x: hidden;
                        margin-bottom: 20px;
                        display: flex;
                        flex-direction: column;
                        border: 1px solid #dee2e6;
                        border-radius: 4px;
                    }
                    .table-wrapper > table:first-child {
                        border-bottom: 1px solid #dee2e6;
                    }
                    .table-scroll-container {
                        height: 480px;
                        overflow-y: auto;
                        overflow-x: hidden;
                        position: relative;
                        display: block;
                        box-sizing: border-box;
                    }
                    .table-scroll-container::-webkit-scrollbar {
                        width: 8px;
                    }
                    .table-scroll-container::-webkit-scrollbar-track {
                        background: #f1f1f1;
                    }
                    .table-scroll-container::-webkit-scrollbar-thumb {
                        background: #888;
                        border-radius: 4px;
                    }
                    .table-scroll-container::-webkit-scrollbar-thumb:hover {
                        background: #555;
                    }
                    .table-scroll-container table {
                        border: none;
                        margin: 0;
                        width: 100%;
                        display: table;
                        box-sizing: border-box;
                    }
                    /* Account for scrollbar in scrollable container */
                    .table-scroll-container:not(:empty) {
                        padding-right: 0;
                    }
                    .opd-collection-table {
                        width: 100%;
                        border-collapse: collapse;
                        border-spacing: 0;
                        table-layout: fixed;
                        margin: 0;
                        box-sizing: border-box;
                    }
                    .opd-collection-table * {
                        box-sizing: border-box;
                    }
                    .opd-collection-table thead {
                        display: table-header-group;
                    }
                    .opd-collection-table thead th {
                        border-bottom: 1px solid #dee2e6;
                    }
                    .opd-collection-table tbody {
                        display: table-row-group;
                    }
                    .opd-collection-table tfoot {
                        display: table-footer-group;
                        background-color: #ffffff;
                    }
                    .table-wrapper > table:last-child {
                        border-top: 1px solid #dee2e6;
                    }
                    .table-wrapper > table {
                        width: 100%;
                    }
                    .opd-collection-table thead th {
                        background-color: rgb(0, 123, 255);
                        color: #ffffff;
                        padding: 10px 6px;
                        text-align: left;
                        font-weight: 600;
                        font-size: 0.85rem;
                        border: 1px solid #dee2e6;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    .opd-collection-table thead th[align="right"] {
                        text-align: right;
                    }
                    .opd-collection-table tbody td {
                        padding: 10px 6px;
                        border: 1px solid #dee2e6;
                        font-size: 0.85rem;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    .opd-collection-table tbody td[align="right"] {
                        text-align: right;
                    }
                    /* Column width adjustments - using percentages for responsive design */
                    .opd-collection-table th:nth-child(1),
                    .opd-collection-table td:nth-child(1) {
                        width: 3%;
                    }
                    .opd-collection-table th:nth-child(2),
                    .opd-collection-table td:nth-child(2) {
                        width: 6%;
                    }
                    .opd-collection-table th:nth-child(3),
                    .opd-collection-table td:nth-child(3) {
                        width: 10%;
                        white-space: normal;
                        word-wrap: break-word;
                    }
                    .opd-collection-table th:nth-child(4),
                    .opd-collection-table td:nth-child(4) {
                        width: 5%;
                    }
                    .opd-collection-table th:nth-child(5),
                    .opd-collection-table td:nth-child(5) {
                        width: 7%;
                    }
                    .opd-collection-table th:nth-child(6),
                    .opd-collection-table td:nth-child(6),
                    .opd-collection-table th:nth-child(7),
                    .opd-collection-table td:nth-child(7),
                    .opd-collection-table th:nth-child(8),
                    .opd-collection-table td:nth-child(8),
                    .opd-collection-table th:nth-child(9),
                    .opd-collection-table td:nth-child(9),
                    .opd-collection-table th:nth-child(10),
                    .opd-collection-table td:nth-child(10),
                    .opd-collection-table th:nth-child(11),
                    .opd-collection-table td:nth-child(11),
                    .opd-collection-table th:nth-child(12),
                    .opd-collection-table td:nth-child(12),
                    .opd-collection-table th:nth-child(13),
                    .opd-collection-table td:nth-child(13),
                    .opd-collection-table th:nth-child(14),
                    .opd-collection-table td:nth-child(14) {
                        width: 6%;
                    }
                    .opd-collection-table th:nth-child(15),
                    .opd-collection-table td:nth-child(15) {
                        width: 8%;
                        white-space: normal;
                        word-wrap: break-word;
                    }
                    .opd-collection-table th:nth-child(16),
                    .opd-collection-table td:nth-child(16) {
                        width: 7%;
                    }
                    .opd-collection-table tbody tr:nth-child(even) {
                        background-color: #f8f9fa;
                    }
                    .opd-collection-table tbody tr:nth-child(odd) {
                        background-color: #ffffff;
                    }
                    .opd-collection-table tbody tr:hover {
                        background-color: #e9ecef;
                    }
                    .opd-collection-table tbody tr.total-row {
                        background-color: #e8eaf6;
                        font-weight: bold;
                    }
                    .opd-collection-table tfoot tr.total-row {
                        background-color: #e8eaf6;
                        font-weight: bold;
                    }
                    .opd-collection-table tfoot td {
                        padding: 10px 6px;
                        border: 1px solid #dee2e6;
                        font-size: 0.85rem;
                        background-color: #e8eaf6;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    .opd-collection-table tfoot td[align="right"] {
                        text-align: right;
                    }
                    /* Ensure consistent border alignment */
                    .opd-collection-table thead th:first-child,
                    .opd-collection-table tbody td:first-child,
                    .opd-collection-table tfoot td:first-child {
                        border-left: 1px solid #dee2e6;
                    }
                    .opd-collection-table thead th:last-child,
                    .opd-collection-table tbody td:last-child,
                    .opd-collection-table tfoot td:last-child {
                        border-right: 1px solid #dee2e6;
                    }
                    .filter-section {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        margin-bottom: 20px;
                        flex-wrap: wrap;
                    }
                    .filter-row {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        width: 100%;
                        flex-wrap: wrap;
                    }
                    .btn-primary-custom {
                        background-color: rgb(0, 123, 255);
                        color: #ffffff;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        font-size: 0.9rem;
                        font-weight: 500;
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        transition: background-color 0.2s;
                        white-space: nowrap;
                    }
                    .btn-primary-custom:hover {
                        background-color: rgb(0, 100, 200);
                    }
                    .btn-primary-custom:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                    }
                    .provider-dropdown {
                        padding: 8px 12px;
                        border: 1px solid #ced4da;
                        border-radius: 4px;
                        font-size: 0.9rem;
                        width: 300px;
                        max-width: 300px;
                    }
                    .calendar-button {
                        background-color: rgb(0, 123, 255);
                        color: #ffffff;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        font-size: 0.9rem;
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        transition: background-color 0.2s;
                    }
                    .calendar-button:hover {
                        background-color: rgb(0, 100, 200);
                    }
                    .calendar-popover {
                        position: absolute;
                        z-index: 1000;
                        background: white;
                        border: 1px solid #dee2e6;
                        border-radius: 4px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                        padding: 16px;
                        margin-top: 8px;
                    }
                    .date-display-box {
                        display: flex;
                        gap: 12px;
                        margin-bottom: 16px;
                    }
                    .date-box {
                        flex: 1;
                        padding: 8px;
                        border: 1px solid #ced4da;
                        border-radius: 4px;
                        cursor: pointer;
                        background-color: #f8f9fa;
                        transition: all 0.2s;
                    }
                    .date-box.active {
                        border-color: rgb(0, 123, 255);
                        background-color: #e3f2fd;
                    }
                    .date-box-label {
                        font-size: 0.75rem;
                        font-weight: bold;
                        margin-bottom: 4px;
                        color: #333;
                    }
                    .date-box-value {
                        font-size: 0.9rem;
                        color: #212121;
                    }
                    .error-alert {
                        background-color: #f8d7da;
                        color: #721c24;
                        padding: 12px;
                        border-radius: 4px;
                        margin-bottom: 20px;
                        border: 1px solid #f5c6cb;
                    }
                    .error-alert-close {
                        float: right;
                        cursor: pointer;
                        font-weight: bold;
                        font-size: 1.2rem;
                        line-height: 1;
                    }
                    .loading-container {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 400px;
                    }
                    .loading-spinner {
                        border: 4px solid #f3f3f3;
                        border-top: 4px solid rgb(0, 123, 255);
                        border-radius: 50%;
                        width: 40px;
                        height: 40px;
                        animation: spin 1s linear infinite;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    /* Pagination styles */
                    .pagination-container {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-top: 20px;
                        padding: 15px 0;
                        border-top: 1px solid #e0e0e0;
                    }
                    .pagination-info {
                        display: flex;
                        align-items: center;
                        gap: 15px;
                        font-size: 0.9rem;
                        color: #666;
                    }
                    .page-size-selector {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        white-space: nowrap;
                    }
                    .pagination-controls {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .page-btn {
                        padding: 6px 12px;
                        border: 1px solid #ddd;
                        background: rgba(0, 0, 0, 0.35);
                        color: #333;
                        cursor: pointer;
                        border-radius: 4px;
                        font-size: 0.9rem;
                        transition: all 0.2s ease;
                    }
                    .page-btn:hover:not(:disabled) {
                        border-color: #999;
                    }
                    .page-btn.active {
                        background: #1E88E5;
                        color: white;
                        border-color: #1E88E5;
                    }
                    .page-btn:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                    }
                    /* Prev/Next buttons */
                    .nav-btn {
                        background: #1E88E5;
                        color: #fff;
                        border-color: #000;
                    }
                    .nav-btn:hover:not(:disabled) {
                        color: #fff;
                        border-color: #000;
                    }
                    .nav-btn:disabled {
                        background: #000;
                        color: #fff;
                        opacity: 0.35;
                    }
                    .page-size-select {
                        padding: 4px 8px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        font-size: 0.9rem;
                    }
                    @media print {
                        .filter-section,
                        .pagination-container,
                        .btn-primary-custom,
                        .calendar-button {
                            display: none !important;
                        }
                    }
                `}</style>

                {/* Page Title */}
                <h1 style={{
                    fontWeight: 'bold',
                    fontSize: '1.8rem',
                    color: '#212121',
                    marginBottom: '24px'
                }}>
                    OPD - Daily Collection
                </h1>

                {/* Filter Section */}
                <div className="filter-section">
                    <button
                        className="calendar-button"
                        onClick={(e) => {
                            setCalendarAnchor(e.currentTarget);
                            setSelectionMode('from');
                        }}
                    >
                        📅 Select Date Range
                    </button>
                    {calendarAnchor && (
                        <div
                            className="calendar-popover"
                            style={{
                                position: 'absolute',
                                left: calendarAnchor.offsetLeft,
                                top: calendarAnchor.offsetTop + calendarAnchor.offsetHeight + 8,
                            }}
                        >
                            <div className="date-display-box">
                                <div
                                    className={`date-box ${selectionMode === 'from' ? 'active' : ''}`}
                                    onClick={() => setSelectionMode('from')}
                                >
                                    <div className="date-box-label">From</div>
                                    <div className="date-box-value">
                                        {fromDate ? format(fromDate, 'dd MMM yyyy') : 'Select Date'}
                                    </div>
                                </div>
                                <div
                                    className={`date-box ${selectionMode === 'to' ? 'active' : ''}`}
                                    onClick={() => setSelectionMode('to')}
                                >
                                    <div className="date-box-label">To</div>
                                    <div className="date-box-value">
                                        {toDate ? format(toDate, 'dd MMM yyyy') : 'Select Date'}
                                    </div>
                                </div>
                            </div>
                            <StaticDatePicker
                                displayStaticWrapperAs="desktop"
                                value={selectionMode === 'from' ? fromDate : toDate}
                                onChange={(newValue) => {
                                    if (newValue) {
                                        if (selectionMode === 'from') {
                                            setFromDate(newValue);
                                            if (newValue > toDate) {
                                                setToDate(newValue);
                                            }
                                            setSelectionMode('to');
                                        } else {
                                            if (newValue < fromDate) {
                                                setFromDate(newValue);
                                            }
                                            setToDate(newValue);
                                        }
                                    }
                                }}
                                slots={{ day: CustomPickersDay }}
                                slotProps={{
                                    day: {
                                        fromDate,
                                        toDate,
                                    } as any,
                                }}
                                sx={{
                                    '.MuiPickersLayout-contentWrapper': {
                                        minWidth: '280px',
                                    },
                                    '.MuiPickersDay-root': {
                                        color: 'black !important',
                                    },
                                    '.MuiPickersDay-root.Mui-selected': {
                                        color: 'white !important',
                                    },
                                    '.MuiPickersCalendarHeader-label': {
                                        color: 'black !important',
                                    },
                                    '.MuiPickersArrowSwitcher-button': {
                                        color: 'black !important',
                                    },
                                    '.MuiPickersCalendarHeader-switchViewButton': {
                                        color: 'black !important',
                                    },
                                    '.MuiDayCalendar-weekDayLabel': {
                                        color: 'black !important',
                                    },
                                    '.MuiTypography-root': {
                                        color: 'black !important',
                                    },
                                    '.MuiSvgIcon-root': {
                                        color: 'black !important',
                                    }
                                }}
                            />
                            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    className="btn-primary-custom"
                                    onClick={() => {
                                        setCalendarAnchor(null);
                                        handleSearch();
                                    }}
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    )}
                    {canFilterProviders && (
                        <select
                            className="provider-dropdown"
                            value={doctorId}
                            onChange={(e) => {
                                const newDoctorId = e.target.value;
                                setDoctorId(newDoctorId);
                                // Call search with the new doctor immediately so filter applies correctly
                                handleSearch(newDoctorId);
                            }}
                            disabled={loadingDoctors}
                        >
                            <option value="All">All Providers</option>
                            {doctors.map((doctor) => (
                                <option key={doctor.doctorId} value={doctor.doctorId}>
                                    {doctor.doctorName}
                                </option>
                            ))}
                        </select>
                    )}
                    {isReceptionist && (
                        <span style={{ fontStyle: 'italic', color: '#999', fontSize: '0.9rem' }}>
                            Note: Only completed visits are shown on selection of provider
                        </span>
                    )}
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                        <button
                            className="btn-primary-custom"
                            onClick={handleExport}
                            disabled={loading || data.length === 0}
                        >
                            Download Excel
                        </button>
                        <button
                            className="btn-primary-custom"
                            onClick={handlePrint}
                            disabled={loading || data.length === 0}
                        >
                            Print
                        </button>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="error-alert">
                        {error}
                        <span className="error-alert-close" onClick={() => setError(null)}>×</span>
                    </div>
                )}

                {/* Data Table */}
                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="opd-collection-table">
                            <colgroup>
                                <col style={{ width: '3%' }} />
                                <col style={{ width: '6%' }} />
                                <col style={{ width: '10%' }} />
                                <col style={{ width: '5%' }} />
                                <col style={{ width: '7%' }} />
                                <col style={{ width: '6%' }} />
                                <col style={{ width: '6%' }} />
                                <col style={{ width: '6%' }} />
                                <col style={{ width: '6%' }} />
                                <col style={{ width: '6%' }} />
                                <col style={{ width: '6%' }} />
                                <col style={{ width: '6%' }} />
                                <col style={{ width: '6%' }} />
                                <col style={{ width: '6%' }} />
                                <col style={{ width: '8%' }} />
                                <col style={{ width: '7%' }} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th>Sr.</th>
                                    <th>Visit Time</th>
                                    <th>Patient Name</th>
                                    <th>New/Follow up</th>
                                    <th>Provider</th>
                                    <th align="right">Original (O)</th>
                                    <th align="right">Billed (B)</th>
                                    <th align="right">Diff (O-B)</th>
                                    <th align="right">Orig Disc (OD)</th>
                                    <th align="right">Discount (D)</th>
                                    <th align="right">Net (B-D)</th>
                                    <th align="right">Collected (C)</th>
                                    <th align="right">Dues (B-D-C)</th>
                                    <th align="right">Adhoc (A)</th>
                                    <th>Reason</th>
                                    <th>Pay Method</th>
                                </tr>
                            </thead>
                        </table>
                        <div className="table-scroll-container">
                            <table className="opd-collection-table">
                                <colgroup>
                                    <col style={{ width: '3%' }} />
                                    <col style={{ width: '6%' }} />
                                    <col style={{ width: '10%' }} />
                                    <col style={{ width: '5%' }} />
                                    <col style={{ width: '7%' }} />
                                    <col style={{ width: '6%' }} />
                                    <col style={{ width: '6%' }} />
                                    <col style={{ width: '6%' }} />
                                    <col style={{ width: '6%' }} />
                                    <col style={{ width: '6%' }} />
                                    <col style={{ width: '6%' }} />
                                    <col style={{ width: '6%' }} />
                                    <col style={{ width: '6%' }} />
                                    <col style={{ width: '6%' }} />
                                    <col style={{ width: '8%' }} />
                                    <col style={{ width: '7%' }} />
                                </colgroup>
                                <tbody>
                                    {filteredData.length === 0 ? (
                                        <tr>
                                            <td colSpan={16} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                                No collection Available for today
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredData.map((row, index) => {
                                            const duesFormatted = formatDues(row.dues);
                                            return (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{row.visitDate}</td>
                                                    <td>{row.name}</td>
                                                    <td>{row.isFollowUp}</td>
                                                    <td>{row.attendedBy}</td>
                                                    <td align="right">{formatCurrency(row.originalBilledAmount)}</td>
                                                    <td align="right">{formatCurrency(row.feesToCollect)}</td>
                                                    <td align="right">{formatCurrency(row.difference)}</td>
                                                    <td align="right">{formatCurrency(row.originalDiscount)}</td>
                                                    <td align="right">{formatCurrency(row.discount)}</td>
                                                    <td align="right">{formatCurrency(row.net)}</td>
                                                    <td align="right">{formatCurrency(row.feesCollected)}</td>
                                                    <td align="right" style={{ color: duesFormatted.isNegative ? 'red' : 'inherit' }}>
                                                        {duesFormatted.value}
                                                    </td>
                                                    <td align="right">{formatCurrency(row.adhocFees)}</td>
                                                    <td>{row.comment || '–'}</td>
                                                    <td>{row.paymentDescription || '–'}</td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {filteredData.length > 0 && (
                            <table className="opd-collection-table">
                                <colgroup>
                                    <col style={{ width: '3%' }} />
                                    <col style={{ width: '6%' }} />
                                    <col style={{ width: '10%' }} />
                                    <col style={{ width: '5%' }} />
                                    <col style={{ width: '7%' }} />
                                    <col style={{ width: '6%' }} />
                                    <col style={{ width: '6%' }} />
                                    <col style={{ width: '6%' }} />
                                    <col style={{ width: '6%' }} />
                                    <col style={{ width: '6%' }} />
                                    <col style={{ width: '6%' }} />
                                    <col style={{ width: '6%' }} />
                                    <col style={{ width: '6%' }} />
                                    <col style={{ width: '6%' }} />
                                    <col style={{ width: '8%' }} />
                                    <col style={{ width: '7%' }} />
                                </colgroup>
                                <tfoot>
                                    <tr className="total-row">
                                        {(() => {
                                            const totalDuesFormatted = formatDues(totals.totalDues);
                                            return (
                                                <>
                                                    <td colSpan={5}>Total</td>
                                                    <td align="right">{formatCurrency(totals.totalOriginalBilledAmount)}</td>
                                                    <td align="right">{formatCurrency(totals.totalFeesToCollect)}</td>
                                                    <td align="right">{formatCurrency(totals.totalDifference)}</td>
                                                    <td align="right">{formatCurrency(totals.totalOriginalDiscount)}</td>
                                                    <td align="right">{formatCurrency(totals.totalDiscount)}</td>
                                                    <td align="right">{formatCurrency(totals.totalNet)}</td>
                                                    <td align="right">{formatCurrency(totals.totalFeesCollected)}</td>
                                                    <td align="right" style={{ color: totalDuesFormatted.isNegative ? 'red' : 'inherit' }}>
                                                        {totalDuesFormatted.value}
                                                    </td>
                                                    <td align="right">{formatCurrency(totals.totalAdhocFees)}</td>
                                                    <td colSpan={2}></td>
                                                </>
                                            );
                                        })()}
                                    </tr>
                                </tfoot>
                            </table>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {filteredData.length > 0 && (
                    <div className="pagination-container">
                        <div className="pagination-info">
                                <span>
                                Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} records
                                </span>
                            <div className="page-size-selector">
                                <span>Show:</span>
                                <select
                                    className="page-size-select"
                                    value={pageSize}
                                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                                <span style={{ whiteSpace: 'nowrap' }}>per page</span>
                            </div>
                        </div>

                        <div className="pagination-controls">
                            <button
                                className="page-btn nav-btn"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                if (
                                    page === 1 ||
                                    page === totalPages ||
                                    (page >= currentPage - 1 && page <= currentPage + 1)
                                ) {
                                    return (
                                        <button
                                            key={page}
                                            className={`page-btn ${currentPage === page ? 'active' : ''}`}
                                            onClick={() => handlePageChange(page)}
                                        >
                                            {page}
                                        </button>
                                    );
                                } else if (
                                    page === currentPage - 2 ||
                                    page === currentPage + 2
                                ) {
                                    return <span key={page} className="page-btn" style={{ border: 'none', background: 'none' }}>...</span>;
                                }
                                return null;
                            })}

                            <button
                                className="page-btn nav-btn"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </LocalizationProvider>
    );
};

export default OPDDailyCollection;
 