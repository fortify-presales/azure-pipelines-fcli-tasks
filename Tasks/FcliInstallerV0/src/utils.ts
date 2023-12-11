"use strict";

import * as fs from 'fs';
import * as tl from 'azure-pipelines-task-lib/task';
import * as toolLib from 'azure-pipelines-tool-lib/tool';
import * as os from 'os';
import * as path from "path";
import * as util from 'util';

export async function getFcliVersion(): Promise<string> {
    const version = tl.getInput("version");
    if (version && version !== "latest") {
        return sanitizeVersionString(version);
    }

    console.log(tl.loc("FindingLatestFcliVersion"));
    const latestVersion =  await getLatestFcliVersion();
    console.log(tl.loc("LatestFcliVersion", latestVersion));
    return latestVersion;
}

export async function downloadFcli(version: string): Promise<string> {
    return await downloadFcliInternal(version);
}

// handle user input scenarios
function sanitizeVersionString(inputVersion: string) : string{
    // fcli doesn't use semantic versioning correctly so we can't use below
    //const version = toolLib.cleanVersion(inputVersion);
    // instead just remove trailing/leading whitespace
    let version = inputVersion.trim();
    if(!version) {
        throw new Error(tl.loc("NotAValidVersion"));
    }

    return version;
}

const fcliToolName = 'fcli';
const stableFcliVersion = 'v2.1.0';

async function getLatestFcliVersion(): Promise<string> {
    const fcliLatestReleaseUrl = 'https://api.github.com/repos/fortify/fcli/releases/latest';
    let latestVersion = stableFcliVersion;

    try {
        const downloadPath = await toolLib.downloadTool(fcliLatestReleaseUrl);
        const response = JSON.parse(fs.readFileSync(downloadPath, 'utf8').toString().trim());
        if (response.tag_name) {
            latestVersion = response.tag_name;
        }
    } catch (error) {
        tl.warning(tl.loc('ErrorFetchingLatestVersion', fcliLatestReleaseUrl, error, stableFcliVersion));
    }

    return latestVersion;
}

async function downloadFcliInternal(version: string): Promise<string> {
    let cachedToolpath = toolLib.findLocalTool(fcliToolName, version);

    if (!cachedToolpath) {
        const downloadUrl = getDownloadUrl(version);
        let downloadPath;
        try {
            downloadPath = await toolLib.downloadTool(downloadUrl);
        }
        catch (ex) {
            throw new Error(tl.loc('FcliDownloadFailed', downloadUrl, ex));
        }

        switch (os.type()) {
            case 'Linux':
            case 'Darwin':
                tl.debug('Extracting the downloaded fcli tar file..');
                const untaredFcliPath = await toolLib.extractTar(downloadPath);
                cachedToolpath = await toolLib.cacheDir(untaredFcliPath, fcliToolName, version);
                break;
            case 'Windows_NT':
            default:
                tl.debug('Extracting the downloaded fcli zip file..');
                const unzippedFcliPath = await toolLib.extractZip(downloadPath);
                cachedToolpath = await toolLib.cacheDir(unzippedFcliPath, fcliToolName, version);
                break;

        }
        console.log(tl.loc("SuccessfullyDownloaded", version, cachedToolpath));
    } else {
        console.log(tl.loc("VersionAlreadyInstalled", version, cachedToolpath));
    }

    const fcliPath = path.join(cachedToolpath, fcliToolName + getExecutableExtension());
    fs.chmodSync(fcliPath, '755');
    const gozipPath = path.join(cachedToolpath, 'gozip' + getExecutableExtension());
    if (fs.existsSync(gozipPath)) {
        fs.chmodSync(gozipPath, '755');
    }

    return fcliPath;
}

function getExecutableExtension(): string {
    if (os.type().match(/^Win/)) {
        return '.exe';
    }

    return '';
}

function getDownloadUrl(version: string) {
    let downloadUrlFormat = 'https://github.com/fortify/fcli/releases/download/%s/%s';
    switch (os.type()) {
        case 'Linux':
            return util.format(downloadUrlFormat, version, 'fcli-linux.tgz');

        case 'Darwin':
            return util.format(downloadUrlFormat, version, 'fcli-mac.tgz');

        case 'Windows_NT':
        default:
            return util.format(downloadUrlFormat, version, 'fcli-windows.zip');

    }
}
