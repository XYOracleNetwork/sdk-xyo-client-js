import type { EmptyObject } from '@xylabs/sdk-js'
import type { DivinerConfig } from '@xyo-network/diviner-model'

export const DistinctDivinerConfigSchema = 'network.xyo.diviner.distinct.config' as const
export type DistinctDivinerConfigSchema = typeof DistinctDivinerConfigSchema

export type DistinctDivinerConfig = DivinerConfig<EmptyObject, DistinctDivinerConfigSchema>
