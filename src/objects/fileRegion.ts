
import {niceUtils} from "utils/niceUtils";
import {bufferUtils} from "utils/bufferUtils";

export const REGION_TYPE = {
    
    // Atomic region types.
    fileFormatVer: 0x0000,
    depVer: 0x0001,
    globalFrameLen: 0x0100,
    localFrameLen: 0x0101,
    argFrameLen: 0x0102,
    depAttrs: 0x0200,
    pubFuncAttrs: 0x0202,
    guardFuncAttrs: 0x0203,
    ifaceFuncAttrs: 0x0204,
    name: 0x0300,
    path: 0x0301,
    desc: 0x0302,
    depIndexes: 0x0400,
    jmpTable: 0x0401,
    argPerms: 0x0402,
    instrs: 0x0500,
    appData: 0x0600,
    pathDep: 0x8000,
    
    // Composite region types.
    verDep: 0x8001,
    ifaceDep: 0x8002,
    privFunc: 0x8100,
    pubFunc: 0x8101,
    guardFunc: 0x8102,
    ifaceFunc: 0x8103,
    deps: 0x8200,
    appFuncs: 0x8201,
    ifaceFuncs: 0x8202,
    appFile: 0x8300,
    ifaceFile: 0x8301
};

const regionTypeNameMap = niceUtils.getReverseMap(REGION_TYPE);

export abstract class FileRegion {
    
    regionType: number;
    
    constructor(regionType: number) {
        this.regionType = regionType;
    }
    
    getDisplayString(indentationLevel?: number): string {
        if (typeof indentationLevel === "undefined") {
            indentationLevel = 0;
        }
        let nextIndentationLevel = indentationLevel + 1;
        let tempIndentation1 = niceUtils.getIndentation(indentationLevel);
        let tempIndentation2 = niceUtils.getIndentation(nextIndentationLevel);
        let tempLineList = this.getDisplayStringHelper(nextIndentationLevel);
        if (tempLineList.length <= 0) {
            tempLineList = [tempIndentation2 + "(Empty)"];
        }
        let tempName = regionTypeNameMap[this.regionType];
        return tempIndentation1 + tempName + " region:\n" + tempLineList.join("\n");
    }
    
    abstract getDisplayStringHelper(indentationLevel: number): string[];
}

export class AtomicFileRegion extends FileRegion {
    
    contentBuffer: Buffer;
    
    constructor(regionType: number, contentBuffer: Buffer) {
        super(regionType);
        this.contentBuffer = contentBuffer;
    }
    
    getDisplayStringHelper(indentationLevel: number): string[] {
        let tempIndentation = niceUtils.getIndentation(indentationLevel);
        let output = [];
        let tempLength = this.contentBuffer.length;
        let startIndex = 0;
        while (startIndex < tempLength) {
            let endIndex = startIndex + 12;
            if (endIndex >= tempLength) {
                endIndex = tempLength;
            }
            let tempBuffer = this.contentBuffer.slice(startIndex, endIndex);
            let tempText = bufferUtils.convertBufferToHexadecimal(tempBuffer);
            output.push(tempIndentation + tempText);
            startIndex = endIndex;
        }
        return output;
    }
}

export class CompositeFileRegion extends FileRegion {
    
    regionList: FileRegion[];
    
    constructor(regionType: number, regionList: FileRegion[]) {
        super(regionType);
        this.regionList = regionList;
    }
    
    getDisplayStringHelper(indentationLevel: number): string[] {
        return this.regionList.map(region => region.getDisplayString(indentationLevel));
    }
}


