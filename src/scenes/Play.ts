import * as Phaser from "phaser";
import Player from "../classes/Player.ts";
import { Crop } from "../classes/Crop.ts";

const gridCellWidth: number = 60;
const gridCellHeight: number = 60;
const uIBarHeight: number = 120;

export default class Play extends Phaser.Scene {
  // gridCells cells stores the x, y position for each [row][col] cell in the game
  gridCells?: { x: number; y: number }[][] = [];
  // plantMap stores whatever plant exists at the current [row][col] grid cell
  plantMap: Map<string, Crop> = new Map();
  player?: Player;

  // list of keyboard inputs
  movementInputs?: Phaser.Input.Keyboard.Key[];
  right?: Phaser.Input.Keyboard.Key;
  left?: Phaser.Input.Keyboard.Key;
  up?: Phaser.Input.Keyboard.Key;
  down?: Phaser.Input.Keyboard.Key;
  // for placing plants
  place?: Phaser.Input.Keyboard.Key;

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

    this.movementInputs = [this.right, this.left, this.up, this.down];

    // set world bounds so player cannot move outside of them
    this.physics.world.setBounds(
      0,
      0,
      this.game.config.width as number,
      (this.game.config.height as number) - uIBarHeight,
    );

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
    // simple player movement
    this.movePlayer();

    if (this.place!.isDown) {
      this.plant("tree");
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

  plant(plant: string) {
    const pos =
      this.gridCells![this.player!.currCell!.x][this.player!.currCell!.y];
    if (!this.plantMap.get(JSON.stringify(pos))) {
      const newPlant = new Crop(this, pos.x, pos.y, plant, plant, 1, 1)
        .setScale(0.1)
        .setOrigin(0, 0);
      this.plantMap.set(JSON.stringify(pos), newPlant);
      console.log(newPlant);
    }
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
}
