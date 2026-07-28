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
        "vite",
        "esbuild",
        "electron",
        "electron-builder",
        "@vite-electron-simple/plugin"
    ],
});
