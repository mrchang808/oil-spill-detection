import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      // 1. OData Proxy (For searching metadata)
      '/odata': {
        target: 'https://catalogue.dataspace.copernicus.eu',
        changeOrigin: true,
        secure: false,
      },
      // 2. Process API Proxy (For fetching images statelessly)
      '/process-api': {
        target: 'https://sh.dataspace.copernicus.eu/api/v1/process',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/process-api/, ''),
      },
      '/wms': {
        target: 'https://sh.dataspace.copernicus.eu',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/wms/, '/ogc/wms'),
      },
    },
  },
});