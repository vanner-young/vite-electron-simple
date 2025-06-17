import { app } from 'electron';

export default () => {
    if (!app.requestSingleInstanceLock()) app.quit();
};
