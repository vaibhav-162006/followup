import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { API_ORIGIN, WEB_PORT } from "@followup/config";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: WEB_PORT,
    proxy: {
      "/api": {
        target: API_ORIGIN,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
