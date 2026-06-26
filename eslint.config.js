import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["dist", "build", "node_modules", "coverage", "*.mjs"],
  },
  {
    languageOptions: {
      globals: {
        process: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        clearTimeout: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        setImmediate: "readonly",
        clearImmediate: "readonly",
        require: "readonly",
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        KeyboardEvent: "readonly",
        MouseEvent: "readonly",
        HTMLDivElement: "readonly",
        React: "readonly",
        AudioContext: "readonly",
        CanvasRenderingContext2D: "readonly",
        HTMLCanvasElement: "readonly",
        performance: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        RequestInit: "readonly",
        RequestInfo: "readonly",
        URL: "readonly",
        Request: "readonly",
        HeadersInit: "readonly",
        Headers: "readonly",
        Response: "readonly",
        fetch: "readonly",
        GainNode: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-undef": "error",
    },
  },
);
