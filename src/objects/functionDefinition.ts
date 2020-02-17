
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
        tempRegion = this.fileRegion.getRegionByType(REGION_TYPE.instrs);
        this.instructionList = tempRegion.createInstructions();
        // TODO: Consume more regions.
        console.log(this.instructionList);
        
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


