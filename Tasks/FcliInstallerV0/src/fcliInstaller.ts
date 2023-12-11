"use strict";

import * as tl from 'azure-pipelines-task-lib/task';
import * as path from 'path';
import * as toolLib from 'azure-pipelines-tool-lib/tool';
import * as utils from './utils';

tl.setResourcePath(path.join(__dirname, '..', 'task.json'));

let telemetry = {
    jobId: tl.getVariable('SYSTEM_JOBID')
};

console.log("##vso[telemetry.publish area=%s;feature=%s]%s",
    "TaskEndpointId",
    "FcliInstallerV0",
    JSON.stringify(telemetry));

async function downloadFcli() {
    const version = await utils.getFcliVersion();
    const fcliPath = await utils.downloadFcli(version);

    // prepend the tools path. instructs the agent to prepend for future tasks
    if (!process.env['PATH'].startsWith(path.dirname(fcliPath))) {
        toolLib.prependPath(path.dirname(fcliPath));
    }
}

async function verifyFcli() {
    console.log(tl.loc("VerifyingFcliInstallation"));
    const fcliPath = tl.which("fcli", true);
    var fcli = tl.tool(fcliPath);
    fcli.arg("--version");
    return fcli.exec();
}

downloadFcli()
    .then(() => verifyFcli())
    .then(() => {
        tl.setResult(tl.TaskResult.Succeeded, "");
    }).catch((error) => {
    tl.setResult(tl.TaskResult.Failed, error)
});
