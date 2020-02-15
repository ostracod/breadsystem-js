
import * as fs from "fs";
import {pathUtils} from "utils/pathUtils";
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
        // TODO: Parse content.
        
    }
}


