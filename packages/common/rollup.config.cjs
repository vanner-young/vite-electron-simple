const path = require('path');
const { defineConfig } = require('rollup');
const json = require('@rollup/plugin-json');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const resolveModule = require('@rollup/plugin-node-resolve');
const peerDepsExternal = require('rollup-plugin-peer-deps-external');

module.exports = () => {
    return defineConfig({
        input: path.resolve(__dirname, './src/index.ts'),
        output: {
            file: path.resolve(__dirname, './bundle/index.js'),
            format: 'cjs'
        },
        plugins: [
            json(),
            resolveModule({ mainFields: ['module', 'main'] }),
            commonjs(),
            typescript(),
            peerDepsExternal()
        ],
        external: ['electron']
    });
};
