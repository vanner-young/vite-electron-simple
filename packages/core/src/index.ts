#!/usr/bin/env node
import ElectronDev from '@/module/ElectronDev';
import ElectronBuilder from '@/module/ElectronBuilder';
import { BuilderConfig } from './type';

export const defineMvConfig = (config: Partial<BuilderConfig>) => config;

const command = process.argv.slice(2);
const type = command?.[0];

if (type === 'build') {
    new ElectronBuilder().build();
} else if (type === 'start') {
    new ElectronDev().serve();
}
