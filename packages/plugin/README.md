# @vite-electron-simple/plugin

#### 贡献

1.  Fork 本仓库
2.  新建 feat/xxx 分支
3.  Push代码，并提交 Merge Request, 作者欢迎各位为此开源工具贡献一份力量~

#### 介绍

一款在开发使用vite开发electron程序时的插件（注意，在使用此插件前，需要安装 mv-tsc-watch）

#### 安装

```sh
npm install @vite-electron-simple/plugin mv-tsc-watch
# 或
yarn add @vite-electron-simple/plugin mv-tsc-watch
# 或
pnpm add @vite-electron-simple/plugin mv-tsc-watch
```

#### 使用说明

直接导入插件使用。（注意，在使用此插件前，需要安装 mv-tsc-watch）

```sh
# 安装 mv-tsc-watch
yarn add mv-tsc-watch
```

```ts
// 支持按需导入
import VitePluginElectronDev from '@vite-electron-simple/plugin';

// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
    ...,
    plugins: [VitePluginElectronDev({ entry: "electron start path..." })]
})
```

```ts

export default defineConfig({
    ...,
    plugins: [
        VitePluginElectronDev({
            entry: "electron start path...",    // electron 程序的入口启动目录 （必填）
            tsConfigPath: "",    // 如果 electron 主进程使用的 ts 开发，那么请将 tsconfig.json 路径传递。反之，可不传递（非必填）
            envConfig: {},  // 启动的electron主进程可访问的环境变量。（非必填）
        })
    ]
})
```
