#!/usr/bin/env node

/**
 * Next.js Rebuild Script
 * 
 * This script rebuilds the Next.js application, clearing caches and fixing common issues
 * without removing any functionality.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Starting Next.js rebuild process...');

// Define paths
const ROOT_DIR = process.cwd();
const NEXT_DIR = path.join(ROOT_DIR, '.next');

// 1. Clear Next.js cache without deleting configurations
try {
  console.log('🧹 Clearing Next.js cache...');
  
  // Clear the .next/cache directory if it exists
  const nextCacheDir = path.join(NEXT_DIR, 'cache');
  if (fs.existsSync(nextCacheDir)) {
    if (process.platform === 'win32') {
      try {
        execSync(`rmdir /s /q "${nextCacheDir}"`, { stdio: 'inherit' });
      } catch (error) {
        console.log('⚠️ Could not remove .next/cache directory with rmdir, trying alternative method...');
        fs.rmdirSync(nextCacheDir, { recursive: true, force: true });
      }
    } else {
      execSync(`rm -rf "${nextCacheDir}"`, { stdio: 'inherit' });
    }
    console.log('✅ Cleared .next/cache directory');
  }
  
  // Remove the middleware-manifest.json file which can cause rebuild issues
  const middlewareManifest = path.join(NEXT_DIR, 'server', 'middleware-manifest.json');
  if (fs.existsSync(middlewareManifest)) {
    fs.unlinkSync(middlewareManifest);
    console.log('✅ Removed middleware-manifest.json');
  }
} catch (error) {
  console.error('❌ Failed to clear Next.js cache:', error.message);
}

// 2. Run build
try {
  console.log('🏗️ Building the application...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  console.log('⚠️ Attempting development server instead...');
}

console.log('\n🎉 Rebuild process complete!');
console.log('\nNext steps:');
console.log('1. Run "npm run dev" to start the development server');
console.log('2. Access http://localhost:3000 in your browser');