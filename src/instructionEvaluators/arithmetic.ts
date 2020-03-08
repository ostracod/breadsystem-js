
import {instructionUtils} from "utils/instructionUtils";

import {FunctionInvocation} from "objects/bytecodeInterpreter";
import {InstructionArg} from "objects/instruction";

instructionUtils.addNumberOperationEvaluator(
    "add",
    (operand1: bigint, operand2: bigint): bigint => {
        return operand1 + operand2;
    },
    (operand1: number, operand2: number): number => {
        return operand1 + operand2;
    }
);

instructionUtils.addNumberOperationEvaluator(
    "sub",
    (operand1: bigint, operand2: bigint): bigint => {
        return operand1 - operand2;
    },
    (operand1: number, operand2: number): number => {
        return operand1 - operand2;
    }
);

instructionUtils.addNumberOperationEvaluator(
    "mul",
    (operand1: bigint, operand2: bigint): bigint => {
        return operand1 * operand2;
    },
    (operand1: number, operand2: number): number => {
        return operand1 * operand2;
    }
);

instructionUtils.addNumberOperationEvaluator(
    "div",
    (operand1: bigint, operand2: bigint): bigint => {
        return operand1 / operand2;
    },
    (operand1: number, operand2: number): number => {
        return operand1 / operand2;
    }
);

instructionUtils.addNumberOperationEvaluator(
    "mod",
    (operand1: bigint, operand2: bigint): bigint => {
        return operand1 % operand2;
    },
    (operand1: number, operand2: number): number => {
        return operand1 % operand2;
    }
);


