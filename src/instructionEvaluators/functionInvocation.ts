
import {instructionUtils} from "utils/instructionUtils";

import {FunctionInvocation} from "objects/bytecodeInterpreter";
import {InstructionArg} from "objects/instruction";

instructionUtils.addInstructionEvaluator("callIndex", (
    context: FunctionInvocation,
    argList: InstructionArg[]
): void => {
    let functionIndex = argList[0].readConstantInt(context);
    let functionDefinition = context.bytecodeApp.functionDefinitionList[functionIndex];
    let argFrame = context.nextArgFrame;
    if (argFrame !== null) {
        argFrame = argFrame.copyAllocation();
    }
    context.thread.invokeFunction(functionDefinition, argFrame);
});


