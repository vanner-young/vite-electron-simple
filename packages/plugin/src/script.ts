import { spawn } from "node:child_process";

const processExit = () => {
    process.exit(0);
};

(function () {
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
