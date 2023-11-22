import * as Phaser from "phaser";
import Player from "../classes/Player.ts";
import { Crop, cropOption } from "../classes/Crop.ts";

const gridCellWidth: number = 60;
const gridCellHeight: number = 60;
const uIBarHeight: number = 120;

const cropOptions: cropOption[] = [
  {
    cropName: "Strawberry",
    growthRate: 5,
    sunLevel: 2,
    waterLevel: 3,
    spaceNeeded: 0,
    cropToAvoid: "Potato",
  },
  {
    cropName: "Potato",
    growthRate: 4,
    sunLevel: 3,
    waterLevel: 4,
    spaceNeeded: 1,
    cropToAvoid: "",
  },
  {
    cropName: "Corn",
    growthRate: 6,
    sunLevel: 4,
    waterLevel: 2,
    spaceNeeded: 1,
    cropToAvoid: "Strawberry",
  },
];

// TEMPORARY CROP WHILE IN PROGRESS
// const stawberry: cropOption = {
//   cropName: "Strawberry",
//   growthRate: 5,
//   sunLevel: 2,
//   waterLevel: 3,
//   spaceNeeded: 0,
//   cropToAvoid: "Potato",
// };

console.log(cropOptions);

export default class Play extends Phaser.Scene {
  // gridCells cells stores the x, y position for each [row][col] cell in the game
  gridCells?: { x: number; y: number }[][] = [];
  // plantMap stores whatever plant exists at the current [row][col] grid cell
  cropMap: Map<string, Crop | null> = new Map();
  player?: Player;
  collectedCrops: Map<string, number> = new Map(); // to check win condition

  // current global conditions across all cells
  currentSunLevel?: number;
  currentWaterLevel?: number;
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

  // UI text
  textConfig = {
    align: "center",
    fontSize: "28px",
  };
  winText?: Phaser.GameObjects.Text;
  controlsText?: Phaser.GameObjects.Text;

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
    this.collect = this.#addKey("SPACE");
    this.sleep = this.#addKey("S");
    this.movementInputs = [this.right, this.left, this.up, this.down];

    // set world bounds so player cannot move outside of them
    this.physics.world.setBounds(
      0,
      0,
      this.game.config.width as number,
      (this.game.config.height as number) - uIBarHeight,
    );

    // randomize global sun and water levels
    this.currentWaterLevel = 0;
    this.randomizeConditions();
    console.log(
      "Sun Level = " + this.currentSunLevel,
      "Water Level = " + this.currentWaterLevel,
    );

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
        "[←],[↑],[→],[↓] - Move\n[1] - Plant Strawberry, [2] - Plant Potato, [3] Plant Corn\n[SPACE] - Harvest\n[S] - Sleep (Progress Turn)\n\nCurrent Objective: Harvet 5 Starberries",
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

      // plant a crop
      // if (this.place!.isDown) {
      //   this.plant(stawberry);
      // }
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

      if (this.collect!.isDown) {
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
    if (
      !this.cropMap.get(JSON.stringify(pos)) ||
      this.cropMap.get(JSON.stringify(pos)) == null
    ) {
      const newPlant = new Crop(this, pos.x, pos.y, crop)
        .setOrigin(0, 0)
        .setScale(2);
      this.cropMap.set(JSON.stringify(pos), newPlant);
    }
  }

  collectPlant() {
    const pos =
      this.gridCells![this.player!.currCell!.x][this.player!.currCell!.y];
    const currCrop = this.cropMap.get(JSON.stringify(pos));
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
      this.cropMap.set(JSON.stringify(pos), null);
      currCrop.destroy();
    }
  }

  fadeIn() {
    this.cameras.main.fadeIn(1000);
  }
  playerWake() {
    this.randomizeConditions();
    this.growPlants();
    console.log(
      "Sun Level = " + this.currentSunLevel,
      "Water Level = " + this.currentWaterLevel,
    );
    this.sleeping = false;
  }

  drawGrid() {
    for (
      let x = 0;
      x < (this.game.config.width as number) / gridCellWidth;
      x++
    ) {
      const currCol: { x: number; y: number }[] = [];
      for (
        let y = 0;
        y <
        ((this.game.config.height as number) - uIBarHeight) / gridCellHeight;
        y++
      ) {
        const currX = x * gridCellWidth;
        const currY = y * gridCellHeight;
        currCol.push({ x: currX, y: currY });
        const cellRect = this.add
          .rectangle(currX, currY, gridCellWidth, gridCellHeight, 0x34ba58)
          .setOrigin(0, 0);
        cellRect.isStroked = true;
      }
      this.gridCells?.push(currCol);
    }
  }

  growPlants() {
    this.cropMap.forEach((newCrop) => {
      if (newCrop != null) {
        newCrop.grow(this.currentWaterLevel!, this.currentSunLevel!);
      }
    });
  }

  randomizeConditions() {
    this.currentSunLevel = randomInt(1, 5);
    if (Math.random() < 0.3) {
      this.currentWaterLevel = randomInt(3, 5);
      console.log("It rained!");
    } else if (this.currentWaterLevel! > 1) {
      this.currentWaterLevel! -= 1;
    }
  }
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * max + min);
}
