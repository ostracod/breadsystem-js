
import {instructionUtils} from "utils/instructionUtils";

import {RuntimeError} from "objects/runtimeError";
import {Agent} from "objects/agent";
import {BytecodeApp} from "objects/bytecodeApp";
import {Allocation} from "objects/allocation";
import {FunctionDefinition} from "objects/functionDefinition";

export class FunctionInvocation {
    
    thread: Thread;
    bytecodeInterpreter: BytecodeInterpreter;
    bytecodeApp: BytecodeApp;
    functionDefinition: FunctionDefinition;
    hasFinished: boolean;
    instructionIndex: number;
    localFrame: Allocation;
    previousArgFrame: Allocation;
    nextArgFrame: Allocation;
    
    constructor(
        thread: Thread,
        functionDefinition: FunctionDefinition,
        previousArgFrame: Allocation
    ) {
        this.thread = thread;
        this.bytecodeInterpreter = this.thread.bytecodeInterpreter;
        this.bytecodeApp = this.bytecodeInterpreter.bytecodeApp;
        this.functionDefinition = functionDefinition;
        this.hasFinished = false;
        this.instructionIndex = 0;
        this.localFrame = this.functionDefinition.localFrameLength.createAllocation();
        this.previousArgFrame = previousArgFrame;
        this.nextArgFrame = null;
    }
    
    evaluateNextInstruction(): void {
        if (this.hasFinished) {
            return;
        }
        let tempInstructionList = this.functionDefinition.instructionList;
        if (this.instructionIndex >= tempInstructionList.length) {
            this.hasFinished = true;
            return;
        }
        let tempInstruction = tempInstructionList[this.instructionIndex];
        this.instructionIndex += 1;
        instructionUtils.evaluateInstruction(this, tempInstruction);
        // TEST CODE.
        console.log(this.localFrame);
    }
}

export class Thread {
    
    bytecodeInterpreter: BytecodeInterpreter;
    callStack: FunctionInvocation[];
    hasFinished: boolean;
    
    constructor(bytecodeInterpreter: BytecodeInterpreter) {
        this.bytecodeInterpreter = bytecodeInterpreter;
        this.callStack = [];
        this.hasFinished = false;
    }
    
    invokeFunction(functionDefinition: FunctionDefinition, previousArgFrame: Allocation = null): void {
        let tempInvocation = new FunctionInvocation(
            this,
            functionDefinition,
            previousArgFrame
        );
        this.callStack.push(tempInvocation);
    }
    
    evaluateNextInstruction(): void {
        if (this.callStack.length <= 0) {
            this.hasFinished = true;
            return;
        }
        let tempInvocation = this.callStack[this.callStack.length - 1];
        tempInvocation.evaluateNextInstruction();
        if (tempInvocation.hasFinished) {
            this.callStack.pop();
        }
    }
}

export class BytecodeInterpreter {
    
    agent: Agent;
    bytecodeApp: BytecodeApp;
    globalFrame: Allocation;
    threadList: Thread[];
    
    constructor(agent: Agent) {
        this.agent = agent;
        this.bytecodeApp = new BytecodeApp(this.agent.appPath);
        let tempResult = this.bytecodeApp.resolveDependencyPaths();
        if (!tempResult) {
            throw new RuntimeError("Could not resolve all required dependency paths.");
        }
        this.globalFrame = this.bytecodeApp.globalFrameLength.createAllocation();
        this.threadList = [];
        let tempFunctionDefinition = this.bytecodeApp.initFunctionDefinition;
        if (tempFunctionDefinition !== null) {
            this.invokeFunction(tempFunctionDefinition);
        }
    }
    
    invokeFunction(functionDefinition: FunctionDefinition, previousArgFrame: Allocation = null): void {
        let tempThread = new Thread(this);
        tempThread.invokeFunction(functionDefinition, previousArgFrame);
        this.threadList.push(tempThread);
    }
    
    timerEvent(): void {
        for (let index = this.threadList.length - 1; index >= 0; index--) {
            let tempThread = this.threadList[index];
            tempThread.evaluateNextInstruction();
            if (tempThread.hasFinished) {
                this.threadList.splice(index, 1);
            }
        }
    }
}


