import api from './api'

export type DoctorDetail = Record<string, any>;

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
  }
};


