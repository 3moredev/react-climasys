import React, { useState, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { CalendarToday } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { IconButton } from "@mui/material";
import SearchInput from "../components/SearchInput";
import { patientService, Patient } from "../services/patientService";

export default function ManageHospitalBill() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [searchResults, setSearchResults] = useState<Patient[]>([]);
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchError, setSearchError] = useState<string>("");
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        address: "",
        admissionDate: "",
        treatingDrSurgeon: "",
        contactNo: "",
        hospitalBillNo: "",
        referredByDoctor: "",
        ipdNo: "",
        ipdFileNo: "",
        department: "",
        dischargeDate: "",
        hospitalBillDate: "",
        receiptNumber: "",
        receiptDate: "",
        consultingDoctor: "",
        anesthetist: "",
        company: "",
        lastAdvanceDate: "",
        lessEqualDate: "",
        charges: "",
        keywordOperation: "",
        totalAmount: "",
        discount: "",
        netAmount: "",
        adjustAdvance: "",
        duesAmount: "",
        totalAdvance: "",
        collection: "",
        tds: "",
        balance: "",
        paymentBy: "Cash",
        paymentRemark: "",
        comments: ""
    });

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
                size: 200
            });

            const q = query.trim().toLowerCase();
            const patients = response.patients || [];

            const queryWords = q.split(/\s+/).filter(word => word.length > 0);

            const tokenMatch = (p: any): boolean => {
                const patientId = String(p.id || '').toLowerCase();
                const firstName = String(p.first_name || '').toLowerCase();
                const middleName = String(p.middle_name || '').toLowerCase();
                const lastName = String(p.last_name || '').toLowerCase();
                const fullName = `${firstName} ${middleName} ${lastName}`.replace(/\s+/g, ' ').trim().toLowerCase();
                const firstLast = `${firstName} ${lastName}`.replace(/\s+/g, ' ').trim();
                const lastFirst = `${lastName} ${firstName}`.replace(/\s+/g, ' ').trim();
                const contact = String(p.mobile_1 || '').replace(/\D/g, '');
                const queryDigits = q.replace(/\D/g, '');

                return (
                    patientId === q ||
                    patientId.includes(q) ||
                    (queryDigits.length >= 3 && contact.includes(queryDigits)) ||
                    (queryWords.length > 1 && ([fullName, firstLast, lastFirst]
                        .some(name => queryWords.every(word => name.includes(word))))) ||
                    (queryWords.length === 1 && (
                        firstName.startsWith(q) ||
                        middleName.startsWith(q) ||
                        lastName.startsWith(q) ||
                        fullName.includes(q) ||
                        firstName.includes(q) ||
                        middleName.includes(q) ||
                        lastName.includes(q)
                    ))
                );
            };

            let searchResults = patients.filter((p: any) => tokenMatch(p));

            if (searchResults.length === 0 && queryWords.length > 1) {
                try {
                    const tokenResponses = await Promise.all(
                        queryWords.map(word => patientService.searchPatients({
                            query: word,
                            status: 'all',
                            page: 0,
                            size: 200
                        }))
                    );
                    const mergedById: Record<string, any> = {};
                    for (const r of tokenResponses) {
                        const arr = (r?.patients || []) as any[];
                        for (const p of arr) {
                            const idKey = String(p.id || '').toLowerCase();
                            if (!mergedById[idKey]) mergedById[idKey] = p;
                        }
                    }
                    const mergedArray = Object.values(mergedById);
                    searchResults = mergedArray.filter((p: any) => tokenMatch(p));
                } catch (e) {
                    console.warn('Per-token search fallback failed', e);
                }
            }

            const sortedResults = searchResults.sort((a: any, b: any) => {
                const q = query.trim().toLowerCase();
                const getScore = (patient: any) => {
                    const id = String(patient.id || '').toLowerCase();
                    const firstName = String(patient.first_name || '').toLowerCase();
                    const middleName = String(patient.middle_name || '').toLowerCase();
                    const lastName = String(patient.last_name || '').toLowerCase();
                    const fullName = `${firstName} ${middleName} ${lastName}`.replace(/\s+/g, ' ').trim().toLowerCase();
                    const contact = String(patient.mobile_1 || '').replace(/\D/g, '');
                    const queryWords = q.split(/\s+/).filter(word => word.length > 0);
                    const queryDigits = q.replace(/\D/g, '');

                    let score = 0;
                    if (id === q) score += 1000;
                    else if (id.startsWith(q)) score += 800;
                    else if (id.includes(q)) score += 600;
                    if (queryDigits.length >= 3 && contact === queryDigits) score += 200;
                    if (queryDigits.length >= 3 && contact.includes(queryDigits)) score += 100;
                    if (queryWords.length > 1) {
                        const allWordsFound = queryWords.every(word => fullName.includes(word));
                        if (allWordsFound) {
                            if (fullName.startsWith(q)) score += 500;
                            else if (firstName.startsWith(queryWords[0])) score += 450;
                            else if (middleName && middleName.startsWith(queryWords[1] || '')) score += 425;
                            else if (lastName.startsWith(queryWords[queryWords.length - 1])) score += 400;
                            else score += 350;
                        }
                    } else {
                        if (firstName.startsWith(q)) score += 500;
                        else if (lastName.startsWith(q)) score += 450;
                        else if (middleName.startsWith(q)) score += 400;
                        else if (fullName.includes(q)) score += 300;
                        else score += 200;
                    }
                    return score;
                };
                return getScore(b) - getScore(a);
            });

            setSearchResults(sortedResults);
            setShowDropdown(true);
        } catch (error: any) {
            console.error("Search error:", error);
            setSearchError(error.message || "Failed to search patients");
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        const search = value.trim().toLowerCase();
        if (!search) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }
        searchPatients(value);
    };

    const handlePatientSelect = (patient: Patient) => {
        setSearchTerm("");
        setSearchResults([]);
        setShowDropdown(false);
        // Populate form with patient data
        setFormData(prev => ({
            ...prev,
            contactNo: patient.mobile_1 || "",
            address: (patient as any).address || ""
        }));
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = () => {
        console.log("Form submitted:", formData);
    };

    const handleClear = () => {
        setFormData({
            address: "",
            admissionDate: "",
            treatingDrSurgeon: "",
            contactNo: "",
            hospitalBillNo: "",
            referredByDoctor: "",
            ipdNo: "",
            ipdFileNo: "",
            department: "",
            dischargeDate: "",
            hospitalBillDate: "",
            receiptNumber: "",
            receiptDate: "",
            consultingDoctor: "",
            anesthetist: "",
            company: "",
            lastAdvanceDate: "",
            lessEqualDate: "",
            charges: "",
            keywordOperation: "",
            totalAmount: "",
            discount: "",
            netAmount: "",
            adjustAdvance: "",
            duesAmount: "",
            totalAdvance: "",
            collection: "",
            tds: "",
            balance: "",
            paymentBy: "Cash",
            paymentRemark: "",
            comments: ""
        });
        setSearchTerm("");
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const buttonStyle: React.CSSProperties = {
        backgroundColor: "#007bff",
        color: "#ffffff",
        border: "none",
        height: "38px",
        padding: "6px 16px",
        borderRadius: "4px",
        fontFamily: "'Roboto', sans-serif",
        fontWeight: 500,
        fontSize: "0.9rem",
        cursor: "pointer",
        whiteSpace: "nowrap"
    };

    return (
        <div className="container-fluid mt-3" style={{ fontFamily: "'Roboto', sans-serif" }}>
            <div className="mb-4">
                <h2 style={{
                    fontWeight: 'bold',
                    fontSize: '1.5rem',
                    color: '#212121',
                    marginBottom: '0'
                }}>
                    Manage Hospital Bill
                </h2>
            </div>

            {/* Patient Search Section */}
            <div className="mb-4">
                <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 500,
                    color: '#333',
                    fontSize: '14px'
                }}>
                    Patient ID / Patient Name / IPD Number
                </label>
                <div className="d-flex align-items-center" style={{ gap: '8px', overflow: 'visible' }}>
                    <div className="position-relative" ref={searchRef} style={{ flex: 1, maxWidth: '500px' }}>
                        <SearchInput
                            value={searchTerm}
                            onChange={(val) => handleSearchChange(val)}
                            onClear={() => handleSearchChange("")}
                            placeholder="Search with Patient ID / Patient Name / IPD Number"
                            ref={searchInputRef}
                            inputStyle={{ borderWidth: "2px", height: "38px", fontFamily: "'Roboto', sans-serif", fontWeight: 500 }}
                        />

                        {showDropdown && (
                            <div
                                className="position-absolute w-100 bg-white border border-secondary rounded shadow-lg"
                                style={{
                                    top: "100%",
                                    left: 0,
                                    zIndex: 1051,
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
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map((patient) => {
                                        const age = patient.age_given;
                                        return (
                                            <div
                                                key={patient.id}
                                                className="p-3 border-bottom cursor-pointer"
                                                style={{ cursor: "pointer" }}
                                                onClick={() => handlePatientSelect(patient)}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
                                            >
                                                <div className="fw-bold d-flex align-items-center">
                                                    <i className="fas fa-user me-2 text-primary"></i>
                                                    {patient.first_name} {patient.middle_name ? `${patient.middle_name} ` : ''}{patient.last_name}
                                                </div>
                                                <div className="text-muted small mt-1 text-nowrap">
                                                    <i className="fas fa-id-card me-1"></i>
                                                    <strong>ID:</strong> {patient.id} |
                                                    <i className="fas fa-birthday-cake me-1 ms-2"></i>
                                                    <strong>Age:</strong> {age} |
                                                    <i className="fas fa-phone me-1"></i>
                                                    <strong>Contact:</strong> {patient.mobile_1 || 'N/A'}
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

                    <button
                        className="btn"
                        style={buttonStyle}
                        onClick={() => console.log("Search clicked")}
                    >
                        Search
                    </button>
                </div>
            </div>

            {/* Patient / Billing Information Fields */}
            <div className="mb-4">
                <label style={{
                    display: 'block',
                    marginBottom: '16px',
                    fontWeight: 600,
                    color: '#212121',
                    fontSize: '16px'
                }}>
                    Patient / Billing Information Fields
                </label>
                <div className="row" style={{ gap: '24px' }}>
                    {/* Left Column */}
                    <div className="col-md-6">
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '6px',
                                fontWeight: 500,
                                color: '#333',
                                fontSize: '14px'
                            }}>
                                Address
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.address}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                                style={{ height: '36px', fontSize: '14px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '6px',
                                fontWeight: 500,
                                color: '#333',
                                fontSize: '14px'
                            }}>
                                Admission Date
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="DD-MMM-YYYY"
                                    value={formData.admissionDate}
                                    onChange={(e) => handleInputChange('admissionDate', e.target.value)}
                                    style={{ height: '36px', fontSize: '14px', paddingRight: '40px' }}
                                />
                                <button
                                    type="button"
                                    style={{
                                        position: 'absolute',
                                        right: '8px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#666',
                                        padding: '4px'
                                    }}
                                >
                                    <CalendarToday style={{ fontSize: '20px' }} />
                                </button>
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '6px',
                                fontWeight: 500,
                                color: '#333',
                                fontSize: '14px'
                            }}>
                                Treating Dr./Surgeon
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.treatingDrSurgeon}
                                onChange={(e) => handleInputChange('treatingDrSurgeon', e.target.value)}
                                style={{ height: '36px', fontSize: '14px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '6px',
                                fontWeight: 500,
                                color: '#333',
                                fontSize: '14px'
                            }}>
                                Contact No
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.contactNo}
                                onChange={(e) => handleInputChange('contactNo', e.target.value)}
                                style={{ height: '36px', fontSize: '14px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '6px',
                                fontWeight: 500,
                                color: '#333',
                                fontSize: '14px'
                            }}>
                                Hospital Bill No
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.hospitalBillNo}
                                onChange={(e) => handleInputChange('hospitalBillNo', e.target.value)}
                                style={{ height: '36px', fontSize: '14px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '6px',
                                fontWeight: 500,
                                color: '#333',
                                fontSize: '14px'
                            }}>
                                Referred by Doctor
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.referredByDoctor}
                                onChange={(e) => handleInputChange('referredByDoctor', e.target.value)}
                                style={{ height: '36px', fontSize: '14px' }}
                            />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="col-md-6">
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '6px',
                                fontWeight: 500,
                                color: '#333',
                                fontSize: '14px'
                            }}>
                                IPD No
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.ipdNo}
                                onChange={(e) => handleInputChange('ipdNo', e.target.value)}
                                style={{ height: '36px', fontSize: '14px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '6px',
                                fontWeight: 500,
                                color: '#333',
                                fontSize: '14px'
                            }}>
                                IPD File No
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.ipdFileNo}
                                onChange={(e) => handleInputChange('ipdFileNo', e.target.value)}
                                style={{ height: '36px', fontSize: '14px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '6px',
                                fontWeight: 500,
                                color: '#333',
                                fontSize: '14px'
                            }}>
                                Department
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.department}
                                onChange={(e) => handleInputChange('department', e.target.value)}
                                style={{ height: '36px', fontSize: '14px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '6px',
                                fontWeight: 500,
                                color: '#333',
                                fontSize: '14px'
                            }}>
                                Discharge Date
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="DD-MMM-YYYY"
                                    value={formData.dischargeDate}
                                    onChange={(e) => handleInputChange('dischargeDate', e.target.value)}
                                    style={{ height: '36px', fontSize: '14px', paddingRight: '40px' }}
                                />
                                <button
                                    type="button"
                                    style={{
                                        position: 'absolute',
                                        right: '8px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#666',
                                        padding: '4px'
                                    }}
                                >
                                    <CalendarToday style={{ fontSize: '20px' }} />
                                </button>
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '6px',
                                fontWeight: 500,
                                color: '#333',
                                fontSize: '14px'
                            }}>
                                Hospital Bill Date
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="DD-MMM-YYYY"
                                    value={formData.hospitalBillDate}
                                    onChange={(e) => handleInputChange('hospitalBillDate', e.target.value)}
                                    style={{ height: '36px', fontSize: '14px', paddingRight: '40px' }}
                                />
                                <button
                                    type="button"
                                    style={{
                                        position: 'absolute',
                                        right: '8px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#666',
                                        padding: '4px'
                                    }}
                                >
                                    <CalendarToday style={{ fontSize: '20px' }} />
                                </button>
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '6px',
                                fontWeight: 500,
                                color: '#333',
                                fontSize: '14px'
                            }}>
                                Receipt Number
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.receiptNumber}
                                onChange={(e) => handleInputChange('receiptNumber', e.target.value)}
                                style={{ height: '36px', fontSize: '14px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '6px',
                                fontWeight: 500,
                                color: '#333',
                                fontSize: '14px'
                            }}>
                                Receipt Date
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="DD-MMM-YYYY"
                                    value={formData.receiptDate}
                                    onChange={(e) => handleInputChange('receiptDate', e.target.value)}
                                    style={{ height: '36px', fontSize: '14px', paddingRight: '40px' }}
                                />
                                <button
                                    type="button"
                                    style={{
                                        position: 'absolute',
                                        right: '8px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#666',
                                        padding: '4px'
                                    }}
                                >
                                    <CalendarToday style={{ fontSize: '20px' }} />
                                </button>
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '6px',
                                fontWeight: 500,
                                color: '#333',
                                fontSize: '14px'
                            }}>
                                Consulting Doctor
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.consultingDoctor}
                                onChange={(e) => handleInputChange('consultingDoctor', e.target.value)}
                                style={{ height: '36px', fontSize: '14px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '6px',
                                fontWeight: 500,
                                color: '#333',
                                fontSize: '14px'
                            }}>
                                Anesthetist
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.anesthetist}
                                onChange={(e) => handleInputChange('anesthetist', e.target.value)}
                                style={{ height: '36px', fontSize: '14px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '6px',
                                fontWeight: 500,
                                color: '#333',
                                fontSize: '14px'
                            }}>
                                Company
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.company}
                                onChange={(e) => handleInputChange('company', e.target.value)}
                                style={{ height: '36px', fontSize: '14px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '6px',
                                fontWeight: 500,
                                color: '#333',
                                fontSize: '14px'
                            }}>
                                Last Advance Date
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="DD-MMM-YYYY"
                                    value={formData.lastAdvanceDate}
                                    onChange={(e) => handleInputChange('lastAdvanceDate', e.target.value)}
                                    style={{ height: '36px', fontSize: '14px', paddingRight: '40px' }}
                                />
                                <button
                                    type="button"
                                    style={{
                                        position: 'absolute',
                                        right: '8px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#666',
                                        padding: '4px'
                                    }}
                                >
                                    <CalendarToday style={{ fontSize: '20px' }} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Less or Equal to Hospital Bill Date Section */}
            <div className="mb-4">
                <label style={{
                    display: 'block',
                    marginBottom: '16px',
                    fontWeight: 600,
                    color: '#212121',
                    fontSize: '16px'
                }}>
                    Less or Equal to Hospital Bill Date
                </label>
                <div className="d-flex align-items-end" style={{ gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ minWidth: '150px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: 500,
                            color: '#333',
                            fontSize: '14px'
                        }}>
                            Date
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="DD-MMM-YYYY"
                                value={formData.lessEqualDate}
                                onChange={(e) => handleInputChange('lessEqualDate', e.target.value)}
                                style={{ height: '36px', fontSize: '14px', paddingRight: '40px' }}
                            />
                            <button
                                type="button"
                                style={{
                                    position: 'absolute',
                                    right: '8px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#666',
                                    padding: '4px'
                                }}
                            >
                                <CalendarToday style={{ fontSize: '20px' }} />
                            </button>
                        </div>
                    </div>

                    <div style={{ minWidth: '200px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: 500,
                            color: '#333',
                            fontSize: '14px'
                        }}>
                            Charges
                        </label>
                        <select
                            className="form-select"
                            value={formData.charges}
                            onChange={(e) => handleInputChange('charges', e.target.value)}
                            style={{ height: '36px', fontSize: '14px' }}
                        >
                            <option value="">Select Charges</option>
                            <option value="charge1">Charge 1</option>
                            <option value="charge2">Charge 2</option>
                        </select>
                    </div>

                    <button
                        className="btn"
                        style={buttonStyle}
                        onClick={() => console.log("ADD clicked")}
                    >
                        ADD
                    </button>

                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: 500,
                            color: '#333',
                            fontSize: '14px'
                        }}>
                            Keyword / Operation
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.keywordOperation}
                            onChange={(e) => handleInputChange('keywordOperation', e.target.value)}
                            style={{ height: '36px', fontSize: '14px' }}
                        />
                    </div>

                    <button
                        className="btn"
                        style={buttonStyle}
                        onClick={() => console.log("Add Keyword Charges clicked")}
                    >
                        Add Keyword Charges
                    </button>
                </div>
            </div>

            {/* Financial Summary Section */}
            <div className="mb-4">
                <div className="row g-2 mb-3">
                    <div className="col-md-2">
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: 500,
                            color: '#333',
                            fontSize: '14px'
                        }}>
                            Total Amount (Rs)
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.totalAmount}
                            onChange={(e) => handleInputChange('totalAmount', e.target.value)}
                            style={{ height: '36px', fontSize: '14px' }}
                        />
                    </div>
                    <div className="col-md-2">
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: 500,
                            color: '#333',
                            fontSize: '14px'
                        }}>
                            Discount (Rs)
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.discount}
                            onChange={(e) => handleInputChange('discount', e.target.value)}
                            style={{ height: '36px', fontSize: '14px' }}
                        />
                    </div>
                    <div className="col-md-2">
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: 500,
                            color: '#333',
                            fontSize: '14px'
                        }}>
                            Net Amount (Rs)
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.netAmount}
                            onChange={(e) => handleInputChange('netAmount', e.target.value)}
                            style={{ height: '36px', fontSize: '14px' }}
                        />
                    </div>
                    <div className="col-md-2">
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: 500,
                            color: '#333',
                            fontSize: '14px'
                        }}>
                            Adjust Advance (Rs)
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.adjustAdvance}
                            onChange={(e) => handleInputChange('adjustAdvance', e.target.value)}
                            style={{ height: '36px', fontSize: '14px' }}
                        />
                    </div>
                    <div className="col-md-2">
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: 500,
                            color: '#333',
                            fontSize: '14px'
                        }}>
                            Dues Amount (Rs)
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.duesAmount}
                            onChange={(e) => handleInputChange('duesAmount', e.target.value)}
                            style={{ height: '36px', fontSize: '14px' }}
                        />
                    </div>
                    <div className="col-md-2">
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: 500,
                            color: '#333',
                            fontSize: '14px'
                        }}>
                            Total Advance (Rs)
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.totalAdvance}
                                onChange={(e) => handleInputChange('totalAdvance', e.target.value)}
                                style={{ height: '36px', fontSize: '14px', paddingRight: '30px' }}
                            />
                            <span style={{
                                position: 'absolute',
                                right: '8px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#666',
                                fontSize: '14px',
                                cursor: 'pointer'
                            }} title="Info">
                                ℹ️
                            </span>
                        </div>
                    </div>
                </div>

                <div className="row g-2">
                    <div className="col-md-2">
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: 500,
                            color: '#333',
                            fontSize: '14px'
                        }}>
                            Collection (Rs)*
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.collection}
                            onChange={(e) => handleInputChange('collection', e.target.value)}
                            style={{ height: '36px', fontSize: '14px' }}
                            required
                        />
                    </div>
                    <div className="col-md-2">
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: 500,
                            color: '#333',
                            fontSize: '14px'
                        }}>
                            TDS (Rs)
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.tds}
                            onChange={(e) => handleInputChange('tds', e.target.value)}
                            style={{ height: '36px', fontSize: '14px' }}
                        />
                    </div>
                    <div className="col-md-2">
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: 500,
                            color: '#333',
                            fontSize: '14px'
                        }}>
                            Balance (Rs)
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.balance}
                            onChange={(e) => handleInputChange('balance', e.target.value)}
                            style={{ height: '36px', fontSize: '14px' }}
                        />
                    </div>
                    <div className="col-md-2">
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: 500,
                            color: '#333',
                            fontSize: '14px'
                        }}>
                            Payment By
                        </label>
                        <select
                            className="form-select"
                            value={formData.paymentBy}
                            onChange={(e) => handleInputChange('paymentBy', e.target.value)}
                            style={{ height: '36px', fontSize: '14px' }}
                        >
                            <option value="Cash">Cash</option>
                            <option value="Card">Card</option>
                            <option value="Cheque">Cheque</option>
                            <option value="Online">Online</option>
                        </select>
                    </div>
                    <div className="col-md-2">
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: 500,
                            color: '#333',
                            fontSize: '14px'
                        }}>
                            Payment Remark
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.paymentRemark}
                            onChange={(e) => handleInputChange('paymentRemark', e.target.value)}
                            style={{ height: '36px', fontSize: '14px' }}
                        />
                    </div>
                    <div className="col-md-2">
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: 500,
                            color: '#333',
                            fontSize: '14px'
                        }}>
                            Comments
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.comments}
                            onChange={(e) => handleInputChange('comments', e.target.value)}
                            style={{ height: '36px', fontSize: '14px' }}
                        />
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="d-flex justify-content-end gap-2 mt-4">
                <button
                    className="btn"
                    style={buttonStyle}
                    onClick={() => console.log("Print Receipt clicked")}
                >
                    Print Receipt
                </button>
                <button
                    className="btn"
                    style={buttonStyle}
                    onClick={() => console.log("Print clicked")}
                >
                    Print
                </button>
                <button
                    className="btn"
                    style={buttonStyle}
                    onClick={handleClear}
                >
                    Reset
                </button>
                <button
                    className="btn"
                    style={buttonStyle}
                    onClick={handleSubmit}
                >
                    Submit
                </button>
            </div>
        </div>
    );
}
