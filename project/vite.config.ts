import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  define: {
    'process.env.PDFJS_WORKER_SRC': JSON.stringify('/assets/pdf.worker.min.js')
  }
});
