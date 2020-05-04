"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Knex = require("knex");
const logger_1 = require("./../logger");
let knex;
exports.knex = knex;
async function initKnex(config) {
    exports.knex = knex = Knex({
        ...config
    });
    logger_1.logger.debug(config, '(*) Knext connected');
}
exports.initKnex = initKnex;
async function disposeKnex() {
    logger_1.logger.fatal('Knext');
    await knex.destroy();
}
exports.disposeKnex = disposeKnex;
//# sourceMappingURL=index.js.map