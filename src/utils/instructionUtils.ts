
import {MixedNumber, InstructionEvaluator} from "models/items";

import {INSTRUCTION_OPCODE, instructionTypeMap} from "delegates/instructionType";

import {RuntimeError} from "objects/runtimeError";
import {FunctionInvocation} from "objects/bytecodeInterpreter";
import {Instruction, InstructionArg} from "objects/instruction";

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
        if (instruction.argList.length !== tempInstructionType.argAmount) {
            throw new RuntimeError(`Incorrect argument amount for opcode ${instruction.opcode}.`);
        }
        let tempEvaluator = tempInstructionType.evaluator;
        if (tempEvaluator === null) {
            throw new RuntimeError(`Opcode ${instruction.opcode} is not yet implemented.`);
        }
        tempEvaluator(functionInvocation, instruction.argList);
    }
    
    addNumberOperationEvaluator(
        name: string,
        integerOperation: (operand1: bigint, operand2: bigint) => bigint,
        floatOperation: (operand1: number, operand2: number) => number
    ): void {
        let tempEvaluator = (
            context: FunctionInvocation,
            argList: InstructionArg[]
        ): void => {
            let tempOperand1 = argList[1].readMixedNumber(context);
            let tempOperand2 = argList[2].readMixedNumber(context);
            let tempResult: MixedNumber;
            if (typeof tempOperand1 === "bigint" && typeof tempOperand2 === "bigint") {
                tempResult = integerOperation(
                    tempOperand1 as bigint,
                    tempOperand2 as bigint
                );
            } else {
                tempResult = floatOperation(
                    Number(tempOperand1),
                    Number(tempOperand2)
                );
            }
            argList[0].write(context, tempResult);
        }
        instructionUtils.addInstructionEvaluator(name, tempEvaluator);
    }
    
    addIntOperationEvaluator(
        name: string,
        operation: (operand1: bigint, operand2: bigint) => bigint
    ): void {
        let tempEvaluator = (
            context: FunctionInvocation,
            argList: InstructionArg[]
        ): void => {
            let tempOperand1 = argList[1].readBigInt(context);
            let tempOperand2 = argList[2].readBigInt(context);
            let tempResult = operation(tempOperand1, tempOperand2);
            argList[0].write(context, tempResult);
        }
        instructionUtils.addInstructionEvaluator(name, tempEvaluator);
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


