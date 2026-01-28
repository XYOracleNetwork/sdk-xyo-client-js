import type { Hex } from '@xylabs/sdk-js'
import { asSchema, type Payload } from '@xyo-network/payload-model'

export const BigIntSchema = asSchema('network.xyo.bigint', true)
export type BigIntSchema = typeof BigIntSchema

export type BigIntPayload = Payload<{ value: Hex }, BigIntSchema>
