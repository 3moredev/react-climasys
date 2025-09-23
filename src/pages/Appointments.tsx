// import React, { useState, useEffect, useRef } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import { List, CreditCard, MoreVert, Add as AddIcon } from "@mui/icons-material";
// // import { patientService, Patient } from "../services/patientService";
// import { useNavigate, useLocation } from "react-router-dom";

// type AppointmentRow = {
//     sr: number;
//     patient: string;
//     age: number;
//     contact: string;
//     time: string;
//     provider: string;
//     online: string;
//     statusColor: string;
//     lastOpd: string;
//     labs: string;
//     actions: boolean;
// };

// export default function AppointmentsCard() {
//     const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
//     const [openStatusIndex, setOpenStatusIndex] = useState<number | null>(null);
//     const [searchTerm, setSearchTerm] = useState<string>("");
//     const [searchResults, setSearchResults] = useState<Patient[]>([]);
//     const [showDropdown, setShowDropdown] = useState<boolean>(false);
//     const [selectedPatients, setSelectedPatients] = useState<Patient[]>([]);
//     const [loading, setLoading] = useState<boolean>(false);
//     const [activeView, setActiveView] = useState<'list' | 'card'>('card');
//     const searchRef = useRef<HTMLDivElement>(null);
//     const navigate = useNavigate();
//     const location = useLocation();

//     // Convert Patient data to table format for appointments
//     const convertToTableFormat = (patients: Patient[]): AppointmentRow[] => {
//         return patients.map((patient, index) => ({
//             sr: appointments.length + index + 1,
//             patient: patient.fullName || `${patient.firstName} ${patient.lastName}`,
//             age: patient.age || 0,
//             contact: patient.mobileNumber || "",
//             time: new Date().toLocaleString(),
//             provider: "Dr. Smith",
//             online: "No",
//             statusColor: "bg-info",
//             lastOpd: "0",
//             labs: "No Reports",
//             actions: true
//         }));
//     };

//     // Search for patients using real patient API
//     const searchPatients = async (query: string) => {
//         if (!query.trim()) {
//             setSearchResults([]);
//             setShowDropdown(false);
//             return;
//         }

//         try {
//             setLoading(true);
//             const searchResults = await patientService.searchPatients(query);
//             setSearchResults(searchResults);
//             setShowDropdown(searchResults.length > 0);
//         } catch (error) {
//             console.error("Error searching patients:", error);
//             setSearchResults([]);
//             setShowDropdown(false);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Handle search input change
//     const handleSearchChange = (value: string) => {
//         setSearchTerm(value);
//         searchPatients(value);
//     };

//     // Handle patient selection from dropdown
//     const handlePatientSelect = (patient: Patient) => {
//         const isAlreadySelected = selectedPatients.some(p => p.id === patient.id);
        
//         if (!isAlreadySelected) {
//             setSelectedPatients(prev => [...prev, patient]);
//         }
        
//         setSearchTerm("");
//         setSearchResults([]);
//         setShowDropdown(false);
//     };

//     // Remove selected patient
//     const removeSelectedPatient = (patientId: string) => {
//         setSelectedPatients(prev => prev.filter(p => p.id?.toString() !== patientId));
//     };

//     // Book appointment - add selected patients to table
//     const handleBookAppointment = () => {
//         if (selectedPatients.length === 0) {
//             alert("Please select at least one patient to book an appointment.");
//             return;
//         }

//         const newAppointments = convertToTableFormat(selectedPatients);
//         setAppointments(prev => [...prev, ...newAppointments]);
//         setSelectedPatients([]);
//         alert(`Successfully booked ${newAppointments.length} appointment(s)!`);
//     };

//     // Navigation functions
//     const handleListClick = () => {
//         setActiveView('list');
//         navigate('/appointment');
//     };

//     const handleCardClick = () => {
//         setActiveView('card');
//         navigate('/appointments');
//     };

//     // Set active view based on current route
//     useEffect(() => {
//         if (location.pathname === '/appointment') {
//             setActiveView('list');
//         } else if (location.pathname === '/appointments') {
//             setActiveView('card');
//         }
//     }, [location.pathname]);

