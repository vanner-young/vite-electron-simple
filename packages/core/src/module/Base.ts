import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { findParentFile, isType, getExistsFilePath } from "mv-common";

import ParserTs from "@/common/ParserTs";
import { BuilderConfig, IndexString } from "@/type";
import {
    PROJECT_SIGN_NAME,
    ENTRY_CONFIG_FILE_NAME,
    DEPENDENCIES_MODULE,
} from "@/constance";

export default class Base {
    // 默认程序运行根目录
    rootPath = process.cwd();
    packageJson: IndexString = {};

    /**
     * 处理主进程环境变量文件，将环境变量文件内容转换为对象
     * **/
    public async gteEnvConfig(
        envPath: Array<string> = [],
    ): Promise<IndexString> {
        let mainProcessEnvPath = [].slice.call(envPath);
        const envConfig = {};
        if (!Array.isArray(mainProcessEnvPath))
            throw new Error("privateConfig.env type must be Array...");

        mainProcessEnvPath = mainProcessEnvPath.filter((item) =>
            isType(item, "string"),
        );
        if (!mainProcessEnvPath.length) return envConfig;

        for (const item of mainProcessEnvPath) {
            const envPath = path.resolve(this.rootPath, item);
            if (fs.existsSync(envPath)) {
                Object.assign(
                    envConfig,
                    dotenv.parse(fs.readFileSync(envPath)),
                );
            }
        }
        return envConfig;
    }

    /**
     * 校验必要的库是否都正确安装
     * **/
    async verifyNeedModule(moduleList: Array<string>) {
        for (const item of moduleList) {
            require(item);
        }
    }
    /**
     * 验证信息是否正确
     * **/
    async verify() {
        const rootPath = await findParentFile(this.rootPath, PROJECT_SIGN_NAME);
        if (!rootPath || !fs.existsSync(rootPath))
            throw new Error(
                `${rootPath} 不是一个有效的项目路径！请更换目录后重试！`,
            );
        this.rootPath = rootPath;
        try {
            this.verifyNeedModule(DEPENDENCIES_MODULE);
        } catch (e: unknown) {
            let error = e as Error;
            error.message = `mv-cli: mission need library not install：${error.message || error}`;
            throw error;
        }
        return true;
    }
    /**
     * 获取 Package JSON 的文件内容
     * **/
    getPackageJsonContent() {
        const packageJsonPath = path.resolve(this.rootPath, PROJECT_SIGN_NAME);
        this.packageJson = JSON.parse(
            fs.readFileSync(packageJsonPath) as unknown as string,
        );
    }
    /**
     * 验证渲染进程和主进程的入口是否存在
     * **/
    async verifyInputDir(viewPath?: string, mainPath?: string) {
        if (
            (viewPath && !fs.existsSync(viewPath)) ||
            (mainPath && !fs.existsSync(mainPath))
        )
            throw new Error("view or main package output dir get fail...");
    }
    /**
     * 获取构建文件的内容
     * **/
    async getConfigFileContent(): Promise<BuilderConfig> {
        const configFilePath = await getExistsFilePath(
            this.rootPath,
            ENTRY_CONFIG_FILE_NAME,
        );
        if (!configFilePath)
            throw new Error("config file path is not exists...");

        // 转换配置文件 builder.config.ts
        const tempFilePath = await ParserTs.transformCode(
            this.rootPath,
            configFilePath,
        );

        // 加载配置文件，并立刻将其删除
        let configHandler;
        try {
            configHandler = require(tempFilePath).default;
            const types = ["function", "asyncfunction", "object"];
            if (!isType(configHandler, types))
                throw new Error("build config file export invalid type...");
        } catch (e: unknown) {
            const error = e as Error;
            error.message = `builder.config.ts translated fail... please check. the error is: ${error.message || error}`;
            throw error;
        } finally {
            fs.unlinkSync(tempFilePath);
        }

        if (isType(configHandler, "object")) return configHandler;
        return await configHandler();
    }
}
