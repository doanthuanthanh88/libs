import * as Knex from 'knex'
import { logger } from '@/libs/logger'

let knex: Knex

export async function initKnex(config: Knex.Config) {
  knex = Knex({
    ...config
  })
  logger.debug(config, '(*) Knext connected')
}

export async function disposeKnex() {
  logger.fatal('Knext postgres')
  await knex.destroy()
}

export { knex }