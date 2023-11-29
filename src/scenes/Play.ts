import * as Phaser from "phaser";
import Player from "../classes/Player.ts";
import { CommandManager, MoveCommand } from "../classes/Command.ts";
import { Crop, CropOption } from "../classes/Crop.ts";

const gridCellWidth: number = 60;
const gridCellHeight: number = 60;
const uIBarHeight: number = 400;

interface CellData {
  x: number;
  y: number;
  waterLevel: number;
}

const cropOptions: CropOption[] = [
  {
    cropName: "Strawberry",
    growthRate: 5,
    sunLevel: 2,
    waterLevel: 3,
    cropsToAvoid: ["Potato"],
  },
  {
    cropName: "Potato",
    growthRate: 4,
    sunLevel: 3,
    waterLevel: 4,
    cropsToAvoid: ["Corn"],
  },
  {
    cropName: "Corn",
    growthRate: 6,
    sunLevel: 4,
    waterLevel: 2,
    cropsToAvoid: ["Strawberry", "Potato"],
  },
];

interface SaveData {
  time: string;
  gridData: string;
  sunLevel: string;
  cropInventory: string;
  playerPos: string;
  cropMap: string;
  // save undo/redo stuff
  undoMap: string;
  undoKeys: string;
  redoKeys: string;
}

export default class Play extends Phaser.Scene {
  // gridCells cells stores the x, y position for each [row][col] cell in the game
  gridCells?: CellData[][] = [];
  // plantMap stores whatever plant exists at the current [row][col] grid cell
  cropMap: Map<string, Crop | null> = new Map();
  player?: Player;
  playerStartingPosition?: { x: number; y: number };
  collectedCrops: Map<string, number> = new Map(); // to check win condition

  // undo map
  undoMap: Map<string, Crop | null> = new Map();
  undoKeys: { x: number; y: number }[] = [];
  redoKeys: { x: number; y: number }[] = [];
  // Command Manager
  commandManager: CommandManager = new CommandManager();

  // current global conditions across all cells
  currentSunLevel?: number;
  sleeping: boolean = false;

  // list of keyboard inputs //
  // for player movement
  movementInputs?: Phaser.Input.Keyboard.Key[];
  right?: Phaser.Input.Keyboard.Key;
  left?: Phaser.Input.Keyboard.Key;
  up?: Phaser.Input.Keyboard.Key;
  down?: Phaser.Input.Keyboard.Key;
  // for placing plants
  //place?: Phaser.Input.Keyboard.Key;
  placeCrop1?: Phaser.Input.Keyboard.Key;
  placeCrop2?: Phaser.Input.Keyboard.Key;
  placeCrop3?: Phaser.Input.Keyboard.Key;
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
  winText?: Phaser.GameObjects.Text;
  controlsText?: Phaser.GameObjects.Text;
  statusText?: Phaser.GameObjects.Text;

  // determines which save file to load game from
  loadingFrom?: string;
  cropsText: any;

  constructor() {
    super("play");
  }

