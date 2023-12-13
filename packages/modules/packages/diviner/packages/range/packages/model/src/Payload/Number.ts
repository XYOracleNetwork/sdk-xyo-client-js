import { Payload } from '@xyo-network/payload-model'

export const NumberSchema = 'network.xyo.number'
export type NumberSchema = typeof NumberSchema

export type NumberPayload = Payload<{ value: number }, NumberSchema>
