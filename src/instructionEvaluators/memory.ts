
import {instructionUtils} from "utils/instructionUtils";

import {AllocationLength, Allocation, HeapAllocation} from "objects/allocation";
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
    context.nextArgFrame = new Allocation(alphaLength, betaLength);
});

instructionUtils.addInstructionEvaluator("newAlloc", (
    context: FunctionInvocation,
    argList: InstructionArg[]
): void => {
    let alphaLength = argList[1].readInt(context);
    let betaLength = argList[2].readInt(context);
    let tempCreator = context.bytecodeInterpreter.agent;
    let tempAllocation = new HeapAllocation(alphaLength, betaLength, tempCreator);
    argList[0].write(context, tempAllocation);
});

instructionUtils.addInstructionEvaluator("copyAlloc", (
    context: FunctionInvocation,
    argList: InstructionArg[]
): void => {
    let tempAllocation = argList[1].readPointer(context);
    argList[0].write(context, tempAllocation.copyHeapAllocation());
});

instructionUtils.addInstructionEvaluator("allocALen", (
    context: FunctionInvocation,
    argList: InstructionArg[]
): void => {
    let tempAllocation = argList[1].readPointer(context);
    argList[0].write(context, tempAllocation.alphaRegion.length);
});

instructionUtils.addInstructionEvaluator("setAllocALen", (
    context: FunctionInvocation,
    argList: InstructionArg[]
): void => {
    let tempAllocation = argList[0].readPointer(context);
    let tempLength = argList[1].readInt(context);
    tempAllocation.setAlphaLength(tempLength);
});

instructionUtils.addInstructionEvaluator("allocBLen", (
    context: FunctionInvocation,
    argList: InstructionArg[]
): void => {
    let tempAllocation = argList[1].readPointer(context);
    argList[0].write(context, tempAllocation.betaRegion.length);
});

instructionUtils.addInstructionEvaluator("setAllocBLen", (
    context: FunctionInvocation,
    argList: InstructionArg[]
): void => {
    let tempAllocation = argList[0].readPointer(context);
    let tempLength = argList[1].readInt(context);
    tempAllocation.setBetaLength(tempLength);
});

instructionUtils.addInstructionEvaluator("allocCreator", (
    context: FunctionInvocation,
    argList: InstructionArg[]
): void => {
    let tempAllocation = argList[1].readPointer(context);
    argList[0].write(context, tempAllocation.creator.sentry);
});

instructionUtils.addInstructionEvaluator("allocSType", (
    context: FunctionInvocation,
    argList: InstructionArg[]
): void => {
    let tempAllocation = argList[1].readPointer(context);
    argList[0].write(context, tempAllocation.sentryType);
});

instructionUtils.addInstructionEvaluator("setAllocSType", (
    context: FunctionInvocation,
    argList: InstructionArg[]
): void => {
    let tempAllocation = argList[0].readPointer(context);
    let sentryType = argList[1].readInt(context);
    tempAllocation.sentryType = sentryType;
});


