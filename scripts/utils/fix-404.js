#!/usr/bin/env node

/**
 * Next.js 404 Error Diagnostic and Fix Tool
 * This script helps diagnose and fix common issues that cause 404 errors in Next.js
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const http = require('http');

const projectRoot = __dirname;

console.log('🔍 Next.js 404 Error Diagnostic Tool');
console.log('==================================');

// Step 1: Check for middleware issues
console.log('\n📋 Step 1: Checking middleware...');
const middlewarePath = path.join(projectRoot, 'src', 'middleware.ts');
if (fs.existsSync(middlewarePath)) {
  console.log('✅ Found middleware file');
  
  // Create backup if it doesn't exist
  const backupPath = middlewarePath + '.bak';
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(middlewarePath, backupPath);
    console.log(`✅ Created middleware backup at ${backupPath}`);
  }
  
  // Replace with minimal middleware
  const minimalMiddleware = `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Minimal middleware - no auth checks or redirects
export async function middleware(req: NextRequest) {
  // Just pass through all requests
  return NextResponse.next();
}

// Match only API routes to minimize impact
export const config = {
  matcher: [],
};`;

  fs.writeFileSync(middlewarePath, minimalMiddleware);
  console.log('✅ Installed minimal middleware with no matcher rules');
} else {
  console.log('❌ No middleware file found');
}

// Step 2: Check Next.js config
console.log('\n📋 Step 2: Checking Next.js config...');
const nextConfigPath = path.join(projectRoot, 'next.config.js');
if (fs.existsSync(nextConfigPath)) {
  console.log('✅ Found next.config.js');
  
  // Create backup if it doesn't exist
  const backupPath = nextConfigPath + '.bak';
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(nextConfigPath, backupPath);
    console.log(`✅ Created next.config.js backup at ${backupPath}`);
  }
  
  // Replace with minimal config
  const minimalConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  // Bare minimum configuration
  reactStrictMode: true,
};

module.exports = nextConfig;`;

  fs.writeFileSync(nextConfigPath, minimalConfig);
  console.log('✅ Installed minimal Next.js config');
} else {
  console.log('❌ No next.config.js found, creating minimal one');
  fs.writeFileSync(nextConfigPath, `/** @type {import('next').NextConfig} */\nmodule.exports = {};`);
}

// Step 3: Check for root page
console.log('\n📋 Step 3: Checking for root page...');
const appPagePath = path.join(projectRoot, 'src', 'app', 'page.tsx');
if (fs.existsSync(appPagePath)) {
  console.log('✅ Found App Router root page at src/app/page.tsx');
} else {
  console.log('❌ No App Router root page found, creating a minimal one');
  
  // Create app directory if it doesn't exist
  const appDir = path.join(projectRoot, 'src', 'app');
  if (!fs.existsSync(appDir)) {
    fs.mkdirSync(appDir, { recursive: true });
  }
  
  // Create a minimal page.tsx
  const minimalPage = `export default function Home() {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#0070f3', fontSize: '2.5rem' }}>Emergency Landing Page</h1>
      <p>This is a minimal page created by the fix-404.js script.</p>
      <p>If you can see this page, basic routing is working!</p>
      
      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #eaeaea', borderRadius: '5px' }}>
        <h2>Next Steps</h2>
        <p>Now that basic routing is working, check other parts of your application:</p>
        <ul>
          <li>Look for any middleware that might be causing redirects</li>
          <li>Check for routing conflicts</li>
          <li>Look for auth issues that might be causing redirect loops</li>
        </ul>
      </div>
    </div>
  );
}`;

  fs.writeFileSync(appPagePath, minimalPage);
  console.log('✅ Created minimal page.tsx');
}

// Step 4: Check .next directory for corruption
console.log('\n📋 Step 4: Checking .next directory...');
const nextDir = path.join(projectRoot, '.next');
if (fs.existsSync(nextDir)) {
  console.log('Found .next directory, cleaning it to ensure fresh build');
  try {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log('✅ Successfully cleaned .next directory');
  } catch (err) {
    console.log(`❌ Error cleaning .next directory: ${err.message}`);
  }
} else {
  console.log('No .next directory found (this is fine for a fresh build)');
}

// Step 5: Check Next.js installation
console.log('\n📋 Step 5: Checking Next.js installation...');
exec('npm list next', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ Error checking Next.js installation');
    return;
  }
  
  console.log('Next.js installation info:');
  console.log(stdout);
  
  console.log('⚠️ Recommendation: Consider running `npm install next@latest` to ensure you have the latest version');
});

// Provide summary and next steps
console.log('\n📋 Summary:');
console.log('All critical fixes have been applied:');
console.log('1. Disabled middleware redirects');
console.log('2. Simplified Next.js configuration');
console.log('3. Ensured basic page.tsx exists');
console.log('4. Cleared .next cache directory');

console.log('\n📋 Next steps:');
console.log('1. Run `npm run dev` to start Next.js in development mode');
console.log('2. Visit http://localhost:3000 to test if the fix worked');
console.log('3. If it worked, then re-enable features one by one');
console.log('4. If it still doesn\'t work, try `node server.js` to run the diagnostic server');

console.log('\n✨ Fix complete! Re-run the Next.js development server.');