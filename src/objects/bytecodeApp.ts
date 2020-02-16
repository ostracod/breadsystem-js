
import * as fs from "fs";

import {pathUtils} from "utils/pathUtils";
import {parseUtils} from "utils/parseUtils";

import {FrameLength} from "objects/allocation";
import {FunctionDefinition} from "objects/functionDefinition";

export class BytecodeApp {
    
    path: string;
    functionDefinitionList: FunctionDefinition[];
    initFunctionDefinition: FunctionDefinition;
    globalFrameLength: FrameLength;
    
    constructor(path: string) {
        this.path = path;
        let tempNativePath = pathUtils.convertPathToNativePath(path);
        let content = fs.readFileSync(tempNativePath);
        this.functionDefinitionList = [];
        this.initFunctionDefinition = null;
        this.globalFrameLength = new FrameLength(0, 0);
        let tempResult = parseUtils.parseRegion(content, 0);
        let appFileRegion = tempResult.region;
        // TODO: Consume the region.
        console.log(appFileRegion.getDisplayString());
        
    }
}


