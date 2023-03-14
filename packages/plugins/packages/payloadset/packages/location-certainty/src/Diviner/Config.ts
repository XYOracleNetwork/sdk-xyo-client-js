import { DivinerConfig } from '@xyo-network/diviner-model'
import { LocationCertaintySchema } from '@xyo-network/location-certainty-payload-plugin'
import { XyoPayload } from '@xyo-network/payload-model'

export type LocationCertaintyDivinerConfigSchema = 'network.xyo.location.elevation.diviner.config'
export const LocationCertaintyDivinerConfigSchema: LocationCertaintyDivinerConfigSchema = 'network.xyo.location.elevation.diviner.config'

export type LocationCertaintyDivinerConfig<TConfig extends XyoPayload = XyoPayload> = DivinerConfig<
  TConfig & {
    schema: LocationCertaintyDivinerConfigSchema
    targetSchema?: LocationCertaintySchema
  }
>
