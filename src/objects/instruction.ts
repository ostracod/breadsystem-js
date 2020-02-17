
export const INSTRUCTION_REF_PREFIX = {
    constant: 0,
    globalFrame: 1,
    localFrame: 2,
    prevArgFrame: 3,
    nextArgFrame: 4,
    appData: 5,
    heapAlloc: 6
};

// TODO: Create concrete subclasses of InstructionArg.
export abstract class InstructionArg {
    
    constructor() {
        
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


