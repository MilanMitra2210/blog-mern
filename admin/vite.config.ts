import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  plugins: [
    tailwindcss(),
    svgr({
      svgrOptions: {
        exportType: "named",
        ref: true,
        svgo: false,
        titleProp: true,
      },
      include: "**/*.svg",
    }),
    react(),
  ],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("scheduler")) {
              return "vendor-react-core";
            }
            if (id.includes("framer-motion") || id.includes("motion-")) {
              return "vendor-motion";
            }
            if (id.includes("lucide-react")) {
              return "vendor-lucide";
            }
            if (id.includes("ckeditor5") || id.includes("@ckeditor")) {
              return "vendor-ckeditor";
            }
          }
        },
      },
    },
  },
});
