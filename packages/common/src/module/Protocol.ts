import fs from 'node:fs';
import path from 'node:path';
import { protocol, net, app } from 'electron';

class RegisterProtocol {
    #basePath: string = path.resolve(app.getAppPath(), 'dist_electron');
    #protocolName: string = 'app';
    #fileTypeMap: { [key: string]: string } = {
        '.js': 'text/javascript',
        '.mjs': 'text/javascript',
        '.html': 'text/html',
        '.htm': 'text/html',
        '.json': 'application/json',
        '.css': 'text/css',
        '.svg': 'application/svg+xml',
        '.ico': 'image/vnd.microsoft.icon',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.map': 'text/plain'
    };
    #utfCodingList = ['.js', '.mjs', '.cjs', '.json', '.html', '.htm'];

    public setProtocolName(name: string) {
        if (!name.trim() || this.#protocolName === name) return;
        this.#protocolName = name;
    }

    public setBasePath(cwd: string) {
        if (!cwd.trim() || this.#basePath === cwd) return;
        this.#basePath = cwd;
    }

    public addFileTypeMap(key: string, value: string) {
        if (!key.trim() || !value.trim() || this.#fileTypeMap[key] === value)
            return;
        this.#fileTypeMap[key] = value;
    }

    public addUtfCodingValue(value: string) {
        if (!value.trim() || this.#utfCodingList.includes(value)) return;
        this.#utfCodingList.push(value);
    }

    public charsetFile(ext: string): BufferEncoding | undefined {
        if (this.#utfCodingList.includes(ext)) {
            return 'utf-8';
        }
    }

    public registerProtocol({
        cwd,
        name
    }: {
        cwd?: string;
        name?: string;
    } = {}): void {
        this.setBasePath(cwd || '');
        this.setProtocolName(name || '');
        protocol.registerSchemesAsPrivileged([
            {
                scheme: this.#protocolName,
                privileges: {
                    standard: true,
                    secure: true,
                    supportFetchAPI: true,
                    allowServiceWorkers: true
                }
            }
        ]);
        app.whenReady().then(() => this.protocolHandler());
    }

    public protocolHandler(): void {
        protocol.handle(this.#protocolName, (req: GlobalRequest) => {
            const { host, pathname } = new URL(req.url);
            if (host === '.') {
                const filePath = path.normalize(`${host}${pathname}`);
                try {
                    const fileContent = fs.readFileSync(
                        path.resolve(this.#basePath, filePath),
                        { encoding: this.charsetFile(path.extname(filePath)) }
                    );
                    return new Response(fileContent, {
                        headers: {
                            'content-type':
                                this.#fileTypeMap[path.extname(filePath)]
                        }
                    });
                } catch (e) {
                    return new Response(
                        `bad request ${
                            (e as unknown as { error: string }).error ||
                            (e as unknown as { message: string }).message
                        }`,
                        {
                            status: 400
                        }
                    );
                }
            }

            return net.fetch(`${host}${pathname}`, req);
        });
    }
}

export default new RegisterProtocol();
