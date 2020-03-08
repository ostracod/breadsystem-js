
import {instructionUtils} from "utils/instructionUtils";

import {FunctionInvocation} from "objects/bytecodeInterpreter";
import {InstructionArg} from "objects/instruction";

instructionUtils.addInstructionEvaluator("bNot", (
    context: FunctionInvocation,
    argList: InstructionArg[]
): void => {
    let tempOperand = argList[1].readBigInt(context);
    let tempResult = ~tempOperand;
    argList[0].write(context, tempResult);
});

instructionUtils.addIntOperationEvaluator("bOr", (
    operand1: bigint,
    operand2: bigint
): bigint => {
    return operand1 | operand2;
});

instructionUtils.addIntOperationEvaluator("bAnd", (
    operand1: bigint,
    operand2: bigint
): bigint => {
    return operand1 & operand2;
});

instructionUtils.addIntOperationEvaluator("bXor", (
    operand1: bigint,
    operand2: bigint
): bigint => {
    return operand1 ^ operand2;
});

instructionUtils.addIntOperationEvaluator("bLeft", (
    operand1: bigint,
    operand2: bigint
): bigint => {
    return operand1 << operand2;
});

instructionUtils.addIntOperationEvaluator("bRight", (
    operand1: bigint,
    operand2: bigint
): bigint => {
    return operand1 >> operand2;
});


