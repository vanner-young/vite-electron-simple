import { resolve } from "node:path";

import { isType } from "mv-common";
import ElectronDevPlugin from "@vite-electron-simple/plugin";

import Base from "@/module/Base";
import MainProcess from "@/common/MainProcess";
import ViteServe from "@/module/ViteServe";
import { DEV_DEFAULT_MODE, DEFAULT_APP_NAME } from "@/constance";
import { ElectronServeProps, BuilderConfig, IndexString } from "@/type";

class ElectronDev extends Base {
    #config: ElectronServeProps = {
        appName: DEFAULT_APP_NAME, // appName
        viteConfig: {}, // vite 配置
        needElectron: false, // 是否需要electron
        tsMainConfigPath: "", // 主进程ts编译配置文件
        mainProcessEnvPath: [], // 主进程环境变量文件
        publicEnv: {}, // 公共环境变量
    };
    envFile: Array<string> = []; // 环境变量文件(.env | .env.xxx.local)，此文件的内容会被注入到主进程和渲染进程中

    /**
     * 入口函数
     * **/
    public serve() {
        this.verify().then((passed: boolean) => {
            if (passed) this.work();
        });
    }

    /**
     * 处理配置流
     * **/
    async work() {
        const config = await this.getConfigFileContent();
        this.getPackageJsonContent();

        this.envFile = [
            resolve(this.rootPath, ".env"),
            resolve(this.rootPath, `.env.${DEV_DEFAULT_MODE}.local`),
        ];

        const mainProcessEnvPath = [
            ...this.envFile, // 环境变量文件路径
            ...(config.privateConfig?.mainProcessEnvPath || []), // 用户自定义变量文件路径
        ];

        const appName = config.privateConfig?.appName || this.#config.appName;
        this.#config = {
            ...this.#config,
            appName,
            mainProcessEnvPath: mainProcessEnvPath,
            viteConfig: config.viteConfig,
            needElectron: config.privateConfig?.needElectron,
            tsMainConfigPath: config.privateConfig?.tsMainConfigPath,
            publicEnv: {
                APP_NAME: appName,
            },
        };

        if (!isType(this.#config.viteConfig, "object"))
            throw new Error(
                "server config file and package.json export content is not object...",
            );

        await this.mergeConfig(config);
        this.start();
    }

    /**
     * 开启Vite渲染进程服务
     * **/
    public async start() {
        // 渲染进程的环境变量不包含主进程
        const mapViewEnvConfig = await this.gteEnvConfig(this.envFile);

        ViteServe.work(this.#config.viteConfig, {
            ...mapViewEnvConfig,
            ...this.#config.publicEnv,
        });
    }

    /**
     * 注入plugins 插件
     * **/
    public async mergeConfig(config: BuilderConfig) {
        this.#config.viteConfig.configFile = false; // 禁用自动解析
        this.#config.viteConfig.root = this.rootPath; // 设置 root 路径
        this.#config.viteConfig.mode = DEV_DEFAULT_MODE; // 设置mode 选项
        this.#config.viteConfig.plugins = this.#config.viteConfig.plugins || []; // rest vite 插件

        // 将环境变量文件转为 map 结构（主进程中也会存在渲染进程的环境变量）
        const mapFileEnvConfig = await this.gteEnvConfig(
            this.#config.mainProcessEnvPath,
        );
        const envConfig = {
            ...mapFileEnvConfig,
            ...this.#config.publicEnv,
        } as IndexString;

        if (this.#config.needElectron) {
            const mainProcessInput = resolve(
                this.rootPath,
                this.packageJson.main, // 取 package.json 里面的 main 字段作为 electron入口
            );

            // 处理主进程逻辑
            await new MainProcess().handler({
                rootPath: this.rootPath,
                config,
            });

            // 验证进程入口文件是否存在
            await this.verifyInputDir("", mainProcessInput);

            // 开发环境下使用 vite 插件来启动主进程
            this.#config.viteConfig.plugins.push(
                ElectronDevPlugin({
                    entry: mainProcessInput,
                    tsConfigPath: this.#config.tsMainConfigPath,
                    envConfig,
                }),
            );
        }
    }
}

export default ElectronDev;
