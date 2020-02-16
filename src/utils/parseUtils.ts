
import {bufferUtils} from "utils/bufferUtils";
import {FrameLength} from "objects/allocation";
import {FileRegion, AtomicFileRegion, CompositeFileRegion} from "objects/fileRegion";

class ParseUtils {
    
    parseFrameLength(buffer: Buffer, offset: number): FrameLength {
        return new FrameLength(
            bufferUtils.readUInt(buffer, 0, 8),
            bufferUtils.readUInt(buffer, 8, 8),
        );
    }
    
    parseRegion(buffer: Buffer, offset: number): {region: FileRegion, offset: number} {
        let regionType = bufferUtils.readUInt(buffer, offset, 2);
        let dataSizeLength = bufferUtils.readUInt(buffer, offset + 2, 1);
        let dataSize = bufferUtils.readUInt(buffer, offset + 3, dataSizeLength);
        offset += 3 + dataSizeLength;
        let region: FileRegion;
        if ((regionType & 0x8000) > 0) {
            let endOffset = offset + dataSize;
            let regionList: FileRegion[] = [];
            while (offset < endOffset) {
                let tempResult = parseUtils.parseRegion(buffer, offset);
                offset = tempResult.offset;
                if (offset > endOffset) {
                    throw new RangeError("Subregion is too large.");
                }
                regionList.push(tempResult.region);
            }
            region = new CompositeFileRegion(regionType, regionList);
        } else {
            let contentBuffer = buffer.slice(offset, offset + dataSize);
            region = new AtomicFileRegion(regionType, contentBuffer);
            offset += dataSize;
        }
        return {region: region, offset: offset};
    }
}

export let parseUtils = new ParseUtils();


