import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Grid,
    CircularProgress,
    Alert,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Popover,
} from '@mui/material';
import { CalendarToday } from '@mui/icons-material';
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
import {
    OPDDailyCollectionRecord,
    OPDDailyCollectionTotals,
} from '../types/opdDailyCollection';
import { useAppSelector } from '../store/hooks';
import { useSession } from '../store/hooks/useSession';
import { doctorService } from '../services/doctorService';
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

    // Get session data
    const { clinicId: sessionClinicId } = useSession();
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

    // Fetch doctors list on mount (only for receptionist)
    useEffect(() => {
        if (isReceptionist) {
            fetchDoctors();
        }
    }, [isReceptionist, clinicId]);

    // Fetch doctors from API
    const fetchDoctors = async () => {
        if (!clinicId) return;

        setLoadingDoctors(true);
        try {
            const response = await fetch(`http://localhost:8080/api/doctors/all?languageId=${languageId}&clinicId=${clinicId}`);
            const result = await response.json();
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

    // Pagination calculations
    const totalPages = Math.ceil(data.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentData = data.slice(startIndex, endIndex);

    // Calculate totals (from all data, not just current page)
    const totals = useMemo<OPDDailyCollectionTotals>(() => {
        return data.reduce(
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
    }, [data]);

    // Fetch data on component mount
    useEffect(() => {
        handleSearch();
    }, []);

    // Handle search with API
    const handleSearch = async () => {
        if (!clinicId) {
            setError('Clinic ID is required');
            return;
        }

        setLoading(true);
        setError(null);
        setCurrentPage(1); // Reset to first page on search

        try {
            // Use date range API when dates are selected, otherwise use today endpoint
            const isToday = fromDate.toDateString() === new Date().toDateString() &&
                toDate.toDateString() === new Date().toDateString();

            let response;
            if (isToday) {
                // Use today endpoint for today's date
                response = await getOPDDailyCollectionToday(
                    clinicId,
                    isReceptionist ? doctorId : 'All',
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
                    doctorId: isReceptionist ? doctorId : 'All',
                    roleId,
                    languageId,
                });
                console.log('=== OPD Daily Collection Search (API - Date Range) ===');
            }

            console.log('Doctor ID:', doctorId);
            console.log('From Date:', fromDate);
            console.log('To Date:', toDate);
            console.log('Clinic ID:', clinicId);
            console.log('API Response:', response);

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

    // Handle export to Excel/CSV
    const handleExport = () => {
        exportToCSV(data, `opd-daily-collection-${new Date().toISOString().split('T')[0]}.csv`);
    };

    // Handle print
    const handlePrint = () => {
        window.print();
    };

    // Format currency
    const formatCurrency = (value: number | null | undefined): string => {
        if (value === null || value === undefined) return '0.00';
        return value.toFixed(2);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
                {/* Header */}
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                    OPD - Daily Collection
                </Typography>

                {/* Filter Section */}
                <Paper elevation={0} sx={{ p: 2, mb: 2, backgroundColor: 'white' }}>
                    <Grid container spacing={2} alignItems="center">
                        {isReceptionist && (
                            <Grid item xs={12} sm={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Provider Name</InputLabel>
                                    <Select
                                        value={doctorId}
                                        onChange={(e) => {
                                            setDoctorId(e.target.value);
                                            handleSearch();
                                        }}
                                        label="Provider Name"
                                    >
                                        <MenuItem value="All">All</MenuItem>
                                        {doctors.map((doctor) => (
                                            <MenuItem key={doctor.doctorId} value={doctor.doctorId}>
                                                {doctor.doctorName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}
                        <Grid item xs={12} sm={isReceptionist ? 1 : 2}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <IconButton
                                    onClick={(e) => {
                                        setCalendarAnchor(e.currentTarget);
                                        setSelectionMode('from'); // Reset to 'from' when opening
                                    }}
                                    size="medium"
                                    color="primary"
                                    sx={{
                                        border: '1px solid #1976d2',
                                        borderRadius: '4px',
                                        padding: '8px',
                                        minWidth: '40px',
                                        minHeight: '40px',
                                        backgroundColor: '#ffffff',
                                        '&:hover': {
                                            backgroundColor: '#e3f2fd',
                                            borderColor: '#1565c0',
                                        },
                                        '& .MuiSvgIcon-root': {
                                            color: '#1976d2',
                                        }
                                    }}
                                    title="Select Date Range"
                                >
                                    <CalendarToday
                                        sx={{
                                            fontSize: '20px',
                                        }}
                                    />
                                </IconButton>
                            </Box>
                            <Popover
                                open={Boolean(calendarAnchor)}
                                anchorEl={calendarAnchor}
                                onClose={() => setCalendarAnchor(null)}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                            >
                                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', width: '320px' }}>
                                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle2" sx={{ mb: 0.5, fontSize: '0.75rem', fontWeight: 'bold' }}>From</Typography>
                                            <Box
                                                sx={{
                                                    p: 1,
                                                    border: '1px solid',
                                                    borderColor: selectionMode === 'from' ? 'primary.main' : 'divider',
                                                    borderRadius: 1,
                                                    cursor: 'pointer',
                                                    backgroundColor: selectionMode === 'from' ? 'primary.light' : 'transparent',
                                                    color: 'black',
                                                    opacity: selectionMode === 'from' ? 0.9 : 1
                                                }}
                                                onClick={() => setSelectionMode('from')}
                                            >
                                                <Typography variant="body2" sx={{ color: 'black' }}>{fromDate ? format(fromDate, 'dd MMM yyyy') : 'Select Date'}</Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle2" sx={{ mb: 0.5, fontSize: '0.75rem', fontWeight: 'bold' }}>To</Typography>
                                            <Box
                                                sx={{
                                                    p: 1,
                                                    border: '1px solid',
                                                    borderColor: selectionMode === 'to' ? 'primary.main' : 'divider',
                                                    borderRadius: 1,
                                                    cursor: 'pointer',
                                                    backgroundColor: selectionMode === 'to' ? 'primary.light' : 'transparent',
                                                    color: 'black',
                                                    opacity: selectionMode === 'to' ? 0.9 : 1
                                                }}
                                                onClick={() => setSelectionMode('to')}
                                            >
                                                <Typography variant="body2" sx={{ color: 'black' }}>{toDate ? format(toDate, 'dd MMM yyyy') : 'Select Date'}</Typography>
                                            </Box>
                                        </Box>
                                    </Box>
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
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button
                                            variant="contained"
                                            onClick={() => {
                                                setCalendarAnchor(null);
                                                handleSearch();
                                            }}
                                            size="small"
                                        >
                                            Apply
                                        </Button>
                                    </Box>
                                </Box>
                            </Popover>
                        </Grid>
                        <Grid item xs={12} sm={isReceptionist ? 5 : 6}>
                            {isReceptionist && (
                                <Typography variant="caption" sx={{ fontStyle: 'italic', color: '#999' }}>
                                    Note: Only completed visits are shown on selection of provider
                                </Typography>
                            )}
                        </Grid>
                        <Grid item xs={12} sm={2} sx={{ textAlign: 'right' }}>
                            <Button
                                variant="contained"
                                onClick={handleExport}
                                disabled={loading || data.length === 0}
                                sx={{ mr: 1, textTransform: 'none' }}
                            >
                                Download Excel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handlePrint}
                                disabled={loading || data.length === 0}
                                sx={{ textTransform: 'none' }}
                            >
                                Print
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Error Alert */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {/* Data Table */}
                <TableContainer component={Paper} elevation={0}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Table size="small" sx={{ minWidth: 650 }}>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#4472C4' }}>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '11px', padding: '8px' }}>Sr.</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '11px', padding: '8px' }}>Visit Time</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '11px', padding: '8px' }}>Patient Name</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '11px', padding: '8px' }}>New / Follow up</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '11px', padding: '8px' }}>Provider</TableCell>
                                    <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '11px', padding: '8px' }}>Original (O)</TableCell>
                                    <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '11px', padding: '8px' }}>Billed (B)</TableCell>
                                    <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '11px', padding: '8px' }}>Difference (O-B)</TableCell>
                                    <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '11px', padding: '8px' }}>Original Discount (OD)</TableCell>
                                    <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '11px', padding: '8px' }}>Discount (D)</TableCell>
                                    <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '11px', padding: '8px' }}>Net (B-D)</TableCell>
                                    <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '11px', padding: '8px' }}>Collected (C)</TableCell>
                                    <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '11px', padding: '8px' }}>Dues (B-D-C)</TableCell>
                                    <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '11px', padding: '8px' }}>Adhoc (A)</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '11px', padding: '8px' }}>Reason</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '11px', padding: '8px' }}>Pay Method</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {currentData.map((row, index) => (
                                    <TableRow
                                        key={startIndex + index}
                                        sx={{
                                            backgroundColor: index % 2 === 0 ? 'white' : '#f9f9f9',
                                            '&:hover': { backgroundColor: '#f0f0f0' },
                                        }}
                                    >
                                        <TableCell sx={{ padding: '6px 8px', fontSize: '12px' }}>{startIndex + index + 1}</TableCell>
                                        <TableCell sx={{ padding: '6px 8px', fontSize: '12px' }}>{row.visitDate}</TableCell>
                                        <TableCell sx={{ padding: '6px 8px', fontSize: '12px' }}>{row.name}</TableCell>
                                        <TableCell sx={{ padding: '6px 8px', fontSize: '12px' }}>{row.isFollowUp}</TableCell>
                                        <TableCell sx={{ padding: '6px 8px', fontSize: '12px' }}>{row.attendedBy}</TableCell>
                                        <TableCell align="right" sx={{ padding: '6px 8px', fontSize: '12px' }}>{formatCurrency(row.originalBilledAmount)}</TableCell>
                                        <TableCell align="right" sx={{ padding: '6px 8px', fontSize: '12px' }}>{formatCurrency(row.feesToCollect)}</TableCell>
                                        <TableCell align="right" sx={{ padding: '6px 8px', fontSize: '12px' }}>{formatCurrency(row.difference)}</TableCell>
                                        <TableCell align="right" sx={{ padding: '6px 8px', fontSize: '12px' }}>{formatCurrency(row.originalDiscount)}</TableCell>
                                        <TableCell align="right" sx={{ padding: '6px 8px', fontSize: '12px' }}>{formatCurrency(row.discount)}</TableCell>
                                        <TableCell align="right" sx={{ padding: '6px 8px', fontSize: '12px' }}>{formatCurrency(row.net)}</TableCell>
                                        <TableCell align="right" sx={{ padding: '6px 8px', fontSize: '12px' }}>{formatCurrency(row.feesCollected)}</TableCell>
                                        <TableCell align="right" sx={{ padding: '6px 8px', fontSize: '12px' }}>{formatCurrency(row.dues)}</TableCell>
                                        <TableCell align="right" sx={{ padding: '6px 8px', fontSize: '12px' }}>{formatCurrency(row.adhocFees)}</TableCell>
                                        <TableCell sx={{ padding: '6px 8px', fontSize: '12px' }}>{row.comment || '–'}</TableCell>
                                        <TableCell sx={{ padding: '6px 8px', fontSize: '12px' }}>{row.paymentDescription || '–'}</TableCell>
                                    </TableRow>
                                ))}
                                {/* Total Row */}
                                {data.length > 0 && (
                                    <TableRow sx={{ backgroundColor: '#e8eaf6', fontWeight: 'bold' }}>
                                        <TableCell colSpan={5} sx={{ padding: '8px', fontSize: '13px', fontWeight: 'bold' }}>Total</TableCell>
                                        <TableCell align="right" sx={{ padding: '8px', fontSize: '13px', fontWeight: 'bold' }}>{formatCurrency(totals.totalOriginalBilledAmount)}</TableCell>
                                        <TableCell align="right" sx={{ padding: '8px', fontSize: '13px', fontWeight: 'bold' }}>{formatCurrency(totals.totalFeesToCollect)}</TableCell>
                                        <TableCell align="right" sx={{ padding: '8px', fontSize: '13px', fontWeight: 'bold' }}>{formatCurrency(totals.totalDifference)}</TableCell>
                                        <TableCell align="right" sx={{ padding: '8px', fontSize: '13px', fontWeight: 'bold' }}>{formatCurrency(totals.totalOriginalDiscount)}</TableCell>
                                        <TableCell align="right" sx={{ padding: '8px', fontSize: '13px', fontWeight: 'bold' }}>{formatCurrency(totals.totalDiscount)}</TableCell>
                                        <TableCell align="right" sx={{ padding: '8px', fontSize: '13px', fontWeight: 'bold' }}>{formatCurrency(totals.totalNet)}</TableCell>
                                        <TableCell align="right" sx={{ padding: '8px', fontSize: '13px', fontWeight: 'bold' }}>{formatCurrency(totals.totalFeesCollected)}</TableCell>
                                        <TableCell align="right" sx={{ padding: '8px', fontSize: '13px', fontWeight: 'bold' }}>{formatCurrency(totals.totalDues)}</TableCell>
                                        <TableCell align="right" sx={{ padding: '8px', fontSize: '13px', fontWeight: 'bold' }}>{formatCurrency(totals.totalAdhocFees)}</TableCell>
                                        <TableCell colSpan={2}></TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </TableContainer>

                {/* Pagination */}
                {data.length > 0 && (
                    <div className="pagination-container" style={{ marginTop: '20px' }}>
                        <div className="pagination-info">
                            <span>
                                Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} records
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
            </Box>

            {/* Print Styles */}
            <style>
                {`
          @media print {
            .MuiButton-root {
              display: none !important;
            }
            .pagination-container {
              display: none !important;
            }
          }
        `}
            </style>
        </LocalizationProvider>
    );
};

export default OPDDailyCollection;
