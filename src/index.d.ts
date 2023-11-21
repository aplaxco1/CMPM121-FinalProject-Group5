declare module "*.png";
declare module "*.json?url";

declare global {
  interface cropOption {
    cropName: string;
    growthRate: number;
    sunLevel: number;
    waterLevel: number;
    spaceNeeded: number;
    cropToAvoid: string;
  }
}

export default global;
