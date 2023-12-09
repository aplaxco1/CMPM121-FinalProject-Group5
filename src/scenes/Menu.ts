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
  human_instructions_en: string;
  human_instructions_cn: string;
  human_instructions_ar: string;
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

  currentLang?: string; // either "en", "cn", or "ar"
  numFormat?: string;
  langText?: any; // contains all text data in current language
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
      let lang = localStorage.getItem("currentLang")!;
      this.currentLang = lang;
      if (lang == "en") {
        this.langText = this.enLang;
        this.numFormat = "en-GB";
      }
      if (lang == "cn") {
        this.langText = this.cnLang;
        this.numFormat = "zh-CN";
      }
      if (lang == "ar") {
        this.langText = this.arLang;
        this.numFormat = "ar-SA";
      }
    } else {
      // default selected language is english
      this.langText = this.enLang;
      this.numFormat = "en-GB";
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
        "",
        menuConfig,
      )
      .setOrigin(0.5);

    this.initializeMenuText();
    this.start = this.#addKey("SPACE");
    this.loadAutoSave = this.#addKey("C");
    this.loadSaveFile01 = this.#addKey("ONE");
    this.loadSaveFile02 = this.#addKey("TWO");
    this.loadSaveFile03 = this.#addKey("THREE");

    this.setUpInteractiveButtons();
    this.setUpLangButtons();
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
      languageText: this.langText!,
      numFormat: this.numFormat,
    });
  }

  initializeMenuText() {
    this.title!.text = "";
    this.title!.text += this.langText!.FinalProject + "\n";
    this.title!.text += this.langText!.GardeningGame + "\n\n";
    this.title!.text += this.langText!.StartNewGame + "\n";
    if (localStorage.getItem("autosave")) {
      this.title!.text += this.langText!.ContinueFromSave + "\n";
    }
    if (localStorage.getItem("savefile01")) {
      const data = JSON.parse(localStorage.getItem("savefile01")!);
      const time = this.getTimeForCurrLang(JSON.parse(data.time));
      this.title!.text +=
        "[1] " + this.langText!.savefile01 + " - [" + time + "]\n";
    } else {
      this.title!.text +=
        "[1] " +
        this.langText!.savefile01 +
        " - [" +
        this.langText!.Empty +
        "]\n";
    }
    if (localStorage.getItem("savefile02")) {
      const data = JSON.parse(localStorage.getItem("savefile02")!);
      const time = this.getTimeForCurrLang(JSON.parse(data.time));
      this.title!.text +=
        "[2] " + this.langText!.savefile02 + " - [" + time + "]\n";
    } else {
      this.title!.text +=
        "[2] " +
        this.langText!.savefile02 +
        " - [" +
        this.langText!.Empty +
        "]\n";
    }
    if (localStorage.getItem("savefile03")) {
      const data = JSON.parse(localStorage.getItem("savefile03")!);
      const time = this.getTimeForCurrLang(JSON.parse(data.time));

      this.title!.text +=
        "[3] " + this.langText!.savefile03 + " - [" + time + "]\n";
    } else {
      this.title!.text +=
        "[3] " +
        this.langText!.savefile03 +
        " - [" +
        this.langText!.Empty +
        "]\n";
    }
  }

  setUpInteractiveButtons() {
    const buttonContainer = document.getElementById("ButtonContainer");
    buttonContainer!.innerHTML = "";
    // these still need to be translated
    const startGameButtons = [
      { text: this.langText!.StartNewGame, savefile: "newgame" },
      { text: this.langText!.ContinueFromSave, savefile: "autosave" },
      { text: this.langText.Save1, savefile: "savefile01" },
      { text: this.langText.Save2, savefile: "savefile02" },
      { text: this.langText.Save3, savefile: "savefile03" },
    ];
    for (const b of startGameButtons) {
      const startButton = document.createElement("button");
      startButton.innerHTML = b.text;
      startButton.addEventListener("click", () => {
        this.startGame(b.savefile);
      });
      buttonContainer!.append(startButton);
    }
  }

  setUpLangButtons() {
    const languageButtons = document.getElementById("LanguageButtons");
    // button for english
    const enButton = document.createElement("button");
    enButton.innerHTML = "English";
    enButton.addEventListener("click", () => {
      this.currentLang = "en";
      this.numFormat = "en-GB";
      this.langText = this.enLang;
      localStorage.setItem("currentLang", "en");
      this.initializeMenuText();
      this.setUpInteractiveButtons();
    });
    languageButtons!.append(enButton);
    // button for chinese
    const cnButton = document.createElement("button");
    cnButton.innerHTML = "中文";
    cnButton.addEventListener("click", () => {
      this.currentLang = "cn";
      this.numFormat = "zh-CN";
      this.langText = this.cnLang;
      localStorage.setItem("currentLang", "cn");
      this.initializeMenuText();
      this.setUpInteractiveButtons();
    });
    languageButtons!.append(cnButton);
    // button for arabic
    const arButton = document.createElement("button");
    arButton.innerHTML = "اَلْعَرَبِيَّة";
    arButton.addEventListener("click", () => {
      this.currentLang = "ar";
      this.numFormat = "ar-SA";
      this.langText = this.arLang;
      localStorage.setItem("currentLang", "ar");
      this.initializeMenuText();
      this.setUpInteractiveButtons();
    });
    languageButtons!.append(arButton);
  }

  getTimeForCurrLang(time: any): string {
    if (this.currentLang == "en") {
      return time.en;
    }
    if (this.currentLang == "cn") {
      return time.cn;
    }
    if (this.currentLang == "ar") {
      return time.ar;
    }
    return "";
  }
}

// function to convert yaml text file to json format
function YAMLtoJSON(yamlStr: string) {
  var obj = YAML.parse(yamlStr);
  var jsonStr = JSON.stringify(obj);
  return jsonStr;
}
