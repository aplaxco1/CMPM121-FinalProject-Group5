import Player from "./Player";
import { Crop } from "./Crop";

export interface Command {
  execute(): void;
  undo(): void;
}

export class PlantCommand implements Command {
  cropMap: Map<string, Crop>;

  constructor(newCropMap: Map<string, Crop>) {
    this.cropMap = newCropMap;
  }

  execute(): void {}

  undo(): void {}
}

export class MoveCommand implements Command {
  player: Player;
  x: number;
  y: number;
  prevX: number;
  prevY: number;

  constructor(newPlayer: Player, newX: number, newY: number) {
    this.player = newPlayer;
    this.x = this.player.x;
    this.y = this.player.y;

    this.prevX = newX;
    this.prevY = newY;
  }

  execute(): void {
    this.player.setPosition(this.x, this.y);
  }

  undo(): void {
    this.player.setPosition(this.x, this.y);
  }
}

export class CommandManager {
  comHistory: any;
  undoStack: any;

  constructor() {
    this.comHistory = [];
    this.undoStack = [];
  }

  executeCommand(command: Command) {
    command.execute();
    this.comHistory.push(command);
    this.undoStack = []; // hold off for now
  }

  undoCommand() {
    if (this.comHistory.length > 0) {
      const command = this.comHistory.pop();
      command.undo();
      this.undoStack.push(command);
    }
  }

  redoCommand() {
    if (this.undoStack.length > 0) {
      const command = this.undoStack.pop();
      command.execute();
      this.comHistory.push(command);
    }
  }
}
