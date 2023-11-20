import * as Phaser from "phaser";
import Menu from "./scenes/Menu";
import Load from "./scenes/Load";
import Play from "./scenes/Play";
//import PlantTest from "./scenes/tests/PlantTest";

const config: Phaser.Types.Core.GameConfig = {
  width: 640,
  height: 480,
  scene: [Load, Menu, Play],
  //scene: [PlantTest],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
};

document.title = "CMPM 121- Final Project";
new Phaser.Game(config);
