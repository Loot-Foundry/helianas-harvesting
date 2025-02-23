import { Config } from "../config.js";
import { ComponentDatabase } from "../ComponentDatabase.js";
import { HarvestWindowForm } from "./HarvestWindowForm.js";

export default class HarvestWindow extends Application {

  constructor(componentDatabase, token) {
    super();

    this.itemData = componentDatabase;
    this.formData = new HarvestWindowForm(this.itemData);

    if (token) {
      this.updateFromToken(token);
    } else {
      this.updateForm({
        creatureType: "Aberration",
        isBoss: false
      });
    }
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: Config.HarvestWindowTemplate,
      classes: ['helianas-harvesting-module'],
      width: 800,
      height: 600,
      resizable: false,
      title: "HelianasHarvest.HarvestWindowTitle"
    });
  }

  itemData = null;
  formData = null;

  updateForm(options) {
    this.formData.updateForm(options);
    if (this.rendered) this.render();
  }

  updateFromToken(token) {
    const actor = token.actor;
    const creatureType = this.itemData.creatureTypes
      .find(t => t.toLowerCase() === actor.system.details.type.value) ?? "Aberration";

    const bosses = this.itemData.getBossNames(creatureType);
    this.updateForm({
      creatureName: actor.name,
      creatureType: creatureType,
      creatureCR: actor.system?.details?.cr ?? 1,
      isBoss: bosses.includes(actor.name),
      // Bosses are auto validated
      bossName: actor.name
    });
  }

  getData() {
    let data = super.getData();

    data.creatureName = this.formData.creatureName;
    data.selectedType = this.formData.creatureType;
    data.creatureTypes = this.itemData.creatureTypes;
    data.creatureCR = this.formData.creatureCR;

    data.hasBoss = this.itemData.hasBoss(data.selectedType);

    if (data.hasBoss) {
      data.isBoss = this.formData.isBoss;

      data.selectedBoss = this.formData.bossName;
      data.bossNames = this.itemData.getBossNames(data.selectedType);
    }

    data.items = this.formData.getItemCount(data.selectedType, data.selectedBoss, data.creatureCR);

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
    let searchQuery = "";

    let message = `<p>${game.i18n.format("HelianasHarvest.ChatComponentsMessage", {creatureName: this.formData.creatureName})}</p>`;
    message += `<ul>`;

    this.formData.getHarvestComponents().forEach(item => {
      message += `<li> ${item.name} (DC ${item.dc}) x ${item.count}`;
      searchQuery += item.name + ",";
    });

    message += `</ul>
      <p>${game.i18n.localize("HelianasHarvest.ChatComponentsInstructions")}</p>
      <button class="helianas-harvest-relevant-recipes-button" title="${searchQuery}">${game.i18n.localize("HelianasHarvest.ShowRelevantRecipes")}</button>
      `;

    this.sendChatMessage(message);

    this.formData.getHarvestComponents();
  }

  getAssessmentSkill() {
    const skillTable = {
      "Aberration": "Arcana",
      "Beast": "Survival",
      "Celestial": "Religion",
      "Construct": "Investigation",
      "Dragon": "Survival",
      "Elemental": "Arcana",
      "Fey": "Arcana",
      "Fiend": "Religion",
      "Giant": "Medicine",
      "Humanoid": "Medicine",
      "Monstrosity": "Survival",
      "Ooze": "Nature",
      "Plant": "Nature",
      "Undead": "Medicine",
    }

    return skillTable[this.formData.creatureType] ?? "Other";
  }

  showTable() {
    let message = `<p>${game.i18n.format("HelianasHarvest.ChatHarvestTableMessage", {creatureName: this.formData.creatureName})}</p>`;
    message += `<ul>`;

    this.formData.harvestItems.forEach(harvest => {
      if (harvest.attempt) {
        message += `<li> DC ${harvest.DC} - ${harvest.item.name} (+${harvest.item.dc})`;
      }
    });

    message += `</ul>
      <p>${game.i18n.localize("HelianasHarvest.ChatRollCheckInstructions")}</p>`;

    message += `<p>Assessment check: Intelligence (${this.getAssessmentSkill()})</p>`;

    this.sendChatMessage(message);
  }

  async completeHarvest() {
    const actor = game.actors.get(this.formData.harvestingCharacter);
    const items = this.formData.getHarvestComponents(this.formData.harvestCheckTotal);
    let message = `<p>${game.i18n.format("HelianasHarvest.ConfirmHarvestDialog", { name: actor.name})}</p><ul>`;

    items.forEach(item => {
      message += `<li> ${item.name} x ${item.count}`;
    });

    message += "</ul>";

    Dialog.confirm({
      title: game.i18n.localize("HelianasHarvest.ConfirmHarvestTitle"),
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
