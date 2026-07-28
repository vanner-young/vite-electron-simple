// @ts-nocheck

import { resolve } from "node:path";
import { defineConfig } from "rolldown";

export default defineConfig(
    [
        {
            platform: "node",
            input: resolve(__dirname, "./src/index.ts"),
            output: {
                dir: "bundle",
                format: "cjs",
            },
            external: ["vite", "tsc-watch", 'tsc-alias'],
        },
        {
            platform: "node",
            input: resolve(__dirname, "./src/script.ts"),
            output: {
                dir: "bundle",
                format: "cjs",
            },
            external: [],
        }
    ]
);
