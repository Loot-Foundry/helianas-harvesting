import CraftingWindow from "../windows/CraftingWindow.js";

//Should be called with Hooks.on('renderChatMessage', relevantComponents);
//Injects an on click so that the relevant recipes are shown when the button is clicked.
export function relevantRecipes(message, html, messageData) {
    const RelevantRecipesButton = html.find(".helianas-harvest-relevant-recipes-button");
    if (RelevantRecipesButton.length === 0) {
        return
    }

    let searchText = RelevantRecipesButton[0].title;

    RelevantRecipesButton.on("click", event => {
        event.preventDefault();
        const { recipeDatabase } = game.modules.get("helianas-harvesting").api;
        const cw = new CraftingWindow(recipeDatabase, searchText=searchText);
        cw.render(true);
    });
};
