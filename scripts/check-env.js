/* global console */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function checkEnv() {
  console.log('🔍 Checking local development environment...');
  
  // 1. Check Node.js Version
  const nodeVersion = process.versions.node;
  const majorNode = parseInt(nodeVersion.split('.')[0], 10);
  if (majorNode < 20) {
    console.error(`❌ Invalid Node version: Expected Node >= 20.x, found ${nodeVersion}`);
    process.exit(1);
  }
  console.log(`✅ Node.js Version: ${nodeVersion}`);

  // 2. Check pnpm Version
  try {
    const pnpmVersion = execSync('pnpm --version').toString().trim();
    const majorPnpm = parseInt(pnpmVersion.split('.')[0], 10);
    if (majorPnpm < 8) {
      console.error(`❌ Invalid pnpm version: Expected pnpm >= 8.x, found ${pnpmVersion}`);
      process.exit(1);
    }
    console.log(`✅ pnpm Version: ${pnpmVersion}`);
  } catch {
    console.error('❌ pnpm is not installed. Please run: npm install -g pnpm');
    process.exit(1);
  }

  // 3. Verify pnpm-lock.yaml existence
  const lockfilePath = path.join(__dirname, '..', 'pnpm-lock.yaml');
  if (!fs.existsSync(lockfilePath)) {
    console.error('❌ Missing pnpm-lock.yaml at root directory. Run "pnpm install" to generate it.');
    process.exit(1);
  }
  console.log('✅ pnpm-lock.yaml detected.');

  console.log('🚀 Environment is 100% operational and contributor-ready!');
  process.exit(0);
}

checkEnv();
