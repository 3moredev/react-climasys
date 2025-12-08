import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import {
    getCountries,
    getStates,
    getCities,
    getAreas,
    CountryItem,
    StateItem,
    CityItem,
    AreaItem
} from "../services/referenceService";
import { clinicService, Clinic } from "../services/clinicService";
import { doctorService, Doctor } from "../services/doctorService";
import { CircularProgress } from "@mui/material";

export default function AddClinic() {
    const navigate = useNavigate();
    const location = useLocation();
    const editingClinic = location.state as Clinic | null;

    const [formData, setFormData] = useState({
        doctorId: "",
        name: "",
        address: "",
        countryId: "",
        stateId: "",
        cityId: "",
        areaId: "",
        pincode: "",
        tips: "",
        news: "",
        phoneNo: "",
        faxNo: ""
    });

    const [countries, setCountries] = useState<CountryItem[]>([]);
    const [states, setStates] = useState<StateItem[]>([]);
    const [cities, setCities] = useState<CityItem[]>([]);
    const [areas, setAreas] = useState<AreaItem[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const countriesData = await getCountries();
                setCountries(countriesData);

                const doctorsData = await doctorService.getAllDoctors();
                setDoctors(doctorsData);

                if (editingClinic) {
                    try {
                        // Fetch fresh details
                        const clinicDetails = await clinicService.getClinicById(editingClinic.id);

                        setFormData({
                            doctorId: clinicDetails.doctorId || "",
                            name: clinicDetails.name || "",
                            address: clinicDetails.address || "",
                            countryId: clinicDetails.countryId || "",
                            stateId: clinicDetails.stateId || "",
                            cityId: clinicDetails.cityId || "",
                            areaId: clinicDetails.areaId || "",
                            pincode: clinicDetails.pincode || "",
                            tips: clinicDetails.tips || "",
                            news: clinicDetails.news || "",
                            phoneNo: clinicDetails.phoneNo || "",
                            faxNo: clinicDetails.faxNo || ""
                        });

                        // Fetch dependent data if IDs are present
                        if (clinicDetails.countryId) {
                            const statesData = await getStates(clinicDetails.countryId);
                            setStates(statesData);
                        }
                        if (clinicDetails.stateId) {
                            const citiesData = await getCities(clinicDetails.stateId);
                            setCities(citiesData);
                        }
                        if (clinicDetails.cityId && clinicDetails.stateId) {
                            const areasData = await getAreas(clinicDetails.cityId, clinicDetails.stateId);
                            setAreas(areasData);
                        }
                    } catch (err) {
                        console.error("Error fetching clinic details:", err);
                        // Fallback to passed state if fetch fails
                        setFormData({
                            doctorId: editingClinic.doctorId || "",
                            name: editingClinic.name || "",
                            address: editingClinic.address || "",
                            countryId: editingClinic.countryId || "",
                            stateId: editingClinic.stateId || "",
                            cityId: editingClinic.cityId || "", // Assuming city name is stored in city field for now, or ID if available
                            areaId: editingClinic.areaId || "",
                            pincode: editingClinic.pincode || "",
                            tips: editingClinic.tips || "",
                            news: editingClinic.news || "",
                            phoneNo: editingClinic.phoneNo || "",
                            faxNo: editingClinic.faxNo || ""
                        });
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
    }, [editingClinic]);

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

    const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const stateId = e.target.value;
        setFormData(prev => ({ ...prev, stateId, cityId: "", areaId: "" }));
        if (stateId) {
            try {
                const citiesData = await getCities(stateId);
                setCities(citiesData);
            } catch (err) {
                console.error("Error fetching cities:", err);
            }
        } else {
            setCities([]);
        }
    }


    const handleCityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const cityId = e.target.value;
        setFormData(prev => ({ ...prev, cityId, areaId: "" }));
        if (cityId && formData.stateId) {
            try {
                const areasData = await getAreas(cityId, formData.stateId);
                setAreas(areasData);
            } catch (err) {
                console.error("Error fetching areas:", err);
            }
        } else {
            setAreas([]);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            setError("Clinic Name is required");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const payload = {
                ...formData,
                // Map form fields to API expected fields if necessary
            };

            if (editingClinic) {
                await clinicService.updateClinic(editingClinic.id, payload);
            } else {
                await clinicService.createClinic(payload);
            }
            navigate("/manage-clinics");
        } catch (err: any) {
            console.error("Error saving clinic:", err);
            setError(err.message || "Failed to save clinic");
        } finally {
            setSubmitting(false);
        }
    };

    const handleClear = () => {
        setFormData({
            doctorId: "",
            name: "",
            address: "",
            countryId: "",
            stateId: "",
            cityId: "",
            areaId: "",
            pincode: "",
            tips: "",
            news: "",
            phoneNo: "",
            faxNo: ""
        });
        setStates([]);
        setCities([]);
        setAreas([]);
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
        
        .btn-print { background-color: #6c757d; opacity: 0.6; } /* Visual only */
        
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
      `}</style>

            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <h1 className="header-title">{editingClinic ? "Edit Clinic" : "Add Clinic"}</h1>

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

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Clinic Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter Clinic Name"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Clinic Address</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="Enter Clinic Address"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Doctor</label>
                                <select
                                    className="form-control"
                                    name="doctorId"
                                    value={formData.doctorId}
                                    onChange={handleInputChange}
                                >
                                    <option value="">--Select Doctor--</option>
                                    {doctors.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
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
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">State</label>
                                <select
                                    className="form-control"
                                    name="stateId"
                                    value={formData.stateId}
                                    onChange={handleStateChange}
                                    disabled={!formData.countryId}
                                >
                                    <option value="">--Select State--</option>
                                    {states.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">City</label>
                                <select
                                    className="form-control"
                                    name="cityId"
                                    value={formData.cityId}
                                    onChange={handleCityChange}
                                    disabled={!formData.stateId}
                                >
                                    <option value="">--Select City--</option>
                                    {cities.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Area</label>
                                <select
                                    className="form-control"
                                    name="areaId"
                                    value={formData.areaId}
                                    onChange={handleInputChange}
                                    disabled={!formData.cityId}
                                >

                                    <option value="">--Select Area--</option>
                                    {areas.map(a => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Pincode</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleInputChange}
                                    placeholder="Enter Your Pincode"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Tips</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="tips"
                                    value={formData.tips}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">News</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="news"
                                    value={formData.news}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Phone No</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="phoneNo"
                                    value={formData.phoneNo}
                                    onChange={handleInputChange}
                                    placeholder="Enter Your Phone No"
                                />
                            </div>
                            <div className="form-group" style={{ maxWidth: 'calc(50% - 20px)' }}>
                                <label className="form-label">Fax No</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="faxNo"
                                    value={formData.faxNo}
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
                                onClick={() => navigate("/manage-clinics")}
                            >
                                Back
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}
