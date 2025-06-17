import path from 'node:path';
import type { BrowserWindow } from 'electron';

/**
 * 获取打包后的resource目录中的资源
 * @returns { string } 指定参数后的 resource 资源路径
 * **/
export const getResourceStatic = (...args: Array<string>) => {
    return path.resolve(process.resourcesPath, ...args);
};

/**
 * electron 程序置顶
 * @param { BrowserWindow } 渲染进程实例
 * **/
export const showTopApplication = (window: BrowserWindow): Promise<boolean> => {
    return new Promise((resolve) => {
        window.show();
        window.setAlwaysOnTop(true);

        const timer = setTimeout(() => {
            clearTimeout(timer);
            window.setAlwaysOnTop(false);
            resolve(true);
        }, 300);
    });
};
