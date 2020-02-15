
export class FrameLength {
    
    alphaLength: number;
    betaLength: number;
    
    constructor(alphaLength: number, betaLength: number) {
        this.alphaLength = alphaLength;
        this.betaLength = betaLength;
    }
}

export class Allocation {
    
    alphaRegion: Allocation[];
    betaRegion: Buffer;
    
    constructor(frameLength: FrameLength) {
        this.alphaRegion = [];
        while (this.alphaRegion.length < frameLength.alphaLength) {
            this.alphaRegion.push(null);
        }
        this.betaRegion = Buffer.alloc(frameLength.betaLength);
    }
    
    // TODO: Add read and write methods.
    
}


