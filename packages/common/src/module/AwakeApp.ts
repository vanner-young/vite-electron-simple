import path from 'node:path';
import { app } from 'electron';

class AwakeApp {
    #schema = process.env.APP_NAME || app.getName();
    devArgs: [string, Array<string>] | [] = [];

    public setSchemaName(name: string) {
        if (!name.trim() || this.#schema === name) return;
        this.#schema = name;
    }

    public start(name?: string) {
        if (name) this.setSchemaName(name);
        this.devArgs = !app.isPackaged
            ? [process.execPath, [path.resolve(process.argv[1])]]
            : [];

        app.whenReady().then(() => {
            this.regisSchema();
        });
        app.addListener('will-quit', () => {
            if (!app.isPackaged) this.removeSchema();
        });
    }

    public regisSchema() {
        app.setAsDefaultProtocolClient(
            this.#schema,
            ...(this.devArgs as Array<string>)
        );
        this.listener();
    }

    public removeSchema() {
        app.removeAsDefaultProtocolClient(
            this.#schema,
            ...(this.devArgs as Array<string>)
        );
    }

    public handleArgv(argv: Array<string>) {
        const offset = app.isPackaged ? 1 : 2;
        const url = argv.find(
            (arg, i) => i >= offset && arg.startsWith(this.#schema)
        );
        if (url) return new URL(url);
    }

    public listener() {
        if (process.platform === 'win32') {
            app.on('second-instance', (_, argv) => {
                const url = this.handleArgv(argv);
                console.log('params is:', url?.searchParams);
            });
        } else {
            app.on('open-url', (_, argv) => {
                console.log('url is:', argv);
            });
        }
    }
}

export default new AwakeApp();
