import { ComponentDatabase } from "./ComponentDatabase.js";
import HarvestWindow from "./HarvestWindow.js"
import { Config } from "./config.js";


Hooks.on("setup", function() {
    game.modules.get("helianas-harvesting").api = {
        componentDatabase: new ComponentDatabase()
    };
});

Hooks.on("ready", async function() {
    const itemFile = await fetch(Config.HarvestItemJson);
    const items = await itemFile.json();
    const { componentDatabase } = game.modules.get("helianas-harvesting").api;

    items.forEach(item => {
        componentDatabase.addItem(item);
    });
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
});
