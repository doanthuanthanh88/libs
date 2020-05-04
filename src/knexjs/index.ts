import * as Knex from 'knex'
import { logger } from '@/logger'

let knex: Knex

export async function initKnex(config: Knex.Config) {
  knex = Knex({
    ...config
  })
  logger.debug(config, '(*) Knext connected')
}

export async function disposeKnex() {
  logger.fatal('Knext')
  await knex.destroy()
}

export { knex }