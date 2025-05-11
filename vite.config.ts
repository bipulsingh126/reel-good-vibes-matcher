
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
// @ts-ignore - Type definitions might be missing
import { visualizer } from "rollup-plugin-visualizer";
import { splitVendorChunkPlugin } from "vite";
// @ts-ignore - Type definitions might be missing
import compression from "vite-plugin-compression";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 8080,
      clientPort: 8080,
      timeout: 120000,
    },
  },
  plugins: [
    react({
      // SWC's optimization features
      plugins: [
        ['@swc/plugin-emotion', {}]
      ]
    }),
    // Split vendor chunks for better caching
    splitVendorChunkPlugin(),
    // Compress assets
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
    // Add bundle size analyzer in build mode
    mode === 'production' && visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Generate source maps for production
    sourcemap: true,
    // Minify output
    minify: 'terser',
    // Configure Terser
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Improve chunk loading strategy
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-components': [
            '@/components/ui/button',
            '@/components/ui/card',
            '@/components/ui/badge',
            '@/components/ui/dialog',
            '@/components/ui/dropdown-menu',
            '@/components/ui/avatar',
          ],
        },
      },
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  // Optimize deps to improve startup time
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      'lucide-react',
      'date-fns',
    ],
    exclude: [],
  },
}));
