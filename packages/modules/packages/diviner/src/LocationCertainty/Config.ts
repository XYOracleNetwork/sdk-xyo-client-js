import { DivinerConfig } from '@xyo-network/diviner-model'
import { Payload } from '@xyo-network/payload-model'

import { LocationCertaintyDivinerSchema } from './Schema'

export type LocationCertaintyDivinerConfigSchema = `${LocationCertaintyDivinerSchema}.config`
export const LocationCertaintyDivinerConfigSchema: LocationCertaintyDivinerConfigSchema = `${LocationCertaintyDivinerSchema}.config`

export type LocationCertaintyDivinerConfig<T extends Payload = Payload> = DivinerConfig<
  T & {
    schema: LocationCertaintyDivinerConfigSchema
  }
>
