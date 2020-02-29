
import * as pathUtils from "path";
import * as fs from "fs";

const primaryVolumeNativePath = "./primaryVolume";

class VolumeUtils {
    
    // TODO: Support volume names and escaped characters in paths.
    
    joinPath(tail: string, head: string): string {
        if (tail === ":") {
            return tail + head;
        }
        return tail + "/" + head;
    }
    
    convertAbsolutePathToNativePath(absolutePath: string): string {
        let tempNameList = absolutePath.substring(1, absolutePath.length).split("/");
        let output = primaryVolumeNativePath;
        for (let index = 0; index < tempNameList.length; index++) {
            let tempName = tempNameList[index];
            let tempNativePath = pathUtils.join(output, "dirContent_" + tempName);
            if (index >= tempNameList.length - 1 && !fs.existsSync(tempNativePath)) {
                tempNativePath = pathUtils.join(output, "fileContent_" + tempName);
            }
            if (!fs.existsSync(tempNativePath)) {
                return null;
            }
            output = tempNativePath;
        }
        return output;
    }
    
    getDirItems(absolutePath: string): string[] {
        let tempNativePath = volumeUtils.convertAbsolutePathToNativePath(absolutePath);
        let tempNameList = fs.readdirSync(tempNativePath)
        let output = [];
        for (let name of tempNameList) {
            let tempIndex = name.indexOf("_");
            if (tempIndex >= 0) {
                let tempPrefix = name.substring(0, tempIndex);
                if (tempPrefix === "fileContent" || tempPrefix === "dirContent") {
                    output.push(name.substring(tempIndex + 1, name.length));
                }
            }
        }
        return output;
    }
    
    pathIsAbsolute(path: string): boolean {
        return (path.substring(0, 1) === ":");
    }
    
    vItemExists(absolutePath: string): boolean {
        let tempPath = volumeUtils.convertAbsolutePathToNativePath(absolutePath);
        return fs.existsSync(tempPath);
    }
}

export let volumeUtils = new VolumeUtils();


