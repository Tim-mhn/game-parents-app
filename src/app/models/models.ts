export class Card {
    public color: string;
    public version: 0 | 1; 
    private _foundPair: boolean = false;
    public imgPath: string = "";


    constructor(color, version, _foundPair=false, imgPath="") {
        this.color = color;
        this.version = version;
        this._foundPair = _foundPair;
        this.imgPath = imgPath;
    }
    public get foundPair(): boolean {
        return this._foundPair;
    }
    public set foundPair(value: boolean) {
        this._foundPair = value;
    }


}


export class Player {
    public name: string;
    public points: number = 0;

    constructor (name) {
        this.name = name
    }
}


