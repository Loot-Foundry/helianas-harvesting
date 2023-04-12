import { Config } from "./config.js";
import { ItemData } from "./HarvestItems.js";
import { HarvestWindowForm } from "./HarvestWindowForm.js"

export default class HarvestWindow extends Application {

  constructor(itemData) {
    super();

    this.itemData = new ItemData(itemData);
    this.formData = new HarvestWindowForm(this.itemData);

    this.updateForm({
      creatureType: "Aberration",
      isBoss: false
    });
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

  itemData = null;
  formData = null;

  updateForm(options) {
    this.formData.updateForm(options);
    if (this.rendered) this.render();
  }

  getData() {
    let data = super.getData();

    data.selectedType = this.formData.creatureType;
    data.creatureTypes = this.itemData.creatureTypes;

    data.hasBoss = this.itemData.hasBoss(data.selectedType);

    if (data.hasBoss) {
      data.isBoss = this.formData.isBoss;

      data.selectedBoss = this.formData.bossName;
      data.bossNames = this.itemData.getBossNames(data.selectedType);
    }

    data.items = this.formData.getItemCount(data.selectedType, data.selectedBoss);

    data.itemsByDc = {};

    for (let i of data.items) {
      let arr = data.itemsByDc[i.dc] ?? [];
      arr.push(i);
      data.itemsByDc[i.dc] = arr;
    }

    data.harvest = this.formData.harvestItems;
    data.harvestEmpty = data.harvest.length === 0;

    data.harvestCheckTotal = this.formData.harvestCheckTotal;

    return data;
  }

  // Define the logic for activating listeners in the rendered HTML
  activateListeners(html) {
    super.activateListeners(html);

    const creatureType = html.find('.managed-input');
    creatureType.on('change', event => {
      const input = {};
      input[event.target.dataset.binding] = event.target.value;
      console.log("Input: ", input);
      this.updateForm(input);
    });

    const isBoss = html.find("#is-boss");
    isBoss.on('change', event => {
      this.updateForm({ isBoss: event.target.checked });
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
        this.formData.reorderHarvestTable(sourceIndex, targetIndex);
        this.updateForm();
      }
    });

    // Cosmetic reaction to improve readbility of drop action
    harvestTableRows.on("dragenter", event => {
      event.currentTarget.style.borderTop = "3px solid black";
    });

    harvestTableRows.on("dragleave", event => {
      event.currentTarget.style.borderTop = "";
    });

    const harvestAttemptCheckboxes = html.find(".harvest-attempt-checkbox");
    harvestAttemptCheckboxes.on("change", (event) => {
      const index = parseInt(event.target.dataset.harvestIndex);
      this.formData.harvestItems[index].attempt = event.target.checked;
      this.updateForm();
    });
  }
}
