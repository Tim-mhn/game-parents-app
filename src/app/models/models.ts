export class Card {
    public color: string;
    public version: 0 | 1; 
    private _foundPair: boolean = false;
    public imgPath: string = "";
    private _selected: boolean = false;



    constructor(color, version, imgPath="", _foundPair=false, ) {
        this.color = color;
        this.version = version;
        this.imgPath = imgPath;
        this._foundPair = _foundPair;
    }
    public get foundPair(): boolean {
        return this._foundPair;
    }
    public set foundPair(value: boolean) {
        this._foundPair = value;
    }

    public get selected(): boolean {
        return this._selected;
    }
    public set selected(value: boolean) {
        this._selected = value;
    }


}


export class Player {
    public name: string;
    public points: number = 0;

    constructor (name) {
        this.name = name
    }
}


export interface QuizQuestion {
    question: string;
    choices: any[];
    answer: number;
}

export interface WaldoImage {
    imageName: string;
    character: string;
    hintBox: { x1: number, x2: number, y1: number, y2: number };
    hitbox: { x1: number, x2: number, y1: number, y2: number };
}



