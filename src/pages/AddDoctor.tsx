import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import {
    getCountries,
    getStates,
    searchCities,
    searchAreas,
    getClinics,
    CountryItem,
    StateItem,
    CityItem,
    AreaItem,
    ClinicItem
} from "../services/referenceService";
import { doctorService, Doctor } from "../services/doctorService";
import { CircularProgress } from "@mui/material";

export default function AddDoctor() {
    const navigate = useNavigate();
    const location = useLocation();
    const editingDoctor = location.state as Doctor | null;

    const [formData, setFormData] = useState({
        firstName: "",
        middleName: "",
        lastName: "",
        clinicId: "",
        registrationNo: "",
        speciality: "",
        practisingYear: "",
        mobile1: "",
        mobile2: "",
        residentialNo: "",
        emergencyNumber: "",
        wappNo: "",
        emailid: "",
        doctorQual: "",
        residentialAdd1: "",
        residentialAdd2: "",
        countryId: "",
        stateId: "",
        cityId: "",
        areaId: "",
        baseLocation: "",
        defaultFees: "",
        ipdDr: false,
        opdDr: false,
        doctorPhoto: "", // Placeholder for file
        profileImage: "" // Placeholder for file
    });

    const [clinics, setClinics] = useState<ClinicItem[]>([]);
    const [countries, setCountries] = useState<CountryItem[]>([]);
    const [states, setStates] = useState<StateItem[]>([]);
    const [cities, setCities] = useState<CityItem[]>([]);
    const [areas, setAreas] = useState<AreaItem[]>([]);

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [countriesData, clinicsData] = await Promise.all([
                    getCountries(),
                    getClinics()
                ]);
                setCountries(countriesData);
                setClinics(clinicsData);

                if (editingDoctor) {
                    setFormData({
                        firstName: editingDoctor.firstName || "",
                        middleName: editingDoctor.middleName || "",
                        lastName: editingDoctor.lastName || "",
                        clinicId: editingDoctor.clinicId || "",
                        registrationNo: editingDoctor.registrationNo || "",
                        speciality: editingDoctor.speciality || "",
                        practisingYear: editingDoctor.practisingYear || "",
                        mobile1: editingDoctor.mobile1 || "",
                        mobile2: editingDoctor.mobile2 || "",
                        residentialNo: editingDoctor.residentialNo || "",
                        emergencyNumber: editingDoctor.emergencyNumber || "",
                        wappNo: editingDoctor.wappNo || "",
                        emailid: editingDoctor.emailid || "",
                        doctorQual: editingDoctor.doctorQual || "",
                        residentialAdd1: editingDoctor.residentialAdd1 || "",
                        residentialAdd2: editingDoctor.residentialAdd2 || "",
                        countryId: editingDoctor.countryId || "",
                        stateId: editingDoctor.stateId || "",
                        cityId: editingDoctor.cityId || "",
                        areaId: editingDoctor.areaId || "",
                        baseLocation: editingDoctor.baseLocation || "",
                        defaultFees: editingDoctor.defaultFees || "",
                        ipdDr: editingDoctor.ipdDr || false,
                        opdDr: editingDoctor.opdDr || false,
                        doctorPhoto: editingDoctor.doctorPhoto || "",
                        profileImage: editingDoctor.profileImage || ""
                    });

                    if (editingDoctor.countryId) {
                        const statesData = await getStates(editingDoctor.countryId);
                        setStates(statesData);
                    }
                }
            } catch (err: any) {
                console.error("Error loading initial data:", err);
                setError("Failed to load reference data");
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [editingDoctor]);

    const handleCountryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const countryId = e.target.value;
        setFormData(prev => ({ ...prev, countryId, stateId: "", cityId: "", areaId: "" }));
        if (countryId) {
            try {
                const statesData = await getStates(countryId);
                setStates(statesData);
            } catch (err) {
                console.error("Error fetching states:", err);
            }
        } else {
            setStates([]);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = async () => {
        if (!formData.firstName || !formData.mobile1) {
            setError("First Name and Mobile 1 are required");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            if (editingDoctor && editingDoctor.id) {
                await doctorService.updateDoctor(editingDoctor.id, formData);
            } else {
                await doctorService.createDoctor(formData);
            }
            navigate("/manage-doctors");
        } catch (err: any) {
            console.error("Error saving doctor:", err);
            setError(err.message || "Failed to save doctor");
        } finally {
            setSubmitting(false);
        }
    };

    const handleClear = () => {
        setFormData({
            firstName: "",
            middleName: "",
            lastName: "",
            clinicId: "",
            registrationNo: "",
            speciality: "",
            practisingYear: "",
            mobile1: "",
            mobile2: "",
            residentialNo: "",
            emergencyNumber: "",
            wappNo: "",
            emailid: "",
            doctorQual: "",
            residentialAdd1: "",
            residentialAdd2: "",
            countryId: "",
            stateId: "",
            cityId: "",
            areaId: "",
            baseLocation: "",
            defaultFees: "",
            ipdDr: false,
            opdDr: false,
            doctorPhoto: "",
            profileImage: ""
        });
        setStates([]);
        setError(null);
    };

    return (
        <div className="container-fluid" style={{ fontFamily: "'Roboto', sans-serif", padding: "20px" }}>
            <style>{`
        .form-label {
          font-weight: 500;
          color: #333;
          margin-bottom: 8px;
          display: block;
          font-size: 0.9rem;
        }
        .form-control {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 0.9rem;
          transition: border-color 0.2s;
        }
        .form-control:focus {
          border-color: rgb(0, 123, 255);
          outline: none;
        }
        .btn-custom {
          padding: 8px 24px;
          border: none;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background-color 0.2s;
          color: white;
        }
        .btn-submit { background-color: rgb(0, 123, 255); }
        .btn-submit:hover { background-color: rgb(0, 100, 200); }
        
        .btn-clear { background-color: rgb(0, 123, 255); }
        .btn-clear:hover { background-color: rgb(0, 100, 200); }
        
        .btn-print { background-color: #6c757d; opacity: 0.6; }
        
        .btn-back { background-color: rgb(0, 123, 255); }
        .btn-back:hover { background-color: rgb(0, 100, 200); }

        .form-row {
          display: flex;
          margin-bottom: 20px;
          gap: 40px;
        }
        .form-group {
          flex: 1;
        }
        .header-title {
          font-weight: bold;
          font-size: 1.8rem;
          color: #212121;
          margin-bottom: 30px;
          margin-top: 10px;
        }
        .upload-btn {
            background-color: rgb(0, 123, 255);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 0 4px 4px 0;
            cursor: pointer;
        }
        .input-group {
            display: flex;
        }
        .input-group .form-control {
            border-radius: 4px 0 0 4px;
        }
      `}</style>

            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <h1 className="header-title">{editingDoctor ? "Edit Doctor" : "Add Doctor"}</h1>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <CircularProgress />
                    </div>
                ) : (
                    <div>
                        {error && (
                            <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
                                {error}
                            </div>
                        )}

                        {/* Clinic Selection - Added as requested */}
                        <div className="form-row">
                            <div className="form-group" style={{ maxWidth: 'calc(33.33% - 27px)' }}>
                                <label className="form-label">Clinic</label>
                                <select
                                    className="form-control"
                                    name="clinicId"
                                    value={formData.clinicId}
                                    onChange={handleInputChange}
                                >
                                    <option value="">--Select Clinic--</option>
                                    {clinics.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">First Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    placeholder="Enter First Name"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Middle Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="middleName"
                                    value={formData.middleName}
                                    onChange={handleInputChange}
                                    placeholder="Enter Middle Name"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Last Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    placeholder="Enter Last Name"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Doctor Photo</label>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Upload image"
                                        readOnly
                                    />
                                    <button className="upload-btn">Upload</button>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Registration No</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="registrationNo"
                                    value={formData.registrationNo}
                                    onChange={handleInputChange}
                                    placeholder="Enter Registration No"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Speciality</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="speciality"
                                    value={formData.speciality}
                                    onChange={handleInputChange}
                                    placeholder="Enter Speciality"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Residential No</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="residentialNo"
                                    value={formData.residentialNo}
                                    onChange={handleInputChange}
                                    placeholder="Enter Residential No"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Practising Year</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="practisingYear"
                                    value={formData.practisingYear}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Mobile 1</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="mobile1"
                                    value={formData.mobile1}
                                    onChange={handleInputChange}
                                    placeholder="Enter Mobile 1"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Mobile 2</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="mobile2"
                                    value={formData.mobile2}
                                    onChange={handleInputChange}
                                    placeholder="Enter Mobile 2"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Emergency Number</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="emergencyNumber"
                                    value={formData.emergencyNumber}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Wapp No</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="wappNo"
                                    value={formData.wappNo}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Email ID</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    name="emailid"
                                    value={formData.emailid}
                                    onChange={handleInputChange}
                                    placeholder="Enter Your Email"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Doctor Qualification</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="doctorQual"
                                    value={formData.doctorQual}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Residential Add1</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="residentialAdd1"
                                    value={formData.residentialAdd1}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Residential Add2</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="residentialAdd2"
                                    value={formData.residentialAdd2}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Country</label>
                                <select
                                    className="form-control"
                                    name="countryId"
                                    value={formData.countryId}
                                    onChange={handleCountryChange}
                                >
                                    <option value="">--Select Country--</option>
                                    {countries.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">State</label>
                                <select
                                    className="form-control"
                                    name="stateId"
                                    value={formData.stateId}
                                    onChange={handleInputChange}
                                    disabled={!formData.countryId}
                                >
                                    <option value="">--Select State--</option>
                                    {states.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">City</label>
                                <select
                                    className="form-control"
                                    name="cityId"
                                    value={formData.cityId}
                                    onChange={handleInputChange}
                                >
                                    <option value="">--Select City--</option>
                                    {/* Populate if cities available */}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Area</label>
                                <select
                                    className="form-control"
                                    name="areaId"
                                    value={formData.areaId}
                                    onChange={handleInputChange}
                                >
                                    <option value="">--Select Area--</option>
                                    {/* Populate if areas available */}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Profile Image</label>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Upload Image"
                                        readOnly
                                    />
                                    <button className="upload-btn">Upload</button>
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Base Location</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="baseLocation"
                                    value={formData.baseLocation}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingTop: '30px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        name="ipdDr"
                                        checked={formData.ipdDr}
                                        onChange={handleCheckboxChange}
                                        style={{ width: '18px', height: '18px' }}
                                    />
                                    IPD DR
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        name="opdDr"
                                        checked={formData.opdDr}
                                        onChange={handleCheckboxChange}
                                        style={{ width: '18px', height: '18px' }}
                                    />
                                    OPD DR
                                </label>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Default Fees</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="defaultFees"
                                    value={formData.defaultFees}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '40px' }}>
                            <button
                                className="btn-custom btn-submit"
                                onClick={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting ? "Saving..." : "Submit"}
                            </button>
                            <button
                                className="btn-custom btn-clear"
                                onClick={handleClear}
                                disabled={submitting}
                            >
                                Clear
                            </button>
                            <button className="btn-custom btn-print">
                                Print
                            </button>
                            <button
                                className="btn-custom btn-back"
                                onClick={() => navigate("/manage-doctors")}
                            >
                                Back
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
