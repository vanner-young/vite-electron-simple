# @vite-electron-simple/core

#### 贡献

1.  Fork 本仓库
2.  新建 feat/xxx 分支
3.  Push代码，并提交 Merge Request, 作者欢迎各位为此开源项目贡献一份力量~

#### 介绍

一款支持在 vite 构建工具下，实现 react、electron 的开发、构建引入的脚手架，同时支持单一浏览器环境的开发和构建。支持全量的 vite 以及 electron-builder 的全部功能。支持 windows、macos 系统。

#### 安装

```sh
npm install @vite-electron-simple/core
## 或
ppm add @vite-electron-simple/core
## 或
yarn add @vite-electron-simple/core
```

#### 示例模板

本项目有一套标准模板，为了提升效率，可拉取此模板，在此模板上进行业务开发。

-   模板技术栈：Vite、React、Mobx、Typescript。
-   客户端集成功能：托盘、子服务、系统通知、自定义协议、Schemes、Ipc集成、日志、构建打包。
-   推荐安装：@vite-electron-simple/common，里面有各类配套的方法及封装的功能，可直接使用。
-   模板地址：https://gitee.com/memory_s/react-electron-template.git

#### 使用说明

1. 在项目根目录下安装该包后，使用 mv-cli build、mv-cli start 来替换 vite、vite build 命令。
2. 在项目根目录下新建 builder.config.js | builder.config.ts 文件，详情请参考示例。
3. 强烈建议开发时，主进程和渲染进程代码分开来写，不要混入在一起。

```ts
    // package.json

    ...
    "scripts": {
        "dev": "mv-cli start",      // 开发调试
        "build": "tsc -b && mv-cli build",  // 生产构建
    },
    ...
```

#### 示例

```ts
// builder.config.ts

...
import path from 'path';
import { defineMvConfig } from '@vite-electron-simple/core';  // 可导入辅助函数来实现idea的提醒

export default () => defineMvConfig({
        privateConfig: {
            needElectron: true,  // 是否开启electron，当开启时，生产和打包均会添加electron，默认为开启。（非必填）

            // 当主进程 electron 的代码使用了 ts，那么该ts对应的tsconfig.json 的路径，反之可不传递此参数（采用绝对路径）（非必填）
            // 由于主进程使用了 ts，对于 node 来说是不能直接运行的，因此需要 tsc  将其编译为js文件后在进行运行。此配置文件就是ts的编译配置文件。
            tsMainConfigPath: path.resolve(__dirname, './tsconfig.main.json'),

            move: [         // 开启 electron 时，主进程ts环境下的一些非直接依赖的目录文件在打包时，ts不会去处理，因此需要手动将依赖的文件移动到指定的目录下 （非必填）
                {
                    from: 'electron/static',
                    to: 'dist_electron/static'
                }
            ],
            mainProcessEnvPath: [''] // 开启 electron 时，主进程的环境变量文件地址（非必填）
            env: ['xxx'] // 开启 electron 时，主进程需要的环境变量文件路径，采用 dotenv 进行注入（非必填）注意：权重大于 mainProcessEnvPath 参数中的环境变量权重
        },
        viteConfig: {
           // ... 其它参数，与 vite defineConfig 一致
        },
        electronBuilder: {
            // ... 其它参数 与 electron-builder 配置保持一致
        }
    });
```

#### 注意事项

1. 在使用时，前端可通过 OPEN_ELECTRON 参数来判断当前的环境是否时 Electron 客户端环境。

```ts
if (!import.meta.env.OPEN_ELECTRON) {
    // TODO...
}
```

2. @vite-electron-simple/core 在开发模式下使用 process 进程加载开发时所需的环境变量。在打包后的环境下，需要安装@vite-electron-simple/common，并在主进程的入口文件中，手动调用此方法来加载环境变量

```ts
// npm install @vite-electron-simple/common

// 主进程入口文件: app.js|app.ts
import { loadProductionEnv } from '@vite-electron-simple/common';
loadProductionEnv();

// ...TODO
```

3. 在 builder.config.ts 文件中，不要引入第三方的文件，因为 esbuild 在处理时，只会对当前文件进行打包，而不会处理引入的文件。

```ts
// builder.config.ts

import xxx from './xxx'; // 错误
// ...TODO

// 应修改为以下方式:
function xxx() {
    // TODO...
}
xxx();
// ...TODO
```
