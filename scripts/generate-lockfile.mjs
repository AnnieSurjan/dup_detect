import { execSync } from 'child_process';
import { existsSync, unlinkSync } from 'fs';

// Remove pnpm-lock.yaml if it exists
if (existsSync('pnpm-lock.yaml')) {
  unlinkSync('pnpm-lock.yaml');
  console.log('Deleted pnpm-lock.yaml');
}

// Generate package-lock.json
console.log('Generating package-lock.json...');
execSync('npm install --package-lock-only --ignore-scripts', { stdio: 'inherit' });
console.log('Done! package-lock.json created.');
