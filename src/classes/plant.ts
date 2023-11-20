export class Plant {
  plantName: string;
  growthRate: number;
  nutrientsNeeded: number;
  growthLevel: number = 0;

  constructor(
    newPlantName: string,
    newGrowthRate: number,
    newNutrientsNeeded: number,
  ) {
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
