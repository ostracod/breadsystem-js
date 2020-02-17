
import {Constant} from "objects/constant";

export const INSTRUCTION_REF_PREFIX = {
    constant: 0,
    globalFrame: 1,
    localFrame: 2,
    prevArgFrame: 3,
    nextArgFrame: 4,
    appData: 5,
    heapAlloc: 6
};

export abstract class InstructionArg {
    
    constructor() {
        // Do nothing.
        
    }
}

export class ConstantInstructionArg extends InstructionArg {
    
    constant: Constant;
    
    constructor(constant: Constant) {
        super();
        this.constant = constant;
    }
}

export class Instruction {
    
    opcode: number;
    argList: InstructionArg[];
    
    constructor(opcode: number, argList: InstructionArg[]) {
        this.opcode = opcode;
        this.argList = argList;
    }
}


