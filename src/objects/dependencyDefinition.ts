
import {bufferUtils} from "utils/bufferUtils";
import {RuntimeError} from "objects/runtimeError";
import {REGION_TYPE, FileRegion, AtomicFileRegion, CompositeFileRegion} from "objects/fileRegion";

export abstract class DependencyDefinition {
    
    fileRegion: CompositeFileRegion;
    path: string;
    isOptional: boolean;
    isImplemented: boolean;
    isGuarded: boolean;
    
    constructor(fileRegion: CompositeFileRegion) {
        this.fileRegion = fileRegion;
        let tempRegion = this.fileRegion.getRegionByType(REGION_TYPE.path);
        this.path = tempRegion.createString();
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
}

export class PathDependencyDefinition extends DependencyDefinition {
    
    constructor(fileRegion: CompositeFileRegion) {
        super(fileRegion);
    }
}

export class VersionDependencyDefinition extends DependencyDefinition {
    
    constructor(fileRegion: CompositeFileRegion) {
        super(fileRegion);
        // TODO: Consume more regions.
        
    }
}

export class InterfaceDependencyDefinition extends DependencyDefinition {
    
    constructor(fileRegion: CompositeFileRegion) {
        super(fileRegion);
        // TODO: Consume more regions.
        
    }
}


