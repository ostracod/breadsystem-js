
// This code is intended to perform the functionality of rootpath.
// Put all other code after these few lines.
import * as path from "path";
process.env.NODE_PATH = path.dirname(__filename);
require("module")._initPaths();
export const projectPath = path.dirname(__dirname);

import * as fs from "fs";
import * as pathUtils from "path";

const primaryVolumeNativePath = "./primaryVolume";
const bootAppsPath = ":bootApps";

let runningAgentList = [];

function joinPath(tail: string, head: string): string {
    if (tail.length > 0 && tail.substring(tail.length - 1, tail.length) === "/") {
        tail = tail.substring(0, tail.length - 1);
    }
    return tail + "/" + head;
}

function convertPathToNativePath(path: string): string {
    if (path.length >= 1 && path.substring(0, 1) === ":") {
        path = path.substring(1, path.length);
    }
    let tempNameList = path.split("/");
    let output = primaryVolumeNativePath;
    let index = 0;
    while (index < tempNameList.length) {
        let tempName = tempNameList[index];
        let tempNativePath = pathUtils.join(output, "dirContent_" + tempName);
        if (index >= tempNameList.length - 1 && !fs.existsSync(tempNativePath)) {
            tempNativePath = pathUtils.join(output, "fileContent_" + tempName);
        }
        if (!fs.existsSync(tempNativePath)) {
            return null;
        }
        output = tempNativePath;
        index += 1;
    }
    return output;
}

function getDirItems(path: string): string[] {
    let tempNativePath = convertPathToNativePath(path);
    let tempNameList = fs.readdirSync(tempNativePath)
    let output = [];
    let index = 0;
    while (index < tempNameList.length) {
        let tempName = tempNameList[index];
        let tempIndex = tempName.indexOf("_");
        if (tempIndex >= 0) {
            let tempPrefix = tempName.substring(0, tempIndex);
            if (tempPrefix === "fileContent" || tempPrefix === "dirContent") {
                output.push(tempName.substring(tempIndex + 1, tempName.length));
            }
        }
        index += 1;
    }
    return output;
}

function createReadIntFunction(
    elementSize: number
): (buffer: Buffer, offset: number) => number {
    let readSize;
    // TODO: Support u64.
    if (elementSize > 6) {
        readSize = 6;
    } else {
        readSize = elementSize;
    }
    return (buffer: Buffer, offset: number): number => {
        return buffer.readUIntLE(offset, readSize);
    }
}

function createWriteIntFunction(
    elementSize: number
): (buffer: Buffer, offset: number, value: number) => void {
    let writeSize;
    // TODO: Support u64.
    if (elementSize > 6) {
        writeSize = 6;
    } else {
        writeSize = elementSize;
    }
    return (buffer: Buffer, offset: number, value: number): number => {
        return buffer.writeUIntLE(value, offset, writeSize);
    }
}

const readU8 = createReadIntFunction(1);
const readU16 = createReadIntFunction(2);
const readU32 = createReadIntFunction(4);
const readU64 = createReadIntFunction(8);

const writeU8 = createWriteIntFunction(1);
const writeU16 = createWriteIntFunction(2);
const writeU32 = createWriteIntFunction(4);
const writeU64 = createWriteIntFunction(8);

class FrameLength {
    
    alphaLength: number;
    betaLength: number;
    
    constructor(alphaLength: number, betaLength: number) {
        this.alphaLength = alphaLength;
        this.betaLength = betaLength;
    }
}

function parseFrameLength(buffer: Buffer, offset: number): FrameLength {
    return new FrameLength(
        readU64(buffer, offset),
        readU64(buffer, offset + 8)
    );
}

// TODO: Create concrete subclasses of InstructionArg.
abstract class InstructionArg {
    
    constructor() {
        
    }
}

class Instruction {
    
    opcode: number;
    argList: InstructionArg[];
    
    constructor(opcode: number, argList: InstructionArg[]) {
        this.opcode = opcode;
        this.argList = argList;
    }
}

class BytecodeFunction {
    
    frameLength: FrameLength;
    instructionList: Instruction[];
    
    constructor() {
        this.frameLength = new FrameLength(0, 0);
        this.instructionList = [];
        // TODO: Parse function region.
        
    }
}

class BytecodeFile {
    
    path: string;
    functionList: BytecodeFunction[];
    initFunction: BytecodeFunction;
    globalFrameLength: FrameLength;
    
    constructor(path: string) {
        this.path = path;
        let tempNativePath = convertPathToNativePath(path);
        let content = fs.readFileSync(tempNativePath);
        this.functionList = [];
        this.initFunction = null;
        this.globalFrameLength = new FrameLength(0, 0);
        // TODO: Parse content.
        
    }
}

class Allocation {
    
    alphaRegion: Allocation[];
    betaRegion: Buffer;
    
    constructor(frameLength: FrameLength) {
        this.alphaRegion = [];
        while (this.alphaRegion.length < frameLength.alphaLength) {
            this.alphaRegion.push(null);
        }
        this.betaRegion = Buffer.alloc(frameLength.betaLength);
    }
    
    // TODO: Add read and write methods.
    
}

class Agent {
    
    bytecodeFile: BytecodeFile;
    instructionIndex: number;
    currentFunction: BytecodeFunction;
    globalFrame: Allocation;
    currentInstruction: Instruction;
    
    constructor(appPath: string) {
        this.bytecodeFile = new BytecodeFile(appPath);
        runningAgentList.push(this);
        this.instructionIndex = 0;
        this.currentFunction = this.bytecodeFile.initFunction;
        this.globalFrame = new Allocation(this.bytecodeFile.globalFrameLength);
        this.currentInstruction = null;
    }
    
    performNextInstruction(): void {
        if (this.currentFunction === null) {
            return;
        }
        let tempInstructionList = this.currentFunction.instructionList;
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

function launchApp(path: string): void {
    console.log("Launching app: " + path);
    new Agent(path);
}

function getBootAppPaths() {
    let tempNameList = getDirItems(bootAppsPath);
    let output = [];
    let index = 0;
    while (index < tempNameList.length) {
        let tempName = tempNameList[index];
        output.push(joinPath(bootAppsPath, tempName));
        index += 1;
    }
    return output;
}

function launchBootApps(): void {
    let tempPathList = getBootAppPaths();
    let index = 0;
    while (index < tempPathList.length) {
        let tempPath = tempPathList[index];
        launchApp(tempPath);
        index += 1;
    }
}

function timerEvent(): void {
    if (runningAgentList.length <= 0) {
        clearInterval(timerInterval);
    }
    let index = runningAgentList.length - 1;
    while (index >= 0) {
        let tempAgent = runningAgentList[index];
        tempAgent.performNextInstruction();
        index -= 1;
    }
}

launchBootApps();
let timerInterval = setInterval(timerEvent, 50);


