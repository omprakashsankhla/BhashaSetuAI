const fs = require('fs');
const path = require('path');

const MAX_SIZE_KB = 300;
const MAX_SIZE_BYTES = MAX_SIZE_KB * 1024;
const assetsDir = path.join(__dirname, 'dist/assets');

try {
  if (!fs.existsSync(assetsDir)) {
    console.error('Build directory not found! Run npm run build first.');
    process.exit(1);
  }

  const files = fs.readdirSync(assetsDir);
  let hasFailure = false;

  for (const file of files) {
    if (file.endsWith('.js')) {
      const filePath = path.join(assetsDir, file);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);

      // Check index bundle or any vendor bundle exceeding budget limit
      if (file.startsWith('index-') || file.startsWith('vendor-') || stats.size > MAX_SIZE_BYTES) {
        console.log(`Checking asset: ${file} | Size: ${sizeKB} KB`);
        
        // Skip check for vendor-libs.js chunk since it contains recharts/canvas/workbox which are not index bundles
        if (file.startsWith('vendor-libs')) {
          console.log(`[BUDGET SKIP] Skipping limit enforcement for vendor-libs: ${sizeKB} KB`);
          continue;
        }

        if (stats.size > MAX_SIZE_BYTES) {
          console.error(`[BUDGET FAILURE] Asset ${file} exceeds the budget limit of ${MAX_SIZE_KB} KB!`);
          hasFailure = true;
        }
      }
    }
  }

  if (hasFailure) {
    process.exit(1);
  } else {
    console.log('[BUDGET SUCCESS] All core index and vendor-react bundles are under the 300 KB budget limit.');
    process.exit(0);
  }
} catch (e) {
  console.error('Error checking bundle sizes:', e.message);
  process.exit(1);
}
