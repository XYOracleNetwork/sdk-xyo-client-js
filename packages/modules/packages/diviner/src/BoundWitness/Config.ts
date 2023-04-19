import { DivinerConfig } from '@xyo-network/diviner-model'
import { Payload } from '@xyo-network/payload-model'

export type BoundWitnessDivinerConfigSchema = 'network.xyo.diviner.boundwitness.config'
export const BoundWitnessDivinerConfigSchema: BoundWitnessDivinerConfigSchema = 'network.xyo.diviner.boundwitness.config'

export type BoundWitnessDivinerConfig<T extends Payload = Payload> = DivinerConfig<
  T & {
    archivist?: string
    schema: BoundWitnessDivinerConfigSchema
  }
>
