#!/usr/bin/env node

/**
 * Next.js Clean Rebuild Script
 * This script cleans only the cache files without removing your code
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Starting Next.js clean rebuild...');

// Define paths
const ROOT_DIR = process.cwd();
const NEXT_DIR = path.join(ROOT_DIR, '.next');
const NEXT_CACHE_DIR = path.join(NEXT_DIR, 'cache');

// Function to remove directories safely
function removeDir(dir) {
  if (fs.existsSync(dir)) {
    if (process.platform === 'win32') {
      try {
        execSync(`rmdir /s /q "${dir}"`, { stdio: 'inherit' });
      } catch (error) {
        console.log(`⚠️ Could not remove directory with rmdir: ${dir}`);
        fs.rmdirSync(dir, { recursive: true, force: true });
      }
    } else {
      execSync(`rm -rf "${dir}"`, { stdio: 'inherit' });
    }
    console.log(`✅ Removed directory: ${dir}`);
  }
}

// 1. Clear .next/cache directory which holds build cache
try {
  console.log('🧹 Clearing Next.js cache...');
  removeDir(NEXT_CACHE_DIR);
} catch (error) {
  console.error('⚠️ Error clearing Next.js cache:', error.message);
}

// 2. Build the application
try {
  console.log('🏗️ Building the application...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
}

console.log('🚀 Starting the development server...');
console.log('Run "npm run dev" to start the development server');