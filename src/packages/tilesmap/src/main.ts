import { CanvasTilemap2D } from "./core/CanvasTilemap2D";
import { BufferCanvas } from "./core/BufferCanvas";
import { Overlay } from "./core/OverlayHTML";
import { MenuEditor } from "./core/MenuEditor";
import { TilemapLayer } from "./core/TilemapLayer";

const TILEMAP_MODE = {
  tileWidth: 32,
  mapLength: 50,
  chunkSize: 50
}

const ATLAS_MODE = {
  tileWidth: 32,
  mapLength: 8,
  drawGrid: true,
  drawIndexOrder: true,
  modeDrawOrderIndex: 0,
  currIndexTileSelected: 0,
  coordinateTileSelected: {
    x: 0,
    y: 0
  }
}

const PAINT_MODE = {
  NORMAL: 0,
  FILL: 1,
  SELECTION: 2,
  PIPETTE: 3,
  DELETE: 4,
  current: 0,
  previous: 0,
}

// - - - - - - - - - - - - - - - - - - -
// T I L E M A P
const BUFFER_ONE_TILE = new BufferCanvas();
const TILEMAP_LAYERS = new TilemapLayer();
TILEMAP_LAYERS.add(
  new CanvasTilemap2D(
    "tilemap",
    TILEMAP_MODE.tileWidth,
    TILEMAP_MODE.mapLength
  ), (layer) => {
    layer.onDraw = () => { };
  }
);

const TILEMAP_SELECTOR_AREA = TILEMAP_LAYERS.add(
  new CanvasTilemap2D(
    "tilemap",
    TILEMAP_MODE.tileWidth,
    TILEMAP_MODE.mapLength
  ), (layer) => {
    layer.onDraw = () => { };
  }
);

