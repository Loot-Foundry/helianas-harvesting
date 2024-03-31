import { displayError } from "./displayError.js";
import { mergeModuleStatistics } from "./mergeModuleStatistics.js";
import { loadResourceFile } from "./loadResourceFile.js";
import { retrieveFilesFromModule } from "./retrieveFilesFromModule.js";

/**
 * Loads components and crafting recipes associated with a module
 *
 * @param {*} module
 * @param {Map<string, any>} components
 * @param {Map<string, any>} craftingRecipes
 * @returns
 */
export async function loadCompatibleModule(module, components, craftingRecipes) {
    const { craftingRecipeFiles, componentsFiles } = retrieveFilesFromModule(module);

    const stats = {
        title: module.title,
        components: {
            loaded: 0,
            replaced: 0,
            errors: 0
        },
        craftingRecipes: {
            loaded: 0,
            replaced: 0,
            errors: 0
        }
    };

    for (const componentsFile of componentsFiles) {
        try {
            const results = await loadResourceFile(componentsFile, components, 'id', module.title);
            mergeModuleStatistics(stats.components, results);
        } catch (error) {
            displayError(`Error loading file ${componentsFile} from module ${module.title}`, error);
        }
    }

    for (const craftingRecipeFile of craftingRecipeFiles) {
        try {
            const results = await loadResourceFile(craftingRecipeFile, craftingRecipes, 'name', module.title);
            mergeModuleStatistics(stats.craftingRecipes, results);
        } catch (error) {
            displayError(`Error loading file ${craftingRecipeFile} from module ${module.title}`, error);
        }
    }

    return stats;
}
