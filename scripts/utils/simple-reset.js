#!/usr/bin/env node

/**
 * Simple Next.js Reset Script
 * This targets only the most critical issues without complex operations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = process.cwd();
const MIDDLEWARE = path.join(ROOT_DIR, 'src', 'middleware.ts');

console.log('🔄 Starting simple Next.js reset...');

// 1. Create minimal middleware.ts
try {
  console.log('📝 Creating minimal middleware.ts...');
  const minimalMiddleware = `
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Minimal middleware that just passes through requests
export function middleware(req: NextRequest) {
  return NextResponse.next();
}

// Empty matcher to avoid applying middleware to routes
export const config = {
  matcher: [],
};
`;
  
  fs.writeFileSync(MIDDLEWARE, minimalMiddleware);
  console.log('✅ Created minimal middleware.ts');
} catch (error) {
  console.error('❌ Failed to create minimal middleware.ts:', error.message);
}

// 2. Remove .next directory with direct Node.js methods
try {
  console.log('🗑️ Removing .next directory...');
  const nextDir = path.join(ROOT_DIR, '.next');
  
  function deleteFolderRecursive(pathToDelete) {
    if (fs.existsSync(pathToDelete)) {
      fs.readdirSync(pathToDelete).forEach((file) => {
        const curPath = path.join(pathToDelete, file);
        if (fs.lstatSync(curPath).isDirectory()) {
          // Recursive case: it's a folder
          deleteFolderRecursive(curPath);
        } else {
          // Base case: it's a file
          try {
            fs.unlinkSync(curPath);
          } catch (err) {
            console.log(`Could not delete file: ${curPath}`);
          }
        }
      });
      
      try {
        fs.rmdirSync(pathToDelete);
      } catch (err) {
        console.log(`Could not delete directory: ${pathToDelete}`);
      }
    }
  }
  
  deleteFolderRecursive(nextDir);
  console.log('✅ Removed .next directory');
} catch (error) {
  console.error('❌ Failed to remove .next directory:', error.message);
}

// 3. Tell the user to run the dev server
console.log('\n🎉 Simple reset completed!');
console.log('\nPlease run:');
console.log('npm run dev');