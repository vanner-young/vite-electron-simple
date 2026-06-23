// @ts-nocheck
import { resolve } from "node:path";
import { defineConfig } from "rolldown";
import { esmExternalRequirePlugin } from "rolldown/plugins";

export default defineConfig({
    platform: "node",
    input: resolve(__dirname, "./src/index.ts"),
    output: {
        dir: "bundle",
        format: "cjs",
    },
    external: ["electron"],
    plugins: [
        esmExternalRequirePlugin({
            external: [/^node:/],
        }),
    ],
});
