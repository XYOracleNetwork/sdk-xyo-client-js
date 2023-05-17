import { DivinerConfig } from '@xyo-network/diviner-model'
import { ModuleFilter } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { BoundWitnessStatsDivinerSchema } from './Schema'

export type BoundWitnessStatsDivinerConfigSchema = `${BoundWitnessStatsDivinerSchema}.config`
export const BoundWitnessStatsDivinerConfigSchema: BoundWitnessStatsDivinerConfigSchema = `${BoundWitnessStatsDivinerSchema}.config`

export type BoundWitnessStatsDivinerConfig<T extends Payload = Payload> = DivinerConfig<
  T & {
    archivist?: ModuleFilter
    schema: BoundWitnessStatsDivinerConfigSchema
  }
>
