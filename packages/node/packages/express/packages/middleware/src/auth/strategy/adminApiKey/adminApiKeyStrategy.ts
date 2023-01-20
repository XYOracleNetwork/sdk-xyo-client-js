import 'reflect-metadata'

import { Logger } from '@xylabs/sdk-api-express-ecs'
import { TYPES } from '@xyo-network/node-core-types'
import { Request } from 'express'
import { inject, injectable } from 'inversify'
import { Strategy, StrategyCreated, StrategyCreatedStatic } from 'passport'

@injectable()
export class AdminApiKeyStrategy extends Strategy {
  constructor(
    @inject(TYPES.ApiKey) public readonly apiKey: string,
    @inject(TYPES.Logger) public readonly logger: Logger,
    public readonly apiKeyHeader = 'x-api-key',
  ) {
    super()
  }

  override authenticate(this: StrategyCreated<this, this & StrategyCreatedStatic>, req: Request, _options?: unknown) {
    try {
      if (req.headers[this.apiKeyHeader] !== this.apiKey) {
        this.fail('Invalid API key')
        return
      }
      this.success(req.user || {})
      return
    } catch (error) {
      this.logger.error(JSON.stringify(error, null, 2))
      this.error({ message: 'Admin API Key Auth Error' })
    }
  }
}
