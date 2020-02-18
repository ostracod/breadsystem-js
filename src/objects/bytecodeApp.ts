
import * as fs from "fs";

import {pathUtils} from "utils/pathUtils";
import {parseUtils} from "utils/parseUtils";

import {RuntimeError} from "objects/runtimeError";
import {FrameLength} from "objects/allocation";
import {FunctionDefinition} from "objects/functionDefinition";
import {REGION_TYPE, CompositeFileRegion} from "objects/fileRegion";
import {DependencyDefinition} from "objects/dependencyDefinition";

export class BytecodeApp {
    
    path: string;
    fileRegion: CompositeFileRegion;
    functionDefinitionList: FunctionDefinition[];
    initFunctionDefinition: FunctionDefinition;
    globalFrameLength: FrameLength;
    dependencyDefinitionList: DependencyDefinition[];
    
    constructor(path: string) {
        this.path = path;
        let tempNativePath = pathUtils.convertPathToNativePath(path);
        let content = fs.readFileSync(tempNativePath);
        let tempResult = parseUtils.parseRegion(content, 0);
        if (tempResult.region.regionType !== REGION_TYPE.appFile) {
            throw new RuntimeError("Expected appFile region.");
        }
        this.fileRegion = tempResult.region as CompositeFileRegion;
        let tempCompositeRegion = this.fileRegion.getRegionByType(
            REGION_TYPE.appFuncs
        ) as CompositeFileRegion;
        this.functionDefinitionList = tempCompositeRegion.regionList.map(region => {
            return region.createFunctionDefinition();
        });
        this.initFunctionDefinition = null;
        let tempRegion = this.fileRegion.getRegionByType(REGION_TYPE.globalFrameLen);
        this.globalFrameLength = tempRegion.createFrameLength();
        tempCompositeRegion = this.fileRegion.getRegionOrNullByType(
            REGION_TYPE.deps
        ) as CompositeFileRegion;
        if (tempCompositeRegion === null) {
            this.dependencyDefinitionList = [];
        } else {
            this.dependencyDefinitionList = tempCompositeRegion.regionList.map(region => {
                return region.createDependencyDefinition();
            });
        }
        // TODO: Consume more regions.
        console.log(this.functionDefinitionList);
        console.log(this.globalFrameLength);
        console.log(this.dependencyDefinitionList);
        
    }
}


