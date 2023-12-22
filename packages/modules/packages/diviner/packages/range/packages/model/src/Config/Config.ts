import { DivinerConfig } from '@xyo-network/diviner-model'
import { isPayloadOfSchemaType } from '@xyo-network/payload-model'

export const RangeDivinerConfigSchema = 'network.xyo.diviner.range.config'
export type RangeDivinerConfigSchema = typeof RangeDivinerConfigSchema

import { Hex } from '@xylabs/hex'

import { RangePayload } from '../Payload'

export type RangeDivinerConfigBase<T> = DivinerConfig<
  {
    ranges?: RangePayload[]
  },
  RangeDivinerConfigSchema
>

export type RangeDivinerConfig = RangeDivinerConfigBase<number> | RangeDivinerConfigBase<Hex>

export const isRangeDivinerConfig = isPayloadOfSchemaType<RangeDivinerConfig>(RangeDivinerConfigSchema)
