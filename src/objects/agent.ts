
import {Allocation} from "objects/allocation";
import {Instruction} from "objects/instruction";
import {BytecodeApp} from "objects/bytecodeApp";
import {FunctionDefinition} from "objects/functionDefinition";

export let runningAgentList = [];

export class Agent {
    
    bytecodeApp: BytecodeApp;
    instructionIndex: number;
    currentFunctionDefinition: FunctionDefinition;
    globalFrame: Allocation;
    currentInstruction: Instruction;
    
    constructor(appPath: string) {
        this.bytecodeApp = new BytecodeApp(appPath);
        runningAgentList.push(this);
        this.instructionIndex = 0;
        this.currentFunctionDefinition = this.bytecodeApp.initFunctionDefinition;
        this.globalFrame = new Allocation(this.bytecodeApp.globalFrameLength);
        this.currentInstruction = null;
    }
    
    performNextInstruction(): void {
        if (this.currentFunctionDefinition === null) {
            return;
        }
        let tempInstructionList = this.currentFunctionDefinition.instructionList;
        if (this.instructionIndex >= tempInstructionList.length) {
            return;
        }
        this.currentInstruction = tempInstructionList[this.instructionIndex];
        this.instructionIndex += 1;
        let opcode = this.currentInstruction.opcode;
        // TODO: Evaluate instruction.
        
    }
    
    terminate(): void {
        let index = runningAgentList.indexOf(this);
        if (index >= 0) {
            runningAgentList.splice(index, 1);
        }
    }
}


