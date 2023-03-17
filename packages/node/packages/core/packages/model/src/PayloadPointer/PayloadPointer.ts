import { Payload } from '@xyo-network/payload-model'

import { PayloadRule } from './PayloadRules'

export const payloadPointerSchema = 'network.xyo.payload.pointer'
export type PayloadPointerSchema = typeof payloadPointerSchema

export interface PayloadPointer {
  reference: PayloadRule[][]
}

export type PayloadPointerBody = PayloadPointer & Payload
export type PayloadPointerPayload = Payload<PayloadPointerBody>
