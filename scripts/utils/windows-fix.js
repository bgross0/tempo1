/**
 * Windows compatibility fix for Next.js
 * This script creates the .next directory structure for WSL2/Windows environments
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Running Windows/.next directory fix...');

// Create the .next directory in the current directory
const nextDir = path.join(process.cwd(), '.next');

// Force create directory structure
try {
  // Create directories using native Node.js methods
  const dirsToCreate = [
    nextDir,
    path.join(nextDir, 'cache'),
    path.join(nextDir, 'server'),
    path.join(nextDir, 'static'),
  ];

  for (const dir of dirsToCreate) {
    if (!fs.existsSync(dir)) {
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // Set full permissions
  for (const dir of dirsToCreate) {
    try {
      fs.chmodSync(dir, 0o777);
      console.log(`Set permissions for: ${dir}`);
    } catch (err) {
      console.log(`Could not set permissions for: ${dir}`);
    }
  }

  console.log('✅ Successfully created .next directory structure');
  console.log('\nNow you can run:');
  console.log('npm run dev');
} catch (error) {
  console.error('❌ Error creating .next directory:', error.message);
  console.log('\nYou might need to run this command from Windows cmd.exe:');
  console.log('mkdir .next .next\\cache .next\\server .next\\static');
}