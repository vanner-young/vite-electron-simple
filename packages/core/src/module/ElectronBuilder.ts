import builder from 'electron-builder';
import {
    isType,
    copyDirectory,
    findRootParentPath,
    removeFileOrDir
} from 'mv-common';
import { recursive } from 'merge';
import * as fs from 'fs';
import * as path from 'path';

import Base from '@/module/Base';
import ViteBuilder from '@/module/ViteBuilder';
import MainProcess from '@/common/MainProcess';
import { BuilderConfig, IndexString } from '@/type';
import {
    DEFAULT_APP_NAME,
    DEFAULT_ENV_FILE_NAME,
    PREVIEW_DEFAULT_MODE
} from '@/constance';
import { closeRunningProcess } from '@/common';

const Platform = builder.Platform;
const mainProcess = new MainProcess();
class ElectronBuilder extends Base {
    #config: BuilderConfig = {
        privateConfig: {
            needElectron: false,
            tsMainConfigPath: '',
            move: [],
            mainProcessEnvPath: [],
            env: {}
        },
        viteConfig: {},
        electronBuilder: {}
    };
    #publicEnv = {};

    /**
     * 开始构建
     * **/
    async build() {
        this.verify().then((passed: boolean) => {
            if (passed) this.work();
        });
    }

    /**
     * 开始合并
     * **/
    async work() {
        const config = await this.getConfigFileContent();
        const appName = config.privateConfig?.appName || DEFAULT_APP_NAME;
        if (config.privateConfig.needElectron)
            await closeRunningProcess(appName);

        const defaultEnvModePath = [
            path.resolve(this.rootPath, '.env'),
            path.resolve(this.rootPath, `.env.${PREVIEW_DEFAULT_MODE}.local`)
        ];
        const mainProcessEnvPath = [
            ...defaultEnvModePath,
            ...(config.privateConfig?.mainProcessEnvPath || [])
        ];

        this.#config = recursive(this.#config, config);
        this.#config.privateConfig.mainProcessEnvPath = mainProcessEnvPath;
        this.getPackageJsonContent();
        this.#publicEnv = {
            APP_NAME: appName,
            OPEN_ELECTRON: Number(this.#config.privateConfig.needElectron),
            ...(config.privateConfig.env || this.#publicEnv)
        };

        if (
            isType(this.#config, 'object') &&
            isType(this.packageJson, 'object')
        ) {
            const viteConfig = await this.buildVite();
            this.buildMainProcess(viteConfig.build?.outDir)
                .then(() => {
                    console.log('mv-cli：构建成功！');
                })
                .catch((e) => {
                    console.log('mv-cli：构建失败！', e);
                });
        } else {
            throw new Error(
                'build config file and package.json export content is not object...'
            );
        }
    }

    /**
     * 写入主进程打包的环境变量文件
     * **/
    writeBuildEnvFile(env: IndexString) {
        const filePath = path.resolve(this.rootPath, DEFAULT_ENV_FILE_NAME);
        removeFileOrDir(filePath);

        let content = '';
        for (const key in env) {
            content += `${key}=${JSON.stringify(env[key]).replace(/['"]/g, '')}\n`;
        }

        return fs.writeFileSync(filePath, content, 'utf-8');
    }

    /**
     * 将渲染进程的内容拷贝到主进程的编译目录中
     * **/
    async mergeViewPackageToMain(viewPath: string, mainPath: string) {
        await this.verifyInputDir(viewPath, mainPath);
        return copyDirectory(viewPath, mainPath);
    }

    /**
     * 打包渲染进程代码
     * **/
    async buildVite() {
        return await ViteBuilder.work(
            this.#config,
            this.rootPath,
            this.#publicEnv
        );
    }

    /**
     * 打包主进程代码
     * **/
    async buildMainProcess(outDir: string | undefined) {
        const { needElectron } = this.#config.privateConfig;
        if (!needElectron)
            return console.warn(
                'privateConfig.needElectron status is off, ignore electron build...'
            );
        else if (!outDir)
            throw new Error('view process outdir can not be null...');

        // 处理主进程的打包和构建
        await mainProcess.handler({
            config: this.#config,
            rootPath: this.rootPath
        });

        // 将渲染进程的目录拷贝到主进程中去
        await this.mergeViewPackageToMain(
            outDir,
            findRootParentPath(this.packageJson.main)
        );

        // 执行环境变量的注入
        const configPathEnv = await this.gteEnvConfig(
            this.#config.privateConfig.mainProcessEnvPath
        );
        this.writeBuildEnvFile({ ...configPathEnv, ...this.#publicEnv });

        // 执行构建
        const moveEnvPath = path.resolve(this.rootPath, DEFAULT_ENV_FILE_NAME);
        return builder.build({
            targets: Platform.WINDOWS.createTarget(),
            config: {
                ...this.#config.electronBuilder,
                extraResources: {
                    from: moveEnvPath,
                    to: `./env/${DEFAULT_ENV_FILE_NAME}`
                },
                afterAllArtifactBuild: async (buildResult) => {
                    removeFileOrDir(moveEnvPath);

                    let cbPaths: Array<string> = [];
                    if (
                        typeof this.#config.electronBuilder
                            ?.afterAllArtifactBuild === 'function'
                    ) {
                        cbPaths =
                            await this.#config.electronBuilder.afterAllArtifactBuild(
                                buildResult
                            );
                    }
                    return buildResult.artifactPaths.concat(cbPaths);
                }
            }
        });
    }
}

export default ElectronBuilder;
