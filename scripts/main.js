import HarvestWindow from "./HarvestWindow.js"
import { Config } from "./config.js";


const itemData = loadItemData(Config.HarvestItemJson);

async function loadItemData(filepath) {
    const itemFile = await fetch("modules/helianas-crafting/data/crafting-items.json");
    const items = await itemFile.json();

    const creatureTypes = new Set();
    const bosses = new Map();

    for (const item of items) {
        creatureTypes.add(item.creatureType);
        if (item.bossDrop) {
            const bossList = bosses.get(item.creatureType) ?? new Set();
            item.bosses.forEach(boss => bossList.add(boss));
            bosses.set(item.creatureType, bossList);
        }
    }

    return {
        creatureTypes: Array.from(creatureTypes).sort(),
        bosses,
        items
    }
}

async function launchHarvestWindow() {
    const hw = new HarvestWindow(await itemData);
    hw.render(true);
}

Hooks.on("getSceneControlButtons", (controls) => {
    let actorControl = controls.find(c => c.name === "token");
    actorControl.tools.push({
        name: "harvest",
        title: "HELIANAS.HarvestControl",
        icon: "fa-solid fa-sickle",
        layer: "tokens",
        visible: game.user.isGM,
        button: true,
        onClick: launchHarvestWindow
    });
});