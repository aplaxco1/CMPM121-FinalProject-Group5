import * as Phaser from "phaser";
import YAML from "yamljs";
import scenariosURL from "/assets/scenarios.yml?url";
import en from "/assets/en.json?url";
import cn from "/assets/cn.json?url";
import ar from "/assets/ar.json?url";

export interface scenario {
  scenario: string;
  available_crops: string[];
  win_conditions: [string, number][];
  human_instructions: string;
  sun_probability?: number;
  rain_probability?: number;
}

export default class Menu extends Phaser.Scene {
  title?: Phaser.GameObjects.Text;
  start?: Phaser.Input.Keyboard.Key;
  loadAutoSave?: Phaser.Input.Keyboard.Key;
  loadSaveFile01?: Phaser.Input.Keyboard.Key;
  loadSaveFile02?: Phaser.Input.Keyboard.Key;
  loadSaveFile03?: Phaser.Input.Keyboard.Key;

  scenarioData: scenario[] = [];

  currentLang?: any;
  enLang?: any;
  cnLang?: any;
  arLang?: any;

  constructor() {
    super("menu");
  }

  preload() {
    this.load.text("scenarios", scenariosURL);

    // game text in multiple languages
    this.load.text("en", en);
    this.load.text("cn", cn);
    this.load.text("ar", ar);
  }

  #addKey(
    name: keyof typeof Phaser.Input.Keyboard.KeyCodes,
  ): Phaser.Input.Keyboard.Key {
    return this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes[name]);
  }

  create() {
    //localStorage.clear();

    // load all language text
    this.enLang = JSON.parse(this.cache.text.get("en"));
    this.cnLang = JSON.parse(this.cache.text.get("cn"));
    this.arLang = JSON.parse(this.cache.text.get("ar"));

    if (localStorage.getItem("currentLang")) {
      // loads the most recently selected language
      let lang = localStorage.getItem("currentLang");
      if (lang == "en") {
        this.currentLang = this.enLang;
      }
      if (lang == "cn") {
        this.currentLang = this.cnLang;
      }
      if (lang == "ar") {
        this.currentLang = this.arLang;
      }
    } else {
      // default selected language is english
      this.currentLang = this.enLang;
    }

    // load scenario data from external dsl text file
    const details = this.cache.text.get("scenarios");
    const details_json = YAMLtoJSON(details);
    this.scenarioData = JSON.parse(details_json);

    const menuConfig = {
      align: "center",
      fontSize: "26px",
      wordWrap: { width: 700 },
    };

    // all this text still needs to be translated
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

    this.setUpInteractiveButtons();
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.start!)) {
      this.startGame("newgame");
    }
    if (
      Phaser.Input.Keyboard.JustDown(this.loadAutoSave!) &&
      localStorage.getItem("autosave")
    ) {
      this.startGame("autosave");
    }
    if (
      Phaser.Input.Keyboard.JustDown(this.loadSaveFile01!) &&
      localStorage.getItem("savefile01")
    ) {
      this.startGame("savefile01");
    }
    if (
      Phaser.Input.Keyboard.JustDown(this.loadSaveFile02!) &&
      localStorage.getItem("savefile02")
    ) {
      this.startGame("savefile02");
    }
    if (
      Phaser.Input.Keyboard.JustDown(this.loadSaveFile03!) &&
      localStorage.getItem("savefile03")
    ) {
      this.startGame("savefile03");
    }
  }

  startGame(savefile: string) {
    // clear all buttons before returning to menu
    const buttonContainer = document.getElementById("ButtonContainer");
    buttonContainer!.innerHTML = "";
    const languageButtons = document.getElementById("LanguageButtons");
    languageButtons!.innerHTML = "";
    this.scene.stop();
    this.scene.start("play", {
      scenarioData: this.scenarioData,
      savefile: savefile,
      language: this.currentLang!,
    });
  }

  setUpInteractiveButtons() {
    const buttonContainer = document.getElementById("ButtonContainer");
    buttonContainer!.innerHTML = "";
    // these still need to be translated
    const startGameButtons = [
      { text: "Start New Game", savefile: "newgame" },
      { text: "Continue From Last Save", savefile: "autosave" },
      { text: "Load Save 1", savefile: "savefile01" },
      { text: "Load Save 2", savefile: "savefile02" },
      { text: "Load Save 3", savefile: "savefile03" },
    ];
    for (const b of startGameButtons) {
      const startButton = document.createElement("button");
      startButton.innerHTML = b.text;
      startButton.addEventListener("click", () => {
        this.startGame(b.savefile);
      });
      buttonContainer!.append(startButton);
    }

    const languageButtons = document.getElementById("LanguageButtons");
    // button for english
    const enButton = document.createElement("button");
    enButton.innerHTML = "English";
    enButton.addEventListener("click", () => {
      this.currentLang = this.enLang;
      localStorage.setItem("currentLang", "en");
      // reload all text on this page here
    });
    languageButtons!.append(enButton);
    // button for chinese
    const cnButton = document.createElement("button");
    cnButton.innerHTML = "中文";
    cnButton.addEventListener("click", () => {
      this.currentLang = this.cnLang;
      localStorage.setItem("currentLang", "cn");
      // reload all text on this page here
    });
    languageButtons!.append(cnButton);
    // button for arabic
    const arButton = document.createElement("button");
    arButton.innerHTML = "اَلْعَرَبِيَّة";
    arButton.addEventListener("click", () => {
      this.currentLang = this.arLang;
      localStorage.setItem("currentLang", "ar");
      // reload all text on this page here
    });
    languageButtons!.append(arButton);
  }
}

// function to convert yaml text file to json format
function YAMLtoJSON(yamlStr: string) {
  var obj = YAML.parse(yamlStr);
  var jsonStr = JSON.stringify(obj);
  return jsonStr;
}
