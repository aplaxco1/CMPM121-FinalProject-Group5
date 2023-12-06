export interface CellContext {
  cellWaterLevel: number;
  crop: CropOption | null;
}

export interface GrowthContext {
  globalSunLevel: number;
  cellWaterLevel: number;
  nearbyCells: CellContext[];
}

export interface CropOption {
  cropName: string;
  maxGrowthLevel: number;
  sunLevel: number;
  waterLevel: number;
  canGrow(growthcontext: GrowthContext): boolean;
}

export class Crop extends Phaser.GameObjects.Sprite {
  cropData?: CropOption;
  cropSprite: Phaser.GameObjects.Sprite;
  growthLevel: number = 1;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    crop: CropOption,
    level: number,
  ) {
    const texture = "crop_atlas";
    const frame = crop.cropName + level;

    super(scene, x, y, texture, frame);
    this.growthLevel = level;
    this.cropSprite = scene.add.existing(this);
    scene.physics.add.existing(this);
    //scene.physics.add.existing(this.cropSprite);
    this.setSize(30, 30);
    this.cropAnimation(scene);
    this.cropData = crop;
  }

  getPlantName(): string {
    return this.cropData!.cropName;
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
    this.growthLevel += 1;
    if (this.growthLevel >= this.cropData!.maxGrowthLevel) {
      this.growthLevel = this.cropData!.maxGrowthLevel;
    }
  }

  grow(growthContext: GrowthContext): void {
    if (this.cropData!.canGrow(growthContext)) {
      this.increaseGrowthLevel();
    }
    const frame = this.cropData!.cropName + this.growthLevel.toString();
    this.cropSprite.setFrame(frame);
  }

  cropAnimation(scene: Phaser.Scene): void {
    scene.tweens.add({
      targets: this.cropSprite,
      y: { from: this.y, to: this.y - 2 },
      yoyo: true,
      duration: 1000,
      repeat: -1,
    });
  }
}
