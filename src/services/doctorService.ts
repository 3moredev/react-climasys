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
  }
};


