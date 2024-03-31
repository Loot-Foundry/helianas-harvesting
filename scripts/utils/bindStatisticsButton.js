import CraftingWindow from "../windows/CraftingWindow.js";
import HarvestWindow from "../windows/HarvestWindow.js";
import StatisticsWindow from "../windows/StatisticsWindow.js";

export function bindStatisticsButton(window, buttons) {
    if (window instanceof HarvestWindow || window instanceof CraftingWindow) {
        buttons.unshift({
            label: 'HelianasHarvest.StatisticsLabel',
            class: 'stats',
            onclick: () => {
                const sw = new StatisticsWindow();
                sw.render(true);
            }
        });
    }
}
