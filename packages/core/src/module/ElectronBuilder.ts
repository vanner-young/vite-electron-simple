import type { FileSet } from "electron-builder";
import { Platform as BuilderPlatform, build } from "electron-builder";
import {
    isType,
    copyDirectory,
    findRootParentPath,
    removeFileOrDir,
} from "mv-common";

import { resolve } from "path";
import { writeFileSync } from "fs";
import { recursive } from "merge";

import Base from "@/module/Base";
import ViteBuilder from "@/module/ViteBuilder";
import MainProcess from "@/common/MainProcess";
import { BuilderConfig, IndexString } from "@/type";
import {
    DEFAULT_APP_NAME,
    DEFAULT_ENV_FILE_NAME,
    PREVIEW_DEFAULT_MODE,
} from "@/constance";
import { closeRunningProcess } from "@/common";

const Platform = BuilderPlatform;
const mainProcess = new MainProcess();
class ElectronBuilder extends Base {
    #config: BuilderConfig = {
        privateConfig: {
            needElectron: false,
            tsMainConfigPath: "",
            mainProcessEnvPath: [],
        },
        viteConfig: {},
        electronBuilder: {},
    };
    #publicEnv = {};
    #defaultEnvPath: Array<string> = [];

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

        // 构建时，关闭当前正在运行的主进程
        if (config.privateConfig.needElectron)
            await closeRunningProcess(appName);

        // 渲染进程环境变量文件
        this.#defaultEnvPath = [
            resolve(this.rootPath, ".env"),
            resolve(this.rootPath, `.env.${PREVIEW_DEFAULT_MODE}.local`),
        ];

        // 主进程环境变量文件
        const mainProcessEnvPath = [
            ...this.#defaultEnvPath,
            ...(config.privateConfig?.mainProcessEnvPath || []),
        ];

        this.#config = recursive(this.#config, config);
        this.#config.privateConfig.mainProcessEnvPath = mainProcessEnvPath;

        this.getPackageJsonContent();
        this.#publicEnv = {
            APP_NAME: appName,
            ...this.#publicEnv,
        };

        if (
            isType(this.#config, "object") &&
            isType(this.packageJson, "object")
        ) {
            const viteConfig = await this.buildVite();
            this.buildMainProcess(viteConfig.build?.outDir)
                .then(() => {
                    console.log("mv-cli：构建成功！");
                })
                .catch((e) => {
                    console.log("mv-cli：构建失败！", e);
                });
        } else {
            throw new Error(
                "build config file and package.json export content is not object...",
            );
        }
    }

    /**
     * 写入主进程打包的环境变量文件
     * **/
    writeBuildEnvFile(env: IndexString) {
        const filePath = resolve(this.rootPath, DEFAULT_ENV_FILE_NAME);
        removeFileOrDir(filePath);

        let content = "";
        for (const key in env) {
            content += `${key}=${JSON.stringify(env[key]).replace(/['"]/g, "")}\n`;
        }

        return writeFileSync(filePath, content, "utf-8");
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
        const mapEnvFile = await this.gteEnvConfig(this.#defaultEnvPath);
        const envConfig = { ...mapEnvFile, ...this.#publicEnv };

        return await ViteBuilder.work(this.#config, this.rootPath, envConfig);
    }

    /**
     * 静态资源文件移动配置
     * **/
    moveAssetsConfig(defaultFileSet?: Array<FileSet>): Array<FileSet> {
        let extraResourcesList: Array<FileSet> = defaultFileSet || [];
        const extraResources = this.#config.electronBuilder.extraResources as
            | Array<FileSet>
            | FileSet
            | undefined;

        if (extraResources) {
            extraResourcesList = extraResourcesList.concat(
                Array.isArray(extraResources)
                    ? extraResources
                    : [extraResources],
            );
        }

        return extraResourcesList;
    }

    /**
     * 打包主进程代码
     * **/
    async buildMainProcess(outDir: string | undefined) {
        const { needElectron } = this.#config.privateConfig;
        if (!needElectron)
            return console.warn(
                "privateConfig.needElectron status is off, ignore electron build...",
            );
        else if (!outDir)
            throw new Error("view process outdir can not be null...");

        // 处理主进程的打包和构建
        await mainProcess.handler({
            config: this.#config,
            rootPath: this.rootPath,
        });

        // 将渲染进程的目录拷贝到主进程中去
        await this.mergeViewPackageToMain(
            outDir,
            findRootParentPath(this.packageJson.main),
        );

        // 执行环境变量的注入
        const configPathEnv = await this.gteEnvConfig(
            this.#config.privateConfig.mainProcessEnvPath,
        );
        this.writeBuildEnvFile({ ...configPathEnv, ...this.#publicEnv });

        // 对项目的主进程环境变量，生成环境变量文件
        const moveEnvPath = resolve(this.rootPath, DEFAULT_ENV_FILE_NAME);

        // 移动静态资源
        const extraResourcesList = this.moveAssetsConfig([
            {
                from: moveEnvPath,
                to: `./env/${DEFAULT_ENV_FILE_NAME}`,
            },
        ]);

        // 执行构建
        return build({
            targets: Platform.WINDOWS.createTarget(),
            config: {
                ...this.#config.electronBuilder,
                extraResources: extraResourcesList,
                // afterAllArtifactBuild: async (buildResult) => {
                //     let cbPaths: Array<string> = [];
                //     if (
                //         typeof this.#config.electronBuilder
                //             ?.afterAllArtifactBuild === "function"
                //     ) {
                //         cbPaths =
                //             await this.#config.electronBuilder.afterAllArtifactBuild(
                //                 buildResult,
                //             );
                //     }
                //     return buildResult.artifactPaths.concat(
                //         Array.isArray(cbPaths) ? cbPaths : [],
                //     );
                // },
            },
        }).finally(() => {
            removeFileOrDir(moveEnvPath);
        });
    }
}

export default ElectronBuilder;
