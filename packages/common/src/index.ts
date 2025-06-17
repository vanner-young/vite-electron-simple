export * from './module/common'; // 基础函数
export { default as AwakeApp } from './module/AwakeApp'; // 程序唤醒协议
export { default as Logger } from './module/Logger'; // 日志记录
export { default as Protocol } from './module/Protocol'; // app 协议
export { default as SingleAppLock } from './module/SingleLock'; // 程序单例启动
export { default as AwakeChildrenProcess } from './module/AwakeChildrenProcess'; // 启动第三方子进程

import { loadProductionEnv } from './module/LoadEnv';
loadProductionEnv(); // 默认加载环境变量配置
