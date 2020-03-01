
import {RuntimeError} from "objects/runtimeError";

import * as pathUtils from "path";
import * as fs from "fs";

const primaryVolumeNativePath = "./exampleVolume";
const primaryVolumeRootName = "primaryVolume";

const NATIVE_PATH_PREFIX = {
    fileContent: "fileContent_",
    fileMetadata: "fileMetadata_",
    dirContent: "dirContent_",
    dirMetadata: "dirMetadata_"
};

export const FILE_TYPE = {
    generic: 0,
    bytecodeApp: 1,
    systemApp: 2,
    iface: 3
};

export const DIR_TYPE = {
    generic: 0,
    appBundle: 1,
    ifaceBundle: 2
};

class VolumeUtils {
    
    // TODO: Support volume names and escaped characters in paths.
    
    joinPath(tail: string, head: string): string {
        if (tail === ":") {
            return tail + head;
        }
        return tail + "/" + head;
    }
    
    convertAbsolutePathToNativePath(
        absolutePath: string
    ): {contentPath: string, metadataPath: string, isDir: boolean} {
        let tempPath = absolutePath.substring(1, absolutePath.length);
        let tempNameList;
        if (tempPath.length > 0) {
            tempNameList = tempPath.split("/");
        } else {
            tempNameList = [];
        }
        tempNameList.unshift(primaryVolumeRootName);
        let directoryPath = primaryVolumeNativePath;
        for (let index = 0; index < tempNameList.length - 1; index++) {
            directoryPath = pathUtils.join(
                directoryPath,
                NATIVE_PATH_PREFIX.dirContent + tempNameList[index]
            );
        }
        let lastName = tempNameList[tempNameList.length - 1];
        let contentPath = pathUtils.join(
            directoryPath,
            NATIVE_PATH_PREFIX.fileContent + lastName
        );
        let nativePathIsDir: boolean;
        if (fs.existsSync(contentPath)) {
            nativePathIsDir = false;
        } else {
            contentPath = pathUtils.join(
                directoryPath,
                NATIVE_PATH_PREFIX.dirContent + lastName
            );
            if (!fs.existsSync(contentPath)) {
                return null;
            }
            nativePathIsDir = true;
        }
        let tempPrefix: string;
        if (nativePathIsDir) {
            tempPrefix = NATIVE_PATH_PREFIX.dirMetadata;
        } else {
            tempPrefix = NATIVE_PATH_PREFIX.fileMetadata;
        }
        let metadataPath = pathUtils.join(
            directoryPath,
            tempPrefix + lastName
        );
        return {
            contentPath: contentPath,
            metadataPath: metadataPath,
            isDir: nativePathIsDir
        };
    }
    
    getDirItems(absolutePath: string): string[] {
        let tempResult = volumeUtils.convertAbsolutePathToNativePath(absolutePath);
        if (!tempResult.isDir) {
            throw new RuntimeError("Expected directory.");
        }
        let tempNativePath = tempResult.contentPath;
        let tempNameList = fs.readdirSync(tempNativePath);
        let output = [];
        for (let name of tempNameList) {
            let tempIndex = name.indexOf("_");
            if (tempIndex >= 0) {
                let tempPrefix = name.substring(0, tempIndex + 1);
                if (tempPrefix === NATIVE_PATH_PREFIX.fileContent
                        || tempPrefix === NATIVE_PATH_PREFIX.dirContent) {
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
        let tempResult = volumeUtils.convertAbsolutePathToNativePath(absolutePath);
        return (tempResult !== null);
    }
    
    vItemIsDir(absolutePath: string): boolean {
        let tempResult = volumeUtils.convertAbsolutePathToNativePath(absolutePath);
        if (tempResult === null) {
            throw new RuntimeError("Volume item does not exist.");
        }
        return tempResult.isDir;
    }
    
    getVItemType(absolutePath: string): number {
        let tempResult = volumeUtils.convertAbsolutePathToNativePath(absolutePath);
        let tempContent = fs.readFileSync(tempResult.metadataPath, "utf8");
        let tempMetadata = JSON.parse(tempContent);
        return tempMetadata.type;
    }
}

export let volumeUtils = new VolumeUtils();


