
import * as fs from "fs";

import {parseUtils} from "utils/parseUtils";

import {RuntimeError} from "objects/runtimeError";
import {FileHandle} from "objects/fileHandle";
import {AllocationLength} from "objects/allocation";
import {FunctionDefinition, PublicFunctionDefinition} from "objects/functionDefinition";
import {REGION_TYPE, CompositeFileRegion} from "objects/fileRegion";
import {DependencyDefinition} from "objects/dependencyDefinition";

export class BytecodeApp {
    
    absolutePath: string;
    fileRegion: CompositeFileRegion;
    functionDefinitionList: FunctionDefinition[];
    initFunctionDefinition: PublicFunctionDefinition;
    globalFrameLength: AllocationLength;
    dependencyDefinitionList: DependencyDefinition[];
    
    constructor(absolutePath: string) {
        this.absolutePath = absolutePath;
        let fileHandle = new FileHandle(absolutePath);
        let fileSize = fileHandle.getSize();
        let content = fileHandle.read(0, fileSize);
        fileHandle.close();
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
        for (let index = 0; index < this.dependencyDefinitionList.length; index++) {
            let tempDependencyDefinition = this.dependencyDefinitionList[index];
            tempDependencyDefinition.index = index;
        }
        // TODO: Consume more regions.
        console.log(this.functionDefinitionList);
        console.log(this.globalFrameLength);
        console.log(this.dependencyDefinitionList);
        
    }
    
    getImplementedDependencyDefinition(absolutePath: string): DependencyDefinition {
        for (let dependencyDefinition of this.dependencyDefinitionList) {
            if (dependencyDefinition.resolvedPath === absolutePath
                    && dependencyDefinition.isImplemented) {
                return dependencyDefinition;
            }
        }
        return null;
    }
    
    getPublicFunction(dependencyDefinition: DependencyDefinition, name: string): PublicFunctionDefinition {
        for (let functionDefinition of this.functionDefinitionList) {
            if (!(functionDefinition instanceof PublicFunctionDefinition)) {
                continue;
            }
            let publicFunctionDefinition = functionDefinition as PublicFunctionDefinition;
            if (publicFunctionDefinition.interfaceIndex === dependencyDefinition.index) {
                return publicFunctionDefinition;
            }
        }
        throw new RuntimeError("App is missing public function.");
    }
    
    // Returns whether all required dependency paths were resolved.
    resolveDependencyPaths(): boolean {
        for (let dependencyDefinition of this.dependencyDefinitionList) {
            let tempResult = dependencyDefinition.resolvePath();
            if (!tempResult && !dependencyDefinition.isOptional) {
                return false;
            }
        }
        let tempDependencyDefinition = this.getImplementedDependencyDefinition(
            ":system/ifaces/initable/ver_1_0_0/main"
        );
        if (tempDependencyDefinition !== null) {
            this.initFunctionDefinition = this.getPublicFunction(
                tempDependencyDefinition,
                "init"
            );
        }
        return true;
    }
}


