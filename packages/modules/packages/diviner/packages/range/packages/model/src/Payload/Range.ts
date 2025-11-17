import type { Hex } from '@xylabs/hex'
import { isHex } from '@xylabs/hex'
import type { Payload } from '@xyo-network/payload-model'
import { isPayloadOfSchemaType } from '@xyo-network/payload-model'

/* We decorate these names with Payload since Range is a system type */

export const RangeSchema = 'network.xyo.range' as const
export type RangeSchema = typeof RangeSchema

export type RangePayloadBase<T> = Payload<
  {
    count: number
    start: T
  },
  RangeSchema
>

export type NumberRangePayload = RangePayloadBase<number>
export type BigIntRangePayload = RangePayloadBase<Hex>

export type RangePayload = NumberRangePayload | BigIntRangePayload

export const isRangePayload = isPayloadOfSchemaType<RangePayload>(RangeSchema)

export const isBigIntRangePayload = (payload?: unknown): payload is BigIntRangePayload =>
  isRangePayload(payload) && isHex(payload.start, { prefix: true })

export const isNumberRangePayload = (payload?: unknown): payload is NumberRangePayload => isRangePayload(payload) && typeof payload.start === 'number'
