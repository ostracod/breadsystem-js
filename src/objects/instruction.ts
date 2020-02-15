
// TODO: Create concrete subclasses of InstructionArg.
abstract class InstructionArg {
    
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


