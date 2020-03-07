
import {FunctionInvocation} from "objects/bytecodeInterpreter";
import {InstructionArg} from "objects/instruction";
import {Allocation} from "objects/allocation";

export type MixedNumber = (number | bigint);

export type InstructionEvaluator = (context: FunctionInvocation, argList: InstructionArg[]) => void;

export type InstructionValue = (MixedNumber | Allocation);


