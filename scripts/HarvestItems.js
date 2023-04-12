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
}
