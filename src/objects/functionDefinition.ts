
import {FrameLength} from "objects/allocation";
import {Instruction} from "objects/instruction";

export class FunctionDefinition {
    
    localFrameLength: FrameLength;
    instructionList: Instruction[];
    
    constructor() {
        this.localFrameLength = new FrameLength(0, 0);
        this.instructionList = [];
        // TODO: Parse function region.
        
    }
}


