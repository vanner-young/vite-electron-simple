const path = require('path');
const { defineConfig } = require('rollup');

const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const resolveModule = require('@rollup/plugin-node-resolve');

module.exports = () => {
    const basicConfig = {
        input: path.resolve(__dirname, './src/index.ts'),
        plugins: [
            resolveModule({ mainFields: ['main', 'module'] }),
            commonjs(),
            typescript()
        ]
    };

    return defineConfig([
        {
            ...basicConfig,
            output: {
                file: path.resolve(__dirname, './bundle/index.cjs'),
                format: 'commonjs'
            }
        },
        {
            ...basicConfig,
            output: {
                file: path.resolve(__dirname, './bundle/index.mjs'),
                format: 'module'
            }
        }
    ]);
};
