import type { DivinerConfig } from '@xyo-network/diviner-model'
import { asSchema, isPayloadOfSchemaType } from '@xyo-network/payload-model'

export const RangeDivinerConfigSchema = asSchema('network.xyo.diviner.range.config', true)
export type RangeDivinerConfigSchema = typeof RangeDivinerConfigSchema

import type { RangePayload } from '../Payload/index.ts'

export type RangeDivinerConfig = DivinerConfig<
  {
    ranges?: RangePayload[]
  },
  RangeDivinerConfigSchema
>

export const isRangeDivinerConfig = isPayloadOfSchemaType<RangeDivinerConfig>(RangeDivinerConfigSchema)
