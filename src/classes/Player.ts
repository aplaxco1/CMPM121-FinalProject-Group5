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
    const x = Math.floor(this.x / this.cellWidth!);
    const y = Math.floor(this.y / this.cellHeight!);
    this.currCell = { x: x, y: y };
  }

  moveLeft() {
    if (!this.body!.blocked.left) {
      this.setVelocityX(-this.moveSpeed);
    }
    this.anims.play("walk_left", true);
  }

  moveRight() {
    if (!this.body!.blocked.right) {
      this.setVelocityX(this.moveSpeed);
    }
    this.anims.play("walk_right", true);
  }

  moveUp() {
    if (!this.body!.blocked.up) {
      this.setVelocityY(-this.moveSpeed);
    }
    this.anims.play("walk_up", true);
  }

  moveDown() {
    if (!this.body!.blocked.down) {
      this.setVelocityY(this.moveSpeed);
    }
    this.anims.play("walk_down", true);
  }

  stopMoving() {
    this.setVelocityX(0);
    this.setVelocityY(0);
    this.anims.play("idle_down", true);
  }
}
