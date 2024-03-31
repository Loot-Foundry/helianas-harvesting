import { ComponentDatabase } from "./ComponentDatabase.js";
import CraftingWindow from "./CraftingWindow.js";
import HarvestWindow from "./HarvestWindow.js";
import { RecipeDatabase } from "./RecipeDatabase.js";
import { loadModules } from "./utils/loadModules.js";

Hooks.on("setup", function () {
    const componentDatabase = new ComponentDatabase();
    const recipeDatabase = new RecipeDatabase(componentDatabase);
    game.modules.get("helianas-harvesting").api = {
        componentDatabase,
        recipeDatabase
    };
});

Hooks.on("ready", async function () {
    const { componentDatabase, recipeDatabase } = game.modules.get("helianas-harvesting").api;

    const { moduleStats, components, craftingRecipes } = await loadModules();

    Array.from(components).forEach(i => componentDatabase.addItem(i[1]));
    Array.from(craftingRecipes).forEach(r => recipeDatabase.addRecipe(r[1]));
});

Hooks.on("getSceneControlButtons", (controls) => {
    let actorControl = controls.find(c => c.name === "token");
    actorControl.tools.push({
        name: "harvest",
        title: "HelianasHarvest.HarvestControl",
        icon: "fa-solid fa-sickle",
        layer: "tokens",
        visible: game.user.isGM,
        button: true,
        onClick: () => {
            let token = null;

            if (canvas.tokens.controlled.length)
                token = canvas.tokens.controlled[0];

            const { componentDatabase } = game.modules.get("helianas-harvesting").api;
            const hw = new HarvestWindow(componentDatabase, token);
            hw.render(true);
        }
    });

    actorControl.tools.push({
        name: "craft",
        title: "HelianasHarvest.CraftControl",
        icon: "fa-solid fa-list",
        layer: "tokens",
        visible: game.user.isGM,
        button: true,
        onClick: () => {
            const { recipeDatabase } = game.modules.get("helianas-harvesting").api;

            const cw = new CraftingWindow(recipeDatabase);
            cw.render(true);
        }
    });
});
