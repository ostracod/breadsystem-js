
import {FILE_TYPE, volumeUtils} from "utils/volumeUtils";
import {RuntimeError} from "objects/runtimeError";
import {BytecodeAgent} from "objects/agent";

const bootAppsPath = ":bootApps";

class AppUtils {
    
    launchApp(absolutePath: string): void {
        console.log("Launching app: " + absolutePath);
        if (volumeUtils.vItemIsDir(absolutePath)) {
            throw new RuntimeError("Launching app bundles is not yet supported.");
        } else {
            let tempType = volumeUtils.getVItemType(absolutePath);
            if (tempType === FILE_TYPE.bytecodeApp) {
                new BytecodeAgent(absolutePath);
            } else if (tempType === FILE_TYPE.systemApp) {
                throw new RuntimeError("Launching system apps is not yet supported.");
            } else {
                throw new RuntimeError("Expected app.");
            }
        }
    }
    
    getBootAppPaths(): string[] {
        let tempNameList = volumeUtils.getDirItems(bootAppsPath);
        return tempNameList.map(name => {
            return volumeUtils.joinPath(bootAppsPath, name);
        });
    }
    
    launchBootApps(): void {
        let tempPathList = appUtils.getBootAppPaths();
        for (let path of tempPathList) {
            appUtils.launchApp(path);
        }
    }
}

export let appUtils = new AppUtils();


