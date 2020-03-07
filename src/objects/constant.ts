
import {MixedNumber, InstructionValue} from "models/items";

import {DataType, BetaType, NumberType, PointerType, pointerType} from "delegates/dataType";

import {RuntimeError} from "objects/runtimeError";
import {Allocation} from "objects/allocation";

export abstract class Constant {
    
    constructor() {
        // Do nothing.
        
    }
    
    abstract getDataType(): DataType;
    abstract setDataType(dataType: DataType): void;
    
    getInstructionValue(): InstructionValue {
        throw new RuntimeError("Invalid data type for instruction constant.");
    }
}

export class NumberConstant extends Constant {
    
    value: MixedNumber;
    numberType: NumberType;
    
    constructor(value: MixedNumber, numberType: NumberType) {
        super();
        this.value = numberType.restrictNumber(value);
        this.numberType = numberType;
    }
    
    getDataType(): DataType {
        return this.numberType;
    }
    
    setDataType(dataType: DataType): void {
        if (!(dataType instanceof BetaType)) {
            throw new RuntimeError("Cannot convert beta type to alpha type.");
        }
        if (!(dataType instanceof NumberType)) {
            throw new RuntimeError("Conversion is only supported between number types.");
        }
        this.numberType = dataType as NumberType;
        this.value = this.numberType.restrictNumber(this.value);
    }
    
    getInstructionValue(): InstructionValue {
        return this.value;
    }
}

export class NullConstant extends Constant {
    
    getDataType(): DataType {
        return pointerType;
    }
    
    setDataType(dataType: DataType): void {
        if (!(dataType instanceof PointerType)) {
            throw new RuntimeError("Cannot convert alpha type to beta type.");
        }
    }
    
    getInstructionValue(): InstructionValue {
        return null;
    }
}


