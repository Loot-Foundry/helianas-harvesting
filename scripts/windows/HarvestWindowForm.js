export class HarvestWindowForm {
    creatureName = "";
    creatureType = "";
    creatureCR = 0;
    isBoss = false;
    bossName = "";
    itemCount = {};

    harvestItems = [];
    harvestCheckTotal = 0;
    harvestingCharacter = "";

    constructor(itemData) {
        this.itemData = itemData;
    }

    updateForm(options) {
        let resetItems = false;
        if (!options) options = {};

        if (this.#changed(options, "creatureName")) {
            this.creatureName = options.creatureName
        }

        if (this.#changed(options, "creatureType")) {
            this.creatureType = options.creatureType;
            resetItems = true;
        }

        if (this.#changed(options, "creatureCR")) {
            const creatureCR = parseFloat(options.creatureCR);
            this.creatureCR = creatureCR;
        }

        if (this.#changed(options, "isBoss")) {
            this.isBoss = options.isBoss;
            if (!this.isBoss) {
                this.bossName = "";
            }
            resetItems = true;
        }

        // Update the boss name
        if (this.#changed(options, "bossName")) {
            this.bossName = options.bossName;
            resetItems = true;
        }

        // Validate boss name
        if (this.isBoss) {
            const bossNames = this.itemData.getBossNames(this.creatureType);
            if (bossNames.length === 0) {
                this.isBoss = false;
                this.bossName = "";
                resetItems = true;
            } else if (!bossNames.includes(this.bossName)) {
                this.bossName = bossNames[0];
                resetItems = true;
            }
        }

        if (resetItems) {
            this.itemCount = {};
            this.harvestItems = [];
        }

        if (this.#changed(options, "harvestCheckTotal")) {
            const checkTotal = parseInt(options.harvestAttemptCheckbox);
            this.harvestCheckTotal = Number.isInteger(checkTotal) ? checkTotal : "";
        }

        if (this.#changed(options, "itemCount")) {
            this.itemCount = options.itemCount;

            // Generate harvest table
            this.generateHarvestTable();
        }

        // Update Harvest DCs
        let DC = 0;
        this.harvestItems.forEach(harvest => {
            harvest.success = false;
            if (harvest.attempt) {
                DC += harvest.item.dc;
                harvest.DC = DC;
                if (harvest.DC <= this.harvestCheckTotal) {
                    harvest.success = true;
                }
            }
            else {
                harvest.DC = "N/A";
            }
        });

        if (this.#changed(options, "harvestCheckTotal")) {
            this.harvestCheckTotal = options.harvestCheckTotal;
        }

        if (this.#changed(options, "harvestingCharacter")) {
            this.harvestingCharacter = options.harvestingCharacter;
        }
    }

    #changed(options, optionName) {
        const defined = typeof (options[optionName]) !== "undefined";
        const optionType = typeof (this[optionName]);

        if (optionType === "undefined") throw new Error(`Unknown form type '${optionName}'`);

        if (defined) {
            if (optionType === "string") {
                return options[optionName] !== this[optionName];
            }

            if (optionType === "number") {
                return parseInt(options[optionName]) !== this[optionName] || parseFloat(options[optionName]) !== this[optionName];
            }

            return true;
        }

        return false;
    }

    generateHarvestTable() {
        this.harvestItems = [];
        Object.entries(this.itemCount).forEach(([itemId, count]) => {
            const item = this.itemData.get(itemId);

            for (let itemCount = 1; itemCount <= count; itemCount++) {
                this.harvestItems.push({
                    showCount: count > 1,
                    itemCount,
                    attempt: true,
                    item
                });
            }
        });
    }

    reorderHarvestTable(sourceIndex, targetIndex) {
        if (sourceIndex === targetIndex) return;
        let items = this.harvestItems;
        const ele = items[sourceIndex];

        // Add the item at the targetIndex.
        items = [
            ...items.slice(0, targetIndex),
            ele,
            ...items.slice(targetIndex)
        ];

        // If the sourceIndex comes after the targetIndex, it just moved.
        if (sourceIndex > targetIndex)
            sourceIndex++;

        // Remove the old copy of the item
        items.splice(sourceIndex, 1);

        this.harvestItems = items;
    }

    getItemCount(selectedType, bossName, selectedCR) {
        return this.itemData.items
            .filter(item => {
                return (item.creatureType === selectedType || item.creatureType === "All") &&
                    (selectedCR >= item.crMin && selectedCR <= item.crMax) &&
                    (!item.bossDrop || item.bosses.includes(bossName));
            })
            .map(item => {
                const count = this.itemCount[item.id] ?? "";
                return { count, ...item };
            });
    }

    getHarvestComponents(dc = 10000) {
        const items = new Map();

        for (const row of this.harvestItems) {
            if (row.DC <= dc) {
                const item = items.get(row.item.id);
                if (item) {
                    item.count++;
                }
                else {
                    items.set(row.item.id, { ...row.item, count: 1 });
                }

            }
        }

        return Array.from(items.values()).sort((a, b) => {
            if (a.dc === b.dc) return a.name.localeCompare(b.name);
            return a.dc - b.dc;
        });
    }
}
