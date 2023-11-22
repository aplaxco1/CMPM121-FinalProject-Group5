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
    //scene.physics.add.existing(this.cropSprite);
    this.setSize(30, 30);
    this.cropAnimation(scene);
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
    } else {
      this.growthLevel++;
    }
  }

  checkNutrients(sun: number, water: number): boolean {
    if (sun >= this.cropData!.sunLevel && water >= this.cropData!.waterLevel) {
      return true;
    } else {
      return false;
    }
  }

  grow(water: number, sun: number): void {
    if (this.checkNutrients(sun, water)) {
      this.increaseGrowthLevel();
    }
    console.log(this.growthLevel);
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
