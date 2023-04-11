import { Config } from "./config.js"

export default class HarvestWindow extends Application {

  constructor(itemData) {
    super();
    this.items = itemData.items;
    this.creatureTypes = itemData.creatureTypes;
    this.bosses = itemData.bosses;

    this.updateForm({
      creatureType: "Aberration",
      isBoss: false
    })
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: Config.HarvestWindowTemplate,
      width: 800,
      height: 600,
      resizable: true,
      title: "Harvest"
    });
  }

  items = [];
  creatureTypes = [];
  bosses = new Map();

  #formData = {
    creatureType: "",
    isBoss: false,
    bossName: "",
    itemCount: {},
    harvestItems: []
  };

  hasBoss(creatureType) {
    return this.bosses.has(this.#formData.creatureType);
  }

  updateForm(options) {
    let resetItems = false;
    if (!options) options = {};

    if (typeof options.creatureType !== "undefined" && this.#formData.creatureType !== options.creatureType) {
      this.#formData.creatureType = options.creatureType;
      resetItems = true;
    }

    if (typeof options.isBoss !== "undefined" && options.isBoss !== this.#formData.isBoss) {
      this.#formData.isBoss = options.isBoss;
      if (!this.#formData.isBoss) {
        this.#formData.bossName = "";
      }
      resetItems = true;
    }

    // Update the boss name
    if (typeof options.bossName !== "undefined" && options.bossName !== this.#formData.bossName) {
      this.#formData.bossName = options.bossName;
      resetItems = true;
    }

    if (this.#formData.isBoss) {
      if (!this.hasBoss(this.#formData.creatureType)) {
        this.#formData.isBoss = false;
        this.#formData.bossName = "";
        resetItems = true;
      } else if (!this.bosses.get(this.#formData.creatureType).has(this.#formData.bossName)) {
        const bossOptions = Array.from(this.bosses.get(this.#formData.creatureType)).sort();
        this.#formData.bossName = bossOptions[0];
        resetItems = true;
      }
    }

    if (resetItems) {
      this.#formData.itemCount = {};
      this.#formData.harvestItems = [];
    }
 
    if (typeof options.itemCount !== "undefined") {
      this.#formData.itemCount = options.itemCount;
     
      // Generate harvest table
      this.#formData.harvestItems = [];
      Object.entries(this.#formData.itemCount).forEach(([itemId, count]) => {
          const item = this.items.find(i => i.id === itemId);

          for (let itemCount = 1; itemCount <= count; itemCount++) {
            this.#formData.harvestItems.push({
              showCount: count > 1,
              itemCount,
              attempt: true,
              item
            });
          }
      });
    }
 
    // Update Harvest DCs
    let DC = 0;
    this.#formData.harvestItems.forEach(harvest => {
      if (harvest.attempt) {
        DC += harvest.item.dc;
        harvest.DC = DC;
      }
      else {
        harvest.DC = "N/A";
      }
    });

    if (this.rendered) this.render();

    console.log("Rerendering with the following: ", this.#formData);
  }

  getData() {
    let data = super.getData();

    data.selectedType = this.#formData.creatureType;
    data.creatureTypes = this.creatureTypes;

    data.hasBoss = this.hasBoss(data.selectedType);

    if (data.hasBoss) {
      data.isBoss = this.#formData.isBoss;

      data.selectedBoss = this.#formData.bossName;
      data.bossNames = Array.from(this.bosses.get(data.selectedType)).sort();
    }

    data.items = this.items
      .filter(item => {
        return item.creatureType === data.selectedType &&
          (!item.bossDrop || item.bosses.includes(data.selectedBoss))
      })
      .map(item => {
        const count = this.#formData.itemCount[item.id] ?? "";
        return { count, ...item };
      });

    data.itemsByDc = {};

    for (let i of data.items) {
      let arr = data.itemsByDc[i.dc] ?? [];
      arr.push(i);
      data.itemsByDc[i.dc] = arr;
    }

    data.harvest = this.#formData.harvestItems;

    return data;
  }

  // Define the logic for activating listeners in the rendered HTML
  activateListeners(html) {
    super.activateListeners(html);

    const creatureType = html.find('#creature-type');
    creatureType.on('change', event => {
      this.updateForm({ creatureType: event.target.value });
    });

    const isBoss = html.find("#is-boss");
    isBoss.on('change', event => {
      this.updateForm({ isBoss: event.target.checked });
    });

    const bossName = html.find("#boss-name");
    bossName.on('change', event => {
      this.updateForm({ bossName: event.target.value });
    });

    const createHarvestButton = html.find("#create-harvest-button");
    createHarvestButton.on('click', event => {
      event.preventDefault();
      const itemCount = {};

      html.find(".item-count-input").each((idx, element) => {
        const id = element.dataset.itemId;
        const count = parseInt(element.value);

        if (count > 0) {
          itemCount[id] = count;
        }
      });

      this.updateForm({ itemCount });
    });

    const harvestTableRows = html.find(".harvest-table-row");
    harvestTableRows.on('dragstart', event => {
      const dataTransfer = event.originalEvent.dataTransfer;
      dataTransfer.setData("harvestOrder", event.currentTarget.dataset.harvestOrder);
    });
    harvestTableRows.on('drop', event => {
      event.preventDefault();
      const dataTransfer = event.originalEvent.dataTransfer;
      const sourceIndex = parseInt(dataTransfer.getData("harvestOrder"));
      if (Number.isInteger(sourceIndex)) {
        const targetIndex = parseInt(event.currentTarget.dataset.harvestOrder);

        this.#rearrangeHarvestOrder(sourceIndex, targetIndex);
      }
    });

    // Cosmetic reaction to improve readbility of drop action
    harvestTableRows.on("dragenter", event => {
        event.currentTarget.style.borderTop = "3px solid black";
    });

    harvestTableRows.on("dragleave", event => {
        event.currentTarget.style.borderTop = "";
    });

    const harvestAttemptCheckbox = html.find(".harvest-attempt-checkbox");
    harvestAttemptCheckbox.on("change", (event) => {
      const index = parseInt(event.target.dataset.harvestIndex);
      this.#formData.harvestItems[index].attempt = event.target.checked;
      this.updateForm();
    });
  }

  #rearrangeHarvestOrder(sourceIndex, targetIndex) {
    if (sourceIndex === targetIndex) return;
    let items = this.#formData.harvestItems;
    const ele = items[sourceIndex];

    // Add the item at the targetIndex.
    items = [
      ...items.slice(0, targetIndex),
      ele,
      ...items.slice(targetIndex)
    ];

    // If the sourceIndex comes after the targetIndex, it just moved.
    if (sourceIndex > targetIndex)
      sourceIndex++;

    // Remove the old copy of the item
    items.splice(sourceIndex, 1);

    this.#formData.harvestItems = items;

    this.updateForm();
  }
}