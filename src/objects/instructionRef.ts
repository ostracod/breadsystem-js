
import {InstructionArg} from "objects/instruction";

export const simpleInstructionRefMap: {[argPrefix: string]: SimpleInstructionRef} = {};

export abstract class InstructionRef {
    
    constructor() {
        // Do nothing.
        
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
}

class LocalFrameInstructionRef extends SimpleInstructionRef {
    
    constructor() {
        super(2);
    }
}

class PrevArgFrameInstructionRef extends SimpleInstructionRef {
    
    constructor() {
        super(3);
    }
}

class NextArgFrameInstructionRef extends SimpleInstructionRef {
    
    constructor() {
        super(4);
    }
}

class AppDataInstructionRef extends SimpleInstructionRef {
    
    constructor() {
        super(5);
    }
}

export class PointerInstructionRef extends InstructionRef {
    
    pointerArg: InstructionArg;
    
    constructor(pointerArg: InstructionArg) {
        super();
        this.pointerArg = pointerArg;
    }
}

new GlobalFrameInstructionRef();
new LocalFrameInstructionRef();
new PrevArgFrameInstructionRef();
new NextArgFrameInstructionRef();
new AppDataInstructionRef();


