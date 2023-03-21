import { Payload } from '@xyo-network/payload-model'

import { PayloadRule } from './PayloadRules'

export type PayloadPointerSchema = 'network.xyo.payload.pointer'
export const PayloadPointerSchema: PayloadPointerSchema = 'network.xyo.payload.pointer'
export interface PayloadPointer {
  reference: PayloadRule[][]
}

export type PayloadPointerBody = PayloadPointer & Payload
export type PayloadPointerPayload = Payload<PayloadPointerBody>