TILEMAP_LAYERS.add(
  new CanvasTilemap2D(
    "tilemap",
    TILEMAP_MODE.tileWidth,
    TILEMAP_MODE.mapLength
  ), (gridLayer) => {

    gridLayer.setIgnored = true;

    gridLayer.onDraw = () => gridLayer.drawGrid();
    let mouseIsDown = false;
    let mouseIsEnter = false;
    let lastDownMouseTileCoordinate = { x: 0, y: 0 };

    gridLayer.canvas.onmouseenter = (e) => {
      mouseIsEnter = true;
    };

    gridLayer.canvas.onmouseleave = (e) => {
      mouseIsEnter = false;
      mouseIsDown = false;
    }

    gridLayer.canvas.onmousedown = (e) => {
      mouseIsDown = true;
      lastDownMouseTileCoordinate = gridLayer.moussePositionToCoordinate(e);
      // PAIN NORMAL
      if (PAINT_MODE.current === PAINT_MODE.NORMAL) {
        let seletecdLayer = TILEMAP_LAYERS.current();
        let tilePos = gridLayer.moussePositionToCoordinate(e);

        seletecdLayer.drawImage(
          BUFFER_ONE_TILE.canvas,
          tilePos.x,
          tilePos.y);

        seletecdLayer.storeTile(
          tilePos.x,
          tilePos.y,
          ATLAS_MODE.currIndexTileSelected);
      }

      // PAIN PIPETTE
      else if (PAINT_MODE.current === PAINT_MODE.PIPETTE) {
        let seletecdLayer = TILEMAP_LAYERS.current();
        let tilePos = gridLayer.moussePositionToCoordinate(e);
        let tileID = seletecdLayer.getTileId(tilePos.x, tilePos.y);
        selectAtlasTileByIndex(tileID);
        selectPreviousMode()
      }

      // PAIN FILL
      else if (PAINT_MODE.current === PAINT_MODE.FILL) {
        let seletecdLayer = TILEMAP_LAYERS.current();
        let tilePos = gridLayer.moussePositionToCoordinate(e);
        let startTileID = seletecdLayer.getTileId(tilePos.x, tilePos.y);
        if (startTileID === ATLAS_MODE.currIndexTileSelected)
          return; // same
        // Screen data
        let screenData = seletecdLayer._data;
        const floodFill = (x: number, y: number, row: any, col: any) => {
          if (x < 0
            || x >= row
            || y < 0
            || y >= col
            || screenData[x][y] != startTileID) {
            return;
          }

          seletecdLayer.drawImage(BUFFER_ONE_TILE.canvas, x, y);
          screenData[x][y] = ATLAS_MODE.currIndexTileSelected;
          setTimeout(() => {
            floodFill(x - 1, y, row, col); // l 
            floodFill(x + 1, y, row, col); // r 
            floodFill(x, y + 1, row, col); // t 
            floodFill(x, y - 1, row, col); // b
          }, 25);

        }

        floodFill(
          tilePos.x,
          tilePos.y,
          screenData.length,
          screenData.length);
      }
    }

    gridLayer.canvas.onmouseup = (e) => {
      mouseIsDown = false;
      /// PAINT SELECTION
      if (PAINT_MODE.current === PAINT_MODE.SELECTION) {
        let seletecdLayer = TILEMAP_LAYERS.current();

        drawPainSelection(
          lastDownMouseTileCoordinate,
          gridLayer.moussePositionToCoordinate(e),
          (x, y) => {
            seletecdLayer.drawImage(BUFFER_ONE_TILE.canvas, x, y);
            seletecdLayer.storeTile(x, y, ATLAS_MODE.currIndexTileSelected);
          })

        TILEMAP_SELECTOR_AREA.clear();
      }
    }

    gridLayer.canvas.onmousemove = (e) => {
      if (mouseIsEnter && mouseIsDown) {
        // PAINT NORMAL
        if (PAINT_MODE.current === PAINT_MODE.NORMAL) {
          let seletecdLayer = TILEMAP_LAYERS.current();
          let tilePos = gridLayer.moussePositionToCoordinate(e);

          seletecdLayer.drawImage(
            BUFFER_ONE_TILE.canvas,
            tilePos.x,
            tilePos.y);

          seletecdLayer.storeTile(
            tilePos.x,
            tilePos.y,
            ATLAS_MODE.currIndexTileSelected);
        }
        // PAINT DELETE
        else if (PAINT_MODE.current === PAINT_MODE.DELETE) {
          let seletecdLayer = TILEMAP_LAYERS.current();
          let tilePos = gridLayer.moussePositionToCoordinate(e);
          seletecdLayer.clearTile(tilePos.x, tilePos.y);
          seletecdLayer.storeTile(tilePos.x, tilePos.y, -1);
        }
        /// PAINT SELECTION
        else if (PAINT_MODE.current === PAINT_MODE.SELECTION) {
          TILEMAP_SELECTOR_AREA.clear();

          drawPainSelection(
            lastDownMouseTileCoordinate,
            gridLayer.moussePositionToCoordinate(e),
            (x, y) => {
              TILEMAP_SELECTOR_AREA.drawSelector(x, y)
            });
        }
      }
    }
  });

TILEMAP_LAYERS.foreach((layer) => layer.draw());

// - - - - - - - - - - - - - - - - - - -
// M e n u - A n d - O v e r l a y
const OUTPUT_OVERLAY = new Overlay("overlayOutput");
const DEBUG_DATA = document.getElementById("debugData");
const MENU = new MenuEditor("menu");

// - - - - - - - - - - - - - - - - - - -
// S U B - M E N U >> F I L E
const MENU_FILE = MENU.addSubMenu("file");
// |>> I M P O R T
MENU_FILE.addBtnFile("import", false, (f: FileList) => importTilemap(f));
// |>> E X P O R T
MENU_FILE.addButton("export",
  () => exportTilemap());
// |>> O U T P U T
MENU_FILE.addLargeButton("ouput",
  () => OUTPUT_OVERLAY.onOpenClose(
    () => DEBUG_DATA.innerHTML = TILEMAP_LAYERS.current().toJavaCode()));

// - - - - - - - - - - - - - - - - - - -
// S U B - M E N U >> T I L E M A P
const MENU_TILEMAP = MENU.addSubMenu("config tilemap");

