import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const projectRoot = fileURLToPath(new URL('.', import.meta.url));
  const env = loadEnv(mode, projectRoot, 'VITE_');
  const apiTarget = env.VITE_PROXY_TARGET || 'http://localhost:8080';

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      proxy:
        env.VITE_USE_MOCK === 'false'
          ? {
              '/api': {
                target: apiTarget,
                changeOrigin: true,
              },
            }
          : undefined,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ['vue', 'vue-router'],
            icons: ['@lucide/vue'],
          },
        },
      },
    },
  };
});
