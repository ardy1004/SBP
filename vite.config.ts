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
          // React ecosystem
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
            return 'react-vendor';
          }

          // UI Libraries
          if (id.includes('@radix-ui') || id.includes('lucide-react')) {
            return 'ui-vendor';
          }

          // Animation & Motion
          if (id.includes('framer-motion') || id.includes('aos')) {
            return 'animation-vendor';
          }

          // Data & State Management
          if (id.includes('@tanstack/react-query') || id.includes('zustand')) {
            return 'data-vendor';
          }

          // Utilities
          if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('date-fns')) {
            return 'utils-vendor';
          }

          // Supabase & Database
          if (id.includes('@supabase') || id.includes('drizzle')) {
            return 'database-vendor';
          }
        },

        // Optimize chunk naming
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 500, // Reduced to 500kb for better performance
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
