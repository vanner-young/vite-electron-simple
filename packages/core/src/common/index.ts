import { isActiveProcessByName, killProcessName } from 'mv-common';
import { IndexUnKnown, IndexString } from '@/type';

export const formateEnv = (env: IndexUnKnown): IndexString => {
    const envLocal: IndexString = {};
    for (const key in env) {
        envLocal[`import.meta.env.${key}`] = JSON.stringify(env[key]);
        envLocal[`process.env.${key}`] = JSON.stringify(env[key]);
    }
    return envLocal;
};

export const closeRunningProcess = async (name: string) => {
    const exists = await isActiveProcessByName(name);
    if (!exists) return;

    await killProcessName(name);
};
