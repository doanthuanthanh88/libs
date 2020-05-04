"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../logger");
class AuthorizCore {
    constructor(redis) {
        this.redis = redis;
    }
    async init(pj, pjName) {
        const isExisted = await this.redis.exists(`${pjName}@raw`);
        if (!isExisted) {
            logger_1.logger.debug(`Init authoriz core db for project "${pjName}"`);
            await this.update(pj, pjName);
        }
    }
    async getAllRules(pjName) {
        const raw = await this.redis.get(`${pjName}@raw`);
        return raw ? JSON.parse(raw) : undefined;
    }
    async update(pj, pjName) {
        logger_1.logger.debug(`Authorize: Update project data ${pjName}`, pj);
        const isRemoveAll = Object.keys(pj).length === 0;
        let removeKeys;
        if (isRemoveAll) {
            removeKeys = await this.redis.keys(`${pjName}@*`);
        }
        else {
            removeKeys = await this.redis.keys(`${pjName}@role/*`);
        }
        if (removeKeys.length > 0) {
            await this.redis.del(...removeKeys);
        }
        if (isRemoveAll)
            return;
        const keys = {};
        const refs = [];
        const pathNameRefresh = new Set();
        for (const roleName in pj) {
            const role = pj[roleName];
            for (const pathName in role) {
                if (pathName !== '$refs') {
                    if (!keys[pathName])
                        keys[pathName] = await this.redis.hgetall(`${pjName}@path/${pathName}/keys`);
                    const actions = role[pathName];
                    for (const action of actions) {
                        if (!keys[pathName][action]) {
                            pathNameRefresh.add(pathName);
                            keys[pathName][action] = action === '*' ? action : await this.redis.incr(`${pjName}@id`);
                        }
                        await this.redis.sadd(`${pjName}@role/${roleName}/keys`, keys[pathName][action]);
                        await this.redis.sadd(`${pjName}@role/${roleName}/path/${pathName}/keys`, keys[pathName][action]);
                    }
                }
                else if (role[pathName].length > 0) {
                    refs.push({ name: roleName, refs: role[pathName], pathName });
                }
            }
        }
        while (refs.length > 0) {
            const ref = refs.shift();
            if (refs.find(e => ref.refs.includes(e.name))) {
                refs.push(ref);
                continue;
            }
            await this.redis.sunionstore(`${pjName}@role/${ref.name}/path/${ref.pathName}/keys`, `${pjName}@role/${ref.name}/path/${ref.pathName}/keys`, ...ref.refs.map(roleName => `${pjName}@role/${roleName}/path/${ref.pathName}/keys`));
            await this.redis.sunionstore(`${pjName}@role/${ref.name}/keys`, `${pjName}@role/${ref.name}/keys`, ...ref.refs.map(roleName => `${pjName}@role/${roleName}/keys`));
        }
        for (const pathName of pathNameRefresh.values()) {
            logger_1.logger.debug(`Authorize: Please reload "${pathName}"`);
            this.redis.publish(`authoriz@update`, `${pj}:${pathName}`);
        }
        await this.redis.set(`${pjName}@raw`, JSON.stringify(pj));
    }
    async getUserActionIDs(roles, pjName) {
        const pathOfRoles = await Promise.all(roles.map(roleName => this.redis.keys(`${pjName}@role/${roleName}/path/*/keys`)));
        const pathKeys = Array.from(new Set(pathOfRoles.flat().map(e => e.replace(/[^@]+@role\/[^\/]+\/path\/([^\/]+)\/keys/, '$1'))));
        const pathIDs = await Promise.all(pathKeys.map(pathName => this.redis.sunion(...roles.map(role => `${pjName}@role/${role}/path/${pathName}/keys`))));
        return pathKeys.reduce((sum, k, i) => {
            sum[k] = (pathIDs[i] || []).map(e => e === '*' ? '*' : +e);
            return sum;
        }, {});
    }
    async getServiceActionsIDs(pathName, pjName) {
        const map = await this.redis.hgetall(`${pjName}@path/${pathName}/keys`);
        for (const k in map) {
            map[k] = map[k] === '*' ? '*' : +map[k];
        }
        return map;
    }
}
exports.AuthorizCore = AuthorizCore;
//# sourceMappingURL=AuthorizCore.js.map