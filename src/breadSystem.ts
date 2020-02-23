
// This code is intended to perform the functionality of rootpath.
// Put all other code after these few lines.
import * as pathUtils from "path";
process.env.NODE_PATH = pathUtils.dirname(__filename);
require("module")._initPaths();
export const projectPath = pathUtils.dirname(__dirname);

import {appUtils} from "utils/appUtils";
import {runningAgentList} from "objects/agent";

function timerEvent(): void {
    if (runningAgentList.length <= 0) {
        clearInterval(timerInterval);
    }
    for (let index = runningAgentList.length - 1; index >= 0; index--) {
        let tempAgent = runningAgentList[index];
        tempAgent.performNextInstruction();
    }
}

appUtils.launchBootApps();
let timerInterval = setInterval(timerEvent, 50);


