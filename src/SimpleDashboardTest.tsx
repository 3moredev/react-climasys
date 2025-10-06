import React from 'react';

export default function SimpleDashboardTest() {
  console.log('SimpleDashboardTest: Component rendering');
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      backgroundColor: '#f0f0f0', 
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>📊 Simple Dashboard Test</h1>
      
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        maxWidth: '600px',
        width: '100%'
      }}>
        <h2 style={{ color: '#007bff', marginBottom: '15px' }}>Dashboard Component Test</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <strong>✅ Component Rendering:</strong> This is a simple dashboard test
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <strong>📊 Mock Stats:</strong>
          <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
            <li>Total Patients: 23,250</li>
            <li>Today's Appointments: 23</li>
            <li>Pending Lab Tests: 8</li>
            <li>Pending Prescriptions: 12</li>
            <li>Today's Revenue: ₹15,420</li>
          </ul>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <strong>🔧 Test Actions:</strong>
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          <button 
            onClick={() => {
              console.log('Dashboard test button clicked!');
              alert('Dashboard test button works!');
            }}
            style={{ 
              padding: '10px 20px', 
              fontSize: '14px', 
              cursor: 'pointer',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px'
            }}
          >
            Test Dashboard Button
          </button>
          
          <button 
            onClick={() => {
              window.location.href = '/diagnostic';
            }}
            style={{ 
              padding: '10px 20px', 
              fontSize: '14px', 
              cursor: 'pointer',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px'
            }}
          >
            Back to Diagnostic
          </button>
        </div>
        
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '5px',
          fontSize: '12px',
          color: '#666'
        }}>
          <strong>Debug Info:</strong><br/>
          If you can see this page, the dashboard component structure is working.<br/>
          The issue might be with the actual Dashboard component or its dependencies.
        </div>
      </div>
    </div>
  );
}
