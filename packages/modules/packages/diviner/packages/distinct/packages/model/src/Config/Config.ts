import { DivinerConfig } from '@xyo-network/diviner-model'
import { EmptyObject } from '@xyo-network/object'

export const DistinctDivinerConfigSchema = 'network.xyo.diviner.distinct.config'
export type DistinctDivinerConfigSchema = typeof DistinctDivinerConfigSchema

export type DistinctDivinerConfig = DivinerConfig<EmptyObject, DistinctDivinerConfigSchema>
