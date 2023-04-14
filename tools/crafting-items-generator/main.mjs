import * as csv from 'csv/sync';
import fs from 'fs';

import { Converter } from "./Converter.mjs"
import { harvestComponentMap } from './harvestComponentMap.mjs';
import { convertToItem5e } from './convertToItem5e.mjs';
import { HarvestItemLogger } from './HarvestItemLogger.mjs';
import { createHarvestItemName } from './convertHarvestItemName.mjs';

const converter = new Converter(harvestComponentMap);
const fileData = fs.readFileSync("data/harvesting-components.csv");
const components = csv.parse(fileData, { columns: true })
    .map(line => {
        let result = converter.convertLine(line);
        // We ignore bosses on items that aren't specifically a boss drop
        if (!result.bossDrop) result.bosses = [];
        return result;
    })
    // Filter non-OGL items
    .filter(line => !line.bossDrop);


components.forEach(line => line.name = createHarvestItemName(line.name, line.creatureType));

const logger = new HarvestItemLogger();
components.forEach(l => logger.logLine(l));
logger.printInfo();

const item5ECompendium = components
    .map(convertToItem5e)
    .sort((a, b) => a._id < b._id ? -1 : 1)
    .map(obj => JSON.stringify(obj))
    .join("\n");

fs.writeFileSync("data/harvesting-components.json", JSON.stringify(components));
fs.writeFileSync("packs/dnd5e-harvesting-components.db", item5ECompendium);
