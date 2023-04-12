import { Config } from "./config.js";
import { ItemData } from "./HarvestItems.js";
import { HarvestWindowForm } from "./HarvestWindowForm.js";

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

    data.creatureName = this.formData.creatureName;
    data.selectedType = this.formData.creatureType;
    data.creatureTypes = this.itemData.creatureTypes;

    data.hasBoss = this.itemData.hasBoss(data.selectedType);

    if (data.hasBoss) {
      data.isBoss = this.formData.isBoss;

      data.selectedBoss = this.formData.bossName;
      data.bossNames = this.itemData.getBossNames(data.selectedType);
    }

    data.items = this.formData.getItemCount(data.selectedType, data.selectedBoss);

    data.itemsByDc = this.getItemDCs(data.items);

    data.harvest = this.formData.harvestItems;
    data.harvestEmpty = data.harvest.length === 0;

    data.harvestCheckTotal = this.formData.harvestCheckTotal;

    data.players = this.getPlayerCharacters();
    data.harvestingCharacter = this.formData.harvestingCharacter;

    return data;
  }

  getItemDCs(items) {
    const itemsByDc = {};

    for (let i of items) {
      let arr = itemsByDc[i.dc] ?? [];
      arr.push(i);
      itemsByDc[i.dc] = arr;
    }

    return itemsByDc;
  }

  getPlayerCharacters() {
    return game.actors
      .filter(a => a.type === "character")
      .sort((a, b) => a.name < b.name);
  }

  // Define the logic for activating listeners in the rendered HTML
  activateListeners(html) {
    super.activateListeners(html);

    // Numeric and text inputs
    const creatureType = html.find('.managed-input');
    creatureType.on('change', event => {
      const input = {};
      input[event.target.dataset.binding] = event.target.value;
      this.updateForm(input);
    });

    // Is Boss checkbox
    const isBoss = html.find("#is-boss");
    isBoss.on('change', event => {
      this.updateForm({ isBoss: event.target.checked });
    });

    // Create Harvest Button
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

    // Harvest Table Reordering Drag & Drop
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

    // Harvest Attempt Check Boxes
    const harvestAttemptCheckboxes = html.find(".harvest-attempt-checkbox");
    harvestAttemptCheckboxes.on("change", (event) => {
      const index = parseInt(event.target.dataset.harvestIndex);
      this.formData.harvestItems[index].attempt = event.target.checked;
      this.updateForm();
    });

    const shareComponents = html.find("#harvest-show-components");
    shareComponents.on("click", event => {
      event.preventDefault();
      this.shareComponents();
    });
    const shareTable = html.find("#harvest-show-table");
    shareTable.on("click", event => {
      event.preventDefault();
      this.showTable();
    });

    const completeHarvest = html.find("#harvest-complete");
    completeHarvest.on("click", event => {
      event.preventDefault();
      this.completeHarvest();
    });
  }

  shareComponents() {
    let message = `<p>The following items can be harvested from ${this.formData.creatureName}</p>`;
    message += `<ul>`;

    this.formData.getHarvestComponents().forEach(item => {
      message += `<li> ${item.name} (DC ${item.dc}) x ${item.count}`;
    });

    message += `</ul>
      <p>Discuss what you would like to attempt to harvest and what order.
      Each additional item you attempt to harvest will increase the DC.</p>`;

    this.sendChatMessage(message);
  }

  showTable() {
    let message = `<p>The current harvest table for ${this.formData.creatureName}</p>`;
    message += `<ul>`;

    this.formData.harvestItems.forEach(harvest => {
      if (harvest.attempt) {
        message += `<li> DC ${harvest.DC} - ${harvest.item.name} (+${harvest.item.dc})`;
      }
    });

    message += `</ul>
      <p>Roll your dual check to complete the harvest.</p>`;

    this.sendChatMessage(message);
  }

  async completeHarvest() {
    const actor = game.actors.get(this.formData.harvestingCharacter);
    const items = this.formData.getHarvestComponents(this.formData.harvestCheckTotal);
    let message = `<p>Are you sure you wish to send the following items to ${actor.name}?</p><ul>`;

    items.forEach(item => {
      message += `<li> ${item.name} x ${item.count}`;
    });

    message += "</ul>";

    Dialog.confirm({
      title: "Confirm Harvest",
      content: message,
      yes: () => {
        const items5e = items
          .map(item => this.itemData.createItem5e(this.formData.creatureName, item));
        actor.createEmbeddedDocuments("Item", items5e);
      }
    });
  }

  sendChatMessage(message) {
    let chatMessage = {
      user: game.userId,
      speaker: ChatMessage.getSpeaker(),
      content: message
    };

    ChatMessage.create(chatMessage);
  }

}
