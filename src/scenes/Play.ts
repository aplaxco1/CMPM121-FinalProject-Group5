import * as Phaser from "phaser";
import Player from "../classes/Player.ts";

const gridCellWidth: number = 60;
const gridCellHeight: number = 60;
const UIBarHeight: number = 120;

export default class Play extends Phaser.Scene {
  // gridCells cells stores the x, y position for each [row][col] cell in the game
  gridCells?: { x: number; y: number }[][] = [];
  player?: Player;

  // list of keyboard inputs
  movementInputs?: Phaser.Input.Keyboard.Key[];
  right?: Phaser.Input.Keyboard.Key;
  left?: Phaser.Input.Keyboard.Key;
  up?: Phaser.Input.Keyboard.Key;
  down?: Phaser.Input.Keyboard.Key;

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
    this.movementInputs = [this.right, this.left, this.up, this.down];

    // set world bounds so player cannot move outside of them
    this.physics.world.setBounds(
      0,
      0,
      this.game.config.width as number,
      (this.game.config.height as number) - UIBarHeight,
    );

    // draw grid
    this.drawGrid();

    // draw UI bar
    this.add
      .rectangle(
        0,
        (this.game.config.height as number) - UIBarHeight,
        this.game.config.width as number,
        UIBarHeight,
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
    let canMove = this.canMove();
    if (this.right!.isDown && canMove) {
      this.player!.move(1, 0);
    }
    if (this.left!.isDown && canMove) {
      this.player!.move(-1, 0);
    }
    if (this.up!.isDown && canMove) {
      this.player!.move(0, -1);
    }
    if (this.down!.isDown && canMove) {
      this.player!.move(0, 1);
    }
  }

  // prevents diagonal movement
  canMove(): boolean {
    let count = 0;
    for (let key of this.movementInputs!) {
      if (key.isDown) {
        count += 1;
      }
    }
    if (count > 1) {
      return false;
    }
    return true;
  }

  drawGrid() {
    for (
      let x = 0;
      x < (this.game.config.width as number) / gridCellWidth;
      x++
    ) {
      let currCol: { x: number; y: number }[] = [];
      for (
        let y = 0;
        y <
        ((this.game.config.height as number) - UIBarHeight) / gridCellHeight;
        y++
      ) {
        let currX = x * gridCellWidth;
        let currY = y * gridCellHeight;
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
