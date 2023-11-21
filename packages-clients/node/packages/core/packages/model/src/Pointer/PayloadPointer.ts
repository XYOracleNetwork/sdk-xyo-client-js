import { Payload, PayloadSchema } from '@xyo-network/payload-model'

import { PointerPayload } from './Pointer'

export type PayloadPointerSchema = `${PayloadSchema}.pointer`
export const PayloadPointerSchema: PayloadPointerSchema = `${PayloadSchema}.pointer`

export type PayloadPointerPayload = PointerPayload & {
  schema: PayloadPointerSchema
}

export const isPayloadPointer = (x?: Payload | null): x is PayloadPointerPayload => x?.schema === PayloadPointerSchema
