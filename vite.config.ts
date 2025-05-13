import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
// @ts-ignore - Type definitions might be missing
import { visualizer } from "rollup-plugin-visualizer";
// @ts-ignore - Type definitions might be missing
import compression from "vite-plugin-compression";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",
    port: 8080,
    strictPort: false,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 8080,
      clientPort: 8080,
      timeout: 300000,
      overlay: false,
    },
    cors: true,
  },
  plugins: [
    // Add a custom plugin to inject z variable initialization into the HTML
    {
      name: 'inject-z-initializer',
      transformIndexHtml(html: string) {
        // Make sure z variable is defined as the very first thing in the head
        return html.replace(
          '<head>',
          `<head>
    <!-- CRITICAL: Define z variable with Object.defineProperty for better protection -->
    <script>
      (function() {
        // Initialize z immediately before any other script executes
        var _z = {};
        Object.defineProperty(window, 'z', {
          get: function() { return _z; },
          set: function(val) {
            // If someone tries to set z to a new object, merge properties
            if (val && typeof val === 'object') {
              Object.assign(_z, val);
            }
            return _z;
          },
          configurable: true,
          enumerable: true
        });
        window.__zInitialized = true;
        console.log('z variable initialized at page load');
      })();
    </script>`
        );
      }
    },
    react({
      // Temporarily disable SWC's emotion plugin due to compatibility issues
      plugins: []
    }),
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
      "react": path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
  },
  build: {
    // Generate source maps only in development
    sourcemap: mode !== 'production',
    // Minify output
    minify: 'terser',
    // Configure Terser
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
      },
      format: {
        // Improved preamble for z initialization in all JS files
        preamble: `(function(){
  // Ensure z exists and is properly initialized
  if (typeof window.z === 'undefined') {
    var _z = {};
    Object.defineProperty(window, 'z', {
      get: function() { return _z; },
      set: function(val) {
        if (val && typeof val === 'object') {
          Object.assign(_z, val);
        }
        return _z;
      },
      configurable: true,
      enumerable: true
    });
    window.__zInitialized = true;
  }
})();`,
      },
    },
    // Improve chunk loading strategy
    rollupOptions: {
      output: {
        // Ensure vendor chunks are loaded after our fix-vendor.js script
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: (id) => {
          // Extract specific packages into their own chunks
          if (id.includes('node_modules')) {
            // React and related packages
            if (id.includes('react') || 
                id.includes('react-dom') || 
                id.includes('react-router')) {
              return 'react-vendor';
            }
            
            // UI libraries
            if (id.includes('@radix-ui') || 
                id.includes('lucide-react') ||
                id.includes('class-variance-authority') ||
                id.includes('clsx') ||
                id.includes('tailwind-merge')) {
              return 'ui-vendor';
            }
            
            // Form related
            if (id.includes('react-hook-form') || 
                id.includes('@hookform') || 
                id.includes('input-otp')) {
              return 'form-vendor';
            }
            
            // Date related
            if (id.includes('date-fns') || 
                id.includes('react-day-picker')) {
              return 'date-vendor';
            }
            
            // All other third-party dependencies
            return 'vendor';
          }
          
          // Group components by type
          if (id.includes('/src/components/ui/')) {
            return 'ui-components';
          }
        }
      },
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  // Optimize deps to improve startup time
  optimizeDeps: {
    force: true, // Force dependency pre-bundling to avoid issues
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      'lucide-react',
      'date-fns',
      'sonner',
    ],
    exclude: [],
  },
}));
