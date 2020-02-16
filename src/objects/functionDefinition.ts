
import {FrameLength} from "objects/allocation";
import {Instruction} from "objects/instruction";
import {REGION_TYPE, CompositeFileRegion} from "objects/fileRegion";

export abstract class FunctionDefinition {
    
    fileRegion: CompositeFileRegion;
    localFrameLength: FrameLength;
    instructionList: Instruction[];
    
    constructor(fileRegion: CompositeFileRegion) {
        this.fileRegion = fileRegion;
        let tempRegion = this.fileRegion.getRegionByType(REGION_TYPE.localFrameLen);
        this.localFrameLength = tempRegion.createFrameLength();
        this.instructionList = [];
        // TODO: Consume more regions.
        
    }
}

export class PrivateFunctionDefinition extends FunctionDefinition {
    // TODO: Add extra behavior.
    
}

export class PublicFunctionDefinition extends FunctionDefinition {
    // TODO: Add extra behavior.
    
}

export class GuardFunctionDefinition extends FunctionDefinition {
    // TODO: Add extra behavior.
    
}


