import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { List, CreditCard, MoreVert, Add as AddIcon, Save, Delete, Info, FastForward, Close, ChatBubbleOutline, Phone, SwapHoriz } from "@mui/icons-material";
import { appointmentService, Appointment } from "../services/appointmentService";
import { patientService, Patient } from "../services/patientService";
import { useNavigate, useLocation } from "react-router-dom";
import AddPatientPage from "./AddPatientPage";

type AppointmentRow = {
    sr: number;
    patient: string;
    patientId: number;
    age: number;
    contact: string;
    time: string;
    provider: string;
    online: string;
    statusColor: string;
    status: string;
    lastOpd: string;
    labs: string;
    actions: boolean;
};


export default function AppointmentTable() {
    const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
    const [openStatusIndex, setOpenStatusIndex] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [searchResults, setSearchResults] = useState<Patient[]>([]);
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const [selectedPatients, setSelectedPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchError, setSearchError] = useState<string>("");
    const [activeView, setActiveView] = useState<'list' | 'card'>('list');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const searchRef = useRef<HTMLDivElement>(null);
    const filterBtnRef = useRef<HTMLButtonElement>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [showAddPatient, setShowAddPatient] = useState<boolean>(false);
    const [openActionIndex, setOpenActionIndex] = useState<number | null>(null);
    const [actionMenuPosition, setActionMenuPosition] = useState<{ top: number; left: number } | null>(null);
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [filterName, setFilterName] = useState<string>("");
    const [filterContact, setFilterContact] = useState<string>("");
    const [filterStatus, setFilterStatus] = useState<string>("");
    const [filterSize, setFilterSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

    // Convert Patient data to table format
    const convertToTableFormat = (patients: Patient[]): AppointmentRow[] => {
        return patients.map((patient, index) => {
            // Prefer backend-provided age_given; fallback to DOB-derived age
            const dobMs = patient.date_of_birth ? new Date(patient.date_of_birth).getTime() : NaN;
            const dobAge = Number.isFinite(dobMs)
                ? Math.floor((Date.now() - dobMs) / (365.25 * 24 * 60 * 60 * 1000))
                : 0;
            const resolvedAge = typeof (patient as any).age_given === 'number' && (patient as any).age_given > 0
                ? (patient as any).age_given
                : dobAge;
            
            return {
                sr: appointments.length + index + 1,
                patientId: patient.id,
                patient: `${patient.first_name} ${patient.last_name}`,
                age: resolvedAge,
                contact: patient.mobile_1 || "",
                time: new Date().toLocaleString(), // Current time as placeholder
                provider: "Dr.Tongaonkar", // Placeholder - you might want to get this from another API
                online: "No", // Default value
                status: 'WAITING',
                statusColor: getStatusColor('WAITING'),
                lastOpd: "27 Sep 2025", // Placeholder
                labs: "No Reports", // Placeholder
                actions: true
            };
        });
    };

    // Get status color mapping for appointment workflow
    const getStatusColor = (status: string): string => {
        switch ((status || '').toUpperCase()) {
            case 'WAITING': return 'bg-primary'; // blue
            case 'WITH DOCTOR': return 'bg-success'; // green
            case 'CHECK OUT': return 'bg-warning'; // orange
            case 'COMPLETED': return 'bg-dark'; // black
            case 'SAVED': return 'bg-danger'; // red
            case 'ON CALL': return 'bg-info';
            default: return 'bg-secondary';
        }
    };

    // Search for patients using backend API
    const searchPatients = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            setShowDropdown(false);
            setSearchError("");
            return;
        }

        try {
            setLoading(true);
            setSearchError("");
            
            const response = await patientService.searchPatients({
                query: query,
                status: 'all',
                page: 0,
                size: 20
            });
            
            setSearchResults(response.patients);
            setShowDropdown(response.patients.length > 0);
        } catch (error: any) {
            console.error("Error searching patients:", error);
            setSearchResults([]);
            setShowDropdown(false);
            setSearchError(error.message || "Failed to search patients");
        } finally {
            setLoading(false);
        }
    };

    // Handle search input change
    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        searchPatients(value);
    };

    // Handle patient selection from dropdown
    const handlePatientSelect = (patient: Patient) => {
        const isAlreadySelected = selectedPatients.some(p => p.id === patient.id);
        
        if (!isAlreadySelected) {
            setSelectedPatients(prev => [...prev, patient]);
        }
        
        setSearchTerm("");
        setSearchResults([]);
        setShowDropdown(false);
    };

    // Remove selected patient
    const removeSelectedPatient = (patientId: number) => {
        setSelectedPatients(prev => prev.filter(p => p.id !== patientId));
    };

    // Book appointment - add selected patients to table
    const handleBookAppointment = () => {
        if (selectedPatients.length === 0) {
            alert("Please select at least one patient to book an appointment.");
            return;
        }

        const newAppointments = convertToTableFormat(selectedPatients);
        setAppointments(prev => [...prev, ...newAppointments]);
        setSelectedPatients([]);
        alert(`Successfully booked ${newAppointments.length} appointment(s)!`);
    };

    // Toggle view functions
    const handleListClick = () => {
        setActiveView('list');
    };

    const handleCardClick = () => {
        setActiveView('card');
    };

    // Filters and Pagination
    const filteredAppointments = appointments.filter(a => {
        const nameOk = filterName ? a.patient.toLowerCase().includes(filterName.toLowerCase()) : true;
        const contactOk = filterContact ? (a.contact || '').toString().includes(filterContact) : true;
        const statusOk = filterStatus ? (a.status || '').toUpperCase() === filterStatus.toUpperCase() : true;
        return nameOk && contactOk && statusOk;
    });
    const totalPages = Math.ceil(filteredAppointments.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentAppointments = filteredAppointments.slice(startIndex, endIndex);
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setCurrentPage(1); // Reset to first page when changing page size
    };

    // Reset pagination when appointments change
    useEffect(() => {
        setCurrentPage(1);
    }, [appointments.length]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
            if (openStatusIndex !== null) {
                const target = event.target as HTMLElement;
                const isStatusMenu = target.closest('.status-menu');
                if (!isStatusMenu) {
                    setOpenStatusIndex(null);
                    setMenuPosition(null);
                }
            }
            if (openActionIndex !== null) {
                const target = event.target as HTMLElement;
                const isActionMenu = target.closest('.action-menu');
                if (!isActionMenu) {
                    setOpenActionIndex(null);
                    setActionMenuPosition(null);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Measure Filter button to size filter inputs the same
    useEffect(() => {
        const measure = () => {
            if (filterBtnRef.current) {
                const rect = filterBtnRef.current.getBoundingClientRect();
                setFilterSize({ width: Math.round(rect.width), height: Math.round(rect.height) });
            }
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, []);

    const handleOnlineChange = (index: number, value: string) => {
        const updated = [...appointments];
        updated[index].online = value;
        setAppointments(updated);
    };

    const handleProviderChange = (index: number, value: string) => {
        const updated = [...appointments];
        updated[index].provider = value;
        setAppointments(updated);
    };

    const extractTime = (dateTimeStr: string): string => {
        const date = new Date(dateTimeStr);
        const hh = String(date.getHours()).padStart(2, "0");
        const mm = String(date.getMinutes()).padStart(2, "0");
        return `${hh}:${mm}`;
    };

    const formatYearToTwoDigits = (dateLabel: string): string => {
        if (!dateLabel) return dateLabel;
        const parts = dateLabel.trim().split(/\s+/);
        if (parts.length >= 3) {
            const year = parts[parts.length - 1];
            if (/^\d{4}$/.test(year)) {
                parts[parts.length - 1] = year.slice(2);
                return parts.join(' ');
            }
        }
        return dateLabel;
    };

    const buttonStyle = {
        backgroundColor: "#1E88E5",
        color: "white",
        borderRadius: "6px",
        border: "2px solid #1E88E5",
        fontFamily: "'Roboto', sans-serif",
        fontWeight: 500,
        height: "38px"
    };

    return (
        <div className="container-fluid mt-3" style={{ fontFamily: "'Roboto', sans-serif" }}>
            <style>{`
        /* Let table size to content, not force 100% */
        // .table.appointments-table { table-layout: auto !important; width: auto !important; max-width: 100%; }
         .table.appointments-table { table-layout: auto !important; width: 100%;}
        /* Keep cells on a single line so content determines width */
        .appointments-table th, .appointments-table td { white-space: wrap; }
        /* Inputs inside cells shouldn't stretch the column */
        .appointments-table .form-control, .appointments-table .form-control-sm { width: auto; min-width: 10px; display: inline-block; }
        // // /* Compact table to fit ~10 rows */
        // .appointments-table thead th { padding: 6px 8px !important; font-size: 0.9rem; line-height: 1.1; }
        // .appointments-table tbody td { padding: 6px 8px !important; font-size: 0.9rem; line-height: 1.1; }
        // .appointments-table .btn.btn-sm { padding: 2px 6px !important; height: 28px; line-height: 1; }
        // .appointments-table .form-control-sm { padding: 2px 6px !important; height: 28px; }
        // .appointments-table .form-check-input { width: 16px; height: 16px; }
        /* Force a narrow Online column */
        .appointments-table th.online-col { width: 10px; }
        .appointments-table td.online-cell { width: 10px; }
        .appointments-table td.online-cell .form-control { width: 90px !important; min-width: 90px !important; }
        /* Column widths: Last Visit takes 20%, others auto to utilize remaining */
        .appointments-table th.last-col, .appointments-table td.last-col { width: 15%; }
        .appointments-table th.sr-col, .appointments-table td.sr-col { width: auto; }
        .appointments-table th.name-col, .appointments-table td.name-col { width: auto; }
        .appointments-table th.age-col, .appointments-table td.age-col { width: auto; }
        .appointments-table th.contact-col, .appointments-table td.contact-col { width: auto; }
        .appointments-table th.time-col, .appointments-table td.time-col { width: auto; }
        .appointments-table th.provider-col, .appointments-table td.provider-col { width: auto; }
        .appointments-table th.status-col, .appointments-table td.status-col { width: auto; }
        /* Labs column removed */
        .appointments-table th.action-col, .appointments-table td.action-col { width: auto; }
        /* Borderless table */
        .appointments-table, .appointments-table th, .appointments-table td { border: 0 !important; }
        .appointments-table tbody tr + tr { border-top: 0 !important; }
        /* Status menu */
        .status-menu { position: absolute; background: #fff; border: 1px solid #e0e0e0; border-radius: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.08); padding: 6px 0; z-index: 10; }
        .status-menu button { background: transparent; border: 0; padding: 6px 12px; width: 100%; text-align: left; font-size: 0.9rem; }
        .status-menu button:hover { background: #f5f5f5; }
        /* Compact layout to fit 10 rows without scroll on 1080p */
        .appointments-table thead th { padding: 4px 8px !important; font-size: 0.9rem; line-height: 1.1; }
        .appointments-table tbody td { padding: 4px 8px !important; font-size: 0.9rem; line-height: 1.1; }
        .appointments-table .btn.btn-sm { padding: 2px 6px !important; height: 28px; line-height: 1; }
        .appointments-table .form-control-sm { padding: 2px 6px !important; height: 28px; }
        .appointments-table .form-check-input { width: 14px; height: 14px; }
        .appointments-table .rounded-circle { width: 12px !important; height: 12px !important; }
        .appointments-table .content-gap-small { margin-bottom: 8px !important; }
        
        /* Card view styles - CRM-like */
        .card-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
        .appointment-card {
            background: #FFFFFF;
            border-radius: 10px;
            padding: 12px;
            margin-bottom: 16px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.10);
            position: relative;
            min-height: 150px;
        }
        .appointment-card:before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 10px;
            box-shadow: inset 0 0 0 2px #90CAF9;
            pointer-events: none;
        }
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
        }
        .patient-name {
            font-size: 1rem;
            font-weight: 600;
            color: #000000;
            font-family: 'Roboto', sans-serif;
        }
        .price-text { font-weight: 700; color: #2E7D32; font-family: 'Roboto', sans-serif; }
        .subtitle { color: #6b7280; margin-bottom: 8px; font-size: 0.85rem; font-family: 'Roboto', sans-serif; }
        .card-details { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 12px; margin-bottom: 10px; }
        .kv { display: flex; gap: 6px; align-items: center; min-width: 0; }
        .kv .k { color: #607D8B; font-size: 0.76rem; }
        .kv .v { color: #111827; font-size: 0.8rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .crm-actions { display: grid; grid-template-columns: repeat(4, 32px); gap: 8px; }
        .crm-btn { width: 36px; height: 36px; border-radius: 6px; background: #ECEFF1; display: inline-flex; align-items: center; justify-content: center; color: #607D8B; border: 1px solid #CFD8DC; }
        .crm-btn:hover { background: #E3F2FD; color: #1565C0; border-color: #90CAF9; }
        .status-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            display: inline-block;
            margin-right: 8px;
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
            gap: 5px;
        }
        .page-btn {
            padding: 6px 12px;
            border: 1px solid #ddd;
            background: white;
            color: #333;
            cursor: pointer;
            border-radius: 4px;
            font-size: 0.9rem;
            transition: all 0.2s ease;
        }
        .page-btn:hover:not(:disabled) {
            background: #f5f5f5;
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
        /* Prev/Next buttons as black */
        .nav-btn {
            background: #000;
            color: #fff;
            border-color: #000;
        }
        .nav-btn:hover:not(:disabled) {
            background: #111;
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
        
        /* Responsive adjustments for d-flex mb-3 align-items-center */
        @media (max-width: 991px) {
            .d-flex.mb-3.align-items-center {
                flex-direction: column;
                align-items: stretch;
                gap: 15px;
            }
            
            /* Search input becomes full width */
            .d-flex.mb-3.align-items-center .position-relative {
                width: 100%;
            }
            
            .d-flex.mb-3.align-items-center .position-relative input {
                width: 100% !important;
                min-width: auto !important;
            }
            
            /* Form selects become full width */
            .d-flex.mb-3.align-items-center .form-select {
                width: 100% !important;
                height: 38px !important;
            }
            
            /* Buttons stack vertically */
            .d-flex.mb-3.align-items-center .btn {
                width: 100%;
                margin-bottom: 8px;
            }
            
            /* List/Card toggle remains centered and properly sized */
            .d-flex.mb-3.align-items-center .d-flex.align-items-center.ms-auto {
                margin-left: 0 !important;
                align-self: center;
                width: auto !important;
                height: 38px !important;
            }
            
            .d-flex.mb-3.align-items-center .d-flex.align-items-center.ms-auto .btn {
                width: auto !important;
                margin-bottom: 0 !important;
            }
        }
        
        @media (max-width: 768px) {
            .d-flex.mb-3.align-items-center {
                gap: 12px;
            }
            
            /* Form selects maintain 30% width and 30px height on mobile */
            .d-flex.mb-3.align-items-center .form-select {
                width: 100% !important;
                height: auto !important;
            }
        }
        
        @media (max-width: 576px) {
            .d-flex.mb-3.align-items-center {
                gap: 10px;
            }
            
            /* Form selects maintain 30% width and 30px height on small mobile */
            .d-flex.mb-3.align-items-center .form-select {
                width: 100% !important;
                height: auto !important;
            }
        }
      `}</style>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Appointments</h2>
                <div className="d-flex align-items-center" style={{ fontSize: '0.85rem', color: '#455A64', gap: '8px', whiteSpace: 'nowrap' }}>
                    <span className="me-1"><span className="rounded-circle d-inline-block bg-primary" style={{ width: 10, height: 10 }}></span> 10 </span>
                    |
                    <span className="mx-1"><span className="rounded-circle d-inline-block bg-success" style={{ width: 10, height: 10 }}></span> 0 </span>
                    |
                    <span className="mx-1"><span className="rounded-circle d-inline-block bg-info" style={{ width: 10, height: 10 }}></span> 0 </span>
                    |
                    <span className="mx-1"><span className="rounded-circle d-inline-block bg-warning" style={{ width: 10, height: 10 }}></span> 0 </span>
                    |
                    <span className="mx-1"><span className="rounded-circle d-inline-block bg-dark" style={{ width: 10, height: 10 }}></span> 0 </span>
                    |
                    <span className="ms-1"><span className="rounded-circle d-inline-block bg-danger" style={{ width: 10, height: 10 }}></span> 0 </span>
                </div>
            </div>

            {/* Primary row with controls will include CTAs */}

            {/* Search + Filter */}
            <div className="d-flex mb-3 align-items-center" style={{ gap: '8px' }}>
                <div className="position-relative" ref={searchRef}>
                    <input
                        type="text"
                        placeholder="Search with Patient ID / Patient Name / Contact Number"
                        className="form-control"
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        style={{ borderWidth: "2px", height: "38px", fontFamily: "'Roboto', sans-serif", fontWeight: 500, minWidth: "520px", width: "520px" }}
                    />
                    
                    {/* Search Dropdown */}
                    {showDropdown && (
                        <div 
                            className="position-absolute w-100 bg-white border border-secondary rounded shadow-lg"
                            style={{ 
                                top: "100%", 
                                left: 0, 
                                zIndex: 1000, 
                                maxHeight: "300px", 
                                overflowY: "auto",
                                fontFamily: "'Roboto', sans-serif"
                            }}
                        >
                            {loading ? (
                                <div className="p-3 text-center">
                                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <span className="ms-2">Searching...</span>
                                </div>
                            ) : searchResults.length > 0 ? (
                                searchResults.map((patient) => {
                                    const age = patient.date_of_birth ? 
                                        Math.floor((new Date().getTime() - new Date(patient.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0;
                                    
                                    return (
                                        <div
                                            key={patient.id}
                                            className="p-3 border-bottom cursor-pointer"
                                            style={{ cursor: "pointer" }}
                                            onClick={() => handlePatientSelect(patient)}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
                                        >
                                            <div className="fw-bold">{patient.first_name} {patient.last_name}</div>
                                            <div className="text-muted small">
                                                ID: {patient.id} | Folder: {patient.folder_no} | Age: {age} | Contact: {patient.mobile_1}
                                            </div>
                                            <div className="text-muted small">
                                                Status: {patient.registration_status} | Registered: {new Date(patient.date_of_registration).toLocaleDateString()}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : searchError ? (
                                <div className="p-3 text-danger text-center">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    {searchError}
                                </div>
                            ) : (
                                <div className="p-3 text-muted text-center">No patients found</div>
                            )}
                        </div>
                    )}
                </div>

                {/* 2) Provider (disabled preset) */}
                <select
                    className="form-select"
                    disabled
                    value={"Dr. Tongaonkar - Medicine"}
                    style={{ height: 38, width: 255, color: '#212121', backgroundColor: '#ECEFF1', padding: '6px 12px', lineHeight: '1.5', fontSize: '1rem', flex: '0 0 30px' }}
                >
                    <option>Dr. Tongaonkar - Medicine</option>
                </select>

                {/* 3) Book and 4) Add buttons */}
                <button 
                    className="btn"
                    style={{ ...buttonStyle }}
                    onClick={handleBookAppointment}
                >
                    Book Appointment {selectedPatients.length > 0 && `(${selectedPatients.length})`}
                </button>
                <button 
                    className="btn" 
                    style={buttonStyle}
                    onClick={() => setShowAddPatient(true)}
                >
                    Add Patient
                </button>

                {/* 5) Status dropdown */}
                <select
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{ height: '38px', width: '160px', color: filterStatus ? '#212121' : '#6c757d', padding: '6px 12px', lineHeight: '1.5', fontSize: '1rem' }}
                >
                    <option value="">Select Status</option>
                    <option value="WAITING">Waiting</option>
                    <option value="WITH DOCTOR">With Doctor</option>
                    <option value="CHECK OUT">Check Out</option>
                    <option value="ON CALL">On Call</option>
                    <option value="SAVED">Saved</option>
                    <option value="COMPLETED">Completed</option>
                    
                </select>

                {/* 6) List/Card toggle */}
                <div 
                    className="d-flex align-items-center ms-auto"
                    style={{
                        height: "38px",
                        backgroundColor: "#607D8B",
                        borderColor: "#B7B7B7",
                        color: "#fff",
                        fontFamily: "'Roboto', sans-serif",
                        borderRadius: "6px",
                        border: "1px solid #B7B7B7",
                        overflow: "hidden"
                    }}
                >
                    <button
                        className="btn d-flex align-items-center justify-content-center"
                        style={{
                            height: "100%",
                            backgroundColor: activeView === 'list' ? "#4CAF50" : "transparent",
                            border: "none",
                            color: "#fff",
                            fontFamily: "'Roboto', sans-serif",
                            opacity: activeView === 'list' ? 0.7 : 1,
                            cursor: activeView === 'list' ? 'not-allowed' : 'pointer',
                            padding: "0 12px",
                            minWidth: "40px"
                        }}
                        onClick={handleListClick}
                        disabled={activeView === 'list'}
                        title="List View"
                    >
                        <List />
                    </button>
                    <div style={{ width: '1px', height: '100%', backgroundColor: '#fff', opacity: 0.7 }} />
                    <button
                        className="btn d-flex align-items-center justify-content-center"
                        style={{
                            height: "100%",
                            backgroundColor: activeView === 'card' ? "#4CAF50" : "transparent",
                            border: "none",
                            color: "#fff",
                            fontFamily: "'Roboto', sans-serif",
                            opacity: activeView === 'card' ? 0.7 : 1,
                            cursor: activeView === 'card' ? 'not-allowed' : 'pointer',
                            padding: "0 12px",
                            minWidth: "40px"
                        }}
                        onClick={handleCardClick}
                        disabled={activeView === 'card'}
                        title="Card View"
                    >
                        <CreditCard />
                    </button>
                </div>
            </div>

            {/* No extra filter row; status filter is inline above */}

            {/* Selected Patients */}
            {selectedPatients.length > 0 && (
                <div className="mb-3">
                    <h6 className="mb-2">Selected Patients ({selectedPatients.length}):</h6>
                    <div className="d-flex flex-wrap gap-2">
                        {selectedPatients.map((patient) => (
                            <div
                                key={patient.id}
                                className="badge bg-primary d-flex align-items-center"
                                style={{ fontSize: "0.9rem", padding: "8px 12px" }}
                            >
                                {patient.first_name} {patient.last_name} (ID: {patient.id})
                                <button
                                    type="button"
                                    className="btn-close btn-close-white ms-2"
                                    style={{ fontSize: "0.7rem" }}
                                    onClick={() => removeSelectedPatient(patient.id)}
                                    aria-label="Remove"
                                ></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Content Area - List or Card View */}
            {appointments.length === 0 ? (
                <div className="text-center py-5">
                    <div className="mb-3">
                        <i className="fas fa-calendar-plus" style={{ fontSize: "3rem", color: "#6c757d" }}></i>
                    </div>
                    <h5 className="text-muted">No Appointments Booked</h5>
                    <p className="text-muted">Search for patients and click "Book Appointment" to add them to your schedule.</p>
                </div>
            ) : (
                <>
                    {/* List View */}
                    {activeView === 'list' && (
                        <div className="table-responsive">
                            <table className="table table-borderless align-middle appointments-table">
                                <thead>
                                    <tr>
                                        <th className="sr-col">Sr.</th>
                                        <th className="name-col">Patient Name</th>
                                        <th className="age-col text-start">Age</th>
                                        <th className="contact-col text-start">Contact</th>
                                        <th className="time-col text-start">Time</th>
                                        <th className="provider-col text-start">Provider</th>
                                        <th className="online-col text-start">Online</th>
                                        <th className="status-col text-center">Status</th>
                                        <th className="last-col text-start">Last Visit</th>
                                        <th className="action-col text-start">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentAppointments.map((a, i) => {
                                        const originalIndex = startIndex + i;
                                        return (
                                        <tr key={i} style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 500 }}>
                                            <td className="sr-col">{a.sr}</td>
                                            <td className="name-col"><a href={`/patients/${a.patientId}`} style={{ textDecoration: "underline", color: "#1E88E5" }}>{a.patient}</a></td>
                                            <td className="age-col">{a.age}</td>
                                            <td className="contact-col">{(a.contact || '').toString().slice(0, 12)}</td>
                                            <td className="time-col">{extractTime(a.time)}</td>
                                            <td className="provider-col">
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={a.provider || 'Dr.Tongaonkar'}
                                                    onChange={(e) => handleProviderChange(originalIndex, e.target.value)}
                                                    // style={{ width: '18ch' }}
                                                >
                                                    <option value="Dr.Tongaonkar">Dr. Tongaonkar</option>
                                                </select>
                                            </td>
                                            <td className="online-cell">
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    value={a.online}
                                                    onChange={(e) => handleOnlineChange(originalIndex, e.target.value)}
                                                    placeholder="11:15"
                                                    style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 500, height: "28px", padding: "2px 6px" }}
                                                />
                                            </td>
                                            <td className="text-center center-cell" style={{ position: "relative" }} title={a.status}>
                                                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                                    <span className={`d-inline-block rounded-circle ${a.statusColor}`} style={{ width: "14px", height: "14px" }}></span>
                                                    <span style={{ fontSize: '0.9rem', color: '#263238' }}>{a.status}</span>
                                                    <div
                                                        onClick={(e) => {
                                                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                                            setMenuPosition({ top: rect.bottom + 6, left: rect.left - 66 });
                                                            setOpenStatusIndex(openStatusIndex === originalIndex ? null : originalIndex);
                                                        }}
                                                        aria-label="Change Status"
                                                        title="Change Status"
                                                        style={{
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            width: "28px",
                                                            height: "28px",
                                                            cursor: "pointer",
                                                            color: "#607D8B",
                                                            backgroundColor: "transparent",
                                                            borderRadius: "4px",
                                                        }}
                                                    >
                                                        <MoreVert fontSize="small" />
                                                    </div>
                                                </div>

                                                {openStatusIndex === originalIndex && menuPosition && (
                                                    <div
                                                        className="status-menu"
                                                        style={{
                                                            position: "fixed",
                                                            top: menuPosition.top,
                                                            left: menuPosition.left,
                                                            background: "#ffffff",
                                                            border: "1px solid #ccc",
                                                            borderRadius: "6px",
                                                            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                                                            zIndex: 2000,
                                                            minWidth: "180px",
                                                            fontFamily: "'Roboto', sans-serif",
                                                        }}
                                                    >
                                                        {["WAITING","WITH DOCTOR","CHECK OUT","ON CALL","SAVED","COMPLETED"].map((status) => (
                                                            <div
                                                                key={status}
                                                                onClick={() => {
                                                                    const updated = [...appointments];
                                                                    updated[originalIndex].status = status;
                                                                    updated[originalIndex].statusColor = getStatusColor(status);
                                                                    setAppointments(updated);
                                                                    setOpenStatusIndex(null);
                                                                    setMenuPosition(null);
                                                                }}
                                                                style={{
                                                                    padding: "8px 12px",
                                                                    cursor: "pointer",
                                                                    fontSize: "14px",
                                                                    color: "#212121",
                                                                    backgroundColor: "#fff",
                                                                    textAlign: "left",
                                                                }}
                                                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
                                                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
                                                            >
                                                                {status}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                            {/* <td><a href={`/patients/${a.patientId}/visits`} style={{ textDecoration: "underline", color: "#1E88E5" }}>{a.lastOpd}</a></td> */}
                                            <td className="last-col">
                                                <a
                                                    href={`/patients/${a.patientId}/visits`}
                                                    title={`Dr.Tongaonkar`}
                                                    style={{ textDecoration: "underline", color: "#1E88E5" }}
                                                >
                                                    {/* {`${formatYearToTwoDigits(a.lastOpd)} - Dr.Tongaonkar${(a.labs || '').toLowerCase() === 'reports' ? ' -L' : ''}`} */}
                                                    {`${formatYearToTwoDigits(a.lastOpd)}`} - Dr.Tongaonkar-L
                                                </a>
                                            </td>
                                            <td className="action-col" style={{ whiteSpace: "nowrap", position: 'relative' }}>
                                                <div
                                                    onClick={(e) => {
                                                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                                        setActionMenuPosition({ top: rect.bottom + 6, left: rect.left - 120 });
                                                        setOpenActionIndex(openActionIndex === originalIndex ? null : originalIndex);
                                                    }}
                                                    title="Actions"
                                                    style={{
                                                        display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                                                        width: '28px',
                                                        height: '28px',
                                                        cursor: 'pointer',
                                                        color: '#607D8B',
                                                        backgroundColor: 'transparent',
                                                        borderRadius: '4px'
                                                    }}
                                                >
                                                    <MoreVert fontSize="small" />
                                                </div>

                                                {openActionIndex === originalIndex && actionMenuPosition && (
                                                    <div
                                                        className="action-menu"
                                                        style={{
                                                            position: 'fixed',
                                                            top: actionMenuPosition.top,
                                                            left: actionMenuPosition.left,
                                                            background: '#fff',
                                                            border: '1px solid #ccc',
                                                            borderRadius: '6px',
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                                            zIndex: 2000,
                                                            minWidth: '180px',
                                                            fontFamily: "'Roboto', sans-serif",
                                                        }}
                                                    >
                                                        {[
                                                            { key: 'save', label: 'Save', icon: <Save fontSize='small' /> },
                                                            { key: 'delete', label: 'Delete', icon: <Delete fontSize='small' /> },
                                                            { key: 'info', label: 'Visit Details', icon: <Info fontSize='small' /> },
                                                            { key: 'forward', label: 'Treatment', icon: <FastForward fontSize='small' /> },
                                                            { key: 'add', label: 'Lab Details', icon: <AddIcon fontSize='small' /> },
                                                        ].map((item) => (
                                                            <div
                                                                key={item.key}
                                                                title={item.label}
                                                                onClick={() => {
                                                                    setOpenActionIndex(null);
                                                                    setActionMenuPosition(null);
                                                                }}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '8px',
                                                                    padding: '8px 12px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '14px',
                                                                    color: '#212121',
                                                                    backgroundColor: '#fff',
                                                                }}
                                                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
                                                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
                                                            >
                                                                {item.icon}
                                                                <span>{item.label}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Card View */}
                    {activeView === 'card' && (
                        <div className="card-grid">
                            {currentAppointments.map((appointment, index) => {
                                const originalIndex = startIndex + index;
                                return (
                                <div key={index}>
                                    <div className="appointment-card">
                                        <div className="card-header">
                                            <div className="d-flex align-items-center" style={{ gap: '8px' }}>
                                                <span className={`d-inline-block rounded-circle ${appointment.statusColor}`} style={{ width: '10px', height: '10px' }}></span>
                                                <a href={`/patients/${appointment.patientId}`} className="patient-name" style={{ textDecoration: 'underline', color: '#1E88E5' }}>{appointment.patient}</a>
                                            </div>
                                            <div
                                                onClick={(e) => {
                                                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                                    setMenuPosition({ top: rect.bottom + 6, left: rect.left - 120 });
                                                    setOpenStatusIndex(openStatusIndex === originalIndex ? null : originalIndex);
                                                }}
                                                title="Change Status"
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '28px',
                                                    height: '28px',
                                                    cursor: 'pointer',
                                                    color: '#607D8B',
                                                    backgroundColor: 'transparent',
                                                    borderRadius: '4px'
                                                }}
                                            >
                                                <MoreVert fontSize="small" />
                                            </div>
                                        </div>
                                        {openStatusIndex === originalIndex && menuPosition && (
                                            <div
                                                className="status-menu"
                                                style={{
                                                    position: 'fixed',
                                                    top: menuPosition.top,
                                                    left: menuPosition.left,
                                                    background: '#ffffff',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '6px',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                                    zIndex: 2000,
                                                    minWidth: '180px',
                                                    fontFamily: "'Roboto', sans-serif",
                                                }}
                                            >
                                                {["WAITING","WITH DOCTOR","CHECK OUT","ON CALL","SAVED","COMPLETED"].map((status) => (
                                                    <div
                                                        key={status}
                                                        onClick={() => {
                                                            const updated = [...appointments];
                                                            updated[originalIndex].status = status;
                                                            updated[originalIndex].statusColor = getStatusColor(status);
                                                            setAppointments(updated);
                                                            setOpenStatusIndex(null);
                                                            setMenuPosition(null);
                                                        }}
                                                        style={{
                                                            padding: '8px 12px',
                                                            cursor: 'pointer',
                                                            fontSize: '14px',
                                                            color: '#212121',
                                                            backgroundColor: '#fff',
                                                            textAlign: 'left',
                                                        }}
                                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
                                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
                                                    >
                                                        {status}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="card-details">
                                            <div className="kv"><span className="k">Age:</span><span className="v">{appointment.age}</span></div>
                                            <div className="kv"><span className="k">Contact:</span><span className="v">{appointment.contact}</span></div>
                                            {/* <div className="kv"><span className="k">Last Visit:</span><span className="v"><a href={`/patients/${appointment.patientId}/visits`} title={`Dr.Tongaonkar`} style={{ textDecoration: 'underline', color: '#1E88E5' }}>{`${formatYearToTwoDigits(appointment.lastOpd)}${(appointment.labs || '').toLowerCase() === 'reports' ? ' -L' : ''}`}</a></span></div> */}
                                            <div className="kv"><span className="k">Last Visit:</span><span className="v"><a href={`/patients/${appointment.patientId}/visits`} title={`Dr.Tongaonkar`} style={{ textDecoration: 'underline', color: '#1E88E5' }}>{`${formatYearToTwoDigits(appointment.lastOpd)}`} -L</a></span></div>
                                            <div className="kv"><span className="k">Dr. Tongaonkar</span></div>
                                            <div className="kv"><span className="k">Time:</span><span className="v">{extractTime(appointment.time)}</span></div>
                                            <div className="kv"><span className="k">Provider:</span><span className="v">
                                                <select
                                                    className="form-select"
                                                    value={appointment.provider || 'Dr. Tongaonkar'}
                                                    onChange={(e) => handleProviderChange(originalIndex, e.target.value)}
                                                    style={{ width: '107px', height: '28px', padding: " 3px !important", fontSize:9 }}
                                                >
                                                    <option value="Dr. Tongaonkar">Dr. Tongaonkar</option>
                                                </select>
                                            </span></div>
                                            
                                        </div>
                                        {/* <div className="crm-actions">
                                            <div className="crm-btn" title="Chat"><ChatBubbleOutline fontSize="small" /></div>
                                            <div className="crm-btn" title="Call"><Phone fontSize="small" /></div>
                                            <div className="crm-btn" title="Add"><AddIcon fontSize="small" /></div>
                                            <div className="crm-btn" title="Transfer"><SwapHoriz fontSize="small" /></div>
                                        </div> */}
                                        <div className="d-flex align-items-center" style={{ gap: '8px' }}>
                                            <div className="crm-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, max-content)', alignItems: 'center', gap: '8px' }}>
                                                <div className="crm-btn" title="Save"><Save fontSize="small" /></div>
                                                <div className="crm-btn" title="Delete"><Delete fontSize="small" /></div>
                                                <div className="crm-btn" title="Visit Details"><Info fontSize="small" /></div>
                                                <div className="crm-btn" title="Lab details"><AddIcon fontSize="small" /></div>
                                                <div className="kv">
                                                    <span className="k">Online:</span>
                                                    <span className="v">
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            placeholder="11:15"
                                                            value={appointment.online}
                                                            onChange={(e) => handleOnlineChange(originalIndex, e.target.value)}
                                                            style={{ width: '80px', height: '28px', padding: '2px 6px', display: 'inline-block' }}
                                                        />
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="crm-btn ms-auto" title="Treatment"><FastForward fontSize="small" /></div>
                                        </div>
                                    </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {filteredAppointments.length > 0 && (
                        <div className="pagination-container">
                            <div className="pagination-info">
                                <span>
                                    Showing {startIndex + 1} to {Math.min(endIndex, filteredAppointments.length)} of {filteredAppointments.length} appointments
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
                                
                                {/* Page numbers */}
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                    // Show first page, last page, current page, and pages around current page
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
                </>
            )}
            {/* Add Patient Modal */}
            <AddPatientPage 
                open={showAddPatient} 
                onClose={() => setShowAddPatient(false)}
            />
        </div>
    );
}