  init(data: { savefile: string }) {
    // initialize scene based on which save file is being loaded
    console.log("init ", data.savefile);
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
          cropOption: value.cropData,
          cropLevel: value.getGrowthLevel(),
        };
        cropDataMap.set(key, cropInfo);
      }
    });

    const undoDataMap = new Map();
    this.undoMap.forEach((value: Crop | null, key: string) => {
      if (value != null) {
        const cropInfo = {
          x: value.x,
          y: value.y,
          cropOption: value.cropData,
          cropLevel: value.getGrowthLevel(),
        };
        undoDataMap.set(key, cropInfo);
      }
    });

    const date: Date = new Date();
    const data: SaveData = {
      time: date.toString(),
      gridData: JSON.stringify(this.gridCells),
      sunLevel: this.currentSunLevel!.toString(),
      cropInventory: JSON.stringify(Array.from(this.collectedCrops.entries())),
      playerPos: JSON.stringify({ x: this.player!.x, y: this.player!.y }),
      cropMap: JSON.stringify(Array.from(cropDataMap.entries())),
      // save undo/redo stuff
      undoMap: JSON.stringify(Array.from(undoDataMap.entries())),
      undoKeys: JSON.stringify(this.undoKeys),
      redoKeys: JSON.stringify(this.redoKeys),
    };

    console.log(this.undoKeys);
    console.log(this.redoKeys);
    localStorage.setItem(savefile, JSON.stringify(data));
  }

  loadGame(savefile: string) {
    const data: SaveData = JSON.parse(localStorage.getItem(savefile)!);
    this.gridCells = JSON.parse(data.gridData);
    this.currentSunLevel = parseInt(data.sunLevel);
    this.collectedCrops = new Map(JSON.parse(data.cropInventory));
    this.playerStartingPosition = JSON.parse(data.playerPos);
    this.drawGrid();

    const cropDataMap = new Map(JSON.parse(data.cropMap));
    cropDataMap.forEach((value: any, key: any) => {
      const newPlant = new Crop(
        this,
        value.x,
        value.y,
        value.cropOption,
        value.cropLevel,
      )
        .setOrigin(0, 0)
        .setScale(2);
      this.cropMap.set(key, newPlant);
    });

    const undoDataMap = new Map(JSON.parse(data.undoMap));
    undoDataMap.forEach((value: any, key: any) => {
      const newPlant = new Crop(
        this,
        value.x,
        value.y,
        value.cropOption,
        value.cropLevel,
      )
        .setOrigin(0, 0)
        .setScale(2)
        .setVisible(false); // idk how but this works
      this.undoMap.set(key, newPlant);
    });

    this.undoKeys = JSON.parse(data.undoKeys);
    this.redoKeys = JSON.parse(data.redoKeys);
  }

  create() {
    // add keyboard keys
    this.right = this.#addKey("RIGHT");
    this.left = this.#addKey("LEFT");
    this.up = this.#addKey("UP");
    this.down = this.#addKey("DOWN");
    this.movementInputs = [this.right, this.left, this.up, this.down];
    this.placeCrop1 = this.#addKey("ONE");
    this.placeCrop2 = this.#addKey("TWO");
    this.placeCrop3 = this.#addKey("THREE");
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

    // set world bounds so player cannot move outside of them
    this.physics.world.setBounds(
      0,
      0,
      this.game.config.width as number,
      (this.game.config.height as number) - uIBarHeight,
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
    } else if (this.loadingFrom! == "autosave") {
      this.loadGame(this.loadingFrom);
    } else {
      // LOAD FROM NUMBERED SAVE FILE (savefile01, savefile02, savefile03)
      this.loadGame(this.loadingFrom!);
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
        "[←],[↑],[→],[↓] - Move\n[1] - Plant Strawberry, [2] - Plant Potato, [3] Plant Corn\n[H] - Harvest\n[S] - Sleep (Progress Turn)\n[Z] - Undo\n[X] - Redo\n[F1] - Save (File 01), [F2] - Save (File 02), [F3] - Save (File 03)\n[ESC] Return to Menu\nCurrent Objective: Harvet 5 Starberries",
        { color: "0x000000" },
      )
      .setOrigin(0, 0);

    this.statusText = this.add
      .text(
        0,
        (this.game.config.height as number) - uIBarHeight / 2,
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

      this.displayCurrentCellStatus();
      this.CropStatus();


      if (Phaser.Input.Keyboard.JustDown(this.placeCrop1!)) {
        this.plant(cropOptions[0]);
      }
      if (Phaser.Input.Keyboard.JustDown(this.placeCrop2!)) {
        this.plant(cropOptions[1]);
      }
      if (Phaser.Input.Keyboard.JustDown(this.placeCrop3!)) {
        this.plant(cropOptions[2]);
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
        this.undoPlant();
      } else if (Phaser.Input.Keyboard.JustDown(this.redo!)) {
        this.commandManager.redoCommand();
        this.redoPlant();
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

  addToUndoMap(newMap: Map<string, Crop | null>) {
    this.undoMap.clear();
    this.undoMap = new Map(newMap);
  }

  undoPlant() {
    const key = this.undoKeys.pop();
    const currCrop = this.cropMap.get(JSON.stringify(key));
    console.log(currCrop);
    if (currCrop != null) {
      this.cropMap.set(JSON.stringify(key), null);
      currCrop.destroy();
      this.redoKeys.push(key!);
    }
  }

  redoPlant() {
    const key = this.redoKeys.pop();
    const currCrop = this.undoMap.get(JSON.stringify(key));

    if (currCrop != null) {
      const index = this.findOption(currCrop.cropData?.cropName!);
      console.log(index);
      const newPlant = new Crop(
        this,
        currCrop.x,
        currCrop.y,
        cropOptions[index],
        1,
      )
        .setOrigin(0, 0)
        .setScale(2);
      this.cropMap.set(JSON.stringify(key), newPlant);
      this.undoKeys.push(key!);
    }
  }

  findOption(cropName: string): number {
    for (let i = 0; i < cropOptions.length; i++) {
      console.log(cropName);
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

      this.cropMap.set(JSON.stringify(key), newPlant);
      //this.moveCommand(this.player!.x, this.player!.y);
      this.addToUndoMap(this.cropMap);
      this.undoKeys.push(key);
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
        console.log();
      }
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
    for (
      let x = 0;
      x < (this.game.config.width as number) / gridCellWidth;
      x++
    ) {
      const currCol: CellData[] = [];
      for (
        let y = 0;
        y <
        ((this.game.config.height as number) - uIBarHeight) / gridCellHeight;
        y++
      ) {
        const currX = x * gridCellWidth;
        const currY = y * gridCellHeight;
        currCol.push({
          x: currX,
          y: currY,
          waterLevel: randomInt(1, 5),
        });
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

  growPlants() {
    this.cropMap.forEach((newCrop, key) => {
      if (newCrop != null) {
        // get water level of cell
        const cell = JSON.parse(key);
        const cellWaterLevel = this.gridCells![cell.x][cell.y].waterLevel;
        // get list of crops near this one
        const adjacentCrops = this.getAdjacentCrops(cell);
        console.log(adjacentCrops);
        newCrop.grow(cellWaterLevel, this.currentSunLevel!, adjacentCrops);
      }
    });
  }

  getAdjacentCrops(cell: CellData): string[] {
    const adjacentCrops: string[] = [];
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
      const crop = this.cropMap.get(JSON.stringify(c));
      if (crop != null) {
        adjacentCrops.push(crop.getPlantName());
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
      if (
        currCrop.checkNutrients(
          this.currentSunLevel!,
          this.gridCells![currCell!.x][currCell!.y].waterLevel,
          this.getAdjacentCrops(this.gridCells![currCell!.x][currCell!.y]),
        )
      ) {
        this.statusText!.text += "Crop Can Grow!\n";
      } else {
        this.statusText!.text += "Crop Cannot Grow!\n";
      }
    } else {
      this.statusText!.text += "No Crop In Cell\n";
    }
  }

  CropStatus() {
    this.cropsText!.text ="Harvest result: ";
    this.cropsText!.text += "Strawberry "; 
    this.cropsText!.text += this.collectedCrops.get("Strawberry");  
    this.cropsText!.text += " Potato "; 
    this.cropsText!.text += this.collectedCrops.get("Potato");  
    this.cropsText!.text += " Corn "; 
    this.cropsText!.text += this.collectedCrops.get("Corn");  
    //}
  }
}



function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
