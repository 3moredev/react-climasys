import React from 'react';

export default function DiagnosticTest() {
  console.log('DiagnosticTest: Component rendering');
  
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
      <h1 style={{ color: '#333', marginBottom: '20px' }}>🔍 Diagnostic Test</h1>
      
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        maxWidth: '600px',
        width: '100%'
      }}>
        <h2 style={{ color: '#007bff', marginBottom: '15px' }}>System Status</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <strong>✅ React:</strong> Working
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <strong>✅ Development Server:</strong> Running on port 5173
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <strong>✅ Component Rendering:</strong> This component is visible
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <strong>🌐 Current URL:</strong> {window.location.href}
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <strong>📱 User Agent:</strong> {navigator.userAgent.substring(0, 50)}...
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <strong>⏰ Timestamp:</strong> {new Date().toLocaleString()}
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <button 
            onClick={() => {
              console.log('Test button clicked!');
              alert('Button works! Check console for log.');
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
            Test JavaScript
          </button>
          
          <button 
            onClick={() => {
              window.location.href = '/login';
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
            Go to Login
          </button>
          
          <button 
            onClick={() => {
              window.location.href = '/test-dashboard';
            }}
            style={{ 
              padding: '10px 20px', 
              fontSize: '14px', 
              cursor: 'pointer',
              backgroundColor: '#ffc107',
              color: 'black',
              border: 'none',
              borderRadius: '5px'
            }}
          >
            Test Dashboard
          </button>
          
          <button 
            onClick={() => {
              window.location.href = '/test-appointment';
            }}
            style={{ 
              padding: '10px 20px', 
              fontSize: '14px', 
              cursor: 'pointer',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '5px'
            }}
          >
            Test Appointments
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
          If you can see this page, React is working correctly.<br/>
          Check the browser console for any JavaScript errors.<br/>
          Use the buttons above to test navigation.
        </div>
      </div>
    </div>
  );
}
