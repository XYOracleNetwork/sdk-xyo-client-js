import { asSchema, type Payload } from '@xyo-network/payload-model'

export const NumberSchema = asSchema('network.xyo.number', true)
export type NumberSchema = typeof NumberSchema

export type NumberPayload = Payload<{ value: number }, NumberSchema>
