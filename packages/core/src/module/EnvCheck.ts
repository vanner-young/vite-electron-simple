export class EnvCheck {
    nodeVersion = 20;
    supportPlatform: Array<string> = ['win32', 'darwin'];

    public check() {
        this.checkPlatform();
        this.checkNodeVersion();
    }

    // 检测Node版本是否支持
    private checkNodeVersion() {
        const [mainVersion] = process.version
            .replaceAll('v', '')
            .replaceAll('V', '')
            .split('.');

        const isSupport = Number(mainVersion) >= this.nodeVersion;
        if (!isSupport)
            throw new Error(
                `当前Node不支持，请使用Node${this.nodeVersion}及以上的版本`
            );
    }

    // 检测系统平台版本是否支持
    private checkPlatform() {
        const platform = process.platform;
        if (!this.supportPlatform.includes(platform))
            throw new Error(
                '当前系统平台不支持，目前支持的系统有: Windows、MacOs'
            );
    }
}
