import React, { useState } from 'react';
import { appointmentService, AppointmentRequest } from '../../services/appointmentService';

/**
 * Test component to verify appointment booking API integration
 * This component can be used to test the booking functionality independently
 */
export default function AppointmentBookingTest() {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const testBooking = async () => {
    setIsLoading(true);
    setTestResult('Testing appointment booking...');
    
    try {
      const testData: AppointmentRequest = {
        visitDate: new Date().toISOString().split('T')[0],
        shiftId: 1,
        clinicId: "CL-00001",
        doctorId: "DR-00010",
        patientId: "TEST-001",
        visitTime: "10:00",
        reportsReceived: false,
        inPerson: true
      };

      const result = await appointmentService.bookAppointment(testData);
      
      if (result.success) {
        setTestResult(`✅ Booking successful! Response: ${JSON.stringify(result, null, 2)}`);
      } else {
        setTestResult(`❌ Booking failed: ${JSON.stringify(result, null, 2)}`);
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h5>Appointment Booking API Test</h5>
        </div>
        <div className="card-body">
          <p>This component tests the appointment booking API integration.</p>
          
          <button 
            className="btn btn-primary"
            onClick={testBooking}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Testing...
              </>
            ) : (
              'Test Booking API'
            )}
          </button>

          {testResult && (
            <div className="mt-3">
              <h6>Test Result:</h6>
              <pre className="bg-light p-3 rounded" style={{ fontSize: '0.9rem' }}>
                {testResult}
              </pre>
            </div>
          )}

          <div className="mt-4">
            <h6>Test Data Used:</h6>
            <ul>
              <li><strong>Visit Date:</strong> Today's date</li>
              <li><strong>Shift ID:</strong> 1 (Morning)</li>
              <li><strong>Clinic ID:</strong> CL-00001</li>
              <li><strong>Doctor ID:</strong> DR-00010</li>
              <li><strong>Patient ID:</strong> TEST-001</li>
              <li><strong>Visit Time:</strong> 10:00</li>
              <li><strong>Reports Received:</strong> false</li>
              <li><strong>In Person:</strong> true</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

