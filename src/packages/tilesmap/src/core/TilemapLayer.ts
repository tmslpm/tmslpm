import { CanvasTilemap2D } from "./CanvasTilemap2D";

export class TilemapLayer {
    private _layers: CanvasTilemap2D[];
    private _currentIndex: number;

    constructor() {
        this._layers = [];
        this._currentIndex = 0;
    }

    init(): void {
        this._layers = [];
        this._currentIndex = 0;
    }

    foreach(callbackfn: (value: CanvasTilemap2D, index: number, array: CanvasTilemap2D[]) => void, thisArg?: any): void {
        this.layers.forEach(callbackfn);
    }

    add(layer: CanvasTilemap2D, callbackfn: (layer:CanvasTilemap2D, layers: CanvasTilemap2D[]) => any = ()=>{}): CanvasTilemap2D {
        layer.canvas.style.position = "absolute";

        this.layers.push(layer);
        callbackfn(layer, this.layers);
        return layer;
    }

    addAt(idx: number, layer: CanvasTilemap2D, callbackfn: (layer:CanvasTilemap2D, layers: CanvasTilemap2D[]) => any = ()=>{}): CanvasTilemap2D {
        layer.canvas.style.position = "absolute";
        this.layers.splice(idx, 0, layer);
        callbackfn(layer, this.layers);
        return layer;
    }
  
    current(): CanvasTilemap2D {
        return this.layers[this.currentIndex];
    }

    export(): string {
        let data: any = {};
        this.foreach((layer, i) => { 
            if (!layer.ignored) {
                layer.convert();
                data["layer_" + i] = {
                    tile_width: layer.tileWidth,
                    data: layer._data
                }
            }
        });
        return JSON.stringify(data);
    }

    get(index: number): CanvasTilemap2D {
        return this.layers[index];
    }

    isCurrentLayerSelected(i:number): boolean {
        return i === this.currentIndex;
    }

    public get currentIndex() : number {
        return this._currentIndex;
    }
    
    public get layers() : CanvasTilemap2D[] {
        return this._layers;
    }
    
}