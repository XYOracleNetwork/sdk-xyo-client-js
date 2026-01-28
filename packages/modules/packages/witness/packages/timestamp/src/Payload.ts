import type { Payload } from '@xyo-network/payload-model'
import { asSchema, isPayloadOfSchemaType } from '@xyo-network/payload-model'

export const TimestampSchema = asSchema('network.xyo.timestamp', true)
export type TimestampSchema = typeof TimestampSchema

export type TimeStamp = Payload<
  {
    timestamp: number
  },
  TimestampSchema
>

export const isTimestamp = isPayloadOfSchemaType<TimeStamp>(TimestampSchema)
