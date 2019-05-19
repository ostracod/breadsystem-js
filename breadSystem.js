
var fs = require("fs");
var pathUtils = require("path");

var primaryVolumeNativePath = "./primaryVolume";
var bootAppsPath = ":bootApps";

var argumentAmountMap = {};
argumentAmountMap[0x0900] = 3; // add

var runningAgentList = [];

function joinPath(tail, head) {
    if (tail.length > 0 && tail.substring(tail.length - 1, tail.length) == "/") {
        tail = tail.substring(0, tail.length - 1);
    }
    return tail + "/" + head;
}

function convertPathToNativePath(path) {
    if (path.length >= 1 && path.substring(0, 1) == ":") {
        path = path.substring(1, path.length);
    }
    var tempNameList = path.split("/");
    var output = primaryVolumeNativePath;
    var index = 0;
    while (index < tempNameList.length) {
        var tempName = tempNameList[index];
        var tempNativePath;
        var tempNativePath = pathUtils.join(output, "dirContent_" + tempName);
        if (index >= tempNameList.length - 1 && !fs.existsSync(tempNativePath)) {
            tempNativePath = pathUtils.join(output, "fileContent_" + tempName);
        }
        if (!fs.existsSync(tempNativePath)) {
            return null;
        }
        output = tempNativePath;
        index += 1;
    }
    return output;
}

function getDirItems(path) {
    var tempNativePath = convertPathToNativePath(path);
    var tempNameList = fs.readdirSync(tempNativePath)
    var output = [];
    var index = 0;
    while (index < tempNameList.length) {
        var tempName = tempNameList[index];
        var tempIndex = tempName.indexOf("_");
        if (tempIndex >= 0) {
            var tempPrefix = tempName.substring(0, tempIndex);
            if (tempPrefix == "fileContent" || tempPrefix == "dirContent") {
                output.push(tempName.substring(tempIndex + 1, tempName.length));
            }
        }
        index += 1;
    }
    return output;
}

function createReadIntFunction(elementSize) {
    var readSize;
    if (elementSize > 6) {
        readSize = 6;
    } else {
        readSize = elementSize;
    }
    return function(buffer, offset) {
        return buffer.readUIntLE(offset, readSize);
    }
}

var readU8 = createReadIntFunction(1);
var readU16 = createReadIntFunction(2);
var readU32 = createReadIntFunction(4);
var readU64 = createReadIntFunction(8);

function Region(buffer, type, offset, size) {
    this.buffer = buffer;
    this.type = type;
    this.offset = offset;
    this.size = size;
}

function parseBytecodeFileRegionList(buffer, offset) {
    var output = [];
    var tempAmount = readU64(buffer, offset);
    var index = 0;
    while (index < tempAmount) {
        var tempAttributesOffset = offset + 8 + index * 18;
        var tempRegionType = readU16(buffer, tempAttributesOffset);
        var tempRegionOffset = readU64(buffer, tempAttributesOffset + 2);
        var tempRegionSize = readU64(buffer, tempAttributesOffset + 10);
        output.push(new Region(
            buffer,
            tempRegionType,
            tempRegionOffset,
            tempRegionSize
        ));
        index += 1;
    }
    return output;
}

function parseFrameLength(buffer, offset) {
    return [readU64(buffer, offset), readU64(buffer, offset + 8)];
}

function EntryPointFunction(region) {
    this.buffer = region.buffer;
    this.frameLength = parseFrameLength(region.buffer, region.offset);
    this.instructionArraySize = readU64(region.buffer, region.offset + 16);
    this.instructionArrayOffset = region.offset + 24;
}

function BytecodeFile(path) {
    this.path = path;
    var tempNativePath = convertPathToNativePath(path);
    var content = fs.readFileSync(tempNativePath);
    this.formatVersionNumber = [
        readU32(content, 0),
        readU32(content, 4),
        readU32(content, 8),
    ];
    this.functionList = [];
    this.entryPointFunction = null;
    var topLevelRegionList = parseBytecodeFileRegionList(content, 12);
    var index = 0;
    while (index < topLevelRegionList.length) {
        var tempRegion = topLevelRegionList[index];
        if (tempRegion.type == 1) {
            this.parseFunctionsRegion(tempRegion);
        }
        index += 1;
    }
}

