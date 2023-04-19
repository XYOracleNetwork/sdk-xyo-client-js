import { AbstractNode } from '@xyo-network/modules'
import { Logger } from '@xyo-network/shared'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Application {
      logger: Logger
      node: AbstractNode
    }
  }
}

export * from './doc'
export * from './LoggingErrorHandler'
export * from './nodeEnv'
export * from './standardResponses'
