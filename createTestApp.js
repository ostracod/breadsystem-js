
var fs = require("fs");

var testAppPath = "./primaryVolume/dirContent_bootApps/fileContent_test";

function getBufferListSize(bufferList) {
    var output = 0;
    var index = 0;
    while (index < bufferList.length) {
        var tempBuffer = bufferList[index];
        output += tempBuffer.length;
        index += 1;
    }
    return output;
}

function createAddIntFunction(elementSize) {
    var writeSize;
    if (elementSize > 6) {
        writeSize = 6;
    } else {
        writeSize = elementSize;
    }
    return function(destination, value) {
        var numberList;
        if (typeof value === "number") {
            numberList = [value];
        } else {
            numberList = value;
        }
        var tempBuffer = Buffer.alloc(elementSize * numberList.length);
        var index = 0;
        while (index < numberList.length) {
            var tempNumber = numberList[index];
            tempBuffer.writeUIntLE(tempNumber, index * elementSize, writeSize);
            index += 1;
        }
        destination.push(tempBuffer);
    }
}

var addU8 = createAddIntFunction(1);
var addU16 = createAddIntFunction(2);
var addU32 = createAddIntFunction(4);
var addU64 = createAddIntFunction(8);

// localFrameLength is an array of [alphaLength, betaLength].
function assembleAppEntryPoint(localFrameLength, instructionArray) {
    var bufferList = [];
    // Local frame length.
    addU64(bufferList, localFrameLength);
    // Instruction array size.
    addU64(bufferList, instructionArray.length);
    // Instruction array.
    bufferList.push(instructionArray);
    return Buffer.concat(bufferList);
}

// content may be a buffer or list of subregions.
function Region(type, content) {
    this.type = type;
    this.content = content;
    this.buffer = null;
}

Region.prototype.assemble = function(fileOffset) {
    if (Buffer.isBuffer(this.content)) {
        this.buffer = this.content;
    } else {
        this.buffer = assembleRegionList(fileOffset, this.content);
    }
}

function assembleRegionList(fileOffset, regionList) {
    var bufferList = [];
    var regionFileOffset = fileOffset + 8 + 18 * regionList.length;
    // Region amount.
    addU64(bufferList, regionList.length);
    // Array of region attributes.
    var index = 0;
    while (index < regionList.length) {
        var tempRegion = regionList[index];
        tempRegion.assemble(regionFileOffset);
        var tempSize = tempRegion.buffer.length;
        // Region type.
        addU16(bufferList, tempRegion.type);
        // Region offset in file.
        addU64(bufferList, regionFileOffset);
        // Region size.
        addU64(bufferList, tempSize);
        regionFileOffset += tempSize;
        index += 1;
    }
    // Array of regions.
    var index = 0;
    while (index < regionList.length) {
        var tempRegion = regionList[index];
        bufferList.push(tempRegion.buffer);
        index += 1;
    }
    return Buffer.concat(bufferList);
}

instructionArray = [];
// Instruction opcode. (0x0900 = add)
addU16(instructionArray, 0x0900);
// Number of arguments.
addU8(instructionArray, 3);
// Destination. (beta region of global frame)
addU8(instructionArray, [0x11, 0x01, 0x00]);
// First operand. (constant)
addU8(instructionArray,  [0x01, 0x01]);
// Second operand. (constant)
addU8(instructionArray, [0x01, 0x02]);
var appEntryPoint = assembleAppEntryPoint(
    [0, 1],
    Buffer.concat(instructionArray)
);
var appBufferList = [];
// Bytecode format version number.
addU32(appBufferList, [1, 0, 0]);
var tempFileOffset = getBufferListSize(appBufferList);
var tempRegionList = assembleRegionList(tempFileOffset, [
    // Functions region.
    new Region(1, [
        // Application entry point.
        new Region(0, appEntryPoint)
    ])
]);
appBufferList.push(tempRegionList);

fs.writeFileSync(testAppPath, Buffer.concat(appBufferList));


