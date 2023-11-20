import * as Phaser from "phaser";

export default class Player extends Phaser.Physics.Arcade.Sprite {
  cellWidth?: number;
  cellHeight?: number;
  currCell?: { x: number; y: number };
  moveSpeed: number = 200;

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
    this.body!.setSize(cellWidth / 3, cellHeight / 3);
    this.setScale(3);
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
  }

  setCurrCell() {
    let x = Math.floor(this.x / this.cellWidth!);
    let y = Math.floor(this.y / this.cellHeight!);
    this.currCell = { x: x, y: y };
  }

  moveLeft() {
    if (!this.body!.blocked.left) {
      this.setVelocityX(-this.moveSpeed);
    }
  }

  moveRight() {
    if (!this.body!.blocked.right) {
      this.setVelocityX(this.moveSpeed);
    }
  }

  moveUp() {
    if (!this.body!.blocked.up) {
      this.setVelocityY(-this.moveSpeed);
    }
  }

  moveDown() {
    if (!this.body!.blocked.down) {
      this.setVelocityY(this.moveSpeed);
    }
  }

  stopMoving() {
    this.setVelocityX(0);
    this.setVelocityY(0);
  }
}
