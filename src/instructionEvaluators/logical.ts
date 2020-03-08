
import {instructionUtils} from "utils/instructionUtils";
import {niceUtils} from "utils/niceUtils";

import {FunctionInvocation} from "objects/bytecodeInterpreter";
import {InstructionArg} from "objects/instruction";

instructionUtils.addInstructionEvaluator("lNot", (
    context: FunctionInvocation,
    argList: InstructionArg[]
): void => {
    let tempOperand = argList[1].readMixedNumber(context);
    let tempResult = niceUtils.mixedNumberIsZero(tempOperand);
    let tempNumber = niceUtils.convertBooleanToNumber(tempResult);
    argList[0].write(context, tempNumber);
});

instructionUtils.addLogicalOperationEvaluator("lOr", (
    operand1: boolean,
    operand2: boolean
): boolean => {
    return operand1 || operand2;
});

instructionUtils.addLogicalOperationEvaluator("lAnd", (
    operand1: boolean,
    operand2: boolean
): boolean => {
    return operand1 && operand2;
});

instructionUtils.addLogicalOperationEvaluator("lXor", (
    operand1: boolean,
    operand2: boolean
): boolean => {
    return (operand1 || operand2) && !(operand1 && operand2);
});


