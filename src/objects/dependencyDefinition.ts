
import {bufferUtils} from "utils/bufferUtils";
import {DIR_TYPE, volumeUtils} from "utils/volumeUtils";

import {RuntimeError} from "objects/runtimeError";
import {REGION_TYPE, FileRegion, AtomicFileRegion, CompositeFileRegion} from "objects/fileRegion";
import {VersionNumber} from "objects/versionNumber";

const versionDirectoryNameRegex = /^ver_(\d+)_(\d+)_(\d+)$/;

export abstract class DependencyDefinition {
    
    fileRegion: CompositeFileRegion;
    unresolvedPath: string;
    resolvedPath: string;
    isOptional: boolean;
    isImplemented: boolean;
    isGuarded: boolean;
    
    constructor(fileRegion: CompositeFileRegion) {
        this.fileRegion = fileRegion;
        let tempRegion = this.fileRegion.getRegionByType(REGION_TYPE.path);
        this.unresolvedPath = tempRegion.createString();
        this.resolvedPath = null;
        let tempAtomicRegion = this.fileRegion.getRegionByType(
            REGION_TYPE.depAttrs
        ) as AtomicFileRegion;
        if (tempAtomicRegion.contentBuffer.length !== 1) {
            throw new RuntimeError("Dependency attributes region has incorrect length.");
        }
        let tempValue = bufferUtils.readUInt(tempAtomicRegion.contentBuffer, 0, 1);
        this.isOptional = ((tempValue & 0x04) > 0);
        this.isImplemented = ((tempValue & 0x02) > 0);
        this.isGuarded = ((tempValue & 0x01) > 0);
    }
    
    // Returns whether the path was resolved successfully.
    resolvePath(): boolean {
        if (volumeUtils.pathIsAbsolute(this.unresolvedPath)) {
            return this.resolveAbsolutePath(this.unresolvedPath);
        } else {
            throw new RuntimeError("Resolving relative dependency paths is not yet supported.");
        }
    }
    
    // Returns whether the path was resolved successfully.
    abstract resolveAbsolutePath(absolutePath: string): boolean;
}

export class PathDependencyDefinition extends DependencyDefinition {
    
    constructor(fileRegion: CompositeFileRegion) {
        super(fileRegion);
    }
    
    resolveAbsolutePath(absolutePath: string): boolean {
        if (!volumeUtils.vItemExists(absolutePath)) {
            return false;
        }
        this.resolvedPath = absolutePath;
        return true;
    }
}

export class VersionDependencyDefinition extends DependencyDefinition {
    
    versionNumber: VersionNumber;
    
    constructor(fileRegion: CompositeFileRegion) {
        super(fileRegion);
        let tempRegion = this.fileRegion.getRegionByType(REGION_TYPE.depVer);
        this.versionNumber = tempRegion.createVersionNumber();
    }
    
    resolveAbsolutePath(absolutePath: string): boolean {
        if (!volumeUtils.vItemExists(absolutePath)) {
            return false;
        }
        if (!volumeUtils.vItemIsDir(absolutePath)) {
            return false;
        }
        let tempType = volumeUtils.getVItemType(absolutePath);
        if (tempType !== DIR_TYPE.appBundle && tempType !== DIR_TYPE.ifaceBundle) {
            return false;
        }
        let tempNameList = volumeUtils.getDirItems(absolutePath);
        for (let name of tempNameList) {
            let tempResult = name.match(versionDirectoryNameRegex);
            if (tempResult === null) {
                continue;
            }
            let tempVersionNumber = new VersionNumber(
                parseInt(tempResult[1]),
                parseInt(tempResult[2]),
                parseInt(tempResult[3])
            );
            if (!tempVersionNumber.satisfiesRequirement(this.versionNumber)) {
                continue;
            }
            let tempPath = volumeUtils.joinPath(absolutePath, name);
            tempPath = volumeUtils.joinPath(tempPath, "main");
            if (!volumeUtils.vItemExists(tempPath)) {
                continue;
            }
            // TODO: Verify that requirements of the app/iface can also be met.
            this.resolvedPath = tempPath;
            return true;
        }
        return false;
    }
}

export class InterfaceDependencyDefinition extends DependencyDefinition {
    
    dependencyIndexList: number[];
    
    constructor(fileRegion: CompositeFileRegion) {
        super(fileRegion);
        let tempAtomicRegion = this.fileRegion.getRegionByType(
            REGION_TYPE.depIndexes
        ) as AtomicFileRegion;
        this.dependencyIndexList = [];
        let tempBuffer = tempAtomicRegion.contentBuffer;
        for (let index = 0; index < tempBuffer.length; index += 4) {
            let tempValue = bufferUtils.readUInt(tempBuffer, index, 4);
            this.dependencyIndexList.push(tempValue);
        }
    }
    
    resolveAbsolutePath(absolutePath: string): boolean {
        // TODO: Implement.
        throw new RuntimeError("Interface dependencies are not yet implemented.");
        
    }
}


