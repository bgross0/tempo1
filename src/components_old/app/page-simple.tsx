export default function SimpleHome() {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#0070f3', fontSize: '2.5rem' }}>Next.js Test Page</h1>
      <p>This is a minimal test page to diagnose routing issues.</p>
      
      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #eaeaea', borderRadius: '5px' }}>
        <h2>Diagnostic Information</h2>
        <ul>
          <li>Page: /page-simple.tsx</li>
          <li>Time: {new Date().toLocaleString()}</li>
          <li>Rendering Mode: Static (SSG)</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        <h2>Test Links</h2>
        <ul>
          <li><a href="/" style={{ color: '#0070f3' }}>Go to Home</a></li>
          <li><a href="/status" style={{ color: '#0070f3' }}>Go to Status Page</a></li>
        </ul>
      </div>
    </div>
  );
}