// |>> T I L E M A P - S I Z E
MENU_TILEMAP.addInputNumber("set size map", TILEMAP_MODE.mapLength, 1, 100000, 1,
  (v) => resizeTilemapWidth(v));

// |>> T I L E - S I Z E
MENU_TILEMAP.addInputNumber("set size sprite", TILEMAP_MODE.tileWidth, 16, 1000, 16,
  (v) => resizeTilemapTileSize(v));

// |>> T I L E M A P - C H U N K - S I Z E
MENU_TILEMAP.addInputNumber("set chunk size", TILEMAP_MODE.chunkSize, 1, 100, 1,
  (v) => resizeTilemaChunk(v));

// - - - - - - - - - - - - - - - - - - -
// S U B - M E N U >> A T L A S
const MENU_ATLAS = MENU.addSubMenu("config tileset");

// |>> L O A D - A T L AS
MENU_ATLAS.addBtnFile("load tileset image", true,
  (f: FileList) => loadAtlasImageByFile(f));

// |>> T I L E - S I Z E
MENU_ATLAS.addInputNumber("sprite size", ATLAS_MODE.tileWidth, 16, 1000, 16,
  (v) => resizeAtlasTileSize(v));

// |>> S H O W - G R I D
MENU_ATLAS.addButton("draw grid",
  () => enableDisabledDrawGrid());

// |>> S H O W - O R D E R
MENU_ATLAS.addButton("draw index",
  () => enableDisabledDrawOrderIdx());

// |>> O R D E R - T I L E - I N D E X
MENU_ATLAS.addLargeButton(`set order tileset index`,
  () => changeAtlasModeDrawOrderIdx());

// - - - - - - - - - - - - - - - - - - -
// M E N U - I C O N - P A I N T - M O D E
addButtonPaintModeToMenu("google_icon_pencil.png", "", PAINT_MODE.NORMAL);
addButtonPaintModeToMenu("google_icon_fill.png", "", PAINT_MODE.FILL);
addButtonPaintModeToMenu("google_icon_selection.png", "", PAINT_MODE.SELECTION);
addButtonPaintModeToMenu("google_icon_pipette.png", "", PAINT_MODE.PIPETTE);
addButtonPaintModeToMenu("google_icon_delete.png", "", PAINT_MODE.DELETE);

// - - - - - - - - - - - - - - - - - - -
// C A N V A S - S P R I T E - A T L A S 
MENU.appendEmptyWrapper("wrapperCurrentAtlas");

const ATLAS_LAYERS = new TilemapLayer();

const ATLAS_LAYER = ATLAS_LAYERS.add(
  new CanvasTilemap2D(
    "wrapperCurrentAtlas",
    ATLAS_MODE.tileWidth,
    ATLAS_MODE.mapLength
  ), (atlasLayer) => {
    atlasLayer.canvas.style.width = "100%";
    atlasLayer.onDraw = () => { };
  });

const ATLAS_IDX_LAYER = ATLAS_LAYERS.add(
  new CanvasTilemap2D("wrapperCurrentAtlas",
    ATLAS_MODE.tileWidth,
    ATLAS_MODE.mapLength
  ), (indexLayer) => {
    indexLayer.canvas.style.width = "100%";
    indexLayer.setIgnored = true;
    indexLayer.onDraw = () => {
      indexLayer.clear();
      if (ATLAS_MODE.drawIndexOrder) indexLayer.drawTileIndex(ATLAS_MODE.modeDrawOrderIndex);
    };
  });

const ATLAS_GRID_LAYER = ATLAS_LAYERS.add(
  new CanvasTilemap2D(
    "wrapperCurrentAtlas",
    ATLAS_MODE.tileWidth,
    ATLAS_MODE.mapLength
  ), (gridLayer) => {
    gridLayer.canvas.style.width = "100%";
    gridLayer.setIgnored = true;
    gridLayer.onDraw = () => {
      gridLayer.clear();
      if (ATLAS_MODE.drawGrid) gridLayer.drawGrid();
    };
  });

