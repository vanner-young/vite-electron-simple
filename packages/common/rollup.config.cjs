const fs = require('fs');
const path = require('path');
const { defineConfig } = require('rollup');
const json = require('@rollup/plugin-json');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const resolveModule = require('@rollup/plugin-node-resolve');
const peerDepsExternal = require('rollup-plugin-peer-deps-external');

module.exports = () => {
    const bundleDir = path.resolve(__dirname, './bundle');
    if (fs.existsSync(bundleDir)) fs.rmSync(bundleDir, { recursive: true });
    return defineConfig({
        input: path.resolve(__dirname, './src/index.ts'),
        output: [
            {
                dir: bundleDir,
                format: 'cjs',
                preserveModulesRoot: 'src'
            }
        ],
        plugins: [
            json(),
            resolveModule({ mainFields: ['module', 'main'] }),
            commonjs(),
            typescript({
                compilerOptions: {
                    declarationDir: path.resolve(bundleDir, 'types')
                }
            }),
            peerDepsExternal()
        ],
        external: ['electron']
    });
};
