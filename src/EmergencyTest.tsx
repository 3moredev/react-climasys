import React from 'react'

// Ultra-minimal test - no Material-UI, no complex imports
function EmergencyTest() {
  console.log('EmergencyTest: Component rendering')
  
  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        Emergency Test - React is Working!
      </h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        If you can see this, React is rendering correctly.
      </p>
      <button 
        onClick={() => {
          console.log('Button clicked!')
          alert('JavaScript is working!')
        }}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Test JavaScript
      </button>
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#999' }}>
        Time: {new Date().toLocaleTimeString()}
      </div>
    </div>
  )
}

export default EmergencyTest
