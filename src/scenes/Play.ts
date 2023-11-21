import * as Phaser from "phaser";
import Player from "../classes/Player.ts";
import { Crop } from "../classes/Crop.ts";

const gridCellWidth: number = 60;
const gridCellHeight: number = 60;
const uIBarHeight: number = 120;

interface cropOption {
  cropName: string;
  growthRate: number;
  sunLevel: number;
  waterLevel: number;
  spaceNeeded: number;
  cropToAvoid: string;
}

const cropOptions: cropOption[] = [
  {
    cropName: "strawberry",
    growthRate: 5,
    sunLevel: 2,
    waterLevel: 3,
    spaceNeeded: 0,
    cropToAvoid: "potato",
  },
  {
    cropName: "potato",
    growthRate: 4,
    sunLevel: 3,
    waterLevel: 4,
    spaceNeeded: 1,
    cropToAvoid: "",
  },
  {
    cropName: "corn",
    growthRate: 6,
    sunLevel: 4,
    waterLevel: 2,
    spaceNeeded: 1,
    cropToAvoid: "strawberry",
  },
];

// TEMPORARY TREE CROP WHILE IN PROGRESS
const treeCrop: cropOption = {
  cropName: "tree",
  growthRate: 8,
  sunLevel: 2,
  waterLevel: 3,
  spaceNeeded: 2,
  cropToAvoid: "",
};

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
  place?: Phaser.Input.Keyboard.Key;
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
    this.place = this.#addKey("SPACE");
    this.collect = this.#addKey("ENTER");
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
    this.randomizeConditions();
    console.log(
      "Sun Level = " + this.currentSunLevel,
      "Water Level = " + this.currentWaterLevel,
    );

    // initialize collected crops to zero
    this.collectedCrops.set(treeCrop.cropName, 0);

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
    if (this.collectedCrops.get(treeCrop.cropName)! < 5 && !this.sleeping) {
      // simple player movement
      this.movePlayer();

      // plant a crop
      if (this.place!.isDown) {
        this.plant(treeCrop);
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

      if (this.place!.isDown) {
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
      const newPlant = new Crop(this, pos.x, pos.y, crop.cropName, crop)
        .setScale(0.1)
        .setOrigin(0, 0);
      this.cropMap.set(JSON.stringify(pos), newPlant);
    }
  }

  collectPlant() {
    const pos =
      this.gridCells![this.player!.currCell!.x][this.player!.currCell!.y];
    const currCrop = this.cropMap.get(JSON.stringify(pos));
    if (currCrop != null) {
      let cropCount = this.collectedCrops.get(currCrop.getPlantName());
      if (cropCount) {
        cropCount += 1;
      } else {
        cropCount = 1;
      }
      this.collectedCrops.set(currCrop.getPlantName(), cropCount);
      this.cropMap.set(JSON.stringify(pos), null);
      currCrop.destroy();
    }
  }

  fadeIn() {
    this.cameras.main.fadeIn(1000);
  }
  playerWake() {
    // GROW PLANTS HERE ONCE IMPLEMENTED (iterate through map -> grow if not null)
    this.randomizeConditions();
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

  randomizeConditions() {
    this.currentSunLevel = randomInt(1, 5);
    this.currentWaterLevel = randomInt(1, 5);
  }
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * max + min);
}
