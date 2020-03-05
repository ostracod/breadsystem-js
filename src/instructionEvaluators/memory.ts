
import {instructionUtils} from "utils/instructionUtils";
import {FunctionInvocation} from "objects/bytecodeInterpreter";
import {InstructionArg} from "objects/instruction";

instructionUtils.addInstructionEvaluator("wrt", (
    functionInvocation: FunctionInvocation,
    argList: InstructionArg[]
): void => {
    // TODO: Implement.
    console.log("Hello, I am a wrt instruction!");
    
});


