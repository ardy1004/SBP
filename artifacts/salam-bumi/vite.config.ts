import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const rawPort = process.env.PORT || "5173";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH || "/";

export default defineConfig(async () => {
  const plugins = [
    react({
      jsxRuntime: "automatic",
    }),
    tailwindcss(),
    runtimeErrorOverlay(),
  ];

  if (
    process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
  ) {
    const cartographerModule = await import("@replit/vite-plugin-cartographer");
    const devBannerModule = await import("@replit/vite-plugin-dev-banner");
    plugins.push(
      cartographerModule.cartographer({
        root: path.resolve(import.meta.dirname, ".."),
      }),
      devBannerModule.devBanner(),
    );
  }

  return {
    base: basePath,
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
        "@assets": path.resolve(
          import.meta.dirname,
          "..",
          "..",
          "attached_assets",
        ),
      },
      dedupe: ["react", "react-dom"],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
      proxy: {
        "/api": {
          target: "http://localhost:8788",
          changeOrigin: true,
        },
      },
    },
    preview: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
    },
  };
});
