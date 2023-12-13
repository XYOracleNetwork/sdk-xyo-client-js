import { isPayloadOfSchemaType, Query } from '@xyo-network/payload-model'

export const RangeDivinerQuerySchema = 'network.xyo.range.query'
export type RangeDivinerQuerySchema = typeof RangeDivinerQuerySchema

export type RangeDivinerQuery = Query<{
  count: number
  schema: RangeDivinerQuerySchema
  start: number
}>
export const isRangeDivinerQuery = isPayloadOfSchemaType<RangeDivinerQuery>(RangeDivinerQuerySchema)
