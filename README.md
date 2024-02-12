This module is in testing.

## API

You can use the module's API to add your own crafting components.

```js
const api = game.modules.get("helianas-harvesting")?.api;

if (api) {
    api.componentDatabase.addItem({
        /**
         * id must be a 16 digit alphanumeric random string.
         * Use a persistent unique ID for each item, it will be saved
         * to newly made item's via flag data for later crafting checks.
         **/
        id: "mmdXhJuLahzOhNQy",

        name: "My Item Name",

        img: "/foundry/icon.webp",

        // This gets added to the system.source for generated items.
        source: "My Content"

        // The creature type which can drop this item.
        // Note this is case sensitive and is upper cased.
        // Defaults to "All"
        creatureType: "Aberration",

        // Crafting DC for the item (Defaults to 5)
        dc: 5,

        // True if the item is flagged for crafting (Defaults to false)
        crafting: true,

        // True if the item is edible (Defaults to false)
        edible: false,

        // True if the item is volatile (Defaults to false)
        volatile: true,
        // An array of all creature names which can drop this item if bossDrop is true.
        bosses: ["Big Monster", "Bigger Monster", "Biggest Monster"]
    });
}
```

If you are importing a large number of items, I recommend loading them from a JSON file packaged with your module.

```js
Hooks.on("ready", async function() {
    const api = game.modules.get("helianas-harvesting").api;

    if (api) {
        const itemFile = await fetch(Config.HarvestItemJson);
        const items = await itemFile.json();
        items.forEach(item => {
            api.componentDatabase.addItem(item);
        });
    }
});
```

## Licenses

This module uses content licensed under the terms of the Open Gaming License v1.0a. A copy of the license can be found in the `OGL.md` document.

The software is distributed under the [MIT License](https://mit-license.org/).
