import * as Phaser from "phaser";
import Player from "../classes/Player.ts";
import { Crop, cropOption } from "../classes/Crop.ts";

const gridCellWidth: number = 60;
const gridCellHeight: number = 60;
const uIBarHeight: number = 180;

interface cellData {
  x: number;
  y: number;
  waterLevel: number;
}

const cropOptions: cropOption[] = [
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

export default class Play extends Phaser.Scene {
  // gridCells cells stores the x, y position for each [row][col] cell in the game
  gridCells?: cellData[][] = [];
  // plantMap stores whatever plant exists at the current [row][col] grid cell
  cropMap: Map<string, Crop | null> = new Map();
  player?: Player;
  collectedCrops: Map<string, number> = new Map(); // to check win condition

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

  // UI text
  textConfig = {
    align: "center",
    fontSize: "22px",
  };
  winText?: Phaser.GameObjects.Text;
  controlsText?: Phaser.GameObjects.Text;
  statusText?: Phaser.GameObjects.Text;

  constructor() {
    super("play");
  }

  #addKey(
    name: keyof typeof Phaser.Input.Keyboard.KeyCodes,
  ): Phaser.Input.Keyboard.Key {
    return this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes[name]);
  }

  create() {
    // add keyboard keys
    this.right = this.#addKey("RIGHT");
    this.left = this.#addKey("LEFT");
    this.up = this.#addKey("UP");
    this.down = this.#addKey("DOWN");
    //this.place = this.#addKey("SPACE");
    this.placeCrop1 = this.#addKey("ONE");
    this.placeCrop2 = this.#addKey("TWO");
    this.placeCrop3 = this.#addKey("THREE");
    this.collect = this.#addKey("H");
    this.restart = this.#addKey("SPACE");
    this.sleep = this.#addKey("S");
    this.movementInputs = [this.right, this.left, this.up, this.down];

    // set world bounds so player cannot move outside of them
    this.physics.world.setBounds(
      0,
      0,
      this.game.config.width as number,
      (this.game.config.height as number) - uIBarHeight,
    );

    // randomize global sun and water level
    this.randomizeConditions();
    console.log("Sun Level = " + this.currentSunLevel);

    // initialize collected crops to zero
    for (let crop of cropOptions) {
      this.collectedCrops.set(crop.cropName, 0);
    }

    // draw grid
    this.drawGrid();

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
        "[←],[↑],[→],[↓] - Move\n[1] - Plant Strawberry, [2] - Plant Potato, [3] Plant Corn\n[H] - Harvest\n[S] - Sleep (Progress Turn)\nCurrent Objective: Harvet 5 Starberries",
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

    // create player
    this.player = new Player(
      this,
      30,
      30,
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

      if (this.placeCrop1!.isDown) {
        this.plant(cropOptions[0]);
      }
      if (this.placeCrop2!.isDown) {
        this.plant(cropOptions[1]);
      }
      if (this.placeCrop3!.isDown) {
        this.plant(cropOptions[2]);
      }

      // collect a crop
      if (this.collect!.isDown) {
        this.collectPlant();
      }

      // progress turn
      if (Phaser.Input.Keyboard.JustDown(this.sleep!)) {
        this.sleeping = true;
        this.player!.stopMoving();
        this.cameras.main.fadeOut(1000);
        this.time.delayedCall(1000, this.fadeIn, [], this);
        this.time.delayedCall(2000, this.playerWake, [], this);
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

  plant(crop: cropOption) {
    const pos =
      this.gridCells![this.player!.currCell!.x][this.player!.currCell!.y];
    const key = { x: this.player!.currCell!.x, y: this.player!.currCell!.y };
    if (
      !this.cropMap.get(JSON.stringify(key)) ||
      this.cropMap.get(JSON.stringify(key)) == null
    ) {
      const newPlant = new Crop(this, pos.x, pos.y, crop)
        .setOrigin(0, 0)
        .setScale(2);
      this.cropMap.set(JSON.stringify(key), newPlant);
    }
  }

  collectPlant() {
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
    console.log("Sun Level = " + this.currentSunLevel);
    this.sleeping = false;
  }

  drawGrid() {
    for (
      let x = 0;
      x < (this.game.config.width as number) / gridCellWidth;
      x++
    ) {
      const currCol: cellData[] = [];
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
        const cellRect = this.add
          .rectangle(currX, currY, gridCellWidth, gridCellHeight, 0x34ba58)
          .setOrigin(0, 0);
        cellRect.isStroked = true;
      }
      this.gridCells?.push(currCol);
    }
  }

  growPlants() {
    this.cropMap.forEach((newCrop, key) => {
      if (newCrop != null) {
        // get water level of cell
        const cell = JSON.parse(key);
        const cellWaterLevel = this.gridCells![cell.x][cell.y].waterLevel;
        console.log(
          "Cell " + [cell.x, cell.y] + " Water Level = " + cellWaterLevel,
        );
        // get list of crops near this one
        let adjacentCrops = this.getAdjacentCrops(cell);
        console.log(adjacentCrops);
        newCrop.grow(cellWaterLevel, this.currentSunLevel!, adjacentCrops);
      }
    });
  }

  getAdjacentCrops(cell: cellData): string[] {
    let adjacentCrops: string[] = [];
    let nearbyCells = [
      { x: cell.x, y: cell.y - 1 },
      { x: cell.x, y: cell.y + 1 },
      { x: cell.x - 1, y: cell.y },
      { x: cell.x + 1, y: cell.y },
      { x: cell.x - 1, y: cell.y - 1 },
      { x: cell.x - 1, y: cell.y + 1 },
      { x: cell.x + 1, y: cell.y - 1 },
      { x: cell.x + 1, y: cell.y + 1 },
    ];
    for (let c of nearbyCells) {
      let crop = this.cropMap.get(JSON.stringify(c));
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
    for (let col of this.gridCells!) {
      for (let cell of col) {
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
    let currCell = this.player!.currCell;
    this.statusText!.text += currCell!.x + ", " + currCell!.y + "\n";
    this.statusText!.text += "Sun Level = " + this.currentSunLevel + "\n";
    this.statusText!.text +=
      "Cell Water Level = " +
      this.gridCells![currCell!.x][currCell!.y].waterLevel +
      "\n";
    let currCrop = this.cropMap.get(JSON.stringify(currCell));
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
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
