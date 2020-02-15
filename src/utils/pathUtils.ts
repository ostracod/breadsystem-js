
import * as nativePathUtils from "path";
import * as fs from "fs";

const primaryVolumeNativePath = "./primaryVolume";

class PathUtils {
    
    joinPath(tail: string, head: string): string {
        if (tail.length > 0 && tail.substring(tail.length - 1, tail.length) === "/") {
            tail = tail.substring(0, tail.length - 1);
        }
        return tail + "/" + head;
    }
    
    convertPathToNativePath(path: string): string {
        if (path.length >= 1 && path.substring(0, 1) === ":") {
            path = path.substring(1, path.length);
        }
        let tempNameList = path.split("/");
        let output = primaryVolumeNativePath;
        for (let index = 0; index < tempNameList.length; index++) {
            let tempName = tempNameList[index];
            let tempNativePath = nativePathUtils.join(output, "dirContent_" + tempName);
            if (index >= tempNameList.length - 1 && !fs.existsSync(tempNativePath)) {
                tempNativePath = nativePathUtils.join(output, "fileContent_" + tempName);
            }
            if (!fs.existsSync(tempNativePath)) {
                return null;
            }
            output = tempNativePath;
        }
        return output;
    }
    
    getDirItems(path: string): string[] {
        let tempNativePath = pathUtils.convertPathToNativePath(path);
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
}

export let pathUtils = new PathUtils();


