import api from './api'

export type DoctorDetail = Record<string, any>;

export interface Doctor {
  id: string;
  firstName: string;
  middleName?: string;
  lastName?: string;
  clinicId?: string;
  clinicName?: string;
  registrationNo: string;
  speciality: string;
  residentialNo?: string;
  practisingYear?: string;
  mobile1: string;
  mobile2?: string;
  emergencyNumber?: string;
  wappNo?: string;
  emailid?: string;
  doctorQual?: string;
  residentialAdd1?: string;
  residentialAdd2?: string;
  countryId?: string;
  stateId?: string;
  cityId?: string;
  areaId?: string;
  profileImage?: string; // URL or base64
  doctorPhoto?: string; // URL or base64
  baseLocation?: string;
  ipdDr: boolean;
  opdDr: boolean;
  defaultFees?: string;

  // Legacy/Mapped fields for display
  name?: string; // Composite name
  mobileNo?: string; // Mapped to mobile1
  opdIpd?: string; // Display string
}

export const doctorService = {
  async getDoctorDetails(doctorId: string): Promise<DoctorDetail[]> {
    const res = await api.get<DoctorDetail[]>(`/doctors/${doctorId}/details`);
    return res.data;
  },
  async getDoctorFirstName(doctorId: string): Promise<string | null> {
    const details = await this.getDoctorDetails(doctorId);
    if (!details || details.length === 0) return null;
    const row = details[0] || {};
    // Try common key variants
    const candidates = [
      'firstName', 'first_name', 'firstname', 'doctorFirstName', 'doctor_first_name', 'givenName', 'given_name'
    ];
    for (const key of candidates) {
      if (row[key] != null && String(row[key]).trim().length > 0) {
        return String(row[key]).trim();
      }
    }
    // Fallback: if there's a full name, split
    const fullNameKey = ['name', 'fullName', 'full_name', 'doctorName', 'doctor_name'].find(k => row[k] != null);
    if (fullNameKey) {
      const parts = String(row[fullNameKey]).trim().split(/\s+/);
      if (parts.length > 0) return parts[0];
    }
    return null;
  },
  /**
   * Get all doctors
   */
  async getAllDoctors(): Promise<Doctor[]> {
    try {
      console.log('Fetching all doctors...');
      const response = await api.get('/doctors/all-doctors');
      console.log('Get all doctors response:', response.data);

      const data = Array.isArray(response.data) ? response.data : [];

      return data.map((item: any) => ({
        id: item.doctor_id || item.id || '',
        firstName: item.firstName || item.first_name || '', // Fallback if split names not available
        middleName: item.middleName || item.middle_name || '',
        lastName: item.lastName || item.last_name || '',
        name: item.doctor_name || `${item.firstName || item.first_name || ''} ${item.lastName || item.last_name || ''}`.trim(),
        clinicId: item.clinicId || item.clinic_id || '',
        clinicName: item.clinicName || item.clinic_name || '',
        registrationNo: item.registrationNo || item.registration_no || '',
        speciality: item.speciality || item.specialization || '',
        residentialNo: item.residentialNo || item.residential_no || '',
        practisingYear: item.practisingYear || item.practising_year || '',
        mobile1: item.mobile1 || item.mobile_1 || item.phone || '',
        mobile2: item.mobile2 || item.mobile_2 || '',
        emergencyNumber: item.emergencyNumber || item.emergency_no || '',
        wappNo: item.wappNo || item.wapp_no || '',
        emailid: item.emailid || item.email || '',
        doctorQual: item.doctorQual || item.qualification || '',
        residentialAdd1: item.residentialAdd1 || item.residential_add_1 || '',
        residentialAdd2: item.residentialAdd2 || item.residential_add_2 || '',
        countryId: item.countryId || item.country_id || '',
        stateId: item.stateId || item.state_id || '',
        cityId: item.cityId || item.city_id || '',
        areaId: item.areaId || item.area_id || '',
        profileImage: item.profileImage || item.profile_image || '',
        doctorPhoto: item.doctorPhoto || item.doctor_photo || '',
        baseLocation: item.baseLocation || item.base_location || '',
        ipdDr: !!(item.ipdDr || item.is_ipd),
        opdDr: !!(item.opdDr || item.is_opd),
        defaultFees: item.defaultFees || item.default_fees || '',

        // Mapped for ManageDoctors table
        mobileNo: item.mobile1 || item.mobile_1 || item.phone || '',
        opdIpd: item.opd_ipd || ''
      }));
    } catch (error: any) {
      console.error('Error fetching doctors:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch doctors');
    }
  },

  /**
   * Get doctor details by ID
   */
  async getDoctorById(id: string): Promise<Doctor> {
    try {
      // Use the new endpoint that returns the entity directly
      const response = await api.get(`/doctors/${id}`);
      const item = response.data;

      return {
        id: item.doctorId || item.id || '',
        firstName: item.firstName || '',
        middleName: item.middleName || '',
        lastName: item.lastName || '',
        name: `${item.firstName || ''} ${item.lastName || ''}`.trim(),
        clinicId: item.clinicId || '', // Note: Entity might not have clinicId directly populated if it's a relation, but proceeding based on assumed usage
        clinicName: '', // New API might not return this, client may need to resolve
        registrationNo: item.registrationNo || '',
        speciality: item.speciality || '',
        residentialNo: item.residentialNo || '',
        practisingYear: item.practisingYear || '',
        mobile1: item.mobile1 || '',
        mobile2: item.mobile2 || '',
        emergencyNumber: item.emergencyNumber || '',
        wappNo: item.wappNo || '',
        emailid: item.emailid || '',
        doctorQual: item.doctorQual || '',
        residentialAdd1: item.residentialAdd1 || '',
        residentialAdd2: item.residentialAdd2 || '',
        countryId: item.countryId || '',
        stateId: item.stateId || '',
        cityId: item.cityId || '',
        areaId: item.areaId || '',
        profileImage: item.profileImage || '',
        doctorPhoto: item.doctorPhoto || '',
        baseLocation: item.baseLocation || '',
        ipdDr: item.ipdDr,
        opdDr: item.opdDr,
        defaultFees: item.defaultFees || '',

        // Mapped for ManageDoctors table (display only)
        mobileNo: item.mobile1 || '',
        opdIpd: (item.ipdDr) && (item.opdDr) ? 'Both' : (item.ipdDr) ? 'IPD' : (item.opdDr) ? 'OPD' : '-'
      };
    } catch (error: any) {
      console.error('Error fetching doctor details:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch doctor details');
    }
  },

  /**
   * Create a new doctor
   */
  async createDoctor(doctorData: Partial<Doctor>): Promise<Doctor> {
    try {
      const payload = {
        firstName: doctorData.firstName,
        middleName: doctorData.middleName,
        lastName: doctorData.lastName,
        clinicId: doctorData.clinicId,
        registrationNo: doctorData.registrationNo,
        speciality: doctorData.speciality,
        residentialNo: doctorData.residentialNo,
        practisingYear: doctorData.practisingYear,
        mobile1: doctorData.mobile1,
        mobile2: doctorData.mobile2,
        emergencyNumber: doctorData.emergencyNumber,
        wappNo: doctorData.wappNo,
        emailid: doctorData.emailid,
        doctorQual: doctorData.doctorQual,
        residentialAdd1: doctorData.residentialAdd1,
        residentialAdd2: doctorData.residentialAdd2,
        countryId: doctorData.countryId,
        stateId: doctorData.stateId,
        cityId: doctorData.cityId,
        areaId: doctorData.areaId,
        baseLocation: doctorData.baseLocation,
        ipdDr: doctorData.ipdDr,
        opdDr: doctorData.opdDr,
        defaultFees: doctorData.defaultFees,
        profileImage: doctorData.profileImage,
        doctorPhoto: doctorData.doctorPhoto
      };

      const response = await api.post('/doctors/save', payload);
      return response.data;
    } catch (error: any) {
      console.error('Error creating doctor:', error);
      throw new Error(error.response?.data?.message || 'Failed to create doctor');
    }
  },

  /**
   * Update an existing doctor
   */
  async updateDoctor(id: string, doctorData: Partial<Doctor>): Promise<Doctor> {
    try {
      const payload = {
        firstName: doctorData.firstName,
        middleName: doctorData.middleName,
        lastName: doctorData.lastName,
        clinicId: doctorData.clinicId,
        registrationNo: doctorData.registrationNo,
        speciality: doctorData.speciality,
        residentialNo: doctorData.residentialNo,
        practisingYear: doctorData.practisingYear,
        mobile1: doctorData.mobile1,
        mobile2: doctorData.mobile2,
        emergencyNumber: doctorData.emergencyNumber,
        wappNo: doctorData.wappNo,
        emailid: doctorData.emailid,
        doctorQual: doctorData.doctorQual,
        residentialAdd1: doctorData.residentialAdd1,
        residentialAdd2: doctorData.residentialAdd2,
        countryId: doctorData.countryId,
        stateId: doctorData.stateId,
        cityId: doctorData.cityId,
        areaId: doctorData.areaId,
        baseLocation: doctorData.baseLocation,
        ipdDr: doctorData.ipdDr,
        opdDr: doctorData.opdDr,
        defaultFees: doctorData.defaultFees,
        profileImage: doctorData.profileImage,
        doctorPhoto: doctorData.doctorPhoto
      };

      const response = await api.put(`/doctors/update/${id}`, payload);
      return response.data;
    } catch (error: any) {
      console.error('Error updating doctor:', error);
      throw new Error(error.response?.data?.message || 'Failed to update doctor');
    }
  },

  /**
   * Delete a doctor
   */
  async deleteDoctor(id: string): Promise<void> {
    try {
      await api.delete(`/doctors/delete/${id}`);
    } catch (error: any) {
      console.error('Error deleting doctor:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete doctor');
    }
  },

  /**
   * Get only doctors that are marked as OPD doctors (opd_dr == true)
   * Used for provider/doctor dropdowns across the app.
   * The backend will automatically use the default_doctor from user_master table based on the logged-in user's session.
   */
  async getOpdDoctors(): Promise<Doctor[]> {
    try {
      console.log('Fetching OPD doctors from /doctors/all endpoint...');
      const response = await api.get('/doctors/all');
      const doctors = response.data || [];

      // Filter for OPD doctors based on common representations
      const opdDoctors = doctors.filter((doctor: any) => {
        const flag = doctor.opd_dr ?? doctor.OPD_DR ?? doctor.opdDoctor ?? doctor.opd_doctor;
        if (flag === true || flag === 1 || flag === '1') return true;
        if (typeof flag === 'string' && flag.trim().toLowerCase() === 'true') return true;
        return false;
      });

      // Transform the response to match our Doctor interface
      const transformedDoctors = opdDoctors.map((doctor: any) => ({
        id: doctor.id || doctor.doctorId || doctor.doctor_id || '',
        name: doctor.name || doctor.doctorName || doctor.doctor_name ||
          `${doctor.firstName || doctor.first_name || ''} ${doctor.lastName || doctor.last_name || ''}`.trim() ||
          `${doctor.specialty || ''} - ${doctor.firstName || doctor.first_name || ''}`.trim(),
        specialty: doctor.specialty || doctor.specialization || doctor.department,
        firstName: doctor.firstName || doctor.first_name,
        lastName: doctor.lastName || doctor.last_name
      }));

      console.log('Transformed OPD doctors:', transformedDoctors);
      return transformedDoctors;
    } catch (error) {
      console.error('Error fetching OPD doctors:', error);
      throw new Error('Failed to fetch OPD doctors from server');
    }
  }
};


