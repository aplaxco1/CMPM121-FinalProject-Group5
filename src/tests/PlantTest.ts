import { Plant } from "../classes/plant.ts";
import * as Phaser from "phaser";

export default class PlantTest extends Phaser.Scene {
  //cornSprite: Phaser.GameObjects.Sprite | null = null;
  corn: Plant | null = null;

  constructor() {
    super("planttest");
  }

  preload(): void {} // sprite is preloaded

  create(): void {
    this.corn = new Plant("Corn", 1, 1);
    //this.cornSprite = this.add.sprite(100, 100, "corn");
    console.log(this.corn.getPlantName());
  }
}
