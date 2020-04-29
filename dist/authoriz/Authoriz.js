"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Redis = require("ioredis");
const jsonwebtoken_1 = require("jsonwebtoken");
const HttpError_1 = require("../error/HttpError");
const AuthorizCore_1 = require("./AuthorizCore");
const logger_1 = require("../logger");
class Authoriz {
    constructor(redisOpts, projectName, serviceName) {
        this.projectName = projectName;
        this.serviceName = serviceName;
        this.redis = new Redis(redisOpts);
        this.authorizCore = new AuthorizCore_1.AuthorizCore(this.redis, this.projectName);
        this.redisSync = this.redis.duplicate();
    }
    async init() {
        await this.reload();
        logger_1.logger.debug(`Listened to reload @reload::${this.projectName}`);
        await this.redisSync.subscribe(`@reload::${this.projectName}`);
        this.redisSync.on('message', async (_, projectDomainService) => {
            const key = this.authorizCore.getKeyOfDomainService(this.serviceName);
            if (projectDomainService === key) {
                logger_1.logger.debug(`Authorize: Service "${this.serviceName}" is reloading "${key}"`);
                await this.reload();
            }
        });
    }
    async reload() {
        this.actions = await this.authorizCore.getActionsByServiceName(this.serviceName);
    }
    async dispose() {
        await this.redisSync.unsubscribe(`@reload::${this.projectName}`);
        this.redis.disconnect();
        this.redisSync.disconnect();
    }
    checkAuthorizByActionID(token, actionID) {
        const tokenObject = this.extractToken(token);
        if (tokenObject.rules[this.serviceName]?.includes(actionID))
            return tokenObject;
        throw HttpError_1.forbidden(['Unauthorized', 'UNAUTHORIZED']);
    }
    checkAuthorizByActionName(token, actionName) {
        const tokenObject = this.extractToken(token);
        if (tokenObject.rules[this.serviceName]?.includes(this.actions[actionName]))
            return tokenObject;
        throw HttpError_1.forbidden(['Unauthorized', 'UNAUTHORIZED']);
    }
    async createTokenByRoles(roles, metaData = {}) {
        const rules = await this.authorizCore.getRulesByRoles(roles);
        const token = this.generateToken(Object.assign({}, metaData, {
            rules
        }));
        return token;
    }
    generateToken(data, opts = {}) {
        const token = jsonwebtoken_1.sign(data, this.jwtPrivateKey, opts);
        return { token, expiresIn: opts.expiresIn };
    }
    extractToken(token) {
        try {
            const rs = jsonwebtoken_1.verify(token, this.jwtPrivateKey);
            return rs;
        }
        catch (err) {
            if (err instanceof jsonwebtoken_1.TokenExpiredError) {
                throw HttpError_1.unauthorized(['Token expired', 'TOKEN_EXPIRED']);
            }
            throw HttpError_1.unauthorized([err.message, 'TOKEN_INVALID'], { token, error: err });
        }
    }
    getActionID(action) {
        return this.actions[action];
    }
}
exports.Authoriz = Authoriz;
//# sourceMappingURL=Authoriz.js.map