import type { Hex } from '@xylabs/hex'
import type { Payload } from '@xyo-network/payload-model'

export const BigIntSchema = 'network.xyo.bigint' as const
export type BigIntSchema = typeof BigIntSchema

export type BigIntPayload = Payload<{ value: Hex }, BigIntSchema>
