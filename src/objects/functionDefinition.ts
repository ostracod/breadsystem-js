
import {bufferUtils} from "utils/bufferUtils";

import {RuntimeError} from "objects/runtimeError";
import {AllocationLength} from "objects/allocation";
import {Instruction} from "objects/instruction";
import {REGION_TYPE, AtomicFileRegion, CompositeFileRegion} from "objects/fileRegion";

export abstract class FunctionDefinition {
    
    fileRegion: CompositeFileRegion;
    argFrameLength: AllocationLength;
    localFrameLength: AllocationLength;
    instructionList: Instruction[];
    jumpTable: number[];
    
    constructor(fileRegion: CompositeFileRegion) {
        this.fileRegion = fileRegion;
        let tempRegion = this.fileRegion.getRegionByType(REGION_TYPE.argFrameLen);
        this.argFrameLength = tempRegion.createFrameLength();
        tempRegion = this.fileRegion.getRegionByType(REGION_TYPE.localFrameLen);
        this.localFrameLength = tempRegion.createFrameLength();
        tempRegion = this.fileRegion.getRegionByType(REGION_TYPE.instrs);
        this.instructionList = tempRegion.createInstructions();
        let tempAtomicRegion = this.fileRegion.getRegionOrNullByType(
            REGION_TYPE.jmpTable
        ) as AtomicFileRegion;
        this.jumpTable = [];
        if (tempAtomicRegion !== null) {
            let tempBuffer = tempAtomicRegion.contentBuffer;
            for (let index = 0; index < tempBuffer.length; index += 8) {
                let instructionIndex = bufferUtils.readUInt(tempBuffer, index, 8);
                this.jumpTable.push(instructionIndex);
            }
        }
        console.log(this.instructionList);
    }
}

export class PrivateFunctionDefinition extends FunctionDefinition {
    // TODO: Add extra behavior.
    
}

export class PublicFunctionDefinition extends FunctionDefinition {
    
    name: string;
    interfaceIndex: number;
    arbiterIndex: number;
    
    constructor(fileRegion: CompositeFileRegion) {
        super(fileRegion);
        let tempRegion = this.fileRegion.getRegionByType(REGION_TYPE.name);
        this.name = tempRegion.createString();
        let tempAtomicRegion = this.fileRegion.getRegionByType(
            REGION_TYPE.pubFuncAttrs
        ) as AtomicFileRegion;
        if (tempAtomicRegion.contentBuffer.length !== 8) {
            throw new RuntimeError("Public function attributes region has incorrect length.");
        }
        this.interfaceIndex = bufferUtils.readUInt(tempAtomicRegion.contentBuffer, 0, 4);
        let tempValue = bufferUtils.readSInt(tempAtomicRegion.contentBuffer, 4, 4);
        if (tempValue < 0) {
            this.arbiterIndex = null;
        } else {
            this.arbiterIndex = tempValue;
        }
        // TODO: Consume more regions.
        
    }
    
}

export class GuardFunctionDefinition extends FunctionDefinition {
    
    name: string;
    interfaceIndex: number;
    
    constructor(fileRegion: CompositeFileRegion) {
        super(fileRegion);
        let tempRegion = this.fileRegion.getRegionByType(REGION_TYPE.name);
        this.name = tempRegion.createString();
        let tempAtomicRegion = this.fileRegion.getRegionByType(
            REGION_TYPE.guardFuncAttrs
        ) as AtomicFileRegion;
        if (tempAtomicRegion.contentBuffer.length !== 4) {
            throw new RuntimeError("Guard function attributes region has incorrect length.");
        }
        this.interfaceIndex = bufferUtils.readUInt(tempAtomicRegion.contentBuffer, 0, 4);
        // TODO: Consume more regions.
        
    }
    
}


