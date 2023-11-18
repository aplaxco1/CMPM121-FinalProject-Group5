import * as Phaser from "phaser";

export default class Menu extends Phaser.Scene {
  title: Phaser.GameObjects.Text | null = null;

  constructor() {
    super("menu");
  }

  create() {
    this.title = this.add.text(this.game.config.width as number / 2, this.game.config.height as number / 2, "Game Title").setOrigin(0.5);
  }
}
