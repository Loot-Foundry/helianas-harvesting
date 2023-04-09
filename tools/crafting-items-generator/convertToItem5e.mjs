export function convertToItem5e(source) {
    const lowerCaseName = source.name.toLowerCase();
    const lowerCaseCreatureType = source.creatureType.toLowerCase();
    return {
        "name": source.name,
        "type": "loot",
        "img": source.img,
        "system": {
            "description": {
                "value": `<p>A ${lowerCaseName} harvested from a ${lowerCaseCreatureType}. It may be useful in crafting!</p><p></p><p><span style=\"text-decoration:underline\"><strong><span style=\"text-decoration:underline\">Note</span></strong></span></p><p><span style=\"font-family:'gg sans', 'Noto Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\">If you are using the metatag optional rule then, to keep track of the different metatags you have for this component:</span></p><p><span style=\"font-family:'gg sans', 'Noto Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\"> <strong>[Monster Name] - [Monster Size] - [Number of this Component]</strong></span></p>`,
                "chat": "",
                "unidentified": ""
            },
            "source": source.source,
            "quantity": 1,
            "weight": 0,
            "price": {
                "value": 0,
                "denomination": "gp"
            },
            "attunement": 0,
            "equipped": false,
            "rarity": "",
            "identified": true
        },
        "effects": [],
        "flags": {
            "core": {
                "sourceId": `Compendium.helianas-crafting.helianas-crafting-items-test.${source.id}`
            }
        },
        "_stats": {
            "systemId": "dnd5e",
            "systemVersion": "2.1.5",
            "coreVersion": "10.291",
        },
        "_id": source.id,
        "folder": null,
        "sort": 0,
        "ownership": {
            "default": 0,
        }
    };
}
