import { DivinerConfig } from '@xyo-network/diviner-model'
import { Payload } from '@xyo-network/payload-model'

import { BoundWitnessDivinerSchema } from './Schema'

export type BoundWitnessDivinerConfigSchema = `${BoundWitnessDivinerSchema}.config`
export const BoundWitnessDivinerConfigSchema: BoundWitnessDivinerConfigSchema = `${BoundWitnessDivinerSchema}.config`

export type BoundWitnessDivinerConfig<T extends Payload = Payload> = DivinerConfig<
  T & {
    schema: BoundWitnessDivinerConfigSchema
  }
>
