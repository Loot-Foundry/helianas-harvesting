/**
 * Loads a JSON array file of elements into a map indexed by `resourceKeyName`
 *
 * @param {string} filename
 * @param {Map<string, any>} resourceMap
 * @param {string} resourceKeyName
 * @param {string} source
 *
 * @returns
 */
export async function loadResourceFile(filename, resourceMap, resourceKeyName, source) {
    const contents = await fetch(filename);
    const elements = await contents.json();

    const stats = { loaded: 0, replaced: 0, errors: 0 };

    elements.forEach(element => {
        const key = element[resourceKeyName];
        element.source = source;
        stats.loaded++;
        if (resourceMap.has(key)) {
            stats.replaced++;
        }
        resourceMap.set(key, element);
    });

    return stats;
}
