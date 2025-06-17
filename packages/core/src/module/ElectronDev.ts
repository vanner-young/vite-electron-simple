import path from 'node:path';

import { isType } from 'mv-common/bundle/common';
import ElectronDevPlugin from '@vite-electron-simple/plugin';

import Base from '@/module/Base';
import MainProcess from '@/common/MainProcess';
import ViteServe from '@/module/ViteServe';
import { DEV_DEFAULT_MODE, DEFAULT_APP_NAME } from '@/constance';
import { ElectronServeProps, BuilderConfig } from '@/type';

class ElectronDev extends Base {
    #config: ElectronServeProps = {
        appName: DEFAULT_APP_NAME,
        viteConfig: {},
        needElectron: false,
        tsMainConfigPath: '',
        mainProcessEnvPath: [],
        publicEnv: {}
    };

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

        const appName = config.privateConfig?.appName || this.#config.appName;
        this.#config = {
            ...this.#config,
            appName,
            mainProcessEnvPath: config.privateConfig?.mainProcessEnvPath,
            viteConfig: config.viteConfig,
            needElectron: config.privateConfig?.needElectron,
            tsMainConfigPath: config.privateConfig?.tsMainConfigPath,
            publicEnv: {
                APP_NAME: appName,
                OPEN_ELECTRON: Number(config.privateConfig?.needElectron),
                ...(config.privateConfig?.env || this.#config.publicEnv)
            }
        };

        if (!isType(this.#config.viteConfig, 'object'))
            throw new Error(
                'server config file and package.json export content is not object...'
            );

        await this.mergeConfig(config);
        this.start();
    }

    /**
     * 开启服务
     * **/
    public async start() {
        ViteServe.work(this.#config.viteConfig, {
            ...this.#config.publicEnv
        });
    }

    /**
     * 注入plugins 插件
     * **/
    public async mergeConfig(config: BuilderConfig) {
        this.#config.viteConfig.configFile = false; // 禁用自动解析
        this.#config.viteConfig.root = this.rootPath; // 设置 root 路径
        this.#config.viteConfig.mode = DEV_DEFAULT_MODE; // 设置mode 选项
        this.#config.viteConfig.plugins = this.#config.viteConfig.plugins || [];

        const { needElectron } = this.#config;
        if (needElectron) {
            const mainProcessInput = path.resolve(
                this.rootPath,
                this.packageJson.main
            );

            // 处理主进程逻辑
            await new MainProcess().handler({
                rootPath: this.rootPath,
                config
            });

            await this.verifyInputDir('', mainProcessInput);
            const envConfig = await this.gteEnvConfig(
                this.#config.mainProcessEnvPath
            );

            this.#config.viteConfig.plugins.push(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (ElectronDevPlugin as any)({
                    entry: mainProcessInput,
                    tsConfigPath: this.#config.tsMainConfigPath,
                    envConfig: { ...envConfig, ...this.#config.publicEnv }
                })
            );
        }
    }
}

export default ElectronDev;
