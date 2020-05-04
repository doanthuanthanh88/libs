import * as Redis from 'ioredis'
import { sign, verify, TokenExpiredError, SignOptions } from 'jsonwebtoken'
import { unauthorized, forbidden, internal } from '../error/HttpError'
import { AuthorizCore } from "./AuthorizCore"
import { logger } from "../logger"

export class Authoriz {
  private actions: { [action: string]: number | '*' }
  private redisSync: Redis.Redis
  private redis: Redis.Redis
  private callbackAfterReloadRole: Function
  public jwtPrivateKey: string
  public authorizCore: AuthorizCore

  constructor(redisOpts: Redis.RedisOptions, private projectName: string, private serviceName: string) {
    this.redis = new Redis(redisOpts)
    this.authorizCore = new AuthorizCore(this.redis)
    this.redisSync = this.redis.duplicate()
  }

  async init(pj?: any, pjName?: string) {
    if (pj && pjName) await this.authorizCore.init(pj, pjName)

    await this.reload()
    logger.debug(`Listened to reload @reload::${this.projectName}:${this.serviceName}`)
    await this.redisSync.subscribe(`authoriz@update`)
    this.redisSync.on('message', async (_, projectDomainService) => {
      if (`${this.projectName}:${this.serviceName}` === projectDomainService) {
        logger.debug(`Authorize: Service "${this.serviceName}" is reloading "${projectDomainService}"`)
        await this.reload()
        if (this.callbackAfterReloadRole) {
          logger.debug(`Authorize: Service "${this.serviceName}" is reloading action in "${projectDomainService}"`)
          await this.callbackAfterReloadRole()
        }
      }
    })
  }

  public onAfterReloadRoles(callbackAfterReloadRole: Function) {
    this.callbackAfterReloadRole = callbackAfterReloadRole
  }

  private async reload() {
    this.actions = await this.authorizCore.getServiceActionsIDs(this.serviceName, this.projectName)
  }

  async dispose() {
    await this.redisSync.unsubscribe(`authoriz@update`)

    this.redis.disconnect()
    this.redisSync.disconnect()
  }

  checkAuthorizByActionID(token: string, actionID: number) {
    const tokenObject = this.extractToken(token)
    if (tokenObject.rules[this.serviceName]?.includes(actionID)) return tokenObject
    if (tokenObject.rules['*']?.includes(actionID) || tokenObject.rules['*']?.includes('*')) return tokenObject
    throw forbidden(['Unauthorized', 'UNAUTHORIZED'])
  }

  refreshToken(token: string) {
    const rs = this.extractToken(token)
    const { iat, exp, nbf, jti, aud, iss, opts, ...data } = rs
    return this.generateToken(data, JSON.parse(opts))
  }

  async createTokenByRoles(roles: string[], metaData = {} as any, opts = {} as SignOptions) {
    const rules = await this.authorizCore.getUserActionIDs(roles, this.projectName)
    if (roles.length > 0 && Object.keys(rules).length === 0) throw internal(['Could not get rule from role', 'NOT_FOUND_RULE_IN_ROLE'], { roles })
    const token = this.generateToken(Object.assign({}, metaData, {
      rules
    }), opts)
    return token
  }

  private generateToken(data: any, opts = {} as SignOptions) {
    data.opts = JSON.stringify(opts)
    const token = sign(data, this.jwtPrivateKey, opts)

    return { token, expiresIn: opts.expiresIn }
  }

  extractToken(token: string) {
    try {
      // 'Bearer '
      const rs = verify(token, this.jwtPrivateKey,
        // { algorithms: ['HS256'] }
      ) as { [key: string]: any }
      return rs
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        throw unauthorized(['Token expired', 'TOKEN_EXPIRED'])
      }
      throw unauthorized([err.message, 'TOKEN_INVALID'], { token, error: err })
    }
  }

  getActionID(action: string) {
    return this.actions[action]
  }

}
