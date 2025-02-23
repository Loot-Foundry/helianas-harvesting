import { bindStatisticsButton } from "./utils/bindStatisticsButton.js";
import { loadModules } from "./utils/loadModules.js";
import { bindSceneControlButtons } from "./utils/bindSceneControlButtons.js";
import { initializeDatabases } from "./utils/initializeDatabases.js";
import { setupModuleAPI } from "./utils/setupModuleAPI.js";
import { relevantRecipes } from "./utils/relevantRecipes.js";


Hooks.on("setup", setupModuleAPI);

Hooks.on("ready", initializeDatabases);

Hooks.on("getSceneControlButtons", bindSceneControlButtons);

Hooks.on("getHarvestWindowHeaderButtons", bindStatisticsButton);
Hooks.on("getCraftingWindowHeaderButtons", bindStatisticsButton);

Hooks.on('renderChatMessage', relevantRecipes);
