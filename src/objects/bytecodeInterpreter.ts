
import {RuntimeError} from "objects/runtimeError";
import {Agent} from "objects/agent";
import {BytecodeApp} from "objects/bytecodeApp";
import {Allocation} from "objects/allocation";
import {FunctionDefinition} from "objects/functionDefinition";
import {Instruction} from "objects/instruction";

class FunctionInvocation {
    
    bytecodeInterpreter: BytecodeInterpreter;
    functionDefinition: FunctionDefinition;
    hasFinished: boolean;
    instructionIndex: number;
    currentInstruction: Instruction;
    
    constructor(bytecodeInterpreter: BytecodeInterpreter, functionDefinition: FunctionDefinition) {
        this.bytecodeInterpreter = bytecodeInterpreter;
        this.functionDefinition = functionDefinition;
        this.hasFinished = false;
        this.instructionIndex = 0;
        this.currentInstruction = null;
    }
    
    performNextInstruction(): void {
        if (this.hasFinished) {
            return;
        }
        let tempInstructionList = this.functionDefinition.instructionList;
        if (this.instructionIndex >= tempInstructionList.length) {
            this.hasFinished = true;
            return;
        }
        this.currentInstruction = tempInstructionList[this.instructionIndex];
        this.instructionIndex += 1;
        let opcode = this.currentInstruction.opcode;
        // TODO: Evaluate instruction.
        console.log(this.currentInstruction);
        
    }
}

export class BytecodeInterpreter {
    
    agent: Agent;
    bytecodeApp: BytecodeApp;
    globalFrame: Allocation;
    callStack: FunctionInvocation[];
    
    constructor(agent: Agent) {
        this.agent = agent;
        this.bytecodeApp = new BytecodeApp(this.agent.appPath);
        let tempResult = this.bytecodeApp.resolveDependencyPaths();
        if (!tempResult) {
            throw new RuntimeError("Could not resolve all required dependency paths.");
        }
        this.globalFrame = new Allocation(this.bytecodeApp.globalFrameLength);
        this.callStack = [];
        let tempFunctionDefinition = this.bytecodeApp.initFunctionDefinition;
        if (tempFunctionDefinition !== null) {
            this.invokeFunction(tempFunctionDefinition);
        }
    }
    
    invokeFunction(functionDefinition: FunctionDefinition) {
        let tempInvocation = new FunctionInvocation(this, functionDefinition);
        this.callStack.push(tempInvocation);
    }
    
    performNextInstruction(): void {
        if (this.callStack.length <= 0) {
            return;
        }
        let tempInvocation = this.callStack[this.callStack.length - 1];
        tempInvocation.performNextInstruction();
        if (tempInvocation.hasFinished) {
            this.callStack.pop();
        }
    }
}