BytecodeFile.prototype.parseFunctionsRegion = function(region) {
    var functionRegionList = parseBytecodeFileRegionList(region.buffer, region.offset);
    var index = 0;
    while (index < functionRegionList.length) {
        var tempRegion = functionRegionList[index];
        if (tempRegion.type == 0) {
            var tempFunction = new EntryPointFunction(tempRegion);
            this.entryPointFunction = tempFunction;
        }
        this.functionList.push(tempFunction);
        index += 1;
    }
}

function ConstantArgument(value) {
    this.value = value;
}

ConstantArgument.prototype.read = function() {
    return this.value;
}

function GlobalFrameArgument(dataType, index) {
    this.dataType = dataType;
    this.index = index;
}

GlobalFrameArgument.prototype.read = function() {
    // TODO: Implement.
    
}

GlobalFrameArgument.prototype.write = function(value) {
    // TODO: Implement.
    
}

function Agent(appPath) {
    this.bytecodeFile = new BytecodeFile(appPath);
    runningAgentList.push(this);
    // Offset within the instruction array.
    this.instructionOffset = 0;
    this.currentFunction = this.bytecodeFile.entryPointFunction;
}


Agent.prototype.parseInstructionArgument = function() {
    var bytecodeBuffer = this.currentFunction.buffer;
    var baseOffset = this.currentFunction.instructionArrayOffset;
    var prefix = readU8(bytecodeBuffer, baseOffset + this.instructionOffset);
    this.instructionOffset += 1;
    var referenceType = (prefix & 0xF0) >> 4;
    var dataType = prefix & 0x0F;
    // Constant value.
    if (referenceType == 0) {
        var tempValue;
        if (dataType == 1) {
            tempValue = readU8(bytecodeBuffer, baseOffset + this.instructionOffset);
            this.instructionOffset += 1;
        }
        return new ConstantArgument(tempValue);
    }
    // Global frame.
    if (referenceType == 1) {
        var tempIndexArgument = this.parseInstructionArgument();
        var frameIndex = tempIndexArgument.read();
        return new GlobalFrameArgument(dataType, frameIndex);
    }
    return null;
}

Agent.prototype.performNextInstruction = function() {
    if (this.instructionOffset >= this.currentFunction.instructionArraySize) {
        this.terminate();
        return;
    }
    var bytecodeBuffer = this.currentFunction.buffer;
    var baseOffset = this.currentFunction.instructionArrayOffset;
    var opcode = readU16(bytecodeBuffer, baseOffset + this.instructionOffset);
    this.instructionOffset += 2;
    var argumentAmount = argumentAmountMap[opcode];
    if (typeof argumentAmount === "undefined") {
        console.log("ERROR: Unrecognized opcode! (" + opcode + ")");
        this.terminate();
        return;
    }
    var argumentList = [];
    while (argumentList.length < argumentAmount) {
        var tempArgument = this.parseInstructionArgument();
        argumentList.push(tempArgument);
    }
    if (opcode == 0x0900) {
        // TODO: Perform the instruction.
        console.log(argumentList);
        
    }
}

Agent.prototype.terminate = function() {
    var index = runningAgentList.indexOf(this);
    if (index >= 0) {
        runningAgentList.splice(index, 1);
    }
}

function launchApp(path) {
    console.log("Launching app: " + path);
    new Agent(path);
}

function getBootAppPaths() {
    var tempNameList = getDirItems(bootAppsPath);
    var output = [];
    var index = 0;
    while (index < tempNameList.length) {
        var tempName = tempNameList[index];
        output.push(joinPath(bootAppsPath, tempName));
        index += 1;
    }
    return output;
}

function launchBootApps() {
    var tempPathList = getBootAppPaths();
    var index = 0;
    while (index < tempPathList.length) {
        var tempPath = tempPathList[index];
        launchApp(tempPath);
        index += 1;
    }
}

function timerEvent() {
    if (runningAgentList.length <= 0) {
        clearInterval(timerInterval);
    }
    var index = runningAgentList.length - 1;
    while (index >= 0) {
        var tempAgent = runningAgentList[index];
        tempAgent.performNextInstruction();
        index -= 1;
    }
}

launchBootApps();
var timerInterval = setInterval(timerEvent, 50);


