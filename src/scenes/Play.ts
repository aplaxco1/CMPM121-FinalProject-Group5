import * as Phaser from "phaser";
import Player from "../classes/Player.ts";
import { CommandManager, MoveCommand } from "../classes/Command.ts";
import {
  Crop,
  CropOption,
  GrowthContext,
  CellContext,
} from "../classes/Crop.ts";

const gridCellWidth: number = 60;
const gridCellHeight: number = 60;
const uIBarHeight: number = 300;
const suncolor = [0x34b070, 0x6f95b8, 0x785871, 0xb37050, 0xf7a53b, 0xffd134];

class Cell {
  static readonly numBytes = 4 + 4 + 4;

  constructor(private dataView: DataView) {}

  get x(): number {
    return this.dataView.getUint32(0);
  }

  set x(i: number) {
    this.dataView.setUint32(0, i);
  }

  get y(): number {
    return this.dataView.getUint32(4);
  }

  set y(i: number) {
    this.dataView.setUint32(4, i);
  }

  get waterLevel(): number {
    return this.dataView.getUint32(8);
  }

  set waterLevel(i: number) {
    this.dataView.setUint32(8, i);
  }
}

interface CellData {
  x: number;
  y: number;
  waterLevel: number;
}

const cropOptions: CropOption[] = [
  {
    cropName: "Strawberry",
    maxGrowthLevel: 6,
    sunLevel: 2,
    waterLevel: 3,
    canGrow(growthContext): boolean {
      // can only grow if next to at least two other strawberries
      let nearbyStrawberries = 0;
      for (let cell of growthContext.nearbyCells) {
        if (cell.crop != null && cell.crop.cropName == this.cropName) {
          nearbyStrawberries += 1;
        }
      }
      if (
        growthContext.globalSunLevel >= this.sunLevel &&
        growthContext.cellWaterLevel >= this.waterLevel &&
        nearbyStrawberries >= 2
      ) {
        return true;
      } else {
        return false;
      }
    },
  },
  {
    cropName: "Potato",
    maxGrowthLevel: 6,
    sunLevel: 3,
    waterLevel: 4,
    canGrow(growthContext): boolean {
      // can only grow if ONLY potatoes near it
      let onlyPotatoes: boolean = true;
      for (let cell of growthContext.nearbyCells) {
        if (cell.crop != null && cell.crop.cropName != this.cropName) {
          onlyPotatoes = false;
          break;
        }
      }
      if (
        growthContext.globalSunLevel >= this.sunLevel &&
        growthContext.cellWaterLevel >= this.waterLevel &&
        onlyPotatoes
      ) {
        return true;
      } else {
        return false;
      }
    },
  },
  {
    cropName: "Corn",
    maxGrowthLevel: 6,
    sunLevel: 4,
    waterLevel: 2,
    canGrow(growthContext): boolean {
      // can only grow if no plants nearby
      let enoughSpace: boolean = true;
      for (let cell of growthContext.nearbyCells) {
        if (cell.crop != null) {
          enoughSpace = false;
          break;
        }
      }
      if (
        growthContext.globalSunLevel >= this.sunLevel &&
        growthContext.cellWaterLevel >= this.waterLevel &&
        enoughSpace
      ) {
        return true;
      } else {
        return false;
      }
    },
  },
];

interface command {
  type: string; // either plant or harvest
  key: string;
  x: number;
  y: number;
  cropOption: CropOption;
  cropLevel: number;
}

interface SaveData {
  time: string;
  gridData: string;
  sunLevel: string;
  cropInventory: string;
  playerPos: string;
  cropMap: string;
  commandList: string;
  redoList: string;
}

export default class Play extends Phaser.Scene {
  // gridCells cells stores the x, y position for each [row][col] cell in the game
  gridCells?: Cell[][] = [];
  arrayBuffer?: ArrayBuffer;
  // plantMap stores whatever plant exists at the current [row][col] grid cell
  cropMap: Map<string, Crop | null> = new Map();
  player?: Player;
  playerStartingPosition?: { x: number; y: number };
  collectedCrops: Map<string, number> = new Map(); // to check win condition

  // Command Manager
  commandManager: CommandManager = new CommandManager();
  commandList: command[] = [];
  redoList: command[] = [];

  // current global conditions across all cells
  currentSunLevel?: number;
  currCropIndex: number = 0;
  sleeping: boolean = false;

