export const PROJECT_SIGN_NAME = 'package.json'; // 查找项目根目录的基准文件名称
export const DEV_DEFAULT_MODE = 'development'; // 开发模式下默认的启动模式
export const PREVIEW_DEFAULT_MODE = 'production'; // 生产环境、预览环境下的启动模式

export const ENTRY_CONFIG_FILE_NAME = [
    'builder.config.ts',
    'builder.config.js',
    'builder.config.cjs',
    'builder.config.mjs'
]; // 项目配置文件

export const DEFAULT_VIEW_OUTPUT = 'dist'; // 渲染进程默认输出目录
export const DEFAULT_MAIN_OUTPUT = 'bundle'; // 默认主进程输出目录
export const PROCESS_TS_CONFIG_NAME = 'tsconfig.main.json'; // 默认主进程的ts编译配置文件
export const DEPENDENCIES_MODULE = [
    'electron-builder',
    'vite',
    'electron',
    'mv-tsc-watch',
    'esbuild'
];

export const DEFAULT_APP_NAME = 'vite-electron-simple'; // 默认应用名称
export const DEFAULT_ENV_FILE_NAME = 'electron-builder.env'; // 默认的环境变量文件名称
