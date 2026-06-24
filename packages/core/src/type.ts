import type { InlineConfig } from "vite";
import type { Configuration, FileSet } from "electron-builder";

export interface BuilderConfig {
    viteConfig: InlineConfig;
    electronBuilder: Configuration;
    privateConfig: {
        appName?: string;
        needElectron?: boolean;
        tsMainConfigPath?: string;
        move?: Array<FileSet> | FileSet;
        mainProcessEnvPath?: Array<string>;
    };
}

export type ElectronServeProps = {
    appName: string;
    viteConfig: BuilderConfig["viteConfig"];
    mainProcessEnvPath: BuilderConfig["privateConfig"]["mainProcessEnvPath"];
    needElectron: BuilderConfig["privateConfig"]["needElectron"];
    tsMainConfigPath: BuilderConfig["privateConfig"]["tsMainConfigPath"];
    publicEnv: IndexUnKnown;
};

export interface IndexString {
    [key: string]: string;
}

export interface ParserTsProps {
    tsConfigPath: string;
    rootPath: string;
}

export interface MainBuildProcessConfig {
    rootPath: string;
    config: BuilderConfig;
}

export interface IndexUnKnown {
    [key: string]: unknown;
}

export type CB<T, S> = (...args: Array<T>) => unknown | Promise<S>;
