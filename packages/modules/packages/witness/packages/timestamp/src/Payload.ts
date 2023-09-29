import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

export const TimestampSchema = 'network.xyo.timestamp'
export type TimestampSchema = typeof TimestampSchema

export type TimeStamp = Payload<
  {
    timestamp: number
  },
  TimestampSchema
>

export const isTimestamp = isPayloadOfSchemaType<TimeStamp>(TimestampSchema)
