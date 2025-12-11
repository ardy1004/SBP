import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer for production builds
    process.env.ANALYZE === 'true' && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  envDir: path.resolve(import.meta.dirname),
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks - optimized for better caching
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom') || id.includes('react/jsx-runtime')) {
              return 'react-vendor';
            }
            // Routing
            if (id.includes('wouter') || id.includes('react-helmet')) {
              return 'router-vendor';
            }
            // UI libraries
            if (id.includes('lucide-react') || id.includes('@radix-ui') || id.includes('tailwindcss')) {
              return 'ui-vendor';
            }
            // Data fetching and state
            if (id.includes('@tanstack/react-query') || id.includes('@supabase') || id.includes('zustand')) {
              return 'data-vendor';
            }
            // Forms
            if (id.includes('react-hook-form') || id.includes('@hookform')) {
              return 'form-vendor';
            }
            // Date utilities
            if (id.includes('date-fns') || id.includes('dayjs')) {
              return 'date-vendor';
            }
            // Image processing
            if (id.includes('sharp') || id.includes('canvas') || id.includes('jimp')) {
              return 'image-vendor';
            }
            // Other large libraries
            if (id.includes('lodash') || id.includes('axios') || id.includes('zod')) {
              return 'utils-vendor';
            }
            // Other node_modules go to vendor
            return 'vendor';
          }

          // Feature-based chunks
          if (id.includes('/pages/admin/') || id.includes('/components/admin/')) {
            return 'admin-chunk';
          }
          if (id.includes('/pages/blog/') || id.includes('/components/Blog') || id.includes('/services/articleService')) {
            return 'blog-chunk';
          }
          if (id.includes('/components/Property') || id.includes('/pages/Property') || id.includes('/services/propertyApi')) {
            return 'property-chunk';
          }
          if (id.includes('/components/ui/') || id.includes('/lib/utils')) {
            return 'ui-chunk';
          }
          if (id.includes('/store/') || id.includes('/hooks/')) {
            return 'state-chunk';
          }
          if (id.includes('/utils/') || id.includes('/lib/')) {
            return 'utils-chunk';
          }
        }
      }
    },
    chunkSizeWarningLimit: 600, // Increase limit to 600kb
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:8787',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
