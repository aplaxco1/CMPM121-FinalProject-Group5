export class Cell {
  static readonly numBytes = 4 + 4 + 4;

  constructor(private dataView: DataView) {}

  get x(): number {
    return this.dataView.getUint32(0);
  }

  set x(i: number) {
    this.dataView.setUint32(0, i);
  }

  get y(): number {
    return this.dataView.getUint32(4);
  }

  set y(i: number) {
    this.dataView.setUint32(4, i);
  }

  get waterLevel(): number {
    return this.dataView.getUint32(8);
  }

  set waterLevel(i: number) {
    this.dataView.setUint32(8, i);
  }
}

export interface CellData {
  x: number;
  y: number;
  waterLevel: number;
}
