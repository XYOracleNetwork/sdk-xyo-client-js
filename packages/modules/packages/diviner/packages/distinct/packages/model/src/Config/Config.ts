import type { EmptyObject } from '@xylabs/sdk-js'
import type { DivinerConfig } from '@xyo-network/diviner-model'
import { asSchema } from '@xyo-network/payload-model'

export const DistinctDivinerConfigSchema = asSchema('network.xyo.diviner.distinct.config', true)
export type DistinctDivinerConfigSchema = typeof DistinctDivinerConfigSchema

export type DistinctDivinerConfig = DivinerConfig<EmptyObject, DistinctDivinerConfigSchema>
