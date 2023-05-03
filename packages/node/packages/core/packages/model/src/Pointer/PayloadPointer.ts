import { Payload } from '@xyo-network/payload-model'

import { PointerPayload } from './Pointer'

export type PayloadPointerSchema = 'network.xyo.payload.pointer'
export const PayloadPointerSchema: PayloadPointerSchema = 'network.xyo.payload.pointer'

export type PayloadPointerPayload = PointerPayload & {
  schema: PayloadPointerSchema
}

export const isPayloadPointer = (x?: Payload | null): x is PayloadPointerPayload => x?.schema === PayloadPointerSchema
