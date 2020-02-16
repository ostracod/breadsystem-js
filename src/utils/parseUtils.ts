
import {bufferUtils} from "utils/bufferUtils";
import {FrameLength} from "objects/allocation";

class ParseUtils {
    
    parseFrameLength(buffer: Buffer, offset: number): FrameLength {
        return new FrameLength(
            bufferUtils.readUInt(buffer, 0, 8),
            bufferUtils.readUInt(buffer, 8, 8),
        );
    }
}

export let parseUtils = new ParseUtils();


