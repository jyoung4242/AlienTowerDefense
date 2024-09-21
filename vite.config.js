import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    target: "esnext", //browsers can handle the latest ES features
  },
  assetsInclude: ["**/*.png", "**/*.jpg", "**/*.svg", "**/*.tff"],
});
