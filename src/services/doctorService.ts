import api from './api'

export type DoctorDetail = Record<string, any>;

export interface Doctor {
  id: string;
  name: string;
  specialty?: string;
  firstName?: string;
  lastName?: string;
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
   * Get all available doctors in the system
   */
  async getAllDoctors(): Promise<Doctor[]> {
    try {
      console.log('Fetching doctors from /doctors/all endpoint...');
      const response = await api.get('/doctors/all');
      console.log('Raw API response:', response.data);
      
      const doctors = response.data || [];
      
      // Transform the response to match our Doctor interface
      const transformedDoctors = doctors.map((doctor: any) => ({
        id: doctor.id || doctor.doctorId || doctor.doctor_id || '',
        name: doctor.name || doctor.doctorName || doctor.doctor_name || 
              `${doctor.firstName || doctor.first_name || ''} ${doctor.lastName || doctor.last_name || ''}`.trim() ||
              `${doctor.specialty || ''} - ${doctor.firstName || doctor.first_name || ''}`.trim(),
        specialty: doctor.specialty || doctor.specialization || doctor.department,
        firstName: doctor.firstName || doctor.first_name,
        lastName: doctor.lastName || doctor.last_name
      }));
      
      console.log('Transformed doctors:', transformedDoctors);
      return transformedDoctors;
    } catch (error) {
      console.error('Error fetching all doctors:', error);
      throw new Error('Failed to fetch doctors from server');
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


