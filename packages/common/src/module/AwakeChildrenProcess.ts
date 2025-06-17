import fs from 'node:fs';
import {
    SpawnOptionsWithoutStdio,
    spawn,
    ChildProcess
} from 'node:child_process';
import { app } from 'electron';
import { killProcessName, isActiveProcessByName } from 'mv-common';

class AwakeChildrenProcess {
    #appPath: string = '';
    #appName: string = '';
    childrenProcess: ChildProcess | null = null;

    public async run(
        appPath: string,
        appName: string,
        options: SpawnOptionsWithoutStdio = {}
    ) {
        this.#appPath = appPath;
        this.#appName = appName;
        if (!this.#appPath || !fs.existsSync(this.#appPath))
            throw new Error('exec app path invalid...');
        if (!this.#appName) throw new Error('invalid app name...');

        await this.closeAppServices();
        this.childrenProcess = spawn(this.#appPath, options);
        this.childrenProcess = null;

        app.removeListener('will-quit', this.closeAppServices);
        app.addListener('will-quit', this.closeAppServices);
        return true;
    }

    public async closeAppServices() {
        const isActiveProcess = await isActiveProcessByName(this.#appName);
        if (!isActiveProcess) return true;

        await killProcessName(this.#appName);
        this.childrenProcess = null;
        return true;
    }
}

export default new AwakeChildrenProcess();
