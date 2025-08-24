import { Config } from "../config.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
export default class PlayerSelectWindow extends HandlebarsApplicationMixin(ApplicationV2) {
  #message = "HelianasHarvest.SelectAPlayer";
  #resolvePlayer = null;

  constructor(message) {
    super();

    if (message) {
        this.#message = message;
    }
  }

  static DEFAULT_OPTIONS = {
    id: "player-select-window",
    classes: ["helianas-harvesting-module", "themed", "theme-light"],
    position: { width: 350, height: 400 },
    window: { title: "HelianasHarvest.PlayerSelectWindowTitle", resize: false },
    // Silly Foundry devs, statics are for singletons; not snap, crackle and bind.
    actions: { select: PlayerSelectWindow.prototype._onSelect }
  };


  static PARTS = {
       main: { template: Config.PlayerSelectWindowTemplate }
  };

  selectPlayer() {
    return new Promise((resolve, reject) => {
        this.#resolvePlayer = resolve;
        this.render(true);
    });
  }

  async _prepareContext(options) {
    return {
      message: this.#message,
      players: this.getPlayerCharacters()
    };
  }


  _onSelect(event, target) {
      event.preventDefault();
      const playerId = target?.dataset?.playerId;
      if (!playerId) return;
      if (this.#resolvePlayer) {
        this.#resolvePlayer(playerId);
        this.close();
      }
  }

  getPlayerCharacters() {
    return game.actors
      .filter(a => a.type === "character")
      .sort((a, b) => a.name < b.name);
  }
}
