
import {MixedNumber, InstructionValue} from "models/items";

import {niceUtils} from "utils/niceUtils";

import {DataType} from "delegates/dataType";

import {RuntimeError} from "objects/runtimeError";
import {Constant} from "objects/constant";
import {InstructionRef} from "objects/instructionRef";
import {FunctionInvocation} from "objects/bytecodeInterpreter";
import {Allocation} from "objects/allocation";

export abstract class InstructionArg {
    
    constructor() {
        // Do nothing.
        
    }
    
    abstract read(context: FunctionInvocation): InstructionValue;
    abstract write(context: FunctionInvocation, value: InstructionValue): void;
    abstract readWithOffset(context: FunctionInvocation, offset: number): InstructionValue;
    abstract writeWithOffset(context: FunctionInvocation, offset: number, value: InstructionValue): void;
    
    readMixedNumber(context: FunctionInvocation): MixedNumber {
        let tempValue = this.read(context);
        if (typeof tempValue === "object") {
            throw new RuntimeError("Expected number.");
        }
        return tempValue as MixedNumber;
    }
    
    readNumber(context: FunctionInvocation): number {
        let tempValue = this.readMixedNumber(context);
        return Number(tempValue);
    }
    
    readInt(context: FunctionInvocation): number {
        let tempValue = this.readNumber(context);
        return Math.floor(tempValue);
    }
    
    readBigInt(context: FunctionInvocation): bigint {
        let tempValue = this.readMixedNumber(context);
        return niceUtils.convertMixedNumberToBigInt(tempValue);
    }
    
    readPointer(context: FunctionInvocation): Allocation {
        let tempValue = this.read(context);
        if (typeof tempValue !== "object") {
            throw new RuntimeError("Expected pointer.");
        }
        return tempValue as Allocation;
    }
}

export class ConstantInstructionArg extends InstructionArg {
    
    constant: Constant;
    
    constructor(constant: Constant) {
        super();
        this.constant = constant;
    }
    
    read(context: FunctionInvocation): InstructionValue {
        return this.constant.getInstructionValue();
    }
    
    write(context: FunctionInvocation, value: InstructionValue): void {
        throw new RuntimeError("Cannot write to constant instruction argument.");
    }
    
    readWithOffset(context: FunctionInvocation, offset: number): InstructionValue {
        throw new RuntimeError("Cannot read constant argument with offset.");
    }
    
    writeWithOffset(context: FunctionInvocation, offset: number, value: InstructionValue): void {
        throw new RuntimeError("Cannot write to constant instruction argument.");
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
    
    getIndex(context: FunctionInvocation) {
        let tempValue = this.indexArg.read(context);
        if (typeof tempValue === "object") {
            throw new RuntimeError("Cannot use pointer as heap allocation index.");
        }
        return Math.floor(Number(tempValue as MixedNumber));
    }
    
    read(context: FunctionInvocation): InstructionValue {
        return this.readWithOffset(context, 0);
    }
    
    write(context: FunctionInvocation, value: InstructionValue): void {
        this.writeWithOffset(context, 0, value);
    }
    
    readWithOffset(context: FunctionInvocation, offset: number): InstructionValue {
        let index = this.getIndex(context);
        return this.instructionRef.read(context, index + offset, this.dataType);
    }
    
    writeWithOffset(context: FunctionInvocation, offset: number, value: InstructionValue): void {
        let index = this.getIndex(context);
        this.instructionRef.write(context, index + offset, this.dataType, value);
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


