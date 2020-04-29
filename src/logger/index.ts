import * as pino from 'pino'

let logger: pino.Logger

export async function initConfig(config) {
  logger = pino(config.logger)
  logger.debug(config, '(*) Initial config')
}

export async function disposeConfig() {
  logger.flush()
  logger.fatal('Disposed config')
}

export { logger }
