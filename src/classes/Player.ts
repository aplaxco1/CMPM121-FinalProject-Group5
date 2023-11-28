import * as Phaser from "phaser";

export default class Player extends Phaser.Physics.Arcade.Sprite {
  cellWidth?: number;
  cellHeight?: number;
  currCell?: { x: number; y: number };
  moveSpeed: number = 200;
  lastKnownDirection: string = "down";

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
    this.body!.setSize(cellWidth / 1.5, cellHeight / 1.5);
    this.setScale(1.5);
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
    this.lastKnownDirection = "left";
  }

  moveRight() {
    if (!this.body!.blocked.right) {
      this.setVelocityX(this.moveSpeed);
    }
    this.anims.play("walk_right", true);
    this.lastKnownDirection = "right";
  }

  moveUp() {
    if (!this.body!.blocked.up) {
      this.setVelocityY(-this.moveSpeed);
    }
    this.anims.play("walk_up", true);
    this.lastKnownDirection = "up";
  }

  moveDown() {
    if (!this.body!.blocked.down) {
      this.setVelocityY(this.moveSpeed);
    }
    this.anims.play("walk_down", true);
    this.lastKnownDirection = "down";
  }

  stopMoving() {
    this.setVelocityX(0);
    this.setVelocityY(0);
    this.anims.play("idle_" + this.lastKnownDirection, true);
  }
}
