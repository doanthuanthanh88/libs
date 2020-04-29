"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Redis = require("ioredis");
const logger_1 = require("../logger");
let redis;
exports.redis = redis;
async function initRedis(config) {
    exports.redis = redis = new Redis(config);
    logger_1.logger.debug(config, '(*) Redis connected');
}
exports.initRedis = initRedis;
async function disposeRedis() {
    logger_1.logger.fatal('Disposed redis');
    redis.disconnect();
}
exports.disposeRedis = disposeRedis;
//# sourceMappingURL=index.js.map