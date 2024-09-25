import { ExcaliburGraphicsContext, Graphic, GraphicOptions, ImageSource, Logger, Vector } from "excalibur";
import { b, c } from "vite/dist/node/types.d-aGj9QkWt";

export enum NineSliceStretch {
  Stretch,
  Tile,
  TileFit,
}

export type NineSliceConfig = GraphicOptions & {
  source: ImageSource;
  sourceConfig: {
    width: number;
    height: number;
    topMargin: number;
    leftMargin: number;
    bottomMargin: number;
    rightMargin: number;
  };
  destinationConfig: {
    drawCenter: boolean;
    stretchH: NineSliceStretch;
    stretchV: NineSliceStretch;
  };
  debug?: boolean;
};

export class NineSlice extends Graphic {
  imgSource: ImageSource;
  sourceSprite: HTMLImageElement;
  canvasA: HTMLCanvasElement;
  canvasB: HTMLCanvasElement;
  canvasC: HTMLCanvasElement;
  canvasD: HTMLCanvasElement;
  canvasE: HTMLCanvasElement;
  canvasF: HTMLCanvasElement;
  canvasG: HTMLCanvasElement;
  canvasH: HTMLCanvasElement;
  canvasI: HTMLCanvasElement;
  firstTimeFlag = true;
  private _logger = Logger.getInstance();
  constructor(public config: NineSliceConfig) {
    super(config);
    if (!this.config.width) this.config.width = 0;
    if (!this.config.height) this.config.height = 0;
    this.firstTimeFlag = config.debug || false;

    this.imgSource = config.source;
    this.sourceSprite = config.source.image;

    this.canvasA = document.createElement("canvas");
    this.canvasB = document.createElement("canvas");
    this.canvasC = document.createElement("canvas");
    this.canvasD = document.createElement("canvas");
    this.canvasE = document.createElement("canvas");
    this.canvasF = document.createElement("canvas");
    this.canvasG = document.createElement("canvas");
    this.canvasH = document.createElement("canvas");
    this.canvasI = document.createElement("canvas");
    this.initialize();

    if (!this.imgSource.isLoaded()) {
      this._logger.warnOnce(
        `ImageSource ${this.imgSource.path}` +
          ` is not yet loaded and won't be drawn. Please call .load() or include in a Loader.\n\n` +
          `Read https://excaliburjs.com/docs/imagesource for more information.`
      );
    }
  }

  setNewImage(imgSrc: ImageSource, auto: boolean = false) {
    this.imgSource = imgSrc;
    this.sourceSprite = imgSrc.image;

    setTimeout(() => {
      if (auto) this.initialize();
    }, 2500);
  }

  setTargetWidth(newWidth: number, auto: boolean = false) {
    this.config.width = newWidth;
    if (auto) this.initialize();
  }
  setTargetHeight(newHeight: number, auto: boolean = false) {
    this.config.height = newHeight;
    if (auto) this.initialize();
  }
  setMargins(left: number, top: number, right: number, bottom: number, auto: boolean = false) {
    this.config.sourceConfig.leftMargin = left;
    this.config.sourceConfig.topMargin = top;
    this.config.sourceConfig.rightMargin = right;
    this.config.sourceConfig.bottomMargin = bottom;
    if (auto) this.initialize();
  }

  setStretch(type: "Horizontal" | "Vertical", strategy: NineSliceStretch, auto: boolean = false) {
    if (type === "Horizontal") {
      this.config.destinationConfig.stretchH = strategy;
    } else {
      this.config.destinationConfig.stretchV = strategy;
    }
    if (auto) this.initialize();
  }

  getConfig(): NineSliceConfig {
    return this.config;
  }

