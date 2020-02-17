
import {MixedNumber} from "models/items";
import {niceUtils} from "utils/niceUtils";

export var dataTypeMap: {[argPrefix: string]: DataType} = {};

export abstract class DataType {
    
    argPrefix: number;
    
    constructor(argPrefix: number) {
        this.argPrefix = argPrefix;
        if (this.argPrefix !== null) {
            dataTypeMap[this.argPrefix] = this;
        }
    }
    
    abstract getName(): string;
    abstract equals(dataType: DataType): boolean;
}

export class PointerType extends DataType {
    
    constructor() {
        super(0);
    }

    getName(): string {
        return "p";
    }
    
    equals(dataType: DataType): boolean {
        return (dataType instanceof PointerType);
    }
}

export abstract class BetaType extends DataType {
    
    byteAmount: number;
    bitAmount: number;
    
    constructor(argPrefix: number, byteAmount: number) {
        super(argPrefix);
        this.byteAmount = byteAmount;
        this.bitAmount = this.byteAmount * 8;
    }
    
    equals(dataType: DataType): boolean {
        if (!(dataType instanceof BetaType)) {
            return false;
        }
        let betaType = dataType as BetaType;
        return (this.byteAmount === betaType.byteAmount);
    }
}

export abstract class NumberType extends BetaType {
    
    constructor(argPrefix: number, byteAmount: number) {
        super(argPrefix, byteAmount);
    }
    
    getName(): string {
        return this.getNamePrefix() + this.bitAmount;
    }
    
    restrictNumber(value: MixedNumber): MixedNumber {
        return value;
    }
    
    abstract getNamePrefix(): string;
    abstract getByteAmountMergePriority(): number;
}

export abstract class IntegerType extends NumberType {
    
    constructor(argPrefix: number, byteAmount: number) {
        super(argPrefix, byteAmount);
    }
    
    getByteAmountMergePriority(): number {
        return 1;
    }
    
    contains(value: MixedNumber): boolean {
        let tempValue = niceUtils.convertMixedNumberToBigInt(value);
        return (tempValue >= this.getMinimumNumber() && tempValue <= this.getMaximumNumber());
    }
    
    abstract getMinimumNumber(): bigint;
    abstract getMaximumNumber(): bigint;
    abstract getClassMergePriority(): number;
    abstract restrictNumber(value: MixedNumber): MixedNumber;
}

export class UnsignedIntegerType extends IntegerType {
    
    constructor(argPrefix: number, byteAmount: number) {
        super(argPrefix, byteAmount);
    }
    
    getNamePrefix(): string {
        return "u";
    }
    
    getClassMergePriority(): number {
        return 1;
    }
    
    getMinimumNumber(): bigint {
        return 0n;
    }
    
    getMaximumNumber(): bigint {
        return (1n << BigInt(this.bitAmount)) - 1n;
    }
    
    restrictNumber(value: MixedNumber): MixedNumber {
        return niceUtils.convertMixedNumberToBigInt(value) & ((1n << BigInt(this.bitAmount)) - 1n);
    }
    
    equals(dataType: DataType): boolean {
        if (!super.equals(dataType)) {
            return false;
        }
        return (dataType instanceof UnsignedIntegerType);
    }
}

export class SignedIntegerType extends IntegerType {
    
    constructor(argPrefix: number, byteAmount: number) {
        super(argPrefix, byteAmount);
    }
    
    getNamePrefix(): string {
        return "s";
    }
    
    getClassMergePriority(): number {
        return 2;
    }
    
    getMinimumNumber(): bigint {
        return -(1n << BigInt(this.bitAmount - 1));
    }
    
    getMaximumNumber(): bigint {
        return (1n << BigInt(this.bitAmount - 1)) - 1n;
    }
    
    restrictNumber(value: MixedNumber): MixedNumber {
        let tempOffset = 1n << BigInt(this.bitAmount);
        value = niceUtils.convertMixedNumberToBigInt(value) & (tempOffset - 1n);
        if (value > this.getMaximumNumber()) {
            value -= tempOffset;
        }
        return value;
    }
    
    equals(dataType: DataType): boolean {
        if (!super.equals(dataType)) {
            return false;
        }
        return (dataType instanceof SignedIntegerType);
    }
}

export class FloatType extends NumberType {
    
    constructor(argPrefix: number, byteAmount: number) {
        super(argPrefix, byteAmount);
    }
    
    getNamePrefix(): string {
        return "f";
    }
    
    getClassMergePriority(): number {
        return 3;
    }
    
    getByteAmountMergePriority(): number {
        return 2;
    }
    
    equals(dataType: DataType): boolean {
        if (!super.equals(dataType)) {
            return false;
        }
        return (dataType instanceof FloatType);
    }
}

export class StringType extends BetaType {
    
    constructor(byteAmount: number) {
        super(null, byteAmount);
    }
    
    getName(): string {
        return "b" + this.bitAmount;
    }
    
    equals(dataType: DataType): boolean {
        if (!super.equals(dataType)) {
            return false;
        }
        return (dataType instanceof StringType);
    }
}

export var pointerType = new PointerType();
export var unsignedInteger8Type = new UnsignedIntegerType(1, 1);
export var unsignedInteger16Type = new UnsignedIntegerType(2, 2);
export var unsignedInteger32Type = new UnsignedIntegerType(3, 4);
export var unsignedInteger64Type = new UnsignedIntegerType(4, 8);
export var signedInteger8Type = new SignedIntegerType(5, 1);
export var signedInteger16Type = new SignedIntegerType(6, 2);
export var signedInteger32Type = new SignedIntegerType(7, 4);
export var signedInteger64Type = new SignedIntegerType(8, 8);
export var float32Type = new FloatType(9, 4);
export var float64Type = new FloatType(10, 8);


