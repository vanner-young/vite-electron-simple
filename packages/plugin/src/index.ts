import fs from 'node:fs';
import { isType } from 'mv-common/pkg/m.common';
import { getSystemInfo } from 'mv-common/pkg/node/m.process';
import { findParentFile } from 'mv-common/pkg/node/m.file';
import { ChildProcessWithoutNullStreams, spawn } from 'node:child_process';
import { DevServer, ElectronDevProps } from './type';

class ElectronDev {
    #config = {
        entry: '',
        tsConfigPath: '',
        envConfig: {}
    };
    #childProcess: ChildProcessWithoutNullStreams | null = null;

    constructor(config: ElectronDevProps) {
        this.#config = { ...this.#config, ...config };
        const { entry, tsConfigPath, envConfig } = this.#config;

        if (!entry || !fs.existsSync(entry))
            throw new Error(
                'vite-plugin-electron-dev plugin: entry path is not exists'
            );

        if (tsConfigPath && !fs.existsSync(tsConfigPath))
            throw new Error(
                'vite-plugin-electron-dev plugin: tsConfigPath path is not exists'
            );

        if (!isType(envConfig, 'object'))
            throw new Error(
                'vite-plugin-electron-dev plugin: env config must to be object...'
            );
    }

    /**
     * 非开发模式下，不启动此插件
     * **/
    public get open() {
        const { NODE_ENV } = this.#config.envConfig as {
            NODE_ENV: string;
        };
        return NODE_ENV === 'development';
    }

    /**
     * process 子进程关闭，重置子进程
     * **/
    public resetServer(
        server: DevServer,
        type: 'error' | 'exit',
        error: unknown
    ) {
        console.log(`electron start fail...${type}：`, error);
        server.config.inlineConfig.__restartServer = false;
        process.exit(0);
    }

    /**
     * 开启process子进程，并监听 tsc的变动，重启子进程
     * **/
    public async startElectronProcess(server: DevServer) {
        const command = this.#config.tsConfigPath
            ? [
                  'mv-tsc-watch',
                  [
                      '--project',
                      this.#config.tsConfigPath,
                      '--onSuccess',
                      `"electron ${this.#config.entry}"`
                  ]
              ]
            : ['electron', [this.#config.entry]];

        const rootPath = await findParentFile(
            this.#config.entry,
            'package.json'
        );
        this.#childProcess = spawn(...(command as [string, Array<string>]), {
            shell: getSystemInfo().isWindow,
            cwd: rootPath,
            env: {
                ...process.env,
                ELECTRON_URL: server.resolvedUrls?.local?.[0] || '[:::]',
                ...this.#config.envConfig
            }
        });
        this.#childProcess.on(
            'error',
            this.resetServer.bind(this, server, 'error')
        );
        this.#childProcess.on(
            'exit',
            this.resetServer.bind(this, server, 'exit')
        );

        this.#childProcess.stderr.pipe(process.stderr);
        this.#childProcess.stdout.on('data', (data) => {
            const consoleValue = data.toString();
            if (consoleValue.startsWith('mv-tsc-watch:close')) {
                process.exit(0);
            } else {
                console.log(consoleValue);
            }
        });
    }

    /**
     * 启动Process进程
     * **/
    public async loadElectronProcess(server: DevServer) {
        if (server.config.inlineConfig.__restartServer || !this.open) return;
        await this.startElectronProcess(server);
        server.config.inlineConfig.__restartServer = true;
    }

    /**
     * 合并插件配置
     * **/
    public async configResolvedHooks() {
        this.#config.envConfig = {
            ...this.#config.envConfig,
            NODE_ENV: process.env.NODE_ENV
        };
    }

    /**
     * 监听DevServer，在启动时，启动Electron程序
     * **/
    public async devServerHooks(server: DevServer) {
        const _this = this as unknown as ElectronDev;
        return () => {
            const cb = server.listen;
            server.listen = async function (...rest) {
                const result = await cb.apply(this, rest);
                _this.loadElectronProcess(server);
                return result;
            };
        };
    }
}

export default function (props: ElectronDevProps) {
    const electronDev = new ElectronDev(props);
    return {
        name: 'vite-plugin-start-electron',
        configResolved: () => electronDev.configResolvedHooks(),
        configureServer: (server: DevServer) =>
            electronDev.devServerHooks(server)
    };
}
