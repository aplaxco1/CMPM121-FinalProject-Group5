import * as Phaser from "phaser";

import player1URL from "/assets/player1.png";
import player1mapURL from "/assets/playersprite_map.json?url";
import plantTestURL from "/assets/tempemojidonotuse.png";
import cropspriteURL from "/assets/crops.png";
import cropspritemapURL from "/assets/cropsprite_arr.json?url";



export default class Load extends Phaser.Scene {
  constructor() {
    super("load");
  }

  preload() {
    // load player spritesheet
    this.load.atlas("player_atlas", player1URL, player1mapURL);
    this.load.atlas("crop_atlas", cropspriteURL, cropspritemapURL);
    this.load.image("tree", plantTestURL);
  }

  create() {
    // create player animations
    this.anims.create({
      key: "idle_down",
      frames: this.anims.generateFrameNames("player_atlas", {
        prefix: "down_walk_",
        start: 1,
        end: 1,
        suffix: "",
        zeroPad: 0,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "walk_down",
      frames: this.anims.generateFrameNames("player_atlas", {
        prefix: "down_walk_",
        start: 1,
        end: 7,
        suffix: "",
        zeroPad: 0,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "idle_up",
      frames: this.anims.generateFrameNames("player_atlas", {
        prefix: "up_walk_",
        start: 1,
        end: 1,
        suffix: "",
        zeroPad: 0,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "walk_up",
      frames: this.anims.generateFrameNames("player_atlas", {
        prefix: "up_walk_",
        start: 1,
        end: 7,
        suffix: "",
        zeroPad: 0,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "idle_left",
      frames: this.anims.generateFrameNames("player_atlas", {
        prefix: "left_walk_",
        start: 1,
        end: 1,
        suffix: "",
        zeroPad: 0,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "walk_left",
      frames: this.anims.generateFrameNames("player_atlas", {
        prefix: "left_walk_",
        start: 1,
        end: 7,
        suffix: "",
        zeroPad: 0,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "idle_right",
      frames: this.anims.generateFrameNames("player_atlas", {
        prefix: "right_walk_",
        start: 1,
        end: 1,
        suffix: "",
        zeroPad: 0,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "walk_right",
      frames: this.anims.generateFrameNames("player_atlas", {
        prefix: "right_walk_",
        start: 1,
        end: 7,
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


