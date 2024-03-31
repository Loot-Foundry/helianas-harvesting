import { ComponentDatabase } from "../ComponentDatabase.js";
import { RecipeDatabase } from "../RecipeDatabase.js";

export function setupModuleAPI() {
    const componentDatabase = new ComponentDatabase();
    const recipeDatabase = new RecipeDatabase(componentDatabase);
    game.modules.get("helianas-harvesting").api = {
        componentDatabase,
        recipeDatabase,
        stats: []
    };
}
