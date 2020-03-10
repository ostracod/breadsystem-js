
import {MixedNumber, InstructionValue} from "models/items";

import {DataType, PointerType, BetaType, NumberType} from "delegates/dataType";

import {RuntimeError} from "objects/runtimeError";
import {Agent} from "objects/agent";

const SENTRY_TYPE = {
    funcHandle: 0x0001,
    thread: 0x0002,
    launchOpt: 0x0003,
    agent: 0x0004,
    mutex: 0x0005,
    fileHandle: 0x0006,
    protab: 0x0007,
    perm: 0x0008,
}

export class AllocationLength {
    
    alphaLength: number;
    betaLength: number;
    
    constructor(alphaLength: number, betaLength: number) {
        this.alphaLength = alphaLength;
        this.betaLength = betaLength;
    }
    
    createAllocation(): Allocation {
        return new Allocation(this.alphaLength, this.betaLength);
    }
}

export class Allocation {
    
    alphaRegion: HeapAllocation[];
    betaRegion: Buffer;
    
    constructor(alphaLength: number, betaLength: number) {
        this.alphaRegion = [];
        while (this.alphaRegion.length < alphaLength) {
            this.alphaRegion.push(null);
        }
        this.betaRegion = Buffer.alloc(betaLength);
    }
    
    writeAllocation(allocation: Allocation): void {
        if (allocation.alphaRegion.length !== this.alphaRegion.length
                || allocation.betaRegion.length !== this.betaRegion.length) {
            throw new RuntimeError("Allocation size mismatch.");
        }
        for (let index = 0; index < allocation.alphaRegion.length; index++) {
            this.alphaRegion[index] = allocation.alphaRegion[index];
        }
        allocation.betaRegion.copy(this.betaRegion);
    }
    
    copyAllocation(): Allocation {
        let output = new Allocation(this.alphaRegion.length, this.betaRegion.length);
        output.writeAllocation(this);
        return output;
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
            this.alphaRegion[index] = value as HeapAllocation;
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

export class HeapAllocation extends Allocation {
    
    creator: Agent;
    sentryType: number;
    
    constructor(
        alphaLength: number,
        betaLength: number,
        creator: Agent,
        sentryType: number = 0
    ) {
        super(alphaLength, betaLength);
        this.creator = creator;
        this.sentryType = sentryType;
    }
    
    copyHeapAllocation(): HeapAllocation {
        let output = new HeapAllocation(
            this.alphaRegion.length,
            this.betaRegion.length,
            this.creator,
            this.sentryType
        );
        output.writeAllocation(this);
        return output;
    }
    
    setAlphaLength(alphaLength: number): void {
        if (alphaLength < this.alphaRegion.length) {
            this.alphaRegion.length = alphaLength;
        } else {
            while (this.alphaRegion.length < alphaLength) {
                this.alphaRegion.push(null);
            }
        }
    }
    
    setBetaLength(betaLength: number): void {
        let tempBetaRegion = Buffer.alloc(betaLength);
        if (betaLength < this.betaRegion.length) {
            this.betaRegion.copy(tempBetaRegion, 0, 0, betaLength);
        } else {
            this.betaRegion.copy(tempBetaRegion);
        }
        this.betaRegion = tempBetaRegion;
    }
}

export class AgentSentry extends HeapAllocation {
    
    agent: Agent;
    
    constructor(agent: Agent) {
        super(0, 0, null, SENTRY_TYPE.agent);
        this.agent = agent;
    }
}


