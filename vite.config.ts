import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// ...existing code...

// https://vitejs.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
  build: {
    rollupOptions: {
      // Browser bundle only. The SSR build (src/entry-server.tsx, run by
      // `pnpm build` straight after this one) externalises react, framer-motion
      // and the rest to node_modules, and Rollup cannot assign an external
      // module to a manual chunk — naming them here would fail that build.
      output: isSsrBuild
        ? {}
        : {
            manualChunks: {
              react: ["react", "react-dom", "react-router-dom"],
              motion: ["framer-motion"],
              ui: ["lucide-react", "next-themes"],
            },
          },
    },
  },
}));
