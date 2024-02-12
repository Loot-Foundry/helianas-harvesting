export class ComponentDatabase {
    _items = new Map();
    bosses = new Map();
    creatureTypes = [
        "Aberration",
        "Beast",
        "Celestial",
        "Construct",
        "Dragon",
        "Elemental",
        "Fey",
        "Fiend",
        "Giant",
        "Humanoid",
        "Monstrosity",
        "Ooze",
        "Plant",
        "Undead"
    ];

    addItem(input) {
        // We test and sanitize the input
        const item = this.#sanitizeItem(input);

        this._items.set(item.id, item);

        if (item.bossDrop) {
            const bossList = this.bosses.get(item.creatureType) ?? new Set();
            item.bosses.forEach(boss => bossList.add(boss));
            this.bosses.set(item.creatureType, bossList);
        }
    }

    #sanitizeItem(input) {
        if (!(/^[a-zA-Z0-9]{16}$/.test(input.id))) {
            console.error("Heliana's Harvesting | Invalid Item ID for ", item);
            throw new Error("Heliana's Harvesting | Invalid Item ID");
        }

        const item = {
            id: input.id
        };

        item.crafting = input.crafting === true;
        item.edible = input.edible === true;
        item.volatile = input.volatile === true;

        // Convert singular boss name to an array
        if (typeof input.bosses === "string") input.bosses = [input.bosses];

        if (Array.isArray(input.bosses) && input.bosses.every(boss => typeof boss === 'string')) {
            item.bosses = input.bosses;
        }
        else {
            item.bosses = [];
        }

        item.bossDrop = item.bosses.length > 0;

        item.dc = typeof input.dc === "number" ? input.dc : 5;
        item.name = typeof input.name === "string" ? input.name : "Unnamed Item";
        item.img = typeof input.img === "string" ? input.img : "icons/svg/item-bag.svg";
        item.source = typeof input.source === "string" ? input.source : "";
        item.creatureType = this.creatureTypes.includes(input.creatureType) ? input.creatureType : "All"

        item.crMin = typeof input.crMin === "number" ? input.crMin : 0;
        item.crMax = typeof input.crMax === "number" ? input.crMax : 40;

        item.value = typeof input.value === "number" ? input.value : item.dc * 4;
        item.rarity = typeof input.rarity === "string" ? input.rarity : "common";

        return item;
    }

    get items() {
        return Array.from(this._items.values());
    }

    hasBoss(creatureType) {
        return this.bosses.has(creatureType);
    }

    getBossNames(creatureType) {
        const ct = this.bosses.get(creatureType);
        return ct ? Array.from(ct).sort() : [];
    }

    get(itemId) {
        return this._items.get(itemId);
    }

    async exportBasicItems() {
        const rootFolder = (await Folder.create({name: "Components", type: "Item" })).id;
        const subFolders = {};

        for (const item of this.items) {
            let folderId = rootFolder;
            if (subFolders[item.creatureType]) {
                folderId = subFolders[item.creatureType];
            }
            else {
                folderId = (await Folder.create({ name: item.creatureType, type: "Item", folder: rootFolder })).id;
                subFolders[item.creatureType] = folderId;
            }

            const out = this.createGenericItem5e(item);
            out.folder = folderId;
            await Item.create(out);
        }
    }

    createItem5e(creatureName, item) {
        return {
            "name": `${item.name} (${creatureName})`,
            "type": "loot",
            "img": item.img,
            "system": {
                "rarity": item.rarity,
                "description": {
                    "value": `<p>A ${item.name.toLowerCase()} harvested from a ${creatureName}. It may be useful in crafting!</p>`,
                },
                "source": item.source,
                "quantity": item.count,
                "weight": 0,
                "price": {
                    "value": item.value,
                    "denomination": "gp"
                },
                "identified": true
            },
            "flags": {
                "helianas-harvesting": {
                    "id": item.id,
                    "source": creatureName
                }
            }
        };
    }

    createGenericItem5e(item) {
        return {
            "name": `${item.name}`,
            "type": "loot",
            "img": item.img,
            "system": {
                "rarity": item.rarity,
                "description": {
                    "value": `<p>A ${item.name.toLowerCase()} harvested from a ${item.creatureType.toLowerCase()}. It may be useful in crafting!</p>`,
                },
                "source": item.source,
                "quantity": 1,
                "weight": 0,
                "price": {
                    "value": item.value,
                    "denomination": "gp"
                },
                "identified": true
            },
            "flags": {
                "helianas-harvesting": {
                    "id": item.id,
                }
            }
        };
    }
}