  drawTile(
    context: ExcaliburGraphicsContext,
    targetCanvas: HTMLCanvasElement,
    destinationSize: Vector,
    hstrategy: NineSliceStretch,
    vstrategy: NineSliceStretch,
    marginW?: number,
    marginH?: number
  ) {
    if (this.firstTimeFlag) {
      console.log("*******************************************");
      console.log("target canvas: ", targetCanvas);
      console.log("*******************************************");
    }

    let tempMarginW = marginW || 0;
    let tempMarginH = marginH || 0;
    let tempSizeX, tempPositionX, tempSizeY, tempPositionY;
    let numTilesX = this.getNumberOfTiles(targetCanvas.width, destinationSize.x, hstrategy);
    let numTilesY = this.getNumberOfTiles(targetCanvas.height, destinationSize.y, vstrategy);

    if (this.firstTimeFlag) {
      console.log("margins", tempMarginW, tempMarginH);
      console.log("tile count", numTilesX, numTilesY);
    }

    for (let i = 0; i < numTilesX; i++) {
      for (let j = 0; j < numTilesY; j++) {
        if (this.firstTimeFlag) {
          console.log("loop indexes", i, j);
        }
        let { tempSize, tempPosition } = this.calculateParams(
          i,
          numTilesX,
          targetCanvas.width,
          destinationSize.x,
          this.config.destinationConfig.stretchH
        );
        tempSizeX = tempSize;
        tempPositionX = tempPosition;

        if (this.firstTimeFlag) {
          console.log("X size/pos", tempSizeX, tempPositionX + tempMarginW);
        }

        ({ tempSize, tempPosition } = this.calculateParams(
          j,
          numTilesY,
          targetCanvas.height,
          destinationSize.y,
          this.config.destinationConfig.stretchV
        ));
        tempSizeY = tempSize;
        tempPositionY = tempPosition;

        if (this.firstTimeFlag) {
          console.log("Y size/pos", tempSizeY, tempPositionY + tempMarginH);
        }
        context.drawImage(
          targetCanvas,
          0,
          0,
          targetCanvas.width,
          targetCanvas.height,
          tempMarginW + tempPositionX,
          tempMarginH + tempPositionY,
          tempSizeX,
          tempSizeY
        );
      }
    }
    if (targetCanvas === this.canvasI) this.firstTimeFlag = false;
  }

  protected _drawImage(ex: ExcaliburGraphicsContext, x: number, y: number): void {
    if (this.imgSource.isLoaded()) {
      //Top left, no strecthing

      this.drawTile(
        ex,
        this.canvasA,
        //@ts-ignore
        new Vector(this.config.sourceConfig.leftMargin, this.config.sourceConfig.topMargin),
        this.config.destinationConfig.stretchH,
        this.config.destinationConfig.stretchV
      );

      //Top, middle, horizontal stretching
      this.drawTile(
        ex,
        this.canvasB,
        //@ts-ignore
        new Vector(
          //@ts-ignore
          this.config.width - this.config.sourceConfig.leftMargin - this.config.sourceConfig.rightMargin,
          this.config.sourceConfig.topMargin
        ),
        this.config.destinationConfig.stretchH,
        this.config.destinationConfig.stretchV,
        this.config.sourceConfig.leftMargin,
        0
      );

      //Top right, no strecthing

      this.drawTile(
        ex,
        this.canvasC,
        //@ts-ignore
        new Vector(this.config.sourceConfig.rightMargin, this.config.sourceConfig.topMargin),
        this.config.destinationConfig.stretchH,
        this.config.destinationConfig.stretchV,
        //@ts-ignore
        this.config.width - this.config.sourceConfig.rightMargin,
        0
      );

      // middle, left, vertical strecthing

      this.drawTile(
        ex,
        this.canvasD,
        new Vector(
          this.config.sourceConfig.leftMargin,
          //@ts-ignore
          this.config.height - this.config.sourceConfig.bottomMargin - this.config.sourceConfig.topMargin
        ),
        this.config.destinationConfig.stretchH,
        this.config.destinationConfig.stretchV,
        0,
        this.config.sourceConfig.topMargin
      );

      // center, both strecthing
      if (this.config.destinationConfig.drawCenter)
        this.drawTile(
          ex,
          this.canvasE,
          new Vector(
            //@ts-ignore
            this.config.width - this.config.sourceConfig.leftMargin - this.config.sourceConfig.rightMargin,
            //@ts-ignore
            this.config.height - this.config.sourceConfig.bottomMargin - this.config.sourceConfig.topMargin
          ),
          this.config.destinationConfig.stretchH,
          this.config.destinationConfig.stretchV,
          this.config.sourceConfig.leftMargin,
          this.config.sourceConfig.topMargin
        );

      //middle, right, vertical strecthing
      this.drawTile(
        ex,
        this.canvasF,

        new Vector(
          this.config.sourceConfig.rightMargin,
          //@ts-ignore
          this.config.height - this.config.sourceConfig.bottomMargin - this.config.sourceConfig.topMargin
        ),
        this.config.destinationConfig.stretchH,
        this.config.destinationConfig.stretchV,
        //@ts-ignore
        this.config.width - this.config.sourceConfig.rightMargin,
        this.config.sourceConfig.topMargin
      );

      //bottom left, no strecthing
      this.drawTile(
        ex,
        this.canvasG,
        new Vector(this.config.sourceConfig.leftMargin, this.config.sourceConfig.bottomMargin),
        this.config.destinationConfig.stretchH,
        this.config.destinationConfig.stretchV,
        0,
        //@ts-ignore
        this.config.height - this.config.sourceConfig.bottomMargin
      );

      //bottom middle, horizontal strecthing
      this.drawTile(
        ex,
        this.canvasH,
        //@ts-ignore
        new Vector(
          //@ts-ignore
          this.config.width - this.config.sourceConfig.leftMargin - this.config.sourceConfig.rightMargin,
          this.config.sourceConfig.bottomMargin
        ),
        this.config.destinationConfig.stretchH,
        this.config.destinationConfig.stretchV,
        this.config.sourceConfig.leftMargin,
        //@ts-ignore
        this.config.height - this.config.sourceConfig.bottomMargin
      );

      //bottom right, no strecthing
      this.drawTile(
        ex,
        this.canvasI,
        new Vector(this.config.sourceConfig.rightMargin, this.config.sourceConfig.bottomMargin),
        this.config.destinationConfig.stretchH,
        this.config.destinationConfig.stretchV,
        //@ts-ignore
        this.config.width - this.config.sourceConfig.rightMargin,
        //@ts-ignore
        this.config.height - this.config.sourceConfig.bottomMargin
      );
    } else {
      this._logger.warnOnce(
        `ImageSource ${this.imgSource.path}` +
          ` is not yet loaded and won't be drawn. Please call .load() or include in a Loader.\n\n` +
          `Read https://excaliburjs.com/docs/imagesource for more information.`
      );
    }
  }

