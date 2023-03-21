import { Payload } from '@xyo-network/payload-model'

import { PayloadRule } from './PayloadRules'

export type PayloadPointerSchema = 'network.xyo.payload.pointer'
export const PayloadPointerSchema: PayloadPointerSchema = 'network.xyo.payload.pointer'

export type PayloadPointerPayload = Payload<{
  reference: PayloadRule[][]
  schema: PayloadPointerSchema
}>

export const isPayloadPointer = (x?: Payload | null): x is PayloadPointerPayload => x?.schema === PayloadPointerSchema
