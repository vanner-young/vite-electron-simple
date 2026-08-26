import * as net from "net";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { existsSync, unlinkSync } from "node:fs";
import { findParentFile, isType } from "mv-common";
import { spawn } from "node:child_process";

import { DevServer, ElectronDevProps } from "./type";

class ElectronDev {
    #config = {
        entry: "",
        tsConfigPath: "",
        envConfig: {},
    };
    ipcPath: string = "";

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
     * 创建本地ipc路径
     * **/
    public createLocalIpcPath() {
        const id = `${process.pid}-vx`;

        if (process.platform === "win32") {
            return `\\\\.\\pipe\\vx-${id}`;
        }

        const ipcPath = join(tmpdir(), `vx-${id}.sock`);
        if (existsSync(ipcPath)) unlinkSync(ipcPath);

        return ipcPath;
    }

    /**
     * 开启本地ipc
     * **/
    public async openLocalIpcServer() {
        const ipcPath = this.createLocalIpcPath();
        const pipeServer = net.createServer((socket) => {
            socket.once("close", () => {
                process.exit(0);
            });

            socket.once("error", (e) => {
                console.error("local ipc connect fail...", e.message || e);
                process.exit(0);
            });
        });

        return new Promise((resolve) => {
            const startFail = (e: Error) => {
                console.error(
                    "local ipc start fail... process is exit",
                    e.message || e,
                );
                process.exit(0);
            };
            pipeServer.on("error", startFail);

            pipeServer.listen(ipcPath, () => {
                pipeServer.off("error", startFail);
                resolve(ipcPath);
            });
        });
    }

    /**
     * 开启process子进程，并监听 tsc的变动，重启子进程
     * **/
    public async startElectronProcess(server: DevServer) {
        // 本地ipc创建
        this.ipcPath = (await this.openLocalIpcServer()) as string;

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

        spawn(...(command as [string, Array<string>]), {
            shell: true,
            cwd: rootPath,
            stdio: "inherit",
            env: {
                ...process.env,
                ELECTRON_URL: server.resolvedUrls?.local?.[0] || "[:::]",
                ...this.#config.envConfig,
                ELECTRON_LOCAL_DEV_PATH: this.ipcPath,
            },
        });
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

            server.httpServer?.once("close", () => {
                if (electronDev.ipcPath && existsSync(electronDev.ipcPath)) {
                    unlinkSync(electronDev.ipcPath);
                }
            });
        },
    };
}
