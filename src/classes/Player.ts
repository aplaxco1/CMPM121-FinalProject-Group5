import * as Phaser from "phaser";

export default class Player extends Phaser.Physics.Arcade.Sprite {
  cellWidth?: number;
  cellHeight?: number;
  currCell?: { x: number; y: number };

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    cellWidth: number,
    cellHeight: number,
  ) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.anims.play("idle_down");
    this.setScale(3);
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
  }

  setCurrCell() {
    let x = Math.floor(this.x / this.cellWidth!);
    let y = Math.floor(this.y / this.cellHeight!);
    this.currCell = { x: x, y: y };
  }

  move(x: number, y: number) {
    this.x += x;
    this.y += y;
    this.setCurrCell();
    console.log(this.currCell);
  }
}
