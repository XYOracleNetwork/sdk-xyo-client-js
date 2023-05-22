import { DivinerConfig } from '@xyo-network/diviner-model'
import { Payload } from '@xyo-network/payload-model'

import { PayloadStatsDivinerSchema } from './Schema'

export type PayloadStatsDivinerConfigSchema = `${PayloadStatsDivinerSchema}.config`
export const PayloadStatsDivinerConfigSchema: PayloadStatsDivinerConfigSchema = `${PayloadStatsDivinerSchema}.config`

export type PayloadStatsDivinerConfig<T extends Payload = Payload> = DivinerConfig<
  T & {
    schema: PayloadStatsDivinerConfigSchema
  }
>
