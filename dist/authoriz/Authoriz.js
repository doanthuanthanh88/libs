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
        this.authorizCore = new AuthorizCore_1.AuthorizCore(this.redis);
        this.redisSync = this.redis.duplicate();
    }
    async init(pj, pjName) {
        if (pj && pjName)
            await this.authorizCore.init(pj, pjName);
        await this.reload();
        logger_1.logger.debug(`Listened to reload @reload::${this.projectName}:${this.serviceName}`);
        await this.redisSync.subscribe(`authoriz@update`);
        this.redisSync.on('message', async (_, projectDomainService) => {
            if (`${this.projectName}:${this.serviceName}` === projectDomainService) {
                logger_1.logger.debug(`Authorize: Service "${this.serviceName}" is reloading "${projectDomainService}"`);
                await this.reload();
                if (this.callbackAfterReloadRole) {
                    logger_1.logger.debug(`Authorize: Service "${this.serviceName}" is reloading action in "${projectDomainService}"`);
                    await this.callbackAfterReloadRole();
                }
            }
        });
    }
    onAfterReloadRoles(callbackAfterReloadRole) {
        this.callbackAfterReloadRole = callbackAfterReloadRole;
    }
    async reload() {
        this.actions = await this.authorizCore.getServiceActionsIDs(this.serviceName, this.projectName);
    }
    async dispose() {
        await this.redisSync.unsubscribe(`authoriz@update`);
        this.redis.disconnect();
        this.redisSync.disconnect();
    }
    checkAuthorizByActionID(token, actionID) {
        const tokenObject = this.extractToken(token);
        if (tokenObject.rules[this.serviceName]?.includes(actionID))
            return tokenObject;
        if (tokenObject.rules['*']?.includes(actionID) || tokenObject.rules['*']?.includes('*'))
            return tokenObject;
        throw HttpError_1.forbidden(['Unauthorized', 'UNAUTHORIZED']);
    }
    refreshToken(token) {
        const rs = this.extractToken(token);
        const { iat, exp, nbf, jti, aud, iss, opts, ...data } = rs;
        return this.generateToken(data, JSON.parse(opts));
    }
    async createTokenByRoles(roles, metaData = {}, opts = {}) {
        const rules = await this.authorizCore.getUserActionIDs(roles, this.projectName);
        if (roles.length > 0 && Object.keys(rules).length === 0)
            throw HttpError_1.internal(['Could not get rule from role', 'NOT_FOUND_RULE_IN_ROLE'], { roles });
        const token = this.generateToken(Object.assign({}, metaData, {
            rules
        }), opts);
        return token;
    }
    generateToken(data, opts = {}) {
        data.opts = JSON.stringify(opts);
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