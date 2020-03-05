
import {InstructionEvaluator} from "models/items";

import * as fs from "fs";
import * as pathUtils from "path";

export let instructionTypeMap: {[opcode: number]: InstructionType} = {};
export let INSTRUCTION_OPCODE: {[name: string]: number} = {};

export class InstructionType {
    
    name: string;
    opcode: number;
    argAmount: number;
    evaluator: InstructionEvaluator;
    
    constructor(name: string, opcode: number, argAmount: number) {
        this.name = name;
        this.opcode = opcode;
        this.argAmount = argAmount;
        this.evaluator = null;
        instructionTypeMap[this.opcode] = this;
        INSTRUCTION_OPCODE[this.name] = this.opcode;
    }
}

const instructionsPath = pathUtils.join(
    __dirname,
    "../../../breadsystem-spec/bytecodeInstructions.json"
);
let categoryJsonList = JSON.parse(fs.readFileSync(instructionsPath, "utf8"));

for (let categoryJson of categoryJsonList) {
    for (let instructionJson of categoryJson.instructionList) {
        new InstructionType(
            instructionJson.name,
            instructionJson.opcode,
            instructionJson.argumentList.length
        );
    }
}


