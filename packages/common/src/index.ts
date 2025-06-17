import path from 'node:path';
import dotenv from 'dotenv';
import { app } from 'electron';

/**
 * Electron 日志记录
 * **/
export { default as logger } from './ElectronLog';

/**
 * 获取打包后的resource目录中的资源
 * @returns { string } 指定参数后的 resource 资源路径
 * **/
export const getResourceStatic = (...args: Array<string>) => {
    return path.resolve(process.resourcesPath, ...args);
};

/**
 * 生产包模式下，注入环境变量的方法
 * @returns { boolean | void } bool：环境变量注入成功、void: 当前环境为非生产包模式
 * **/
export const loadProductionEnv = (): boolean | void => {
    if (!app.isPackaged) return;

    return !!dotenv.config({
        path: getResourceStatic('env', 'electron-builder.env'),
        encoding: 'utf8'
    });
};
