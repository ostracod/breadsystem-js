
export class VersionNumber {
    
    majorNumber: number;
    minorNumber: number;
    patchNumber: number;
    
    constructor(majorNumber: number, minorNumber: number, patchNumber: number) {
        this.majorNumber = majorNumber;
        this.minorNumber = minorNumber;
        this.patchNumber = patchNumber;
    }
    
    copy(): VersionNumber {
        return new VersionNumber(this.majorNumber, this.minorNumber, this.patchNumber);
    }
    
    getDisplayString(): string {
        return this.majorNumber + "." + this.minorNumber + "." + this.patchNumber;
    }
}


