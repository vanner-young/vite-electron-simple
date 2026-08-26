import * as net from "node:net";
import { spawn } from "node:child_process";

// 子进程退出，socket 同步退出
const processExit = () => {
    process.exit(0);
};

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

    child.on("exit", processExit);
    child.on("close", processExit);
})();
