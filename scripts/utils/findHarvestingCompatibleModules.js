export function findHarvestingCompatibleModules() {
    return game.modules
        .filter(m => m.active && m.flags && m.flags["helianas-harvesting"])
        .map(m => ({
            id: m.id,
            title: m.title,
            settings: m.flags['helianas-harvesting'],
            priority: m.flags['helianas-harvesting'].priority ?? 0
        }))
        .sort((a, b) => a.priority - b.priority);
}
