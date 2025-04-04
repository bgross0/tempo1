const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Clearing Next.js cache and temporary files...');

// Define paths
const rootDir = path.resolve(__dirname, '../..');
const nextDir = path.join(rootDir, '.next');
const backupDir = path.join(rootDir, 'config-backups');

try {
  // 1. Backup current config
  if (fs.existsSync(path.join(rootDir, 'next.config.js'))) {
    console.log('Backing up current next.config.js...');
    fs.copyFileSync(
      path.join(rootDir, 'next.config.js'),
      path.join(backupDir, `next.config.js.backup-${Date.now()}`)
    );
  }

  // 2. Use simple config
  console.log('Using simple configuration...');
  fs.copyFileSync(
    path.join(backupDir, 'next.config.simple.js'),
    path.join(rootDir, 'next.config.js')
  );

  // 3. Clear .next directory
  if (fs.existsSync(nextDir)) {
    console.log('Removing .next directory recursively...');
    fs.rmSync(nextDir, { recursive: true, force: true });
  }

  console.log('Reset completed successfully!');
  console.log('Now run "npm run dev" to start the development server with a clean configuration.');
} catch (error) {
  console.error('Error during reset:', error);
  process.exit(1);
}