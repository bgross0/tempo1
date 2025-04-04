#!/usr/bin/env node

/**
 * Next.js Reset and Rebuild Script
 * 
 * This script does a complete reset of Next.js cached files and configuration
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Next.js Reset and Rebuild Script');
console.log('==================================');

// Step 1: Remove .next directory
console.log('\n📋 Step 1: Removing .next directory...');
const nextDir = path.join(__dirname, '.next');
if (fs.existsSync(nextDir)) {
  try {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log('✅ Successfully removed .next directory');
  } catch (err) {
    console.error(`❌ Error removing .next directory: ${err.message}`);
  }
} else {
  console.log('ℹ️ No .next directory found');
}

// Step 2: Create minimal next.config.js
console.log('\n📋 Step 2: Creating minimal next.config.js...');
const nextConfigPath = path.join(__dirname, 'next.config.js');
const nextConfigBackupPath = path.join(__dirname, 'next.config.js.bak');

// Backup existing config if it exists
if (fs.existsSync(nextConfigPath)) {
  fs.copyFileSync(nextConfigPath, nextConfigBackupPath);
  console.log(`✅ Backed up existing next.config.js to ${nextConfigBackupPath}`);
}

// Create minimal config
const minimalConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;`;

fs.writeFileSync(nextConfigPath, minimalConfig);
console.log('✅ Created minimal next.config.js');

// Step 3: Disable middleware
console.log('\n📋 Step 3: Disabling middleware...');
const middlewarePath = path.join(__dirname, 'src', 'middleware.ts');
if (fs.existsSync(middlewarePath)) {
  const middlewareBackupPath = path.join(__dirname, 'src', 'middleware.ts.bak');
  fs.copyFileSync(middlewarePath, middlewareBackupPath);
  console.log(`✅ Backed up middleware to ${middlewareBackupPath}`);
  
  // Create empty middleware with no matchers
  const emptyMiddleware = `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};`;
  
  fs.writeFileSync(middlewarePath, emptyMiddleware);
  console.log('✅ Disabled middleware');
} else {
  console.log('ℹ️ No middleware found');
}

// Step 4: Try to build
console.log('\n📋 Step 4: Running build...');
try {
  console.log('Starting next build...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (err) {
  console.error(`❌ Build failed: ${err.message}`);
}

// Step 5: Try to start development server
console.log('\n📋 Step 5: Starting development server...');
try {
  console.log('Running next dev...');
  console.log('✅ Please keep this terminal window open to see server logs');
  console.log('✅ Press Ctrl+C to stop the server');
  console.log('==================================');
  execSync('npm run dev', { stdio: 'inherit' });
} catch (err) {
  console.error(`Server stopped: ${err.message}`);
}