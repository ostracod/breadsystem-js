
import {MixedNumber, InstructionValue} from "models/items";
import {DataType, PointerType, BetaType, NumberType} from "delegates/dataType";
import {RuntimeError} from "objects/runtimeError";

export class AllocationLength {
    
    alphaLength: number;
    betaLength: number;
    
    constructor(alphaLength: number, betaLength: number) {
        this.alphaLength = alphaLength;
        this.betaLength = betaLength;
    }
}

export class Allocation {
    
    alphaRegion: Allocation[];
    betaRegion: Buffer;
    
    constructor(allocationLength: AllocationLength) {
        this.alphaRegion = [];
        while (this.alphaRegion.length < allocationLength.alphaLength) {
            this.alphaRegion.push(null);
        }
        this.betaRegion = Buffer.alloc(allocationLength.betaLength);
    }
    
    checkAlphaIndex(index: number): void {
        if (index < 0 || index >= this.alphaRegion.length) {
            throw new RuntimeError("Invalid alpha region index.");
        }
    }
    
    checkBetaIndex(index: number, betaType: BetaType): void {
        if (index < 0 || index + betaType.byteAmount > this.betaRegion.length) {
            throw new RuntimeError("Invalid beta region index.");
        }
    }
    
    readInstructionValue(index: number, dataType: DataType): InstructionValue {
        if (dataType instanceof PointerType) {
            this.checkAlphaIndex(index);
            return this.alphaRegion[index];
        } else if (dataType instanceof NumberType) {
            let tempNumberType = dataType as NumberType;
            this.checkBetaIndex(index, tempNumberType);
            return tempNumberType.readNumber(this.betaRegion, index);
        } else {
            throw new RuntimeError("Invalid instruction value data type.");
        }
    }
    
    writeInstructionValue(index: number, dataType: DataType, value: InstructionValue): void {
        if (dataType instanceof PointerType) {
            this.checkAlphaIndex(index);
            if (typeof value !== "object") {
                throw new RuntimeError("Cannot write number to alpha region.");
            }
            this.alphaRegion[index] = value as Allocation;
        } else if (dataType instanceof NumberType) {
            let tempNumberType = dataType as NumberType;
            this.checkBetaIndex(index, tempNumberType);
            if (typeof value === "object") {
                throw new RuntimeError("Cannot write pointer to beta region.");
            }
            tempNumberType.writeNumber(this.betaRegion, index, value as MixedNumber);
        } else {
            throw new RuntimeError("Invalid instruction value data type.");
        }
    }
}


