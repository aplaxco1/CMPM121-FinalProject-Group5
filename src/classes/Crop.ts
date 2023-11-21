interface cropOption {
  cropName: string;
  growthRate: number;
  sunLevel: number;
  waterLevel: number;
  spaceNeeded: number;
  cropToAvoid: string;
}

export class Crop extends Phaser.GameObjects.Sprite {
  cropData?: cropOption;
  growthLevel: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    crop: cropOption,
  ) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setSize(30, 30);

    this.cropData = crop;
  }

  getPlantName(): string {
    return this.cropData!.cropName;
  }

  getGrowthRate(): number {
    return this.cropData!.growthRate;
  }

  getnutrientsNeeded(): { sunLevel: number; waterLevel: number } {
    return {
      sunLevel: this.cropData!.sunLevel,
      waterLevel: this.cropData!.waterLevel,
    };
  }

  getGrowthLevel(): number {
    return this.growthLevel;
  }

  increaseGrowthLevel(): void {}
}
