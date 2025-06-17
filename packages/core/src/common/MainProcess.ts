import fs from 'node:fs';
import path from 'node:path';
import { isType, copyDirectory, copyFile } from 'mv-common';

import ParserTs from '@/common/ParserTs';
import { MainBuildProcessConfig, BuilderConfig } from '@/type';

class MainProcess {
    /**
     * 移动静态资源文件
     * **/
    async move(
        moveConfig: BuilderConfig['privateConfig']['move'] = [],
        parentConfig: Pick<MainBuildProcessConfig, 'rootPath'>
    ) {
        if (!Array.isArray(moveConfig)) moveConfig = [moveConfig].flat(1);
        for (const item of moveConfig) {
            const { from, to } = item;
            if (!from || !to) {
                console.warn(
                    'from or to is invalid, ignore item move... on customerConfig buildBeforeMove'
                );
                continue;
            }
            const fromPath = path.resolve(parentConfig.rootPath, item.from),
                toPath = path.resolve(parentConfig.rootPath, item.to);
            if (!fs.statSync(fromPath).isDirectory()) {
                if (fs.statSync(toPath).isDirectory())
                    console.warn(
                        'mv-cli warn: move file path config src path is not directory, but dest path not! '
                    );

                const toDirPath = path.dirname(toPath);
                if (!fs.existsSync(toDirPath))
                    fs.mkdirSync(toDirPath, { recursive: true });
                copyFile(fromPath, toPath);
            } else {
                copyDirectory(fromPath, toPath);
            }
        }
    }
    /**
     * tsc ts 文件的转换
     * **/
    async transformTsConfig(tsConfigPath: string, rootPath: string) {
        if (!tsConfigPath || !fs.existsSync(tsConfigPath)) {
            return console.warn(
                'main process fail to use typescript... ignore compiler typescript'
            );
        }
        await ParserTs.transformMain({ tsConfigPath, rootPath });
    }
    /**
     * 处理配置文件的转换
     * **/
    async handler(props: MainBuildProcessConfig) {
        const { config, rootPath } = props;
        const privateConfig = config?.privateConfig;
        if (!privateConfig || !isType(privateConfig, 'object')) return config;

        // 处理主进程的 ts 转换
        if (privateConfig.tsMainConfigPath) {
            await this.transformTsConfig(
                privateConfig.tsMainConfigPath,
                rootPath
            );
        } else {
            // 采用 esbuild 将代码编译为 cjs, 有可能主进程的代码也是 es module
            // TODO...
            console.warn(
                'private.tsMainConfigPath status is off... ignore main process ts file transform'
            );
        }

        const keys = Object.keys(privateConfig);
        for (const item of keys) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const handler = (this as any)[item];

            if (!isType(handler, ['function', 'asyncfunction'])) {
                console.warn(
                    `warn: ${item} is not exists instance, ignore handler`
                );
                continue;
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (this as any)[item]((privateConfig as any)[item], props);
        }
        return config;
    }
}

export default MainProcess;
