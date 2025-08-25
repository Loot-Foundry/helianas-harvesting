import { Config } from "../config.js";
import PlayerSelectWindow from "./PlayerSelectWindow.js";
import { RecipeDatabase } from "../RecipeDatabase.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
export default class CraftingWindow extends HandlebarsApplicationMixin(ApplicationV2) {
    /**
     * Recipe Database
     *
     * @type {RecipeDatabase}
     */
    recipeDatabase = null;

    /**
     * Search Text Field
     */
    searchText = "";

    #activeElementId = false;
    #cursorPosition = { start: 0, end: 0 };
    #debounceSchedule = false;
    #listenerAbort;

    /**
     * @param {RecipeDatabase} recipeDatabase
     * @param {ActorToken} token
     */
    constructor(recipeDatabase) {
        super();

        this.recipeDatabase = recipeDatabase;
    }

    static DEFAULT_OPTIONS = {
        id: "crafting-window",
        classes: ["helianas-harvesting-module", "themed", "theme-light"],
        position: { width: 800, height: 600 },
        window: { title: "HelianasHarvest.CraftWindowTitle", resize: true },
        tag: "div",
        actions: {
            openRecipe: CraftingWindow.prototype._onOpenRecipe
        }
    };

    static PARTS = {
        main: { template: Config.CraftWindowTemplate }
    };

    updateForm(newValues) {
        if (typeof newValues.searchText === "string") {
            this.searchText = newValues.searchText;
        }

        if (this.rendered) this.render();
    }

    async _prepareContext(options) {
        return {
            rarityNames: game.system.config.itemRarity,
            recipes: this.recipeDatabase
                .searchItems(this.searchText)
                .sort((a, b) => a.name.localeCompare(b.name)),
            searchText: this.searchText
        };
    }

    // Event Listeners
    _onFocusManaged(event, target) {
        this.#activeElementId = target.id;
        this.#cursorPosition = {
            start: target.selectionStart,
            end: target.selectionEnd
        };
    }

    _onBlurManaged(event, target) {
        this.#activeElementId = null;
        this.#cursorPosition = { start: 0, end: 0 };
    }

    _onInputManaged(event, target) {
        this.#activeElementId = target.id;
        this.#cursorPosition = {
            start: target.selectionStart,
            end: target.selectionEnd
        };

        if (this.#debounceSchedule) clearTimeout(this.#debounceSchedule);
        this.#debounceSchedule = setTimeout(() => this.#updateForm(target), 500);
    }

    _onChangeManaged(event, target) {
        this.#updateForm(target);
    }

    #updateForm(target) {
        const input = {};
        input[target.dataset.binding] = target.value;
        this.updateForm(input);
    }

    async _onOpenRecipe(event, target) {
        event.preventDefault();
        const { itemName, itemLink } = target.dataset;
        await this.send(itemName, itemLink);
    }

    _onRender(ctx, opts) {
        // restore cursor

        console.log(this.element);
        console.log(ctx, opts);
        console.log(this.#activeElementId);
        console.log(this.#cursorPosition);

        if (this.#activeElementId) {
            const el = this.element.querySelector(`#${this.#activeElementId}`);
            if (el) {
                el.focus();
                el.setSelectionRange?.(this.#cursorPosition.start, this.#cursorPosition.end);
            }
        }

        // re-wire listeners safely each render
        this.#listenerAbort?.abort();
        this.#listenerAbort = new AbortController();
        const { signal } = this.#listenerAbort;

        this.element.querySelectorAll('#recipe-search').forEach(el => {
            el.addEventListener('focus', e => this._onFocusManaged(e, e.currentTarget), { signal });
            //el.addEventListener('blur', e => this._onBlurManaged(e, e.currentTarget), { signal });
            el.addEventListener('input', e => this._onInputManaged(e, e.currentTarget), { signal });
            el.addEventListener('change', e => this._onChangeManaged(e, e.currentTarget), { signal });
        });
    }

    close(options) {
        // ensure timers/listeners don’t leak
        this.#listenerAbort?.abort();
        if (this.#debounceSchedule) clearTimeout(this.#debounceSchedule);
        return super.close(options);
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
