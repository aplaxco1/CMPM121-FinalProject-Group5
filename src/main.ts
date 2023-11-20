import * as Phaser from "phaser";
import Menu from "./scenes/Menu";
import Load from "./scenes/Load";
import Play from "./scenes/Play";

const config: Phaser.Types.Core.GameConfig = {
  width: 780,
  height: 720,
  antialias: false,
  scale: {
    // centers game vertically and horizontally
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [Load, Menu, Play],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: true,
    },
  },
};

document.title = "CMPM 121- Final Project";
new Phaser.Game(config);
