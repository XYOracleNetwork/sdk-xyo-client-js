import { Hex } from '@xylabs/hex'
import { Payload } from '@xyo-network/payload-model'

export const BigIntSchema = 'network.xyo.bigint'
export type BigIntSchema = typeof BigIntSchema

export type BigIntPayload = Payload<{ value: Hex }, BigIntSchema>
