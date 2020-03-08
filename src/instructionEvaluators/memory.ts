
import {instructionUtils} from "utils/instructionUtils";

import {AllocationLength, Allocation} from "objects/allocation";
import {FunctionInvocation} from "objects/bytecodeInterpreter";
import {InstructionArg} from "objects/instruction";

instructionUtils.addInstructionEvaluator("wrt", (
    context: FunctionInvocation,
    argList: InstructionArg[]
): void => {
    let tempValue = argList[1].read(context);
    argList[0].write(context, tempValue);
});

instructionUtils.addInstructionEvaluator("newArgFrame", (
    context: FunctionInvocation,
    argList: InstructionArg[]
): void => {
    let alphaLength = argList[0].readInt(context);
    let betaLength = argList[1].readInt(context);
    let allocationLength = new AllocationLength(alphaLength, betaLength);
    context.nextArgFrame = new Allocation(allocationLength);
});


