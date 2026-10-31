import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const shim = (name) => fileURLToPath(new URL(`./src/shims/${name}.js`, import.meta.url));

export default defineConfig({
    base: './',
    // The shared React studios (packages/*) are JSX using the automatic runtime.
    esbuild: { jsx: 'automatic' },
    resolve: {
        // Desktop build only: the web app keeps the real Next modules.
        alias: [
            { find: /^next\/navigation$/, replacement: shim('next-navigation') },
            { find: /^next\/dynamic$/, replacement: shim('next-dynamic') },
            { find: /^next\/link$/, replacement: shim('next-link') },
            { find: /^next\/image$/, replacement: shim('next-image') },
            // The package's dist/ is Babel CJS; its src/ is plain ESM JSX that Vite handles natively.
            { find: /^workflow-builder$/, replacement: fileURLToPath(new URL('./packages/Vibe-Workflow/packages/workflow-builder/src/index.js', import.meta.url)) },
        ],
    },
    server: {
        proxy: {
            '/api': {
                target: 'https://api.muapi.ai',
                changeOrigin: true,
                secure: false
            }
        }
    }
});
