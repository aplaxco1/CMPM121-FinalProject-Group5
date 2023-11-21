export class Crop extends Phaser.GameObjects.Sprite {
  plantName: string;
  growthRate: number;
  nutrientsNeeded: number;
  growthLevel: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,

    newPlantName: string,
    newGrowthRate: number,
    newNutrientsNeeded: number,
  ) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setSize(30, 30);

    this.plantName = newPlantName;
    this.growthRate = newGrowthRate;
    this.nutrientsNeeded = newNutrientsNeeded;
  }

  getPlantName(): string {
    return this.plantName;
  }

  getGrowthRate(): number {
    return this.growthRate;
  }

  getnutrientsNeeded(): number {
    return this.nutrientsNeeded;
  }

  getGrowthLevel(): number {
    return this.growthLevel;
  }

  increaseGrowthLevel(): void {}
}
