
import {InstructionEvaluator} from "models/items";

import {INSTRUCTION_OPCODE, instructionTypeMap} from "delegates/instructionType";

import {RuntimeError} from "objects/runtimeError";
import {FunctionInvocation} from "objects/bytecodeInterpreter";
import {Instruction} from "objects/instruction";

import * as fs from "fs";
import * as pathUtils from "path";

class InstructionUtils {
    
    addInstructionEvaluator(name: string, evaluator: InstructionEvaluator): void {
        if (!(name in INSTRUCTION_OPCODE)) {
            throw new RuntimeError(`Invalid opcode name "${name}".`);
        }
        let tempOpcode = INSTRUCTION_OPCODE[name];
        let tempInstructionType = instructionTypeMap[tempOpcode];
        tempInstructionType.evaluator = evaluator;
    }
    
    evaluateInstruction(functionInvocation: FunctionInvocation, instruction: Instruction): void {
        if (!(instruction.opcode in instructionTypeMap)) {
            throw new RuntimeError("Unrecognized opcode.");
        }
        let tempInstructionType = instructionTypeMap[instruction.opcode];
        let tempEvaluator = tempInstructionType.evaluator;
        if (tempEvaluator === null) {
            throw new RuntimeError("Opcode ${instruction.opcode} is not yet implemented.");
        }
        tempEvaluator(functionInvocation, instruction.argList);
    }
}

export let instructionUtils = new InstructionUtils();

let tempDirectoryPath = pathUtils.join(__dirname, "../instructionEvaluators");
let nameList = fs.readdirSync(tempDirectoryPath);
for (let name of nameList) {
    if (!name.endsWith(".js")) {
        continue;
    }
    import(pathUtils.join(tempDirectoryPath, name));
}


