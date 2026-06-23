// @ts-nocheck
import { resolve } from "node:path";
import { defineConfig } from "rolldown";

export default defineConfig({
    platform: "node",
    input: resolve(__dirname, "./src/index.ts"),
    output: {
        dir: "bundle",
        format: "cjs",
    },
    external: [
        "electron-builder",
        "vite",
        "esbuild",
        "electron",
        "mv-tsc-watch",
    ],
});
