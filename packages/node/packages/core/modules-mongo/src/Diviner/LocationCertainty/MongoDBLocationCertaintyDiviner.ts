import { LocationCertaintyDiviner } from '@xyo-network/location-certainty-payload-plugin'
import { XyoModuleParams } from '@xyo-network/module'
import {
  Initializable,
  LocationCertaintyDivinerConfig,
  LocationCertaintyDivinerConfigSchema,
  LocationCertaintySchema,
} from '@xyo-network/node-core-model'
import { JobProvider } from '@xyo-network/shared'
import merge from 'lodash/merge'

const defaultParams = {
  config: { schema: LocationCertaintyDivinerConfigSchema, targetSchema: LocationCertaintySchema },
}

export class MongoDBLocationCertaintyDiviner extends LocationCertaintyDiviner implements LocationCertaintyDiviner, Initializable, JobProvider {
  static override async create(
    params?: Partial<XyoModuleParams<LocationCertaintyDivinerConfig<LocationCertaintySchema>>>,
  ): Promise<MongoDBLocationCertaintyDiviner> {
    const merged = params
      ? merge({
          defaultParams,
          params,
        })
      : defaultParams
    return (await super.create(merged)) as MongoDBLocationCertaintyDiviner
  }
  async initialize(): Promise<void> {
    await this.start()
  }
}
