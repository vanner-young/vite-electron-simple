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

- 模板技术栈：Vite、React、Mobx、Typescript。
- 客户端集成功能：托盘、子服务、系统通知、自定义协议、Schemes、Ipc集成、日志、构建打包。
- 推荐安装：@vite-electron-simple/common，里面有各类配套的方法及封装的功能，可直接使用。
- 模板地址：https://github.com/vanner-young/react-electron-template.git

#### 使用说明

1. 在项目根目录下安装该包后，使用 mv-cli build、mv-cli start 来替换 vite、vite build 命令。
2. 在项目根目录下新建 builder.config.js | builder.config.ts 文件。
    > 强烈建议使用 build.config.ts 详情参考下方的配置示例。
3. 强烈建议开发时，主进程和渲染进程代码分开来写，不要混入在一起。

```ts
    // package.json

    ...
    "main": "dist_electron/main.js", // electron 主进程入口文件地址, 与 tsconfig.main.json 里面的 outDir 目录保持统一
    "scripts": {
        "dev": "mv-cli start",      // 开发调试
        "build": "tsc -b && mv-cli build",  // 生产构建，构建时会结束正在运行的程序进程
    },
    ...
```

4. tsconfig.main.json 的必要性（主进程为ts代码时）
    > mv cli 在开发环境和生产环境时，对于主进程的 ts 代码，会使用 ts 按照 tsconfig.main.json 的配置进行打包，因此该文件不要配置 noEmit 等选项。并且输出目录一定要与 package.json 里面的 main 字段对应。

#### 配置示例

```ts
// builder.config.ts

...
import path from 'path';
import { defineMvConfig } from '@vite-electron-simple/core';  // 辅助函数导入实现编辑器提示

export default defineMvConfig({
    privateConfig: {
        appName: xxx, // 非必填，程序的名称，会被注入到环境变量中。通过 process.env.APP_NAME 获取。
        needElectron: true,  // 是否开启electron，当开启时，生产和打包均会添加electron，默认为开启。（非必填）

        // 当主进程 electron 的代码使用了 ts，那么该ts对应的tsconfig.json 的路径，反之可不传递此参数（采用绝对路径）（非必填）
        // 由于主进程使用了 ts，对于 node 来说是不能直接运行的，因此需要 tsc  将其编译为js文件后在进行运行。此配置文件就是ts的编译配置文件。
        tsMainConfigPath: path.resolve(__dirname, './tsconfig.main.json'),

        move: [  // 开启 electron 时，主进程ts环境下的一些非直接依赖的目录文件在打包时，ts不会去处理，因此需要手动将依赖的文件移动到指定的目录下 （非必填）
            {
                from: 'electron/static',
                to: 'dist_electron/static'
            }
        ],
        mainProcessEnvPath: [''] // 开启 electron 时，主进程的环境变量文件地址（非必填）【注意：渲染进程不会注入】
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

##### 环境变量

1. @vite-electron-simple/core 在开发模式下使用 process 进程加载开发时所需的环境变量。在打包后的环境下，需要安装@vite-electron-simple/common，并在主进程的入口文件中，手动调用此方法来加载环境变量

```ts
// npm install @vite-electron-simple/common

// 主进程入口文件: app.js|app.ts
import { loadProductionEnv } from "@vite-electron-simple/common";
loadProductionEnv();
```

2. 主进程的环境变量包含：mainProcessEnvPath配置的文件、.env、.env{mode}.local 文件的环境变量。渲染进程不包含 mainProcessEnvPath配置的文件的环境变量。

```ts
// 渲染进程中
import.meta.env.xxx; // 通过 import.meta.env.xxx 来获取;

// 主进程环境
process.env.xxx; // 通过 process.env 来获取;
```

3. 程序默认情况下，会携带以下的环境变量

```ts
    {
        APP_NAME: xxx, // 会根据 builder.config.ts 中的 privateConfig.appName 注入。(process.env.APP_NAME)
    }
```

##### move 与 electron builder 中的 extraResources 区别

1. 执行时机的不同
    - 开发环境下：会在主进程被编译完成后执行，是为了解决 ts 无法将代码中的静态资源文件进行移动的问题。extraResources 则不会在开发环境下执行。
    - 生产环境：编译时，同样会在主进程被编译完成后执行。move 的执行比 extraResources 要早。

2. 作用不同
    - move 的设计是为了解决ts的编译静态资源同步问题。move是把静态资源拷贝到 tsconfig.main.json 里面的 outDir 的。
    - extraResources 是 electron-builder 在 build 阶段为用户提供的配置。另外，extraResources 会在 app.asar 生成后执行的，因此 extraResources 是无法将文件赋值到源文件目录的。

```ts
// builder.config.ts

// 推荐 move 只用来配置需要把静态资源文件移动到源代码目录的，而不是其它。
export default defineMvConfig({
    // ...
    privateConfig: {
        move: [
            {
                from: "electron/static",
                to: "dist_electron/static",
            },
        ],
    },
});
```
