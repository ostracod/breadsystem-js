
import {bufferUtils} from "utils/bufferUtils";

import {dataTypeMap, BetaType} from "delegates/dataType";

import {RuntimeError} from "objects/runtimeError";
import {FileRegion, AtomicFileRegion, CompositeFileRegion} from "objects/fileRegion";
import {INSTRUCTION_REF_PREFIX, InstructionArg, Instruction} from "objects/instruction";

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
        // TODO: Populate tempArg with an actual value.
        if (refPrefix === INSTRUCTION_REF_PREFIX.constant) {
            if (dataType instanceof BetaType) {
                let betaType = dataType as BetaType;
                offset += betaType.byteAmount;
            }
            tempArg = null;
        } else if (refPrefix === INSTRUCTION_REF_PREFIX.heapAlloc) {
            let tempResult = parseUtils.parseInstructionArg(buffer, offset);
            offset = tempResult.offset;
            tempResult = parseUtils.parseInstructionArg(buffer, offset);
            offset = tempResult.offset;
            tempArg = null;
        } else {
            let tempResult = parseUtils.parseInstructionArg(buffer, offset);
            offset = tempResult.offset;
            tempArg = null;
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


