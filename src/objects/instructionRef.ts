
import {InstructionValue} from "models/items";

import {DataType} from "delegates/dataType";

import {RuntimeError} from "objects/runtimeError";
import {InstructionArg} from "objects/instruction";
import {Allocation} from "objects/allocation";
import {FunctionInvocation} from "objects/bytecodeInterpreter";

export const simpleInstructionRefMap: {[argPrefix: string]: SimpleInstructionRef} = {};

export abstract class InstructionRef {
    
    constructor() {
        // Do nothing.
        
    }
    
    abstract getAllocation(context: FunctionInvocation): Allocation;
    
    read(context: FunctionInvocation, index: number, dataType: DataType): InstructionValue {
        let tempAllocation = this.getAllocation(context);
        if (tempAllocation === null) {
            throw new RuntimeError("Missing allocation for instruction reference.");
        }
        return tempAllocation.readInstructionValue(index, dataType);
    }
    
    write(context: FunctionInvocation, index: number, dataType: DataType, value: InstructionValue): void {
        let tempAllocation = this.getAllocation(context);
        if (tempAllocation === null) {
            throw new RuntimeError("Missing allocation for instruction reference.");
        }
        tempAllocation.writeInstructionValue(index, dataType, value);
    }
}

export abstract class SimpleInstructionRef extends InstructionRef {
    
    constructor(argPrefix: number) {
        super();
        simpleInstructionRefMap[argPrefix] = this;
    }
}

class GlobalFrameInstructionRef extends SimpleInstructionRef {
    
    constructor() {
        super(1);
    }
    
    getAllocation(context: FunctionInvocation): Allocation {
        return context.bytecodeInterpreter.globalFrame;
    }
}

class LocalFrameInstructionRef extends SimpleInstructionRef {
    
    constructor() {
        super(2);
    }
    
    getAllocation(context: FunctionInvocation): Allocation {
        return context.localFrame;
    }
}

class PrevArgFrameInstructionRef extends SimpleInstructionRef {
    
    constructor() {
        super(3);
    }
    
    getAllocation(context: FunctionInvocation): Allocation {
        return context.previousArgFrame;
    }
}

class NextArgFrameInstructionRef extends SimpleInstructionRef {
    
    constructor() {
        super(4);
    }
    
    getAllocation(context: FunctionInvocation): Allocation {
        return context.nextArgFrame;
    }
}

class AppDataInstructionRef extends SimpleInstructionRef {
    
    constructor() {
        super(5);
    }
    
    getAllocation(context: FunctionInvocation): Allocation {
        return context.bytecodeInterpreter.bytecodeApp.appData;
    }
    
    write(context: FunctionInvocation, index: number, dataType: DataType, value: InstructionValue): void {
        throw new RuntimeError("Cannot write to app data region.");
    }
}

export class PointerInstructionRef extends InstructionRef {
    
    pointerArg: InstructionArg;
    
    constructor(pointerArg: InstructionArg) {
        super();
        this.pointerArg = pointerArg;
    }
    
    getAllocation(context: FunctionInvocation): Allocation {
        let tempValue = this.pointerArg.read(context);
        if (typeof tempValue !== "object") {
            throw new RuntimeError("Cannot use number as pointer in heap allocation reference.");
        }
        if (tempValue === null) {
            throw new RuntimeError("Cannot dereference null pointer.");
        }
        return tempValue as Allocation;
    }
}

new GlobalFrameInstructionRef();
new LocalFrameInstructionRef();
new PrevArgFrameInstructionRef();
new NextArgFrameInstructionRef();
new AppDataInstructionRef();


