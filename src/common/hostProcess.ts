import os from "os";

/**
 * @name - Host Process
 * @description - Describes the host process
 * @member type - The type of the host process (electron, browser, etc)
 * @member release - The release string of the host process
 */
export interface IHostProcess {
    type: HostProcessType;
    release: string;
}

/**
 * @enum ELECTRON - Electron Host Process Type
 * @enum BROWSER - Browser Host Process Type
 */
export enum HostProcessType {
    Electron = 1, // bits: 01
    Browser = 2,  // bits: 10
    All = 3,      // bits: 11
}

export enum PlatformType {
    Windows = "win32",
    Linux = "linux",
    MacOS = "darwin",
}

function getHostProcess(): IHostProcess {
    const osRelease = os.release().toLowerCase();
    let hostProcessType: HostProcessType;
    if (osRelease.indexOf("electron") > -1 || process.env.HOST_TYPE === "electron") {
        hostProcessType = HostProcessType.Electron;
    } else {
        hostProcessType = HostProcessType.Browser;
    }

    return {
        release: osRelease,
        type: hostProcessType,
    };
}

export default getHostProcess;
