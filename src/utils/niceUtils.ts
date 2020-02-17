
import {MixedNumber} from "models/items";

class NiceUtils {
    
    getIndentation(indentationLevel: number): string {
        let output = "";
        for (let count = 0; count < indentationLevel; count++) {
            output += "    ";
        }
        return output;
    }
    
    getReverseMap(map: {[key: string]: any}): {[key: string]: any} {
        let output = {};
        for (let key in map) {
            let tempValue = map[key];
            output[tempValue] = key;
        }
        return output;
    }
    
    convertNumberToHexadecimal(value: number, length: number): string {
        let output = value.toString(16).toUpperCase();
        while (output.length < length) {
            output = "0" + output;
        }
        return "0x" + output;
    }
    
    convertMixedNumberToBigInt(value: MixedNumber): bigint {
        if (typeof value === "bigint") {
            return value;
        }
        return BigInt(Math.floor(value));
    }
}

export let niceUtils = new NiceUtils();


