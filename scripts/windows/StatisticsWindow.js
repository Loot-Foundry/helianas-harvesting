import { Config } from "../config.js";

export default class StatisticsWindow extends Application {

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: Config.StatisticsWindowTemplate,
            classes: ['helianas-harvesting-module'],
            width: 500,
            height: 200,
            resizable: false,
            title: "HelianasHarvest.StatisticsWindowTitle"
        });
    }

    getData() {
        const data = super.getData();
        data.stats = game.modules.get('helianas-harvesting').api.stats;
        return data;
    }

}
