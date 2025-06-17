import { createServer } from 'vite';
import { formateEnv } from '@/common';
import { ElectronServeProps, IndexUnKnown } from '@/type';

class ViteBuilder {
    async work(config: ElectronServeProps['viteConfig'], env: IndexUnKnown) {
        const server = await createServer({
            ...config,
            define: formateEnv(Object.assign(config.define || {}, env))
        });

        await server.listen();
        server.printUrls();
        server.bindCLIShortcuts();
    }
}

export default new ViteBuilder();
