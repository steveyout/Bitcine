import fs from 'fs';
import path from 'path';

const distHtml = path.join(process.cwd(), 'dist', 'index.html');
const distEjs = path.join(process.cwd(), 'dist', 'index.ejs');

if (fs.existsSync(distHtml)) {
  fs.copyFileSync(distHtml, distEjs);
  fs.unlinkSync(distHtml);
  console.log('[Post-Build] Successfully transformed index.html build into index.ejs');
} else {
  console.error('[Post-Build] Build output index.html not found! Ensure vite build ran correctly.');
  process.exit(1);
}
