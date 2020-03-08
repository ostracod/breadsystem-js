
import {instructionUtils} from "utils/instructionUtils";

import {FunctionInvocation} from "objects/bytecodeInterpreter";
import {InstructionArg} from "objects/instruction";

instructionUtils.addComparisonOperationEvaluator(
    "equ",
    (operand1: bigint, operand2: bigint): boolean => {
        return operand1 === operand2;
    },
    (operand1: number, operand2: number): boolean => {
        return operand1 === operand2;
    }
);

instructionUtils.addComparisonOperationEvaluator(
    "nEqu",
    (operand1: bigint, operand2: bigint): boolean => {
        return operand1 !== operand2;
    },
    (operand1: number, operand2: number): boolean => {
        return operand1 !== operand2;
    }
);

instructionUtils.addComparisonOperationEvaluator(
    "gre",
    (operand1: bigint, operand2: bigint): boolean => {
        return operand1 > operand2;
    },
    (operand1: number, operand2: number): boolean => {
        return operand1 > operand2;
    }
);

instructionUtils.addComparisonOperationEvaluator(
    "nGre",
    (operand1: bigint, operand2: bigint): boolean => {
        return operand1 <= operand2;
    },
    (operand1: number, operand2: number): boolean => {
        return operand1 <= operand2;
    }
);


