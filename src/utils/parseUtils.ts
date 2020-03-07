
import {bufferUtils} from "utils/bufferUtils";

import {dataTypeMap, NumberType, PointerType} from "delegates/dataType";

import {RuntimeError} from "objects/runtimeError";
import {FileRegion, AtomicFileRegion, CompositeFileRegion} from "objects/fileRegion";
import {InstructionArg, ConstantInstructionArg, RefInstructionArg, Instruction} from "objects/instruction";
import {simpleInstructionRefMap, InstructionRef, PointerInstructionRef} from "objects/instructionRef";
import {Constant, NumberConstant, NullConstant} from "objects/constant";

class ParseUtils {
    
    parseRegion(buffer: Buffer, offset: number): {region: FileRegion, offset: number} {
        let regionType = bufferUtils.readUInt(buffer, offset, 2);
        let dataSizeLength = bufferUtils.readUInt(buffer, offset + 2, 1);
        let dataSize = bufferUtils.readUInt(buffer, offset + 3, dataSizeLength);
        offset += 3 + dataSizeLength;
        let endOffset = offset + dataSize;
        let region: FileRegion;
        if ((regionType & 0x8000) > 0) {
            let regionList = parseUtils.parseRegions(buffer, offset, endOffset);
            region = new CompositeFileRegion(regionType, regionList);
        } else {
            let contentBuffer = buffer.slice(offset, offset + dataSize);
            region = new AtomicFileRegion(regionType, contentBuffer);
        }
        return {region: region, offset: endOffset};
    }
    
    parseRegions(buffer: Buffer, startOffset: number, endOffset: number): FileRegion[] {
        let output: FileRegion[] = [];
        let offset = startOffset;
        while (offset < endOffset) {
            let tempResult = parseUtils.parseRegion(buffer, offset);
            offset = tempResult.offset;
            if (offset > endOffset) {
                throw new RuntimeError("Subregion is too large.");
            }
            output.push(tempResult.region);
        }
        return output;
    }
    
    parseInstructionArg(buffer: Buffer, offset: number): {arg: InstructionArg, offset: number} {
        let argPrefix = bufferUtils.readUInt(buffer, offset, 1);
        offset += 1;
        let refPrefix = (argPrefix & 0xF0) >> 4;
        let dataTypePrefix = argPrefix & 0x0F;
        let dataType = dataTypeMap[dataTypePrefix];
        let tempArg: InstructionArg;
        if (refPrefix === 0) {
            let tempConstant: Constant;
            if (dataType instanceof NumberType) {
                let numberType = dataType as NumberType;
                let tempValue = numberType.readNumber(buffer, offset);
                offset += numberType.byteAmount;
                tempConstant = new NumberConstant(tempValue, numberType);
                tempArg = new ConstantInstructionArg(tempConstant);
            } else if (dataType instanceof PointerType) {
                tempConstant = new NullConstant();
            } else {
                throw new RuntimeError("Invalid argument data type.");
            }
            tempArg = new ConstantInstructionArg(tempConstant);
        } else {
            let tempRef: InstructionRef;
            let tempIndexArg: InstructionArg;
            if (refPrefix === 6) {
                let tempResult = parseUtils.parseInstructionArg(buffer, offset);
                let pointerArg = tempResult.arg;
                offset = tempResult.offset;
                tempResult = parseUtils.parseInstructionArg(buffer, offset);
                tempIndexArg = tempResult.arg;
                offset = tempResult.offset;
                tempRef = new PointerInstructionRef(pointerArg);
            } else if (refPrefix in simpleInstructionRefMap) {
                let tempResult = parseUtils.parseInstructionArg(buffer, offset);
                tempIndexArg = tempResult.arg;
                offset = tempResult.offset;
                tempRef = simpleInstructionRefMap[refPrefix];
            } else {
                throw new RuntimeError("Invalid instruction reference prefix.");
            }
            tempArg = new RefInstructionArg(tempRef, dataType, tempIndexArg);
        }
        return {
            arg: tempArg,
            offset: offset
        };
    }
    
    parseInstruction(buffer: Buffer, offset: number): {instruction: Instruction, offset: number} {
        let opcode = bufferUtils.readUInt(buffer, offset, 2);
        let argAmount = bufferUtils.readUInt(buffer, offset + 2, 1);
        offset += 3;
        let argList = [];
        for (let count = 0; count < argAmount; count++) {
            let tempResult = parseUtils.parseInstructionArg(buffer, offset);
            argList.push(tempResult.arg);
            offset = tempResult.offset;
        }
        let tempInstruction = new Instruction(opcode, argList);
        return {
            instruction: tempInstruction,
            offset: offset
        };
    }
}

export let parseUtils = new ParseUtils();


