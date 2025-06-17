# @vite-electron-simple/common

#### 贡献

1.  Fork 本仓库
2.  新建 feat/xxx 分支
3.  Push 代码，并提交 Merge Request, 作者欢迎各位为此开源工具贡献一份力量~

#### 介绍

一款配套 @vite-electron-simple/core 库从而封装的一套工具类库，里面包含了一些配套使用的模块。

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
    showTopApplication,
    loadProductionEnv
} from '@vite-electron-simple/common';

// 1. getResourceStatic
getResourceStatic(); // 返回打包后的资源路径，如： /xxx/xxx/resources

// 2. showTopApplication
showTopApplication(); // 程序置顶

// 3. loadProductionEnv
// @vite-electron-simple/core 在开发模式下使用 process 进程加载开发时所需的环境变量。在打包后的环境下，是需要调用此方法的。
// loadProductionEnv();  // 当在项目中引入此库时，会自动加载，无需将其放入到项目中执行
```

2. 客户端日志模块, 属于 electron-log 模块的封装。模块在使用时，会自动记录程序中未能捕获的异常日志打印。

```ts
import { Logger } from '@vite-electron-simple/common';

// 初始化日志功能, 日志会放在 %appdata%/{process.env.appName}/logs
Logger.open({ appName: process.env.appName || 'vite-electron-simple' });

Logger.info('....');
Logger.warn('....');
Logger.error('....');

// 设置日志级别, 也可不设置，采用默认选项
Logger.setLevel('error' | 'warn' | 'info' | 'verbose' | 'debug' | 'silly');
```

3. Electron 自定义协议模块

```ts
import { Protocol } from '@vite-electron-simple/common';

// 1. 基本用法

// cwd: 在程序打包后，因为packaged环境中， Protocol 的基础路径应为electron的启动文件路径(main.js)，但是 Protocol 无法考虑到所有的情况去兼容获取cwd路径。因此在某些情况下，需要传递 cwd 路径。非必填选项，默认值为: path.resolve(app.getAppPath(), "dist_electron")
// name: 非必填选项，设置后与 setProtocolName 效果一样
ProtocolRegister.registerProtocol({ cwd: __dirname, name: 'xxx' }); // 注册自定义协议

// 2. 自定义协议的名称，默认自定义协议的名称为: app
Protocol.setProtocolName('xx');

// 3. 自定义cwd路径
Protocol.setProtocolName('xx');

// 4. 自定义协议拦截时，针对特定文件的content-type 设置
Protocol.addFileTypeMap('.txt', 'text/plain');

// 5. 对特定后缀的文件，读取是，需要采用 utf8 字符编码。
Protocol.addUtfCodingValue('.txt');
```

4. Electron 程序单例

```ts
import { SingleAppLock } from '@vite-electron-simple/common';

SingleAppLock(); // 直接调用即可
```

5. AwakeApp 唤醒协议

```ts
import { AwakeApp } from '@vite-electron-simple/common';

// 1. 基础用法
AwakeApp.start('xxx'); // 协议注册, 在注册时，也可以传递协议的名称, 本质上和 setSchemaName 一样

// 2. 设置 协议名称，默认协议名称为: app.getName() - (当前程序的名称)
AwakeApp.setSchemaName('xxx');
```

6. AwakeChildrenProcess 唤醒第三方子应用

```ts
import { AwakeChildrenProcess } from '@vite-electron-simple/common';

// 1. 基础用法
AwakeChildrenProcess.run(appPath, appName, (spawnOptions = {}));

// 2. 父子进程通信
const childrenProcess = AwakeChildrenProcess.childrenProcess;
childrenProcess.send('xxx'); // 向子进程发消息
childrenProcess.on('message', (data) => console.log(data)); // 监听子进程发送消息
```
