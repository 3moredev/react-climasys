// Simple mock server for testing the dashboard API
const express = require('express');
const cors = require('cors');
const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

// Mock dashboard data with doctor information
const mockDashboardData = {
  totalPatients: 23250,
  todaysAppointments: 23,
  pendingLabTests: 8,
  pendingPrescriptions: 12,
  todaysRevenue: 15420,
  monthlyRevenue: 234500,
  revenueGrowth: 12.5,
  patientQueue: 8,
  emergencyCases: 2,
  dailyCollection: 45000,
  outstandingPayments: 125000,
  staffOnDuty: 12,
  averageConsultationTime: 15,
  noShowRate: 8.5,
  patientSatisfaction: 4.6,
  newPatientsLast30Days: 0,
  malePatients: 11540,
  femalePatients: 11710,
  totalPatientVisits: 16184,
  patientsPerDay: 22,
  totalPrescriptions: 86782,
  installationDate: "04-Jun-2019",
  licenseExpiryDate: "31-Mar-2026",
  // Doctor information
  doctorName: "Dr. John Smith",
  doctorFirstName: "John",
  doctorMiddleName: "",
  doctorLastName: "Smith",
  doctorSpecialization: "General Medicine",
  doctorQualification: "MBBS, MD",
  mainDoctorId: "DOC001",
  // Clinic information
  clinicName: "City Medical Center",
  clinicAddress: "123 Main Street, City, State 12345",
  clinicPhone: "+1-555-0123",
  clinicEmail: "info@citymedical.com"
};

app.get('/api/reports/dashboard', (req, res) => {
  console.log('Dashboard API called with params:', req.query);
  res.json(mockDashboardData);
});

app.listen(port, () => {
  console.log(`Mock server running at http://localhost:${port}`);
  console.log('Dashboard API available at: http://localhost:8080/api/reports/dashboard');
});
