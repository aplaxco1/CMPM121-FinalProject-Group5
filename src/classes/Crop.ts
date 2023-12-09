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
  cropNameStrings: { en: string; cn: string; ar: string };
  maxGrowthLevel: number;
  sunLevel: number;
  waterLevel: number;
  canGrow(growthcontext: GrowthContext): boolean;
}

export const cropOptions: CropOption[] = [
  {
    cropName: "Strawberry",
    cropNameStrings: { en: "Strawberry", cn: "草莓", ar: "الفراولة" },
    maxGrowthLevel: 6,
    sunLevel: 2,
    waterLevel: 3,
    canGrow(growthContext): boolean {
      // can only grow if next to at least two other strawberries
      let nearbyStrawberries = 0;
      for (let cell of growthContext.nearbyCells) {
        if (cell.crop != null && cell.crop.cropName == this.cropName) {
          nearbyStrawberries += 1;
        }
      }
      if (
        growthContext.globalSunLevel >= this.sunLevel &&
        growthContext.cellWaterLevel >= this.waterLevel &&
        nearbyStrawberries >= 2
      ) {
        return true;
      } else {
        return false;
      }
    },
  },
  {
    cropName: "Potato",
    cropNameStrings: { en: "Potato", cn: "土豆", ar: "البطاطس" },
    maxGrowthLevel: 6,
    sunLevel: 3,
    waterLevel: 4,
    canGrow(growthContext): boolean {
      // can only grow if ONLY potatoes near it
      let onlyPotatoes: boolean = true;
      for (let cell of growthContext.nearbyCells) {
        if (cell.crop != null && cell.crop.cropName != this.cropName) {
          onlyPotatoes = false;
          break;
        }
      }
      if (
        growthContext.globalSunLevel >= this.sunLevel &&
        growthContext.cellWaterLevel >= this.waterLevel &&
        onlyPotatoes
      ) {
        return true;
      } else {
        return false;
      }
    },
  },
  {
    cropName: "Corn",
    cropNameStrings: { en: "Corn", cn: "玉米", ar: "حبوب ذرة" },
    maxGrowthLevel: 6,
    sunLevel: 4,
    waterLevel: 2,
    canGrow(growthContext): boolean {
      // can only grow if no plants nearby
      let enoughSpace: boolean = true;
      for (let cell of growthContext.nearbyCells) {
        if (cell.crop != null) {
          enoughSpace = false;
          break;
        }
      }
      if (
        growthContext.globalSunLevel >= this.sunLevel &&
        growthContext.cellWaterLevel >= this.waterLevel &&
        enoughSpace
      ) {
        return true;
      } else {
        return false;
      }
    },
  },
];

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
