import dotenv from 'dotenv';
import { app } from 'electron';
import { getResourceStatic } from '@/module/common';

export const loadProductionEnv = () => {
    if (!app.isPackaged) return;

    return !!dotenv.config({
        path: getResourceStatic('env', 'electron-builder.env'),
        encoding: 'utf8'
    });
};
