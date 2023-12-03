import * as Phaser from "phaser";
import YAML from "yamljs";
import detailsURL from "/assets/details.yml?url";

export default class Menu extends Phaser.Scene {
  title?: Phaser.GameObjects.Text;
  start?: Phaser.Input.Keyboard.Key;
  loadAutoSave?: Phaser.Input.Keyboard.Key;
  loadSaveFile01?: Phaser.Input.Keyboard.Key;
  loadSaveFile02?: Phaser.Input.Keyboard.Key;
  loadSaveFile03?: Phaser.Input.Keyboard.Key;

  constructor() {
    super("menu");
  }

  preload() {
    this.load.text("details", detailsURL);
  }

  #addKey(
    name: keyof typeof Phaser.Input.Keyboard.KeyCodes,
  ): Phaser.Input.Keyboard.Key {
    return this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes[name]);
  }

  create() {
    //localStorage.clear();

    // testing stuff for external dsl
    const details = this.cache.text.get("details");
    const result_json = YAMLtoJSON(details);
    console.log(result_json);

    const menuConfig = {
      align: "center",
      fontSize: "26px",
      wordWrap: { width: 700 },
    };

    this.title = this.add
      .text(
        (this.game.config.width as number) / 2,
        (this.game.config.height as number) / 2,
        "CMPM 121 - Final Project\nGardening Game\n\n[SPACE] Start New Game\n",
        menuConfig,
      )
      .setOrigin(0.5);
    if (localStorage.getItem("autosave")) {
      this.title.text += "[C] Continue From Last AutoSave\n\n";
    }
    if (localStorage.getItem("savefile01")) {
      const data = JSON.parse(localStorage.getItem("savefile01")!);
      this.title.text += "[1] Save File 01 - [" + data.time + "]\n";
    } else {
      this.title.text += "[1] Save File 01 - [EMPTY]\n";
    }
    if (localStorage.getItem("savefile02")) {
      const data = JSON.parse(localStorage.getItem("savefile02")!);
      this.title.text += "[2] Save File 02 - [" + data.time + "]\n";
    } else {
      this.title.text += "[2] Save File 02 - [EMPTY]\n";
    }
    if (localStorage.getItem("savefile03")) {
      const data = JSON.parse(localStorage.getItem("savefile03")!);
      this.title.text += "[3] Save File 03 - [" + data.time + "]\n";
    } else {
      this.title.text += "[3] Save File 03 - [EMPTY]\n";
    }
    this.start = this.#addKey("SPACE");
    this.loadAutoSave = this.#addKey("C");
    this.loadSaveFile01 = this.#addKey("ONE");
    this.loadSaveFile02 = this.#addKey("TWO");
    this.loadSaveFile03 = this.#addKey("THREE");
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.start!)) {
      this.scene.stop();
      this.scene.start("play", { savefile: "newgame" });
    }
    if (
      Phaser.Input.Keyboard.JustDown(this.loadAutoSave!) &&
      localStorage.getItem("autosave")
    ) {
      this.scene.stop();
      this.scene.start("play", { savefile: "autosave" });
    }
    if (
      Phaser.Input.Keyboard.JustDown(this.loadSaveFile01!) &&
      localStorage.getItem("savefile01")
    ) {
      this.scene.stop();
      this.scene.start("play", { savefile: "savefile01" });
    }
    if (
      Phaser.Input.Keyboard.JustDown(this.loadSaveFile02!) &&
      localStorage.getItem("savefile02")
    ) {
      this.scene.stop();
      this.scene.start("play", { savefile: "savefile02" });
    }
    if (
      Phaser.Input.Keyboard.JustDown(this.loadSaveFile03!) &&
      localStorage.getItem("savefile03")
    ) {
      this.scene.stop();
      this.scene.start("play", { savefile: "savefile03" });
    }
  }
}

// function to convert yaml text file to json format
function YAMLtoJSON(yamlStr: string) {
  var obj = YAML.parse(yamlStr);
  var jsonStr = JSON.stringify(obj);
  return jsonStr;
}
