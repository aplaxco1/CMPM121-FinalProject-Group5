import * as Phaser from "phaser";
import Player from "../classes/Player.ts";

export default class Play extends Phaser.Scene {
  player?: Player;

  constructor() {
    super("play");
  }

  create() {
    this.player = new Player(
      this,
      (this.game.config.width as number) / 2,
      (this.game.config.height as number) / 2,
      "idle_down",
    ).setOrigin(0.5, 0.5);
  }
}
