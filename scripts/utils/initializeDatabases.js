import { loadModules } from "./loadModules.js";

export async function initializeDatabases() {
    const api = game.modules.get("helianas-harvesting").api;

    const { moduleStats, components, craftingRecipes } = await loadModules();

    api.stats = moduleStats;

    Array.from(components).forEach(i => api.componentDatabase.addItem(i[1]));
    Array.from(craftingRecipes).forEach(r => api.recipeDatabase.addRecipe(r[1]));
}
;
