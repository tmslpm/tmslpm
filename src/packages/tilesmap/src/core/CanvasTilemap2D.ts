export class CanvasTilemap2D {
 
    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
    private _tileWidth: number;
    private _tileMapLength: number;
    private _tileMapWidth: number; 
 
    private _ignored: boolean = false;
    public _data: any[];
 
    private _onDraw = () => console.warn("not implemented, use setter onDraw()");

    constructor(htmlStringIdentifier: string, tileSize: number, tileMapSize: number) {
        // create canvas
        this._canvas = document.createElement("canvas");
        let containerForTheCanvas = document.getElementById(htmlStringIdentifier); 
        containerForTheCanvas.appendChild(this._canvas);
        
        // define property
        this._ctx = this._canvas.getContext("2d",  {willReadFrequently: true});
        this._tileWidth = tileSize;
        this._tileMapLength = tileMapSize;
        this._tileMapWidth = this.tileWidth * this.tileMapLength; 
        this._data = []; 
        
        this.updateSize(); 
    }

    moussePositionToCoordinate(ev: MouseEvent) {
        let rect = this.canvas.getBoundingClientRect(); 
        let realSize = rect.width / this.tileMapLength;
        return {
            x: Math.floor((ev.clientX - rect.left) / realSize),
            y: Math.floor((ev.clientY - rect.top) / realSize)
        };
    } 

    draw(): void {
        this._onDraw();
    }
  
    drawGrid(): void {
        this._ctx.strokeStyle = "black";
        this._ctx.lineWidth = 1;
        for (let x = 0; x <= this.tileMapWidth; x += this.tileWidth) {
            this._ctx.moveTo(x, 0);
            this._ctx.lineTo(x, this.tileMapWidth);
            this._ctx.moveTo(0, x);
            this._ctx.lineTo(this.tileMapWidth, x);
        }
        this._ctx.stroke();
    }

    /**
     * mode: 0, 1, 2, 3, 4, 5, 6, 7
     * _______________________________________________
     * - 0 = start left top, left to right
     * ```
     *   | 0 | 1 | 2 |
     *   -------------
     *   | 3 | 4 | 5 |
     *   -------------
     *   | 6 | 7 | 8 |
     * ``` 
     * _______________________________________________
     * 
     * - 1 = start left top, and top to bottom 
     * ```
     *   | 0 | 3 | 6 |
     *   -------------
     *   | 1 | 4 | 7 |
     *   -------------
     *   | 2 | 5 | 8 |
     * ```
     * _______________________________________________
     * 
     * - 2 = start right top, and right to left
     * ```
     *   | 2 | 1 | 0 |
     *   -------------
     *   | 5 | 4 | 3 |
     *   -------------
     *   | 8 | 7 | 6 |
     * ```
     * _______________________________________________
     * 
     * - 3 = start right top, and top to bottom
     * ```
     *   | 6 | 3 | 0 |
     *   -------------
     *   | 7 | 4 | 1 |
     *   -------------
     *   | 8 | 5 | 2 |
     * ```
     * _______________________________________________
     * 
     * - 4 = start left bottom, and left to right
     * ```
     *   | 6 | 7 | 8 |
     *   -------------
     *   | 3 | 4 | 5 |
     *   -------------
     *   | 0 | 1 | 2 |
     * ```
     * _______________________________________________
     * 
     * - 5 = start left bottom, and top to bottom
     * ```
     *   | 2 | 5 | 8 |
     *   -------------
     *   | 1 | 4 | 7 |
     *   -------------
     *   | 0 | 3 | 6 |
     * ```
     * _______________________________________________
     * 
     * - 6 = start right bottom, and right top left
     * ```
     *   | 8 | 7 | 6 |
     *   -------------
     *   | 5 | 4 | 3 |
     *   -------------
     *   | 2 | 1 | 0 |
     * ```  
     * _______________________________________________
     * 
     * - 7 = start right bottom, and bottom to top
     * ```
     *   | 8 | 5 | 2 |
     *   -------------
     *   | 7 | 4 | 1 |
     *   -------------
     *   | 6 | 3 | 0 |
     * ``` 
     * @param {number} mode - specify the mode 
     */
    drawTileIndex(modeOrderTileIndex: number): void { 
        const funcGetIndex = this.getDrawTileIndexByMode(modeOrderTileIndex);
        this.ctx.font = "15px Arial";
        for (let x = 0; x <= this.tileMapWidth; x += this.tileWidth) {
            for (let y = 0; y <= this.tileMapWidth; y += this.tileWidth) {
                let tileX = Math.floor(x / this.tileWidth);
                let tileY = Math.floor(y / this.tileWidth); 
                this.drawTextOnTile(funcGetIndex(tileX, tileY).toString(), x, y);
            }
        }
    }

    getDrawTileIndexByMode(modeOrderTileIndex: number): (tX: number, tY: number) => number {
        let totalTile = (this.tileMapLength * this.tileMapLength - 1);
        switch (modeOrderTileIndex) {
            case 0:
                return (tX: number, tY: number) => tX + (tY * this.tileMapLength); 
            case 1:
                return (tX: number, tY: number) => tY + (tX * this.tileMapLength); 
            case 2:
                return (tX: number, tY: number) => totalTile - (((this.tileMapLength - tY) * this.tileMapLength) - (this.tileMapLength - tX));
            case 3:
                return (tX: number, tY: number) => ((this.tileMapLength - tX) * this.tileMapLength) - (this.tileMapLength - tY);
            case 4:
                return (tX: number, tY: number) => ((this.tileMapLength - tY) * this.tileMapLength) - (this.tileMapLength - tX);
            case 5:
                return (tX: number, tY: number) => totalTile - (((this.tileMapLength - tX) * this.tileMapLength) - (this.tileMapLength - tY));
            case 6:
                return (tX: number, tY: number) => totalTile - (tX + (tY * this.tileMapLength)); 
            case 7:
                return (tX: number, tY: number) => totalTile - (tY + (tX * this.tileMapLength)); 
            default:
                console.error(`not found mode: ${modeOrderTileIndex}, default mode used`);
                return (tX: number, tY: number) => tX + (tY * this.tileMapLength);
        }
    }

    drawTextOnTile(text: string, x: number, y: number): void { 
        // for center text
        let numberBound = this.ctx.measureText(text);
        let numberFontHeight = numberBound.fontBoundingBoxAscent + numberBound.fontBoundingBoxDescent;

        let textX = (x + (this.tileWidth / 2)) - ((numberBound.width) / 2);
        let textY = (y + this.tileWidth) - (numberFontHeight / 1.5);

        let backrgoundPadding = 2;
        let backgroundX = textX - backrgoundPadding;
        let backgroundY = textY - (numberFontHeight / 1.25) - backrgoundPadding;
        let backgroundWidth = numberBound.width + (backrgoundPadding * 2);
        let backgroundHeight = numberFontHeight + (backrgoundPadding * 2);
       
        this.ctx.save();
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        this.ctx.fillRect(backgroundX, backgroundY, backgroundWidth, backgroundHeight);
        this.ctx.restore();

        // draw text
        this.ctx.fillText(text, textX, textY);
    }

    drawSelector(tileX: number, tileY: number): void {
        this.ctx.beginPath();
        this.ctx.strokeStyle = "red";
        this.ctx.lineWidth = 2;
        this.ctx.rect(tileX * this.tileWidth, tileY * this.tileWidth, this.tileWidth, this.tileWidth);
        this._ctx.stroke();
    }
 
    drawImage(image: CanvasImageSource, tileX: number, tileY: number): void {
        this._ctx.drawImage(
            image,
            tileX * this.tileWidth,
            tileY * this.tileWidth
        );
    }
  
    clear(): void {
        this._ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
    }
    
    clearTile(tileX: number, tileY: number) {
        this._ctx.clearRect(
            tileX * this.tileWidth,
            tileY * this.tileWidth,
            this.tileWidth,
            this.tileWidth
        );
    }

    updateSize(): void {
        this._tileMapWidth = this._tileWidth * this._tileMapLength;
        this._canvas.width = this._tileMapWidth;
        this._canvas.height = this._tileMapWidth;
    }
  
    toDataURL(): string {
        return this._canvas.toDataURL();
    }

    copy(callbackFn: (copy: HTMLImageElement) => void): void {
        let copy = new Image();
        copy.src = this.canvas.toDataURL();
        copy.onload = () => callbackFn(copy);
    }
 
    // D a t a 
    storeTile(tileX: number, tileY: number, value: number): void {
        let hasColumX = this._data[tileX];
        // exist ?
        if (!hasColumX) {
            this._data[tileX] = [];
        }

        this._data[tileX][tileY] = value; 
    }

    getTileId(x:number, y: number):number {
        if (!this._data[x] || this._data[x][y] == undefined) {
            this.parseGrid();
        }
        return this._data[x][y];
    }
  
    parseGrid(): void {
        let newData: any[] = [];
        for (let x = 0; x < this.tileMapLength; x++) {
            newData[x] = [];
            // has no col
            if (this._data[x] == undefined) { 
                for (let y = 0; y < this.tileMapLength; y++) {
                    newData[x][y] = -1; // set no tile data
                }
            }
            // has col
            else {
                for (let y = 0; y < this.tileMapLength; y++) {
                    newData[x][y] =  this._data[x][y] == undefined ? -1 : this._data[x][y]; 
                }
            }
        }
        
        // override old data
        this._data = newData;
    }

    convert(): number[][] {
        this.parseGrid();
        // rotate 
        let v = [];
        for (let x = 0; x < this.tileMapLength; x++)
            v[x] = [];
        for (let x = 0; x < this.tileMapLength; x++) for (let y = 0; y < this.tileMapLength; y++)
            v[y].push(this._data[x][y]);

        return v;
    }

    toJavaCode(): string {
        let ouputData = this.convert();
        let str = "<br>";
        str += "int[][] TEMPLATE = {<br>";
        ouputData.forEach((v, i) => {
            str += `  { ${v.join(", ")} }${i + 1 == ouputData.length? "" : ","}<br>`;
        })
        str += "};";
        return str;
    }

    export(tileWidth: number) {
        this.convert();
        let data = {
            tile_width: tileWidth,
            tilemap_data: this._data
        }
        return JSON.stringify(data);
    }

    import(v: string): number {
        let parsedData = JSON.parse(v);
        this._data = parsedData.tilemap_data;
        return parsedData.tile_width;
    }
  
    // S e t t e r

    set onDraw(v: () => any) {
        this._onDraw = v;
    }
  
    set setTileWidth(v:number) {
        this._tileWidth = v; 
    }

    set setTileMapLength(v:number) {
        this._tileMapLength = v;
    }

    set setIgnored(v: boolean) {
        this._ignored = v;
    }   
 
    // G e t t e r

    get tileWidth() {
        return this._tileWidth;
    }

    // in number sprite
    get tileMapLength() {
        return this._tileMapLength;
    }

    // in pixel
    get tileMapWidth() {
        return this._tileMapWidth;
    }

    get canvas() {
        return this._canvas;
    }

    get ctx() {
        return this._ctx;
    }
  
    get ignored() {
        return this._ignored
    }
    
}
