// Absolute minimal HTTP server
const http = require('http');
const fs = require('fs');
const path = require('path');

// Create an HTTP server
const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  // Serve index.html for root
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Minimal HTTP Server</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .card { border: 1px solid #eee; border-radius: 5px; padding: 20px; margin-bottom: 20px; }
          h1 { color: #0070f3; }
          button { background: #0070f3; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
          button:hover { background: #005cc5; }
          pre { background: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
        </style>
      </head>
      <body>
        <h1>Minimal HTTP Server</h1>
        <p>This is a fallback server to test basic connectivity.</p>
        
        <div class="card">
          <h2>Server Information</h2>
          <p>Server is running on port 3333</p>
          <p>Current time: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="card">
          <h2>Test Next.js</h2>
          <p>Click the button below to check if Next.js is responding:</p>
          <button onclick="checkNextJs()">Check Next.js</button>
          <div id="nextjsResult" style="margin-top: 10px;"></div>
        </div>
        
        <div class="card">
          <h2>Current Environment</h2>
          <pre>Node.js: ${process.version}
Platform: ${process.platform}
Architecture: ${process.arch}
Working Directory: ${process.cwd()}</pre>
        </div>

        <script>
          function checkNextJs() {
            const result = document.getElementById('nextjsResult');
            result.innerHTML = 'Checking Next.js server...';
            
            fetch('http://localhost:3000/api/health', { mode: 'no-cors' })
              .then(() => {
                result.innerHTML = '<span style="color: green;">Next.js server appears to be running!</span>';
              })
              .catch(err => {
                result.innerHTML = '<span style="color: red;">Next.js server is not responding: ' + err.message + '</span>';
              });
          }
        </script>
      </body>
      </html>
    `);
    return;
  }
  
  // Serve an API test endpoint
  if (req.url === '/api/test') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      message: 'Minimal server API is working',
      time: new Date().toISOString()
    }));
    return;
  }
  
  // Default 404 response
  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>404 - Not Found</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #d32f2f; }
      </style>
    </head>
    <body>
      <h1>404 - Not Found</h1>
      <p>The requested URL ${req.url} was not found on this server.</p>
      <p><a href="/">Go back to home</a></p>
    </body>
    </html>
  `);
});

// Start the server
const PORT = 3333;
server.listen(PORT, () => {
  console.log(`Minimal HTTP server running at http://localhost:${PORT}`);
  console.log('This is a simple diagnostic server that doesn\'t require Next.js');
  console.log('It can help determine if the issue is with Next.js or with networking in general.');
});