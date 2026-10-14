import * as net from "node:net";
import { spawn } from "node:child_process";


(function () {
    const parentSocket = net.createConnection(
        process.env.ELECTRON_LOCAL_DEV_PATH as string,
    );
    parentSocket.once("connect", () => {
        parentSocket.unref();
    });

    const [startPath, tsPath, rootPath] = process.argv.slice(2);
    const child = spawn(`tsc-alias -p ${tsPath} && electron ${startPath}`, [], {
        shell: true,
        cwd: rootPath,
        env: {
            ...process.env,
        },
        stdio: "inherit",
    });

    // 子进程退出，socket 通知父进程退出
    const processExit = () => {
        parentSocket.write("vx-customer-close")
    };
    child.once("exit", processExit);
    child.once("close", processExit);
})();
