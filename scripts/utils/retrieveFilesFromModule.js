export function retrieveFilesFromModule(module) {
    const components = module.settings.components;
    const recipes = module.settings.recipes;

    const componentsFiles = Array.isArray(components) ? components : [];
    const craftingRecipeFiles = Array.isArray(recipes) ? recipes : [];

    if (typeof components === "string") {
        componentsFiles.push(components);
    }

    if (typeof recipes === "string") {
        craftingRecipeFiles.push(recipes);
    }
    return { craftingRecipeFiles, componentsFiles };
}