  initialize() {
    //top left slice

    this.canvasA.width = this.config.sourceConfig.leftMargin;
    this.canvasA.height = this.config.sourceConfig.topMargin;
    const Atx = this.canvasA.getContext("2d");

    Atx?.drawImage(this.sourceSprite, 0, 0, this.canvasA.width, this.canvasA.height, 0, 0, this.canvasA.width, this.canvasA.height);

    //top slice
    //@ts-ignore
    this.canvasB.width = this.config.sourceConfig.width - this.config.sourceConfig.leftMargin - this.config.sourceConfig.rightMargin;
    this.canvasB.height = this.config.sourceConfig.topMargin;

    const Btx = this.canvasB.getContext("2d");
    Btx?.drawImage(
      this.sourceSprite,
      this.config.sourceConfig.leftMargin,
      0,
      this.canvasB.width,
      this.canvasB.height,
      0,
      0,
      this.canvasB.width,
      this.canvasB.height
    );

    //top right slice
    this.canvasC.width = this.config.sourceConfig.rightMargin;
    this.canvasC.height = this.config.sourceConfig.topMargin;
    const Ctx = this.canvasC.getContext("2d");
    Ctx?.drawImage(
      this.sourceSprite,
      this.sourceSprite.width - this.config.sourceConfig.rightMargin,
      0,
      this.canvasC.width,
      this.canvasC.height,
      0,
      0,
      this.canvasC.width,
      this.canvasC.height
    );

    //middle left slice
    this.canvasD.width = this.config.sourceConfig.leftMargin;
    this.canvasD.height = this.config.sourceConfig.height - this.config.sourceConfig.topMargin - this.config.sourceConfig.bottomMargin;
    const Dtx = this.canvasD.getContext("2d");
    Dtx?.drawImage(
      this.sourceSprite,
      0,
      this.config.sourceConfig.topMargin,
      this.canvasD.width,
      this.canvasD.height,
      0,
      0,
      this.canvasD.width,
      this.canvasD.height
    );

    //middle slice
    this.canvasE.width = this.config.sourceConfig.width - this.config.sourceConfig.leftMargin - this.config.sourceConfig.rightMargin;
    this.canvasE.height = this.config.sourceConfig.height - this.config.sourceConfig.topMargin - this.config.sourceConfig.bottomMargin;
    const Etx = this.canvasE.getContext("2d");
    Etx?.drawImage(
      this.sourceSprite,
      this.config.sourceConfig.leftMargin,
      this.config.sourceConfig.topMargin,
      this.canvasE.width,
      this.canvasE.height,
      0,
      0,
      this.canvasE.width,
      this.canvasE.height
    );

    //middle right slice
    this.canvasF.width = this.config.sourceConfig.rightMargin;
    this.canvasF.height = this.config.sourceConfig.height - this.config.sourceConfig.topMargin - this.config.sourceConfig.bottomMargin;
    const Ftx = this.canvasF.getContext("2d");
    Ftx?.drawImage(
      this.sourceSprite,
      //@ts-ignore
      this.config.sourceConfig.width - this.config.sourceConfig.rightMargin,
      this.config.sourceConfig.topMargin,
      this.canvasF.width,
      this.canvasF.height,
      0,
      0,
      this.canvasF.width,
      this.canvasF.height
    );

    //bottom left slice
    this.canvasG.width = this.config.sourceConfig.leftMargin;
    this.canvasG.height = this.config.sourceConfig.bottomMargin;
    const Gtx = this.canvasG.getContext("2d");
    Gtx?.drawImage(
      this.sourceSprite,
      0,
      this.config.sourceConfig.height - this.config.sourceConfig.bottomMargin,
      this.canvasG.width,
      this.canvasG.height,
      0,
      0,
      this.canvasG.width,
      this.canvasG.height
    );

    //bottom slice
    this.canvasH.width = this.config.sourceConfig.width - this.config.sourceConfig.leftMargin - this.config.sourceConfig.rightMargin;
    this.canvasH.height = this.config.sourceConfig.bottomMargin;
    const Htx = this.canvasH.getContext("2d");
    Htx?.drawImage(
      this.sourceSprite,
      this.config.sourceConfig.leftMargin,
      this.config.sourceConfig.height - this.config.sourceConfig.bottomMargin,
      this.canvasH.width,
      this.canvasH.height,
      0,
      0,
      this.canvasH.width,
      this.canvasH.height
    );

    //bottom right slice
    this.canvasI.width = this.config.sourceConfig.rightMargin;
    this.canvasI.height = this.config.sourceConfig.bottomMargin;
    const Itx = this.canvasI.getContext("2d");
    Itx?.drawImage(
      this.sourceSprite,
      this.sourceSprite.width - this.config.sourceConfig.rightMargin,
      this.config.sourceConfig.height - this.config.sourceConfig.bottomMargin,
      this.canvasI.width,
      this.canvasI.height,
      0,
      0,
      this.canvasI.width,
      this.canvasI.height
    );
  }

