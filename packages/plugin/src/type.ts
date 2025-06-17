import type { ViteDevServer } from 'vite';
export type { PluginOption, Plugin } from 'vite';

export interface IndexStringType {
    [index: string]: unknown;
}

export type DevServer = ViteDevServer & {
    config: {
        inlineConfig: {
            __restartServer?: boolean;
        };
    };
};

export interface ElectronDevProps {
    entry: string;
    tsConfigPath?: string;
    envConfig?: IndexStringType;
}
