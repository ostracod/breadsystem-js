
import {volumeUtils} from "utils/volumeUtils";

import {RuntimeError} from "objects/runtimeError";

import * as fs from "fs";

export class FileHandle {
    
    absolutePath: string;
    nativePath: string;
    nativeFileHandle: number;
    isOpen: boolean;
    
    constructor(absolutePath: string) {
        this.absolutePath = absolutePath;
        this.nativePath = volumeUtils.convertAbsolutePathToNativePath(this.absolutePath);
        this.nativeFileHandle = fs.openSync(this.nativePath, "r+");
        this.isOpen = true;
    }
    
    assertOpen(): void {
        if (!this.isOpen) {
            throw new RuntimeError("File handle has been closed.");
        }
    }
    
    flush(): void {
        this.assertOpen();
        fs.fdatasyncSync(this.nativeFileHandle);
    }
    
    close(): void {
        this.assertOpen();
        this.flush();
        fs.closeSync(this.nativeFileHandle);
        this.isOpen = false;
    }
    
    getSize(): number {
        this.assertOpen();
        return fs.statSync(this.nativePath).size;
    }
    
    setSize(size: number): void {
        this.assertOpen();
        fs.truncateSync(this.nativePath, size);
    }
    
    read(offset: number, size: number): Buffer {
        this.assertOpen();
        let output = Buffer.alloc(size);
        fs.readSync(this.nativeFileHandle, output, 0, size, offset);
        return output;
    }
    
    write(offset: number, data: Buffer): void {
        this.assertOpen();
        fs.writeSync(this.nativeFileHandle, data, 0, data.length, offset);
    }
}


