
import {MixedNumber} from "models/items";
import {niceUtils} from "utils/niceUtils";
import {bufferUtils} from "utils/bufferUtils";

export let dataTypeMap: {[argPrefix: string]: DataType} = {};

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
    abstract readNumber(buffer: Buffer, offset: number): MixedNumber;
    abstract writeNumber(buffer: Buffer, offset: number, value: MixedNumber): void;
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
    
    readNumber(buffer: Buffer, offset: number): MixedNumber {
        return bufferUtils.readBigUInt(buffer, offset, this.byteAmount);
    }
    
    writeNumber(buffer: Buffer, offset: number, value: MixedNumber): void {
        value = this.restrictNumber(value);
        let tempValue = niceUtils.convertMixedNumberToBigInt(value);
        bufferUtils.writeBigUInt(buffer, offset, tempValue, this.byteAmount);
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
    
    readNumber(buffer: Buffer, offset: number): MixedNumber {
        return bufferUtils.readBigSInt(buffer, offset, this.byteAmount);
    }
    
    writeNumber(buffer: Buffer, offset: number, value: MixedNumber): void {
        value = this.restrictNumber(value);
        let tempValue = niceUtils.convertMixedNumberToBigInt(value);
        bufferUtils.writeBigSInt(buffer, offset, tempValue, this.byteAmount);
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
    
    readNumber(buffer: Buffer, offset: number): MixedNumber {
        return bufferUtils.readFloat(buffer, offset, this.byteAmount);
    }
    
    writeNumber(buffer: Buffer, offset: number, value: MixedNumber): void {
        let tempValue = Number(value);
        bufferUtils.writeFloat(buffer, offset, tempValue, this.byteAmount);
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

export let pointerType = new PointerType();
export let unsignedInteger8Type = new UnsignedIntegerType(1, 1);
export let unsignedInteger16Type = new UnsignedIntegerType(2, 2);
export let unsignedInteger32Type = new UnsignedIntegerType(3, 4);
export let unsignedInteger64Type = new UnsignedIntegerType(4, 8);
export let signedInteger8Type = new SignedIntegerType(5, 1);
export let signedInteger16Type = new SignedIntegerType(6, 2);
export let signedInteger32Type = new SignedIntegerType(7, 4);
export let signedInteger64Type = new SignedIntegerType(8, 8);
export let float32Type = new FloatType(9, 4);
export let float64Type = new FloatType(10, 8);


