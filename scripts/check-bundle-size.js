import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import zlib from 'zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BUDGET_KB = 80;
const BUNDLE_PATH = path.resolve(__dirname, '../packages/core/dist/index.mjs');

function checkBundleSize() {
  console.log('📦 Auditing library bundle size...');

  if (!fs.existsSync(BUNDLE_PATH)) {
    console.error(`❌ Build output missing at: ${BUNDLE_PATH}`);
    console.error('Please run "pnpm build" inside core package first.');
    process.exit(1);
  }

  const fileContents = fs.readFileSync(BUNDLE_PATH);
  const gzipped = zlib.gzipSync(fileContents);
  const sizeBytes = gzipped.length;
  const sizeKb = sizeBytes / 1024;

  console.log(`✅ Compiled Bundle Size: ${sizeKb.toFixed(2)} KB (Gzipped)`);

  if (sizeKb > BUDGET_KB) {
    console.error(
      `❌ Size Budget Violated: Bundle is ${sizeKb.toFixed(2)} KB, budget is ${BUDGET_KB} KB!`
    );
    process.exit(1);
  }

  console.log(`🚀 Size budget passes: ${sizeKb.toFixed(2)} KB is under ${BUDGET_KB} KB limit.`);
  process.exit(0);
}

checkBundleSize();
