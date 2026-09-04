import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const pages = process.env.VITE_PAGES === "true";

export default defineConfig({
  plugins: [react()],
  base: pages ? "/drivecontrol/" : "/",
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
});
