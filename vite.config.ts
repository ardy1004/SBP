import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
  ],
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
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('wouter') || id.includes('react-helmet')) {
              return 'router-vendor';
            }
            if (id.includes('lucide-react') || id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            if (id.includes('@tanstack/react-query') || id.includes('@supabase')) {
              return 'query-vendor';
            }
            if (id.includes('react-hook-form')) {
              return 'form-vendor';
            }
            // Other node_modules go to vendor
            return 'vendor';
          }

          // Feature chunks
          if (id.includes('/pages/admin/')) {
            return 'admin';
          }
          if (id.includes('/components/Property') || id.includes('/components/ShareButtons')) {
            return 'property-components';
          }
          if (id.includes('/lib/')) {
            return 'utils';
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
