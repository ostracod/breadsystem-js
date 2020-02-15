
import {pathUtils} from "utils/pathUtils";
import {Agent} from "objects/agent";

const bootAppsPath = ":bootApps";

class AppUtils {
    
    launchApp(path: string): void {
        console.log("Launching app: " + path);
        new Agent(path);
    }
    
    getBootAppPaths(): string[] {
        let tempNameList = pathUtils.getDirItems(bootAppsPath);
        return tempNameList.map(name => {
            return pathUtils.joinPath(bootAppsPath, name);
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


