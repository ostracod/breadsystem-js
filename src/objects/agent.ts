
import {BytecodeInterpreter} from "objects/bytecodeInterpreter";
import {AgentSentry} from "objects/allocation";

export let runningAgentList = [];

export abstract class Agent {
    
    appPath: string;
    sentry: AgentSentry;
    
    constructor(absoluteAppPath: string) {
        this.appPath = absoluteAppPath;
        this.sentry = new AgentSentry(this);
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


