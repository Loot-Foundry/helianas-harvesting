export class RecipeDatabase {
    _recipes = [];
    _cb = null;

    constructor(componentDatabase) {
        this._cb = componentDatabase;
    }

    addRecipe(recipe) {
        const fields = ["name", "source", "item", "mod", "price", "rarity", "qty", "metatag", "component", "variants", "includeBasePrice", "note"];

        // Handle Variant Recipes by cloning
        const variants = recipe.variants
        if (Array.isArray(variants)) {
            for (const alterations of variants) {
                if (typeof alterations === "object") {
                    if (!alterations.item && !alterations.mod) {
                        throw new Error(`Heliana's Harvesting | For ${recipe.name} recipe variants must specify either an 'item' link or a 'mod'`);
                    }
                    let clone = {...recipe};

                    fields.forEach(f => {
                        if (alterations.hasOwnProperty(f)) {
                            clone[f] = alterations[f];
                        }
                    });

                    // Remove variants so that we don't recurse
                    delete clone.variants;

                    // Add variants
                    this.addRecipe(clone);
                }
            }
            return;
        }

        // Duplicate recipe for each item link, if we get an array of item links
        if (Array.isArray(recipe.item)) {
            for (const newItem of recipe.item) {
                let clone = {...recipe};
                clone.item = newItem;
                this.addRecipe(clone);
            }
            return;
        }

        Object.getOwnPropertyNames(recipe).forEach(name => {
            if (!fields.includes(name)) {
                throw new Error(`Heliana's Harvesting | Unknown property ${name} on recipe ${recipe.name}`);
            }
        });

        this.#addItemInternal(recipe);
    }

    #addItemInternal(recipe) {
        const item = fromUuidSync(recipe.item);
        if (!item) {
            console.error(`Heliana's Harvesting | Unable to find item uuid ${recipe.item} on recipe ${recipe.name}`);
            return;
        }

        // Normalize recipe components to arrays for easier handling
        if (!Array.isArray(recipe.component)) recipe.component = [recipe.component];

        const components = recipe.component.map(c => {
            const component = this._cb.get(c);
            if (!component) {
                console.error(`Heliana's Harvesting | Unable to find component ${c} on recipe ${recipe.name}`)
            }
            return component;
        });

        const nameExtension = recipe.mod ? ` (${recipe.mod})` : ''
        const name = item.name + nameExtension;
        if (this.getRecipeFromName(name)) {
            throw new Error(`Heliana's Harvesting | Duplicated name for item: ${name}`)
        }

        this._recipes.push({
            name,
            img: item.img ?? "icons/svg/item-bag.svg",
            searchText: `${item.name} ${recipe.mod ?? ""} ${recipe.metatag ?? ""} ${components.map(c => c.name).join(" ")}`.toLowerCase(),
            metatag: recipe.metatag,
            rarity: recipe.rarity,
            price: recipe.price,
            link: recipe.item,
            qty: recipe.qty ?? 1,
            includeBasePrice: recipe.includeBasePrice === true,
            components
        });
    }

    /**
     * Searches all recipes to find.  Default behaviour returns all recipes if no search string is provided.
     *
     * @param {string} text Search string
     * @param {boolean} [matchAll=true] Whether to match all keywords (AND logic) or any keyword (OR logic)
     * @param {string} [delimiter=" "] Delimiter used to split the search string into keywords.  " " for AND logic, "," for OR logic
     *
     * @returns {any[]} results
     */
    searchItems(text, matchAll = false, delimiter = ",") {
        let keywords = text.toLowerCase().split(delimiter)
        keywords = keywords.map(word => word.trim()).filter(word => word.length > 0);
        if (keywords.length === 0) return this._recipes;
        return this._recipes.filter(r => {
            if (matchAll) {
                return keywords.every(word => (r.searchText.includes(word)));
            } else {
                return keywords.some(word => (r.searchText.includes(word)));
            }
        });
    }

    /**
     *
     * @param {*} name The recipe's name
     */
    getRecipeFromName(name) {
        return this._recipes.find((r => (r.name === name)));
    }
}
