
import {BytecodeInterpreter} from "objects/bytecodeInterpreter";

export let runningAgentList = [];

export abstract class Agent {
    
    appPath: string;
    
    constructor(absoluteAppPath: string) {
        this.appPath = absoluteAppPath;
        runningAgentList.push(this);
    }
    
    abstract timerEvent(): void;
    
    terminate(): void {
        let index = runningAgentList.indexOf(this);
        if (index >= 0) {
            runningAgentList.splice(index, 1);
        }
    }
}

export class BytecodeAgent extends Agent {
    
    bytecodeInterpreter: BytecodeInterpreter;
    
    constructor(absoluteAppPath: string) {
        super(absoluteAppPath);
        this.bytecodeInterpreter = new BytecodeInterpreter(this);
    }
    
    timerEvent(): void {
        this.bytecodeInterpreter.evaluateNextInstruction();
    }
}

// TODO: Create SystemAgent class for system apps.


