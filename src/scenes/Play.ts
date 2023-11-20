import * as Phaser from "phaser";
import Player from "../classes/Player.ts";

const gridCellWidth: number = 60;
const gridCellHeight: number = 60;
const UIBarHeight: number = 120;

export default class Play extends Phaser.Scene {
  // gridCells cells stores the x, y position for each [row][col] cell in the game
  gridCells?: { x: number; y: number }[][] = [];
  player?: Player;

  constructor() {
    super("play");
  }

  create() {
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
      (this.game.config.width as number) / 2,
      (this.game.config.height as number) / 2,
      "idle_down",
    ).setOrigin(0.5, 0.5);
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
    console.log(this.gridCells!.length);
    this.gridCells?.forEach((ob) => console.log(ob));
  }
}
