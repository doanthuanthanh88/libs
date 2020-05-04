import * as Redis from 'ioredis'
import { logger } from '../logger'

export class AuthorizCore {
  constructor(private redis: Redis.Redis) { }

  // {
  //   'project1': {
  //     "*": {
  //       "*": ["*"]
  //     },
  //     "B": {
  //       "user": [
  //         "THANH"
  //       ]
  //     },
  //     "ADMIN": {
  //       "$refs": ["USER"],
  //       "mail": [
  //         "SEND_MAIL",
  //         "GET_MAIL"
  //       ],
  //       "user": [
  //         "UPDATE_ROLE",
  //         "GET_ROLE",
  //         "FIND_ACCOUNT",
  //         "GET_ACCOUNT",
  //         "CREATE_ACCOUNT",
  //         "UPDATE_ACCOUNT",
  //         "DELETE_ACCOUNT"
  //       ]
  //     },
  //     "USER": {
  //       "$refs": ["B"],
  //       "user": [
  //         "TEST"
  //       ]
  //     }
  //   }
  // }

  async init(pj: any, pjName: string) {
    const isExisted = await this.redis.exists(`${pjName}@raw`)
    if (!isExisted) {
      logger.debug(`Init authoriz core db for project "${pjName}"`)
      await this.update(pj, pjName)
    }
  }

  async getAllRules(pjName: string) {
    const raw = await this.redis.get(`${pjName}@raw`)
    return raw ? JSON.parse(raw) : undefined
  }

  async update(pj: any, pjName: string) {
    logger.debug(`Authorize: Update project data ${pjName}`, pj)

    // Clear old data
    const isRemoveAll = Object.keys(pj).length === 0
    let removeKeys: string[]
    if (isRemoveAll) {
      removeKeys = await this.redis.keys(`${pjName}@*`)
    } else {
      removeKeys = await this.redis.keys(`${pjName}@role/*`)
    }
    if (removeKeys.length > 0) {
      await this.redis.del(...removeKeys)
    }
    if (isRemoveAll) return

    const keys = {} as any
    const refs = [] as { name: string, refs: string[], pathName: string }[]
    const pathNameRefresh = new Set<string>()
    for (const roleName in pj) {
      const role = pj[roleName]
      for (const pathName in role) {
        if (pathName !== '$refs') {
          if (!keys[pathName]) keys[pathName] = await this.redis.hgetall(`${pjName}@path/${pathName}/keys`)
          const actions = role[pathName]
          for (const action of actions) {
            if (!keys[pathName][action]) {
              pathNameRefresh.add(pathName)

              keys[pathName][action] = action === '*' ? action : await this.redis.incr(`${pjName}@id`)
              // keys[pathName][action] = action
            }
            await this.redis.sadd(`${pjName}@role/${roleName}/keys`, keys[pathName][action])
            await this.redis.sadd(`${pjName}@role/${roleName}/path/${pathName}/keys`, keys[pathName][action])
          }
        } else if (role[pathName].length > 0) {
          refs.push({ name: roleName, refs: role[pathName], pathName })
        }
      }
    }
    while (refs.length > 0) {
      const ref = refs.shift()
      if (refs.find(e => ref.refs.includes(e.name))) {
        refs.push(ref)
        continue
      }
      await this.redis.sunionstore(`${pjName}@role/${ref.name}/path/${ref.pathName}/keys`, `${pjName}@role/${ref.name}/path/${ref.pathName}/keys`, ...ref.refs.map(roleName => `${pjName}@role/${roleName}/path/${ref.pathName}/keys`))
      await this.redis.sunionstore(`${pjName}@role/${ref.name}/keys`, `${pjName}@role/${ref.name}/keys`, ...ref.refs.map(roleName => `${pjName}@role/${roleName}/keys`))
    }

    for (const pathName of pathNameRefresh.values()) {
      logger.debug(`Authorize: Please reload "${pathName}"`)
      this.redis.publish(`authoriz@update`, `${pj}:${pathName}`)
    }

    await this.redis.set(`${pjName}@raw`, JSON.stringify(pj))
  }

  async getUserActionIDs(roles: string[], pjName: string) {
    const pathOfRoles = await Promise.all(roles.map(roleName => this.redis.keys(`${pjName}@role/${roleName}/path/*/keys`)))
    const pathKeys = Array.from(new Set(pathOfRoles.flat().map(e => e.replace(/[^@]+@role\/[^\/]+\/path\/([^\/]+)\/keys/, '$1'))))
    const pathIDs = await Promise.all(pathKeys.map(pathName => this.redis.sunion(...roles.map(role => `${pjName}@role/${role}/path/${pathName}/keys`))))
    return pathKeys.reduce((sum, k, i) => {
      sum[k] = (pathIDs[i] || []).map(e => e === '*' ? '*' : +e)
      return sum
    }, {})
  }

  async getServiceActionsIDs(pathName: string, pjName: string) {
    const map = await this.redis.hgetall(`${pjName}@path/${pathName}/keys`) as { [action: string]: number | string }
    for (const k in map) {
      map[k] = map[k] === '*' ? '*' : +map[k]
    }
    return map as { [action: string]: number | '*' }
  }

}
