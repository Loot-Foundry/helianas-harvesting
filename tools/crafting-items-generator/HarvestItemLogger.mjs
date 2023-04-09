export class HarvestItemLogger {
    info = {
        sources: {},
        creatureTypes: {},
        bosses: {},
        bossDrops: 0,
        edible: 0,
        volatile: 0,
        crafting: 0,
        total: 0
    };

    printInfo() {
        this.#printInfoInternal(this.info, 0);
    }

    #printInfoInternal(info, depth) {
        for (let key in info) {
            if (typeof info[key] === "object") {
                console.info('\t'.repeat(depth), key);
                this.#printInfoInternal(info[key], depth + 1);
            }
            else {
                console.info('\t'.repeat(depth), key, "-", info[key]);
            }
        }
    }

    #addData(info, name) {
        if (info[name])
            info[name]++;
        else
            info[name] = 1;
    }

    logLine(line) {
        this.info.total++;
        this.#addData(this.info.sources, line.source);
        this.#addData(this.info.creatureTypes, line.creatureType);
        line.bosses.forEach(boss => this.#addData(this.info.bosses, boss));

        if (line.bossDrop)
            this.info.bossDrops++;
        if (line.volatile)
            this.info.volatile++;
        if (line.crafting)
            this.info.crafting++;
        if (line.edible)
            this.info.edible++;
    }
}