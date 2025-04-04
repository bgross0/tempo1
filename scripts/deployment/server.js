// Simple express server to check if we can access the application
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 8080;

// If there's a public directory, serve it statically
if (fs.existsSync(path.join(__dirname, 'public'))) {
  app.use(express.static(path.join(__dirname, 'public')));
}

// Proxy all requests to Next.js
app.use('/', createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.writeHead(500, {
      'Content-Type': 'text/html'
    });
    res.end(`
      <html>
        <head>
          <title>Next.js Diagnostic Page</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.6; }
            .container { max-width: 800px; margin: 0 auto; }
            h1 { color: #d32f2f; }
            h2 { color: #2c3e50; margin-top: 30px; }
            pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
            .error { color: #d32f2f; }
            .success { color: #388e3c; }
            .info { color: #1976d2; }
            button { background: #1976d2; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; }
            button:hover { background: #1565c0; }
            .card { background: white; padding: 20px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Connection Error</h1>
            <div class="card error">
              <p>Could not connect to Next.js server at <strong>http://localhost:3000</strong></p>
              <p>Error: ${err.message}</p>
            </div>
            
            <h2>Troubleshooting</h2>
            <div class="card">
              <p>1. Make sure the Next.js development server is running:</p>
              <pre>npm run dev</pre>
              
              <p>2. Check if there are any errors in the Next.js server console</p>
              
              <p>3. Try accessing the Next.js server directly at <a href="http://localhost:3000">http://localhost:3000</a></p>
              
              <p>4. Check if port 3000 is already in use:</p>
              <pre>npx kill-port 3000</pre>
              
              <p>5. If using WSL, ensure port forwarding is working</p>
            </div>
            
            <div class="card">
              <h3>Technical Information</h3>
              <p>Proxy target: http://localhost:3000</p>
              <p>Current URL: ${req.url}</p>
              <p>Method: ${req.method}</p>
            </div>
          </div>
        </body>
      </html>
    `);
  }
}));

// Start the server
app.listen(port, () => {
  console.log(`Diagnostic server running at http://localhost:${port}`);
  console.log(`This server will proxy requests to http://localhost:3000 (Next.js)`);
  console.log('If you can access this server but not Next.js, it suggests a Next.js config issue');
});