  clone(): Graphic {
    return new NineSlice(this.config);
  }

  getNumberOfTiles(tilesize: number, destinationSize: number, strategy: NineSliceStretch): number {
    switch (strategy) {
      case NineSliceStretch.Stretch:
        return 1;
      case NineSliceStretch.Tile:
        return Math.ceil(destinationSize / tilesize);
      case NineSliceStretch.TileFit:
        return Math.ceil(destinationSize / tilesize);
    }
  }

  calculateParams(
    tilenum: number,
    numTiles: number,
    tilesize: number,
    destinationSize: number,
    strategy: NineSliceStretch
  ): { tempPosition: number; tempSize: number } {
    switch (strategy) {
      case NineSliceStretch.Stretch:
        return {
          tempPosition: 0,
          tempSize: destinationSize,
        };
      case NineSliceStretch.Tile:
        // if last tile, adjust size
        if (tilenum == numTiles - 1) {
          //last tile
          return {
            tempPosition: tilenum * tilesize,
            tempSize: tilesize - (numTiles * tilesize - destinationSize),
          };
        } else {
          return {
            tempPosition: tilenum * tilesize,
            tempSize: tilesize,
          };
        }

      case NineSliceStretch.TileFit:
        const reducedTileSize = destinationSize / numTiles;
        const position = tilenum * reducedTileSize;
        return {
          tempPosition: position,
          tempSize: reducedTileSize,
        };
    }
  }
}

