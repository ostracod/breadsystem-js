
import {MixedNumber} from "models/items";

import {instructionUtils} from "utils/instructionUtils";

import {FunctionInvocation} from "objects/bytecodeInterpreter";
import {InstructionArg} from "objects/instruction";

function mixedNumberIsZero(value: MixedNumber) {
    if (typeof value === "number") {
        return (value === 0);
    } else {
        return (value === 0n);
    }
}

instructionUtils.addInstructionEvaluator("jmp", (
    context: FunctionInvocation,
    argList: InstructionArg[]
): void => {
    let instructionIndex = argList[0].readConstantInt(context);
    context.instructionIndex = instructionIndex;
});

instructionUtils.addInstructionEvaluator("jmpZ", (
    context: FunctionInvocation,
    argList: InstructionArg[]
): void => {
    let instructionIndex = argList[0].readConstantInt(context);
    let tempCondition = argList[1].readMixedNumber(context);
    if (mixedNumberIsZero(tempCondition)) {
        context.instructionIndex = instructionIndex;
    }
});

instructionUtils.addInstructionEvaluator("jmpNZ", (
    context: FunctionInvocation,
    argList: InstructionArg[]
): void => {
    let instructionIndex = argList[0].readConstantInt(context);
    let tempCondition = argList[1].readMixedNumber(context);
    if (!mixedNumberIsZero(tempCondition)) {
        context.instructionIndex = instructionIndex;
    }
});

instructionUtils.addInstructionEvaluator("jmpTable", (
    context: FunctionInvocation,
    argList: InstructionArg[]
): void => {
    let tableIndex = argList[0].readInt(context);
    let instructionIndex = context.functionDefinition.jumpTable[tableIndex]
    context.instructionIndex = instructionIndex;
});


