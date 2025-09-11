import { defineConfig } from '@vben/vite-config';

import ElementPlus from 'unplugin-element-plus/vite';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      plugins: [
        ElementPlus({
          format: 'esm',
        }),
      ],
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            // backend proxy target address
            target: 'http://localhost:3000',
            ws: true,
            rewrite: (path) => path.replace(/^\/api/, '/api'),
          },
        },
      },
    },
  };
});
