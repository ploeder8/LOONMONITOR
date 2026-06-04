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
  server: {
    port: 7000,
    strictPort: true,
    proxy: {
      "/api/kbo": {
        ...kboProxy,
        rewrite: (path) => path.replace(/^\/api\/kbo/, "/kbopub/zoeknummerform.html"),
      },
      "/kbo": {
        ...kboProxy,
        rewrite: (path) => path.replace(/^\/kbo/, "/kbopub"),
      },
    },
  },
  preview: {
    proxy: {
      "/api/kbo": {
        ...kboProxy,
        rewrite: (path) => path.replace(/^\/api\/kbo/, "/kbopub/zoeknummerform.html"),
      },
      "/kbo": {
        ...kboProxy,
        rewrite: (path) => path.replace(/^\/kbo/, "/kbopub"),
      },
    },
  },
});
