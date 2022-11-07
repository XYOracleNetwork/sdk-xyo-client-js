import 'reflect-metadata'

import { XyoAccount } from '@xyo-network/account'
import { LocationCertaintyDiviner } from '@xyo-network/location-certainty-payload-plugin'
import { Initializable, LocationCertaintyDivinerConfigSchema, LocationCertaintySchema } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { JobProvider, Logger } from '@xyo-network/shared'
import { inject, injectable } from 'inversify'

@injectable()
export class MongoDBLocationCertaintyDiviner extends LocationCertaintyDiviner implements LocationCertaintyDiviner, Initializable, JobProvider {
  constructor(@inject(TYPES.Logger) logger: Logger, @inject(TYPES.Account) protected readonly account: XyoAccount) {
    super({ account, config: { schema: LocationCertaintyDivinerConfigSchema, targetSchema: LocationCertaintySchema }, logger })
  }
  async initialize(): Promise<void> {
    await this.start()
  }
}
