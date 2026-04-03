import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const basePath = env.VITE_BASE_PATH ?? '/music';
    return {
        plugins: [react()],
        base: basePath.endsWith('/') ? basePath : `${basePath}/`,
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        optimizeDeps: {
            // Tone.js uses dynamic imports — pre-bundle it
            include: ['tone'],
        },
        server: {
            port: 5173,
        },
    };
});
