# Vite-Electron-Simple

## 介绍

一款支持在 vite 构建工具下，实现 react、electron 的开发、构建引入的脚手架，同时支持单一浏览器环境的开发和构建。支持全量的 vite 以及 electron-builder 的全部功能。支持 windows、macos 系统。

当前库有以下几个模块：

-   @vite-electron-simple/core
    -   核心库：支撑 electron 主进程和 web 渲染进程的启动和构建任务。
-   @vite-electron-simple/common
    -   扩展库：在开发主进程的过程中，封装的一些工具类库，里面包含了一些配套使用的模块。（如：日志、环境变量、唤醒协议、启动第三方程序等）
-   @vite-electron-simple/plugin
    -   开发模式下，启动主进程的 Vite 插件。

## 文档地址

[详细使用手册](https://github.com/vanner-young/vite-electron-simple/tree/master/packages/core)
