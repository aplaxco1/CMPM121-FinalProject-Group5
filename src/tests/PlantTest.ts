import * as Phaser from "phaser";
import { Plant } from "../classes/plant.ts";

export default class PlantTest extends Phaser.Scene {
  constructor() {
    super("planttest");
  }

  preload(): void {
    let cornURL = "/assets/tempemojidonotuse.png";
    this.load.image("tree", cornURL);
  } // sprite is preloaded

  create(): void {
    // Plant(scene, x, y, texture, plantName, growthRate, nutrientsNeeded);
    let tree = new Plant(this, 100, 100, "tree", "Tree", 1, 1).setScale(0.15);
    let tree2 = new Plant(this, 300, 300, "tree", "Tree 2", 1, 1).setScale(
      0.15,
    );
    console.log(tree);
    console.log(tree2); // for commit
  }
}
