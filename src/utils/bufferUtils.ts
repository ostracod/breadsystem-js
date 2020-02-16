
import {niceUtils} from "utils/niceUtils";
import {RuntimeError} from "objects/runtimeError";

class BufferUtils {
    
    readUInt(buffer: Buffer, offset: number, byteAmount: number): number {
        if (byteAmount > 6) {
            byteAmount = 6;
        }
        return buffer.readUIntLE(offset, byteAmount);
    }
    
    writeUInt(buffer: Buffer, offset: number, value: number, byteAmount: number): void {
        if (byteAmount > 6) {
            buffer.fill(0, offset, offset + byteAmount);
            byteAmount = 6;
        }
        buffer.writeUIntLE(value, offset, byteAmount);
    }
    
    readSInt(buffer: Buffer, offset: number, byteAmount: number): number {
        if (byteAmount > 6) {
            byteAmount = 6;
        }
        return buffer.readIntLE(offset, byteAmount);
    }
    
    writeSInt(buffer: Buffer, offset: number, value: number, byteAmount: number): void {
        if (byteAmount > 6) {
            buffer.fill(0, offset, offset + byteAmount);
            byteAmount = 6;
        }
        buffer.writeIntLE(value, offset, byteAmount);
    }
    
    readBigUInt(buffer: Buffer, offset: number, byteAmount: number): bigint {
        if (byteAmount <= 6) {
            return BigInt(bufferUtils.readUInt(buffer, offset, byteAmount));
        } else if (byteAmount === 8) {
            return buffer.readBigUInt64LE(offset);
        } else {
            throw new RuntimeError("Unsupported byte amount.");
        }
    }
    
    writeBigUInt(buffer: Buffer, offset: number, value: bigint, byteAmount: number): void {
        if (byteAmount <= 6) {
            bufferUtils.writeUInt(buffer, offset, Number(value), byteAmount);
        } else if (byteAmount === 8) {
            buffer.writeBigUInt64LE(value, offset);
        } else {
            throw new RuntimeError("Unsupported byte amount.");
        }
    }
    
    readBigSInt(buffer: Buffer, offset: number, byteAmount: number): bigint {
        if (byteAmount <= 6) {
            return BigInt(bufferUtils.readSInt(buffer, offset, byteAmount));
        } else if (byteAmount === 8) {
            return buffer.readBigInt64LE(offset);
        } else {
            throw new RuntimeError("Unsupported byte amount.");
        }
    }
    
    writeBigSInt(buffer: Buffer, offset: number, value: bigint, byteAmount: number): void {
        if (byteAmount <= 6) {
            bufferUtils.writeSInt(buffer, offset, Number(value), byteAmount);
        } else if (byteAmount === 8) {
            buffer.writeBigInt64LE(value, offset);
        } else {
            throw new RuntimeError("Unsupported byte amount.");
        }
    }
    
    convertBufferToHexadecimal(buffer: Buffer): string {
        let tempTextList = [];
        for (let index = 0; index < buffer.length; index++) {
            let tempValue = buffer[index];
            tempTextList.push(niceUtils.convertNumberToHexadecimal(tempValue, 2));
        }
        return tempTextList.join(" ");
    }
}

export let bufferUtils = new BufferUtils();


