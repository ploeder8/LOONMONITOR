import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const kboProxy = {
  target: "https://kbopub.economie.fgov.be",
  changeOrigin: true,
  secure: false,
  headers: {
    "user-agent": "Jaakie Loonmotor",
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom") || id.includes("node_modules/react-router-dom")) {
            return "vendor";
          }
          if (id.includes("node_modules/lucide-react")) {
            return "icons";
          }
          return undefined;
        },
      },
    },
  },
  server: {
    port: 7000,
    strictPort: true,
    proxy: {
      "/kbo": {
        ...kboProxy,
        rewrite: (path) => path.replace(/^\/kbo/, "/kbopub"),
      },
    },
  },
  preview: {
    proxy: {
      "/kbo": {
        ...kboProxy,
        rewrite: (path) => path.replace(/^\/kbo/, "/kbopub"),
      },
    },
  },
});
