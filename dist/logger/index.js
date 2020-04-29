"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pino = require("pino");
let logger;
exports.logger = logger;
async function initConfig(config) {
    exports.logger = logger = pino(config.logger);
    logger.debug(config, '(*) Initial config');
}
exports.initConfig = initConfig;
async function disposeConfig() {
    logger.flush();
    logger.fatal('Disposed config');
}
exports.disposeConfig = disposeConfig;
//# sourceMappingURL=index.js.map