//     // Handle click outside to close dropdown
//     useEffect(() => {
//         const handleClickOutside = (event: MouseEvent) => {
//             if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
//                 setShowDropdown(false);
//             }
//         };

//         document.addEventListener('mousedown', handleClickOutside);
//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, []);

//     const handleOnlineChange = (index: number, value: string) => {
//         const updated = [...appointments];
//         updated[index].online = value;
//         setAppointments(updated);
//     };

//     const extractTime = (dateTimeStr: string): string => {
//         const date = new Date(dateTimeStr);
//         const hh = String(date.getHours()).padStart(2, "0");
//         const mm = String(date.getMinutes()).padStart(2, "0");
//         const ss = String(date.getSeconds()).padStart(2, "0");
//         return `${hh}:${mm}:${ss}`;
//     };

//     const buttonStyle = {
//         backgroundColor: "#1E88E5",
//         color: "white",
//         borderRadius: "6px",
//         border: "2px solid #1E88E5",
//         fontFamily: "'Roboto', sans-serif",
//         fontWeight: 500,
//         height: "38px"
//     };

//     return (
//         <div className="container-fluid mt-3" style={{ fontFamily: "'Roboto', sans-serif" }}>
//             <style>{`
//         .appointment-card {
//             border: 1px solid #e0e0e0;
//             border-radius: 8px;
//             padding: 16px;
//             margin-bottom: 16px;
//             background: #fff;
//             box-shadow: 0 2px 4px rgba(0,0,0,0.1);
//             transition: box-shadow 0.2s ease;
//         }
//         .appointment-card:hover {
//             box-shadow: 0 4px 8px rgba(0,0,0,0.15);
//         }
//         .card-header {
//             display: flex;
//             justify-content: space-between;
//             align-items: center;
//             margin-bottom: 12px;
//             padding-bottom: 8px;
//             border-bottom: 1px solid #f0f0f0;
//         }
//         .patient-name {
//             font-size: 1.1rem;
//             font-weight: 600;
//             color: #333;
//         }
//         .patient-details {
//             display: grid;
//             grid-template-columns: 1fr 1fr;
//             gap: 8px;
//             margin-bottom: 12px;
//         }
//         .detail-item {
//             display: flex;
//             align-items: center;
//             font-size: 0.9rem;
//         }
//         .detail-label {
//             font-weight: 500;
//             color: #666;
//             margin-right: 8px;
//             min-width: 60px;
//         }
//         .detail-value {
//             color: #333;
//         }
//         .card-actions {
//             display: flex;
//             gap: 8px;
//             justify-content: flex-end;
//         }
//         .status-indicator {
//             width: 12px;
//             height: 12px;
//             border-radius: 50%;
//             display: inline-block;
//             margin-right: 8px;
//         }
//       `}</style>
            
//             {/* Header */}
//             <div className="d-flex justify-content-between align-items-center mb-3">
//                 <h2>Appointments (Card View)</h2>
//                 <div className="d-flex align-items-center">
//                     <button 
//                         className="btn me-2" 
//                         style={buttonStyle}
//                         onClick={handleBookAppointment}
//                     >
//                         Book Appointment {selectedPatients.length > 0 && `(${selectedPatients.length})`}
//                     </button>
//                     <button className="btn me-2" style={buttonStyle}>Add Patient</button>

//                     {/* Merged List & Card Button */}
//                     <div 
//                         className="d-flex align-items-center"
//                         style={{
//                             height: "38px",
//                             backgroundColor: "#607D8B",
//                             borderColor: "#B7B7B7",
//                             color: "#fff",
//                             fontFamily: "'Roboto', sans-serif",
//                             borderRadius: "6px",
//                             border: "1px solid #B7B7B7",
//                             overflow: "hidden"
//                         }}
//                     >
//                         {/* List Icon */}
//                         <button
//                             className="btn d-flex align-items-center justify-content-center"
//                             style={{
//                                 height: "100%",
//                                 backgroundColor: activeView === 'list' ? "#4CAF50" : "transparent",
//                                 border: "none",
//                                 color: "#fff",
//                                 fontFamily: "'Roboto', sans-serif",
//                                 opacity: activeView === 'list' ? 0.7 : 1,
//                                 cursor: activeView === 'list' ? 'not-allowed' : 'pointer',
//                                 padding: "0 12px",
//                                 minWidth: "40px"
//                             }}
//                             onClick={handleListClick}
//                             disabled={activeView === 'list'}
//                             title="List View"
//                         >
//                             <List />
//                         </button>
                        
