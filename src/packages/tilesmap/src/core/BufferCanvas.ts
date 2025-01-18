export class BufferCanvas {
    private _buffer: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;

    constructor() {
        this._buffer = document.createElement("canvas");
        this.buffer.width = 32;
        this.buffer.height = 32; 
        this._ctx = this.buffer.getContext("2d");
    }
   
    draw(img: CanvasImageSource, offsetX: number, offsetY: number, width: number, height: number, bufferWidth: number, bufferHeight: number): void {
        this.buffer.width = bufferWidth;
        this.buffer.height = bufferHeight;
        this._ctx.drawImage(
            img,
            offsetX,
            offsetY,
            width,
            height,
            0,
            0,
            this.buffer.width,
            this.buffer.height
        );
    }

    drawTile(image: CanvasImageSource, tileX: number, tileY: number, tileWidth: number): void {
        this._ctx.drawImage(
            image,
            tileX * tileWidth,
            tileY * tileWidth
        );
    }

    clearTile(tileX: number, tileY: number, tileWidth: number): void {
        this._ctx.clearRect(
            tileX * tileWidth,
            tileY * tileWidth,
            tileWidth,
            tileWidth
        );
    }

    resize(width:number, height: number): void {
        let copy = new Image();
        copy.src = this.buffer.toDataURL();
        copy.onload = () => {
            this.buffer.height = width;
            this.buffer.width = height;
            this.ctx.drawImage(copy, 0, 0);
        }
    }

    set width(v:number) {
        this.buffer.width = v;
    }

    set height(v: number) {
        this.buffer.height = v;
    }
    
    get buffer() {
        return this._buffer;
    }

    get ctx() {
        return this._ctx;
    }

    get canvas() {
        return this._buffer;
    }
}