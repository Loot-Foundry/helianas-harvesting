export function convertToItem5e(source) {
    const lowerCaseName = source.name.toLowerCase();
    const lowerCaseCreatureType = source.creatureType.toLowerCase();
    let description =
        `<p>A ${lowerCaseName} harvested from a ${lowerCaseCreatureType}. It may be ` +
        `useful in crafting!</p>`;

    return {
        "name": source.name,
        "type": "loot",
        "img": source.img,
        "system": {
            "description": {
                "value": description,
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
            "helianas-harvesting": {
                "id": source.id
            },
            "core": {
                "sourceId": `Compendium.helianas-harvesting.dnd5e-components.${source.id}`
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
