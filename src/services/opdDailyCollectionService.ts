/**
 * Service for OPD Daily Collection API calls
 */

import axios from 'axios';
import { OPDDailyCollectionResponse, OPDDailyCollectionFilters } from '../types/opdDailyCollection';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const API_PATH = '/api/billing/opd-daily-collection';

/**
 * Format date to yyyy-MM-dd format for API
 */
const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Get OPD Daily Collection data for a date range
 */
export const getOPDDailyCollection = async (
    filters: OPDDailyCollectionFilters
): Promise<OPDDailyCollectionResponse> => {
    try {
        const params = {
            fromDate: formatDate(filters.fromDate),
            toDate: formatDate(filters.toDate),
            clinicId: filters.clinicId,
            doctorId: filters.doctorId || 'All',
            roleId: filters.roleId || 3,
            languageId: filters.languageId || 1,
        };

        console.log('=== API Call to OPD Daily Collection ===');
        console.log('URL:', `${API_BASE_URL}${API_PATH}`);
        console.log('Params:', params);

        const response = await axios.get<OPDDailyCollectionResponse>(
            `${API_BASE_URL}${API_PATH}`,
            { params }
        );

        console.log('API Response Status:', response.status);
        console.log('API Response Data:', response.data);

        return response.data;
    } catch (error) {
        console.error('Error in getOPDDailyCollection:', error);
        if (axios.isAxiosError(error)) {
            console.error('Axios error response:', error.response?.data);
            console.error('Axios error status:', error.response?.status);
        }
        throw error;
    }
};

/**
 * Get OPD Daily Collection data for today
 */
export const getOPDDailyCollectionToday = async (
    clinicId: string,
    doctorId?: string,
    roleId?: number,
    languageId?: number
): Promise<OPDDailyCollectionResponse> => {
    try {
        const params = {
            clinicId,
            doctorId: doctorId || 'All',
            roleId: roleId || 3,
            languageId: languageId || 1,
        };

        const response = await axios.get<OPDDailyCollectionResponse>(
            `${API_BASE_URL}${API_PATH}/today`,
            { params }
        );

        return response.data;
    } catch (error) {
        console.error('Error fetching today\'s OPD Daily Collection:', error);
        throw error;
    }
};

/**
 * Export OPD Daily Collection data to CSV
 */
export const exportToCSV = (data: any[], filename: string = 'opd-daily-collection.csv') => {
    if (!data || data.length === 0) {
        console.warn('No data to export');
        return;
    }

    // Define headers
    const headers = [
        'Visit Date',
        'Patient Name',
        'New/Follow up',
        'Provider',
        'Original (O)',
        'Billed (B)',
        'Difference (O-B)',
        'Original Discount (OD)',
        'Discount (D)',
        'Net (B-D)',
        'Collected (C)',
        'Dues (B-D-C)',
        'Adhoc (A)',
        'Reason',
        'Payment Method',
    ];

    // Map data to CSV rows
    const rows = data.map((record) => [
        record.visitDate || '',
        record.name || '',
        record.isFollowUp || '',
        record.attendedBy || '',
        record.originalBilledAmount || '0',
        record.feesToCollect || '0',
        record.difference || '0',
        record.originalDiscount || '0',
        record.discount || '0',
        record.net || '0',
        record.feesCollected || '0',
        record.dues || '0',
        record.adhocFees || '0',
        record.comment || '',
        record.paymentDescription || '',
    ]);

    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