  numColumns?: number;
  numRows?: number;

  // list of keyboard inputs //
  // for player movement
  movementInputs?: Phaser.Input.Keyboard.Key[];
  right?: Phaser.Input.Keyboard.Key;
  left?: Phaser.Input.Keyboard.Key;
  up?: Phaser.Input.Keyboard.Key;
  down?: Phaser.Input.Keyboard.Key;
  // for placing plants
  placeCrop?: Phaser.Input.Keyboard.Key;
  cycleCrop?: Phaser.Input.Keyboard.Key;
  // for collecting plants
  collect?: Phaser.Input.Keyboard.Key;
  // to progress turn
  sleep?: Phaser.Input.Keyboard.Key;
  // to restart
  restart?: Phaser.Input.Keyboard.Key;
  undo?: Phaser.Input.Keyboard.Key;
  redo?: Phaser.Input.Keyboard.Key;
  // save
  save1?: Phaser.Input.Keyboard.Key;
  save2?: Phaser.Input.Keyboard.Key;
  save3?: Phaser.Input.Keyboard.Key;
  // return to menu
  return?: Phaser.Input.Keyboard.Key;

  // UI text
  textConfig = {
    align: "center",
    fontSize: "22px",
  };
  cropsText: any;
  winText?: Phaser.GameObjects.Text;
  controlsText?: Phaser.GameObjects.Text;
  cropText?: Phaser.GameObjects.Text;
  statusText?: Phaser.GameObjects.Text;

  // determines which save file to load game from
  loadingFrom?: string;

  constructor() {
    super("play");
  }

  init(data: { savefile: string }) {
    // initialize scene based on which save file is being loaded
    this.loadingFrom = data.savefile;
  }

