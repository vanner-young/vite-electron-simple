# @vite-electron-simple/common

#### 贡献

1.  Fork 本仓库
2.  新建 feat/xxx 分支
3.  Push 代码，并提交 Merge Request, 作者欢迎各位为此开源工具贡献一份力量~

#### 介绍

一款配套 @vite-electron-simple/core 库从而封装的一套工具类库，里面包含了一些配套使用的工具函数及功能。

#### 安装

```sh
npm install @vite-electron-simple/common
# 或
yarn add @vite-electron-simple/common
# 或
pnpm add @vite-electron-simple/common
```

#### 使用说明

安装后可直接安装使用。

```ts
// 支持按需导入
import { ... } from '@vite-electron-simple/common';
```

#### 示例

1. 客户端生产包模式下的环境变量加载

```ts
import {
    getResourceStatic,
    loadProductionEnv
} from '@vite-electron-simple/common';

// 获取打包后的resource目录中的资源
const resourcePath = getResourceStatic();
console.log(resourcePath);

// @vite-electron-simple/core 在开发模式下使用 process 进程加载开发时所需的环境变量。在打包后的环境下，需要在主进程的入口文件中，手动调用此方法来加载环境变量
loadProductionEnv();
```

2. 客户端日志模块, 属于 electron-log 模块的封装

```ts
import { logger } from '@vite-electron-simple/common';

// 初始化日志功能, 日志会放在 %appdata%/{process.env.appName}/logs
logger.setConfig({ appName: process.env.appName || 'vite-electron-simple' });

logger.info('....');
logger.warn('....');
logger.error('....');

// 设置日志级别, 也可不设置，采用默认选项
logger.setLevel('error' | 'warn' | 'info' | 'verbose' | 'debug' | 'silly');
```
