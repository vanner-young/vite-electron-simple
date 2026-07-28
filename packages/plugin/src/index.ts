import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { findParentFile, isType } from "mv-common";
import { ChildProcessWithoutNullStreams, spawn } from "node:child_process";

import { DevServer, ElectronDevProps } from "./type";

class ElectronDev {
    #config = {
        entry: "",
        tsConfigPath: "",
        envConfig: {},
    };
    #childProcess: ChildProcessWithoutNullStreams | null = null;

    constructor(config: ElectronDevProps) {
        this.#config = { ...this.#config, ...config };
        const { entry, tsConfigPath, envConfig } = this.#config;

        if (!entry || !existsSync(entry))
            throw new Error(
                "vite-plugin-electron-dev plugin: entry path is not exists",
            );

        if (tsConfigPath && !existsSync(tsConfigPath))
            throw new Error(
                "vite-plugin-electron-dev plugin: tsConfigPath path is not exists",
            );

        if (!isType(envConfig, "object"))
            throw new Error(
                "vite-plugin-electron-dev plugin: env config must to be object...",
            );
    }

    /**
     * 非开发模式下，不启动此插件
     * **/
    public get open() {
        const { NODE_ENV } = this.#config.envConfig as {
            NODE_ENV: string;
        };
        return NODE_ENV === "development";
    }

    /**
     * process 子进程关闭，重置子进程
     * **/
    public resetServer(type: "error" | "exit", error: unknown) {
        console.log(`electron start fail...${type}：`, error);
        process.exit(0);
    }

    /**
     * 开启process子进程，并监听 tsc的变动，重启子进程
     * **/
    public async startElectronProcess(server: DevServer) {
        const sPath = resolve(__dirname, "./script.js");
        const rootPath = await findParentFile(
            this.#config.entry,
            "package.json",
        );
        const command = this.#config.tsConfigPath
            ? [
                  "tsc-watch",
                  [
                      "--project",
                      this.#config.tsConfigPath,
                      "--onSuccess",
                      `"node ${sPath} ${this.#config.entry} ${this.#config.tsConfigPath} ${rootPath}"`,
                  ],
              ]
            : ["node", [sPath, this.#config.entry, this.#config.tsConfigPath]];

        this.#childProcess = spawn(...(command as [string, Array<string>]), {
            shell: true,
            cwd: rootPath,
            env: {
                ...process.env,
                ELECTRON_URL: server.resolvedUrls?.local?.[0] || "[:::]",
                ...this.#config.envConfig,
            },
        });

        this.#childProcess.on("error", this.resetServer.bind(this, "error"));
        this.#childProcess.on("exit", this.resetServer.bind(this, "exit"));
        this.#childProcess.stderr.pipe(process.stderr);
        this.#childProcess.stdout.pipe(process.stdout);
    }

    /**
     * 合并插件配置
     * **/
    public async configResolvedHooks() {
        this.#config.envConfig = {
            ...this.#config.envConfig,
            NODE_ENV: process.env.NODE_ENV,
        };
    }
}

export default function (props: ElectronDevProps) {
    const electronDev = new ElectronDev(props);
    return {
        name: "vite-plugin-start-electron",
        configResolved: () => electronDev.configResolvedHooks(),
        configureServer: (server: DevServer) => {
            server.httpServer?.once("listening", () => {
                electronDev.startElectronProcess(server);
            });
        },
    };
}
