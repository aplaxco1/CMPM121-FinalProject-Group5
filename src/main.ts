import * as Phaser from "phaser";
import Menu from "./scenes/Menu";
//import PlantTest from "./scenes/PlantTest";

const config: Phaser.Types.Core.GameConfig = {
  width: 640,
  height: 480,
  scene: [Menu],
  //scene: [PlantTest],
};

document.title = "CMPM 121- Final Project";

new Phaser.Game(config);