const ATLAS_SELECTOR_LAYER = ATLAS_LAYERS.add(
  new CanvasTilemap2D(
    "wrapperCurrentAtlas",
    ATLAS_MODE.tileWidth,
    ATLAS_MODE.mapLength
  ), (selectorLayer) => {
    selectorLayer.canvas.style.width = "100%";
    selectorLayer.setIgnored = true;
    selectorLayer.onDraw = () => {
      selectorLayer.clear();
      selectorLayer.drawSelector(
        ATLAS_MODE.coordinateTileSelected.x,
        ATLAS_MODE.coordinateTileSelected.y
      )
    };
    selectorLayer.canvas.onclick = (e) => selectAtlasTileByCoordinate(selectorLayer.moussePositionToCoordinate(e));
  });

ATLAS_LAYERS.foreach((layer) => layer.draw());

loadAtlasImageByUrl("assets/tileset_0.png");

/*----------------------------------------------------------*/

/* paint mode */
function addButtonPaintModeToMenu(iconName: string, description: string, idPaintMode: number) {
  let v = MENU.addButtonIcon(
    `assets/icon/${iconName}`,
    description, 32,
    "paint_mode",
    (btn) => {
      document.querySelectorAll(".paint_mode").forEach(v => v.classList.remove("selected"));
      btn.classList.add("selected");
      PAINT_MODE.previous = PAINT_MODE.current;
      PAINT_MODE.current = idPaintMode;
    },
    PAINT_MODE.current == idPaintMode
  );
  v.id = `paint_mode_${idPaintMode}`;
};

/* paint mode */
function selectPreviousMode() {
  document.querySelectorAll(".paint_mode")
    .forEach(v => v.classList.remove("selected"));

  let btn = document.getElementById(`paint_mode_${PAINT_MODE.previous}`);
  btn.classList.add("selected");

  PAINT_MODE.current = PAINT_MODE.previous;
}

/* paint mode */
function drawPainSelection(firstPos: { x: number, y: number }, secondPos: { x: number, y: number }, draw: (x: number, y: number) => void) {
  let flagX = firstPos.x < secondPos.x;
  let flagY = firstPos.y < secondPos.y;
  secondPos.x = flagX ? secondPos.x + 1 : secondPos.x - 1;
  secondPos.y = flagY ? secondPos.y + 1 : secondPos.y - 1;
  let ix = flagX ? 1 : -1;
  let iy = flagY ? 1 : -1;
  let ivx = (i: number) => flagX ? i < secondPos.x : i > secondPos.x;
  let ivy = (i: number) => flagY ? i < secondPos.y : i > secondPos.y;
  for (let x = firstPos.x; ivx(x); x += ix) {
    for (let y = firstPos.y; ivy(y); y += iy) {
      draw(x, y);
    }
  }
}

/*----------------------------------------------------------*/

/* atlas */
function loadAtlasImageByFile(files: FileList) {
  if (files.length <= 0) return; // don't change
  loadAtlasImageByUrl(URL.createObjectURL(files[0]));
}

/* atlas */
function loadAtlasImageByUrl(url: string) {
  let img = document.createElement("img");
  img.src = url;
  img.onload = () => {
    ATLAS_LAYER.setTileMapLength = img.width / ATLAS_LAYER.tileWidth;
    ATLAS_LAYER.updateSize();
    ATLAS_LAYER.draw();
    ATLAS_LAYER.drawImage(img, 0, 0);
    selectAtlasTileByCoordinate({ x: 0, y: 0 });
  };
}

/* atlas */
function enableDisabledDrawOrderIdx() {
  ATLAS_MODE.drawIndexOrder = !ATLAS_MODE.drawIndexOrder;
  ATLAS_IDX_LAYER.draw();
}

/* atlas */
function enableDisabledDrawGrid() {
  ATLAS_MODE.drawGrid = !ATLAS_MODE.drawGrid;
  ATLAS_GRID_LAYER.draw();
}

