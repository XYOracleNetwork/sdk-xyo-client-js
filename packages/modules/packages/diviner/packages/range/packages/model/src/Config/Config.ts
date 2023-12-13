import { DivinerConfig } from '@xyo-network/diviner-model'

export const RangeDivinerConfigSchema = 'network.xyo.diviner.range.config'
export type RangeDivinerConfigSchema = typeof RangeDivinerConfigSchema

export type RangeDivinerConfig = DivinerConfig<{ schema: RangeDivinerConfigSchema }>
