export class Plant extends Phaser.GameObjects.Sprite {
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
