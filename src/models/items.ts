
import {FunctionInvocation} from "objects/bytecodeInterpreter";
import {InstructionArg} from "objects/instruction";

export type MixedNumber = (number | bigint);

export type InstructionEvaluator = (functionInvocation: FunctionInvocation, argList: InstructionArg[]) => void;


