
import {MixedNumber} from "models/items";

import {instructionUtils} from "utils/instructionUtils";

import {FunctionInvocation} from "objects/bytecodeInterpreter";
import {InstructionArg} from "objects/instruction";

instructionUtils.addMixedNumberOperationEvaluator(
    "add",
    (operand1: bigint, operand2: bigint): MixedNumber => {
        return operand1 + operand2;
    },
    (operand1: number, operand2: number): MixedNumber => {
        return operand1 + operand2;
    }
);

instructionUtils.addMixedNumberOperationEvaluator(
    "sub",
    (operand1: bigint, operand2: bigint): MixedNumber => {
        return operand1 - operand2;
    },
    (operand1: number, operand2: number): MixedNumber => {
        return operand1 - operand2;
    }
);

instructionUtils.addMixedNumberOperationEvaluator(
    "mul",
    (operand1: bigint, operand2: bigint): MixedNumber => {
        return operand1 * operand2;
    },
    (operand1: number, operand2: number): MixedNumber => {
        return operand1 * operand2;
    }
);

instructionUtils.addMixedNumberOperationEvaluator(
    "div",
    (operand1: bigint, operand2: bigint): MixedNumber => {
        return operand1 / operand2;
    },
    (operand1: number, operand2: number): MixedNumber => {
        return operand1 / operand2;
    }
);

instructionUtils.addMixedNumberOperationEvaluator(
    "mod",
    (operand1: bigint, operand2: bigint): MixedNumber => {
        return operand1 % operand2;
    },
    (operand1: number, operand2: number): MixedNumber => {
        return operand1 % operand2;
    }
);


