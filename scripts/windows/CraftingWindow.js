import { Config } from "../config.js";
import PlayerSelectWindow from "./PlayerSelectWindow.js";
import { RecipeDatabase } from "../RecipeDatabase.js";

export default class CraftingWindow extends Application {
    /**
     *
     * @param {RecipeDatabase} recipeDatabase
     * @param {ActorToken} token
     * @param {string} searchText
     */
    constructor(recipeDatabase, searchText = "") {
        super();

        this.recipeDatabase = recipeDatabase;
        this.searchText = searchText
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: Config.CraftWindowTemplate,
            classes: ['helianas-harvesting-module'],
            width: 800,
            height: 600,
            resizable: true,
            title: "HelianasHarvest.CraftWindowTitle"
        });
    }

    /**
     * Recipe Database
     *
     * @type {RecipeDatabase}
     */
    recipeDatabase = null;

    /**
     * Search Text Field
     * (This has been moved to the class constructor to allow the search text to be passed in from other functions)
     */
    //searchText = "";

    #activeElementId = false;
    #cursorPosition = { start: 0, end: 0 };
    #debounceSchedule = false;

    updateForm(newValues) {
        if (typeof newValues.searchText === "string") {
            this.searchText = newValues.searchText;
        }

        if (this.rendered) this.render();
    }

    getData() {
        let data = super.getData();
        data.rarityNames = game.system.config.itemRarity;
        data.displaySearchBar = game.user.isGM;

        data.recipes = this.recipeDatabase
            .searchItems(this.searchText)
            .sort((a, b) => a.name.localeCompare(b.name));
        data.searchText = this.searchText;
        return data;
    }

    // Define the logic for activating listeners in the rendered HTML
    activateListeners(html) {
        super.activateListeners(html);

        if (this.#activeElementId) {
            const element = html.find(`#${this.#activeElementId}`);
            if (element) {
                element.focus();
                element.each((_, element) => {
                    element.setSelectionRange(this.#cursorPosition.start, this.#cursorPosition.end);
                });
            }
        }

        // Numeric and text inputs
        const managedInputs = html.find('.managed-input');
        managedInputs.on('focus blur', event => {
            if (event.type === "blur") {
                this.#activeElementId = null;
                this.#cursorPosition = { start: 0, end: 0 }; // Reset cursor position when focus is lost
            }
            else if (event.type === "focus") {
                this.#activeElementId = event.currentTarget.getAttribute('id');
                // Save the current cursor position
                this.#cursorPosition = {
                    start: event.currentTarget.selectionStart,
                    end: event.currentTarget.selectionEnd
                };
            }
        });
        managedInputs.on('input change', event => {
            if (event.type === "input") {
                this.#activeElementId = event.currentTarget.getAttribute('id');
                // Save the current cursor position
                this.#cursorPosition = {
                    start: event.currentTarget.selectionStart,
                    end: event.currentTarget.selectionEnd
                };

                if (this.#debounceSchedule) {
                    clearTimeout(this.#debounceSchedule);
                }
                this.#debounceSchedule = setTimeout(updateForm.bind(this), 500);
            }
            else {
                updateForm.bind(this)();
            }

            function updateForm() {
                const input = {};
                input[event.target.dataset.binding] = event.target.value;
                this.updateForm(input);
            }
        });

        const itemLinks = html.find(".recipe-item-name");
        itemLinks.on("click", async (event) => {
            event.preventDefault();
            const { itemName, itemLink } = event.currentTarget.dataset;
            await this.send(itemName, itemLink);
        });
    }

    async send(itemName, itemLink) {
        const psw = new PlayerSelectWindow(`Select a player to send ${itemName}`);
        const playerSelect = await psw.selectPlayer();
        const actor = game.actors.get(playerSelect);
        const craftedItem = await fromUuid(itemLink);
        if (actor && craftedItem) {
            const recipe = this.recipeDatabase.getRecipeFromName(itemName);
            const createdItems = await actor.createEmbeddedDocuments("Item", [craftedItem]);
            const updates = [{
                "_id": createdItems[0].id,
                "name": recipe.name,
                "system.quantity": recipe.qty,
                "system.rarity": recipe.rarity,
                "system.price": { value: recipe.price, denomination: 'gp' }
            }];
            await actor.updateEmbeddedDocuments("Item", updates);

            this.sendChatMessage(game.i18n.format("HelianasHarvest.CraftingCreatedItemNotice", { actorName: actor.name, itemName: craftedItem.name }));
        }
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
