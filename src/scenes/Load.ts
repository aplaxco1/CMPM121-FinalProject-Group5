import * as Phaser from "phaser";

import playerspriteURL from "/assets/playersprite.png";
import playerspritemapURL from "/assets/playersprite_map.json?url";
import plantTestURL from "/assets/tempemojidonotuse.png";

export default class Load extends Phaser.Scene {
  constructor() {
    super("load");
  }

  preload() {
    // load player spritesheet
    this.load.atlas("player_atlas", playerspriteURL, playerspritemapURL);
    this.load.image("tree", plantTestURL);
  }

  create() {
    // create player animations
    this.anims.create({
      key: "idle_down",
      frames: this.anims.generateFrameNames("player_atlas", {
        prefix: "down_walk_",
        start: 4,
        end: 4,
        suffix: "",
        zeroPad: 0,
      }),
      frameRate: 10,
      repeat: -1,
    });

    // imediately start menu scene
    this.scene.stop();
    this.scene.start("menu");
  }
}