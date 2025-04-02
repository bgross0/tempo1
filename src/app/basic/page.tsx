'use client';

export default function BasicPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: 'blue', fontSize: '24px' }}>Basic Test Page (Inline Styles)</h1>
      <p>This page uses inline styles to test if React rendering is working correctly.</p>
      
      <div style={{ marginTop: '20px' }}>
        <button 
          style={{ 
            backgroundColor: 'blue', 
            color: 'white', 
            padding: '10px 20px', 
            border: 'none', 
            borderRadius: '4px' 
          }}
          onClick={() => alert('Button clicked!')}
        >
          Test Button (Inline Styles)
        </button>
      </div>
      
      <hr style={{ margin: '20px 0' }} />
      
      <h2 style={{ color: 'green', fontSize: '20px' }}>Tailwind CSS Test</h2>
      <div className="p-4 mt-4 bg-green-100 rounded-lg">
        <p className="text-green-800">This should have a green background with green text</p>
      </div>
      
      <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md">
        Tailwind Button
      </button>
    </div>
  );
}
