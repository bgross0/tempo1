#!/usr/bin/env node

/**
 * Fresh Start Script
 * This script performs a complete reset and verifies core files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const projectRoot = __dirname;

console.log('🔄 Fresh Start Script - Complete Reset');
console.log('=====================================');
console.log('This script will perform a complete reset of your Next.js project configuration.');
console.log('It will reset middleware, next.config.js, and clear caches.');
console.log('Backups will be created of modified files.');

rl.question('\nDo you want to continue? (y/n): ', (answer) => {
  if (answer.toLowerCase() !== 'y') {
    console.log('Operation cancelled.');
    rl.close();
    return;
  }

  try {
    console.log('\n🔍 Starting reset process...');
    
    // Step 1: Create minimal package.json if necessary
    console.log('\n📋 Step 1: Verifying minimal Next.js setup...');
    
    // Check if package.json exists
    const packageJsonPath = path.join(projectRoot, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      console.log('❌ package.json not found. Creating minimal version...');
      const minimalPackageJson = {
        name: "nextjs-project",
        version: "0.1.0",
        private: true,
        scripts: {
          "dev": "next dev",
          "build": "next build",
          "start": "next start",
          "lint": "next lint"
        },
        dependencies: {
          "next": "^13.4.0",
          "react": "^18.2.0",
          "react-dom": "^18.2.0"
        }
      };
      fs.writeFileSync(packageJsonPath, JSON.stringify(minimalPackageJson, null, 2));
      console.log('✅ Created minimal package.json');
    } else {
      console.log('✅ package.json exists');
    }
    
    // Step 2: Create/reset next.config.js
    console.log('\n📋 Step 2: Resetting Next.js configuration...');
    const nextConfigPath = path.join(projectRoot, 'next.config.js');
    const nextConfigBackupPath = path.join(projectRoot, 'next.config.js.backup');
    
    // Backup existing config if it exists
    if (fs.existsSync(nextConfigPath)) {
      fs.copyFileSync(nextConfigPath, nextConfigBackupPath);
      console.log(`✅ Backed up existing next.config.js to ${nextConfigBackupPath}`);
    }
    
    // Create minimal next.config.js
    const minimalNextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;`;
    
    fs.writeFileSync(nextConfigPath, minimalNextConfig);
    console.log('✅ Created minimal next.config.js');
    
    // Step 3: Verify/create src/app directory and ensure page.tsx exists
    console.log('\n📋 Step 3: Verifying application structure...');
    const appDir = path.join(projectRoot, 'src', 'app');
    const pageFile = path.join(appDir, 'page.tsx');
    
    // Create src/app if it doesn't exist
    if (!fs.existsSync(appDir)) {
      fs.mkdirSync(appDir, { recursive: true });
      console.log('✅ Created src/app directory');
    } else {
      console.log('✅ src/app directory exists');
    }
    
    // Create basic page.tsx if it doesn't exist
    if (!fs.existsSync(pageFile)) {
      const minimalPage = `export default function Home() {
  return (
    <div>
      <h1>Hello World</h1>
      <p>This is a minimal Next.js page created by the fresh-start script.</p>
    </div>
  );
}`;
      fs.writeFileSync(pageFile, minimalPage);
      console.log('✅ Created basic page.tsx');
    } else {
      console.log('✅ page.tsx exists');
    }
    
    // Step 4: Remove or reset middleware
    console.log('\n📋 Step 4: Handling middleware...');
    const middlewarePath = path.join(projectRoot, 'src', 'middleware.ts');
    const middlewareBackupPath = path.join(projectRoot, 'src', 'middleware.ts.backup');
    
    if (fs.existsSync(middlewarePath)) {
      // Backup existing middleware
      fs.copyFileSync(middlewarePath, middlewareBackupPath);
      console.log(`✅ Backed up existing middleware to ${middlewareBackupPath}`);
      
      // Create minimal middleware
      const minimalMiddleware = `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This is a minimal middleware that does nothing
export function middleware(req: NextRequest) {
  return NextResponse.next();
}

// Empty matcher to effectively disable middleware
export const config = {
  matcher: [],
};`;
      
      fs.writeFileSync(middlewarePath, minimalMiddleware);
      console.log('✅ Created minimal middleware');
    } else {
      console.log('ℹ️ No middleware found (this is fine)');
    }
    
    // Step 5: Clean build artifacts
    console.log('\n📋 Step 5: Cleaning build artifacts...');
    const nextDir = path.join(projectRoot, '.next');
    if (fs.existsSync(nextDir)) {
      try {
        fs.rmSync(nextDir, { recursive: true, force: true });
        console.log('✅ Removed .next directory');
      } catch (err) {
        console.log(`⚠️ Could not remove .next directory: ${err.message}`);
      }
    } else {
      console.log('ℹ️ No .next directory found (this is fine)');
    }
    
    console.log('\n📋 Step 6: Creating test file in public directory...');
    const publicDir = path.join(projectRoot, 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
      console.log('✅ Created public directory');
    }
    
    // Create test.html file
    const testHtmlPath = path.join(publicDir, 'test.html');
    const testHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Next.js Static File Test</title>
</head>
<body>
  <h1>Static File Test</h1>
  <p>If you can see this page, static file serving is working.</p>
  <p>Try accessing the root Next.js app now.</p>
</body>
</html>`;
    
    fs.writeFileSync(testHtmlPath, testHtml);
    console.log('✅ Created test.html in public directory');
    
    // Step 7: Check for port conflicts
    console.log('\n📋 Step 7: Checking for port conflicts...');
    try {
      const portCheck = execSync('netstat -ano | findstr :3000', { stdio: 'pipe' });
      console.log('⚠️ Port 3000 may be in use by another process:');
      console.log(portCheck.toString());
      console.log('Consider killing the process or using a different port with "npm run dev -- -p 3001"');
    } catch (err) {
      console.log('✅ Port 3000 appears to be available');
    }
    
    // Final instructions
    console.log('\n✅ Reset complete!');
    console.log('\nNext steps:');
    console.log('1. Run "npm run dev" to start the development server');
    console.log('2. Visit http://localhost:3000 to see if the minimal app works');
    console.log('3. Try http://localhost:3000/test.html to test static file serving');
    console.log('4. If the minimal app works, gradually re-enable your custom configurations');
    
    rl.close();
  } catch (err) {
    console.error(`❌ An error occurred during reset: ${err}`);
    rl.close();
  }
});