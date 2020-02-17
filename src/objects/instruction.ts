
import {DataType} from "delegates/dataType";
import {Constant} from "objects/constant";
import {InstructionRef} from "objects/instructionRef";

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

export class RefInstructionArg extends InstructionArg {
    
    instructionRef: InstructionRef;
    dataType: DataType;
    indexArg: InstructionArg
    
    constructor(
        instructionRef: InstructionRef,
        dataType: DataType,
        indexArg: InstructionArg
    ) {
        super();
        this.instructionRef = instructionRef;
        this.dataType = dataType;
        this.indexArg = indexArg;
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


