import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = dirname(fileURLToPath(import.meta.url));
let productVersion = '0.0.0';
try {
  const versionPath = join(__dirname, '../../version.json');
  productVersion = JSON.parse(readFileSync(versionPath, 'utf8')).version;
} catch {
  // keep fallback
}

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(productVersion),
  },
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
