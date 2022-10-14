import { XyoDivinerConfig } from '@xyo-network/diviner'
import { XyoPayload } from '@xyo-network/payload'

import { LocationCertaintyPayload } from '../Payload'
import { LocationCertaintySchema } from '../Schema'

export type LocationCertaintyDivinerConfigSchema = 'network.xyo.location.elevation.diviner.config'
export const LocationCertaintyDivinerConfigSchema: LocationCertaintyDivinerConfigSchema = 'network.xyo.location.elevation.diviner.config'

export type LocationCertaintyDivinerConfig<TConfig extends XyoPayload = XyoPayload> = XyoDivinerConfig<
  LocationCertaintyPayload,
  TConfig & {
    schema: LocationCertaintyDivinerConfigSchema
    targetSchema: LocationCertaintySchema
  }
>
