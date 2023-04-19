import { LocationCertaintyDivinerConfig, LocationCertaintyDivinerConfigSchema } from '@xyo-network/diviner'
import { DivinerModule, DivinerParams } from '@xyo-network/diviner-model'
import { LocationCertaintyDiviner } from '@xyo-network/location-certainty-plugin'
import { AnyConfigSchema } from '@xyo-network/module-model'

export type MongoDBLocationCertaintyDivinerParams = DivinerParams<AnyConfigSchema<LocationCertaintyDivinerConfig>>

export class MongoDBLocationCertaintyDiviner<TParams extends MongoDBLocationCertaintyDivinerParams = MongoDBLocationCertaintyDivinerParams>
  extends LocationCertaintyDiviner<TParams>
  implements DivinerModule<TParams>
{
  static override configSchema = LocationCertaintyDivinerConfigSchema
}
