import * as Redis from 'ioredis'
import { logger } from '../logger'

export class AuthorizCore {
  constructor(private redis: Redis.Redis, private projectName?: string) { }

  // {
  //   USER: {
  //     oauth: ['SEND', 'ADD', 'SEARCH', 'THANH'],
  //     mail: ['TEST', 'SEND']
  //   },
  //   MOD: {
  //     $refs: ['USER'],
  //     files: ['UPLOAD']
  //   },
  //   ADMIN: {
  //     oauth: ['SEND']
  //   }
  // }

  async getAllRules(projectName = this.projectName) {
    const rs = await this.redis.get(`raw@${projectName}`)
    return rs ? JSON.parse(rs) : rs
  }

  async updateRules(roles: any, projectName = this.projectName) {
    const keepActions = {} as { [key: string]: Set<string> }
    const addActions = {} as { [key: string]: string[] }
    const removeActions = {} as { [key: string]: string[] }
    const addRules = {} as { [key: string]: string[] }
    const removeRules = {} as { [key: string]: string[] }
    const removeCount = {} as { [key: string]: number }

    const serviceNames = (await this.redis.keys(`actions@${projectName}:*`)).map(a => a.replace(`actions@${projectName}:`, ''))
    for (const serviceName of serviceNames) {
      removeActions[`${projectName}:${serviceName}`] = await this.redis.hkeys(`actions@${projectName}:${serviceName}`)
      keepActions[`${projectName}:${serviceName}`] = new Set<string>()
      removeCount[`${projectName}:${serviceName}`] = removeActions[`${projectName}:${serviceName}`].length
    }

    const roleNames = (await this.redis.keys(`rules@${projectName}:*`)).map(r => r.replace(`rules@${projectName}:`, ''))
    for (const roleName of roleNames) {
      removeRules[`${projectName}:${roleName}`] = await this.redis.smembers(`rules@${projectName}:${roleName}`)
    }

    for (const roleName in roles) {
      const rules = roles[roleName]

      if (!removeRules[`${projectName}:${roleName}`]) removeRules[`${projectName}:${roleName}`] = []
      if (!addRules[`${projectName}:${roleName}`]) addRules[`${projectName}:${roleName}`] = []

      for (const serviceName in rules) {
        if (serviceName !== '$refs') {
          const actions = rules[serviceName] as string[]

          if (!removeActions[`${projectName}:${serviceName}`]) removeActions[`${projectName}:${serviceName}`] = []
          if (!keepActions[`${projectName}:${serviceName}`]) keepActions[`${projectName}:${serviceName}`] = new Set<string>()
          if (!addActions[`${projectName}:${serviceName}`]) addActions[`${projectName}:${serviceName}`] = []

          if (!removeRules[`${projectName}:${roleName}`].includes(serviceName)) {
            addRules[`${projectName}:${roleName}`].push(serviceName)
          } else {
            removeRules[`${projectName}:${roleName}`].splice(removeRules[`${projectName}:${roleName}`].indexOf(serviceName), 1)
          }

          for (const action of actions) {
            keepActions[`${projectName}:${serviceName}`].add(action)
            if (!removeActions[`${projectName}:${serviceName}`].includes(action)) {
              addActions[`${projectName}:${serviceName}`].push(action)
            } else {
              removeActions[`${projectName}:${serviceName}`].splice(removeActions[`${projectName}:${serviceName}`].indexOf(action), 1)
            }
          }
        } else {
          const roleRefers = rules[serviceName]
          for (const serviceName of roleRefers) {
            if (!removeRules[`${projectName}:${roleName}`].includes(`$${serviceName}`)) {
              addRules[`${projectName}:${roleName}`].push(`$${serviceName}`)
            } else {
              removeRules[`${projectName}:${roleName}`].splice(removeRules[`${projectName}:${roleName}`].indexOf(`$${serviceName}`), 1)
            }
          }
        }
      }
    }

    // Handle add and remove action
    for (let k in removeActions) {
      removeActions[k] = removeActions[k].filter(a => !keepActions[k].has(a))
    }

    const serviceChanges = new Set<string>()

    await Promise.all([
      ...Object.keys(addActions).map(async (key) => {
        const obj = {} as any
        for (const action of addActions[key]) {
          obj[action] = await this.redis.incr(`count@${key}`)
        }
        if (Object.keys(obj).length > 0) {
          logger.debug({
            key,
            actions: addActions[key]
          }, 'addActions')
          await this.redis.hmset(`actions@${key}`, obj)
          serviceChanges.add(key)
        }
      }),
      ...Object.keys(removeActions).map(async (key) => {
        const actions = removeActions[key]
        if (actions.length > 0) {
          logger.debug({
            key,
            actions: removeActions[key]
          }, 'removeActions')
          await this.redis.hdel(`actions@${key}`, ...actions)
          if (removeCount[`${key}`] && removeCount[`${key}`] === actions.length) {
            await this.redis.del(`count@${key}`)
          }
          serviceChanges.add(key)
        }
      }),
      ...Object.keys(addRules).filter(key => addRules[key].length > 0).map(async (key) => {
        logger.debug({
          key,
          actions: addRules[key]
        }, 'addRules')
        await this.redis.sadd(`rules@${key}`, ...addRules[key])
      }),
      ...Object.keys(removeRules).filter(key => removeRules[key].length > 0).map(async (key) => {
        logger.debug({
          key,
          actions: removeRules[key]
        }, 'removeRules')
        await this.redis.srem(`rules@${key}`, ...removeRules[key])
      })
    ])

    await this.redis.set(`raw@${projectName}`, JSON.stringify(roles))

    if (serviceChanges.size > 0) {
      [...serviceChanges].forEach(serviceName => {
        logger.debug(`Authorize: Please reload "${serviceName}"`)
        this.redis.publish(`@reload::${projectName}`, serviceName)
      })
    }

  }

  getKeyOfDomainService(serviceName: string, projectName = this.projectName) {
    return `${projectName}:${serviceName}`
  }

  async getRulesByRoles(roles: string[], projectName = this.projectName) {
    let rules = await this._getRules(roles, projectName)

    const actionArrIds = await Promise.all(rules.map(serviceName => this.redis.hvals(`actions@${projectName}:${serviceName}`)))
    const actionIds = actionArrIds.reduce((sum, ids, i) => {
      sum[rules[i]] = ids.map(id => +id)
      return sum
    }, {})

    return actionIds
  }

  async getActionsByServiceName(serviceName: string, projectName = this.projectName) {
    const actions = await this.redis.hgetall(`actions@${projectName}:${serviceName}`)
    const rs = {} as { [action: string]: number }
    Object.keys(actions).forEach(k => rs[k] = +actions[k])
    return rs
  }

  private async _getRules(roles: string[], projectName: string) {
    let rules = await this.redis.sunion(...roles.map(role => `rules@${projectName}:${role}`))
    const roleRefers = rules.filter(r => r[0] === '$').map(r => r.substr(1))
    if (roleRefers.length > 0) {
      rules = rules.filter(r => r[0] !== '$').concat(await this._getRules(roleRefers, projectName))
    }
    return rules as string[]
  }
}
