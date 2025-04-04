// Simple static file server
const express = require('express');
const path = require('path');
const app = express();
const port = 8000;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Serve index.html for root requests
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Fallback to index.html for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Emergency static server running at http://localhost:${port}`);
  console.log(`This is a fallback server to help diagnose issues with Next.js`);
  console.log(`Try the following:`);
  console.log(`1. Visit http://localhost:${port} to see this emergency page`);
  console.log(`2. Try restarting your Next.js server with 'npm run dev'`);
  console.log(`3. Check for errors in your Next.js server console`);
});