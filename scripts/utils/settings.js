export function setupSettings() {
    // Populate the settings page for the module
    // settings can be accessed with:
    // game.settings.get("helianas-harvesting", "playerRecipes"); // returns true
    game.settings.register("helianas-harvesting", "playerRecipes", {
        name: "HelianasHarvest.Settings.PlayerRecipes.Name",
        hint: "HelianasHarvest.Settings.PlayerRecipes.Hint",
        scope: "world",
        config: true,
        type: new foundry.data.fields.BooleanField(),
        default: true
    });

    game.settings.register("helianas-harvesting", "playerCrafting", {
        name: "HelianasHarvest.Settings.PlayerCrafting.Name",
        hint: "HelianasHarvest.Settings.PlayerCrafting.Hint",
        scope: "world",
        config: true,
        type: new foundry.data.fields.BooleanField(),
        default: false
    });

    game.settings.register("helianas-harvesting", "playerHarvesting", {
        name: "HelianasHarvest.Settings.PlayerHarvesting.Name",
        hint: "HelianasHarvest.Settings.PlayerHarvesting.Hint",
        scope: "world",
        config: true,
        type: new foundry.data.fields.BooleanField(),
        default: false
    });
}
