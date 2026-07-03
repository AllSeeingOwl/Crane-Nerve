import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { mockupPreviewPlugin } from "./mockupPreviewPlugin";

export default defineConfig(async ({ command, mode }) => {
  const rawPort = process.env.PORT || "3000";
  const port = Number(rawPort);

  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }

  const basePath = process.env.BASE_PATH || "/";

  const plugins = [mockupPreviewPlugin(), react(), tailwindcss()];

  if (process.env.NODE_ENV !== "production") {
    try {
      const runtimeErrorOverlay = (
        await import("@replit/vite-plugin-runtime-error-modal")
      ).default;
      plugins.push(runtimeErrorOverlay());
    } catch (e) {}
    if (process.env.REPL_ID !== undefined) {
      try {
        const m = await import("@replit/vite-plugin-cartographer");
        plugins.push(
          m.cartographer({
            root: path.resolve(__dirname, ".."),
          }),
        );
      } catch (e) {}
    }
  }

  return {
    base: basePath,
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    root: path.resolve(__dirname),
    build: {
      outDir: path.resolve(__dirname, "dist"),
      emptyOutDir: true,
    },
    server: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
      fs: {
        strict: true,
      },
    },
    preview: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
    },
  };
});
