import { DivinerModule } from '@xyo-network/diviner-model'
import { LocationCertaintyDiviner } from '@xyo-network/location-certainty-plugin'
import { LocationCertaintyDivinerConfigSchema } from '@xyo-network/node-core-model'
import { JobProvider } from '@xyo-network/shared'
import merge from 'lodash/merge'

const defaultParams = {
  config: { schema: LocationCertaintyDivinerConfigSchema },
}

export type MongoDBLocationCertaintyDivinerProps = LocationCertaintyDiviner['params']

export class MongoDBLocationCertaintyDiviner<TParams extends MongoDBLocationCertaintyDivinerProps = MongoDBLocationCertaintyDivinerProps>
  extends LocationCertaintyDiviner<TParams>
  implements DivinerModule<TParams>, JobProvider
{
  static override configSchema = LocationCertaintyDivinerConfigSchema

  static override async create<TParams extends MongoDBLocationCertaintyDivinerProps>(params?: TParams) {
    const merged = params
      ? merge({
          defaultParams,
          params,
        })
      : defaultParams
    return await super.create(merged)
  }
}
