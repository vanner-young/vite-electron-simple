import log from 'electron-log';
import path from 'node:path';
import { app } from 'electron';

export interface ElectronLoggerProps {
    appName: string;
    logFilePath: string;
    leave: 'error' | 'warn' | 'info' | 'verbose' | 'debug' | 'silly';
    maxSize: number;
    format: string;
}

class ElectronLogger {
    appName = 'vite-electron-simple';
    maxSize = 5 * 1024 * 1024;
    format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';
    logFilePath = path.resolve(app.getPath('appData'), this.appName, 'logs');
    leave: ElectronLoggerProps['leave'] = 'info';

    init = false;

    constructor() {
        this.initialize();
        this.init = true;
    }

    setConfig(props: Partial<ElectronLoggerProps>) {
        this.appName = props.appName || this.appName;
        this.leave = props.leave || this.leave;
        this.maxSize = props.maxSize || this.maxSize;
        this.format = props.format || this.format;
        this.logFilePath =
            props.logFilePath ||
            path.resolve(app.getPath('appData'), this.appName, 'logs');
        this.initialize();
    }

    /**
     * 初始化日志配置
     */
    initialize() {
        log.transports.file.resolvePathFn = () =>
            path.join(
                this.logFilePath,
                `app-${this.appName + (app.isPackaged ? '' : '.debug')}.log`
            );

        log.transports.file.level = this.leave;
        log.transports.file.maxSize = this.maxSize;
        log.transports.file.format = this.format;

        if (!app.isPackaged) {
            log.transports.console.format = '[{level}] {text}';
            log.transports.console.level = 'debug';
        } else {
            log.transports.console.level = false;
        }

        if (!this.init) {
            process.on('unhandledRejection', (error) => {
                this.error('Unhandled Rejection:', error);
            });

            process.on('uncaughtException', (error) => {
                this.error('Uncaught Exception:', error);
            });
        }
    }

    /**
     * 记录debug级别日志
     * @param {*} args
     */
    debug(...args: Array<unknown>) {
        log.debug(...args);
    }

    /**
     * 记录info级别日志
     * @param {*} args
     */
    info(...args: Array<unknown>) {
        log.info(...args);
    }

    /**
     * 记录warn级别日志
     * @param {*} args
     */
    warn(...args: Array<unknown>) {
        log.warn(...args);
    }

    /**
     * 记录error级别日志
     * @param {*} args
     */
    error(...args: Array<unknown>) {
        log.error(...args);
    }

    /**
     * 记录verbose级别日志
     * @param {*} args
     */
    verbose(...args: Array<unknown>) {
        log.verbose(...args);
    }

    /**
     * 记录silly级别日志
     * @param {*} args
     */
    silly(...args: Array<unknown>) {
        log.silly(...args);
    }

    /**
     * 设置日志级别
     * @param {'error' | 'warn' | 'info' | 'verbose' | 'debug' | 'silly'} level
     */
    setLevel(level: ElectronLoggerProps['leave']) {
        log.transports.file.level = level;
        if (log.transports.console) {
            log.transports.console.level = level;
        }
    }
}

export default new ElectronLogger();
