import fs from 'node:fs';
import path from 'node:path';
import esbuild from 'esbuild';
import { execCommand } from 'mv-common';

import { ParserTsProps } from '@/type';

class ParserTs {
    /**
     * 转换主入口文件
     * **/
    async transformMain({ tsConfigPath, rootPath }: ParserTsProps) {
        if (!fs.existsSync(tsConfigPath))
            throw new Error('ts config path is fail...');

        execCommand(`tsc --project ${tsConfigPath}`, {
            cwd: rootPath,
            env: {
                ...process.env,
                Path: `${path.resolve(rootPath, 'node_modules/.bin')};${process.env.Path}`
            }
        });
    }
    /**
     * 转换配置文件，目前只支持单文件打包构建
     * **/
    async transformCode(rootPath: string, configFilePath: string) {
        const tempFilePath = path.resolve(rootPath, '.temp.config.js');
        esbuild.buildSync({
            entryPoints: [configFilePath],
            outfile: tempFilePath,
            bundle: false,
            format: 'esm',
            target: 'esnext',
            loader: { '.ts': 'ts', '.js': 'js', '.cjs': 'js', '.mjs': 'js' },
            define: {
                __dirname: JSON.stringify(rootPath)
            }
        });
        return tempFilePath;
    }
}

export default new ParserTs();