/* Parking Lot of old code


      let tempSizeX, tempPositionX, tempSizeY, tempPositionY;

      let numTilesX = this.getNumberOfTiles(this.canvasA.width, this.canvasA.width, this.config.destinationConfig.stretchH);
      let numTilesY = this.getNumberOfTiles(this.canvasA.height, this.canvasA.height, this.config.destinationConfig.stretchV);

      for (let i = 0; i < numTilesX; i++) {
        for (let j = 0; j < numTilesY; j++) {
          let { tempSize, tempPosition } = this.calculateParams(
            i,
            numTilesX,
            this.canvasA.width,
            this.canvasA.width,
            this.config.destinationConfig.stretchH
          );
          tempSizeX = tempSize;
          tempPositionX = tempPosition;

          ({ tempSize, tempPosition } = this.calculateParams(
            j,
            numTilesY,
            this.canvasA.height,
            this.canvasA.height,
            this.config.destinationConfig.stretchV
          ));
          tempSizeY = tempSize;
          tempPositionY = tempPosition;
          if (this.firstTimeFlag) {
            this.firstTimeFlag = false;
            console.log(tempSize, tempPosition);
            console.log(numTilesX, numTilesY);
          }

          ex.drawImage(
            this.canvasA,
            0,
            0,
            this.canvasA.width,
            this.canvasA.height,
            tempPositionX,
            tempPositionY,
            tempSizeX,
            tempSizeY
          );
        }
      }

       
      switch (this.config.destinationConfig.stretchH) {
        case NineSliceStretch.Stretch:
          ex.drawImage(
            this.canvasB,
            0,
            0,
            this.canvasB.width,
            this.canvasB.height,
            x + this.config.sourceConfig.leftMargin,
            y,
            //@ts-ignore
            this.config.width - this.config.sourceConfig.leftMargin - this.config.sourceConfig.rightMargin,
            this.canvasB.height
          );
          break;
        case NineSliceStretch.Tile:
          //@ts-ignore
          const numTilesX = Math.ceil(this.config.width / this.config.sourceConfig.width);

          for (let i = 0; i < numTilesX; i++) {
            const tileX = i * this.config.sourceConfig.width + this.config.sourceConfig.leftMargin;
            let widthX = this.config.sourceConfig.width;
            // if last tile, adjust width
            if (i === numTilesX - 1) {
              widthX =
                //@ts-ignore
                this.config.width -
                this.config.sourceConfig.rightMargin -
                this.config.sourceConfig.leftMargin -
                numTilesX * this.config.sourceConfig.width;
            }

            ex.drawImage(
              this.canvasB,
              0,
              0,
              this.canvasB.width,
              this.canvasB.height,
              tileX,
              y,
              //@ts-ignore
              widthX,
              this.canvasB.height
            );
          }
          break;
      } 

        switch (this.config.destinationConfig.stretchH) {
        case NineSliceStretch.Stretch:
        case NineSliceStretch.Tile:
          ex.drawImage(
            this.canvasC,
            0,
            0,
            this.canvasC.width,
            this.canvasC.height,
            //@ts-ignore
            x + (this.config.width - this.config.sourceConfig.rightMargin),
            y,
            this.canvasC.width,
            this.canvasC.height
          );
          break;
      } 

      switch (this.config.destinationConfig.stretchV) {
        case NineSliceStretch.Stretch:
          ex.drawImage(
            this.canvasD,
            0,
            0,
            this.canvasD.width,
            this.canvasD.height,
            x,
            y + this.config.sourceConfig.topMargin,
            this.canvasD.width,
            //@ts-ignore
            this.config.height - this.config.sourceConfig.topMargin - this.config.sourceConfig.bottomMargin
          );
          break;
        case NineSliceStretch.Tile:
          //@ts-ignore
          const numTilesY = Math.ceil(this.config.height / this.config.sourceConfig.height);

          for (let i = 0; i < numTilesY; i++) {
            const tileY = i * this.config.sourceConfig.height + this.config.sourceConfig.topMargin;
            let heightY = this.config.sourceConfig.height;
            // if last tile, adjust width
            if (i === numTilesY - 1) {
              //@ts-ignore
              heightY = numTilesY * this.config.sourceConfig.height - this.config.height - this.config.sourceConfig.topMargin;
            }
            console.log(numTilesY, tileY, heightY);

            ex.drawImage(
              this.canvasD,
              0,
              0,
              this.canvasD.width,
              this.canvasD.height,
              x,
              tileY,
              //@ts-ignore
              this.canvasD.width,
              heightY
            );
          }
          break;
      }

      if (this.config.destinationConfig.drawCenter) {
        let drawWidth, drawHeight;
        switch (this.config.destinationConfig.stretchH) {
          case NineSliceStretch.Stretch:
            //@ts-ignore
            drawWidth = this.config.width - this.config.sourceConfig.leftMargin - this.config.sourceConfig.rightMargin;
        }
        switch (this.config.destinationConfig.stretchV) {
          case NineSliceStretch.Stretch:
            //@ts-ignore
            drawHeight = this.config.height - this.config.sourceConfig.topMargin - this.config.sourceConfig.bottomMargin;
        }

        ex.drawImage(
          this.canvasE,
          0,
          0,
          this.canvasE.width,
          this.canvasE.height,
          x + this.config.sourceConfig.leftMargin,
          y + this.config.sourceConfig.topMargin,
          drawWidth,
          drawHeight
        );
      }

      switch (this.config.destinationConfig.stretchV) {
        case NineSliceStretch.Stretch:
          ex.drawImage(
            this.canvasF,
            0,
            0,
            this.canvasF.width,
            this.canvasF.height,
            //@ts-ignore
            x + this.config.width - this.config.sourceConfig.rightMargin,
            y + this.config.sourceConfig.topMargin,
            this.canvasF.width,
            //@ts-ignore
            this.config.height - this.config.sourceConfig.topMargin - this.config.sourceConfig.bottomMargin
          );
          break;
        case NineSliceStretch.Tile:
          //@ts-ignore
          const numTilesY = Math.ceil(this.config.height / this.config.sourceConfig.height);

          for (let i = 0; i < numTilesY; i++) {
            const tileY = i * this.config.sourceConfig.height + this.config.sourceConfig.topMargin;
            let heightY = this.config.sourceConfig.height;
            // if last tile, adjust width
            if (i === numTilesY - 1) {
              heightY = numTilesY * this.config.sourceConfig.height - tileY - this.config.sourceConfig.topMargin;
            }
            ex.drawImage(
              this.canvasD,
              0,
              0,
              this.canvasD.width,
              this.canvasD.height,
              //@ts-ignore
              this.config.width - this.config.sourceConfig.rightMargin,
              tileY,
              //@ts-ignore
              this.canvasD.width,
              heightY
            );
          }
          break;
          
      }


      ex.drawImage(
        this.canvasG,
        0,
        0,
        this.canvasG.width,
        this.canvasG.height,
        0,
        //@ts-ignore
        y + this.config.height - this.config.sourceConfig.bottomMargin,
        this.canvasG.width,
        this.canvasG.height
      );

      
      switch (this.config.destinationConfig.stretchH) {
        case NineSliceStretch.Stretch:
          ex.drawImage(
            this.canvasH,
            0,
            0,
            this.canvasH.width,
            this.canvasH.height,
            x + this.config.sourceConfig.leftMargin,
            //@ts-ignore
            y + this.config.height - this.config.sourceConfig.bottomMargin,
            //@ts-ignore
            this.config.width - this.config.sourceConfig.leftMargin - this.config.sourceConfig.rightMargin,
            this.canvasH.height
          );
          break;
        case NineSliceStretch.Tile:
          //@ts-ignore
          const numTilesX = Math.ceil(this.config.width / this.config.sourceConfig.width);

          for (let i = 0; i < numTilesX; i++) {
            const tileX = i * this.config.sourceConfig.width + this.config.sourceConfig.leftMargin;
            let widthX = this.config.sourceConfig.width;
            // if last tile, adjust width
            if (i === numTilesX - 1) {
              widthX = numTilesX * this.config.sourceConfig.width - tileX - this.config.sourceConfig.rightMargin;
            }
            ex.drawImage(
              this.canvasH,
              0,
              0,
              this.canvasB.width,
              this.canvasB.height,
              tileX,
              //@ts-ignore
              this.config.height - this.config.sourceConfig.bottomMargin,
              //@ts-ignore
              widthX,
              this.canvasB.height
            );
          }
          break;
      }
    //bottom right, no strecthing

      let bottomDrawX, bottomDrawY;
      switch (this.config.destinationConfig.stretchH) {
        case NineSliceStretch.Stretch:
        case NineSliceStretch.Tile:
          //@ts-ignore
          bottomDrawX = this.config.width - this.config.sourceConfig.rightMargin;
      }
      switch (this.config.destinationConfig.stretchV) {
        case NineSliceStretch.Stretch:
        case NineSliceStretch.Tile:
          //@ts-ignore
          bottomDrawY = this.config.height - this.config.sourceConfig.bottomMargin;
          break;
      }
      ex.drawImage(
        this.canvasI,
        0,
        0,
        this.canvasI.width,
        this.canvasI.height,
        bottomDrawX,
        bottomDrawY,
        this.canvasI.width,
        this.canvasI.height
      );
*/
