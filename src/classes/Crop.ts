export interface cropOption {
  cropName: string;
  growthRate: number;
  sunLevel: number;
  waterLevel: number;
  spaceNeeded: number;
  cropToAvoid: string;
}

export class Crop extends Phaser.GameObjects.Sprite {
  cropData?: cropOption;
  cropSprite: Phaser.GameObjects.Sprite;
  growthLevel: number = 1;

  constructor(scene: Phaser.Scene, x: number, y: number, crop: cropOption) {
    const texture = "crop_atlas";
    const frame = crop.cropName + "1";

    super(scene, x, y, texture, frame);
    this.cropSprite = scene.add.existing(this);
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

  increaseGrowthLevel(): void {
    const maxGrowthLevel = 6;

    if (this.growthLevel >= maxGrowthLevel) {
      this.growthLevel = maxGrowthLevel;
      console.log(this.growthLevel);
    } else {
      this.growthLevel++;
    }
  }

  grow(): void {
    this.increaseGrowthLevel();
    const frame = this.cropData!.cropName + this.growthLevel.toString();
    this.cropSprite.setFrame(frame);
  }
}
