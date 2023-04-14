export class ItemData {
    items = [];
    creatureTypes = [];
    bosses = new Map();

    constructor(itemData) {
        this.items = itemData.items;
        this.creatureTypes = itemData.creatureTypes;
        this.bosses = itemData.bosses;
    }

    hasBoss(creatureType) {
        return this.bosses.has(creatureType);
    }

    getBossNames(creatureType) {
        const ct = this.bosses.get(creatureType)
        return ct ? Array.from(ct).sort() : [];
    }

    get(itemId) {
        return this.items.find(i => i.id === itemId)
    }

    createItem5e(creatureName, item) {
        return {
            "name": `${item.name} (${creatureName})`,
            "type": "loot",
            "img": item.img,
            "system": {
                "description": {
                    "value": `<p>A ${item.name.toLowerCase()} harvested from a ${creatureName}. It may be useful in crafting!</p>`,
                },
                "source": item.source,
                "quantity": item.count,
                "weight": 0,
                "price": {
                    "value": 0,
                    "denomination": "gp"
                },
                "identified": true
            },
            flags: {
                "helianasHarvesting": {
                    "id": item.id,
                    "source": creatureName
                }
            }
        };
    }
}
