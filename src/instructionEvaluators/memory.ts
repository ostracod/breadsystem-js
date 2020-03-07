
import {instructionUtils} from "utils/instructionUtils";
import {FunctionInvocation} from "objects/bytecodeInterpreter";
import {InstructionArg} from "objects/instruction";

instructionUtils.addInstructionEvaluator("wrt", (
    context: FunctionInvocation,
    argList: InstructionArg[]
): void => {
    let tempValue = argList[1].read(context);
    argList[0].write(context, tempValue);
});