  #addKey(
    name: keyof typeof Phaser.Input.Keyboard.KeyCodes,
  ): Phaser.Input.Keyboard.Key {
    return this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes[name]);
  }

  saveGame(savefile: string) {
    const cropDataMap = new Map();
    this.cropMap.forEach((value: Crop | null, key: string) => {
      if (value != null) {
        const cropInfo = {
          x: value.x,
          y: value.y,
          cropOption: value.cropData!.cropName,
          cropLevel: value.getGrowthLevel(),
        };
        cropDataMap.set(key, cropInfo);
      }
    });

    let cellList: CellData[][] = [];
    for (let col of this.gridCells!) {
      let list: CellData[] = [];
      for (let row of col) {
        list.push({ x: row.x, y: row.y, waterLevel: row.waterLevel });
      }
      cellList.push(list);
    }

    const date: Date = new Date();
    const data: SaveData = {
      time: date.toString(),
      gridData: JSON.stringify(cellList),
      sunLevel: this.currentSunLevel!.toString(),
      cropInventory: JSON.stringify(Array.from(this.collectedCrops.entries())),
      playerPos: JSON.stringify({ x: this.player!.x, y: this.player!.y }),
      cropMap: JSON.stringify(Array.from(cropDataMap.entries())),
      // save undo/redo stuff
      commandList: JSON.stringify(this.commandList),
      redoList: JSON.stringify(this.redoList),
    };

    localStorage.setItem(savefile, JSON.stringify(data));
  }

  loadGame(savefile: string) {
    const data: SaveData = JSON.parse(localStorage.getItem(savefile)!);
    let cellList: CellData[][] = JSON.parse(data.gridData);
    for (let x = 0; x < this.numRows!; x += 1) {
      const currCol: Cell[] = [];
      for (let y = 0; y < this.numColumns!; y += 1) {
        const currX = cellList[x][y].x;
        const currY = cellList[x][y].y;
        const index = this.numColumns! * x + y;
        const cell = new Cell(
          new DataView(this.arrayBuffer!, index * Cell.numBytes),
        );
        cell.x = currX;
        cell.y = currY;
        cell.waterLevel = cellList[x][y].waterLevel;
        currCol.push(cell);
      }
      this.gridCells?.push(currCol);
    }
    this.drawGrid();
    this.currentSunLevel = parseInt(data.sunLevel);
    this.collectedCrops = new Map(JSON.parse(data.cropInventory));
    this.playerStartingPosition = JSON.parse(data.playerPos);
    this.updateSun();

    const cropDataMap = new Map(JSON.parse(data.cropMap));
    cropDataMap.forEach((value: any, key: any) => {
      const newPlant = new Crop(
        this,
        value.x,
        value.y,
        cropOptions[this.findOption(value.cropOption)],
        value.cropLevel,
      )
        .setOrigin(0, 0)
        .setScale(2);
      this.cropMap.set(key, newPlant);
    });

    this.commandList = JSON.parse(data.commandList);
    this.redoList = JSON.parse(data.redoList);
  }

  create() {
    // add keyboard keys
    this.right = this.#addKey("RIGHT");
    this.left = this.#addKey("LEFT");
    this.up = this.#addKey("UP");
    this.down = this.#addKey("DOWN");
    this.movementInputs = [this.right, this.left, this.up, this.down];
    this.placeCrop = this.#addKey("P");
    this.cycleCrop = this.#addKey("C");
    this.collect = this.#addKey("H");
    this.restart = this.#addKey("SPACE");
    this.sleep = this.#addKey("S");
    // command keys
    this.undo = this.#addKey("Z");
    this.redo = this.#addKey("X");
    // save keys
    this.save1 = this.#addKey("F1");
    this.save2 = this.#addKey("F2");
    this.save3 = this.#addKey("F3");
    this.return = this.#addKey("ESC");

    this.numRows = (this.game.config.width as number) / gridCellWidth;
    this.numColumns =
      ((this.game.config.height as number) - uIBarHeight) / gridCellHeight;

    // set world bounds so player cannot move outside of them
    this.physics.world.setBounds(
      0,
      0,
      this.game.config.width as number,
      (this.game.config.height as number) - uIBarHeight,
    );

    this.arrayBuffer = new ArrayBuffer(
      this.numRows * this.numColumns * Cell.numBytes,
    );

    if (this.loadingFrom! == "newgame") {
      // randomize global sun and water level
      this.randomizeConditions();
      this.initializeGrid();
      // initialize collected crops to zero
      for (const crop of cropOptions) {
        this.collectedCrops.set(crop.cropName, 0);
      }
      // set player starting position
      this.playerStartingPosition = { x: 30, y: 30 };
      this.drawGrid();
      this.updateSun();
    } else {
      // LOAD FROM NUMBERED SAVE FILE (savefile01, savefile02, savefile03)
      this.loadGame(this.loadingFrom!);
      this.cropMap.forEach((value: any, key: any) => {
        console.log(key, value);
      });
    }

    // draw UI bar
    this.add
      .rectangle(
        0,
        (this.game.config.height as number) - uIBarHeight,
        this.game.config.width as number,
        uIBarHeight,
        0xffffff,
      )
      .setOrigin(0, 0);

    // add controls text to UI bar (temporary)
    this.controlsText = this.add
      .text(
        0,
        (this.game.config.height as number) - uIBarHeight,
        "[←],[↑],[→],[↓] - Move\n[C] Cycle Through Crops, [P] Plant Crop, [H] - Harvest Crop\n[S] - Sleep (Progress Turn)\n[Z] - Undo, [X] - Redo\n[F1] - Save (File 01), [F2] - Save (File 02), [F3] - Save (File 03)\n[ESC] Return to Menu\nCurrent Objective: Harvet 5 Starberries",
        { color: "0x000000" },
      )
      .setOrigin(0, 0);

    this.cropText = this.add
      .text(
        0,
        (this.game.config.height as number) - uIBarHeight / 1.75,
        "Current Crop Selected: ",
        { color: "0x000000" },
      )
      .setOrigin(0, 0);

    this.statusText = this.add
      .text(
        0,
        (this.game.config.height as number) - uIBarHeight / 2.25,
        "Current Cell:\n",
        { color: "0x000000" },
      )
      .setOrigin(0, 0);

    this.cropsText = this.add
      .text(
        0,
        (this.game.config.height as number) - uIBarHeight / 6,
        "Current Crops:\n",
        { color: "0x000000" },
      )
      .setOrigin(0, 0);

    // create player
    this.player = new Player(
      this,
      this.playerStartingPosition!.x,
      this.playerStartingPosition!.y,
      "idle_down",
      gridCellWidth,
      gridCellHeight,
    ).setOrigin(0.5, 0.5);
    this.player.setCollideWorldBounds(true);
  }

  update() {
    // test win condition is to collect 5 trees
    if (
      this.collectedCrops.get(cropOptions[0].cropName)! < 5 &&
      !this.sleeping
    ) {
      // simple player movement
      this.movePlayer();

      this.cropText!.text =
        "Current Crop Selected: " + cropOptions[this.currCropIndex].cropName;
      this.displayCurrentCellStatus();
      this.CropStatus();

      if (Phaser.Input.Keyboard.JustDown(this.placeCrop!)) {
        this.plant(cropOptions[this.currCropIndex]);
      }
      if (Phaser.Input.Keyboard.JustDown(this.cycleCrop!)) {
        this.currCropIndex += 1;
        if (this.currCropIndex >= cropOptions.length) {
          this.currCropIndex = 0;
        }
      }

      // collect a crop
      if (this.collect!.isDown) {
        this.harvest();
      }

      // progress turn
      if (Phaser.Input.Keyboard.JustDown(this.sleep!)) {
        this.sleeping = true;
        this.player!.stopMoving();
        this.cameras.main.fadeOut(1000);
        this.updateSun();

        this.time.delayedCall(1000, this.fadeIn, [], this);
        this.time.delayedCall(2000, this.playerWake, [], this);
      }

      // save game
      if (Phaser.Input.Keyboard.JustDown(this.save1!)) {
        this.saveGame("savefile01");
        alert("Save Complete");
      }
      if (Phaser.Input.Keyboard.JustDown(this.save2!)) {
        this.saveGame("savefile02");
        alert("Save Complete");
      }
      if (Phaser.Input.Keyboard.JustDown(this.save3!)) {
        this.saveGame("savefile03");
        alert("Save Complete");
      }

      // return to menu
      if (Phaser.Input.Keyboard.JustDown(this.return!)) {
        this.scene.stop();
        this.scene.start("menu");
      }

      if (Phaser.Input.Keyboard.JustDown(this.undo!)) {
        this.commandManager.undoCommand();
        this.undoCommand();
      } else if (Phaser.Input.Keyboard.JustDown(this.redo!)) {
        this.commandManager.redoCommand();
        this.redoCommand();
      }
    } else if (!this.sleeping) {
      this.player!.stopMoving();
      this.winText = this.add
        .text(
          (this.game.config.width as number) / 2,
          (this.game.config.height as number) / 2,
          "You Win!\n\nPress [SPACE] to restart.\n\n",
          this.textConfig,
        )
        .setOrigin(0.5);

      if (this.restart!.isDown) {
        this.scene.stop();
        this.scene.start("menu");
      }
    }
  }

  movePlayer() {
    const canMove = this.canMove();

    if (this.right!.isDown && canMove) {
      this.player!.moveRight();
    } else if (this.left!.isDown && canMove) {
      this.player!.moveLeft();
    } else if (this.up!.isDown && canMove) {
      this.player!.moveUp();
    } else if (this.down!.isDown && canMove) {
      this.player!.moveDown();
    } else {
      this.player!.stopMoving();
    }

    this.player!.setCurrCell();
  }

  moveCommand(prevX: number, prevY: number): void {
    const moveCommand = new MoveCommand(this.player!, prevX, prevY);
    this.commandManager.executeCommand(moveCommand);
  }

  undoCommand() {
    let currCommand: command | undefined = this.commandList.pop();
    if (currCommand != undefined) {
      // if it was a plant command, remove the plant
      if (currCommand.type == "plant") {
        let currCrop = this.cropMap.get(currCommand.key);
        if (currCrop) {
          currCommand.cropLevel = currCrop.getGrowthLevel();
          this.cropMap.set(currCommand.key, null);
          currCrop.destroy();
          this.redoList.push(currCommand);
        }
      }
      // if it was a harvest command, put the plant back
      if (currCommand.type == "harvest") {
        // if crop was collected, remove it from inventory
        if (currCommand.cropLevel >= 6) {
          let cropCount = this.collectedCrops.get(
            currCommand.cropOption.cropName,
          );
          if (cropCount) {
            cropCount -= 1;
          } else {
            cropCount = 0;
          }
          this.collectedCrops.set(currCommand.cropOption.cropName, cropCount);
        }
        let currCrop = new Crop(
          this,
          currCommand.x,
          currCommand.y,
          currCommand.cropOption,
          currCommand.cropLevel,
        )
          .setOrigin(0, 0)
          .setScale(2);
        this.cropMap.set(currCommand.key, currCrop);
        this.redoList.push(currCommand);
      }
    }
  }

  redoCommand() {
    let currCommand: command | undefined = this.redoList.pop();
    if (currCommand != undefined) {
      this.commandList.push(currCommand);
      if (currCommand.type == "plant") {
        let currCrop = new Crop(
          this,
          currCommand.x,
          currCommand.y,
          currCommand.cropOption,
          currCommand.cropLevel,
        )
          .setOrigin(0, 0)
          .setScale(2);
        this.cropMap.set(currCommand.key, currCrop);
      }
      if (currCommand.type == "harvest") {
        // if crop was collected, add it back to inventory
        if (currCommand.cropLevel >= 6) {
          let cropCount = this.collectedCrops.get(
            currCommand.cropOption.cropName,
          );
          if (cropCount) {
            cropCount += 1;
          } else {
            cropCount = 1;
          }
          this.collectedCrops.set(currCommand.cropOption.cropName, cropCount);
        }
        let currCrop = this.cropMap.get(currCommand.key);
        if (currCrop) {
          this.cropMap.set(currCommand.key, null);
          currCrop.destroy();
        }
      }
    }
  }

  findOption(cropName: string): number {
    for (let i = 0; i < cropOptions.length; i++) {
      if (cropOptions[i].cropName == cropName) {
        return i;
      }
    }
    return 0;
  }

  // prevents diagonal movement
  canMove(): boolean {
    let count = 0;
    for (const key of this.movementInputs!) {
      if (key.isDown) {
        count += 1;
      }
    }
    if (count > 1) {
      return false;
    }
    return true;
  }

  plant(crop: CropOption) {
    const pos =
      this.gridCells![this.player!.currCell!.x][this.player!.currCell!.y];
    const key = { x: this.player!.currCell!.x, y: this.player!.currCell!.y };

    if (
      !this.cropMap.get(JSON.stringify(key)) ||
      this.cropMap.get(JSON.stringify(key)) == null
    ) {
      const newPlant = new Crop(this, pos.x, pos.y, crop, 1)
        .setOrigin(0, 0)
        .setScale(2);

      this.commandList.push({
        type: "plant",
        key: JSON.stringify(key),
        x: pos.x,
        y: pos.y,
        cropOption: crop,
        cropLevel: 1,
      });
      this.redoList.splice(0, this.redoList.length);

      this.cropMap.set(JSON.stringify(key), newPlant);
    }
  }

  harvest() {
    const key = { x: this.player!.currCell!.x, y: this.player!.currCell!.y };
    const currCrop = this.cropMap.get(JSON.stringify(key));
    if (currCrop != null) {
      if (currCrop.growthLevel == 6) {
        let cropCount = this.collectedCrops.get(currCrop.getPlantName());
        if (cropCount) {
          cropCount += 1;
        } else {
          cropCount = 1;
        }
        this.collectedCrops.set(currCrop.getPlantName(), cropCount);
      }
      this.commandList.push({
        type: "harvest",
        key: JSON.stringify(key),
        x: currCrop.x,
        y: currCrop.y,
        cropOption: currCrop.cropData!,
        cropLevel: currCrop.growthLevel,
      });
      this.redoList.splice(0, this.redoList.length);
      this.cropMap.set(JSON.stringify(key), null);
      currCrop.destroy();
    }
  }

  fadeIn() {
    this.cameras.main.fadeIn(1000);
  }
  playerWake() {
    this.growPlants();
    this.randomizeConditions();
    this.sleeping = false;
    // autosave after every turn
    this.saveGame("autosave");
  }

  initializeGrid() {
    for (let x = 0; x < this.numRows!; x++) {
      const currCol: Cell[] = [];
      for (let y = 0; y < this.numColumns!; y++) {
        const currX = x * gridCellWidth;
        const currY = y * gridCellHeight;
        const index = this.numColumns! * x + y;
        const cell = new Cell(
          new DataView(this.arrayBuffer!, index * Cell.numBytes),
        );
        cell.x = currX;
        cell.y = currY;
        cell.waterLevel = randomInt(1, 5);
        currCol.push(cell);
      }
      this.gridCells?.push(currCol);
    }
  }

  drawGrid() {
    for (const col of this.gridCells!) {
      for (const cell of col) {
        const cellRect = this.add
          .rectangle(cell.x, cell.y, gridCellWidth, gridCellHeight, 0x34ba58)
          .setOrigin(0, 0);
        cellRect.isStroked = true;
      }
    }
  }

  updateSun() {
    this.add.circle(760, 10, 30, suncolor[this.currentSunLevel!]); //.setAlpha(0.8);
  }

  growPlants() {
    this.cropMap.forEach((newCrop, key) => {
      if (newCrop != null) {
        // get water level of cell
        const cell = JSON.parse(key);
        const cellWaterLevel = this.gridCells![cell.x][cell.y].waterLevel;
        // get list of crops near this one
        const adjacentCells = this.getAdjacentCells(cell);
        const growthContext: GrowthContext = {
          globalSunLevel: this.currentSunLevel!,
          cellWaterLevel: cellWaterLevel,
          nearbyCells: adjacentCells,
        };
        newCrop.grow(growthContext);
      }
    });
  }

  getAdjacentCells(cell: { x: number; y: number }): CellContext[] {
    const adjacentCrops: CellContext[] = [];
    const nearbyCells = [
      { x: cell.x, y: cell.y - 1 },
      { x: cell.x, y: cell.y + 1 },
      { x: cell.x - 1, y: cell.y },
      { x: cell.x + 1, y: cell.y },
      { x: cell.x - 1, y: cell.y - 1 },
      { x: cell.x - 1, y: cell.y + 1 },
      { x: cell.x + 1, y: cell.y - 1 },
      { x: cell.x + 1, y: cell.y + 1 },
    ];
    for (const c of nearbyCells) {
      if (
        !(c.x < 0 || c.x >= this.numRows! || c.y < 0 || c.y >= this.numColumns!)
      ) {
        let cellContext: CellContext = {
          cellWaterLevel: this.gridCells![c.x][c.y].waterLevel,
          crop: null,
        };
        const crop = this.cropMap.get(JSON.stringify(c));
        if (crop != null) {
          cellContext.crop = crop.cropData!;
        }
        adjacentCrops.push(cellContext);
      }
    }
    return adjacentCrops;
  }

  randomizeConditions() {
    this.currentSunLevel = randomInt(1, 5);
    const rained = Math.random() < 0.3;
    if (rained) {
      console.log("It rained!");
    }
    this.setWaterLevelPerCell(rained);
  }

  setWaterLevelPerCell(rained: boolean) {
    for (const col of this.gridCells!) {
      for (const cell of col) {
        if (rained) {
          cell.waterLevel = randomInt(3, 5);
        } else if (cell.waterLevel > 1) {
          cell.waterLevel -= 1;
        }
      }
    }
  }

  displayCurrentCellStatus() {
    this.statusText!.text = "Current Cell: ";
    const currCell = this.player!.currCell;
    this.statusText!.text += currCell!.x + ", " + currCell!.y + "\n";
    this.statusText!.text += "Sun Level = " + this.currentSunLevel + "\n";
    this.statusText!.text +=
      "Cell Water Level = " +
      this.gridCells![currCell!.x][currCell!.y].waterLevel +
      "\n";
    const currCrop = this.cropMap.get(JSON.stringify(currCell));
    if (currCrop != null) {
      this.statusText!.text +=
        "Crop = " +
        currCrop.getPlantName() +
        ", Crop Level = " +
        currCrop.getGrowthLevel() +
        "\n";
      const canItGrow = currCrop.cropData!.canGrow({
        globalSunLevel: this.currentSunLevel!,
        cellWaterLevel: this.gridCells![currCell!.x][currCell!.y].waterLevel,
        nearbyCells: this.getAdjacentCells(currCell!),
      });
      if (canItGrow) {
        this.statusText!.text += "Crop Can Grow!\n";
      } else {
        this.statusText!.text += "Crop Cannot Grow!\n";
      }
    } else {
      this.statusText!.text += "No Crop In Cell\n";
    }
  }

  CropStatus() {
    this.cropsText!.text = "Harvest result: ";
    for (let crop of cropOptions) {
      this.cropsText!.text += crop.cropName + " ";
      this.cropsText!.text += this.collectedCrops.get(crop.cropName) + ", ";
    }
  }
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
