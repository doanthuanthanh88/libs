import * as Redis from 'ioredis'
import { logger } from '../logger'

let redis: Redis.Redis

export async function initRedis(config) {
  redis = new Redis(config)
  logger.debug(config, '(*) Redis connected')
}

export async function disposeRedis() {
  logger.fatal('Disposed redis')
  redis.disconnect()
}

export { redis }