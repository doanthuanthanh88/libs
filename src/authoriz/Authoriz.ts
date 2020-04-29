import * as Redis from 'ioredis'
import { sign, verify, TokenExpiredError, SignOptions } from 'jsonwebtoken'
import { unauthorized, forbidden } from '../error/HttpError'
import { AuthorizCore } from "./AuthorizCore"
import { logger } from "../logger"

export class Authoriz {
  private actions: { [action: string]: number }
  private authorizCore: AuthorizCore
  private redisSync: Redis.Redis
  private redis: Redis.Redis
  public jwtPrivateKey: string

  constructor(redisOpts: Redis.RedisOptions, private projectName: string, private serviceName: string) {
    this.redis = new Redis(redisOpts)
    this.authorizCore = new AuthorizCore(this.redis, this.projectName)
    this.redisSync = this.redis.duplicate()
  }

  async init() {
    await this.reload()
    logger.debug(`Listened to reload @reload::${this.projectName}`)
    await this.redisSync.subscribe(`@reload::${this.projectName}`)
    this.redisSync.on('message', async (_, projectDomainService) => {
      const key = this.authorizCore.getKeyOfDomainService(this.serviceName)
      if (projectDomainService === key) {
        logger.debug(`Authorize: Service "${this.serviceName}" is reloading "${key}"`)
        await this.reload()
      }
    })
  }

  private async reload() {
    this.actions = await this.authorizCore.getActionsByServiceName(this.serviceName)
  }

  async dispose() {
    await this.redisSync.unsubscribe(`@reload::${this.projectName}`)

    this.redis.disconnect()
    this.redisSync.disconnect()
  }

  checkAuthorizByActionID(token: string, actionID: number) {
    const tokenObject = this.extractToken(token)
    if (tokenObject.rules[this.serviceName]?.includes(actionID)) return tokenObject
    throw forbidden(['Unauthorized', 'UNAUTHORIZED'])
  }

  checkAuthorizByActionName(token: string, actionName: string) {
    const tokenObject = this.extractToken(token)
    if (tokenObject.rules[this.serviceName]?.includes(this.actions[actionName])) return tokenObject
    throw forbidden(['Unauthorized', 'UNAUTHORIZED'])
  }

  async createTokenByRoles(roles: string[], metaData = {} as any) {
    const rules = await this.authorizCore.getRulesByRoles(roles)
    const token = this.generateToken(Object.assign({}, metaData, {
      rules
    }))
    return token
  }

  private generateToken(data: any, opts = {} as SignOptions) {
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
