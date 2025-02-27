import type { Payload } from '@xyo-network/payload-model'
import { isPayloadOfSchemaType } from '@xyo-network/payload-model'

export const TimestampSchema = 'network.xyo.timestamp' as const
export type TimestampSchema = typeof TimestampSchema

export type TimeStamp = Payload<
  {
    timestamp: number
  },
  TimestampSchema
>

export const isTimestamp = isPayloadOfSchemaType<TimeStamp>(TimestampSchema)