/* atlas */
function changeAtlasModeDrawOrderIdx() {
  ATLAS_MODE.modeDrawOrderIndex = ATLAS_MODE.modeDrawOrderIndex < 7
    ? ATLAS_MODE.modeDrawOrderIndex + 1
    : 0;

  let x = ATLAS_MODE.currIndexTileSelected % ATLAS_LAYER.tileMapLength;
  let y = Math.floor(ATLAS_MODE.currIndexTileSelected / ATLAS_LAYER.tileMapLength);

  ATLAS_MODE.currIndexTileSelected = ATLAS_LAYER
    .getDrawTileIndexByMode(ATLAS_MODE.modeDrawOrderIndex)(x, y);

  ATLAS_IDX_LAYER.draw();
}

/* atlas */
function selectAtlasTileByIndex(index: number) {
  let x = index % ATLAS_LAYER.tileMapLength;
  let y = Math.floor(index / ATLAS_LAYER.tileMapLength);
  selectAtlasTileByCoordinate({ x: x, y: y })
}

/* atlas */
function selectAtlasTileByCoordinate(pos: { x: number, y: number }) {
  ATLAS_MODE.coordinateTileSelected = pos;

  ATLAS_MODE.currIndexTileSelected = ATLAS_LAYER
    .getDrawTileIndexByMode(ATLAS_MODE.modeDrawOrderIndex)(pos.x, pos.y);

  ATLAS_SELECTOR_LAYER.draw();

  BUFFER_ONE_TILE.draw(ATLAS_LAYER.canvas,
    ATLAS_MODE.coordinateTileSelected.x * ATLAS_LAYER.tileWidth,
    ATLAS_MODE.coordinateTileSelected.y * ATLAS_LAYER.tileWidth,
    ATLAS_LAYER.tileWidth,
    ATLAS_LAYER.tileWidth,
    ATLAS_LAYER.tileWidth,
    ATLAS_LAYER.tileWidth
  );
}

/* atlas */
function resizeAtlasTileSize(value: string) {
  let size = parseInt(value);
  ATLAS_LAYERS.foreach(layer => {
    layer.setTileWidth = size;
    layer.setTileMapLength = ATLAS_LAYER.tileMapWidth / size;
    if (layer.ignored) {
      layer.updateSize();
      layer.clear();
      layer.draw();
    }
  });
  selectAtlasTileByCoordinate({ x: 0, y: 0 });
}

/*----------------------------------------------------------*/

/* tilemap */
function resizeTilemaChunk(value: string) {
  let size = parseInt(value)
  console.log("not implemetend")
}

/* tilemap */
function resizeTilemapTileSize(value: string) {
  let size = parseInt(value)
  TILEMAP_LAYERS.foreach(layer => {
    if (!layer.ignored) {
      layer.copy((copy) => {
        layer.setTileWidth = size;
        layer.updateSize();
        layer.draw();
        layer.drawImage(copy, 0, 0);
        layer.parseGrid();
      })
    } else {
      layer.setTileWidth = size;
      layer.updateSize();
      layer.draw();
    }
  });
}

/* tilemap */
function resizeTilemapWidth(value: string) {
  let size = parseInt(value);
  if (size > 150) {
    alert("a size larger than 300x300 may create a freeze/bug");
  }

  TILEMAP_LAYERS.foreach(layer => {
    if (!layer.ignored) {
      layer.copy((copy) => {
        layer.setTileMapLength = size;
        layer.updateSize();
        layer.draw();
        layer.drawImage(copy, 0, 0);
        layer.parseGrid();
      })
    } else {
      layer.setTileMapLength = size;
      layer.updateSize();
      layer.draw();
    }
  });
}

/* tilemap */
function importTilemap(files: FileList) {
  if (files.length <= 0)
    return; // don't change
  let firstFile = files[0];
  if (confirm("the tilemap will be resized and reinitialized, please confirm import")) {
    console.warn("not implemented")
  }
}

/* tilemap */
function exportTilemap() {
  const a = document.createElement('a');
  a.style.display = 'none';
  a.download = 'tilemap_data.json';
  a.href = "data:text/json;charset=utf-8," + encodeURIComponent(TILEMAP_LAYERS.export());
  a.click();
}
