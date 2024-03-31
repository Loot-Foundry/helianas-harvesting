import { findHarvestingCompatibleModules } from "./findHarvestingCompatibleModules.js";
import { loadCompatibleModule } from "./loadCompatibleModule.js";

export async function loadModules() {
    const moduleStats = [];
    const craftingRecipes = new Map();
    const components = new Map();

    const modulesToLoad = findHarvestingCompatibleModules();
    for (const module of modulesToLoad) {
        const results = await loadCompatibleModule(module, components, craftingRecipes);
        moduleStats.push(results);
    }
    return { moduleStats, components, craftingRecipes };
}
