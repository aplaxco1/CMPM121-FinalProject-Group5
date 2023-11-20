import * as Phaser from "phaser";

export default class Menu extends Phaser.Scene {
  title?: Phaser.GameObjects.Text;
  start?: Phaser.Input.Keyboard.Key;

  constructor() {
    super("menu");
  }

  #addKey(
    name: keyof typeof Phaser.Input.Keyboard.KeyCodes,
  ): Phaser.Input.Keyboard.Key {
    return this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes[name]);
  }

  create() {
    let menuConfig = {
      align: "center",
      fontSize: "28px",
    };

    this.title = this.add
      .text(
        (this.game.config.width as number) / 2,
        (this.game.config.height as number) / 2,
        "CMPM 121 - Final Project\nGardening Game\n\nPress [SPACE] to play.",
        menuConfig,
      )
      .setOrigin(0.5);
    this.start = this.#addKey("SPACE");
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.start!)) {
      this.scene.stop();
      this.scene.start("play");
    }
  }
}