//                         {/* Vertical Divider */}
//                         <div 
//                             style={{ 
//                                 width: "1px", 
//                                 height: "100%", 
//                                 backgroundColor: "#fff", 
//                                 opacity: 0.7 
//                             }} 
//                         />
                        
//                         {/* Card Icon */}
//                         <button
//                             className="btn d-flex align-items-center justify-content-center"
//                             style={{
//                                 height: "100%",
//                                 backgroundColor: activeView === 'card' ? "#4CAF50" : "transparent",
//                                 border: "none",
//                                 color: "#fff",
//                                 fontFamily: "'Roboto', sans-serif",
//                                 opacity: activeView === 'card' ? 0.7 : 1,
//                                 cursor: activeView === 'card' ? 'not-allowed' : 'pointer',
//                                 padding: "0 12px",
//                                 minWidth: "40px"
//                             }}
//                             onClick={handleCardClick}
//                             disabled={activeView === 'card'}
//                             title="Card View"
//                         >
//                             <CreditCard />
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {/* Search + Filter */}
//             <div className="d-flex mb-3">
//                 <div className="position-relative me-2" ref={searchRef}>
//                 <input
//                     type="text"
//                         placeholder="Search by patient ID, name, or contact..."
//                         className="form-control"
//                         value={searchTerm}
//                         onChange={(e) => handleSearchChange(e.target.value)}
//                         style={{ borderWidth: "2px", height: "38px", fontFamily: "'Roboto', sans-serif", fontWeight: 500, minWidth: "300px" }}
//                     />
                    
//                     {/* Search Dropdown */}
//                     {showDropdown && (
//                         <div 
//                             className="position-absolute w-100 bg-white border border-secondary rounded shadow-lg"
//                             style={{ 
//                                 top: "100%", 
//                                 left: 0, 
//                                 zIndex: 1000, 
//                                 maxHeight: "300px", 
//                                 overflowY: "auto",
//                                 fontFamily: "'Roboto', sans-serif"
//                             }}
//                         >
//                             {loading ? (
//                                 <div className="p-3 text-center">
//                                     <div className="spinner-border spinner-border-sm text-primary" role="status">
//                                         <span className="visually-hidden">Loading...</span>
//                                     </div>
//                                     <span className="ms-2">Searching...</span>
//                                 </div>
//                             ) : searchResults.length > 0 ? (
//                                 searchResults.map((patient) => (
//                                     <div
//                                         key={patient.id}
//                                         className="p-3 border-bottom cursor-pointer"
//                                         style={{ cursor: "pointer" }}
//                                         onClick={() => handlePatientSelect(patient)}
//                                         onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"}
//                                         onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
//                                     >
//                                         <div className="fw-bold">{patient.fullName || `${patient.firstName} ${patient.lastName}`}</div>
//                                         <div className="text-muted small">
//                                             ID: {patient.id} | Age: {patient.age} | Contact: {patient.mobileNumber}
//                                         </div>
//                                         <div className="text-muted small">
//                                             Gender: {patient.gender} | Email: {patient.email || 'N/A'}
//                                         </div>
//                                     </div>
//                                 ))
//                             ) : (
//                                 <div className="p-3 text-muted text-center">No patients found</div>
//                             )}
//                         </div>
//                     )}
//                 </div>
                
//                 <button className="btn btn-outline-secondary border-2 d-flex align-items-center" style={{ height: "38px", fontFamily: "'Roboto', sans-serif", background:"#B7B7B7" }}>
//                     <List className="me-1" /> Filter
//                 </button>
//             </div>

