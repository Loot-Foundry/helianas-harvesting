import { Config } from "./config.js";
import { RecipeDatabase } from "./RecipeDatabase.js";

export default class PlayerSelectWindow extends Application {
  constructor(message) {
    super();

    if (message) {
        this.#message = message;
    }
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: Config.PlayerSelectWindowTemplate,
      classes: ['helianas-harvesting-module'],
      width: 350,
      height: 400,
      resizable: false,
      title: "HelianasHarvest.PlayerSelectWindowTitle"
    });
  }

  #message = "HelianasHarvest.SelectAPlayer";
  #resolvePlayer = null;

  selectPlayer() {
    return new Promise((resolve, reject) => {
        this.#resolvePlayer = resolve;
        this.render(true);
    });
  }

  getData() {
    let data = super.getData();
    data.message = this.#message;
    data.players = this.getPlayerCharacters();
    return data;
  }

  // Define the logic for activating listeners in the rendered HTML
  activateListeners(html) {
    super.activateListeners(html);

    const playerSelect = html.find('.select-player');
    playerSelect.on('click', (event) => {
        event.preventDefault();
        if (this.#resolvePlayer) {
            this.#resolvePlayer(event.currentTarget.dataset.playerId);
            this.close();
        }
    });
  }

  getPlayerCharacters() {
    return game.actors
      .filter(a => a.type === "character")
      .sort((a, b) => a.name < b.name);
  }
}
