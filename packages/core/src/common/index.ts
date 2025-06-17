import { IndexUnKnown, IndexString } from '@/type';

export const formateEnv = (env: IndexUnKnown): IndexString => {
    const envLocal: IndexString = {};
    for (const key in env) {
        envLocal[`import.meta.env.${key}`] = JSON.stringify(env[key]);
        envLocal[`process.env.${key}`] = JSON.stringify(env[key]);
    }
    return envLocal;
};