//             {/* Selected Patients */}
//             {selectedPatients.length > 0 && (
//                 <div className="mb-3">
//                     <h6 className="mb-2">Selected Patients ({selectedPatients.length}):</h6>
//                     <div className="d-flex flex-wrap gap-2">
//                         {selectedPatients.map((patient) => (
//                             <div
//                                 key={patient.id}
//                                 className="badge bg-primary d-flex align-items-center"
//                                 style={{ fontSize: "0.9rem", padding: "8px 12px" }}
//                             >
//                                 {patient.fullName || `${patient.firstName} ${patient.lastName}`} (ID: {patient.id})
//                                 <button
//                                     type="button"
//                                     className="btn-close btn-close-white ms-2"
//                                     style={{ fontSize: "0.7rem" }}
//                                     onClick={() => removeSelectedPatient(patient.id?.toString() || '')}
//                                     aria-label="Remove"
//                                 ></button>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             )}

//             {/* Card View */}
//             <div className="row">
//                 {appointments.length === 0 ? (
//                     <div className="col-12 text-center py-5">
//                         <div className="mb-3">
//                             <i className="fas fa-calendar-plus" style={{ fontSize: "3rem", color: "#6c757d" }}></i>
//                         </div>
//                         <h5 className="text-muted">No Appointments Booked</h5>
//                         <p className="text-muted">Search for patients and click "Book Appointment" to add them to your schedule.</p>
//                     </div>
//                 ) : (
//                     appointments.map((appointment, index) => (
//                         <div key={index} className="col-md-6 col-lg-4 mb-3">
//                             <div className="appointment-card">
//                                 <div className="card-header">
//                                     <div className="patient-name">{appointment.patient}</div>
//                                     <div className="d-flex align-items-center">
//                                         <span className={`status-indicator ${appointment.statusColor}`}></span>
//                                         <MoreVert 
//                                             fontSize="small" 
//                                             style={{ cursor: "pointer", color: "#607D8B" }}
//                                             onClick={() => setOpenStatusIndex(openStatusIndex === index ? null : index)}
//                                         />
//                                     </div>
//                                 </div>
                                
//                                 <div className="patient-details">
//                                     <div className="detail-item">
//                                         <span className="detail-label">Age:</span>
//                                         <span className="detail-value">{appointment.age}</span>
//                                     </div>
//                                     <div className="detail-item">
//                                         <span className="detail-label">Contact:</span>
//                                         <span className="detail-value">{appointment.contact}</span>
//                                     </div>
//                                     <div className="detail-item">
//                                         <span className="detail-label">Time:</span>
//                                         <span className="detail-value">{extractTime(appointment.time)}</span>
//                                     </div>
//                                     <div className="detail-item">
//                                         <span className="detail-label">Provider:</span>
//                                         <span className="detail-value">{appointment.provider}</span>
//                                     </div>
//                                     <div className="detail-item">
//                                         <span className="detail-label">Online:</span>
//                                         <span className="detail-value">
//                                             <input
//                                                 type="text"
//                                                 className="form-control form-control-sm"
//                                                 value={appointment.online}
//                                                 onChange={(e) => handleOnlineChange(index, e.target.value)}
//                                                 style={{ width: "80px", display: "inline-block" }}
//                                             />
//                                         </span>
//                                     </div>
//                                     <div className="detail-item">
//                                         <span className="detail-label">Last OPD:</span>
//                                         <span className="detail-value">{appointment.lastOpd}</span>
//                                     </div>
//                                 </div>
                                
//                                 <div className="card-actions">
//                                     {appointment.actions && (
//                                         <button
//                                             className="btn btn-success btn-sm me-1"
//                                             style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 500 }}
//                                             title="Confirm"
//                                         >
//                                             ✓
//                                         </button>
//                                     )}
//                                     <button
//                                         className="btn btn-sm me-1"
//                                         style={{
//                                             backgroundColor: "#607D8B",
//                                             borderColor: "#607D8B",
//                                             color: "#fff",
//                                             fontFamily: "'Roboto', sans-serif",
//                                             fontWeight: 500,
//                                         }}
//                                         title="Edit"
//                                     >
//                                         ✎
//                                     </button>
//                                     <button
//                                         className="btn btn-sm"
//                                         style={{
//                                             backgroundColor: "#607D8B",
//                                             borderColor: "#607D8B",
//                                             color: "#fff",
//                                             fontFamily: "'Roboto', sans-serif",
//                                             fontWeight: 500,
//                                         }}
//                                         title="Cancel"
//                                     >
//                                         ✕
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     ))
//                 )}
//             </div>
//         </div>
//     );
// }