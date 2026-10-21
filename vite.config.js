import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { createContactApp } from "./server/app.js";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "netcode-contact-api",
      configureServer(server) {
        server.middlewares.use(
          createContactApp({ env: loadEnv(mode, process.cwd(), "") }),
        );
      },
      configurePreviewServer(server) {
        server.middlewares.use(
          createContactApp({ env: loadEnv(mode, process.cwd(), "") }),
        );
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        projects: fileURLToPath(new URL("./projects.html", import.meta.url)),
        gallery: fileURLToPath(new URL("./gallery.html", import.meta.url)),
      },
    },
  },
}));
