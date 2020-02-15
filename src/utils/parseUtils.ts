
import {FrameLength} from "objects/allocation";

class ParseUtils {
    
    parseFrameLength(buffer: Buffer, offset: number): FrameLength {
        return new FrameLength(
            buffer.readUInt32LE(offset),
            buffer.readUInt32LE(offset + 8)
        );
    }
}

export let parseUtils = new ParseUtils();


