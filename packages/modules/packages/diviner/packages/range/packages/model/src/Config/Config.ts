import { DivinerConfig } from '@xyo-network/diviner-model'
import { isPayloadOfSchemaType } from '@xyo-network/payload-model'

export const RangeDivinerConfigSchema = 'network.xyo.diviner.range.config' as const
export type RangeDivinerConfigSchema = typeof RangeDivinerConfigSchema

import { RangePayload } from '../Payload/index.ts'

export type RangeDivinerConfig = DivinerConfig<
  {
    ranges?: RangePayload[]
  },
  RangeDivinerConfigSchema
>

export const isRangeDivinerConfig = isPayloadOfSchemaType<RangeDivinerConfig>(RangeDivinerConfigSchema)
