
var fs = require("fs");
var pathUtils = require("path");

var primaryVolumeNativePath = "./primaryVolume";
var bootAppsPath = ":bootApps";

var argumentAmountMap = {};
argumentAmountMap[0x0900] = 3; // add

var dataTypeSizeMap = {};
dataTypeSizeMap[1] = 1; // U8

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

function createWriteIntFunction(elementSize) {
    var writeSize;
    if (elementSize > 6) {
        writeSize = 6;
    } else {
        writeSize = elementSize;
    }
    return function(buffer, offset, value) {
        return buffer.writeUIntLE(value, offset, writeSize);
    }
}

var readU8 = createReadIntFunction(1);
var readU16 = createReadIntFunction(2);
var readU32 = createReadIntFunction(4);
var readU64 = createReadIntFunction(8);

var writeU8 = createWriteIntFunction(1);
var writeU16 = createWriteIntFunction(2);
var writeU32 = createWriteIntFunction(4);
var writeU64 = createWriteIntFunction(8);

function readWithDataType(alphaRegion, betaRegion, index, dataType) {
    if (dataType == 1) {
        return readU8(betaRegion, index);
    }
}

function writeWithDataType(alphaRegion, betaRegion, index, value, dataType) {
    if (dataType == 1) {
        return writeU8(betaRegion, index, value);
    }
}

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

function FrameLength(alphaLength, betaLength) {
    this.alphaLength = alphaLength;
    this.betaLength = betaLength;
}

function parseFrameLength(buffer, offset) {
    return new FrameLength(
        readU64(buffer, offset),
        readU64(buffer, offset + 8)
    );
}

function InstructionArgument() {
    // Do nothing.
}

InstructionArgument.prototype.readValue = function(agent) {
    throw new Error("Not implemented!");
}

InstructionArgument.prototype.writeValue = function(agent, value) {
    throw new Error("Not implemented!");
}

function ConstantArgument(value) {
    this.value = value;
}

ConstantArgument.prototype = Object.create(InstructionArgument.prototype);

ConstantArgument.prototype.readValue = function(agent) {
    return this.value;
}

function GlobalFrameArgument(indexArgument, dataType) {
    this.indexArgument = indexArgument;
    this.dataType = dataType;
}

GlobalFrameArgument.prototype = Object.create(InstructionArgument.prototype);

GlobalFrameArgument.prototype.readIndex = function(agent) {
    return this.indexArgument.readValue(agent);
}

GlobalFrameArgument.prototype.readValue = function(agent) {
    var index = this.readIndex(agent);
    return agent.globalFrame.readWithDataType(index, this.dataType);
}

GlobalFrameArgument.prototype.writeValue = function(agent, value) {
    var index = this.readIndex(agent);
    agent.globalFrame.writeWithDataType(index, value, this.dataType);
}

function Instruction(opcode, argumentList) {
    this.opcode = opcode;
    this.argumentList = argumentList;
}

function BytecodeFunction(
    buffer,
    frameLength,
    instructionArrayOffset,
    instructionArraySize
) {
    this.buffer = buffer;
    this.frameLength = frameLength;
    this.instructionArrayOffset = instructionArrayOffset;
    this.instructionArraySize = instructionArraySize;
    this.parseOffset = this.instructionArrayOffset;
    this.parseEndOffset = this.instructionArrayOffset + this.instructionArraySize;
    this.instructionList = [];
    while (this.parseOffset < this.parseEndOffset) {
        var tempInstruction = this.parseNextInstruction();
        this.instructionList.push(tempInstruction);
    }
}

BytecodeFunction.prototype.parseInstructionArgument = function() {
    var prefix = readU8(this.buffer, this.parseOffset);
    this.parseOffset += 1;
    var referenceType = (prefix & 0xF0) >> 4;
    var dataType = prefix & 0x0F;
    // Constant value.
    if (referenceType == 0) {
        var tempValue;
        tempValue = readWithDataType(null, this.buffer, this.parseOffset, dataType);
        this.parseOffset += dataTypeSizeMap[dataType];
        return new ConstantArgument(tempValue);
    }
    // Global frame.
    if (referenceType == 1) {
        var tempIndexArgument = this.parseInstructionArgument();
        return new GlobalFrameArgument(tempIndexArgument, dataType);
    }
    return null;
}

BytecodeFunction.prototype.parseNextInstruction = function() {
    var opcode = readU16(this.buffer, this.parseOffset);
    this.parseOffset += 2;
    var argumentAmount = argumentAmountMap[opcode];
    if (typeof argumentAmount === "undefined") {
        throw new Error("Unrecognized opcode! (" + opcode + ")");
    }
    var argumentList = [];
    while (argumentList.length < argumentAmount) {
        var tempArgument = this.parseInstructionArgument();
        argumentList.push(tempArgument);
    }
    return new Instruction(opcode, argumentList);
}

function EntryPointFunction(region) {
    BytecodeFunction.call(
        this,
        region.buffer,
        parseFrameLength(region.buffer, region.offset),
        region.offset + 24,
        readU64(region.buffer, region.offset + 16)
    );
}

EntryPointFunction.prototype = Object.create(BytecodeFunction.prototype);

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

function Frame(frameLength) {
    this.alphaRegion = [];
    while (this.alphaRegion.length < frameLength.alphaLength) {
        this.alphaRegion.push(null);
    }
    this.betaRegion = Buffer.alloc(frameLength.betaLength);
}

Frame.prototype.readWithDataType = function(offset, dataType) {
    return readWithDataType(
        this.alphaRegion,
        this.betaRegion,
        offset,
        dataType
    );
}

Frame.prototype.writeWithDataType = function(offset, value, dataType) {
    writeWithDataType(
        this.alphaRegion,
        this.betaRegion,
        offset,
        value,
        dataType
    );
}

function Agent(appPath) {
    this.bytecodeFile = new BytecodeFile(appPath);
    runningAgentList.push(this);
    this.instructionIndex = 0;
    this.currentFunction = this.bytecodeFile.entryPointFunction;
    this.globalFrame = new Frame(this.currentFunction.frameLength);
    this.currentInstruction = null;
}

Agent.prototype.readArgument = function(index) {
    var tempArgument = this.currentInstruction.argumentList[index];
    return tempArgument.readValue(this);
}

Agent.prototype.writeArgument = function(index, value) {
    var tempArgument = this.currentInstruction.argumentList[index];
    tempArgument.writeValue(this, value);
}

Agent.prototype.performNextInstruction = function() {
    var tempInstructionList = this.currentFunction.instructionList;
    if (this.instructionIndex >= tempInstructionList.length) {
        this.terminate();
        return;
    }
    this.currentInstruction = tempInstructionList[this.instructionIndex];
    this.instructionIndex += 1;
    var opcode = this.currentInstruction.opcode;
    if (opcode == 0x0900) {
        var tempValue1 = this.readArgument(1);
        var tempValue2 = this.readArgument(2);
        this.writeArgument(0, tempValue1 + tempValue2);
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


