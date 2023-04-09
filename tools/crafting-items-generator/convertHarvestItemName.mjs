export function createHarvestItemName(name, creatureType) {
    let result = name.toLowerCase().replace(/\b./g, a => a.toUpperCase());

    if (result.includes(" Of ")) {
        result = result.replace(" Of ", ` of ${creatureType} `);
    }
    else {
        result = `${creatureType} ${result}`;
    }

    return result;
}
