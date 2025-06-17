import path from 'node:path';

import { build } from 'vite';
import { formateEnv } from '@/common';
import { DEFAULT_VIEW_OUTPUT } from '@/constance';
import { BuilderConfig, IndexString } from '@/type';

class ViteBuilder {
    /**
     * 获输出路径
     * **/
    getOutputPath(outPath: string | undefined, rootPath: string) {
        if (!outPath) return path.resolve(rootPath, DEFAULT_VIEW_OUTPUT);

        // 判断用户传递的路径字符串来匹配
        if (outPath.includes(rootPath)) return outPath;
        return path.resolve(rootPath, outPath);
    }

    /**
     * 先获取输出路径后，在进行构建
     * **/
    async work(
        config: BuilderConfig,
        rootPath: string,
        publicEnv: IndexString
    ) {
        const { viteConfig } = config;

        viteConfig.root = rootPath; // 设置基准路径
        viteConfig.build = viteConfig.build || {};
        viteConfig.build.outDir = this.getOutputPath(
            viteConfig.build?.outDir,
            rootPath
        );

        // 处理环境变量
        viteConfig.define = formateEnv(publicEnv);

        await build(viteConfig);
        console.log(
            'view process build success... out dir is:',
            viteConfig.build.outDir
        );
        return viteConfig;
    }
}

export default new ViteBuilder();
