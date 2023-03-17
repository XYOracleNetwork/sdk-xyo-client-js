import { DivinerConfig } from '@xyo-network/diviner-model'
import { LocationCertaintySchema } from '@xyo-network/location-certainty-payload-plugin'
import { Payload } from '@xyo-network/payload-model'

export type LocationCertaintyDivinerConfigSchema = 'network.xyo.location.elevation.diviner.config'
export const LocationCertaintyDivinerConfigSchema: LocationCertaintyDivinerConfigSchema = 'network.xyo.location.elevation.diviner.config'

export type LocationCertaintyDivinerConfig<TConfig extends Payload = Payload> = DivinerConfig<
  TConfig & {
    schema: LocationCertaintyDivinerConfigSchema
    targetSchema?: LocationCertaintySchema
  }
>
