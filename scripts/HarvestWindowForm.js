export class HarvestWindowForm {
    creatureType = "";
    isBoss = false;
    bossName = "";
    itemCount = {};
    harvestItems = [];
    harvestCheckTotal = null;

    constructor(itemData) {
        this.itemData = itemData;
    }

    updateForm(options) {
        let resetItems = false;
        if (!options) options = {};

        if (typeof options.creatureType !== "undefined" && this.creatureType !== options.creatureType) {
            this.creatureType = options.creatureType;
            resetItems = true;
        }

        if (typeof options.isBoss !== "undefined" && options.isBoss !== this.isBoss) {
            this.isBoss = options.isBoss;
            if (!this.isBoss) {
                this.bossName = "";
            }
            resetItems = true;
        }

        // Update the boss name
        if (typeof options.bossName !== "undefined" && options.bossName !== this.bossName) {
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

        if (typeof options.harvestCheckTotal !== "undefined") {
            const checkTotal = parseInt(options.harvestAttemptCheckbox);
            this.harvestCheckTotal = Number.isInteger(checkTotal) ? checkTotal : "";
        }

        if (typeof options.itemCount !== "undefined") {
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

    getItemCount(selectedType, bossName) {
        return this.itemData.items
            .filter(item => {
                return item.creatureType === selectedType &&
                    (!item.bossDrop || item.bosses.includes(bossName));
            })
            .map(item => {
                const count = this.itemCount[item.id] ?? "";
                return { count, ...item };
            });
    }
}
