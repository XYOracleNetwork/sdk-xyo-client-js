import 'reflect-metadata'

import { LocationCertaintyDiviner } from '@xyo-network/location-certainty-payload-plugin'
import { Initializable, LocationCertaintyDivinerConfigSchema, LocationCertaintySchema } from '@xyo-network/node-core-model'
import { JobProvider } from '@xyo-network/shared'

export class MongoDBLocationCertaintyDiviner extends LocationCertaintyDiviner implements LocationCertaintyDiviner, Initializable, JobProvider {
  constructor() {
    super({ config: { schema: LocationCertaintyDivinerConfigSchema, targetSchema: LocationCertaintySchema } })
  }
  async initialize(): Promise<void> {
    await this.start()
  }
}
